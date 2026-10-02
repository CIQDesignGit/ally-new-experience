"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AppDrawer } from "@/components/nudge/app-drawer"
import { AskBar, ChatProvider, ChatThread, useChatSource } from "@/components/nudge/chat/inline-chat"
import { LESSON_CHIP } from "@/components/nudge/ops/gap-training"
import { PageShell } from "@/components/layout/page-shell"
import { MichelleHeader } from "@/components/nudge/ops/michelle-header"
import { BusinessHero, BusinessPane, BusinessRail } from "@/components/nudge/ops/business-view"
import { treeFor } from "@/components/nudge/ops/gap-data"
import { useNudge } from "@/components/nudge/nudge-context"

/** Page-level Ask Ally: teaching in plain language works here too. */
function GapChat() {
  useChatSource({ chips: [LESSON_CHIP] }, "gap")
  return null
}

/**
 * Gap to plan, its own page: where Amazon will land against plan, by brand and
 * category, why, and the work in flight to close it. Reached from the left
 * navigation, the "Gap to plan" number in the top strip, or Ask Ally. A fix
 * opens on Michelle's queue.
 */
export default function GapToPlanPage() {
  const router = useRouter()
  const { businessGroup } = useNudge()
  const tree = treeFor(businessGroup)
  const [nodeId, setNodeId] = useState("overall")
  return (
    <ChatProvider>
      <GapChat />
      <PageShell className="bg-slate-50 xl:bg-white">
        <div className="mx-auto max-w-[1280px] overflow-clip bg-white shadow-pane-lg sm:my-6 sm:rounded-2xl sm:ring-1 sm:ring-slate-900/6 xl:my-0 xl:rounded-none xl:shadow-none xl:ring-0">
          <MichelleHeader />
          <BusinessHero />
          <div className="grid grid-cols-[340px_minmax(0,1fr)] border-t border-slate-200">
            <div className="border-r border-slate-200 bg-white">
              <BusinessRail root={tree} selected={nodeId} onSelect={setNodeId} />
            </div>
            <BusinessPane root={tree} nodeId={nodeId} onSelect={setNodeId} onOpenOps={(batch, asin) => router.push(`/michelle?open=${batch}${asin ? `&asin=${asin}` : ""}`)} />
          </div>
          <ChatThread />
          <div className="pb-24" />
        </div>
        <AppDrawer />
        <AskBar />
      </PageShell>
    </ChatProvider>
  )
}
