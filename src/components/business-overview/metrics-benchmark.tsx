"use client"

import { Fragment, useMemo, useState } from "react"
import { ChevronDown, Download, GripVertical, LineChart, Plus, X } from "lucide-react"
import { Widget, WidgetBody, WidgetHeader } from "@/components/layout/page-frame"
import { SECONDARY } from "@/components/nudge/mike/buttons"
import { BENCHMARK_GRID, BENCHMARK_SKUS } from "./data"
import { BenchmarkMetricPicker } from "./benchmark-metric-picker"
import { Trend } from "./trend"
import { cn } from "@/lib/utils"

type RowSelection = { choiceId: string | null; label: string }

function initialSelections(): Record<string, RowSelection> {
  const map: Record<string, RowSelection> = {}
  for (const group of BENCHMARK_GRID) {
    for (const row of group.rows) {
      map[row.id] = { choiceId: null, label: row.label }
    }
  }
  return map
}

export function MetricsBenchmark() {
  const [selections, setSelections] = useState(initialSelections)
  const [skus, setSkus] = useState(BENCHMARK_SKUS)
  const rows = useMemo(() => BENCHMARK_GRID, [])

  function onMetricSelect(rowId: string, choiceId: string, displayLabel: string) {
    setSelections((prev) => ({ ...prev, [rowId]: { choiceId, label: displayLabel } }))
  }

  function removeSku(id: string) {
    setSkus((prev) => prev.filter((s) => s.id !== id))
  }

  const colCount = skus.length + 1

  return (
    <Widget>
      <WidgetHeader className="flex items-center justify-between gap-3">
        <button type="button" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-950">
          Benchmarking SKU <ChevronDown className="size-4 text-slate-500" aria-hidden />
        </button>
        <button type="button" className={cn(SECONDARY, "size-9 p-0")} aria-label="Export">
          <Download className="size-4" />
        </button>
      </WidgetHeader>
      <WidgetBody pad={false} className="pt-4">
        <div className="mx-4 mb-3 flex items-start gap-2 rounded-lg bg-info-50 px-3 py-2.5 text-sm text-info-700 ring-1 ring-info-100 sm:mx-10">
          <LineChart className="mt-0.5 size-4 shrink-0" aria-hidden />
          Hover on any metric on the left panel and click this icon to plot the graph for the benchmarked entities.
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="w-52 px-4 py-3 text-left align-bottom sm:w-56 sm:px-10" scope="col">
                  <div className="flex flex-col items-start gap-3">
                    <button
                      type="button"
                      className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-brand-700 hover:bg-slate-100"
                      aria-label="Add SKU to benchmark"
                    >
                      <Plus className="size-6" />
                    </button>
                    <span className="text-xs font-medium text-slate-500">Metric</span>
                  </div>
                </th>
                {skus.map((sku) => (
                  <th key={sku.id} className="min-w-[9.5rem] px-3 py-3 text-right align-bottom" scope="col">
                    <div className="ml-auto flex w-full max-w-[11rem] flex-col items-end gap-2">
                      <img
                        src={sku.image}
                        alt=""
                        className="size-20 rounded-lg object-contain ring-1 ring-slate-200"
                      />
                      <p className="line-clamp-2 w-full text-right text-[11px] leading-snug font-normal text-slate-600">
                        {sku.name}
                      </p>
                      <div className="flex w-full items-center gap-1 rounded-md border border-slate-200 bg-white px-1.5 py-1">
                        <GripVertical className="size-3.5 shrink-0 text-slate-400" aria-hidden />
                        <span className="min-w-0 flex-1 truncate text-left font-mono text-[11px] font-medium text-slate-950">
                          {sku.id}
                        </span>
                        <ChevronDown className="size-3 shrink-0 text-slate-400" aria-hidden />
                        <button
                          type="button"
                          className="shrink-0 text-slate-400 hover:text-slate-700"
                          aria-label={`Remove ${sku.id}`}
                          onClick={() => removeSku(sku.id)}
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((group) => (
                <Fragment key={group.title}>
                  <tr className="bg-slate-50">
                    <td
                      colSpan={colCount}
                      className="px-4 py-2 text-xs font-semibold tracking-wide text-slate-500 uppercase sm:px-10"
                    >
                      {group.title}
                    </td>
                  </tr>
                  {group.rows.map((row) => {
                    const sel = selections[row.id]
                    return (
                      <tr
                        key={row.id}
                        className={cn(
                          "border-t border-slate-200",
                          row.cells.some((c) => c.highlight) && "bg-slate-50",
                        )}
                      >
                        <td className="px-4 py-3 sm:px-10">
                          <BenchmarkMetricPicker
                            rowId={row.id}
                            label={sel.label}
                            choiceId={sel.choiceId}
                            onSelect={onMetricSelect}
                          />
                        </td>
                        {skus.map((sku, i) => {
                          const cell = row.cells[i]
                          if (!cell) {
                            return (
                              <td key={sku.id} className="px-3 py-3 text-right text-slate-400">
                                —
                              </td>
                            )
                          }
                          return (
                            <td key={sku.id} className="px-3 py-3 text-right">
                              <p className="font-mono text-slate-950 tabular-nums">{cell.value}</p>
                              <Trend pct={cell.pct} className="justify-end" />
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </WidgetBody>
    </Widget>
  )
}