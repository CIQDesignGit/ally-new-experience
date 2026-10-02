"use client"

import { LAUNCH_CHIP } from "@/components/nudge/launch/answers"
import { LAUNCH_FILES } from "@/components/nudge/launch/data"
import { useEffect, useRef, useState } from "react"
import { PageShell } from "@/components/layout/page-shell"
import { ResetDemoButton } from "@/components/nudge/reset-demo-button"
import { AskBar, ChatProvider, ChatThread, useChatSource } from "@/components/nudge/chat/inline-chat"
import { OPEN_ITEM_EVENT } from "@/components/nudge/chat/open-item"
import type { OpenItemDetail } from "@/components/nudge/chat/open-item"
import { MIKE_QUESTIONS, mikeAnswer } from "@/components/nudge/ask-ally-personas"
import { MikeHeader } from "@/components/nudge/mike/mike-header"
import { MikeDelivered } from "@/components/nudge/mike/mike-delivered"
import { MikeProgress } from "@/components/nudge/mike/mike-progress"
import { BatchList } from "@/components/nudge/mike/batch-list"
import { BatchDetail } from "@/components/nudge/mike/batch-detail"
import { SkuDetailPane } from "@/components/nudge/mike/sku-detail-pane"
import { BackgroundProvider } from "@/components/nudge/mike/background-composer"
import { contentBatches, launchedIds } from "@/components/nudge/data"
import { useNudge } from "@/components/nudge/nudge-context"
import type { Batch } from "@/components/nudge/types"

/**
 * Mike's queue — landed on directly from the "Open in Ally →" button in the
 * real Slack DM Claire's nudge sends. Batches ranked by value on the left,
 * either the selected batch's summary or one real SKU's full field-by-field
 * comparison on the right.
 */
/** Mike's questions for the Ask Ally bar; answers appear at the end of the page. */
function MikeChat() {
  useChatSource(
    {
      chips: [LAUNCH_CHIP, ...MIKE_QUESTIONS.map((q, i) => ({ q, match: i === 2 ? /how am i doing|how('s| is| did).*(quarter|content)/i : undefined, render: () => <div className="max-w-[860px] rounded-2xl bg-white px-5 py-4 text-[15px] leading-relaxed text-slate-700 ring-1 ring-slate-200">{mikeAnswer(q)}</div> }))],
      files: LAUNCH_FILES,
    },
    "mike",
  )
  return null
}

export default function MikePage() {
  const { approve, approved, policy, launchReady } = useNudge()
  const batches = contentBatches(policy, launchedIds(approved), launchReady)
  // Open on the top of the inbox: the most valuable item one approval away (same order as the rail).
  const [selectedId, setSelectedId] = useState<Batch["id"]>(() => {
    const top = batches.filter((b) => b.tier === "approval").sort((x, y) => y.approveValue - x.approveValue)[0]
    return top?.id ?? batches[0].id
  })
  const [selectedSkuId, setSelectedSkuId] = useState<string | null>(null)
  const [expandedBatchId, setExpandedBatchId] = useState<Batch["id"] | null>(null)
  const [celebrate, setCelebrate] = useState<{ value: number; skus: number } | null>(null)
  const queueRef = useRef<HTMLDivElement>(null)
  // A link from another page ("/mike?batch=halloween") opens on that item.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("batch")
    if (id && batches.some((b) => b.id === id)) setSelectedId(id)
    // Once, on arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // An Ask Ally answer's next step ("Review the 12 hero SKUs") opens that item here.
  useEffect(() => {
    const onOpen = (e: Event) => {
      const { batch, review } = (e as CustomEvent<OpenItemDetail>).detail
      const pick = batches.find((b) => b.id === batch) ?? (review ? batches.find((b) => b.id.startsWith(batch) && b.mode === "each") : undefined) ?? batches.find((b) => b.id.startsWith(batch))
      if (!pick) return
      if (review) handleReviewAll(pick)
      else {
        handleSelectBatch(pick.id)
        queueRef.current?.scrollIntoView({ block: "start" })
      }
    }
    window.addEventListener(OPEN_ITEM_EVENT, onOpen)
    return () => window.removeEventListener(OPEN_ITEM_EVENT, onOpen)
  })

  // A policy change can remove the selected part (e.g. its SKUs moved to autopilot): fall back to the first item.
  const selected = batches.find((b) => b.id === selectedId) ?? batches[0]
  const selectedRow = selectedSkuId ? selected.skuRows.find((r) => r.skuId === selectedSkuId) : undefined

  function handleApprove(batch: Batch) {
    approve(batch.id)
    setCelebrate({ value: batch.approveValue, skus: batch.approveSkus })
    window.setTimeout(() => setCelebrate(null), 2200)
  }

  /** "Approve all" on a group: ship every pending bulk item in it at once (one-by-one items stay for their review). */
  function handleApproveAll(batches: Batch[]) {
    batches.forEach((b) => approve(b.id))
    setCelebrate({ value: batches.reduce((s, b) => s + b.approveValue, 0), skus: batches.reduce((s, b) => s + b.approveSkus, 0) })
    window.setTimeout(() => setCelebrate(null), 2200)
  }

  function handleSelectBatch(id: Batch["id"]) {
    setSelectedId(id)
    setSelectedSkuId(null)
  }

  function handleSelectSku(batchId: Batch["id"], skuId: string) {
    setSelectedId(batchId)
    setSelectedSkuId(skuId)
  }

  /** Every "Review N SKUs" opens the first SKU side by side, its list open on the left, scrolled up to the top of the queue. */
  function handleReviewAll(batch: Batch) {
    setSelectedId(batch.id)
    setSelectedSkuId(batch.skuRows[0]?.skuId ?? null)
    setExpandedBatchId(batch.id)
    // After the SKU view renders (the sample above it collapses), so the target doesn't move mid-scroll.
    window.setTimeout(() => {
      const top = queueRef.current ? queueRef.current.getBoundingClientRect().top + window.scrollY - 16 : 0
      window.scrollTo({ top, behavior: "smooth" })
      // Some embedded browsers ignore smooth scrolling: land there anyway.
      window.setTimeout(() => {
        if (Math.abs(window.scrollY - top) > 4) window.scrollTo({ top })
      }, 600)
    }, 50)
  }

  // Backgrounds applied per SKU are shared by the composer, the footer and the rail.
  return (
    <BackgroundProvider>
      <ChatProvider>
      <MikeChat />
      <PageShell className="bg-slate-50">
      <div className="mx-auto max-w-[1280px] overflow-hidden bg-white shadow-pane-lg sm:my-6 sm:rounded-2xl sm:ring-1 sm:ring-slate-900/6">
        <MikeHeader />
        <MikeProgress celebrate={celebrate} />
        <div ref={queueRef} className="grid scroll-mt-4 grid-cols-[340px_minmax(0,1fr)]">
          <BatchList
            selectedId={selectedId}
            selectedSkuId={selectedSkuId}
            expandedBatchId={expandedBatchId}
            onToggleExpand={(id) => setExpandedBatchId((prev) => (prev === id ? null : id))}
            onSelectBatch={handleSelectBatch}
            onSelectSku={handleSelectSku}
            onApproveAll={handleApproveAll}
          />
          {selectedRow ? (
            <SkuDetailPane
              batch={selected}
              row={selectedRow}
              onBack={() => setSelectedSkuId(null)}
              onApprove={handleApprove}
              onReviewAll={handleReviewAll}
              onSelectSku={(skuId) => handleSelectSku(selected.id, skuId)}
            />
          ) : (
            <BatchDetail batch={selected} onApprove={handleApprove} onReviewAll={handleReviewAll} onSelect={handleSelectBatch} />
          )}
        </div>
        <MikeDelivered />
        {/* Answers go last, so the conversation is the end of the page (same as Claire's and Michelle's). */}
        <ChatThread />
        {/* Demo-only control, kept out of the product chrome, same as Claire's page. */}
        <div className="flex justify-end px-10 pb-24 opacity-50 hover:opacity-100">
          <ResetDemoButton />
        </div>
      </div>
      <AskBar />
      </PageShell>
      </ChatProvider>
    </BackgroundProvider>
  )
}
