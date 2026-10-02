"use client"

import { useState } from "react"
import { PageShell } from "@/components/layout/page-shell"
import { ClaireHeader } from "@/components/nudge/claire/claire-header"
import { StatusStrip } from "@/components/nudge/claire/status-strip"
import { WeeklyBanner } from "@/components/nudge/claire/weekly-banner"
import { OpportunityHero } from "@/components/nudge/claire/opportunity-hero"
import { NudgeTier, TIER_GRID } from "@/components/nudge/claire/nudge-tier"
import { BankedTier } from "@/components/nudge/claire/banked-tier"
import { DeliveredSection } from "@/components/nudge/claire/delivered-section"
import { AutopilotCompare } from "@/components/nudge/claire/autopilot-compare"
import { AskAllyInline } from "@/components/nudge/claire/ask-ally-inline"
import { AreaView } from "@/components/nudge/claire/area-view"
import { cn } from "@/lib/utils"
import { APPROVAL_TIER, TEAM_TIER, AUTOPILOT_TIER, OPEN_TOTAL } from "@/components/nudge/data"
import type { Period } from "@/components/nudge/types"

/**
 * Claire's rollup (tier version). Nudging "Mike" on either the approval-tier Halloween row
 * or the team-tier backend row fires a real Slack DM (see /api/nudge) and
 * lands him on /mike via the "Open in Ally" link in that message.
 * Frozen at its pre-"business-first" state; new design changes go to /claire-waterfall
 * and are logged in docs/waterfall-changelog.md.
 */
export default function ClairePage() {
  const [period, setPeriod] = useState<Period>("quarter")
  const [groupBy, setGroupBy] = useState<"status" | "area">("status")

  return (
    <PageShell className="bg-slate-50">
      <div className="mx-auto max-w-[1280px] overflow-hidden bg-white shadow-pane-lg sm:my-6 sm:rounded-2xl sm:ring-1 sm:ring-slate-900/6">
        <ClaireHeader period={period} />
        <WeeklyBanner />
        <StatusStrip period={period} onPeriodChange={setPeriod} />
        <OpportunityHero period={period} />

        <div className="flex items-center justify-between px-12 pt-1 pb-3">
          <div className="font-mono text-xs tracking-wide text-slate-500 uppercase">Where it sits today</div>
          <div className="flex rounded-lg border border-slate-200 bg-slate-25 p-0.5 text-xs">
            {(["status", "area"] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGroupBy(g)}
                className={cn(
                  "rounded-md px-3 py-1 font-medium transition-colors",
                  groupBy === g ? "bg-white text-slate-950 shadow-xs ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-800",
                )}
              >
                By {g}
              </button>
            ))}
          </div>
        </div>

        {groupBy === "area" ? (
          <div className="px-12">
            <AreaView />
          </div>
        ) : (
          <div className="flex flex-col gap-2 px-12">
            {/* Action tiers lead — the two things that need Claire */}
            <NudgeTier
              title="One approval away"
              value={APPROVAL_TIER.value}
              effort={APPROVAL_TIER.effort}
              rows={APPROVAL_TIER.rows}
              canNudgeTeam={APPROVAL_TIER.canNudgeTeam}
              tone="urgent"
            />
            <NudgeTier
              title="Needs your team"
              value={TEAM_TIER.value}
              effort={TEAM_TIER.effort}
              rows={TEAM_TIER.rows}
              canNudgeTeam={TEAM_TIER.canNudgeTeam}
            />

            <NudgeTier
              title="On autopilot"
              value={AUTOPILOT_TIER.value}
              effort={AUTOPILOT_TIER.effort}
              rows={AUTOPILOT_TIER.rows}
              effortTone="good"
            />

            {/* Total open — the three open buckets, matching the $6.8M headline */}
            <div className={`${TIER_GRID} mt-1 border-t border-slate-200 px-6 py-4`}>
              <div className="text-[15px] font-semibold text-slate-950">Total open opportunity</div>
              <div className="text-right font-mono text-2xl font-bold tracking-tight text-slate-950 tabular-nums">{OPEN_TOTAL}</div>
              <div />
            </div>

            {/* Already banked — realized this quarter, kept apart from what's still open */}
            <BankedTier />
          </div>
        )}

        <DeliveredSection period={period} />

        <AutopilotCompare />
        <AskAllyInline />
      </div>
    </PageShell>
  )
}
