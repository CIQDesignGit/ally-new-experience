"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { AGENT_DOT } from "../agent-style"
import { AUTOPILOT_BEST_IN_CLASS, OPEN_BY_AREA, fmtM } from "../data"
import type { WaterfallStage } from "../data"
import { AGENT_LABEL, type AgentId } from "../types"
import { useLive } from "../live-model"
import { PANEL, PANEL_BODY, PANEL_COLS, PANEL_HEAD } from "./panel"

// Workstream, share vs best in class, value, action. The action column fits "Increase autopilot"
// so the button never runs into the value.
const GRID = "grid grid-cols-[minmax(0,1fr)_180px_88px_172px] items-center gap-5"
// Wide screens: description in its own column beside the workstream. Narrower: it stacks underneath.
const NAME_GRID = "grid gap-0.5 lg:grid-cols-[140px_minmax(0,1fr)] lg:gap-4"

/** "$0.2M" or "$200K" → $M. */
const money = (s: string) => parseFloat(s.replace(/[$KM,]/g, "")) / (s.endsWith("K") ? 1000 : 1)
const openOf = (agent: AgentId) => money(OPEN_BY_AREA.find((a) => a.agent === agent)!.value)

/** Share on autopilot as a filled track, best in class as a tick on the same track: the gap reads without math. */
function ShareBar({ share, best }: { share: number; best: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-mono text-[15px] font-semibold text-slate-950 tabular-nums">{share}%</span>
        <span className="text-slate-500">
          best in class <span className="font-mono font-medium text-slate-700 tabular-nums">{best}%</span>
        </span>
      </div>
      <div className="relative mt-1.5 h-1.5 rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-info-500" style={{ width: `${share}%` }} />
        <div className="absolute -top-1 h-3.5 w-0.5 rounded-full bg-slate-700" style={{ left: `${best}%` }} aria-hidden />
      </div>
    </div>
  )
}

/**
 * The autopilot drill-down: for each workstream, how much of its open money
 * already runs itself against best in class, and the action that closes the
 * gap. Same pattern as Nudge: all at once in the header, or one row on hover.
 */
export function AutopilotDetail({ stage }: { stage: WaterfallStage }) {
  const [raised, setRaised] = useState<Partial<Record<AgentId, boolean>>>({})
  // The MVP shows impact levels, not what the work is worth.
  const { mvp, impact } = useLive()

  const rows = stage.rows.map((r) => {
    const open = openOf(r.agent)
    return { ...r, share: Math.round((money(r.value) / open) * 100), best: AUTOPILOT_BEST_IN_CLASS[r.agent], open }
  })
  const totalOpen = rows.reduce((s, r) => s + r.open, 0)
  const share = Math.round((stage.value / totalOpen) * 100)
  const best = Math.round((rows.reduce((s, r) => s + (r.best / 100) * r.open, 0) / totalOpen) * 100)

  function raise(agents: AgentId[]) {
    setRaised((prev) => ({ ...prev, ...Object.fromEntries(agents.map((a) => [a, true])) }))
    toast.success(agents.length > 1 ? "Autopilot increased for content, media and ops" : `Autopilot increased for ${agents[0]}`, { position: "top-right" })
  }

  return (
    <div className={PANEL}>
      <div className={cn(GRID, PANEL_HEAD)}>
        <div className="col-span-2 min-w-0">
          <div className="text-lg font-semibold text-slate-950">{stage.label}</div>
          <div className="mt-0.5 text-sm text-slate-500">
            <span className="font-mono font-semibold text-slate-950">{share}%</span> of your open {mvp ? "work" : "opportunity"} runs itself. Best-in-class brands run{" "}
            <span className="font-mono font-semibold text-slate-950">{best}%</span>.
          </div>
        </div>
        {mvp ? (
          <span className="text-right text-[15px] font-bold text-slate-950">{impact(stage.value)}</span>
        ) : (
          <span className="text-right font-mono text-[15px] font-bold text-slate-950 tabular-nums">{fmtM(stage.value)}</span>
        )}
        <div />
      </div>

      <div className={cn(GRID, PANEL_COLS)}>
        <div className={NAME_GRID}>
          <span>Workstream</span>
          <span className="hidden lg:block">What runs itself</span>
        </div>
        <span>On autopilot vs best in class</span>
        <span className="text-right">{mvp ? "Impact" : "Value"}</span>
        <span />
      </div>

      <div className={PANEL_BODY}>
        {rows.map((r) => (
          <div key={r.agent} className={cn(GRID, "group border-t border-slate-100 py-3.5 first:border-t-0")}>
            <div className={cn(NAME_GRID, "items-start")}>
              <span className="flex items-center gap-2.5 text-sm font-medium text-slate-950">
                <span className={`size-2 rounded-sm ${AGENT_DOT[r.agent]}`} />
                {AGENT_LABEL[r.agent]}
              </span>
              <p className="ml-4.5 text-sm leading-relaxed text-slate-500 lg:ml-0">{r.description}</p>
            </div>
            <ShareBar share={r.share} best={r.best} />
            {mvp ? (
              <span className="text-right text-[15px] font-semibold text-slate-950">{impact(money(r.value))}</span>
            ) : (
              <span className="text-right font-mono text-[15px] font-semibold text-slate-950 tabular-nums">{r.value}</span>
            )}
            <div className="justify-self-end">
              {raised[r.agent] ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success-700">
                  <Check className="size-4" />
                  Increased
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => raise([r.agent])}
                  className="rounded-md border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium whitespace-nowrap text-slate-700 shadow-xs transition-colors hover:border-brand-300 hover:text-brand-700"
                >
                  Increase autopilot
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
