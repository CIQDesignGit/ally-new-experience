"use client"

import { useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { TIER_GRID } from "./nudge-tier"
import { useNudge } from "../nudge-context"
import { useFireNudge } from "../use-fire-nudge"
import { AGENT_DOT } from "../agent-style"
import { APPROVAL_TIER, AUTOPILOT_TIER, BANKED_VALUE, OPEN_BY_AREA, OPEN_TOTAL, TEAM_TIER, TOTAL_VALUE } from "../data"
import { AGENT_LABEL, type AgentId, type NudgeKey, type TierRow } from "../types"

const STATUSES: { label: string; effort: string; rows: TierRow[] }[] = [
  { label: "One approval away", effort: APPROVAL_TIER.effort, rows: APPROVAL_TIER.rows },
  { label: "Needs your team", effort: TEAM_TIER.effort, rows: TEAM_TIER.rows },
  { label: "On autopilot", effort: AUTOPILOT_TIER.effort, rows: AUTOPILOT_TIER.rows },
]

/** Content first for the demo, then the rest. */
const ORDER: AgentId[] = ["content", "ops", "media"]

function AreaRow({ status, effort, row }: { status: string; effort: string; row: TierRow }) {
  const { nudged } = useNudge()
  const { fire } = useFireNudge()
  const done = row.nudgeKey ? !!nudged[row.nudgeKey] : false
  return (
    <div className={cn(TIER_GRID, "group border-t border-slate-100 py-3.5 first:border-t-0")}>
      <div className="grid grid-cols-[168px_minmax(0,1fr)] items-start gap-4">
        <div>
          <div className="text-sm font-medium text-slate-900">{status}</div>
          <div className="mt-0.5 text-xs text-slate-500">
            {row.weekly ? (row.weekly.state === "in-progress" ? `In progress · ${row.weekly.progress}` : "Emailed Mon · not started") : effort}
          </div>
        </div>
        <p className="text-sm leading-relaxed text-slate-600">{row.description}</p>
      </div>
      <div className="text-right font-mono text-[15px] font-semibold text-slate-950 tabular-nums">{row.value}</div>
      <div className="justify-self-end">
        {row.nudgeKey &&
          (done ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success-700">
              <Check className="size-4" />
              Nudged today
            </span>
          ) : (
            <button
              type="button"
              onClick={() => fire(row)}
              className="whitespace-nowrap rounded-md border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-800 opacity-0 shadow-xs transition-opacity group-hover:opacity-100 hover:border-brand-300 hover:text-brand-700"
            >
              Nudge again
            </button>
          ))}
      </div>
      <div />
    </div>
  )
}

function AreaGroup({ agent }: { agent: AgentId }) {
  const [open, setOpen] = useState(false)
  const { nudged, nudgeMany } = useNudge()
  const { sendSlack } = useFireNudge()
  const items = STATUSES.flatMap((s) => s.rows.filter((r) => r.agent === agent).map((row) => ({ ...s, row })))
  const owner = items.find((i) => i.row.analystName)?.row.analystName
  const nudgeable = items.map((i) => i.row).filter((r) => r.nudgeKey)
  const allNudged = nudgeable.length > 0 && nudgeable.every((r) => nudged[r.nudgeKey!])
  const value = OPEN_BY_AREA.find((a) => a.agent === agent)?.value

  function nudgeOwner() {
    nudgeMany(nudgeable.map((r) => r.nudgeKey!) as NudgeKey[])
    nudgeable.forEach((r) => sendSlack(r))
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setOpen((o) => !o)}
        className={cn(TIER_GRID, "cursor-pointer px-6 py-3.5 hover:bg-slate-50")}
      >
        <div className="flex items-center gap-3">
          <span className={`size-2.5 rounded-sm ${AGENT_DOT[agent]}`} />
          <span className="text-lg font-semibold text-slate-950">{AGENT_LABEL[agent]}</span>
          {owner && <span className="text-sm text-slate-500">{owner}</span>}
        </div>
        <div className="text-right font-mono text-xl font-bold tracking-tight text-slate-950 tabular-nums">{value}</div>
        <div className="justify-self-end">
          {owner &&
            (allNudged ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success-700">
                <Check className="size-4" />
                {owner} nudged
              </span>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  nudgeOwner()
                }}
                className="whitespace-nowrap rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-xs transition-colors hover:bg-brand-600"
              >
                Nudge {owner}
              </button>
            ))}
        </div>
        <ChevronDown className={cn("size-4 justify-self-end text-slate-400 transition-transform", open && "rotate-180")} />
      </div>
      {open && (
        <div className="border-t border-slate-100 px-6 py-1.5">
          {items.map((i, n) => (
            <AreaRow key={n} status={i.label} effort={i.effort} row={i.row} />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * "By area": the same open opportunity regrouped by content, ops and media, each
 * opening to its statuses. withBanked adds this quarter's banked line so the
 * total matches the waterfall's Total bar.
 */
export function AreaView({ withBanked = false }: { withBanked?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      {ORDER.map((a) => (
        <AreaGroup key={a} agent={a} />
      ))}
      {withBanked && (
        <div className={`${TIER_GRID} rounded-xl border border-success-200 bg-success-50/50 px-6 py-3.5`}>
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-slate-950">Banked</span>
            <span className="rounded-full bg-success-100 px-2 py-0.5 text-xs font-medium text-success-700">Live this quarter</span>
          </div>
          <div className="text-right font-mono text-xl font-bold tracking-tight text-slate-950 tabular-nums">{BANKED_VALUE}</div>
          <div />
          <div />
        </div>
      )}
      <div className={`${TIER_GRID} mt-1 border-t border-slate-200 px-6 pt-4`}>
        <div className="text-[15px] font-semibold text-slate-950">{withBanked ? "Total opportunity" : "Total open this quarter"}</div>
        <div className="text-right font-mono text-2xl font-bold tracking-tight text-slate-950 tabular-nums">{withBanked ? TOTAL_VALUE : OPEN_TOTAL}</div>
        <div />
      </div>
    </div>
  )
}
