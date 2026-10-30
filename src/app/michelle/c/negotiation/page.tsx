"use client"

import { useEffect, useRef } from "react"
import { PageShell } from "@/components/layout/page-shell"
import { TopStrip, useViewer } from "@/components/nudge/top-strip"
import { AppDrawer } from "@/components/nudge/app-drawer"
import { AskBar, ChatProvider, ChatThread, hasThread, useChat, useChatSource } from "@/components/nudge/chat/inline-chat"
import { PREP_CHIP, RUN_BY_NAME_CHIP } from "@/components/nudge/skill/answers"
import { PREP_FILES } from "@/components/nudge/skill/data"
import { useHarness } from "@/components/competition/harness"
import { LibraryMatch } from "@/components/nudge/library/match"
import type { Chip } from "@/components/nudge/chat/inline-chat"

/** The borrow harness's answer to "prep me for the negotiation": the library skill, not a new one. */
const LIBRARY_PREP: Chip = { q: PREP_CHIP.q, match: PREP_CHIP.match, render: () => <LibraryMatch skillId="negotiation-prep" go="/michelle/c/negotiation?run=1" goLabel="Open my negotiation prep" /> }

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
  // Michelle's skill; Sarah opens it from her page too.
  const { viewer, home } = useViewer("michelle")
  const started = useRef(false)
  // Borrow harness: Ally doesn't learn a new skill in the product; it offers the library's negotiation prep instead.
  const borrow = useHarness() === "borrow"
  const prep = borrow ? LIBRARY_PREP : PREP_CHIP
  useChatSource({ chips: [RUN_BY_NAME_CHIP, prep], files: PREP_FILES }, `negotiation-${borrow}`)
  // The task it was opened for, asked once on arrival.
  useEffect(() => {
    if (started.current) return
    started.current = true
    const run = new URLSearchParams(window.location.search).get("run")
    // Reopened from history: it's already there. Otherwise start the task it was opened for.
    if (run) window.setTimeout(() => ask(RUN_BY_NAME_CHIP), 200)
    else if (!hasThread("negotiation")) window.setTimeout(() => ask(prep), 200)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <PageShell className="bg-slate-50 xl:bg-white">
      <div className="mx-auto min-h-screen max-w-[1280px] bg-white">
        <TopStrip person={viewer} crumbs={[{ label: viewer === "sarah" ? "Today" : "Daily brief", href: home }, { label: "Amazon vendor negotiation" }]} />
        <div className="pt-2">
          <ChatThread />
        </div>
      </div>
      <AppDrawer />
      <AskBar />
    </PageShell>
  )
}
