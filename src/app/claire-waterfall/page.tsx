"use client"

import { useEffect, useState } from "react"
import { AppDrawer } from "@/components/nudge/app-drawer"
import { PageShell } from "@/components/layout/page-shell"
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
import { Answer, QUESTIONS } from "@/components/nudge/claire/ask-ally-answers"
import { budgetChip, togetherChip } from "@/components/nudge/media/answers"
import { aeoChip } from "@/components/nudge/cs/aeo-report"
import { launchStatusChip } from "@/components/nudge/launch/status"
import { AskBar, ChatProvider, ChatThread, useChat, useChatSource } from "@/components/nudge/chat/inline-chat"
import type { Chip } from "@/components/nudge/chat/inline-chat"
import { useRouter } from "next/navigation"
import { ForwardAnalysis } from "@/components/nudge/ops/gap-view"
import { GAP_TREE } from "@/components/nudge/ops/gap-data"
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
/** The home page's questions for the Ask Ally bar (the views register their own). */
function HomeChat() {
  // Four starters; "why is content behind" and "email this summary" still answer when typed.
  const router = useRouter()
  // "How am I doing compared to plan?" is forward-looking: where the week lands and what closes it.
  const planChip: Chip = { q: "How am I doing compared to plan?", match: /\b(make|making|against|compared to|vs\.?|versus|behind|short of|gap to) plan\b/i, render: () => <ForwardAnalysis node={GAP_TREE} onInbox={(id) => router.push(`/michelle?open=${id}`)} /> }
  const chips: Chip[] = [
    ...QUESTIONS.map((q, i) => (i === 4 ? planChip : i === 0 ? { ...budgetChip("claire"), q } : { q, hidden: i === 2 || i === 5, render: () => <div className="max-w-[860px] rounded-2xl bg-white px-5 py-4 text-[15px] leading-relaxed text-slate-700 ring-1 ring-slate-200"><Answer q={q} /></div> })),
    // The monthly AI visibility readout: answered when asked, not one of the four starters.
    { ...aeoChip, hidden: true },
    { ...togetherChip, hidden: true },
    launchStatusChip("claire"),
  ]
  useChatSource({ chips }, "home")
  // A question reopened from Ask Ally's history ("?ask=…") is asked again, once.
  const { ask } = useChat()
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("ask")
    const chip = q && chips.find((c) => c.q === q)
    if (!chip) return
    window.history.replaceState(null, "", window.location.pathname)
    const t = window.setTimeout(() => ask(chip), 400)
    return () => window.clearTimeout(t)
    // Once, on arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}

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
    <PageShell className="bg-slate-50 xl:bg-white">
      {/* overflow-clip (not hidden) keeps rounded corners without breaking the sticky Ally panel in a view. */}
      <div className="mx-auto max-w-[1280px] overflow-clip bg-white shadow-pane-lg sm:my-6 sm:rounded-2xl sm:ring-1 sm:ring-slate-900/6 xl:my-0 xl:rounded-none xl:shadow-none xl:ring-0">
        {/* A view shows where you are instead of the greeting; "Home" is the way back. */}
        <BusinessHero
          topLineOnly={!!grow}
          crumbs={grow ? [{ label: "Home", onClick: closeGrow }, { label: grow === "market" ? "Market" : grow === "competition" ? "Competition" : "Event readiness" }] : undefined}
        />
        {grow ? (
          <>
            <GrowViewSwitch view={grow} onBack={closeGrow} />
            <ChatThread />
            <div className="pb-28" />
          </>
        ) : (
          <>
            <div className="px-12 pt-1 pb-3">
              <div className="font-mono text-xs tracking-wide text-slate-500 uppercase">Where it sits today</div>
            </div>

            <div className="px-12 pb-2">
              <WaterfallChart selectedId={selectedId} onSelect={setSelectedId} />
              <div id="stage-detail" className="scroll-mt-4">
                {selectedId === "total" ? <AreaDetail /> : <StageDetail stage={selected} />}
              </div>
            </div>

            <ReportsReady />
            <ThisQuarterSection />
            <GrowCards onOpen={openGrow} />
            <HomeChat />
            <ChatThread />
            {/* Demo-only control, kept out of the product chrome. Room below for the floating Ask Ally bar. */}
            <div className="flex justify-end gap-6 px-12 pt-6 pb-24">
              <DemoControls />
              <ResetDemoButton />
            </div>
          </>
        )}
      </div>
      <AppDrawer home="/claire-waterfall" />
      <AskBar />
    </PageShell>
  )
}
