"use client"

import { Fig, PageHeader, Signal } from "@/components/layout/page-header"
import { BUSINESS, fmtBiz } from "../data"
import { useLive } from "../live-model"
import { useNudge } from "../nudge-context"
import { TopStrip } from "../top-strip"
import type { Crumb } from "../top-strip"
import { EmailPdfButton } from "./email-pdf-button"
import { TeamBell } from "./team-bell"
import { AGENT_LABEL } from "../types"

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
  // The MVP counts what's waiting and names whose deadline is first, instead of dollars.
  const approvals = live.approval.rows.filter((r) => (r.valueM ?? 0) > 0).length
  const firstDue = live.approval.rows.find((r) => r.deadline)
  const dueLabel = firstDue ? `${firstDue.analystName}'s ${AGENT_LABEL[firstDue.agent].toLowerCase()} approval` : "1 approval"

  return (
    <>
      <TopStrip
        person="claire"
        home="/claire-waterfall"
        className="px-4 sm:px-0"
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
    {!topLineOnly && (
      <PageHeader
        className="px-4 sm:px-0"
        eyebrow={
          <>
            <Fig>{fmtBiz(b.pace)}</Fig> forecast vs <Fig>{fmtBiz(b.plan)}</Fig> plan
            {/* Where the open work sits, by lever; the MVP shows no pipeline dollars. */}
            {!live.mvp &&
              live.open.byArea.map((a) => (
                <span key={a.agent}>
                  <span className="text-slate-300"> · </span>
                  <Fig>{a.value}</Fig> in {a.agent}
                </span>
              ))}
          </>
        }
        title={
          // It only says "closes" when it does; ahead of plan, the pipeline grows the lead.
          live.mvp ? (
            gap > 0 ? (
              <>
                <span className="text-error-600">{fmtBiz(gap)}</span> gap to close.
              </>
            ) : (
              <>
                <span className="text-success-700">{fmtBiz(-gap)}</span> ahead of plan.
              </>
            )
          ) : gap > 0 ? (
            <>
              {live.open.totalLabel} in pipeline to close the <span className="text-error-600">{fmtBiz(gap)}</span> gap.
            </>
          ) : (
            <>
              <span className="text-success-700">{fmtBiz(-gap)}</span> ahead, {live.open.totalLabel} more in pipeline.
            </>
          )
        }
        signals={
          <>
            <Signal tone="brand">
              {live.approval.effort} of your team&apos;s time unlocks {live.mvp ? `${approvals} ${approvals === 1 ? "action" : "actions"}` : live.approval.value}
            </Signal>
            {live.deadline && (
              <Signal tone="warning">
                {live.mvp ? dueLabel : live.deadline.expiring} expires in {live.deadline.days - day} days
              </Signal>
            )}
          </>
        }
      />
    )}
    </>
  )
}
