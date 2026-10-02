"use client"

import { useEffect } from "react"
import Link from "next/link"
import { LayoutDashboard } from "lucide-react"
import { cn } from "@/lib/utils"
import { useNudge } from "../nudge-context"
import { useChat } from "../chat/inline-chat"
import { OpenItem } from "../chat/open-item"
import { BADGE_SKUS, PROMO_DEPTH, PROMO_LIFT, PROMO_MONTH, PROMO_QUESTIONS, PROMO_WIDGETS } from "./data"
import type { PromoWidget } from "./data"

/**
 * Use case 3: promotions, three answers that each become a dashboard widget.
 * A widget is the answer's headline plus its one chart or table, so the same
 * component renders in chat and on the dashboard, and stays live in both.
 */

export const WIDGET_HEADLINE: Record<PromoWidget, string> = {
  "promo-month": `Promo sales are ${PROMO_MONTH.sales} this month, up ${PROMO_MONTH.growth} on last year. The Halloween deal lags: its badge is missing on 5 SKUs.`,
  "promo-badge": "5 Halloween SKUs have run 8 days without the deal badge: $72K at risk before the deal ends Oct 31.",
  "promo-vs-brightwick": "Brightwick runs deeper promos on gift sets: 30% off, while ours are at full price.",
}

export function PromoWidgetBody({ id, focus }: { id: PromoWidget; focus?: string }) {
  if (id === "promo-month") return <LiftChart />
  if (id === "promo-badge") return <BadgeTable />
  return <DepthTable focus={focus} />
}

/** Lift by promo type, one scale; the lagging Halloween deal is the one called out. */
function LiftChart() {
  const max = Math.max(...PROMO_LIFT.map((p) => p.value))
  return (
    <div className="flex flex-col gap-2">
      <div className="text-[12px] text-slate-500">Lift vs the same promos last year</div>
      {PROMO_LIFT.map((p) => (
        <div key={p.label} className="grid grid-cols-[130px_minmax(0,1fr)_56px] items-center gap-3 text-[14px]">
          <span className="text-slate-800">{p.label}</span>
          <span className="relative h-2.5 rounded-sm bg-slate-100">
            <i className={cn("absolute inset-y-0 left-0 rounded-sm", p.note ? "bg-warning-500" : "bg-brand-500")} style={{ width: `${(p.value / max) * 100}%` }} />
          </span>
          <span className="text-right font-mono text-slate-950">+{p.value}%</span>
          {p.note && <span className="col-start-2 -mt-1 text-[12px] text-warning-700">{p.note}</span>}
        </div>
      ))}
    </div>
  )
}

function BadgeTable() {
  return (
    <table className="w-full text-[14px]">
      <thead>
        <tr className="text-left text-[12px] text-slate-500">
          <th className="pb-1.5 font-medium">SKU</th>
          <th className="pb-1.5 font-medium">Promo</th>
          <th className="pb-1.5 text-right font-medium">Days without badge</th>
          <th className="pb-1.5 text-right font-medium">At risk</th>
        </tr>
      </thead>
      <tbody>
        {BADGE_SKUS.map((s) => (
          <tr key={s.asin} className="border-t border-slate-100">
            <td className="py-1.5 pr-3 text-slate-800">{s.name}</td>
            <td className="py-1.5 pr-3 text-slate-600">Halloween, 20% off</td>
            <td className="py-1.5 text-right font-mono text-slate-950">{s.days}</td>
            <td className="py-1.5 text-right font-mono text-slate-950">${s.risk}K</td>
          </tr>
        ))}
        <tr className="border-t border-slate-200 font-semibold">
          <td className="py-1.5 text-slate-950">All 5 SKUs</td>
          <td />
          <td />
          <td className="py-1.5 text-right font-mono text-slate-950">${BADGE_SKUS.reduce((n, s) => n + s.risk, 0)}K</td>
        </tr>
      </tbody>
    </table>
  )
}

function DepthTable({ focus }: { focus?: string }) {
  return (
    <table className="w-full text-[14px]">
      <thead>
        <tr className="text-left text-[12px] text-slate-500">
          <th className="pb-1.5 font-medium">Category</th>
          <th className="pb-1.5 text-right font-medium">Our promo depth</th>
          <th className="pb-1.5 text-right font-medium">Brightwick&apos;s promo depth</th>
        </tr>
      </thead>
      <tbody>
        {PROMO_DEPTH.map((r) => (
          <tr key={r.category} className={cn("border-t border-slate-100", focus && focus !== r.category && "opacity-30", r.them - r.us >= 20 && "font-semibold")}>
            <td className="py-1.5 text-slate-800">{r.category}</td>
            <td className="py-1.5 text-right font-mono text-slate-950">{r.us ? `${r.us}% off` : "Full price"}</td>
            <td className={cn("py-1.5 text-right font-mono", r.them - r.us >= 20 ? "text-error-600" : "text-slate-950")}>{r.them ? `${r.them}% off` : "Full price"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/** The chat answer: headline, the widget, and (for the first) the queue items it found. */
export function PromoAnswer({ id }: { id: PromoWidget }) {
  return (
    <div className="flex max-w-[860px] flex-col gap-4 text-[15px] leading-relaxed text-slate-700">
      <p className="text-[17px] font-semibold text-slate-950">{WIDGET_HEADLINE[id]}</p>
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <PromoWidgetBody id={id} />
      </div>
      {id === "promo-month" && (
        <div className="flex flex-wrap gap-2">
          <OpenItem batch="promo-badge">Missing promo badge · 5 SKUs · +$72K</OpenItem>
          <OpenItem batch="deal-page">Deal page visibility · 8 SKUs · +$48K</OpenItem>
        </div>
      )}
      {id === "promo-badge" && (
        <div>
          <OpenItem batch="promo-badge" primary>
            Review the badge fix
          </OpenItem>
        </div>
      )}
    </div>
  )
}

export const SAVE_ASK = "Save these as a dashboard"
// One save per dashboard per page load, even when React mounts the answer twice in development.
const saved = new Set<string>()

/** Saves the promo answers asked so far as widgets, named from what was typed ("…called Promo health"). */
export function SaveDashboardAnswer() {
  const { turns } = useChat()
  const { saveDashboard } = useNudge()
  const said = [...turns].reverse().find((t) => t.chip === SAVE_ASK)?.q ?? ""
  const name = said.match(/called\s+["“]?([^"”.]+)/i)?.[1]?.trim() || "Promo health"
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  const widgets = PROMO_WIDGETS.filter((w) => turns.some((t) => t.chip === PROMO_QUESTIONS[w]))

  useEffect(() => {
    if (saved.has(id) || !widgets.length) return
    saved.add(id)
    saveDashboard({ id, name, widgets: [...widgets], created: new Date().toISOString(), seen: false })
  }, [id, name, widgets, saveDashboard])

  if (!widgets.length) return <p className="text-[15px] text-slate-700">Ask me a question or two first; each answer becomes a widget.</p>
  return (
    <div className="flex max-w-[640px] flex-col gap-3 text-[15px] leading-relaxed text-slate-700">
      <p>
        <b className="font-semibold text-slate-950">Saved {name}.</b> {widgets.length} {widgets.length === 1 ? "widget" : "widgets"}, live, refreshed every morning. Each one opens back into this chat.
      </p>
      <Link href={`/michelle/dashboards/${id}`} className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[14px] font-medium text-slate-950 hover:border-brand-300 hover:text-brand-700">
        <LayoutDashboard className="size-4 text-brand-600" /> Open {name}
      </Link>
    </div>
  )
}
