"use client"

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { CornerDownRight, Plus, Send, Sparkles } from "lucide-react"
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
}

export interface ChatSource {
  /** Shown on the bar and on each question: "Clean-burn soy". Undefined = the page itself. */
  about?: string
  /** The object on screen the answers belong under (a row's id); none = the end of the page. */
  anchor?: string
  chips: Chip[]
}

interface Turn {
  id: number
  /** What was asked, in the asker's words. */
  q: string
  /** The chip it landed on (same as q when the chip was tapped). */
  chip: string
  followUps?: Chip[]
  about?: string
  anchor?: string
  render: () => React.ReactNode
}

interface ChatValue {
  source: ChatSource
  setSource: (s: ChatSource) => void
  turns: Turn[]
  /** Ask; the answer goes under `anchor` (defaults to what's on screen). */
  ask: (chip: Chip, anchor?: string, said?: string) => void
  clear: () => void
}

const Ctx = createContext<ChatValue | null>(null)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [source, setSource] = useState<ChatSource>({ chips: [] })
  const [turns, setTurns] = useState<Turn[]>([])
  const next = useRef(1)
  const ask = useCallback(
    (chip: Chip, anchor?: string, said?: string) =>
      setTurns((t) => [...t, { id: next.current++, q: said ?? chip.q, chip: chip.q, followUps: chip.followUps, about: source.about, anchor: anchor ?? source.anchor, render: chip.render }]),
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
  useEffect(() => {
    if (lastId === undefined) return
    setThinking(lastId)
    const t = window.setTimeout(() => setThinking(null), 650)
    // Land on the new question. Smooth where the browser supports it; jump if it didn't move (some ignore smooth scroll).
    const el = lastRef.current
    let fallback: number | undefined
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 24
      window.scrollTo({ top, behavior: "smooth" })
      fallback = window.setTimeout(() => {
        if (Math.abs(window.scrollY - top) > 8) window.scrollTo({ top })
      }, 500)
    }
    return () => {
      window.clearTimeout(t)
      window.clearTimeout(fallback)
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
          <div className="flex items-center justify-end gap-3">
            {t.about && <span className="text-xs text-slate-500">about {t.about}</span>}
            <div className="max-w-[640px] rounded-2xl rounded-br-md bg-brand-500 px-4 py-2.5 text-[15px] text-white">{t.q}</div>
          </div>
          <div className="flex gap-3">
            <span className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-50">
              <Sparkles className="size-3.5 text-brand-600" />
            </span>
            <div className="min-w-0 flex-1">
              {thinking === t.id ? (
                <div className="flex gap-1.5 py-3" aria-label="Ally is working on it">
                  {[0, 1, 2].map((d) => (
                    <motion.span
                      key={d}
                      className="size-1.5 rounded-full bg-brand-400"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.15 }}
                    />
                  ))}
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                  {t.render()}
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
  const run = (c: Chip, said?: string) => (c.task ? router.push(c.task) : ask(c, undefined, said))
  const [text, setText] = useState("")
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const dockRef = useRef<HTMLDivElement>(null)
  const askedHere = new Set(turns.filter((t) => t.about === source.about && t.anchor === source.anchor).map((t) => t.chip))
  const chips = source.chips.filter((c) => !askedHere.has(c.q))

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
    // The dock, like Claude's: content fades out above it, the box is solid, and nothing shows beside or below it.
    // It spans the page card's width, so on grey-backed pages it reads as the card's own bottom.
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
            // The latest answer's follow-ups first, then the starters.
            const pool = [...(turns[turns.length - 1]?.followUps ?? []), ...source.chips]
            const chip = pool.find((c) => c.match?.test(text)) ?? closest(pool, text)
            if (chip) {
              run(chip, text.trim())
              setOpen(false)
            } else setOpen(true)
            setText("")
          }}
          className="flex items-center gap-2 py-1.5 pr-1.5 pl-4"
        >
          <Sparkles className="size-4 shrink-0 text-brand-600" />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setOpen(true)}
            onClick={() => setOpen(true)}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400"
          />
          <button type="submit" aria-label="Ask Ally" className="flex size-8 items-center justify-center rounded-full bg-brand-500 text-white transition-colors hover:bg-brand-600">
            <Send className="size-4" />
          </button>
        </form>
      </div>
      <p className="mt-2 text-center text-xs text-slate-400">Ally is AI and can make mistakes. Please double-check responses.</p>
      </div>
    </div>
  )
}
