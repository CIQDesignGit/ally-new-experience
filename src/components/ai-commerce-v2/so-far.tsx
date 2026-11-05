"use client"

import { useState } from "react"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { ACTIONS, META, SURFACES, actionWins, afterFix, isLeader, leverOf, money, opportunity, position, questionsOf, score, share, top3, type Done, type Answer, type SurfaceId } from "./data"
import { Evidence } from "./table"

const BASE: Done = {}

/** This month so far: the score and the share moving, and what Ally shipped to move them. */
export function SoFar({ done }: { done: Done }) {
  const shipped = ACTIONS.filter((a) => done[a.id])
  const [open, setOpen] = useState<string | null>(null)
  const won = shipped.reduce((t, a) => t + questionsOf(a).filter((q) => (Object.entries(q.answers) as [SurfaceId, Answer][]).some(([s, x]) => !top3(x) && top3(afterFix(q, s, x)))).length, 0)
  const saved = shipped.filter((a) => a.kind === "pause").reduce((t, a) => t + (a.spend ?? 0), 0)
  const dScore = score(done) - score(BASE)
  const dShare = share(done) - share(BASE)

  return (
    <section className="px-12 pt-8 pb-6">
      <div className="font-mono text-xs tracking-wide text-slate-500 uppercase">{META.asOf} so far</div>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-6 gap-y-1">
        <span className="text-2xl font-semibold tracking-tight text-slate-950">
          AI Commerce Score <span className="font-mono text-ally-600">{score(done)}</span>
          {dScore > 0 && <span className="ml-2 font-mono text-sm font-semibold text-success-700 tabular-nums">+{dScore}</span>}
        </span>
        <span className="text-2xl font-semibold tracking-tight text-slate-500">
          In AI answers <span className="font-mono text-slate-950">{share(done)}%</span>
          {dShare > 0 && <span className="ml-2 font-mono text-sm font-semibold text-success-700 tabular-nums">+{dShare} pts</span>}
        </span>
        <span className="text-sm text-slate-500 tabular-nums">
          {shipped.length} {shipped.length === 1 ? "action" : "actions"} shipped · {won} {won === 1 ? "question" : "questions"} newly won
          {saved ? ` · $${saved}K a month of ads paused` : ""} · gap to {META.leader} {money(Math.max(opportunity(done), 0))}
        </span>
      </div>
      <div className="-mx-6 mt-5 border-t border-slate-100">
        {shipped.length === 0 && <div className="px-6 py-5 text-sm text-slate-500">Nothing shipped yet this month. Approve an action above and it shows here with the agents&apos; answers before and after.</div>}
        {shipped.map((a) => {
          const isOpen = open === a.id
          const qs = questionsOf(a)
          const first = qs.flatMap((q) => (Object.entries(q.answers) as [SurfaceId, Answer][]).filter(([, x]) => !top3(x)).map(([s, x]) => ({ q, s, x })))[0]
          return (
            <div key={a.id} className="border-t border-slate-100 first:border-t-0">
              <div className="grid grid-cols-[20px_minmax(0,1fr)_minmax(0,1.2fr)] items-start gap-4 px-6 py-3.5">
                <button type="button" onClick={() => setOpen(isOpen ? null : a.id)} aria-label={isOpen ? "Hide" : "Show"} className="mt-0.5 text-slate-400 hover:text-slate-700">
                  <ChevronRight className={cn("size-4 transition-transform", isOpen && "rotate-90")} />
                </button>
                <div>
                  <div className="text-sm font-medium text-slate-950">
                    {leverOf(a).name} <span className="text-slate-400">·</span> {a.text}
                  </div>
                  <div className="mt-0.5 text-[13px] text-slate-500">
                    {a.skus} {a.skus === 1 ? "SKU" : "SKUs"}
                  </div>
                </div>
                <div className="text-sm text-slate-700">
                  {a.kind === "pause" ? (
                    <>
                      Still <span className="font-mono font-semibold text-slate-950">#{position(qs[0].answers.alexa!)}</span> organically on Alexa · <span className="font-mono font-semibold text-slate-950">${a.spend}K</span> a month saved
                    </>
                  ) : first ? (
                    <>
                      {SURFACE_NAME[first.s]}: <span className="text-slate-500">{position(first.x) ? `#${position(first.x)}` : "not named"}</span> → <span className="font-mono font-semibold text-success-700">#{position(afterFix(first.q, first.s, first.x))}</span>
                      <span className="text-slate-500"> · {money(actionWins(a))} a month of answers won</span>
                      {a.lift && (
                        <span className="text-slate-500">
                          {" "}
                          · projected <span className="font-mono text-slate-950">+{a.lift.fixed}%</span> sales vs <span className="font-mono">+{a.lift.control}%</span> control
                        </span>
                      )}
                    </>
                  ) : null}
                </div>
              </div>
              {isOpen && (
                <div className="flex flex-col gap-3 bg-slate-50 px-6 py-4">
                  {qs.map((q) => (
                    <Evidence key={q.id} q={q} fixed />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="mt-2 text-[11px] text-slate-400">Lift is measured 4 weeks after the agent re-indexes, on the fixed SKUs against 20 matched control SKUs.</div>
    </section>
  )
}

const SURFACE_NAME = Object.fromEntries(SURFACES.map((s) => [s.id, s.name])) as Record<SurfaceId, string>
