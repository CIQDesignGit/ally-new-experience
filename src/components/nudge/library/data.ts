/**
 * The skills library: CommerceIQ's expertise, packaged as skills every customer
 * can turn on. Core skills (the gap-to-plan alerts) are on for everyone; the
 * rest are available, some locked by tier. Every customer shares one data
 * model, so turning a skill on is a switch, unless it needs something only the
 * customer has (then it's ready by tomorrow).
 */
import { BUILT_IN_ALERTS } from "../alerts/data"
import { LIVE_SKILLS } from "../../competition/skills"
import { NAMES as COMPETITION } from "../../competition/data"

export type Gives = "Alert" | "Dashboard" | "Deck" | "Answer"

export interface LibrarySkill {
  id: string
  name: string
  /** What it does, one line. */
  does: string
  gives: Gives
  /** On for every customer, no off switch. */
  core?: boolean
  /** Locked: how to get it, shown on the card ("Included with Media managed services"). */
  tier?: string
  /** Something only the customer has; turning it on asks for it and it's ready by tomorrow. */
  needs?: string
  /** Where its output lives once it's on. */
  output?: { label: string; href: string }
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-")
const live = (id: string) => LIVE_SKILLS.find((s) => s.id === id)!

/** On for everyone: the alerts tuned across brands that every account should have. */
export const CORE: LibrarySkill[] = BUILT_IN_ALERTS.map((a) => ({
  id: `alert-${slug(a.name)}`,
  name: a.name,
  does: a.when,
  gives: "Alert",
  core: true,
  output: { label: "Scheduled", href: "/michelle/alerts" },
}))

/** Available to turn on: the published skills, and a locked example per tier. */
export const AVAILABLE: LibrarySkill[] = [
  { id: "prime-day-deck", name: live("prime-day-deck").name, does: live("prime-day-deck").does, gives: "Deck", output: { label: "Prime Day recap", href: "/michelle/dashboards/prime-day" } },
  { id: "gap-analysis", name: live("gap-analysis").name, does: live("gap-analysis").does, gives: "Answer", output: { label: "Why are gift sets lagging?", href: "/michelle/c/gift-sets" } },
  { id: "negotiation-prep", name: live("negotiation-prep").name, does: live("negotiation-prep").does, gives: "Deck", needs: "Your brand margin by product (Excel)", output: { label: "Amazon vendor negotiation", href: "/michelle/c/negotiation" } },
]

/** Published by an engineer from a customer's request: it joins the library once live. */
export const COMPETITION_SKILL: LibrarySkill = {
  id: "competition-watch",
  name: COMPETITION.skill,
  does: "Weekly read of a competitor: promotions, price gaps on matched products, share of voice",
  gives: "Dashboard",
  output: { label: "Competition dashboard", href: "/michelle/dashboards/competition" },
}

export const LOCKED: LibrarySkill[] = [
  { id: "media-holdout", name: "Media incrementality test", does: "Measures what media adds with a holdout group, campaign by campaign", gives: "Dashboard", tier: "Included with Media managed services" },
  { id: "walmart-content-audit", name: "Walmart content audit", does: "Scores every Walmart listing against Walmart's content rules and fixes the gaps", gives: "Dashboard", tier: "Add Walmart as a channel" },
]

/** Questions Ally answers by offering a skill from the library first. */
export const MATCHES: { match: RegExp; skillId: string }[] = [{ match: /recap|prime day (deck|recap)|event (deck|recap)/i, skillId: "prime-day-deck" }]
