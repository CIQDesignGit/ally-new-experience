"use client"

import { useState } from "react"
import { toast } from "sonner"
import { tierView } from "../data"
import { emailMe } from "../email-me"
import { execSummaryForEmail } from "../exec-pdf"
import { useNudge } from "../nudge-context"
import { BEATS, dayLabel, itemsFor, replyActions, useClaireActions } from "./claire-actions"

/**
 * Demo-only, beside Reset: play the week. Monday's email goes from the email
 * icon at the top (Claire assigns the week by replying). Wednesday and Friday, the team's progress
 * moves on and Claire's real email goes out. "Claire replies" plays her answer
 * to that email: the same moves as her page, numbered as the email numbers them.
 */
export function DemoControls() {
  const n = useNudge()
  const { approved, nudged, policy, period, asks, approvedBy, autoShipped, launchReady, day, nextMorning, approveMany, autoShip } = n
  const { assignFor, askFor, approveMyself, autopilotSeasonal, s } = useClaireActions()
  const [busy, setBusy] = useState(false)
  const rows = tierView("approval", approved, policy, period).rows
  const replies = replyActions(rows, s)
  const assigned = Object.values(asks).some((a) => a?.by === "ally")
  // Monday's email goes from the email icon at the top; once Claire assigns the week, the clock can move on.
  const step = day < BEATS[1].day ? "wed" : day < BEATS[2].day ? "fri" : null
  const LABEL = { wed: "Go to Wednesday ▸", fri: "Go to Friday ▸" }

  /** Claire's morning email, from the state as it will be once this step lands. */
  async function emailClaire(patch: { approved: Record<string, boolean>; autoShipped: typeof autoShipped; day: number }) {
    await emailMe({ kind: "summary", ...(await execSummaryForEmail(period, { nudged, policy, asks, approvedBy, launchReady, ...patch })) })
  }

  async function advance() {
    if (!step || (step === "wed" && !assigned)) return
    setBusy(true)
    try {
      if (step === "wed") {
        // By Wednesday, James has approved his plays; Michelle has approved a few of her fixes; Mike hasn't started.
        const few = itemsFor("approval-ops", s).slice(0, 2)
        const ids = [...itemsFor("approval-media", s).map((i) => i.id), ...few.map((i) => i.id)]
        approveMany(ids)
        nextMorning(BEATS[1].day)
        toast(`${dayLabel(BEATS[1].day)} · James approved his plays · Michelle approved ${few.length} fixes`, { position: "top-right" })
        await emailClaire({ approved: { ...approved, ...Object.fromEntries(ids.map((id) => [id, true])) }, autoShipped, day: BEATS[1].day })
        return
      }
      // Friday: Michelle finishes. Content Claire gave a ship-by date and nobody approved ships now: core SKUs only, hero SKUs held.
      const ops = itemsFor("approval-ops", s).filter((i) => !approved[i.id]).map((i) => i.id)
      const ask = asks["approval-content"]
      const ship = ask?.ship && ask.by !== "ally" && !approvedBy["approval-content"] ? itemsFor("approval-content", s).filter((i) => !approved[i.id] && !i.hero) : []
      approveMany(ops)
      if (ship.length) autoShip("approval-content", ship.map((i) => i.id))
      nextMorning(BEATS[2].day)
      toast(`${dayLabel(BEATS[2].day)} · Michelle approved the rest of her fixes${ship.length ? " · Ally shipped Mike's core SKUs on your deadline" : ""}`, { position: "top-right" })
      await emailClaire({
        approved: { ...approved, ...Object.fromEntries([...ops, ...ship.map((i) => i.id)].map((id) => [id, true])) },
        autoShipped: ship.length ? { ...autoShipped, "approval-content": ship.map((i) => i.id) } : autoShipped,
        day: BEATS[2].day,
      })
    } finally {
      setBusy(false)
    }
  }

  function reply(which?: number) {
    for (const r of replies.filter((x) => which === undefined || x.n === which)) {
      if (r.kind === "assign") assignFor(r.row!, "email")
      else if (r.kind === "autopilot") autopilotSeasonal("email")
      else if (r.kind === "approve") approveMyself(r.row!, "email")
      else askFor(r.row!, "email")
    }
  }

  // The week is played on Amazon's queues; another retailer's view hides the presenter row.
  if (n.retailer !== "amazon") return null
  const LINK = "text-xs font-medium text-slate-600 hover:text-brand-700 disabled:pointer-events-none disabled:text-slate-300"
  return (
    <div className="flex items-center gap-4">
      <span className="text-xs font-medium tracking-wide text-slate-400 uppercase">Demo</span>
      <button type="button" onClick={advance} disabled={busy || !step || (step === "wed" && !assigned)} className={LINK}>
        {step ? LABEL[step] : "End of week"}
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
