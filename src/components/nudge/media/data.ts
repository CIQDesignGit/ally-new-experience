import type { Tier } from "../model"

/**
 * James's media work, and the loop between content and media. Every value here
 * is a slice of one of Claire's three media rows, so nothing new is added:
 *   One approval away  $560K = fund content's keywords + Winter Hearth launch + rebalance categories
 *   Needs your input  $1.04M = the plan for $500K of new budget
 *   On autopilot       $500K = bids and pacing + keyword harvesting + spend held on pages content is fixing
 *
 * Both agents read and write one keyword ledger: content adds the keywords that
 * are trending and important in a category, media funds them; where organic rank
 * is already strong and paid adds little, media pulls back and moves the money.
 */
export type MediaPlay = "Build" | "Launch" | "Rebalance" | "Budget" | "Pacing" | "Harvest" | "Protect" | "Negative"

export interface MediaChange {
  what: string
  from: string
  to: string
  why: string
}

export interface MediaBatch {
  id: string
  tier: Tier
  play: MediaPlay
  name: string
  /** $M of incremental sales this quarter. */
  value: number
  count: number
  noun: string
  /** What Ally found, as fragments. */
  found: string[]
  /** What Ally does when it runs. */
  does: string[]
  /** The changes, a few shown. */
  changes?: MediaChange[]
  /** Spend moved or committed, shown beside the value. */
  spend?: string
  /** Waits on content: shown until that content batch is approved. */
  waitsOn?: { batch: string; waiting: string; ready: string }
  /** Dated steps, for plays that switch on and off with content. */
  timeline?: { date: string; text: string }[]
  /** Primary action, and what the row says once it's done. */
  cta?: string
  doneLabel?: string
}

/** Marginal return on the next dollar: lower than the $3.01 average, because the best keywords are already funded. */
export const MARGINAL_IROAS = 2.08

/** Where the $500K of new budget goes: spend ($K) and incremental sales ($K) per line, summing to the plan's $1.04M. */
export const BUDGET_PLAN = [
  { where: "Keywords content added to the Halloween pages, share of voice under 15%", spend: 180, sales: 468, iroas: 2.6 },
  { where: "Winter Hearth launch, Nov 9–30, tapering as organic rank holds", spend: 120, sales: 252, iroas: 2.1 },
  { where: "Gift sets, underpacing ahead of holiday gifting", spend: 140, sales: 238, iroas: 1.7 },
  { where: "New-to-brand shoppers on sponsored display", spend: 60, sales: 82, iroas: 1.37 },
] as const
export const BUDGET_TOTAL = BUDGET_PLAN.reduce((s, r) => s + r.spend, 0)
export const BUDGET_SALES = BUDGET_PLAN.reduce((s, r) => s + r.sales, 0)

export const MEDIA_BATCHES: MediaBatch[] = [
  {
    id: "media-build",
    tier: "approval",
    play: "Build",
    name: "Fund the keywords content added",
    value: 0.21,
    count: 14,
    noun: "keywords",
    spend: "+$6K a week",
    found: ["14 trending keywords added to Mike's Halloween pages and gift sets", "Share of voice 6–14% on them", "Brightwick holds 7 of 12 sponsored slots"],
    does: ["Raises bids until share of voice reaches 25%", "Caps spend at $6K a week", "Pauses them Nov 1, when the pages revert"],
    timeline: [
      { date: "Oct 26", text: "Pages live · 14 keywords on, bids up" },
      { date: "Oct 31", text: "Halloween" },
      { date: "Nov 1", text: "Pages revert · keywords paused · $6K a week moves to gift sets" },
    ],
    changes: [
      { what: "spooky party décor", from: "$0.62", to: "$0.95", why: "Share of voice 9%" },
      { what: "boo basket", from: "$0.80", to: "$1.20", why: "Share of voice 6%" },
      { what: "fall centerpiece", from: "$0.55", to: "$0.78", why: "Share of voice 14%" },
    ],
    waitsOn: { batch: "halloween", waiting: "Goes live with Mike's Halloween pages", ready: "Mike approved the pages · ready to fund" },
    cta: "Approve 14 keywords",
    doneLabel: "Approved",
  },
  {
    id: "media-launch",
    tier: "approval",
    play: "Launch",
    name: "Winter Hearth launch campaigns",
    value: 0.19,
    count: 3,
    noun: "SKUs",
    spend: "$30K, Nov 9 – Dec 15",
    found: ["3 new SKUs launch Nov 9", "42 keywords in the new pages' copy", "No organic rank yet"],
    does: ["DSP awareness campaign for winter-gift shoppers, $12K", "Adds the 3 SKUs to 4 search campaigns, $18K", "Ramps for 2 weeks, then tapers as organic rank holds"],
    changes: [
      { what: "DSP · winter-gift shoppers", from: "—", to: "$12K", why: "Reach before the Winter Market, Nov 13–15" },
      { what: "Search · Brand, Jar candles, Gift sets, Winter scents", from: "—", to: "+3 SKUs", why: "42 keywords from the new copy" },
      { what: "Daily budget, search", from: "—", to: "$850", why: "Ramps to $1,200 for the Winter Market" },
    ],
    waitsOn: { batch: "concepts", waiting: "Waits for Mike's Winter Hearth pages", ready: "Mike's pages are approved · ready to launch" },
    cta: "Approve the campaigns",
    doneLabel: "Approved",
  },
  {
    id: "media-rebalance",
    tier: "approval",
    play: "Rebalance",
    name: "Move budget from large jars to gift sets",
    value: 0.16,
    count: 2,
    noun: "categories",
    spend: "$24K moved",
    found: ["Large jars 34% spent, 26% of October gone", "Gift sets 15% spent", "Gift-set searches up 38% week over week"],
    does: ["Moves $24K of October budget to gift sets", "Keeps large jars on pace for the month"],
    changes: [
      { what: "Large jars, October", from: "$90K", to: "$66K", why: "Overpacing" },
      { what: "Gift sets, October", from: "$60K", to: "$84K", why: "Underpacing, demand rising" },
    ],
    cta: "Approve the move",
    doneLabel: "Approved",
  },
  {
    id: "media-plan",
    tier: "input",
    play: "Budget",
    name: "Plan for $500K of new budget",
    value: 1.04,
    count: 4,
    noun: "lines",
    spend: "$500K",
    found: ["$500K unlocked for Q4", `Next dollar returns $${MARGINAL_IROAS.toFixed(2)}, vs your $3.01 average`, "Held back from 7 SKUs whose pages content is fixing"],
    does: ["Splits it across 4 lines", "Projects $1.04M in incremental sales", "Needs your OK on the split"],
    cta: "Review the plan",
    doneLabel: "Plan approved",
  },
  {
    id: "media-bids",
    tier: "autopilot",
    play: "Pacing",
    name: "Bids and budget pacing",
    value: 0.23,
    count: 1400,
    noun: "keywords",
    found: ["Every keyword, every hour", "Large jars and travel tins pacing to plan", "Wax melts underpacing"],
    does: ["Adjusts bids on incremental return", "Trims overpacing categories daily", "Raises bids where a category underpaces"],
  },
  {
    id: "media-harvest",
    tier: "autopilot",
    play: "Harvest",
    name: "Keyword harvesting",
    value: 0.16,
    count: 38,
    noun: "keywords",
    spend: "$21K a week moved",
    found: ["38 keywords ranking top 3 organically", "Paid return under $1.20 on them", "Paid is buying sales you'd get anyway"],
    does: ["Cuts bids 40% on them", "Moves $21K a week to keywords content added", "Restores bids if organic rank slips"],
    changes: [
      { what: "aurelle candle", from: "$1.40", to: "$0.84", why: "Organic #1 · $0.90 return" },
      { what: "soy jar candle 16 oz", from: "$0.95", to: "$0.57", why: "Organic #2 · $1.10 return" },
      { what: "cedar candle", from: "$0.70", to: "$0.42", why: "Organic #3 · $1.15 return" },
    ],
  },
  {
    id: "media-protect",
    tier: "autopilot",
    play: "Protect",
    name: "Spend held on pages content is fixing",
    value: 0.09,
    count: 7,
    noun: "SKUs",
    spend: "$9K a week moved",
    found: ["7 SKUs convert at half the category rate", "Content agent found why: 2 images, no A+, thin bullets", "Mike's fixes go live Oct 12"],
    does: ["Lowers bids 50% on these 7 until the new pages are live", "Moves $9K a week to SKUs that convert", "Ramps back up the day the fixes go live"],
  },
  {
    id: "media-negative",
    tier: "autopilot",
    play: "Negative",
    name: "Negative keywords from reviews",
    value: 0.02,
    count: 2,
    noun: "SKUs",
    spend: "$1.8K a week moved",
    found: ["23 reviews on Cedar & Smoke and Coastal Linen say \"smoky\" or \"left soot\"", "Content agent took \"clean burning\" off their bullets", "Paid clicks on those terms ended in 1-star reviews"],
    does: ["Makes \"clean burning\" and \"soot free\" negative on those 2 SKUs only", "Keeps them on the SKUs where they convert", "Moves the spend to SKUs that convert"],
    changes: [
      { what: "clean burning · Cedar & Smoke, Coastal Linen", from: "Bidding", to: "Negative", why: "23 reviews: smoky, soot" },
      { what: "soot free · the same 2 SKUs", from: "Bidding", to: "Negative", why: "The page no longer claims it" },
    ],
  },
]

/** Claire's three media rows, from the batches. */
export const MEDIA_ITEMS = MEDIA_BATCHES.map((b) => ({ id: b.id, lever: "media" as const, tier: b.tier, value: b.value, skus: b.tier === "input" ? 1 : b.noun === "SKUs" ? b.count : 0 }))

/** One keyword in the ledger both agents read and write. */
export interface LedgerRow {
  keyword: string
  category: string
  /** Where it stands on the page: added by content this week, already on it, or missing. */
  onPage: "Added by content" | "On the page" | "Missing"
  organic: number | null
  sov: number
  iroas: number
  play: "Build" | "Harvest" | "Defend" | "Fix the page first" | "Add to the page" | "Negative"
  status: string
}

export const LEDGER: LedgerRow[] = [
  { keyword: "spooky party décor", category: "Halloween", onPage: "Added by content", organic: 31, sov: 9, iroas: 3.4, play: "Build", status: "Bids up when live" },
  { keyword: "boo basket", category: "Gift sets", onPage: "Added by content", organic: 44, sov: 6, iroas: 3.1, play: "Build", status: "Bids up when live" },
  { keyword: "fall centerpiece", category: "Halloween", onPage: "Added by content", organic: 22, sov: 14, iroas: 2.9, play: "Build", status: "Bids up when live" },
  { keyword: "clean burning candle", category: "Large jars", onPage: "Missing", organic: 58, sov: 11, iroas: 3.6, play: "Add to the page", status: "Queued for Mike's Halloween pages" },
  { keyword: "long lasting candle gift", category: "Gift sets", onPage: "Missing", organic: 63, sov: 8, iroas: 3.3, play: "Add to the page", status: "Queued for Mike's gift sets" },
  { keyword: "aurelle candle", category: "Brand", onPage: "On the page", organic: 1, sov: 41, iroas: 0.9, play: "Harvest", status: "Bid −40% · on autopilot" },
  { keyword: "soy jar candle 16 oz", category: "Large jars", onPage: "On the page", organic: 2, sov: 33, iroas: 1.1, play: "Harvest", status: "Bid −40% · on autopilot" },
  { keyword: "aurelle noir cherry", category: "Brand", onPage: "On the page", organic: 1, sov: 52, iroas: 2.4, play: "Defend", status: "Brightwick bidding on it · bids held" },
  { keyword: "coastal linen candle", category: "Large jars", onPage: "On the page", organic: 7, sov: 18, iroas: 0.8, play: "Fix the page first", status: "Page converts at half the category rate · bids held until Mike's fix" },
  { keyword: "soot free candle", category: "Large jars", onPage: "On the page", organic: 15, sov: 12, iroas: 0.4, play: "Negative", status: "Negative on Cedar & Smoke, Coastal Linen · on autopilot" },
]

/** Media's search terms that convert in ads but aren't on the page: sent to content. */
export const TO_CONTENT = LEDGER.filter((r) => r.play === "Add to the page")

/** The plays and when each applies: organic rank against what paid returns. */
export const PLAY_RULES: { play: LedgerRow["play"]; when: string; does: string }[] = [
  { play: "Build", when: "Weak organic rank, paid works", does: "Content adds it, media funds it" },
  { play: "Harvest", when: "Strong organic rank, paid adds little", does: "Bids down, money moves to Build" },
  { play: "Defend", when: "Strong organic rank, a competitor bids on your brand", does: "Bids held" },
  { play: "Fix the page first", when: "The page converts poorly; content is fixing it", does: "Bids held until the new page is live" },
  { play: "Add to the page", when: "Converts in ads, not on the page", does: "Sent to content" },
  { play: "Negative", when: "Reviews contradict the claim on a SKU", does: "Negative on those SKUs only" },
]

/** October budget by category: spend so far against how much of the month has gone (8 of 31 days, 26%). */
export const MONTH_GONE = 26
export const PACING = [
  { category: "Large jars", budget: 90, spent: 31, does: "Move $24K to gift sets", batch: "media-rebalance" },
  { category: "Gift sets", budget: 60, spent: 9, does: "Take $24K from large jars", batch: "media-rebalance" },
  { category: "Halloween", budget: 45, spent: 13, does: "On pace" },
  { category: "Travel tins", budget: 25, spent: 6, does: "On pace" },
  { category: "Wax melts", budget: 20, spent: 2, does: "Bids up on 18 keywords · on autopilot", batch: "media-bids" },
] as const

export function paceOf(budget: number, spent: number) {
  const pct = Math.round((spent / budget) * 100)
  const state = pct > MONTH_GONE + 5 ? "Overpacing" : pct < MONTH_GONE - 8 ? "Underpacing" : "On pace"
  return { pct, state }
}

/** Of media's delivered this quarter, the part from keywords content added: the loop's one number. */
export const LOOP_DELIVERED = 0.038

/**
 * Content and media together, Sep 7 – Oct 4: content added 12 keywords; organic
 * rank rose; media pulled back on the 9 that reached the top 3 and moved that
 * money to 22 starved keywords. Sales: organic +$118K, reinvested +$194K.
 */
export const TOGETHER = {
  period: "Sep 7 – Oct 4",
  keywords: 12,
  pages: 140,
  rank: { from: 31, to: 9 },
  organic: 118,
  harvested: 9,
  cpc: -22,
  freed: 21,
  starved: 22,
  moved: 84,
  newSales: 286,
  oldSales: 92,
  weekly: [62, 71, 84, 98],
  rows: [
    { keyword: "fall centerpiece candle", rank: "#31 → #3", bid: "$1.18 → $0.71", note: "Organic took over" },
    { keyword: "cozy autumn candle", rank: "#22 → #2", bid: "$0.94 → $0.56", note: "Organic took over" },
    { keyword: "spiced apple candle", rank: "#40 → #12", bid: "$1.06 → $1.06", note: "Still building · bids held" },
  ],
}
export const TOGETHER_REINVESTED = TOGETHER.newSales - TOGETHER.oldSales
export const TOGETHER_TOTAL = TOGETHER.organic + TOGETHER_REINVESTED
