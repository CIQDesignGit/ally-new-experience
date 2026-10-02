"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export type Stage = "banked" | "autopilot" | "approval" | "input"

/**
 * The quarter as a small waterfall for a doer's page: what's banked, then what's
 * open by how much effort it needs, up to the quarter total. The same stages and
 * colors as Claire's waterfall, at a size that sits beside a headline. A bar
 * jumps to its group in the queue.
 */
export function MiniWaterfall({ values, highlight = "approval", onSelect, className }: { values: Partial<Record<Stage, number>>; highlight?: Stage; onSelect?: (s: Stage) => void; className?: string }) {
  // Only the stages given: a page that shows banked elsewhere leaves it out, so the total is what's open.
  const stages = ([

    { k: "banked", label: "Banked", color: "#cbd5e1" },
    { k: "autopilot", label: "Autopilot", color: "#93b4f5" },
    { k: "approval", label: "1 approval", color: "#875bf7" },
    { k: "input", label: "Your input", color: "#f5b85c" },
  ] as { k: Stage; label: string; color: string }[]).filter((s) => values[s.k] !== undefined)
  const total = stages.reduce((n, s) => n + (values[s.k] ?? 0), 0)
  const n = stages.length + 1
  const W = 340
  const H = 112
  const base = 88
  const top = 18
  const scale = (base - top) / (total || 1)
  const gap = 15
  const bw = (W - gap * (n - 1)) / n
  let run = 0
  // Same rounding as the headlines and progress bars beside it, so the totals always read the same.
  const fmt = (v: number) => (v >= 1 ? `$${+v.toFixed(2)}M` : `$${Math.round(v * 1000)}K`)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={cn("w-full", className)} role="img" aria-label={`This quarter: ${stages.map((s) => `${s.label} ${fmt(values[s.k] ?? 0)}`).join(", ")}, ${fmt(total)} in all`}>
      <line x1={0} x2={W} y1={base} y2={base} stroke="#e2e8f0" />
      {stages.map((s, i) => {
        const v = values[s.k] ?? 0
        const y0 = base - (run + v) * scale
        const h = Math.max(2, v * scale)
        const x = i * (bw + gap)
        run += v
        const on = s.k === highlight
        return (
          <g key={s.k} onClick={() => onSelect?.(s.k)} className={onSelect ? "cursor-pointer" : undefined}>
            <title>{`${{ banked: "Banked", autopilot: "On autopilot", approval: "One approval away", input: "Needs your input" }[s.k]}: ${s.k === "banked" ? "" : "+"}${fmt(v)}`}</title>
            <rect x={x} y={top - 14} width={bw} height={H - top} fill="transparent" />
            <motion.rect x={x} width={bw} rx={3} fill={s.color} initial={{ y: base, height: 0 }} animate={{ y: y0, height: h }} transition={{ delay: 0.1 + i * 0.08, duration: 0.45 }} />
            <text x={x + bw / 2} y={y0 - 6} textAnchor="middle" fontSize={13} fontWeight={on ? 700 : 600} fill={on ? "#5b21b6" : "#475569"} fontFamily="var(--font-mono)">{`${s.k === "banked" ? "" : "+"}${fmt(v)}`}</text>
            <text x={x + bw / 2} y={base + 19} textAnchor="middle" fontSize={12.5} fontWeight={on ? 700 : 500} fill={on ? "#5b21b6" : "#64748b"}>{s.label}</text>
          </g>
        )
      })}
      <g>
        <rect x={stages.length * (bw + gap)} y={base - total * scale} width={bw} height={total * scale} rx={3} fill="#e2e8f0" />
        <text x={stages.length * (bw + gap) + bw / 2} y={base - total * scale - 6} textAnchor="middle" fontSize={13} fontWeight={700} fill="#0f172a" fontFamily="var(--font-mono)">{fmt(total)}</text>
        <text x={stages.length * (bw + gap) + bw / 2} y={base + 19} textAnchor="middle" fontSize={12.5} fill="#64748b">{values.banked === undefined ? "Open" : "Quarter"}</text>
      </g>
    </svg>
  )
}
