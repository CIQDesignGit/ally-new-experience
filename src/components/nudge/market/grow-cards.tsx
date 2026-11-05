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
import { MarketMap } from "./market-map"

export type GrowView = "market" | "competition" | "event"

const READINESS: Record<Readiness, string> = { ready: "Ready", partial: "Partial", risk: "Not set" }

export function ReadinessDot({ state }: { state: Readiness }) {
  return <span className={cn("inline-block size-2.5 shrink-0 rounded-full", state === "ready" ? "bg-success-500" : state === "partial" ? "bg-warning-500" : "bg-error-500")} />
}

/**
 * Every card has the same anatomy so the three read as peers: label, one-sentence
 * headline, evidence, two supporting points, then what it's worth and the move.
 */
function GrowCard({ label, headline, evidence, points, value, onOpen, action }: {
  label: React.ReactNode
  headline: React.ReactNode
  evidence: React.ReactNode
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
      {/* Two lines reserved so the evidence panels start level across cards. */}
      <div className="mt-1.5 line-clamp-2 min-h-14 text-lg leading-7 font-semibold text-balance text-slate-950">{headline}</div>
      <div className="mt-4 rounded-xl bg-slate-25 ring-1 ring-slate-100">{evidence}</div>
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

function Tiles({ children }: { children: React.ReactNode }) {
  return <div className="grid auto-cols-fr grid-flow-col divide-x divide-slate-100">{children}</div>
}

function Tile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 px-2.5 py-3">
      <div className="truncate text-[11px] text-slate-500">{label}</div>
      <div className="mt-1 flex items-center gap-1.5 text-[13px] font-semibold whitespace-nowrap text-slate-950">{children}</div>
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
          evidence={
            <div className="px-2 py-1.5">
              <MarketMap compact selected={seg.id} />
            </div>
          }
          points={seg.points.slice(0, 2)}
          value={<Value amount={`+${fmtValue(annual(offered(seg.plays, mvp)))}`} caption="a year, projected" />}
          action={`Win share in ${seg.name.toLowerCase()}`}
          onOpen={() => onOpen("market")}
        />

        <GrowCard
          label="Competition"
          headline={comp.headline}
          evidence={
            <Tiles>
              {comp.stats.map((s) => (
                <Tile key={s.label} label={s.label}>
                  <span className={cn("font-mono", s.bad && "text-error-600")}>{s.value}</span>
                </Tile>
              ))}
            </Tiles>
          }
          points={comp.moves.slice(0, 2)}
          value={<Value amount={`−${fmtValue(comp.atRisk)}`} caption="at risk this quarter" bad />}
          action={`Respond to ${comp.name}`}
          onOpen={() => onOpen("competition")}
        />

        <GrowCard
          label={<>Event readiness · {ev.date}</>}
          headline={<>{ev.name} is {ev.weeks} weeks away</>}
          evidence={
            <Tiles>
              {ev.levers.map((l) => (
                <Tile key={l.name} label={l.name}>
                  <ReadinessDot state={l.state} />
                  {READINESS[l.state]}
                </Tile>
              ))}
            </Tiles>
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
