"use client"

import { AppDrawer } from "@/components/nudge/app-drawer"
import { PageShell } from "@/components/layout/page-shell"
import { PageFrame } from "@/components/layout/page-frame"
import { AskBar, ChatProvider, ChatThread } from "@/components/nudge/chat/inline-chat"
import { SarahHeader } from "@/components/nudge/cs/sarah-parts"
import { MeetingPrep } from "@/components/nudge/cs/prep"

/** Sarah's prep for the next meeting on her calendar. */
export default function PrepPage() {
  return (
    <ChatProvider thread={{ where: "Meeting prep", home: "/sarah" }}>
      <PageShell className="bg-slate-50">
        <PageFrame className="max-w-[1080px]">
          <SarahHeader crumbs={[{ label: "Today", href: "/sarah" }, { label: "Meeting prep" }]} />
          <MeetingPrep />
          <ChatThread />
        </PageFrame>
        <AppDrawer home="/sarah" />
        <AskBar />
      </PageShell>
    </ChatProvider>
  )
}
