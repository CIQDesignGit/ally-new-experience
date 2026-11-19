"use client"

import { BarChart2, Calendar, Download } from "lucide-react"
import { Widget, WidgetBody, WidgetHeader } from "@/components/layout/page-frame"
import { SECONDARY } from "@/components/nudge/mike/buttons"
import { TOP_GAINERS, TOP_LOSERS } from "./data"
import { MoverPanel } from "./mover-table"
import { cn } from "@/lib/utils"

export function TopMovers() {
  return (
    <Widget className="min-w-0 @container">
      <WidgetHeader className="flex flex-col gap-3 @[32rem]:flex-row @[32rem]:items-center @[32rem]:justify-between">
        <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">Top movers ordered product sales (OPS)</p>
        <div className="flex flex-wrap items-center gap-2 @[32rem]:justify-end">
          <button type="button" className={cn(SECONDARY, "h-9 gap-1.5 px-3 text-xs")}>
            <BarChart2 className="size-3.5 shrink-0" aria-hidden /> Benchmark
          </button>
          <button type="button" className={cn(SECONDARY, "h-9 gap-1.5 px-3 text-xs")}>
            <Calendar className="size-3.5 shrink-0" aria-hidden /> Show by: SKU
          </button>
          <button type="button" className={cn(SECONDARY, "size-9 shrink-0 p-0")} aria-label="Export">
            <Download className="size-4" />
          </button>
        </div>
      </WidgetHeader>
      <WidgetBody pad={false} className="py-0">
        <div className="flex min-w-0 flex-col @[52rem]:flex-row">
          <MoverPanel title="Top gainers" rows={TOP_GAINERS} />
          <MoverPanel title="Top losers" rows={TOP_LOSERS} />
        </div>
      </WidgetBody>
    </Widget>
  )
}