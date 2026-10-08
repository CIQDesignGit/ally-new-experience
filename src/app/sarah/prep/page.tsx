"use client"

import { AppDrawer } from "@/components/nudge/app-drawer"
import { PageShell } from "@/components/layout/page-shell"
import { AskBar, ChatProvider, ChatThread } from "@/components/nudge/chat/inline-chat"
import { SarahHeader } from "@/components/nudge/cs/sarah-parts"
import { MeetingPrep } from "@/components/nudge/cs/prep"

/** Sarah's prep for the next meeting on her calendar. */
export default function PrepPage() {
  return (
    <ChatProvider thread={{ where: "Meeting prep", home: "/sarah" }}>
      <PageShell className="bg-slate-50 xl:bg-white">
        <div className="mx-auto max-w-[1080px] overflow-clip bg-white shadow-pane-lg sm:my-6 sm:rounded-2xl sm:ring-1 sm:ring-slate-900/6 xl:my-0 xl:rounded-none xl:shadow-none xl:ring-0">
          <SarahHeader crumbs={[{ label: "Today", href: "/sarah" }, { label: "Meeting prep" }]} />
          <MeetingPrep />
          <ChatThread />
          <div className="pb-24" />
        </div>
        <AppDrawer home="/sarah" />
        <AskBar />
      </PageShell>
    </ChatProvider>
  )
}
