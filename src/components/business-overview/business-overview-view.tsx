"use client"

import { ChevronDown, Filter, RefreshCw, Star } from "lucide-react"
import { PAGE_EDGE, PAGE_HEAD_SPACE, WidgetStack } from "@/components/layout/page-frame"
import { SECONDARY } from "@/components/nudge/mike/buttons"
import { BusinessOverviewDateRangeSelector } from "./date-range-selector"
import { MetricsBenchmark } from "./metrics-benchmark"
import { PerformanceOverview } from "./performance-overview"
import { TopMovers } from "./top-movers"
import { cn } from "@/lib/utils"

export function BusinessOverviewView() {
  return (
    <>
      <header className={cn("pt-4", PAGE_EDGE, PAGE_HEAD_SPACE)}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Star className="size-5 fill-warning-400 text-warning-500" aria-hidden />
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Overall business</h1>
              <ChevronDown className="size-5 text-slate-500" aria-hidden />
            </div>
            <button type="button" className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
              <Filter className="size-3.5" aria-hidden /> Add filters
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-0.5">
            <BusinessOverviewDateRangeSelector />
            <div className="hidden h-8 w-px shrink-0 bg-slate-200 sm:block" aria-hidden />
            <div className="flex items-center gap-2">
              <button type="button" className={cn(SECONDARY, "h-10 text-sm shadow-xs")}>
                Save as new view
              </button>
              <button
                type="button"
                className={cn(SECONDARY, "size-10 p-0 shadow-xs")}
                aria-label="Refresh"
              >
                <RefreshCw className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <WidgetStack>
        <PerformanceOverview />
        <TopMovers />
        <MetricsBenchmark />
      </WidgetStack>
    </>
  )
}