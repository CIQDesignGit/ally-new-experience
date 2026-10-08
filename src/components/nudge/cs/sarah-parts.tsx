"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowRight, CalendarDays, Check, ChevronRight, Mic } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { TopStrip } from "../top-strip"
import { useNudge } from "../nudge-context"
import { PRIMARY, SECONDARY } from "../mike/buttons"
import { RunList } from "../runs/run-list"
import type { RunItem } from "../runs/data"
import { ACCOUNT, ASKS, INBOX, LAST_CALL, NEXT_MEETING, PLAN, PORTFOLIO, RECAP, SARAH, WALMART_PACING, WBR_EDIT } from "./data"
import type { InboxItem } from "./data"
import { WhyIcon } from "./why-icon"

const HEAD = "text-xs font-medium text-slate-500"
const PLAYED_KEY = "ally-sarah-inbox-played"

/**
 * Where Sarah's work stands, from one map: approval items "done" (approved) or
 * "dismissed" (held); autopilot items "dismissed" (recalled, held or undone);
 * the recap "done" once saved or sent.
 */
export function useWork() {
  const { callItems, setCallItem, runs } = useNudge()
  const approved = (id: string) => callItems[id] === "done"
  const held = (id: string) => callItems[id] === "dismissed"
  const undone = (id: string) => callItems[id] === "dismissed"
  const waiting = INBOX.filter((i) => i.kind === "approval" && !callItems[i.id])
  // The plan as Ally left it after the call (unless Sarah undid it), then her own edits on top.
  const planChanged = !undone("a-plan")
  const plan = PLAN.map((g) => ({ ...g, items: g.items.map((i) => (i.id === "jbp-wbr" && planChanged ? { ...i, ...WBR_EDIT } : i)) }))
  const added = [...(planChanged ? [WALMART_PACING] : []), ...runs.added.filter((x) => x.plan && x.id !== WALMART_PACING.id)]
  return { approved, held, undone, waiting, plan, added, planChanged, setCallItem, callItems }
}

export function SarahHeader({ crumbs }: { crumbs?: { label: string; href?: string }[] }) {
  return (
    <TopStrip
      person="sarah"
      greeting={crumbs ? undefined : `Hi ${SARAH.first}`}
      crumbs={crumbs}
      facts={
        <span>
          <span className="font-semibold text-slate-950">{ACCOUNT.name}</span> · {ACCOUNT.tier}
          <span className="text-slate-300"> · </span>
          Next session <span className="font-semibold text-slate-950">{NEXT_MEETING.when.replace(" · ", ", ")}</span>
        </span>
      }
    />
  )
}

/** Sarah's accounts, one line: Aurelle open, the rest as where they stand. */
export function Portfolio() {
  const { waiting } = useWork()
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-1 border-y border-slate-200 bg-slate-25 px-10 py-3 text-sm">
      <span className="text-slate-500">{PORTFOLIO.length} accounts</span>
      {PORTFOLIO.map((a) => (
        <span key={a.name} className={cn("inline-flex items-center gap-1.5", a.name === ACCOUNT.name ? "font-semibold text-slate-950" : "text-slate-700")}>
          <span className={cn("size-1.5 rounded-full", a.tone === "late" ? "bg-error-500" : a.name === ACCOUNT.name && !waiting.length ? "bg-success-500" : a.tone === "due" ? "bg-warning-500" : "bg-success-500")} />
          {a.name}
          <span className={cn("font-normal", a.tone === "late" ? "text-error-600" : "text-slate-500")}>
            · {a.name === ACCOUNT.name ? (waiting.length ? `${waiting.length} need your approval` : "Nothing waiting") : a.status}
          </span>
        </span>
      ))}
    </div>
  )
}

/** The headline: what needs her, and what's due today. */
export function SarahHero() {
  const { waiting } = useWork()
  const today = waiting.filter((r) => r.due === "Today").length
  return (
    <div className="flex flex-col gap-4 px-10 pt-2 pb-6 md:grid md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-8">
      <div className="min-w-0">
        <div className="text-2xl font-semibold tracking-tight text-slate-700">
          Ally did <span className="font-mono text-slate-950">{INBOX.length}</span> things for {ACCOUNT.name} since Thursday.
        </div>
        <h1 className="mt-1 text-[28px] leading-tight font-bold tracking-tight text-slate-950">
          {waiting.length > 0 ? `${waiting.length} ${waiting.length === 1 ? "needs" : "need"} your approval.` : "Nothing is waiting for you."}
        </h1>
        {today > 0 && <div className="mt-2 text-lg font-semibold text-warning-700">{today} due today</div>}
      </div>
      <div className="flex flex-col items-start gap-2 md:items-end">
        <Link href="/sarah/prep" className={SECONDARY}>
          Meeting prep
        </Link>
        <span className="inline-flex items-center gap-1.5 text-[13px] text-slate-500">
          <CalendarDays className="size-3.5" /> {NEXT_MEETING.when.replace(" · ", ", ")} · {NEXT_MEETING.source}
        </span>
      </div>
    </div>
  )
}

/** A check that draws itself. */
function Tick({ on }: { on: boolean }) {
  return (
    <span className={cn("flex size-[18px] shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors duration-200", on ? "border-ally-500 bg-ally-500" : "border-slate-300 bg-white")}>
      <svg viewBox="0 0 12 12" className="size-[11px]" aria-hidden>
        <path d="M2 6.5l2.5 2.5L10 3.5" fill="none" stroke="white" strokeWidth={3} strokeDasharray={20} strokeDashoffset={on ? 0 : 20} style={{ transition: "stroke-dashoffset 300ms ease 50ms" }} />
      </svg>
    </span>
  )
}

/**
 * The inbox arriving: everything Ally did checks off, one at a time. Then what
 * ran on its own folds into "On autopilot" and what's left is what needs her.
 * Plays once a visit (and not at all with reduced motion).
 */
export function Inbox() {
  const [shown, setShown] = useState(0)
  const [settled, setSettled] = useState(false)
  const timers = useRef<number[]>([])
  const box = useRef<HTMLElement>(null)
  function play() {
    timers.current.forEach(window.clearTimeout)
    setSettled(false)
    setShown(0)
    timers.current = INBOX.map((_, i) => window.setTimeout(() => setShown(i + 1), 500 + i * 420))
    timers.current.push(window.setTimeout(() => setSettled(true), 500 + INBOX.length * 420 + 900))
    try {
      window.sessionStorage.setItem(PLAYED_KEY, "1")
    } catch {}
  }
  useEffect(() => {
    let played = false
    try {
      played = window.sessionStorage.getItem(PLAYED_KEY) === "1"
    } catch {}
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (played || reduce) {
      const t = window.setTimeout(() => {
        setShown(INBOX.length)
        setSettled(true)
      }, 0)
      return () => window.clearTimeout(t)
    }
    // Plays when the list comes into view, so it's seen on a short screen too.
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect()
          play()
        }
      },
      { threshold: 0.4 },
    )
    if (box.current) io.observe(box.current)
    const all = timers.current
    return () => {
      io.disconnect()
      all.forEach(window.clearTimeout)
    }
    // Once, on arrival.
  }, [])
  // What ran on its own first, then what waits: the list ends on what needs her.
  const order = [...INBOX.filter((i) => i.kind === "autopilot"), ...INBOX.filter((i) => i.kind === "approval")]
  return (
    <section ref={box} className="px-10 pt-8 pb-6">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight text-slate-950">
          Since Thursday, Ally did <span className="font-mono">{settled ? INBOX.length : Math.min(shown, INBOX.length)}</span> things
        </h2>
        {settled && (
          <button type="button" onClick={play} className="text-[13px] font-medium text-slate-500 hover:text-slate-800">
            Replay
          </button>
        )}
      </div>
      {settled ? (
        <SettledInbox />
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 px-6 py-1">
          {order.map((item, i) => {
            const visible = i < shown
            const checked = visible && item.kind === "autopilot"
            return (
              <div
                key={item.id}
                className={cn("grid grid-cols-[22px_minmax(0,1fr)_auto] items-center gap-3 border-t border-slate-100 py-2.5 transition-all duration-300 first:border-t-0", visible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0")}
              >
                <Tick on={checked} />
                <span className={cn("text-[15px] transition-colors duration-300", item.kind === "approval" ? "font-medium text-slate-950" : checked ? "text-slate-500" : "text-slate-950")}>{item.line}</span>
                <span className={cn("text-xs whitespace-nowrap", item.kind === "approval" ? "font-medium text-ally-700" : "text-slate-400")}>{item.kind === "approval" ? "Needs your approval" : "On autopilot"}</span>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

/** After the playthrough: what needs her, open; what ran on its own, folded. */
function SettledInbox() {
  const w = useWork()
  const { approve } = useNudge()
  const [open, setOpen] = useState<string | null>(null)
  const [showAuto, setShowAuto] = useState(false)
  const approvals = INBOX.filter((i) => i.kind === "approval").sort((a, b) => (w.callItems[a.id] ? 1 : 0) - (w.callItems[b.id] ? 1 : 0) || (a.due === "Today" ? 0 : 1) - (b.due === "Today" ? 0 : 1))
  const autos = INBOX.filter((i) => i.kind === "autopilot")
  function approveIt(i: InboxItem) {
    w.setCallItem(i.id, "done")
    if (i.approves) approve(i.approves)
    setOpen(null)
    toast.success(`Approved · ${i.line.replace(/^Drafted the /, "")}`, { position: "top-right" })
  }
  return (
    <div className="mt-4 flex flex-col gap-4">
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 bg-ally-50/60 px-6 py-3">
          <span className="text-[15px] font-semibold text-slate-950">
            Needs your approval <span className="ml-1 font-mono text-[13px] font-medium text-slate-400">{w.waiting.length}</span>
          </span>
          <span className="text-xs text-slate-500">Changes money or makes a new promise</span>
        </div>
        {approvals.map((i) => {
          const done = w.approved(i.id)
          const isOpen = open === i.id
          const ask = ASKS.find((a) => a.id === i.ask)
          return (
            <div key={i.id} className={cn("border-t border-slate-100 first:border-t-0", done && "bg-slate-25")}>
              <div className="grid grid-cols-[16px_minmax(0,1fr)_auto] items-center gap-4 px-6 py-3.5 lg:grid-cols-[16px_minmax(0,1fr)_minmax(0,220px)_110px_auto]">
                <button type="button" aria-label={isOpen ? "Close" : "Open"} onClick={() => setOpen(isOpen ? null : i.id)} className="text-slate-400 hover:text-slate-700">
                  <ChevronRight className={cn("size-4 transition-transform", isOpen && "rotate-90")} />
                </button>
                <span className="flex min-w-0 items-center gap-1">
                  <button type="button" onClick={() => setOpen(isOpen ? null : i.id)} className={cn("min-w-0 truncate text-left text-[15px] font-semibold", done ? "text-slate-500" : "text-slate-950")}>
                    {i.line.replace(/^Drafted the /, "").replace(/^./, (c) => c.toUpperCase())}
                  </button>
                  <WhyIcon why={i.why} align="left" />
                </span>
                <span className="hidden min-w-0 text-[13px] text-slate-700 lg:block">
                  {ask ? (
                    <span className="inline-flex items-center gap-1">
                      <Mic className="size-3.5 shrink-0 text-slate-400" /> {ask.who.split(" ")[0]} on the call, {ask.at}
                    </span>
                  ) : (
                    i.source
                  )}
                </span>
                <span className={cn("hidden text-[13px] font-medium lg:block", done ? "text-slate-500" : i.due === "Today" ? "text-warning-700" : "text-slate-700")}>{done ? "" : w.held(i.id) ? "Held" : `Due ${i.due === "Today" ? "today" : i.due}`}</span>
                <span className="flex justify-end">
                  {done ? (
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success-700">
                      <Check className="size-4" /> Approved
                    </span>
                  ) : (
                    <button type="button" onClick={() => setOpen(isOpen ? null : i.id)} className={cn(PRIMARY, "lg:w-[140px]")}>
                      Review
                    </button>
                  )}
                </span>
              </div>
              {isOpen && (
                <div className="mx-4 mb-4 rounded-lg border border-slate-200 bg-white px-5 py-4 lg:mr-6 lg:ml-[52px]">
                  <Artifact item={i} />
                  {ask && (
                    <blockquote className="mt-4 border-l-2 border-slate-200 pl-3 text-[13px] text-slate-500">
                      &ldquo;{ask.quote}&rdquo; · {ask.who.split(" ")[0]}, {LAST_CALL.short} call, {ask.at}
                    </blockquote>
                  )}
                  {!done && (
                    <div className="mt-4 flex items-center gap-4">
                      <button type="button" onClick={() => approveIt(i)} className={PRIMARY}>
                        {i.artifact?.kind === "email" ? "Approve and send" : "Approve"}
                      </button>
                      {!w.held(i.id) && (
                        <button
                          type="button"
                          onClick={() => {
                            w.setCallItem(i.id, "dismissed")
                            setOpen(null)
                          }}
                          className="text-[13px] font-medium text-slate-500 hover:text-slate-800"
                        >
                          Hold
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <button type="button" onClick={() => setShowAuto((v) => !v)} aria-expanded={showAuto} className="flex w-full items-center gap-3 bg-info-50/50 px-6 py-3 text-left hover:bg-info-50">
          <ChevronRight className={cn("size-4 text-slate-400 transition-transform", showAuto && "rotate-90")} />
          <span className="text-[15px] font-semibold text-slate-950">
            On autopilot <span className="ml-1 font-mono text-[13px] font-medium text-slate-400">{autos.length}</span>
          </span>
          <span className="ml-auto text-xs text-slate-500">Reports, and changes inside your limits · recall or undo any</span>
        </button>
        {showAuto &&
          autos.map((i) => (
            <div key={i.id} className="grid grid-cols-[22px_minmax(0,1fr)_auto_auto] items-center gap-3 border-t border-slate-100 px-6 py-2.5 text-sm">
              <Tick on={!w.undone(i.id)} />
              <span className={w.undone(i.id) ? "text-slate-400 line-through" : "text-slate-700"}>
                {i.href ? (
                  <Link href={i.href} className="hover:text-brand-700 hover:underline">
                    {i.line}
                  </Link>
                ) : (
                  i.line
                )}
              </span>
              <WhyIcon why={i.why} />
              {w.undone(i.id) ? (
                <span className="w-16 text-right text-[13px] text-slate-500">{i.undo === "Undo" ? "Undone" : i.undo === "Hold" ? "Held" : "Recalled"}</span>
              ) : (
                <button type="button" onClick={() => w.setCallItem(i.id, "dismissed")} className="w-16 text-right text-[13px] font-medium text-brand-700 hover:underline">
                  {i.undo}
                </button>
              )}
            </div>
          ))}
      </div>
    </div>
  )
}

/** The work itself, shown where she reviews it. */
function Artifact({ item }: { item: InboxItem }) {
  const a = item.artifact
  if (!a) return null
  if (a.kind === "budget")
    return (
      <div>
        <div className={HEAD}>The move</div>
        <div className="mt-2 grid max-w-[520px] grid-cols-[minmax(0,1fr)_90px_90px] gap-x-4 gap-y-1.5 text-sm">
          <span className={HEAD}>Category</span>
          <span className={`${HEAD} text-right`}>Now</span>
          <span className={`${HEAD} text-right`}>Ally sets</span>
          {a.rows.map((r) => (
            <span key={r.what} className="contents">
              <span className="text-slate-950">{r.what}</span>
              <span className="text-right font-mono text-slate-500 tabular-nums">{r.from}</span>
              <span className="text-right font-mono text-slate-950 tabular-nums">{r.to}</span>
            </span>
          ))}
        </div>
        <p className="mt-3 text-[13px] text-slate-500">{a.note}</p>
      </div>
    )
  if (a.kind === "launch")
    return (
      <div className="flex flex-col gap-2">
        {a.parts.map((p) => (
          <div key={p.label} className="grid grid-cols-[90px_minmax(0,1fr)] gap-3 text-sm">
            <span className={HEAD}>{p.label}</span>
            <span className="text-slate-950">{p.value}</span>
          </div>
        ))}
      </div>
    )
  return (
    <div className="text-sm">
      <div className={HEAD}>To {a.to}</div>
      <div className="mt-1 font-semibold text-slate-950">{a.subject}</div>
      <p className="mt-2 rounded-lg bg-slate-25 px-4 py-3 text-slate-700 ring-1 ring-slate-100">{a.body}</p>
    </div>
  )
}

/** On Today: the call's recap, counting down to saving itself into context. */
export function RecapCard() {
  const { callItems } = useNudge()
  const saved = callItems["recap-saved"] === "done"
  const total = RECAP.reduce((n, s) => n + s.lines.length, 0)
  return (
    <section className="px-10 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 px-6 py-4">
        <div className="min-w-0">
          <div className="text-[15px] font-semibold text-slate-950">Recap of the {LAST_CALL.short} call</div>
          <div className="mt-0.5 text-[13px] text-slate-500">
            {total} things to keep · {RECAP.map((s) => `${s.lines.length} ${s.title.toLowerCase().replace("what landed well", "landed well").replace("facts we learned", "facts")}`).join(" · ")}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className={cn("text-[13px] font-medium", saved ? "text-success-700" : "text-warning-700")}>{saved ? "Saved to Aurelle's context" : `Saves to context ${LAST_CALL.savesAt}`}</span>
          <Link href="/sarah/recap" className={SECONDARY}>
            Open recap
          </Link>
        </div>
      </div>
    </section>
  )
}

/** What each plan item opens: its latest version, where it lives. */
const LATEST: Record<string, { label: string; href: string }> = {
  "jbp-wbr": { label: "Open this week's WBR", href: "/sarah/decks/weekly" },
  "jbp-pacing": { label: "Open pacing", href: "/james?from=sarah" },
  "jbp-actions": { label: "Open the actions", href: "/james?from=sarah" },
  "jbp-walmart-pacing": { label: "Open Walmart pacing", href: "/claire-waterfall" },
  "jbp-shipped": { label: "Open what shipped", href: "/content-results?period=qtd" },
  "jbp-session": { label: "Open meeting prep", href: "/sarah/prep" },
  "jbp-visibility": { label: "Open the readout", href: "/reports/ai-visibility" },
  "jbp-value": { label: "Open the value report", href: "/content-results?period=qtd" },
  "jbp-qbr": { label: "Open the QBR", href: "/michelle/decks/qbr?view=deck" },
}

/** The joint plan: one list per cadence, then what calls added. "What Ally does" is the rule: on autopilot, or drafted for Sarah. */
export function JointPlan({ readOnly, customer }: { readOnly?: boolean; /** Read by the customer: "you asked", not their name. */ customer?: boolean }) {
  const { plan, added } = useWork()
  const extra = (i: RunItem) => {
    const l = LATEST[i.id]
    return l ? (
      <Link href={l.href} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
        {l.label} <ArrowRight className="size-3.5" />
      </Link>
    ) : null
  }
  if (readOnly) return <PlanTable customer={customer} />
  return (
    <div className="flex flex-col gap-5">
      {plan.map((g) => (
        <RunList key={g.title} title={g.title} items={g.items} kind="scheduled" placeholder="Send a Target content report every Friday" whatLabel="Deliverable" lastLabel="Last sent or next" builtInLabel="in the contract" author={SARAH.name} planned extra={extra} />
      ))}
      <RunList title="Added from calls" items={added} kind="scheduled" placeholder="Send a Target content report every Friday" whatLabel="Deliverable" lastLabel="Last sent or next" builtInLabel="in the contract" author={SARAH.name} planned extra={extra} />
    </div>
  )
}

/** Claire's view: what changed and why, then the plan, read-only. */
function PlanTable({ customer }: { customer?: boolean }) {
  const { runs } = useNudge()
  const { plan, added, planChanged } = useWork()
  const groups = [...plan, ...(added.length ? [{ title: "Added from calls", items: added }] : [])]
  const changes = planChanged ? ASKS.filter((a) => a.answeredBy === "a-plan") : []
  return (
    <div className="flex flex-col gap-6">
      {changes.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-25 px-6 py-4">
          <div className={HEAD}>What changed</div>
          <ul className="mt-2 flex flex-col gap-1 text-sm text-slate-700">
            {changes.map((a) => (
              <li key={a.id}>
                <span className="font-medium text-slate-950">{a.title}</span> · from our {LAST_CALL.short} call · {customer && a.who === ACCOUNT.contact ? "you asked" : `${a.who.split(" ")[0]} asked`}
              </li>
            ))}
          </ul>
        </div>
      )}
      {groups.map((g) => (
        <section key={g.title} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-6 py-3.5 text-[15px] font-semibold text-slate-950">{g.title}</div>
          <div className="grid grid-cols-[minmax(0,1fr)_180px_180px] gap-4 px-6 pt-3 pb-1 text-xs font-medium text-slate-500">
            <span>Deliverable</span>
            <span>When</span>
            <span>Last sent or next</span>
          </div>
          <div className="px-6 pb-2">
            {g.items
              .map((i) => ({ ...i, ...runs.edits[i.id] }))
              .filter((i) => !runs.removed.includes(i.id))
              .map((i) => (
                <div key={i.id} className="grid grid-cols-[minmax(0,1fr)_180px_180px] items-baseline gap-4 border-t border-slate-100 py-3 text-sm first:border-t-0">
                  <span className="min-w-0">
                    <span className="block font-medium text-slate-950">{i.name}</span>
                    <span className="block text-[13px] text-slate-500">{i.what}</span>
                  </span>
                  <span className="text-slate-700">{i.runs}</span>
                  <span className="text-[13px] text-slate-500">{i.last}</span>
                </div>
              ))}
          </div>
        </section>
      ))}
    </div>
  )
}
