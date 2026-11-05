"use client"

import { useNudge } from "../nudge-context"
import { cn } from "@/lib/utils"
import { fmtBiz, fmtValue } from "../data"
import { NEXT_EVENT, TOP_COMPETITOR, TOP_SEGMENT } from "../market"
import type { Readiness } from "../market"
import { useMvp } from "../mvp"
import { annual, offered } from "./plays"
import { Num, Points } from "../points"
import { MarketMap } from "./market-map"

export type GrowView = "market" | "competition" | "event"

const CARD = "flex flex-col rounded-2xl bg-white p-6 text-left shadow-xs ring-1 ring-slate-200 transition-shadow hover:shadow-sm hover:ring-brand-300 focus-visible:ring-2 focus-visible:ring-brand-300 outline-none"

export function ReadinessDot({ state }: { state: Readiness }) {
  return <span className={cn("inline-block size-2.5 rounded-full", state === "ready" ? "bg-success-500" : state === "partial" ? "bg-warning-500" : "bg-error-500")} />
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
      <div className="px-10 font-mono text-xs tracking-wide text-slate-500 uppercase">Grow beyond plan{retailer === "all" ? " · Amazon" : ""}</div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <button type="button" onClick={() => onOpen("market")} className={CARD}>
          <div className="text-xs font-medium text-slate-500">Market</div>
          <div className="mt-2 rounded-lg bg-slate-25 px-2 py-1">
            <MarketMap compact selected={seg.id} />
          </div>
          <Points
            className="mt-3"
            items={[
              <>
                {seg.name} <Num>+{seg.growth}%</Num>, fastest-growing
              </>,
              <>
                Your share <Num>{seg.share}%</Num>
              </>,
            ]}
          />
          <span className="mt-auto pt-4 text-[15px] font-semibold text-brand-700">Win share in {seg.name.toLowerCase()} →</span>
          <span className="mt-0.5 text-xs text-slate-500">
            About <span className="font-mono">+{fmtValue(annual(offered(seg.plays, mvp)))}</span> a year
          </span>
        </button>

        <button type="button" onClick={() => onOpen("competition")} className={CARD}>
          <div className="text-xs font-medium text-slate-500">Competition</div>
          <div className="mt-3 text-lg leading-snug font-semibold text-slate-950">{comp.headline}</div>
          <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-slate-25 px-3 py-2.5 text-center">
            {comp.stats.map((s) => (
              <div key={s.label}>
                <div className={cn("font-mono text-sm font-semibold", s.bad ? "text-error-600" : "text-slate-950")}>{s.value}</div>
                <div className="mt-0.5 text-[11px] text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
          <Points className="mt-3" items={comp.moves} />
          <span className="mt-auto pt-4 text-[15px] font-semibold text-brand-700">Respond to {comp.name}&apos;s price cut →</span>
          <span className="mt-0.5 text-xs text-slate-500">
            <span className="font-mono text-error-600">−{fmtValue(comp.atRisk)}</span> at risk this quarter
          </span>
        </button>

        <button type="button" onClick={() => onOpen("event")} className={CARD}>
          <div className="text-xs font-medium text-slate-500">Event readiness</div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-lg font-semibold text-slate-950">{ev.name}</span>
            <span className="text-sm text-slate-500">
              {ev.date} · {ev.weeks} weeks
            </span>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2 rounded-lg bg-slate-25 px-3 py-2.5 text-center">
            {ev.levers.map((l) => (
              <div key={l.name} className="flex flex-col items-center gap-1.5">
                <ReadinessDot state={l.state} />
                <div className="text-[11px] text-slate-500">{l.name}</div>
              </div>
            ))}
          </div>
          <Points
            className="mt-3"
            items={[
              <>
                Last year <Num bad>−{fmtValue(ev.lastYear.lost)}</Num>
              </>,
              ...ev.lastYear.points.slice(0, 2),
              <>This year: {ev.levers.filter((l) => l.state === "risk").map((l) => l.name.toLowerCase()).join(" and ")} not set</>,
            ]}
          />
          <span className="mt-auto pt-4 text-[15px] font-semibold text-brand-700">Get ready for {ev.name} →</span>
          <span className="mt-0.5 text-xs text-slate-500">
            <span className="font-mono">{fmtBiz(ev.atStake)}</span> at stake
          </span>
        </button>
      </div>
    </section>
  )
}
