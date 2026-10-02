"use client"

import { Check, ChevronDown } from "lucide-react"
import { useBackgrounds } from "./background-composer"
import { cn } from "@/lib/utils"
import { skuById } from "../data"
import { useNudge } from "../nudge-context"
import type { Batch } from "../types"
import { ITEM_ACTIVE, ITEM_IDLE, MetaLine } from "./rail"


interface BatchListItemProps {
  batch: Batch
  active: boolean
  selectedSkuId: string | null
  expanded: boolean
  onToggleExpand: () => void
  onSelectBatch: () => void
  onSelectSku: (skuId: string) => void
}

/** One batch row: select it, or expand "See all N SKUs" to drill into a real SKU. */
export function BatchListItem({ batch, active, selectedSkuId, expanded, onToggleExpand, onSelectBatch, onSelectSku }: BatchListItemProps) {
  const { approved } = useNudge()
  const bgs = useBackgrounds()
  const done = !!approved[batch.id]

  const skuCount = batch.inputSkus ?? batch.skus
  const value = done ? (batch.approveValue >= 1 ? `$${batch.approveValue.toFixed(2)}M` : `$${Math.round(batch.approveValue * 1000)}K`) : batch.value

  return (
    <div data-batch={batch.id} className={cn("rounded-lg transition-colors", active ? ITEM_ACTIVE : ITEM_IDLE)}>
      <button type="button" onClick={onSelectBatch} className="block w-full rounded-lg px-3.5 pt-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-brand-300">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[15px] font-semibold text-slate-950">
            {batch.type}
            {batch.partLabel && ` · ${batch.partLabel}`}
          </span>
          {/* Signed: it's the extra sales Ally projects, not the SKUs' revenue. Green only once approved. */}
          <span className={cn("font-mono text-[15px] font-semibold tabular-nums", done ? "text-success-700" : "text-slate-950")}>+{value}</span>
        </div>
        <div className="mt-0.5 text-[13px] text-slate-500">{batch.name}</div>
      </button>
      <div className="px-3.5 pb-3">
        <MetaLine
          parts={[
            // No SKU list to open (e.g. a part scheduled on autopilot): the count as plain text.
            batch.skuRows.length === 0 && `${skuCount} SKUs`,
            batch.skuRows.length > 0 && (
              <button
                type="button"
                onClick={onToggleExpand}
                aria-expanded={expanded}
                className="inline-flex items-center gap-0.5 font-medium text-slate-700 hover:text-brand-700"
              >
                {skuCount} SKUs
                <ChevronDown className={cn("size-3.5 transition-transform", expanded && "rotate-180")} />
              </button>
            ),
            done && <span className="font-medium text-success-700">{batch.tier === "input" ? "Sent to Ally" : "Published"}</span>,
            !done && batch.tier === "autopilot" && <span className="font-medium text-info-700">{batch.chip}</span>,
            // Each batch says its own deadline: in real data one may expire and the next may not.
            !done && batch.deadline && <span className="font-medium text-warning-700">{batch.chip}</span>,
          ]}
        />
      </div>
      {expanded && (
        <div className="flex flex-col gap-0.5 px-2 pb-2">
          {batch.skuRows.map((row) => {
            const sku = skuById(row.skuId)
            const skuActive = selectedSkuId === row.skuId
            return (
              <button
                key={row.skuId}
                type="button"
                onClick={() => onSelectSku(row.skuId)}
                className={cn("flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors", skuActive ? "bg-white ring-1 ring-slate-200" : "hover:bg-white")}
              >
                <img src={sku.thumbnailUrl} alt={sku.title} className="size-8 shrink-0 rounded-md object-cover ring-1 ring-slate-200" />
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-[11px] text-slate-500">{sku.asin}</div>
                  <div className="mt-0.5 text-[13px] leading-tight text-slate-950">{sku.title}</div>
                </div>
                {bgs.applied[row.skuId] && batch.tier === "input" && <Check className="size-4 shrink-0 text-success-600" aria-label="Background applied" />}
              </button>
            )
          })}
          <div className="px-2.5 pt-1 text-xs text-slate-500">
            Showing {batch.skuRows.length} of {batch.inputSkus ?? batch.approveSkus}
          </div>
        </div>
      )}
    </div>
  )
}
