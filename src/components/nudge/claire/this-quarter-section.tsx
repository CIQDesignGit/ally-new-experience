"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { TEAM_TIER, fmtValue } from "../data"
import { DELIVERED, leverDelivered } from "../delivered-periods"
import { useNudge } from "../nudge-context"
import { useMvp } from "../mvp"
import { AGENT_LABEL } from "../types"
import type { AgentId, TierRow } from "../types"
import { BarKey, BarRow, WorkTypeBars } from "./delivered/bar-row"
import { LearningLine } from "./learning-line"

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

/**
 * The proof, kept below the actions (waterfall version): this quarter so far,
 * Projected · Delivered · vs projected. Content and ops open to a small waterfall by
 * type; each bar shows its 2–3 bullets. Deeper detail is the results link.
 */
export function ThisQuarterSection() {
  const [open, setOpen] = useState<AgentId | null>(null)
  const toggle = (id: AgentId) => setOpen((o) => (o === id ? null : id))
  const { period, retailer } = useNudge()
  const mvp = useMvp()
  const d = DELIVERED[period]
  // Most delivered first: the list ranks by dollars, never a fixed lever order.
  const ORDER = [...LEVERS].sort((a, b) => leverDelivered(d, b).delivered - leverDelivered(d, a).delivered)
  const projected = ORDER.reduce((s, a) => s + leverDelivered(d, a).promised, 0)
  const delivered = ORDER.reduce((s, a) => s + leverDelivered(d, a).delivered, 0)
  const delta = delivered - projected
  // One scale for every row, so a longer bar is more money.
  const scale = Math.max(...ORDER.map((a) => Math.max(leverDelivered(d, a).delivered, mvp ? 0 : leverDelivered(d, a).promised))) * 1.15

  return (
    <section className="px-10 pt-8 pb-6">
      <div className="font-mono text-xs tracking-wide text-slate-500 uppercase">{d.label}</div>
      {mvp ? (
        <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span className="text-2xl font-semibold tracking-tight text-slate-950">
            Delivered <span className="font-mono text-success-700">{fmtValue(delivered)}</span>
          </span>
          <span className="text-sm text-slate-500">Measured on the SKUs Ally changed, against their 4 weeks before</span>
        </div>
      ) : (
      <div className="mt-2 flex flex-wrap items-baseline gap-x-6 gap-y-1">
        <span className="text-2xl font-semibold tracking-tight text-slate-500">
          Projected <span className="font-mono">{fmtValue(projected)}</span>
        </span>
        <span className="text-2xl font-semibold tracking-tight text-slate-950">
          Delivered <span className="font-mono text-success-700">{fmtValue(delivered)}</span>
        </span>
        <span className={cn("font-mono text-sm font-semibold tabular-nums", delta >= 0 ? "text-success-700" : "text-error-600")}>
          {delta >= 0 ? "+" : "−"}
          {fmtValue(Math.abs(delta))}
        </span>
      </div>
      )}

      {/* Why the delivered number keeps rising: Ally learns from the team every day. */}
      <LearningLine href="/settings?tab=context&from=claire" />
      <BarKey />
      <div className="-mx-6 mt-5 border-t border-slate-100">
        {ORDER.map((agent) => {
          const style = DRILLDOWN[agent]
          const l = leverDelivered(d, agent)
          // Any lever with a breakdown opens to its waterfall; media is a row on its own.
          // The drill-down by type of work is Amazon's detail.
          if (style && agent !== "media" && retailer === "amazon") {
            const data = d[agent]
            return (
              <BarRow key={agent} name={AGENT_LABEL[agent]} did={data.did} delivered={data.delivered} promised={data.promised} scale={scale} data={data} open={open === agent} onToggle={() => toggle(agent)}>
                <WorkTypeBars data={data} scale={scale} resultsHref={style.resultsHref} />
              </BarRow>
            )
          }
          return <BarRow key={agent} name={AGENT_LABEL[agent]} did={l.reason} delivered={l.delivered} promised={l.promised} scale={scale} />
        })}
      </div>
    </section>
  )
}
