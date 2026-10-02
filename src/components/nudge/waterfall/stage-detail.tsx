"use client"

import { ClaireRow } from "../claire/claire-row"
import { rowAction, useClaireActions } from "../claire/claire-actions"
import { AutopilotDetail } from "./autopilot-detail"
/**
 * Owner, task and status · value · Claire's move (a 180px button, right-aligned in a 204px column so 40px sits
 * between the value and the button), when any row has one; else the value meets the card's edge.
 */
const gridFor = (moves: boolean) => `grid ${moves ? "grid-cols-[minmax(0,1fr)_100px_204px]" : "grid-cols-[minmax(0,1fr)_100px]"} items-center gap-4`
import { fmtM } from "../data"
import type { WaterfallStage } from "../data"

/** The drill-down for a selected waterfall stage: its line items, with a nudge on each row whose owner hasn't started. */
export function StageDetail({ stage }: { stage: WaterfallStage }) {
  if (stage.id === "autopilot") return <AutopilotDetail stage={stage} />
  return <TierDetail stage={stage} />
}

function TierDetail({ stage }: { stage: WaterfallStage }) {
  const { s } = useClaireActions()
  const moves = stage.rows.some((r) => rowAction(r, s))
  const TIER_GRID = gridFor(moves)

  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
      {/* Same grid as the rows below, so the total sits over the values. Nudges live on each row, for whoever hasn't started. */}
      <div className={`${TIER_GRID} border-b border-slate-100 bg-slate-25 px-6 py-4`}>
        <span className="text-lg font-semibold text-slate-950">{stage.label}</span>
        <span className="text-right font-mono text-[15px] font-bold text-slate-950 tabular-nums">{fmtM(stage.value)}</span>
        {moves && <div />}
      </div>

      {stage.rows.length > 0 && (
        // Column headers in the same style as every other table on the page (see DeliveredHeader).
        <div className={`${TIER_GRID} px-6 pt-3 pb-1 text-xs font-medium text-slate-500`}>
          <div className="grid grid-cols-[168px_minmax(0,1fr)] gap-4 lg:grid-cols-[168px_minmax(0,1fr)_180px]">
            <span>Owner</span>
            <span>Task</span>
            <span className="hidden lg:block">Status</span>
          </div>
          <span className="text-right">Value</span>
          {moves && <span />}
        </div>
      )}
      {stage.rows.length > 0 ? (
        <div className="px-6 pb-1.5">
          {stage.rows.map((row, i) => (
            // Each row says where it stands and offers Claire's move: ask by a date, or approve it herself once it's due.
            <ClaireRow key={i} row={row} grid={TIER_GRID} showAction={moves} />
          ))}
        </div>
      ) : (
        <div className="px-6 py-5 text-sm text-slate-500">{stage.note}</div>
      )}
    </div>
  )
}
