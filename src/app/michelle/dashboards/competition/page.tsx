"use client"

import { PageShell } from "@/components/layout/page-shell"
import { PageFrame, Widget, WidgetStack, PAGE_EDGE } from "@/components/layout/page-frame"
import { TopStrip } from "@/components/nudge/top-strip"
import { AppDrawer } from "@/components/nudge/app-drawer"
import { ExportButton } from "@/components/nudge/ui/export-button"
import { AnswerCard, AskBar, ChatProvider, ChatThread, StarterChips, type Chip } from "@/components/nudge/chat/inline-chat"
import { StepBar } from "@/components/competition/step-bar"
import { useCompetition } from "@/components/competition/state"
import { DEALS, MATCHED, NAMES, SOV, SOV_WEEKS, THEIR_SOV_PRIME_DAY, TIMES } from "@/components/competition/data"
import { exportCompetitionPptx } from "@/components/competition/exports"

const last = SOV.theirs.length - 1
const money = (v: number) => `−$${Math.abs(v).toFixed(2)}`

const STARTERS: Chip[] = [
  {
    q: `Why did ${NAMES.competitor} gain on gift terms?`,
    think: { ms: 1200, label: "Reading the tracker's last 8 weeks" },
    render: () => (
      <AnswerCard>
        <p className="font-semibold text-slate-950">
          Deals and sponsored slots. {NAMES.competitor} went from {SOV.theirs[0]}% to {SOV.theirs[last]}% while you went from {SOV.ours[0]}% to {SOV.ours[last]}%.
        </p>
        <ul className="mt-2 flex flex-col gap-1 text-[14px]">
          <li>
            · 20% off on {DEALS.length} of your {MATCHED} matched gift sets since Oct 5
          </li>
          <li>· Their price is $3.60 to $4.80 below yours on those {DEALS.length}</li>
          <li>· Their share rose every week since Aug 16</li>
        </ul>
      </AnswerCard>
    ),
  },
]

/** Step 4: the dashboard the competition skill feeds, live for Aurelle. */
export default function CompetitionDashboard() {
  return (
    <ChatProvider thread={{ where: "Competition dashboard", home: "/michelle" }}>
      <Dashboard />
    </ChatProvider>
  )
}

function Dashboard() {
  const c = useCompetition()
  const kpis = [
    { figure: `${SOV.theirs[last]}%`, label: `${NAMES.competitor} share of voice, up ${SOV.theirs[last] - THEIR_SOV_PRIME_DAY} pts since Prime Day` },
    { figure: `${SOV.ours[last]}%`, label: `Your share of voice, down ${SOV.ours[0] - SOV.ours[last]} pts in 8 weeks` },
    { figure: `${DEALS.length} of ${MATCHED}`, label: "Your gift sets facing a deal" },
    { figure: money(Math.min(...DEALS.map((d) => d.gap))), label: "Biggest price gap" },
  ]

  return (
    <PageShell className="bg-slate-50">
      <StepBar step={4} />
      <StarterChips id="dashboard-competition" chips={STARTERS} />
      <PageFrame>
        <TopStrip className={PAGE_EDGE} person="michelle" crumbs={[{ label: "Daily brief", href: "/michelle" }, { label: "Dashboards" }, { label: "Competition" }]} />

        <div className={`flex items-end justify-between gap-6 pt-4 ${PAGE_EDGE}`}>
          <div>
            <h1 className="text-3xl leading-tight font-semibold tracking-tight text-slate-950">{NAMES.competitor} vs Aurelle</h1>
            <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
              <span className="size-1.5 rounded-full bg-success-500" aria-hidden />
              Live since {c.selfBuilt ? TIMES.built : TIMES.live} · refreshes every {c.day} · week of Oct 4
            </div>
          </div>
          <ExportButton onExport={exportCompetitionPptx} />
        </div>

        <WidgetStack className="pt-6">
          <div className="grid grid-cols-4 gap-4 max-md:grid-cols-2">
            {kpis.map((k) => (
              <div key={k.label} className="rounded-2xl bg-white px-5 py-4 shadow-xs ring-1 ring-slate-200">
                <div className="font-mono text-[26px] leading-none font-semibold text-slate-950">{k.figure}</div>
                <div className="mt-2 text-[13px] text-slate-500">{k.label}</div>
              </div>
            ))}
          </div>

          <Widget className="p-5">
            <div className="text-[15px] font-semibold text-slate-950">Share of voice on your gift terms</div>
            <SovChart />
          </Widget>

          <Widget>
            <div className="border-b border-slate-200 px-5 py-3 text-[15px] font-semibold text-slate-950">Deals on your matched gift sets</div>
            <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1.2fr)_90px_80px_100px] gap-4 border-b border-slate-200 px-5 py-2.5 text-xs font-medium text-slate-500">
              <span>{NAMES.competitor}</span>
              <span>Yours</span>
              <span>Deal</span>
              <span>Since</span>
              <span className="text-right">Price gap</span>
            </div>
            <ul className="divide-y divide-slate-100">
              {DEALS.map((d) => (
                <li key={d.theirs} className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1.2fr)_90px_80px_100px] gap-4 px-5 py-3 text-[14px]">
                  <span className="text-slate-950">{d.theirs}</span>
                  <span className="text-slate-700">{d.ours}</span>
                  <span className="text-slate-700">{d.deal}</span>
                  <span className="text-slate-700">{d.since}</span>
                  <span className="text-right text-slate-950 tabular-nums">{money(d.gap)}</span>
                </li>
              ))}
            </ul>
          </Widget>
        </WidgetStack>
        <ChatThread />
      </PageFrame>
      <AppDrawer />
      <AskBar />
    </PageShell>
  )
}

/** Two lines on one scale, labeled at the end; no legend to decode. */
function SovChart() {
  const W = 1000
  const H = 200
  const max = 40
  const x = (i: number) => 40 + (i * (W - 160)) / (SOV_WEEKS.length - 1)
  const y = (v: number) => H - 24 - (v / max) * (H - 40)
  const path = (vals: number[]) => vals.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join(" ")
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 h-[200px] w-full" role="img" aria-label={`${NAMES.competitor} rose from ${SOV.theirs[0]}% to ${SOV.theirs[last]}%; Aurelle fell from ${SOV.ours[0]}% to ${SOV.ours[last]}%`}>
      {[0, 10, 20, 30, 40].map((g) => (
        <g key={g}>
          <line x1={40} x2={W - 120} y1={y(g)} y2={y(g)} stroke="#f1f5f9" />
          <text x={30} y={y(g) + 4} textAnchor="end" className="fill-slate-400 text-[11px]">
            {g}%
          </text>
        </g>
      ))}
      {SOV_WEEKS.map((w, i) => (
        <text key={w} x={x(i)} y={H - 4} textAnchor="middle" className="fill-slate-400 text-[11px]">
          {w}
        </text>
      ))}
      <path d={path(SOV.theirs)} fill="none" stroke="#94a3b8" strokeWidth={2.5} />
      <path d={path(SOV.ours)} fill="none" stroke="#0f172a" strokeWidth={2.5} />
      <text x={x(last) + 10} y={y(SOV.theirs[last]) + 4} className="fill-slate-500 text-[12px]">
        {NAMES.competitor} {SOV.theirs[last]}%
      </text>
      <text x={x(last) + 10} y={y(SOV.ours[last]) + 4} className="fill-slate-950 text-[12px] font-medium">
        Aurelle {SOV.ours[last]}%
      </text>
    </svg>
  )
}
