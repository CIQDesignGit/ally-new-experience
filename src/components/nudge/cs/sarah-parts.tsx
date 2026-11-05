"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { TopStrip } from "../top-strip"
import { useNudge } from "../nudge-context"
import { RunList } from "../runs/run-list"
import type { RunItem } from "../runs/data"
import { ACCOUNT, ASKS, INBOX, LAST_CALL, PLAN, PLAN_DOES, SARAH, SARAH_NOW, WALMART_PACING, WBR_EDIT } from "./data"
import type { InboxItem } from "./data"
import { useMvp } from "../mvp"
import { VISION_ONLY_PAGES } from "../data"

const HEAD = "text-xs font-medium text-slate-500"

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
          {SARAH_NOW.label}
        </span>
      }
    />
  )
}

/** The work itself, shown where she reviews it. */
export function Artifact({ item }: { item: InboxItem }) {
  const a = item.artifact
  if (!a || a.kind === "call") return null
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

/** What each plan item opens: its latest version, where it lives. */
const LATEST: Record<string, { label: string; href: string }> = {
  "jbp-wbr": { label: "Open this week's WBR", href: "/sarah/decks/weekly" },
  "jbp-pacing": { label: "Open pacing", href: "/james?from=sarah" },
  "jbp-actions": { label: "Open the actions", href: "/james?from=sarah" },
  "jbp-walmart-pacing": { label: "Open Walmart pacing", href: "/claire-waterfall" },
  "jbp-shipped": { label: "Open what shipped", href: "/content-results?period=qtd" },
  "jbp-session": { label: "Open meeting prep", href: "/sarah/prep" },
  "jbp-visibility": { label: "Open the readout", href: "/dashboards/ai-visibility" },
  "jbp-value": { label: "Open the value report", href: "/content-results?period=qtd" },
  "jbp-qbr": { label: "Open the QBR", href: "/michelle/decks/qbr?view=deck" },
}

/**
 * What each plan item opens for the customer: the page or dashboard where it
 * lives on their side. Items with no customer page (the session, Sarah's
 * workspace decks) stay plain text.
 */
const CUSTOMER_OPEN: Record<string, string> = {
  "jbp-wbr": "/dashboards/wbr",
  "jbp-pacing": "/james",
  "jbp-actions": "/james",
  "jbp-shipped": "/content-results?period=qtd",
  "jbp-value": "/content-results?period=qtd",
  "jbp-visibility": "/dashboards/ai-visibility",
  "jbp-competitors": "/michelle/dashboards/competition",
  "jbp-qbr": "/michelle/decks/qbr?view=deck",
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
        <RunList key={g.title} title={g.title} items={g.items} kind="scheduled" placeholder="Send a Target content report every Friday" whatLabel="Deliverable" lastLabel="Last sent or next" builtInLabel="" author={SARAH.name} planned extra={extra} doesLabel={PLAN_DOES} doesHeader="Review" />
      ))}
      <RunList title="Added from calls" items={added} kind="scheduled" placeholder="Send a Target content report every Friday" whatLabel="Deliverable" lastLabel="Last sent or next" builtInLabel="" author={SARAH.name} planned extra={extra} doesLabel={PLAN_DOES} doesHeader="Review" />
    </div>
  )
}

/** Claire's view: what changed and why, then the plan, read-only. */
function PlanTable({ customer }: { customer?: boolean }) {
  const { runs } = useNudge()
  const { plan, added, planChanged } = useWork()
  // A page that isn't in this version (the MVP has no media page) leaves the item as plain text.
  const mvp = useMvp()
  const openFor = (id: string) => {
    const href = CUSTOMER_OPEN[id]
    return href && !(mvp && VISION_ONLY_PAGES.some((p) => href.startsWith(p))) ? href : undefined
  }
  const groups = [...plan, ...(added.length ? [{ title: "Added from calls", items: added }] : [])]
  const changes = planChanged ? ASKS.filter((a) => a.answeredBy === "a-plan") : []
  return (
    <div className="flex flex-col gap-6">
      {changes.length > 0 && (
        <div className="rounded-2xl bg-white px-6 py-4 shadow-xs ring-1 ring-slate-200">
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
        <section key={g.title} className="overflow-hidden rounded-2xl bg-white shadow-xs ring-1 ring-slate-200">
          <div className="border-b border-slate-100 px-6 py-3.5 text-[15px] font-semibold text-slate-950">{g.title}</div>
          <div className="grid grid-cols-[minmax(0,1fr)_170px_170px_170px] gap-4 px-6 pt-3 pb-1 text-xs font-medium text-slate-500">
            <span>Deliverable</span>
            <span>When</span>
            <span>Review</span>
            <span>Last sent or next</span>
          </div>
          <div className="px-6 pb-2">
            {g.items
              .map((i) => ({ ...i, ...runs.edits[i.id] }))
              .filter((i) => !runs.removed.includes(i.id))
              .map((i) => (
                <div key={i.id} className="grid grid-cols-[minmax(0,1fr)_170px_170px_170px] items-baseline gap-4 border-t border-slate-100 py-3 text-sm first:border-t-0">
                  <span className="min-w-0">
                    {openFor(i.id) ? (
                      <Link href={openFor(i.id)!} className="inline-flex items-center gap-1 font-medium text-brand-700 hover:underline">
                        {i.name} <ArrowRight className="size-3.5" />
                      </Link>
                    ) : (
                      <span className="block font-medium text-slate-950">{i.name}</span>
                    )}
                    <span className="block text-[13px] text-slate-500">{i.what}</span>
                  </span>
                  <span className="text-slate-700">{i.runs}</span>
                  <span className="text-slate-700">{PLAN_DOES[i.does] ?? "Sarah reviews first"}</span>
                  <span className="text-[13px] text-slate-500">{i.last}</span>
                </div>
              ))}
          </div>
        </section>
      ))}
    </div>
  )
}
