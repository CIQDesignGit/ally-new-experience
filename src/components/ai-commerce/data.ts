/**
 * AI Commerce v1 (measurement), Hershey's candy, Halloween. ILLUSTRATIVE numbers:
 * a real brand, made-up data, for the PRD demo only. Keep local; not for Vercel.
 * One source of truth: every total and correlation on the page is derived from
 * these series, never hand-typed (see docs/PRD-ai-commerce.md).
 */

export const META = {
  brand: "Hershey's",
  category: "Halloween candy",
  retailers: "Amazon, Walmart, Target",
  prompts: 48,
  runsPerWeek: 10,
  asOf: "Week of Oct 5",
}

/** Weekly retailer sales, $M. The total is the sum of the three retailers. */
export const WEEKS = ["Jul 20", "Jul 27", "Aug 3", "Aug 10", "Aug 17", "Aug 24", "Aug 31", "Sep 7", "Sep 14", "Sep 21", "Sep 28", "Oct 5"]
export type RetailerId = "amazon" | "walmart" | "target"
export const RETAILER_SALES: Record<RetailerId, number[]> = {
  amazon: [2.29,  2.38,  2.39,  2.52,  2.7,  2.99,  3.48,  4.0,  4.56,  5.33,  5.96,  6.72],
  walmart: [1.94,  2.02,  1.93,  2.13,  2.28,  2.65,  3.08,  3.55,  4.24,  4.96,  5.83,  6.56],
  target: [0.87,  0.9,  0.88,  0.95,  1.02,  1.16,  1.34,  1.55,  1.8,  2.11,  2.41,  2.72],
}
export const SALES = WEEKS.map((_, i) => +(RETAILER_SALES.amazon[i] + RETAILER_SALES.walmart[i] + RETAILER_SALES.target[i]).toFixed(2))
export const RETAILER_NAME: Record<RetailerId, string> = { amazon: "Amazon", walmart: "Walmart", target: "Target" }

export type SourceId = "search" | "agents" | "answer" | "autonomous"

/** The four places shoppers find candy, each with the share metric native to it. */
export const SOURCES: { id: SourceId; name: string; metric: string }[] = [
  { id: "search", name: "Retailer search", metric: "Share of voice" },
  { id: "agents", name: "Retail shopping agents", metric: "AI share of voice" },
  { id: "answer", name: "Answer agents", metric: "AI visibility" },
  { id: "autonomous", name: "Autonomous shopping agents", metric: "AI visibility" },
]

/**
 * Each surface: its source, its share of the source's shopper demand (the rollup
 * weight), the retailer whose sales it's compared with (null = total sales), how
 * it's measured, the week-by-week series (null = not tracked yet) and its leader.
 */
export const SURFACES: { id: string; name: string; source: SourceId; weight: number; retailer: RetailerId | null; basis: string; series: (number | null)[]; leader: { brand: string; share: number } }[] = [
  { id: "amazon-search", name: "Amazon search", source: "search", weight: 0.48, retailer: "amazon", basis: "Crawled 4× a day", series: [30,  29.9,  30.0,  30.1,  30.7,  31.6,  32.2,  32.9,  34.7,  36.3,  37.5,  40.0], leader: { brand: "Mars", share: 42 } },
  { id: "walmart-search", name: "Walmart search", source: "search", weight: 0.36, retailer: "walmart", basis: "Crawled 4× a day", series: [27,  26.7,  25.7,  26.0,  25.8,  26.0,  27.0,  29.1,  31.6,  34.1,  35.9,  38.0], leader: { brand: "Mars", share: 41 } },
  { id: "target-search", name: "Target search", source: "search", weight: 0.16, retailer: "target", basis: "Crawled daily", series: [22,  22.2,  22.2,  22.7,  23.2,  23.8,  24.7,  25.2,  26.1,  27.5,  28.6,  30.0], leader: { brand: "Hershey's", share: 30 } },
  { id: "alexa", name: "Alexa for Shopping", source: "agents", weight: 0.6, retailer: "amazon", basis: "480 runs a week", series: [17,  17.6,  18.0,  18.3,  18.4,  18.4,  19.7,  20.8,  22.3,  23.9,  25.6,  27.0], leader: { brand: "Mars", share: 34 } },
  { id: "sparky", name: "Sparky", source: "agents", weight: 0.4, retailer: "walmart", basis: "480 runs a week", series: [18,  17.8,  16.5,  17.5,  16.8,  18.1,  19.0,  19.3,  21.4,  22.4,  24.9,  26.0], leader: { brand: "Mars", share: 31 } },
  { id: "chatgpt", name: "ChatGPT", source: "answer", weight: 0.45, retailer: null, basis: "480 runs a week", series: [32,  31.5,  32.5,  32.1,  32.8,  32.7,  32.9,  34.6,  35.0,  36.2,  37.1,  38.0], leader: { brand: "Mars", share: 46 } },
  { id: "gemini", name: "Gemini", source: "answer", weight: 0.2, retailer: null, basis: "480 runs a week", series: [29,  28.8,  28.7,  27.9,  29.7,  29.0,  30.0,  32.5,  32.6,  34.2,  36.0,  36.0], leader: { brand: "Mars", share: 42 } },
  { id: "aimode", name: "Google AI Mode", source: "answer", weight: 0.15, retailer: null, basis: "480 runs a week", series: [30,  30.1,  30.1,  30.4,  30.3,  31.3,  32.3,  33.2,  33.4,  34.2,  34.6,  35.0], leader: { brand: "Mars", share: 43 } },
  { id: "perplexity", name: "Perplexity", source: "answer", weight: 0.12, retailer: null, basis: "480 runs a week", series: [27,  26.8,  27.2,  28.4,  28.8,  29.4,  30.2,  30.2,  31.2,  32.4,  34.1,  34.0], leader: { brand: "Mars", share: 40 } },
  { id: "claude", name: "Claude", source: "answer", weight: 0.08, retailer: null, basis: "480 runs a week", series: [25,  25.0,  25.4,  26.1,  25.2,  24.1,  24.2,  24.0,  25.6,  27.0,  28.0,  29.0], leader: { brand: "Ferrero", share: 33 } },
  { id: "muse", name: "Muse", source: "autonomous", weight: 0.6, retailer: null, basis: "96 runs a week", series: [null, null, null, null, null, null, null, null, 20, 23, 22, 25], leader: { brand: "Ferrero", share: 32 } },
  { id: "instinct", name: "Instinct", source: "autonomous", weight: 0.4, retailer: null, basis: "96 runs a week", series: [null, null, null, null, null, null, null, null, 17, 20, 19, 22], leader: { brand: "Ferrero", share: 29 } },
]

/** A source's share each week: the demand-weighted average of its surfaces. Derived, never typed. */
export function sourceSeries(id: SourceId): (number | null)[] {
  const parts = SURFACES.filter((s) => s.source === id)
  return WEEKS.map((_, i) => {
    const live = parts.filter((p) => p.series[i] != null)
    if (live.length === 0) return null
    const w = live.reduce((t, p) => t + p.weight, 0)
    return +(live.reduce((t, p) => t + (p.series[i] as number) * p.weight, 0) / w).toFixed(1)
  })
}

/** Fewest weeks of overlap before a correlation is shown. */
export const MIN_WEEKS = 8

/** Pearson correlation. */
function pearson(a: number[], b: number[]) {
  const n = a.length
  const ma = a.reduce((s, x) => s + x, 0) / n
  const mb = b.reduce((s, x) => s + x, 0) / n
  let num = 0
  let da = 0
  let db = 0
  for (let i = 0; i < n; i++) {
    num += (a[i] - ma) * (b[i] - mb)
    da += (a[i] - ma) ** 2
    db += (b[i] - mb) ** 2
  }
  return num / Math.sqrt(da * db)
}

const diffs = (s: number[]) => s.slice(1).map((x, i) => x - s[i])

/**
 * How closely a source's share moves with sales, on week-over-week changes
 * (Halloween lifts everything, so raw levels would just measure the season).
 * Tries same week and share leading sales by one week.
 */
export function correlation(series: (number | null)[], against: number[] = SALES): { weeks: number; r?: number; lead?: 0 | 1 } {
  const idx = series.map((v, i) => (v == null ? -1 : i)).filter((i) => i >= 0)
  const weeks = idx.length
  if (weeks < MIN_WEEKS) return { weeks }
  const share = idx.map((i) => series[i] as number)
  const sales = idx.map((i) => against[i])
  const ds = diffs(share)
  const dS = diffs(sales)
  const same = pearson(ds, dS)
  const leading = pearson(ds.slice(0, -1), dS.slice(1))
  // Same week unless share leading sales is clearly stronger (0.1 or more).
  return leading - same >= 0.1 ? { weeks, r: leading, lead: 1 } : { weeks, r: same, lead: 0 }
}

/** Plain-language strength of a correlation. */
export const strength = (r: number) => (r >= 0.7 ? "Strong" : r >= 0.4 ? "Moderate" : r >= 0.2 ? "Weak" : "None yet")

/** Where answer agents link shoppers when they recommend a candy product (share of recommendation links). */
export const RETAILER_LINKS = [
  { retailer: "Walmart", share: 46 },
  { retailer: "Amazon", share: 31 },
  { retailer: "Target", share: 15 },
  { retailer: "Other", share: 8 },
]

/** Recommended SKUs whose shelf breaks at the retailer the agent links to. $K a week of AI-sent demand at risk. */
export const LEAKS = [
  {
    id: "variety-walmart",
    sku: "Hershey's Halloween Snack Size Variety Bag, 150 pc",
    agent: "ChatGPT and Perplexity · 9 prompts",
    retailer: "Walmart",
    issue: "Out of stock 6 days",
    atRisk: 84,
    deadline: "Halloween in 19 days",
    owner: "Ops agent",
  },
  {
    id: "twizzlers-amazon",
    sku: "Twizzlers Twists Halloween, 105 pc",
    agent: "Alexa for Shopping · 5 prompts",
    retailer: "Amazon",
    issue: "3P seller holds the buy box at +18%",
    atRisk: 31,
    deadline: "Halloween in 19 days",
    owner: "Ops agent",
  },
  {
    id: "reeses-target",
    sku: "Reese's Snack Size, 24 oz",
    agent: "Gemini · 4 prompts",
    retailer: "Target",
    issue: "Priced 14% above the median competitor",
    atRisk: 18,
    deadline: null,
    owner: "Pricing decision (your team)",
  },
]

/** Brand share by source, latest week, %. Hershey's row is the rollup of its surfaces, so it always ties. */
export const BRANDS = ["Hershey's", "Mars", "Ferrero", "Mondelez"] as const
const ours = (id: SourceId) => Math.round(sourceSeries(id).filter((v): v is number => v != null).at(-1) ?? 0)
export const BRAND_SHARE: Record<(typeof BRANDS)[number], Record<SourceId, number>> = {
  "Hershey's": { search: ours("search"), agents: ours("agents"), answer: ours("answer"), autonomous: ours("autonomous") },
  Mars: { search: 41, agents: 33, answer: 44, autonomous: 28 },
  Ferrero: { search: 12, agents: 19, answer: 21, autonomous: 31 },
  Mondelez: { search: 8, agents: 21, answer: 18, autonomous: 17 },
}

/** Shopper needs inside candy prompts: monthly retailer search demand ($M) and Hershey's AI visibility in answer agents. */
export const NEEDS = [
  { id: "bulk", need: "Bulk variety bags", demand: 6.8, growth: "+22%", ours: 38, leader: "Mars", leaderShare: 41, gap: "Piece count missing from 3 titles" },
  { id: "wrapped", need: "Individually wrapped", demand: 3.4, growth: "+9%", ours: 44, leader: "Hershey's", leaderShare: 44, gap: null },
  { id: "nutfree", need: "Nut-free for school", demand: 2.1, growth: "+200%", ours: 8, leader: "Mondelez", leaderShare: 46, gap: "Twizzlers and Jolly Rancher pages don't say nut-free" },
  { id: "nonchoc", need: "Non-chocolate", demand: 1.9, growth: "+15%", ours: 18, leader: "Ferrero", leaderShare: 49, gap: "Jolly Rancher rarely recommended" },
  { id: "nomelt", need: "Won't melt in shipping", demand: 0.8, growth: "+31%", ours: 6, leader: "Mondelez", leaderShare: 31, gap: "No shipping or heat claims on any page" },
]

/** Tracked prompts, losing first: Hershey's recommendation rate vs the leader across answer agents (40 runs a week). */
export const PROMPTS = [
  { q: "best nut free halloween candy for a school party", need: "Nut-free for school", ours: 8, leader: "Sour Patch Kids", leaderRate: 52, link: "Target" },
  { q: "candy that won't melt when shipped", need: "Won't melt in shipping", ours: 6, leader: "Swedish Fish", leaderRate: 31, link: "Amazon" },
  { q: "non chocolate halloween candy kids like", need: "Non-chocolate", ours: 18, leader: "Nerds", leaderRate: 49, link: "Walmart" },
  { q: "cheapest halloween candy per piece", need: "Bulk variety bags", ours: 21, leader: "Mars variety pack", leaderRate: 33, link: "Walmart" },
  { q: "bulk halloween candy for trick or treaters", need: "Bulk variety bags", ours: 38, leader: "Mars variety pack", leaderRate: 41, link: "Walmart" },
  { q: "individually wrapped candy for the office", need: "Individually wrapped", ours: 44, leader: "Hershey's", leaderRate: 44, link: "Amazon" },
]
