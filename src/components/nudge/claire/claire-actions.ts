"use client"

import { useCallback } from "react"
import { toast } from "sonner"
import { contentBatches, launchedIds, opsBatches } from "../data"
import { useNudge } from "../nudge-context"
import { useFireNudge } from "../use-fire-nudge"
import type { NudgeKey, TierRow } from "../types"

/**
 * Claire's three moves on anything waiting, the same from her page and from her
 * email: ask the owner to approve by a date (Ally follows up), approve it
 * herself, or (elsewhere) put that kind of work on autopilot. Each row's status
 * follows what the team and Claire have done, and the demo clock.
 */

/**
 * The demo clock. Claire checks in twice a week, so a step jumps to her next
 * check-in, not the next day. Day N is N calendar days after Thu, Oct 8, so
 * deadlines count down by real days.
 */
const DATES: Record<number, string> = { 0: "Thu, Oct 8", 1: "Fri, Oct 9", 4: "Mon, Oct 12", 6: "Wed, Oct 14", 7: "Thu, Oct 15", 8: "Fri, Oct 16" }
export const dayLabel = (day: number) => DATES[day] ?? `Day ${day}`
const CHECK_INS = [0, 4, 7]
/** What the team gets to finish an ask: a day or two, never past her next check-in. */
const DUE_AFTER: Record<number, number> = { 0: 1, 4: 6, 7: 8 }

/** Claire's next check-in after `day`, or undefined at the end of the demo. */
export function nextCheckIn(day: number) {
  return CHECK_INS.find((d) => d > day)
}

/** An ask's due date: Fri when asked Thu, Wed when asked Mon. */
export function dueFor(day: number) {
  const d = DUE_AFTER[day] ?? day + 1
  const label = dayLabel(d)
  return { label, short: label.split(",")[0], day: d }
}

/** Campaigns in progress fall behind the pace they need once a day passes with no movement. */
export function isBehind(row: TierRow, day: number) {
  return row.weekly?.state === "in-progress" && row.agent === "media" && day >= 1
}

export type RowState =
  | { kind: "shipped"; text: string }
  | { kind: "on-pace"; text: string }
  | { kind: "asked"; text: string }
  | { kind: "due"; text: string }
  | { kind: "overdue"; text: string }
  | { kind: "behind"; text: string }
  | { kind: "not-started"; text: string }

export function useClaireActions() {
  const { approved, policy, launchReady, asks, askBy, approvedBy, approveAs, day } = useNudge()
  const { sendSlack } = useFireNudge()

  /** The batches a row stands for, so approving it approves them. */
  const batchesFor = useCallback(
    (key?: NudgeKey) => {
      if (key === "approval-content") return contentBatches(policy, launchedIds(approved), launchReady).filter((b) => b.tier === "approval" && b.deadline)
      if (key === "approval-ops") return opsBatches(policy).filter((b) => b.tier === "approval")
      return []
    },
    [approved, policy, launchReady],
  )

  const statusOf = (row: TierRow): RowState => {
    const key = row.nudgeKey
    const name = row.analystName || "the team"
    if (key && approvedBy[key]) return { kind: "shipped", text: approvedBy[key] === "email" ? "Approved by your email reply" : "Approved by you" }
    const bs = batchesFor(key)
    const done = bs.filter((b) => approved[b.id])
    if (bs.length && done.length === bs.length) return { kind: "shipped", text: `Approved by ${name}` }
    const ask = key ? asks[key] : undefined
    const skusOf = (b: (typeof bs)[number]) => ("approveSkus" in b ? b.approveSkus : b.skus)
    const partial = done.length ? ` · ${done.reduce((n, b) => n + skusOf(b), 0)} of ${bs.reduce((n, b) => n + skusOf(b), 0)} SKUs approved` : ""
    if (ask) {
      if (day < ask.dueDay) return { kind: "asked", text: `Asked${ask.by === "email" ? " by email" : ""} · due ${ask.due}${partial || " · Ally follows up"}` }
      if (day === ask.dueDay) return { kind: "due", text: `Due today${partial}` }
      return { kind: "overdue", text: `Overdue since ${ask.due}${partial}` }
    }
    if (row.weekly?.state === "in-progress") {
      // A day on with no movement, the campaigns fall behind the pace they need.
      if (isBehind(row, day)) return { kind: "behind", text: `Behind · ${row.weekly.progress}, no movement since ${dayLabel(0).split(",")[0]}` }
      return { kind: "on-pace", text: `In progress · ${row.weekly.progress} · on pace` }
    }
    if (row.weekly?.state === "done") return { kind: "shipped", text: row.weekly.progress ?? "Done" }
    return { kind: "not-started", text: `Emailed Mon · not started${partial}` }
  }

  /** Ask the owner to approve by Friday: a real Slack DM and email to them; Ally follows up. */
  const askFor = (row: TierRow, by: "product" | "email") => {
    if (!row.nudgeKey) return
    const due = dueFor(day)
    askBy(row.nudgeKey, due.label, due.day, by)
    sendSlack(row)
    toast.success(`Asked ${row.analystName} to approve by ${due.label}${by === "email" ? " · from your email reply" : ""}`, { position: "top-right" })
  }

  /** Claire approves it herself: the row's batches ship now. */
  const approveMyself = (row: TierRow, by: "product" | "email") => {
    if (!row.nudgeKey) return
    approveAs(
      row.nudgeKey,
      by,
      batchesFor(row.nudgeKey).map((b) => b.id),
    )
    toast.success(`${by === "email" ? "Your email reply approved" : "Approved"}: ${row.description.replace(/\.$/, "")} · ${row.value}`, { position: "top-right" })
  }

  return { statusOf, askFor, approveMyself, day }
}

/** One action Claire can take by replying to her email, numbered the same in the email and the product. */
export interface ReplyAction {
  n: number
  kind: "approve" | "ask"
  row: TierRow
  label: string
  note: string
}

/**
 * The actions in Claire's email, in order: Halloween content first (it has the
 * deadline), then by value. Content she already asked about becomes "approve
 * it yourself"; the rest are asks with Friday's date. Anything done is left out.
 */
export function replyActions(rows: TierRow[], asks: Partial<Record<NudgeKey, { due: string; dueDay: number }>>, approvedBy: Partial<Record<NudgeKey, string>> = {}, day = 0): ReplyAction[] {
  return rows
    // Only what needs Claire: not done, and not work already moving on pace.
    .filter((r) => r.nudgeKey && !approvedBy[r.nudgeKey] && (r.valueM ?? 0) > 0 && (r.weekly?.state !== "in-progress" || isBehind(r, day)) && (!asks[r.nudgeKey] || r.nudgeKey === "approval-content"))
    .sort((a, b) => (a.days ?? Infinity) - (b.days ?? Infinity) || (b.valueM ?? 0) - (a.valueM ?? 0))
    .slice(0, 3)
    .map((r, i) => {
      const ask = asks[r.nudgeKey!]
      const what = r.description.replace(/\.$/, "")
      const approve = r.nudgeKey === "approval-content" && !!ask
      const due = dueFor(day)
      return {
        n: i + 1,
        kind: approve ? "approve" : "ask",
        row: r,
        label: approve ? `Approve it yourself: ${what}` : `Ask ${r.analystName} to finish by ${due.short}: ${what}`,
        note: [r.analystName, approve ? (day > ask.dueDay ? `overdue since ${ask.due}` : day === ask.dueDay ? "due today" : `asked, due ${ask.due}`) : r.deadline?.toLowerCase()].filter(Boolean).join(" · "),
      }
    })
}

export const REPLY_LINE = "Reply YES to do all of these, or YES 1, YES 2 or YES 3 for just one. No need to log in."
