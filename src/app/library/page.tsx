"use client"

import { AppDrawer } from "@/components/nudge/app-drawer"
import { PageShell } from "@/components/layout/page-shell"
import { AskBar, ChatProvider, ChatThread } from "@/components/nudge/chat/inline-chat"
import { TopStrip, useViewer } from "@/components/nudge/top-strip"
import { LibraryView } from "@/components/nudge/library/library-view"

/** The skills library, for whoever is viewing: what's on, what can be turned on, what the plan doesn't include. */
export default function LibraryPage() {
  const { viewer, home } = useViewer("michelle")
  return (
    <ChatProvider thread={{ where: "Library", home }}>
      <PageShell className="bg-slate-50">
        <div className="mx-auto max-w-[1280px] overflow-clip bg-white shadow-pane-lg sm:my-6 sm:rounded-2xl sm:ring-1 sm:ring-slate-900/6">
          <TopStrip person={viewer} home={home} crumbs={[{ label: "Home", href: home }, { label: "Library" }]} />
          <div className="px-10 pt-2 pb-10">
            <h1 className="mb-6 text-[28px] leading-tight font-bold tracking-tight text-slate-950">Library</h1>
            <LibraryView />
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
