/**
 * Use case 3, answers saved as a dashboard: promotions this month (Oct 1–8).
 * Ties to Michelle's queue: the missing badge is 5 SKUs and +$72K on the
 * Halloween deal (Oct 1–31, 20% off, $30.40 vs $38.00 list); deal page
 * visibility is 8 SKUs and +$48K. Brightwick's gift sets are 30% off while
 * ours are at full price ($34.99), as in the gift-sets drill.
 */

export const PROMO_MONTH = { sales: "$1.2M", growth: "14%", dates: "Oct 1 – 8, 2026" }

/** Lift by promo type vs the same promos last year. */
export const PROMO_LIFT = [
  { label: "Lightning deals", value: 38 },
  { label: "Bundles", value: 12 },
  { label: "Halloween deal", value: 11, note: "badge missing on 5 SKUs" },
  { label: "Coupons", value: 4 },
]

export const BADGE_SKUS = [
  { name: "Aurelle Noir Cherry Large Jar, 22 oz", asin: "B08NF9KBZ4", days: 8, risk: 18 },
  { name: "Aurelle Coastal Linen Large Jar, 22 oz", asin: "B00FLYWNYQ", days: 8, risk: 18 },
  { name: "Aurelle Fig & Cedar Large Jar, 22 oz", asin: "B0C4FGC221", days: 8, risk: 16 },
  { name: "Bright Citrus Mini Jar, 8 oz", asin: "B0BCM08080", days: 8, risk: 10 },
  { name: "Aurelle Vanilla Bean Mini Jar, 8 oz", asin: "B0C7VBM008", days: 8, risk: 10 },
]

/** How deep each side's promos run, by category, today. */
export const PROMO_DEPTH = [
  { category: "Jar candles", us: 20, them: 10 },
  { category: "Pillar candles", us: 10, them: 15 },
  { category: "Gift sets", us: 0, them: 30 },
  { category: "Wax melts", us: 0, them: 10 },
  { category: "Travel tins", us: 10, them: 0 },
]

/** The answers that can become dashboard widgets, by id. */
export const PROMO_WIDGETS = ["promo-month", "promo-badge", "promo-vs-brightwick"] as const
export type PromoWidget = (typeof PROMO_WIDGETS)[number]

export const PROMO_QUESTIONS: Record<PromoWidget, string> = {
  "promo-month": "How are our promotions doing this month?",
  "promo-badge": "Which promos are losing sales to a missing badge?",
  "promo-vs-brightwick": "How do our promos compare to Brightwick's?",
}
