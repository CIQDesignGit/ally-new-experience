/**
 * What Ally knows about Aurelle (brand context), what CommerceIQ has learned
 * across brands in the category (category context), and what that knowledge
 * changed. Everything ties: 64 entries now, the weekly series ends at today's
 * numbers, and the results name their method.
 */

export type ContextType = "Business" | "Calendar" | "Operations" | "Rules" | "Voice" | "People" | "Preferences"

export interface ContextEntry {
  text: string
  type: ContextType
  source: string
  /** Drafts and actions it was used in. */
  applied: number
  /** What it changed, when measured. */
  result?: string
  expires?: string
}

export const BRAND_CONTEXT: ContextEntry[] = [
  { text: "Q4 margin floor is 32%: no media or promo play below it", type: "Business", source: "Oct 2 call", applied: 3, result: "3 promo plays held back · margin kept on $140K of sales" },
  { text: "Priorities this quarter: gift sets, then Halloween", type: "Business", source: "Annual plan", applied: 22, result: "2 of 3 budget moves went to gift sets" },
  { text: "Pumpkin Chai mini launches Nov 20", type: "Calendar", source: "Oct 2 call", applied: 3 },
  { text: "Official candle of the Hudson Valley Winter Market, Nov 13–15", type: "Calendar", source: "Brand team email", applied: 6, result: "Winter Hearth pages due 4 days before the market" },
  { text: "Cedar & Smoke short at the DC until Oct 20", type: "Operations", source: "Oct 2 call", applied: 3, result: "Ads paused 10 days · $9K of spend not wasted", expires: "Oct 20" },
  { text: "Never claim \"non-toxic\" on any product", type: "Rules", source: "Legal", applied: 709, result: "0 legal rejections since Aug" },
  { text: "\"Originates in USA\", never \"Made in USA\"", type: "Rules", source: "Legal", applied: 378, result: "0 legal rejections since Aug" },
  { text: "Tagline: Gather round the glow", type: "Voice", source: "Brand team", applied: 41, result: "0 brand-voice rejections on the 41 pages" },
  { text: "Warm and sensory, not clinical: scent first, specs second", type: "Voice", source: "Mike's edits, Aug", applied: 612, result: "Edits on bullets down from 2.4 to 0.3 per draft" },
  { text: "Claire approves anything over $50K", type: "People", source: "Oct 2 call", applied: 2 },
  { text: "Michelle owns vendor escalations", type: "People", source: "Oct 2 call", applied: 5, result: "5 vendor notes to Michelle, none misrouted" },
  { text: "WBR on Tuesdays, with Target", type: "Preferences", source: "Oct 2 call", applied: 1, result: "WBR moved and Target added the same day" },
  { text: "Claire loved the competitor slide: lead with it", type: "Preferences", source: "Oct 2 recap", applied: 1, result: "Leads Thursday's deck" },
]
export const BRAND_TOTAL = 64
export const CONTEXT_TYPES: ContextType[] = ["Business", "Calendar", "Operations", "Rules", "Voice", "People", "Preferences"]
/** How many entries of each type, of the 64. */
export const TYPE_COUNTS: Record<ContextType, number> = { Business: 6, Calendar: 9, Operations: 7, Rules: 12, Voice: 14, People: 5, Preferences: 11 }

/** Weekly since onboarding (Aug 3): entries learned, and drafts approved with no edits (%). Ends today. */
export const GROWTH = [
  { week: "Aug 3", entries: 12, firstPass: 58 },
  { week: "Aug 10", entries: 18, firstPass: 61 },
  { week: "Aug 17", entries: 25, firstPass: 67, note: "Claim rules added" },
  { week: "Aug 24", entries: 29, firstPass: 70 },
  { week: "Aug 31", entries: 34, firstPass: 72 },
  { week: "Sep 7", entries: 41, firstPass: 77, note: "Seasonal palette" },
  { week: "Sep 14", entries: 46, firstPass: 79 },
  { week: "Sep 21", entries: 51, firstPass: 81 },
  { week: "Sep 28", entries: 57, firstPass: 83 },
  { week: "Oct 5", entries: 64, firstPass: 86, note: "Oct 2 call" },
]

/** The three numbers beside the chart: then (Aug 3) and now. */
export const OUTCOMES = [
  { label: "Edits per draft", then: "3.1", now: "0.6", good: "down" as const },
  { label: "Time to approve", then: "2.4 days", now: "0.5 days", good: "down" as const },
  { label: "On autopilot", then: "20%", now: "45%", good: "up" as const },
]

/** Patterns CommerceIQ sees across brands in the category. The pattern travels; no customer's data does. */
export interface Pattern {
  text: string
  evidence: string
  status: "Proven" | "Testing" | "Waiting for sign-off"
  aurelle: string
}

export const CATEGORY = { name: "Candles and home fragrance", brands: 14, lead: "Dana Lee, category lead" }

export const PATTERNS: Pattern[] = [
  { text: "Burn time and scent notes in bullets lift conversion", evidence: "A/B tests at 9 brands, +3% to 6%", status: "Proven", aurelle: "140 pages · +4.1% conversion vs control" },
  { text: "Gift-set searches spike 3 weeks before Thanksgiving", evidence: "Search data, 14 brands, 2 years", status: "Proven", aurelle: "Budget moved 3 weeks early" },
  { text: "Hold spend on pages that convert poorly until content fixes them", evidence: "Spend and sales at 11 brands", status: "Proven", aurelle: "7 SKUs · $9K a week moved" },
  { text: "Amazon caps titles at 75 characters on mobile search", evidence: "Retailer rule change, Sep 2026", status: "Proven", aurelle: "Applied to every title on day one" },
  { text: "\"Clean burning\" is the fastest-growing shopper question", evidence: "AI prompt panels, 6 weeks, 5 brands", status: "Waiting for sign-off", aurelle: "Not used: Aurelle's rule on wax melt claims comes first" },
  { text: "Bundles of 3 minis outsell single minis in Q4", evidence: "Sales at 3 brands", status: "Testing", aurelle: "Not used yet" },
]

/** A new brand in the category starts here on day one, thanks to the proven patterns. */
export const NEW_BRAND_START = 70
