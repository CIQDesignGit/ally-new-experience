"use client"

import { ArrowLeft, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { opsSkus } from "../data"
import type { OpsBatch } from "../data"
import { useNudge } from "../nudge-context"
import { PRIMARY, SECONDARY } from "../mike/buttons"
import { VENDOR_MANAGER } from "./note-bar"
import { SkuEvidence, SkuHeader } from "./ops-evidence"
import { flatten } from "./gap-data"
import { AllyFeedback } from "../ally-feedback"

interface OpsSkuPaneProps {
  batch: OpsBatch
  asin: string
  checked: Record<string, boolean>
  onBack: () => void
  /** Mark this SKU checked and open the next one. */
  onCheck: (asin: string) => void
  onSend: (batch: OpsBatch) => void
}

const k = (v: number) => `${v < 0 ? "−" : "+"}$${+(Math.abs(v) * 1000).toFixed(1)}K`

/**
 * One SKU under an ops issue, like Mike's SKU pane: back to the issue, the SKU,
 * what Ally saw on it and how it's doing against plan, then the next step.
 * Hero issues move one SKU at a time; the escalation goes once every SKU is checked.
 */
export function OpsSkuPane({ batch, asin, checked, onBack, onCheck, onSend }: OpsSkuPaneProps) {
  const { approved } = useNudge()
  const done = !!approved[batch.id]
  const skus = opsSkus(batch)
  const sku = skus.find((s) => s.asin === asin) ?? skus[0]
  const i = skus.indexOf(sku)
  const each = batch.mode === "each"
  const nChecked = skus.filter((s) => checked[s.asin]).length
  const all = nChecked === skus.length
  const gap = flatten().find((n) => n.asin === asin)

  return (
    <div className="flex min-w-0 flex-col px-10 py-8">
      <button type="button" onClick={onBack} className="flex w-fit items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="size-3.5" />
        Back to {batch.name}
      </button>
      <div className="mt-5">
        <SkuHeader asin={sku.asin} name={sku.name} />
      </div>
      {gap && (
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500">
          <span>
            Last week vs plan <span className={cn("font-mono font-semibold", gap.lastWeek.sales < gap.lastWeek.plan ? "text-error-600" : "text-success-700")}>{k(gap.lastWeek.sales - gap.lastWeek.plan)}</span>
          </span>
          <span>
            This week, projected <span className={cn("font-mono font-semibold", gap.eow.projected < gap.eow.plan ? "text-error-600" : "text-success-700")}>{k(gap.eow.projected - gap.eow.plan)}</span>
          </span>
        </div>
      )}
      <div className="mt-6">
        <SkuEvidence batch={batch} asin={sku.asin} />
      </div>

      <AllyFeedback key={sku.asin} id={`michelle:${batch.id}:${sku.asin}`} sku={sku.name} author="Michelle Ortiz" className="mt-6" />

      {!done && batch.tier === "approval" && (
        <div className="mt-8 flex flex-wrap items-center gap-4 rounded-xl border border-brand-200 bg-brand-25 px-6 py-5">
          <div className="min-w-0 flex-1">
            {each ? (
              <>
                <div className="text-sm font-semibold text-slate-950">
                  {all ? `All ${skus.length} hero SKUs are in your note to ${VENDOR_MANAGER.name}.` : `Hero SKU ${i + 1} of ${skus.length}. Check it, then add it to your note.`}
                </div>
                <div className="mt-0.5 text-sm text-slate-500">
                  {nChecked} of {skus.length} in your note · it goes out as one email when you send
                </div>
              </>
            ) : (
              <>
                <div className="text-sm font-semibold text-slate-950">Looks right? The other {batch.skus - 1} SKUs have the same issue.</div>
                <div className="mt-0.5 text-sm text-slate-500">Add them all to your note, or pick another SKU on the left.</div>
              </>
            )}
          </div>
          {each && !checked[sku.asin] ? (
            <button type="button" onClick={() => onCheck(sku.asin)} className={PRIMARY}>
              <Check className="mr-1.5 inline size-4" />
              Looks right · add to note
            </button>
          ) : each ? (
            <div className="flex items-center gap-2">
              <button type="button" onClick={onBack} className={SECONDARY}>
                Keep reviewing
              </button>
              <button type="button" onClick={() => window.dispatchEvent(new Event("open-note"))} className={PRIMARY}>
                Send note to vendor manager
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => skus.forEach((s) => onCheck(s.asin))} className={PRIMARY}>
              Add {batch.skus} SKUs to your note
            </button>
          )}
        </div>
      )}
      {done && (
        <div className="mt-8 flex items-center gap-2 text-[15px] font-medium text-success-700">
          <Check className="size-4" />
          {batch.doneLabel}
        </div>
      )}
    </div>
  )
}
