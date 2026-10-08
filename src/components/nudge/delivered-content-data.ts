/**
 * Content agent, Q2 FY26: promised vs delivered, fully layered.
 * Method and decisions: docs/content-value-measurement.md.
 * All values in $M. One seasonal event (Mother's Day) for the demo. Funnels tie: promised − not live − stockouts = expected.
 */

export interface FunnelRow {
  label: string
  /** Signed for minus rows; absolute for base/sub/total rows. */
  value: number
  tone: "base" | "minus" | "sub" | "total"
  note?: string
  action?: "autopilot"
}

/** A group of SKUs that underperformed, why, and what the agent now does differently. */
export interface Learning {
  skus: number
  what: string
  change: string
}

export interface EventCard {
  id: string
  name: string
  promised: number
  delivered: number
  story: [string, string]
  youBefore: number
  catBefore: number
  youDuring: number
  catDuring: number
  lastYearSales: number
  trend: number
  expectedSales: number
  eventSales: number
  expectedLift: number
  /** Where the expected lift comes from: new-title lift measured the same way in past seasonal events. */
  expectedFrom: { name: string; lift: number }[]
  /** Label for the event window bar, e.g. "Mother's Day weeks". */
  windowLabel: string
  /** Own-SKU checks, event weeks vs the 4 weeks before: price and ads held. */
  aspBefore: number
  aspDuring: number
  adSpendChange: number
  funnel: FunnelRow[]
  learnings: Learning[]
  learningsApplied: string
  skusTotal: number
}

/** Foundational's double-click: the proof is Amazon A/B tests, not a category comparison. */
export interface AbTestCard {
  promised: number
  delivered: number
  story: [string, string]
  tested: number
  won: number
  /** Average sales lift across all tested SKUs, winners and losers. */
  lift: number
  expectedLift: number
  expectedFrom: string
  /** Where next time's expected lift comes from. */
  nextExpected: string
  expectedSales: number
  actualSales: number
  liveSkus: number
  promisedSkus: number
  /** Each change's lift counts for this many weeks after it goes live. */
  weeks: number
  /** Illustrative gain from the next change, measured against today's content. */
  nextGain: number
  funnel: FunnelRow[]
  learnings: Learning[]
  learningsApplied: string
}

export interface WorkType {
  id: "seasonal" | "foundational" | "retail-readiness" | "buy-box" | "promo-badge" | "shipping-speed"
  name: string
  /** How it's measured, in two words, shown as a tag. Ops fixes are measured as revenue leakage prevented. */
  method: "vs category" | "A/B tested" | "Leakage prevented"
  /** What we did, in one phrase: "200 SKUs". */
  did: string
  promised: number
  delivered: number
  event?: EventCard
  abTest?: AbTestCard
  /** Waterfall version: the 2–3 bullets shown when this type's bar is selected. */
  bullets?: Bullet[]
}

export interface Bullet {
  tone: "orange" | "red" | "green" | "learn"
  text: string
  /** Shows an action on hover: Increase autopilot, or Nudge team (the content owner). */
  action?: "autopilot" | "nudge-team"
}

export interface ContentDelivered {
  promised: number
  delivered: number
  /** Shown inline after "Content"; the rows below break it down. */
  did: string
  /** The exec summary: the result, then where the gap came from and what the agent learned. Ties: promised − window − stock + live = delivered. */
  summary: [string, string]
  /** Dot bullets for the Claire page: orange = waiting, red = lost, green = worked, learn = fed back to the agent. */
  bullets?: Bullet[]
  workTypes: WorkType[]
}

const MOTHERS_DAY: EventCard = {
  id: "mothers-day",
  name: "Mother's Day",
  promised: 0.44,
  delivered: 0.34,
  story: [
    "New titles went live on 200 of 240 SKUs and more than doubled their lead over the category.",
    "We fell $100K short because 40 SKUs weren't approved in time and 2 top sellers ran out of stock.",
  ],
  youBefore: 11.5,
  catBefore: 9.0,
  youDuring: 20.6,
  catDuring: 15.0,
  lastYearSales: 13.1,
  trend: 12,
  expectedSales: 14.7,
  eventSales: 10.9,
  expectedLift: 3.0,
  expectedFrom: [
    { name: "Valentine's Day", lift: 2.6 },
    { name: "Holiday", lift: 3.4 },
    { name: "Black Friday", lift: 3.1 },
    { name: "Halloween", lift: 2.9 },
  ],
  windowLabel: "Mother's Day weeks",
  aspBefore: 37.0,
  aspDuring: 37.2,
  adSpendChange: 0.5,
  funnel: [
    { label: "Promised on 240 SKUs", value: 0.44, tone: "base" },
    { label: "40 SKUs weren't approved in time", value: -0.073, tone: "minus", action: "autopilot" },
    { label: "2 top sellers out of stock for 9 days", value: -0.045, tone: "minus" },
    { label: "Expected on the 200 SKUs that went live", value: 0.322, tone: "sub" },
    { label: "Delivered on the 200 SKUs", value: 0.34, tone: "total" },
  ],
  learnings: [
    { skus: 2, what: "Top sellers ran out of stock for 9 days of the event.", change: "Checks weeks of stock before every event and flags SKUs likely to run out 3 weeks ahead." },
    { skus: 25, what: "Multipacks with \"gift for mom\" titles grew slower than the category.", change: "Leads multipack titles with count and price per candle; gift framing moves to the bullets." },
  ],
  learningsApplied: "Both are already in this quarter's Halloween batch.",
  skusTotal: 240,
}

const RETAIL_READINESS_TEST: AbTestCard = {
  promised: 0.13,
  delivered: 0.09,
  story: [
    "We unblocked 20 of 28 SKUs for syndication, and their new content beat the old on 16 of 20 in A/B tests.",
    "We fell $40K short because 8 SKUs are still blocked by syndication errors.",
  ],
  tested: 20,
  won: 16,
  lift: 3.7,
  expectedLift: 3.8,
  expectedFrom: "the result of your last foundational A/B test (Q1 FY26, 45 SKUs)",
  nextExpected: "This test's 3.7% becomes the expected lift for your next retail readiness changes.",
  expectedSales: 3.4,
  actualSales: 2.45,
  liveSkus: 20,
  promisedSkus: 28,
  weeks: 12,
  nextGain: 1.5,
  funnel: [
    { label: "Promised on 28 SKUs", value: 0.13, tone: "base" },
    { label: "8 SKUs still blocked by syndication errors", value: -0.037, tone: "minus" },
    { label: "Expected on the 20 SKUs that went live", value: 0.093, tone: "sub" },
    { label: "Delivered on the 20 SKUs", value: 0.09, tone: "total" },
  ],
  learnings: [
    { skus: 8, what: "Amazon rejected the attribute file for SKUs in a restricted category.", change: "Checks attribute files against Amazon's category template before submitting." },
    { skus: 4, what: "Attributes were fixed but the title didn't change, so shoppers saw no difference.", change: "Pairs every attribute fix with a title refresh." },
  ],
  learningsApplied: "Both are already in this quarter's retail readiness batch.",
}

const FOUNDATIONAL_TEST: AbTestCard = {
  promised: 0.32,
  delivered: 0.27,
  story: [
    "New content went live on 60 of 78 SKUs and beat the old content on 51 of them in A/B tests.",
    "We fell $50K short because 18 SKUs waited on approval until the window closed. Where it went live, it did better than expected.",
  ],
  tested: 60,
  won: 51,
  lift: 4.2,
  expectedLift: 3.8,
  expectedFrom: "the result of your last foundational A/B test (Q1 FY26, 45 SKUs)",
  nextExpected: "This test's 4.2% becomes the expected lift for your next foundational changes.",
  expectedSales: 8.4,
  actualSales: 6.43,
  liveSkus: 60,
  promisedSkus: 78,
  weeks: 12,
  nextGain: 1.5,
  funnel: [
    { label: "Promised on 78 SKUs", value: 0.32, tone: "base" },
    { label: "18 SKUs expired waiting on approval", value: -0.075, tone: "minus", action: "autopilot" },
    { label: "Expected on the 60 SKUs that went live", value: 0.245, tone: "sub" },
    { label: "Delivered on the 60 SKUs", value: 0.27, tone: "total" },
  ],
  learnings: [
    { skus: 6, what: "Multi-size candles where the new title dropped size and count to fit keywords. Shoppers comparing sizes clicked less.", change: "Keeps size and count in the first 80 characters of every title." },
    { skus: 3, what: "Gift sets where a lifestyle photo replaced the product-on-white main image.", change: "Keeps product-on-white as the main image for gift sets; lifestyle moves to image 2." },
  ],
  learningsApplied: "Both are already in this quarter's Halloween batch.",
}

export const CONTENT_DELIVERED_Q2: ContentDelivered = {
  promised: 0.89,
  delivered: 0.7,
  did: "280 SKUs improved",
  summary: [
    "We updated 200 SKUs for Mother's Day, improved everyday content on 60 and unblocked 20 for syndication: $700K delivered of $890K promised.",
    "$185K missed the window because 66 SKUs weren't live in time, and $45K was lost to stockouts on 2 top sellers. The changes that went live beat plan by $40K; the few that didn't work are fixed and added to the agent's context.",
  ],
  workTypes: [
    { id: "seasonal", name: "Seasonal", method: "vs category", did: "200 SKUs for Mother's Day", promised: 0.44, delivered: 0.34, event: MOTHERS_DAY },
    { id: "foundational", name: "Foundational", method: "A/B tested", did: "Keywords, titles and images on 60 SKUs", promised: 0.32, delivered: 0.27, abTest: FOUNDATIONAL_TEST },
    { id: "retail-readiness", name: "Retail readiness", method: "A/B tested", did: "20 SKUs unblocked · 8 still blocked", promised: 0.13, delivered: 0.09, abTest: RETAIL_READINESS_TEST },
  ],
}

/* ---------------------------------------------------------------------------
 * Banked so far this quarter (Q3 FY26, in flight): the same shape as "How we
 * did", so the current quarter reads like last quarter. Content $520K + media
 * $370K + ops $310K = BANKED_VALUE $1.2M.
 * ------------------------------------------------------------------------- */
export const CONTENT_BANKED_Q3: ContentDelivered = {
  promised: 0.58,
  delivered: 0.52,
  did: "205 SKUs improved so far",
  bullets: [
    { tone: "orange", text: "205 of 236 SKUs went live. 28 waited on approval (−$35K), 3 needed your team's input (−$10K), and one ran out of stock (−$15K).", action: "autopilot" },
    { tone: "green", text: "Sales increased $520K (3.2%) compared to control (category average, or a 50/50 traffic split where possible), adjusted for ad spend, pricing and unavailability." },
    { tone: "learn", text: "25 of 205 SKUs underperformed. Ally tuned itself on what didn't work to make the next run better." },
  ],
  summary: [
    "We updated 150 SKUs for back to school, improved everyday content on 45 and unblocked 10 for syndication: $520K banked of $580K projected so far.",
    "$35K expired on 28 SKUs waiting on approval, $10K on 3 SKUs waiting on your team, and $15K was lost to one stockout during back to school.",
  ],
  workTypes: [
    {
      id: "seasonal", name: "Seasonal", method: "vs category", did: "150 SKUs for back to school", promised: 0.3, delivered: 0.26,
      bullets: [
        { tone: "green", text: "150 of 168 SKUs went live for back to school and drove a $260K (2.9%) sales lift over the category average, adjusted for pricing, ad spend and availability." },
        { tone: "orange", text: "−$40K vs projected: 18 SKUs weren't approved in time (−$25K) and one top seller ran out of stock (−$15K).", action: "autopilot" },
      ],
    },
    {
      id: "foundational", name: "Foundational", method: "A/B tested", did: "Keywords, titles and images on 45 SKUs", promised: 0.19, delivered: 0.18,
      bullets: [
        { tone: "green", text: "New content beat the old on 38 of 45 SKUs in A/B tests, a $180K (4.0%) sales lift." },
        { tone: "learn", text: "The 7 that lost went back to old content; what didn't work is now in the agent's context." },
      ],
    },
    {
      id: "retail-readiness", name: "Retail readiness", method: "A/B tested", did: "10 SKUs unblocked", promised: 0.09, delivered: 0.08,
      bullets: [
        { tone: "green", text: "10 SKUs unblocked for syndication (content last updated 2 quarters ago) by auto-updating 28 backend attributes." },
        { tone: "orange", text: "3 SKUs expired waiting on your team's input (−$10K).", action: "nudge-team" },
      ],
    },
  ],
}

/**
 * Ops agent, Q3 FY26 so far: revenue leakage prevented. Each fix is worth the
 * SKU's normal daily sales times the days sooner it was fixed (48 hours instead
 * of about 2 weeks). Ties to BANKED_OTHER ops: $310K of $360K projected.
 */
export const OPS_BANKED_Q3: ContentDelivered = {
  promised: 0.36,
  delivered: 0.31,
  did: "78 SKUs fixed in 48 hours",
  summary: [
    "We caught 78 SKUs losing the buy box, missing a promo badge, or dropping below the shipping speed bar, and fixed them in 48 hours instead of 2 weeks: $310K of leakage prevented of $360K projected.",
    "$30K expired waiting on 2 restocks, the retailer rejected 4 promo badges ($10K), and 2 SKUs shipped too slowly from one warehouse ($10K).",
  ],
  bullets: [
    { tone: "green", text: "Caught 78 SKUs losing the buy box, missing a promo badge, or dropping below the shipping speed bar, and fixed them in 48 hours instead of 2 weeks." },
    { tone: "green", text: "$310K of revenue leakage prevented: each SKU's normal daily sales × the 12 days sooner it was fixed, adjusted for price and seasonality." },
    { tone: "orange", text: "−$50K vs projected: 2 buy-box fixes expired waiting on restocks (−$30K), the retailer rejected 4 promo badges (−$10K), and 2 SKUs shipped too slowly (−$10K).", action: "nudge-team" },
  ],
  workTypes: [
    {
      id: "buy-box", name: "Buy box", method: "Leakage prevented", did: "38 SKUs won back", promised: 0.18, delivered: 0.15,
      bullets: [
        { tone: "green", text: "Won back the buy box on 36 of 38 SKUs within 48 hours, 12 days sooner than a manual fix." },
        { tone: "orange", text: "2 fixes expired waiting on restocks (−$30K).", action: "nudge-team" },
        { tone: "learn", text: "Ally now checks stock before chasing the buy box, so fixes don't stall on restocks." },
      ],
    },
    {
      id: "promo-badge", name: "Promo badge", method: "Leakage prevented", did: "26 badges restored", promised: 0.11, delivered: 0.1,
      bullets: [
        { tone: "green", text: "Promo badges are live again on 22 of 26 SKUs, so shoppers see the deal on the listing." },
        { tone: "orange", text: "The retailer rejected 4 badges. They need a new coupon setup (−$10K).", action: "nudge-team" },
      ],
    },
    {
      id: "shipping-speed", name: "Shipping speed", method: "Leakage prevented", did: "14 SKUs back above the bar", promised: 0.07, delivered: 0.06,
      bullets: [
        { tone: "green", text: "12 of 14 SKUs are back above the shipping speed bar and keep the fast-delivery badge." },
        { tone: "orange", text: "2 SKUs still ship too slowly from one warehouse (−$10K).", action: "nudge-team" },
      ],
    },
  ],
}
