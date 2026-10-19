"use client"

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
        className="px-12"
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
      <section className="px-12 pt-2 pb-7">
        <h1 className="text-[44px] leading-[1.15] font-bold tracking-tight text-ink">
          <span className="block">
            Your AI visibility in {META.category.toLowerCase()} is <span className="font-mono text-brand-500">{sov(done)}%</span>.
          </span>
        </h1>
        <div className="mt-2 text-base text-slate-500">
          AI rank <span className="font-mono font-semibold text-slate-700">#{r.rank}</span> of {r.of} brands · Coverage <span className="font-mono font-semibold text-slate-700">{v.in}</span> of {v.of} answers
        </div>
        <div className="mt-3 text-xl font-semibold">
          <span className="text-brand-600">
            {open.length} actions one approval from live · {Math.max(open.length * 5, 5)}{" "}min of your team&apos;s time
          </span>
          {rising && (
            <>
              <span className="text-slate-300"> · </span>
              <span className="text-warning-600">
                “{rising.text.replace(/\.$/, "")}” {rising.trend!.toLowerCase()}
              </span>
            </>
          )}
        </div>
      </section>
    </>
  )
}
