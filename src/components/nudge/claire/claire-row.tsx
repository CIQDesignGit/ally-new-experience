"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { OwnerName } from "../owner-name"
import { AGENT_DOT } from "../agent-style"
import { AGENT_LABEL, type TierRow } from "../types"
import { PRIMARY } from "../mike/buttons"
import { countdown, dueFor, rowAction, useClaireActions } from "./claire-actions"
import { useNudge } from "../nudge-context"

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

export function ClaireRow({ row, grid, showAction, impact }: { row: TierRow; grid: string; /** The table has a button column (some row has a move). */ showAction: boolean; /** The MVP shows the row's impact level in place of its value. */ impact?: string }) {
  const { statusOf, assignFor, askFor, approveMyself, autopilotSeasonal, day, s } = useClaireActions()
  const { retailer } = useNudge()
  const st = statusOf(row)
  const move = rowAction(row, s)
  const content = row.nudgeKey === "approval-content"
  const ask = row.nudgeKey ? s.asks[row.nudgeKey] : undefined
  const deadline = st.kind === "shipped" || st.kind === "held" ? undefined : countdown(row.deadline, day)

  const due = ask ? ask.due.split(",")[0] : ""
  const did = (text: string) => (
    // Same 40px box as the button it replaces, so it sits where the button sat.
    <span className="inline-flex h-10 w-[180px] items-center justify-center gap-1.5 text-sm font-medium whitespace-nowrap text-success-700">
      <Check className="size-4" /> {text}
    </span>
  )

  // The queues behind these rows are Amazon's: another retailer's view shows the work, and acting happens on Amazon's.
  const action = retailer !== "amazon" ? (
      <span className="inline-flex h-10 w-[180px] items-center justify-center text-[13px] text-slate-500">Act in the Amazon view</span>
    ) : move === "autopilot-done" ? (
      did("Seasonal on autopilot")
    ) : move === "autopilot" ? (
      <span className="flex w-[180px] flex-col items-center gap-1.5">
        <button type="button" onClick={() => autopilotSeasonal("product")} className={cn(PRIMARY, "w-[180px]")}>
          Put seasonal on autopilot
        </button>
        <span className="text-[13px] text-slate-500">From the next event</span>
      </span>
    ) : move === "assign" ? (
      <button type="button" onClick={() => assignFor(row, "product")} className={cn(PRIMARY, "w-[180px]")}>
        Assign
      </button>
    ) : move === "assigned" ? (
      did(`Assigned · due ${due}`)
    ) : move === "ask" ? (
      // Wednesday came and went: Claire sets the next date.
      <span className="flex w-[180px] flex-col items-center gap-1.5">
        <button type="button" onClick={() => askFor(row, "product")} className={cn(PRIMARY, "w-[180px]")}>
          Assign · due {dueFor(day).short}
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
    ) : move === "asked" ? (
      <span className="flex w-[180px] flex-col items-center gap-1.5">
        {did(`Assigned · due ${due}`)}
        {content && (
          <>
            {ask?.ship && <span className="text-[13px] text-slate-500">Ally ships it if not approved</span>}
            <button type="button" onClick={() => approveMyself(row, "product")} className={LINK}>
              or approve it myself
            </button>
          </>
        )}
      </span>
    ) : move === "approve" ? (
      <button type="button" onClick={() => approveMyself(row, "product")} className={cn(PRIMARY, "w-[180px]")}>
        Approve it myself
      </button>
    ) : null

  return (
    // Text and value share the row's first line; the button centers on the row.
    <div className={cn(grid, "group items-start border-t border-slate-100 py-3.5 first:border-t-0")}>
      <div className="grid grid-cols-[168px_minmax(0,1fr)] items-start gap-4 lg:grid-cols-[168px_minmax(0,1fr)_180px]">
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
        <p className="text-sm leading-5 text-slate-600">{row.description}</p>
        <div className="text-sm leading-5">
          <span className={cn("font-medium", TONE[st.kind])}>
            {(st.kind === "shipped" || st.kind === "held") && <Check className="mr-1 inline size-3.5 -translate-y-px" />}
            {st.work}
          </span>
          {deadline && <span className="mt-0.5 block text-[13px] font-medium text-warning-700">{deadline}</span>}
        </div>
      </div>
      {impact ? (
        <div className="text-right text-[15px] leading-5 font-semibold text-slate-950">{impact}</div>
      ) : (
        <div className="text-right font-mono text-[15px] leading-5 font-semibold text-slate-950 tabular-nums">{row.value}</div>
      )}
      {/* The button centers on the row's first line, level with the status and value (a 40px button on a 20px line). */}
      {showAction && <div className="-mt-2.5 self-start justify-self-end">{action}</div>}
    </div>
  )
}
