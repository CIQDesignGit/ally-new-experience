"use client"

import { Fragment, useEffect, useState } from "react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { PageShell } from "@/components/layout/page-shell"
import { TopStrip } from "@/components/nudge/top-strip"
import { AppDrawer } from "@/components/nudge/app-drawer"
import { useNudge } from "@/components/nudge/nudge-context"
import { AnswerCard, AskBar, ChatProvider, ChatThread, StarterChips } from "@/components/nudge/chat/inline-chat"
import { ALERT_RULES, ALERT_TRENDS, BUILT_IN_ALERTS, alertTrigger } from "@/components/nudge/alerts/data"
import type { CustomAlert } from "@/components/nudge/alerts/data"
import { AlertCard, isCrossed, modeLabel } from "@/components/nudge/alerts/alert-card"

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
  const { alerts: saved, addAlert, markAlertsSeen } = useNudge()
  // Alerts saved by an older version of the demo get today's fields.
  const alerts = saved.map((a) => ({ ...ALERT_RULES[a.id], ...a }))
  const [open, setOpen] = useState<string>()

  // Opening the page is what clears the sidebar's "new" dot (after the store has loaded).
  useEffect(() => {
    const t = window.setTimeout(markAlertsSeen, 0)
    return () => window.clearTimeout(t)
  }, [markAlertsSeen])

  return (
    <PageShell className="bg-slate-50 xl:bg-white">
      <StarterChips id="alerts" chips={STARTERS} />
      <div className="mx-auto max-w-[1280px] overflow-clip bg-white shadow-pane-lg sm:my-6 sm:rounded-2xl sm:ring-1 sm:ring-slate-900/6 xl:my-0 xl:rounded-none xl:shadow-none xl:ring-0">
        <TopStrip person="michelle" crumbs={[{ label: "Daily brief", href: "/michelle" }, { label: "Alerts" }]} />
        <div className="flex flex-col gap-6 px-10 pt-4 pb-12">
          <h1 className="text-[28px] leading-tight font-semibold tracking-tight text-slate-950">Alerts</h1>

          <table className="w-full text-[14px]">
            <thead>
              <tr className="text-left text-[12px] text-slate-500">
                <th className="pb-2 font-medium">Alert</th>
                <th className="w-[110px] pb-2 font-medium">Now</th>
                <th className="w-[120px] pb-2 font-medium">8 weeks</th>
                <th className="w-[260px] pb-2 font-medium">When it fires</th>
                <th className="w-[28px]" />
              </tr>
            </thead>
            <tbody>
              {alerts.map((a) => (
                <Fragment key={a.id}>
                  <tr onClick={() => setOpen(open === a.id ? undefined : a.id)} className={cn("cursor-pointer border-t border-slate-100 hover:bg-slate-25", !a.seen && "bg-brand-25")}>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2 font-semibold text-slate-950">
                        {a.name}
                        {!a.seen && <span className="text-xs font-semibold text-brand-700">New</span>}
                      </div>
                      <div className="text-[13px] text-slate-500">{alertTrigger(a).replace(/^When (\w)/, (_, c: string) => c.toUpperCase())} · yours</div>
                    </td>
                    <td className={cn("py-3 font-mono font-semibold", isCrossed(a.id, a.threshold) ? "text-error-600" : "text-slate-950")}>{NOW[a.id]}</td>
                    <td className="py-3">
                      <Spark values={ALERT_TRENDS[a.id]} alarm />
                    </td>
                    <td className="py-3 text-slate-800">{modeLabel(a.mode)}</td>
                    <td className="py-3 text-slate-400">
                      <ChevronDown className={cn("size-4 transition-transform", open === a.id && "rotate-180")} />
                    </td>
                  </tr>
                  {open === a.id && (
                    <tr>
                      <td colSpan={5} className="pb-4">
                        <AlertCard id={a.id} draft={a} onChange={(patch) => addAlert({ ...a, ...patch })} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {BUILT_IN_ALERTS.map((b) => (
                <tr key={b.name} className="border-t border-slate-100">
                  <td className="py-3 pr-4">
                    <div className="font-semibold text-slate-950">{b.name}</div>
                    <div className="text-[13px] text-slate-500">{b.when} · built in</div>
                  </td>
                  <td className="py-3 font-mono text-slate-950">{b.now}</td>
                  <td className="py-3">
                    <Spark values={b.trend} />
                  </td>
                  <td className="py-3 text-slate-800">{modeLabel(b.mode).replace(/, up to.*$/, "")}</td>
                  <td />
                </tr>
              ))}
            </tbody>
          </table>
          {!alerts.length && <p className="text-[14px] text-slate-500">Write your own in chat, like &quot;Alert me when our share of voice on gift terms drops below 20%.&quot;</p>}
        </div>
        <ChatThread />
      </div>
      <AppDrawer />
      <AskBar />
    </PageShell>
  )
}

function Spark({ values, alarm }: { values: number[]; alarm?: boolean }) {
  const max = Math.max(...values)
  const min = Math.min(...values)
  const y = (v: number) => 20 - ((v - min) / (max - min || 1)) * 16
  return (
    <svg viewBox="0 0 96 24" className="h-6 w-24" aria-hidden>
      <polyline points={values.map((v, i) => `${(i / (values.length - 1)) * 92 + 2},${y(v)}`).join(" ")} fill="none" stroke={alarm ? "#dc2626" : "#64748b"} strokeWidth={1.5} strokeLinejoin="round" />
    </svg>
  )
}

const STARTERS = [
  {
    q: "Which alerts fired this week?",
    render: () => (
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
    ),
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
