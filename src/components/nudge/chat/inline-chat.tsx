"use client"

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { QUOTE_EVENT } from "./select-to-ask"
import { UploadDialog } from "./upload-dialog"
import { CornerDownRight, Mail, Paperclip, Plus, Send, Sparkles, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { FadeAbove, MoreBelow } from "./more-below"

/**
 * Inline chat: one Ask Ally bar at the bottom, chips that follow what's on
 * screen, and answers that grow into the page below its content, like a
 * document. The screen on show registers what it's about and its chips
 * (useChatSource); the thread renders where the page places <ChatThread />.
 */

export interface Chip {
  q: string
  render: () => React.ReactNode
  /** A task, not a question about this screen: it starts its own conversation at this address. */
  task?: string
  /** Typed text that means this chip, in any wording; checked before the word-overlap guess. */
  match?: RegExp
  /** Follow-ups offered at the end of this chip's answer (the bar's chips only get you started). */
  followUps?: Chip[]
  /** A starter that fills the bar instead of asking: pasted text, and a file attached, ready to send. */
  prefill?: { text: string; attach?: Attachment }
  /** Not offered as a starter; reached by typing, or by sending files (with `takesFiles`). */
  hidden?: boolean
  /** Sending attachments with no other match lands here. */
  takesFiles?: boolean
  /** Its follow-ups only apply once files came with it (a brief has to arrive before it can be acted on). */
  needsFiles?: boolean
  /** How long Ally works before answering, and what it says it's doing (with files attached, `filesLabel`). */
  think?: { ms: number; label?: string; filesLabel?: string }
}

export interface Attachment {
  name: string
  size: string
  src: string
  kind?: "image" | "email"
}

export interface ChatSource {
  /** Shown on the bar and on each question: "Clean-burn soy". Undefined = the page itself. */
  about?: string
  /** The object on screen the answers belong under (a row's id); none = the end of the page. */
  anchor?: string
  chips: Chip[]
  /** Files the 📎 can attach on this screen (the demo's stand-in for a file picker). */
  files?: Attachment[]
}

interface Turn {
  id: number
  /** What was asked, in the asker's words. */
  q: string
  /** The chip it landed on (same as q when the chip was tapped). */
  chip: string
  followUps?: Chip[]
  attach?: Attachment[]
  /** Ally's working time and label for this turn. */
  think?: { ms: number; label?: string }
  about?: string
  anchor?: string
  render: () => React.ReactNode
}

interface ChatValue {
  source: ChatSource
  setSource: (s: ChatSource) => void
  turns: Turn[]
  /** Ask; the answer goes under `anchor` (defaults to what's on screen). */
  ask: (chip: Chip, anchor?: string, said?: string, attach?: Attachment[]) => void
  clear: () => void
}

/** Typed text, offered to whatever on screen can take it before Ally answers; a listener calls preventDefault to claim it. */
export const TYPED_EVENT = "ally-typed"

const Ctx = createContext<ChatValue | null>(null)

/** The turn an answer is rendering for, so it can see what was asked with it (its files, its wording). */
const TurnCtx = createContext<Turn | null>(null)
export function useTurn() {
  return useContext(TurnCtx)
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [source, setSource] = useState<ChatSource>({ chips: [] })
  const [turns, setTurns] = useState<Turn[]>([])
  const next = useRef(1)
  const ask = useCallback(
    (chip: Chip, anchor?: string, said?: string, attach?: Attachment[]) =>
      setTurns((t) => [...t, { id: next.current++, q: said ?? chip.q, chip: chip.q, followUps: chip.needsFiles && !attach?.length ? undefined : chip.followUps, attach, think: chip.think && { ms: chip.think.ms, label: attach?.length ? (chip.think.filesLabel ?? chip.think.label) : chip.think.label }, about: source.about, anchor: anchor ?? source.anchor, render: chip.render }]),
    [source.about, source.anchor],
  )
  return <Ctx.Provider value={{ source, setSource, turns, ask, clear: () => setTurns([]) }}>{children}</Ctx.Provider>
}

export function useChat() {
  const c = useContext(Ctx)
  if (!c) throw new Error("useChat must be used inside ChatProvider")
  return c
}

/** A screen says what it's about and which questions fit it; re-run whenever that changes (e.g. a new bubble). */
export function useChatSource(source: ChatSource, key: string) {
  const { setSource } = useChat()
  useEffect(() => {
    setSource(source)
    // The key carries what changed; the source object is rebuilt every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, setSource])
}

/** Typed questions land on the chip sharing the most words with them. */
function closest(chips: Chip[], text: string): Chip | undefined {
  const words = text.toLowerCase().split(/\W+/).filter((w) => w.length > 3)
  let best: Chip | undefined
  let score = 0
  for (const c of chips) {
    const n = words.filter((w) => c.q.toLowerCase().includes(w)).length
    if (n > score) [best, score] = [c, n]
  }
  return best
}

/**
 * A conversation, rendered where the page puts it. With `anchor`, only the
 * answers about that object (placed under it); without, the page-level ones
 * (placed at the end). Scrolls each new answer into view.
 */
export function ChatThread({ className, anchor }: { className?: string; anchor?: string }) {
  const { turns: all, ask } = useChat()
  const asked = new Set(all.map((t) => t.chip))
  const turns = all.filter((t) => t.anchor === anchor)
  const lastRef = useRef<HTMLDivElement>(null)
  const [thinking, setThinking] = useState<number | null>(null)

  // Keyed to the newest question's id, not the turns array: the filtered array is new every
  // render, and keying on it restarted the "working" timer forever (answers never appeared).
  const lastId = turns[turns.length - 1]?.id
  // A quick question still gets a beat: about a second, never instant.
  const lastThink = turns[turns.length - 1]?.think?.ms ?? 1100
  useEffect(() => {
    if (lastId === undefined) return
    setThinking(lastId)
    const t = window.setTimeout(() => setThinking(null), lastThink)
    return () => window.clearTimeout(t)
  }, [lastId, lastThink])

  // Like ChatGPT: the question lands just above the bar, then the page follows the answer up as it
  // arrives, until the question reaches the top, and stops there. A longer answer is yours to scroll.
  // Stops early if you scroll yourself. Checked on a short timer (size events don't fire everywhere).
  useEffect(() => {
    if (lastId === undefined) return
    const el = lastRef.current
    if (!el) return
    let following = true
    let asked: number | undefined
    const stop = () => (following = false)
    const keys = (e: KeyboardEvent) => ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(e.key) && e.target === document.body && stop()
    window.addEventListener("wheel", stop, { passive: true })
    window.addEventListener("touchmove", stop, { passive: true })
    window.addEventListener("keydown", keys)
    const step = () => {
      if (!following) return
      const body = el.querySelector<HTMLElement>("[data-turn-body]")
      // Below anything pinned to the top (the note to Dana, a filter bar), so the question is never under it.
      const pinned = [...document.querySelectorAll<HTMLElement>("[data-sticky-top]")].reduce((m, e) => Math.max(m, e.offsetHeight), 0)
      const top = el.getBoundingClientRect().top + window.scrollY - 24 - pinned
      const dock = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--askbar-h")) || 120
      const bottom = (body ?? el).getBoundingClientRect().bottom + window.scrollY
      const target = Math.min(top, bottom - (window.innerHeight - dock - 24))
      if (target > window.scrollY + 4) {
        // Smooth where the browser animates it; a jump where it didn't move since the last try.
        const stuck = asked !== undefined && Math.abs(window.scrollY - asked) < 2
        window.scrollTo({ top: target, behavior: stuck ? "auto" : "smooth" })
        asked = window.scrollY
      }
      if (target >= top - 2) stop()
    }
    step()
    const tick = window.setInterval(step, 250)
    const off = window.setTimeout(stop, 30000)
    return () => {
      window.clearInterval(tick)
      window.clearTimeout(off)
      window.removeEventListener("wheel", stop)
      window.removeEventListener("touchmove", stop)
      window.removeEventListener("keydown", keys)
    }
  }, [lastId])

  if (!turns.length) return null
  return (
    <section
      className={cn(anchor ? "flex flex-col gap-6 pt-2" : "flex flex-col gap-8 border-t border-slate-200 px-12 pt-8", className)}
      style={anchor ? undefined : { paddingBottom: 32 }}
      aria-label={anchor ? `Conversation about ${anchor}` : "Conversation with Ally"}
    >
      {turns.map((t, i) => (
        <div
          key={t.id}
          ref={i === turns.length - 1 ? lastRef : undefined}
          className="flex flex-col gap-4 scroll-mt-6"
          // Like Claude: the newest question gets a screen of its own, so it can sit at the top with its answer below, nothing older in view.
          style={i === turns.length - 1 && !anchor ? { minHeight: "calc(100vh - var(--askbar-h, 0px) - 56px)" } : undefined}
        >
          <div className="flex flex-col items-end gap-2">
            {!!t.attach?.length && (
              <div className="flex flex-wrap justify-end gap-2">
                {t.attach.map((f) => (
                  <AttachmentCard key={f.name} file={f} />
                ))}
              </div>
            )}
            <div className="flex items-center justify-end gap-3">
              {t.about && <span className="text-xs text-slate-500">about {t.about}</span>}
              <div className="max-w-[640px] rounded-2xl rounded-br-md bg-brand-500 px-4 py-2.5 text-[15px] whitespace-pre-line text-white">{t.q}</div>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="relative mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-50">
              {thinking === t.id && <span className="absolute -inset-1 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" style={{ animationDuration: "1.1s" }} aria-hidden />}
              <Sparkles className="size-3.5 text-brand-600" />
            </span>
            <div data-turn-body className="min-w-0 flex-1">
              {thinking === t.id ? (
                <div className="flex items-center gap-3 py-2" aria-label="Ally is working on it">
                  <span className="flex gap-1.5">
                    {[0, 1, 2].map((d) => (
                      <motion.span
                        key={d}
                        className="size-1.5 rounded-full bg-brand-400"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.15 }}
                      />
                    ))}
                  </span>
                  <span className="text-[14px] text-slate-500">{t.think?.label ?? "Thinking"}</span>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="ally-reveal">
                  <TurnCtx.Provider value={t}>{t.render()}</TurnCtx.Provider>
                  {/* Follow-ups live in the conversation, under the answer they follow from. */}
                  {i === turns.length - 1 && !!t.followUps?.filter((f) => !asked.has(f.q)).length && (
                    <div className="mt-4 flex flex-col items-start gap-2">
                      {t.followUps
                        .filter((f) => !asked.has(f.q))
                        .map((f) => (
                          <button key={f.q} type="button" onClick={() => ask(f, anchor)} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-left text-sm text-slate-700 transition-colors hover:border-brand-300 hover:text-brand-700">
                            <CornerDownRight className="size-3.5 shrink-0 text-slate-400" />
                            {f.q}
                          </button>
                        ))}
                    </div>
                  )}
                  {i === turns.length - 1 && !anchor && <div data-chat-end aria-hidden />}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      ))}
    </section>
  )
}

/** The bar: chips for what's on screen (the ones not yet asked), then the input. */
export function AskBar({ placeholder = "What can I take off your plate?" }: { placeholder?: string }) {
  const { source, turns, ask, clear } = useChat()
  const router = useRouter()
  // Questions about this screen answer here; tasks (make a deck, plan an event) open their own conversation.
  const [attach, setAttach] = useState<Attachment[]>([])
  const [uploading, setUploading] = useState(false)
  const run = (c: Chip, said?: string) => {
    if (c.task) return router.push(c.task)
    ask(c, undefined, said, attach.length ? attach : undefined)
    setAttach([])
  }
  const [text, setText] = useState("")
  const [open, setOpen] = useState(false)
  // A selection quoted from the page ("Ask Ally" on highlighted text): it scopes the next question.
  const [quote, setQuote] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const onQuote = (e: Event) => {
      setQuote((e as CustomEvent<string>).detail)
      inputRef.current?.focus()
    }
    window.addEventListener(QUOTE_EVENT, onQuote)
    return () => window.removeEventListener(QUOTE_EVENT, onQuote)
  }, [])
  const rootRef = useRef<HTMLDivElement>(null)
  const dockRef = useRef<HTMLDivElement>(null)
  const askedHere = new Set(turns.filter((t) => t.about === source.about && t.anchor === source.anchor).map((t) => t.chip))
  const chips = source.chips.filter((c) => !askedHere.has(c.q) && !c.hidden)

  // The page reserves the bar's height under its last answer, so the bar and its
  // suggestions never sit on top of what Ally just said.
  useEffect(() => {
    const el = dockRef.current
    if (!el) return
    const root = document.documentElement
    const ro = new ResizeObserver(() => {
      root.style.setProperty("--askbar-h", `${el.offsetHeight}px`)
      // Every page ends above the dock, so nothing is ever stuck behind it.
      document.body.style.paddingBottom = `${el.offsetHeight}px`
    })
    ro.observe(el)
    return () => {
      ro.disconnect()
      root.style.removeProperty("--askbar-h")
      document.body.style.paddingBottom = ""
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [open])

  // Follow-ups show while you're using the bar and collapse when you click anywhere else.
  const showChips = open && chips.length > 0

  const tray = open && (showChips || turns.length > 0)
  return (
    <>
    {uploading && source.files && (
      <UploadDialog
        files={source.files}
        onClose={() => setUploading(false)}
        onAttach={(files) => {
          setAttach(files)
          setUploading(false)
          setOpen(true)
        }}
      />
    )}
    {/* The dock, like Claude's: content fades out above it, the box is solid, and nothing shows beside or below it.
        It spans the page card's width, so on grey-backed pages it reads as the card's own bottom. */}
    <div ref={dockRef} className="pointer-events-none fixed inset-x-0 bottom-0 z-40 xl:left-[var(--sidebar-w,0px)]">
      <div className="relative mx-auto max-w-[1280px]">
        <FadeAbove />
        <div className="absolute inset-x-0 -top-8 flex justify-center">
          <MoreBelow />
        </div>
      </div>
      <div className="pointer-events-auto mx-auto flex max-w-[1280px] flex-col items-center bg-white px-4 pb-2.5">
      {/* One solid panel: suggestions sit in a tray above the input, never floating over the page. */}
      <div
        ref={rootRef}
        className={cn(
          "pointer-events-auto flex w-full max-w-[760px] flex-col border border-slate-300 bg-white shadow-[0_8px_24px_-6px_rgba(15,23,42,0.18),0_2px_6px_rgba(15,23,42,0.06)] transition-colors focus-within:border-brand-400",
          tray ? "rounded-[22px]" : "rounded-full",
        )}
      >
        {tray && (
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-3 pt-3 pb-2.5">
            {showChips &&
              chips.map((c) => (
                <button
                  key={c.q}
                  type="button"
                  onClick={() => {
                    // A paste-and-attach starter fills the bar for you to send; the rest ask now.
                    if (c.prefill) {
                      setText(c.prefill.text)
                      if (c.prefill.attach) setAttach([c.prefill.attach])
                      return
                    }
                    run(c)
                    // Get out of the answer's way; the follow-ups come back when you click into the bar.
                    setOpen(false)
                  }}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm transition-colors",
                    c.task ? "inline-flex items-center gap-1.5 border-brand-200 bg-brand-25 text-brand-700 hover:border-brand-400" : "border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:text-brand-700",
                  )}
                >
                  {c.task && (
                    <>
                      <Plus className="size-3.5" />
                      <span className="font-semibold">New:</span>
                    </>
                  )}
                  {c.q}
                </button>
              ))}
            {turns.length > 0 && (
              <button type="button" onClick={clear} className="ml-auto shrink-0 rounded-full px-2.5 py-1.5 text-xs text-slate-500 hover:bg-slate-50 hover:text-slate-800">
                Clear conversation
              </button>
            )}
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            // Something on screen may take typed changes itself (an alert sentence being edited).
            if (!window.dispatchEvent(new CustomEvent(TYPED_EVENT, { detail: text, cancelable: true }))) {
              setText("")
              return
            }
            // The latest answer's follow-ups first, then the starters.
            const pool = [...(turns[turns.length - 1]?.followUps ?? []), ...source.chips]
            // Files sent on their own (or with any words) go to whatever takes files.
            const filesChip = attach.length ? pool.find((c) => c.takesFiles) : undefined
            // A quote counts toward what's being asked about.
            const about = quote ? `${quote} ${text}` : text
            const chip = filesChip ?? pool.find((c) => c.match?.test(about)) ?? closest(pool, about)
            if (chip) {
              const said = text.trim() || (attach.length ? `Here ${attach.length === 1 ? "is a file" : `are ${attach.length} files`}.` : quote ? "Tell me more" : chip.q)
              run(chip, quote ? `“${quote}” ${said}` : said)
              setOpen(false)
              setQuote(null)
            } else setOpen(true)
            setText("")
          }}
          className="flex flex-wrap items-center gap-2 py-1.5 pr-1.5 pl-4"
        >
          {quote && (
            <span className="flex w-full items-center gap-2 pt-1.5 pb-1">
              <span className="flex min-w-0 items-center gap-2 rounded-lg border-l-2 border-brand-400 bg-slate-50 py-1 pr-1 pl-2.5 text-[13px] text-slate-700">
                <span className="truncate">“{quote}”</span>
                <button type="button" onClick={() => setQuote(null)} aria-label="Remove quote" className="flex size-5 shrink-0 items-center justify-center rounded text-slate-400 hover:bg-slate-200 hover:text-slate-700">
                  ×
                </button>
              </span>
            </span>
          )}
          {!!attach.length && (
            <span className="flex w-full flex-wrap items-center gap-2 pt-1.5 pb-1">
              {attach.map((f) => (
                <AttachmentCard key={f.name} file={f} onRemove={() => setAttach((a) => a.filter((x) => x.name !== f.name))} />
              ))}
            </span>
          )}
          <Sparkles className="size-4 shrink-0 text-brand-600" />
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setOpen(true)}
            onClick={() => setOpen(true)}
            placeholder={quote ? "Ask about this" : placeholder}
            className="flex-1 bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400"
          />
          {!!source.files?.length && (
            <button type="button" onClick={() => setUploading(true)} aria-label="Attach files" title="Attach files" className="flex size-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900">
              <Paperclip className="size-4" />
            </button>
          )}
          <button type="submit" aria-label="Ask Ally" className="flex size-8 items-center justify-center rounded-full bg-brand-500 text-white transition-colors hover:bg-brand-600">
            <Send className="size-4" />
          </button>
        </form>
      </div>
      <p className="mt-2 text-center text-xs text-slate-400">Ally is AI and can make mistakes. Please double-check responses.</p>
      </div>
    </div>
    </>
  )
}

/** A page's starter chips, registered from inside its ChatProvider. */
export function StarterChips({ chips, id }: { chips: Chip[]; id: string }) {
  useChatSource({ chips }, id)
  return null
}

/** The look of a short scripted answer: bullets in a card. */
export function AnswerCard({ children }: { children: React.ReactNode }) {
  return <div className="max-w-[860px] rounded-2xl bg-white px-5 py-4 text-[15px] leading-relaxed text-slate-700 ring-1 ring-slate-200">{children}</div>
}

/** A file in a message or waiting in the bar: thumbnail, name, size. */
function AttachmentCard({ file, onRemove }: { file: Attachment; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white py-1.5 pr-2 pl-1.5 text-[13px]">
      {file.kind === "email" ? (
        <span className="flex size-9 items-center justify-center rounded-md bg-slate-100 text-slate-500">
          <Mail className="size-4" />
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- a local demo asset
        <img src={file.src} alt="" className="size-9 rounded-md object-cover" />
      )}
      <span className="text-left">
        <b className="block font-semibold text-slate-950">{file.name}</b>
        <span className="text-slate-500">{file.size}</span>
      </span>
      {onRemove && (
        <button type="button" onClick={onRemove} aria-label="Remove the attachment" className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
          <X className="size-3.5" />
        </button>
      )}
    </span>
  )
}
