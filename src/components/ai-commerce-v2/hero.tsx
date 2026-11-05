"use client"

import { Fig, FIG_EYEBROW, PageHeader, Signal } from "@/components/layout/page-header"
import { TopStrip } from "@/components/nudge/top-strip"
import { META, QUESTIONS, TO_WIN, brandRank, isFixed, isLeader, score, sov, visibility, type Done } from "./data"

/**
 * The top of the page, for someone meeting AI Commerce for the first time: where she
 * stands in AI answers against the leader, in the three numbers the market already uses.
 * Dollars come later, once the mechanism is believed.
 */
export function Hero({ done }: { done: Done }) {
  const v = visibility(done)
  const r = brandRank(done)
  const open = TO_WIN.filter((a) => !done[a.id])
  const rising = QUESTIONS.find((q) => q.trend && !isFixed(q, done))
  return (
    <>
      <TopStrip
        person="claire"
        home="/claire-waterfall"
        className="px-10"
        greeting="Hi Claire"
        facts={
          <span className="flex items-center gap-x-2 text-sm text-slate-500">
            <span className="text-slate-300">·</span>
            <span>
              {META.category} · Amazon, Walmart, Kroger · {META.asOf}
            </span>
            <span className="text-slate-300">·</span>
            <span>
              AI Commerce Score <span className="font-mono font-semibold text-slate-950">{score(done)}</span>
              <span className="text-slate-400"> · {META.leader} {score(done, isLeader)}</span>
            </span>
          </span>
        }
      />
      <PageHeader
        eyebrow={
          <>
            AI rank <Fig className={FIG_EYEBROW}>#{r.rank}</Fig> of {r.of} brands · Coverage <Fig className={FIG_EYEBROW}>{v.in}</Fig> of {v.of}{" "}
            answers
          </>
        }
        title={
          <>
            Your AI visibility in {META.category.toLowerCase()} is <span className="text-brand-600">{sov(done)}%</span>.
          </>
        }
        signals={
          <>
            <Signal tone="brand">
              {open.length} actions one approval from live · {Math.max(open.length * 5, 5)} min of your team&apos;s time
            </Signal>
            {rising && (
              <Signal tone="warning">
                “{rising.text.replace(/\.$/, "")}” {rising.trend!.toLowerCase()}
              </Signal>
            )}
          </>
        }
      />
    </>
  )
}
