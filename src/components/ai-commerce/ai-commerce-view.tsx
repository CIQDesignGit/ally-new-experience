"use client"

import { useEffect, useMemo, useState } from "react"
import { Check } from "lucide-react"
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { cn } from "@/lib/utils"
import { BRANDS, BRAND_SHARE, LEAKS, META, MIN_WEEKS, NEEDS, PROMPTS, RETAILER_LINKS, SALES, SOURCES, WEEKS, correlation, strength } from "./data"
import type { SourceId } from "./data"

const CARD = "rounded-2xl bg-white ring-1 ring-slate-200"
const HEAD = "text-xs font-medium text-slate-500"
const SECTION = "text-xl font-semibold tracking-tight text-slate-950"

const last = (s: (number | null)[]) => s.filter((v): v is number => v != null).at(-1) ?? 0
const first = (s: (number | null)[]) => s.find((v): v is number => v != null) ?? 0
const firstWeek = (s: (number | null)[]) => WEEKS[s.findIndex((v) => v != null)]
const leaderOf = (id: SourceId) => [...BRANDS].sort((a, b) => BRAND_SHARE[b][id] - BRAND_SHARE[a][id])[0]

/** The page's one-line read of a source's link to sales. */
function linkLine(c: ReturnType<typeof correlation>) {
  if (c.r == null) return `Not enough data yet · ${c.weeks} of ${MIN_WEEKS} weeks`
  return `${strength(c.r)} (${c.r.toFixed(2)}) · ${c.lead ? "leads sales by 1 week" : "same week"}`
}

/**
 * AI Commerce v1: where Hershey's is found across the four places shoppers look,
 * how each moves with retailer sales, and where AI-sent demand leaks at the shelf.
 */
export function AiCommerceView() {
  const [mounted, setMounted] = useState(false)
  const [sel, setSel] = useState<SourceId>("answer")
  const [sent, setSent] = useState<Record<string, boolean>>({})
  useEffect(() => {
    // Charts measure the page, so render after mount.
    const t = window.setTimeout(() => setMounted(true), 0)
    return () => window.clearTimeout(t)
  }, [])

  const corr = useMemo(() => Object.fromEntries(SOURCES.map((s) => [s.id, correlation(s.series)])) as Record<SourceId, ReturnType<typeof correlation>>, [])
  const answer = SOURCES.find((s) => s.id === "answer")!
  const ansLeader = leaderOf("answer")
  const leakTotal = LEAKS.reduce((s, l) => s + l.atRisk, 0)
  // Rank: deadline first, then dollars.
  const leaks = [...LEAKS].sort((a, b) => Number(!!b.deadline) - Number(!!a.deadline) || b.atRisk - a.atRisk)
  const sameWeek = SOURCES.filter((s) => corr[s.id].r != null && corr[s.id].lead === 0).map((s) => s.name.toLowerCase())
  const leading = SOURCES.filter((s) => corr[s.id].r != null && corr[s.id].lead === 1).map((s) => s.name.toLowerCase())

  if (!mounted) return <div className="min-h-[60vh]" />

  const src = SOURCES.find((s) => s.id === sel)!
  // Each line scaled to its own range (low = 0, high = 100), so the shapes compare on one axis.
  const scale = (v: number, lo: number, hi: number) => Math.round(((v - lo) / (hi - lo || 1)) * 100)
  const shares = src.series.filter((v): v is number => v != null)
  const [sLo, sHi] = [Math.min(...shares), Math.max(...shares)]
  const [aLo, aHi] = [Math.min(...SALES), Math.max(...SALES)]
  const chart = WEEKS.map((w, i) => ({
    week: w,
    sales: scale(SALES[i], aLo, aHi),
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
            Shoppers asking about Halloween candy see {META.brand} in <span className="font-semibold text-slate-950">{Math.round(last(answer.series))}%</span> of answer agent replies.
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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {SOURCES.map((s) => {
              const c = corr[s.id]
              const lead = leaderOf(s.id)
              const delta = Math.round(last(s.series) - first(s.series))
              const active = sel === s.id
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSel(s.id)}
                  aria-pressed={active}
                  className={cn(CARD, "flex flex-col gap-1 px-5 py-4 text-left outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-brand-300", active ? "ring-2 ring-brand-500" : "hover:ring-slate-300")}
                >
                  <span className="text-[15px] font-semibold text-slate-950">{s.name}</span>
                  <span className="text-xs text-slate-500">{s.examples}</span>
                  <span className={cn(HEAD, "mt-3")}>{s.metric}</span>
                  <span className="flex items-baseline gap-2">
                    <span className="font-mono text-3xl font-semibold text-slate-950 tabular-nums">{Math.round(last(s.series))}%</span>
                    <span className="text-sm whitespace-nowrap text-slate-500">
                      {lead === META.brand ? "You lead" : `${lead} ${BRAND_SHARE[lead][s.id]}%`}
                    </span>
                  </span>
                  <span className="text-xs text-slate-500 tabular-nums">
                    {delta >= 0 ? "+" : "−"}
                    {Math.abs(delta)} pts since {firstWeek(s.series)}
                  </span>
                  <span className="mt-3 border-t border-slate-100 pt-2 text-[13px] text-slate-700">
                    <span className="text-slate-500">Moves with sales: </span>
                    {linkLine(c)}
                  </span>
                </button>
              )
            })}
          </div>

          <div className={cn(CARD, "px-6 py-5")}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="text-[15px] font-semibold text-slate-950">
                Sales vs {src.name.toLowerCase()}: {src.metric}
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
                      return name === "sales" ? [`$${SALES[i].toFixed(1)}M`, "Retailer sales"] : [`${src.series[i]}%`, src.metric]
                    }}
                  />
                  <Line type="monotone" dataKey="sales" stroke="#0f172a" strokeWidth={2} dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="share" stroke="#875BF7" strokeWidth={2} dot={{ r: 2.5 }} connectNulls={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-slate-950" /> Retailer sales</span>
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
