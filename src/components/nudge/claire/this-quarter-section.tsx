"use client"

import Link from "next/link"
import { useState } from "react"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { TEAM_TIER, fmtValue } from "../data"
import type { ContentDelivered } from "../delivered-content-data"
import { DELIVERED, leverDelivered } from "../delivered-periods"
import { useNudge } from "../nudge-context"
import { AGENT_LABEL } from "../types"
import type { AgentId, TierRow } from "../types"
import { ContentWaterfall } from "./content-waterfall"
import { BRAND_TOTAL, GROWTH } from "../cs/context-data"

/** How each lever with a breakdown by type of work draws it. Media has none yet, so it stays a summary row. */
const DRILLDOWN: Partial<Record<AgentId, { order?: string[]; barClass?: string; teamRow?: TierRow; resultsHref?: string }>> = {
  content: { resultsHref: "/content-results?period=qtd" },
  ops: {
    order: ["buy-box", "promo-badge", "shipping-speed"],
    barClass: "bg-info-500",
    teamRow: TEAM_TIER.rows.find((r) => r.agent === "ops"),
  },
}
const LEVERS: AgentId[] = ["content", "media", "ops"]

/** Name · bar · delivered of projected · the gap and why. One row per agent, on one scale. */
const BAR_GRID = "grid grid-cols-[20px_200px_minmax(0,1fr)_128px_260px] items-center gap-4"

/** The shortfall's top reason, in a few words: the first "waiting" or "lost" bullet, without its dollar prefix. */
function topReason(data?: ContentDelivered) {
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
function BarRow({ name, did, delivered, promised, scale, data, open, onToggle, children }: { name: string; did: string; delivered: number; promised: number; scale: number; data?: ContentDelivered; open?: boolean; onToggle?: () => void; children?: React.ReactNode }) {
  const pct = (v: number) => `${(v / scale) * 100}%`
  const short = delivered < promised
  const delta = delivered - promised
  const why = short ? topReason(data) : "Ahead of projection"
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
        <span className={cn("font-mono font-semibold tabular-nums", short ? "text-error-600" : "text-success-700")}>
          {short ? "−" : "+"}
          {fmtValue(Math.abs(delta))}
        </span>
        {why && <span className="text-slate-600"> · {why}</span>}
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

/**
 * The proof, kept below the actions (waterfall version): this quarter so far,
 * Projected · Delivered · vs projected. Content and ops open to a small waterfall by
 * type; each bar shows its 2–3 bullets. Deeper detail is the results link.
 */
export function ThisQuarterSection() {
  const [open, setOpen] = useState<AgentId | null>(null)
  const toggle = (id: AgentId) => setOpen((o) => (o === id ? null : id))
  const { period, retailer } = useNudge()
  const d = DELIVERED[period]
  // Most delivered first: the list ranks by dollars, never a fixed lever order.
  const ORDER = [...LEVERS].sort((a, b) => leverDelivered(d, b).delivered - leverDelivered(d, a).delivered)
  const projected = ORDER.reduce((s, a) => s + leverDelivered(d, a).promised, 0)
  const delivered = ORDER.reduce((s, a) => s + leverDelivered(d, a).delivered, 0)
  const delta = delivered - projected
  // One scale for every row, so a longer bar is more money.
  const scale = Math.max(...ORDER.map((a) => Math.max(leverDelivered(d, a).delivered, leverDelivered(d, a).promised))) * 1.15

  return (
    <section className="px-12 pt-10 pb-4">
      <div className="font-mono text-xs tracking-wide text-slate-500 uppercase">{d.label}</div>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-6 gap-y-1">
        <span className="text-2xl font-semibold tracking-tight text-slate-500">
          Projected <span className="font-mono">{fmtValue(projected)}</span>
        </span>
        <span className="text-2xl font-semibold tracking-tight text-slate-950">
          Delivered <span className="font-mono text-ally-600">{fmtValue(delivered)}</span>
        </span>
        <span className={cn("font-mono text-sm font-semibold tabular-nums", delta >= 0 ? "text-success-700" : "text-error-600")}>
          {delta >= 0 ? "+" : "−"}
          {fmtValue(Math.abs(delta))}
        </span>
      </div>

      {/* Why the delivered number keeps rising: what Ally has learned about the brand. */}
      <div className="mt-2 text-sm text-slate-500">
        Ally knows <span className="font-mono font-semibold text-slate-950">{BRAND_TOTAL}</span> things about Aurelle · <span className="font-mono font-semibold text-slate-950">{GROWTH[GROWTH.length - 1].firstPass}%</span> of drafts approved first time, was{" "}
        <span className="font-mono">{GROWTH[0].firstPass}%</span> ·{" "}
        <Link href="/context?from=claire" className="font-medium text-brand-700 hover:underline">
          See what Ally knows
        </Link>
      </div>
      {/* The key, once: what the fill, the tick and the shading mean. */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-ally-500" /> Delivered</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-0.5 bg-ink" /> Projected</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-error-100" /> Short</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-success-200" /> Ahead</span>
      </div>
      <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
        {ORDER.map((agent) => {
          const style = DRILLDOWN[agent]
          const l = leverDelivered(d, agent)
          // Any lever with a breakdown opens to its waterfall; media is a row on its own.
          // The drill-down by type of work is Amazon's detail.
          if (style && agent !== "media" && retailer === "amazon") {
            const data = d[agent]
            return (
              <BarRow key={agent} name={AGENT_LABEL[agent]} did={data.did} delivered={data.delivered} promised={data.promised} scale={scale} data={data} open={open === agent} onToggle={() => toggle(agent)}>
                <ContentWaterfall data={data} order={style.order} totalLabel={AGENT_LABEL[agent]} barClass={style.barClass} teamRow={style.teamRow} resultsHref={style.resultsHref} />
              </BarRow>
            )
          }
          return <BarRow key={agent} name={AGENT_LABEL[agent]} did={l.reason} delivered={l.delivered} promised={l.promised} scale={scale} />
        })}
      </div>
    </section>
  )
}
