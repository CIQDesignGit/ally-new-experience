"use client"

/**
 * A small line chart for a weekly trend: one or two series over the same weeks,
 * a dashed series for a target (plan), the last value labelled. Sized by its box.
 */
export function LineChart({ labels, series, format }: { labels: string[]; series: { name: string; values: number[]; color: string; dashed?: boolean }[]; format: (v: number) => string }) {
  const W = 320
  const H = 150
  const pad = { l: 4, r: 52, t: 10, b: 22 }
  const all = series.flatMap((s) => s.values)
  const min = Math.min(...all)
  const max = Math.max(...all)
  const span = max - min || 1
  const x = (i: number) => pad.l + (i / (labels.length - 1)) * (W - pad.l - pad.r)
  const y = (v: number) => pad.t + (1 - (v - min) / span) * (H - pad.t - pad.b)
  return (
    <div className="flex h-full flex-col">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full flex-1" role="img" aria-label={series.map((s) => `${s.name} ${format(s.values[s.values.length - 1])}`).join(", ")}>
        {series.map((s) => (
          <g key={s.name}>
            <polyline points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(" ")} fill="none" stroke={s.color} strokeWidth={2} strokeDasharray={s.dashed ? "4 3" : undefined} />
            <circle cx={x(s.values.length - 1)} cy={y(s.values[s.values.length - 1])} r={3} fill={s.color} />
            <text x={x(s.values.length - 1) + 6} y={y(s.values[s.values.length - 1]) + 4} fontSize={11} fontFamily="var(--font-mono)" fontWeight={600} fill={s.color}>
              {format(s.values[s.values.length - 1])}
            </text>
          </g>
        ))}
        {[0, labels.length - 1].map((i) => (
          <text key={i} x={x(i)} y={H - 4} fontSize={10} fill="#64748b" textAnchor={i === 0 ? "start" : "end"}>
            {labels[i]}
          </text>
        ))}
      </svg>
      <div className="mt-1 flex gap-4 text-xs text-slate-500">
        {series.map((s) => (
          <span key={s.name} className="inline-flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4" style={{ background: s.color, borderTop: s.dashed ? `2px dashed ${s.color}` : undefined, height: s.dashed ? 0 : 2 }} />
            {s.name}
          </span>
        ))}
      </div>
    </div>
  )
}
