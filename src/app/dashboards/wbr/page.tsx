"use client"

import { cn } from "@/lib/utils"
import { PageShell } from "@/components/layout/page-shell"
import { TopStrip, useViewer } from "@/components/nudge/top-strip"
import { AppDrawer } from "@/components/nudge/app-drawer"
import { AskBar, ChatProvider, ChatThread } from "@/components/nudge/chat/inline-chat"
import { BUSINESS, HALLOWEEN_PUBLISH_BY, fmtBiz, fmtValue } from "@/components/nudge/data"
import { useLive } from "@/components/nudge/live-model"
import { DELIVERED } from "@/components/nudge/delivered-periods"
import { GAP_TREE, GAP_WEEK } from "@/components/nudge/ops/gap-data"
import { LAUNCH } from "@/components/nudge/launch/data"
import { NEXT_EVENT } from "@/components/nudge/market"
import { shortDate } from "@/components/nudge/model"
import { ExportButton } from "@/components/nudge/ui/export-button"
import { exportXlsx } from "@/components/competition/exports"

const HEAD = "text-xs font-medium tracking-wide text-slate-500 uppercase"
/** $M → "−$102K" / "+$1.2M", signed. */
const signed = (v: number) => `${v < 0 ? "−" : "+"}${fmtValue(Math.abs(v))}`

/**
 * The weekly business review, on for every brand: where the quarter lands
 * against plan, last week and why, what shipped, what's due next week. Every
 * number is a forecast against plan or measured; nothing projects Ally's value.
 */
export default function WbrDashboard() {
  const { viewer, home } = useViewer("michelle")
  return (
    <ChatProvider thread={{ where: "Weekly business review", home }}>
      <PageShell className="bg-slate-50 xl:bg-white">
        <div className="mx-auto max-w-[1280px] overflow-clip bg-white shadow-pane-lg sm:my-6 sm:rounded-2xl sm:ring-1 sm:ring-slate-900/6 xl:my-0 xl:rounded-none xl:shadow-none xl:ring-0">
          <TopStrip person={viewer} home={home} crumbs={[{ label: "Home", href: home }, { label: "My dashboards" }, { label: "Weekly business review" }]} />
          <Wbr />
          <ChatThread />
          <div className="pb-24" />
        </div>
        <AppDrawer />
        <AskBar />
      </PageShell>
    </ChatProvider>
  )
}

function Wbr() {
  const { pace } = useLive()
  const forecast = pace("quarter")
  const plan = BUSINESS.quarter.plan
  const gap = plan - forecast
  const q = DELIVERED.quarter
  const deliveredQ = q.content.delivered + q.ops.delivered + q.media.delivered
  const w = DELIVERED.week
  const last = GAP_TREE.lastWeek
  const causes = [...GAP_TREE.drivers].sort((a, b) => a.value - b.value)

  const kpis = [
    { figure: fmtBiz(forecast), label: "Forecast this quarter" },
    { figure: fmtBiz(plan), label: "Plan" },
    { figure: gap > 0 ? `−${fmtBiz(gap)}` : `+${fmtBiz(-gap)}`, label: gap > 0 ? "Gap to plan" : "Ahead of plan", bad: gap > 0 },
    { figure: fmtValue(deliveredQ), label: "Delivered by Ally this quarter" },
  ]
  const shipped = [
    { lever: "Content", did: w.content.did, delivered: w.content.delivered },
    { lever: "Ops", did: w.ops.did, delivered: w.ops.delivered },
    { lever: "Media", did: w.media.reason, delivered: w.media.delivered },
  ]
  const next = [
    { what: "Halloween content goes live", when: `by ${shortDate(HALLOWEEN_PUBLISH_BY)}` },
    { what: `${LAUNCH.name} pages approved`, when: `by ${LAUNCH.due}, launches ${LAUNCH.launch}` },
    { what: `${NEXT_EVENT.name} plan`, when: `${NEXT_EVENT.date} · ${NEXT_EVENT.weeks} weeks out` },
  ]

  const exportWbr = () =>
    exportXlsx("Weekly-business-review.xlsx", "WBR", [
      ["Weekly business review", GAP_WEEK.last],
      ...kpis.map((k) => [k.label, k.figure]),
      [],
      ["Last week", `${fmtValue(last.sales)} of ${fmtValue(last.plan)} plan`],
      ...causes.map((c) => [c.title, signed(c.value), c.tag]),
      [],
      ...shipped.map((s) => [`Shipped · ${s.lever}`, s.did, fmtValue(s.delivered)]),
      [],
      ...next.map((n) => [`Next week · ${n.what}`, n.when]),
    ])

  return (
    <>
      <div className="flex items-end justify-between gap-6 px-10 pt-4">
        <div>
          <h1 className="text-[28px] leading-tight font-semibold tracking-tight text-slate-950">Weekly business review</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
            <span className="size-1.5 rounded-full bg-success-500" aria-hidden />
            Week of {GAP_WEEK.last} · updated Mon, 9:00 AM
          </div>
        </div>
        <ExportButton onExport={exportWbr} />
      </div>

      <div className="flex flex-col gap-6 px-10 pt-6 pb-10">
        <div className="grid grid-cols-4 gap-4 max-md:grid-cols-2">
          {kpis.map((k) => (
            <div key={k.label} className="rounded-xl border border-slate-200 px-5 py-4">
              <div className={cn("font-mono text-[26px] leading-none font-semibold", k.bad ? "text-error-600" : "text-slate-950")}>{k.figure}</div>
              <div className="mt-2 text-[13px] text-slate-500">{k.label}</div>
            </div>
          ))}
        </div>

        <section className="rounded-xl border border-slate-200 p-5">
          <div className={HEAD}>Last week vs plan</div>
          <div className="mt-1 text-[15px] font-semibold text-slate-950">
            <span className="font-mono">{fmtValue(last.sales)}</span> of <span className="font-mono">{fmtValue(last.plan)}</span> plan,{" "}
            <span className="font-mono text-error-600">{signed(last.sales - last.plan)}</span>
          </div>
          <ul className="mt-4 divide-y divide-slate-100">
            {causes.map((c) => (
              <li key={c.title} className="grid grid-cols-[minmax(0,1fr)_100px_130px] items-baseline gap-4 py-2.5 text-sm">
                <span className="min-w-0">
                  <span className="block text-slate-950">{c.title}</span>
                  <span className="block text-[13px] text-slate-500">{c.points.join(" · ")}</span>
                </span>
                <span className="text-right font-mono text-slate-950 tabular-nums">{signed(c.value)}</span>
                <span className="text-right text-[13px] text-slate-500">{c.tag === "Live" ? "Still live" : c.tag}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
          <section className="rounded-xl border border-slate-200 p-5">
            <div className={HEAD}>What shipped this week</div>
            <ul className="mt-3 divide-y divide-slate-100">
              {shipped.map((s) => (
                <li key={s.lever} className="grid grid-cols-[80px_minmax(0,1fr)_80px] items-baseline gap-4 py-2.5 text-sm">
                  <span className="font-medium text-slate-950">{s.lever}</span>
                  <span className="min-w-0 text-slate-600">{s.did}</span>
                  <span className="text-right font-mono text-slate-950 tabular-nums">{fmtValue(s.delivered)}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-slate-200 p-5">
            <div className={HEAD}>Next week</div>
            <ul className="mt-3 divide-y divide-slate-100">
              {next.map((n) => (
                <li key={n.what} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-4 py-2.5 text-sm">
                  <span className="text-slate-950">{n.what}</span>
                  <span className="text-[13px] font-medium text-warning-700">{n.when}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  )
}
