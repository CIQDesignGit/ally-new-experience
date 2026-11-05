"use client"

import { Sparkles } from "lucide-react"
import { PAGE_MAX } from "@/components/layout/page-frame"
import { PageShell } from "@/components/layout/page-shell"
import { cn } from "@/lib/utils"
import { TopStrip, useViewer } from "@/components/nudge/top-strip"
import type { Person } from "@/components/nudge/top-strip"
import { AppDrawer } from "@/components/nudge/app-drawer"
import { AskBar, ChatProvider, ChatThread, useChat } from "@/components/nudge/chat/inline-chat"
import { HOME_CHAT, MichelleChat } from "@/components/nudge/chat/home-chats"

/**
 * A new chat, opened from Ask Ally: the bar in the middle of an empty page with
 * the person's starters under it, like starting a chat in Claude. The first
 * question turns it into a thread, the bar docks at the bottom, and it's kept
 * in Ask Ally's history.
 */
export default function NewChatPage() {
  const { viewer, home } = useViewer("michelle")
  return (
    <ChatProvider thread={{ where: "Ask Ally", home }}>
      <NewChat viewer={viewer} home={home} />
    </ChatProvider>
  )
}

function NewChat({ viewer, home }: { viewer: Person; home: string }) {
  const { turns } = useChat()
  // The person's own questions: the same set their home page offers.
  const Chips = HOME_CHAT[viewer] ?? MichelleChat
  const name = viewer.charAt(0).toUpperCase() + viewer.slice(1)
  return (
    <PageShell className="bg-slate-50">
      <Chips newChat />
      <div className={cn("mx-auto min-h-screen bg-white", PAGE_MAX)}>
        <TopStrip person={viewer} home={home} crumbs={[{ label: "Home", href: home }, { label: turns[0]?.q ?? "New chat" }]} />
        {turns.length ? (
          <div className="pt-2">
            <ChatThread />
          </div>
        ) : (
          <div className="flex min-h-[calc(100vh-160px)] flex-col items-center justify-center px-6 pb-24">
            <Sparkles className="size-8 text-ally-500" aria-hidden />
            <h1 className="mt-4 mb-8 text-3xl leading-tight font-semibold tracking-tight text-slate-950">Good morning, {name}</h1>
            <AskBar centered />
          </div>
        )}
      </div>
      <AppDrawer home={home} />
      {turns.length > 0 && <AskBar />}
    </PageShell>
  )
}
