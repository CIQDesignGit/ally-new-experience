"use client"

import { cn } from "@/lib/utils"
import { BUSINESS, fmtBiz, fmtM, fmtValue } from "../data"
import type { WaterfallStage } from "../data"
import { useLive } from "../live-model"

const CHART_HEIGHT = 300
/** Fixed so every column is the same total height — otherwise items-end floats the bars to different baselines. */
const LABEL_HEIGHT = 72
/** Column top padding, above the chart band; the plan line is positioned against it. */
const PAD_TOP = 32
/**
 * The axis starts above zero so a small step is still visible next to a big base
 * (said on the chart): 90% of the lower of run rate and plan, rounded down.
 */
export const axisMin = (pace: number, plan: number) => {
  const v = Math.min(pace, plan) * 0.9
  return v >= 10 ? Math.floor(v) : Math.floor(v * 2) / 2
}
/** Steps under $1M read in K ("+$86K"), like every other number. */
const fmtStep = (v: number) => (v >= 1 ? fmtM(v) : fmtValue(v))

const BAR: Record<string, string> = {
  // One color per job (DESIGN.md): magenta is Ally's drafted work, waiting on one approval.
  pace: "bg-slate-300",
  approval: "bg-ally-500",
  team: "bg-team",
  autopilot: "bg-autopilot",
  total: "bg-ink",
}

export type WaterfallSelection = WaterfallStage["id"] | "total"

export interface Column {
  key: string
  label: string
  sub?: string
  valueLabel: string
  start: number
  end: number
  selectable: boolean
}

/** Current run rate → + each open bucket → where Ally takes you, against the plan line. */
export function buildColumns(stages: WaterfallStage[], pace: number, min: number): Column[] {
  let acc = pace
  const steps = stages.map((s) => {
    const sub = s.caption ?? s.effort
    const col = { key: s.id, label: s.label, sub, valueLabel: `+${fmtStep(s.value)}`, start: acc, end: acc + s.value, selectable: true }
    acc += s.value
    return col
  })
  return [
    { key: "pace", label: "Current run rate", sub: "", valueLabel: fmtBiz(pace), start: min, end: pace, selectable: false },
    ...steps,
    { key: "total", label: "Total opportunity", sub: "", valueLabel: `$${acc.toFixed(1)}M`, start: min, end: acc, selectable: true },
  ]
}

interface WaterfallChartProps {
  selectedId: WaterfallSelection
  onSelect: (id: WaterfallSelection) => void
}

/**
 * Bridge to plan: where the run rate lands, each open bucket stacked on top, and
 * where that takes Claire against her plan. Stages and the total are selectable;
 * the detail panel below shows the line items or the split by area.
 */
export function WaterfallChart({ selectedId, onSelect }: WaterfallChartProps) {
  const { stages, pace, period } = useLive()
  const { plan } = BUSINESS[period]
  const run = pace(period)
  const min = axisMin(run, plan)
  const columns = buildColumns(stages, run, min)
  const max = Math.max(columns[columns.length - 1].end, plan) * 1.03
  const frac = (v: number) => (v - min) / (max - min)
  const planTop = PAD_TOP + (1 - frac(plan)) * CHART_HEIGHT

  return (
    <div>
      <div className="relative flex items-end gap-3">
        <div className="pointer-events-none absolute inset-x-0 z-10 border-t-2 border-dashed border-slate-900/60" style={{ top: planTop }}>
          <span className="absolute -top-6 right-0 rounded bg-white px-1.5 font-mono text-xs font-semibold text-slate-950">Plan {fmtBiz(plan)}</span>
        </div>
        {columns.map((col, i) => {
          const topPct = (1 - frac(col.end)) * 100
          const heightPct = (frac(col.end) - frac(col.start)) * 100
          const next = columns[i + 1]
          const selected = col.selectable && col.key === selectedId
          return (
            <button
              key={col.key}
              type="button"
              disabled={!col.selectable}
              onClick={() => col.selectable && onSelect(col.key as WaterfallSelection)}
              className={cn(
                "group relative flex flex-1 flex-col items-center rounded-xl px-1 pb-2 transition-colors",
                col.selectable ? "cursor-pointer" : "cursor-default",
                selected ? "bg-brand-50 ring-1 ring-brand-200" : col.selectable && "hover:bg-slate-50",
              )}
              style={{ paddingTop: PAD_TOP }}
            >
              <div className="relative w-full" style={{ height: CHART_HEIGHT }}>
                {next && next.key !== "total" && (
                  <div className="absolute right-0 left-1/2 border-t border-dashed border-slate-300" style={{ top: `${topPct}%` }} />
                )}
                <div className="absolute inset-x-3 rounded-t-md" style={{ top: `${topPct}%`, height: `${heightPct}%`, minHeight: 6 }}>
                  <div
                    className={cn(
                      "size-full rounded-t-md transition-all",
                      // Every bar at full color: each color has one job, and the column highlight shows what's selected.
                      BAR[col.key],
                    )}
                  />
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 font-mono text-sm font-bold whitespace-nowrap text-slate-950 tabular-nums">
                    {col.valueLabel}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex flex-col items-center gap-0.5 px-1 text-center" style={{ height: LABEL_HEIGHT }}>
                <span
                  className={cn(
                    "text-[13px] leading-tight",
                    selected
                      ? "font-semibold text-brand-700"
                      : col.key === "total" || col.key === "pace"
                        ? "font-semibold text-slate-950"
                        : "text-slate-500 group-hover:text-slate-700",
                  )}
                >
                  {col.label}
                </span>
                {col.sub && <span className="text-[11px] text-slate-400">{col.sub}</span>}
                {selected && <span className="text-[11px] font-medium text-brand-600">Viewing ▾</span>}
                {col.selectable && !selected && (
                  <span className="text-[11px] text-brand-500 opacity-0 transition-opacity group-hover:opacity-100">Select</span>
                )}
              </div>
            </button>
          )
        })}
      </div>
      <div className="mt-1 text-[11px] text-slate-400">Axis starts at {fmtBiz(min)}</div>
    </div>
  )
}
