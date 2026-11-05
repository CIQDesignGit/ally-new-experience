"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { WIDGET_INSET } from "@/components/layout/page-frame"
import { Fig } from "@/components/layout/page-header"
import { useNudge } from "../nudge-context"
import { useMvp } from "../mvp"
import { VISION_ONLY_PAGES } from "../data"
import type { RunItem } from "../runs/data"
import { useWork } from "./sarah-parts"
import { ACCOUNT, ASKS, LAST_CALL, PLAN_DOES, SARAH } from "./data"

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

/** Blue for autopilot, the same meaning it carries on every page; neutral for Sarah's review. */
function Dot({ auto }: { auto?: boolean }) {
  return <span className={cn("size-2 shrink-0 rounded-full", auto ? "bg-autopilot" : "bg-slate-300")} aria-hidden />
}

const COLS = "@3xl:grid-cols-[minmax(0,1fr)_160px_160px_170px]"

/** The plan as it stands: each cadence with Sarah's edits applied and removed items dropped. */
function usePlanGroups() {
  const { runs } = useNudge()
  const { plan, added } = useWork()
  return [...plan, ...(added.length ? [{ title: "Added from calls", items: added }] : [])].map((g) => ({
    title: g.title,
    items: g.items.map((i) => ({ ...i, ...runs.edits[i.id] })).filter((i) => !runs.removed.includes(i.id)),
  }))
}

/** The headline facts: how much the plan covers, and how much runs without anyone touching it. */
export function PlanSignals() {
  const items = usePlanGroups().flatMap((g) => g.items)
  const auto = items.filter((i) => i.does === "act").length
  return (
    <>
      <span className="text-slate-700"><Fig>{items.length}</Fig> deliverables</span>
      <span className="inline-flex items-center gap-2 text-slate-700"><Dot auto /><span><Fig>{auto}</Fig> on autopilot</span></span>
      <span className="inline-flex items-center gap-2 text-slate-700"><Dot /><span><Fig>{items.length - auto}</Fig> reviewed by {SARAH.first} first</span></span>
    </>
  )
}

/** The customer's view: what changed and why, then the plan, read-only. */
export function PlanTable({ customer }: { /** Read by the customer: "you asked", not their name. */ customer?: boolean }) {
  const { planChanged } = useWork()
  const groups = usePlanGroups()
  const mvp = useMvp()
  // A page that isn't in this version (the MVP has no media page) leaves the item as plain text.
  const openFor = (id: string) => {
    const href = CUSTOMER_OPEN[id]
    return href && !(mvp && VISION_ONLY_PAGES.some((p) => href.startsWith(p))) ? href : undefined
  }
  const changes = planChanged ? ASKS.filter((a) => a.answeredBy === "a-plan") : []
  return (
    <div className="flex flex-col gap-8">
      {changes.length > 0 && (
        <section className={cn("rounded-2xl bg-white py-5 shadow-xs ring-1 ring-slate-200", WIDGET_INSET)}>
          <h2 className="text-base font-semibold text-slate-950">
            {changes.length} {changes.length === 1 ? "change" : "changes"} from our {LAST_CALL.short} call
          </h2>
          <ul className="mt-3 flex flex-col">
            {changes.map((a) => (
              <li key={a.id} className="flex items-baseline justify-between gap-4 border-t border-slate-100 py-2.5 text-sm first:border-t-0">
                <span className="font-medium text-slate-950">{a.title}</span>
                <span className="shrink-0 text-slate-500">{customer && a.who === ACCOUNT.contact ? "You asked" : `${a.who.split(" ")[0]} asked`}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      {groups.map((g) => (
        <section key={g.title} className="@container overflow-hidden rounded-2xl bg-white shadow-xs ring-1 ring-slate-200">
          <div className={cn("flex items-baseline gap-2 pt-5 pb-3", WIDGET_INSET)}>
            <h2 className="text-lg font-semibold text-slate-950">{g.title}</h2>
            <span className="text-sm text-slate-400 tabular-nums">{g.items.length}</span>
          </div>
          <div className={cn("hidden gap-4 border-y border-slate-100 bg-slate-25 py-2 text-xs font-medium text-slate-500 @3xl:grid", WIDGET_INSET, COLS)}>
            <span>Deliverable</span>
            <span>When</span>
            <span>Review</span>
            <span>Last sent or next</span>
          </div>
          <div className={cn("pb-1", WIDGET_INSET)}>
            {g.items.map((i) => (
              <PlanRow key={i.id} item={i} href={openFor(i.id)} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function PlanRow({ item: i, href }: { item: RunItem; href?: string }) {
  const sent = /sent/i.test(i.last ?? "")
  return (
    <div className={cn("grid items-baseline gap-x-4 gap-y-1 border-t border-slate-100 py-3.5 text-sm first:border-t-0", COLS)}>
      <span className="min-w-0">
        {href ? (
          <Link href={href} className="group inline-flex items-center gap-1 font-medium text-slate-950 hover:text-brand-700">
            {i.name} <ArrowRight className="size-3.5 text-slate-400 group-hover:text-brand-700" />
          </Link>
        ) : (
          <span className="block font-medium text-slate-950">{i.name}</span>
        )}
        <span className="mt-0.5 block text-[13px] text-slate-500">{i.what}</span>
      </span>
      <span className="flex flex-wrap items-baseline gap-x-5 gap-y-1 @3xl:contents">
        <span className="text-slate-700">{i.runs}</span>
        <span className="inline-flex items-center gap-2 text-slate-700">
          <Dot auto={i.does === "act"} />
          {PLAN_DOES[i.does] ?? "Sarah reviews first"}
        </span>
        <span className={cn("text-[13px]", sent ? "text-slate-500" : "font-medium text-slate-950")}>{i.last}</span>
      </span>
    </div>
  )
}
