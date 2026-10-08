"use client"

import { DetailCard } from "@/components/nudge/ui/detail-card"
import { LAUNCH_CHIP } from "@/components/nudge/launch/answers"
import { LAUNCH_FILES } from "@/components/nudge/launch/data"
import { useEffect, useRef, useState } from "react"
import { AppDrawer } from "@/components/nudge/app-drawer"
import { PageShell } from "@/components/layout/page-shell"
import { ResetDemoButton } from "@/components/nudge/reset-demo-button"
import { AskBar, ChatProvider, ChatThread, useChatSource } from "@/components/nudge/chat/inline-chat"
import { OPEN_ITEM_EVENT } from "@/components/nudge/chat/open-item"
import type { OpenItemDetail } from "@/components/nudge/chat/open-item"
import { MIKE_QUESTIONS, mikeAnswer } from "@/components/nudge/ask-ally-personas"
import { MikeHeader } from "@/components/nudge/mike/mike-header"
import { MikeDelivered } from "@/components/nudge/mike/mike-delivered"
import { MikeProgress } from "@/components/nudge/mike/mike-progress"
import { BatchList, mikeRows } from "@/components/nudge/mike/batch-list"
import type { InboxFilter } from "@/components/nudge/ops/ops-batch-list"
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
      chips: [LAUNCH_CHIP, ...MIKE_QUESTIONS.map((q, i) => ({ q, hidden: i === 3, match: i === 2 ? /how am i doing|how('s| is| did).*(quarter|content)/i : undefined, render: () => <div className="max-w-[860px] rounded-2xl bg-white px-5 py-4 text-[15px] leading-relaxed text-slate-700 ring-1 ring-slate-200">{mikeAnswer(q)}</div> }))],
      files: LAUNCH_FILES,
    },
    "mike",
  )
  return null
}

export default function MikePage() {
  const { approve, approved, policy, launchReady } = useNudge()
  const batches = contentBatches(policy, launchedIds(approved), launchReady)
  // Open on the top of the inbox (same order as the list).
  const [selectedId, setSelectedId] = useState<Batch["id"]>(() => mikeRows(batches, approved, "all")[0]?.id ?? batches[0].id)
  // The inbox filter; the waterfall's bars set it too.
  const [filter, setFilter] = useState<InboxFilter>("all")
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
        // And the item itself, wherever it sits in the rail.
        window.setTimeout(() => document.querySelector(`[data-batch="${pick.id}"]`)?.scrollIntoView({ block: "nearest" }), 80)
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
    showProgress()
    setCelebrate({ value: batch.approveValue, skus: batch.approveSkus })
    window.setTimeout(() => setCelebrate(null), 2200)
  }

  /** A filter (or its waterfall bar) shows that slice and opens its top row. */
  function pickFilter(f: InboxFilter, scroll = false) {
    setFilter(f)
    const rows = mikeRows(batches, approved, f)
    if (!rows.some((b) => b.id === selectedId) && rows[0]) handleSelectBatch(rows[0].id)
    if (scroll)
      window.setTimeout(() => {
        const pinned = [...document.querySelectorAll<HTMLElement>("[data-sticky-top]")].reduce((m, e) => Math.max(m, e.offsetHeight), 0)
        const top = queueRef.current ? queueRef.current.getBoundingClientRect().top + window.scrollY - pinned : 0
        window.scrollTo({ top, behavior: "smooth" })
        // Some embedded browsers ignore smooth scrolling: land there anyway.
        window.setTimeout(() => {
          if (Math.abs(window.scrollY - top) > 4) window.scrollTo({ top })
        }, 600)
      }, 50)
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
      <ChatProvider thread={{ where: "Daily brief", home: "/mike" }}>
      <MikeChat />
      <PageShell className="bg-slate-50 xl:bg-white">
      <div className="mx-auto max-w-[1280px] overflow-hidden bg-white shadow-pane-lg sm:my-6 sm:rounded-2xl sm:ring-1 sm:ring-slate-900/6 xl:my-0 xl:rounded-none xl:shadow-none xl:ring-0">
        <MikeHeader />
        <MikeProgress celebrate={celebrate} stage={filter === "all" ? undefined : filter} onStage={(st) => pickFilter(st, true)} />
        <div ref={queueRef} className="grid scroll-mt-4 grid-cols-1 lg:grid-cols-[400px_minmax(0,1fr)]">
          <BatchList
            selectedId={selectedId}
            selectedSkuId={selectedSkuId}
            expandedBatchId={expandedBatchId}
            filter={filter}
            onFilter={(f) => pickFilter(f)}
            onToggleExpand={(id) => setExpandedBatchId((prev) => (prev === id ? null : id))}
            onSelectBatch={handleSelectBatch}
            onSelectSku={handleSelectSku}
          />
          <DetailCard>
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
            <BatchDetail batch={selected} onApprove={handleApprove} onReviewAll={handleReviewAll} onSelect={handleSelectBatch} onSelectSku={handleSelectSku} />
          )}
          </DetailCard>
        </div>
        <MikeDelivered />
        {/* Answers go last, so the conversation is the end of the page (same as Claire's and Michelle's). */}
        <ChatThread />
        {/* Demo-only control, kept out of the product chrome, same as Claire's page. */}
        <div className="flex justify-end px-10 pb-24 opacity-50 hover:opacity-100">
          <ResetDemoButton />
        </div>
      </div>
      <AppDrawer home="/mike" />
      <AskBar />
      </PageShell>
      </ChatProvider>
    </BackgroundProvider>
  )
}

/** After an approval, scroll up to the progress bar so the move (and the celebration) is seen. */
function showProgress() {
  window.scrollTo({ top: 0, behavior: "smooth" })
  // Some embedded browsers ignore smooth scrolling: land there anyway.
  window.setTimeout(() => {
    if (window.scrollY > 4) window.scrollTo({ top: 0 })
  }, 700)
}
