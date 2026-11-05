"use client"

import { PublishConfetti } from "@/components/home/publish-confetti"
import { BUSINESS, OPS_DAYS_SAVED, fmtBiz, opsBatches } from "../data"
import { useLive } from "../live-model"
import { DELIVERED } from "../delivered-periods"
import { useNudge } from "../nudge-context"
import { MiniWaterfall } from "../mini-waterfall"
import { SplitBar } from "../mike/split-bar"
import type { Stage } from "../mini-waterfall"

function fmt(v: number) {
  // Same rounding as the progress bar under it, so the two always read the same.
  return v >= 1 ? `$${+v.toFixed(2)}M` : `$${Math.round(v * 1000)}K`
}
/** "$720K" → 0.72 ($M). */
const money = (s: string) => parseFloat(s.replace(/[$KM,]/g, "")) / (s.endsWith("K") ? 1000 : 1)
const BANKED = DELIVERED.quarter.ops.delivered

interface Celebrate {
  value: number
  label: string
}

/**
 * Michelle's headline in Claire's words, for her slice: what's open, then what's
 * one approval from live and what's losing sales now. The bar is the quarter's
 * ops work: banked, then what she acts on, against what's open. Same as Mike's.
 */
export function OpsProgress({ celebrate, stage, onStage }: { celebrate: Celebrate | null; /** The inbox filter, shown on its bar. */ stage?: Stage; onStage?: (s: Exclude<Stage, "banked">) => void }) {
  const { approved, policy } = useNudge()
  const { mvp, pace, period } = useLive()
  const OPS_BATCHES = opsBatches(policy)

  const approvalBatches = OPS_BATCHES.filter((b) => b.tier === "approval")
  const doneValue = approvalBatches.reduce((sum, b) => sum + (approved[b.id] ? b.approveValue : 0), 0)
  const actedValue = OPS_BATCHES.filter((b) => b.tier !== "autopilot" && approved[b.id]).reduce((sum, b) => sum + b.approveValue, 0)
  const left = approvalBatches.filter((b) => !approved[b.id]).reduce((sum, b) => sum + money(b.value), 0)
  const total = OPS_BATCHES.reduce((sum, b) => sum + money(b.value), 0)
  // Whatever is flagged urgent and still open, not a fixed batch.
  const urgent = approvalBatches.filter((b) => b.urgent && !approved[b.id]).reduce((sum, b) => sum + money(b.value), 0)
  const open = total - actedValue
  // Daily sales at risk on the urgent items still open (the same number their value is built from).
  const perDay = approvalBatches.filter((b) => b.urgent && !approved[b.id]).reduce((sum, b) => sum + (b.perDay ?? b.approveValue / OPS_DAYS_SAVED), 0)
  const openIn = (tier: string) => OPS_BATCHES.filter((b) => b.tier === tier && !approved[b.id]).reduce((sum, b) => sum + money(b.value), 0)
  // Open work only: banked shows in the progress bar below, so the total matches the headline's open amount.
  const stages = { autopilot: openIn("autopilot"), approval: left, input: openIn("input") }
  const jump = (s: Stage) => {
    if (s === "banked") return document.getElementById("ops-delivered")?.scrollIntoView({ behavior: "smooth", block: "start" })
    onStage?.(s)
  }

  if (mvp) {
    // The MVP: the gap to plan that ranks the queue, then what waits on her; no projected dollars.
    const gap = BUSINESS[period].plan - pace(period)
    const waiting = OPS_BATCHES.filter((b) => b.tier !== "autopilot" && !approved[b.id])
    const oneApproval = waiting.filter((b) => b.tier === "approval")
    const losing = oneApproval.filter((b) => b.urgent)
    return (
      <div className="flex items-end justify-between gap-8 px-10 pt-4 pb-8">
        <div className="min-w-0">
          <div className="text-base font-medium text-slate-500 tabular-nums">
            {gap > 0 && (
              <>
                <span className="font-semibold text-slate-950">{fmtBiz(gap)}</span> gap to plan ·{" "}
              </>
            )}
            <span className="font-semibold text-slate-950">{waiting.length}</span> fixes waiting on you.
          </div>
          <h1 className="mt-2 text-3xl leading-tight font-semibold tracking-tight text-slate-950 tabular-nums">
            {oneApproval.length ? (
              <>
                {oneApproval.length} {oneApproval.length === 1 ? "is" : "are"} one approval away.
              </>
            ) : (
              "Everything one approval away is live."
            )}
          </h1>
          {losing.length > 0 && (
            <div className="mt-3 flex items-center gap-2 text-[15px] font-medium text-warning-700">
              <span className="size-2 rounded-full bg-warning-500" aria-hidden />
              {losing.length} on SKUs losing sales now
            </div>
          )}
        </div>
        {celebrate && (
          <div className="relative text-sm font-semibold text-success-700">
            {celebrate.label}
            <div className="absolute -top-1 left-0 size-16">
              <PublishConfetti />
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* The headline beside the quarter's waterfall: the claim on the left, its picture on the right. */}
      <div className="grid grid-cols-[minmax(0,1fr)_340px] items-end gap-8 px-10 pt-2 pb-6">
        <div className="min-w-0">
        <div className="text-2xl font-semibold tracking-tight text-slate-700">
          <span className="font-mono text-slate-950">{fmt(open)}</span> of ops opportunity is {actedValue > 0 ? "still " : ""}open this quarter.
        </div>
        <h1 className="mt-1 text-[28px] leading-tight font-bold tracking-tight text-slate-950">
          {left > 0.005 ? (
            <>
              <span className="font-mono">{fmt(left)}</span> {doneValue > 0 ? "still" : "is"} one approval from live.
            </>
          ) : (
            "Everything one approval away is live."
          )}
        </h1>
        {/* The urgency on its own line, as on Claire's page: a daily loss, in red. */}
        {left > 0.005 && urgent > 0 && (
          <div className="mt-2 text-lg font-semibold text-error-600">
            Losing <span className="font-mono">{fmt(perDay)}</span> a day
          </div>
        )}
        </div>
        <MiniWaterfall values={stages} highlight={stage ?? "approval"} onSelect={jump} />
      </div>
      <div className="relative border-y border-slate-200 bg-brand-25 px-10 py-4">
        <SplitBar
          banked={BANKED}
          unlocked={actedValue}
          open={open}
          aside={
            celebrate && (
              <div className="relative text-sm font-semibold text-success-700">
                {celebrate.value > 0 && `+${fmt(celebrate.value)} · `}{celebrate.label}
                <div className="absolute -top-1 left-0 size-16">
                  <PublishConfetti />
                </div>
              </div>
            )
          }
        />
      </div>
    </>
  )
}
