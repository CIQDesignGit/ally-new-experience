"use client"

import { useEffect, useRef } from "react"
import { PageShell } from "@/components/layout/page-shell"
import { TopStrip } from "@/components/nudge/top-strip"
import { AppDrawer } from "@/components/nudge/app-drawer"
import { AskBar, ChatProvider, ChatThread, hasThread, useChat, useChatSource } from "@/components/nudge/chat/inline-chat"
import { PREP_CHIP, RUN_BY_NAME_CHIP } from "@/components/nudge/skill/answers"
import { PREP_FILES } from "@/components/nudge/skill/data"

/**
 * The Amazon vendor negotiation, its own conversation: a new task opens a new
 * thread, so nothing from the page it was asked on sits above it. Asked from
 * the bar ("Prep me for…") it starts the prep; "Open my negotiation prep" runs
 * the saved skill.
 */
export default function NegotiationThread() {
  return (
    <ChatProvider thread={{ id: "negotiation", where: "New thread", home: "/michelle", href: "/michelle/c/negotiation" }}>
      <Thread />
    </ChatProvider>
  )
}

function Thread() {
  const { ask } = useChat()
  const started = useRef(false)
  useChatSource({ chips: [RUN_BY_NAME_CHIP, PREP_CHIP], files: PREP_FILES }, "negotiation")
  // The task it was opened for, asked once on arrival.
  useEffect(() => {
    if (started.current) return
    started.current = true
    const run = new URLSearchParams(window.location.search).get("run")
    // Reopened from history: it's already there. Otherwise start the task it was opened for.
    if (run) window.setTimeout(() => ask(RUN_BY_NAME_CHIP), 200)
    else if (!hasThread("negotiation")) window.setTimeout(() => ask(PREP_CHIP), 200)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <PageShell className="bg-slate-50 xl:bg-white">
      <div className="mx-auto min-h-screen max-w-[1280px] bg-white">
        <TopStrip person="michelle" crumbs={[{ label: "Daily brief", href: "/michelle" }, { label: "Amazon vendor negotiation" }]} />
        <div className="pt-2">
          <ChatThread />
        </div>
      </div>
      <AppDrawer />
      <AskBar />
    </PageShell>
  )
}
