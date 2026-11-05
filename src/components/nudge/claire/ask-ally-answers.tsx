"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowRight, Check } from "lucide-react"
import { toast } from "sonner"
import { downloadExecSummary, execSummaryForEmail } from "../exec-pdf"
import { emailMe } from "../email-me"
import { APPROVAL_TIER, BATCHES, BUSINESS, COMPARE, VISION_ONLY_LEVERS, fmtBiz, fmtValue } from "../data"
import { useMvp } from "../mvp"
import { useLive } from "../live-model"
import { shortDate } from "../model"
import { useNudge } from "../nudge-context"
import { useFireNudge } from "../use-fire-nudge"
import { CONTENT_BANKED_Q3 } from "../delivered-content-data"
import { DELIVERED } from "../delivered-periods"
import { AGENT_LABEL } from "../types"

/** Waterfall (business-first) version: the proof section is this quarter so far. */
export const QUESTIONS = [
  "Where should I invest an additional $500K?",
  "Show me autopilot adoption by team",
  // Named from this quarter's numbers (Q4 FY26 so far), so the chip never disagrees with the page.
  `Why is content ${fmtValue(DELIVERED.quarter.content.promised - DELIVERED.quarter.content.delivered)} behind projection?`,
  "What can go on autopilot next?",
  "Will I make plan?",
  "Email this summary to my team",
] as const
/** Tier version (/claire): the proof section is last quarter, and "How you compare" is on the page. */
export const QUESTIONS_Q2 = ["Where should I invest an additional $1M?", QUESTIONS[1], "Why did content miss by $190K?", QUESTIONS[3], QUESTIONS[4]] as const
export type Question = (typeof QUESTIONS)[number] | (typeof QUESTIONS_Q2)[number]

const cell = "px-3 py-2.5"
/** Every answer ends in a next step: the same button box everywhere. */
const ACTION = "inline-flex h-9 w-fit items-center gap-1.5 rounded-md px-3.5 text-sm font-semibold transition-colors"
/** This quarter's seasonal batch, for the invest answer. */
const HALLOWEEN = BATCHES.find((b) => b.deadline)!

function InvestAnswer() {
  const rows = [
    { amount: "$600K", where: "Sponsored ads on the 67 SKUs whose new content won A/B tests", result: "≈ $2.0M sales at $3.40 IROAS, vs your $3.01 average" },
    { amount: "$400K", where: `Halloween deals on the ${HALLOWEEN.skus} SKUs in this quarter's batch`, result: `≈ $1.1M sales before the ${shortDate(HALLOWEEN.deadline!)} cutoff` },
  ]
  return (
    <div className="flex flex-col gap-3">
      <p>Put it behind the SKUs where new content already won. They convert better, so every dollar works harder.</p>
      <table className="w-full text-sm">
        <tbody>
          {rows.map((r) => (
            <tr key={r.amount} className="border-t border-slate-100 first:border-t-0">
              <td className={`${cell} w-20 font-mono font-bold text-slate-950`}>{r.amount}</td>
              <td className={`${cell} text-slate-700`}>{r.where}</td>
              <td className={`${cell} text-right text-slate-500`}>{r.result}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-slate-500">
        Total <span className="font-mono font-semibold text-slate-950">≈ $3.1M</span> in sales. Hold off on the ops SKUs losing the buy box: spend there
        goes to other sellers until Michelle&apos;s fix lands.
      </p>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => toast.success("Sent to James · $600K sponsored ads on 67 SKUs, $400K Halloween deals · he'll draft the plan")} className={`${ACTION} bg-brand-500 text-white hover:bg-brand-600`}>
          Send this plan to James
        </button>
        <Link href="/content-results?period=qtd" className={`${ACTION} border border-slate-200 bg-white text-slate-950 hover:border-brand-300 hover:text-brand-700`}>
          See the 67 SKUs that won
        </Link>
      </div>
    </div>
  )
}

const ADOPTION = [
  { agent: "media" as const, owner: "James", pct: 38, expired: "$0.3M" },
  { agent: "content" as const, owner: "Mike", pct: 8, expired: "$0.9M" },
  { agent: "ops" as const, owner: "Michelle", pct: 4, expired: "$0.6M" },
]

function AdoptionAnswer() {
  const { nudged } = useNudge()
  const { fire } = useFireNudge()
  // The table stays whole (its rows add to the expired total); the MVP offers no action on a vision-only lever.
  const mvp = useMvp()
  const actions = APPROVAL_TIER.rows.filter((r) => !(mvp && VISION_ONLY_LEVERS.includes(r.agent)))
  return (
    <div className="flex flex-col gap-4">
      <p>
        You run <span className="font-mono font-semibold text-slate-950">{COMPARE.youPct}%</span> on autopilot; best in class runs{" "}
        <span className="font-mono">{COMPARE.bestInClassPct}%</span>. <span className="font-mono font-semibold text-slate-950">{COMPARE.expiredYtd}</span>{" "}
        expired this year waiting on approval.
      </p>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-slate-500">
            <th className={`${cell} font-medium`}>Team</th>
            <th className={`${cell} w-40 font-medium`}>On autopilot</th>
            <th className={`${cell} text-right font-medium`}>Expired, waiting on approval</th>
          </tr>
        </thead>
        <tbody>
          {ADOPTION.map((a) => (
            <tr key={a.agent} className="border-t border-slate-100">
              <td className={cell}>
                <span className="font-medium text-slate-950">{AGENT_LABEL[a.agent]}</span> <span className="text-slate-500">· {a.owner}</span>
              </td>
              <td className={cell}>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${a.pct}%` }} />
                  </div>
                  <span className="font-mono text-slate-950 tabular-nums">{a.pct}%</span>
                </div>
              </td>
              <td className={`${cell} text-right font-mono font-semibold text-warning-700 tabular-nums`}>{a.expired}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <div className="mb-1 text-xs font-medium text-slate-500">This week&apos;s actions, emailed Monday 8:00 AM</div>
        {actions.map((r) => {
          const done = r.nudgeKey && nudged[r.nudgeKey]
          return (
            <div key={r.nudgeKey} className="flex items-center gap-3 border-t border-slate-100 py-2.5 text-sm first:border-t-0">
              <span className="w-16 shrink-0 font-medium text-slate-950">{r.analystName}</span>
              <span className="min-w-0 flex-1 truncate text-slate-700">{r.description}</span>
              <span className="font-mono font-semibold text-slate-950 tabular-nums">{r.value}</span>
              <span className="w-36 text-right text-xs text-slate-500">{done ? "Nudged today" : r.weekly?.state === "in-progress" ? r.weekly.progress : "Emailed Mon · not started"}</span>
              {done ? (
                <Check className="size-4 text-success-600" />
              ) : (
                <button
                  type="button"
                  onClick={() => fire(r)}
                  className="rounded-md border border-brand-200 px-2.5 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                >
                  Nudge
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ContentMissAnswer({ lastQuarter }: { lastQuarter: boolean }) {
  // This quarter is Q4 FY26 (as every page shows it); last quarter is Q3, whose SKU-level results page exists.
  const [what, why] = (lastQuarter ? CONTENT_BANKED_Q3 : DELIVERED.quarter.content).summary
  return (
    <div className="flex flex-col gap-2">
      <p className="font-medium text-slate-950">{what}</p>
      <p>{why}</p>
      <Link href="/content-results?period=qtd" className="mt-1 inline-flex w-fit items-center gap-1 font-medium text-brand-700 hover:text-brand-800">
        See content results
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  )
}

function AutopilotNextAnswer({ withCompare }: { withCompare: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <p>
        <span className="font-medium text-slate-950">Foundational content.</span> 51 of 60 changes won their A/B tests last quarter, and the 18 SKUs stuck in
        approval cost <span className="font-mono font-semibold text-slate-950">$75K</span>. On autopilot, those ship the day they&apos;re ready.
      </p>
      {!withCompare && (
        <Link href="/settings?tab=policy" className={`${ACTION} mt-1 bg-brand-500 text-white hover:bg-brand-600`}>
          Put foundational content on autopilot
          <ArrowRight className="size-3.5" />
        </Link>
      )}
      {withCompare && (
        <button
          type="button"
          onClick={() => document.getElementById("autopilot-compare")?.scrollIntoView({ behavior: "smooth", block: "center" })}
          className="mt-1 inline-flex w-fit items-center gap-1 font-medium text-brand-700 hover:text-brand-800"
        >
          Increase autopilot
          <ArrowRight className="size-3.5" />
        </button>
      )}
    </div>
  )
}

/** Emails the summary (the PDF and the summary in the body) to whoever is signed in; download stays one click away. */
function EmailAnswer() {
  const { approved, nudged, policy } = useNudge()
  const [state, setState] = useState<"sending" | "sent" | "failed">("sending")
  useEffect(() => {
    execSummaryForEmail("quarter", { approved, nudged, policy })
      .then((payload) => emailMe({ kind: "summary", ...payload }, { quiet: true }))
      .then((ok) => setState(ok ? "sent" : "failed"))
    // Sent once, from the state when asked.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <div className="flex flex-col gap-2">
      <p>{state === "sending" ? "Emailing the summary…" : state === "sent" ? "Emailed you the summary, with the PDF attached. Forward it to your team." : "Couldn't email it. Download the PDF instead."}</p>
      {state !== "sending" && (
        <button type="button" onClick={() => downloadExecSummary("quarter", { approved, nudged, policy })} className={`${ACTION} border border-slate-200 bg-white text-slate-950 hover:border-brand-300 hover:text-brand-700`}>
          Download the PDF
        </button>
      )}
    </div>
  )
}

function PlanAnswer() {
  const live = useLive()
  const { nudged } = useNudge()
  const { fire } = useFireNudge()
  const { plan } = BUSINESS.quarter
  const pace = live.pace("quarter")
  // The fastest dollar: the top row one approval away (deadline first, then value).
  const top = live.approval.rows.find((r) => r.nudgeKey)
  const done = !!(top?.nudgeKey && nudged[top.nudgeKey])
  return (
    <div className="flex flex-col gap-3">
      <p>
        Not yet. You&apos;re tracking to <span className="font-mono font-semibold text-slate-950">{fmtBiz(pace)}</span> against a{" "}
        <span className="font-mono font-semibold text-slate-950">{fmtBiz(plan)}</span> plan, <span className="font-mono font-semibold text-slate-950">{fmtBiz(plan - pace)}</span> short. The fastest way to close the
        gap is the <span className="font-mono font-semibold text-slate-950">{live.approval.value}</span> that&apos;s one approval away: {live.approval.effort} of your
        team&apos;s time.
      </p>
      <div className="flex flex-wrap gap-2">
        {top && (
          <button type="button" disabled={done} onClick={() => fire(top)} className={`${ACTION} bg-brand-500 text-white hover:bg-brand-600 disabled:bg-success-50 disabled:text-success-700`}>
            {done ? (
              <>
                <Check className="size-4" /> Nudged {top.analystName}
              </>
            ) : (
              <>
                Nudge {top.analystName} · {top.value}
              </>
            )}
          </button>
        )}
        <button type="button" onClick={() => document.getElementById("stage-detail")?.scrollIntoView({ behavior: "smooth", block: "start" })} className={`${ACTION} border border-slate-200 bg-white text-slate-950 hover:border-brand-300 hover:text-brand-700`}>
          See what&apos;s one approval away
        </button>
      </div>
    </div>
  )
}

/** lastQuarter: the tier version, whose proof section is Q2 and still has "How you compare". */
export function Answer({ q, lastQuarter = false }: { q: Question; lastQuarter?: boolean }) {
  if (q === QUESTIONS_Q2[0]) return <InvestAnswer />
  if (q === QUESTIONS[1]) return <AdoptionAnswer />
  if (q === QUESTIONS[2] || q === QUESTIONS_Q2[2]) return <ContentMissAnswer lastQuarter={lastQuarter} />
  if (q === QUESTIONS[3]) return <AutopilotNextAnswer withCompare={lastQuarter} />
  if (q === QUESTIONS[5]) return <EmailAnswer />
  return <PlanAnswer />
}
