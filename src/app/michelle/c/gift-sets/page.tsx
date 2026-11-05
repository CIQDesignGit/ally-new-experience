"use client"

import { useEffect, useRef } from "react"
import { PageShell } from "@/components/layout/page-shell"
import { PAGE_MAX } from "@/components/layout/page-frame"
import { cn } from "@/lib/utils"
import { TopStrip } from "@/components/nudge/top-strip"
import { AppDrawer } from "@/components/nudge/app-drawer"
import { AskBar, ChatProvider, ChatThread, hasThread, useChat, useChatSource } from "@/components/nudge/chat/inline-chat"
import type { Chip } from "@/components/nudge/chat/inline-chat"
import { GiftSetsAnswer } from "@/components/nudge/alerts/answers"
import { GIFT_QUESTION } from "@/components/nudge/alerts/data"

/** "Why are gift sets lagging?" is an investigation that ends in actions and alerts: its own thread. */
const GIFT_CHIP: Chip = { q: GIFT_QUESTION, match: /gift.?sets?/i, think: { ms: 1600, label: "Breaking down gift-set sales" }, render: () => <GiftSetsAnswer /> }

export default function GiftSetsThread() {
  return (
    <ChatProvider thread={{ id: "gift-sets", where: "New thread", home: "/michelle", href: "/michelle/c/gift-sets" }}>
      <Thread />
    </ChatProvider>
  )
}

function Thread() {
  const { ask } = useChat()
  const started = useRef(false)
  useChatSource({ chips: [GIFT_CHIP] }, "gift-sets")
  // Asked once on arrival; reopened from history, it's already there.
  useEffect(() => {
    if (started.current) return
    started.current = true
    if (!hasThread("gift-sets")) window.setTimeout(() => ask(GIFT_CHIP), 200)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <PageShell className="bg-slate-50">
      <div className={cn("mx-auto min-h-screen bg-white", PAGE_MAX)}>
        <TopStrip person="michelle" crumbs={[{ label: "Daily brief", href: "/michelle" }, { label: "Gift sets" }]} />
        <div className="pt-2">
          <ChatThread />
        </div>
      </div>
      <AppDrawer />
      <AskBar />
    </PageShell>
  )
}
