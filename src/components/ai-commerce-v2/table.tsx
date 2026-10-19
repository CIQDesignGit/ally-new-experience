"use client"

import { useState } from "react"
import { Check, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { PRIMARY } from "@/components/nudge/mike/buttons"
import { AGENT_DOT } from "@/components/nudge/agent-style"
import { AGENT_LABEL } from "@/components/nudge/types"
import { INPUTS, META, OWNERS, SURFACES, TO_WIN, actionDemand, afterFix, creditedInput, leverOf, lostDemand, money, ownerOf, position, questionsOf, type Action, type Answer, type Done, type Owner, type Question, type SurfaceId } from "./data"
import { Exhibit } from "./exhibits"
import type { BridgeSelection } from "./bridge"

const GRID = "grid grid-cols-[minmax(0,1fr)_100px_204px] items-center gap-4"
const LEVERS_BY_OWNER: Owner["lever"][] = ["content", "ops", "media"]

export const verb = (a: Action) => (a.kind === "pause" ? "Pause the ad" : a.kind === "buy" ? "Buy the prompt" : a.autonomy === "autopilot" ? "Ship now and ask again" : a.autonomy === "input" ? "Confirm and ask again" : "Fix and ask again")
export const did = (a: Action) => (a.kind === "pause" ? "Paused" : a.kind === "buy" ? "Bought" : "Live · asked again")

/**
 * What to approve, at Claire's altitude: one row per owner, what's in it, the demand, one
 * approval. The chevron opens that person's actions, one line each; an action's chevron
 * opens its exhibit and the questions it wins.
 */
export function ActionsTable({ done, onFix, filter, onClear }: { done: Done; onFix: (id: string) => void; filter: BridgeSelection; onClear: () => void }) {
  const [open, setOpen] = useState<string | null>(null)
  const [shown, setShown] = useState<string | null>(null)
  const rows = TO_WIN.filter((a) => filter === "all" || creditedInput(a) === filter)
  const value = rows.filter((a) => !done[a.id]).reduce((t, a) => t + actionDemand(a), 0)
  const input = INPUTS.find((i) => i.id === filter)
  const groups = LEVERS_BY_OWNER.map((lever) => ({ lever, as: rows.filter((a) => ownerOf(a).lever === lever) })).filter((g) => g.as.length)

  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
      <div className={cn(GRID, "border-b border-slate-100 bg-slate-25 px-6 py-4")}>
        <span className="flex items-baseline gap-3">
          <span className="text-lg font-semibold text-slate-950">{input ? `${input.name}: what to approve` : "What to approve"}</span>
          {input && (
            <button type="button" onClick={onClear} className="text-[13px] font-medium text-brand-700 hover:underline">
              All
            </button>
          )}
        </span>
        <span className="text-right font-mono text-[15px] font-bold text-slate-950 tabular-nums">{money(value)}</span>
        <span />
      </div>
      <div className={cn(GRID, "px-6 pt-3 pb-1 text-xs font-medium text-slate-500")}>
        <div className="grid grid-cols-[20px_168px_minmax(0,1fr)] gap-4">
          <span />
          <span>Owner</span>
          <span>Actions</span>
        </div>
        <span className="text-right">Demand</span>
        <span />
      </div>
      <div className="px-6 pb-1.5">
        {groups.map(({ lever, as }) => {
          const o = OWNERS[lever]
          const openAs = as.filter((a) => !done[a.id])
          const isOpen = open === lever
          return (
            <div key={lever} className="border-t border-slate-100 first:border-t-0">
              <div className={cn(GRID, "py-3.5")}>
                <div className="grid grid-cols-[20px_168px_minmax(0,1fr)] items-center gap-4">
                  <button type="button" onClick={() => setOpen(isOpen ? null : lever)} aria-label={isOpen ? "Hide the actions" : "Show the actions"} className="text-slate-400 hover:text-slate-700">
                    <ChevronRight className={cn("size-4 transition-transform", isOpen && "rotate-90")} />
                  </button>
                  <div className="flex items-center gap-2.5 text-sm text-slate-950">
                    <span className={`size-2 rounded-sm ${AGENT_DOT[lever]}`} />
                    <span className="font-medium">{o.name}</span> <span className="text-slate-500">{AGENT_LABEL[lever]}</span>
                  </div>
                  <p className="truncate text-sm leading-5 text-slate-600">
                    <span className="font-medium text-slate-950">
                      {as.length} {as.length === 1 ? "action" : "actions"}
                    </span>
                    <span className="text-slate-400"> · </span>
                    {as.map((a) => a.tag).join(", ")}
                  </p>
                </div>
                <div className="text-right font-mono text-[15px] leading-5 font-semibold text-slate-950 tabular-nums">{money(as.reduce((t, a) => t + actionDemand(a), 0))}</div>
                <div className="flex justify-end">
                  {openAs.length === 0 ? (
                    <span className="inline-flex h-10 w-[180px] items-center justify-center gap-1.5 text-sm font-medium whitespace-nowrap text-success-700">
                      <Check className="size-4" /> {as.length === 1 ? did(as[0]) : "Live · asked again"}
                    </span>
                  ) : (
                    <button type="button" onClick={() => openAs.forEach((a) => onFix(a.id))} className={cn(PRIMARY, "w-[180px]")}>
                      {openAs.length === 1 ? verb(openAs[0]) : `Approve all ${openAs.length}`}
                    </button>
                  )}
                </div>
              </div>

              {isOpen && (
                <div className="mb-3 ml-9 overflow-hidden rounded-xl border border-slate-200">
                  {as.map((a) => {
                    const isDone = !!done[a.id]
                    const show = shown === a.id
                    const qs = questionsOf(a)
                    return (
                      <div key={a.id} className="border-t border-slate-100 first:border-t-0">
                        <div className="grid grid-cols-[20px_minmax(0,1fr)_90px_150px] items-center gap-4 px-4 py-2.5">
                          <button type="button" onClick={() => setShown(show ? null : a.id)} aria-label={show ? "Hide the evidence" : "Show the evidence"} className="text-slate-400 hover:text-slate-700">
                            <ChevronRight className={cn("size-3.5 transition-transform", show && "rotate-90")} />
                          </button>
                          <div className="min-w-0">
                            <p className="truncate text-sm text-slate-950">
                              <span className="font-medium">{leverOf(a).name}</span>
                              <span className="text-slate-400"> · </span>
                              {a.text}
                            </p>
                            <p className="truncate text-[13px] text-slate-500">
                              {a.skus} {a.skus === 1 ? "SKU" : "SKUs"} · wins {qs.length === 1 ? "“" + qs[0].text + "”" : `${qs.length} questions`}
                              {qs.some((q) => q.trend) && !isDone && <span className="ml-2 font-medium text-warning-700">{qs.find((q) => q.trend)!.trend}</span>}
                            </p>
                          </div>
                          <div className="text-right font-mono text-sm text-slate-950 tabular-nums">{a.kind === "pause" ? `$${a.spend}K/mo` : money(actionDemand(a))}</div>
                          <div className="flex justify-end">
                            {isDone ? (
                              <span className="inline-flex items-center gap-1 text-[13px] font-medium text-success-700">
                                <Check className="size-3.5" /> {did(a)}
                              </span>
                            ) : (
                              <button type="button" onClick={() => onFix(a.id)} className="text-[13px] font-medium text-brand-700 hover:underline">
                                {verb(a)}
                              </button>
                            )}
                          </div>
                        </div>
                        {show && (
                          <div className="flex flex-col gap-4 bg-slate-50 px-4 py-4">
                            <Exhibit action={a} />
                            {qs.map((q) => (
                              <Evidence key={q.id} q={q} fixed={isDone} />
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
        {rows.length === 0 && <div className="py-5 text-sm text-slate-500">Nothing to approve here.</div>}
      </div>
    </div>
  )
}

/** The evidence for one question: each agent's answer today (and after the action shipped). */
export function Evidence({ q, fixed }: { q: Question; fixed: boolean }) {
  const entries = Object.entries(q.answers) as [SurfaceId, Answer][]
  return (
    <div className="rounded-xl bg-white px-5 py-4 ring-1 ring-slate-200">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-slate-950">“{q.text}”</span>
        <span className="text-xs text-slate-500">{fixed ? "Before and after" : `${money(lostDemand(q))} a month you're missing from`}</span>
      </div>
      {q.why && <p className="mt-1 text-[13px] text-slate-600">{q.why}</p>}
      <div className={cn("mt-3 grid gap-4", entries.length > 2 ? "md:grid-cols-3" : "md:grid-cols-2")}>
        {entries.map(([s, a]) => {
          const after = afterFix(q, s, a)
          const pos = position(a)
          const posAfter = position(after)
          const now = fixed ? posAfter : pos
          return (
            <div key={s} className="min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium text-slate-950">{SURFACES.find((x) => x.id === s)!.name}</span>
                <span className="font-mono text-xs text-slate-500 tabular-nums">{money(a.demand)}/mo</span>
              </div>
              {a.via && <div className="truncate text-xs text-slate-500">{a.via.includes(",") ? `Cited ${a.via}` : `Searched ${a.via}`}</div>}
              <ol className="mt-2 flex flex-col gap-1">
                {(fixed ? after : a).list.map((n, i) => (
                  <li key={n} className={cn("flex gap-2 text-sm", n.startsWith(META.brand) ? "font-semibold text-slate-950" : "text-slate-700")}>
                    <span className="w-4 shrink-0 font-mono text-xs text-slate-400 tabular-nums">{i + 1}</span>
                    <span className="truncate" title={n}>
                      {n.split(",")[0]}
                    </span>
                  </li>
                ))}
              </ol>
              <div className={cn("mt-2 text-xs font-medium", now && now <= 3 ? "text-success-700" : "text-slate-500")}>
                {fixed && posAfter !== pos ? `Was ${pos ? `#${pos}` : "not named"} · now #${posAfter}` : now ? `You're #${now}` : "You're not named"}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
