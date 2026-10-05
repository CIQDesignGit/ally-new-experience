"use client"

import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { candleThumbnail } from "@/lib/candle-thumbnails"
import { opsSkus } from "../data"
import type { OpsBatch } from "../data"
import { useNudge } from "../nudge-context"
import { ITEM_ACTIVE, ITEM_IDLE, MetaLine } from "../mike/rail"
import { VENDOR_MANAGER, useNote } from "./note-bar"

interface OpsListItemProps {
  batch: OpsBatch
  active: boolean
  selectedSku: string | null
  expanded: boolean
  /** SKUs checked in a one-by-one review, shown with a check. */
  checked: Record<string, boolean>
  onToggleExpand: () => void
  onSelectBatch: () => void
  onSelectSku: (asin: string) => void
}

/**
 * One ops issue in the rail, the same shape as Mike's batch rows: type and
 * value, the issue, then "N SKUs ▾" opening the SKUs under it. Picking a SKU
 * opens it side by side on the right.
 */
export function OpsListItem({ batch, active, selectedSku, expanded, checked, onToggleExpand, onSelectBatch, onSelectSku }: OpsListItemProps) {
  const { approved } = useNudge()
  const done = !!approved[batch.id]
  const skus = opsSkus(batch)
  const { sent, notedIn } = useNote()
  const noted = notedIn(batch.id, batch.skus)
  const allSent = skus.length > 0 && skus.every((s) => sent(batch.id, s.asin))
  const count = batch.tier === "input" ? batch.inputCount : batch.skus
  const noun = batch.tier === "input" ? (batch.inputNoun ?? "items") : "SKUs"

  return (
    <div className={cn("rounded-lg transition-colors", active ? ITEM_ACTIVE : ITEM_IDLE)}>
      <button type="button" onClick={onSelectBatch} className="block w-full rounded-lg px-3.5 pt-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-brand-300">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[15px] font-semibold text-slate-950">
            {batch.type}
            {batch.partLabel && ` · ${batch.partLabel}`}
          </span>
          <span className={cn("font-mono text-[15px] font-semibold tabular-nums", done ? "text-success-700" : "text-slate-950")}>+{batch.value}</span>
        </div>
        <div className="mt-0.5 text-[13px] text-slate-500">{batch.name}</div>
      </button>
      <div className="px-3.5 pb-3">
        <MetaLine
          parts={[
            skus.length > 0 ? (
              <button key="n" type="button" onClick={onToggleExpand} aria-expanded={expanded} className="inline-flex items-center gap-0.5 font-medium text-slate-700 hover:text-brand-700">
                {count} {noun}
                <ChevronDown className={cn("size-3.5 transition-transform", expanded && "rotate-180")} />
              </button>
            ) : (
              <span key="n">
                {count} {noun}
              </span>
            ),
            batch.mode === "each" && !done && !noted && <span key="m">review each</span>,
            !done && noted > 0 && !allSent && (
              <span key="note" className="font-medium text-brand-700">
                In your note · {noted} of {batch.skus}
              </span>
            ),
            done && <span key="d" className="font-medium text-success-700">{batch.tier === "input" ? "Sent to Ally" : `Sent to the ${VENDOR_MANAGER.label}`}</span>,
            !done && batch.tier === "autopilot" && <span key="a" className="font-medium text-info-700">Running</span>,
            !done && batch.tier !== "autopilot" && batch.chip && <span key="c" className="font-medium text-warning-700">{batch.chip}</span>,
          ]}
        />
      </div>
      {expanded && skus.length > 0 && (
        <div className="flex flex-col gap-0.5 px-2 pb-2">
          {skus.map((s) => (
            <button
              key={s.asin}
              type="button"
              onClick={() => onSelectSku(s.asin)}
              className={cn("flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors", selectedSku === s.asin ? "bg-white ring-1 ring-slate-200" : "hover:bg-white")}
            >
              <img src={candleThumbnail(s.asin)} alt={s.name} className="size-8 shrink-0 rounded-md object-cover ring-1 ring-slate-200" />
              <div className="min-w-0 flex-1">
                <div className="font-mono text-[11px] text-slate-500">{s.asin}</div>
                <div className="mt-0.5 text-[13px] leading-tight text-slate-950">{s.name}</div>
              </div>
              {checked[s.asin] && <Check className="size-4 shrink-0 text-success-600" aria-label="Checked" />}
            </button>
          ))}
          {skus.length < (batch.skus ?? 0) && <div className="px-2.5 pt-1 text-xs text-slate-500">Showing {skus.length} of {batch.skus}</div>}
        </div>
      )}
    </div>
  )
}
