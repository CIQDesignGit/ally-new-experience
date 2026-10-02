"use client"

import { useState } from "react"
import { toast } from "sonner"
import { tierView } from "../data"
import { emailMe } from "../email-me"
import { execSummaryForEmail } from "../exec-pdf"
import { useNudge } from "../nudge-context"
import { useFireNudge } from "../use-fire-nudge"
import type { NudgeKey } from "../types"
import { ASSIGN_DUE, BEATS, dayLabel, itemsFor, replyActions, useClaireActions } from "./claire-actions"

/**
 * Demo-only, beside Reset: play the week. Monday, Ally assigns the work (Mike
 * gets the real Slack and email). Wednesday and Friday, the team's progress
 * moves on and Claire's real email goes out. "Claire replies" plays her answer
 * to that email: the same moves as her page, numbered as the email numbers them.
 */
const WEEK_KEYS: NudgeKey[] = ["approval-content", "approval-media", "approval-ops"]

export function DemoControls() {
  const n = useNudge()
  const { approved, nudged, policy, period, asks, approvedBy, autoShipped, launchReady, day, nextMorning, askBy, approveMany, autoShip } = n
  const { askFor, approveMyself, autopilotSeasonal, s } = useClaireActions()
  const { sendSlack } = useFireNudge()
  const [busy, setBusy] = useState(false)
  const rows = tierView("approval", approved, policy, period).rows
  const replies = replyActions(rows, s)
  const assigned = Object.values(asks).some((a) => a?.by === "ally")
  const step = !assigned ? "assign" : day < BEATS[1].day ? "wed" : day < BEATS[2].day ? "fri" : null
  const LABEL = { assign: "Run Monday's assignments ▸", wed: "Go to Wednesday ▸", fri: "Go to Friday ▸" }

  /** Claire's morning email, from the state as it will be once this step lands. */
  async function emailClaire(patch: { approved: Record<string, boolean>; autoShipped: typeof autoShipped; day: number }) {
    await emailMe({ kind: "summary", ...(await execSummaryForEmail(period, { nudged, policy, asks, approvedBy, launchReady, ...patch })) })
  }

  async function advance() {
    if (!step) return
    setBusy(true)
    try {
      if (step === "assign") {
        // Ally's Monday run: every owner gets their list, due Wednesday. Only Mike's Slack and email are real.
        const due = dayLabel(ASSIGN_DUE)
        for (const r of rows.filter((r) => r.nudgeKey && WEEK_KEYS.includes(r.nudgeKey))) {
          askBy(r.nudgeKey!, due, ASSIGN_DUE, "ally")
          if (r.nudgeKey === "approval-content") sendSlack(r, { headline: `Ally assigned you this week's work: ${r.description.replace(/\.$/, "")}. Due ${due}.`, chip: `Due ${due}` })
          else toast(`Ally assigned ${r.analystName}: ${r.description.replace(/\.$/, "")} · due ${due.split(",")[0]}`, { position: "top-right" })
        }
        return
      }
      if (step === "wed") {
        // By Wednesday, Michelle has approved her fixes; James is partway; Mike hasn't started.
        const ids = itemsFor("approval-ops", s).map((i) => i.id)
        approveMany(ids)
        nextMorning(BEATS[1].day)
        toast(`${dayLabel(BEATS[1].day)} · Michelle approved her fixes`, { position: "top-right" })
        await emailClaire({ approved: { ...approved, ...Object.fromEntries(ids.map((id) => [id, true])) }, autoShipped, day: BEATS[1].day })
        return
      }
      // Friday: James finishes. Content Claire gave a ship-by date and nobody approved ships now: core SKUs only, hero SKUs held.
      const media = ["media-dsp"]
      const ask = asks["approval-content"]
      const ship = ask?.ship && ask.by !== "ally" && !approvedBy["approval-content"] ? itemsFor("approval-content", s).filter((i) => !approved[i.id] && !i.hero) : []
      approveMany(media)
      if (ship.length) autoShip("approval-content", ship.map((i) => i.id))
      nextMorning(BEATS[2].day)
      toast(`${dayLabel(BEATS[2].day)} · James approved his campaigns${ship.length ? " · Ally shipped Mike's core SKUs on your deadline" : ""}`, { position: "top-right" })
      await emailClaire({
        approved: { ...approved, ...Object.fromEntries([...media, ...ship.map((i) => i.id)].map((id) => [id, true])) },
        autoShipped: ship.length ? { ...autoShipped, "approval-content": ship.map((i) => i.id) } : autoShipped,
        day: BEATS[2].day,
      })
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
      <button type="button" onClick={advance} disabled={busy || !step} className={LINK}>
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
