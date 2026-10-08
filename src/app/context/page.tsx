"use client"

import { AppDrawer } from "@/components/nudge/app-drawer"
import { PageShell } from "@/components/layout/page-shell"
import { AskBar, ChatProvider, ChatThread } from "@/components/nudge/chat/inline-chat"
import { TopStrip, useViewer } from "@/components/nudge/top-strip"
import { ContextView } from "@/components/nudge/cs/context-view"

/** Aurelle's context, shared: Sarah's working view, and what Claire's team sees. */
export default function ContextPage() {
  const { viewer, home } = useViewer("sarah")
  return (
    <ChatProvider thread={{ where: "Context", home }}>
      <PageShell className="bg-slate-50 xl:bg-white">
        <div className="mx-auto max-w-[1280px] overflow-clip bg-white shadow-pane-lg sm:my-6 sm:rounded-2xl sm:ring-1 sm:ring-slate-900/6 xl:my-0 xl:rounded-none xl:shadow-none xl:ring-0">
          <TopStrip person={viewer} home={home} crumbs={[{ label: viewer === "sarah" ? "Today" : "Home", href: home }, { label: "Context" }]} />
          <ContextView />
          <ChatThread />
          <div className="pb-24" />
        </div>
        <AppDrawer />
        <AskBar />
      </PageShell>
    </ChatProvider>
  )
}
