"use client"

import { useEffect } from "react"
import { Bell } from "lucide-react"
import { cn } from "@/lib/utils"
import { PageShell } from "@/components/layout/page-shell"
import { TopStrip } from "@/components/nudge/top-strip"
import { AppDrawer } from "@/components/nudge/app-drawer"
import { useNudge } from "@/components/nudge/nudge-context"
import { ALERT_RULES, BUILT_IN_ALERTS, alertTrigger } from "@/components/nudge/alerts/data"
import { modeLabel } from "@/components/nudge/alerts/answers"

/**
 * Michelle's alerts: the ones she wrote in chat, then the signals Ally watches
 * for everyone. New ones are flagged in the sidebar until she opens this page.
 */
export default function AlertsPage() {
  const { alerts: saved, markAlertsSeen } = useNudge()
  // Alerts saved by an older version of the demo get today's fields.
  const alerts = saved.map((a) => ({ ...ALERT_RULES[a.id], ...a }))

  // Opening the page is what clears the sidebar's "new" dot (after the store has loaded).
  useEffect(() => {
    const t = window.setTimeout(markAlertsSeen, 0)
    return () => window.clearTimeout(t)
  }, [markAlertsSeen])

  return (
    <PageShell className="bg-slate-50 xl:bg-white">
      <div className="mx-auto max-w-[1280px] overflow-clip bg-white shadow-pane-lg sm:my-6 sm:rounded-2xl sm:ring-1 sm:ring-slate-900/6 xl:my-0 xl:rounded-none xl:shadow-none xl:ring-0">
        <TopStrip person="michelle" crumbs={[{ label: "Daily brief", href: "/michelle" }, { label: "Alerts" }]} />
        <div className="flex flex-col gap-10 px-10 pt-4 pb-16">
          <h1 className="text-[28px] leading-tight font-semibold tracking-tight text-slate-950">Alerts</h1>

          <section aria-label="Your alerts">
            <h2 className="text-xs font-medium tracking-wide text-slate-500 uppercase">Yours</h2>
            {alerts.length ? (
              <ul className="mt-2 flex flex-col">
                {alerts.map((a) => (
                  <li key={a.id} className={cn("grid grid-cols-[20px_minmax(0,1.3fr)_minmax(0,1fr)_220px] items-start gap-4 border-t border-slate-100 py-4", !a.seen && "bg-brand-25")}>
                    <Bell className="mt-0.5 size-4 text-brand-600" />
                    <div>
                      <div className="flex items-center gap-2 text-[15px] font-semibold text-slate-950">
                        {a.name}
                        {!a.seen && <span className="text-xs font-semibold text-brand-700">New</span>}
                      </div>
                                            <div className="mt-0.5 text-[13px] text-slate-600">{alertTrigger(a)}, the media agent raises our bids.</div>
                    </div>
                    <div className="text-[14px]">
                      {a.firing ? (
                        <>
                          <div className="font-medium text-warning-700">Fired today</div>
                          <div className="text-slate-600">{a.now}</div>
                        </>
                      ) : (
                        <div className="text-slate-600">Watching · {a.now}</div>
                      )}
                    </div>
                    <div className="text-right text-[13px] text-slate-500">
                      {modeLabel(a.mode)}
                      <br />
                      {a.frequency[0].toUpperCase() + a.frequency.slice(1)} · {a.channel}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 border-t border-slate-100 pt-4 text-[14px] text-slate-500">Ask Ally in chat, like &quot;Alert me when our share of voice on gift terms drops below 20%&quot;.</p>
            )}
          </section>

          <section aria-label="Built in">
            <h2 className="text-xs font-medium tracking-wide text-slate-500 uppercase">Built in · on for every account</h2>
            <ul className="mt-2 flex flex-col">
              {BUILT_IN_ALERTS.map((a) => (
                <li key={a.name} className="grid grid-cols-[20px_minmax(0,1fr)_120px] items-start gap-4 border-t border-slate-100 py-3.5">
                  <Bell className="mt-0.5 size-4 text-slate-400" />
                  <div>
                    <div className="text-[14px] font-medium text-slate-950">{a.name}</div>
                    <div className="mt-0.5 text-[13px] text-slate-500">{a.when}</div>
                  </div>
                  <div className="text-right text-[13px] text-slate-500">In your daily brief</div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
      <AppDrawer />
    </PageShell>
  )
}
