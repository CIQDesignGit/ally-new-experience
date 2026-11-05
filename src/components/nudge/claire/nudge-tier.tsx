"use client"

import { useState } from "react"
import { Check, ChevronDown, Clock } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { NudgeRow } from "./nudge-row"
import { useNudge } from "../nudge-context"
import { useFireNudge } from "../use-fire-nudge"
import { NUDGE_TARGETS } from "../data"
import type { NudgeKey, TierRow } from "../types"

interface NudgeTierProps {
  title: string
  value: string
  effort: string
  rows: TierRow[]
  canNudgeTeam?: boolean
  defaultOpen?: boolean
  tone?: "urgent" | "neutral"
  /** Autopilot's "0 min" reads as a win, so it gets the green effort chip. */
  effortTone?: "good" | "neutral"
}

/**
 * Shared 4-column grid: content | value | action | chevron. Values line up in
 * one column; the tier-level "Nudge team" and the per-row hover nudges line up
 * in the next, with the chevron pinned to the far right on its own.
 */
export const TIER_GRID = "grid grid-cols-[minmax(0,1fr)_100px_140px_20px] items-center gap-4"

export function NudgeTier({ title, value, effort, rows, canNudgeTeam, defaultOpen, tone = "neutral", effortTone = "neutral" }: NudgeTierProps) {
  const [open, setOpen] = useState(!!defaultOpen)
  const { nudged, nudgeMany } = useNudge()
  const { sendSlack } = useFireNudge()

  const nudgeable = rows.filter((r) => r.nudgeKey)
  const teamNudged = nudgeable.length > 0 && nudgeable.every((r) => nudged[r.nudgeKey!])

  function nudgeTeam() {
    nudgeMany(nudgeable.map((r) => r.nudgeKey!) as NudgeKey[])
    const targeted = rows.filter((r) => r.nudgeKey && NUDGE_TARGETS[r.nudgeKey])
    targeted.forEach((r) => sendSlack(r))
    if (targeted.length === 0) toast.success("Nudged your team")
  }

  return (
    <div className={cn("overflow-hidden rounded-xl border", tone === "urgent" ? "border-brand-200" : "border-slate-200")}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setOpen((o) => !o)}
        className={cn(TIER_GRID, "cursor-pointer px-6 py-3.5", tone === "urgent" ? "bg-brand-25 hover:bg-brand-50" : "hover:bg-slate-50")}
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="text-lg font-semibold text-slate-950">{title}</span>
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              effortTone === "good" ? "bg-success-50 text-success-700" : "bg-slate-100 text-slate-600",
            )}
          >
            <Clock className="size-3" />
            {effort}
          </span>
        </div>
        <div className="text-right font-mono text-xl font-bold tracking-tight text-slate-950 tabular-nums">{value}</div>
        <div className="justify-self-end">
          {canNudgeTeam &&
            (teamNudged ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success-700">
                <Check className="size-4" />
                Team nudged
              </span>
            ) : (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); nudgeTeam() }}
                className="whitespace-nowrap rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-xs transition-colors hover:bg-brand-600"
              >
                Nudge team
              </button>
            ))}
        </div>
        <ChevronDown className={cn("size-4 justify-self-end text-slate-400 transition-transform", open && "rotate-180")} />
      </div>

      {open && (
        <div className="border-t border-slate-100 px-6 py-1.5">
          {rows.map((row, i) => (
            <NudgeRow key={i} row={row} grid={TIER_GRID} />
          ))}
        </div>
      )}
    </div>
  )
}
