"use client"

import { AppDrawer } from "@/components/nudge/app-drawer"
import { PageShell } from "@/components/layout/page-shell"
import { AskBar, ChatProvider, ChatThread } from "@/components/nudge/chat/inline-chat"
import { TopStrip, useViewer } from "@/components/nudge/top-strip"
import { JointPlan } from "@/components/nudge/cs/sarah-parts"
import { ACCOUNT, SARAH } from "@/components/nudge/cs/data"

/** The joint plan, as the customer sees it: read-only, with what changed and why. Sarah edits it on her page. */
export default function PlanPage() {
  const { viewer, home } = useViewer("claire")
  return (
    <ChatProvider thread={{ where: "Joint plan", home }}>
      <PageShell className="bg-slate-50 xl:bg-white">
        <div className="mx-auto max-w-[1080px] overflow-clip bg-white shadow-pane-lg sm:my-6 sm:rounded-2xl sm:ring-1 sm:ring-slate-900/6 xl:my-0 xl:rounded-none xl:shadow-none xl:ring-0">
          <TopStrip person={viewer} home={home} crumbs={[{ label: "Home", href: home }, { label: "Joint plan" }]} />
          <div className="px-10 pt-2 pb-10">
            <h1 className="text-[28px] leading-tight font-bold tracking-tight text-slate-950">Your plan with CommerceIQ</h1>
            <div className="mt-1 mb-6 text-[15px] text-slate-700">
              {ACCOUNT.name} · {ACCOUNT.tier} · {SARAH.name}, retail expert
            </div>
            <JointPlan readOnly customer={viewer === "claire"} />
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
