"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { PageShell } from "@/components/layout/page-shell"
import { TopStrip } from "@/components/nudge/top-strip"
import { AppDrawer } from "@/components/nudge/app-drawer"
import { useNudge } from "@/components/nudge/nudge-context"
import { SECONDARY } from "@/components/nudge/mike/buttons"
import { ChartView } from "@/components/nudge/retro/slide"
import { DateRange, Menu } from "@/components/nudge/dashboard/filters"
import { AnswerCard, AskBar, ChatProvider, ChatThread, StarterChips } from "@/components/nudge/chat/inline-chat"
import { CATEGORY_SPLIT, DEAL_SPLIT, RETRO, SLIDES, retroSlides } from "@/components/nudge/retro/prime-day"

/**
 * The retro as a live dashboard: the deck's charts as tiles, refreshed daily,
 * with a date range and filters. A filter picks one thing (a category, an
 * agent, a deal); every chart that has it puts it forward.
 */

const CATEGORIES = Object.keys(CATEGORY_SPLIT)
const AGENTS = ["Content", "Media", "Ops"] as const
const DEALS = Object.keys(DEAL_SPLIT)
const ALLY_TOTAL = { Media: 190, Content: 180, Ops: 40 }
/** Two tiles are both about categories; on the dashboard they say which way. */
const TILE_NAME: Record<string, string> = { "categories-up": "Categories that led", "categories-down": "Categories that trailed" }
const k$ = (n: number) => `$${n}K`

const RANGES = [
  { label: "Prime Day 2026", dates: "Jul 14 – 15, 2026", live: true },
  { label: "Prime Day 2025", dates: "Jul 8 – 11, 2025", live: false },
  { label: "Last 30 days", dates: "Sep 1 – 30, 2026", live: false },
  { label: "Quarter to date", dates: "Oct 1, 2026", live: false },
]

export default function PrimeDayDashboard() {
  return (
    <ChatProvider>
      <Dashboard />
    </ChatProvider>
  )
}

function Dashboard() {
  const { retro, setRetro } = useNudge()
  const [category, setCategory] = useState<string>()
  const [agent, setAgent] = useState<(typeof AGENTS)[number]>()
  const [deal, setDeal] = useState<string>()

  // Opening it is what clears the sidebar's "new" dot (after the store has loaded).
  useEffect(() => {
    const t = window.setTimeout(() => setRetro({ dashboardSeen: true }), 0)
    return () => window.clearTimeout(t)
  }, [setRetro])

  // The deck's slides as Michelle shaped them; the summary is the KPI row, not a tile.
  const order = retro.order?.length ? retro.order : SLIDES.map((s) => s.id)
  const tiles = retroSlides(order.filter((id) => id !== "summary"), retro)
  const focus = (id: string) => (id === "ally" ? agent : id === "deals" ? deal : category)
  // The top numbers recalculate for the filters; the charts below put the pick forward.
  const cat = category ? CATEGORY_SPLIT[category] : undefined
  const allyBy = cat?.ally ?? ALLY_TOTAL
  const added = agent ? allyBy[agent] : allyBy.Media + allyBy.Content + allyBy.Ops
  const kpis = [
    cat ? { figure: cat.sales, label: `${category} sales, ${cat.growth.startsWith("−") ? "down" : "up"} ${cat.growth.replace("−", "")}` } : { figure: "$4.6M", label: "Prime Day sales, up 28%" },
    cat ? { figure: cat.share, label: "of Prime Day sales" } : { figure: "+2 pts", label: "faster than the market" },
    { figure: k$(added), label: agent ? `added by the ${agent.toLowerCase()} agent` : "added by Ally" },
    deal ? { figure: DEAL_SPLIT[deal].added, label: `from ${deal.toLowerCase()} deals, ${DEAL_SPLIT[deal].lift} lift` } : { figure: String(cat?.lessons ?? 4), label: "lessons kept for Black Friday" },
  ]
  const filtered = !!(category || agent || deal)

  return (
    <PageShell className="bg-slate-50 xl:bg-white">
      <StarterChips id="dashboard-prime-day" chips={STARTERS} />
      <div className="mx-auto max-w-[1280px] overflow-clip bg-white shadow-pane-lg sm:my-6 sm:rounded-2xl sm:ring-1 sm:ring-slate-900/6 xl:my-0 xl:rounded-none xl:shadow-none xl:ring-0">
        <TopStrip person="michelle" crumbs={[{ label: "Daily brief", href: "/michelle" }, { label: "Dashboards" }, { label: RETRO.name }]} />

        <div className="flex items-end justify-between gap-6 px-10 pt-4">
          <div>
            <h1 className="text-[28px] leading-tight font-semibold tracking-tight text-slate-950">{RETRO.name}</h1>
            <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
              <span className="size-1.5 rounded-full bg-success-500" aria-hidden />
              Live · updated today, 9:00 AM
            </div>
          </div>
          <Link href="/michelle/retro?view=deck" className={SECONDARY}>
            Open deck
          </Link>
        </div>

        <div className="sticky top-0 z-30 mt-6 flex flex-wrap items-center gap-2 border-y border-slate-200 bg-white px-10 py-3">
          <DateRange label={RANGES[0].dates} ranges={RANGES} month="July 2026" startPad={3} days={31} from={14} to={15} />
          <Menu label="Retailer" value="Amazon" options={["Amazon"]} locked />
          <Menu label="Category" value={category} options={CATEGORIES} onChange={setCategory} />
          <Menu label="Agent" value={agent} options={[...AGENTS]} onChange={(v) => setAgent(v as (typeof AGENTS)[number] | undefined)} />
          <Menu label="Deal" value={deal} options={DEALS} onChange={setDeal} />
          {filtered && (
            <button
              type="button"
              onClick={() => {
                setCategory(undefined)
                setAgent(undefined)
                setDeal(undefined)
              }}
              className="ml-1 rounded-md px-2 py-1.5 text-[13px] text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="flex flex-col gap-6 px-10 pt-6 pb-16">
          <div className="grid grid-cols-4 gap-4">
            {kpis.map((k) => (
              <div key={k.label} className="rounded-xl border border-slate-200 px-5 py-4">
                <div className="font-mono text-[26px] leading-none font-semibold text-slate-950">{k.figure}</div>
                <div className="mt-2 text-[13px] text-slate-500">{k.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {tiles.map((s) => (
              <section key={s.id} aria-label={TILE_NAME[s.id] ?? s.eyebrow.split(" · ")[1]} className="flex flex-col rounded-xl border border-slate-200 p-5">
                <div className="text-xs font-medium tracking-wide text-slate-500 uppercase">{TILE_NAME[s.id] ?? s.eyebrow.split(" · ")[1]}</div>
                <div className="mt-1 text-[15px] font-semibold text-slate-950">{s.title}</div>
                <div className="mt-4 grid flex-1 grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-5">
                  <div className="flex h-[190px] flex-col justify-end" style={{ fontSize: 24 }}>
                    <ChartView chart={s.chart} theme="default" focus={focus(s.id)} />
                  </div>
                  <ul className="flex flex-col justify-center gap-3 border-l border-slate-100 pl-5">
                    {s.insights.map((i) => (
                      <li key={i.figure + i.text} className="text-[13px] leading-snug text-slate-500">
                        <b className={cn("block font-mono text-[17px] font-semibold", i.loss ? "text-error-600" : "text-brand-700")}>{i.figure}</b>
                        {i.text}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            ))}
          </div>
          <div className="text-[13px] text-slate-500">{RETRO.sources}</div>
        </div>
        <ChatThread />
      </div>
      <AppDrawer />
      <AskBar />
    </PageShell>
  )
}

const STARTERS = [
  {
    q: "Which deal should we repeat for Black Friday?",
    render: () => (
      <AnswerCard>
        <p className="font-semibold text-slate-950">Lightning deals on hero SKUs: +52% lift and +$310K, on 12 jar candles.</p>
        <ul className="mt-2 flex flex-col gap-1 text-[14px]">
          <li>· The 20% gift-set coupon lifted 6%, undercut by Brightwick&apos;s 30% off.</li>
          <li>· Kept as a lesson: run lightning deals on hero SKUs, not blanket coupons.</li>
        </ul>
      </AnswerCard>
    ),
  },
  {
    q: "Why did travel tins drop?",
    render: () => (
      <AnswerCard>
        <p className="font-semibold text-slate-950">Travel tins sold out on day 2 and finished down 4%, at $100K.</p>
        <ul className="mt-2 flex flex-col gap-1 text-[14px]">
          <li>· Kept as a lesson: build 3 weeks of cover before any event.</li>
        </ul>
      </AnswerCard>
    ),
  },
]
