"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { OwnerName } from "../owner-name"
import { AGENT_DOT } from "../agent-style"
import { AGENT_LABEL, type TierRow } from "../types"
import { PRIMARY } from "../mike/buttons"
import { useNudge } from "../nudge-context"
import { dueFor, useClaireActions } from "./claire-actions"

/**
 * One row of "One approval away" on Claire's page: who, what, where it stands
 * (it moves as the team acts and as days pass), the value, and her move:
 * ask by a date, or approve it herself once it's due. The same moves work from
 * her morning email.
 */
const TONE: Record<string, string> = {
  shipped: "text-success-700",
  "on-pace": "text-info-700",
  asked: "text-slate-600",
  due: "text-warning-700",
  overdue: "text-warning-700",
  behind: "text-warning-700",
  "not-started": "text-slate-500",
}

export function ClaireRow({ row, grid }: { row: TierRow; grid: string }) {
  const { statusOf, askFor, approveMyself, autopilotSeasonal, seasonalOn, day } = useClaireActions()
  const { approvedBy } = useNudge()
  const st = statusOf(row)
  // Approving it herself is for the content she can sign off (Mike's Halloween items).
  const canApprove = row.nudgeKey === "approval-content"
  const deadline = row.deadline?.replace(/(\d+) days/, (_, n) => `${Math.max(0, Number(n) - day)} days`)

  // She approved it herself: the next move is never having to.
  const offerAutopilot = canApprove && st.kind === "shipped" && !!approvedBy["approval-content"]

  const action = offerAutopilot ? (
    seasonalOn ? (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success-700">
        <Check className="size-4" /> Seasonal on autopilot
      </span>
    ) : (
      <span className="flex w-[180px] flex-col items-center gap-1.5">
        <button type="button" onClick={() => autopilotSeasonal("product")} className={cn(PRIMARY, "w-[180px]")}>
          Put seasonal on autopilot
        </button>
        <span className="text-[13px] text-slate-500">Hero SKUs still reviewed</span>
      </span>
    )
  ) : st.kind === "shipped" || st.kind === "on-pace" ? null : st.kind === "due" || st.kind === "overdue" ? (
      canApprove ? (
        <button type="button" onClick={() => approveMyself(row, "product")} className={cn(PRIMARY, "w-[180px]")}>
          Approve it myself
        </button>
      ) : null
    ) : st.kind === "asked" ? (
      canApprove ? (
        <button type="button" onClick={() => approveMyself(row, "product")} className="text-sm font-medium text-brand-700 hover:underline">
          Approve it myself
        </button>
      ) : null
    ) : (
      <span className="flex w-[180px] flex-col items-center gap-1.5">
        <button type="button" onClick={() => askFor(row, "product")} className={cn(PRIMARY, "w-[180px]")}>
          Ask {row.analystName} by {dueFor(day).short}
        </button>
        {canApprove && (
          <button type="button" onClick={() => approveMyself(row, "product")} className="text-[13px] font-medium text-brand-700 hover:underline">
            or approve it myself
          </button>
        )}
      </span>
    )

  return (
    <div className={cn(grid, "group items-center border-t border-slate-100 py-3.5 first:border-t-0")}>
      <div className="grid grid-cols-[168px_minmax(0,1fr)] items-start gap-4 lg:grid-cols-[168px_minmax(0,1fr)_220px]">
        <div className="flex items-center gap-2.5">
          <span className={`size-2 rounded-sm ${AGENT_DOT[row.agent]}`} />
          {row.analystName ? (
            <span className="text-sm text-slate-950">
              <OwnerName lever={row.agent} name={row.analystName} /> <span className="text-slate-500">{AGENT_LABEL[row.agent]}</span>
            </span>
          ) : (
            <span className="text-sm font-medium text-slate-950">{AGENT_LABEL[row.agent]}</span>
          )}
        </div>
        <p className="text-sm leading-relaxed text-slate-600">{row.description}</p>
        <div className="text-sm">
          <span className={cn("font-medium", TONE[st.kind])}>
            {st.kind === "shipped" && <Check className="mr-1 inline size-3.5 -translate-y-px" />}
            {st.text}
          </span>
          {deadline && st.kind !== "shipped" && <span className="mt-0.5 block text-[13px] font-medium text-warning-700">{deadline}</span>}
        </div>
      </div>
      <div className="text-right font-mono text-[15px] font-semibold text-slate-950 tabular-nums">{row.value}</div>
      <div className="justify-self-end">{action}</div>
      <div />
    </div>
  )
}
