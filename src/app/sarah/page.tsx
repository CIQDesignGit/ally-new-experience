"use client"

import { AppDrawer } from "@/components/nudge/app-drawer"
import { PageShell } from "@/components/layout/page-shell"
import { AnswerCard, AskBar, ChatProvider, ChatThread, useChatSource } from "@/components/nudge/chat/inline-chat"
import { ResetDemoButton } from "@/components/nudge/reset-demo-button"
import { SarahHeader } from "@/components/nudge/cs/sarah-parts"
import { SarahHero, SarahInbox } from "@/components/nudge/cs/sarah-inbox"
import { ASKS, LAST_CALL, PLAN } from "@/components/nudge/cs/data"
import { aeoChip } from "@/components/nudge/cs/aeo-report"
import { togetherChip } from "@/components/nudge/media/answers"
import { SARAH_TYPED } from "@/components/nudge/cs/sarah-asks"

/** Sarah's questions: prep opens its own page; the rest answer from the plan and the call. */
function SarahChat() {
  useChatSource(
    {
      chips: [
        // Typed only, checked first: "launch…" or "prime day…" means the skill, not a question about the call.
        ...SARAH_TYPED,
        aeoChip,
        togetherChip,
        { q: "Prep me for my Aurelle meeting", match: /prep|meeting|session/i, task: "/sarah/prep", render: () => null },
        {
          q: "What did Claire ask for last time?",
          match: /ask(ed)?|last (call|time|week)/i,
          render: () => (
            <AnswerCard>
              <p className="font-semibold text-slate-950">{ASKS.length} asks on the {LAST_CALL.short} call. Ally did all of them; 3 wait for your approval.</p>
              <ul className="mt-2 flex flex-col gap-1 text-[14px]">
                {ASKS.map((c) => (
                  <li key={c.id}>· {c.title}</li>
                ))}
              </ul>
            </AnswerCard>
          ),
        },
        {
          q: "What's due this week?",
          match: /due|owe|this week/i,
          render: () => (
            <AnswerCard>
              <ul className="flex flex-col gap-1 text-[14px]">
                {PLAN[0].items.map((i) => (
                  <li key={i.id}>
                    · <b className="font-semibold text-slate-950">{i.name}</b> · {i.last}
                  </li>
                ))}
              </ul>
            </AnswerCard>
          ),
        },
      ],
    },
    "sarah",
  )
  return null
}

/**
 * Sarah, CommerceIQ's retail expert. Ally does the work from the plan and the
 * calls: what changes money or makes a new promise waits for her approval;
 * the rest runs on autopilot. The call's recap saves itself into context.
 */
export default function SarahPage() {
  return (
    <ChatProvider thread={{ where: "Today", home: "/sarah" }}>
      <SarahChat />
      <PageShell className="bg-slate-50 xl:bg-white">
        <div className="mx-auto max-w-[1280px] overflow-clip bg-white shadow-pane-lg sm:my-6 sm:rounded-2xl sm:ring-1 sm:ring-slate-900/6 xl:my-0 xl:rounded-none xl:shadow-none xl:ring-0">
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
