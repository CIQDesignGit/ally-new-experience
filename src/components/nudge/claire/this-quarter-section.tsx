"use client"

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
import { DELIVERED_GRID, DeliveredHeader, RowLabel, ValueCells } from "./delivered/columns"
import { DeliveredSummaryRow } from "./delivered/delivered-summary-row"

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

/** A delivered row that opens to its agent's waterfall. Content and ops work the same way. */
function ExpandableRow({ name, data, open, onToggle, children }: { name: string; data: ContentDelivered; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="border-t border-slate-200">
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onToggle()}
        className={cn(DELIVERED_GRID, "cursor-pointer px-6 py-3.5 hover:bg-slate-50")}
      >
        {/* Disclosure at the leading edge, same as the area table above. */}
        <div className="flex min-w-0 items-center gap-1">
          <ChevronRight className={cn("size-4 shrink-0 text-slate-400 transition-transform", open && "rotate-90")} />
          <RowLabel name={name} note={data.did} top />
        </div>
        <ValueCells delivered={data.delivered} promised={data.promised} strong projectedFirst />
        <span />
      </div>
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
  const { period } = useNudge()
  const d = DELIVERED[period]
  // Most delivered first: the list ranks by dollars, never a fixed lever order.
  const ORDER = [...LEVERS].sort((a, b) => leverDelivered(d, b).delivered - leverDelivered(d, a).delivered)
  const projected = ORDER.reduce((s, a) => s + leverDelivered(d, a).promised, 0)
  const delivered = ORDER.reduce((s, a) => s + leverDelivered(d, a).delivered, 0)
  const delta = delivered - projected

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

      <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <DeliveredHeader projectedFirst />
        {ORDER.map((agent) => {
          const style = DRILLDOWN[agent]
          // Any lever with a breakdown opens to its waterfall; the rest are a summary row.
          if (style && agent !== "media") {
            const data = d[agent]
            return (
              <ExpandableRow key={agent} name={AGENT_LABEL[agent]} data={data} open={open === agent} onToggle={() => toggle(agent)}>
                <ContentWaterfall data={data} order={style.order} totalLabel={AGENT_LABEL[agent]} barClass={style.barClass} teamRow={style.teamRow} resultsHref={style.resultsHref} />
              </ExpandableRow>
            )
          }
          return <DeliveredSummaryRow key={agent} bucket={{ agent, ...leverDelivered(d, agent) }} projectedFirst indent />
        })}
      </div>
    </section>
  )
}
