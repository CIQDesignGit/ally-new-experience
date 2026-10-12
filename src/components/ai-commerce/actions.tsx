"use client"

import { useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { ACTIONS, BUCKETS } from "./data"
import type { Autonomy, BucketId } from "./data"

const CARD = "rounded-2xl bg-white ring-1 ring-slate-200"
const HEAD = "text-xs font-medium text-slate-500"

/** The three autonomy states, in the product's words and colors. */
const AUTONOMY: Record<Autonomy, { label: string; dot: string }> = {
  approval: { label: "One approval away", dot: "bg-ally-500" },
  input: { label: "Needs your input", dot: "bg-team" },
  autopilot: { label: "On autopilot", dot: "bg-autopilot" },
}

const rankActions = <T extends { deadline?: string; value: number }>(xs: T[]) => [...xs].sort((a, b) => Number(!!b.deadline) - Number(!!a.deadline) || b.value - a.value)

/**
 * What Ally will do, in five buckets: each shows its open value and opens to its
 * actions (one bucket or all). An action shows Ally's drafted work in place;
 * approving it marks it done and takes it out of the bucket's open value.
 */
export function ActionBuckets() {
  const [open, setOpen] = useState<BucketId[]>([])
  const [shown, setShown] = useState<string | null>(null)
  const [done, setDone] = useState<Record<string, boolean>>({})

  const openOf = (b: BucketId) => ACTIONS.filter((a) => a.bucket === b && !done[a.id])
  const total = ACTIONS.filter((a) => !done[a.id]).reduce((t, a) => t + a.value, 0)
  // Buckets ranked like every list: any deadline first, then open dollars.
  const buckets = [...BUCKETS].sort((a, b) => {
    const da = openOf(a.id).some((x) => x.deadline)
    const db = openOf(b.id).some((x) => x.deadline)
    const va = openOf(a.id).reduce((t, x) => t + x.value, 0)
    const vb = openOf(b.id).reduce((t, x) => t + x.value, 0)
    return Number(db) - Number(da) || vb - va
  })
  const toggle = (id: BucketId) => setOpen((o) => (o.includes(id) ? o.filter((x) => x !== id) : o.length === BUCKETS.length ? o : [id]))

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-xl font-semibold tracking-tight text-slate-950">
          What Ally will do <span className="ml-2 text-base font-medium text-slate-500 tabular-nums">+${total}K a week protected or added</span>
        </h3>
        <button type="button" onClick={() => setOpen(open.length === BUCKETS.length ? [] : BUCKETS.map((b) => b.id))} className="text-sm font-medium text-brand-700 hover:underline">
          {open.length === BUCKETS.length ? "Collapse all" : "Expand all"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {buckets.map((b) => {
          const items = openOf(b.id)
          const value = items.reduce((t, a) => t + a.value, 0)
          const soon = items.find((a) => a.deadline)?.deadline
          const isOpen = open.includes(b.id)
          const counts = (["approval", "input", "autopilot"] as Autonomy[]).map((k) => [k, items.filter((a) => a.autonomy === k).length] as const).filter(([, n]) => n > 0)
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => toggle(b.id)}
              aria-expanded={isOpen}
              className={cn(CARD, "flex flex-col gap-1 px-4 py-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-brand-300", isOpen ? "ring-2 ring-brand-500" : "hover:ring-slate-300")}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-[15px] font-semibold text-slate-950">{b.name}</span>
                <ChevronDown className={cn("size-4 text-slate-400 transition-transform", isOpen && "rotate-180")} />
              </span>
              <span className="text-xs text-slate-500">{b.does}</span>
              <span className="mt-2 font-mono text-2xl font-semibold text-slate-950 tabular-nums">
                {items.length ? `+$${value}K` : <Check className="size-6 text-success-600" />}
              </span>
              <span className="text-xs text-slate-500">{items.length ? `a week ${b.id === "ops" ? "protected" : "projected"} · ${items.length} ${items.length === 1 ? "action" : "actions"}` : "All done"}</span>
              {soon && <span className="text-xs font-medium text-warning-700">{soon}</span>}
              <span className="mt-2 flex flex-col gap-0.5 border-t border-slate-100 pt-2">
                {counts.map(([k, n]) => (
                  <span key={k} className="flex items-center gap-1.5 text-xs text-slate-700">
                    <span className={cn("size-1.5 rounded-full", AUTONOMY[k].dot)} />
                    {n} {AUTONOMY[k].label.toLowerCase()}
                  </span>
                ))}
              </span>
            </button>
          )
        })}
      </div>

      {buckets
        .filter((b) => open.includes(b.id))
        .map((b) => (
          <div key={b.id} className={cn(CARD, "overflow-hidden")}>
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 px-6 py-3">
              <span className="text-[15px] font-semibold text-slate-950">{b.name}</span>
              <span className="text-xs text-slate-500">Owner: {b.owner}</span>
            </div>
            {rankActions(ACTIONS.filter((a) => a.bucket === b.id)).map((a) => {
              const isDone = !!done[a.id]
              const isShown = shown === a.id
              return (
                <div key={a.id} className="border-b border-slate-100 last:border-b-0">
                  <div className="grid grid-cols-[minmax(0,1fr)_170px_110px_190px] items-center gap-4 px-6 py-3">
                    <div className="min-w-0">
                      <div className={cn("text-[15px]", isDone ? "text-slate-500" : "font-medium text-slate-950")}>{a.what}</div>
                      <div className="text-xs text-slate-500">{a.why}</div>
                      {a.deadline && !isDone && <div className="text-xs font-medium text-warning-700">{a.deadline}</div>}
                    </div>
                    <span className="flex items-center gap-1.5 text-xs text-slate-700">
                      <span className={cn("size-1.5 rounded-full", AUTONOMY[a.autonomy].dot)} />
                      {AUTONOMY[a.autonomy].label}
                    </span>
                    <span className="text-right">
                      <span className="block font-mono text-sm text-slate-950 tabular-nums">+${a.value}K/wk</span>
                      <span className="block text-xs text-slate-500">{a.kind === "protects" ? "protected" : "projected"}</span>
                    </span>
                    <span className="text-right">
                      {isDone ? (
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-success-700">
                          <Check className="size-4" /> {a.autonomy === "autopilot" ? "Held" : a.autonomy === "input" ? "Decided" : "Approved"}
                        </span>
                      ) : (
                        <button type="button" onClick={() => setShown(isShown ? null : a.id)} aria-expanded={isShown} className="text-sm font-medium text-brand-700 hover:underline">
                          {isShown ? "Close" : a.verb}
                        </button>
                      )}
                    </span>
                  </div>
                  {isShown && !isDone && (
                    <div className="mx-6 mb-4 rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
                      <div className={HEAD}>{a.draft.label}</div>
                      <ul className="mt-1.5 flex flex-col gap-1 text-sm text-slate-700">
                        {a.draft.lines.map((l) => (
                          <li key={l}>· {l}</li>
                        ))}
                      </ul>
                      <div className="mt-3 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setDone((d) => ({ ...d, [a.id]: true }))
                            setShown(null)
                          }}
                          className="h-9 rounded-lg bg-brand-500 px-4 text-sm font-semibold text-white hover:bg-brand-600"
                        >
                          {a.autonomy === "autopilot" ? "Hold" : a.autonomy === "input" ? "Confirm" : "Approve"}
                        </button>
                        <button type="button" onClick={() => setShown(null)} className="text-sm font-medium text-slate-500 hover:text-slate-800">
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            {b.note && <div className="border-t border-slate-100 px-6 py-2.5 text-xs text-slate-500">{b.note}</div>}
          </div>
        ))}
    </section>
  )
}
