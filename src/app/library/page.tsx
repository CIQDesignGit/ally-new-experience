"use client"

import { AppDrawer } from "@/components/nudge/app-drawer"
import { PageShell } from "@/components/layout/page-shell"
import { PageFrame } from "@/components/layout/page-frame"
import { AskBar, ChatProvider, ChatThread } from "@/components/nudge/chat/inline-chat"
import { TopStrip, useViewer } from "@/components/nudge/top-strip"
import { LibraryView } from "@/components/nudge/library/library-view"

/** The skills library, for whoever is viewing: what's on, what can be turned on, what the plan doesn't include. */
export default function LibraryPage() {
  const { viewer, home } = useViewer("michelle")
  return (
    <ChatProvider thread={{ where: "Library", home }}>
      <PageShell className="bg-slate-50">
        <PageFrame>
          <TopStrip person={viewer} home={home} crumbs={[{ label: "Home", href: home }, { label: "Library" }]} />
          <div className="px-10 pt-2 pb-6">
            <h1 className="text-3xl leading-tight font-semibold tracking-tight text-slate-950">Library</h1>
          </div>
          <LibraryView />
          <ChatThread />
        </PageFrame>
        <AppDrawer />
        <AskBar />
      </PageShell>
    </ChatProvider>
  )
}
