"use client"

import type { ReactNode } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"] as const

type Span = { from: number; to: number }

function dayTone(
  day: number,
  primary?: Span,
  compare?: Span,
  disabledAfter?: number,
  today?: number,
) {
  if (disabledAfter != null && day > disabledAfter) return "disabled" as const
  if (today === day) return "today" as const
  const inPrimary = primary && day >= primary.from && day <= primary.to
  const inCompare = compare && day >= compare.from && day <= compare.to
  if (inPrimary && inCompare) return "both" as const
  if (inPrimary) {
    if (day === primary.from && day === primary.to) return "primary-single" as const
    if (day === primary.from) return "primary-start" as const
    if (day === primary.to) return "primary-end" as const
    return "primary-mid" as const
  }
  if (inCompare) {
    if (day === compare.from && day === compare.to) return "compare-single" as const
    if (day === compare.from) return "compare-start" as const
    if (day === compare.to) return "compare-end" as const
    return "compare-mid" as const
  }
  return "plain" as const
}

const cellClass: Record<ReturnType<typeof dayTone>, string> = {
  plain: "text-slate-700",
  disabled: "text-slate-300",
  today: "text-slate-900 underline decoration-slate-400 underline-offset-4",
  "primary-single": "rounded-md bg-brand-600 font-semibold text-white",
  "primary-start": "rounded-l-md bg-brand-600 font-semibold text-white",
  "primary-end": "rounded-r-md bg-brand-600 font-semibold text-white",
  "primary-mid": "bg-brand-100 font-medium text-brand-900",
  "compare-single": "rounded-md bg-warning-500 font-semibold text-white",
  "compare-start": "rounded-l-md bg-warning-500 font-semibold text-white",
  "compare-end": "rounded-r-md bg-warning-500 font-semibold text-white",
  "compare-mid": "bg-warning-100 font-medium text-warning-900",
  both: "bg-brand-100 font-semibold text-brand-900 ring-1 ring-warning-400 ring-inset",
}

export function DateRangeMonthGrid({
  title,
  weekNumbers,
  startPad,
  daysInMonth,
  primary,
  compare,
  disabledAfter,
  today,
  showNav,
}: {
  title: string
  weekNumbers: number[]
  startPad: number
  daysInMonth: number
  primary?: Span
  compare?: Span
  disabledAfter?: number
  today?: number
  showNav?: "prev" | "next" | "both" | "none"
}) {
  const totalCells = startPad + daysInMonth
  const weekCount = Math.ceil(totalCells / 7)
  const rows: ReactNode[] = []

  for (let w = 0; w < weekCount; w++) {
    rows.push(
      <span key={`wn-${w}`} className="py-1 font-mono text-[10px] text-slate-400">
        {weekNumbers[w] ?? ""}
      </span>,
    )
    for (let col = 0; col < 7; col++) {
      const idx = w * 7 + col
      const day = idx - startPad + 1
      if (day < 1 || day > daysInMonth) {
        rows.push(<span key={`e-${w}-${col}`} />)
        continue
      }
      const tone = dayTone(day, primary, compare, disabledAfter, today)
      rows.push(
        <span
          key={`d-${day}`}
          className={cn(
            "mx-px flex h-8 items-center justify-center font-mono text-[11px]",
            cellClass[tone],
          )}
        >
          {day}
        </span>,
      )
    }
  }

  return (
    <div className="min-w-[252px]">
      <div className="relative mb-3 flex items-center justify-center">
        {showNav === "prev" || showNav === "both" ? (
          <button
            type="button"
            className="absolute left-0 rounded-md p-1 text-slate-500 hover:bg-slate-100"
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4" />
          </button>
        ) : null}
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        {showNav === "next" || showNav === "both" ? (
          <button
            type="button"
            className="absolute right-0 rounded-md p-1 text-slate-500 hover:bg-slate-100"
            aria-label="Next month"
          >
            <ChevronRight className="size-4" />
          </button>
        ) : null}
      </div>
      <div className="grid grid-cols-[28px_repeat(7,minmax(0,1fr))] gap-y-0.5 text-center text-xs">
        <span className="pb-1 text-slate-400">W#</span>
        {WEEKDAYS.map((d, i) => (
          <span key={`h-${i}`} className="pb-1 font-medium text-slate-500">
            {d}
          </span>
        ))}
        {rows}
      </div>
    </div>
  )
}