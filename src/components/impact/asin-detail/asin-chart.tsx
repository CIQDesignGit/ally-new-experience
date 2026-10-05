"use client"

import { useMemo, useState, type CSSProperties } from "react"
import { formatCompactUsd } from "./format"
import type { AidCycle } from "./types"

interface AsinChartProps {
  cycles: AidCycle[]
}

const X0 = 56
const X1 = 1050
const Y0 = 232
const Y1 = 40

/** Chart series track cumulative dollars (not cents); adapt to the shared cents-based formatter. */
function money(dollars: number): string {
  return formatCompactUsd(dollars * 100)
}

function noiseFactor(seedKey: string, index: number): number {
  let h = 2166136261
  const s = `${seedKey}-${index}`
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  const r = ((h >>> 0) % 10000) / 10000
  return 0.82 + r * 0.36
}

export function AsinChart({ cycles }: AsinChartProps) {
  const [mode, setMode] = useState<"stacked" | "total">("stacked")
  const [isoKey, setIsoKey] = useState<string | null>(null)
  const [hover, setHover] = useState<{ x: number; dayIndex: number } | null>(null)

  const domain = useMemo(() => {
    const starts = cycles.map((c) => new Date(c.startDate).getTime())
    const ends = cycles.map((c) => new Date(c.endDate).getTime())
    const d0 = new Date(Math.min(...starts))
    const d1 = new Date(Math.max(...ends))
    const days = Math.round((d1.getTime() - d0.getTime()) / 86_400_000) + 1
    return { d0, d1, days: Math.max(2, days) }
  }, [cycles])

  const series = useMemo(() => {
    return cycles.map((c) => {
      const s = Math.max(0, Math.round((new Date(c.startDate).getTime() - domain.d0.getTime()) / 86_400_000))
      const e = Math.min(domain.days - 1, Math.round((new Date(c.endDate).getTime() - domain.d0.getTime()) / 86_400_000))
      const active: number[] = []
      for (let i = s; i <= e; i += 1) active.push(i)
      const weights = active.map((_, k) => noiseFactor(c.key, k))
      const wsum = weights.reduce((a, b) => a + b, 0) || 1
      const daily = new Array(domain.days).fill(0)
      active.forEach((d, k) => {
        daily[d] = (c.lifetimeCents / 100) * (weights[k] / wsum)
      })
      const cum = new Array(domain.days).fill(0)
      let run = 0
      for (let i = 0; i < domain.days; i += 1) {
        run += daily[i]
        cum[i] = run
      }
      return { ...c, cum }
    })
  }, [cycles, domain])

  const grand = series.reduce((a, s) => a + s.lifetimeCents / 100, 0)
  const yMax = Math.max(50_000, Math.ceil(grand / 50_000) * 50_000)
  const xOf = (i: number) => X0 + (i / (domain.days - 1)) * (X1 - X0)
  const yOf = (v: number) => Y0 - (v / yMax) * (Y0 - Y1)

  function pathArea(lower: number[], upper: number[]): string {
    let up = ""
    let down = ""
    for (let i = 0; i < domain.days; i += 2) {
      up += `${i === 0 ? "M" : "L"}${xOf(i).toFixed(1)},${yOf(upper[i]).toFixed(1)} `
    }
    up += `L${xOf(domain.days - 1).toFixed(1)},${yOf(upper[domain.days - 1]).toFixed(1)} `
    for (let i = domain.days - 1; i >= 0; i -= 2) {
      down += `L${xOf(i).toFixed(1)},${yOf(lower[i]).toFixed(1)} `
    }
    down += `L${xOf(0).toFixed(1)},${yOf(lower[0]).toFixed(1)} Z`
    return up + down
  }

  function pathLine(arr: number[]): string {
    let p = ""
    for (let i = 0; i < domain.days; i += 2) p += `${i === 0 ? "M" : "L"}${xOf(i).toFixed(1)},${yOf(arr[i]).toFixed(1)} `
    p += `L${xOf(domain.days - 1).toFixed(1)},${yOf(arr[domain.days - 1]).toFixed(1)}`
    return p
  }

  const bands = series.map((c, k) => {
    const lower = new Array(domain.days).fill(0)
    const upper = new Array(domain.days).fill(0)
    for (let i = 0; i < domain.days; i += 1) {
      let below = 0
      for (let j = 0; j < k; j += 1) below += series[j].cum[i]
      lower[i] = below
      upper[i] = below + c.cum[i]
    }
    return { ...c, lower, upper }
  })

  const gridVals = [0, yMax * 0.25, yMax * 0.5, yMax * 0.75, yMax]

  const totalLine = useMemo(() => {
    const tot = new Array(domain.days).fill(0)
    for (let i = 0; i < domain.days; i += 1) tot[i] = series.reduce((a, s) => a + s.cum[i], 0)
    return tot
  }, [series, domain])

  function isolate(key: string) {
    setIsoKey((prev) => {
      const next = prev === key ? null : key
      if (mode === "total" && next) setMode("stacked")
      return next
    })
  }

  const markers = useMemo(() => {
    const visible = series.filter((c) => !isoKey || isoKey === c.key)
    const withPositions = visible.map((c) => {
      const i = Math.max(0, Math.round((new Date(c.startDate).getTime() - domain.d0.getTime()) / 86_400_000))
      const cx = xOf(i)
      // Rough label width so we can tell when two neighboring labels would collide.
      const width = c.label.length * 5.6 + 14
      return { cycle: c, cx, width }
    })
    // Walk left-to-right and bump a label to a second row whenever it would
    // overlap the previous one, so short-gap cycles never collide.
    const sorted = [...withPositions].sort((a, b) => a.cx - b.cx)
    let prevRight = -Infinity
    let row = 0
    const rowByKey = new Map<string, number>()
    for (const item of sorted) {
      const left = item.cx - item.width / 2
      row = left < prevRight ? (row === 0 ? 1 : 0) : 0
      rowByKey.set(item.cycle.key, row)
      prevRight = item.cx + item.width / 2
    }
    return withPositions.map((item) => ({ ...item, row: rowByKey.get(item.cycle.key) ?? 0 }))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- xOf is a stable function of domain/yMax, recomputed each render
  }, [series, isoKey, domain])

  const dateTicks = useMemo(() => {
    const ticks: { i: number; label: string }[] = []
    const step = Math.max(1, Math.floor(domain.days / 6))
    for (let i = 0; i < domain.days; i += step) {
      const d = new Date(domain.d0.getTime() + i * 86_400_000)
      ticks.push({ i, label: d.toLocaleDateString("en-US", { month: "short" }) })
    }
    ticks.push({ i: domain.days - 1, label: "Now" })
    return ticks
  }, [domain])

  return (
    <div className="aid-section">
      <div className="aid-section-head">
        <div>
          <div className="aid-section-title">Value accrued over time</div>
          <div className="aid-section-note" style={{ marginTop: 4 }}>
            Each band is one measurement cycle, A/B or modelled. The dollars a cycle earns while active stay in the
            total.
          </div>
        </div>
        <div className="aid-chart-modes">
          <button
            type="button"
            className={`aid-cm ${mode === "stacked" ? "aid-active" : ""}`}
            onClick={() => setMode("stacked")}
          >
            All cycles
          </button>
          <button
            type="button"
            className={`aid-cm ${mode === "total" ? "aid-active" : ""}`}
            onClick={() => setMode("total")}
          >
            Total only
          </button>
        </div>
      </div>

      <div className="aid-chart-wrap">
        <div className={`aid-chart-readout ${hover ? "aid-on" : ""}`}>
          <span className="aid-ro-date">
            {hover ? new Date(domain.d0.getTime() + hover.dayIndex * 86_400_000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
          </span>
          <span className="aid-ro-total">
            {hover
              ? isoKey
                ? money(series.find((s) => s.key === isoKey)?.cum[hover.dayIndex] ?? 0)
                : money(series.reduce((a, s) => a + s.cum[hover.dayIndex], 0))
              : ""}
          </span>
          <span className="aid-ro-detail">
            {hover
              ? isoKey
                ? `from ${series.find((s) => s.key === isoKey)?.label} alone`
                : series
                    .filter((s) => s.cum[hover.dayIndex] > 0)
                    .map((s) => `${s.label} ${money(s.cum[hover.dayIndex])}`)
                    .join(" · ")
              : ""}
          </span>
        </div>

        <svg viewBox="0 0 1080 284" width="100%" height={284} style={{ overflow: "visible" }}>
          <defs>
            {/* One hatch per modelled cycle, so a modelled band keeps its own
                colour instead of collapsing to a single shared blue. */}
            {series
              .filter((c) => c.method === "model")
              .map((c) => (
                <pattern
                  key={c.key}
                  id={`aid-model-hatch-${c.key}`}
                  width={7}
                  height={7}
                  patternTransform="rotate(45)"
                  patternUnits="userSpaceOnUse"
                >
                  <rect width={7} height={7} fill={c.color} fillOpacity={0.16} />
                  <line x1={0} y1={0} x2={0} y2={7} stroke={c.color} strokeWidth={2.4} strokeOpacity={0.5} />
                </pattern>
              ))}
          </defs>

          {gridVals.map((v) => (
            <g key={v}>
              <line x1={X0} y1={yOf(v)} x2={X1} y2={yOf(v)} stroke="#E2E8F0" strokeWidth={1} />
              <text x={X0 - 10} y={yOf(v) + 3.5} textAnchor="end" fontSize={10} fontWeight={500} fill="#94A3B8">
                {v === 0 ? "$0" : `$${Math.round(v / 1000)}K`}
              </text>
            </g>
          ))}

          {mode === "stacked"
            ? bands.map((b) => {
                const dim = isoKey != null && isoKey !== b.key
                let fill = b.color
                let fillOpacity = isoKey === b.key ? 0.42 : 0.3
                const strokeDash = b.method === "resumed" ? "5 4" : "0"
                if (b.method === "model") {
                  fill = `url(#aid-model-hatch-${b.key})`
                  fillOpacity = 1
                } else if (b.method === "resumed") {
                  fillOpacity = isoKey === b.key ? 0.34 : 0.22
                }
                return (
                  <path
                    key={b.key}
                    className={`aid-band ${dim ? "aid-dimmed" : ""}`}
                    d={pathArea(b.lower, b.upper)}
                    fill={fill}
                    fillOpacity={fillOpacity}
                    stroke={b.color}
                    strokeWidth={1.6}
                    strokeOpacity={0.85}
                    strokeDasharray={strokeDash}
                    onClick={() => isolate(b.key)}
                  />
                )
              })
            : (
                <>
                  <path d={pathArea(new Array(domain.days).fill(0), totalLine)} fill="#C231FF" fillOpacity={0.14} stroke="none" />
                  <path d={pathLine(totalLine)} fill="none" stroke="#C231FF" strokeWidth={2.6} strokeLinejoin="round" />
                </>
              )}

          {markers.map(({ cycle: c, cx, row }) => {
            const labelY = Y1 - 10 - row * 15
            return (
              <g key={c.key}>
                <line x1={cx} y1={Y1 - 4} x2={cx} y2={Y0} stroke={c.color} strokeWidth={1} strokeDasharray="3 3" opacity={0.5} />
                <circle
                  cx={cx}
                  cy={Y0}
                  r={4}
                  fill="#fff"
                  stroke={c.color}
                  strokeWidth={c.method === "resumed" ? 2 : 2.4}
                  strokeDasharray={c.method === "resumed" ? "2 1.5" : undefined}
                />
                <line x1={cx} y1={Y1 - 4} x2={cx} y2={labelY + 9} stroke={c.color} strokeWidth={1} opacity={0.35} />
                <text x={cx} y={labelY} textAnchor="middle" fontSize={9.5} fontWeight={600} fill="#64748B">
                  {c.label}
                </text>
              </g>
            )
          })}

          {dateTicks.map((t) => (
            <text key={t.i} x={xOf(t.i)} y={Y0 + 18} textAnchor="middle" fontSize={10} fontWeight={500} fill="#94A3B8">
              {t.label}
            </text>
          ))}

          {hover ? <line x1={hover.x} y1={Y1 - 6} x2={hover.x} y2={Y0} stroke="#0F172A" strokeWidth={1} opacity={0.22} /> : null}

          <rect
            x={X0}
            y={Y1 - 6}
            width={X1 - X0}
            height={Y0 - Y1 + 6}
            fill="transparent"
            onMouseMove={(event) => {
              const svg = event.currentTarget.ownerSVGElement
              if (!svg) return
              const rect = svg.getBoundingClientRect()
              const px = (event.clientX - rect.left) * (1080 / rect.width)
              let i = Math.round(((px - X0) / (X1 - X0)) * (domain.days - 1))
              i = Math.max(0, Math.min(domain.days - 1, i))
              setHover({ x: xOf(i), dayIndex: i })
            }}
            onMouseLeave={() => setHover(null)}
          />
        </svg>
      </div>

      <div className="aid-chart-legend">
        {series.map((c) => {
          const cls = isoKey ? (isoKey === c.key ? "aid-isolated" : "aid-dimmed") : ""
          const tagText = c.method === "model" ? "MODEL" : c.method === "resumed" ? "RESUMED" : "A/B"
          const swatchStyle: CSSProperties =
            c.method === "model"
              ? { background: `repeating-linear-gradient(115deg,${c.color} 0 3px,#DBEAFE 3px 6px)`, border: "none" }
              : c.method === "resumed"
                ? { background: "transparent", border: `1.5px dashed ${c.color}`, opacity: 0.85 }
                : { background: c.color, border: "none" }
          return (
            <span key={c.key} className={`aid-li ${cls}`} onClick={() => isolate(c.key)}>
              <span className="aid-swatch" style={swatchStyle} />
              <span className="aid-lbl">{c.label}</span>
              <span className="aid-lm">{tagText}</span>
              <span className="aid-amt">{money(c.lifetimeCents / 100)}</span>
            </span>
          )
        })}
      </div>

      <div className="aid-isolate-hint">
        {isoKey
          ? "Showing one cycle. Click it again to see all — this is the same view as filtering the page to the dates that cycle was live."
          : "Click a cycle in the legend to isolate it — the same as filtering the page to the dates that cycle was live."}
      </div>

      <div className="aid-method-key">
        <div className="aid-mk-item">
          <span className="aid-mk-swatch aid-ab" />
          A/B tested — Amazon split traffic and reported a result
        </div>
        <div className="aid-mk-item">
          <span className="aid-mk-swatch aid-model" />
          Modelled — no control group; measured against a demand-adjusted baseline
        </div>
        <div className="aid-mk-item">
          <span className="aid-mk-swatch aid-resumed" />
          Resumed — no new test; continuing a prior cycle&apos;s proven rate
        </div>
      </div>
    </div>
  )
}
