"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Bell, Check, Sparkles } from "lucide-react"
import { useNudge } from "../nudge-context"
import { emailMe } from "../email-me"
import { ALERT_RULES, BRAND_TERMS, GIFT_TERMS } from "./data"
import type { CustomAlert } from "./data"

/**
 * Use case 1, drill into an issue: why gift sets lagged. Ally runs the cause,
 * says what it ruled out, and hands the fix to the media agent. The two
 * numbers it finds are what the custom alerts then watch.
 */
export function GiftSetsAnswer() {
  return (
    <div className="flex max-w-[860px] flex-col gap-4 text-[15px] leading-relaxed text-slate-700">
      <p className="font-semibold text-slate-950">Brightwick is winning the searches. Gift sets grew 9% on Prime Day against 24% for the category, and the gap is now on our own brand terms too.</p>
      <div className="grid grid-cols-2 gap-3">
        <Finding figure="27%" label="Brightwick's share of voice on our brand terms" detail={`up from 8% before Prime Day · above us on 4 of our ${BRAND_TERMS.length} brand terms`} />
        <Finding figure="18%" label="our share of voice on gift terms" detail={`down from 25% on Prime Day · ${GIFT_TERMS.length} top gift terms`} />
      </div>
      <ul className="flex flex-col gap-1 text-[14px]">
        <li>· Brightwick cut gift-set prices 30% and kept bidding after the event.</li>
        <li>· Ruled out: stock (99% in stock), content (no changes), ratings (steady at 4.6).</li>
      </ul>
      <div className="flex items-start gap-2.5 rounded-xl bg-brand-25 px-4 py-3 text-[14px] ring-1 ring-brand-100">
        <Sparkles className="mt-0.5 size-4 shrink-0 text-brand-600" />
        <span>
          <b className="font-semibold text-slate-950">Ally is on it.</b> Raising bids on our {BRAND_TERMS.length} brand terms and {GIFT_TERMS.length} top gift terms; the changes are in James&apos;s queue to approve. <span className="text-slate-500">Media agent</span>
        </span>
      </div>
    </div>
  )
}

function Finding({ figure, label, detail }: { figure: string; label: string; detail: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <div className="font-mono text-[24px] leading-none font-semibold text-error-600">{figure}</div>
      <div className="mt-1.5 text-[14px] font-medium text-slate-950">{label}</div>
      <div className="mt-0.5 text-[13px] text-slate-500">{detail}</div>
    </div>
  )
}

// One email per alert per page load, even when React mounts the answer twice in development.
const fired = new Set<string>()

/** Use case 2, an answer becomes a custom alert: Ally confirms the rule, saves it, and fires it at once if it's already true. */
export function AlertSetAnswer({ id }: { id: CustomAlert["id"] }) {
  const { addAlert } = useNudge()
  const rule = ALERT_RULES[id]

  useEffect(() => {
    if (fired.has(id)) return
    fired.add(id)
    addAlert({ ...rule, created: new Date().toISOString(), seen: false })
    if (rule.firing) emailMe({ kind: "alert", name: rule.name, watches: rule.watches, when: rule.when, now: rule.now }, { quiet: true })
  }, [id, rule, addAlert])

  return (
    <div className="flex max-w-[640px] flex-col gap-3">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
          <Bell className="size-4 text-brand-600" />
          <span className="text-[15px] font-semibold text-slate-950">{rule.name}</span>
          <span className="ml-auto inline-flex items-center gap-1 text-[13px] font-medium text-success-700">
            <Check className="size-3.5" /> Alert on
          </span>
        </div>
        <dl className="grid grid-cols-[120px_minmax(0,1fr)] gap-x-4 gap-y-2 px-4 py-3 text-[14px]">
          <dt className="text-slate-500">Watches</dt>
          <dd className="text-slate-950">{rule.watches}</dd>
          <dt className="text-slate-500">Alerts when</dt>
          <dd className="font-medium text-slate-950">{rule.when}</dd>
          <dt className="text-slate-500">Terms</dt>
          <dd className="text-slate-700">{rule.terms.join(" · ")}</dd>
          <dt className="text-slate-500">Checks</dt>
          <dd className="text-slate-950">12 times a day</dd>
          <dt className="text-slate-500">Sends to</dt>
          <dd className="text-slate-950">Your email</dd>
          <dt className="text-slate-500">Owner</dt>
          <dd className="text-slate-950">Michelle Ortiz</dd>
        </dl>
      </div>
      {rule.firing && (
        <p className="text-[14px] text-slate-700">
          <b className="font-semibold text-slate-950">It&apos;s already true.</b> {rule.now}, so I sent the first alert to your email.{" "}
          <Link href="/michelle/alerts" className="font-medium text-brand-700 hover:underline">
            See your alerts
          </Link>
        </p>
      )}
    </div>
  )
}
