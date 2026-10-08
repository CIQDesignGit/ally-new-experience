"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowRight, Check, ChevronDown, PauseCircle, RefreshCw, ShieldCheck, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { AS_OF } from "../data"
import { daysUntil } from "../model"
import { Upload } from "lucide-react"
import { useChat } from "../chat/inline-chat"
import { UploadDialog } from "../chat/upload-dialog"
import { LAUNCH_CHIP } from "../launch/answers"
import { MediaLink } from "../media/content-link"
import { WhyIcon } from "../cs/why-icon"
import type { Why } from "../cs/data"

/** What these drafts used: Aurelle's context and what CommerceIQ learned across candle brands. */
const HALLOWEEN_WHY: Why[] = [
  { text: 'Never claim "non-toxic"', scope: "Brand", source: "Legal" },
  { text: "Warm and sensory: scent first, specs second", scope: "Brand", source: "Mike's edits, Aug" },
  { text: "Burn time and scent notes lift conversion 3–6%", scope: "Category", source: "Proven at 9 brands" },
  { text: "Trending: spooky party décor, fall centerpiece, boo basket", scope: "Category", source: "Search data, 14 brands" },
]
import { LAUNCH_FILES, LAUNCH_PAGES, NEW_SKUS, PAGE_FACTS } from "../launch/data"
import { AdaptedImage } from "../launch/images"
import { LaunchPagePreview } from "../launch/page-preview"
import { skuById } from "../data"
import { useNudge } from "../nudge-context"
import { PRIMARY, SECONDARY } from "./buttons"
import { SkuSections } from "./sku-diff"
import type { Batch } from "../types"

interface BatchDetailProps {
  batch: Batch
  onApprove: (batch: Batch) => void
  onReviewAll: (batch: Batch) => void
  /** Select another item, e.g. the held part once Mike holds an autopilot part back. */
  onSelect?: (id: string) => void
  /** Open one SKU of this item (the launch's page previews). */
  onSelectSku?: (batchId: string, skuId: string) => void
}

/**
 * Approve leads, a sample sits beside it as the quick check, and reviewing
 * every SKU is the rarer path, so it's a quiet line underneath.
 */
function Actions({ batch, onApprove, onReviewAll, children }: BatchDetailProps & { children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => onApprove(batch)} className={PRIMARY}>
          Approve {batch.approveSkus} SKUs
        </button>
        {children}
      </div>
      {batch.reassure && (
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <ShieldCheck className="size-4 shrink-0 text-success-600" />
          {batch.reassure}
        </div>
      )}
      <button
        type="button"
        onClick={() => onReviewAll(batch)}
        className="inline-flex w-fit items-center gap-1 text-sm text-slate-500 transition-colors hover:text-brand-700"
      >
        Or review all {batch.approveSkus} SKUs one by one
        <ArrowRight className="size-3.5" />
      </button>
    </div>
  )
}

/**
 * Default right pane for a batch: what the agent changed, then approve. "Review
 * a sample SKU" opens one real SKU's edit right here and scrolls to it, so Mike
 * never leaves the batch he's about to approve.
 */
export function BatchDetail({ batch, onApprove, onReviewAll, onSelect, onSelectSku }: BatchDetailProps) {
  const { approved, nudged, asks, autoShipped, policy, savePolicy, day } = useNudge()
  // A policy part scheduled on autopilot ("halloween-auto"): Mike can check it and hold it back, just this once.
  const scheduled = batch.tier === "autopilot" && batch.mode === "autopilot"
  const seedId = batch.id.replace(/-auto$/, "")
  const done = !!approved[batch.id]
  const ask = batch.nudgeKey ? asks[batch.nudgeKey] : undefined
  const shipped = batch.nudgeKey ? (autoShipped[batch.nudgeKey] ?? []) : []
  const short = ask?.due.split(",")[0]
  const source = shipped.includes(batch.id)
    ? `Shipped by Ally on Claire's ${short} deadline`
    : shipped.length
      ? `Ally shipped the core SKUs on Claire's ${short} deadline. These hero SKUs wait for you.`
      : ask?.by === "ally"
        ? `Claire assigned this Mon · due ${ask.due}`
        : ask
          ? `Claire asked you to approve by ${ask.due}${ask.ship ? ". If it isn't approved, Ally ships the core SKUs." : ""}`
          : batch.nudgeKey && nudged[batch.nudgeKey]
            ? "Nudged by Claire, just now"
            : batch.nudgeSource
  const [showSample, setShowSample] = useState(false)
  const sampleRef = useRef<HTMLDivElement>(null)
  const row = batch.skuRows[0]
  const sku = row ? skuById(row.skuId) : null

  useEffect(() => setShowSample(false), [batch.id])
  useEffect(() => {
    if (showSample) sampleRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [showSample])

  const sampleButton = sku && (
    <button type="button" onClick={() => setShowSample((v) => !v)} className={SECONDARY}>
      {showSample ? "Hide sample" : "Review sample SKU"}
      <ChevronDown className={cn("size-4 text-slate-400 transition-transform", showSample && "rotate-180")} />
    </button>
  )

  return (
    <div className="flex min-w-0 flex-col px-10 py-8">
      <div className="flex items-start justify-between gap-8">
        <div className="min-w-0">
          <div className="text-sm font-medium text-slate-500">
            {batch.type}
            {batch.partLabel && ` · ${batch.partLabel}`}
          </div>
          <div className="mt-0.5 flex items-center gap-1 text-2xl font-semibold tracking-tight text-slate-950">
            {batch.name}
            {/^(halloween|gifts)/.test(batch.id) && <WhyIcon why={HALLOWEEN_WHY} align="left" />}
          </div>
          {/* Who asked and by when, then the deadline that makes it urgent: the ask by weight (it's not a link), the expiry in amber. */}
          <div className="mt-1.5 text-sm">
            <span className={ask || shipped.length ? "font-medium text-slate-950" : "text-slate-500"}>{source}</span>
            {batch.deadline && !done && !shipped.length && (
              <span className="font-medium text-warning-700"> · Expires in {daysUntil(batch.deadline, AS_OF) - day} days</span>
            )}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className={cn("font-mono text-[28px] font-bold tracking-tight tabular-nums", done ? "text-success-700" : "text-slate-950")}>
            +{done ? (batch.approveValue >= 1 ? `$${batch.approveValue.toFixed(2)}M` : `$${Math.round(batch.approveValue * 1000)}K`) : batch.value}
          </div>
          {done && <div className="mt-0.5 text-sm text-slate-500">approved</div>}
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-slate-200">
        <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-950">
          <Sparkles className="size-4 text-ally-600" />
          {batch.changesTitle ?? "What Ally changed"}
        </div>
        <div>
          {batch.changes.map((change, i) => (
            <div key={i} className={cn("flex items-start gap-3 px-5 py-3.5", i > 0 && "border-t border-slate-100")}>
              <Check className="mt-0.5 size-4 shrink-0 text-success-600" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-slate-950">{change.text}</div>
                {change.detail && <div className="mt-0.5 text-sm text-slate-500">{change.detail}</div>}
              </div>
              <div className="shrink-0 text-right">
                <span className="font-mono text-sm font-semibold text-slate-950 tabular-nums">{change.skus.toLocaleString()}</span>
                <span className="ml-1 text-xs text-slate-500">of {batch.skus.toLocaleString()} SKUs</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <MediaLink batchId={batch.id} />

      <div className="mt-8">
        {batch.tier === "autopilot" ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 rounded-xl border border-info-100 bg-info-50 px-5 py-4 text-sm text-slate-700">
              <RefreshCw className="mt-0.5 size-4 shrink-0 text-info-600" />
              {batch.need?.text}
            </div>
            {scheduled && (
              <>
                <div className="flex flex-wrap items-center gap-3">
                  {sampleButton}
                  <button type="button" onClick={() => onReviewAll(batch)} className={SECONDARY}>
                    See all {batch.skus} SKUs
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    savePolicy({ ...policy, holds: [...(policy.holds ?? []), seedId] })
                    onSelect?.(`${seedId}-held`)
                  }}
                  className="inline-flex w-fit items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-brand-700"
                >
                  <PauseCircle className="size-4" />
                  Not sure? Hold these {batch.skus} SKUs for your review
                </button>
              </>
            )}
          </div>
        ) : done ? (
          <div className="flex items-center gap-2 text-[15px] font-medium text-success-700">
            <Check className="size-4" />
            {batch.doneLabel}
          </div>
        ) : batch.mode === "each" ? (
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => onReviewAll(batch)} className={PRIMARY}>
              Review {batch.approveSkus} SKUs
            </button>
            {sampleButton}
          </div>
        ) : batch.id === "concepts" && batch.tier === "input" ? (
          <LaunchBriefNeed />
        ) : batch.tier === "input" && batch.need ? (
          <button type="button" onClick={() => onReviewAll(batch)} className={cn(PRIMARY, "w-fit")}>
            Review {batch.inputSkus} SKUs
          </button>
        ) : batch.id === "concepts" && batch.tier === "approval" ? (
          <div className="flex flex-col gap-4">
            <LaunchSkuStrip onPreview={(skuId) => onSelectSku?.(batch.id, skuId)} />
            <Actions batch={batch} onApprove={onApprove} onReviewAll={onReviewAll} />
          </div>
        ) : (
          <Actions batch={batch} onApprove={onApprove} onReviewAll={onReviewAll}>
            {sampleButton}
          </Actions>
        )}
      </div>

      {showSample && sku && row && (
        <div ref={sampleRef} className="mt-8 scroll-mt-6 border-t border-slate-100 pt-8">
          <div className="mb-4 flex items-center gap-4">
            <img src={sku.thumbnailUrl} alt={sku.title} className="size-12 shrink-0 rounded-lg object-cover shadow-sm ring-1 ring-slate-200" />
            <div className="min-w-0">
              <div className="font-mono text-xs text-slate-500">
                Sample · {sku.asin} · {sku.brand}
              </div>
              <div className="mt-0.5 text-lg font-semibold tracking-tight text-slate-950">{sku.title}</div>
            </div>
          </div>
          {batch.id === "concepts" && batch.tier === "approval" ? <LaunchPagePreview skuId={row.skuId} /> : <SkuSections sections={row.sections} thumbnailUrl={sku.thumbnailUrl} />}
          {/* One-by-one parts have no bulk approve under the sample: each SKU gets its own look. */}
          {!done && batch.mode === "each" && (
            <div className="mt-6 flex flex-col gap-3 rounded-xl border border-brand-200 bg-brand-25 px-6 py-5">
              <div className="text-sm font-semibold text-slate-950">
                This is 1 of {batch.approveSkus} {batch.partLabel ? `${batch.partLabel.toLowerCase()} SKUs` : "SKUs"}. Your review policy has you check them one by one.
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <button type="button" onClick={() => onReviewAll(batch)} className={PRIMARY}>
                  Review {batch.approveSkus} SKUs
                </button>
                <button type="button" onClick={() => onApprove(batch)} className="inline-flex items-center gap-1 text-sm text-slate-500 transition-colors hover:text-brand-700">
                  Or approve all {batch.approveSkus}
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            </div>
          )}
          {!done && batch.tier === "approval" && batch.mode !== "each" && (
            <div className="mt-6 flex flex-col gap-3 rounded-xl border border-brand-200 bg-brand-25 px-6 py-5">
              <div className="text-sm font-semibold text-slate-950">Looks right? The other {batch.approveSkus - 1} SKUs got the same treatment.</div>
              <Actions batch={batch} onApprove={onApprove} onReviewAll={onReviewAll} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/** The launch is blocked on the brief: upload it here, and the conversation picks it up. */
function LaunchBriefNeed() {
  const { ask } = useChat()
  const [open, setOpen] = useState(false)
  return (
    <div className="flex flex-col gap-3">
      <div className="text-sm text-slate-700">Ally needs the launch brief: the brand team&apos;s email and the agency&apos;s concept.</div>
      <button type="button" onClick={() => setOpen(true)} className={cn(PRIMARY, "w-fit")}>
        <Upload className="size-4" /> Upload the brief
      </button>
      {open && (
        <UploadDialog
          title="Upload the launch brief"
          files={LAUNCH_FILES}
          onClose={() => setOpen(false)}
          onAttach={(files) => {
            setOpen(false)
            ask(LAUNCH_CHIP, undefined, "Here's the Winter Hearth launch brief.", files)
          }}
        />
      )}
    </div>
  )
}

/** The 3 new SKUs at a glance: each one's image set, name and price, and its page preview. */
function LaunchSkuStrip({ onPreview }: { onPreview: (skuId: string) => void }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {LAUNCH_PAGES.map((p) => {
        const sku = NEW_SKUS.find((x) => x.id === p.skuId)!
        return (
          <div key={p.skuId} className="flex flex-col rounded-xl border border-slate-200 bg-white p-3">
            <AdaptedImage kind="main" photo={p.photo} focus={p.focus} notes={p.notes} story={p.story} cut={p.cut} facts={PAGE_FACTS[p.skuId]} bare />
            <div className="mt-2.5 text-[13px] leading-snug font-semibold text-slate-950">{sku.title.replace("Aurelle ", "").split(",")[0]}</div>
            <div className="text-[12px] text-slate-500">{`${PAGE_FACTS[p.skuId].price} · ${PAGE_FACTS[p.skuId].size} · 3 images`}</div>
            <button type="button" onClick={() => onPreview(p.skuId)} className="mt-2.5 w-fit text-[13px] font-medium text-brand-700 hover:underline">
              Preview page
            </button>
          </div>
        )
      })}
    </div>
  )
}
