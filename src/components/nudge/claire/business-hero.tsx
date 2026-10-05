"use client"

import { cn } from "@/lib/utils"
import { BUSINESS, fmtBiz } from "../data"
import { useLive } from "../live-model"
import { useNudge } from "../nudge-context"
import { TopStrip } from "../top-strip"
import type { Crumb } from "../top-strip"
import { EmailPdfButton } from "./email-pdf-button"
import { TeamBell } from "./team-bell"

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
      <h1 className="text-[44px] leading-[1.15] font-bold tracking-tight text-ink">
        {/* Two lines, one size: where the period lands against plan, then what's in the pipeline against the gap. */}
        <span className="block">
          <span className="font-mono">{fmtBiz(b.pace)}</span> forecast <span className="text-slate-500">(vs <span className="font-mono">{fmtBiz(b.plan)}</span> plan)</span>.
        </span>
        <span className="block">
          <span className="font-mono text-brand-500">{live.open.totalLabel}</span> in pipeline to close the <span className={cn("font-mono", gap > 0 && "text-error-600")}>{fmtBiz(gap)}</span> gap.
        </span>
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
