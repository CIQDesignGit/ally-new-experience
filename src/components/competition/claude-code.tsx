"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useCompetition, setCompetition, reached } from "./state"
import { NAMES, SQL, SKILL, DEALS, SOV } from "./data"
import type { Harness } from "./harness"

type Line = { kind: "you" | "think" | "tool" | "out" | "write" | "say"; text: string; file?: FileId }
type FileId = "promotions" | "priceGap" | "sov" | "skill" | "tests"

const FILES: { id: FileId; path: string }[] = [
  { id: "promotions", path: "skills/competition-watch/promotions.sql" },
  { id: "priceGap", path: "skills/competition-watch/price_gap.sql" },
  { id: "sov", path: "skills/competition-watch/sov_gift_terms.sql" },
  { id: "skill", path: "skills/competition-watch/SKILL.md" },
  { id: "tests", path: "skills/competition-watch/tests.yaml" },
]

const last = SOV.theirs.length - 1

/** What Nora types, turn by turn, and what Claude does in reply. */
const TURNS: { prompt: string; reply: Line[]; pause?: boolean }[] = [
  {
    prompt: `Request ${NAMES.request} for Aurelle: build a weekly competition skill against ${NAMES.competitor}. Promotions, price gap vs our matched SKUs, share of voice on the gift terms. Draft the SQL and the skill. Don't publish.`,
    reply: [
      { kind: "think", text: "Reading the request and Aurelle's account context" },
      { kind: "tool", text: 'datamcp.discover_fields("competitor offers, deals, prices, search slots")' },
      { kind: "out", text: "competitor_offers · offer_prices · search_slots · competitor_sku_map" },
      { kind: "tool", text: `datamcp.discover_values("brand", "${NAMES.competitor}")` },
      { kind: "out", text: `${NAMES.competitor} · 38 listings on Amazon US` },
      { kind: "write", text: "SKILL.md", file: "skill" },
      { kind: "write", text: "promotions.sql", file: "promotions" },
      { kind: "write", text: "sov_gift_terms.sql", file: "sov" },
      { kind: "write", text: "price_gap.sql", file: "priceGap" },
      { kind: "say", text: "Drafted three queries and the skill. Review price_gap.sql before I run anything: I matched products by type in the title, since I didn't find a mapping I was sure of." },
    ],
    pause: true,
  },
  {
    prompt: "I changed price_gap.sql to join through competitor_sku_map. Title matching pairs every gift set with every gift set. Run all three on the last 8 weeks and write tests from known weeks.",
    reply: [
      { kind: "tool", text: "datamcp.execute_sql(price_gap.sql, last 8 weeks)" },
      { kind: "out", text: `${DEALS.length} matched gift sets priced below yours · gaps from −$3.60 to −$4.80` },
      { kind: "tool", text: "datamcp.execute_sql(promotions.sql, last 8 weeks)" },
      { kind: "out", text: `20% off on ${DEALS.length} gift sets since Oct 5 · 30% off during Prime Day` },
      { kind: "tool", text: "datamcp.execute_sql(sov_gift_terms.sql, week of Oct 4)" },
      { kind: "out", text: `${NAMES.competitor} ${SOV.theirs[last]}% · Aurelle ${SOV.ours[last]}%` },
      { kind: "write", text: "tests.yaml · 12 cases", file: "tests" },
      { kind: "tool", text: "run tests (sample data)" },
      { kind: "out", text: "12 of 12 pass on sample data" },
      { kind: "say", text: "Ready for review. The full test run happens on production data in the Agent Console." },
    ],
  },
  {
    prompt: "Submit for review.",
    reply: [
      { kind: "tool", text: `console.submit(skill: "${NAMES.skill}", account: Aurelle)` },
      { kind: "out", text: `Version 1 · waiting for review by ${NAMES.reviewer}` },
    ],
  },
]

/** The fix Lena sends back: the skill names Brightwick. */
const FIX_TURN = {
  prompt: `Lena's run failed for Juniper Home: the skill compares against ${NAMES.competitor}. Read the competitor from each account's competitor list instead.`,
  reply: [
    { kind: "think", text: "Reading the failed test from the Agent Console" },
    { kind: "write", text: "SKILL.md · step 4", file: "skill" },
    { kind: "tool", text: "run tests (Juniper Home, Larkspur Pet)" },
    { kind: "out", text: "2 of 2 pass" },
    { kind: "tool", text: "console.submit(version 3)" },
    { kind: "out", text: `Version 3 · back with ${NAMES.reviewer}` },
  ] as Line[],
}

const PACE: Record<Line["kind"], number> = { you: 0, think: 700, tool: 800, out: 450, write: 550, say: 700 }

/**
 * The two skins of the build step. Borrow: Claude Code, a dark terminal beside
 * an editor. Build: CommerceIQ's own Skill Builder, inside the Agent Console,
 * where Ally does what Claude does. Same session, same files, same fix.
 */
const SKIN = {
  borrow: {
    root: "h-[calc(100vh-40px)] bg-[#1a1a1a]",
    divide: "border-white/10",
    head: "font-mono text-slate-400",
    title: (
      <>
        <span className="text-[#d97757]">✻</span> Claude Code · ~/aurelle-candles · {NAMES.fde}
      </>
    ),
    body: "font-mono",
    connected: "✻ Connected: CommerceIQ data MCP · Aurelle Candles · Amazon US",
    muted: "text-slate-500",
    working: <div className="mt-2 text-[#d97757]">✻ Working…</div>,
    note: "font-mono text-slate-400",
    link: "text-white underline",
    form: "border-white/15 bg-black/30",
    prompt: "font-mono text-white",
    caret: "font-mono text-slate-400",
    send: "bg-white/10 font-mono text-white hover:bg-white/20",
    editor: "bg-[#1e1e1e]",
    tab: (on: boolean) => cn("font-mono", on ? "bg-[#1a1a1a] text-white" : "text-slate-400 hover:text-white"),
    modified: "text-[#e2c08d]",
  },
  build: {
    root: "h-[calc(100vh-88px)] bg-white",
    divide: "border-slate-200",
    head: "text-slate-500",
    title: (
      <>
        <span className="font-semibold text-slate-950">Skill Builder</span> · {NAMES.skill} · Aurelle Candles · {NAMES.fde}
      </>
    ),
    body: "",
    connected: "Ally builds, you review · connected to Aurelle Candles' data · Amazon US",
    muted: "text-slate-500",
    working: <div className="mt-2 font-medium text-ally-600">Ally is working…</div>,
    note: "text-slate-500",
    link: "font-medium text-brand-700 hover:underline",
    form: "border-slate-200 bg-white focus-within:border-brand-300",
    prompt: "text-slate-950",
    caret: "text-slate-400",
    send: "bg-brand-500 font-medium text-white hover:bg-brand-600",
    editor: "bg-slate-25",
    tab: (on: boolean) => cn("font-mono", on ? "bg-white text-slate-950" : "text-slate-500 hover:text-slate-950"),
    modified: "text-warning-600",
  },
}

export function ClaudeCode({ harness = "borrow" }: { harness?: Harness }) {
  const s = SKIN[harness]
  const dark = harness === "borrow"
  const c = useCompetition()
  const fixing = c.stage === "tested" && c.sovFixed && !c.competitorFixed
  const fixed = c.competitorFixed
  // Where the session is: which turn is waiting to be sent.
  const startTurn = reached(c, "submitted") ? TURNS.length : reached(c, "built") ? 2 : 0
  const [turn, setTurn] = useState(startTurn)
  const [lines, setLines] = useState<Line[]>(() => (reached(c, "submitted") ? TURNS.flatMap((t) => [{ kind: "you" as const, text: t.prompt }, ...t.reply]) : []))
  const [queue, setQueue] = useState<Line[]>([])
  const [open, setOpen] = useState<FileId>(reached(c, "submitted") ? "skill" : "priceGap")
  const [written, setWritten] = useState<FileId[]>(reached(c, "submitted") ? FILES.map((f) => f.id) : [])
  const [fixSent, setFixSent] = useState(fixed)
  const end = useRef<HTMLDivElement>(null)
  const busy = queue.length > 0

  // Play Claude's reply one line at a time.
  useEffect(() => {
    if (!queue.length) return
    const [next, ...rest] = queue
    const t = window.setTimeout(() => {
      setLines((l) => [...l, next])
      if (next.file) {
        setWritten((w) => (w.includes(next.file!) ? w : [...w, next.file!]))
        setOpen(next.file)
      }
      setQueue(rest)
    }, PACE[next.kind])
    return () => window.clearTimeout(t)
  }, [queue])

  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" })
  }, [lines])

  // When a reply finishes, record what it changed for the other screens.
  useEffect(() => {
    if (busy) return
    if (turn === 2 && !reached(c, "built")) setCompetition({ stage: "built" })
    if (turn === 3 && !reached(c, "submitted")) setCompetition({ stage: "submitted" })
    if (fixSent && !c.competitorFixed && lines.some((l) => l.text.startsWith("Version 3"))) setCompetition({ competitorFixed: true })
  }, [busy, turn, fixSent, lines, c])

  const waiting = TURNS[turn]
  const blocked = turn === 1 && !c.sqlEdited
  const prompt = fixing && !fixSent ? FIX_TURN.prompt : waiting && !blocked ? waiting.prompt : ""

  const send = () => {
    if (!prompt || busy) return
    if (fixing && !fixSent) {
      setFixSent(true)
      setLines((l) => [...l, { kind: "you", text: FIX_TURN.prompt }])
      setQueue(FIX_TURN.reply)
      return
    }
    setLines((l) => [...l, { kind: "you", text: waiting.prompt }])
    setQueue(waiting.reply)
    setTurn((t) => t + 1)
  }

  return (
    <div className={cn("grid grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] text-[13px] max-lg:h-auto max-lg:grid-cols-1", s.root)}>
      {/* The conversation */}
      <div className={cn("flex min-h-0 flex-col border-r", s.divide)}>
        <div className={cn("flex h-9 shrink-0 items-center gap-2 border-b px-4 text-[12px]", s.divide, s.head)}>{s.title}</div>
        <div className={cn("min-h-0 flex-1 overflow-y-auto px-5 py-4 leading-relaxed", s.body)}>
          <div className={s.muted}>{s.connected}</div>
          {lines.map((l, i) => (
            <Row key={i} l={l} dark={dark} />
          ))}
          {busy && s.working}
          <div ref={end} />
        </div>
        <div className={cn("shrink-0 border-t p-3", s.divide)}>
          {blocked && !busy ? (
            <div className={cn("px-2 py-2 text-[12px]", s.note)}>Review price_gap.sql on the right before going on.</div>
          ) : (reached(c, "submitted") && !fixing && !fixSent) || (fixed && !busy) ? (
            <div className={cn("px-2 py-2 text-[12px]", s.note)}>
              Version {fixed ? 3 : 1} is with {NAMES.reviewer}.{" "}
              <Link href="/console/skills/competition-watch" className={s.link}>
                Agent Console
              </Link>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                send()
              }}
              className={cn("flex items-start gap-2 rounded-lg border px-3 py-2.5", s.form)}
            >
              <span className={s.caret}>&gt;</span>
              <textarea readOnly value={busy ? "" : prompt} rows={3} className={cn("flex-1 resize-none bg-transparent text-[13px] leading-relaxed outline-none", s.prompt)} aria-label="Nora's message" />
              <button type="submit" disabled={busy || !prompt} className={cn("rounded-md px-2.5 py-1 text-[12px] disabled:opacity-30", s.send)}>
                Send ⏎
              </button>
            </form>
          )}
        </div>
      </div>

      {/* The editor: the files Claude (or Ally) writes, which Nora reads and edits */}
      <div className={cn("flex min-h-0 flex-col", s.editor)}>
        <div className={cn("flex h-9 shrink-0 overflow-x-auto border-b", s.divide)}>
          {FILES.filter((f) => written.includes(f.id)).map((f) => (
            <button key={f.id} type="button" onClick={() => setOpen(f.id)} className={cn("shrink-0 border-r px-3 text-[12px]", s.divide, s.tab(open === f.id))}>
              {f.path.split("/").pop()}
              {((f.id === "priceGap" && c.sqlEdited) || (f.id === "skill" && fixed)) && <span className={cn("ml-1.5", s.modified)}>M</span>}
            </button>
          ))}
        </div>
        <div className="min-h-0 flex-1 overflow-auto py-3 font-mono text-[12.5px] leading-[1.7]">
          {written.length === 0 ? <div className="px-5 text-slate-500">No files yet</div> : <Editor file={open} edited={c.sqlEdited} skillFixed={fixed} canEdit={turn === 1 && !c.sqlEdited && !busy} dark={dark} />}
        </div>
      </div>
    </div>
  )
}

function Row({ l, dark }: { l: Line; dark: boolean }) {
  if (l.kind === "you")
    return (
      <div className={cn("mt-4 flex gap-2 rounded-md px-3 py-2", dark ? "bg-white/5 text-white" : "bg-slate-100 text-slate-950")}>
        <span className="text-slate-400">&gt;</span>
        <span>{l.text}</span>
      </div>
    )
  const style = dark
    ? { think: "text-slate-400 italic", tool: "text-[#9cdcfe]", out: "pl-4 text-slate-400", write: "text-[#b5cea8]", say: "mt-2 text-slate-100" }[l.kind]
    : { think: "text-slate-500 italic", tool: "font-mono text-[12px] text-brand-700", out: "pl-4 font-mono text-[12px] text-slate-500", write: "font-mono text-[12px] text-success-700", say: "mt-2 text-slate-950" }[l.kind]
  const mark = { think: dark ? "✻" : "", tool: "●", out: "⎿", write: "●", say: "" }[l.kind]
  return (
    <div className={cn("mt-1.5 flex gap-2", style)}>
      {mark && <span className="shrink-0">{mark}</span>}
      <span>{l.kind === "write" ? `Write(${l.text})` : l.text}</span>
    </div>
  )
}

/** One file, with line numbers. price_gap.sql's title match is the line Nora edits. */
function Editor({ file, edited, skillFixed, canEdit, dark }: { file: FileId; edited: boolean; skillFixed: boolean; canEdit: boolean; dark: boolean }) {
  const plain = (text: string) => text.split("\n").map((t) => ({ t, kind: "plain" as const }))
  const diff = (head: string, wrong: string, right: string, tail: string | undefined, changed: boolean) => [
    ...plain(head),
    ...(changed ? [...wrong.split("\n").map((t) => ({ t, kind: "del" as const })), ...right.split("\n").map((t) => ({ t, kind: "add" as const }))] : wrong.split("\n").map((t) => ({ t, kind: "suspect" as const }))),
    ...(tail ? plain(tail) : []),
  ]
  const rows =
    file === "promotions"
      ? plain(SQL.promotions)
      : file === "priceGap"
        ? diff(SQL.priceGap.head, SQL.priceGap.wrong, SQL.priceGap.right, undefined, edited)
        : file === "sov"
          ? plain(`${SQL.sov.head}\n${SQL.sov.wrong}\n${SQL.sov.tail}`)
          : file === "skill"
            ? skillFixed
              ? diff(SKILL.head, SKILL.wrong, SKILL.right, SKILL.tail, true)
              : plain(`${SKILL.head}\n${SKILL.wrong}\n${SKILL.tail}`)
            : plain(TESTS_YAML)
  return (
    <div>
      {rows.map((r, i) => (
        <div
          key={i}
          className={cn(
            "flex",
            r.kind === "del" && (dark ? "bg-[#4b1818]/60 text-[#f8b4b4] line-through decoration-[#f8b4b4]/50" : "bg-error-50 text-error-700 line-through"),
            r.kind === "add" && (dark ? "bg-[#1f3d1f]/70 text-[#b6f0b6]" : "bg-success-50 text-success-800"),
            r.kind === "suspect" && canEdit && (dark ? "cursor-text bg-white/5" : "cursor-text bg-brand-50"),
          )}
          onClick={() => r.kind === "suspect" && canEdit && setCompetition({ sqlEdited: true })}
          title={r.kind === "suspect" && canEdit ? "Edit this line" : undefined}
        >
          <span className={cn("w-12 shrink-0 pr-4 text-right select-none", dark ? "text-slate-600" : "text-slate-400")}>{i + 1}</span>
          <span className={cn("pr-5 whitespace-pre", (r.kind === "plain" || r.kind === "suspect") && (dark ? "text-slate-300" : "text-slate-700"))}>{r.t || " "}</span>
          {r.kind === "suspect" && canEdit && <span className="ml-auto shrink-0 pr-4 text-[11px] text-slate-500">click to edit</span>}
        </div>
      ))}
      {file === "priceGap" && edited && <div className="mt-3 px-5 text-[12px] text-slate-500">Edited by {NAMES.fde}</div>}
    </div>
  )
}

const TESTS_YAML = `# 12 cases from known weeks, plus two other customers
- name: Deals, week of Oct 4
  expect: 4 deals, 20% off
- name: Deals, Prime Day week
  expect: 30% off on gift sets
- name: Price gap, Amber & Fig gift set
  expect: -4.80
- name: Brightwick share of voice, Prime Day week
  expect: 22%
- name: Alert fires at 5 pts
- name: Weekly run, Juniper Home
- name: Weekly run, Larkspur Pet
# …5 more`
