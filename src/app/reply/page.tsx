"use client"

import { useEffect, useRef, useState } from "react"
import { Check } from "lucide-react"
import { tierView } from "@/components/nudge/data"
import { useNudge } from "@/components/nudge/nudge-context"
import { ASSIGN_DUE, replyActions, shortDay, useClaireActions } from "@/components/nudge/claire/claire-actions"

/**
 * Where a YES button in Claire's email lands: it does what the reply says (the
 * same moves as her page), says what it did, and the open Ally tab follows.
 * "?n=all" is every action in the email; "?n=2" is just the second.
 */
export default function ReplyPage() {
  const { approved, policy, period } = useNudge()
  const { assignFor, askFor, approveMyself, autopilotSeasonal, s } = useClaireActions()
  const [done, setDone] = useState<string[] | null>(null)
  const ran = useRef(false)

  useEffect(() => {
    // After the demo's state has loaded from this browser (the provider reads it right after mount).
    const t = window.setTimeout(() => {
      if (ran.current) return
      ran.current = true
      const n = new URLSearchParams(window.location.search).get("n") ?? "all"
      const replies = replyActions(tierView("approval", approved, policy, period).rows, s).filter((r) => n === "all" || String(r.n) === n)
      for (const r of replies) {
        if (r.kind === "assign") assignFor(r.row!, "email")
        else if (r.kind === "autopilot") autopilotSeasonal("email")
        else if (r.kind === "approve") approveMyself(r.row!, "email")
        else askFor(r.row!, "email")
      }
      // Said as what happened, not as the email's line.
      setDone(replies.map((r) => (r.kind === "assign" ? `Assigned ${r.row!.analystName}, due ${shortDay(ASSIGN_DUE)}` : r.kind === "autopilot" ? "Seasonal content on autopilot, from the next event" : r.label)))
    }, 600)
    return () => window.clearTimeout(t)
    // Once, on arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approved])

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-[460px] rounded-2xl bg-white px-7 py-6 ring-1 ring-slate-200">
        <div className="text-[15px] font-semibold text-ink">
          Commerce<span className="text-brand-500">IQ</span> <span className="font-medium text-slate-400">· Ally</span>
        </div>
        {done === null ? (
          <p className="mt-4 text-sm text-slate-600">Doing what you asked…</p>
        ) : done.length ? (
          <>
            <p className="mt-4 text-lg font-semibold text-ink">Done</p>
            <ul className="mt-2 flex flex-col gap-1.5 text-sm text-slate-700">
              {done.map((d) => (
                <li key={d} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-success-600" /> {d}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[13px] text-slate-500">Ally is updated. You can close this tab.</p>
          </>
        ) : (
          <p className="mt-4 text-sm text-slate-600">Nothing left to do: this was already handled.</p>
        )}
      </div>
    </main>
  )
}
