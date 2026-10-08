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
import { DoneReel } from "../ui/done-reel"
import { ASKS, INBOX, LAST_CALL, NEXT_MEETING, RECAP, REEL, SARAH_NOW } from "./data"
import type { InboxItem } from "./data"
import { Artifact, useWork } from "./sarah-parts"
import { WhyIcon } from "./why-icon"

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
  return (
    <div className="px-10 pt-2 pb-6">
      <div className="text-2xl font-semibold tracking-tight text-slate-700">
        {call.past ? "Your Aurelle call was Thursday." : <>Your Aurelle call is in <span className="text-slate-950">{call.long}</span>.</>}
      </div>
      <h1 className="mt-1 text-[28px] leading-tight font-bold tracking-tight text-slate-950">
        {waiting.length ? `${waiting.length} ${waiting.length === 1 ? "needs" : "need"} your approval before it.` : "Nothing is waiting for you."}
      </h1>
      <div className="mt-2 inline-flex items-center gap-1.5 text-sm text-slate-500">
        <CalendarDays className="size-3.5" /> {NEXT_MEETING.title} · {NEXT_MEETING.when} · {NEXT_MEETING.attendees.join(", ")}
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
  const selected = INBOX.find((i) => i.id === sel)


  return (
    <div className="grid grid-cols-1 border-t border-slate-200 lg:grid-cols-[340px_minmax(0,1fr)]">
      <div className="border-b border-slate-200 bg-white lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-25 px-3.5 py-2 text-xs font-medium text-slate-500">
          <span>Needs your approval</span>
          <span className="font-mono">{w.waiting.length}</span>
        </div>
        {ordered.map((i) => {
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
        <div className="flex items-center justify-between border-y border-slate-100 bg-slate-25 px-3.5 py-2 text-xs font-medium text-slate-500">
          <span>From the {LAST_CALL.short} call</span>
          <span className="font-mono">{RECAP.reduce((n, r) => n + r.lines.length, 0)}</span>
        </div>
        <InboxRow id="recap" active={sel === "recap"} onSelect={setSel} dot={DOT.input} title="Recap and context" meta={`Saved on its own ${LAST_CALL.savedOn} · edit anytime`} right={<span className="text-success-700">Saved</span>} />
        <div className="flex items-center justify-between border-y border-slate-100 bg-slate-25 px-3.5 py-2 text-xs font-medium text-slate-500">
          <span>On autopilot</span>
          <span className="font-mono">{autos.length}</span>
        </div>
        {autos.map((i) => (
          <InboxRow key={i.id} id={i.id} active={sel === i.id} onSelect={setSel} dot={DOT.autopilot} done title={i.line} meta={i.ask ? `From the ${LAST_CALL.short} call` : i.source} right={w.undone(i.id) ? <span className="text-slate-500">{i.undo === "Undo" ? "Undone" : "Recalled"}</span> : <span className="text-slate-500">Done</span>} />
        ))}
      </div>
      <div className="min-w-0 px-10 py-8">{sel === "recap" ? <RecapPane /> : selected ? <ItemPane item={selected} /> : null}</div>
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
      className={cn("grid w-full grid-cols-[8px_minmax(0,1fr)_auto] items-baseline gap-x-2.5 border-b border-slate-100 px-3.5 py-2.5 text-left hover:bg-slate-50", active && "bg-slate-50 shadow-[inset_2px_0_0_var(--color-brand-500)]")}
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
  function approveIt() {
    w.setCallItem(item.id, "done")
    if (item.approves) approve(item.approves)
    toast.success(item.id === "p-call" ? `Agenda sent to ${NEXT_MEETING.attendees.length} attendees` : `Approved · ${title(item)}`, { position: "top-right" })
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

/** The call plan, short: the full prep is one click away. */
function CallPlan() {
  const l = useLive()
  const { plan } = BUSINESS[l.period]
  const pace = l.pace(l.period)
  const { callItems } = useNudge()
  const done = ASKS.filter((a) => {
    const it = INBOX.find((x) => x.id === a.answeredBy)
    return it && (it.kind === "autopilot" ? callItems[it.id] !== "dismissed" : callItems[it.id] === "done")
  }).length
  const forward = RECAP.find((r) => r.id === "forward")!.lines
  const rows = [
    { label: "Where they stand", value: <>{fmtBiz(pace)} vs {fmtBiz(plan)} plan · <span className={plan > pace ? "text-error-600" : "text-success-700"}>{plan > pace ? "−" : "+"}{fmtBiz(Math.abs(plan - pace))}</span></> },
    { label: "Last call's asks", value: `${done} of ${ASKS.length} done` },
    { label: "From your recap", value: `${forward.length} going-forward items included` },
    { label: "Decisions to get", value: "Black Friday deals · the $500K plan · seasonal autopilot" },
    { label: "Agenda", value: "5 lines, ranked by deadline" },
  ]
  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-xl border border-slate-200">
        {rows.map((r) => (
          <div key={r.label} className="grid grid-cols-[160px_minmax(0,1fr)] gap-4 border-t border-slate-100 px-5 py-3 text-sm first:border-t-0">
            <span className={HEAD}>{r.label}</span>
            <span className="text-slate-950">{r.value}</span>
          </div>
        ))}
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
