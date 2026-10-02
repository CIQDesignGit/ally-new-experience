"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { OwnerName } from "../owner-name"
import { AGENT_DOT } from "../agent-style"
import { AGENT_LABEL, type TierRow } from "../types"
import { PRIMARY } from "../mike/buttons"
import { countdown, dueFor, useClaireActions } from "./claire-actions"

/**
 * One row of "One approval away" on Claire's page: who, what, where it stands
 * this week (it moves as the team acts and as the demo week moves on), the
 * value, and her move. The same moves work from her email.
 */
const TONE: Record<string, string> = {
  pre: "text-slate-500",
  assigned: "text-slate-600",
  asked: "text-slate-600",
  due: "text-warning-700",
  overdue: "text-warning-700",
  held: "text-success-700",
  shipped: "text-success-700",
}

const LINK = "text-[13px] font-medium text-brand-700 hover:underline"

export function ClaireRow({ row, grid }: { row: TierRow; grid: string }) {
  const { statusOf, askFor, approveMyself, autopilotSeasonal, seasonalOn, day, s } = useClaireActions()
  const st = statusOf(row)
  const key = row.nudgeKey
  // Content is the work Claire can sign off herself, and the work Ally ships at her deadline.
  const content = key === "approval-content"
  const ask = key ? s.asks[key] : undefined
  const deadline = st.kind === "shipped" || st.kind === "held" ? undefined : countdown(row.deadline, day)
  // Content shipped this week, by Claire or by Ally at her deadline: next, never having to.
  const offerAutopilot = content && (st.kind === "shipped" || st.kind === "held") && (!!s.approvedBy["approval-content"] || !!s.autoShipped["approval-content"]?.length)

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
        <span className="text-[13px] text-slate-500">From the next event</span>
      </span>
    )
  ) : (st.kind === "due" || st.kind === "overdue") && ask?.by === "ally" ? (
    // Ally's due date came and went: Claire sets the next one.
    <span className="flex w-[180px] flex-col items-center gap-1.5">
      <button type="button" onClick={() => askFor(row, "product")} className={cn(PRIMARY, "w-[180px]")}>
        Ask {row.analystName} by {dueFor(day).short}
      </button>
      {content && (
        <>
          <span className="text-[13px] text-slate-500">Ally ships it if not approved</span>
          <button type="button" onClick={() => approveMyself(row, "product")} className={LINK}>
            or approve it myself
          </button>
        </>
      )}
    </span>
  ) : content && (st.kind === "due" || st.kind === "overdue") ? (
    <button type="button" onClick={() => approveMyself(row, "product")} className={cn(PRIMARY, "w-[180px]")}>
      Approve it myself
    </button>
  ) : content && st.kind === "asked" ? (
    <button type="button" onClick={() => approveMyself(row, "product")} className={LINK}>
      Approve it myself
    </button>
  ) : null

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
            {(st.kind === "shipped" || st.kind === "held") && <Check className="mr-1 inline size-3.5 -translate-y-px" />}
            {st.text}
          </span>
          {deadline && <span className="mt-0.5 block text-[13px] font-medium text-warning-700">{deadline}</span>}
        </div>
      </div>
      <div className="text-right font-mono text-[15px] font-semibold text-slate-950 tabular-nums">{row.value}</div>
      <div className="justify-self-end">{action}</div>
      <div />
    </div>
  )
}
