import { cn } from "@/lib/utils"
import { AI_SALES, EXPERIMENT, LEAK_TOTAL, SALES } from "./data"
import type { Confidence } from "./data"

const CARD = "rounded-2xl bg-white ring-1 ring-slate-200"
const HEAD = "text-xs font-medium text-slate-500"

const CONF: Record<Confidence, { label: string; dot: string }> = {
  proven: { label: "Proven", dot: "bg-success-600" },
  estimated: { label: "Estimated", dot: "bg-slate-400" },
  none: { label: "Not measured yet", dot: "bg-slate-200" },
}

const k = (v: number) => (v >= 1000 ? `$${(v / 1000).toFixed(1)}M` : `$${v}K`)
const pct = (v: number, total: number) => `${((v / total) * 100).toFixed(1)}%`

/**
 * AI and your sales: what's proven in retailer reporting, what's estimated from
 * how sales move with AI share, what's at risk at the shelf, and how we'll prove
 * the estimates. Totals are derived from the rows.
 */
export function SalesImpact() {
  const week = SALES[SALES.length - 1] * 1000
  const proven = AI_SALES.filter((r) => r.confidence === "proven").reduce((t, r) => t + (r.value ?? 0), 0)
  const est = AI_SALES.filter((r) => r.confidence === "estimated")
  const lo = est.reduce((t, r) => t + (r.range?.[0] ?? 0), 0)
  const hi = est.reduce((t, r) => t + (r.range?.[1] ?? 0), 0)
  const order: Confidence[] = ["proven", "estimated", "none"]
  const rows = [...AI_SALES].sort((a, b) => order.indexOf(a.confidence) - order.indexOf(b.confidence))

  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-xl font-semibold tracking-tight text-slate-950">AI and your sales</h3>

      {/* The three numbers, against this week's retailer sales */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className={cn(CARD, "px-5 py-4")}>
          <div className="flex items-center gap-1.5 text-sm font-medium text-slate-950">
            <span className={cn("size-2 rounded-full", CONF.proven.dot)} /> Proven
          </div>
          <div className="mt-2 font-mono text-3xl font-semibold text-slate-950 tabular-nums">{k(proven)}</div>
          <div className="text-xs text-slate-500">
            this week ({pct(proven, week)} of {k(week)} sales) · paid AI placements, from retailer reporting
          </div>
        </div>
        <div className={cn(CARD, "px-5 py-4")}>
          <div className="flex items-center gap-1.5 text-sm font-medium text-slate-950">
            <span className={cn("size-2 rounded-full", CONF.estimated.dot)} /> Estimated
          </div>
          <div className="mt-2 font-mono text-3xl font-semibold text-slate-950 tabular-nums">
            {k(lo)}–{k(hi)}
          </div>
          <div className="text-xs text-slate-500">
            this week ({pct(lo, week)}–{pct(hi, week)} of sales) · organic AI, from how sales move with AI share
          </div>
        </div>
        <div className={cn(CARD, "px-5 py-4")}>
          <div className="text-sm font-medium text-slate-950">At risk at the shelf</div>
          <div className="mt-2 font-mono text-3xl font-semibold text-slate-950 tabular-nums">{k(LEAK_TOTAL)}</div>
          <div className="text-xs text-slate-500">a week · AI sends shoppers, the shelf breaks · fixes in Ops fixes above</div>
        </div>
      </div>

      {/* Where each number comes from */}
      <div className={cn(CARD, "overflow-x-auto")}>
        <div className="min-w-[760px]">
          <div className={cn(HEAD, "grid grid-cols-[minmax(0,1fr)_150px_150px_minmax(0,1.2fr)] gap-4 px-6 pt-3 pb-2")}>
            <span>Where it comes from</span>
            <span>How sure</span>
            <span className="text-right">This week</span>
            <span>How it&apos;s measured</span>
          </div>
          {rows.map((r) => (
            <div key={r.id} className="grid grid-cols-[minmax(0,1fr)_150px_150px_minmax(0,1.2fr)] items-baseline gap-4 border-t border-slate-100 px-6 py-3 text-sm">
              <span className="text-slate-950">{r.name}</span>
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className={cn("size-1.5 rounded-full", CONF[r.confidence].dot)} />
                {CONF[r.confidence].label}
              </span>
              <span className="text-right font-mono text-slate-950 tabular-nums">
                {r.value != null ? k(r.value) : r.range ? `${k(r.range[0])}–${k(r.range[1])}` : <span className="text-slate-400">—</span>}
              </span>
              <span className="text-slate-700">{r.how}</span>
            </div>
          ))}
        </div>
      </div>

      {/* How the estimates become proof */}
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 rounded-xl bg-slate-100 px-5 py-3 text-sm text-slate-700">
        <span className="font-medium text-slate-950">Turning estimates into proof:</span>
        <span>
          {EXPERIMENT.featured} featured SKUs vs {EXPERIMENT.controls} matched controls for {EXPERIMENT.weeks} weeks · {EXPERIMENT.measures} · starts {EXPERIMENT.starts.toLowerCase()}
        </span>
      </div>
    </section>
  )
}
