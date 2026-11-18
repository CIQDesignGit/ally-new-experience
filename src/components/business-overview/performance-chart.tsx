"use client"

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"
import { CHART_SERIES, MAX_CHART_METRICS, type Kpi } from "./data"

function formatCurrencyAxis(v: number, plotted: Kpi[]) {
  const hasMillions = plotted.some((k) => k.axis === "currency" && (k.id === "ops" || k.id === "shipped-rev"))
  const hasThousands = plotted.some((k) => k.axis === "currency" && k.id !== "ops" && k.id !== "shipped-rev" && k.id !== "roas")
  if (hasMillions && v >= 1) return `$${v.toFixed(2)}M`
  if (hasThousands || v < 100) return `$${v.toFixed(2)}K`
  return `$${v.toFixed(2)}M`
}

function formatCountAxis(v: number) {
  return `${v.toFixed(2)}K`
}

function formatTooltip(v: number, kpi: Kpi) {
  if (kpi.id === "ops" || kpi.id === "shipped-rev") return `$${v.toFixed(2)}M`
  if (kpi.id === "ad-spend" || kpi.id === "ad-sales") return `$${v.toFixed(2)}K`
  if (kpi.id === "units-ord" || kpi.id === "units-ship") return `${v.toFixed(2)}K`
  if (kpi.id === "glance-views") return `${v.toFixed(0)}K`
  if (kpi.id === "roas") return v.toFixed(2)
  return String(v)
}

export function PerformanceChart({ plotted }: { plotted: Kpi[] }) {
  const series = plotted.slice(0, MAX_CHART_METRICS)
  const config = Object.fromEntries(
    series.map((k) => [k.chartKey, { label: k.label, color: k.chartColor }]),
  ) satisfies ChartConfig

  const hasCurrency = series.some((k) => k.axis === "currency")
  const hasCount = series.some((k) => k.axis === "count")
  const dual = hasCurrency && hasCount
  const useLeft = hasCurrency
  const useRight = hasCount
  const yId = (k: Kpi) => {
    if (dual) return k.axis === "currency" ? "currency" : "count"
    return hasCurrency ? "currency" : "count"
  }

  return (
    <div className="relative mt-6">
      <p className="absolute top-0 right-0 z-10 text-[11px] text-slate-400">Powered by CommerceIQ</p>
      <ChartContainer
        config={config}
        className="aspect-auto h-72 w-full [&_.recharts-cartesian-grid_line]:!stroke-slate-200 [&_.recharts-cartesian-grid_line]:opacity-100"
      >
        <LineChart data={CHART_SERIES} margin={{ top: 20, right: 8, left: 4, bottom: 8 }}>
          <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
          {useLeft && (
            <YAxis
              yAxisId="currency"
              orientation="left"
              tickLine={false}
              axisLine={false}
              width={52}
              tick={{ fill: "#64748b", fontSize: 10 }}
              tickFormatter={(v) => formatCurrencyAxis(v, series)}
            />
          )}
          {useRight && (
            <YAxis
              yAxisId="count"
              orientation="right"
              tickLine={false}
              axisLine={false}
              width={52}
              tick={{ fill: "#64748b", fontSize: 10 }}
              tickFormatter={formatCountAxis}
            />
          )}
          <CartesianGrid
            yAxisId={useLeft ? "currency" : "count"}
            syncWithTicks
            vertical={false}
            horizontal
            stroke="#e2e8f0"
            strokeWidth={1}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(label) => String(label)}
                formatter={(value, _name, item) => {
                  const kpi = series.find((k) => k.chartKey === item.dataKey)
                  if (!kpi || value === undefined) return null
                  return formatTooltip(Number(value), kpi)
                }}
              />
            }
          />
          {series.map((k) => (
            <Line
              key={k.id}
              yAxisId={yId(k)}
              type="monotone"
              dataKey={k.chartKey}
              name={k.label}
              stroke={k.chartColor}
              strokeWidth={2}
              dot={{ r: 4, fill: "#ffffff", stroke: k.chartColor, strokeWidth: 2 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ChartContainer>
      {series.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500">
          {series.map((k) => (
            <span key={k.id} className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full" style={{ backgroundColor: k.chartColor }} aria-hidden />
              {k.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}