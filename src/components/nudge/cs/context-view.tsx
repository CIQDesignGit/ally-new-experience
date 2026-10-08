"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { BRAND_CONTEXT, BRAND_TOTAL, CATEGORY, CONTEXT_TYPES, GROWTH, NEW_BRAND_START, OUTCOMES, PATTERNS, TYPE_COUNTS } from "./context-data"
import type { ContextType } from "./context-data"

const HEAD = "text-xs font-medium text-slate-500"

/**
 * What Ally knows about Aurelle, and what that knowledge changed: the curve
 * of drafts approved first time as context grew, the entries by type with what
 * each did, and the category patterns learned across brands.
 */
export function ContextView({ editor }: { /** The editable rules, opened from the list. */ editor?: React.ReactNode }) {
  const first = GROWTH[0]
  const last = GROWTH[GROWTH.length - 1]
  return (
    <div className="flex flex-col gap-10">
      <div>
        <h2 className="text-2xl leading-tight font-bold tracking-tight text-slate-950">
          Ally knows <span className="font-mono">{BRAND_TOTAL}</span> things about Aurelle.
        </h2>
        <div className="mt-1 text-lg text-slate-700">
          Drafts approved first time: <span className="font-mono font-semibold text-slate-950">{last.firstPass}%</span>, up from <span className="font-mono">{first.firstPass}%</span> in August.
        </div>
      </div>

      <section>
        <h2 className="text-xl font-semibold tracking-tight text-slate-950">How context changes the work</h2>
        <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
          <GrowthChart />
          <div className="flex flex-col gap-3">
            {OUTCOMES.map((o) => (
              <div key={o.label} className="rounded-xl bg-slate-25 px-4 py-3 ring-1 ring-slate-100">
                <div className={HEAD}>{o.label}</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-mono text-xl font-semibold whitespace-nowrap text-slate-950 tabular-nums">{o.now}</span>
                  <span className="text-[13px] whitespace-nowrap text-slate-500">
                    from <span className="font-mono">{o.then}</span> in Aug
                  </span>
                </div>
              </div>
            ))}
            <p className="text-[13px] text-slate-500">Fewer fixes means more can safely run on autopilot, and value lands sooner.</p>
          </div>
        </div>
      </section>

      <BrandContext editor={editor} />

      <section>
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">Learned across {CATEGORY.name.toLowerCase()}</h2>
          <span className="text-sm text-slate-500">
            {CATEGORY.brands} brands · the pattern travels, no brand&apos;s data does · published by {CATEGORY.lead}
          </span>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left">
                <th className={`${HEAD} pb-2`}>Pattern</th>
                <th className={`${HEAD} pb-2`}>Evidence</th>
                <th className={`${HEAD} pb-2`}>Status</th>
                <th className={`${HEAD} pb-2`}>For Aurelle</th>
              </tr>
            </thead>
            <tbody>
              {PATTERNS.map((p) => (
                <tr key={p.text} className="border-b border-slate-100">
                  <td className="py-3 pr-6 font-medium text-slate-950">{p.text}</td>
                  <td className="py-3 pr-6 text-slate-700">{p.evidence}</td>
                  <td className="py-3 pr-6 whitespace-nowrap">
                    <span className={cn("inline-flex items-center gap-1.5 text-[13px] font-medium", p.status === "Proven" ? "text-success-700" : p.status === "Testing" ? "text-slate-500" : "text-warning-700")}>
                      <span className={cn("size-1.5 rounded-full", p.status === "Proven" ? "bg-success-500" : p.status === "Testing" ? "bg-slate-400" : "bg-warning-500")} />
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 text-slate-700">{p.aurelle}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[13px] text-slate-500">
          Seen at 3 or more brands, then tested, then proven, then signed off before it reaches every account. A brand&apos;s own rule always comes first. A new candle brand starts at about{" "}
          <span className="font-mono">{NEW_BRAND_START}%</span> first-time approval on day one, not <span className="font-mono">{first.firstPass}%</span>.
        </p>
      </section>
    </div>
  )
}

/** Two charts on one week axis: drafts approved first time (line), and entries learned (columns). No second y-axis. */
function GrowthChart() {
  const W = 640
  const PAD = { l: 40, r: 16 }
  const x = (i: number) => PAD.l + (i * (W - PAD.l - PAD.r)) / (GROWTH.length - 1)
  // Line: 50% to 90%.
  // Room above the top line for the notes on the points.
  const LH = 184
  const y = (v: number) => 36 + ((90 - v) / 40) * (LH - 56)
  const path = GROWTH.map((g, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(g.firstPass).toFixed(1)}`).join(" ")
  // Columns: 0 to 70 entries.
  const BH = 90
  const by = (v: number) => (v / 80) * (BH - 24)
  const [hover, setHover] = useState<number | null>(null)
  const h = hover !== null ? GROWTH[hover] : null
  return (
    <div className="rounded-xl border border-slate-200 px-5 py-4">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-sm font-semibold text-slate-950">Drafts approved first time</span>
        <span className="text-[13px] text-slate-500 tabular-nums">{h ? `${h.week} · ${h.firstPass}% · ${h.entries} entries` : "Weekly, since onboarding"}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${LH}`} className="mt-2 w-full" role="img" aria-label={`Drafts approved first time rose from ${GROWTH[0].firstPass}% to ${GROWTH[GROWTH.length - 1].firstPass}%`} onMouseLeave={() => setHover(null)}>
        {[60, 70, 80, 90].map((t) => (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} className="stroke-slate-100" />
            <text x={PAD.l - 8} y={y(t) + 4} textAnchor="end" className="fill-slate-400 text-[11px]">
              {t}%
            </text>
          </g>
        ))}
        <path d={path} fill="none" className="stroke-ally-500" strokeWidth={2} strokeLinejoin="round" />
        {GROWTH.map((g, i) => (
          <g key={g.week}>
            {g.note && (
              <>
                <line x1={x(i)} x2={x(i)} y1={y(g.firstPass) - 6} y2={y(g.firstPass) - 22} className="stroke-slate-300" />
                <text x={x(i)} y={y(g.firstPass) - 26} textAnchor={i === GROWTH.length - 1 ? "end" : "middle"} className="fill-slate-500 text-[11px]">
                  {g.note}
                </text>
              </>
            )}
            <circle cx={x(i)} cy={y(g.firstPass)} r={hover === i ? 5 : g.note ? 4 : 0} className="fill-ally-500 stroke-white" strokeWidth={2} />
            <rect x={x(i) - 30} y={0} width={60} height={LH} fill="transparent" onMouseEnter={() => setHover(i)} />
          </g>
        ))}
      </svg>
      <div className="mt-3 text-sm font-semibold text-slate-950">Things Ally knows about Aurelle</div>
      <svg viewBox={`0 0 ${W} ${BH}`} className="mt-1 w-full" role="img" aria-label={`Entries grew from ${GROWTH[0].entries} to ${GROWTH[GROWTH.length - 1].entries}`}>
        {GROWTH.map((g, i) => (
          <g key={g.week}>
            <rect x={x(i) - 14} y={BH - 20 - by(g.entries)} width={28} height={by(g.entries)} rx={3} className={hover === i ? "fill-ally-500" : "fill-ally-200"} />
            {(i === 0 || i === GROWTH.length - 1) && (
              <text x={x(i)} y={BH - 24 - by(g.entries)} textAnchor="middle" className="fill-slate-700 text-[11px] font-medium">
                {g.entries}
              </text>
            )}
            {i % 3 === 0 || i === GROWTH.length - 1 ? (
              <text x={x(i)} y={BH - 4} textAnchor="middle" className="fill-slate-400 text-[11px]">
                {g.week}
              </text>
            ) : null}
          </g>
        ))}
      </svg>
    </div>
  )
}

/** The library: entries by type, each with where it came from and what it changed. */
function BrandContext({ editor }: { editor?: React.ReactNode }) {
  const [type, setType] = useState<ContextType | "All">("All")
  const [editing, setEditing] = useState(false)
  const rows = BRAND_CONTEXT.filter((e) => type === "All" || e.type === type)
  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight text-slate-950">What Ally knows about Aurelle</h2>
        {editor && (
          <button type="button" onClick={() => setEditing((v) => !v)} aria-expanded={editing} className="text-sm font-medium text-brand-700 hover:underline">
            {editing ? "Done editing" : "Add or edit"}
          </button>
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {(["All", ...CONTEXT_TYPES] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            aria-pressed={type === t}
            className={cn("rounded-lg px-3 py-1.5 text-[13px] font-medium", type === t ? "bg-white text-slate-950 shadow-xs ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-800")}
          >
            {t} <span className="font-mono text-slate-400">{t === "All" ? BRAND_TOTAL : TYPE_COUNTS[t]}</span>
          </button>
        ))}
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left">
              <th className={`${HEAD} pb-2`}>Context</th>
              <th className={`${HEAD} pb-2`}>Type</th>
              <th className={`${HEAD} pb-2`}>From</th>
              <th className={`${HEAD} pb-2 text-right`}>Used in</th>
              <th className={`${HEAD} pb-2 pl-6`}>What it changed</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.text} className="border-b border-slate-100">
                <td className="py-3 pr-6">
                  <span className="font-medium text-slate-950">{e.text}</span>
                  {e.expires && <span className="ml-2 text-[13px] text-slate-500">· until {e.expires}</span>}
                </td>
                <td className="py-3 pr-6 text-slate-700">{e.type}</td>
                <td className="py-3 pr-6 whitespace-nowrap text-slate-700">{e.source}</td>
                <td className="py-3 text-right font-mono text-slate-950 tabular-nums">{e.applied}</td>
                <td className={cn("py-3 pl-6", e.result ? "text-slate-700" : "text-slate-400")}>{e.result ?? "Not measured yet"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[13px] text-slate-500">
        Showing {rows.length} of {type === "All" ? BRAND_TOTAL : TYPE_COUNTS[type]} · from calls, edits, the brand team and legal
      </p>
      {editing && <div className="mt-5">{editor}</div>}
    </section>
  )
}
