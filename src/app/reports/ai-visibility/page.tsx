"use client"

import { AppDrawer } from "@/components/nudge/app-drawer"
import { PageShell } from "@/components/layout/page-shell"
import { AskBar, ChatProvider, ChatThread } from "@/components/nudge/chat/inline-chat"
import { TopStrip, useViewer } from "@/components/nudge/top-strip"
import { AeoReport } from "@/components/nudge/cs/aeo-report"

/** The AI visibility report on its own page: the same report Ally gives in chat, linked from the joint plan. */
export default function AiVisibilityPage() {
  const { viewer, home } = useViewer("sarah")
  return (
    <ChatProvider thread={{ where: "AI visibility", home }}>
      <PageShell className="bg-slate-50">
        <div className="mx-auto max-w-[1080px] bg-white px-10 pt-2 pb-24 shadow-pane-lg sm:my-6 sm:rounded-2xl sm:ring-1 sm:ring-slate-900/6">
          <TopStrip person={viewer} home={home} className="px-0" crumbs={[{ label: viewer === "sarah" ? "Today" : "Home", href: home }, { label: "AI visibility" }]} />
          <div className="mt-2">
            <AeoReport />
          </div>
          <ChatThread />
        </div>
        <AppDrawer />
        <AskBar />
      </PageShell>
    </ChatProvider>
  )
}
