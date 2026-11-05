"use client"

import Link from "next/link"
import { SectionTitle } from "@/components/layout/page-frame"
import { useNudge } from "../nudge-context"
import { LESSONS, RETRO } from "./prime-day"

/** What the team sent Claire: the deck's headline facts and the lessons kept. Shows once Michelle sends the retro. */
export function ReportsReady() {
  const { retro, decks } = useNudge()
  const qbr = decks.qbr
  if (!retro.sentToClaire && !qbr?.sentToClaire) return null
  const kept = LESSONS.filter((l) => retro.saved?.includes(l.id))
  return (
    <section aria-label="Reports ready" className="flex flex-col gap-3">
      <SectionTitle className="pt-2">Reports ready</SectionTitle>
      {qbr?.sentToClaire && (
        <div className="flex flex-col gap-2.5 rounded-2xl bg-white px-6 py-5 shadow-xs ring-1 ring-slate-200">
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-base font-semibold text-slate-950">Q4 business review</span>
            <span className="text-xs text-slate-500">{qbr.repeat ? "from Michelle · refreshes every Monday on autopilot" : "from Michelle · today"}</span>
          </div>
          <ul className="flex flex-col gap-1 text-sm text-slate-700">
            <li>
              Tracking <span className="font-mono font-semibold text-slate-950">$48M</span> against the <span className="font-mono font-semibold text-slate-950">$52M</span> plan
            </li>
            <li>
              <span className="font-mono font-semibold text-slate-950">$4.7M</span> in the pipeline; <span className="font-mono font-semibold text-slate-950">$1.5M</span> is one approval away
            </li>
            <li>
              Two nudges unlock <span className="font-mono font-semibold text-slate-950">$972K</span> this month
            </li>
          </ul>
          <div className="mt-1">
            <Link href="/michelle/decks/qbr?view=deck" className="inline-flex h-9 items-center rounded-md bg-brand-500 px-4 text-sm font-semibold text-white hover:bg-brand-600">
              Open deck
            </Link>
          </div>
        </div>
      )}
      {retro.sentToClaire && (
      <div className="mt-3 grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-4">
        <div className="flex flex-col gap-2.5 rounded-2xl bg-white px-6 py-5 shadow-xs ring-1 ring-slate-200">
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-base font-semibold text-slate-950">{RETRO.name}</span>
            <span className="text-xs text-slate-500">from Michelle · today</span>
          </div>
          <ul className="flex flex-col gap-1 text-sm text-slate-700">
            <li>
              Outgrew the market by <span className="font-mono font-semibold text-slate-950">2</span> pts · <span className="font-mono font-semibold text-success-700">+28%</span> year over year
            </li>
            <li>Gift sets lagged behind Brightwick&apos;s 30% off</li>
            <li>
              Ally added <span className="font-mono font-semibold text-slate-950">$410K</span> during the event
            </li>
          </ul>
          <div className="mt-1">
            <Link href="/michelle/retro?view=deck" className="inline-flex h-9 items-center rounded-md bg-brand-500 px-4 text-sm font-semibold text-white hover:bg-brand-600">
              Open deck
            </Link>
          </div>
        </div>
        <div className="flex flex-col gap-2 rounded-2xl bg-white px-6 py-5 shadow-xs ring-1 ring-slate-200">
          <div className="text-[13px] font-medium text-slate-500">Lessons the team kept</div>
          {kept.length ? (
            kept.map((l) => (
              <div key={l.id} className="border-t border-slate-100 pt-2 text-sm text-slate-950">
                {l.text}
              </div>
            ))
          ) : (
            <div className="text-sm text-slate-500">None kept yet</div>
          )}
          {kept.length > 0 && (
            <Link href="/settings?tab=knowledge" className="text-[13px] font-medium text-brand-700 hover:underline">
              In Knowledge
            </Link>
          )}
        </div>
      </div>
      )}
    </section>
  )
}
