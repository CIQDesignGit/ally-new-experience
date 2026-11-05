"use client"

import { use, useEffect, useRef } from "react"
import { PageShell } from "@/components/layout/page-shell"
import { TopStrip } from "@/components/nudge/top-strip"
import type { Person } from "@/components/nudge/top-strip"
import { AppDrawer } from "@/components/nudge/app-drawer"
import { AskBar, ChatProvider, ChatThread, useChat } from "@/components/nudge/chat/inline-chat"
import { HOME_CHAT, MichelleChat } from "@/components/nudge/chat/home-chats"
import { useNudge } from "@/components/nudge/nudge-context"

/**
 * A conversation from history, on its own page: what was asked on a page (the
 * Daily brief, Gap to plan, a dashboard, a new chat), as it ended. The page it
 * was asked on opens clean; this is where the conversation lives.
 */
const PERSON: Record<string, Person> = { "/michelle": "michelle", "/mike": "mike", "/claire-waterfall": "claire", "/sarah": "sarah" }

export default function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { conversations } = useNudge()
  const c = conversations.find((x) => x.id === id)
  const home = c?.home ?? "/michelle"
  const person = PERSON[home] ?? "michelle"
  return (
    <ChatProvider thread={{ id, where: c?.where ?? "Conversation", home, href: `/c/${id}` }}>
      <Conversation person={person} home={home} title={c?.title} meta={c && `Asked on ${c.where} · ${c.at}`} />
    </ChatProvider>
  )
}

function Conversation({ person, home, title, meta }: { person: Person; home: string; title?: string; meta?: string }) {
  const { source, turns, ask } = useChat()
  // The person's own questions, so a follow-up here answers as it would on their home.
  const Chips = HOME_CHAT[person] ?? MichelleChat
  // Kept while the app is open; after a refresh its answer is gone, so Ally answers the question again, shown as it ended.
  const chip = title ? source.chips.find((x) => !x.task && (x.q === title || x.match?.test(title))) : undefined
  const replayed = useRef(false)
  useEffect(() => {
    if (replayed.current || turns.length || !chip || !title) return
    replayed.current = true
    ask(chip, undefined, title, undefined, true)
  }, [chip, turns.length, title, ask])
  // Nothing in memory and nothing Ally can answer again.
  const ended = !turns.length && source.chips.length > 0 && !chip
  return (
    <PageShell className="bg-slate-50">
      <Chips />
      <div className="mx-auto min-h-screen max-w-[1280px] bg-white">
        <TopStrip person={person} home={home} crumbs={[{ label: "Home", href: home }, { label: title ?? "Conversation" }]} />
        {meta && <div className="px-12 pt-1 text-sm text-slate-500">{meta}</div>}
        {ended ? <p className="px-12 pt-6 text-[15px] text-slate-500">This conversation ended with the last refresh.</p> : <ChatThread />}
      </div>
      <AppDrawer home={home} />
      <AskBar />
    </PageShell>
  )
}
