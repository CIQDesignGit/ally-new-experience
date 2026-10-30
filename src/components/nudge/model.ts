/**
 * The data model behind every screen. One table of work items (lever, owner's
 * bucket, value, deadline, progress) plus a few reference tables (people, plan,
 * seeded activity). Everything a page shows — tier rows, totals, the bridge,
 * "expires in N days", who has started, who to nudge — is computed here from
 * those tables and the session's actions. Nothing below names a person, batch
 * or lever in its logic.
 *
 * To connect a real database, replace `getSnapshot()` in data.ts with a fetch
 * that returns the same `Snapshot` shape. No screen needs to change.
 */
import type { AgentId, TierRow } from "./types"

export type Tier = "approval" | "input" | "autopilot"

/** One unit of work Ally has prepared. Values are $M. */
export interface WorkItem {
  id: string
  lever: AgentId
  tier: Tier
  value: number
  /** SKUs (or items) it covers once acted on. */
  skus: number
  /** ISO date the value expires, when it does. */
  deadline?: string
  /** ISO date its sales stop landing (a seasonal event's last day); undefined = runs past the quarter. */
  ends?: string
  /** Losing sales right now (e.g. lost buy box). */
  urgent?: boolean
}

export interface Person {
  name: string
  lever?: AgentId
  /** Their page in Ally, when they have one (James doesn't yet). */
  page?: string
  /** Their page is vision only: the MVP shows their lever's numbers but has no page to open. */
  visionOnly?: boolean
}

/** What an owner has done on their slice this week, before this session. */
export interface Activity {
  state: "not-started" | "in-progress"
  progress?: string
}

/** The copy and settings for one bucket; what's in it comes from the work items. */
export interface TierConfig {
  effort: string
  canNudgeTeam: boolean
  /** One line per lever describing its items in this bucket. */
  describe: Partial<Record<AgentId, string>>
}

export interface Snapshot {
  asOf: string
  people: Record<string, Person>
  items: WorkItem[]
  /** Keyed `${tier}:${lever}`. */
  activity: Partial<Record<string, Activity>>
  tiers: Record<Tier, TierConfig>
}

/** Actions taken this session: work item id → acted on (approved, or input sent). */
export type Acted = Record<string, boolean>

export const TIER_NUDGE_KEY: Record<Exclude<Tier, "autopilot">, "approval" | "team"> = { approval: "approval", input: "team" }

/** Whole days from `asOf` to `iso`. */
export function daysUntil(iso: string, asOf: string): number {
  return Math.round((Date.parse(iso) - Date.parse(asOf)) / 86_400_000)
}

/** "Oct 8" from "2026-10-08". */
export function shortDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })
}

/** K below $1M, one-decimal M above: 0.56 → "$560K", 1.04 → "$1.0M". */
export function money(v: number): string {
  return v >= 0.9995 ? `$${(Math.round(v * 10) / 10).toFixed(1)}M` : `$${Math.round(v * 1000)}K`
}

export const sum = (items: WorkItem[]) => items.reduce((s, i) => s + i.value, 0)

export function ownerOf(snap: Snapshot, lever: AgentId): Person | undefined {
  return Object.values(snap.people).find((p) => p.lever === lever)
}

/** Items still open: not acted on this session. */
export function openItems(snap: Snapshot, acted: Acted = {}) {
  return snap.items.filter((i) => !acted[i.id])
}

/**
 * An owner's status on one bucket: this session's actions win over the seeded
 * activity. Everything acted on → done; some → in progress with the count.
 */
export function statusFor(snap: Snapshot, tier: Tier, lever: AgentId, acted: Acted = {}): TierRow["weekly"] {
  const items = snap.items.filter((i) => i.tier === tier && i.lever === lever)
  const done = items.filter((i) => acted[i.id]).length
  const verb = tier === "input" ? "sent" : "approved"
  if (items.length > 0 && done === items.length) return { state: "done", progress: `All ${verb}` }
  if (done > 0) return { state: "in-progress", progress: `${done} of ${items.length} ${verb}` }
  return snap.activity[`${tier}:${lever}`] ?? { state: "not-started" }
}

/** Earliest deadline across items, when every one of them has one; "Expires in N days" is then true of all of them. */
export function sharedDeadline(snap: Snapshot, items: WorkItem[]) {
  if (items.length === 0 || items.some((i) => !i.deadline)) return undefined
  const iso = items.map((i) => i.deadline!).sort()[0]
  return { iso, days: daysUntil(iso, snap.asOf), date: shortDate(iso) }
}

/** One row per lever that has open items in this bucket, in the order the levers are listed. */
export function tierRows(snap: Snapshot, tier: Tier, acted: Acted = {}, levers: AgentId[] = ["content", "ops", "media"]): TierRow[] {
  const cfg = snap.tiers[tier]
  const ranked: { row: TierRow; days: number; value: number }[] = levers.flatMap((lever) => {
    const all = snap.items.filter((i) => i.tier === tier && i.lever === lever)
    if (all.length === 0) return []
    const open = all.filter((i) => !acted[i.id])
    const owner = ownerOf(snap, lever)
    const deadline = sharedDeadline(snap, open)
    const row: TierRow = {
      agent: lever,
      analystName: tier === "autopilot" ? "" : (owner?.name ?? ""),
      description: cfg.describe[lever] ?? "",
      // Nothing left open: the status says why, so the value is a dash rather than "$0K".
      value: open.length ? money(sum(open)) : "—",
      valueM: sum(open),
    }
    if (tier !== "autopilot") {
      row.nudgeKey = `${TIER_NUDGE_KEY[tier]}-${lever}` as TierRow["nudgeKey"]
      row.weekly = statusFor(snap, tier, lever, acted)
      if (deadline) {
        row.deadline = `Expires in ${deadline.days} days`
        row.days = deadline.days
      }
    }
    return [{ row, days: tier !== "autopilot" && deadline ? deadline.days : Infinity, value: sum(open) }]
  })
  // Rank: what expires first (soonest deadline), then the most dollars. Never a fixed lever order.
  return ranked.sort((a, b) => a.days - b.days || b.value - a.value).map((r) => r.row)
}

/** Levers ranked the same way for any list of areas: soonest deadline among open items, then open dollars. */
export function rankLevers(snap: Snapshot, acted: Acted = {}, levers: AgentId[] = ["content", "ops", "media"]): AgentId[] {
  const key = (lever: AgentId) => {
    const open = snap.items.filter((i) => i.lever === lever && !acted[i.id])
    const d = open.filter((i) => i.deadline).map((i) => daysUntil(i.deadline!, snap.asOf))
    return { days: d.length ? Math.min(...d) : Infinity, value: sum(open) }
  }
  return [...levers].sort((a, b) => key(a).days - key(b).days || key(b).value - key(a).value)
}

export function tierTotal(snap: Snapshot, tier: Tier, acted: Acted = {}) {
  return sum(openItems(snap, acted).filter((i) => i.tier === tier))
}

/** Open value by lever, largest first. */
export function openByLever(snap: Snapshot, acted: Acted = {}) {
  const levers: AgentId[] = ["content", "ops", "media"]
  return levers
    .map((agent) => ({ agent, value: sum(openItems(snap, acted).filter((i) => i.lever === agent)) }))
    .sort((a, b) => b.value - a.value)
}

/** Value approved this session: it now counts toward where the quarter lands. */
export function actedValue(snap: Snapshot, acted: Acted = {}) {
  return sum(snap.items.filter((i) => acted[i.id]))
}

/** What expires first among open items (optionally in one bucket): the earliest deadline and everything that shares it. */
export function expiring(snap: Snapshot, acted: Acted = {}, tier?: Tier) {
  const dated = openItems(snap, acted).filter((i) => i.deadline && (!tier || i.tier === tier))
  if (dated.length === 0) return undefined
  const iso = dated.map((i) => i.deadline!).sort()[0]
  return { value: sum(dated.filter((i) => i.deadline === iso)), days: daysUntil(iso, snap.asOf), date: shortDate(iso) }
}
