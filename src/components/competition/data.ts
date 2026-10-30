/**
 * The competition demo's content. Figures tie to the rest of the demo: our
 * gift-term share is 18% this week (Michelle's gift-terms alert), Brightwick
 * took 7 of 12 sponsored slots on Prime Day day 1 (the retro), and the six
 * matched gift sets are Aurelle's gift-set line.
 */
import { GIFT_TERMS } from "../nudge/alerts/data"

export const NAMES = {
  customer: "Michelle Ortiz",
  fde: "Nora Diaz",
  fdeTitle: "Nora Diaz, your CommerceIQ engineer",
  reviewer: "Lena Brooks",
  competitor: "Brightwick",
  request: "#412",
  skill: "Competition watch",
}

/** When things happen, on the demo's clock (Thu, Oct 8). */
export const TIMES = {
  requested: "Oct 8, 9:40 AM",
  promised: "tomorrow, 10 AM",
  promisedAbs: "Fri, Oct 9, 10 AM",
  live: "Oct 8, 5:00 PM",
  early: "17 hours early",
}

/** Share of voice on the gift terms, last 8 weeks (week starting). Prime Day is the week of Jul 12. */
export const SOV_WEEKS = ["Aug 16", "Aug 23", "Aug 30", "Sep 6", "Sep 13", "Sep 20", "Sep 27", "Oct 4"]
export const SOV = {
  ours: [24, 23, 23, 22, 21, 20, 19, 18],
  theirs: [22, 23, 24, 25, 27, 28, 30, 31],
}
/** Brightwick's gift-term share at Prime Day, so "up 9 pts since Prime Day" ties: 22 → 31. */
export const THEIR_SOV_PRIME_DAY = 22

/** Deals Brightwick is running now, on products matched to ours. */
export const DEALS = [
  { theirs: "Brightwick Amber Gift Set, 3 x 8 oz", ours: "Aurelle Amber & Fig Gift Set", deal: "20% off", since: "Oct 5", gap: -4.8 },
  { theirs: "Brightwick Holiday Trio", ours: "Aurelle Candle & Match Gift Tin, Warm Spice", deal: "20% off", since: "Oct 5", gap: -3.6 },
  { theirs: "Brightwick Votive Sampler, 6 pack", ours: "Aurelle Votive Gift Set, 6 pack", deal: "20% off", since: "Oct 5", gap: -4.2 },
  { theirs: "Brightwick Spa Gift Box", ours: "Aurelle Lavender Spa Gift Set", deal: "20% off", since: "Oct 5", gap: -3.8 },
] as const
export const MATCHED = 6

/** The quick questions Michelle asks first, and what Ally says at once. */
export const QUICK = {
  sov: {
    q: "What's our share of voice on gift terms this week?",
    lead: `18% on your ${GIFT_TERMS.length} gift terms, down from 24% eight weeks ago.`,
    points: [`${NAMES.competitor} leads at 31%`, "Sponsored and organic results combined", "Week of Oct 4"],
  },
  deals: {
    q: `Has ${NAMES.competitor} run any deals?`,
    lead: `Yes. 20% off on ${DEALS.length} gift sets since Oct 5.`,
    points: [`${DEALS.length} of your ${MATCHED} gift sets have a direct ${NAMES.competitor} match on deal`, "No deals on jar candles"],
  },
}

export const DEEP_ASK = `Can you track ${NAMES.competitor} every week, with their promotions, price gaps against our SKUs and share of voice, and tell me when it matters?`

/** The SQL Claude drafts. price_gap has the title match Nora catches; sov_gift_terms counts sponsored only, which the tests catch. */
export const SQL = {
  promotions: `-- Competitor deals that started this week
SELECT c.asin, c.title, c.deal_type, c.discount_pct, c.start_date
FROM competitor_offers c
WHERE c.client_id = :client_id
  AND c.brand = :competitor
  AND c.start_date BETWEEN :week_start AND :week_end`,
  priceGap: {
    head: `-- Price gap on matched products, this week
WITH ours AS (
  SELECT asin, product_type, AVG(offer_price) AS our_price
  FROM offer_prices
  WHERE client_id = :client_id AND report_date BETWEEN :week_start AND :week_end
  GROUP BY asin, product_type
), theirs AS (
  SELECT asin, title, AVG(offer_price) AS their_price
  FROM competitor_offers
  WHERE client_id = :client_id AND brand = :competitor
    AND report_date BETWEEN :week_start AND :week_end
  GROUP BY asin, title
)
SELECT o.asin, c.asin AS competitor_asin, o.our_price, c.their_price,
       c.their_price - o.our_price AS gap
FROM ours o`,
    wrong: `JOIN theirs c ON c.title ILIKE '%' || o.product_type || '%'`,
    right: `JOIN competitor_sku_map m ON m.client_id = :client_id AND m.our_asin = o.asin
JOIN theirs c ON c.asin = m.competitor_asin`,
  },
  sov: {
    head: `-- Share of voice on the account's gift terms, by brand
SELECT brand, SUM(slots_won) * 1.0 / SUM(slots_total) AS share
FROM search_slots
WHERE client_id = :client_id
  AND term IN (:gift_terms)`,
    wrong: `  AND placement = 'sponsored'`,
    right: `  AND placement IN ('sponsored', 'organic')`,
    tail: `  AND report_date BETWEEN :week_start AND :week_end
GROUP BY brand`,
  },
}

/** The skill file. Version 1 names Brightwick; version 3 reads the account's competitor list. */
export const SKILL = {
  head: `# ${NAMES.skill}

Weekly read of a competitor against this account, every :day.

## Steps
1. Run promotions.sql for this week.
2. Run price_gap.sql on matched products only.
3. Run sov_gift_terms.sql for the account's gift terms.`,
  wrong: `4. Compare against Brightwick.`,
  right: `4. Compare against each competitor on the account's competitor list (:competitors).`,
  tail: `5. Alert when a competitor's share moves more than :threshold pts in a week,
   or a new deal hits a matched product.
6. Write one finding first, then the numbers. Every number comes from a query.`,
}

/** Tests: 10 known weeks for Aurelle, plus 2 runs for other customers before it can go to everyone. */
export interface TestCase {
  name: string
  customer: string
  /** Fails in version 1, and why. */
  fails?: { why: string; fixIn: "sql" | "skill"; where: string }
}
export const TESTS: TestCase[] = [
  { name: "Deals, week of Oct 4", customer: "Aurelle" },
  { name: "Deals, Prime Day week", customer: "Aurelle" },
  { name: "Price gap, Amber & Fig gift set", customer: "Aurelle" },
  { name: "Price gap, votive gift set", customer: "Aurelle" },
  { name: "Price gap, jar candles (no match)", customer: "Aurelle" },
  { name: "Share of voice, week of Oct 4", customer: "Aurelle" },
  { name: "Brightwick share of voice, Prime Day week", customer: "Aurelle", fails: { why: "Expected 22% across sponsored and organic results; got 58%, from sponsored slots only (7 of 12)", fixIn: "sql", where: "sov_gift_terms.sql, line 6" } },
  { name: "Alert fires at 5 pts", customer: "Aurelle" },
  { name: "No alert under 5 pts", customer: "Aurelle" },
  { name: "Finding comes first", customer: "Aurelle" },
  { name: "Weekly run", customer: "Juniper Home", fails: { why: "Compared against Brightwick, who isn't on Juniper Home's competitor list", fixIn: "skill", where: "SKILL.md, step 4" } },
  { name: "Weekly run", customer: "Larkspur Pet" },
]

export const FINDING = `${NAMES.competitor}'s share on your gift terms is up ${SOV.theirs[SOV.theirs.length - 1] - THEIR_SOV_PRIME_DAY} pts since Prime Day, and they've put ${DEALS.length} of your ${MATCHED} matched gift sets on deal since Oct 5.`
