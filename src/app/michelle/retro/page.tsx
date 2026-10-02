"use client"

import { AppDrawer } from "@/components/nudge/app-drawer"
import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Check, Download, GripVertical, Lock, Maximize2, Minimize2, Paperclip, Send, Sparkles, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { PageShell } from "@/components/layout/page-shell"
import { TopStrip } from "@/components/nudge/top-strip"
import { useNudge } from "@/components/nudge/nudge-context"
import { AS_OF } from "@/components/nudge/data"
import { PRIMARY, SECONDARY } from "@/components/nudge/mike/buttons"
import { Slide } from "@/components/nudge/retro/slide"
import { ALL_SLIDES, BRAND_FILE, DEALS_TABLE, LESSONS, RETRO, SLIDES, THEMES } from "@/components/nudge/retro/prime-day"
import { RETRO_QUESTION, StorylineAnswer } from "@/components/nudge/retro/storyline-answer"
import { exportRetroPptx } from "@/components/nudge/retro/export-pptx"
import { lato, playfair } from "@/components/nudge/retro/fonts"

const DEFAULT_ORDER = SLIDES.map((s) => s.id)
const DATE = new Date(`${AS_OF}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
const SMALL = "h-9 px-3.5 text-sm"

type Msg = { id: number; from: "you" | "ally"; text?: string; file?: boolean; lessons?: boolean; detail?: string[] }

/**
 * Michelle's Prime Day retro, built with Ally. The conversation narrows to the
 * left while the object (storyboard, then deck) takes the wide side; Expand
 * gives the object the whole page and docks the input at the bottom.
 */
export default function RetroPage() {
  const { retro, setRetro, knowledge, saveKnowledge } = useNudge()
  const router = useRouter()
  // A saved order is kept only if every id is a slide we know (the summary may have been added).
  const known = new Set(ALL_SLIDES.map((s) => s.id))
  const order = retro.order && retro.order.length >= SLIDES.length && retro.order.every((id) => known.has(id)) ? retro.order : DEFAULT_ORDER
  const alts = retro.alts ?? []
  // What just changed in the storyboard, labelled under its card.
  const [changed, setChanged] = useState<Record<string, string>>({})
  const theme = retro.theme ?? "default"
  const [view, setView] = useState<"answer" | "storyboard" | "deck">("storyboard")
  const [tab, setTab] = useState<"outline" | "questions" | "storyboard">("storyboard")
  const [expanded, setExpanded] = useState(false)
  const [current, setCurrent] = useState(0)
  const [before, setBefore] = useState(false)
  const [share, setShare] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: 1, from: "you", text: RETRO_QUESTION },
    { id: 2, from: "ally", text: "Here's the storyline. The storyboard is open on the right: 7 slides, one per beat. Drag to reorder, or tell me what to change." },
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
      window.setTimeout(() => setRetro({ order: undefined, theme: undefined, locked: false, deck: false, sentToClaire: false, dashboard: false, saved: [], alts: [] }), 0)
      window.history.replaceState(null, "", "/michelle/retro")
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
  }, [retro.deck, setRetro])

  const say = (...m: Omit<Msg, "id">[]) => setMsgs((prev) => [...prev, ...m.map((x) => ({ ...x, id: next.current++ }))])
  const slides = order.map((id) => ALL_SLIDES.find((s) => s.id === id)!).map((s) => (s.id === "deals" && alts.includes("deals") ? { ...s, chart: DEALS_TABLE } : s))

  function addSummary(text: string) {
    if (order.includes("summary")) return say({ from: "you", text }, { from: "ally", text: "Slide 1 is already the executive summary." })
    setRetro({ order: ["summary", ...order.filter((id) => id !== "summary")] })
    setChanged((c) => ({ ...c, summary: "New" }))
    say(
      { from: "you", text },
      { from: "ally", text: "Added an executive summary as slide 1: the 4 headline numbers on the left, the 3 messages Claire needs on the right." },
    )
  }

  function dealsAsTable(text: string) {
    if (alts.includes("deals")) return say({ from: "you", text }, { from: "ally", text: `Slide ${order.indexOf("deals") + 1} is already a table.` })
    const n = order.indexOf("deals") + 1
    setRetro({ alts: [...alts.filter((a) => a !== "deals"), "deals"] })
    setChanged((c) => ({ ...c, deals: "Changed" }))
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
      await exportRetroPptx(order, theme, alts)
      toast.success(`Exported ${theme === "aurelle" ? "Prime-Day-retro (Aurelle).pptx" : "Prime-Day-retro.pptx"} · ${slides.length} editable slides`, { position: "top-right" })
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
      ? [{ q: "Open the storyboard", run: () => setView("storyboard") }]
      : view === "storyboard"
      ? [
          { q: "Put deals right after the market slide", run: () => { move(order.indexOf("deals"), order.indexOf("market") + 1); say({ from: "you", text: "Put deals right after the market slide" }, { from: "ally", text: `Done. Deals is slide ${order.indexOf("market") + 2}.` }) } },
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
      tab={tab}
      setTab={setTab}
      locked={!!retro.locked}
      slides={slides}
      changed={changed}
      onMove={move}
      onExpand={() => setExpanded((e) => !e)}
      onLock={() => { setRetro({ locked: !retro.locked }); toast.success(retro.locked ? "Unlocked" : "Storyline locked", { position: "top-right" }) }}
      onDeck={makeDeck}
      onDashboard={() => { setRetro({ dashboard: true }); toast.success("Published as a live dashboard · Dashboards › Prime Day retro", { position: "top-right" }) }}
    />
  ) : (
    <Deck slides={slides} current={current} setCurrent={setCurrent} theme={before ? "default" : theme} branded={theme === "aurelle"} before={before} setBefore={setBefore} onBrand={applyBrand} onExport={exportPptx} onShare={() => setShare(true)} onStoryboard={() => setView("storyboard")} />
  )

  return (
    <PageShell className={cn("bg-slate-50 xl:bg-white", playfair.variable, lato.variable)}>
      <div className="mx-auto max-w-[1440px] overflow-clip bg-white shadow-pane-lg sm:my-6 sm:rounded-2xl sm:ring-1 sm:ring-slate-900/6 xl:my-0 xl:rounded-none xl:shadow-none xl:ring-0">
        <TopStrip person="michelle" crumbs={[{ label: "Daily brief", href: "/michelle" }, { label: RETRO.name }]} />
        {view === "answer" ? (
          <div className="mt-4 flex min-h-[760px] justify-center border-t border-slate-200 px-10 pt-8 pb-10">
            <div className="flex w-full max-w-[860px] flex-col gap-6">
              <div className="flex justify-end">
                <div className="max-w-[560px] rounded-2xl rounded-br-md bg-brand-500 px-4 py-2.5 text-[15px] text-white">{RETRO_QUESTION}</div>
              </div>
              <div className="flex gap-3">
                <AllyMark />
                <StorylineAnswer onOpen={() => setView("storyboard")} />
              </div>
              <Composer onAsk={ask} placeholder="Ask a follow-up" className="sticky bottom-6 mt-auto" />
            </div>
          </div>
        ) : (
        <div className={cn("mt-4 grid min-h-[760px] border-t border-slate-200", expanded ? "grid-cols-1" : "grid-cols-[384px_minmax(0,1fr)]")}>
          {!expanded && <Conversation msgs={msgs} chips={chips} onAsk={ask} retro={retro} onSave={saveLesson} />}
          <div className="relative min-w-0 bg-slate-50">
            {objectPane}
            {expanded && (
              <div className="pointer-events-none sticky bottom-6 z-20 flex flex-col items-center gap-2 pb-6">
                <div className="pointer-events-auto flex flex-wrap justify-center gap-2">
                  {chips.map((c) => (
                    <button key={c.q} type="button" onClick={c.run} className="rounded-full border border-slate-200 bg-white/95 px-3 py-1.5 text-sm text-slate-700 shadow-xs hover:border-brand-300 hover:text-brand-700">
                      {c.q}
                    </button>
                  ))}
                </div>
                <Composer onAsk={ask} placeholder="Ask Ally to change the storyboard" className="pointer-events-auto w-[760px] max-w-[calc(100%-32px)]" />
              </div>
            )}
          </div>
        </div>
        )}
      </div>
<AppDrawer />
            {share && (
        <ShareSheet
          theme={theme}
          count={slides.length}
          onClose={() => setShare(false)}
          onShare={async (o) => {
            setShare(false)
            if (o.pptx) await exportPptx()
            setRetro({ sentToClaire: o.claire || retro.sentToClaire, dashboard: o.dashboard || retro.dashboard })
            const where = [o.claire && "sent to Claire", o.dashboard && "live dashboard published", o.pptx && "PowerPoint exported"].filter(Boolean).join(" · ")
            if (where) toast.success(`Prime Day retro · ${where}`, { position: "top-right" })
            setExpanded(false)
            say({ from: "ally", text: "Keep these for the next event? I'll use them when I plan Black Friday.", lessons: true })
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

function Conversation({ msgs, chips, onAsk, retro, onSave }: { msgs: Msg[]; chips: { q: string; run: () => void }[]; onAsk: (t: string) => void; retro: { saved?: string[] }; onSave: (id: string, scope: "account" | "me") => void }) {
  const list = useRef<HTMLDivElement>(null)
  // Keep the newest message in view: scroll the conversation itself, never the page.
  useEffect(() => {
    const el = list.current
    if (el) el.scrollTop = el.scrollHeight
  }, [msgs.length])
  return (
    <section aria-label="Conversation" className="flex max-h-[calc(100vh-120px)] min-h-[760px] flex-col border-r border-slate-200 bg-white">
      <div className="px-5 pt-5 text-[13px] text-slate-500">{RETRO.name} · with Ally</div>
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
      <div className="flex flex-col gap-2 px-4 pb-4">
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
      <p className="mt-2 text-center text-xs text-slate-400">{AI_NOTE}</p>
    </div>
  )
}

function Storyboard(p: {
  expanded: boolean
  tab: "outline" | "questions" | "storyboard"
  setTab: (t: "outline" | "questions" | "storyboard") => void
  locked: boolean
  slides: typeof SLIDES
  changed: Record<string, string>
  onMove: (from: number, to: number) => void
  onExpand: () => void
  onLock: () => void
  onDeck: () => void
  onDashboard: () => void
}) {
  const [drag, setDrag] = useState<number | null>(null)
  const [over, setOver] = useState<number | null>(null)
  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-7 py-4">
        <div className="min-w-0 flex-1">
          <div className="text-lg font-semibold tracking-tight text-slate-950">{RETRO.name}</div>
          <div className="mt-0.5 text-[13px] text-slate-500">
            Storyboard · {p.locked ? "locked" : "draft"} · for {RETRO.forWhom} · {p.slides.length} slides{p.locked ? "" : " · drag to reorder"}
          </div>
        </div>
        <div role="tablist" className="flex rounded-lg border border-slate-200 bg-slate-25 p-0.5">
          {(["outline", "questions", "storyboard"] as const).map((t) => (
            <button key={t} role="tab" aria-selected={p.tab === t} type="button" onClick={() => p.setTab(t)} className={cn("h-8 rounded-md px-3 text-[13px] capitalize", p.tab === t ? "bg-white font-semibold text-slate-950 shadow-xs ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-800")}>
              {t}
            </button>
          ))}
        </div>
        <button type="button" onClick={p.onExpand} className={cn(SECONDARY, SMALL)}>
          {p.expanded ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          {p.expanded ? "Collapse" : "Expand"}
        </button>
        <button type="button" onClick={p.onLock} aria-pressed={p.locked} className={cn(SECONDARY, SMALL, p.locked && "border-brand-300 text-brand-700")}>
          <Lock className="size-4" />
          {p.locked ? "Locked" : "Lock"}
        </button>
        <button type="button" onClick={p.onDashboard} className={cn(SECONDARY, SMALL)}>
          Make a dashboard
        </button>
        <button type="button" onClick={p.onDeck} className={cn(PRIMARY, SMALL)}>
          Make a deck
        </button>
      </div>

      {p.tab === "storyboard" ? (
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
              <Slide slide={s} index={i + 1} size={p.expanded ? 19 : 11} />
              <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                {!p.locked && <GripVertical className="size-3.5 text-slate-400" />}
                <span className="font-mono">{i + 1}</span>
                {p.changed[s.id] && <span className="ml-auto font-semibold text-brand-700">{p.changed[s.id]}</span>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <ol className="flex flex-col px-7 py-5">
          {p.slides.map((s, i) => (
            <li key={s.id} className="grid grid-cols-[28px_minmax(0,1fr)] gap-3 border-b border-slate-100 py-3.5">
              <span className="font-mono text-[13px] text-slate-400">{i + 1}</span>
              <span>
                <span className="block text-[15px] font-semibold text-slate-950">{p.tab === "outline" ? s.title : s.question}</span>
                <span className="mt-0.5 block text-[13px] text-slate-500">{p.tab === "outline" ? s.eyebrow : s.title}</span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

function Deck(p: {
  slides: typeof SLIDES
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
          <div className="text-lg font-semibold tracking-tight text-slate-950">{RETRO.name}</div>
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
              <Slide slide={x} index={i + 1} theme={p.theme} size={6} />
            </button>
          ))}
        </div>
        <div className="flex flex-col items-center gap-4 px-10 py-8">
          <div className="w-full max-w-[860px]">
            <Slide slide={s} index={p.current + 1} theme={p.theme} size={34} />
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

function ShareSheet({ theme, count, onClose, onShare }: { theme: "default" | "aurelle"; count: number; onClose: () => void; onShare: (o: { claire: boolean; dashboard: boolean; pptx: boolean; repeat: boolean }) => void }) {
  const [o, setO] = useState({ claire: true, dashboard: true, pptx: false, repeat: false })
  const n = Object.values(o).filter(Boolean).length
  const rows: { k: keyof typeof o; title: string; sub: string }[] = [
    { k: "claire", title: "Send to Claire", sub: "Lands on her home under Reports ready, and in her email" },
    { k: "dashboard", title: "Publish as a live dashboard", sub: "Numbers refresh daily · Dashboards › Prime Day retro" },
    { k: "pptx", title: "Export PowerPoint", sub: `${theme === "aurelle" ? "Prime-Day-retro (Aurelle).pptx" : "Prime-Day-retro.pptx"} · ${THEMES[theme].name} · ${count} slides, all editable` },
    { k: "repeat", title: "Run this after every event", sub: "Next: Black Friday, Nov 27 · same storyline, fresh numbers" },
  ]
  return (
    <div role="dialog" aria-modal="true" aria-label="Share Prime Day retro" className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/20 px-4 pt-24">
      <div className="w-full max-w-[600px] overflow-hidden rounded-2xl bg-white shadow-[0_30px_80px_-20px_rgba(15,23,42,0.35)] ring-1 ring-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <div className="text-[17px] font-semibold text-slate-950">Share {RETRO.name}</div>
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
