import { fmtValue } from "../data"
import type { ResultSection, ResultTotals } from "../content-results-data"

const pct = (v = 0) => `${v >= 0 ? "+" : "−"}${Math.abs(v).toFixed(1)}%`
const pts = (v = 0) => `${v >= 0 ? "+" : "−"}${Math.abs(v).toFixed(1)} pts`

/** `lift`: the percentage that rides with the dollar figure, so a percentage never stands alone. */
type Cell = { label: string; value: string; sub: string; lift?: string }

/**
 * The numbers for the current view: incremental sales with its lift beside it
 * (dollars first, then the percentage), then the evidence its method produces:
 * impressions against the category for seasonal, test results for A/B tested
 * work, and one of each when looking at all types.
 */
export function ResultsMetrics({ totals, sections, current }: { totals: ResultTotals; sections: ResultSection[]; current: ResultSection | null }) {
  const dollars: Cell = { label: "Incremental sales", value: fmtValue(totals.incremental), lift: pct(totals.sales), sub: `of ${fmtValue(totals.promised)} projected` }
  const seasonal = sections.find((s) => s.method === "vs category")?.totals
  const ab = sections.filter((s) => s.method === "A/B tested").map((s) => s.totals)
  const won = ab.reduce((n, t) => n + (t.won ?? 0), 0)
  const tested = ab.reduce((n, t) => n + (t.tested ?? 0), 0)

  let cells: Cell[]
  if (current?.method === "vs category") {
    const t = current.totals
    cells = [
      dollars,
      { label: "SKU growth", value: pct(t.skuImpr), sub: "event weeks vs the 4 weeks before" },
      { label: "Category demand growth", value: pct(t.catImpr), sub: "same weeks, the benchmark" },
      { label: "Lead over category", value: pts((t.skuImpr ?? 0) - (t.catImpr ?? 0)), sub: `usually ${pts(t.leadBefore)} · after price, ads and stock` },
    ]
  } else if (current) {
    const t = current.totals
    cells = [
      { ...dollars, sub: `${dollars.sub} · lift vs old content, 50/50 split` },
      { label: "Tests won", value: `${t.won} of ${t.tested}`, sub: "the rest went back to old content" },
      { label: "Average confidence", value: `${t.confidence}%`, sub: "across tests that finished" },
    ]
  } else {
    cells = [
      { ...dollars, sub: `${dollars.sub} · each type vs its own comparison` },
      { label: "Seasonal lead over category", value: pts((seasonal?.skuImpr ?? 0) - (seasonal?.catImpr ?? 0)), sub: `usually ${pts(seasonal?.leadBefore)} before the change` },
      { label: "A/B tests won", value: `${won} of ${tested}`, sub: "foundational and retail readiness" },
    ]
  }

  const progress = Math.min(100, (totals.incremental / totals.promised) * 100)
  return (
    <div
      className="grid overflow-hidden rounded-2xl bg-white shadow-xs ring-1 ring-slate-200"
      style={{ gridTemplateColumns: `repeat(${cells.length}, minmax(0, 1fr))` }}
    >
      {cells.map((c, i) => {
        const first = i === 0
        const signedValue = c.value.startsWith("+") || c.value.startsWith("−")
        return (
          <div key={c.label} className={first ? "bg-brand-25 px-5 py-4" : "border-l border-slate-100 px-5 py-4"}>
            <div className={first ? "text-xs font-medium text-brand-700" : "text-xs font-medium text-slate-500"}>{c.label}</div>
            <div
              className={`mt-1 flex flex-wrap items-baseline gap-x-2 font-mono font-bold tracking-tight tabular-nums ${first ? "text-[26px] text-brand-600" : "text-[22px]"} ${
                !first && signedValue ? (c.value.startsWith("−") ? "text-error-600" : "text-success-700") : !first ? "text-slate-950" : ""
              }`}
            >
              {c.value}
              {c.lift && <span className="text-base font-semibold whitespace-nowrap text-success-700">{c.lift}</span>}
            </div>
            {first && (
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-brand-100">
                <div className="h-full rounded-full bg-brand-500" style={{ width: `${progress}%` }} />
              </div>
            )}
            <div className="mt-1.5 text-xs text-slate-500">{c.sub}</div>
          </div>
        )
      })}
    </div>
  )
}
