"use client"

import { cn } from "@/lib/utils"
import { BUSINESS, fmtBiz, fmtM, fmtValue } from "../data"
import type { WaterfallStage } from "../data"
import { useLive } from "../live-model"
import { IMPACT_HEIGHT, gapUnit, type Impact } from "../mvp"
import { InfoIcon } from "../ui/info-icon"
import { DEMO_LAYOUT_MIN_PX } from "@/lib/breakpoints"

const CHART_HEIGHT = 300
/** Below this width the bridge squashes; scroll horizontally instead of reflowing. */
const CHART_MIN_WIDTH = DEMO_LAYOUT_MIN_PX
/** Fixed so every column is the same total height — otherwise items-end floats the bars to different baselines. */
const LABEL_HEIGHT = 72
/** Headroom above each bar so value pills are not clipped. */
const VALUE_HEADROOM = 32
/** Column top padding, above the chart band; the plan line is positioned against it. */
const PAD_TOP = 32 + VALUE_HEADROOM
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
  /** Signed step size for this bucket (vision: same as valueLabel; MVP: shown in the legend). */
  stepLabel?: string
  impact?: Impact
  start: number
  end: number
  selectable: boolean
}

/** Dollar label on a bar or in the legend (MVP: open $; bar height still reflects impact). */
function amountLabel(col: Column, mvp: boolean): string | null {
  if (col.key === "total") {
    if (mvp) return col.stepLabel ? `${col.stepLabel} open` : null
    return col.valueLabel || null
  }
  if (col.key === "pace") return col.valueLabel || null
  const step = col.stepLabel ?? (mvp ? null : col.valueLabel)
  if (!step) return null
  return mvp ? `${step} open` : step
}

/** Same dollars without the MVP "open" suffix (under column titles). */
function amountShort(col: Column, mvp: boolean): string | null {
  if (col.key === "pace") return col.valueLabel || null
  if (col.key === "total") return (mvp ? col.stepLabel : col.valueLabel) ?? col.stepLabel ?? null
  return col.stepLabel ?? col.valueLabel ?? null
}

function BarValue({ col, mvp }: { col: Column; mvp: boolean }) {
  const text = amountLabel(col, mvp)
  if (!text) return null
  return (
    <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-1 -translate-x-1/2 font-mono text-xs font-semibold whitespace-nowrap text-slate-950 tabular-nums">
      {text}
    </span>
  )
}

/** Current run rate → + each open bucket → where Ally takes you, against the plan line. */
export function buildColumns(stages: WaterfallStage[], pace: number, min: number): Column[] {
  let acc = pace
  const steps = stages.map((s) => {
    const sub = s.caption ?? s.effort
    const col = { key: s.id, label: s.label, sub, valueLabel: `+${fmtStep(s.value)}`, stepLabel: `+${fmtStep(s.value)}`, start: acc, end: acc + s.value, selectable: true }
    acc += s.value
    return col
  })
  return [
    { key: "pace", label: "Current run rate", sub: "", valueLabel: fmtBiz(pace), start: min, end: pace, selectable: false },
    ...steps,
    { key: "total", label: "Total opportunity", sub: "", valueLabel: `$${acc.toFixed(1)}M`, stepLabel: `+${fmtStep(acc - pace)}`, start: min, end: acc, selectable: true },
  ]
}

/**
 * The MVP's bridge: the same run rate and plan line, but each bucket stands at
 * its impact level instead of its dollars, and the total has no number. Heights are a
 * share of the gap, so the stack always stops below the plan line: the chart
 * ranks the work, it never claims to close the gap.
 */
export function buildImpactColumns(stages: WaterfallStage[], pace: number, plan: number, min: number, impact: (v: number) => Impact): Column[] {
  const unit = gapUnit(plan, pace)
  let acc = pace
  const steps = stages.map((s) => {
    const level = impact(s.value)
    const col = {
      key: s.id,
      label: s.label,
      sub: s.caption ?? s.effort,
      valueLabel: level,
      stepLabel: `+${fmtStep(s.value)}`,
      impact: level,
      start: acc,
      end: acc + unit * IMPACT_HEIGHT[level],
      selectable: true,
    }
    acc = col.end
    return col
  })
  const openTotal = stages.reduce((n, s) => n + s.value, 0)
  return [
    { key: "pace", label: "Current run rate", sub: "", valueLabel: fmtBiz(pace), start: min, end: pace, selectable: false },
    ...steps,
    {
      key: "total",
      label: "Total opportunity",
      sub: "",
      valueLabel: "",
      stepLabel: `+${fmtStep(openTotal)}`,
      start: min,
      end: acc,
      selectable: false,
    },
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
  const { stages, pace, period, mvp, impact } = useLive()
  const { plan } = BUSINESS[period]
  const run = pace(period)
  const min = axisMin(run, plan)
  const columns = mvp ? buildImpactColumns(stages, run, plan, min, impact) : buildColumns(stages, run, min)
  const max = Math.max(columns[columns.length - 1].end, plan) * 1.03
  const frac = (v: number) => (v - min) / (max - min)
  const planTop = PAD_TOP + (1 - frac(plan)) * CHART_HEIGHT
  const gap = plan - run
  const landed = columns[columns.length - 1].end - plan

  return (
    <div className="-mx-1 overflow-x-auto overflow-y-visible px-1 pt-1">
      <div className="relative flex items-end gap-3" style={{ minWidth: CHART_MIN_WIDTH }}>
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
                "group relative flex min-w-[120px] flex-1 flex-col items-center rounded-xl px-1 pb-2 transition-colors",
                col.selectable ? "cursor-pointer" : "cursor-default",
                selected ? "bg-brand-50" : col.selectable && "hover:bg-slate-50",
              )}
              style={{ paddingTop: PAD_TOP }}
            >
              <div className="relative w-full" style={{ height: CHART_HEIGHT }}>
                {next && next.key !== "total" && (
                  <div className="absolute right-0 left-1/2 border-t border-dashed border-slate-300" style={{ top: `${topPct}%` }} />
                )}
                {col.key === "pace" && gap > 0 && (
                  // The gap, drawn where it is: from the run rate up to the plan line.
                  <div className="pointer-events-none absolute -right-2 z-20 w-2 border-y-2 border-r-2" style={{ borderColor: "var(--color-error-600)", top: `${(1 - frac(plan)) * 100}%`, height: `${(frac(plan) - frac(run)) * 100}%` }}>
                    <span className="absolute top-1/2 right-3 -translate-y-1/2 rounded bg-white px-1 font-mono text-xs font-semibold whitespace-nowrap text-error-600">{fmtBiz(gap)} gap</span>
                  </div>
                )}
                <div className="absolute inset-x-3 rounded-t-md" style={{ top: `${topPct}%`, height: `${heightPct}%`, minHeight: 6 }}>
                  <BarValue col={col} mvp={mvp} />
                  <div className={cn("size-full rounded-t-md transition-all", BAR[col.key])} />
                </div>
              </div>
              <div className="mt-3 flex flex-col items-center gap-0.5 px-1 text-center" style={{ height: LABEL_HEIGHT }}>
                <span
                  className={cn(
                    "text-[13px] leading-tight font-semibold",
                    selected ? "text-brand-700" : "text-slate-950",
                  )}
                >
                  {col.label}
                </span>
                {amountShort(col, mvp) && col.key !== "pace" && (
                  <span className="font-mono text-xs font-semibold text-slate-950 tabular-nums">{amountShort(col, mvp)}</span>
                )}
                {col.sub && <span className="text-xs text-slate-500">{col.sub}</span>}
                {col.key === "total" && !mvp && (
                  <span className={cn("text-[11px] font-medium", landed >= 0 ? "text-success-700" : "text-error-600")}>
                    ${Math.abs(landed).toFixed(1)}M {landed >= 0 ? "over" : "short of"} plan
                  </span>
                )}
                {col.selectable && !selected && (
                  <span className="text-[11px] text-brand-500 opacity-0 transition-opacity group-hover:opacity-100">Select</span>
                )}
              </div>
            </button>
          )
        })}
        {/* The baseline the bars stand on; drawn over the columns so the selected column's tint doesn't hide it. */}
        <div className="pointer-events-none absolute inset-x-0 z-10 border-t border-slate-300" style={{ top: PAD_TOP + CHART_HEIGHT }} />
      </div>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-100 pt-4">
        {columns
          .filter((c) => BAR[c.key])
          .map((c) => (
            <span key={c.key} className="inline-flex items-center gap-2 text-xs text-slate-700">
              <span className={cn("size-2.5 shrink-0 rounded-sm", BAR[c.key])} aria-hidden />
              <span className="font-medium text-slate-950">{c.label}</span>
              {amountShort(c, mvp) && <span className="font-mono tabular-nums text-slate-600">{amountShort(c, mvp)}</span>}
            </span>
          ))}
      </div>
      <div className="mt-3 flex items-center gap-1 text-[11px] text-slate-500">
        Axis starts at {fmtBiz(min)}
        {mvp && (
          <InfoIcon
            title="Impact"
            align="left"
            points={[
              "Bar height ranks impact on the gap to plan, not dollars",
              "Labels show open opportunity in dollars",
              "High / Medium / Low appear in the detail table below",
            ]}
          />
        )}
      </div>
    </div>
  )
}
