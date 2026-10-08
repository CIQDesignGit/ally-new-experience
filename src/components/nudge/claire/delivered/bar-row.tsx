"use client"

import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { fmtValue } from "../../data"
import type { Bullet } from "../../delivered-content-data"

/** Name · bar · delivered of projected · the gap and why. One row per agent, on one scale. */
const BAR_GRID = "grid grid-cols-[20px_200px_minmax(0,1fr)_128px_260px] items-center gap-4"

/** The shortfall's top reason, in a few words: the first "waiting" or "lost" bullet, without its dollar prefix. */
function topReason(data?: { bullets?: Bullet[] }) {
  const b = data?.bullets?.find((x) => x.tone === "orange" || x.tone === "red")
  if (!b) return undefined
  // The sentence that says why, not the one that restates what went live.
  const sentences = b.text.replace(/^−\$[\d.]+[KM] vs projected: /, "").replace(/ \(−\$[\d.]+[KM]\)/g, "").split(/\. (?=[A-Z0-9])/)
  const t = sentences[sentences.length - 1].replace(/\.$/, "")
  return t.charAt(0).toUpperCase() + t.slice(1)
}

/**
 * One agent as a bullet bar: delivered (magenta, Ally's work) against the projected
 * tick, the shortfall shaded red or the overshoot green, all on the section's scale.
 */
export function BarRow({ name, did, delivered, promised, scale, data, why: whyText, open, onToggle, children }: { name: string; did: string; delivered: number; promised: number; scale: number; data?: { bullets?: Bullet[] }; why?: string; open?: boolean; onToggle?: () => void; children?: React.ReactNode }) {
  const pct = (v: number) => `${(v / scale) * 100}%`
  const short = delivered < promised
  const delta = delivered - promised
  const why = whyText ?? (short ? topReason(data) : "Ahead of projection")
  const row = (
    <>
      <span>{onToggle && <ChevronRight className={cn("size-4 text-slate-400 transition-transform", open && "rotate-90")} />}</span>
      <div className="min-w-0">
        <div className="text-[15px] font-semibold text-slate-950">{name}</div>
        <div className="truncate text-[13px] text-slate-500">{did}</div>
      </div>
      <div className="relative h-3 rounded-sm bg-slate-100" aria-hidden>
        <div className="absolute inset-y-0 left-0 rounded-l-sm bg-ally-500" style={{ width: pct(Math.min(delivered, promised)) }} />
        <div className={cn("absolute inset-y-0", short ? "bg-error-100" : "bg-success-200")} style={{ left: pct(Math.min(delivered, promised)), width: pct(Math.abs(delta)) }} />
        <div className="absolute -inset-y-1 w-0.5 bg-ink" style={{ left: pct(promised) }} />
      </div>
      <div className="text-right font-mono text-sm tabular-nums">
        <span className="font-semibold text-slate-950">{fmtValue(delivered)}</span> <span className="text-slate-500">of {fmtValue(promised)}</span>
      </div>
      <div className="line-clamp-2 min-w-0 text-[13px] leading-snug">
        {delta === 0 ? (
          <span className="text-slate-600">On projection</span>
        ) : (
          <>
            <span className={cn("font-mono font-semibold tabular-nums", short ? "text-error-600" : "text-success-700")}>
              {short ? "−" : "+"}
              {fmtValue(Math.abs(delta))}
            </span>
            {why && <span className="text-slate-600"> · {why}</span>}
          </>
        )}
      </div>
    </>
  )
  return (
    <div className="border-t border-slate-100 first:border-t-0">
      {onToggle ? (
        <div role="button" tabIndex={0} onClick={onToggle} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onToggle()} className={cn(BAR_GRID, "cursor-pointer px-6 py-4 hover:bg-slate-50")}>
          {row}
        </div>
      ) : (
        <div className={cn(BAR_GRID, "px-6 py-4")}>{row}</div>
      )}
      {open && <div className="border-t border-slate-100 bg-slate-25 px-6 py-5">{children}</div>}
    </div>
  )
}

/** The key, once: what the fill, the tick and the shading mean. */
export function BarKey() {
  return (
    <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
      <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-ally-500" /> Delivered</span>
      <span className="flex items-center gap-1.5"><span className="h-3 w-0.5 bg-ink" /> Projected</span>
      <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-error-100" /> Short</span>
      <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-success-200" /> Ahead</span>
    </div>
  )
}

/**
 * A queue's "so far" section, drawn like Claire's: Projected · Delivered · the gap,
 * then one bar per kind of work on one scale. Claire's row for this agent, opened up.
 */
export function QueueDelivered({ label, rows, footer }: { label: string; rows: { name: string; did: string; delivered: number; promised: number; data?: { bullets?: Bullet[] }; why?: string }[]; footer?: React.ReactNode }) {
  const promised = rows.reduce((s, r) => s + r.promised, 0)
  const delivered = rows.reduce((s, r) => s + r.delivered, 0)
  const delta = delivered - promised
  const scale = Math.max(...rows.map((r) => Math.max(r.delivered, r.promised))) * 1.15
  // Most delivered first, as on Claire's page.
  const sorted = [...rows].sort((a, b) => b.delivered - a.delivered)
  return (
    <section className="border-t border-slate-300 px-10 pt-9 pb-10">
      <div className="font-mono text-xs tracking-wide text-slate-500 uppercase">{label}</div>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-6 gap-y-1">
        <span className="text-2xl font-semibold tracking-tight text-slate-500">
          Projected <span className="font-mono">{fmtValue(promised)}</span>
        </span>
        <span className="text-2xl font-semibold tracking-tight text-slate-950">
          Delivered <span className="font-mono text-ally-600">{fmtValue(delivered)}</span>
        </span>
        <span className={cn("font-mono text-sm font-semibold tabular-nums", delta >= 0 ? "text-success-700" : "text-error-600")}>
          {delta >= 0 ? "+" : "−"}
          {fmtValue(Math.abs(delta))}
        </span>
      </div>
      <BarKey />
      <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
        {sorted.map((r) => (
          <BarRow key={r.name} {...r} scale={scale} />
        ))}
      </div>
      {footer && <div className="mt-4">{footer}</div>}
    </section>
  )
}
