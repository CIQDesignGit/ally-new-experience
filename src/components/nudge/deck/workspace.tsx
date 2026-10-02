"use client"

import { AppDrawer } from "@/components/nudge/app-drawer"
import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Check, Download, GripVertical, Lock, Maximize2, Minimize2, Paperclip, Send, Sparkles, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { FadeAbove, MoreBelow } from "@/components/nudge/chat/more-below"
import { PageShell } from "@/components/layout/page-shell"
import { TopStrip } from "@/components/nudge/top-strip"
import { useNudge } from "@/components/nudge/nudge-context"
import { AS_OF } from "@/components/nudge/data"
import { PRIMARY, SECONDARY } from "@/components/nudge/mike/buttons"
import { Slide } from "@/components/nudge/retro/slide"
import { BRAND_FILE, LESSONS, THEMES } from "@/components/nudge/retro/prime-day"
import type { RetroSlide } from "@/components/nudge/retro/prime-day"
import { PRIME_DAY_DECK, deckSlides } from "@/components/nudge/deck/spec"
import type { DeckSpec } from "@/components/nudge/deck/spec"
import type { RetroState } from "@/components/nudge/nudge-context"
import { StorylineStep } from "@/components/nudge/retro/storyline-step"
import { exportRetroPptx } from "@/components/nudge/retro/export-pptx"
import { lato, playfair } from "@/components/nudge/retro/fonts"

const DATE = new Date(`${AS_OF}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
const SMALL = "h-9 px-3.5 text-sm"

type Msg = { id: number; from: "you" | "ally"; text?: string; file?: boolean; lessons?: boolean; detail?: string[] }

/**
 * A deck built with Ally, the same flow for every deck (the spec is only the
 * content): questions, answers, storyline, then the storyboard and the deck.
 * The conversation narrows to the left while the object takes the wide side;
 * Expand gives the object the whole page and docks the input at the bottom.
 */
export function DeckWorkspace({ spec }: { spec: DeckSpec }) {
  const { retro: retroState, setRetro: setRetroState, decks, setDeck, knowledge, saveKnowledge } = useNudge()
  // The Prime Day retro keeps its own slot (Claire's card and the sidebar read it); every other deck lives by id.
  const isRetro = spec.id === PRIME_DAY_DECK.id
  const retro: RetroState = isRetro ? retroState : (decks[spec.id] ?? {})
  const setRetro = useCallback((patch: Partial<RetroState>) => (isRetro ? setRetroState(patch) : setDeck(spec.id, patch)), [isRetro, setRetroState, setDeck, spec.id])
  const DEFAULT_ORDER = spec.slides.map((s) => s.id)
  const router = useRouter()
  // A saved order is kept only if every id is a slide we know (questions can be dropped or added).
  const known = new Set(spec.all.map((s) => s.id))
  const order = retro.order?.length && retro.order.every((id) => known.has(id)) ? retro.order : DEFAULT_ORDER
  const alts = retro.alts ?? []
  // What just changed in the storyboard, labelled under its card.
  const [changed, setChanged] = useState<Record<string, string>>({})
  const theme = retro.theme ?? "default"
  const [view, setView] = useState<"answer" | "storyboard" | "deck">("storyboard")
  // A new request starts on the storyline: the questions first, then Ally's answers.
  const [step, setStep] = useState<"questions" | "answers">("questions")
  const [expanded, setExpanded] = useState(false)
  const [current, setCurrent] = useState(0)
  const [before, setBefore] = useState(false)
  const [share, setShare] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: 1, from: "you", text: spec.ask },
    { id: 2, from: "ally", text: `Here's the storyline. The storyboard is open on the right: ${spec.slides.length} slides, one per beat. Drag to reorder, or tell me what to change.` },
  ])
  const next = useRef(3)

  // A new request (?new=1) starts a fresh retro on the storyboard. Coming back to one
  // that has a deck (or Claire's "Open deck") reopens on the deck.
  const opened = useRef(false)
  const fresh = useRef(false)
  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    if (q.get("new") === "1" && !fresh.current) {
      fresh.current = true
      opened.current = true
      // A new task opens as a conversation: the ask and Ally's storyline, nothing else.
      window.setTimeout(() => setView("answer"), 0)
      // After the saved demo state has loaded (it loads in the provider's effect, which runs after this one).
      window.setTimeout(() => setRetro({ order: undefined, theme: undefined, locked: false, deck: false, sentToClaire: false, dashboard: false, dashboardSeen: false, saved: [], alts: [], questions: {}, answers: {}, stage: "storyline" }), 0)
      window.history.replaceState(null, "", spec.path)
      return
    }
    if (opened.current) return
    const wantsDeck = q.get("view") === "deck"
    if (!wantsDeck && !retro.deck) return
    const t = window.setTimeout(() => {
      opened.current = true
      setView("deck")
    }, 0)
    return () => window.clearTimeout(t)
  }, [retro.deck, setRetro, spec.path])

  const say = (...m: Omit<Msg, "id">[]) => setMsgs((prev) => [...prev, ...m.map((x) => ({ ...x, id: next.current++ }))])
  const slides = deckSlides(spec, order, retro)

  // The storyline: edits to the questions and answers before any slide exists.
  function addQuestion(text: string) {
    const add = spec.addable
    if (!add || !add.match.test(text)) return false
    if (!order.includes(add.slide.id)) setRetro({ order: [...order, add.slide.id] })
    // Her wording is kept; Ally's answer is the scripted slide.
    // Typed fast, shown as a question: first letter up, a question mark at the end.
    const asked = `${text.charAt(0).toUpperCase()}${text.slice(1).replace(/[?\s]+$/, "")}?`
    if (asked.toLowerCase() !== add.slide.question.toLowerCase()) setRetro({ questions: { ...(retro.questions ?? {}), [add.slide.id]: asked } })
    return true
  }
  function openStoryboard() {
    setMsgs([
      { id: 1, from: "you", text: spec.ask },
      { id: 2, from: "ally", text: `Here's the storyline. The storyboard is open on the right: ${slides.length} slides, one per beat. Drag to reorder, or tell me what to change.` },
    ])
    setView("storyboard")
    setRetro({ stage: "storyboard" })
  }

  function addSummary(text: string) {
    if (!spec.summary) return say({ from: "you", text }, { from: "ally", text: "This deck opens on its first answer; I don't have a separate summary slide for it yet." })
    if (order.includes("summary")) return say({ from: "you", text }, { from: "ally", text: "Slide 1 is already the executive summary." })
    setRetro({ order: ["summary", ...order.filter((id) => id !== "summary")] })
    setChanged((c) => ({ ...c, summary: "New" }))
    say(
      { from: "you", text },
      { from: "ally", text: "Added an executive summary as slide 1: the 4 headline numbers on the left, the 3 messages Claire needs on the right." },
    )
  }

  function dealsAsTable(text: string) {
    const id = spec.table?.id
    if (!id) return say({ from: "you", text }, { from: "ally", text: "These charts already read best as they are; tell me which slide and I'll try another form." })
    if (alts.includes(id)) return say({ from: "you", text }, { from: "ally", text: `Slide ${order.indexOf(id) + 1} is already a table.` })
    const n = order.indexOf(id) + 1
    setRetro({ alts: [...alts.filter((a) => a !== id), id] })
    setChanged((c) => ({ ...c, [id]: "Changed" }))
    say(
      { from: "you", text },
      { from: "ally", text: `Slide ${n} is now a scorecard: each deal, its lift, what it added, and whether it worked. The question is which deals worked, and a table answers that outright; the bars made you compare.` },
    )
  }

  function move(from: number, to: number) {
    if (from === to) return
    const o = [...order]
    const [x] = o.splice(from, 1)
    o.splice(to, 0, x)
    setRetro({ order: o })
  }

  function makeDeck() {
    setRetro({ locked: true, deck: true })
    setView("deck")
    setExpanded(false)
    setCurrent(0)
    say({ from: "ally", text: `Locked. ${slides.length} slides in the CommerceIQ default look. Want it in your brand template?` })
  }

  function applyBrand() {
    setRetro({ theme: "aurelle" })
    setBefore(false)
    say(
      { from: "you", text: "Apply our brand template", file: true },
      {
        from: "ally",
        text: `Applied ${THEMES.aurelle.name}.`,
        detail: [`${slides.length} slides on ${BRAND_FILE.used} of its ${BRAND_FILE.layouts} layouts`, "Playfair Display and Lato, your 4 brand colors", "Logo and footer on every slide", "Charts recolored to your palette"],
      },
    )
  }

  async function exportPptx() {
    try {
      await exportRetroPptx(slides, theme, { name: spec.name, file: spec.file })
      toast.success(`Exported ${theme === "aurelle" ? `${spec.file} (Aurelle).pptx` : `${spec.file}.pptx`} · ${slides.length} editable slides`, { position: "top-right" })
    } catch {
      toast.error("Couldn't build the PowerPoint. Try again.", { position: "top-right" })
    }
  }

  function saveLesson(id: string, scope: "account" | "me") {
    const l = LESSONS.find((x) => x.id === id)!
    const entry = { id: `retro-${id}`, text: l.text, retailer: "Amazon", brands: [] as string[], skuGroups: [] as string[], author: "Michelle Ortiz", date: DATE, source: scope === "me" ? "from the Prime Day retro · just for Michelle" : "from the Prime Day retro" }
    saveKnowledge([entry, ...knowledge.filter((k) => k.id !== entry.id)])
    setRetro({ saved: [...new Set([...(retro.saved ?? []), id])] })
  }

  // Suggestions follow the stage; typed text lands on the closest one.
  const chips: { q: string; run: () => void }[] =
    view === "answer"
      ? []
      : view === "storyboard"
      ? [
          ...(spec.reorder && order.includes(spec.reorder.id) && order.includes(spec.reorder.after)
            ? [{ q: spec.reorder.label, run: () => { const r = spec.reorder!; move(order.indexOf(r.id), order.indexOf(r.after) + 1); say({ from: "you", text: r.label }, { from: "ally", text: `Done. It's slide ${order.indexOf(r.after) + 2}.` }) } }]
            : []),
          { q: "Lock it and build the deck", run: () => { say({ from: "you", text: "Lock it and build the deck" }); makeDeck() } },
        ]
      : theme === "default"
        ? [{ q: "Apply our brand template", run: applyBrand }]
        : [
            retro.sentToClaire
              ? { q: "See it on Claire's home", run: () => router.push("/claire-waterfall") }
              : { q: "Send it to Claire", run: () => setShare(true) },
            { q: "Back to the CommerceIQ look", run: () => { setRetro({ theme: "default" }); say({ from: "you", text: "Back to the CommerceIQ look" }, { from: "ally", text: "Done. The deck is in the CommerceIQ default look again." }) } },
          ]

  function ask(text: string) {
    if (view === "answer") {
      const t = text.toLowerCase()
      if (step === "questions" && addQuestion(text)) return
      if (step === "questions" && /\b(answer|run|analy[sz]e|go)\b/.test(t)) return setStep("answers")
      if (step === "answers" && /\bstoryboard\b/.test(t)) return openStoryboard()
    }
    // Edits with no chip: typed in any wording, they land on what they mean.
    if (view === "storyboard") {
      const t = text.toLowerCase()
      if (/\b(exec|executive|summary|overview|tl;?dr)\b/.test(t)) return addSummary(text)
      if (/\b(table|scorecard|grid)\b/.test(t) || (/\bchart\b/.test(t) && /\b(convert|change|turn|swap|something else|instead)\b/.test(t))) return dealsAsTable(text)
    }
    const words = text.toLowerCase().split(/\W+/).filter((w) => w.length > 3)
    const best = chips.map((c) => ({ c, n: words.filter((w) => c.q.toLowerCase().includes(w)).length })).sort((a, b) => b.n - a.n)[0]
    if (best && best.n > 0) best.c.run()
    else say({ from: "you", text }, { from: "ally", text: "I can reorder slides, lock the story and build the deck, apply your brand template, or share it. Pick a suggestion or say which." })
  }

  const objectPane = view === "storyboard" ? (
    <Storyboard
      expanded={expanded}
      locked={!!retro.locked}
      slides={slides}
      changed={changed}
      onMove={move}
      onExpand={() => setExpanded((e) => !e)}
      onLock={() => { setRetro({ locked: !retro.locked }); toast.success(retro.locked ? "Unlocked" : "Storyline locked", { position: "top-right" }) }}
      onDeck={makeDeck}
      name={spec.name}
      forWhom={spec.forWhom}
      onDashboard={spec.dashboard ? () => { setRetro({ dashboard: true, dashboardSeen: false }); toast.success(`Published as a live dashboard · Dashboards › ${spec.name}`, { position: "top-right" }) } : undefined}
    />
  ) : (
    <Deck name={spec.name} slides={slides} current={current} setCurrent={setCurrent} theme={before ? "default" : theme} branded={theme === "aurelle"} before={before} setBefore={setBefore} onBrand={applyBrand} onExport={exportPptx} onShare={() => setShare(true)} onStoryboard={() => setView("storyboard")} />
  )

  return (
    <PageShell className={cn("bg-slate-50 xl:bg-white", playfair.variable, lato.variable)}>
      <div className="mx-auto max-w-[1440px] overflow-clip bg-white shadow-pane-lg sm:my-6 sm:rounded-2xl sm:ring-1 sm:ring-slate-900/6 xl:my-0 xl:rounded-none xl:shadow-none xl:ring-0">
        <TopStrip person="michelle" crumbs={[{ label: "Daily brief", href: "/michelle" }, { label: spec.name }]} />
        {view === "answer" ? (
          <div className="mt-4 flex min-h-[760px] justify-center border-t border-slate-200 px-10 pt-8 pb-10">
            <div className="flex w-full max-w-[860px] flex-col gap-6">
              <div className="flex justify-end">
                <div className="max-w-[560px] rounded-2xl rounded-br-md bg-brand-500 px-4 py-2.5 text-[15px] text-white">{spec.ask}</div>
              </div>
              <div className="flex gap-3">
                <AllyMark />
                <StorylineStep
                  verdict={spec.verdict}
                  sources={spec.sources}
                  forWhom={spec.forWhom.split(" ")[0]}
                  step={step}
                  slides={slides}
                  onRename={(id, t) => setRetro({ questions: { ...(retro.questions ?? {}), [id]: t } })}
                  onReword={(id, t) => setRetro({ answers: { ...(retro.answers ?? {}), [id]: t } })}
                  onRemove={(id) => setRetro({ order: order.filter((x) => x !== id) })}
                  onMove={move}
                  onAdd={addQuestion}
                  onAnswer={() => setStep("answers")}
                  onBack={() => setStep("questions")}
                  onStoryboard={openStoryboard}
                />
              </div>
              <div className="sticky bottom-0 mt-auto">
                <div className="relative">
                  <FadeAbove />
                  <div className="absolute inset-x-0 -top-8 flex justify-center">
                    <MoreBelow />
                  </div>
                </div>
                <Composer onAsk={ask} placeholder="Ask a follow-up" className="bg-white pb-3" />
              </div>
            </div>
          </div>
        ) : (
        <div className={cn("mt-4 grid min-h-[760px] border-t border-slate-200", expanded ? "grid-cols-1" : "grid-cols-[384px_minmax(0,1fr)]")}>
          {!expanded && <Conversation name={spec.name} msgs={msgs} chips={chips} onAsk={ask} retro={retro} onSave={saveLesson} />}
          <div className="relative min-w-0 bg-slate-50">
            {objectPane}
            {expanded && (
              <div className="pointer-events-none sticky bottom-0 z-20">
                <div className="relative">
                  <FadeAbove from="from-slate-50" />
                  <div className="absolute inset-x-0 -top-8 flex justify-center">
                    <MoreBelow />
                  </div>
                </div>
                <div className="pointer-events-auto flex flex-col items-center gap-2 bg-slate-50 pb-3">
                <div className="flex flex-wrap justify-center gap-2">
                  {chips.map((c) => (
                    <button key={c.q} type="button" onClick={c.run} className="rounded-full border border-slate-200 bg-white/95 px-3 py-1.5 text-sm text-slate-700 shadow-xs hover:border-brand-300 hover:text-brand-700">
                      {c.q}
                    </button>
                  ))}
                </div>
                <Composer onAsk={ask} placeholder="Ask Ally to change the storyboard" className="w-[760px] max-w-[calc(100%-32px)]" />
                </div>
              </div>
            )}
          </div>
        </div>
        )}
      </div>
{/* Like Claude with an artifact: the sidebar steps aside once the storyboard or deck opens. */}
      <AppDrawer key={view === "answer" ? "talk" : "object"} defaultOpen={view === "answer"} />
            {share && (
        <ShareSheet
          spec={spec}
          theme={theme}
          count={slides.length}
          onClose={() => setShare(false)}
          onShare={async (o) => {
            setShare(false)
            if (o.pptx) await exportPptx()
            setRetro({ sentToClaire: o.claire || retro.sentToClaire, dashboard: o.dashboard || retro.dashboard, repeat: o.repeat || retro.repeat })
            const where = [o.claire && "sent to Claire", o.dashboard && "live dashboard published", o.pptx && "PowerPoint exported", o.repeat && "repeats on autopilot"].filter(Boolean).join(" · ")
            if (where) toast.success(`${spec.name} · ${where}`, { position: "top-right" })
            setExpanded(false)
            if (spec.lessons) say({ from: "ally", text: "Keep these for the next event? I'll use them when I plan Black Friday.", lessons: true })
            else say({ from: "ally", text: [o.claire && `Sent to ${spec.forWhom.split(" ")[0]}.`, o.repeat && `I'll refresh it every Monday on autopilot and send it the same way.`].filter(Boolean).join(" ") || "Done." })
          }}
        />
      )}
    </PageShell>
  )
}

function AllyMark() {
  return (
    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-50">
      <Sparkles className="size-3.5 text-brand-600" />
    </span>
  )
}

function Conversation({ name, msgs, chips, onAsk, retro, onSave }: { name: string; msgs: Msg[]; chips: { q: string; run: () => void }[]; onAsk: (t: string) => void; retro: { saved?: string[] }; onSave: (id: string, scope: "account" | "me") => void }) {
  const list = useRef<HTMLDivElement>(null)
  // Keep the newest message in view: scroll the conversation itself, never the page.
  useEffect(() => {
    const el = list.current
    if (el) el.scrollTop = el.scrollHeight
  }, [msgs.length])
  return (
    <section aria-label="Conversation" className="flex max-h-[calc(100vh-120px)] min-h-[760px] flex-col border-r border-slate-200 bg-white">
      <div className="px-5 pt-5 text-[13px] text-slate-500">{name} · with Ally</div>
      <div ref={list} className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
        {msgs.map((m) =>
          m.from === "you" ? (
            <div key={m.id} className="flex flex-col items-end gap-1.5">
              {m.file && (
                <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px]">
                  <Paperclip className="size-3.5 text-slate-400" />
                  <span>
                    <b className="block font-semibold text-slate-950">{BRAND_FILE.name}</b>
                    <span className="text-slate-500">{BRAND_FILE.size}</span>
                  </span>
                </div>
              )}
              <div className="max-w-[300px] rounded-2xl rounded-br-md bg-brand-500 px-3.5 py-2 text-sm leading-relaxed text-white">{m.text}</div>
            </div>
          ) : (
            <div key={m.id} className="flex gap-3">
              <AllyMark />
              <div className="flex min-w-0 flex-col gap-2 text-sm leading-relaxed text-slate-700">
                {m.text && <span className={m.detail ? "font-semibold text-slate-950" : undefined}>{m.text}</span>}
                {m.detail && (
                  <ul className="flex flex-col gap-0.5 text-[13px]">
                    {m.detail.map((d) => (
                      <li key={d}>· {d}</li>
                    ))}
                  </ul>
                )}
                {m.lessons && <Lessons saved={retro.saved ?? []} onSave={onSave} />}
              </div>
            </div>
          ),
        )}
      </div>
      <div className="relative">
        <FadeAbove className="absolute inset-x-0 -top-8" />
        <div className="absolute inset-x-0 -top-12 flex justify-center">
          <MoreBelow list={list} />
        </div>
      </div>
      <div className="flex flex-col gap-2 px-4 pb-3">
        <div className="flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <button key={c.q} type="button" onClick={c.run} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[13px] text-slate-700 hover:border-brand-300 hover:text-brand-700">
              {c.q}
            </button>
          ))}
        </div>
        <Composer onAsk={onAsk} placeholder="Change it in words" />
      </div>
    </section>
  )
}

function Lessons({ saved, onSave }: { saved: string[]; onSave: (id: string, scope: "account" | "me") => void }) {
  const [skipped, setSkipped] = useState<string[]>([])
  return (
    <div className="flex flex-col gap-2">
      {LESSONS.map((l) => {
        const done = saved.includes(l.id)
        const no = skipped.includes(l.id)
        return (
          <div key={l.id} className="rounded-xl border border-slate-200 px-3 py-2.5">
            <div className="text-[13px] font-semibold text-slate-950">{l.text}</div>
            <div className="mt-0.5 text-xs text-slate-500">
              {l.why} · {l.scope}
            </div>
            <div className="mt-2 flex gap-1.5">
              {done ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-success-700">
                  <Check className="size-3.5" /> Saved to Knowledge
                </span>
              ) : no ? (
                <span className="text-xs text-slate-500">Not kept</span>
              ) : (
                <>
                  <button type="button" onClick={() => onSave(l.id, "account")} className="h-7 rounded-md bg-brand-500 px-2.5 text-xs font-semibold text-white hover:bg-brand-600">
                    Yes
                  </button>
                  <button type="button" onClick={() => setSkipped((s) => [...s, l.id])} className="h-7 rounded-md border border-slate-200 px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                    No
                  </button>
                  <button type="button" onClick={() => onSave(l.id, "me")} className="h-7 rounded-md border border-slate-200 px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                    Just for me
                  </button>
                </>
              )}
            </div>
          </div>
        )
      })}
      {saved.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Check className="size-3.5 text-success-700" /> {saved.length} saved to Knowledge ·{" "}
          <Link href="/settings?tab=knowledge" className="font-medium text-brand-700 hover:underline">
            See in Knowledge
          </Link>
        </div>
      )}
    </div>
  )
}

const AI_NOTE = "Ally is AI and can make mistakes. Please double-check responses."

function Composer({ onAsk, placeholder, className }: { onAsk: (t: string) => void; placeholder: string; className?: string }) {
  const [text, setText] = useState("")
  return (
    <div className={className}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!text.trim()) return
          onAsk(text.trim())
          setText("")
        }}
        className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white py-1.5 pr-1.5 pl-4 shadow-[0_8px_24px_-6px_rgba(15,23,42,0.18),0_2px_6px_rgba(15,23,42,0.06)]"
      >
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} aria-label={placeholder} className="h-8 min-w-0 flex-1 bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400" />
        <button type="submit" aria-label="Send" className="flex size-8 items-center justify-center rounded-full bg-brand-500 text-white hover:bg-brand-600">
          <Send className="size-4" />
        </button>
      </form>
      <p className="mt-2 text-center text-[11px] whitespace-nowrap text-slate-400">{AI_NOTE}</p>
    </div>
  )
}

function Storyboard(p: {
  name: string
  forWhom: string
  expanded: boolean
  locked: boolean
  slides: RetroSlide[]
  changed: Record<string, string>
  onMove: (from: number, to: number) => void
  onExpand: () => void
  onLock: () => void
  onDeck: () => void
  onDashboard?: () => void
}) {
  const [drag, setDrag] = useState<number | null>(null)
  const [over, setOver] = useState<number | null>(null)
  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-7 py-4">
        <div className="min-w-0 flex-1">
          <div className="text-lg font-semibold tracking-tight text-slate-950">{p.name}</div>
          <div className="mt-0.5 text-[13px] text-slate-500">
            Storyboard · {p.locked ? "locked" : "draft"} · for {p.forWhom} · {p.slides.length} slides{p.locked ? "" : " · drag to reorder"}
          </div>
        </div>
        <button type="button" onClick={p.onExpand} className={cn(SECONDARY, SMALL)}>
          {p.expanded ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          {p.expanded ? "Collapse" : "Expand"}
        </button>
        <button type="button" onClick={p.onLock} aria-pressed={p.locked} className={cn(SECONDARY, SMALL, p.locked && "border-brand-300 text-brand-700")}>
          <Lock className="size-4" />
          {p.locked ? "Locked" : "Lock"}
        </button>
        {p.onDashboard && (
          <button type="button" onClick={p.onDashboard} className={cn(SECONDARY, SMALL)}>
            Make a dashboard
          </button>
        )}
        <button type="button" onClick={p.onDeck} className={cn(PRIMARY, SMALL)}>
          Make a deck
        </button>
      </div>

      {
        <div className={cn("grid grid-cols-3 content-start", p.expanded ? "gap-x-6 gap-y-7 px-8 pt-6 pb-40" : "gap-x-4 gap-y-5 px-7 py-5")}>
          {p.slides.map((s, i) => (
            <div
              key={s.id}
              draggable={!p.locked}
              onDragStart={() => setDrag(i)}
              onDragOver={(e) => {
                e.preventDefault()
                setOver(i)
              }}
              onDragEnd={() => {
                setDrag(null)
                setOver(null)
              }}
              onDrop={() => {
                if (drag !== null) p.onMove(drag, i)
                setDrag(null)
                setOver(null)
              }}
              className={cn("rounded-[10px] transition-transform", !p.locked && "cursor-grab active:cursor-grabbing", drag === i && "opacity-40", (over === i && drag !== i) || p.changed[s.id] ? "ring-2 ring-brand-300 ring-offset-4 ring-offset-slate-50" : "")}
            >
              <Slide slide={s} index={i + 1} size={p.expanded ? 19 : 11} footer={p.name} />
              <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                {!p.locked && <GripVertical className="size-3.5 text-slate-400" />}
                <span className="font-mono">{i + 1}</span>
                {p.changed[s.id] && <span className="ml-auto font-semibold text-brand-700">{p.changed[s.id]}</span>}
              </div>
            </div>
          ))}
        </div>
      }
    </div>
  )
}

function Deck(p: {
  name: string
  slides: RetroSlide[]
  current: number
  setCurrent: (i: number) => void
  theme: "default" | "aurelle"
  branded: boolean
  before: boolean
  setBefore: (b: boolean) => void
  onBrand: () => void
  onExport: () => void
  onShare: () => void
  onStoryboard: () => void
}) {
  const s = p.slides[p.current]
  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-7 py-4">
        <div className="min-w-0 flex-1">
          <div className="text-lg font-semibold tracking-tight text-slate-950">{p.name}</div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[13px] text-slate-500">
            <Lock className="size-3" /> Locked · {p.slides.length} slides · {THEMES[p.branded ? "aurelle" : "default"].name}
            <button type="button" onClick={p.onStoryboard} className="ml-2 font-medium text-brand-700 hover:underline">
              Back to storyboard
            </button>
          </div>
        </div>
        {p.branded ? (
          <div role="tablist" className="flex rounded-lg border border-slate-200 bg-slate-25 p-0.5">
            {[false, true].map((b) => (
              <button key={String(b)} role="tab" aria-selected={p.before === !b} type="button" onClick={() => p.setBefore(!b)} className={cn("h-8 rounded-md px-3 text-[13px]", p.before === !b ? "bg-white font-semibold text-slate-950 shadow-xs ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-800")}>
                {b ? "After" : "Before"}
              </button>
            ))}
          </div>
        ) : (
          <button type="button" onClick={p.onBrand} className={cn(SECONDARY, SMALL)}>
            <Paperclip className="size-4" /> Apply brand template
          </button>
        )}
        <button type="button" onClick={p.onExport} className={cn(SECONDARY, SMALL)}>
          <Download className="size-4" /> Export PowerPoint
        </button>
        <button type="button" onClick={p.onShare} className={cn(PRIMARY, SMALL)}>
          Share
        </button>
      </div>
      <div className="grid grid-cols-[148px_minmax(0,1fr)]">
        <div className="flex flex-col gap-3 border-r border-slate-200 bg-white px-3.5 py-4">
          {p.slides.map((x, i) => (
            <button key={x.id} type="button" onClick={() => p.setCurrent(i)} aria-label={`Slide ${i + 1}: ${x.title}`} className={cn("rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-brand-300", i === p.current && "ring-2 ring-brand-500 ring-offset-2")}>
              <Slide slide={x} index={i + 1} theme={p.theme} size={6} footer={p.name} />
            </button>
          ))}
        </div>
        <div className="flex flex-col items-center gap-4 px-10 py-8">
          <div className="w-full max-w-[860px]">
            <Slide slide={s} index={p.current + 1} theme={p.theme} size={34} footer={p.name} />
          </div>
          <div className="flex items-center gap-3 text-[13px] text-slate-500">
            <button type="button" disabled={p.current === 0} onClick={() => p.setCurrent(p.current - 1)} className="rounded-md px-2 py-1 hover:bg-white disabled:opacity-40">
              ← Previous
            </button>
            <span className="font-mono">
              {p.current + 1} / {p.slides.length}
            </span>
            <button type="button" disabled={p.current === p.slides.length - 1} onClick={() => p.setCurrent(p.current + 1)} className="rounded-md px-2 py-1 hover:bg-white disabled:opacity-40">
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ShareSheet({ spec, theme, count, onClose, onShare }: { spec: DeckSpec; theme: "default" | "aurelle"; count: number; onClose: () => void; onShare: (o: { claire: boolean; dashboard: boolean; pptx: boolean; repeat: boolean }) => void }) {
  const [o, setO] = useState({ claire: true, dashboard: !!spec.dashboard, pptx: false, repeat: false })
  const n = Object.values(o).filter(Boolean).length
  const rows: { k: keyof typeof o; title: string; sub: string }[] = [
    { k: "claire", title: `Send to ${spec.forWhom.split(" ")[0]}`, sub: "Lands on her home under Reports ready, and in her email" },
    ...(spec.dashboard ? [{ k: "dashboard" as const, title: "Publish as a live dashboard", sub: `Numbers refresh daily · Dashboards › ${spec.name}` }] : []),
    { k: "pptx", title: "Export PowerPoint", sub: `${theme === "aurelle" ? `${spec.file} (Aurelle).pptx` : `${spec.file}.pptx`} · ${THEMES[theme].name} · ${count} slides, all editable` },
    { k: "repeat", title: spec.repeat.title, sub: spec.repeat.sub },
  ]
  return (
    <div role="dialog" aria-modal="true" aria-label={`Share ${spec.name}`} className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/20 px-4 pt-24">
      <div className="w-full max-w-[600px] overflow-hidden rounded-2xl bg-white shadow-[0_30px_80px_-20px_rgba(15,23,42,0.35)] ring-1 ring-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <div className="text-[17px] font-semibold text-slate-950">Share {spec.name}</div>
            <div className="mt-0.5 text-[13px] text-slate-500">Locked · {count} slides</div>
          </div>
          <button type="button" aria-label="Close" onClick={onClose} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700">
            <X className="size-4" />
          </button>
        </div>
        <div className="flex flex-col gap-2.5 px-6 py-5">
          {rows.map((r) => (
            <label key={r.k} className={cn("grid cursor-pointer grid-cols-[20px_minmax(0,1fr)] gap-3 rounded-xl border px-4 py-3.5", o[r.k] ? "border-brand-300 bg-brand-25" : "border-slate-200")}>
              <input type="checkbox" checked={o[r.k]} onChange={(e) => setO({ ...o, [r.k]: e.target.checked })} className="mt-0.5 size-4 accent-brand-500" />
              <span>
                <span className="block text-sm font-semibold text-slate-950">{r.title}</span>
                <span className="mt-0.5 block text-[13px] text-slate-500">{r.sub}</span>
              </span>
            </label>
          ))}
        </div>
        <div className="flex items-center gap-3 border-t border-slate-100 bg-slate-25 px-6 py-3.5">
          <span className="text-[13px] text-slate-500">{n} selected</span>
          <button type="button" onClick={onClose} className={cn(SECONDARY, "ml-auto", SMALL)}>
            Cancel
          </button>
          <button type="button" disabled={n === 0} onClick={() => onShare(o)} className={cn(PRIMARY, SMALL, "disabled:opacity-50")}>
            Share
          </button>
        </div>
      </div>
    </div>
  )
}
