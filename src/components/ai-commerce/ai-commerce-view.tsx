"use client"

import { useEffect, useMemo, useState } from "react"
import { Check } from "lucide-react"
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { cn } from "@/lib/utils"
import { BRANDS, BRAND_SHARE, LEAKS, META, MIN_WEEKS, NEEDS, PROMPTS, RETAILER_LINKS, RETAILER_NAME, RETAILER_SALES, SALES, SOURCES, SURFACES, WEEKS, correlation, sourceSeries, strength } from "./data"
import type { SourceId } from "./data"

const CARD = "rounded-2xl bg-white ring-1 ring-slate-200"
const ROW = "grid grid-cols-[minmax(0,1fr)_190px_120px_90px_230px_120px] gap-4"

type Row = {
  key: string
  kind: "source" | "surface"
  name: string
  metric: string
  series: (number | null)[]
  against: number[]
  againstLabel: string
  leader: { brand: string; share: number }
  basis: string
  corr: ReturnType<typeof correlation>
}
const HEAD = "text-xs font-medium text-slate-500"
const SECTION = "text-xl font-semibold tracking-tight text-slate-950"

const last = (s: (number | null)[]) => s.filter((v): v is number => v != null).at(-1) ?? 0
const first = (s: (number | null)[]) => s.find((v): v is number => v != null) ?? 0
const leaderOf = (id: SourceId) => [...BRANDS].sort((a, b) => BRAND_SHARE[b][id] - BRAND_SHARE[a][id])[0]

/** The page's one-line read of a source's link to sales. */
function linkLine(c: ReturnType<typeof correlation>) {
  if (c.r == null) return `Not enough data yet · ${c.weeks} of ${MIN_WEEKS} weeks`
  return `${strength(c.r)} ${c.r.toFixed(2)} · ${c.lead ? "1 week ahead" : "same week"}`
}

/**
 * AI Commerce v1: where Hershey's is found across the four places shoppers look,
 * how each moves with retailer sales, and where AI-sent demand leaks at the shelf.
 */
export function AiCommerceView() {
  const [mounted, setMounted] = useState(false)
  const [sel, setSel] = useState<string>("answer")
  const [sent, setSent] = useState<Record<string, boolean>>({})
  useEffect(() => {
    // Charts measure the page, so render after mount.
    const t = window.setTimeout(() => setMounted(true), 0)
    return () => window.clearTimeout(t)
  }, [])

  // One row per source (its overall, from its surfaces), then its surfaces. Retailer surfaces compare with their own retailer's sales.
  const rows = useMemo<Row[]>(
    () =>
      SOURCES.flatMap((src) => {
        const series = sourceSeries(src.id)
        const lead = leaderOf(src.id)
        const head: Row = { key: src.id, kind: "source", name: src.name, metric: src.metric, series, against: SALES, againstLabel: "total sales", leader: { brand: lead, share: BRAND_SHARE[lead][src.id] }, basis: `${SURFACES.filter((x) => x.source === src.id).length} surfaces`, corr: correlation(series) }
        const kids: Row[] = SURFACES.filter((x) => x.source === src.id).map((x) => {
          const against = x.retailer ? RETAILER_SALES[x.retailer] : SALES
          return { key: x.id, kind: "surface", name: x.name, metric: src.metric, series: x.series, against, againstLabel: x.retailer ? `${RETAILER_NAME[x.retailer]} sales` : "total sales", leader: x.leader, basis: x.basis, corr: correlation(x.series, against) }
        })
        return [head, ...kids]
      }),
    [],
  )
  const sourceRows = rows.filter((r) => r.kind === "source")
  const answerShare = BRAND_SHARE["Hershey's"].answer
  const ansLeader = leaderOf("answer")
  const leakTotal = LEAKS.reduce((t, l) => t + l.atRisk, 0)
  // Rank: deadline first, then dollars.
  const leaks = [...LEAKS].sort((a, b) => Number(!!b.deadline) - Number(!!a.deadline) || b.atRisk - a.atRisk)
  const sameWeek = sourceRows.filter((r) => r.corr.r != null && r.corr.lead === 0).map((r) => r.name.toLowerCase())
  const leading = sourceRows.filter((r) => r.corr.r != null && r.corr.lead === 1).map((r) => r.name.toLowerCase())

  if (!mounted) return <div className="min-h-[60vh]" />

  const src = rows.find((r) => r.key === sel)!
  // Each line scaled to its own range (low = 0, high = 100), so the shapes compare on one axis.
  const scale = (v: number, lo: number, hi: number) => Math.round(((v - lo) / (hi - lo || 1)) * 100)
  const shares = src.series.filter((v): v is number => v != null)
  const [sLo, sHi] = [Math.min(...shares), Math.max(...shares)]
  const [aLo, aHi] = [Math.min(...src.against), Math.max(...src.against)]
  const chart = WEEKS.map((w, i) => ({
    week: w,
    sales: scale(src.against[i], aLo, aHi),
    share: src.series[i] == null ? null : scale(src.series[i] as number, sLo, sHi),
  }))

  return (
    <div className="flex flex-col">
      {/* Who and what this is */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-baseline gap-x-3 gap-y-1 px-6 py-3">
          <h1 className="text-xl font-semibold tracking-tight text-slate-950">{META.brand}</h1>
          <span className="text-sm text-slate-700">
            {META.category} · {META.retailers} · {META.asOf}
          </span>
          <span className="ml-auto rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">Illustrative data</span>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-12 px-6 pt-8 pb-24">
        {/* Hero: fact, gap, reassurance */}
        <section>
          <p className="text-2xl text-slate-700">
            Shoppers asking about Halloween candy see {META.brand} in <span className="font-semibold text-slate-950">{answerShare}%</span> of answer agent replies.
          </p>
          <h2 className="mt-1 text-[40px] leading-tight font-bold tracking-tight text-slate-950">
            {ansLeader} is in {BRAND_SHARE[ansLeader].answer}%, and ${leakTotal}K a week of AI-sent demand is leaking at the shelf.
          </h2>
          <p className="mt-2 text-base text-slate-700">
            {sameWeek.length > 0 && <>{sameWeek.join(" and ").replace(/^./, (c) => c.toUpperCase())} move with your sales in the same week. </>}
            {leading.length > 0 && <>{leading.join(" and ").replace(/^./, (c) => c.toUpperCase())} lead them by about a week.</>}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {META.prompts} prompts · 4 sources · {META.runsPerWeek} runs per prompt per engine a week
          </p>
        </section>

        {/* Share by source, and how each moves with sales */}
        <section className="flex flex-col gap-4">
          <h3 className={SECTION}>Where shoppers find you</h3>
          <div className={cn(CARD, "overflow-x-auto")}>
            <div className="min-w-[980px]">
              <div className={cn(HEAD, ROW, "px-6 pt-3 pb-2")}>
                <span>Source</span>
                <span>Hershey&apos;s share</span>
                <span>Leader</span>
                <span className="text-right">Since {WEEKS[0]}</span>
                <span>Moves with sales</span>
                <span>Based on</span>
              </div>
              {rows.map((r) => {
                const now = last(r.series)
                const delta = Math.round(now - first(r.series))
                const active = sel === r.key
                const top = r.kind === "source"
                return (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setSel(r.key)}
                    aria-pressed={active}
                    className={cn(
                      ROW,
                      "w-full items-center border-t px-6 text-left outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-inset",
                      top ? "border-slate-200 bg-slate-50 py-3" : "border-slate-100 py-2.5",
                      active ? "bg-brand-50 shadow-[inset_3px_0_0_var(--color-brand-500)]" : "hover:bg-slate-50",
                    )}
                  >
                    <span className={cn("min-w-0", !top && "pl-5")}>
                      <span className={cn("block", top ? "text-[15px] font-semibold text-slate-950" : "text-sm text-slate-950")}>{r.name}</span>
                      {top && <span className="block text-xs text-slate-500">{r.metric} · overall</span>}
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="relative h-2 w-28 rounded-full bg-slate-100" aria-hidden>
                        <span className="absolute inset-y-0 left-0 rounded-full bg-brand-500" style={{ width: `${(now / 50) * 100}%` }} />
                        <span className="absolute -inset-y-1 w-0.5 bg-slate-950" style={{ left: `${(r.leader.share / 50) * 100}%` }} />
                      </span>
                      <span className={cn("font-mono tabular-nums", top ? "text-base font-semibold text-slate-950" : "text-sm text-slate-950")}>{Math.round(now)}%</span>
                    </span>
                    <span className="text-sm whitespace-nowrap text-slate-700">
                      {r.leader.brand === META.brand ? "You lead" : <>{r.leader.brand} <span className="font-mono tabular-nums">{r.leader.share}%</span></>}
                    </span>
                    <span className="text-right font-mono text-sm text-slate-700 tabular-nums">
                      {r.series[0] == null ? "New" : `${delta >= 0 ? "+" : "−"}${Math.abs(delta)} pts`}
                    </span>
                    <span className="text-sm text-slate-700">
                      <span className="block">{linkLine(r.corr)}</span>
                      {r.corr.r != null && <span className="block text-xs text-slate-500">vs {r.againstLabel}</span>}
                    </span>
                    <span className="text-xs text-slate-500">{r.basis}</span>
                  </button>
                )
              })}
              <div className="flex items-center gap-4 border-t border-slate-100 px-6 py-2.5 text-xs text-slate-500">
                <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-brand-500" /> Hershey&apos;s</span>
                <span className="flex items-center gap-1.5"><span className="h-3 w-0.5 bg-slate-950" /> Leader</span>
                <span>Overall = each source&apos;s surfaces, weighted by shopper demand</span>
              </div>
            </div>
          </div>

          <div className={cn(CARD, "px-6 py-5")}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="text-[15px] font-semibold text-slate-950">
                {src.againstLabel.replace(/^./, (c) => c.toUpperCase())} vs {src.name}: {src.metric}
              </div>
              <div className="text-xs text-slate-500">Each line from its 12-week low (0) to high (100)</div>
            </div>
            <div className="mt-3 h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chart} margin={{ top: 8, right: 24, bottom: 0, left: 16 }}>
                  <CartesianGrid stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} interval={1} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
                    formatter={(_v, name, item) => {
                      const i = WEEKS.indexOf(item.payload.week)
                      return name === "sales" ? [`$${src.against[i].toFixed(1)}M`, src.againstLabel] : [`${src.series[i]}%`, src.metric]
                    }}
                  />
                  <Line type="monotone" dataKey="sales" stroke="#0f172a" strokeWidth={2} dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="share" stroke="var(--color-brand-500)" strokeWidth={2} dot={{ r: 2.5 }} connectNulls={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-slate-950" /> {src.againstLabel.replace(/^./, (c) => c.toUpperCase())}</span>
              <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-brand-500" /> {src.metric}</span>
              <span className="ml-auto">Correlation of week-over-week changes, so the Halloween ramp alone doesn&apos;t count. Correlation isn&apos;t cause.</span>
            </div>
          </div>
        </section>

        {/* Where AI sends shoppers, and where it leaks */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className={SECTION}>Leaking at the shelf</h3>
            <span className="font-mono text-sm font-semibold text-error-600">−${leakTotal}K a week</span>
          </div>
          <div className={cn(CARD, "overflow-hidden")}>
            <div className="border-b border-slate-100 px-6 py-4">
              <div className={HEAD}>Where answer agents send shoppers</div>
              <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-slate-100">
                {RETAILER_LINKS.map((r, i) => (
                  <span key={r.retailer} className={cn("h-full", i ? "border-l-2 border-white" : "")} style={{ width: `${r.share}%`, background: ["#334155", "#64748b", "#94a3b8", "#cbd5e1"][i] }} />
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-5 text-sm text-slate-700">
                {RETAILER_LINKS.map((r) => (
                  <span key={r.retailer}>
                    {r.retailer} <span className="font-mono text-slate-950 tabular-nums">{r.share}%</span>
                  </span>
                ))}
              </div>
            </div>
            <div className={cn(HEAD, "grid grid-cols-[minmax(0,1fr)_200px_96px_150px] gap-4 px-6 pt-3 pb-1")}>
              <span>Recommended SKU</span>
              <span>At the retailer</span>
              <span className="text-right">At risk</span>
              <span />
            </div>
            {leaks.map((l) => (
              <div key={l.id} className="grid grid-cols-[minmax(0,1fr)_200px_96px_150px] items-center gap-4 border-t border-slate-100 px-6 py-3">
                <div className="min-w-0">
                  <div className="text-[15px] font-medium text-slate-950">{l.sku}</div>
                  <div className="text-xs text-slate-500">{l.agent}</div>
                </div>
                <div className="text-sm">
                  <div className="text-slate-950">{l.retailer}: {l.issue}</div>
                  {l.deadline && <div className="text-xs font-medium text-warning-700">{l.deadline}</div>}
                </div>
                <div className="text-right font-mono text-sm whitespace-nowrap text-error-600 tabular-nums">−${l.atRisk}K/wk</div>
                <div className="text-right">
                  {sent[l.id] ? (
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-success-700">
                      <Check className="size-4" /> Sent
                    </span>
                  ) : (
                    <button type="button" onClick={() => setSent((s) => ({ ...s, [l.id]: true }))} className="text-sm font-medium text-brand-700 hover:underline">
                      {l.owner === "Ops agent" ? "Send to Ally" : "Draft pricing brief"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Share by brand and source */}
        <section className="flex flex-col gap-4">
          <h3 className={SECTION}>Share by brand</h3>
          <div className={cn(CARD, "overflow-x-auto")}>
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className={cn(HEAD, "px-6 py-3 text-left")}>Brand</th>
                  {SOURCES.map((s) => (
                    <th key={s.id} className={cn(HEAD, "px-4 py-3 text-right")}>{s.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BRANDS.map((b) => (
                  <tr key={b} className={cn("border-b border-slate-100 last:border-b-0", b === META.brand && "bg-slate-25")}>
                    <td className={cn("px-6 py-3", b === META.brand ? "font-semibold text-slate-950" : "text-slate-700")}>{b}</td>
                    {SOURCES.map((s) => (
                      <td key={s.id} className={cn("px-4 py-3 text-right font-mono tabular-nums", leaderOf(s.id) === b ? "font-semibold text-slate-950" : "text-slate-700")}>
                        {BRAND_SHARE[b][s.id]}%
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Shopper needs */}
        <section className="flex flex-col gap-4">
          <h3 className={SECTION}>Shopper needs</h3>
          <div className={cn(CARD, "overflow-x-auto")}>
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className={cn(HEAD, "px-6 py-3 text-left")}>Need</th>
                  <th className={cn(HEAD, "px-4 py-3 text-right")}>Demand a month</th>
                  <th className={cn(HEAD, "px-4 py-3 text-right")}>Hershey&apos;s in answers</th>
                  <th className={cn(HEAD, "px-4 py-3 text-left")}>Leader</th>
                  <th className={cn(HEAD, "px-4 py-3 text-left")}>What&apos;s missing</th>
                </tr>
              </thead>
              <tbody>
                {[...NEEDS].sort((a, b) => b.demand - a.demand).map((n) => (
                  <tr key={n.id} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-6 py-3 text-slate-950">{n.need}</td>
                    <td className="px-4 py-3 text-right font-mono whitespace-nowrap text-slate-950 tabular-nums">
                      ${n.demand.toFixed(1)}M <span className="text-xs text-slate-500">{n.growth}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-950 tabular-nums">{n.ours}%</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                      {n.leader === META.brand ? "You" : n.leader} <span className="font-mono tabular-nums">{n.leaderShare}%</span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{n.gap ?? <span className="text-slate-400">Nothing</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Prompts */}
        <section className="flex flex-col gap-4">
          <h3 className={SECTION}>Prompts</h3>
          <div className={cn(CARD, "overflow-x-auto")}>
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className={cn(HEAD, "px-6 py-3 text-left")}>Prompt</th>
                  <th className={cn(HEAD, "px-4 py-3 text-right")}>Hershey&apos;s</th>
                  <th className={cn(HEAD, "px-4 py-3 text-left")}>Recommended most</th>
                  <th className={cn(HEAD, "px-4 py-3 text-left")}>Links to</th>
                </tr>
              </thead>
              <tbody>
                {PROMPTS.map((p) => (
                  <tr key={p.q} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-6 py-3">
                      <div className="text-slate-950">&ldquo;{p.q}&rdquo;</div>
                      <div className="text-xs text-slate-500">{p.need}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-950 tabular-nums">{p.ours}%</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                      {p.leader === META.brand ? "You" : p.leader} <span className="font-mono tabular-nums">{p.leaderRate}%</span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{p.link}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500">
            Recommendation rate across {META.runsPerWeek * 4} answer agent runs a week per prompt. A rate, never a rank: answers change from run to run.
          </p>
        </section>
      </div>
    </div>
  )
}
