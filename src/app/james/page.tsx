"use client"

import { DetailCard } from "@/components/nudge/ui/detail-card"
import { useRef, useState } from "react"
import { AppDrawer } from "@/components/nudge/app-drawer"
import { PageShell } from "@/components/layout/page-shell"
import { AskBar, ChatProvider, ChatThread, useChatSource } from "@/components/nudge/chat/inline-chat"
import { ResetDemoButton } from "@/components/nudge/reset-demo-button"
import { useNudge } from "@/components/nudge/nudge-context"
import type { InboxFilter } from "@/components/nudge/ops/ops-batch-list"
import { MEDIA_BATCHES } from "@/components/nudge/media/data"
import type { MediaBatch } from "@/components/nudge/media/data"
import { JAMES_CHIPS } from "@/components/nudge/media/answers"
import { JamesHeader, LedgerSection, MediaDelivered, MediaDetail, MediaList, MediaProgress, PacingSection, approvedToast, mediaRows } from "@/components/nudge/media/james-parts"

/**
 * James's media queue, laid out like Michelle's: where media stands, the plays by
 * Claire's buckets, the selected play, then pacing by category, the keywords
 * content and media share, and what media delivered.
 */
function JamesChat() {
  useChatSource({ chips: JAMES_CHIPS }, "james")
  return null
}

export default function JamesPage() {
  return (
    <ChatProvider thread={{ where: "Daily brief", home: "/james" }}>
      <James />
    </ChatProvider>
  )
}

function James() {
  const { approve, approved } = useNudge()
  const [filter, setFilter] = useState<InboxFilter>("all")
  const [selectedId, setSelectedId] = useState(() => mediaRows(approved, "all")[0].id)
  const [celebrate, setCelebrate] = useState<{ value: number; label: string } | null>(null)
  const queueRef = useRef<HTMLDivElement>(null)
  const selected = MEDIA_BATCHES.find((b) => b.id === selectedId) ?? MEDIA_BATCHES[0]

  function pickFilter(f: InboxFilter, scroll = false) {
    setFilter(f)
    const rows = mediaRows(approved, f)
    if (!rows.some((b) => b.id === selectedId) && rows[0]) setSelectedId(rows[0].id)
    if (scroll) queueRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  function act(b: MediaBatch) {
    approve(b.id)
    approvedToast(b)
    setCelebrate({ value: b.value, label: `${b.count} ${b.noun}` })
    window.setTimeout(() => setCelebrate(null), 2200)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <PageShell className="bg-slate-50 xl:bg-white">
      <div className="mx-auto max-w-[1280px] overflow-clip bg-white shadow-pane-lg sm:my-6 sm:rounded-2xl sm:ring-1 sm:ring-slate-900/6 xl:my-0 xl:rounded-none xl:shadow-none xl:ring-0">
        <JamesHeader />
        <MediaProgress celebrate={celebrate} stage={filter === "all" ? undefined : filter} onStage={(st) => pickFilter(st, true)} />
        <div ref={queueRef} className="grid grid-cols-1 lg:grid-cols-[400px_minmax(0,1fr)]">
          <div className="border-b border-slate-200 bg-white lg:border-r lg:border-b-0">
            <MediaList selectedId={selectedId} filter={filter} onFilter={(f) => pickFilter(f)} onSelect={setSelectedId} />
          </div>
          <DetailCard>
            <MediaDetail batch={selected} onAction={act} />
          </DetailCard>
        </div>
        <JamesChat />
        <PacingSection />
        <LedgerSection />
        <MediaDelivered />
        <ChatThread />
        <div className="flex justify-end px-10 pb-24 opacity-50 hover:opacity-100">
          <ResetDemoButton />
        </div>
      </div>
      <AppDrawer />
      <AskBar />
    </PageShell>
  )
}
