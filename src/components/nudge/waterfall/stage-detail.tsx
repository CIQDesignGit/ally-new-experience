"use client"

import { ClaireRow, ROW_COLS } from "../claire/claire-row"
import { PANEL, PANEL_BODY, PANEL_COLS, PANEL_HEAD } from "./panel"
import { rowAction, useClaireActions } from "../claire/claire-actions"
import { AutopilotDetail } from "./autopilot-detail"
/**
 * Owner, task and status · value · Claire's move (a 180px button, right-aligned in a 204px column so 40px sits
 * between the value and the button), when any row has one; else the value meets the card's edge.
 */
const gridFor = (moves: boolean) => `grid ${moves ? "grid-cols-[minmax(0,1fr)_100px_204px]" : "grid-cols-[minmax(0,1fr)_100px]"} items-center gap-4`
import { fmtM } from "../data"
import type { WaterfallStage } from "../data"
import { useLive } from "../live-model"
import { toM } from "../mvp"

/** The drill-down for a selected waterfall stage: its line items, with a nudge on each row whose owner hasn't started. */
export function StageDetail({ stage }: { stage: WaterfallStage }) {
  if (stage.id === "autopilot") return <AutopilotDetail stage={stage} />
  return <TierDetail stage={stage} />
}

function TierDetail({ stage }: { stage: WaterfallStage }) {
  const { s } = useClaireActions()
  // The MVP shows impact levels, not what the work is worth.
  const { mvp, impact } = useLive()
  // Each row is a whole workstream (a lever's part of the bucket), so it reads on the bucket scale.
  const levelOf = (value: string) => (mvp ? impact(toM(value)) : undefined)
  const moves = stage.rows.some((r) => rowAction(r, s))
  const TIER_GRID = gridFor(moves)

  return (
    <div className={PANEL}>
      {/* Same grid as the rows below, so the total sits over the values. Nudges live on each row, for whoever hasn't started. */}
      <div className={`${TIER_GRID} ${PANEL_HEAD}`}>
        <div className="min-w-0">
          <div className="text-lg font-semibold text-slate-950">{stage.label}</div>
          {stage.rows.length > 0 && (
            <div className="mt-0.5 text-sm text-slate-500">
              {`${stage.rows.length} workstreams · ${stage.effort} of your team's time`}
            </div>
          )}
        </div>
        {mvp ? (
          <span className="text-right text-[15px] font-bold text-slate-950">{impact(stage.value)}</span>
        ) : (
          <span className="text-right font-mono text-[15px] font-bold text-slate-950 tabular-nums">{fmtM(stage.value)}</span>
        )}
        {moves && <div />}
      </div>

      {stage.rows.length > 0 && (
        // Column headers in the same style as every other table on the page (see DeliveredHeader).
        <div className={`${TIER_GRID} ${PANEL_COLS}`}>
          <div className={`grid gap-4 ${ROW_COLS}`}>
            <span>Owner</span>
            <span>Task</span>
            <span className="hidden lg:block">Status</span>
          </div>
          <span className="text-right">{mvp ? "Impact" : "Value"}</span>
          {moves && <span />}
        </div>
      )}
      {stage.rows.length > 0 ? (
        <div className={PANEL_BODY}>
          {stage.rows.map((row, i) => (
            // Each row says where it stands and offers Claire's move: ask by a date, or approve it herself once it's due.
            <ClaireRow key={i} row={row} grid={TIER_GRID} showAction={moves} impact={levelOf(row.value)} />
          ))}
        </div>
      ) : (
        <div className="px-10 py-6 text-sm text-slate-500">{stage.note}</div>
      )}
    </div>
  )
}
