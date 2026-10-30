"use client"

import { useEffect, useState } from "react"
import { Check, Mail, RefreshCw, Search } from "lucide-react"
import { toast } from "sonner"
import { useNudge } from "../nudge-context"
import { PRIMARY } from "../mike/buttons"
import { OPS_DAYS_SAVED, fmtValue, opsSkus } from "../data"
import type { OpsBatch } from "../data"
import { BuyBoxVisual } from "./buybox-visual"
import { IssueVisual, hasIssueVisual } from "./issue-visuals"
import { VENDOR_MANAGER, useNote } from "./note-bar"
import { useOpsLevel } from "./ops-batch-list"

interface OpsBatchDetailProps {
  batch: OpsBatch
  onAction: (batch: OpsBatch) => void
  /** Open the first SKU side by side, its list open in the rail. */
  onReviewAll: (batch: OpsBatch) => void
}

/** A field only Michelle's team can fill: what Ally drafted, then a full-width box. Same look as Mike's input fields. */
function InputRow({ item }: { item: NonNullable<OpsBatch["inputs"]>[number] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-25 px-5 py-2.5">
        <span className="text-sm font-semibold text-slate-950">{item.label}</span>
        <span className="text-xs text-slate-500">Your input</span>
      </div>
      <div className="px-5 py-4">
        <div className="text-sm text-slate-500">{item.detail}</div>
        <input
          placeholder={item.placeholder}
          className="mt-3 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
        />
      </div>
    </div>
  )
}

/**
 * Right pane for an ops batch, laid out like Mike's: type and name, value, what
 * Ally caught (or fixes on its own), then one action. One approval away: a single
 * sign-off Ally sends for you. Needs your input: review the items only your team
 * can answer, then send them to Ally. On autopilot: nothing to do.
 */
export function OpsBatchDetail({ batch, onAction, onReviewAll }: OpsBatchDetailProps) {
  const { approved } = useNudge()
  const done = !!approved[batch.id]
  const [reviewing, setReviewing] = useState(false)
  const skus = opsSkus(batch)
  useEffect(() => {
    setReviewing(false)
  }, [batch.id])
  const each = batch.mode === "each"
  const { addToNote } = useNudge()
  const { sent, notedIn, skus: inNoteNow } = useNote()
  const level = useOpsLevel()
  const noted = notedIn(batch.id, batch.skus)
  const sentAll = skus.length > 0 && skus.every((x) => sent(batch.id, x.asin))
  const addAll = () => {
    addToNote(batch.id, skus.map((x) => x.asin), true)
    // The first add is confirmed by the note bar as it appears (with how the note works).
    if (inNoteNow > 0) toast.success(`Added ${batch.skus} SKUs to your note to the ${VENDOR_MANAGER.label}`, { position: "top-right" })
  }
  // Buy box issues get the picture: the lead SKU's offers and crawls.
  const lead = batch.sellerSkus?.find((x) => x.asin === batch.exampleSku) ?? batch.sellerSkus?.[0]
  const daily = fmtValue(batch.perDay ?? batch.approveValue / OPS_DAYS_SAVED)

  return (
    <div className="flex min-w-0 flex-col px-10 py-8">
      <div className="flex items-start justify-between gap-8">
        <div className="min-w-0">
          <div className="text-sm font-medium text-slate-500">
            {batch.type}
            {batch.partLabel && ` · ${batch.partLabel}`}
          </div>
          <div className="mt-0.5 text-2xl font-semibold tracking-tight text-slate-950">{batch.name}</div>
        </div>
        {level ? (
          // The MVP: impact on the gap to plan; the daily figure is what the SKUs normally sell (measured), not a projection.
          <div className="shrink-0 text-right">
            <div className="text-[28px] font-bold tracking-tight text-slate-950">{level(batch)}</div>
            <div className="mt-0.5 text-sm text-slate-500">{done ? "sent · " : ""}impact on the gap to plan</div>
            {batch.urgent && !done && (
              <div className="mt-0.5 text-sm text-slate-500">
                These SKUs normally sell <span className="font-mono text-slate-950">{daily}</span> a day
              </div>
            )}
          </div>
        ) : (
          <div className="shrink-0 text-right">
            <div className={`font-mono text-[28px] font-bold tracking-tight tabular-nums ${done ? "text-success-700" : "text-slate-950"}`}>+{batch.value}</div>
            {(batch.tier === "autopilot" || done) && <div className="mt-0.5 text-sm text-slate-500">{batch.tier === "autopilot" ? "leakage prevented this quarter" : "sent"}</div>}
            {batch.urgent && !done && <div className="mt-0.5 text-sm font-semibold text-error-600 tabular-nums">−{daily} a day</div>}
          </div>
        )}
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
        {/* A label only where it adds something: autopilot. A caught issue speaks for itself. */}
        {batch.tier === "autopilot" && (
        <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-950">
          {batch.tier === "autopilot" ? <RefreshCw className="size-4 text-info-600" /> : <Search className="size-4 text-brand-600" />}
          {batch.tier === "autopilot" ? "What Ally fixes automatically" : "What Ally caught"}
        </div>
        )}
        {batch.fixes ? (
          batch.fixes.map((f, i) => (
            <div key={f.text} className={i > 0 ? "flex items-start gap-3 border-t border-slate-100 px-5 py-3.5" : "flex items-start gap-3 px-5 py-3.5"}>
              <Check className="mt-0.5 size-4 shrink-0 text-success-600" />
              <span className="flex-1 text-sm font-medium text-slate-950">{f.text}</span>
              <span className="font-mono text-sm font-semibold text-slate-950 tabular-nums">{f.count}</span>
              <span className="-ml-2 text-xs text-slate-500">this quarter</span>
            </div>
          ))
        ) : lead ? (
          <BuyBoxVisual sku={lead} />
        ) : hasIssueVisual(batch) ? (
          <IssueVisual batch={batch} />
        ) : (
          <div className="px-5 py-4">
            <p className="text-sm leading-relaxed text-slate-950">{batch.detected}</p>
            {batch.evidence.length > 0 && (
              <div className="mt-4 rounded-lg bg-slate-25 p-4">
                {batch.exampleSku && (
                  <div className="text-xs font-medium text-slate-500">
                    Lead example · <span className="font-mono">{batch.exampleSku}</span> {batch.exampleName}
                  </div>
                )}
                <ul className={batch.exampleSku ? "mt-2.5 space-y-1.5" : "space-y-1.5"}>
                  {batch.evidence.map((e) => (
                    <li key={e} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="mt-1.5 size-1 shrink-0 rounded-full bg-slate-400" />
                      {e}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-5">
        {batch.tier === "autopilot" ? (
          <div className="flex items-start gap-3 rounded-xl border border-info-100 bg-info-50 px-5 py-4 text-sm text-slate-700">
            <RefreshCw className="mt-0.5 size-4 shrink-0 text-info-600" />
            Running on autopilot. {batch.detected}
          </div>
        ) : done ? (
          <div className="flex items-center gap-2 text-[15px] font-medium text-success-700">
            <Check className="size-4" />
            {level ? batch.doneLabel.split(" · ")[0] : batch.doneLabel}
          </div>
        ) : batch.tier === "input" ? (
          !reviewing && (
            <button type="button" onClick={() => setReviewing(true)} className={`${PRIMARY} w-fit`}>
              Review {batch.inputCount} {batch.inputNoun}
            </button>
          )
        ) : (
          <div className="flex flex-col gap-6">
            {/* One action and one status line: the next step, or where the SKUs are now. */}
            {noted === batch.skus ? (
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <Mail className="size-4 text-brand-600" />
                {sentAll ? `Sent to the ${VENDOR_MANAGER.label}` : `All ${batch.skus} SKUs are in your note to the ${VENDOR_MANAGER.label}. They go out when you send it.`}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-4">
                  {each ? (
                    <button type="button" onClick={() => onReviewAll(batch)} className={PRIMARY}>
                      Review {batch.skus} SKUs
                    </button>
                  ) : (
                    <button type="button" onClick={addAll} className={PRIMARY}>
                      Add {batch.skus} SKUs to your note
                    </button>
                  )}
                </div>
                {(noted > 0 || batch.reassure) && (
                  <div className="text-sm text-slate-500">{noted > 0 ? `${noted} of ${batch.skus} in your note to the ${VENDOR_MANAGER.label}` : batch.reassure}</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {reviewing && !done && batch.inputs && (
        <div className="mt-6 flex flex-col gap-3">
          {batch.inputs.map((item) => (
            <InputRow key={item.label} item={item} />
          ))}
          <div className="mt-1 flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                onAction(batch)
                toast.success(`Sent to Ally. ${level ? batch.doneLabel.split(" · ")[0] : batch.doneLabel}.`, { position: "top-right" })
              }}
              className={PRIMARY}
            >
              Send to Ally
            </button>
            <span className="text-sm text-slate-500 tabular-nums">
              {batch.inputs.length} of {batch.inputCount} shown
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
