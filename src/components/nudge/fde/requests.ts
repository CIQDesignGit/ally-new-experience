"use client"

/**
 * The engineer's queue: what customers asked Ally for that no skill in the
 * library answered. The open request is the competition demo's, read from its
 * live state; done requests are the published skills, so every name, date and
 * test count ties to the Agent Console.
 */
import { useCompetition, reached } from "../../competition/state"
import { NAMES, TESTS, TIMES, DEEP_ASK } from "../../competition/data"
import { LIVE_SKILLS } from "../../competition/skills"
import { BUILD_STEP, useHarness } from "../../competition/harness"
import { STAGE_HREF, TRACK, requestStep } from "../../competition/michelle"

export interface OpenRequest {
  id: string
  skill: string
  account: string
  from: string
  asked: string
  ask: string
  /** Michelle's choices on the request card. */
  terms?: string
  due: string
  /** Due within a day: amber. */
  soon: boolean
  /** For ranking, soonest first ("Oct 9"). */
  dueDay: string
  /** Steps done, out of TRACK. */
  step: number
  /** Where it stands, one fragment; `failing` when tests fail. */
  status: string
  failing: boolean
  /** Full date, for the tooltip on the relative one. */
  dueAt: string
  /** The one next step, and where it happens. */
  next: { label: string; href: string }
}

export interface DoneRequest {
  id: string
  skill: string
  does: string
  from: string
  published: string
  version: number
  usedIn: string
  href: string
}

/** "Oct 8" on the demo's calendar (2026), for ordering. */
const dayOf = (d: string) => new Date(`${d}, 2026`).getTime()

/** Next versions Michelle asked for on two live skills: Black Friday is Nov 27 (Claire's next event), and Claire reads the negotiation summary before the meeting. */
const IMPROVEMENTS = [
  { id: "#409", skillId: "prime-day-deck", asked: "Oct 5, 3:20 PM", due: "Fri, Oct 30", ask: "Can the Prime Day recap work for Black Friday too, so it's ready the Monday after?" },
  { id: "#410", skillId: "negotiation-prep", asked: "Oct 7, 11:05 AM", due: "Mon, Oct 12", ask: "Can the prep add a one-page summary for Claire before the meeting?" },
]

/** What the competition skill does, as the Agent Console describes it. */
const COMPETITION_DOES = "Weekly read of a competitor: promotions, price gaps on matched products and share of voice"

export function useRequests(): { open: OpenRequest[]; done: DoneRequest[] } {
  const c = useCompetition()
  const build = BUILD_STEP[useHarness()]
  const step = requestStep(c)
  const version = c.competitorFixed ? 3 : c.sovFixed ? 2 : 1
  // The step in progress decides the one thing to do next: build it, test it, then publish it.
  const next =
    step <= 1
      ? { label: `Build in ${build.where}`, href: build.href }
      : step === 2
        ? { label: reached(c, "tested") ? "Fix the failing tests" : "Run the tests", href: STAGE_HREF.Test! }
        : { label: "Review and publish", href: STAGE_HREF.Review! }
  // Failing tests lead (and go red); a clean run reads as a plain fact.
  const failing = reached(c, "tested") && step < 4 ? 2 : 0
  const status =
    c.stage === "requested"
      ? "Not started"
      : c.stage === "built"
        ? `Drafted in ${build.where} · not submitted`
        : !reached(c, "tested")
          ? `v${version} · tests not run`
          : failing
            ? `${failing} of ${TESTS.length} tests failing · v${version}`
            : `${TESTS.length} of ${TESTS.length} tests passed · v${version}`

  const competition: OpenRequest[] =
    reached(c, "requested") && c.stage !== "live"
      ? [{ id: NAMES.request, skill: NAMES.skill, account: NAMES.account, from: NAMES.customer, asked: TIMES.requested, ask: DEEP_ASK, terms: `${c.day}s · alert above a ${c.threshold} pt move`, due: TIMES.promised, dueAt: TIMES.promisedAbs, soon: true, dueDay: "Oct 9", step, status, failing: failing > 0, next }]
      : []
  // Live skills Michelle wants more from: the current version stays live while the next one is built.
  const improvements: OpenRequest[] = IMPROVEMENTS.map((r) => {
    const s = LIVE_SKILLS.find((x) => x.id === r.skillId)!
    return { id: r.id, skill: `${s.name} v${s.version + 1}`, account: NAMES.account, from: NAMES.customer, asked: r.asked, ask: r.ask, due: r.due, dueAt: r.due, soon: false, dueDay: r.due.split(", ")[1], step: 1, status: `v${s.version} live · v${s.version + 1} not started`, failing: false, next: { label: "Open in Agent Console", href: `/console/skills/${s.id}` } }
  })
  // Soonest due first.
  const open = [...competition, ...improvements].sort((a, b) => dayOf(a.dueDay) - dayOf(b.dueDay))

  // Every published skill began as one of Michelle's asks (each skill's trigger names her). Newest first.
  const done: DoneRequest[] = [
    ...(c.stage === "live" ? [{ id: "competition-watch", skill: NAMES.skill, does: COMPETITION_DOES, from: NAMES.customer, published: TIMES.live.split(",")[0], version, usedIn: "Competition dashboard", href: "/console/skills/competition-watch" }] : []),
    ...LIVE_SKILLS.map((s) => ({ id: s.id, skill: s.name, does: s.does, from: NAMES.customer, published: s.published, version: s.version, usedIn: s.usedBy.label, href: `/console/skills/${s.id}` })),
  ].sort((a, b) => dayOf(b.published) - dayOf(a.published))
  return { open, done }
}

export { TRACK }
