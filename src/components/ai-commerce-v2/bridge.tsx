"use client"

import { cn } from "@/lib/utils"
import { META, bridge, sov, type Done, type InputId } from "./data"

const CHART_HEIGHT = 240
const LABEL_HEIGHT = 56
const PAD_TOP = 32

/** Every bar at full color: organic inputs in Ally violet, Promoted in the media color, the ends in gray and ink. */
const BAR: Record<string, string> = { today: "bg-slate-300", promoted: "bg-team", end: "bg-ink" }

export type BridgeSelection = InputId | "all"

/**
 * The bridge to the leader: your share of AI answers today, the points each input adds
 * if its open fixes ship, where that lands, against the leader's line. Click an input to
 * filter the questions below to it.
 */
export function Bridge({ done, selected, onSelect }: { done: Done; selected: BridgeSelection; onSelect: (s: BridgeSelection) => void }) {
  const b = bridge(done)
  const leader = sov(done, META.leader)
  const min = Math.max(0, Math.floor((Math.min(b.today, leader) - 15) / 10) * 10)
  const max = Math.max(b.end, leader) + 6
  const frac = (v: number) => (v - min) / (max - min)
  const leaderTop = PAD_TOP + (1 - frac(leader)) * CHART_HEIGHT

  let acc = b.today
  const cols = [
    { key: "today", label: "Today", sub: "", value: `${b.today}%`, start: min, end: b.today, selectable: false },
    ...b.steps.map((s) => {
      const col = { key: s.input.id, label: s.input.name, sub: s.actions ? `${s.actions} ${s.actions === 1 ? "action" : "actions"}` : "Nothing open", value: s.points ? `+${s.points} pts` : "", start: acc, end: acc + s.points, selectable: s.actions > 0 }
      acc += s.points
      return col
    }),
    { key: "all", label: "If every action ships", sub: "", value: `${acc}%`, start: min, end: acc, selectable: true },
  ]
  const gap = leader - b.today

  return (
    <div>
      <div className="relative flex items-end gap-3">
        <div className="pointer-events-none absolute inset-x-0 z-10 border-t-2 border-dashed border-slate-900/60" style={{ top: leaderTop }}>
          <span className="absolute -top-6 right-0 rounded bg-white px-1.5 font-mono text-xs font-semibold text-slate-950">
            {META.leader} {leader}%
          </span>
        </div>
        {cols.map((col, i) => {
          const topPct = (1 - frac(col.end)) * 100
          const heightPct = (frac(col.end) - frac(col.start)) * 100
          const next = cols[i + 1]
          const isSel = col.selectable && col.key === selected
          return (
            <button
              key={col.key}
              type="button"
              disabled={!col.selectable}
              onClick={() => col.selectable && onSelect(col.key as BridgeSelection)}
              className={cn("group relative flex flex-1 flex-col items-center rounded-xl px-1 pb-2 transition-colors", col.selectable ? "cursor-pointer" : "cursor-default", isSel ? "bg-brand-50 ring-1 ring-brand-200" : col.selectable && "hover:bg-slate-50")}
              style={{ paddingTop: PAD_TOP }}
            >
              <div className="relative w-full" style={{ height: CHART_HEIGHT }}>
                {next && next.key !== "all" && <div className="absolute right-0 left-1/2 border-t border-dashed border-slate-300" style={{ top: `${topPct}%` }} />}
                {col.key === "today" && gap > 0 && (
                  <div className="pointer-events-none absolute -right-2 z-20 w-2 border-y-2 border-r-2" style={{ borderColor: "var(--color-error-600)", top: `${(1 - frac(leader)) * 100}%`, height: `${(frac(leader) - frac(b.today)) * 100}%` }}>
                    <span className="absolute top-1/2 right-3 -translate-y-1/2 rounded bg-white px-1 font-mono text-xs font-semibold whitespace-nowrap text-error-600">{gap} pts gap</span>
                  </div>
                )}
                {col.end > col.start && (
                  <div className="absolute inset-x-3 rounded-t-md" style={{ top: `${topPct}%`, height: `${heightPct}%`, minHeight: 6 }}>
                    <div className={cn("size-full rounded-t-md", BAR[col.key] ?? "bg-ally-500")} />
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 font-mono text-sm font-bold whitespace-nowrap text-slate-950 tabular-nums">{col.value}</div>
                  </div>
                )}
              </div>
              <div className="mt-3 flex flex-col items-center gap-0.5 px-1 text-center" style={{ height: LABEL_HEIGHT }}>
                <span className={cn("text-[13px] leading-tight", isSel ? "font-semibold text-brand-700" : col.selectable ? "font-medium text-slate-950" : "text-slate-700")}>{col.label}</span>
                {col.sub && <span className="text-[11px] text-slate-400">{col.sub}</span>}
                {col.key === "all" && <span className={cn("text-[11px] font-medium", acc >= leader ? "text-success-700" : "text-error-600")}>{acc >= leader ? `${acc - leader} pts past ${META.leader}` : `${leader - acc} pts short`}</span>}
              </div>
            </button>
          )
        })}
      </div>
      <div className="mt-1 text-[11px] text-slate-400">Axis starts at {min}%. AI visibility: each product weighted by 1 ÷ its position, your share of the total, across every surface.</div>
    </div>
  )
}
