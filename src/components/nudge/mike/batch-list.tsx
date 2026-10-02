"use client"

import { contentBatches, launchedIds } from "../data"
import { useNudge } from "../nudge-context"
import { BatchListItem } from "./batch-list-item"
import { ApproveAll, GROUPS, RailGroup } from "./rail"
import type { Batch } from "../types"

interface BatchListProps {
  selectedId: Batch["id"]
  selectedSkuId: string | null
  expandedBatchId: Batch["id"] | null
  onToggleExpand: (id: Batch["id"]) => void
  onSelectBatch: (id: Batch["id"]) => void
  onSelectSku: (batchId: Batch["id"], skuId: string) => void
  onApproveAll: (batches: Batch[]) => void
}

const fmt = (v: number) => (v >= 1 ? `$${+v.toFixed(2)}M` : `$${Math.round(v * 1000)}K`)
/** "$500K" → 0.5, "$1.2M" → 1.2 ($M). */
const money = (s: string) => parseFloat(s.replace(/[$KM,]/g, "")) / (s.endsWith("K") ? 1000 : 1)

/**
 * Left rail: Mike's inbox, grouped the way Claire's page is (see rail.tsx for the
 * look). Items are cut by the review policy (see contentBatches), so each has
 * one action. Each carries its own deadline; Approve all ships the bulk items.
 */
export function BatchList({ selectedId, selectedSkuId, expandedBatchId, onToggleExpand, onSelectBatch, onSelectSku, onApproveAll }: BatchListProps) {
  const { approved, policy, launchReady } = useNudge()
  const all = contentBatches(policy, launchedIds(approved), launchReady)

  return (
    <div className="border-r border-slate-200 bg-white">
      {GROUPS.map((g, gi) => {
        // Bands run by ease (the group order); within a band, the most value first.
        const batches = all.filter((b) => b.tier === g.tier).sort((x, y) => money(y.value) - money(x.value))
        const pending = batches.filter((b) => !approved[b.id])
        // Approve all can't claim the SKUs the policy says need a one-by-one review.
        const bulk = pending.filter((b) => b.mode !== "each")
        return (
          <RailGroup
            key={g.tier}
            first={gi === 0}
            group={g}
            effort={g.tier === "approval" ? (pending.length ? `${pending.reduce((m, b) => m + b.reviewMinutes, 0)} min to review` : "All approved") : undefined}
            value={`+${fmt(batches.reduce((s, b) => s + money(b.value), 0))}`}
            // "All approved" only when nothing is left; with only one-by-one items left, no bulk action.
            action={g.tier === "approval" && (bulk.length || !pending.length) ? <ApproveAll pending={bulk.length} onClick={() => onApproveAll(bulk)} /> : undefined}
          >
            {batches.map((b) => (
              <BatchListItem
                key={b.id}
                batch={b}
                active={selectedId === b.id && !selectedSkuId}
                selectedSkuId={selectedId === b.id ? selectedSkuId : null}
                expanded={expandedBatchId === b.id}
                onToggleExpand={() => onToggleExpand(b.id)}
                onSelectBatch={() => onSelectBatch(b.id)}
                onSelectSku={(skuId) => onSelectSku(b.id, skuId)}
              />
            ))}
          </RailGroup>
        )
      })}
    </div>
  )
}
