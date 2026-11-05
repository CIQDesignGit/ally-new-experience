"use client"

import { AppDrawer } from "@/components/nudge/app-drawer"
import { PageShell } from "@/components/layout/page-shell"
import { PageFrame } from "@/components/layout/page-frame"
import { AskBar, ChatProvider, ChatThread } from "@/components/nudge/chat/inline-chat"
import { TopStrip, useViewer } from "@/components/nudge/top-strip"
import { AeoReport } from "@/components/nudge/cs/aeo-report"

/** The AI visibility report on its own page: the same report Ally gives in chat, linked from the joint plan. */
export default function AiVisibilityPage() {
  const { viewer, home } = useViewer("sarah")
  return (
    <ChatProvider thread={{ where: "AI visibility", home }}>
      <PageShell className="bg-slate-50">
        <PageFrame className="max-w-[1080px]">
          <TopStrip person={viewer} home={home} crumbs={[{ label: viewer === "sarah" ? "Today" : "Home", href: home }, { label: "AI visibility" }]} />
          <div className="mt-2">
            <AeoReport className="max-w-none shadow-xs" />
          </div>
          <ChatThread />
        </PageFrame>
        <AppDrawer />
        <AskBar />
      </PageShell>
    </ChatProvider>
  )
}
