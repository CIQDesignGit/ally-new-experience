"use client"

import { ChevronDown, Download, GripVertical, LineChart, Plus, X } from "lucide-react"
import { Widget, WidgetBody, WidgetHeader } from "@/components/layout/page-frame"
import { SECONDARY } from "@/components/nudge/mike/buttons"
import { BENCHMARK_SKUS } from "./data"
import { Trend } from "./trend"
import { cn } from "@/lib/utils"

export function BenchmarkingSku() {
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
      <WidgetBody>
        <div className="mb-4 flex items-start gap-2 rounded-lg bg-info-50 px-3 py-2.5 text-sm text-info-700 ring-1 ring-info-100">
          <LineChart className="mt-0.5 size-4 shrink-0" aria-hidden />
          Hover on any metric on the left panel and click this icon to plot the graph for the benchmarked entities.
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          <div className="flex w-40 shrink-0 flex-col gap-3">
            <button
              type="button"
              className="flex h-24 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-brand-700 hover:bg-slate-100"
              aria-label="Add widget"
            >
              <Plus className="size-6" />
            </button>
            <p className="text-xs font-semibold text-slate-500">Sales</p>
            <ul className="space-y-1 text-sm text-slate-700">
              <li className="flex items-center justify-between gap-1">
                Units ordered <ChevronDown className="size-3 text-slate-400" />
              </li>
              <li className="flex items-center justify-between gap-1">
                Glance views <ChevronDown className="size-3 text-slate-400" />
              </li>
              <li className="flex items-center justify-between gap-1">
                OPS <ChevronDown className="size-3 text-slate-400" />
              </li>
            </ul>
          </div>
          {BENCHMARK_SKUS.map((sku) => (
            <article key={sku.id} className="w-56 shrink-0 rounded-xl ring-1 ring-slate-200">
              <div className="flex items-center gap-1 border-b border-slate-200 px-2 py-1.5">
                <GripVertical className="size-4 text-slate-400" aria-hidden />
                <span className="min-w-0 flex-1 truncate font-mono text-xs text-slate-950">{sku.id}</span>
                <ChevronDown className="size-3 text-slate-400" aria-hidden />
                <button type="button" className="text-slate-400 hover:text-slate-700" aria-label={`Remove ${sku.id}`}>
                  <X className="size-3.5" />
                </button>
              </div>
              <img src={sku.image} alt="" className="mx-auto mt-3 size-28 object-contain" />
              <p className="mt-2 px-2 pb-2 text-center text-xs text-slate-700 line-clamp-2">{sku.name}</p>
              <div className="space-y-2 border-t border-slate-200 px-2 py-2">
                {sku.metrics.map((m) => (
                  <div key={m.label} className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-slate-500">{m.label}</span>
                    <span className="text-right">
                      <span className="font-mono text-slate-950 tabular-nums">{m.value}</span> <Trend pct={m.pct} />
                    </span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </WidgetBody>
    </Widget>
  )
}