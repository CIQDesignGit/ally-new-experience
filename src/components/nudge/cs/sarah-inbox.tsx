"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, CalendarDays, Check, Mic, Presentation } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useNudge } from "../nudge-context"
import { BUSINESS, fmtBiz } from "../data"
import { useLive } from "../live-model"
import { PRIMARY, SECONDARY } from "../mike/buttons"
import { GROUPS } from "../mike/rail"
import { InboxFilters } from "../ops/ops-batch-list"
import type { InboxFilter } from "../ops/ops-batch-list"
import { DetailCard } from "../ui/detail-card"
import { DoneReel } from "../ui/done-reel"
import { ASKS, CONTEXT_CHANGES, INBOX, LAST_CALL, NEXT_MEETING, PRODUCT_ASKS, RECAP, REEL, SARAH_NOW } from "./data"
import type { InboxItem } from "./data"
import { Artifact, useWork } from "./sarah-parts"
import { WhyIcon } from "./why-icon"
import { SentimentPane, moodDecided, moodLine, useAttendees } from "./heard"

const HEAD = "text-xs font-medium text-slate-500"
const DOT = Object.fromEntries(GROUPS.map((g) => [g.tier, g.dot])) as Record<"approval" | "input" | "autopilot", string>

/** How far off the call is: Sarah's clock is Wednesday night, the call is Thursday at 2 PM. */
export function useCallIn() {
  return { short: SARAH_NOW.callInShort, long: SARAH_NOW.callIn, past: false }
}

/** The headline: the call is the deadline, and what needs her before it. */
export function SarahHero() {
  const { waiting } = useWork()
  const call = useCallIn()
  const attendees = useAttendees()
  return (
    <div className="px-10 pt-2 pb-6">
      <div className="text-2xl font-semibold tracking-tight text-slate-700">
        {call.past ? "Your Aurelle call was Thursday." : <>Your Aurelle call is in <span className="text-slate-950">{call.long}</span>.</>}
      </div>
      <h1 className="mt-1 text-[28px] leading-tight font-bold tracking-tight text-slate-950">
        {waiting.length ? `${waiting.length} ${waiting.length === 1 ? "needs" : "need"} your approval before it.` : "Nothing is waiting for you."}
      </h1>
      <div className="mt-2 inline-flex items-center gap-1.5 text-sm text-slate-500">
        <CalendarDays className="size-3.5" /> {NEXT_MEETING.title} · {NEXT_MEETING.when} · {attendees.join(", ")}
      </div>
      <div className="mt-5">
        <DoneReel items={REEL} since="since yesterday" />
      </div>
    </div>
  )
}

type Sel = string

/** Sarah's inbox, laid out like Mike's and Michelle's: groups on the left, the selected work on the right. */
export function SarahInbox() {
  const w = useWork()
  const call = useCallIn()
  const approvals = INBOX.filter((i) => i.kind === "approval")
  const autos = INBOX.filter((i) => i.kind === "autopilot")
  // The call plan first, then what's due today, then the rest; done items sink.
  const rank = (i: InboxItem) => (w.callItems[i.id] ? 100 : 0) + (i.id === "p-call" ? 0 : i.due === "Today" ? 1 : 2)
  const ordered = [...approvals].sort((a, b) => rank(a) - rank(b))
  const [sel, setSel] = useState<Sel>(ordered[0].id)
  const { callItems } = useNudge()
  const mood = moodDecided(callItems)
  // The same filters as the other queues: one ranked list, the bucket in each row's dot.
  const [filter, setFilter] = useState<InboxFilter>("all")
  const show = (t: InboxFilter) => filter === "all" || filter === t
  const selected = INBOX.find((i) => i.id === sel)


  return (
    <div className="grid grid-cols-1 border-t border-slate-300 lg:grid-cols-[400px_minmax(0,1fr)]">
      <div className="border-b border-slate-300 bg-white lg:border-r lg:border-b-0">
        <InboxFilters filter={filter} onFilter={setFilter} />
        {show("approval") && ordered.map((i) => {
          const done = w.approved(i.id)
          return (
            <InboxRow
              key={i.id}
              id={i.id} active={sel === i.id} onSelect={setSel}
              dot={DOT.approval}
              done={done}
              title={title(i)}
              meta={i.ask ? `From the ${LAST_CALL.short} call` : i.source}
              right={done ? <span className="inline-flex items-center gap-1 text-success-700"><Check className="size-3" />Done</span> : i.id === "p-call" ? <span className="text-warning-700">{call.past ? "" : `Call in ${call.short}`}</span> : <span className={i.due === "Today" ? "text-warning-700" : "text-slate-500"}>{i.due === "Today" ? "Today" : i.due}</span>}
            />
          )
        })}
        {show("input") && <InboxRow id="mood" active={sel === "mood"} onSelect={setSel} dot={DOT.input} done={mood} title="How Claire felt" meta={`${moodLine} · value concern`} right={mood ? <span className="text-slate-500">Done</span> : <span className="text-warning-700">Negative</span>} />}
        {show("autopilot") && <InboxRow id="recap" active={sel === "recap"} onSelect={setSel} dot={DOT.autopilot} done title={`Saved the ${LAST_CALL.short} recap to context`} meta={`On its own ${LAST_CALL.savedOn} · edit anytime`} right={<span className="text-slate-500">Done</span>} />}
        {show("autopilot") && autos.map((i) => (
          <InboxRow key={i.id} id={i.id} active={sel === i.id} onSelect={setSel} dot={DOT.autopilot} done title={i.line} meta={i.ask ? `From the ${LAST_CALL.short} call` : i.source} right={w.undone(i.id) ? <span className="text-slate-500">{i.undo === "Undo" ? "Undone" : "Recalled"}</span> : <span className="text-slate-500">Done</span>} />
        ))}
      </div>
      <DetailCard>
        <div className="px-10 py-8">
          {sel === "recap" ? <RecapPane /> : sel === "mood" ? <SentimentPane /> : selected ? <ItemPane item={selected} /> : null}
        </div>
      </DetailCard>
    </div>
  )
}

type RowProps = { id: string; title: string; meta: string; right?: React.ReactNode; dot: string; done?: boolean }

/** One row in the rail: dot, title, a short line under it, and the status on the right. */
function InboxRow({ id, title, meta, right, dot, done, active, onSelect }: RowProps & { active: boolean; onSelect: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={cn("relative grid w-full grid-cols-[8px_minmax(0,1fr)_auto] items-baseline gap-x-2.5 border-b border-slate-100 py-2.5 pr-4 pl-10 text-left outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-inset", active && "bg-slate-50 shadow-[inset_2px_0_0_var(--color-brand-500)]")}
    >
      <span className={cn("size-2 -translate-y-px rounded-full", dot)} />
      <span className="min-w-0">
        <span className={cn("block text-[14px] leading-snug", done ? "text-slate-500" : "font-medium text-slate-950")}>{title}</span>
        <span className="mt-0.5 block truncate text-xs text-slate-500">{meta}</span>
      </span>
      <span className="text-right text-xs font-medium whitespace-nowrap">{right}</span>
    </button>
  )
}

const title = (i: InboxItem) => (i.id === "p-call" ? "Review the plan for Thursday's call" : i.line.replace(/^Drafted the /, "").replace(/^./, (c) => c.toUpperCase()))

/** One item: what Ally did, the work itself, then its one action. */
function ItemPane({ item }: { item: InboxItem }) {
  const w = useWork()
  const { approve } = useNudge()
  const ask = ASKS.find((a) => a.id === item.ask)
  const done = w.approved(item.id)
  const auto = item.kind === "autopilot"
  const attendees = useAttendees()
  function approveIt() {
    w.setCallItem(item.id, "done")
    if (item.approves) approve(item.approves)
    toast.success(item.id === "p-call" ? `Agenda sent to ${attendees.length} attendees` : `Approved · ${title(item)}`, { position: "top-right" })
  }
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <div className="text-sm font-medium text-slate-500">{auto ? "On autopilot" : item.id === "p-call" ? `${NEXT_MEETING.when} · ${NEXT_MEETING.length}` : ask ? `${ask.who.split(" ")[0]} on the ${LAST_CALL.short} call, ${ask.at}` : item.source}</div>
          <div className="mt-0.5 flex items-center gap-1 text-2xl font-semibold tracking-tight text-slate-950">
            {auto ? item.line : title(item)}
            <WhyIcon why={item.why} align="left" />
          </div>
        </div>
      </div>
      {item.artifact?.kind === "call" ? <CallPlan /> : <Artifact item={item} />}
      {ask && (
        <blockquote className="border-l-2 border-slate-200 pl-3 text-[13px] text-slate-500">
          &ldquo;{ask.quote}&rdquo; · {ask.who.split(" ")[0]}, {LAST_CALL.short} call, {ask.at}
        </blockquote>
      )}
      <div className="flex flex-wrap items-center gap-4">
        {auto ? (
          w.undone(item.id) ? (
            <span className="text-sm text-slate-500">{item.undo === "Undo" ? "Undone" : "Recalled"}</span>
          ) : (
            <>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success-700">
                <Check className="size-4" /> Done on autopilot
              </span>
              <button type="button" onClick={() => w.setCallItem(item.id, "dismissed")} className="text-[13px] font-medium text-brand-700 hover:underline">
                {item.undo}
              </button>
            </>
          )
        ) : done ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success-700">
            <Check className="size-4" /> {item.id === "p-call" ? "Agenda sent" : "Approved"}
          </span>
        ) : (
          <>
            <button type="button" onClick={approveIt} className={PRIMARY}>
              {item.id === "p-call" ? "Approve and send agenda" : item.artifact?.kind === "email" ? "Approve and send" : "Approve"}
            </button>
            {item.id === "p-call" ? (
              <Link href="/sarah/decks/weekly" className={SECONDARY}>
                <Presentation className="size-4" /> Open as slides
              </Link>
            ) : (
              !w.held(item.id) && (
                <button type="button" onClick={() => w.setCallItem(item.id, "dismissed")} className="text-[13px] font-medium text-slate-500 hover:text-slate-800">
                  Hold
                </button>
              )
            )}
          </>
        )}
        {item.href && item.id !== "p-call" && (
          <Link href={item.href} className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
            Open it <ArrowRight className="size-3.5" />
          </Link>
        )}
      </div>
    </div>
  )
}

/** The plan for the call: the agenda Sarah will send, in plain lines, with what's done on last call's asks. */
function CallPlan() {
  const l = useLive()
  const { plan } = BUSINESS[l.period]
  const pace = l.pace(l.period)
  const { callItems } = useNudge()
  const status = (id: string) => {
    const it = INBOX.find((x) => x.id === id)!
    return it.kind === "autopilot" ? callItems[it.id] !== "dismissed" : callItems[it.id] === "done"
  }
  const agenda = [
    { title: "Halloween content", text: "$660K is one approval from live. It has to publish by Oct 26." },
    { title: "Black Friday deals", text: "Pick deals for 6 strong SKUs by Nov 6. About $1.1M is at stake." },
    { title: "The $500K budget plan", text: "Approve the split. It adds about $1.04M in sales." },
    { title: "Seasonal on autopilot", text: "Let core seasonal pages ship without review from the next event: 394 more SKUs." },
  ]
  // Ally did every ask; the ones that change money or make a promise go out once Sarah approves.
  const built = ASKS.filter((a) => !status(a.answeredBy))
  return (
    <div className="flex flex-col gap-6 text-[15px]">
      <p className="text-slate-700">
        Aurelle is tracking to <span className="font-semibold text-slate-950">{fmtBiz(pace)}</span> against a {fmtBiz(plan)} plan,{" "}
        <span className={cn("font-semibold", plan > pace ? "text-error-600" : "text-success-700")}>
          {fmtBiz(Math.abs(plan - pace))} {plan > pace ? "short" : "ahead"}
        </span>
        . The biggest cause is the buy box lost on hero SKUs.
      </p>
      <div>
        <div className={HEAD}>
          Your asks from {LAST_CALL.short} · all {ASKS.length} completed
        </div>
        <ul className="mt-2 flex flex-col">
          {ASKS.map((a) => {
            const out = status(a.answeredBy)
            return (
              <li key={a.id} className="grid grid-cols-[16px_minmax(0,1fr)_auto] items-baseline gap-2 border-t border-slate-100 py-2 first:border-t-0">
                <Check className="size-3.5 translate-y-0.5 text-success-600" />
                <span className="text-slate-950">{out ? a.did : a.title}</span>
                <span className="text-[13px] whitespace-nowrap text-slate-500">{out ? "Done" : "Built · goes out when you approve"}</span>
              </li>
            )
          })}
        </ul>
        <ul className="flex flex-col">
          {PRODUCT_ASKS.map((h) => (
            <li key={h.id} className="grid grid-cols-[16px_minmax(0,1fr)_auto] items-baseline gap-2 border-t border-slate-100 py-2">
              <Check className="size-3.5 translate-y-0.5 text-success-600" />
              <span className="text-slate-950">{h.title}</span>
              <span className="text-[13px] whitespace-nowrap text-slate-500">{h.note}</span>
            </li>
          ))}
        </ul>
        {built.length > 0 && <p className="mt-1 text-[13px] text-slate-500">Approve {built.length === 1 ? "it" : `the ${built.length}`} before the call and you present all {ASKS.length} as done.</p>}
      </div>
      <div>
        <div className={HEAD}>Then the agenda</div>
        <ol className="mt-2 flex flex-col gap-3">
          {agenda.map((a, i) => (
            <li key={a.title} className="grid grid-cols-[24px_minmax(0,1fr)] gap-2">
              <span className="font-mono text-sm text-slate-400">{i + 1}</span>
              <span>
                <span className="font-semibold text-slate-950">{a.title}.</span> <span className="text-slate-700">{a.text}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
      <div>
        <div className={HEAD}>Changed because of what Claire said</div>
        <ul className="mt-2 flex flex-col gap-1">
          {CONTEXT_CHANGES.map((c) => (
            <li key={c.what} className="text-slate-950">
              · {c.what} <span className="text-[13px] text-slate-500">· {c.why}</span>
            </li>
          ))}
        </ul>
      </div>
      <Link href="/sarah/prep" className="inline-flex w-fit items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
        Open the full prep <ArrowRight className="size-3.5" />
      </Link>
    </div>
  )
}

/** The recap item: it saved itself 72 hours after the call; it stays editable. */
function RecapPane() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500">
          <Mic className="size-3.5" /> {LAST_CALL.title} · {LAST_CALL.date} · from {LAST_CALL.source}
        </div>
        <div className="mt-0.5 text-2xl font-semibold tracking-tight text-slate-950">Recap and context</div>
        <div className="mt-1 text-sm font-medium text-success-700">Saved to Aurelle&apos;s context on its own, {LAST_CALL.savedOn}, 72 hours after the call · edit anytime</div>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200">
        {RECAP.map((r) => (
          <div key={r.id} className="grid grid-cols-[160px_minmax(0,1fr)] gap-4 border-t border-slate-100 px-5 py-3 text-sm first:border-t-0">
            <span className={HEAD}>{r.title}</span>
            <span className="text-slate-950">
              {r.lines[0]}
              {r.lines.length > 1 && <span className="text-slate-500"> · +{r.lines.length - 1} more</span>}
            </span>
          </div>
        ))}
      </div>
      <Link href="/sarah/recap" className={cn(SECONDARY, "w-fit")}>
        Open and edit
      </Link>
    </div>
  )
}
