"use client"

import { LaunchPagePreview } from "../launch/page-preview"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { skuById } from "../data"
import { useNudge } from "../nudge-context"
import { PRIMARY, SECONDARY } from "./buttons"
import { sceneLabel, useBackgrounds } from "./background-composer"
import { cn } from "@/lib/utils"
import { SkuSections } from "./sku-diff"
import { AllyFeedback } from "../ally-feedback"
import type { Batch, SkuRow } from "../types"

interface SkuDetailPaneProps {
  batch: Batch
  row: SkuRow
  onBack: () => void
  onApprove: (batch: Batch) => void
  onReviewAll: (batch: Batch) => void
  /** Open another SKU in this batch (for "Next SKU"). */
  onSelectSku?: (skuId: string) => void
}

/**
 * The per-SKU view from "See all N SKUs": each field as one inline edit
 * (removed struck, kept black, added green), then the bulk approve.
 */
export function SkuDetailPane({ batch, row, onBack, onApprove, onSelectSku }: SkuDetailPaneProps) {
  const bgs = useBackgrounds()
  // Batches that ask for a background: count the SKUs that have one, offer Next SKU or Apply to all.
  const needsBackground = batch.skuRows.some((r) => r.sections.some((s) => s.kind === "background"))
  const withBg = batch.skuRows.filter((r) => bgs.applied[r.skuId]).length
  const idx = batch.skuRows.findIndex((r) => r.skuId === row.skuId)
  const next = batch.skuRows[idx + 1]
  const onNext = next && onSelectSku ? () => onSelectSku(next.skuId) : undefined
  const { approved } = useNudge()
  const sku = skuById(row.skuId)
  const done = !!approved[batch.id]

  return (
    <div className="flex min-w-0 flex-col px-10 py-8">
      <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="size-3.5" />
        Back to {batch.name}
      </button>

      <div className="mt-5 flex items-center gap-4">
        <img
          src={sku.thumbnailUrl}
          alt={sku.title}
          className="size-12 shrink-0 rounded-lg object-cover shadow-sm ring-1 ring-slate-200"
        />
        <div className="min-w-0">
          <div className="font-mono text-xs text-slate-500">{sku.asin} · {sku.brand}</div>
          <div className="mt-0.5 text-lg font-semibold tracking-tight text-slate-950">{sku.title}</div>
        </div>
      </div>

      <div className="mt-6">
        {/* A drafted new SKU has no live page to compare: the review is the page as it will publish. */}
        {batch.id === "concepts" && batch.tier === "approval" ? (
          <LaunchPagePreview skuId={row.skuId} />
        ) : (
          <SkuSections
            sections={row.sections}
            thumbnailUrl={sku.thumbnailUrl}
            skuId={row.skuId}
            onNext={onNext}
            edit={{ idPrefix: `mike:${batch.id}:${row.skuId}`, subject: sku.title, author: "Mike Chen", applies: `Ally applies it to the other ${batch.approveSkus - 1} SKUs in ${batch.name}` }}
          />
        )}
      </div>

      {/* Text fields take an edit with a reason; the rest (images, new pages) a thumbs up or down. */}
      {!row.sections.some((s) => s.kind === "text") && <AllyFeedback key={row.skuId} id={`mike:${batch.id}:${row.skuId}`} sku={sku.title} author="Mike Chen" className="mt-6" />}

      {!done && batch.tier === "input" && needsBackground && (
        <div className="mt-8 flex items-center gap-4">
          <div className="min-w-0 flex-1">
            {withBg === 0 ? (
              <div className="text-sm font-semibold text-slate-950">Pick a background and apply it to this SKU first.</div>
            ) : (
              <>
                <div className="text-sm font-semibold text-slate-950">
                  {withBg} of {batch.inputSkus} SKUs {withBg === 1 ? "has" : "have"} a Halloween background.
                </div>
                <div className="mt-0.5 text-sm text-slate-500">
                  Use {bgs.last ? sceneLabel(bgs.last) : "it"} for the other {(batch.inputSkus ?? 0) - withBg}, or go one by one.
                </div>
              </>
            )}
          </div>
          {onNext && (
            <button type="button" onClick={onNext} className={SECONDARY}>
              Next SKU →
            </button>
          )}
          <button
            type="button"
            disabled={withBg === 0}
            onClick={() => {
              onApprove(batch)
              toast.success(batch.need!.toast)
            }}
            className={cn(PRIMARY, "disabled:opacity-50")}
          >
            {batch.need?.cta ?? "Send to Ally"}
          </button>
        </div>
      )}

      {!done && batch.tier === "input" && !needsBackground && (
        <div className="mt-8 flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              onApprove(batch)
              toast.success(batch.need!.toast)
            }}
            className={PRIMARY}
          >
            {batch.need?.cta ?? "Send to Ally"}
          </button>
        </div>
      )}

      {!done && batch.tier === "approval" && (
        <div className="mt-8 flex items-center gap-4 rounded-xl border border-brand-200 bg-brand-25 px-6 py-5">
          <div className="min-w-0 flex-1">
            {batch.mode === "each" ? (
              <>
                <div className="text-sm font-semibold text-slate-950">Checked each one? Approve all {batch.approveSkus} together.</div>
                <div className="mt-0.5 text-sm text-slate-500">Your review policy sends {batch.partLabel ? `${batch.partLabel.toLowerCase()} SKUs` : "these SKUs"} one by one. Pick the next one on the left.</div>
              </>
            ) : (
              <>
                <div className="text-sm font-semibold text-slate-950">Looks right? The other {batch.approveSkus - 1} SKUs got the same treatment.</div>
                <div className="mt-0.5 text-sm text-slate-500">Approve the whole batch in one go, or pick another SKU on the left.</div>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={() => onApprove(batch)}
            className={PRIMARY}
          >
            Approve {batch.approveSkus} SKUs
          </button>
        </div>
      )}
    </div>
  )
}
