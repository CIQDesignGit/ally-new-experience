"use client"

import { useState, type ReactNode } from "react"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { PageShell } from "@/components/layout/page-shell"
import { TopStrip, useViewer } from "@/components/nudge/top-strip"
import { AppDrawer } from "@/components/nudge/app-drawer"
import { AskBar, ChatProvider, ChatThread } from "@/components/nudge/chat/inline-chat"
import { BUSINESS, HALLOWEEN_PUBLISH_BY, fmtBiz, fmtValue } from "@/components/nudge/data"
import { useLive } from "@/components/nudge/live-model"
import { DELIVERED } from "@/components/nudge/delivered-periods"
import { GAP_TREE, GAP_WEEK } from "@/components/nudge/ops/gap-data"
import { BUILT_IN_ALERTS } from "@/components/nudge/alerts/data"
import { LAUNCH } from "@/components/nudge/launch/data"
import { NEXT_EVENT } from "@/components/nudge/market"
import { shortDate } from "@/components/nudge/model"
import { ChartView } from "@/components/nudge/retro/slide"
import type { Chart } from "@/components/nudge/retro/prime-day"
import { ExportButton } from "@/components/nudge/ui/export-button"
import { exportXlsx } from "@/components/competition/exports"
import { LineChart } from "@/components/nudge/wbr/line-chart"
import { PLAN_8W, SALES_8W, SOV_8W, WEEKS, WORST_SKUS } from "@/components/nudge/wbr/data"
import { NAMES as COMPETITION } from "@/components/competition/data"

/** $M → "−$102K" / "+$1.2M", signed. */
const signed = (v: number) => `${v < 0 ? "−" : "+"}${fmtValue(Math.abs(v))}`
const BRAND = "#4f46e5"
const MUTED = "#94a3b8"
const LOSS = "#d92d20"

/**
 * The weekly business review, on for every brand: Ally's summary on top, then
 * two pages of six tiles (charts and tables). Every number is a forecast
 * against plan or measured; nothing projects Ally's value.
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

/** One tile of the grid: a title, then its chart or table filling the rest. */
function Tile({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex h-[300px] flex-col rounded-xl border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      <div className="mt-3 min-h-0 flex-1">{children}</div>
    </section>
  )
}

/** The shared chart, sized for a tile. */
function Bars({ chart }: { chart: Chart }) {
  return (
    <div className="h-full" style={{ fontSize: 28 }}>
      <ChartView chart={chart} theme="default" />
    </div>
  )
}

/** A compact table: first column text, the rest numbers. */
function Table({ head, rows }: { head: string[]; rows: (string | { text: string; bad?: boolean })[][] }) {
  const cols = `minmax(0,1fr) ${head
    .slice(1)
    .map(() => "auto")
    .join(" ")}`
  return (
    <div className="text-[13px]">
      <div className="grid gap-x-4 border-b border-slate-200 pb-1.5 text-xs font-medium text-slate-500" style={{ gridTemplateColumns: cols }}>
        {head.map((h, i) => (
          <span key={h} className={i ? "text-right" : ""}>
            {h}
          </span>
        ))}
      </div>
      {rows.map((r, ri) => (
        <div key={ri} className="grid items-baseline gap-x-4 border-b border-slate-100 py-[5px] last:border-b-0" style={{ gridTemplateColumns: cols }}>
          {r.map((c, i) => {
            const cell = typeof c === "string" ? { text: c } : c
            return (
              <span key={i} className={cn(i ? "text-right font-mono tabular-nums" : "min-w-0 truncate text-slate-950", cell.bad ? "text-error-600" : i ? "text-slate-950" : "")}>
                {cell.text}
              </span>
            )
          })}
        </div>
      ))}
    </div>
  )
}

function Wbr() {
  const [page, setPage] = useState<1 | 2>(1)
  const { pace } = useLive()
  const forecast = pace("quarter")
  const plan = BUSINESS.quarter.plan
  const gap = plan - forecast
  const q = DELIVERED.quarter
  const w = DELIVERED.week
  const last = GAP_TREE.lastWeek
  const causes = [...GAP_TREE.drivers].sort((a, b) => a.value - b.value)
  const top = causes[0]
  const next = [
    { what: "Halloween content goes live", when: `by ${shortDate(HALLOWEEN_PUBLISH_BY)}` },
    { what: `${LAUNCH.name} pages approved`, when: `by ${LAUNCH.due}` },
    { what: `${LAUNCH.name} launches`, when: LAUNCH.launch },
    { what: `${NEXT_EVENT.name} plan`, when: `${NEXT_EVENT.date} · ${NEXT_EVENT.weeks} weeks out` },
  ]

  // Ally's summary, written from the same numbers as the tiles below.
  const summary = [
    gap > 0 ? `Quarter lands at ${fmtBiz(forecast)} against ${fmtBiz(plan)} plan: ${fmtBiz(gap)} short` : `Quarter lands at ${fmtBiz(forecast)}, ${fmtBiz(-gap)} ahead of plan`,
    `Last week ${fmtValue(last.sales)}, ${fmtValue(last.plan - last.sales)} under plan; biggest cause: ${top.title.charAt(0).toLowerCase() + top.title.slice(1)} (${signed(top.value)})`,
    `Next: ${next[0].what} ${next[0].when}; ${next[1].what} ${next[1].when}`,
  ]

  const exportWbr = () =>
    exportXlsx("Weekly-business-review.xlsx", "WBR", [
      ["Weekly business review", GAP_WEEK.last],
      ...summary.map((s) => [s]),
      [],
      ["Week ending", ...WEEKS],
      ["Sales ($M)", ...SALES_8W],
      ["Plan ($M)", ...PLAN_8W],
      [],
      ...causes.map((c) => [c.title, signed(c.value), c.tag]),
      [],
      ...WORST_SKUS.map((s) => [s.name, fmtValue(s.sales), fmtValue(s.plan), signed(s.gap)]),
      [],
      ...next.map((n) => [n.what, n.when]),
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

      <div className="flex flex-col gap-5 px-10 pt-6 pb-10">
        <section className="rounded-xl border border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-ally-700">
            <Sparkles className="size-4" aria-hidden /> Ally&apos;s summary
          </div>
          <ul className="mt-2 flex flex-col gap-1 text-[15px] text-slate-950">
            {summary.map((s) => (
              <li key={s} className="flex gap-2">
                <span className="mt-2.5 size-1 shrink-0 rounded-full bg-slate-400" aria-hidden />
                {s}
              </li>
            ))}
          </ul>
        </section>

        <div role="tablist" className="flex gap-6 border-b border-slate-200">
          {([1, 2] as const).map((p) => (
            <button key={p} role="tab" aria-selected={page === p} type="button" onClick={() => setPage(p)} className={cn("-mb-px border-b-2 py-2.5 text-sm font-medium", page === p ? "border-brand-500 text-brand-700" : "border-transparent text-slate-500 hover:text-slate-900")}>
              {p === 1 ? "Performance" : "Drivers and next week"}
            </button>
          ))}
        </div>

        {page === 1 ? (
          <div className="grid grid-cols-3 gap-4 max-lg:grid-cols-1">
            <Tile title="Sales vs plan, last 8 weeks">
              <LineChart labels={WEEKS} format={(v) => `$${v.toFixed(2)}M`} series={[{ name: "Sales", values: SALES_8W, color: BRAND }, { name: "Plan", values: PLAN_8W, color: MUTED, dashed: true }]} />
            </Tile>
            <Tile title="Last week's gap by cause">
              <Bars chart={{ kind: "rows", zeroAt: 1, bars: causes.map((c) => ({ label: c.title.length > 26 ? `${c.title.slice(0, 25)}…` : c.title, value: c.value, display: signed(c.value), tone: "loss" as const })) }} />
            </Tile>
            <Tile title="Sales by brand vs plan">
              <Table head={["Brand", "Sales", "Plan", "Gap"]} rows={(GAP_TREE.children ?? []).map((b) => [b.name, fmtValue(b.lastWeek.sales), fmtValue(b.lastWeek.plan), { text: signed(b.lastWeek.sales - b.lastWeek.plan), bad: b.lastWeek.sales < b.lastWeek.plan }])} />
            </Tile>
            <Tile title="Why sales moved, last week">
              <Bars chart={{ kind: "rows", zeroAt: 0.5, bars: (["traffic", "conversion", "price", "sales"] as const).map((k) => ({ label: k.charAt(0).toUpperCase() + k.slice(1), value: GAP_TREE.equation[k], display: `${GAP_TREE.equation[k] > 0 ? "+" : GAP_TREE.equation[k] < 0 ? "−" : ""}${Math.abs(GAP_TREE.equation[k])}%`, tone: GAP_TREE.equation[k] < 0 ? ("loss" as const) : ("muted" as const) })) }} />
            </Tile>
            <Tile title="Delivered by Ally this quarter">
              <Bars chart={{ kind: "columns", bars: [{ label: "Content", value: q.content.delivered, display: fmtValue(q.content.delivered), tone: "accent" }, { label: "Media", value: q.media.delivered, display: fmtValue(q.media.delivered), tone: "media" }, { label: "Ops", value: q.ops.delivered, display: fmtValue(q.ops.delivered), tone: "ops" }] }} />
            </Tile>
            <Tile title="What shipped this week">
              <Table head={["Lever", "Delivered"]} rows={[[`Content · ${w.content.did}`, fmtValue(w.content.delivered)], [`Ops · ${w.ops.did}`, fmtValue(w.ops.delivered)], [`Media · ${w.media.reason}`, fmtValue(w.media.delivered)]]} />
            </Tile>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 max-lg:grid-cols-1">
            <Tile title="SKUs furthest below plan">
              <Table head={["SKU", "Sales", "Gap"]} rows={WORST_SKUS.map((s) => [s.name, fmtValue(s.sales), { text: signed(s.gap), bad: s.gap < 0 }])} />
            </Tile>
            <Tile title={`Share of voice on gift terms: you vs ${COMPETITION.competitor}`}>
              <LineChart labels={WEEKS} format={(v) => `${v}%`} series={[{ name: "You", values: SOV_8W.ours, color: BRAND }, { name: COMPETITION.competitor, values: SOV_8W.theirs, color: LOSS }]} />
            </Tile>
            <Tile title="Alerts this week">
              {/* Alerts that fired; autopilot fixes are a running count, not an alert. */}
              <Table head={["Alert", "Now"]} rows={BUILT_IN_ALERTS.filter((a) => a.mode !== "autopilot").map((a) => [a.name, a.now])} />
            </Tile>
            <Tile title="Content delivered by type of work">
              <Bars chart={{ kind: "rows", bars: q.content.workTypes.map((t) => ({ label: t.name, value: t.delivered, display: fmtValue(t.delivered), tone: "accent" as const })) }} />
            </Tile>
            <Tile title="Ops delivered by type of fix">
              <Bars chart={{ kind: "rows", bars: q.ops.workTypes.map((t) => ({ label: t.name, value: t.delivered, display: fmtValue(t.delivered), tone: "ops" as const })) }} />
            </Tile>
            <Tile title="Next week">
              <Table head={["Due", "When"]} rows={next.map((n) => [n.what, n.when])} />
            </Tile>
          </div>
        )}
      </div>
    </>
  )
}
