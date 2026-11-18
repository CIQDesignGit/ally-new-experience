"use client"

import { useMemo, useState } from "react"
import { Calendar, Download } from "lucide-react"
import { Widget, WidgetBody, WidgetHeader } from "@/components/layout/page-frame"
import { SECONDARY } from "@/components/nudge/mike/buttons"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DATA_THROUGH, KPIS, MAX_CHART_METRICS } from "./data"
import { PerformanceChart } from "./performance-chart"
import { PerformanceKpiTile } from "./performance-kpi-tile"
import { cn } from "@/lib/utils"

const DEFAULT_SELECTED = KPIS.filter((k) => k.defaultOnChart)
  .map((k) => k.id)
  .slice(0, MAX_CHART_METRICS)

export function PerformanceOverview() {
  const [selectedOrder, setSelectedOrder] = useState<string[]>(() => [...DEFAULT_SELECTED])
  const [rollup, setRollup] = useState("days")

  const plotted = useMemo(
    () =>
      selectedOrder
        .map((id) => KPIS.find((k) => k.id === id))
        .filter((k): k is (typeof KPIS)[number] => !!k)
        .slice(0, MAX_CHART_METRICS),
    [selectedOrder],
  )

  function toggle(id: string) {
    setSelectedOrder((prev) => {
      const idx = prev.indexOf(id)
      if (idx >= 0) {
        if (prev.length <= 1) return prev
        return prev.filter((x) => x !== id)
      }
      if (prev.length < MAX_CHART_METRICS) return [...prev, id]
      return [...prev.slice(1), id]
    })
  }

  return (
    <Widget>
      <WidgetHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">Performance overview</p>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={rollup} onValueChange={(v) => v && setRollup(v)}>
            <SelectTrigger className={cn(SECONDARY, "h-9 w-auto min-w-[10.5rem] gap-2 border-slate-200 bg-white text-xs")}>
              <Calendar className="size-3.5 shrink-0 text-slate-500" aria-hidden />
              <SelectValue placeholder="Roll up by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="days">Roll up by: Days</SelectItem>
              <SelectItem value="weeks">Roll up by: Weeks</SelectItem>
              <SelectItem value="months">Roll up by: Months</SelectItem>
            </SelectContent>
          </Select>
          <button type="button" className={cn(SECONDARY, "size-9 shrink-0 p-0")} aria-label="Download">
            <Download className="size-4" />
          </button>
        </div>
      </WidgetHeader>
      <WidgetBody className="py-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {KPIS.map((k) => (
            <PerformanceKpiTile key={k.id} kpi={k} selected={selectedOrder.includes(k.id)} onToggle={() => toggle(k.id)} />
          ))}
        </div>
        <PerformanceChart plotted={plotted} />
        <p className="mt-4 text-xs text-slate-500">Data is available until {DATA_THROUGH}</p>
      </WidgetBody>
    </Widget>
  )
}