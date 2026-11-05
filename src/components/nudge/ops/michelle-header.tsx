"use client"

import Link from "next/link"
import { TopStrip, useViewer } from "../top-strip"
import { BUSINESS, fmtBiz } from "../data"
import { useLive } from "../live-model"


/** Michelle's top line: greeting, quarter, and where the business lands: forecast, plan and the gap (the same numbers as Claire's headline). */
export function MichelleHeader({ className }: { className?: string } = {}) {
  const { viewer, visiting, home } = useViewer("michelle")
  const l = useLive()
  const { plan } = BUSINESS[l.period]
  const gap = l.pace(l.period) - plan
  return (
    <TopStrip
      person={viewer}
      home={home}
      className={className}
      greeting={visiting ? undefined : "Hi Michelle"}
      crumbs={visiting ? [{ label: "Home", href: home }, { label: "Michelle's queue" }] : undefined}
      period
      facts={
        // Forecast, plan and the gap between them, as Claire's headline says it; the whole line opens Gap to plan.
        <Link href="/michelle/gap" className="rounded hover:text-slate-900 hover:underline hover:decoration-slate-300 hover:underline-offset-4">
          Forecast <span className="font-semibold text-slate-950 tabular-nums">{fmtBiz(l.pace(l.period))}</span>
          <span className="text-slate-300"> · </span>
          Plan <span className="font-semibold text-slate-950 tabular-nums">{fmtBiz(plan)}</span>
          <span className="text-slate-300"> · </span>
          Gap{" "}
          <span className={gap < 0 ? "font-semibold text-error-600 tabular-nums" : "font-semibold text-success-700 tabular-nums"}>
            {gap < 0 ? "−" : "+"}
            {fmtBiz(Math.abs(gap))}
          </span>
        </Link>
      }
    />
  )
}
