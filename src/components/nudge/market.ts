/**
 * The market around the business (mock, as of Oct 8): candle segments on
 * Amazon, key competitors and the next big event. Each finding carries the plays
 * that answer it. A launched play becomes a normal work item (see
 * getSnapshot / contentBatches), so it shows on the bridge and in the owner's
 * inbox, and every total still ties.
 */
import type { AgentId } from "./types"

/** Who runs a play: a worker agent (its lever), or a person via a decision brief. */
export type PlayOwner = AgentId | "human"

export interface Play {
  id: string
  owner: PlayOwner
  /** "Rewrite 11 PDPs for clean-burn query language". */
  what: string
  /** $M a year, what the market view shows. */
  annual: number
  /** $M landing this quarter, what the bridge counts once launched. */
  quarter: number
  skus: number
  /** Human plays land with Claire's team; agent plays arrive drafted, one approval away. */
  tier: "approval" | "input"
  /** For a person's decision: the brief Ally drafts (bullets, one decision at the end). */
  brief?: Brief
  /** The brief without a vision-only lever's moves, where that changes what Ally recommends. */
  mvpBrief?: Brief
}

export interface Brief {
  kind: string
  title: string
  to: string
  sections: { heading: string; points: string[] }[]
  /** The decision the brief asks for, and its options (the first is Ally's recommendation). */
  decision: { ask: string; options: string[] }
}

export interface Segment {
  id: string
  name: string
  /** Segment sales, $M a year. */
  size: number
  /** Growth vs last year, %. */
  growth: number
  /** Your share of the segment, %. */
  share: number
  /** Change in your share, points. */
  change: number
  points: string[]
  plays: Play[]
}

/** Category growth and the share line that split the 2×2. */
export const MARKET = { name: "Candles on Amazon", growth: 7, shareSplit: 12, asOf: "Oct 8" }

export const SEGMENTS: Segment[] = [
  {
    id: "soy",
    name: "Clean-burn soy",
    size: 120,
    growth: 22,
    share: 4,
    change: -0.2,
    points: [
      "Growing 3× the category",
      "Shoppers search \"clean burn\", \"non-toxic\", \"soy\"; your PDPs don't use those words",
      "Leaders: Brightwick 31%, Lumen & Co 18%",
      "Your $/oz 18% above median; one 8 oz pack",
    ],
    plays: [
      { id: "soy-content", owner: "content", what: "Rewrite 11 PDPs for clean-burn query language", annual: 0.14, quarter: 0.035, skus: 11, tier: "approval" },
      { id: "soy-media", owner: "media", what: "Bid the clean-burn term cluster (+$12K a month)", annual: 0.095, quarter: 0.024, skus: 11, tier: "approval" },
      {
        id: "soy-npi",
        owner: "human",
        what: "New product brief: a 12 oz soy jar at the median $/oz",
        annual: 0.105,
        quarter: 0,
        skus: 0,
        tier: "input",
        brief: {
          kind: "New product brief",
          title: "A 12 oz clean-burn soy jar at the segment's median price",
          to: "Your product team",
          sections: [
            { heading: "The opportunity", points: ["Clean-burn soy: $120M a year, +22% (category +7%)", "You hold 4%; Brightwick 31%, Lumen & Co 18%", "No leader sells a 12 oz jar at the median $/oz"] },
            { heading: "The product", points: ["12 oz soy jar, cotton wick, clean-burn formula", "3 scents from your best sellers: Amber Floral, Coastal Linen, Noir Cherry", "$21, or $1.75/oz: the segment median (your 8 oz is 18% above it)"] },
            { heading: "Why it wins", points: ["Fills the gap between Lumen's 8 oz and Brightwick's 16 oz", "Your ratings run 4.6 vs 4.3 for the segment", "Ally drafts the clean-burn titles, bullets and images before launch"] },
            { heading: "The numbers", points: ["Year one: +$105K, about 0.1 pt of the segment", "48% margin at $21", "Net of about $12K pulled from your 8 oz jar"] },
            { heading: "Risks", points: ["\"Non-toxic\" needs substantiation before it goes on the page", "10-week supplier lead time", "Brightwick could follow on price"] },
            { heading: "If approved", points: ["Specs from your product team by Oct 24", "Ally drafts the listing and images", "Live ahead of Valentine's Day"] },
          ],
          decision: { ask: "Take this to your product team?", options: ["Approve", "Not now"] },
        },
      },
    ],
  },
  {
    id: "jar",
    name: "Jar candles",
    size: 420,
    growth: 6,
    share: 21,
    change: 0.4,
    points: ["You lead: 21% share, up 0.4 pts", "Growing just under the category", "Hold price; defend branded terms"],
    plays: [{ id: "jar-media", owner: "media", what: "Defend branded jar-candle terms", annual: 0.06, quarter: 0.015, skus: 42, tier: "approval" }],
  },
  {
    id: "gift",
    name: "Gift sets",
    size: 260,
    growth: 9,
    share: 17,
    change: -0.6,
    points: ["Losing share: −0.6 pts to Brightwick", "Brightwick cut gift-set prices 20%", "Q4 is gift-set season"],
    plays: [],
  },
  {
    id: "melts",
    name: "Wax melts",
    size: 90,
    growth: 14,
    share: 6,
    change: 0.3,
    points: ["Growing 2× the category", "You're gaining: +0.3 pts", "Only 4 SKUs in range"],
    plays: [{ id: "melts-content", owner: "content", what: "Add melts to 6 gift-set PDPs as a bundle", annual: 0.05, quarter: 0.012, skus: 6, tier: "approval" }],
  },
  { id: "pillar", name: "Pillar candles", size: 140, growth: -3, share: 24, change: 0.1, points: ["High share, shrinking segment", "Keep, don't invest"], plays: [] },
  { id: "tins", name: "Travel tins", size: 40, growth: 3, share: 9, change: 0, points: ["Small and flat", "No move needed"], plays: [] },
]

export interface Competitor {
  id: string
  name: string
  segmentId: string
  /** The headline: what's happening to you. */
  headline: string
  /** What they did, one fragment each, newest first. */
  moves: string[]
  /** Fragment stats for the card: price move, sponsored slots, your share change. */
  stats: { label: string; value: string; bad?: boolean }[]
  points: string[]
  /** $M of your sales at risk this quarter if nothing changes. */
  atRisk: number
  plays: Play[]
}

export const COMPETITORS: Competitor[] = [
  {
    id: "brightwick",
    name: "Brightwick",
    segmentId: "gift",
    headline: "Brightwick is taking your gift-set share",
    moves: ["Cut prices 20% on 14 gift sets", "Took 4 more sponsored slots on gift terms", "Launched a 3-wick gift set"],
    stats: [
      { label: "Their price", value: "−20%", bad: true },
      { label: "Their slots", value: "7 of 12", bad: true },
      { label: "Your share", value: "−0.6 pts", bad: true },
    ],
    points: ["Your gift sets now 25% above Brightwick", "Your branded terms still hold", "Their stock covers 3 weeks at this pace"],
    atRisk: 0.18,
    plays: [
      { id: "bw-media", owner: "media", what: "Win back 4 sponsored slots on gift terms", annual: 0.24, quarter: 0.06, skus: 8, tier: "approval" },
      { id: "bw-content", owner: "content", what: "Add a gift-with-purchase angle to 8 hero gift sets", annual: 0.16, quarter: 0.04, skus: 8, tier: "approval" },
      {
        id: "bw-price",
        owner: "human",
        what: "Pricing brief: match on 8 hero gift sets, or hold",
        annual: 0.3,
        quarter: 0,
        skus: 0,
        tier: "input",
        brief: {
          kind: "Pricing brief",
          title: "Brightwick's 20% gift-set cut: match, or hold and win back slots",
          to: "Claire and your pricing lead",
          sections: [
            { heading: "What happened", points: ["Brightwick cut 14 gift sets 20% on Oct 1", "They took 4 more sponsored slots on gift terms", "Your gift-set share −0.6 pts; about $180K at risk this quarter"] },
            { heading: "Option A: match on 8 hero gift sets", points: ["Protects most of the $180K", "Costs about $40K of margin this quarter", "Resets the price you'll have to defend in Q1"] },
            { heading: "Option B: hold price, win back slots (recommended)", points: ["Ally for Media wins back 4 slots (+$60K this quarter)", "Ally for Content adds a gift-with-purchase angle (+$40K)", "No margin given up; Brightwick's stock covers about 3 weeks at this pace"] },
            { heading: "Option C: do nothing", points: ["About −$180K this quarter, most of it in gift-giving weeks"] },
          ],
          decision: { ask: "Which option?", options: ["Option B: hold and win back slots", "Option A: match on 8 hero gift sets", "Not now"] },
        },
        // Without media, holding price wins back only what content adds ($40K of $180K), so matching on the 8 hero sets leads.
        mvpBrief: {
          kind: "Pricing brief",
          title: "Brightwick's 20% gift-set cut: match on 8 hero gift sets, or hold",
          to: "Claire and your pricing lead",
          sections: [
            { heading: "What happened", points: ["Brightwick cut 14 gift sets 20% on Oct 1", "They took 4 more sponsored slots on gift terms", "Your gift-set share −0.6 pts; about $180K at risk this quarter"] },
            { heading: "Option A: match on 8 hero gift sets (recommended)", points: ["Protects most of the $180K", "Costs about $40K of margin this quarter", "Ally for Content adds a gift-with-purchase angle to the same 8 (+$40K)"] },
            { heading: "Option B: hold price, content only", points: ["Ally for Content adds a gift-with-purchase angle (+$40K)", "About −$140K still at risk this quarter"] },
            { heading: "Option C: do nothing", points: ["About −$180K this quarter, most of it in gift-giving weeks"] },
          ],
          decision: { ask: "Which option?", options: ["Option A: match on 8 hero gift sets", "Option B: hold, content only", "Not now"] },
        },
      },
    ],
  },
]

export type Readiness = "ready" | "partial" | "risk"

export interface EventPlan {
  id: string
  name: string
  date: string
  weeks: number
  /** $M at stake across levers. */
  atStake: number
  levers: { name: string; state: Readiness; note: string }[]
  lastYear: { lost: number; points: string[] }
  plays: Play[]
}

export const NEXT_EVENT: EventPlan = {
  id: "bfcm",
  name: "Black Friday",
  date: "Nov 27",
  weeks: 7,
  atStake: 1.1,
  levers: [
    { name: "Content", state: "partial", note: "Event titles drafted on 60 of 140 SKUs" },
    { name: "Stock", state: "risk", note: "6 hero SKUs run out of cover by Nov 24" },
    { name: "Deals", state: "risk", note: "No deal set on 6 strong SKUs" },
    { name: "Media", state: "ready", note: "Event budget planned and paced" },
  ],
  lastYear: { lost: 0.42, points: ["No deal on 6 strong SKUs", "Top sponsored slots lost to Brightwick", "4 hero SKUs sold out on day 1"] },
  plays: [
    { id: "bf-stock", owner: "ops", what: "Draft the PO expedite for 6 hero SKUs to your vendor manager", annual: 0.38, quarter: 0.38, skus: 6, tier: "approval" },
    { id: "bf-deals", owner: "ops", what: "Set up Black Friday deals on 6 strong SKUs", annual: 0.3, quarter: 0.3, skus: 6, tier: "approval" },
    { id: "bf-content", owner: "content", what: "Finish event titles and images on 80 SKUs", annual: 0.22, quarter: 0.22, skus: 80, tier: "approval" },
  ],
}

/** Every play by id, and what the "Grow beyond plan" cards lead with. */
export const ALL_PLAYS: Play[] = [...SEGMENTS.flatMap((s) => s.plays), ...COMPETITORS.flatMap((c) => c.plays), ...NEXT_EVENT.plays]
export const playById = (id: string) => ALL_PLAYS.find((p) => p.id === id)

const annualOf = (plays: Play[]) => plays.reduce((n, p) => n + p.annual, 0)
/** The segment with the most to win (the card names it), and the competitor with the most at risk. */
export const TOP_SEGMENT = [...SEGMENTS].sort((a, b) => annualOf(b.plays) - annualOf(a.plays))[0]
export const TOP_COMPETITOR = [...COMPETITORS].sort((a, b) => b.atRisk - a.atRisk)[0]
export const segmentValue = (s: Segment) => annualOf(s.plays)
