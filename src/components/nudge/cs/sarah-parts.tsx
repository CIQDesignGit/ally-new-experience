"use client"

import Link from "next/link"
import { ArrowRight, CalendarDays, Check, Mic } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { TopStrip } from "../top-strip"
import { useNudge } from "../nudge-context"
import { PRIMARY } from "../mike/buttons"
import { RunList } from "../runs/run-list"
import type { RunItem } from "../runs/data"
import { ACCOUNT, CALL_ITEMS, KIND_LABEL, LAST_CALL, MARGIN_RULE, NEXT_MEETING, PLAN, PORTFOLIO, PROMO_ALERT, SARAH, WALMART_PACING, WBR_EDIT } from "./data"
import type { CallItem } from "./data"

const HEAD = "text-xs font-medium text-slate-500"

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
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-1 border-y border-slate-200 bg-slate-25 px-10 py-3 text-sm">
      <span className="text-slate-500">{PORTFOLIO.length} accounts</span>
      {PORTFOLIO.map((a) => (
        <span key={a.name} className={cn("inline-flex items-center gap-1.5", a.name === ACCOUNT.name ? "font-semibold text-slate-950" : "text-slate-700")}>
          <span className={cn("size-1.5 rounded-full", a.tone === "late" ? "bg-error-500" : a.tone === "due" ? "bg-warning-500" : "bg-success-500")} />
          {a.name}
          <span className={cn("font-normal", a.tone === "late" ? "text-error-600" : "text-slate-500")}>· {a.status}</span>
        </span>
      ))}
    </div>
  )
}

/** The headline: the next meeting, and what's waiting before it. */
export function SarahHero() {
  const { callItems } = useNudge()
  const open = CALL_ITEMS.filter((c) => !callItems[c.id]).length
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-8 px-10 pt-2 pb-6">
      <div className="min-w-0">
        <div className="text-2xl font-semibold tracking-tight text-slate-700">
          Your {ACCOUNT.name} session is {NEXT_MEETING.when.replace(" · ", " at ")}.
        </div>
        <h1 className="mt-1 text-[28px] leading-tight font-bold tracking-tight text-slate-950">
          {open > 0 ? `${open} ${open === 1 ? "item" : "items"} from the ${LAST_CALL.short} call ${open === 1 ? "is" : "are"} waiting for you.` : `Everything from the ${LAST_CALL.short} call is done.`}
        </h1>
        <div className="mt-2 text-lg font-semibold text-warning-700">WBR deck due today</div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <Link href="/sarah/prep" className={PRIMARY}>
          Open meeting prep
        </Link>
        <span className="inline-flex items-center gap-1.5 text-[13px] text-slate-500">
          <CalendarDays className="size-3.5" /> From {NEXT_MEETING.source}
        </span>
      </div>
    </div>
  )
}

/** What accepting an item does: to the plan, Knowledge, an alert, or the agents' queues. */
function useAccept() {
  const { setRuns, setCallItem, knowledge, saveKnowledge } = useNudge()
  return (c: CallItem) => {
    if (c.id === "call-walmart") setRuns((r) => ({ ...r, added: [WALMART_PACING, ...r.added.filter((x) => x.id !== WALMART_PACING.id)] }))
    if (c.id === "call-wbr") setRuns((r) => ({ ...r, edits: { ...r.edits, "jbp-wbr": { ...r.edits["jbp-wbr"], ...WBR_EDIT } } }))
    if (c.id === "call-promo") setRuns((r) => ({ ...r, added: [PROMO_ALERT, ...r.added.filter((x) => x.id !== PROMO_ALERT.id)] }))
    if (c.id === "call-margin" && !knowledge.some((k) => k.id === "kn-margin"))
      saveKnowledge([{ id: "kn-margin", text: MARGIN_RULE, retailer: "All retailers", brands: [], skuGroups: [], author: SARAH.name, date: "Oct 5", source: `from the ${LAST_CALL.short} call with Claire` }, ...knowledge])
    setCallItem(c.id, "done")
    toast.success(c.done, { position: "top-right" })
  }
}

/** The call's items, in the order they matter: work first, then plan changes, then context. */
export function CallInbox() {
  const { callItems, setCallItem } = useNudge()
  const accept = useAccept()
  const rank = (c: CallItem) => (callItems[c.id] ? 1 : 0) * 10 + ({ work: 0, add: 1, change: 2, context: 3 } as const)[c.kind]
  const items = [...CALL_ITEMS].sort((a, b) => rank(a) - rank(b))
  return (
    <section className="px-10 pt-8 pb-6">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight text-slate-950">
          From the {LAST_CALL.short} call <span className="ml-1 font-mono text-[15px] font-medium text-slate-400">{CALL_ITEMS.length}</span>
        </h2>
        <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
          <Mic className="size-3.5" /> {LAST_CALL.title} · {LAST_CALL.length} · from {LAST_CALL.source}
        </span>
      </div>
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
        {items.map((c) => {
          const state = callItems[c.id]
          return (
            <div key={c.id} className={cn("grid grid-cols-[minmax(0,1fr)_200px] gap-6 border-t border-slate-100 px-6 py-4 first:border-t-0", state && "bg-slate-25")}>
              <div className="min-w-0">
                <div className="text-xs font-medium text-slate-500">{KIND_LABEL[c.kind]}</div>
                <div className={cn("mt-0.5 text-[15px] font-semibold", state ? "text-slate-500" : "text-slate-950")}>{c.title}</div>
                <blockquote className="mt-1.5 border-l-2 border-slate-200 pl-3 text-sm text-slate-700">
                  &ldquo;{c.quote}&rdquo; <span className="text-slate-500">· {c.who.split(" ")[0]}, {c.at}</span>
                </blockquote>
                {!state && (
                  <ul className="mt-2 flex flex-col gap-0.5 text-sm text-slate-700">
                    {c.will.map((w) => (
                      <li key={w} className="flex gap-2">
                        <span className="mt-2 size-1 shrink-0 rounded-full bg-slate-400" />
                        {w}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex flex-col items-end justify-center gap-1.5">
                {state === "done" ? (
                  <span className="inline-flex items-center gap-1.5 text-right text-sm font-medium text-success-700">
                    <Check className="size-4 shrink-0" /> {c.done}
                  </span>
                ) : state === "dismissed" ? (
                  <span className="text-sm text-slate-500">Set aside</span>
                ) : (
                  <>
                    <button type="button" onClick={() => accept(c)} className={cn(PRIMARY, "w-[180px]")}>
                      {c.cta}
                    </button>
                    <button type="button" onClick={() => setCallItem(c.id, "dismissed")} className="text-[13px] font-medium text-slate-500 hover:text-slate-800">
                      Not now
                    </button>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

/** What each plan item opens: its latest version, where it lives. */
const LATEST: Record<string, { label: string; href: string }> = {
  "jbp-wbr": { label: "Open this week's WBR", href: "/sarah/decks/weekly" },
  "jbp-pacing": { label: "Open pacing", href: "/james?from=sarah" },
  "jbp-actions": { label: "Open the actions", href: "/james?from=sarah" },
  "jbp-walmart-pacing": { label: "Open pacing", href: "/james?from=sarah" },
  "jbp-shipped": { label: "Open what shipped", href: "/content-results?period=qtd" },
  "jbp-session": { label: "Open meeting prep", href: "/sarah/prep" },
  "jbp-visibility": { label: "Open the readout", href: "/ai-tracking" },
  "jbp-value": { label: "Open the value report", href: "/content-results?period=qtd" },
  "jbp-qbr": { label: "Open the QBR", href: "/michelle/decks/qbr?view=deck" },
}

/** The joint plan: one list per cadence, then what calls and Sarah added. Built on the same list as Scheduled. */
export function JointPlan({ readOnly, customer }: { readOnly?: boolean; /** Read by the customer: "you asked", not their name. */ customer?: boolean }) {
  const { runs } = useNudge()
  const added = runs.added.filter((x) => x.plan)
  const extra = (i: RunItem) => {
    const l = LATEST[i.id]
    return l ? (
      <Link href={l.href} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
        {l.label} <ArrowRight className="size-3.5" />
      </Link>
    ) : null
  }
  if (readOnly) return <PlanTable added={added} customer={customer} />
  return (
    <section className="flex flex-col gap-5 px-10 pt-4 pb-10">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight text-slate-950">Joint plan with {ACCOUNT.name}</h2>
        <Link href="/plan" className="text-sm font-medium text-brand-700 hover:underline">
          What Claire sees
        </Link>
      </div>
      {PLAN.map((g) => (
        <RunList key={g.title} title={g.title} items={g.items} kind="scheduled" placeholder="Send a Target content report every Friday" whatLabel="Deliverable" lastLabel="Last sent or next" builtInLabel="in the contract" author={SARAH.name} planned extra={extra} />
      ))}
      <RunList title="Added from calls" items={added} kind="scheduled" placeholder="Send a Target content report every Friday" whatLabel="Deliverable" lastLabel="Last sent or next" builtInLabel="in the contract" author={SARAH.name} planned extra={extra} />
    </section>
  )
}

/** Claire's view: the same plan, read-only, with what changed and why. */
function PlanTable({ added, customer }: { added: RunItem[]; customer?: boolean }) {
  const { runs, callItems } = useNudge()
  const groups = [...PLAN, ...(added.length ? [{ title: "Added from calls", items: added }] : [])]
  const changes = CALL_ITEMS.filter((c) => callItems[c.id] === "done" && (c.kind === "add" || c.kind === "change"))
  return (
    <div className="flex flex-col gap-6">
      {changes.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-25 px-6 py-4">
          <div className={HEAD}>What changed</div>
          <ul className="mt-2 flex flex-col gap-1 text-sm text-slate-700">
            {changes.map((c) => (
              <li key={c.id}>
                <span className="font-medium text-slate-950">{c.title}</span> · from our {LAST_CALL.short} call · {customer && c.who === ACCOUNT.contact ? "you asked" : `${c.who.split(" ")[0]} asked`}
              </li>
            ))}
          </ul>
        </div>
      )}
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
                  <span className={cn("text-[13px]", /due today|late/i.test(i.last ?? "") ? "font-medium text-warning-700" : "text-slate-500")}>{i.last}</span>
                </div>
              ))}
          </div>
        </section>
      ))}
    </div>
  )
}
