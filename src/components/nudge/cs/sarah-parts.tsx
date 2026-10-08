"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, CalendarDays, Check, ChevronRight, Mic } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { TopStrip } from "../top-strip"
import { useNudge } from "../nudge-context"
import { PRIMARY, SECONDARY } from "../mike/buttons"
import { RunList } from "../runs/run-list"
import type { RunItem } from "../runs/data"
import { ACCOUNT, ALLY_DID, ASKS, AUTOSENT, LAST_CALL, NEXT_MEETING, PLAN, PORTFOLIO, REVIEW_ITEMS, SARAH, WALMART_PACING, WBR_EDIT } from "./data"
import type { ReviewItem } from "./data"

const HEAD = "text-xs font-medium text-slate-500"

/**
 * Where Sarah's work stands. Ally does the work as soon as the plan or a call
 * creates it; Sarah reviews it and sends it. One map holds both: review items
 * "done" (sent) or "dismissed" (held), Ally's own changes "dismissed" (undone).
 */
export function useWork() {
  const { callItems, setCallItem, runs } = useNudge()
  const sent = (id: string) => callItems[id] === "done"
  const held = (id: string) => callItems[id] === "dismissed"
  const undone = (id: string) => callItems[id] === "dismissed"
  const waiting = REVIEW_ITEMS.filter((r) => !callItems[r.id])
  // The plan as Ally left it after the call (unless Sarah undid a change), then Sarah's own edits on top.
  const plan = PLAN.map((g) => ({ ...g, items: g.items.map((i) => (i.id === "jbp-wbr" && !undone("did-plan-wbr") ? { ...i, ...WBR_EDIT } : i)) }))
  const added = [...(undone("did-plan-walmart") ? [] : [WALMART_PACING]), ...runs.added.filter((x) => x.plan && x.id !== WALMART_PACING.id)]
  return { sent, held, undone, waiting, plan, added, setCallItem, anySent: REVIEW_ITEMS.some((r) => sent(r.id)) }
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
          <span className={cn("size-1.5 rounded-full", a.tone === "late" ? "bg-error-500" : a.tone === "due" ? "bg-warning-500" : "bg-success-500")} />
          {a.name}
          <span className={cn("font-normal", a.tone === "late" ? "text-error-600" : "text-slate-500")}>· {a.name === ACCOUNT.name ? (waiting.length ? `${waiting.length} ready for review` : "All delivered") : a.status}</span>
        </span>
      ))}
    </div>
  )
}

/** The headline: what's ready for her, and what the customer expects today. */
export function SarahHero() {
  const { waiting } = useWork()
  const today = waiting.filter((r) => r.dueIn === 0).length
  return (
    <div className="flex flex-col gap-4 px-10 pt-2 pb-6 md:grid md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-8">
      <div className="min-w-0">
        <div className="text-2xl font-semibold tracking-tight text-slate-700">Ally did the work from the plan and the {LAST_CALL.short} call.</div>
        <h1 className="mt-1 text-[28px] leading-tight font-bold tracking-tight text-slate-950">
          {waiting.length > 0 ? `${waiting.length} ready for your review.` : `Everything is delivered to ${ACCOUNT.name}.`}
        </h1>
        {today > 0 && <div className="mt-2 text-lg font-semibold text-warning-700">{today} due to Claire today</div>}
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

/** Finished work, due soonest first. Each opens to the work, the note to the customer, and Send. */
export function ReviewQueue() {
  const { sent, held, setCallItem } = useWork()
  const [open, setOpen] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const rank = (r: ReviewItem) => (sent(r.id) || held(r.id) ? 100 : 0) + r.dueIn
  const items = [...REVIEW_ITEMS].sort((a, b) => rank(a) - rank(b))
  function send(r: ReviewItem) {
    setCallItem(r.id, "done")
    setOpen(null)
    toast.success(`Sent to ${r.to.map((t) => t.split(" ")[0]).join(", ")} · ${r.title}`, { position: "top-right" })
  }
  return (
    <section className="px-10 pt-8 pb-6">
      <h2 className="text-xl font-semibold tracking-tight text-slate-950">Ready for your review</h2>
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
        <div className="grid grid-cols-[16px_minmax(0,1fr)_auto] lg:grid-cols-[16px_minmax(0,1fr)_minmax(0,220px)_120px_200px] items-center gap-4 border-b border-slate-100 bg-slate-25 px-6 py-2.5">
          <span />
          <span className={HEAD}>Work</span>
          <span className={`${HEAD} hidden lg:block`}>From</span>
          <span className={`${HEAD} hidden lg:block`}>Due to customer</span>
          <span />
        </div>
        {items.map((r) => {
          const isOpen = open === r.id
          const done = sent(r.id)
          const ask = ASKS.find((a) => a.id === r.ask)
          return (
            <div key={r.id} className={cn("border-t border-slate-100 first:border-t-0", (done || held(r.id)) && "bg-slate-25")}>
              <div className="grid grid-cols-[16px_minmax(0,1fr)_auto] lg:grid-cols-[16px_minmax(0,1fr)_minmax(0,220px)_120px_200px] items-center gap-4 px-6 py-4">
                <button type="button" aria-label={isOpen ? "Close" : "Open"} onClick={() => setOpen(isOpen ? null : r.id)} className="text-slate-400 hover:text-slate-700">
                  <ChevronRight className={cn("size-4 transition-transform", isOpen && "rotate-90")} />
                </button>
                <button type="button" onClick={() => setOpen(isOpen ? null : r.id)} className="min-w-0 text-left">
                  <span className={cn("block text-[15px] font-semibold", done ? "text-slate-500" : "text-slate-950")}>{r.title}</span>
                  <span className="block truncate text-[13px] text-slate-500">{r.did[0]}</span>
                  {!done && <span className={cn("block text-[13px] font-medium lg:hidden", r.dueIn === 0 ? "text-warning-700" : "text-slate-700")}>Due {r.due.toLowerCase() === "today" ? "today" : r.due}</span>}
                </button>
                <span className="hidden min-w-0 text-[13px] text-slate-700 lg:block">
                  {ask ? (
                    <span className="inline-flex items-center gap-1">
                      <Mic className="size-3.5 shrink-0 text-slate-400" /> {ask.who.split(" ")[0]} on the call, {ask.at}
                    </span>
                  ) : (
                    r.source
                  )}
                </span>
                <span className={cn("hidden text-[13px] font-medium lg:block", done ? "text-slate-500" : r.dueIn === 0 ? "text-warning-700" : "text-slate-700")}>{done ? "Sent" : r.due}</span>
                <span className="flex justify-end">
                  {done ? (
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success-700">
                      <Check className="size-4" /> Sent to {r.to[0].split(" ")[0]}
                      {r.to.length > 1 ? ` +${r.to.length - 1}` : ""}
                    </span>
                  ) : held(r.id) ? (
                    <button type="button" onClick={() => setOpen(r.id)} className="text-sm text-slate-500 hover:text-slate-800">
                      Held · review
                    </button>
                  ) : (
                    <button type="button" onClick={() => setOpen(isOpen ? null : r.id)} className={cn(PRIMARY, "lg:w-[180px]")}>
                      Review and send
                    </button>
                  )}
                </span>
              </div>
              {isOpen && (
                <div className="mx-4 mb-4 grid lg:mr-6 lg:ml-[52px] gap-5 rounded-lg border border-slate-200 bg-white px-5 py-4 md:grid-cols-2">
                  <div className="min-w-0">
                    <div className={HEAD}>What Ally did</div>
                    <ul className="mt-2 flex flex-col gap-1.5 text-sm text-slate-700">
                      {r.did.map((d) => (
                        <li key={d} className="flex gap-2">
                          <Check className="mt-0.5 size-4 shrink-0 text-success-600" />
                          {d}
                        </li>
                      ))}
                    </ul>
                    {ask && (
                      <blockquote className="mt-3 border-l-2 border-slate-200 pl-3 text-[13px] text-slate-500">
                        &ldquo;{ask.quote}&rdquo; · {ask.who.split(" ")[0]}, {LAST_CALL.short} call, {ask.at}
                      </blockquote>
                    )}
                    <Link href={r.open.href} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
                      {r.open.label} <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                  <div className="min-w-0">
                    <div className={HEAD}>To {r.to.join(", ")}</div>
                    <textarea
                      value={notes[r.id] ?? r.note}
                      onChange={(e) => setNotes((n) => ({ ...n, [r.id]: e.target.value }))}
                      disabled={done}
                      rows={5}
                      className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100 disabled:bg-slate-25 disabled:text-slate-500"
                    />
                    {!done && (
                      <div className="mt-2 flex items-center gap-4">
                        <button type="button" onClick={() => send(r)} className={PRIMARY}>
                          Send
                        </button>
                        {!held(r.id) && (
                          <button
                            type="button"
                            onClick={() => {
                              setCallItem(r.id, "dismissed")
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
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

/** What Ally changed on its own from the call, and what went to the customer on autopilot. */
export function AllyDid() {
  const { undone, setCallItem } = useWork()
  const { knowledge, saveKnowledge } = useNudge()
  const undo = (id: string) => {
    setCallItem(id, "dismissed")
    // The margin floor lives in Knowledge: undoing it takes it out.
    if (id === "did-margin") saveKnowledge(knowledge.filter((k) => k.id !== "kn-margin"))
  }
  return (
    <section className="grid gap-6 px-10 pb-6 md:grid-cols-2">
      <div className="rounded-xl border border-slate-200 px-6 py-4">
        <div className="text-[15px] font-semibold text-slate-950">Ally changed from the {LAST_CALL.short} call</div>
        <ul className="mt-3 flex flex-col gap-2 text-sm">
          {ALLY_DID.map((x) => (
            <li key={x.id} className="flex items-baseline justify-between gap-4">
              <span className={undone(x.id) ? "text-slate-400 line-through" : "text-slate-700"}>{x.text}</span>
              {undone(x.id) ? (
                <span className="shrink-0 text-[13px] text-slate-500">Undone</span>
              ) : (
                <button type="button" onClick={() => undo(x.id)} className="shrink-0 text-[13px] font-medium text-brand-700 hover:underline">
                  Undo
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-xl border border-slate-200 px-6 py-4">
        <div className="text-[15px] font-semibold text-slate-950">Sent on autopilot this week</div>
        <ul className="mt-3 flex flex-col gap-2 text-sm">
          {AUTOSENT.map((x) => (
            <li key={x.name} className="flex items-baseline justify-between gap-4">
              <span className="text-slate-700">{x.name}</span>
              <span className="shrink-0 text-[13px] text-slate-500">{x.when}</span>
            </li>
          ))}
        </ul>
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
  "jbp-visibility": { label: "Open the readout", href: "/ai-tracking" },
  "jbp-value": { label: "Open the value report", href: "/content-results?period=qtd" },
  "jbp-qbr": { label: "Open the QBR", href: "/michelle/decks/qbr?view=deck" },
}

/** The joint plan: one list per cadence, then what calls added. "What Ally does" is the rule: send it, or draft it for Sarah. */
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
    <section className="flex flex-col gap-5 px-10 pt-4 pb-10">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight text-slate-950">Joint plan with {ACCOUNT.name}</h2>
        <Link href="/plan" className="text-sm font-medium text-brand-700 hover:underline">
          What Claire sees
        </Link>
      </div>
      {plan.map((g) => (
        <RunList key={g.title} title={g.title} items={g.items} kind="scheduled" placeholder="Send a Target content report every Friday" whatLabel="Deliverable" lastLabel="Last sent or next" builtInLabel="in the contract" author={SARAH.name} planned extra={extra} />
      ))}
      <RunList title="Added from calls" items={added} kind="scheduled" placeholder="Send a Target content report every Friday" whatLabel="Deliverable" lastLabel="Last sent or next" builtInLabel="in the contract" author={SARAH.name} planned extra={extra} />
    </section>
  )
}

/** Claire's view: what Sarah delivered, what changed and why, then the plan, read-only. */
function PlanTable({ customer }: { customer?: boolean }) {
  const { runs } = useNudge()
  const { plan, added, sent, undone, anySent } = useWork()
  const groups = [...plan, ...(added.length ? [{ title: "Added from calls", items: added }] : [])]
  const delivered = REVIEW_ITEMS.filter((r) => sent(r.id))
  // Plan changes reach the customer with the first thing Sarah sends.
  const changes = anySent ? ALLY_DID.filter((x) => x.id.startsWith("did-plan") && !undone(x.id)) : []
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 rounded-xl border border-slate-200 bg-slate-25 px-6 py-4 md:grid-cols-2">
        <div>
          <div className={HEAD}>Delivered this week</div>
          <ul className="mt-2 flex flex-col gap-1 text-sm text-slate-700">
            {AUTOSENT.map((x) => (
              <li key={x.name}>
                <span className="font-medium text-slate-950">{x.name}</span> · {x.when}
              </li>
            ))}
            {delivered.map((r) => (
              <li key={r.id}>
                <span className="font-medium text-slate-950">{r.title}</span> · from {SARAH.first}
              </li>
            ))}
          </ul>
        </div>
        {changes.length > 0 && (
          <div>
            <div className={HEAD}>What changed</div>
            <ul className="mt-2 flex flex-col gap-1 text-sm text-slate-700">
              {changes.map((c) => {
                const ask = ASKS.find((a) => a.id === c.ask)!
                return (
                  <li key={c.id}>
                    <span className="font-medium text-slate-950">{ask.title}</span> · from our {LAST_CALL.short} call · {customer && ask.who === ACCOUNT.contact ? "you asked" : `${ask.who.split(" ")[0]} asked`}
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
      {groups.map((g) => (
        <section key={g.title} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-6 py-3.5 text-[15px] font-semibold text-slate-950">{g.title}</div>
          <div className="grid grid-cols-[minmax(0,1fr)_200px_200px] gap-4 px-6 pt-3 pb-1 text-xs font-medium text-slate-500">
            <span>Deliverable</span>
            <span>When</span>
            <span>Last sent or next</span>
          </div>
          <div className="px-6 pb-2">
            {g.items
              .map((i) => ({ ...i, ...runs.edits[i.id] }))
              .filter((i) => !runs.removed.includes(i.id))
              .map((i) => (
                <div key={i.id} className="grid grid-cols-[minmax(0,1fr)_200px_200px] items-baseline gap-4 border-t border-slate-100 py-3 text-sm first:border-t-0">
                  <span className="min-w-0">
                    <span className="block font-medium text-slate-950">{i.name}</span>
                    <span className="block text-[13px] text-slate-500">{i.what}</span>
                  </span>
                  <span className="text-slate-700">{i.runs}</span>
                  <span className="text-[13px] text-slate-500">{i.id === "jbp-wbr" && sent("rev-wbr") ? "Sent today" : i.last}</span>
                </div>
              ))}
          </div>
        </section>
      ))}
    </div>
  )
}
