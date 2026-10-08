"use client"

import { useState } from "react"
import { Check, Mic, UserPlus } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useNudge } from "../nudge-context"
import { PRIMARY, SECONDARY } from "../mike/buttons"
import { LAST_CALL, MANAGER, NEXT_MEETING, SENTIMENT } from "./data"

const HEAD = "text-xs font-medium text-slate-500"
const INVITED = "mgr-invite"

/** Thursday's attendees, with Sarah's manager once she's brought in. */
export function useAttendees() {
  const { callItems } = useNudge()
  return callItems[INVITED] === "done" ? [...NEXT_MEETING.attendees, MANAGER.name] : NEXT_MEETING.attendees
}

const latest = SENTIMENT.calls[SENTIMENT.calls.length - 1]

/** The rail's line for the mood: how Claire sounded, against the calls before. */
export const moodLine = `${latest.mood}, down from ${SENTIMENT.calls[SENTIMENT.calls.length - 2].mood.toLowerCase()}`

/** Sarah has decided on the mood: brought in her manager, or not this time. */
export const moodDecided = (c: Record<string, string>) => !!c[INVITED]

/**
 * How Claire sounded on the last call. Sarah sees it first, with the reason and
 * what Ally already did. Bringing in her manager is her move: Ally drafts the
 * note and adds them to Thursday's call with the context.
 */
export function SentimentPane() {
  const { callItems, setCallItem } = useNudge()
  const invited = callItems[INVITED] === "done"
  const [drafting, setDrafting] = useState(false)
  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500">
          <Mic className="size-3.5" /> {LAST_CALL.title} · {LAST_CALL.date} · from {LAST_CALL.source}
        </div>
        <div className="mt-0.5 text-2xl font-semibold tracking-tight text-slate-950">How Claire felt on the {LAST_CALL.short} call</div>
      </div>
      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 text-sm">
        {SENTIMENT.calls.map((c, i) => (
          <span key={c.date} className="text-slate-500">
            {c.date} <span className={cn("font-medium", i === SENTIMENT.calls.length - 1 ? "text-warning-700" : "text-slate-950")}>{c.mood}</span>
          </span>
        ))}
      </div>
      <div>
        <div className={HEAD}>Why</div>
        <ul className="mt-2 flex flex-col gap-2">
          {SENTIMENT.why.map((w) => (
            <li key={w.at} className="border-l-2 border-slate-200 pl-3 text-[15px] text-slate-700">
              &ldquo;{w.quote}&rdquo; <span className="text-[13px] text-slate-500">· Claire, {w.at}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <div className={HEAD}>What Ally did</div>
        <p className="mt-1 text-[15px] text-slate-950">{SENTIMENT.did}</p>
      </div>
      {callItems[INVITED] === "dismissed" ? (
        <span className="text-sm text-slate-500">Not this time</span>
      ) : invited ? (
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success-700">
          <Check className="size-4" /> {MANAGER.first} is on Thursday&apos;s call · brief sent
        </span>
      ) : drafting ? (
        // A send: shown first, sent on a second click.
        <div className="rounded-xl border border-slate-200 bg-slate-25 px-6 py-4 text-sm">
          <div className="text-slate-500">
            To {MANAGER.name}, {MANAGER.role}
          </div>
          <div className="mt-1 font-semibold text-slate-950">{SENTIMENT.note.subject}</div>
          <div className="mt-2 flex flex-col gap-2 text-slate-700">
            {SENTIMENT.note.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setCallItem(INVITED, "done")
                toast.success(`${MANAGER.first} added to Thursday's call`, { position: "top-right" })
              }}
              className={PRIMARY}
            >
              Send and add {MANAGER.first} to the call
            </button>
            <button type="button" onClick={() => setDrafting(false)} className="text-[13px] font-medium text-slate-500 hover:text-slate-800">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-4">
          <button type="button" onClick={() => setDrafting(true)} className={SECONDARY}>
            <UserPlus className="size-4" /> Bring in {MANAGER.first}
          </button>
          <button type="button" onClick={() => setCallItem(INVITED, "dismissed")} className="text-[13px] font-medium text-slate-500 hover:text-slate-800">
            Not this time
          </button>
        </div>
      )}
    </div>
  )
}
