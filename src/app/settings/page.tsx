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
import { DataSources } from "@/components/nudge/settings/data-sources"
import { AnswerCard, AskBar, ChatProvider, ChatThread, StarterChips } from "@/components/nudge/chat/inline-chat"
import { useNudge } from "@/components/nudge/nudge-context"
import { RunList } from "@/components/nudge/runs/run-list"
import { builtInSkills, type RunItem } from "@/components/nudge/runs/data"
import { GAP_STEPS } from "@/components/nudge/ops/gap-data"

const TABS = [
  { id: "skills", label: "Skills" },
  { id: "knowledge", label: "Knowledge" },
  { id: "policy", label: "Autopilot" },
  { id: "business", label: "Business view" },
  { id: "sources", label: "Data sources" },
] as const
/** The gear's tabs (Settings); the rest are Teach Ally's. */
const SETTINGS_TABS: string[] = ["business", "sources"]

/**
 * Teach Ally (from the nav): what runs on autopilot, the skills it has learned,
 * and what it knows. The gear opens the same page on Business view, as Settings.
 */
function Settings() {
  const router = useRouter()
  const params = useSearchParams()
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>(TABS.find((t) => t.id === params.get("tab"))?.id ?? "skills")

  function back() {
    if (window.history.length > 1) router.back()
    else router.push("/claire-waterfall")
  }

  return (
    <>
    <TopStrip person="claire" home="/claire-waterfall" className="px-12" crumbs={[{ label: "Home", onClick: back }, { label: SETTINGS_TABS.includes(tab) ? "Settings" : "Teach Ally" }]} />
    <div className="flex flex-col gap-6 px-12 pt-4 pb-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-[28px] font-semibold tracking-tight text-slate-950">{SETTINGS_TABS.includes(tab) ? "Settings" : "Teach Ally"}</h1>
        <div className="flex rounded-lg border border-slate-200 bg-slate-25 p-1">
          {/* Teach Ally's three tabs; the gear's Business view stands on its own as Settings. */}
          {TABS.filter((t) => SETTINGS_TABS.includes(tab) === SETTINGS_TABS.includes(t.id)).map((t) => (
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
      {tab === "policy" ? <ReviewPolicy /> : tab === "skills" ? <SkillsList /> : tab === "knowledge" ? <Knowledge /> : tab === "sources" ? <DataSources /> : <BusinessSettings />}
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

/**
 * Skills: how Ally does a piece of work, live or paused, in the same list as
 * Scheduled. The gap analysis shows the steps you taught it and its versions;
 * skills saved from your work; Ally's own, with the alerts that use them.
 */
function SkillsList() {
  const { skills, knowledge, runs } = useNudge()
  const SHARED = { me: "only you", team: "your team", account: "everyone" } as const
  const lesson = knowledge.find((k) => k.recipe)?.recipe
  const gap: RunItem = {
    id: "skill-gap-analysis",
    kind: "skill",
    name: "Gap to plan analysis",
    what: lesson ? `Why we missed and what closes the gap · version ${(lesson.log?.length ?? 0) + 1}, shared with ${SHARED[lesson.scope]}` : "Why we missed and what closes the gap",
    runs: "When you ask",
    does: "tell",
    owner: "built in",
    steps: [...GAP_STEPS, ...(lesson?.steps ?? [])],
    usedBy: ["Gap to plan", "How am I doing compared to plan?"],
    last: "Oct 2",
  }
  const saved: RunItem[] = skills.map((k) => ({
    id: `skill-${k.id}`,
    kind: "skill",
    name: k.name,
    what: `Saved from your work · shared with ${SHARED[k.shared]}`,
    runs: "When you ask",
    does: "draft",
    owner: "yours",
  }))
  const items = [gap, ...saved, ...runs.added.filter((x) => x.kind === "skill"), ...builtInSkills()]
  // The gap analysis keeps its history: who changed it, for whom, and what changed.
  const extra = (i: RunItem) =>
    i.id === "skill-gap-analysis" && lesson?.log?.length ? (
      <div className="mt-4 border-t border-slate-100 pt-3 text-sm">
        <span className="text-xs font-medium text-slate-500">Versions</span>
        <ul className="mt-1.5 flex flex-col gap-1">
          {lesson.log.map((l) => (
            <li key={l.version} className="text-slate-700">
              <span className="font-mono text-xs text-slate-400">v{l.version}</span> {l.who} · {l.when} · {l.changes.join("; ")}
            </li>
          ))}
        </ul>
      </div>
    ) : null
  return <RunList title="Skills" items={items} kind="skill" placeholder="Prep a promo recap: pull last week's deals, compare to plan, then draft a summary" extra={extra} />
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
