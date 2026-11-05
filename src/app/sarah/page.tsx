"use client"

import { AppDrawer } from "@/components/nudge/app-drawer"
import { PageShell } from "@/components/layout/page-shell"
import { AskBar, ChatProvider, ChatThread } from "@/components/nudge/chat/inline-chat"
import { SarahChat } from "@/components/nudge/chat/home-chats"
import { ResetDemoButton } from "@/components/nudge/reset-demo-button"
import { SarahHeader } from "@/components/nudge/cs/sarah-parts"
import { SarahHero, SarahInbox } from "@/components/nudge/cs/sarah-inbox"

/**
 * Sarah, CommerceIQ's retail expert. Ally does the work from the plan and the
 * calls: what changes money or makes a new promise waits for her approval;
 * the rest runs on autopilot. The call's recap saves itself into context.
 */
export default function SarahPage() {
  return (
    <ChatProvider thread={{ where: "Today", home: "/sarah" }}>
      <SarahChat />
      <PageShell className="bg-slate-50">
        <div className="mx-auto max-w-[1280px] overflow-clip bg-white shadow-pane-lg sm:my-6 sm:rounded-2xl sm:ring-1 sm:ring-slate-900/6">
          <SarahHeader />
          <SarahHero />
          <SarahInbox />
          <ChatThread />
          <div className="flex justify-end px-10 pb-24 opacity-50 hover:opacity-100">
            <ResetDemoButton />
          </div>
        </div>
        <AppDrawer />
        <AskBar />
      </PageShell>
    </ChatProvider>
  )
}
