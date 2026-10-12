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

/** Weekly retailer sales across Amazon, Walmart and Target, $M. */
export const WEEKS = ["Jul 20", "Jul 27", "Aug 3", "Aug 10", "Aug 17", "Aug 24", "Aug 31", "Sep 7", "Sep 14", "Sep 21", "Sep 28", "Oct 5"]
export const SALES = [5.1, 5.3, 5.2, 5.6, 6.0, 6.8, 7.9, 9.1, 10.6, 12.4, 14.2, 16.0]

export type SourceId = "search" | "agents" | "answer" | "autonomous"

/** The four places shoppers find candy, each with the share metric native to it. null = not tracked that week. */
export const SOURCES: { id: SourceId; name: string; examples: string; metric: string; series: (number | null)[] }[] = [
  {
    id: "search",
    name: "Retailer search",
    examples: "Amazon, Walmart, Target search",
    metric: "Share of voice",
    series: [28, 28.4, 28.1, 28.9, 29.5, 30.7, 32.1, 33.3, 34.9, 36.3, 37.8, 39.0],
  },
  {
    id: "agents",
    name: "Retail shopping agents",
    examples: "Alexa for Shopping, Sparky",
    metric: "AI share of voice",
    series: [18, 18.3, 18.5, 18.6, 19.1, 19.5, 20.6, 21.2, 22.6, 23.6, 25.2, 26.5],
  },
  {
    id: "answer",
    name: "Answer agents",
    examples: "ChatGPT, Gemini, Perplexity, Claude",
    metric: "AI visibility",
    series: [31, 30.7, 31.1, 31.7, 31.9, 32.8, 33.3, 34.3, 34.6, 35.8, 36.4, 36.8],
  },
  {
    id: "autonomous",
    name: "Autonomous shopping agents",
    examples: "Muse, Instinct",
    metric: "AI visibility",
    series: [null, null, null, null, null, null, null, null, 19, 22, 21, 24],
  },
]

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
 * Tries same week and share leading sales by one week; reports the stronger.
 */
export function correlation(series: (number | null)[]): { weeks: number; r?: number; lead?: 0 | 1 } {
  const idx = series.map((v, i) => (v == null ? -1 : i)).filter((i) => i >= 0)
  const weeks = idx.length
  if (weeks < MIN_WEEKS) return { weeks }
  const share = idx.map((i) => series[i] as number)
  const sales = idx.map((i) => SALES[i])
  const ds = diffs(share)
  const dS = diffs(sales)
  const same = pearson(ds, dS)
  const leading = pearson(ds.slice(0, -1), dS.slice(1))
  return leading > same ? { weeks, r: leading, lead: 1 } : { weeks, r: same, lead: 0 }
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

/** Brand share by source, latest week, %. Hershey's row must equal the last value of each SOURCES series (checked in the view). */
export const BRANDS = ["Hershey's", "Mars", "Ferrero", "Mondelez"] as const
export const BRAND_SHARE: Record<(typeof BRANDS)[number], Record<SourceId, number>> = {
  "Hershey's": { search: 39, agents: 27, answer: 37, autonomous: 24 },
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
