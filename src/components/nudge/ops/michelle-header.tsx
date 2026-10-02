"use client"

import Link from "next/link"
import { TopStrip, useViewer } from "../top-strip"
import { BUSINESS, fmtBiz } from "../data"
import { useLive } from "../live-model"


/** Michelle's top line: greeting, quarter, and the one number she reports on, the projected gap to plan (same as Claire's: forecast vs plan). */
export function MichelleHeader() {
  const { viewer, visiting, home } = useViewer("michelle")
  const l = useLive()
  const { plan } = BUSINESS[l.period]
  const gap = l.pace(l.period) - plan
  return (
    <TopStrip
      person={viewer}
      home={home}
      greeting={visiting ? undefined : "Hi Michelle"}
      crumbs={visiting ? [{ label: "Home", href: home }, { label: "Michelle's queue" }] : undefined}
      period
      facts={
        <Link href="/michelle/gap" className="rounded hover:text-slate-900 hover:underline hover:decoration-slate-300 hover:underline-offset-4">
          Gap to plan{" "}
          <span className={gap < 0 ? "font-semibold text-error-600 tabular-nums" : "font-semibold text-success-700 tabular-nums"}>
            {gap < 0 ? "−" : "+"}
            {fmtBiz(Math.abs(gap))}
          </span>
        </Link>
      }
    />
  )
}
