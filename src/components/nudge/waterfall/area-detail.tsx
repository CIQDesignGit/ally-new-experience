"use client"

import { useState } from "react"
import { Check, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { TIER_GRID } from "../claire/nudge-tier"
import { AGENT_DOT } from "../agent-style"
import { tierView } from "../data"
import { rankLevers } from "../model"
import { useLive } from "../live-model"
import { useNudge } from "../nudge-context"
import { useFireNudge } from "../use-fire-nudge"
import { OwnerName } from "../owner-name"
import { AGENT_LABEL, type AgentId, type NudgeKey, type TierRow } from "../types"
import { PANEL, PANEL_BODY, PANEL_COLS, PANEL_HEAD } from "./panel"


const BUCKETS = [
  { tier: "approval", label: "One approval away" },
  { tier: "input", label: "Needs your team" },
  { tier: "autopilot", label: "On autopilot" },
] as const

/** The same outline button as the row nudges in the stage tables. */
const NUDGE_BTN =
  "whitespace-nowrap rounded-md border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700 shadow-xs transition-colors hover:border-brand-300 hover:text-brand-700"

function Status({ row, effort }: { row: TierRow; effort: string }) {
  const w = row.weekly
  if (!w) return <span className="text-slate-500">{effort}</span>
  if (w.state === "done") return <span className="font-medium text-success-700">{w.progress}</span>
  if (w.state === "in-progress") return <span className="font-medium text-info-700">In progress · {w.progress}</span>
  return <span className="text-slate-500">Emailed Mon · not started</span>
}

function AreaGroup({ agent, buckets, value }: { agent: AgentId; buckets: { label: string; effort: string; row: TierRow }[]; value: string }) {
  const [open, setOpen] = useState(false)
  const { nudged, nudgeMany } = useNudge()
  const { sendSlack } = useFireNudge()
  const owner = buckets.find((b) => b.row.analystName)?.row.analystName
  // Nudge the owner only for buckets they haven't started, same rule as the stage tables.
  const toNudge = buckets.map((b) => b.row).filter((r) => r.nudgeKey && r.weekly?.state === "not-started")
  const allNudged = toNudge.length > 0 && toNudge.every((r) => nudged[r.nudgeKey!])

  function nudgeOwner() {
    nudgeMany(toNudge.map((r) => r.nudgeKey!) as NudgeKey[])
    toNudge.forEach((r) => sendSlack(r))
  }

  return (
    <div className="border-t border-slate-100 first:border-t-0">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setOpen((o) => !o)}
        className={cn(TIER_GRID, "cursor-pointer py-3.5 outline-none")}
      >
        <span className="flex items-center gap-2.5 text-sm">
          {/* Disclosure at the leading edge, so the right edge holds only the value and the nudge. */}
          <ChevronRight className={cn("-ml-1 size-4 text-slate-400 transition-transform", open && "rotate-90")} />
          <span className={`size-2 rounded-sm ${AGENT_DOT[agent]}`} />
          <span className="font-medium text-slate-950">{AGENT_LABEL[agent]}</span>
          {owner && <OwnerName lever={agent} name={owner} className="font-normal text-slate-500" />}
        </span>
        <span className="text-right font-mono text-[15px] font-semibold text-slate-950 tabular-nums">{value}</span>
        <div className="justify-self-end">
          {toNudge.length > 0 &&
            (allNudged ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success-700">
                <Check className="size-4" />
                Nudged today
              </span>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  nudgeOwner()
                }}
                className={NUDGE_BTN}
              >
                Nudge
              </button>
            ))}
        </div>
        <span />
      </div>
      {open && (
        <div className="pb-2">
          {buckets.map((b) => (
            <div key={b.label} className={cn(TIER_GRID, "border-t border-slate-100 py-3 pl-[42px]")}>
              <div className="grid grid-cols-[168px_minmax(0,1fr)] items-start gap-4">
                <div>
                  <div className="text-sm text-slate-950">{b.label}</div>
                  <div className="mt-0.5 text-xs">
                    <Status row={b.row} effort={b.effort} />
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-slate-500">{b.row.description}</p>
              </div>
              <span className="text-right font-mono text-sm text-slate-700 tabular-nums">{b.row.value}</span>
              <span />
              <span />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * The "Total opportunity" drill-down, same content as before (each area opening to
 * its buckets, a nudge for its owner), laid out like the other stage tables: a title
 * bar with the total, column headers, hairline rows, values on one edge. Live.
 */
export function AreaDetail() {
  const { open, snapshot } = useLive()
  const { approved, policy, period } = useNudge()
  const views = BUCKETS.map((b) => ({ ...b, view: tierView(b.tier, approved, policy, period) }))

  return (
    <div className={PANEL}>
      <div className={`${TIER_GRID} ${PANEL_HEAD}`}>
        <span className="text-lg font-semibold text-slate-950">Open opportunity by area</span>
        <span className="text-right font-mono text-[15px] font-bold text-slate-950 tabular-nums">{open.totalLabel}</span>
        <span />
        <span />
      </div>
      <div className={`${TIER_GRID} ${PANEL_COLS}`}>
        <span>Area</span>
        <span className="text-right">Value</span>
        <span />
        <span />
      </div>
      <div className={PANEL_BODY}>
        {/* Soonest deadline first, then the most open dollars. */}
        {rankLevers(snapshot, approved).map((agent) => (
          <AreaGroup
            key={agent}
            agent={agent}
            value={open.byArea.find((a) => a.agent === agent)?.value ?? "—"}
            buckets={views.flatMap((v) => v.view.rows.filter((r) => r.agent === agent).map((row) => ({ label: v.label, effort: v.tier === "autopilot" ? "Already scheduled" : v.view.effort, row })))}
          />
        ))}
      </div>
    </div>
  )
}
