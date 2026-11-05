"use client"

import { cn } from "@/lib/utils"
import { MARKET, SEGMENTS } from "../market"

/**
 * The market 2×2: your share against segment growth, bubble size = segment
 * sales, color = gaining or losing share. Quadrants are named for the strategy
 * they imply. Drawn at the size it shows so labels stay 10–12px.
 */
export function MarketMap({ selected, onSelect, compact = false }: { selected?: string; onSelect?: (id: string) => void; compact?: boolean }) {
  const W = compact ? 300 : 480
  const H = compact ? 170 : 400
  const pad = compact ? { l: 42, r: 8, t: 8, b: 30 } : { l: 64, r: 24, t: 28, b: 54 }
  const xMin = -6, xMax = 26, yMin = 0, yMax = 30
  const x = (v: number) => pad.l + ((v - xMin) / (xMax - xMin)) * (W - pad.l - pad.r)
  const y = (v: number) => H - pad.b - ((v - yMin) / (yMax - yMin)) * (H - pad.t - pad.b)
  const r = (size: number) => Math.sqrt(size) * (compact ? 1.0 : 1.9)
  const fill = (c: number) => (c > 0.05 ? "var(--color-success-500)" : c < -0.05 ? "var(--color-error-500)" : "var(--color-slate-400)")
  const tick = compact ? "text-[10px]" : "text-[11px]"
  const title = compact ? "text-[10px]" : "text-[12px]"
  const tx = compact ? 7 : 16
  const midY = (pad.t + H - pad.b) / 2
  const quad = [
    { label: "Defend", x: x(xMin) + 10, y: y(yMax) + 18, anchor: "start" },
    { label: "Lead", x: x(xMax) - 10, y: y(yMax) + 18, anchor: "end" },
    { label: "Deprioritize", x: x(xMin) + 10, y: y(yMin) - 10, anchor: "start" },
    { label: "Attack", x: x(xMax) - 10, y: y(yMin) - 10, anchor: "end" },
  ] as const

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Your share against segment growth; bubble size is the segment's sales">
      {/* The attack quadrant is the one worth a tint: growing segments where you're small. */}
      <rect x={x(MARKET.growth)} y={y(MARKET.shareSplit)} width={x(xMax) - x(MARKET.growth)} height={y(yMin) - y(MARKET.shareSplit)} fill="var(--color-brand-50)" />
      <line x1={x(MARKET.growth)} x2={x(MARKET.growth)} y1={y(yMax)} y2={y(yMin)} stroke="var(--color-slate-300)" strokeDasharray="4 4" />
      <line x1={x(xMin)} x2={x(xMax)} y1={y(MARKET.shareSplit)} y2={y(MARKET.shareSplit)} stroke="var(--color-slate-300)" strokeDasharray="4 4" />
      <line x1={x(xMin)} x2={x(xMax)} y1={y(yMin)} y2={y(yMin)} stroke="var(--color-slate-400)" />
      <line x1={x(xMin)} x2={x(xMin)} y1={y(yMin)} y2={y(yMax)} stroke="var(--color-slate-400)" />
      {[0, 10, 20].map((v) => (
        <g key={`x${v}`}>
          <line x1={x(v)} x2={x(v)} y1={y(yMin)} y2={y(yMin) + 4} stroke="var(--color-slate-400)" />
          <text x={x(v)} y={y(yMin) + (compact ? 13 : 17)} textAnchor="middle" className={cn("fill-slate-500 font-mono", tick)}>
            {v}%
          </text>
        </g>
      ))}
      {(compact ? [0, 10, 20] : [0, 10, 20, 30]).map((v) => (
        <g key={`y${v}`}>
          <line x1={x(xMin) - 4} x2={x(xMin)} y1={y(v)} y2={y(v)} stroke="var(--color-slate-400)" />
          <text x={x(xMin) - 7} y={y(v) + 3.5} textAnchor="end" className={cn("fill-slate-500 font-mono", tick)}>
            {v}%
          </text>
        </g>
      ))}
      <text x={(pad.l + W - pad.r) / 2} y={H - (compact ? 3 : 12)} textAnchor="middle" className={cn("fill-slate-600 font-medium", title)}>
        {compact ? "Segment growth →" : "Segment growth vs last year →"}
      </text>
      <text x={tx} y={midY} textAnchor="middle" transform={`rotate(-90 ${tx} ${midY})`} className={cn("fill-slate-600 font-medium", title)}>
        {compact ? "Your share →" : "Your share of the segment →"}
      </text>
      {!compact &&
        quad.map((q) => (
          <text key={q.label} x={q.x} y={q.y} textAnchor={q.anchor} className="fill-slate-400 font-mono text-[11px] tracking-wide uppercase">
            {q.label}
          </text>
        ))}
      {!compact && (
        <text x={x(MARKET.growth)} y={pad.t - 10} textAnchor="middle" className="fill-slate-400 text-[11px]">
          Category +{MARKET.growth}%
        </text>
      )}
      {[...SEGMENTS]
        .sort((a, b) => b.size - a.size)
        .map((s) => {
          const active = selected === s.id
          return (
            <g key={s.id} onClick={() => onSelect?.(s.id)} className={cn(onSelect && "cursor-pointer")}>
              <title>{`${s.name}: $${s.size}M, ${s.growth > 0 ? "+" : ""}${s.growth}% growth, your share ${s.share}%`}</title>
              <circle cx={x(s.growth)} cy={y(s.share)} r={r(s.size)} fill={fill(s.change)} fillOpacity={active ? 0.9 : 0.55} stroke="white" strokeWidth={2} />
              {active && <circle cx={x(s.growth)} cy={y(s.share)} r={r(s.size) + 4} fill="none" stroke="var(--color-slate-900)" strokeWidth={1.5} />}
              {compact && active && (
                <text x={x(s.growth) + r(s.size) + 4} y={y(s.share) - r(s.size) - 8} textAnchor="end" className="fill-slate-950 text-[10px] font-semibold">
                  {s.name}
                </text>
              )}
              {!compact && (
                <text x={x(s.growth)} y={y(s.share) - r(s.size) - 6} textAnchor="middle" className={cn("text-[12px]", active ? "fill-slate-950 font-semibold" : "fill-slate-700")}>
                  {s.name}
                </text>
              )}
            </g>
          )
        })}
    </svg>
  )
}
