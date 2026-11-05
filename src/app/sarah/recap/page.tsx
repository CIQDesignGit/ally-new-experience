"use client"

import { AppDrawer } from "@/components/nudge/app-drawer"
import { PageShell } from "@/components/layout/page-shell"
import { AskBar, ChatProvider, ChatThread } from "@/components/nudge/chat/inline-chat"
import { SarahHeader } from "@/components/nudge/cs/sarah-parts"
import { Recap } from "@/components/nudge/cs/recap"

/** The recap of the last call: edit it, save it to context, send it to Claire. */
export default function RecapPage() {
  return (
    <ChatProvider thread={{ where: "Meeting recap", home: "/sarah" }}>
      <PageShell className="bg-slate-50">
        <div className="mx-auto max-w-[1080px] overflow-clip bg-white shadow-pane-lg sm:my-6 sm:rounded-2xl sm:ring-1 sm:ring-slate-900/6">
          <SarahHeader crumbs={[{ label: "Today", href: "/sarah" }, { label: "Meeting recap" }]} />
          <Recap />
          <ChatThread />
          <div className="pb-24" />
        </div>
        <AppDrawer home="/sarah" />
        <AskBar />
      </PageShell>
    </ChatProvider>
  )
}
