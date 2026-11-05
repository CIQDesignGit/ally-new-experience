"use client"

import { AppDrawer } from "@/components/nudge/app-drawer"
import { PageShell } from "@/components/layout/page-shell"
import { PageFrame } from "@/components/layout/page-frame"
import { AskBar, ChatProvider, ChatThread } from "@/components/nudge/chat/inline-chat"
import { SarahHeader } from "@/components/nudge/cs/sarah-parts"
import { Recap } from "@/components/nudge/cs/recap"

/** The recap of the last call: edit it, save it to context, send it to Claire. */
export default function RecapPage() {
  return (
    <ChatProvider thread={{ where: "Meeting recap", home: "/sarah" }}>
      <PageShell className="bg-slate-50">
        <PageFrame className="max-w-[1080px]">
          <SarahHeader crumbs={[{ label: "Today", href: "/sarah" }, { label: "Meeting recap" }]} />
          <Recap />
          <ChatThread />
        </PageFrame>
        <AppDrawer home="/sarah" />
        <AskBar />
      </PageShell>
    </ChatProvider>
  )
}
