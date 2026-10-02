"use client"

import { useState } from "react"
import { toast } from "sonner"
import { tierView } from "../data"
import { emailMe } from "../email-me"
import { execSummaryForEmail } from "../exec-pdf"
import { useNudge } from "../nudge-context"
import { dayLabel, nextCheckIn, replyActions, useClaireActions } from "./claire-actions"

/**
 * Demo-only, beside Reset: move the clock to Claire's next check-in (she
 * looks twice a week) and send that morning's real email, or play Claire's reply to it. The reply runs the same moves as her
 * page, numbered as the email numbers them.
 */
export function DemoControls() {
  const { approved, nudged, policy, period, asks, approvedBy, day, nextMorning } = useNudge()
  const { askFor, approveMyself, autopilotSeasonal } = useClaireActions()
  const [busy, setBusy] = useState(false)
  const replies = replyActions(tierView("approval", approved, policy, period).rows, asks, approvedBy, day, policy)
  const next = nextCheckIn(day)

  async function morning() {
    if (next === undefined) return
    setBusy(true)
    nextMorning(next)
    toast(`Next check-in: ${dayLabel(next)}`, { position: "top-right" })
    try {
      await emailMe({ kind: "summary", ...(await execSummaryForEmail(period, { approved, nudged, policy, asks, approvedBy, day: next })) })
    } finally {
      setBusy(false)
    }
  }

  function reply(which?: number) {
    for (const r of replies.filter((x) => which === undefined || x.n === which)) {
      if (r.kind === "autopilot") autopilotSeasonal("email")
      else if (r.kind === "approve") approveMyself(r.row!, "email")
      else askFor(r.row!, "email")
    }
  }

  const LINK = "text-xs text-slate-400 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-40"
  return (
    <div className="flex items-center gap-4">
      <button type="button" onClick={morning} disabled={busy || next === undefined} className={LINK}>
        Next check-in ▸
      </button>
      <button type="button" onClick={() => reply(1)} disabled={!replies.length} className={LINK}>
        Claire replies YES 1
      </button>
      <button type="button" onClick={() => reply()} disabled={!replies.length} className={LINK}>
        Claire replies YES
      </button>
    </div>
  )
}
