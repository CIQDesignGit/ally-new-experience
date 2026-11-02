"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { PageShell } from "@/components/layout/page-shell"
import { TopStrip } from "@/components/nudge/top-strip"
import { AppDrawer } from "@/components/nudge/app-drawer"
import { useNudge } from "@/components/nudge/nudge-context"
import { AnswerCard, AskBar, ChatProvider, ChatThread, StarterChips } from "@/components/nudge/chat/inline-chat"
import { ALERT_RULES, BUILT_IN_ALERTS, alertTrigger } from "@/components/nudge/alerts/data"
import type { CustomAlert } from "@/components/nudge/alerts/data"
import { AlertCard, isCrossed } from "@/components/nudge/alerts/alert-card"
import { RunList } from "@/components/nudge/runs/run-list"
import { PROMO_ALERT } from "@/components/nudge/cs/data"
import { MONDAY_BRIEF, doesFromMode, type RunItem } from "@/components/nudge/runs/data"
import { useCompetition } from "@/components/competition/state"
import { NAMES as COMPETITION, TIMES as COMPETITION_TIMES } from "@/components/competition/data"
import { exportXlsx } from "@/components/competition/exports"
import { useLive } from "@/components/nudge/live-model"
import { ExportButton } from "@/components/nudge/ui/export-button"

/**
 * Michelle's alerts in one list and one format: the ones she wrote in chat and
 * the ones Ally runs for every account, each with its number now, its trend and
 * the autonomy it runs at. Her own open into the full card to edit.
 */
export default function AlertsPage() {
  return (
    <ChatProvider thread={{ where: "Alerts", home: "/michelle" }}>
      <Alerts />
    </ChatProvider>
  )
}

const NOW: Record<CustomAlert["id"], string> = { "brand-terms": "27%", "gift-terms": "18%" }

function Alerts() {
  const { alerts: saved, addAlert, markAlertsSeen, runs, callItems } = useNudge()
  // Alerts saved by an older version of the demo get today's fields.
  const alerts = saved.map((a) => ({ ...ALERT_RULES[a.id], ...a }))

  // Opening the page is what clears the sidebar's "new" dot (after the store has loaded).
  useEffect(() => {
    const t = window.setTimeout(markAlertsSeen, 0)
    return () => window.clearTimeout(t)
  }, [markAlertsSeen])

  // Everything on one clock in one shape: the briefs Ally sends, then the alerts it watches (yours first, then Ally's own).
  const added = runs.added
  const briefs: RunItem[] = [MONDAY_BRIEF, ...added.filter((x) => x.kind === "brief" && !x.plan)]
  const custom: RunItem[] = alerts.map((a) => ({
    id: `alert-${a.id}`,
    kind: "alert",
    name: a.name,
    what: alertTrigger(a),
    runs: a.frequency.charAt(0).toUpperCase() + a.frequency.slice(1),
    does: doesFromMode(a.mode),
    owner: "yours",
    last: NOW[a.id] + (isCrossed(a.id, a.threshold) ? " · fired" : ""),
    by: `From chat · ${a.created}`,
  }))
  const builtIn: RunItem[] = BUILT_IN_ALERTS.map((b) => ({
    id: `builtin-${b.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    kind: "alert",
    name: b.name,
    what: b.when,
    runs: "Every morning",
    does: doesFromMode(b.mode),
    owner: "built in",
    last: b.now,
  }))
  // Alerts Ally set up from a customer call (Sarah's account) show here unless she undid them.
  const fromCalls = callItems["a-alert"] === "dismissed" ? [] : [PROMO_ALERT]
  // The competition skill's alert, once it's live: published by an engineer from request #412 (Borrow), or built by Ally in her chat (Build).
  const competition = useCompetition()
  const tracker: RunItem[] =
    competition.stage === "live"
      ? [
          {
            id: "alert-competition",
            kind: "alert",
            name: `${COMPETITION.competitor} competition watch`,
            what: `When ${COMPETITION.competitor}'s share moves more than ${competition.threshold} pts in a week, or a new deal hits a matched gift set`,
            runs: `Every ${competition.day}`,
            does: "tell",
            owner: "yours",
            last: "4 deals · fired Oct 8",
            by: competition.selfBuilt ? `Built in chat · ${COMPETITION_TIMES.built}` : `Built by ${COMPETITION.fde} · request ${COMPETITION.request}`,
          },
        ]
      : []
  const alertItems = [...custom, ...tracker, ...fromCalls, ...added.filter((x) => x.kind === "alert"), ...builtIn]
  const exportAlerts = () =>
    exportXlsx("Aurelle-alerts.xlsx", "Alerts", [["Alert", "When it fires", "Runs", "Last run", "Owner"], ...alertItems.map((a) => [a.name, a.what, a.runs, a.last ?? "", a.owner === "yours" ? "Yours" : "Built in"])])
  // Michelle's own alerts keep their full card (terms, threshold, cap); the rest use the shared editor.
  const editor = (i: RunItem) => {
    const a = alerts.find((x) => `alert-${x.id}` === i.id)
    return a ? <AlertCard id={a.id} draft={a} onChange={(patch) => addAlert({ ...a, ...patch })} /> : null
  }

  return (
    <PageShell className="bg-slate-50 xl:bg-white">
      <StarterChips id="alerts" chips={STARTERS} />
      <div className="mx-auto max-w-[1280px] overflow-clip bg-white shadow-pane-lg sm:my-6 sm:rounded-2xl sm:ring-1 sm:ring-slate-900/6 xl:my-0 xl:rounded-none xl:shadow-none xl:ring-0">
        <TopStrip person="michelle" crumbs={[{ label: "Today", href: "/michelle" }, { label: "Scheduled" }]} />
        <div className="flex flex-col gap-6 px-10 pt-4 pb-12">
          {/* Everything Ally runs on its own clock. Each opens in place to edit; "New" turns a sentence into a draft. */}
          <div className="flex items-end justify-between gap-6">
            <h1 className="text-[28px] leading-tight font-semibold tracking-tight text-slate-950">Scheduled</h1>
            {/* More briefs and alerts come from the library. */}
            <div className="flex items-center gap-2">
              <Link href="/library" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50">
                <Plus className="size-4" /> Add from library
              </Link>
              <ExportButton onExport={exportAlerts} />
            </div>
          </div>
          <RunList title="Briefs" items={briefs} kind="scheduled" placeholder="Send me a promo recap every Friday" />
          <RunList title="Alerts" items={alertItems} kind="scheduled" placeholder="Tell me when gift-set share of voice drops below 20%" editor={editor} />
        </div>
        <ChatThread />
      </div>
      <AppDrawer />
      <AskBar />
    </PageShell>
  )
}

/** The MVP's answer: the same alerts, each at its impact on the gap to plan instead of what its fix is worth. */
function FiredMvp() {
  const { actionImpact } = useLive()
  const rows: [string, string, number, string][] = [
    ["Lost buy box", "6 SKUs", 0.108, "one approval away"],
    ["Promo badge missing", "5 SKUs", 0.072, "one approval away"],
    ["Shows out of stock, but isn't", "5 SKUs", 0.06, "one approval away"],
    ["Deal page visibility", "8 SKUs", 0.048, "one approval away"],
    ["Shipping speed slipped", "4 SKUs", 0.024, "one approval away"],
    ["Chargeback disputes", "9 claims", 0.35, "needs your input"],
  ]
  return (
    <AnswerCard>
      <p className="font-semibold text-slate-950">Five fired with fixes one approval away. Chargebacks need your input, and promotions ran on autopilot.</p>
      <ul className="mt-2 flex flex-col gap-1 text-[14px]">
        {rows.map(([name, count, v, how]) => (
          <li key={name}>
            · {name}: {count}, {actionImpact(v)} impact · {how}
          </li>
        ))}
        <li>· Promotion not live: 51 fixed this quarter · on autopilot</li>
      </ul>
      <Link href="/michelle" className="mt-3 inline-block text-[14px] font-medium text-brand-700 hover:underline">
        Open them in your daily brief
      </Link>
    </AnswerCard>
  )
}

function Fired() {
  const { mvp } = useLive()
  if (mvp) return <FiredMvp />
  return (
      <AnswerCard>
        <p className="font-semibold text-slate-950">Five fired with fixes one approval away, worth $312K. Chargebacks need your input, and promotions ran on autopilot.</p>
        <ul className="mt-2 flex flex-col gap-1 text-[14px]">
          <li>· Lost buy box: 6 SKUs, +$108K · one approval away</li>
          <li>· Promo badge missing: 5 SKUs, +$72K · one approval away</li>
          <li>· Shows out of stock, but isn&apos;t: 5 SKUs, +$60K · one approval away</li>
          <li>· Deal page visibility: 8 SKUs, +$48K · one approval away</li>
          <li>· Shipping speed slipped: 4 SKUs, +$24K · one approval away</li>
          <li>· Chargeback disputes: 9 claims, +$350K · needs your input</li>
          <li>· Promotion not live: 51 fixed this quarter, $200K · on autopilot</li>
        </ul>
        <Link href="/michelle" className="mt-3 inline-block text-[14px] font-medium text-brand-700 hover:underline">
          Open them in your daily brief
        </Link>
      </AnswerCard>
  )
}

const STARTERS = [
  {
    q: "Which alerts fired this week?",
    render: () => <Fired />,
  },
  {
    q: "What's on autopilot?",
    render: () => (
      <AnswerCard>
        <ul className="flex flex-col gap-1 text-[14px]">
          <li>· Promotion not live: Ally fixes the setup and resubmits it. 51 so far this quarter, $200K.</li>
          <li>· Competitors on our brand terms, if you set it: the media agent raises bids, up to $4K a week.</li>
          <li>· Everything else waits for one approval or your input. Move an alert to autopilot from its card.</li>
        </ul>
      </AnswerCard>
    ),
  },
]
