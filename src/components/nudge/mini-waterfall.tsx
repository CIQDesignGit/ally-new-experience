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
export function MiniWaterfall({ values, highlight = "approval", onSelect, className }: { values: Record<Stage, number>; highlight?: Stage; onSelect?: (s: Stage) => void; className?: string }) {
  const stages: { k: Stage; label: string; color: string }[] = [
    { k: "banked", label: "Banked", color: "#cbd5e1" },
    { k: "autopilot", label: "Autopilot", color: "#93b4f5" },
    { k: "approval", label: "1 approval", color: "#875bf7" },
    { k: "input", label: "Your input", color: "#f5b85c" },
  ]
  const total = stages.reduce((n, s) => n + values[s.k], 0)
  const W = 308
  const H = 132
  const base = 104
  const top = 20
  const scale = (base - top) / (total || 1)
  const bw = 52
  const gap = 12
  let run = 0
  const fmt = (v: number) => (v >= 1 ? `$${(Math.round(v * 100) / 100).toString()}M` : `$${Math.round(v * 1000)}K`)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={cn("w-full", className)} role="img" aria-label={`This quarter: ${stages.map((s) => `${s.label} ${fmt(values[s.k])}`).join(", ")}, ${fmt(total)} in all`}>
      <line x1={0} x2={W} y1={base} y2={base} stroke="#e2e8f0" />
      {stages.map((s, i) => {
        const v = values[s.k]
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
            <text x={x + bw / 2} y={y0 - 5} textAnchor="middle" fontSize={11} fontWeight={on ? 700 : 600} fill={on ? "#5b21b6" : "#475569"} fontFamily="var(--font-mono)">{`${s.k === "banked" ? "" : "+"}${fmt(v)}`}</text>
            <text x={x + bw / 2} y={base + 15} textAnchor="middle" fontSize={10.5} fontWeight={on ? 700 : 500} fill={on ? "#5b21b6" : "#64748b"}>{s.label}</text>
          </g>
        )
      })}
      <g>
        <rect x={4 * (bw + gap)} y={base - total * scale} width={bw} height={total * scale} rx={3} fill="#e2e8f0" />
        <text x={4 * (bw + gap) + bw / 2} y={base - total * scale - 5} textAnchor="middle" fontSize={11} fontWeight={700} fill="#0f172a" fontFamily="var(--font-mono)">{fmt(total)}</text>
        <text x={4 * (bw + gap) + bw / 2} y={base + 15} textAnchor="middle" fontSize={10.5} fill="#64748b">Quarter</text>
      </g>
    </svg>
  )
}
