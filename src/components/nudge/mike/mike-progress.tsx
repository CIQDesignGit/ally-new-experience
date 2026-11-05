"use client"

import { Fig, FIG_EYEBROW, PageHeader, Signal } from "@/components/layout/page-header"
import { PublishConfetti } from "@/components/home/publish-confetti"
import { AS_OF, contentBatches, launchedIds } from "../data"
import { daysUntil } from "../model"
import { DELIVERED } from "../delivered-periods"
import { useNudge } from "../nudge-context"
import { SplitBar } from "./split-bar"
import { MiniWaterfall } from "../mini-waterfall"
import type { Stage } from "../mini-waterfall"
import { useMvp } from "../mvp"

function fmt(v: number) {
  // Same rounding as the progress bar under it, so the two always read the same.
  return v >= 1 ? `$${+v.toFixed(2)}M` : `$${Math.round(v * 1000)}K`
}
/** "$500K" → 0.5 ($M). */
const money = (s: string) => parseFloat(s.replace(/[$KM,]/g, "")) / (s.endsWith("K") ? 1000 : 1)

/** The bar is this quarter's content: banked so far (Q4, as every page shows it), then what's open. */
const BANKED = DELIVERED.quarter.content.delivered

interface Celebrate {
  value: number
  skus: number
}

/**
 * Mike's headline in Claire's words, for his slice: what's open, then what's
 * one approval from live. The bar is the quarter's content: banked, then what
 * he approves, against what's open.
 */
export function MikeProgress({ celebrate, stage, onStage }: { celebrate: Celebrate | null; /** The inbox filter, shown on its bar. */ stage?: Stage; onStage?: (s: Exclude<Stage, "banked">) => void }) {
  const { approved, policy, launchReady, day } = useNudge()
  const mvp = useMvp()
  const BATCHES = contentBatches(policy, launchedIds(approved), launchReady)

  const approvalBatches = BATCHES.filter((b) => b.tier === "approval")
  const doneValue = approvalBatches.reduce((sum, b) => sum + (approved[b.id] ? b.approveValue : 0), 0)
  // Every action moves the bar: approving a batch, or giving Ally the input it asked for.
  const actedValue = BATCHES.filter((b) => b.tier !== "autopilot" && approved[b.id]).reduce((sum, b) => sum + b.approveValue, 0)
  const left = approvalBatches.filter((b) => !approved[b.id]).reduce((sum, b) => sum + money(b.value), 0)
  // The bar is the quarter's content: banked so far, what Mike just approved, and what's still open.
  const total = BATCHES.reduce((sum, b) => sum + money(b.value), 0)
  // "All of it expires" only when every open batch one approval away carries a deadline.
  const pending = approvalBatches.filter((b) => !approved[b.id])
  const dated = pending.filter((b) => b.deadline)
  const soonest = dated.map((b) => b.deadline!).sort()[0]
  const expiry = soonest && {
    all: dated.length === pending.length,
    value: dated.filter((b) => b.deadline === soonest).reduce((s, b) => s + money(b.value), 0),
    days: daysUntil(soonest, AS_OF) - day,
  }
  const open = total - actedValue
  // Open work only: banked shows in the progress bar below, so the total matches the headline's open amount.
  const openIn = (tier: string) => BATCHES.filter((b) => b.tier === tier && !approved[b.id]).reduce((sum, b) => sum + money(b.value), 0)
  const stages = { autopilot: openIn("autopilot"), approval: left, input: openIn("input") }

  if (mvp) {
    // The MVP: what's waiting and what expires, in batches and SKUs; no projected dollars.
    const waiting = BATCHES.filter((b) => b.tier !== "autopilot" && !approved[b.id])
    const oneApproval = waiting.filter((b) => b.tier === "approval")
    const expiring = dated.filter((b) => b.deadline === soonest)
    return (
      <PageHeader
        title={`${waiting.reduce((s, b) => s + (b.inputSkus ?? b.skus), 0)} SKUs waiting on you`}
        eyebrow={
          <>
            <Fig className={FIG_EYEBROW}>{waiting.length}</Fig> batches in your queue
          </>
        }
        signals={
          <>
            {oneApproval.length > 0 && (
              <Signal tone="brand">
                {oneApproval.length} {oneApproval.length === 1 ? "is" : "are"} one approval from live
              </Signal>
            )}
            {expiry &&
              expiring.length > 0 && (
                <Signal tone="warning">
                  {expiry.all ? "All of them" : `${expiring.length} ${expiring.length === 1 ? "batch" : "batches"}`}{" "}
                  {expiry.all || expiring.length > 1 ? "expire" : "expires"} in {expiry.days} days
                </Signal>
              )}
          </>
        }
        aside={
          celebrate && (
            <div className="relative text-sm font-semibold text-success-700">
              {celebrate.skus} SKUs live
              <div className="absolute -top-1 left-0 size-16">
                <PublishConfetti />
              </div>
            </div>
          )
        }
      />
    )
  }

  return (
    <>
      {/* The headline beside the open work as a waterfall; a bar filters the inbox. */}
      <PageHeader
        eyebrow={
          <>
            <Fig className={FIG_EYEBROW}>{fmt(open)}</Fig> of content opportunity is {actedValue > 0 ? "still " : ""}open this quarter
          </>
        }
        title={left > 0.005 ? `${fmt(left)} ${doneValue > 0 ? "still" : "is"} one approval from live.` : "Everything one approval away is live."}
        signals={
          left > 0.005 &&
          expiry && (
            <Signal tone="warning">
              {expiry.all ? "All of it" : fmt(expiry.value)}
              {expiry.all ? "" : " of it"} expires in {expiry.days} days
            </Signal>
          )
        }
        aside={
          <div className="w-[340px]">
            <MiniWaterfall values={stages} highlight={stage ?? "approval"} onSelect={(s) => s !== "banked" && onStage?.(s)} />
          </div>
        }
      />
      <div className="relative border-y border-slate-200 bg-brand-25 px-10 py-4">
        <SplitBar
          banked={BANKED}
          unlocked={actedValue}
          open={open}
          aside={
            celebrate && (
              <div className="relative text-sm font-semibold text-success-700">
                +{fmt(celebrate.value)} · {celebrate.skus} SKUs live
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
