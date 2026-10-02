"use client"

import { BUSINESS, fmtBiz } from "../data"
import { useLive } from "../live-model"
import { useNudge } from "../nudge-context"
import { TopStrip } from "../top-strip"
import type { Crumb } from "../top-strip"
import { EmailPdfButton } from "./email-pdf-button"
import { TeamBell } from "./team-bell"
import type { Period } from "../types"

const PERIOD_WORDS: Record<Period, string> = { week: "this week", month: "this month", quarter: "this quarter", year: "this year" }

/**
 * The top of Claire's page, in her business terms: where she's landing against
 * plan, the gap, and the open opportunity that closes it. Then where it sits and
 * how fast it unlocks.
 */
/** `topLineOnly`: just the top strip (above a Grow view, which has its own headline); `crumbs` replace the greeting there. */
export function BusinessHero({ topLineOnly = false, crumbs }: { topLineOnly?: boolean; crumbs?: Crumb[] } = {}) {
  const live = useLive()
  // Counted at the demo's day, as every countdown on the page is.
  const { day } = useNudge()
  const { period } = live
  const b = { ...BUSINESS[period], pace: live.pace(period) }
  const gap = b.plan - b.pace

  return (
    <>
      <TopStrip
        person="claire"
        home="/claire-waterfall"
        className="px-12"
        greeting={crumbs ? undefined : "Hi Claire"}
        crumbs={crumbs}
        period
        icons={
          <>
            <EmailPdfButton period={period} />
            <TeamBell />
          </>
        }
      />
    <section className={topLineOnly ? "" : "px-12 pt-2 pb-7"}>
      {!topLineOnly && (<>
      {/* Two lines: forecast against plan, then the pipeline against the gap. It only says "closes" when it does. */}
      <div className="text-2xl font-semibold tracking-tight text-slate-700">
        <span className="font-mono text-slate-950">{fmtBiz(b.pace)}</span> forecast against a <span className="font-mono text-slate-950">{fmtBiz(b.plan)}</span> plan {PERIOD_WORDS[period]}.
      </div>

      <h1 className="mt-1 text-[44px] leading-tight font-bold tracking-tight text-slate-950">
        <span className="font-mono text-brand-600">{live.open.totalLabel}</span> in the pipeline {live.open.total >= gap ? "closes" : "goes toward"} the <span className="font-mono">{fmtBiz(gap)}</span> gap.
      </h1>

      <div className="mt-2 text-base text-slate-500">
        {live.open.byArea.map((a, i) => (
          <span key={a.agent}>
            {i > 0 && <span className="text-slate-300"> · </span>}
            <span className="font-semibold text-slate-700">{a.value}</span> in {a.agent}
          </span>
        ))}
      </div>
      <div className="mt-3 text-xl font-semibold">
        <span className="text-brand-600">
          {live.approval.effort} of your team&apos;s time unlocks {live.approval.value}
        </span>
        {live.deadline && (
          <>
            <span className="text-slate-300"> · </span>
            <span className="text-warning-600">
              {live.deadline.expiring} expires in {live.deadline.days - day} days
            </span>
          </>
        )}
      </div>
      </>)}
    </section>
    </>
  )
}
