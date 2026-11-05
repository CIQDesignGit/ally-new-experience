"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AppDrawer } from "@/components/nudge/app-drawer"
import { AskBar, ChatProvider, ChatThread, useChatSource } from "@/components/nudge/chat/inline-chat"
import { LESSON_CHIP } from "@/components/nudge/ops/gap-training"
import { PageShell } from "@/components/layout/page-shell"
import { MichelleHeader } from "@/components/nudge/ops/michelle-header"
import { BusinessHero, BusinessPane, BusinessRail } from "@/components/nudge/ops/business-view"
import { retailerTree } from "@/components/nudge/ops/gap-retailers"
import { useNudge } from "@/components/nudge/nudge-context"
import { useHarness } from "@/components/competition/harness"

/** Page-level Ask Ally: teaching in plain language works here too (not in the borrow harness, where an engineer changes skills). */
function GapChat() {
  const borrow = useHarness() === "borrow"
  useChatSource({ chips: borrow ? [] : [LESSON_CHIP] }, `gap-${borrow}`)
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
  const { businessGroup, retailer } = useNudge()
  const tree = retailerTree(businessGroup, retailer)
  const [nodeId, setNodeId] = useState("overall")
  return (
    <ChatProvider thread={{ where: "Gap to plan", home: "/michelle" }}>
      <GapChat />
      <PageShell className="bg-slate-50">
        <div className="mx-auto max-w-[1280px] overflow-clip bg-white shadow-pane-lg sm:my-6 sm:rounded-2xl sm:ring-1 sm:ring-slate-900/6">
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
