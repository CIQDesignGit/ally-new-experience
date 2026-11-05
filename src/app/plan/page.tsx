"use client"

import { AppDrawer } from "@/components/nudge/app-drawer"
import { PageShell } from "@/components/layout/page-shell"
import { PageFrame } from "@/components/layout/page-frame"
import { PageHeader } from "@/components/layout/page-header"
import { AskBar, ChatProvider, ChatThread } from "@/components/nudge/chat/inline-chat"
import { TopStrip, useViewer } from "@/components/nudge/top-strip"
import { JointPlan } from "@/components/nudge/cs/sarah-parts"
import { ACCOUNT } from "@/components/nudge/cs/data"

/** The joint plan, as the customer sees it: read-only, with what changed and why. Sarah edits it on her page. */
export default function PlanPage() {
  const { viewer, home } = useViewer("claire")
  return (
    <ChatProvider thread={{ where: "Joint plan", home }}>
      <PageShell className="bg-slate-50">
        <PageFrame className="max-w-[1080px]">
          <TopStrip person={viewer} home={home} crumbs={[{ label: viewer === "sarah" ? "Today" : "Home", href: home }, { label: "Joint plan" }]} />
          <PageHeader
            eyebrow={`${ACCOUNT.name} · ${ACCOUNT.tier} · Agreed with ${ACCOUNT.contact}, Jan 12`}
            title={viewer === "sarah" ? `Joint plan with ${ACCOUNT.name}` : "Your plan with CommerceIQ"}
          />
          {/* Sarah edits the plan here; everyone else reads it. */}
          <JointPlan readOnly={viewer !== "sarah"} customer={viewer === "claire"} />
          <ChatThread />
        </PageFrame>
        <AppDrawer />
        <AskBar />
      </PageShell>
    </ChatProvider>
  )
}
