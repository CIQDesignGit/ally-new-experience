"use client"

import { AppDrawer } from "@/components/nudge/app-drawer"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { AskBar, ChatProvider, ChatThread, useChat, useChatSource } from "@/components/nudge/chat/inline-chat"
import { OPEN_ITEM_EVENT } from "@/components/nudge/chat/open-item"
import type { OpenItemDetail } from "@/components/nudge/chat/open-item"
import { OpsSkuPane } from "@/components/nudge/ops/ops-sku-pane"
import { NoteBar } from "@/components/nudge/ops/note-bar"
import { BusinessHero, BusinessPane, BusinessRail } from "@/components/nudge/ops/business-view"
import { treeFor } from "@/components/nudge/ops/gap-data"
import { cn } from "@/lib/utils"
import { PageShell } from "@/components/layout/page-shell"
import { MichelleHeader } from "@/components/nudge/ops/michelle-header"
import { OpsProgress } from "@/components/nudge/ops/ops-progress"
import { OpsBatchList, inboxRows } from "@/components/nudge/ops/ops-batch-list"
import type { InboxFilter } from "@/components/nudge/ops/ops-batch-list"
import { OpsBatchDetail } from "@/components/nudge/ops/ops-batch-detail"
import { OpsDelivered } from "@/components/nudge/ops/ops-delivered"
import { MICHELLE_QUESTIONS, michelleAnswer } from "@/components/nudge/ask-ally-personas"
import { PromoAnswer, SAVE_ASK, SaveDashboardAnswer } from "@/components/nudge/promo/answers"
import { PROMO_QUESTIONS, PROMO_WIDGETS } from "@/components/nudge/promo/data"
import type { PromoWidget } from "@/components/nudge/promo/data"
import type { Chip } from "@/components/nudge/chat/inline-chat"
import { PREP_CHIP, RUN_BY_NAME_CHIP } from "@/components/nudge/skill/answers"
import { PREP_FILES } from "@/components/nudge/skill/data"
import { GiftSetsAnswer } from "@/components/nudge/alerts/answers"
import { GIFT_QUESTION } from "@/components/nudge/alerts/data"
import { RETRO_TASK, StorylineAnswer } from "@/components/nudge/retro/storyline-answer"
import { ResetDemoButton } from "@/components/nudge/reset-demo-button"
import { opsBatches, opsSkus } from "@/components/nudge/data"
import { useNudge } from "@/components/nudge/nudge-context"
import type { OpsBatch } from "@/components/nudge/data"

/**
 * Michelle's ops queue, laid out like Mike's: where ops stands, what's one
 * approval from live, the inbox grouped by Claire's buckets, the selected batch,
 * then what ops delivered this quarter.
 */
/** The inbox's questions for the Ask Ally bar (gap-to-plan registers its own per node). */
// Use case 3: three promo answers, each offering the others and "save these as a dashboard".
const SAVE_CHIP: Chip = { q: SAVE_ASK, match: /dashboard/i, render: () => <SaveDashboardAnswer /> }
const PROMO_CHIPS = Object.fromEntries(PROMO_WIDGETS.map((w) => [w, { q: PROMO_QUESTIONS[w], render: () => <PromoAnswer id={w} /> } as Chip])) as Record<PromoWidget, Chip>
PROMO_CHIPS["promo-month"].match = /promo(tion)?s?.*(doing|perform|month)/i
PROMO_CHIPS["promo-badge"].match = /badge/i
PROMO_CHIPS["promo-vs-brightwick"].match = /(compare|vs|versus).*brightwick|brightwick.*promo/i
PROMO_CHIPS["promo-month"].followUps = [PROMO_CHIPS["promo-badge"], PROMO_CHIPS["promo-vs-brightwick"], SAVE_CHIP]
PROMO_CHIPS["promo-badge"].followUps = [PROMO_CHIPS["promo-vs-brightwick"], PROMO_CHIPS["promo-month"], SAVE_CHIP]
PROMO_CHIPS["promo-vs-brightwick"].followUps = [PROMO_CHIPS["promo-badge"], PROMO_CHIPS["promo-month"], SAVE_CHIP]

function InboxChat() {
  const { ask } = useChat()
  // A dashboard widget's "Ask about this" lands here with its question asked again.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("ask") as PromoWidget | null
    if (!id || !PROMO_CHIPS[id]) return
    window.history.replaceState(null, "", "/michelle")
    // Not cancelled on cleanup: the dev double-run's second pass finds no ?ask and does nothing.
    window.setTimeout(() => ask(PROMO_CHIPS[id]), 300)
    // Once, on arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useChatSource(
    {
      chips: [
        PROMO_CHIPS["promo-month"],
        { q: GIFT_QUESTION, match: /gift.?sets?/i, render: () => <GiftSetsAnswer /> },
        // Run-by-name first: "open my negotiation prep" means the saved skill, not a new prep.
        RUN_BY_NAME_CHIP,
        PREP_CHIP,
        ...MICHELLE_QUESTIONS.map((q) => ({ q, render: () => <div className="max-w-[860px] rounded-2xl bg-white px-5 py-4 text-[15px] leading-relaxed text-slate-700 ring-1 ring-slate-200">{michelleAnswer(q)}</div> })),
        // A task, not a question about the brief: it opens its own conversation.
        { q: RETRO_TASK, task: "/michelle/retro?new=1", render: () => <StorylineAnswer /> },
        { q: "Claire's Q4 business review", task: "/michelle/decks/qbr?new=1", match: /\b(qbr|business review)\b/i, render: () => null },
      ],
      files: PREP_FILES,
    },
    "inbox",
  )
  return null
}

export default function MichellePage() {
  return (
    <ChatProvider>
      <Michelle />
    </ChatProvider>
  )
}

function Michelle() {
  const { clear } = useChat()
  const { approve, approved, policy, businessGroup, note, addToNote } = useNudge()
  // The Business view's hierarchy in the customer's order; the pane starts on the whole of Amazon.
  const tree = treeFor(businessGroup)
  const [nodeId, setNodeId] = useState("overall")
  // Business: the quarterback view (where you stand, why, is the work moving). Ops: the queue of fixes.
  const [view, setView] = useState<"business" | "ops">("ops")
  const OPS_BATCHES = opsBatches(policy)
  // Open on the top of the inbox: the most valuable item one approval away.
  const [selectedId, setSelectedId] = useState<OpsBatch["id"]>(() => [...OPS_BATCHES].filter((b) => b.tier === "approval").sort((x, y) => y.approveValue - x.approveValue)[0].id)
  const [celebrate, setCelebrate] = useState<{ value: number; label: string } | null>(null)
  // The inbox filter; the waterfall's bars set it too.
  const [filter, setFilter] = useState<InboxFilter>("all")

  const selected = OPS_BATCHES.find((b) => b.id === selectedId) ?? OPS_BATCHES[0]
  // Same model as Mike's page: a SKU open side by side, its issue's list open in the rail.
  const [selectedSku, setSelectedSku] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  // Reviewed = in the note to the vendor manager (sent or not), per issue.
  const checked: Record<string, Record<string, boolean>> = {}
  for (const i of note) checked[i.batchId] = { ...(checked[i.batchId] ?? {}), [i.asin]: true }
  const queueRef = useRef<HTMLDivElement>(null)

  function scrollToQueue() {
    window.setTimeout(() => {
      // Clear of the pinned note bar, so the pane's header isn't under it.
      const pinned = [...document.querySelectorAll<HTMLElement>("[data-sticky-top]")].reduce((m, e) => Math.max(m, e.offsetHeight), 0)
      const top = queueRef.current ? queueRef.current.getBoundingClientRect().top + window.scrollY - pinned : 0
      window.scrollTo({ top, behavior: "smooth" })
      window.setTimeout(() => {
        if (Math.abs(window.scrollY - top) > 4) window.scrollTo({ top })
      }, 600)
    }, 50)
  }

  /** A filter (or its waterfall bar) shows that slice and opens its top row. */
  function pickFilter(f: InboxFilter, scroll = false) {
    setFilter(f)
    const rows = inboxRows(OPS_BATCHES, approved, f)
    if (!rows.some((b) => b.id === selectedId) && rows[0]) selectBatch(rows[0].id)
    if (scroll) scrollToQueue()
  }

  function selectBatch(id: string) {
    setSelectedId(id)
    setSelectedSku(null)
  }

  /** "Review N SKUs": the first SKU side by side, the list open on the left. */
  function reviewAll(batch: OpsBatch) {
    const first = opsSkus(batch)[0]
    setSelectedId(batch.id)
    setSelectedSku(first?.asin ?? null)
    setExpandedId(batch.id)
    scrollToQueue()
  }

  // An Ask Ally answer's next step ("Review the 4 hero SKUs") opens that issue here.
  useEffect(() => {
    const onOpen = (e: Event) => {
      const { batch, review } = (e as CustomEvent<OpenItemDetail>).detail
      const b = OPS_BATCHES.find((x) => x.id === batch) ?? OPS_BATCHES.find((x) => x.id.startsWith(batch))
      if (!b) return
      setView("ops")
      if (review) reviewAll(b)
      else openOps(b.id)
    }
    window.addEventListener(OPEN_ITEM_EVENT, onOpen)
    return () => window.removeEventListener(OPEN_ITEM_EVENT, onOpen)
  })

  /** A drafted fix opens in the Ops view, on the SKU when it's one of the issue's. */
  function openOps(batchId: string, asin?: string) {
    const b = OPS_BATCHES.find((x) => x.id === batchId) ?? OPS_BATCHES.find((x) => batchId.startsWith(x.id))
    if (!b) return
    setView("ops")
    setSelectedId(b.id)
    const onIt = !!asin && opsSkus(b).some((s) => s.asin === asin)
    setSelectedSku(onIt ? asin! : null)
    if (onIt) setExpandedId(b.id)
    scrollToQueue()
  }

  function check(asin: string) {
    const skus = opsSkus(selected)
    addToNote(selected.id, [asin])
    const next = skus[skus.findIndex((s) => s.asin === asin) + 1]
    if (next) setSelectedSku(next.asin)
  }

  function celebrateFor(batches: OpsBatch[]) {
    const one = batches.length === 1 ? batches[0] : null
    const label = one?.tier === "input" ? `${one.skus} ${one.inputNoun}` : `${batches.reduce((s, b) => s + b.skus, 0)} SKUs`
    celebrateWith({ value: batches.reduce((s, b) => s + b.approveValue, 0), label })
  }

  function celebrateWith(c: { value: number; label: string }) {
    setCelebrate(c)
    window.setTimeout(() => setCelebrate(null), 2200)
  }

  function handleAction(batch: OpsBatch) {
    approve(batch.id)
    showProgress()
    celebrateFor([batch])
    if (batch.email) toast.success(`Sent to ${batch.email.to}, ${batch.email.role} · evidence attached`, { position: "top-right" })
  }


  return (
    <PageShell className="bg-slate-50 xl:bg-white">
      <div className="mx-auto max-w-[1280px] overflow-clip bg-white shadow-pane-lg sm:my-6 sm:rounded-2xl sm:ring-1 sm:ring-slate-900/6 xl:my-0 xl:rounded-none xl:shadow-none xl:ring-0">
        <MichelleHeader
          viewSwitch={
            <div className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-slate-25 p-0.5">
              {(
                [
                  ["business", "Business"],
                  ["ops", "Ops"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    // Each view starts its own conversation.
                    clear()
                    setView(id)
                  }}
                  aria-pressed={view === id}
                  className={cn(
                    "h-full rounded-md px-3 text-sm font-medium transition-colors",
                    view === id ? "bg-white text-slate-950 shadow-xs ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-800",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          }
        />
        {view === "business" ? (
          <>
            <BusinessHero />
            <div className="grid grid-cols-[340px_minmax(0,1fr)] border-t border-slate-200">
              <div className="border-r border-slate-200 bg-white">
                <BusinessRail root={tree} selected={nodeId} onSelect={setNodeId} />
              </div>
              <BusinessPane root={tree} nodeId={nodeId} onSelect={setNodeId} onOpenOps={openOps} />
            </div>
          </>
        ) : (
          <>
        <OpsProgress celebrate={celebrate} stage={filter === "all" ? undefined : filter} onStage={(st) => pickFilter(st, true)} />
        <NoteBar
          onSent={(c) => {
            celebrateWith(c)
            showProgress()
          }}
        />
        <div ref={queueRef} className="grid grid-cols-[340px_minmax(0,1fr)]">
          <div className="border-r border-slate-200 bg-white">
            <OpsBatchList
              selectedId={selectedId}
              selectedSku={selectedSku}
              expandedId={expandedId}
              checked={checked}
              filter={filter}
              onFilter={(f) => pickFilter(f)}
              onToggleExpand={(id) => setExpandedId((e) => (e === id ? null : id))}
              onSelect={selectBatch}
              onSelectSku={(batchId, asin) => {
                setSelectedId(batchId)
                setSelectedSku(asin)
              }}
            />
          </div>
          {selectedSku ? (
            <OpsSkuPane batch={selected} asin={selectedSku} checked={checked[selected.id] ?? {}} onBack={() => setSelectedSku(null)} onCheck={check} onSend={handleAction} />
          ) : (
            <OpsBatchDetail batch={selected} onAction={handleAction} onReviewAll={reviewAll} />
          )}
        </div>
        <InboxChat />
          </>
        )}
        <OpsDelivered />
        {/* Page-level answers go last, so the conversation is the end of the page. Business-view answers sit under the pane they're about. */}
        <ChatThread />
        {/* Demo-only control, kept out of the product chrome. Room below for the floating Ask Ally bar. */}
        <div className="flex justify-end px-10 pb-24 opacity-50 hover:opacity-100">
          <ResetDemoButton />
        </div>
      </div>
      <AppDrawer />
      <AskBar />
    </PageShell>
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
