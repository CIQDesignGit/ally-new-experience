"use client"

import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { AnswerCard, type Chip } from "../nudge/chat/inline-chat"
import { PRIMARY } from "../nudge/mike/buttons"
import { GIFT_TERMS } from "../nudge/alerts/data"
import { useCompetition, setCompetition, reached, type CompetitionState } from "./state"
import { DEEP_ASK, DEALS, FINDING, MATCHED, NAMES, QUICK, SOV, TIMES } from "./data"
import { BUILD_STEP, useHarness } from "./harness"

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

/**
 * The deep ask: what Ally can say now, then the tracker it will build, in her
 * words, with the two choices she'd want to make, a named engineer and a time.
 */
function RequestAnswer() {
  const c = useCompetition()
  const sent = reached(c, "requested")
  const last = SOV.theirs.length - 1
  return (
    <div className="flex max-w-[860px] flex-col gap-3">
      <AnswerCard>
        <p className="font-semibold text-slate-950">Here&rsquo;s where {NAMES.competitor} stands today.</p>
        <ul className="mt-2 flex flex-col gap-1 text-[14px]">
          <li>· Share of voice on your gift terms: {NAMES.competitor} {SOV.theirs[last]}%, you {SOV.ours[last]}%</li>
          <li>
            · Deals: 20% off on {DEALS.length} of your {MATCHED} matched gift sets since Oct 5
          </li>
          <li>· Tracking it every week takes a new match between {NAMES.competitor}&rsquo;s products and yours, so a person checks it</li>
        </ul>
      </AnswerCard>

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
            <Pick value={c.threshold} options={[3, 5, 10]} format={(v) => `${v} pts`} disabled={sent} onChange={(v) => setCompetition({ threshold: v })} />
          </dd>
          <dt className="text-slate-500">Delivered</dt>
          <dd className="flex items-center gap-2 text-slate-950">
            Every
            <Pick value={c.day} options={["Monday", "Friday"] as const} format={(v) => v} disabled={sent} onChange={(v) => setCompetition({ day: v })} />
          </dd>
        </dl>
        <div className="flex items-center justify-between gap-4 border-t border-slate-200 px-5 py-3.5">
          <div className="text-[14px] text-slate-700">
            Ready by {TIMES.promised} · built and checked by {NAMES.fdeTitle}
          </div>
          {sent ? (
            <span className="flex items-center gap-1.5 text-[14px] text-success-700">
              <Check className="size-4" aria-hidden /> Requested · {NAMES.request}
            </span>
          ) : (
            <button type="button" onClick={() => setCompetition({ stage: "requested" })} className={PRIMARY}>
              Request it
            </button>
          )}
        </div>
      </section>

      {sent && <AnswerCard>Requested. I&rsquo;ll tell you here and by email when it&rsquo;s live. You can follow it on your Today page.</AnswerCard>}
    </div>
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
 * Offered first while the demo runs (until she's asked for the tracker); typed, they work either way.
 */
export function competitionChips(c: CompetitionState): Chip[] {
  const hidden = !c.on || reached(c, "requested")
  const deep: Chip = { q: DEEP_ASK, hidden, match: /track.*brightwick|brightwick.*every week/i, think: { ms: 1600, label: "Checking what I can answer today" }, render: () => <RequestAnswer /> }
  const deals: Chip = { q: QUICK.deals.q, hidden, match: /brightwick.*(deal|discount|sale)/i, think: { ms: 900, label: `Checking ${NAMES.competitor}'s offers` }, render: () => <Quick q="deals" />, followUps: [deep] }
  const sov: Chip = { q: QUICK.sov.q, hidden, match: /share of voice.*gift|gift terms/i, think: { ms: 900, label: "Checking this week's search results" }, render: () => <Quick q="sov" />, followUps: [deals, deep] }
  return [sov, deals, deep]
}

const TRACK = ["Requested", "Being built", "Tests passed", "In review", "Live"] as const
/** Where each step's work happens, for the demo: the engineer's build step (by harness), then the reviewer's console. */
const STAGE_HREF: Record<(typeof TRACK)[number], string | undefined> = {
  Requested: undefined,
  "Being built": undefined,
  "Tests passed": "/console/skills/competition-watch",
  "In review": "/console/skills/competition-watch",
  Live: "/michelle/dashboards/competition",
}

/** Where the request is, from what has actually happened on the other screens. */
function done(c: CompetitionState): number {
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
  if (!reached(c, "requested")) return null
  const n = done(c)
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
          const href = c.on && i === n ? (t === "Being built" ? build.href : STAGE_HREF[t]) : undefined
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
