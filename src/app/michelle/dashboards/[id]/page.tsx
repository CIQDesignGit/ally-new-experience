"use client"

import { use, useEffect, useState } from "react"
import { PageShell } from "@/components/layout/page-shell"
import { TopStrip } from "@/components/nudge/top-strip"
import { AppDrawer } from "@/components/nudge/app-drawer"
import { useNudge } from "@/components/nudge/nudge-context"
import { AnswerCard, AskBar, ChatProvider, ChatThread, StarterChips } from "@/components/nudge/chat/inline-chat"
import { DateRange, Menu } from "@/components/nudge/dashboard/filters"
import { PromoAnswer, PromoWidgetBody, WIDGET_HEADLINE } from "@/components/nudge/promo/answers"
import { SelectToAsk } from "@/components/nudge/chat/select-to-ask"
import type { Chip } from "@/components/nudge/chat/inline-chat"
import { PROMO_DEPTH, PROMO_QUESTIONS } from "@/components/nudge/promo/data"
import type { PromoWidget } from "@/components/nudge/promo/data"

/**
 * A dashboard saved from chat. Each widget is one of the answers, still live.
 * One way to ask: the bar, about the whole page, or a highlighted piece of it.
 */

const RANGES = [
  { label: "This month", dates: "Oct 1 – 8, 2026", live: true },
  { label: "Last 30 days", dates: "Sep 9 – Oct 8, 2026", live: false },
  { label: "Quarter to date", dates: "Oct 1 – 8, 2026", live: false },
]

export default function SavedDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <ChatProvider>
      <SavedDashboard id={id} />
    </ChatProvider>
  )
}

function SavedDashboard({ id }: { id: string }) {
  const { dashboards, markDashboardSeen } = useNudge()
  const d = dashboards.find((x) => x.id === id)
  const [category, setCategory] = useState<string>()

  // Opening it is what clears the sidebar's "new" dot (after the store has loaded).
  useEffect(() => {
    const t = window.setTimeout(() => markDashboardSeen(id), 0)
    return () => window.clearTimeout(t)
  }, [id, markDashboardSeen])

  // Half-width widgets pair up first; the full-width table goes below them.
  const widgets = ((d?.widgets ?? []) as PromoWidget[]).slice().sort((a, b) => Number(a === "promo-badge") - Number(b === "promo-badge"))
  return (
    <PageShell className="bg-slate-50 xl:bg-white">
      <StarterChips id={`dashboard-${id}`} chips={[...STARTERS, ...WIDGET_CHIPS]} />
      <div className="mx-auto max-w-[1280px] overflow-clip bg-white shadow-pane-lg sm:my-6 sm:rounded-2xl sm:ring-1 sm:ring-slate-900/6 xl:my-0 xl:rounded-none xl:shadow-none xl:ring-0">
        <TopStrip person="michelle" crumbs={[{ label: "Daily brief", href: "/michelle" }, { label: "Dashboards" }, { label: d?.name ?? "Dashboard" }]} />

        {d ? (
          <>
            <div className="px-10 pt-4">
              <h1 className="text-[28px] leading-tight font-semibold tracking-tight text-slate-950">{d.name}</h1>
              <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                <span className="size-1.5 rounded-full bg-success-500" aria-hidden />
                Live · updated today, 9:00 AM · saved from chat
              </div>
            </div>

            <div data-sticky-top className="sticky top-0 z-30 mt-6 flex flex-wrap items-center gap-2 border-y border-slate-200 bg-white px-10 py-3">
              <DateRange label={RANGES[0].dates} ranges={RANGES} month="October 2026" startPad={4} days={31} from={1} to={8} />
              <Menu label="Retailer" value="Amazon" options={["Amazon"]} locked />
              <Menu label="Category" value={category} options={PROMO_DEPTH.map((r) => r.category)} onChange={setCategory} />
            </div>

            {/* Ask from the bar about the whole page, or highlight anything to ask about just that. */}
            <SelectToAsk className="grid grid-cols-2 gap-4 px-10 pt-6 pb-16">
              {widgets.map((w) => (
                <section key={w} aria-label={PROMO_QUESTIONS[w]} className={w === "promo-badge" ? "col-span-2 flex flex-col rounded-xl border border-slate-200 p-5" : "flex flex-col rounded-xl border border-slate-200 p-5"}>
                  <div className="text-[15px] font-semibold text-slate-950">{WIDGET_HEADLINE[w]}</div>
                  <div className="mt-4 flex-1">
                    <PromoWidgetBody id={w} focus={category} />
                  </div>
                </section>
              ))}
            </SelectToAsk>
          </>
        ) : (
          <p className="px-10 pt-6 pb-16 text-[15px] text-slate-500">Loading…</p>
        )}
        <ChatThread />
      </div>
      <AppDrawer />
      <AskBar />
    </PageShell>
  )
}

const STARTERS = [
  {
    q: "What changed since yesterday?",
    render: () => (
      <AnswerCard>
        <ul className="flex flex-col gap-1 text-[14px]">
          <li>· The Halloween badge is still missing on all 5 SKUs, now 8 days.</li>
          <li>· Brightwick&apos;s gift sets are still 30% off; ours are at full price.</li>
          <li>· Lightning deals held at +38%.</li>
        </ul>
      </AnswerCard>
    ),
  },
]

/** What a highlighted piece of a widget is about, answered here with that widget's own answer (not offered as starters). */
const WIDGET_CHIPS: Chip[] = [
  { q: PROMO_QUESTIONS["promo-badge"], hidden: true, match: /badge|halloween|days without|at risk|noir|coastal|fig|citrus/i, render: () => <PromoAnswer id="promo-badge" /> },
  { q: PROMO_QUESTIONS["promo-vs-brightwick"], hidden: true, match: /brightwick|depth|gift sets?|wax melts|pillar|travel tins|full price/i, render: () => <PromoAnswer id="promo-vs-brightwick" /> },
  { q: PROMO_QUESTIONS["promo-month"], hidden: true, match: /lightning|bundles?|coupons?|lift|promo sales|\$1\.2M/i, render: () => <PromoAnswer id="promo-month" /> },
]
