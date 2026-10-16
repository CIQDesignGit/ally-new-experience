/**
 * AI Commerce v2 (paper towels, illustrative, local only). Measurement first,
 * then the attribute and intent graph, then the fixes it produces. Every total
 * is derived from its parts.
 */

export const META = {
  brand: "Brawny",
  category: "Paper towels",
  retailers: ["Amazon", "Walmart", "Kroger"] as const,
  asOf: "Month to Oct 12",
}

export type Retailer = (typeof META.retailers)[number]

/** AI-driven sales by agent, $K a month: our estimate with its range, the proven paid part, and the category total. */
export const AGENTS = [
  { id: "alexa", name: "Alexa for Shopping", est: 760, range: [610, 930], proven: 168, category: 4000, leader: "Bounty" },
  { id: "sparky", name: "Walmart Sparky", est: 310, range: [220, 410], proven: 46, category: 1940, leader: "Great Value" },
  { id: "chatgpt", name: "ChatGPT", est: 280, range: [170, 390], proven: 0, category: 2000, leader: "Bounty" },
  { id: "personal", name: "Muse and Instinct", est: 70, range: [30, 120], proven: 0, category: 780, leader: "Bounty" },
] as const

export const TOTAL = {
  est: AGENTS.reduce((t, a) => t + a.est, 0),
  low: AGENTS.reduce((t, a) => t + a.range[0], 0),
  high: AGENTS.reduce((t, a) => t + a.range[1], 0),
  proven: AGENTS.reduce((t, a) => t + a.proven, 0),
  category: AGENTS.reduce((t, a) => t + a.category, 0),
}

export const LEADER = { brand: "Bounty", share: 41 }

/**
 * Rank, the output metric: share of top positions (top 3), weighted by sales demand,
 * measured one way on every surface. Search feeds the agents, so its sales show
 * under the agents that read it.
 */
export const SURFACES = [
  { id: "alexa", name: "Alexa for Shopping", kind: "Retailer agent", top: 44, leader: "Bounty", leaderTop: 56, weight: 0.25, sales: "alexa", feeds: null },
  { id: "amz-search", name: "Amazon search", kind: "Retailer search", top: 48, leader: "Bounty", leaderTop: 53, weight: 0.2, sales: null, feeds: "Alexa for Shopping" },
  { id: "chatgpt", name: "ChatGPT", kind: "Answer agent", top: 30, leader: "Bounty", leaderTop: 55, weight: 0.2, sales: "chatgpt", feeds: null },
  { id: "sparky", name: "Walmart Sparky", kind: "Retailer agent", top: 34, leader: "Great Value", leaderTop: 48, weight: 0.15, sales: "sparky", feeds: null },
  { id: "wmt-search", name: "Walmart search", kind: "Retailer search", top: 36, leader: "Great Value", leaderTop: 49, weight: 0.15, sales: null, feeds: "Sparky" },
  { id: "personal", name: "Muse and Instinct", kind: "Personal agents", top: 18, leader: "Bounty", leaderTop: 44, weight: 0.05, sales: "personal", feeds: null },
] as const

export const RANK = {
  top: Math.round(SURFACES.reduce((t, s) => t + s.top * s.weight, 0)),
  leader: { brand: "Bounty", top: 51 },
}

/** Points of top positions each input holds back, and what they're worth at today's sales per point. */
const PER_POINT = TOTAL.est / RANK.top
export const INPUTS = [
  { id: "findable", name: "Findable", what: "Attributes and page content answer the intents", points: 9 },
  { id: "unified", name: "Unified", what: "Same facts and claims on every retailer", points: 4 },
  { id: "shoppable", name: "Shoppable", what: "In stock, buy box, price per unit", points: 3 },
  { id: "trusted", name: "Trusted", what: "Ratings, reviews, supportable claims", points: 2 },
].map((i) => ({ ...i, value: Math.round((i.points * PER_POINT) / 10) * 10 }))



export const pct = (v: number, of: number) => Math.round((v / of) * 100)

/** Amazon's five intent groups (COSMO, SIGMOD 2024), in shopper words. */
export const GROUPS = [
  { id: "function", name: "What it does" },
  { id: "audience", name: "Who it's for" },
  { id: "context", name: "When and where it's used" },
  { id: "kind", name: "What kind of product" },
  { id: "pairs", name: "What shoppers value with it" },
] as const
export type GroupId = (typeof GROUPS)[number]["id"]

/** What shoppers want. demand = category AI-driven sales routed by this want, $K a month. focus = the brand chose to own it. */
export const INTENTS = [
  { id: "wet", group: "function", name: "Holds up when wet", demand: 1480, focus: true },
  { id: "spills", group: "function", name: "Soaks up big spills", demand: 1320, focus: false },
  { id: "square", group: "function", name: "Tear off a small sheet", demand: 610, focus: true },
  { id: "pets", group: "audience", name: "Homes with pets", demand: 840, focus: true },
  { id: "kids", group: "audience", name: "Families with kids", demand: 720, focus: false },
  { id: "grease", group: "context", name: "Kitchen grease and cooking", demand: 690, focus: false },
  { id: "garage", group: "context", name: "Garage and workshop jobs", demand: 380, focus: true },
  { id: "bulk", group: "kind", name: "Bulk pack, low price per sheet", demand: 1560, focus: false },
  { id: "recycled", group: "pairs", name: "Recycled or sustainable fiber", demand: 420, focus: false },
] as const
export type IntentId = (typeof INTENTS)[number]["id"]

export const AGENT_SHORT = ["Alexa", "Sparky", "ChatGPT", "Muse"] as const
export type AgentShort = (typeof AGENT_SHORT)[number]

export type Status = "meets" | "missing" | "conflict"

/** One product's attribute record, as each retailer shows it. null = not shown. */
export type Record_ = Record<Retailer, string | null>

export type Product = {
  id: string
  name: string
  brand: string
  ours: boolean
  attributes: { name: string; values: Record_ }[]
  /** Per intent: status, which agents name the product for it, and the gap behind a miss. */
  intents: Partial<Record<IntentId, { status: Status; named: AgentShort[]; gap?: string; fix?: string; value?: number; retailers?: Retailer[] }>>
}

const A = (amazon: string | null, walmart: string | null, kroger: string | null): Record_ => ({ Amazon: amazon, Walmart: walmart, Kroger: kroger })

export const PRODUCTS: Product[] = [
  {
    id: "br-tear",
    name: "Brawny Tear-A-Square, 12 Double rolls",
    brand: "Brawny",
    ours: true,
    attributes: [
      { name: "Pack count", values: A("12 Double rolls", "12 Double rolls", "6 Double rolls") },
      { name: "Sheets per roll", values: A("120", "120", null) },
      { name: "Sheet size", values: A("Quarter, half, full", "Quarter, half, full", "Half, full") },
      { name: "Wet strength", values: A(null, null, null) },
      { name: "Price per 100 sheets", values: A("$1.62", "$1.55", "$3.42") },
      { name: "Pet use", values: A(null, null, null) },
    ],
    intents: {
      wet: { status: "missing", named: [], gap: "No wet-strength attribute or claim on any retailer", fix: "Add tested wet-strength claim to attributes and bullet 1", value: 38, retailers: ["Amazon", "Walmart", "Kroger"] },
      square: { status: "meets", named: ["Alexa", "Sparky", "ChatGPT"] },
      pets: { status: "missing", named: [], gap: "Reviews mention pet messes 410 times; listing never does", fix: "Add pet-mess use case to bullets and Q&A", value: 24, retailers: ["Amazon", "Walmart", "Kroger"] },
      bulk: { status: "conflict", named: ["Sparky"], gap: "Kroger shows 6 Double rolls for the 12-roll pack, so price per sheet reads 2x higher", fix: "Correct pack count and sheets per roll on Kroger", value: 19, retailers: ["Kroger"] },
      spills: { status: "meets", named: ["Alexa"] },
    },
  },
  {
    id: "br-pick",
    name: "Brawny Pick-A-Size, 6 Triple rolls",
    brand: "Brawny",
    ours: true,
    attributes: [
      { name: "Pack count", values: A("6 Triple rolls", "6 Triple rolls", "6 Triple rolls") },
      { name: "Sheets per roll", values: A("165", "165", "165") },
      { name: "Sheet size", values: A("Half, full", "Half, full", "Half, full") },
      { name: "Wet strength", values: A("Strong when wet", null, null) },
      { name: "Price per 100 sheets", values: A("$1.48", "$1.44", "$1.59") },
      { name: "Pet use", values: A(null, null, null) },
    ],
    intents: {
      wet: { status: "conflict", named: ["Alexa"], gap: "Wet-strength claim on Amazon only", fix: "Syndicate the wet-strength claim to Walmart and Kroger", value: 21, retailers: ["Walmart", "Kroger"] },
      kids: { status: "missing", named: [], gap: "No family or kid-mess use case on any retailer", fix: "Add family-mess use case and a Q&A answer", value: 12, retailers: ["Amazon", "Walmart", "Kroger"] },
      bulk: { status: "meets", named: ["Alexa", "Sparky"] },
      grease: { status: "missing", named: [], gap: "Kitchen and grease use not stated", fix: "Add kitchen grease use to bullet 3", value: 9, retailers: ["Amazon", "Walmart", "Kroger"] },
    },
  },
  {
    id: "br-shop",
    name: "Brawny Industrial Shop Towels, 3 rolls",
    brand: "Brawny",
    ours: true,
    attributes: [
      { name: "Pack count", values: A("3 rolls", "3 rolls", null) },
      { name: "Sheets per roll", values: A("55", "55", null) },
      { name: "Sheet size", values: A("Full", "Full", null) },
      { name: "Wet strength", values: A("Solvent and oil resistant", "Solvent and oil resistant", null) },
      { name: "Price per 100 sheets", values: A("$6.10", "$5.90", null) },
      { name: "Pet use", values: A(null, null, null) },
    ],
    intents: {
      garage: { status: "meets", named: ["Alexa", "ChatGPT"] },
      grease: { status: "meets", named: ["ChatGPT"] },
      wet: { status: "meets", named: ["Alexa"] },
    },
  },
  {
    id: "bo-select",
    name: "Bounty Select-A-Size, 12 Double rolls",
    brand: "Bounty",
    ours: false,
    attributes: [
      { name: "Pack count", values: A("12 Double rolls", "12 Double rolls", "12 Double rolls") },
      { name: "Sheets per roll", values: A("90", "90", "90") },
      { name: "Sheet size", values: A("Half, full", "Half, full", "Half, full") },
      { name: "Wet strength", values: A("Strong when wet", "Strong when wet", "Strong when wet") },
      { name: "Price per 100 sheets", values: A("$2.05", "$1.98", "$2.11") },
      { name: "Pet use", values: A("Pet messes", "Pet messes", null) },
    ],
    intents: {
      wet: { status: "meets", named: ["Alexa", "Sparky", "ChatGPT", "Muse"] },
      spills: { status: "meets", named: ["Alexa", "Sparky", "ChatGPT", "Muse"] },
      pets: { status: "meets", named: ["Alexa", "ChatGPT"] },
      kids: { status: "meets", named: ["Alexa", "Sparky"] },
      square: { status: "meets", named: ["Sparky"] },
    },
  },
  {
    id: "vi-multi",
    name: "Viva Multi-Surface Cloth, 6 Big rolls",
    brand: "Viva",
    ours: false,
    attributes: [
      { name: "Pack count", values: A("6 Big rolls", "6 Big rolls", "6 Big rolls") },
      { name: "Sheets per roll", values: A("81", "81", "81") },
      { name: "Sheet size", values: A("Full", "Full", "Full") },
      { name: "Wet strength", values: A("Cloth-like when wet", "Cloth-like when wet", null) },
      { name: "Price per 100 sheets", values: A("$2.20", "$2.12", "$2.30") },
      { name: "Pet use", values: A(null, null, null) },
    ],
    intents: {
      wet: { status: "meets", named: ["ChatGPT"] },
      grease: { status: "meets", named: ["Alexa", "ChatGPT"] },
      recycled: { status: "missing", named: [] },
    },
  },
  {
    id: "gv-bulk",
    name: "Great Value Ultra Strong, 12 Double rolls",
    brand: "Great Value",
    ours: false,
    attributes: [
      { name: "Pack count", values: A(null, "12 Double rolls", null) },
      { name: "Sheets per roll", values: A(null, "132", null) },
      { name: "Sheet size", values: A(null, "Half, full", null) },
      { name: "Wet strength", values: A(null, null, null) },
      { name: "Price per 100 sheets", values: A(null, "$1.12", null) },
      { name: "Pet use", values: A(null, null, null) },
    ],
    intents: {
      bulk: { status: "meets", named: ["Sparky", "ChatGPT", "Muse"] },
      spills: { status: "meets", named: ["Sparky"] },
    },
  },
]

export const RETAILERS = META.retailers

/** The brand's fixes, from its gaps and conflicts, ranked by projected value. */
export const FIXES = PRODUCTS.filter((p) => p.ours)
  .flatMap((p) =>
    Object.entries(p.intents)
      .filter(([, v]) => v && v.status !== "meets" && v.fix)
      .map(([intent, v]) => ({
        id: `${p.id}-${intent}`,
        product: p.name,
        productId: p.id,
        intent: INTENTS.find((i) => i.id === intent)!.name,
        fix: v!.fix!,
        value: v!.value ?? 0,
        retailers: v!.retailers ?? [],
        autonomy: v!.status === "conflict" ? ("autopilot" as const) : intent === "wet" ? ("input" as const) : ("approval" as const),
      })),
  )
  .sort((a, b) => b.value - a.value)
