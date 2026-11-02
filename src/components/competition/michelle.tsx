"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { BuildAnswer } from "./build-in-chat"
import { ArrowRight, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { AnswerCard, type Chip } from "../nudge/chat/inline-chat"
import { PRIMARY } from "../nudge/mike/buttons"
import { GIFT_TERMS } from "../nudge/alerts/data"
import { useCompetition, setCompetition, reached, type CompetitionState } from "./state"
import { DEEP_ASK, DEALS, FINDING, MATCHED, NAMES, QUICK, SOV, TIMES } from "./data"
import { BUILD_STEP, useHarness } from "./harness"
import { useSlackNudgeToast } from "../nudge/slack-toast"

function Quick({ q }: { q: keyof typeof QUICK }) {
  const a = QUICK[q]
  return (
    <AnswerCard>
      <p className="font-semibold text-slate-950">{a.lead}</p>
      <ul className="mt-2 flex flex-col gap-1 text-[14px]">
        {a.points.map((p) => (
          <li key={p}>· {p}</li>
        ))}
      </ul>
    </AnswerCard>
  )
}

/** The deep ask: who builds the tracker is the harness, an engineer (Borrow) or Ally in this chat (Build). */
function CompetitionAsk() {
  return useHarness() === "build" ? <BuildAnswer /> : <RequestAnswer />
}

/** Where Brightwick stands today, then whether the library can track it: the same opening whoever builds it. */
export function StandsToday({ verdict }: { verdict: ReactNode }) {
  const last = SOV.theirs.length - 1
  return (
    <AnswerCard>
      <p className="font-semibold text-slate-950">Here&rsquo;s where {NAMES.competitor} stands today.</p>
      <ul className="mt-2 flex flex-col gap-1 text-[14px]">
        <li>· Share of voice on your gift terms: {NAMES.competitor} {SOV.theirs[last]}%, you {SOV.ours[last]}%</li>
        <li>
          · Deals: 20% off on {DEALS.length} of your {MATCHED} matched gift sets since Oct 5
        </li>
        <li>· {verdict}</li>
      </ul>
    </AnswerCard>
  )
}

/**
 * The deep ask on the borrow harness: what Ally can say now, then the tracker
 * it will build, in her words, with the two choices she'd want to make, a named
 * engineer and a time.
 */
function RequestAnswer() {
  const c = useCompetition()
  const sent = reached(c, "requested")
  const notify = useSlackNudgeToast()
  // Sending it lands in the engineer's queue: she's told at once, and the card opens her view.
  const request = () => {
    // Asking is what starts the demo: no special link needed.
    setCompetition({ on: true, stage: "requested" })
    notify({ headline: `${NAMES.customer} asked for a new skill · ${NAMES.request}`, batchName: NAMES.skill, description: `${NAMES.competitor} every week: promotions, price gaps, share of voice`, chip: `Due ${TIMES.promised}`, queuePath: "/fde", duration: 15000 })
  }
  return (
    <div className="flex max-w-[860px] flex-col gap-3">
      <StandsToday verdict={<>Nothing in your library tracks a competitor every week yet: it needs a new match between {NAMES.competitor}&rsquo;s products and yours, so an engineer builds it</>} />
      <TrackerSpec
        locked={sent}
        footer={
          <>
            <div className="text-[14px] text-slate-700">
              Ready by {TIMES.promised} · built and checked by {NAMES.fdeTitle}
            </div>
            {sent ? (
              <span className="flex items-center gap-1.5 text-[14px] text-success-700">
                <Check className="size-4" aria-hidden /> Requested · {NAMES.request}
              </span>
            ) : (
              <button type="button" onClick={request} className={PRIMARY}>
                Request it
              </button>
            )}
          </>
        }
      />
      {sent && <AnswerCard>Requested. I&rsquo;ll tell you here and by email when it&rsquo;s live. You can follow it on your Today page.</AnswerCard>}
    </div>
  )
}

/** The tracker she'd get, with her two choices (fixed once it's on its way), and a footer saying who builds it. */
export function TrackerSpec({ locked, footer }: { locked: boolean; footer: ReactNode }) {
  const c = useCompetition()
  return (
      <section className="rounded-2xl bg-white ring-1 ring-slate-200">
        <div className="border-b border-slate-200 px-5 py-3">
          <div className="text-[15px] font-semibold text-slate-950">Competition tracker for Aurelle</div>
        </div>
        <dl className="grid grid-cols-[140px_minmax(0,1fr)] gap-x-4 gap-y-2.5 px-5 py-4 text-[14px]">
          <dt className="text-slate-500">Promotions</dt>
          <dd className="text-slate-950">{NAMES.competitor}&rsquo;s deals on gift sets and jar candles</dd>
          <dt className="text-slate-500">Price gaps</dt>
          <dd className="text-slate-950">On your {MATCHED} matched gift sets</dd>
          <dt className="text-slate-500">Share of voice</dt>
          <dd className="text-slate-950">Your {GIFT_TERMS.length} gift terms</dd>
          <dt className="text-slate-500">Alert</dt>
          <dd className="flex items-center gap-2 text-slate-950">
            When {NAMES.competitor} moves more than
            <Pick value={c.threshold} options={[3, 5, 10]} format={(v) => `${v} pts`} disabled={locked} onChange={(v) => setCompetition({ threshold: v })} />
          </dd>
          <dt className="text-slate-500">Delivered</dt>
          <dd className="flex items-center gap-2 text-slate-950">
            Every
            <Pick value={c.day} options={["Monday", "Friday"] as const} format={(v) => v} disabled={locked} onChange={(v) => setCompetition({ day: v })} />
          </dd>
        </dl>
        <div className="flex items-center justify-between gap-4 border-t border-slate-200 px-5 py-3.5">{footer}</div>
      </section>
  )
}

function Pick<T extends string | number>({ value, options, format, onChange, disabled }: { value: T; options: readonly T[]; format: (v: T) => string; onChange: (v: T) => void; disabled?: boolean }) {
  return (
    <select
      value={String(value)}
      disabled={disabled}
      onChange={(e) => onChange(options.find((o) => String(o) === e.target.value)!)}
      className="h-8 rounded-md border border-slate-200 bg-white px-2 text-[14px] text-slate-950 focus-visible:outline-none disabled:border-transparent disabled:px-0 disabled:appearance-none"
    >
      {options.map((o) => (
        <option key={String(o)} value={String(o)}>
          {format(o)}
        </option>
      ))}
    </select>
  )
}

/**
 * Her questions in this demo: two answered at once, one that becomes a request.
 * Offered as starters in a new chat until she's asked for the tracker (a new
 * ask starts there, not on her Today page); typed, they work anywhere.
 */
export function competitionChips(c: CompetitionState, offer: boolean): Chip[] {
  const hidden = !offer || reached(c, "requested")
  const deep: Chip = { q: DEEP_ASK, hidden, match: /track.*brightwick|brightwick.*every week/i, think: { ms: 1600, label: "Checking what I can answer today" }, render: () => <CompetitionAsk /> }
  const deals: Chip = { q: QUICK.deals.q, hidden, match: /brightwick.*(deal|discount|sale)/i, think: { ms: 900, label: `Checking ${NAMES.competitor}'s offers` }, render: () => <Quick q="deals" />, followUps: [deep] }
  const sov: Chip = { q: QUICK.sov.q, hidden, match: /share of voice.*gift|gift terms/i, think: { ms: 900, label: "Checking this week's search results" }, render: () => <Quick q="sov" />, followUps: [deals, deep] }
  return [sov, deals, deep]
}

/** A request's steps, the same on the customer's tracker and the engineer's queue. */
// Stage nouns, not states: the step in progress reads as "in Build", never as "Tests passed" while two fail.
export const TRACK = ["Request", "Build", "Test", "Review", "Live"] as const
/** Where each step's work happens, for the demo: the engineer's build step (by harness), then the reviewer's console. */
export const STAGE_HREF: Record<(typeof TRACK)[number], string | undefined> = {
  Request: undefined,
  Build: undefined,
  Test: "/console/skills/competition-watch",
  Review: "/console/skills/competition-watch",
  Live: "/michelle/dashboards/competition",
}

/** Where the request is (steps done), from what has actually happened on the other screens. */
export function requestStep(c: CompetitionState): number {
  if (c.stage === "live") return 5
  if (c.sovFixed && c.competitorFixed) return 4
  if (reached(c, "submitted")) return 2
  if (reached(c, "requested")) return 1
  return 0
}

/** On Michelle's Today page: the request's progress, then the delivery. */
export function CompetitionTracker() {
  const c = useCompetition()
  const build = BUILD_STEP[useHarness()]
  // Nothing to follow when Ally built it in her chat (Build): no request, no engineer.
  if (!reached(c, "requested") || c.selfBuilt) return null
  const n = requestStep(c)
  const live = c.stage === "live"
  return (
    <section className="mx-10 mt-4 rounded-xl border border-slate-200 px-5 py-4 max-sm:mx-4">
      <div className="flex items-start justify-between gap-6 max-md:flex-col">
        <div className="min-w-0">
          <div className="text-[13px] text-slate-500">
            Competition tracker · {NAMES.request} · {live ? `live ${TIMES.early}` : `ready by ${TIMES.promisedAbs}`}
          </div>
          <div className="mt-1 text-[15px] font-semibold text-slate-950">{live ? FINDING : `${NAMES.fde} is building it`}</div>
        </div>
        {live && (
          <Link href="/michelle/dashboards/competition" className="inline-flex shrink-0 items-center gap-1 text-[14px] font-medium text-brand-700 hover:text-brand-600">
            Competition dashboard <ArrowRight className="size-4" aria-hidden />
          </Link>
        )}
      </div>
      <ol className="mt-4 grid grid-cols-5 gap-2">
        {TRACK.map((t, i) => {
          const body = (
            <>
              <span className={cn("h-1 rounded-full", i < n ? "bg-success-500" : "bg-slate-200")} aria-hidden />
              <span className={cn("flex items-center gap-1 text-[13px]", i < n ? "text-slate-950" : i === n ? "font-medium text-brand-700" : "text-slate-400")}>
                {i < n && <Check className="size-3.5 text-success-700" aria-hidden />}
                {t}
                {i === n && c.on && <ArrowRight className="size-3.5" aria-hidden />}
              </span>
            </>
          )
          // While the demo runs, the step in progress opens the screen where that work happens.
          const href = c.on && i === n ? (t === "Build" ? build.href : STAGE_HREF[t]) : undefined
          return (
            <li key={t}>
              {href ? (
                <Link href={href} className="flex flex-col gap-1.5 hover:opacity-80">
                  {body}
                </Link>
              ) : (
                <div className="flex flex-col gap-1.5">{body}</div>
              )}
            </li>
          )
        })}
      </ol>
      {live && (
        <p className="mt-3 text-[13px] text-slate-500">
          You asked to track {NAMES.competitor}&rsquo;s promotions, price gaps and share of voice · 8 weeks of history included · alerts every {c.day} above {c.threshold} pts
        </p>
      )}
    </section>
  )
}
