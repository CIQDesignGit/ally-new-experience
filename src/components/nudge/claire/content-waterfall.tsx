"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { TEAM_TIER, fmtValue } from "../data"
import { useNudge } from "../nudge-context"
import { useFireNudge } from "../use-fire-nudge"
import { MethodTag } from "./delivered/method-tag"
import type { ContentDelivered, WorkType } from "../delivered-content-data"
import type { TierRow } from "../types"

const HEIGHT = 190
const LABEL_HEIGHT = 44
const PAD_TOP = 28
const DOT = { orange: "bg-warning-500", red: "bg-error-500", green: "bg-success-500", learn: "" }
/** Content waterfall order: everyday content first, then the event, then unblocking. */
const CONTENT_ORDER = ["foundational", "seasonal", "retail-readiness"]
/**
 * Types are one family (all content), so one purple; the labels name them. The total is a
 * mid-gray neutral (not black) so the default selection reads as the sum. Tried a hue per type: too loud,
 * and teal read as "success green".
 */
const TOTAL_BAR = "bg-slate-500"

type Bullets = NonNullable<WorkType["bullets"]>

/** Money and percentages inside a bullet. */
const FIGURE = /([−-]\$[\d.,]+[KM]?|\+?\$[\d.,]+[KM]?|\+?[\d.]+%)/g

/**
 * A bullet's text with its figures colored by the number rule (design-specs.md):
 * a loss carries a minus and is red; in a bullet about what worked, gains are green.
 */
function Figures({ text, tone }: { text: string; tone: Bullets[number]["tone"] }) {
  return (
    <>
      {text.split(FIGURE).map((part, i) =>
        i % 2 === 0 ? (
          part
        ) : (
          <span
            key={i}
            className={cn("font-medium whitespace-nowrap", part.startsWith("−") || part.startsWith("-") ? "text-error-600" : tone === "green" ? "text-success-700" : undefined)}
          >
            {part}
          </span>
        ),
      )}
    </>
  )
}

/** The content owner's "needs your team" row: Nudge team on a bullet nudges it (real Slack DM to Mike). */
const CONTENT_TEAM_ROW = TEAM_TIER.rows.find((r) => r.agent === "content")!

const HOVER_BTN =
  "absolute right-0 -bottom-1 rounded-md border border-brand-200 bg-white px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap text-brand-700 opacity-0 transition-opacity group-hover/b:opacity-100 hover:bg-brand-50 focus-visible:opacity-100"

function BulletCard({
  title,
  method,
  bullets,
  className,
  canNudge = true,
  teamRow = CONTENT_TEAM_ROW,
}: {
  title: string
  method?: string
  bullets?: Bullets
  className?: string
  canNudge?: boolean
  teamRow?: TierRow
}) {
  const { nudged } = useNudge()
  const { fire } = useFireNudge()
  const teamNudged = !!(teamRow.nudgeKey && nudged[teamRow.nudgeKey])
  return (
    <div className={cn("rounded-lg border border-slate-200 bg-white px-4 py-3.5", className)}>
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-950">
        {title}
        {method && <MethodTag method={method} />}
      </div>
      <ul className="flex flex-col gap-2">
        {bullets?.map((b) => (
          <li key={b.text} className="group/b relative flex items-start gap-2.5 text-left text-sm font-normal text-slate-700">
            {b.tone === "learn" ? (
              <Sparkles className="mt-0.5 size-3.5 shrink-0 text-ally-600" />
            ) : (
              <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", DOT[b.tone])} />
            )}
            <span className="flex-1">
              <Figures text={b.text} tone={b.tone} />
            </span>
            {/* Pinned over the empty end of the bullet's last line, so hiding it costs no width. */}
            {b.action === "nudge-team" &&
              canNudge &&
              (teamNudged ? (
                <span className="absolute right-0 -bottom-1 text-xs font-semibold text-success-700">Team nudged</span>
              ) : (
                <button type="button" onClick={() => fire(teamRow)} className={HOVER_BTN}>
                  Nudge team
                </button>
              ))}
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Content, opened: delivered by type stacked into the total, against the
 * projected line. The panel below shows the selected bar's 2–3 bullets; it
 * opens on the Content total so the story shows without a click. (Hover and
 * click popovers were tried and dropped: they hide the story until you act.)
 */
/**
 * canNudge: off on Mike's page, where the team is Mike. The same chart serves the ops agent:
 * pass its order, total label, bar color and owner row.
 */
export function ContentWaterfall({
  data,
  resultsHref,
  canNudge = true,
  order = CONTENT_ORDER,
  totalLabel = "Content",
  barClass = "bg-brand-400",
  teamRow = CONTENT_TEAM_ROW,
}: {
  data: ContentDelivered
  resultsHref?: string
  canNudge?: boolean
  order?: string[]
  totalLabel?: string
  barClass?: string
  teamRow?: TierRow
}) {
  const [selected, setSelected] = useState("total")

  const types = order.map((id) => data.workTypes.find((w) => w.id === id)!).filter(Boolean)
  const pct = (v: number) => (v / data.promised) * 100
  let acc = 0
  const cols = [
    ...types.map((w) => {
      const col = { key: w.id, label: w.name, method: w.method as string | undefined, bullets: w.bullets, sub: `of ${fmtValue(w.promised)} projected`, value: `+${fmtValue(w.delivered)}`, start: acc, end: acc + w.delivered }
      acc += w.delivered
      return col
    }),
    { key: "total", label: totalLabel, method: undefined, bullets: data.bullets, sub: `of ${fmtValue(data.promised)} projected`, value: fmtValue(data.delivered), start: 0, end: data.delivered },
  ]
  const panel = cols.find((c) => c.key === selected)!

  return (
    <div className="flex flex-col gap-4">
      <div className="relative flex items-end gap-3">
        <div className="pointer-events-none absolute inset-x-0 z-10 border-t-2 border-dashed border-slate-400" style={{ top: PAD_TOP }}>
          <span className="absolute -top-5 right-0 bg-slate-25 px-1 font-mono text-[11px] font-semibold text-slate-500">Projected {fmtValue(data.promised)}</span>
        </div>
        {cols.map((c, i) => {
          const highlighted = c.key === selected
          const next = cols[i + 1]
          return (
            <div key={c.key} className="relative flex-1">
              <button
                type="button"
                onClick={() => setSelected(c.key)}
                className={cn(
                  "group flex w-full flex-col items-center rounded-xl px-1 pb-2 transition-colors",
                  highlighted ? "bg-slate-100 ring-1 ring-slate-300" : "hover:bg-slate-50",
                )}
                style={{ paddingTop: PAD_TOP }}
              >
                <div className="relative w-full" style={{ height: HEIGHT }}>
                  {next && next.key !== "total" && (
                    <div className="absolute right-0 left-1/2 border-t border-dashed border-slate-300" style={{ top: `${100 - pct(c.end)}%` }} />
                  )}
                  <div className="absolute inset-x-4 rounded-t-md" style={{ top: `${100 - pct(c.end)}%`, height: `${pct(c.end - c.start)}%` }}>
                    {/* No dimming: faded teal reads as "success green". The selection box carries the selected state. */}
                    <div className={cn("size-full rounded-t-md", c.key === "total" ? TOTAL_BAR : barClass)} />
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 font-mono text-xs font-bold whitespace-nowrap text-slate-950 tabular-nums">{c.value}</div>
                  </div>
                </div>
                <div className="mt-2 flex flex-col items-center gap-0.5 text-center" style={{ height: LABEL_HEIGHT }}>
                  <span className={cn("text-[13px] leading-tight", highlighted ? "font-semibold text-slate-950" : "text-slate-500")}>{c.label}</span>
                  <span className="text-[11px] text-slate-400">{c.sub}</span>
                </div>
              </button>

            </div>
          )
        })}
      </div>

      <BulletCard title={panel.label} method={panel.method} bullets={panel.bullets} canNudge={canNudge} teamRow={teamRow} />

      {resultsHref && (
        <Link href={resultsHref} className="inline-flex w-fit items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800">
          See SKU-level results and method
          <ArrowRight className="size-3.5" />
        </Link>
      )}
    </div>
  )
}
