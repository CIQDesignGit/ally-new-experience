/**
 * Delivered so far, per period, as of Oct 8 (Q4 FY26, Oct–Dec). One set per
 * period the switch offers; every page reads the same one, so Claire's rows,
 * Mike's and Michelle's sections and the PDF always match. All values in $M.
 * Ties: work types sum to the lever; each gap's parts sum to delivered − projected.
 * "October so far" and "Q4 FY26 so far" are the same days (Oct 1–8).
 */
import type { ContentDelivered } from "./delivered-content-data"
import type { AgentId, Period } from "./types"
import { LOOP_DELIVERED } from "./media/data"
import { currentRetailer, factors } from "./retailer"

export interface PeriodDelivered {
  /** "Q4 FY26 so far": the section title. */
  label: string
  content: ContentDelivered
  ops: ContentDelivered
  media: { promised: number; delivered: number; reason: string }
}

/* Oct 5–8 ----------------------------------------------------------------- */
const WEEK: PeriodDelivered = {
  label: "This week so far",
  content: {
    promised: 0.07,
    delivered: 0.06,
    did: "31 SKUs improved this week",
    summary: [
      "We put 24 SKUs live early for Halloween, improved everyday content on 6 and unblocked 1 for syndication: $60K of $70K projected this week.",
      "$5K was missed while 5 Halloween SKUs waited on approval, and $5K while 1 SKU waited on your team.",
    ],
    bullets: [
      { tone: "orange", text: "31 of 37 SKUs went live. 5 waited on approval (−$5K) and 1 waited on your team's input (−$5K).", action: "autopilot" },
      { tone: "green", text: "Sales increased $60K (2.4%) compared to control, adjusted for ad spend, pricing and unavailability." },
    ],
    workTypes: [
      {
        id: "seasonal", name: "Seasonal", method: "vs category", did: "24 SKUs live early for Halloween", promised: 0.035, delivered: 0.03,
        bullets: [
          { tone: "green", text: "24 SKUs went live early for Halloween and are running $30K (2.2%) ahead of the category average." },
          { tone: "orange", text: "−$5K vs projected: 5 SKUs waited on approval.", action: "autopilot" },
        ],
      },
      {
        id: "foundational", name: "Foundational", method: "A/B tested", did: "Keywords and titles on 6 SKUs", promised: 0.025, delivered: 0.025,
        bullets: [{ tone: "green", text: "6 SKUs went live Oct 6. Lift counts from launch; the A/B result lands in about 5 weeks." }],
      },
      {
        id: "retail-readiness", name: "Retail readiness", method: "A/B tested", did: "1 SKU unblocked", promised: 0.01, delivered: 0.005,
        bullets: [
          { tone: "green", text: "1 SKU unblocked for syndication by filling 4 backend attributes." },
          { tone: "orange", text: "1 SKU waited on your team's input (−$5K).", action: "nudge-team" },
        ],
      },
    ],
  },
  ops: {
    promised: 0.05,
    delivered: 0.045,
    did: "9 SKUs fixed in 48 hours",
    summary: [
      "We fixed 9 SKUs losing the buy box, a promo badge or shipping speed within 48 hours: $45K of leakage prevented of $50K projected.",
      "$5K was missed waiting on 1 restock.",
    ],
    bullets: [
      { tone: "green", text: "Caught and fixed 9 SKUs in 48 hours instead of 2 weeks." },
      { tone: "orange", text: "−$5K vs projected: 1 buy-box fix waited on a restock.", action: "nudge-team" },
    ],
    workTypes: [
      {
        id: "buy-box", name: "Buy box", method: "Leakage prevented", did: "5 SKUs won back", promised: 0.03, delivered: 0.025,
        bullets: [
          { tone: "green", text: "Won back the buy box on 4 of 5 SKUs within 48 hours." },
          { tone: "orange", text: "1 fix waited on a restock (−$5K).", action: "nudge-team" },
        ],
      },
      {
        id: "promo-badge", name: "Promo badge", method: "Leakage prevented", did: "3 badges restored", promised: 0.012, delivered: 0.012,
        bullets: [{ tone: "green", text: "Promo badges are live again on all 3 SKUs." }],
      },
      {
        id: "shipping-speed", name: "Shipping speed", method: "Leakage prevented", did: "1 SKU back above the bar", promised: 0.008, delivered: 0.008,
        bullets: [{ tone: "green", text: "1 SKU is back above the shipping speed bar and keeps the fast-delivery badge." }],
      },
    ],
  },
  media: { promised: 0.05, delivered: 0.055, reason: "IROAS $3.10 vs $2.80 plan" },
}

/* Oct 1–8: October so far = Q4 so far --------------------------------------- */
const QTD_CONTENT: ContentDelivered = {
  promised: 0.12,
  delivered: 0.1,
  did: "52 SKUs improved so far",
  summary: [
    "We put 40 SKUs live early for Halloween, improved everyday content on 10 and unblocked 2 for syndication: $100K banked of $120K projected so far.",
    "$10K was missed while 8 Halloween SKUs waited on approval, and $10K while 2 SKUs waited on your team.",
  ],
  bullets: [
    { tone: "orange", text: "52 of 62 SKUs went live. 8 waited on approval (−$10K) and 2 waited on your team's input (−$10K).", action: "autopilot" },
    { tone: "green", text: "Sales increased $100K (2.3%) compared to control (category average, or a 50/50 traffic split where possible), adjusted for ad spend, pricing and unavailability." },
  ],
  workTypes: [
    {
      id: "seasonal", name: "Seasonal", method: "vs category", did: "40 SKUs live early for Halloween", promised: 0.06, delivered: 0.05,
      bullets: [
        { tone: "green", text: "40 of 48 early Halloween SKUs went live and are running $50K (2.1%) ahead of the category average, adjusted for pricing, ad spend and availability." },
        { tone: "orange", text: "−$10K vs projected: 8 SKUs waited on approval.", action: "autopilot" },
      ],
    },
    {
      id: "foundational", name: "Foundational", method: "A/B tested", did: "Keywords and titles on 10 SKUs", promised: 0.04, delivered: 0.04,
      bullets: [{ tone: "green", text: "10 SKUs went live Oct 2. Lift counts from launch; the A/B result lands in about 5 weeks, once it's significant." }],
    },
    {
      id: "retail-readiness", name: "Retail readiness", method: "A/B tested", did: "2 SKUs unblocked", promised: 0.02, delivered: 0.01,
      bullets: [
        { tone: "green", text: "2 SKUs unblocked for syndication by filling 9 backend attributes." },
        { tone: "orange", text: "2 SKUs waited on your team's input (−$10K).", action: "nudge-team" },
      ],
    },
  ],
}

const QTD_OPS: ContentDelivered = {
  promised: 0.09,
  delivered: 0.08,
  did: "18 SKUs fixed in 48 hours",
  summary: [
    "We fixed 18 SKUs losing the buy box, a promo badge or shipping speed within 48 hours: $80K of leakage prevented of $90K projected.",
    "$5K was missed waiting on 1 restock and the retailer rejected 1 promo badge ($5K).",
  ],
  bullets: [
    { tone: "green", text: "Caught 18 SKUs losing the buy box, missing a promo badge, or dropping below the shipping speed bar, and fixed them in 48 hours instead of 2 weeks." },
    { tone: "orange", text: "−$10K vs projected: 1 buy-box fix waited on a restock (−$5K) and the retailer rejected 1 promo badge (−$5K).", action: "nudge-team" },
  ],
  workTypes: [
    {
      id: "buy-box", name: "Buy box", method: "Leakage prevented", did: "9 SKUs won back", promised: 0.05, delivered: 0.045,
      bullets: [
        { tone: "green", text: "Won back the buy box on 8 of 9 SKUs within 48 hours, 12 days sooner than a manual fix." },
        { tone: "orange", text: "1 fix waited on a restock (−$5K).", action: "nudge-team" },
      ],
    },
    {
      id: "promo-badge", name: "Promo badge", method: "Leakage prevented", did: "6 badges restored", promised: 0.025, delivered: 0.02,
      bullets: [
        { tone: "green", text: "Promo badges are live again on 5 of 6 SKUs." },
        { tone: "orange", text: "The retailer rejected 1 badge. It needs a new coupon setup (−$5K).", action: "nudge-team" },
      ],
    },
    {
      id: "shipping-speed", name: "Shipping speed", method: "Leakage prevented", did: "3 SKUs back above the bar", promised: 0.015, delivered: 0.015,
      bullets: [{ tone: "green", text: "All 3 SKUs are back above the shipping speed bar and keep the fast-delivery badge." }],
    },
  ],
}

// The content loop's share: keywords content added that media then funded.
const QTD_MEDIA = { promised: 0.09, delivered: 0.1, reason: `IROAS $3.08 vs $2.80 plan · $${Math.round(LOOP_DELIVERED * 1000)}K on keywords content added` }

/* Jan 1 – Oct 8 ------------------------------------------------------------- */
const YEAR: PeriodDelivered = {
  label: "FY26 so far",
  content: {
    promised: 2.09,
    delivered: 1.78,
    did: "620 SKUs improved this year",
    summary: [
      "Across Valentine's Day, Mother's Day, back to school and early Halloween, plus everyday content and syndication fixes: $1.78M banked of $2.09M projected.",
      "$120K expired waiting on approval, $60K was lost to stockouts, $70K to content that lost its A/B test, and $60K was missed waiting on your team.",
    ],
    bullets: [
      { tone: "orange", text: "−$310K vs projected: $120K expired waiting on approval, $60K ran out of stock, $70K lost its A/B test and $60K waited on your team's input.", action: "autopilot" },
      { tone: "green", text: "Sales increased $1.78M (3.4%) compared to control, adjusted for ad spend, pricing and unavailability." },
    ],
    workTypes: [
      {
        id: "seasonal", name: "Seasonal", method: "vs category", did: "4 events, 440 SKUs", promised: 1.05, delivered: 0.87,
        bullets: [
          { tone: "green", text: "Valentine's Day, Mother's Day, back to school and early Halloween drove $870K (3.1%) over the category average." },
          { tone: "orange", text: "−$180K vs projected: SKUs not approved in time (−$120K) and stockouts (−$60K).", action: "autopilot" },
        ],
      },
      {
        id: "foundational", name: "Foundational", method: "A/B tested", did: "Keywords, titles and images on 150 SKUs", promised: 0.72, delivered: 0.65,
        bullets: [
          { tone: "green", text: "New content beat the old on 128 of 150 SKUs in A/B tests, a $650K (3.8%) sales lift." },
          { tone: "orange", text: "−$70K vs projected: 22 SKUs lost their A/B test and went back to old content." },
          { tone: "learn", text: "What didn't work on those 22 is now in the agent's context." },
        ],
      },
      {
        id: "retail-readiness", name: "Retail readiness", method: "A/B tested", did: "42 SKUs unblocked", promised: 0.32, delivered: 0.26,
        bullets: [
          { tone: "green", text: "42 SKUs unblocked for syndication by auto-filling 180 backend attributes." },
          { tone: "orange", text: "−$60K vs projected: 11 SKUs waited on your team's input.", action: "nudge-team" },
        ],
      },
    ],
  },
  ops: {
    promised: 0.85,
    delivered: 0.74,
    did: "288 SKUs fixed in 48 hours",
    summary: [
      "We fixed 288 SKUs losing the buy box, a promo badge or shipping speed within 48 hours this year: $740K of leakage prevented of $850K projected.",
      "$50K waited on restocks, $40K on rejected promo badges and $20K on SKUs shipping too slowly.",
    ],
    bullets: [
      { tone: "green", text: "Caught and fixed 288 SKUs in 48 hours instead of 2 weeks." },
      { tone: "orange", text: "−$110K vs projected: restocks (−$50K), rejected promo badges (−$40K) and slow shipping (−$20K).", action: "nudge-team" },
    ],
    workTypes: [
      {
        id: "buy-box", name: "Buy box", method: "Leakage prevented", did: "140 SKUs won back", promised: 0.42, delivered: 0.37,
        bullets: [
          { tone: "green", text: "Won back the buy box on 131 of 140 SKUs within 48 hours." },
          { tone: "orange", text: "−$50K vs projected: fixes waiting on restocks.", action: "nudge-team" },
        ],
      },
      {
        id: "promo-badge", name: "Promo badge", method: "Leakage prevented", did: "96 badges restored", promised: 0.26, delivered: 0.22,
        bullets: [
          { tone: "green", text: "Promo badges are live again on 84 of 96 SKUs." },
          { tone: "orange", text: "−$40K vs projected: rejected badges that need a new coupon setup.", action: "nudge-team" },
        ],
      },
      {
        id: "shipping-speed", name: "Shipping speed", method: "Leakage prevented", did: "52 SKUs back above the bar", promised: 0.17, delivered: 0.15,
        bullets: [
          { tone: "green", text: "46 of 52 SKUs are back above the shipping speed bar." },
          { tone: "orange", text: "−$20K vs projected: SKUs shipping too slowly from two warehouses.", action: "nudge-team" },
        ],
      },
    ],
  },
  media: { promised: 1.28, delivered: 1.37, reason: "IROAS $3.02 vs $2.80 plan" },
}

const AMAZON_DELIVERED: Record<Period, PeriodDelivered> = {
  week: WEEK,
  month: { label: "October so far", content: QTD_CONTENT, ops: QTD_OPS, media: QTD_MEDIA },
  quarter: { label: "Q4 FY26 so far", content: QTD_CONTENT, ops: QTD_OPS, media: QTD_MEDIA },
  year: YEAR,
}

/** What was delivered for the retailer in view: Amazon's, or sized by that retailer's factor. The per-bucket detail stays Amazon's (see retailer.ts). */
export const DELIVERED = new Proxy(AMAZON_DELIVERED, {
  get(target, p: string) {
    const d = target[p as Period]
    const f = factors().delivered
    if (!d || f === 1) return d
    // The counts, reasons and per-bucket detail are Amazon's, so another retailer's rows carry only the money and where it was.
    const where = currentRetailer() === "all" ? "Across Amazon, Walmart and Target" : `On ${currentRetailer() === "walmart" ? "Walmart" : "Target"}`
    const scale = <T extends { promised: number; delivered: number }>(x: T): T => ({ ...x, promised: x.promised * f, delivered: x.delivered * f })
    return {
      ...d,
      content: { ...scale(d.content), did: where, bullets: [] },
      ops: { ...scale(d.ops), did: where, bullets: [] },
      media: { ...scale(d.media), reason: d.media.reason.replace(/ · \$\d+K on keywords content added/, "") },
    }
  },
})

/** One lever's delivered numbers for a period, in the shape the summary rows use. */
export function leverDelivered(p: PeriodDelivered, agent: AgentId) {
  return agent === "media" ? p.media : { promised: p[agent].promised, delivered: p[agent].delivered, reason: p[agent].did }
}
