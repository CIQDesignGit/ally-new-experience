/**
 * Custom alerts: rules Michelle writes in her own words, on top of the signals
 * Ally watches for everyone. The two below come out of the gift-sets drill and
 * tie to the Prime Day retro (Brightwick's 30% off, our 3 of 12 slots = 25%).
 */

/** What happens when an alert fires, in the demo's three states. */
export type AlertMode = "input" | "approval" | "autopilot"
export const MODE_LABEL: Record<AlertMode, string> = { input: "Needs your input", approval: "One approval away", autopilot: "On autopilot, up to $4K a week" }
export const FREQUENCIES = ["every morning", "twice a day", "weekly"] as const
export const CHANNELS = ["your email", "Slack", "your email and Slack", "your Ally inbox"] as const
export const THRESHOLDS = [15, 20, 25, 30] as const

export interface CustomAlert {
  id: "brand-terms" | "gift-terms"
  name: string
  threshold: number
  mode: AlertMode
  frequency: (typeof FREQUENCIES)[number]
  channel: (typeof CHANNELS)[number]
  terms: string[]
  /** Where the number is today. */
  now: string
  firing: boolean
  created: string
  /** Opened on the alerts page since it was made (the sidebar stops flagging it). */
  seen?: boolean
}

export const BRAND_TERMS = ["aurelle candles", "aurelle candle", "aurelle soy candles", "aurelle jar candle", "aurelle amber floral", "aurelle gift set"]
export const GIFT_TERMS = ["candle gift set", "candle gifts for her", "scented candle set", "holiday candle gift", "luxury candle gift"]

/** The two alerts the gift-sets task implies. The brand one starts on autopilot and the gift one one approval away, to show both ways of working. */
export const ALERT_RULES: Record<CustomAlert["id"], Omit<CustomAlert, "created" | "seen">> = {
  "brand-terms": {
    id: "brand-terms",
    name: "Competitors on our brand terms",
    threshold: 20,
    mode: "autopilot",
    frequency: "every morning",
    channel: "your email",
    terms: BRAND_TERMS,
    now: "Brightwick at 27% today; the media agent is on it, rechecks Oct 15",
    firing: false,
  },
  "gift-terms": {
    id: "gift-terms",
    name: "Our share on gift terms",
    threshold: 20,
    mode: "approval",
    frequency: "every morning",
    channel: "your email",
    terms: GIFT_TERMS,
    now: "We're at 18% today; the media agent is on it, rechecks Oct 15",
    firing: false,
  },
}

/** The alert as one sentence: the trigger. */
export function alertTrigger(a: Pick<CustomAlert, "id" | "threshold">) {
  return a.id === "brand-terms" ? `When any competitor gets more than ${a.threshold}% share of voice on our ${BRAND_TERMS.length} brand terms` : `When our share of voice on ${GIFT_TERMS.length} gift terms drops below ${a.threshold}%`
}

/** The signals Ally watches for every customer that Michelle's demo shows (the library has about 30). */
export const BUILT_IN_ALERTS = [
  { name: "Lost buy box", when: "A third-party seller drops below MAP and wins the buy box" },
  { name: "Promo badge missing", when: "A planned promotion is live without its badge" },
  { name: "Shows out of stock, but isn't", when: "A listing shows unavailable while we have stock" },
  { name: "Deal page visibility", when: "A deal isn't showing on the deals page" },
  { name: "Shipping speed slipped", when: "Delivery promise slows in key regions" },
  { name: "Chargeback disputes", when: "A chargeback is worth disputing" },
]

export const GIFT_QUESTION = "Why are gift sets lagging?"

/**
 * The gift-sets drill (use case 1), last 4 weeks vs last year. Sales = traffic ×
 * conversion × price: 0.88 × 0.98 × 1.00 = 0.86, so −14%. Weekly points start the
 * week of Jun 29; Prime Day (Jul 14–15) is the third.
 */
export const GIFT_DRILL = {
  weeks: ["Jun 29", "Jul 6", "Jul 13", "Jul 20", "Jul 27", "Aug 3", "Aug 10", "Aug 17", "Aug 24", "Aug 31", "Sep 7", "Sep 14", "Sep 21", "Sep 28"],
  primeDayWeek: 2,
  sales: [6, 7, 9, 3, 0, -3, -6, -8, -10, -11, -13, -14, -15, -14],
  traffic: [5, 6, 10, 2, -1, -3, -5, -7, -9, -10, -11, -12, -13, -12],
  drivers: [
    { label: "Sales", value: "−14%" },
    { label: "Traffic", value: "−12%", cause: true },
    { label: "Conversion", value: "−2%" },
    { label: "Price", value: "0%" },
  ],
}

/** The media agent's plan: spend cap, and what it returns at the agent's $3.40 IROAS. Michelle approves up to $5K a week; more goes to James. */
export const BID_CAPS = [2, 4, 6] as const
export const MICHELLE_LIMIT = 5
export const IROAS = 3.4
