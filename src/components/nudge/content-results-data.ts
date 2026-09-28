/**
 * "See all SKUs": content results for last quarter, across every type of work.
 * Totals tie to the "How we did" rows ($340K + $270K + $90K = $700K). Lifts are
 * measured against each type's comparison: the category for seasonal, old
 * content in A/B tests for foundational and retail readiness.
 */

export type ResultType = "seasonal" | "foundational" | "retail-readiness"

export interface Lifts {
  /** $M */
  incremental: number
  /** Percent lifts. */
  sales: number
  units: number
  traffic: number
  conversion: number
}

export interface ResultTotals extends Lifts {
  promised: number
  live: number
  promisedSkus: number
  /** vs category sections: SKU growth and category demand growth (%), and the usual lead before the change (pts). */
  skuImpr?: number
  catImpr?: number
  leadBefore?: number
  /** A/B sections: tests won out of tests run, and average confidence (%). */
  won?: number
  tested?: number
  confidence?: number
}

/**
 * One SKU, with the evidence its method produces.
 * vs category: the SKU's impressions and the category's (the demand benchmark),
 * event weeks vs the 4 weeks before; the lead is the difference. Price, ad spend
 * and stockouts are shown and normalized out before incremental sales.
 * A/B tested: lift of new content over old on a 50/50 traffic split, how
 * confident the test is, and how long it ran. Both halves see the same price,
 * ads and stock, so no adjustment is needed.
 */
export interface SkuLiftRow {
  name: string
  asin: string
  happened: string
  tone: "won" | "lost" | "oos" | "not-live"
  /** $M */
  incremental?: number
  /** SKU growth and category demand growth (impressions as the demand proxy), event weeks vs the 4 weeks before. */
  skuImpr?: number
  catImpr?: number
  /** The SKU's usual lead over the category in the previous period, before the content changed (pts). */
  leadBefore?: number
  /** Factors normalized out: % price change, % ad spend change, days out of stock. */
  price?: number
  ads?: number
  oosDays?: number
  lift?: number
  confidence?: number
  days?: number
}

export interface ResultSection {
  type: ResultType
  name: string
  method: "vs category" | "A/B tested"
  totals: ResultTotals
  rows: SkuLiftRow[]
}


export const RESULTS_ALL: ResultTotals = {
  incremental: 0.7,
  promised: 0.89,
  sales: 3.5,
  units: 3.6,
  traffic: 2.4,
  conversion: 1.1,
  live: 280,
  promisedSkus: 346,
}

export const RESULT_SECTIONS: ResultSection[] = [
  {
    type: "seasonal",
    name: "Seasonal · Mother's Day",
    method: "vs category",
    totals: { incremental: 0.34, promised: 0.44, sales: 3.1, units: 3.3, traffic: 2.2, conversion: 0.9, live: 200, promisedSkus: 240, skuImpr: 15.1, catImpr: 12.0, leadBefore: 0.5 },
    rows: [
      { name: "Rose and peony gift set", asin: "B0CT4R9X1K", happened: "Outgrew the category", tone: "won", incremental: 0.027, skuImpr: 18.5, catImpr: 12.0, leadBefore: 1.2, price: 0, ads: 3, oosDays: 0 },
      { name: "Vanilla bean soy jar", asin: "B0BN7Q2M8D", happened: "Outgrew the category", tone: "won", incremental: 0.015, skuImpr: 16.0, catImpr: 12.0, leadBefore: 0.8, price: -1, ads: 0, oosDays: 0 },
      { name: "Lavender pillar candle", asin: "B0C1KJ5P3W", happened: "Outgrew the category", tone: "won", incremental: 0.018, skuImpr: 13.4, catImpr: 12.0, leadBefore: 0.3, price: 0, ads: 2, oosDays: 0 },
      { name: "Multipack votive set", asin: "B0D2XH8T6R", happened: "Grew slower than the category", tone: "lost", incremental: -0.002, skuImpr: 11.2, catImpr: 12.0, leadBefore: 0.4, price: 4, ads: 0, oosDays: 0 },
      { name: "Pillar candle, 4-pack", asin: "B0BZ3L7V9C", happened: "Out of stock 9 days", tone: "oos", incremental: -0.006, skuImpr: -2.0, catImpr: 12.0, leadBefore: 0.6, price: 0, ads: 0, oosDays: 9 },
      { name: "Mini candle sampler", asin: "B0C9WF4N2E", happened: "Not approved in time", tone: "not-live" },
    ],
  },
  {
    type: "foundational",
    name: "Foundational",
    method: "A/B tested",
    totals: { incremental: 0.27, promised: 0.32, sales: 4.2, units: 4.3, traffic: 2.6, conversion: 1.6, live: 60, promisedSkus: 78, won: 50, tested: 60, confidence: 96 },
    rows: [
      { name: "Bright citrus zest soy jar", asin: "B0AK2P8R5T", happened: "Won A/B test", tone: "won", incremental: 0.014, lift: 6.1, confidence: 98, days: 28 },
      { name: "Amber floral jar candle", asin: "B0B6M3D9QX", happened: "Won A/B test", tone: "won", incremental: 0.011, lift: 5.2, confidence: 97, days: 28 },
      { name: "Cedar and sage 3-wick", asin: "B0C8T1V4LN", happened: "Won A/B test", tone: "won", incremental: 0.009, lift: 4.8, confidence: 95, days: 21 },
      { name: "Noir cherry jar, 3 sizes", asin: "B0BQ5H2W7J", happened: "Lost, back to old content", tone: "lost", incremental: -0.001, lift: -1.2, confidence: 91, days: 21 },
      { name: "Gift set trio", asin: "B0D4R6K1ZP", happened: "Lost, back to old content", tone: "lost", incremental: -0.001, lift: -0.9, confidence: 90, days: 28 },
      { name: "Sea salt travel tin", asin: "B0C3N9X5FA", happened: "Waiting for approval", tone: "not-live" },
    ],
  },
  {
    type: "retail-readiness",
    name: "Retail readiness",
    method: "A/B tested",
    totals: { incremental: 0.09, promised: 0.13, sales: 3.7, units: 3.8, traffic: 2.9, conversion: 0.8, live: 20, promisedSkus: 28, won: 17, tested: 20, confidence: 95 },
    rows: [
      { name: "Hand-poured amber, 14 oz", asin: "B0B2F7L4VQ", happened: "Unblocked, won A/B test", tone: "won", incremental: 0.006, lift: 5.0, confidence: 96, days: 28 },
      { name: "Wood-wick pillar", asin: "B0C5J8R3MT", happened: "Unblocked, won A/B test", tone: "won", incremental: 0.005, lift: 4.4, confidence: 95, days: 28 },
      { name: "Linen mist diffuser", asin: "B0D1Q6W2HK", happened: "Unblocked, lost A/B test", tone: "lost", incremental: -0.001, lift: -0.7, confidence: 90, days: 21 },
      { name: "Ceramic travel candle", asin: "B0BX4T9N6D", happened: "Still blocked from syndication", tone: "not-live" },
    ],
  },
]

/* ---------------------------------------------------------------------------
 * Period filter: last closed month, quarter or year, matching "How we did".
 * Month and year reuse the quarter's SKU rows, re-scaled so every total ties
 * to that period's content row (September $238K, FY25 $1.79M).
 * ------------------------------------------------------------------------- */
export type ResultPeriod = "qtd" | "month" | "quarter" | "year"

export interface PeriodResults {
  name: string
  all: ResultTotals
  sections: ResultSection[]
}

type Scale = { name: string; incremental: number; promised: number; live: number; promisedSkus: number } & Partial<ResultTotals>

function rescale(base: ResultSection, t: Scale): ResultSection {
  const k = t.incremental / base.totals.incremental
  return {
    ...base,
    name: t.name,
    totals: { ...base.totals, ...t },
    rows: base.rows.map((r) => (r.incremental === undefined ? r : { ...r, incremental: r.incremental * k })),
  }
}

const [SEASONAL_Q, FOUNDATIONAL_Q, READINESS_Q] = RESULT_SECTIONS

/** Back to school (Q3 and September): its own SKUs. Category grew 8% in event weeks; the $15K stockout ties to Claire's Q3 story. */
const BACK_TO_SCHOOL: ResultSection = {
  type: "seasonal",
  name: "Seasonal · Back to school",
  method: "vs category",
  totals: { incremental: 0.26, promised: 0.3, sales: 2.9, units: 3.0, traffic: 2.0, conversion: 0.9, live: 150, promisedSkus: 168, skuImpr: 10.9, catImpr: 8.0, leadBefore: 0.4 },
  rows: [
    { name: "Dorm-size mini jar, 3-pack", asin: "B0D7K2M4RS", happened: "Outgrew the category", tone: "won", incremental: 0.021, skuImpr: 14.2, catImpr: 8.0, leadBefore: 1.0, price: 0, ads: 3, oosDays: 0 },
    { name: "Study focus eucalyptus jar", asin: "B0C4T8W1PL", happened: "Outgrew the category", tone: "won", incremental: 0.012, skuImpr: 12.1, catImpr: 8.0, leadBefore: 0.6, price: -1, ads: 0, oosDays: 0 },
    { name: "Teacher thank-you gift set", asin: "B0B9R3N6XQ", happened: "Outgrew the category", tone: "won", incremental: 0.014, skuImpr: 11.5, catImpr: 8.0, leadBefore: 0.4, price: 0, ads: 2, oosDays: 0 },
    { name: "Fresh linen tumbler", asin: "B0C2L5V8HD", happened: "Grew slower than the category", tone: "lost", incremental: -0.002, skuImpr: 7.1, catImpr: 8.0, leadBefore: 0.5, price: 4, ads: 0, oosDays: 0 },
    { name: "Travel tin trio", asin: "B0D3F9Q2WN", happened: "Out of stock 11 days", tone: "oos", incremental: -0.015, skuImpr: -6.0, catImpr: 8.0, leadBefore: 0.8, price: 0, ads: 0, oosDays: 11 },
    { name: "Wax melt sampler", asin: "B0BY6H1K7T", happened: "Not approved in time", tone: "not-live" },
  ],
}

export const RESULTS_BY_PERIOD: Record<ResultPeriod, PeriodResults> = {
  /** This quarter so far (Q3 FY26): ties to CONTENT_BANKED_Q3, $520K of $580K projected. */
  qtd: {
    name: "Q3 FY26",
    all: { incremental: 0.52, promised: 0.58, sales: 3.2, units: 3.3, traffic: 2.2, conversion: 1.0, live: 205, promisedSkus: 236 },
    sections: [
      rescale(BACK_TO_SCHOOL, { name: "Seasonal · Back to school", incremental: 0.26, promised: 0.3, live: 150, promisedSkus: 168 }),
      rescale(FOUNDATIONAL_Q, { name: "Foundational", incremental: 0.18, promised: 0.19, live: 45, promisedSkus: 55, sales: 4.0, won: 38, tested: 45 }),
      rescale(READINESS_Q, { name: "Retail readiness", incremental: 0.08, promised: 0.09, live: 10, promisedSkus: 13, won: 8, tested: 10 }),
    ],
  },
  month: {
    name: "September",
    all: { incremental: 0.238, promised: 0.26, sales: 3.3, units: 3.4, traffic: 2.3, conversion: 1.0, live: 100, promisedSkus: 120 },
    sections: [
      rescale(BACK_TO_SCHOOL, { name: "Seasonal · Back to school", incremental: 0.12, promised: 0.13, live: 70, promisedSkus: 82 }),
      rescale(FOUNDATIONAL_Q, { name: "Foundational", incremental: 0.09, promised: 0.1, live: 22, promisedSkus: 28, won: 19, tested: 22 }),
      rescale(READINESS_Q, { name: "Retail readiness", incremental: 0.028, promised: 0.03, live: 8, promisedSkus: 10, won: 7, tested: 8 }),
    ],
  },
  quarter: { name: "Q2 FY26", all: RESULTS_ALL, sections: RESULT_SECTIONS },
  year: {
    name: "FY25",
    all: { incremental: 1.79, promised: 2.0, sales: 3.4, units: 3.5, traffic: 2.3, conversion: 1.1, live: 1060, promisedSkus: 1260 },
    sections: [
      rescale(SEASONAL_Q, { name: "Seasonal · 11 events", incremental: 0.87, promised: 0.98, live: 740, promisedSkus: 860, skuImpr: 13.2, catImpr: 10.0, leadBefore: 0.5 }),
      rescale(FOUNDATIONAL_Q, { name: "Foundational", incremental: 0.69, promised: 0.77, live: 240, promisedSkus: 300, won: 204, tested: 240 }),
      rescale(READINESS_Q, { name: "Retail readiness", incremental: 0.23, promised: 0.25, live: 80, promisedSkus: 100, won: 68, tested: 80 }),
    ],
  },
}
