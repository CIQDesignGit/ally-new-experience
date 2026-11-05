"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { fmtValue } from "../data"
import { ResultsMetrics } from "./results-metrics"
import { ResultsTable } from "./results-table"
import { TopStrip } from "../top-strip"
import { RESULTS_BY_PERIOD } from "../content-results-data"
import type { ResultPeriod, ResultType } from "../content-results-data"

type View = "all" | ResultType

const TABS: { id: View; label: string }[] = [
  { id: "all", label: "All" },
  { id: "seasonal", label: "Seasonal" },
  { id: "foundational", label: "Foundational" },
  { id: "retail-readiness", label: "Retail readiness" },
]

const PERIODS: { id: ResultPeriod; label: string }[] = [
  // As of Oct 8 (Q4 FY26): SKU-level results exist for finished periods; Q4's first week is still measuring.
  { id: "qtd", label: "Last quarter" },
  { id: "month", label: "September" },
  { id: "quarter", label: "Q2 FY26" },
  { id: "year", label: "Last year" },
]

function Segmented<T extends string>({ items, value, onChange }: { items: { id: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex rounded-lg border border-slate-200 bg-white p-1">
      {items.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={cn(
            "rounded-md px-3.5 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-300",
            value === t.id ? "bg-white text-slate-950 shadow-xs ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-800",
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

/** Content results, one page: pick a type of work, see its five numbers, then every SKU behind them. */
export function ContentResults() {
  const router = useRouter()
  const params = useSearchParams()
  const initial = (TABS.find((t) => t.id === params.get("type"))?.id ?? "all") as View
  const [view, setView] = useState<View>(initial)
  const [period, setPeriod] = useState<ResultPeriod>(
    (PERIODS.find((p) => p.id === params.get("period"))?.id ?? "qtd") as ResultPeriod,
  )

  const [periodOpen, setPeriodOpen] = useState(false)
  const results = RESULTS_BY_PERIOD[period]
  const sections = view === "all" ? results.sections : results.sections.filter((s) => s.type === view)
  const current = view === "all" ? null : sections[0]
  const totals = current ? current.totals : results.all

  function back() {
    if (window.history.length > 1) router.back()
    else router.push("/claire-waterfall")
  }

  return (
    <>
    <TopStrip person="claire" home="/claire-waterfall" crumbs={[{ label: "Home", onClick: back }, { label: "Content results" }]} />
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 px-10 pt-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>Content results</span>
              <span className="text-slate-300">·</span>
              {/* Same period control as Claire's top line: the period name is the dropdown. */}
              <DropdownMenu open={periodOpen} onOpenChange={setPeriodOpen}>
                <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-md py-0.5 font-semibold text-slate-950 outline-none">
                  {results.name}
                  <ChevronDown className={cn("size-3.5 text-slate-400 transition-transform", periodOpen && "rotate-180")} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" sideOffset={6} className="min-w-60 rounded-xl p-1.5 shadow-md ring-1 ring-slate-200/80">
                  <DropdownMenuRadioGroup
                    value={period}
                    onValueChange={(v) => {
                      setPeriod(v as ResultPeriod)
                      setPeriodOpen(false)
                    }}
                  >
                    {PERIODS.map((p) => (
                      <DropdownMenuRadioItem
                        key={p.id}
                        value={p.id}
                        className="cursor-pointer rounded-lg px-2.5 py-1.5 text-sm whitespace-nowrap outline-hidden select-none focus:bg-brand-50 data-checked:bg-brand-100 data-checked:text-slate-950 **:data-[slot=dropdown-menu-radio-item-indicator]:hidden"
                      >
                        {p.label} · {RESULTS_BY_PERIOD[p.id].name}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <h1 className="mt-1 text-3xl leading-tight font-semibold tracking-tight text-slate-950">
              <span className="font-mono text-brand-600">{fmtValue(totals.incremental)}</span> delivered of <span className="font-mono">{fmtValue(totals.promised)}</span> projected
            </h1>
            <div className="mt-1 text-base text-slate-500">
              {totals.live.toLocaleString()} of {totals.promisedSkus.toLocaleString()} SKUs live
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Segmented items={TABS} value={view} onChange={setView} />
          </div>
        </div>
      </div>

      <ResultsMetrics totals={totals} sections={results.sections} current={current} />

      {sections.map((s) => (
        <ResultsTable key={s.type} section={s} />
      ))}
    </div>
    </>
  )
}
