"use client"

import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { AS_OF, contentBatches, launchedIds, skuById } from "../data"
import { daysUntil } from "../model"
import { useNudge } from "../nudge-context"
import { InboxFilters } from "../ops/ops-batch-list"
import type { InboxFilter } from "../ops/ops-batch-list"
import { useBackgrounds } from "./background-composer"
import { GROUPS } from "./rail"
import { fillSkus } from "../sku-fill"
import { SkuFillList } from "../sku-fill-list"
import { candleThumbnail } from "@/lib/candle-thumbnails"
import type { Batch } from "../types"

interface BatchListProps {
  selectedId: Batch["id"]
  selectedSkuId: string | null
  expandedBatchId: Batch["id"] | null
  filter: InboxFilter
  onFilter: (f: InboxFilter) => void
  onToggleExpand: (id: Batch["id"]) => void
  onSelectBatch: (id: Batch["id"]) => void
  onSelectSku: (batchId: Batch["id"], skuId: string) => void
}

/** "$500K" → 0.5, "$1.2M" → 1.2 ($M). */
const money = (s: string) => parseFloat(s.replace(/[$KM,]/g, "")) / (s.endsWith("K") ? 1000 : 1)
const fmt = (v: number) => (v >= 1 ? `$${v.toFixed(2)}M` : `$${Math.round(v * 1000)}K`)
const DOT = Object.fromEntries(GROUPS.map((g) => [g.tier, g.dot])) as Record<Batch["tier"], string>

/** The inbox's order, shared with the page so a filter can open its top row: open work by deadline then value, done after, autopilot last. */
export function mikeRows(all: Batch[], approved: Record<string, boolean>, filter: InboxFilter) {
  const rank = (b: Batch) => (b.tier === "autopilot" ? 2 : approved[b.id] ? 1 : 0)
  return all
    .filter((b) => filter === "all" || b.tier === filter)
    .sort((x, y) => rank(x) - rank(y) || (x.deadline ?? "9999").localeCompare(y.deadline ?? "9999") || money(y.value) - money(x.value))
}

/**
 * Mike's inbox as a ledger, the same as Michelle's: one row per item, effort as
 * the dot, value and status in the right column, the filters shared with the
 * waterfall above. The open item lists its SKUs under it.
 */
export function BatchList({ selectedId, selectedSkuId, expandedBatchId, filter, onFilter, onToggleExpand, onSelectBatch, onSelectSku }: BatchListProps) {
  const { approved, policy, launchReady, asks, autoShipped, day } = useNudge()
  // This week's due date on Mike's Halloween work: Ally's Monday assignment, or Claire's ask.
  const ask = asks["approval-content"]
  const allyShipped = autoShipped["approval-content"] ?? []
  const bgs = useBackgrounds()
  const all = contentBatches(policy, launchedIds(approved), launchReady)
  const rows = mikeRows(all, approved, filter)

  return (
    <div className="border-r border-slate-200 bg-white">
      <InboxFilters filter={filter} onFilter={onFilter} />
      <div className="flex flex-col">
        {rows.map((b) => {
          const active = selectedId === b.id
          const done = !!approved[b.id]
          const count = b.inputSkus ?? b.skus
          const value = done ? fmt(b.approveValue) : b.value
          // Under the value, the one thing that matters most: what happened, else its deadline in its own words ("Expires in 18 days", "Due Nov 6").
          const status =
            b.tier === "autopilot" ? (
              <span className="text-slate-500">Running</span>
            ) : done ? (
              <span className="inline-flex items-center gap-1 text-success-700">
                <Check className="size-3" />
                {b.tier === "input" ? "Sent to Ally" : allyShipped.includes(b.id) ? "Shipped by Ally" : "Published"}
              </span>
            ) : allyShipped.length && b.tier === "approval" && b.deadline ? (
              // What Ally held back at Claire's deadline: the hero SKUs.
              <span className="text-warning-700">Held for your review</span>
            ) : ask && b.tier === "approval" && b.deadline ? (
              // The due date, on the work it's about.
              <span className={day >= ask.dueDay || ask.by === "ally" ? "text-warning-700" : "text-brand-700"}>
                {(() => {
                  const when = day > ask.dueDay ? `overdue since ${ask.due.split(",")[0]}` : day === ask.dueDay ? "due today" : `due ${ask.due.split(",")[0]}`
                  return ask.by === "ally" ? when.charAt(0).toUpperCase() + when.slice(1) : `Claire asked · ${when}`
                })()}
              </span>
            ) : b.deadline ? (
              <span className="text-warning-700">{!b.chip || b.chip.startsWith("Expires") ? `Expires in ${daysUntil(b.deadline, AS_OF) - day} days` : b.chip}</span>
            ) : null
          return (
            <div key={b.id} data-batch={b.id} className={cn("border-b border-slate-100", active && !selectedSkuId && "bg-slate-50 shadow-[inset_2px_0_0_var(--color-brand-500)]")}>
              {/* A row, not a button: the SKU count inside it is its own button. */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => onSelectBatch(b.id)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onSelectBatch(b.id))}
                className="grid w-full cursor-pointer grid-cols-[8px_minmax(0,1fr)_auto] items-baseline gap-x-2.5 py-2.5 pr-4 pl-10 text-left outline-none hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-inset"
              >
                <span className={cn("size-2 -translate-y-px rounded-full", DOT[b.tier])} aria-label={GROUPS.find((g) => g.tier === b.tier)?.label} />
                <span className="min-w-0">
                  <span className={cn("block text-[14px] leading-snug", b.tier === "autopilot" ? "text-slate-500" : "font-medium text-slate-950")}>{b.name}</span>
                  {/* Count first, so it lines up down the list; then the kind of work. */}
                  <span className="mt-0.5 flex items-center gap-1.5 text-xs whitespace-nowrap text-slate-500">
                    {b.skuRows.length > 0 ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onToggleExpand(b.id)
                        }}
                        aria-expanded={expandedBatchId === b.id}
                        className="inline-flex shrink-0 items-center gap-0.5 rounded outline-none hover:text-brand-700 focus-visible:ring-2 focus-visible:ring-brand-300"
                      >
                        {count} SKUs
                        <ChevronDown className={cn("size-3.5 transition-transform", expandedBatchId === b.id && "rotate-180")} />
                      </button>
                    ) : (
                      <span>{count} SKUs</span>
                    )}
                    <span className="text-slate-300">·</span>
                    <span className="min-w-0 truncate">
                      {b.type}
                      {b.partLabel && ` · ${b.partLabel}`}
                    </span>
                  </span>
                </span>
                {/* The money column: value, and under it the status or deadline. */}
                <span className="text-right">
                  <span className={cn("block font-mono text-[14px] font-semibold tabular-nums", done ? "text-success-700" : b.tier === "autopilot" ? "text-slate-500" : "text-slate-950")}>{value}</span>
                  {status && <span className="mt-0.5 block text-xs font-medium whitespace-nowrap tabular-nums">{status}</span>}
                </span>
              </div>
              {expandedBatchId === b.id && b.skuRows.length > 0 && (
                <SkuFillList
                  rows={fillSkus(b.id, b.skuRows.map((r) => ({ id: r.skuId, name: skuById(r.skuId).title })), count)}
                  selectedId={selectedSkuId}
                  onSelect={(id) => onSelectSku(b.id, id)}
                  checked={(id) => !!bgs.applied[id] && b.tier === "input"}
                  thumb={(id) => (b.skuRows.some((r) => r.skuId === id) ? (skuById(id).thumbnailUrl ?? candleThumbnail(id)) : candleThumbnail(id))}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
