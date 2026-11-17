"use client"

import { ArrowRight } from "lucide-react"
import { SectionTitle } from "@/components/layout/page-frame"
import { useNudge } from "../nudge-context"
import { cn } from "@/lib/utils"
import { fmtBiz, fmtValue } from "../data"
import { NEXT_EVENT, TOP_COMPETITOR, TOP_SEGMENT } from "../market"
import type { Readiness } from "../market"
import { useMvp } from "../mvp"
import { annual, offered } from "./plays"
import { Num, Points } from "../points"

export type GrowView = "market" | "competition" | "event"

export function ReadinessDot({ state }: { state: Readiness }) {
  return <span className={cn("inline-block size-2.5 shrink-0 rounded-full", state === "ready" ? "bg-success-500" : state === "partial" ? "bg-warning-500" : "bg-error-500")} />
}

/**
 * Every card has the same anatomy so the three read as peers: label, one-sentence
 * headline, two supporting points, then what it's worth and the move.
 */
function GrowCard({ label, headline, points, value, onOpen, action }: {
  label: React.ReactNode
  headline: React.ReactNode
  points: React.ReactNode[]
  value: React.ReactNode
  action: string
  onOpen: () => void
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex flex-col rounded-2xl bg-white p-6 text-left shadow-xs ring-1 ring-slate-200 outline-none transition-shadow hover:shadow-sm hover:ring-brand-300 focus-visible:ring-2 focus-visible:ring-brand-300"
    >
      <div className="text-xs font-medium text-slate-500">{label}</div>
      {/* Two lines reserved so the points start level across cards. */}
      <div className="mt-1.5 line-clamp-2 min-h-14 text-lg leading-7 font-semibold text-balance text-slate-950">{headline}</div>
      <Points className="mt-4" items={points} />
      <div className="mt-auto pt-5">
        <div className="border-t border-slate-100 pt-4">{value}</div>
        <div className="mt-3 flex items-center justify-between gap-3 text-[15px] font-semibold text-brand-700">
          <span>{action}</span>
          <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </button>
  )
}

function Value({ amount, caption, bad }: { amount: string; caption: string; bad?: boolean }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className={cn("font-mono text-2xl font-semibold tracking-tight", bad ? "text-error-600" : "text-slate-950")}>{amount}</span>
      <span className="text-sm text-slate-500">{caption}</span>
    </div>
  )
}

/**
 * Bottom of Claire's page: where to grow beyond plan. Each card leads with its
 * most valuable move, named from the data (the top segment, the competitor with
 * the most at risk, the next event), and opens its full view.
 */
export function GrowCards({ onOpen }: { onOpen: (v: GrowView) => void }) {
  const seg = TOP_SEGMENT
  const comp = TOP_COMPETITOR
  const ev = NEXT_EVENT
  // Market, competition and events are read from Amazon's search and share data: shown for Amazon, and named as Amazon in the total.
  const { retailer } = useNudge()
  const mvp = useMvp()
  if (retailer === "walmart" || retailer === "target") return null
  return (
    <section className="pt-4">
      <SectionTitle aside={retailer === "all" ? "Amazon" : undefined}>Grow beyond plan</SectionTitle>
      <div className="mt-3 grid gap-4 lg:grid-cols-3">
        <GrowCard
          label="Market"
          headline={<>{seg.name} is growing {seg.growth}%; you hold {seg.share}%</>}
          points={seg.points.slice(0, 2)}
          value={<Value amount={`+${fmtValue(annual(offered(seg.plays, mvp)))}`} caption="a year, projected" />}
          action={`Win share in ${seg.name.toLowerCase()}`}
          onOpen={() => onOpen("market")}
        />

        <GrowCard
          label="Competition"
          headline={comp.headline}
          points={comp.moves.slice(0, 2)}
          value={<Value amount={`−${fmtValue(comp.atRisk)}`} caption="at risk this quarter" bad />}
          action={`Respond to ${comp.name}`}
          onOpen={() => onOpen("competition")}
        />

        <GrowCard
          label="Event readiness"
          headline={
            <>
              {ev.name}{" "}
              <span className="text-sm font-normal text-slate-500">
                {ev.date} · {ev.weeks} weeks
              </span>
            </>
          }
          points={[
            <>
              Last year <Num bad>−{fmtValue(ev.lastYear.lost)}</Num>
            </>,
            ev.lastYear.points[0],
          ]}
          value={<Value amount={fmtBiz(ev.atStake)} caption="at stake" />}
          action={`Get ready for ${ev.name}`}
          onOpen={() => onOpen("event")}
        />
      </div>
    </section>
  )
}
