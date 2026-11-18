"use client"

import { AppHeader } from "@/components/home/app-header"
import { PageShell } from "@/components/layout/page-shell"

import { AeoOverview } from "./aeo-overview"
import { BrandLeaderboardWidget } from "./brand-leaderboard-widget"
import { heroData } from "./data"
import { PromptPerformanceTable } from "./prompt-performance-table"
import { TopicCompetitionTable } from "./topic-competition-table"

export function BrandPerformanceContent() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 pb-20 pt-8">
      <AeoOverview />

      <div className="mt-5 rounded-xl bg-linear-to-r from-brand-500 via-cyan-400 to-pink-500 p-px">
        <div className="rounded-[11px] bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="font-semibold text-slate-900">AI Insight</h2>
          </div>
          <p className="max-w-2xl px-6 py-4 text-[14px] leading-relaxed text-slate-600">{heroData.summary}</p>
        </div>
      </div>

      <div className="mt-5">
        <BrandLeaderboardWidget />
      </div>

      <div className="mt-5">
        <TopicCompetitionTable />
      </div>

      <div className="mt-5">
        <PromptPerformanceTable />
      </div>
    </div>
  )
}

/** Workbench entry — keeps the legacy header and shell. */
export function BrandPerformanceView() {
  return (
    <PageShell>
      <AppHeader
        backHref="/workbench"
        breadcrumb={[
          { label: "Ally", href: "/workbench" },
          { label: "Brand Performance" },
        ]}
      />
      <div className="min-h-[calc(100vh-3.5rem)] bg-slate-50">
        <BrandPerformanceContent />
      </div>
    </PageShell>
  )
}