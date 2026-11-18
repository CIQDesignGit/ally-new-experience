"use client"

import type { CSSProperties } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Kpi } from "./data"
import { Trend } from "./trend"

export function PerformanceKpiTile({
  kpi,
  selected,
  onToggle,
}: {
  kpi: Kpi
  selected: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={cn(
        "relative flex min-h-[6.5rem] w-full flex-col rounded-lg bg-white px-3 py-3 text-left ring-1 ring-slate-200 transition-shadow hover:shadow-sm",
        selected && "border-t-2 ring-2",
      )}
      style={
        selected
          ? ({ borderTopColor: kpi.chartColor, ["--tw-ring-color" as string]: `${kpi.chartColor}66` } as CSSProperties)
          : undefined
      }
    >
      <span className="inline-flex items-center gap-0.5 text-xs text-slate-500">
        <span className="line-clamp-2 text-left">{kpi.label}</span>
        <ChevronDown className="size-3 shrink-0 text-slate-400" aria-hidden />
      </span>
      <span className="mt-1 font-mono text-xl font-semibold text-slate-950 tabular-nums">{kpi.value}</span>
      <Trend pct={kpi.changePct} className="mt-1" />
    </button>
  )
}