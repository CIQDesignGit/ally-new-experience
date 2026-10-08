"use client"

import { useState } from "react"
import Link from "next/link"
import { CalendarDays, Check, Presentation, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { BUSINESS, fmtBiz } from "../data"
import { useLive } from "../live-model"
import { useNudge } from "../nudge-context"
import { GAP_TREE } from "../ops/gap-data"
import { PRIMARY, SECONDARY } from "../mike/buttons"
import { useWork } from "./sarah-parts"
import { ASKS, CONTEXT_CHANGES, INBOX, LAST_CALL, NEXT_MEETING, PRODUCT_ASKS, RECAP, SENTIMENT, SINCE_LAST } from "./data"
import { moodLine, useAttendees } from "./heard"

/** What Ally read and decided while building the prep, in order. */
const STEPS = [
  "Read Thursday's event from Google Calendar: 45 min, Claire, Mike and Michelle",
  "Pulled the forecast, plan and top cause from Claire's page",
  "Checked where each of the 6 asks from the Oct 2 call stands",
  "Added the 3 going-forward items from your Oct 2 recap",
  "Read Brightwick's promo tracker: gift-set price cut still live",
  "Ranked the decisions by deadline, then dollars",
]
const HEAD = "text-xs font-medium tracking-wide text-slate-500 uppercase font-mono"
const Section = ({ n, title, children }: { n: number; title: string; children: React.ReactNode }) => (
  <section className="grid grid-cols-[32px_minmax(0,1fr)] gap-4 border-t border-slate-100 py-6">
    <span className="font-mono text-sm text-slate-400">{n}</span>
    <div className="min-w-0">
      <h2 className="text-[17px] font-semibold text-slate-950">{title}</h2>
      <div className="mt-2.5 text-[15px] text-slate-700">{children}</div>
    </div>
  </section>
)
const Bullets = ({ items }: { items: React.ReactNode[] }) => (
  <ul className="flex flex-col gap-1.5">
    {items.map((x, i) => (
      <li key={i} className="flex gap-2">
        <span className="mt-2.5 size-1 shrink-0 rounded-full bg-slate-400" />
        <span className="min-w-0">{x}</span>
      </li>
    ))}
  </ul>
)

/**
 * Meeting prep, built from Sarah's calendar event: where the account stands,
 * what CommerceIQ owes it, what they asked for last time and where each stands,
 * what moved, the decisions to get, and the agenda, ranked deadline first.
 */
export function MeetingPrep() {
  const l = useLive()
  const { callItems, setCallItem, approved, runs } = useNudge()
  const { plan } = BUSINESS[l.period]
  const pace = l.pace(l.period)
  const top = GAP_TREE.drivers[0]
  // What's due by the meeting: this week's plan items, as they stand now (a call can have moved one).
  const due = useWork().plan[0].items.map((i) => ({ ...i, ...runs.edits[i.id] }))
  // Where each ask stands: Ally did it; on autopilot it's done, otherwise it waits for Sarah's approval.
  const askStatus = (answeredBy: string) => {
    const it = INBOX.find((x) => x.id === answeredBy)!
    if (it.kind === "autopilot") return callItems[it.id] === "dismissed" ? { text: "Undone", tone: "text-slate-500", done: false } : { text: "Done on autopilot", tone: "text-success-700", done: true }
    return callItems[it.id] === "done" ? { text: "Done · approved", tone: "text-success-700", done: true } : { text: "Built · goes out when you approve", tone: "text-slate-500", done: true }
  }
  const delivered = ASKS.filter((a) => askStatus(a.answeredBy).done).length
  const forward = RECAP.find((r) => r.id === "forward")!.lines
  // Ranked like every list: what has a deadline first (soonest), then dollars.
  const decisions = [
    { text: "Black Friday deals on 6 strong SKUs, set by Nov 6", value: "$1.1M at stake", agenda: "Decide on Black Friday deals, due Nov 6" },
    !approved["media-plan"] && { text: "Approve the $500K budget plan", value: "+$1.04M", agenda: "Decide on the $500K budget plan" },
    { text: "Put seasonal content on autopilot from the next event", value: "394 more SKUs", agenda: "Decide on seasonal autopilot" },
  ].filter(Boolean) as { text: string; value: string; agenda: string }[]
  const agenda = [
    `Your asks from ${LAST_CALL.short}: ${delivered === ASKS.length ? "all" : delivered} ${delivered === ASKS.length ? ASKS.length : `of ${ASKS.length}`} completed`,
    "Halloween countdown: 21 days to publish, $660K one approval away",
    ...decisions.map((d) => d.agenda),
  ].slice(0, 5)
  const attendees = useAttendees()
  const [sending, setSending] = useState(false)
  const [steps, setSteps] = useState(false)
  // Sending the agenda approves the call plan, here or from Sarah's inbox.
  const sent = callItems["p-call"] === "done"
  const setSent = (v: boolean) => v && setCallItem("p-call", "done")

  return (
    <div className="px-10 pt-2 pb-10">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 text-sm text-slate-500">
            <CalendarDays className="size-3.5" /> From {NEXT_MEETING.source}
          </div>
          <h1 className="mt-1 text-[28px] leading-tight font-bold tracking-tight text-slate-950">{NEXT_MEETING.title}</h1>
          <div className="mt-1 text-[15px] text-slate-700">
            {NEXT_MEETING.when} · {NEXT_MEETING.length} · {attendees.join(", ")}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/sarah/decks/weekly" className={SECONDARY}>
            <Presentation className="size-4" /> Open as slides
          </Link>
          {sent ? (
            <span className="inline-flex h-10 items-center gap-1.5 px-2 text-sm font-medium text-success-700">
              <Check className="size-4" /> Agenda sent
            </span>
          ) : (
            <button type="button" onClick={() => setSending(true)} className={PRIMARY}>
              Send agenda to attendees
            </button>
          )}
        </div>
      </div>

      {/* How Ally built it, written as it worked: the reasons, at the moment they were used. */}
      <div className="mt-4">
        <button type="button" onClick={() => setSteps((v) => !v)} aria-expanded={steps} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-slate-800">
          <Sparkles className="size-3.5 text-ally-600" /> Ally worked through {STEPS.length} steps · {steps ? "Hide" : "Show"} steps
        </button>
        {steps && (
          <ol className="mt-2 flex flex-col gap-1 border-l-2 border-ally-100 pl-4 text-[13px] text-slate-700">
            {STEPS.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ol>
        )}
      </div>

      {sending && !sent && (
        // A send to the customer: shown first, sent on a second click.
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-25 px-6 py-4 text-sm">
          <div className="text-slate-500">To {attendees.join(", ")}</div>
          <div className="mt-1 font-semibold text-slate-950">Agenda · {NEXT_MEETING.title}, {NEXT_MEETING.when}</div>
          <ol className="mt-2 list-decimal pl-5 text-slate-700">
            {agenda.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ol>
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSent(true)
                toast.success(`Agenda sent to ${attendees.length} attendees`, { position: "top-right" })
              }}
              className={PRIMARY}
            >
              Send
            </button>
            <button type="button" onClick={() => setSending(false)} className="text-[13px] font-medium text-slate-500 hover:text-slate-800">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-6">
        <Section n={1} title={`Your asks from ${LAST_CALL.short} · ${delivered === ASKS.length ? `all ${ASKS.length}` : `${delivered} of ${ASKS.length}`} completed`}>
          <Bullets
            items={[
              ...ASKS.map((c) => {
                const st = askStatus(c.answeredBy)
                return (
                  <>
                    <span className="font-medium text-slate-950">{c.title}</span> · <span className={st.tone}>{st.text}</span>
                  </>
                )
              }),
              ...PRODUCT_ASKS.map((h) => (
                <>
                  <span className="font-medium text-slate-950">{h.title}</span> · <span className="text-slate-500">{h.note}</span>
                </>
              )),
            ]}
          />
        </Section>
        <Section n={2} title="Where they stand">
          <Bullets
            items={[
              <>
                Forecast <b className="font-mono text-slate-950">{fmtBiz(pace)}</b> vs plan <b className="font-mono text-slate-950">{fmtBiz(plan)}</b> ·{" "}
                <span className={cn("font-mono font-semibold", plan > pace ? "text-error-600" : "text-success-700")}>
                  {plan > pace ? "−" : "+"}
                  {fmtBiz(Math.abs(plan - pace))}
                </span>
              </>,
              <>Top cause: {top.title}</>,
              <>
                Claire on {LAST_CALL.short}: {moodLine} · {SENTIMENT.did.toLowerCase()}
              </>,
              <>
                <b className="font-mono text-slate-950">{l.open.totalLabel}</b> in the pipeline to close it
              </>,
            ]}
          />
        </Section>
        <Section n={3} title="What we owe them this week">
          <Bullets
            items={due.map((i) => (
              <>
                <span className="font-medium text-slate-950">{i.name}</span> · {i.runs} ·{" "}
                <span className={/due today/i.test(i.last ?? "") ? "font-medium text-warning-700" : "text-slate-500"}>{i.last}</span>
              </>
            ))}
          />
        </Section>
        <Section n={4} title={`From your ${LAST_CALL.short} recap`}>
          <Bullets
            items={forward.map((f) => (
              <>
                {f} · <span className="text-success-700">included</span>
              </>
            ))}
          />
        </Section>
        <Section n={5} title="What's changed since">
          <Bullets items={SINCE_LAST} />
        </Section>
        <Section n={6} title="Decisions to get">
          <Bullets
            items={decisions.map((d) => (
              <>
                {d.text} · <span className="font-mono font-semibold text-slate-950">{d.value}</span>
              </>
            ))}
          />
        </Section>
        <Section n={7} title="Changed because of what Claire said">
          <Bullets
            items={CONTEXT_CHANGES.map((c) => (
              <>
                {c.what} · <span className="text-slate-500">{c.why}</span>
              </>
            ))}
          />
        </Section>
        <Section n={8} title="Agenda">
          <ol className="flex list-decimal flex-col gap-1.5 pl-5">
            {agenda.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ol>
        </Section>
      </div>
      <p className="text-xs text-slate-400">
        <span className={HEAD}>Sources</span> · {NEXT_MEETING.source} · {LAST_CALL.source} call {LAST_CALL.short}{" "}· live numbers from Claire&apos;s page and the queues
      </p>
    </div>
  )
}
