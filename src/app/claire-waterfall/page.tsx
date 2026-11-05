"use client"

import { useEffect, useState } from "react"
import { AppDrawer } from "@/components/nudge/app-drawer"
import { PageShell } from "@/components/layout/page-shell"
import { PageFrame, Widget, WidgetStack } from "@/components/layout/page-frame"
import { ResetDemoButton } from "@/components/nudge/reset-demo-button"
import { DemoControls } from "@/components/nudge/claire/demo-controls"
import { BusinessHero } from "@/components/nudge/claire/business-hero"
import { WaterfallChart } from "@/components/nudge/waterfall/waterfall-chart"
import type { WaterfallSelection } from "@/components/nudge/waterfall/waterfall-chart"
import { AreaDetail } from "@/components/nudge/waterfall/area-detail"
import { StageDetail } from "@/components/nudge/waterfall/stage-detail"
import { ThisQuarterSection } from "@/components/nudge/claire/this-quarter-section"
import { ReportsReady } from "@/components/nudge/retro/reports-ready"
import { GrowCards } from "@/components/nudge/market/grow-cards"
import type { GrowView } from "@/components/nudge/market/grow-cards"
import { GrowViewSwitch } from "@/components/nudge/market/views"
import { AskBar, ChatProvider, ChatThread, useChat } from "@/components/nudge/chat/inline-chat"
import { ClaireChat } from "@/components/nudge/chat/home-chats"
import { useLive } from "@/components/nudge/live-model"
import { useNudge } from "@/components/nudge/nudge-context"

/** Module scope survives moves between pages, not a reload: so only a fresh load of this page resets the demo. */
let resetThisLoad = false

/**
 * Alternate view of the same buckets as /claire, rendered as a bridge to plan
 * (on pace → open buckets → with Ally, against the plan line). Clicking a stage
 * opens its line items; clicking "Total opportunity" opens the split by area. Same
 * shared nudge state as the tier version.
 */
export default function ClaireWaterfallPage() {
  return (
    <ChatProvider thread={{ where: "Daily brief", home: "/claire-waterfall" }}>
      <ClaireWaterfall />
    </ChatProvider>
  )
}

function ClaireWaterfall() {
  const { clear } = useChat()
  const [selectedId, setSelectedId] = useState<WaterfallSelection>("approval")
  // A "Grow beyond plan" view opens over the page; Back returns to the same spot.
  const [grow, setGrow] = useState<GrowView | null>(null)
  const [homeScroll, setHomeScroll] = useState(0)
  // Each screen starts its own conversation.
  function openGrow(v: GrowView) {
    clear()
    setHomeScroll(window.scrollY)
    setGrow(v)
    window.scrollTo({ top: 0 })
  }
  function closeGrow() {
    clear()
    setGrow(null)
    window.setTimeout(() => window.scrollTo({ top: homeScroll }), 0)
  }

  const { stages } = useLive()
  const { resetDemo } = useNudge()

  // Opening or reloading Claire's page starts the demo over (nudges, approvals, policy).
  // Coming back from Mike's or Michelle's page keeps the story moving.
  useEffect(() => {
    if (resetThisLoad) return
    resetThisLoad = true
    resetDemo()
  }, [resetDemo])
  const selected = stages.find((s) => s.id === selectedId) ?? stages[0]

  // A link from Ally's email (?stage=team) opens on that bucket, its Nudge buttons in view.
  useEffect(() => {
    const want = new URLSearchParams(window.location.search).get("stage") as WaterfallSelection | null
    if (!want || !["autopilot", "approval", "team", "total"].includes(want)) return
    const t = window.setTimeout(() => {
      setSelectedId(want)
      window.setTimeout(() => document.getElementById("stage-detail")?.scrollIntoView({ block: "start" }), 50)
    }, 0)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <PageShell className="bg-slate-50">
      <PageFrame>
        {/* A view shows where you are instead of the greeting; "Home" is the way back. */}
        <BusinessHero
          topLineOnly={!!grow}
          crumbs={grow ? [{ label: "Home", onClick: closeGrow }, { label: grow === "market" ? "Market" : grow === "competition" ? "Competition" : "Event readiness" }] : undefined}
        />
        {grow ? (
          <>
            <Widget>
              <GrowViewSwitch view={grow} onBack={closeGrow} />
            </Widget>
            <ChatThread />
          </>
        ) : (
          <>
            <WidgetStack>
              <Widget>
                <div className="px-10 pt-8 pb-3">
                  <div className="font-mono text-xs tracking-wide text-slate-500 uppercase">Where it sits today</div>
                </div>
                <div className="px-10 pb-10">
                  <WaterfallChart selectedId={selectedId} onSelect={setSelectedId} />
                  <div id="stage-detail" className="scroll-mt-4">
                    {selectedId === "total" ? <AreaDetail /> : <StageDetail stage={selected} />}
                  </div>
                </div>
              </Widget>
              <ReportsReady />
              <Widget>
                <ThisQuarterSection />
              </Widget>
              <GrowCards onOpen={openGrow} />
            </WidgetStack>
            <ClaireChat />
            <ChatThread />
            {/* Demo-only control, kept out of the product chrome. */}
            <div className="flex justify-end gap-6 px-4 pt-6 sm:px-0">
              <DemoControls />
              <ResetDemoButton />
            </div>
          </>
        )}
      </PageFrame>
      <AppDrawer home="/claire-waterfall" />
      <AskBar />
    </PageShell>
  )
}
