"use client"

import { use } from "react"
import { PageShell } from "@/components/layout/page-shell"
import { TopStrip } from "@/components/nudge/top-strip"
import { AppDrawer } from "@/components/nudge/app-drawer"
import { AskBar, ChatProvider, ChatThread, hasThread } from "@/components/nudge/chat/inline-chat"
import { useNudge } from "@/components/nudge/nudge-context"

/**
 * A conversation from history, on its own page: what was asked on a page (the
 * Daily brief, Gap to plan, a dashboard), as it ended. The page it was asked on
 * opens clean; this is where the conversation lives.
 */
const PERSON = { "/michelle": "michelle", "/mike": "mike", "/claire-waterfall": "claire" } as const

export default function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { conversations } = useNudge()
  const c = conversations.find((x) => x.id === id)
  const home = c?.home ?? "/michelle"
  return (
    <ChatProvider thread={{ id, where: c?.where ?? "Conversation", home, href: `/c/${id}` }}>
      <PageShell className="bg-slate-50 xl:bg-white">
        <div className="mx-auto min-h-screen max-w-[1280px] bg-white">
          <TopStrip person={PERSON[home as keyof typeof PERSON] ?? "michelle"} crumbs={[{ label: "Daily brief", href: home }, { label: c ? `${c.title}` : "Conversation" }]} />
          {c && <div className="px-12 pt-1 text-sm text-slate-500">Asked on {c.where} · {c.at}</div>}
          {hasThread(id) ? <ChatThread /> : <p className="px-12 pt-6 text-[15px] text-slate-500">This conversation ended with the last refresh.</p>}
        </div>
        <AppDrawer home={home} />
        <AskBar />
      </PageShell>
    </ChatProvider>
  )
}
