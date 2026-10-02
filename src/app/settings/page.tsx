"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { TopStrip } from "@/components/nudge/top-strip"
import { cn } from "@/lib/utils"
import { AppDrawer } from "@/components/nudge/app-drawer"
import { PageShell } from "@/components/layout/page-shell"
import { ReviewPolicy } from "@/components/nudge/settings/review-policy"
import { Knowledge } from "@/components/nudge/settings/knowledge"
import { BusinessSettings } from "@/components/nudge/settings/business-settings"
import { AnswerCard, AskBar, ChatProvider, ChatThread, StarterChips } from "@/components/nudge/chat/inline-chat"
import { useNudge } from "@/components/nudge/nudge-context"

const TABS = [
  { id: "policy", label: "Review policy" },
  { id: "knowledge", label: "Knowledge" },
  { id: "business", label: "Business view" },
] as const

/** Settings, behind the gear on every page: how Ally ships changes, and what it should know. Kept out of the main path. */
function Settings() {
  const router = useRouter()
  const params = useSearchParams()
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>(TABS.find((t) => t.id === params.get("tab"))?.id ?? "policy")

  function back() {
    if (window.history.length > 1) router.back()
    else router.push("/claire-waterfall")
  }

  return (
    <>
    <TopStrip person="claire" home="/claire-waterfall" className="px-12" crumbs={[{ label: "Home", onClick: back }, { label: "Settings" }]} />
    <div className="flex flex-col gap-6 px-12 pt-4 pb-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-[28px] font-semibold tracking-tight text-slate-950">Settings</h1>
        <div className="flex rounded-lg border border-slate-200 bg-slate-25 p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "rounded-md px-3.5 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-300",
                tab === t.id ? "bg-white text-slate-950 shadow-xs ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-800",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      {tab === "policy" ? <ReviewPolicy /> : tab === "knowledge" ? <Knowledge /> : <BusinessSettings />}
    </div>
    </>
  )
}

export default function SettingsPage() {
  return (
    <ChatProvider>
      <PageShell className="bg-slate-50">
        <StarterChips id="settings" chips={STARTERS} />
        <div className="mx-auto max-w-[1080px] overflow-hidden bg-white shadow-pane-lg sm:my-6 sm:rounded-2xl sm:ring-1 sm:ring-slate-900/6">
          <Suspense fallback={null}>
            <Settings />
          </Suspense>
          <ChatThread />
        </div>
        <AppDrawer />
        <AskBar />
      </PageShell>
    </ChatProvider>
  )
}

/** What Ally has learned, read live from Knowledge. */
function LearnedAnswer() {
  const { knowledge } = useNudge()
  return (
    <AnswerCard>
      <p className="font-semibold text-slate-950">{knowledge.length} rules in Knowledge. Ally applies them before it drafts anything.</p>
      <ul className="mt-2 flex flex-col gap-1 text-[14px]">
        {knowledge.slice(0, 4).map((k) => (
          <li key={k.id}>· {k.text}</li>
        ))}
      </ul>
    </AnswerCard>
  )
}

const STARTERS = [
  {
    q: "How do autopilot and one approval away differ?",
    render: () => (
      <AnswerCard>
        <ul className="flex flex-col gap-1 text-[14px]">
          <li>· On autopilot: Ally ships the change and tells you after.</li>
          <li>· One approval away: Ally drafts the change and waits for your approve.</li>
          <li>· Needs your input: Ally needs a decision or data it doesn&apos;t have.</li>
        </ul>
        <p className="mt-2 text-[14px]">Your review policy sets which SKUs run at each one.</p>
      </AnswerCard>
    ),
  },
  { q: "What has Ally learned from us?", render: () => <LearnedAnswer /> },
]
