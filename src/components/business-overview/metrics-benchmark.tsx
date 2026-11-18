"use client"

import { Fragment } from "react"
import { ChevronDown } from "lucide-react"
import { Widget, WidgetBody, WidgetHeader } from "@/components/layout/page-frame"
import { BENCHMARK_COLUMNS, BENCHMARK_GRID } from "./data"
import { Trend } from "./trend"
import { cn } from "@/lib/utils"

export function MetricsBenchmark() {
  return (
    <Widget>
      <WidgetHeader>
        <button type="button" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-950">
          Benchmarking metrics <ChevronDown className="size-4 text-slate-500" aria-hidden />
        </button>
      </WidgetHeader>
      <WidgetBody pad={false} className="overflow-x-auto">
        <table className="w-full min-w-[880px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-medium text-slate-500">
              <th className="px-4 py-3 text-left font-medium sm:px-10" scope="col">
                Metric
              </th>
              {BENCHMARK_COLUMNS.map((c) => (
                <th key={c} className="px-3 py-3 text-center font-mono font-medium" scope="col">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BENCHMARK_GRID.map((group) => (
              <Fragment key={group.title}>
                <tr className="bg-slate-50">
                  <td colSpan={BENCHMARK_COLUMNS.length + 1} className="px-4 py-2 text-xs font-semibold tracking-wide text-slate-500 uppercase sm:px-10">
                    {group.title}
                  </td>
                </tr>
                {group.rows.map((row) => (
                  <tr key={row.id} className={cn("border-t border-slate-200", row.cells.some((c) => c.highlight) && "bg-slate-50")}>
                    <td className="px-4 py-3 text-slate-700 sm:px-10">
                      <span className="inline-flex items-center gap-1">
                        {row.label}
                        <ChevronDown className="size-3 text-slate-400" aria-hidden />
                      </span>
                    </td>
                    {row.cells.map((cell, i) => (
                      <td key={i} className="px-3 py-3 text-center">
                        <p className="font-mono text-slate-950 tabular-nums">{cell.value}</p>
                        <Trend pct={cell.pct} className="justify-center" />
                      </td>
                    ))}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </WidgetBody>
    </Widget>
  )
}