"use client"

import { toast } from "sonner"
import { BATCHES, contentBatches, getSnapshot, launchedIds, opsBatches } from "../data"
import { money } from "../model"
import { useNudge, WEEK_START, type Ask } from "../nudge-context"
import { useFireNudge } from "../use-fire-nudge"
import { AGENT_LABEL, type NudgeKey, type TierRow } from "../types"
import type { Policy, ReviewRule } from "../policy"

/**
 * Claire's week, the same from her page and from her email. Monday, Ally
 * assigns the work with a Wednesday due date. Wednesday, Claire sees who's done
 * and sets Friday for the rest ("or Ally ships it"). Friday, Ally ships what
 * nobody approved (core SKUs; hero SKUs wait for the owner), and Claire can put
 * that kind of work on autopilot. Every status here follows the demo clock.
 */

/** The demo clock, in days from Thu, Oct 8 (the date every countdown is counted from). */
const DATES: Record<number, string> = { [-3]: "Mon, Oct 5", [-1]: "Wed, Oct 7", 0: "Thu, Oct 8", 1: "Fri, Oct 9", 4: "Mon, Oct 12" }
export const dayLabel = (day: number) => DATES[day] ?? `Day ${day}`
export const shortDay = (day: number) => dayLabel(day).split(",")[0]
const shortOf = (label: string) => label.split(",")[0]

/** Monday is the team's morning; Wednesday and Friday are Claire's. */
export const BEATS = [
  { day: -3, name: "Monday" },
  { day: -1, name: "Wednesday" },
  { day: 1, name: "Friday" },
]
/** Ally's Monday assignment is due Wednesday; Claire's ask on Wednesday is due Friday. */
export const ASSIGN_DUE = -1
const CLAIRE_DUE = 1

export function dueFor(day: number) {
  const d = day < ASSIGN_DUE ? ASSIGN_DUE : day < CLAIRE_DUE ? CLAIRE_DUE : 4
  const label = dayLabel(d)
  return { label, short: shortOf(label), day: d }
}

/** "Expires in 18 days" (counted at Thu, Oct 8), counted at the demo's day. */
export const countdown = (deadline: string | undefined, day: number) => deadline?.replace(/(\d+) days/, (_, n) => `${Math.max(0, Number(n) - day)} days`)

/** Everything a status depends on: what's approved, who owes what, and the day. */
export interface WeekState {
  approved: Record<string, boolean>
  policy: Policy
  launchReady?: boolean
  asks: Partial<Record<NudgeKey, Ask>>
  approvedBy: Partial<Record<NudgeKey, "product" | "email">>
  autoShipped: Partial<Record<NudgeKey, string[]>>
  day: number
}

/** The work a row stands for, so approving it approves them: each part with its SKUs, value ($M), and whether it's the hero part. */
export function itemsFor(key: NudgeKey | undefined, s: Pick<WeekState, "approved" | "policy" | "launchReady">) {
  const value = (id: string) => getSnapshot(s.policy).items.find((i) => i.id === id)?.value ?? 0
  if (key === "approval-content")
    return contentBatches(s.policy, launchedIds(s.approved), s.launchReady)
      .filter((b) => b.tier === "approval" && b.deadline)
      .map((b) => ({ id: b.id, skus: b.approveSkus ?? b.skus, value: b.approveValue, hero: b.mode === "each" }))
  if (key === "approval-ops") return opsBatches(s.policy).filter((b) => b.tier === "approval").map((b) => ({ id: b.id, skus: b.skus, value: value(b.id), hero: false }))
  if (key === "approval-media") return [{ id: "media-dsp", skus: 5, value: value("media-dsp"), hero: false }]
  return []
}

export type RowState = {
  kind: "pre" | "assigned" | "due" | "overdue" | "asked" | "held" | "shipped"
  /** The whole story in one line, for the email. */
  text: string
  /** The work alone, for the page's Status column: "Not assigned", "Not started", "2 of 5 campaigns live", "Approved by Michelle". */
  work: string
  /** What shipped, for "held" and "shipped". */
  shipped?: string
  /** Of that, what Ally shipped at Claire's deadline. */
  byAlly?: string
}

/** Where a row stands, in the words Claire's page and email both use. */
export function rowStatus(row: TierRow, s: WeekState): RowState {
  const key = row.nudgeKey
  const name = row.analystName || "the team"
  const items = itemsFor(key, s)
  const done = items.filter((i) => s.approved[i.id])
  const shipped = done.length ? money(done.reduce((n, i) => n + i.value, 0)) : undefined
  if (key && s.approvedBy[key]) {
    const text = s.approvedBy[key] === "email" ? "Approved by your email reply" : "Approved by you"
    return { kind: "shipped", text, work: text, shipped }
  }
  if (items.length && done.length === items.length) return { kind: "shipped", text: `Approved by ${name}`, work: `Approved by ${name}`, shipped }
  const ask = key ? s.asks[key] : undefined
  if (key && s.autoShipped[key]?.length) {
    const by = s.autoShipped[key]!
    const skus = (f: (i: (typeof items)[number]) => boolean) => items.filter(f).reduce((n, i) => n + i.skus, 0)
    const hero = skus((i) => !s.approved[i.id])
    const own = skus((i) => !!s.approved[i.id] && !by.includes(i.id))
    const ally = skus((i) => by.includes(i.id))
    return {
      kind: "held",
      text: `${own ? `${name} approved ${own} · ` : ""}Ally shipped ${ally} on your ${ask ? shortOf(ask.due) : ""} deadline · ${hero} hero SKUs held for ${name}`,
      work: `${own ? `${name} approved ${own} · ` : ""}Ally shipped ${ally} · ${hero} hero SKUs left`,
      shipped,
      byAlly: money(items.filter((i) => by.includes(i.id)).reduce((n, i) => n + i.value, 0)) }
  }
  if (!ask) return { kind: "pre", text: "Not assigned yet", work: "Not assigned" }
  // From Wednesday, the seeded campaign count is this week's progress.
  const progress = done.length
    ? `${done.reduce((n, i) => n + i.skus, 0)} of ${items.reduce((n, i) => n + i.skus, 0)} SKUs approved`
    : key === "approval-media" && s.day >= ASSIGN_DUE
      ? (row.weekly?.progress ?? "")
      : ""
  const due = shortOf(ask.due)
  const where = progress || "Not started"
  if (ask.by === "ally") {
    if (s.day < ask.dueDay) return { kind: "assigned", text: `Assigned ${shortDay(WEEK_START)} · due ${due}${progress ? ` · ${progress}` : ""}`, work: where }
    if (s.day === ask.dueDay) return { kind: "due", text: `${where} · due today`, work: where }
    return { kind: "overdue", text: `${where} · overdue since ${due}`, work: where }
  }
  // Claire's ask, from the product or her email.
  const then = ask.ship ? " · Ally ships it if not approved" : ""
  const via = ask.by === "email" ? " · set by your email reply" : ""
  if (s.day < ask.dueDay) return { kind: "asked", text: `Due ${due}${then}${progress ? ` · ${progress}` : ""}${via}`, work: where }
  if (s.day === ask.dueDay) return { kind: "due", text: `${where} · due today`, work: where }
  return { kind: "overdue", text: `${where} · overdue since ${due}`, work: where }
}

const SEASONAL_RULE = "r-seasonal-core"
export const hasSeasonalAutopilot = (policy?: Policy) => !!policy?.rules.some((r) => r.id === SEASONAL_RULE)
// It starts with the next seasonal event: this week's is already handled, so nothing that shipped moves.
const seasonalRule = (date: string): ReviewRule => ({
  id: SEASONAL_RULE,
  retailer: "Amazon",
  brands: [],
  skuGroups: [],
  tier: "core",
  workType: "Seasonal",
  except: BATCHES.filter((b) => b.type === "Seasonal").map((b) => b.id),
  mode: "autopilot",
  author: "Claire Bennett",
  date,
})

/**
 * Claire's move on a row (the same on her page and in her email), or what she
 * already did, which replaces the button in place: "Assigned · due Wed",
 * "Asked · due Fri". Null when there's nothing of hers on the row.
 */
export type RowAction = "assign" | "assigned" | "ask" | "asked" | "approve" | "autopilot" | "autopilot-done" | null
export function rowAction(row: TierRow, s: WeekState): RowAction {
  const st = rowStatus(row, s)
  const key = row.nudgeKey
  const content = key === "approval-content"
  const ask = key ? s.asks[key] : undefined
  const late = st.kind === "due" || st.kind === "overdue"
  if (content && (st.kind === "shipped" || st.kind === "held") && (!!s.approvedBy[key] || !!s.autoShipped[key]?.length)) return hasSeasonalAutopilot(s.policy) ? "autopilot-done" : "autopilot"
  if (st.kind === "pre") return "assign"
  if (st.kind === "assigned") return "assigned"
  if (late && ask?.by === "ally") return "ask"
  if (content && late) return "approve"
  if (st.kind === "asked") return "asked"
  return null
}

/** Content Claire or Ally shipped this week: the next move is putting that kind of work on autopilot. */
export const autopilotReady = (s: Pick<WeekState, "approvedBy" | "autoShipped" | "policy">) =>
  (!!s.approvedBy["approval-content"] || !!s.autoShipped["approval-content"]?.length) && !hasSeasonalAutopilot(s.policy)

export function useClaireActions() {
  const n = useNudge()
  const { askBy, approveAs, savePolicy, policy, day } = n
  const { sendSlack } = useFireNudge()
  const s: WeekState = n

  const statusOf = (row: TierRow) => rowStatus(row, s)

  /** Monday: Claire sends each owner their list, due Wednesday. Mike hears it in Slack (the only real one). */
  const assignFor = (row: TierRow, by: "product" | "email") => {
    if (!row.nudgeKey) return
    const due = dayLabel(ASSIGN_DUE)
    askBy(row.nudgeKey, due, ASSIGN_DUE, "ally")
    if (row.nudgeKey === "approval-content") sendSlack(row, { headline: `Claire assigned you this week's work: ${row.description.replace(/\.$/, "")}. Due ${due}.`, chip: `Due ${due}` })
    toast.success(`Assigned ${row.analystName} · due ${shortOf(due)}${by === "email" ? " · from your email reply" : ""}`, { position: "top-right" })
  }

  /** Claire sets the next due date. On content it carries "or Ally ships it", and Mike hears it in Slack. */
  const askFor = (row: TierRow, by: "product" | "email") => {
    if (!row.nudgeKey) return
    const due = dueFor(day)
    const ship = row.nudgeKey === "approval-content"
    askBy(row.nudgeKey, due.label, due.day, by, ship)
    if (ship)
      sendSlack(row, {
        headline: `Claire set a deadline: ${due.label}. If it isn't approved by then, Ally ships the core SKUs; hero SKUs wait for you.`,
        chip: `Due ${due.label}`,
      })
    const via = by === "email" ? " · from your email reply" : ""
    toast.success(ship ? `${row.analystName} has until ${due.label}, or Ally ships it${via}` : `Asked ${row.analystName} to finish by ${due.label}${via}`, { position: "top-right" })
  }

  /** Claire approves it herself: everything still open on the row ships now. */
  const approveMyself = (row: TierRow, by: "product" | "email") => {
    if (!row.nudgeKey) return
    approveAs(
      row.nudgeKey,
      by,
      itemsFor(row.nudgeKey, s).map((i) => i.id),
    )
    toast.success(`${by === "email" ? "Your email reply approved" : "Approved"}: ${row.description.replace(/\.$/, "")} · ${row.value}`, { position: "top-right" })
  }

  const seasonalOn = hasSeasonalAutopilot(policy)
  const autopilotSeasonal = (by: "product" | "email") => {
    if (seasonalOn) return
    savePolicy({ ...policy, rules: [...policy.rules, seasonalRule(`${dayLabel(day).split(", ")[1]}, 2026`)] })
    toast.success(`Seasonal content on autopilot from the next event · core SKUs ship without review${by === "email" ? " · from your email reply" : ""}`, { position: "top-right" })
  }

  return { statusOf, assignFor, askFor, approveMyself, autopilotSeasonal, seasonalOn, day, s }
}

/** One action Claire can take by replying to her email, numbered the same in the email and the demo's reply buttons. */
export interface ReplyAction {
  n: number
  kind: "assign" | "deadline" | "ask" | "approve" | "autopilot"
  row?: TierRow
  label: string
  note: string
  /** A deadline, shown in amber after the note. */
  flag?: string
}

/**
 * The actions in Claire's email, soonest deadline first, then dollars. Work due
 * on Ally's date gets Friday (content: "or Ally ships it"); content past
 * Claire's own date, with nothing shipped, she can approve herself. After
 * content ships, the last action puts that kind of work on autopilot.
 */
export function replyActions(rows: TierRow[], s: WeekState): ReplyAction[] {
  const acts: Omit<ReplyAction, "n">[] = []
  const ranked = [...rows].sort((a, b) => (a.days ?? Infinity) - (b.days ?? Infinity) || (b.valueM ?? 0) - (a.valueM ?? 0))
  for (const r of ranked) {
    const st = rowStatus(r, s)
    // Monday: this week's work, waiting for Claire to hand it out.
    if (st.kind === "pre") {
      // Who, then the size of the work and what it is; the deadline flagged on its own.
      const skus = r.agent === "media" ? 0 : itemsFor(r.nudgeKey, s).reduce((n, i) => n + i.skus, 0)
      const what = r.description.replace(/\.$/, "")
      acts.push({ kind: "assign", row: r, label: `${r.analystName} · ${AGENT_LABEL[r.agent]}`, note: [skus ? `${skus} SKUs` : "", what].filter(Boolean).join(" · "), flag: countdown(r.deadline, s.day) })
      continue
    }
    if (st.kind !== "due" && st.kind !== "overdue") continue
    const ask = r.nudgeKey ? s.asks[r.nudgeKey] : undefined
    const due = dueFor(s.day)
    const note = [st.text, countdown(r.deadline, s.day)?.toLowerCase()].filter(Boolean).join(" · ")
    if (ask?.by === "ally")
      acts.push(
        r.nudgeKey === "approval-content"
          ? { kind: "deadline", row: r, label: `${r.analystName}: finish by ${due.short}, or Ally ships it`, note: `${note} · hero SKUs wait for ${r.analystName}` }
          : { kind: "ask", row: r, label: `${r.analystName}: finish by ${due.short}`, note },
      )
    else if (r.nudgeKey === "approval-content") acts.push({ kind: "approve", row: r, label: `Approve it yourself: ${r.description.replace(/\.$/, "")}`, note })
  }
  if (autopilotReady(s)) acts.push({ kind: "autopilot", label: "Put seasonal content on autopilot", note: "From the next seasonal event · core SKUs ship without review · hero SKUs still reviewed" })
  return acts.slice(0, 3).map((a, i) => ({ ...a, n: i + 1 }))
}

export const REPLY_LINE = "Reply YES to do all of these, or YES 1, YES 2 or YES 3 for just one. No need to log in."
