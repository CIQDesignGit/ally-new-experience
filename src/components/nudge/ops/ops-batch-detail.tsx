"use client"

import { useEffect, useState } from "react"
import { ArrowRight, Check, ChevronDown, Mail, RefreshCw, Search } from "lucide-react"
import { toast } from "sonner"
import { useNudge } from "../nudge-context"
import { PRIMARY, SECONDARY } from "../mike/buttons"
import { OPS_DAYS_SAVED, fmtValue, opsSkus } from "../data"
import type { OpsBatch } from "../data"
import { SkillsTrace, SkuEvidence, SkuHeader } from "./ops-evidence"
import { BuyBoxVisual } from "./buybox-visual"
import { IssueVisual, hasIssueVisual } from "./issue-visuals"
import { VENDOR_MANAGER, useNote } from "./note-bar"
import { ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

interface OpsBatchDetailProps {
  batch: OpsBatch
  onAction: (batch: OpsBatch) => void
  /** Open the first SKU side by side, its list open in the rail. */
  onReviewAll: (batch: OpsBatch) => void
}

/** A field only Michelle's team can fill: what Ally drafted, then a full-width box. Same look as Mike's input fields. */
function InputRow({ item }: { item: NonNullable<OpsBatch["inputs"]>[number] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-warning-200">
      <div className="flex items-center justify-between gap-3 border-b border-warning-100 bg-warning-50 px-5 py-2.5">
        <span className="text-sm font-semibold text-slate-950">{item.label}</span>
        <span className="font-mono text-[11px] tracking-wide text-warning-700 uppercase">Your input</span>
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
  const sample = skus[0]
  const [showSample, setShowSample] = useState(false)
  useEffect(() => {
    setReviewing(false)
    setShowSample(false)
  }, [batch.id])
  const each = batch.mode === "each"
  const { addToNote } = useNudge()
  const { sent, notedIn, skus: inNoteNow } = useNote()
  const noted = notedIn(batch.id, batch.skus)
  const sentAll = skus.length > 0 && skus.every((x) => sent(batch.id, x.asin))
  const addAll = () => {
    addToNote(batch.id, skus.map((x) => x.asin), true)
    // The first add is confirmed by the note bar as it appears (with how the note works).
    if (inNoteNow > 0) toast.success(`Added ${batch.skus} SKUs to your note to ${VENDOR_MANAGER.name}`, { position: "top-right" })
  }
  // Buy box issues get the picture: the lead SKU's offers and crawls.
  const lead = batch.sellerSkus?.find((x) => x.asin === batch.exampleSku) ?? batch.sellerSkus?.[0]
  const daily = fmtValue(batch.perDay ?? batch.approveValue / OPS_DAYS_SAVED)
  // The page confirms the send (same toast from the issue pane and the SKU pane).
  const send = () => onAction(batch)

  return (
    <div className="flex min-w-0 flex-col px-10 py-8">
      <div className="flex items-start justify-between gap-8">
        <div className="min-w-0">
          <div className="text-sm font-medium text-slate-500">
            {batch.type}
            {batch.partLabel && ` · ${batch.partLabel}`}
          </div>
          <div className="mt-0.5 text-2xl font-semibold tracking-tight text-slate-950">{batch.name}</div>
          {/* Team, count and how it was found on one line. */}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 text-sm text-slate-500">
            {batch.team} · {batch.skus} {batch.tier === "input" ? batch.inputNoun : "SKUs"}
            {batch.skills && (
              <>
                <span className="text-slate-300">·</span>
                <SkillsTrace skills={batch.skills} />
              </>
            )}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className={`font-mono text-[28px] font-bold tracking-tight tabular-nums ${done ? "text-success-700" : "text-slate-950"}`}>+{batch.value}</div>
          {(batch.tier === "autopilot" || done) && <div className="mt-0.5 text-sm text-slate-500">{batch.tier === "autopilot" ? "leakage prevented this quarter" : "sent"}</div>}
          {batch.urgent && !done && <div className="mt-0.5 text-sm font-semibold text-error-600 tabular-nums">−{daily} a day</div>}
        </div>
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
            {batch.doneLabel}
          </div>
        ) : batch.tier === "input" ? (
          <div className="flex flex-col gap-4 rounded-xl border border-warning-200 bg-warning-50 px-5 py-4">
            <div className="text-sm text-slate-700">
              {batch.inputCount} {batch.inputNoun} need something only your team has. Ally files the rest as soon as you send them.
            </div>
            {!reviewing && (
              <button type="button" onClick={() => setReviewing(true)} className={`${PRIMARY} w-fit`}>
                Review {batch.inputCount} {batch.inputNoun}
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {noted > 0 && (
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <Mail className="size-4 text-brand-600" />
                {sentAll ? `Sent to ${VENDOR_MANAGER.name}` : `${noted} of ${batch.skus} SKUs in your note to ${VENDOR_MANAGER.name} · not sent`}
              </div>
            )}
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-3">
                {each ? (
                  <button type="button" onClick={() => onReviewAll(batch)} className={PRIMARY}>
                    Review {batch.skus} SKUs
                  </button>
                ) : (
                  <button type="button" onClick={addAll} disabled={noted === batch.skus} className={cn(PRIMARY, "disabled:opacity-50")}>
                    {noted === batch.skus ? "All in your note" : `Add ${batch.skus} SKUs to your note`}
                  </button>
                )}
                {!each && sample && (
                  <button type="button" onClick={() => setShowSample((v) => !v)} className={SECONDARY}>
                    {showSample ? "Hide sample" : "Review sample SKU"}
                    <ChevronDown className={cn("size-4 text-slate-400 transition-transform", showSample && "rotate-180")} />
                  </button>
                )}
              </div>
              {batch.reassure && (
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <ShieldCheck className="size-4 shrink-0 text-success-600" />
                  {batch.reassure}
                </div>
              )}
              {!each && skus.length > 1 && (
                <button type="button" onClick={() => onReviewAll(batch)} className="inline-flex w-fit items-center gap-1 text-sm text-slate-500 transition-colors hover:text-brand-700">
                  Or review all {batch.skus} SKUs one by one
                  <ArrowRight className="size-3.5" />
                </button>
              )}
            </div>
            {showSample && sample && !each && (
              <div className="border-t border-slate-100 pt-8">
                <SkuHeader asin={sample.asin} name={sample.name} label="Sample" />
                <div className="mt-4">
                  <SkuEvidence batch={batch} asin={sample.asin} />
                </div>
                <div className="mt-6 flex flex-col gap-3 rounded-xl border border-brand-200 bg-brand-25 px-6 py-5">
                  <div className="text-sm font-semibold text-slate-950">Looks right? The other {batch.skus - 1} SKUs have the same issue.</div>
                  <button type="button" onClick={addAll} disabled={noted === batch.skus} className={cn(PRIMARY, "w-fit disabled:opacity-50")}>
                    {noted === batch.skus ? "All in your note" : `Add ${batch.skus} SKUs to your note`}
                  </button>
                </div>
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
          <div className="text-xs text-slate-500">
            Showing {batch.inputs.length} of {batch.inputCount}
          </div>
          <div className="mt-2 flex items-center gap-4 rounded-xl border border-warning-200 bg-warning-50 px-6 py-5">
            <div className="min-w-0 flex-1 text-sm font-semibold text-slate-950">Filled in? Ally files every claim and tells you when they land.</div>
            <button
              type="button"
              onClick={() => {
                onAction(batch)
                toast.success(`Sent to Ally. ${batch.doneLabel}.`, { position: "top-right" })
              }}
              className={PRIMARY}
            >
              Send to Ally
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
