"use client"

import Link from "next/link"
import { ArrowRight, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { WidgetBody, WidgetFooter, WidgetHeader } from "@/components/layout/page-frame"
import { fmtValue } from "../../data"
import type { Bullet, ContentDelivered } from "../../delivered-content-data"
import { useMvp } from "../../mvp"

/** Name · bar · delivered of projected · the gap and why. One row per agent, on one scale. */
const BAR_GRID = "grid grid-cols-[20px_200px_minmax(0,1fr)_128px_260px] items-center gap-4"
/** Delivered only: no "vs projected" column, so the figure closes the row. */
const BAR_GRID_MVP = "grid grid-cols-[20px_200px_minmax(0,1fr)_128px] items-center gap-4"
/** A list where no row opens: no chevron column, so the name lines up with the section heading. */
const BAR_GRID_STATIC = "grid grid-cols-[200px_minmax(0,1fr)_128px_260px] items-center gap-4"
const BAR_GRID_STATIC_MVP = "grid grid-cols-[200px_minmax(0,1fr)_128px] items-center gap-4"

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
 * One agent as a bullet bar: delivered (green) against the projected
 * tick, the shortfall shaded red or the overshoot green, all on the section's scale.
 */
export function BarRow({ name, did, delivered, promised, scale, data, why: whyText, open, onToggle, compact, edge, nested, children }: { /** Only when no row in the list opens. */ compact?: boolean; /** A row inside an opened row: a step smaller, so it reads as part of its parent. */ nested?: boolean; /** The list runs to its Widget's edges, so rows take the Widget's px-10 inset. */ edge?: boolean; name: string; did: string; delivered: number; promised: number; scale: number; data?: { bullets?: Bullet[] }; why?: string; open?: boolean; onToggle?: () => void; children?: React.ReactNode }) {
  const pad = edge ? "px-10" : "px-6"
  const pct = (v: number) => `${(v / scale) * 100}%`
  // The MVP shows what was delivered, measured; nothing against a projection.
  const mvp = useMvp()
  const short = delivered < promised
  const delta = delivered - promised
  const why = whyText ?? (short ? topReason(data) : "Ahead of projection")
  const row = (
    <>
      {!compact && <span>{onToggle && <ChevronRight className={cn("size-4 text-slate-400 transition-transform", open && "rotate-90")} />}</span>}
      <div className="min-w-0">
        <div className={cn("text-slate-950", nested ? "text-sm font-medium" : "text-[15px] font-semibold")}>{name}</div>
        <div className="truncate text-[13px] text-slate-500">{did}</div>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-slate-100" aria-hidden>
        {mvp ? (
          <div className="absolute inset-y-0 left-0 rounded-full bg-success-500" style={{ width: pct(delivered) }} />
        ) : (
          <>
            <div className="absolute inset-y-0 left-0 rounded-l-full bg-success-500" style={{ width: pct(Math.min(delivered, promised)) }} />
            <div className={cn("absolute inset-y-0", short ? "bg-error-100" : "bg-success-200")} style={{ left: pct(Math.min(delivered, promised)), width: pct(Math.abs(delta)) }} />
            <div className="absolute -inset-y-1 w-0.5 bg-ink" style={{ left: pct(promised) }} />
          </>
        )}
      </div>
      <div className="text-right font-mono text-sm tabular-nums">
        <span className="font-semibold text-slate-950">{fmtValue(delivered)}</span>
        {!mvp && <span className="text-slate-500"> of {fmtValue(promised)}</span>}
      </div>
      {!mvp && (
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
      )}
    </>
  )
  return (
    <div className="border-t border-slate-100 first:border-t-0">
      {onToggle ? (
        <div role="button" tabIndex={0} onClick={onToggle} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onToggle()} className={cn(mvp ? BAR_GRID_MVP : BAR_GRID, "cursor-pointer py-4 hover:bg-slate-50", pad)}>
          {row}
        </div>
      ) : (
        <div className={cn(compact ? (mvp ? BAR_GRID_STATIC_MVP : BAR_GRID_STATIC) : mvp ? BAR_GRID_MVP : BAR_GRID, "py-4", pad)}>{row}</div>
      )}
      {/* The breakdown runs edge to edge on a tint; its rows keep the parent's grid so names and bars line up. */}
      {open && <div className="border-t border-slate-100 bg-slate-25 pb-5">{children}</div>}
    </div>
  )
}

/** The key, once: what the fill, the tick and the shading mean. */
export function BarKey() {
  // With no projection there's nothing to decode: the MVP's bars are delivered only.
  const mvp = useMvp()
  if (mvp) return null
  return (
    <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
      <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-success-500" /> Delivered</span>
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
export function QueueDelivered({ label, rows, footer, flat }: { /** Inside a Widget: no rule above, no second box around the rows. */ flat?: boolean; label: string; rows: { name: string; did: string; delivered: number; promised: number; data?: { bullets?: Bullet[] }; why?: string }[]; footer?: React.ReactNode }) {
  const promised = rows.reduce((s, r) => s + r.promised, 0)
  const delivered = rows.reduce((s, r) => s + r.delivered, 0)
  const delta = delivered - promised
  // The MVP shows what was delivered, measured: no projection to compare it against.
  const mvp = useMvp()
  const scale = Math.max(...rows.map((r) => Math.max(r.delivered, mvp ? 0 : r.promised))) * 1.15
  // Most delivered first, as on Claire's page.
  const sorted = [...rows].sort((a, b) => b.delivered - a.delivered)

  const totals = (
    <div className="mt-2 flex flex-wrap items-baseline gap-x-6 gap-y-1">
      {!mvp && (
        <span className="text-2xl font-semibold tracking-tight text-slate-500">
          Projected <span className="font-mono">{fmtValue(promised)}</span>
        </span>
      )}
      <span className="text-2xl font-semibold tracking-tight text-slate-950">
        Delivered <span className="text-success-700 tabular-nums">{fmtValue(delivered)}</span>
      </span>
      {!mvp && (
        <span className={cn("font-mono text-sm font-semibold tabular-nums", delta >= 0 ? "text-success-700" : "text-error-600")}>
          {delta >= 0 ? "+" : "−"}
          {fmtValue(Math.abs(delta))}
        </span>
      )}
    </div>
  )

  const rowsBlock = (
    <>
      {sorted.map((r) => (
        <BarRow key={r.name} {...r} scale={scale} compact={flat} edge={flat} />
      ))}
    </>
  )

  if (flat) {
    return (
      <>
        <WidgetHeader>
          <div className="text-xs font-medium tracking-wider text-slate-500 uppercase">{label}</div>
          {totals}
          <BarKey />
        </WidgetHeader>
        <WidgetBody pad={false} className="py-0">
          <div className="border-t border-slate-100">{rowsBlock}</div>
        </WidgetBody>
        {footer ? <WidgetFooter>{footer}</WidgetFooter> : null}
      </>
    )
  }

  return (
    <section className="border-t border-slate-200 px-10 pt-10 pb-10">
      <div className="text-xs font-medium tracking-wider text-slate-500 uppercase">{label}</div>
      {totals}
      <BarKey />
      <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">{rowsBlock}</div>
      {footer && <div className="mt-4">{footer}</div>}
    </section>
  )
}

const TONE_DOT: Record<string, string> = { orange: "bg-warning-500", red: "bg-error-500", green: "bg-success-500", learn: "bg-ally-500" }

/**
 * A lever opened on Claire's page: one bar per kind of work (what Mike or Michelle
 * sees on their page), then what worked and how it was measured.
 */
export function WorkTypeBars({ data, scale, resultsHref, edge }: { data: ContentDelivered; /** The section's scale, so a sub-row's bar is comparable to its parent's. */ scale: number; resultsHref?: string; edge?: boolean }) {
  // The rows already say what waited; only what worked and how it was measured is new here.
  const notes = (data.bullets ?? []).filter((b) => b.tone === "green" || b.tone === "learn")
  const rows = [...data.workTypes].sort((a, b) => b.delivered - a.delivered)
  return (
    <div className="flex flex-col gap-4">
      <div className="border-b border-slate-100">
        {rows.map((w) => (
          <BarRow key={w.id} name={w.name} did={w.did} delivered={w.delivered} promised={w.promised} scale={scale} data={w} edge={edge} nested />
        ))}
      </div>
      {/* Notes and the link start under the names: past the chevron column (20px + 16px gap). */}
      <div className={cn("flex flex-col gap-4", edge ? "pr-10 pl-19" : "pr-6 pl-15")}>
      {notes.length > 0 && (
        <ul className="flex flex-col gap-1.5 text-sm text-slate-700">
          {notes.map((b) => (
            <li key={b.text} className="flex gap-2.5">
              <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", TONE_DOT[b.tone] ?? "bg-slate-400")} />
              <span className="min-w-0">{b.text}</span>
            </li>
          ))}
        </ul>
      )}
      {resultsHref && (
        <Link href={resultsHref} className="inline-flex w-fit items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
          See SKU-level results and method <ArrowRight className="size-3.5" />
        </Link>
      )}
      </div>
    </div>
  )
}
