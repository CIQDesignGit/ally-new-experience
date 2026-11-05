import { cn } from "@/lib/utils"
import { fmtValue } from "../data"
import { MethodTag } from "../claire/delivered/method-tag"
import type { ResultSection, SkuLiftRow } from "../content-results-data"

const pct = (v?: number) => (v === undefined ? "—" : `${v >= 0 ? "+" : "−"}${Math.abs(v).toFixed(1)}%`)
const pts = (v?: number) => (v === undefined ? "—" : `${v >= 0 ? "+" : "−"}${Math.abs(v).toFixed(1)} pts`)
const money = (v?: number) => (v === undefined ? "—" : `${v >= 0 ? "+" : "−"}${fmtValue(Math.abs(v))}`)

/** Status as a small mark plus text, not a filled pill. */
const MARK: Record<SkuLiftRow["tone"], string> = {
  won: "bg-success-500",
  lost: "bg-slate-400",
  oos: "bg-warning-500",
  "not-live": "border border-slate-300 bg-white",
}

const CAPTION: Record<ResultSection["method"], string> = {
  "vs category":
    "Event weeks vs the 4 weeks before. Each SKU is judged against category demand (category impressions) and its usual lead, after adjusting for price, ad spend and stockouts.",
  "A/B tested": "New content vs old on a 50/50 traffic split. Both halves see the same price, ads and stock, so nothing needs adjusting.",
}

const TH = "px-4 py-2.5 align-bottom font-medium"
const TD_NUM = "px-4 py-3 text-right font-mono tabular-nums text-slate-950"
/** The verdict column is green when content won, red when it lost. */
const verdict = (v?: number) => (v === undefined ? "text-slate-300" : v >= 0 ? "text-success-700" : "text-error-600")
/** Money lost is red; gains stay neutral so the page isn't a wall of green. */
const moneyTone = (v?: number) => (v === undefined ? "text-slate-300" : v < 0 ? "text-error-600" : "text-slate-950")

function Result({ r }: { r: SkuLiftRow }) {
  return (
    <td className="px-4 py-3">
      <span className={cn("flex items-center gap-2", r.tone === "oos" ? "text-warning-700" : r.tone === "not-live" ? "text-slate-500" : "text-slate-700")}>
        <span className={cn("size-2 shrink-0 rounded-full", MARK[r.tone])} />
        {r.happened}
      </span>
    </td>
  )
}

/** The factors normalized out, shown only when they moved. Material ones (a stockout, a 3%+ price change) in amber. */
function Adjusted({ r }: { r: SkuLiftRow }) {
  if (r.skuImpr === undefined) return <td className="px-4 py-3 text-slate-300">—</td>
  const items = [
    r.price ? { text: `Price ${r.price > 0 ? "+" : "−"}${Math.abs(r.price)}%`, strong: Math.abs(r.price) >= 3 } : null,
    r.ads ? { text: `Ads ${r.ads > 0 ? "+" : "−"}${Math.abs(r.ads)}%`, strong: false } : null,
    r.oosDays ? { text: `Out of stock ${r.oosDays} days`, strong: true } : null,
  ].filter(Boolean) as { text: string; strong: boolean }[]
  return (
    <td className="px-4 py-3 text-sm">
      {items.length === 0 ? (
        <span className="text-slate-400">Nothing to adjust</span>
      ) : (
        items.map((it, i) => (
          <span key={it.text} className={it.strong ? "text-warning-700" : "text-slate-500"}>
            {i > 0 && <span className="text-slate-300"> · </span>}
            {it.text}
          </span>
        ))
      )}
    </td>
  )
}

/** Each type keeps a shade of the content purple, as on Claire's content waterfall. */
const TYPE_MARK: Record<ResultSection["type"], string> = {
  seasonal: "bg-brand-600",
  foundational: "bg-brand-400",
  "retail-readiness": "bg-brand-300",
}

/**
 * SKU growth and category demand growth as two bars on one scale, so the gap
 * reads at a glance. Negative growth draws red from the same start.
 */
function GrowthBars({ sku, cat, max }: { sku?: number; cat?: number; max: number }) {
  if (sku === undefined || cat === undefined) return <td className="px-4 py-3 text-right text-slate-300">—</td>
  const bar = (v: number, tone: string, label: string, muted = false) => (
    <div className="grid grid-cols-[64px_minmax(0,1fr)_56px] items-center gap-2">
      <span className="text-[11px] text-slate-500">{label}</span>
      <div className="h-1.5 rounded-full bg-slate-100">
        <div className={cn("h-full rounded-full", v < 0 ? "bg-error-500" : tone)} style={{ width: `${Math.min(100, (Math.abs(v) / max) * 100)}%` }} />
      </div>
      <span className={cn("text-right font-mono text-[13px] tabular-nums", v < 0 ? "text-error-600" : muted ? "text-slate-500" : "text-slate-950")}>{pct(v)}</span>
    </div>
  )
  return (
    <td className="px-4 py-2.5">
      <div className="flex flex-col gap-1.5">
        {bar(sku, "bg-brand-500", "SKU")}
        {bar(cat, "bg-slate-300", "Category", true)}
      </div>
    </td>
  )
}

/** One type of work: its claim, how it's measured, then every SKU with the evidence its method produces. */
export function ResultsTable({ section }: { section: ResultSection }) {
  const t = section.totals
  const byCategory = section.method === "vs category"

  const max = Math.max(...section.rows.flatMap((r) => [Math.abs(r.skuImpr ?? 0), Math.abs(r.catImpr ?? 0)]), 1)
  const progress = Math.min(100, (t.incremental / t.promised) * 100)

  return (
    <section id={section.type} className="overflow-hidden rounded-2xl bg-white shadow-xs ring-1 ring-slate-200">
      <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-3 border-b border-slate-100 bg-slate-25 px-5 py-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span className={cn("size-2.5 rounded-sm", TYPE_MARK[section.type])} />
            <h2 className="text-lg font-semibold text-slate-950">{section.name}</h2>
            <MethodTag method={section.method} />
          </div>
          <p className="mt-1 max-w-[760px] text-sm text-slate-500">{CAPTION[section.method]}</p>
        </div>
        <div className="w-56 shrink-0">
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-mono text-lg font-bold text-slate-950 tabular-nums">{fmtValue(t.incremental)}</span>
            <span className="text-xs text-slate-500">of {fmtValue(t.promised)} projected</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-brand-100">
            <div className="h-full rounded-full bg-brand-500" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-1.5 text-xs text-slate-500">
            {t.live.toLocaleString()} of {t.promisedSkus.toLocaleString()} SKUs live
          </div>
        </div>
      </div>
      <table className="w-full table-fixed text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
            <th className={cn(TH, "w-[21%] pl-5")}>SKU</th>
            <th className={cn(TH, "w-[19%]")}>Result</th>
            {byCategory ? (
              <>
                <th className={cn(TH, "w-[22%]")}>SKU growth vs category demand growth</th>
                <th className={cn(TH, "text-right")}>Lead vs usual</th>
                <th className={cn(TH, "w-[16%]")}>Adjusted for</th>
              </>
            ) : (
              <>
                <th className={cn(TH, "text-right")}>Lift vs old content</th>
                <th className={cn(TH, "text-right")}>Confidence</th>
                <th className={cn(TH, "text-right")}>Test length</th>
              </>
            )}
            <th className={cn(TH, "pr-5 text-right")}>Incremental sales</th>
          </tr>
        </thead>
          <tbody>
            {section.rows.map((r) => {
              const lead = r.skuImpr !== undefined && r.catImpr !== undefined ? r.skuImpr - r.catImpr : undefined
              return (
                <tr key={r.asin} className="border-t border-slate-100 transition-colors first:border-t-0 hover:bg-slate-25">
                  <td className="py-3 pr-4 pl-5">
                    <div className="truncate text-slate-950">{r.name}</div>
                    <div className="font-mono text-[11px] text-slate-400">{r.asin}</div>
                  </td>
                  <Result r={r} />
                  {byCategory ? (
                    <>
                      <GrowthBars sku={r.skuImpr} cat={r.catImpr} max={max} />
                      <td className={TD_NUM}>
                        {/* Judged against the SKU's usual lead before the change, so a SKU already outgrowing the category gets no credit for it. */}
                        <div className={cn("font-semibold", verdict(lead === undefined ? undefined : lead - (r.leadBefore ?? 0)))}>{pts(lead)}</div>
                        {r.leadBefore !== undefined && <div className="mt-0.5 font-sans text-[11px] text-slate-400">usually {pts(r.leadBefore)}</div>}
                      </td>
                      <Adjusted r={r} />
                    </>
                  ) : (
                    <>
                      <td className={cn(TD_NUM, "font-semibold", verdict(r.lift))}>{pct(r.lift)}</td>
                      <td className={cn(TD_NUM, r.confidence === undefined && "text-slate-300")}>{r.confidence === undefined ? "—" : `${r.confidence}%`}</td>
                      <td className={cn(TD_NUM, "text-slate-500", r.days === undefined && "text-slate-300")}>{r.days === undefined ? "—" : `${r.days} days`}</td>
                    </>
                  )}
                  <td className={cn(TD_NUM, "pr-5 font-semibold", moneyTone(r.incremental))}>{money(r.incremental)}</td>
                </tr>
              )
            })}
          </tbody>
      </table>
      <div className="border-t border-slate-100 bg-slate-25 px-5 py-2.5 text-xs text-slate-500">
        Showing {section.rows.length} of {t.promisedSkus.toLocaleString()}
      </div>
    </section>
  )
}
