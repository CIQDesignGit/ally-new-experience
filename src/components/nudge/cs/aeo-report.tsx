"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { AEO, LEADER, LEADERBOARD, LOSING, LOSING_SKUS, POSITIONS, TOPICS, WEEKS } from "./aeo-data"
import { WhyIcon } from "./why-icon"

const HEAD = "text-xs font-medium text-slate-500"
const pts = (v: number) => (v === 0 ? "flat" : `${v > 0 ? "+" : "−"}${Math.abs(v).toFixed(1)} pts`)
const tone = (v: number) => (v > 0 ? "text-success-700" : v < 0 ? "text-error-600" : "text-slate-500")
const moved = (m: number) => (m === 0 ? "—" : m > 0 ? `up ${m}` : `down ${-m}`)

/**
 * The AI visibility report, as Ally answers it in chat: the claim, how it
 * moved, who's ahead, which topics and questions cost the most, and what Ally
 * already drafted. Numbers from the readout sent Oct 5.
 */
/** `className` lets a full page widen it; in chat it keeps its own width. */
export function AeoReport({ className }: { className?: string } = {}) {
  const change = +(AEO.visibility - AEO.prevVisibility).toFixed(1)
  const down = AEO.rank - AEO.prevRank
  const leader = LEADERBOARD[0]
  return (
    <div className={cn("flex max-w-[960px] flex-col gap-8 rounded-2xl bg-white px-6 py-5 text-[15px] text-slate-700 ring-1 ring-slate-200", className)}>
      <div>
        <div className={HEAD}>
          AI visibility · {AEO.assistant} · {AEO.period} vs {AEO.previous} · {AEO.questions} questions
        </div>
        <p className="mt-2 text-lg leading-snug font-semibold text-slate-950">
          You&apos;re <span className="font-mono">#{AEO.rank}</span> on {AEO.assistant} at <span className="font-mono">{AEO.visibility}%</span>, down{" "}
          <span className="font-mono text-error-600">{Math.abs(change)} pts</span> and {down} places. {leader.brand} leads at <span className="font-mono">{leader.share}%</span>.
        </p>
        <p className="mt-1 text-slate-700">
          Most of the drop is clean-burning candles (<span className="font-mono text-error-600">−9.0 pts</span>).
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section>
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="text-sm font-semibold text-slate-950">AI visibility, weekly</h3>
            <span className="flex items-center gap-4 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-0.5 w-4 bg-ally-500" /> You
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-0 w-4 border-t-2 border-dashed border-slate-300" /> {AEO.previous}
              </span>
            </span>
          </div>
          <TrendChart />
        </section>
        <section>
          <h3 className="text-sm font-semibold text-slate-950">Top 10 on {AEO.assistant}</h3>
          <div className="mt-2 flex flex-col">
            {LEADERBOARD.map((b, i) => (
              <div key={b.brand} className={cn("grid grid-cols-[24px_minmax(0,1fr)_64px_48px_56px] items-center gap-2 rounded-md px-2 py-1.5 text-[13px]", b.you && "bg-ally-50")}>
                <span className="font-mono text-slate-400 tabular-nums">#{i + 1}</span>
                <span className={cn("truncate", b.you ? "font-semibold text-slate-950" : "text-slate-700")}>
                  {b.brand}
                  {b.you ? " (you)" : ""}
                </span>
                <span className="relative h-1.5 rounded-full bg-slate-100">
                  <span className={cn("absolute inset-y-0 left-0 rounded-full", b.you ? "bg-ally-500" : "bg-slate-300")} style={{ width: `${(b.share / leader.share) * 100}%` }} />
                </span>
                <span className="text-right font-mono text-slate-950 tabular-nums">{b.share.toFixed(1)}%</span>
                <span className={cn("text-right text-xs font-medium", b.moved > 0 ? "text-success-700" : b.moved < 0 ? "text-error-600" : "text-slate-400")}>{moved(b.moved)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section>
        <h3 className="text-sm font-semibold text-slate-950">By topic, biggest drop first</h3>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left">
                <th className={`${HEAD} pb-2`}>Topic</th>
                <th className={`${HEAD} pb-2`}>You vs {LEADER}</th>
                <th className={`${HEAD} pb-2 text-right`}>You</th>
                <th className={`${HEAD} pb-2 text-right`}>Place</th>
                <th className={`${HEAD} pb-2 text-right`}>vs {AEO.previous}</th>
              </tr>
            </thead>
            <tbody>
              {TOPICS.map((t) => (
                <tr key={t.topic} className="border-b border-slate-100">
                  <td className="py-2.5 pr-4 font-medium text-slate-950">{t.topic}</td>
                  <td className="w-[260px] py-2.5 pr-6">
                    {/* Your share against the leader's, on one 0–40% scale. */}
                    <span className="relative block h-2 rounded-full bg-slate-100">
                      <span className="absolute inset-y-0 left-0 rounded-full bg-ally-500" style={{ width: `${(t.you / 40) * 100}%` }} />
                      <span className="absolute -inset-y-1 w-0.5 bg-slate-950" style={{ left: `${(t.leader / 40) * 100}%` }} title={`${LEADER} ${t.leader}%`} />
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
                      {LEADER} <span className="font-mono">{t.leader.toFixed(1)}%</span>
                    </span>
                  </td>
                  <td className="py-2.5 text-right font-mono text-slate-950 tabular-nums">{t.you.toFixed(1)}%</td>
                  <td className="py-2.5 text-right whitespace-nowrap text-slate-700">
                    <span className="font-mono">#{t.rank}</span>
                    {t.moved !== 0 && <span className={cn("ml-1.5 text-xs font-medium", tone(t.moved))}>{moved(t.moved)}</span>}
                  </td>
                  <td className={cn("py-2.5 text-right font-mono whitespace-nowrap tabular-nums", tone(t.change))}>{pts(t.change)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <LosingQuestions />

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
        <span className="text-sm text-slate-700">
          Ally drafted fixes for <span className="font-mono font-semibold text-slate-950">{LOSING_SKUS}</span> SKUs on these questions · live on autopilot Thu, Oct 8 · next readout Mon, Nov 2
        </span>
        <Link href="/settings?tab=policy" className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
          See what runs on autopilot <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  )
}

/** The 8 questions you lost ground on: where you appear now, the change, and what Ally drafted. */
function LosingQuestions() {
  const [all, setAll] = useState(false)
  const rows = all ? LOSING : LOSING.slice(0, 5)
  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h3 className="text-sm font-semibold text-slate-950">Questions you lost ground on</h3>
        <span className="text-xs text-slate-500">
          Across {AEO.questions}: {POSITIONS.map((p) => `${p.n} ${p.label.toLowerCase()}`).join(" · ")}
        </span>
      </div>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left">
              <th className={`${HEAD} pb-2`}>Shopper question</th>
              <th className={`${HEAD} pb-2`}>Where you appear</th>
              <th className={`${HEAD} pb-2 text-right`}>You</th>
              <th className={`${HEAD} pb-2 text-right`}>Change</th>
              <th className={`${HEAD} pb-2 pl-6`}>Ally drafted</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => (
              <tr key={l.q} className="border-b border-slate-100 align-top">
                <td className="py-2.5 pr-4">
                  <span className="flex items-center gap-1">
                    <span className="text-slate-950">{l.q}</span>
                    {l.note && <WhyIcon why={[{ text: l.note, scope: "Brand", source: "Legal" }]} align="left" />}
                  </span>
                  <span className="block text-xs text-slate-500">{l.topic}</span>
                </td>
                <td className="py-2.5 pr-4 whitespace-nowrap">
                  <span className={cn("inline-flex items-center gap-1.5", l.position === "Not surfaced" ? "text-slate-500" : "text-slate-700")}>
                    <span className={cn("size-1.5 rounded-full", l.position === "Runner-up" ? "bg-ally-400" : l.position === "Down the list" ? "bg-slate-400" : "border border-slate-300")} />
                    {l.position}
                    {l.rank && <span className="font-mono text-xs text-slate-400">#{l.rank}</span>}
                  </span>
                </td>
                <td className="py-2.5 text-right font-mono text-slate-950 tabular-nums">{l.you}%</td>
                <td className={cn("py-2.5 text-right font-mono whitespace-nowrap tabular-nums", tone(l.change))}>{pts(l.change)}</td>
                <td className="py-2.5 pl-6 whitespace-nowrap text-slate-700">
                  {l.skus} {l.skus === 1 ? "SKU" : "SKUs"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {LOSING.length > 5 && (
        <button type="button" onClick={() => setAll((v) => !v)} className="mt-2 text-[13px] font-medium text-brand-700 hover:underline">
          {all ? "Show fewer" : `Show all ${LOSING.length}`}
        </button>
      )}
    </section>
  )
}

/** One axis (AI visibility, %): you and the previous period; your place labelled on each week. */
function TrendChart() {
  const W = 560
  const H = 290
  const PAD = { l: 36, r: 24, t: 24, b: 28 }
  const x = (i: number) => PAD.l + (i * (W - PAD.l - PAD.r)) / (WEEKS.length - 1)
  const y = (v: number) => PAD.t + ((16 - v) / 10) * (H - PAD.t - PAD.b)
  const line = (k: "you" | "prev") => WEEKS.map((w, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(w[k]).toFixed(1)}`).join(" ")
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full" role="img" aria-label={`AI visibility fell from ${WEEKS[0].you}% to ${WEEKS[WEEKS.length - 1].you}% over four weeks`}>
      {[6, 10, 14].map((t) => (
        <g key={t}>
          <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} className="stroke-slate-100" />
          <text x={PAD.l - 8} y={y(t) + 4} textAnchor="end" className="fill-slate-400 text-[11px]">
            {t}%
          </text>
        </g>
      ))}
      <path d={line("prev")} fill="none" className="stroke-slate-300" strokeWidth={2} strokeDasharray="5 4" />
      <path d={line("you")} fill="none" className="stroke-ally-500" strokeWidth={2} />
      {WEEKS.map((w, i) => (
        <g key={w.week}>
          <circle cx={x(i)} cy={y(w.you)} r={4} className="fill-ally-500 stroke-white" strokeWidth={2}>
            <title>{`${w.week}: ${w.you}%, #${w.rank}`}</title>
          </circle>
          <text x={x(i)} y={y(w.you) + 18} textAnchor="middle" className="fill-slate-700 text-[11px] font-medium">
            #{w.rank}
          </text>
          <text x={x(i)} y={H - 6} textAnchor="middle" className="fill-slate-400 text-[11px]">
            {w.week}
          </text>
        </g>
      ))}
      <text x={x(WEEKS.length - 1) + 8} y={y(WEEKS[WEEKS.length - 1].you) - 8} textAnchor="end" className="fill-ally-700 text-[11px] font-semibold">
        {WEEKS[WEEKS.length - 1].you}%
      </text>
    </svg>
  )
}

export const AEO_Q = "Show me the AI visibility report"
export const aeoChip = { q: AEO_Q, match: /\b(aeo|ai visibility|alexa|visibility report|share of voice on ai)\b/i, think: { ms: 1600, label: "Reading this month's Alexa Shopping readout" }, render: () => <AeoReport /> }
