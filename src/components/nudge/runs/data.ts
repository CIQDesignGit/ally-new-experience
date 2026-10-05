import { OPS_BATCHES } from "../data"
import type { AlertMode } from "../alerts/data"

/**
 * Things Ally runs for you, in one shape: a brief or an alert on its own clock
 * (Scheduled), or a skill it runs when asked or when an alert calls it (Skills).
 * Each is live or paused, says what Ally does when it runs, and shows its last run.
 */
export type RunKind = "brief" | "alert" | "skill"
/** What Ally does when it runs: tell you, draft it for your OK, or do it (you can undo). */
export type RunDoes = "tell" | "draft" | "act"

export interface RunItem {
  id: string
  kind: RunKind
  name: string
  /** One line: the trigger, or what the skill does. */
  what: string
  /** When it runs: "Every Monday, 8 AM", "Every morning", "When you ask". */
  runs: string
  does: RunDoes
  owner: "yours" | "built in"
  /** Its last run, in words: "6 SKUs today", "Sent Mon, Oct 5". */
  last?: string
  /** Skills: the steps, in order. */
  steps?: string[]
  /** Skills: what uses it (alerts, analyses). */
  usedBy?: string[]
  /** Who made it and when (yours only). */
  by?: string
}

export const DOES_LABEL: Record<RunDoes, string> = { tell: "Tells you", draft: "Drafts it for your OK", act: "Does it, you can undo" }
export const DOES: RunDoes[] = ["tell", "draft", "act"]
export const doesFromMode = (m: AlertMode): RunDoes => (m === "input" ? "tell" : m === "approval" ? "draft" : "act")
export const modeFromDoes = (d: RunDoes): AlertMode => (d === "tell" ? "input" : d === "draft" ? "approval" : "autopilot")

export const SCHEDULES = ["Every morning", "Twice a day", "Every Monday, 8 AM", "Every Friday, 8 AM", "Weekly"] as const

/** Claire's Monday brief: the email her week starts with. */
export const MONDAY_BRIEF: RunItem = {
  id: "brief-monday",
  kind: "brief",
  name: "Claire's Monday brief",
  what: "Team status, what's one approval away, reply YES to act · email",
  runs: "Every Monday, 8 AM",
  does: "tell",
  owner: "yours",
  last: "Next Mon, Oct 12",
}

/**
 * Ally's own skills, from the work they did this week: each names what it does
 * and the issues that ran it. Deduped by name across the ops issues.
 */
export function builtInSkills(): RunItem[] {
  const by = new Map<string, { did: string; usedBy: string[] }>()
  for (const b of OPS_BATCHES) for (const k of b.skills ?? []) {
    const cur = by.get(k.name) ?? { did: k.did, usedBy: [] }
    if (!cur.usedBy.includes(b.name)) cur.usedBy.push(b.name)
    by.set(k.name, cur)
  }
  return [...by.entries()].map(([name, v]) => ({
    id: `skill-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    kind: "skill" as const,
    name,
    what: v.did,
    runs: v.usedBy.length > 1 ? `Used by ${v.usedBy.length} alerts` : "Used by 1 alert",
    does: "tell" as const,
    owner: "built in" as const,
    usedBy: v.usedBy,
    last: "This morning",
  }))
}

/** A new item from a sentence, the way Ally would read it. Scheduled: a brief if it repeats on a clock, else an alert. */
export function draftFromSentence(text: string, kind: "scheduled" | "skill", by: string): RunItem {
  const t = text.trim().replace(/\.$/, "")
  const id = `run-${Date.now()}`
  if (kind === "skill") {
    // "Prep a promo recap: pull last week's deals, compare to plan, then draft a summary."
    const [head, rest] = t.split(/:\s*/, 2)
    const steps = (rest ?? "").split(/,\s*(?:then\s+)?|;\s*|\s+then\s+/i).map((x) => x.trim()).filter(Boolean)
    return { id, kind: "skill", name: cap(head), what: steps.length ? `${steps.length} steps` : "Runs when you ask", runs: "When you ask", does: "draft", owner: "yours", steps: steps.map(cap), by, last: "Not run yet" }
  }
  const clock = t.match(/every (morning|day|monday|tuesday|wednesday|thursday|friday|week)[^,]*|weekly|daily/i)?.[0]
  if (clock) {
    const name = cap(t.replace(/^(send me|email me|give me)\s+/i, "").replace(clock, "").replace(/\s+$/, ""))
    return { id, kind: "brief", name: cap(name.replace(/^(a|an|the)\s+/i, "")), what: "Email to you", runs: cap(clock), does: "tell", owner: "yours", by, last: "Not run yet" }
  }
  const trigger = t.replace(/^(tell|alert|let) me (know )?(when|if)\s+/i, "")
  // Named by its subject ("Gift-set share of voice"); the condition is the line under it.
  const subject = trigger.split(/\s+(?:drops|falls|goes|rises|gets|is|are|hits|crosses|changes|moves)\b/i)[0]
  return { id, kind: "alert", name: cap(subject || trigger), what: `When ${trigger}`, runs: "Every morning", does: "tell", owner: "yours", by, last: "Not run yet" }
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
