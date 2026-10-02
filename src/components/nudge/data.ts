import { MOCK_SKUS } from "@/components/home/data"
import { SKU_ROWS } from "./sku-rows-data"
import type { AgentId, Batch, ClosedGrain, ClosedPeriodData, InflightData, NudgeKey, Period, TierRow } from "./types"
import { actedValue, daysUntil, expiring, money, openByLever, sum, tierRows, tierTotal } from "./model"
import type { Acted, Snapshot, Tier, WorkItem } from "./model"
import { TIERS, TIER_INFO, shipPlan } from "./policy"
import type { Policy, ReviewMode, SkuTier } from "./policy"
import { playById } from "./market"
import type { Play } from "./market"
import { LAUNCH, NEW_SKUS } from "./launch/data"

/**
 * Real numbers from the Ally_Home reference artifact — keep exactly as given.
 * The four example SKUs are real Aurelle catalog rows (the repo's only real
 * catalog); the mock's candle/water-bottle/cutting-board placeholders are
 * replaced with these, one per batch, per the handoff's "defer to the repo's
 * real SKU records" instruction.
 */
/** The demo's "today" and the one seasonal deadline in flight. Days to deadline are computed, never typed. */
export const AS_OF = "2026-10-08"
const HALLOWEEN_PUBLISH_BY = "2026-10-26"
/** Halloween's last day: seasonal sales stop landing after it. */
const HALLOWEEN = "2026-10-31"
/** Q4 FY26 runs Oct–Dec; FY26 ends with it. */
const QUARTER_END = "2026-12-31"
/** The Winter Hearth launch's pages are due before the Nov 9 launch. */
const LAUNCH_DUE = "2026-11-06"
const expiresChip = (iso: string) => `Expires in ${daysUntil(iso, AS_OF)} days`

export const BATCHES: Batch[] = [
  {
    id: "halloween",
    fixName: "Halloween title and image update",
    tier: "approval",
    type: "Seasonal",
    name: "Halloween jar candles",
    chip: expiresChip(HALLOWEEN_PUBLISH_BY),
    deadline: HALLOWEEN_PUBLISH_BY,
    nudgeKey: "approval-content",
    nudgeSource: "Emailed Monday 8:00 AM",
    skus: 378,
    reviewMinutes: 25,
    value: "$500K",
    approveSkus: 378,
    approveValue: 0.5,
    doneLabel: "378 published · $500K",
    split: {
      retailer: "Amazon",
      brand: "Aurelle Candles",
      skuGroup: "Jar candles",
      // Value follows share of sales (hero 48%, core 41%, tail 11%), not SKU count.
      tiers: { hero: { skus: 12, value: 0.24 }, core: { skus: 214, value: 0.205 }, tail: { skus: 152, value: 0.055 } },
      titleSkus: 372,
      imageSkus: 341,
    },
    rationale: "378 SKUs missing event titles, deal framing, and AEO specs. Publish by Oct 8.",
    exampleSkuId: "sku-1",
    before: "Aurelle Candles Noir Cherry Large Scented Jar, 22 oz",
    after:
      "Halloween Aurelle Candles Noir Cherry Large Scented Jar, 22 oz, Spooky Party Décor, 150-Hr Burn",
    changes: [
      { text: 'Added "Halloween" to the title', skus: 372 },
      { text: "Added trending keywords", detail: "spooky party décor, fall centerpiece, trick-or-treat", skus: 358 },
      { text: "Swapped to the customer-approved Halloween colors pack shot", skus: 341 },
      { text: "Created a deal bullet", detail: "Save 20% October 1–31 with the on-page coupon", skus: 378 },
    ],
    skuRows: SKU_ROWS.halloween,
  },
  {
    id: "gifts",
    fixName: "Halloween gift-set update",
    tier: "approval",
    type: "Seasonal",
    name: "Halloween gift sets",
    chip: expiresChip(HALLOWEEN_PUBLISH_BY),
    deadline: HALLOWEEN_PUBLISH_BY,
    nudgeKey: "approval-content",
    nudgeSource: "Emailed Monday 8:00 AM",
    skus: 331,
    reviewMinutes: 20,
    value: "$240K",
    approveSkus: 331,
    approveValue: 0.24,
    doneLabel: "331 published · $240K",
    split: {
      retailer: "Amazon",
      brand: "Aurelle Candles",
      skuGroup: "Gift sets",
      tiers: { hero: { skus: 8, value: 0.115 }, core: { skus: 180, value: 0.1 }, tail: { skus: 143, value: 0.025 } },
      titleSkus: 318,
      imageSkus: 287,
    },
    rationale: "331 gift sets and multi-packs with no Halloween gifting angle. Publish by Oct 8.",
    exampleSkuId: "sku-7",
    before: "Bergamot Grove Decorative Scented Pillar Candle Set",
    after: "Halloween Gift Bergamot Grove Decorative Scented Pillar Candle Set, Boo Basket Stuffer, Hostess Gift",
    changes: [
      { text: 'Added "Halloween gift" to the title', skus: 318 },
      { text: "Added trending keywords", detail: "boo basket, hostess gift, halloween gift for her", skus: 301 },
      { text: "Swapped to the customer-approved Halloween gift pack shot", skus: 287 },
      { text: "Created a deal bullet", detail: "Save 20% October 1–31 with the on-page coupon", skus: 331 },
    ],
    skuRows: SKU_ROWS.gifts,
  },
  {
    id: "concepts",
    fixName: "Launch creative needed",
    tier: "input",
    type: "New launch",
    inputSkus: 3,
    name: "Launch the Winter Hearth collection",
    chip: `Due ${LAUNCH.due}`,
    deadline: LAUNCH_DUE,
    nudgeSource: "Flagged by Ally, 2 days ago",
    skus: 3,
    reviewMinutes: 15,
    value: "$420K",
    approveSkus: 3,
    approveValue: 0.42,
    doneLabel: "Creative received · drafts in about an hour",
    rationale: `3 new SKUs launch ${LAUNCH.launch}. Ally needs the concept and launch facts before it can draft their pages. Pages due ${LAUNCH.due}.`,
    exampleSkuId: "sku-new-1",
    before: "",
    after: "",
    changesTitle: "What Ally does with the concept",
    changes: [
      { text: "Turns the one concept into each SKU's Amazon image set", detail: "Main image, lifestyle and infographic", skus: 3 },
      { text: "Localizes it for each SKU on Amazon", detail: "Main image on pure white, image size and title rules", skus: 3 },
      { text: "Drafts titles and bullets, then sends them back for one approval", skus: 3 },
    ],
    need: {
      text: "Each new SKU needs the agency's concept and the launch facts. Paste the brand team's email and attach the concept in Ask Ally, or upload a background here.",
      toast: "Concept sent to Ally. Drafts for 3 SKUs in about an hour.",
      cta: "Apply to all 3 SKUs",
    },
    skuRows: SKU_ROWS.concepts,
  },
  {
    id: "readiness",
    fixName: "Missing attributes for syndication",
    tier: "input",
    type: "Retail readiness",
    inputSkus: 21,
    name: "Listings blocked from syndication",
    chip: "No deadline",
    nudgeSource: "Flagged by Vendor Central, 3 days ago",
    skus: 94,
    reviewMinutes: 5,
    value: "$140K",
    approveSkus: 94,
    approveValue: 0.14,
    doneLabel: "94 unblocked · $140K",
    rationale: "94 SKUs that can't syndicate until their required attributes are filled.",
    exampleSkuId: "sku-4",
    before: "Country of origin: — · Item form: — · Age range: —",
    after: "Country of origin: United States · Item form: solid · Age range: adult",
    changes: [
      { text: "Filled 412 of 470 missing attributes automatically", detail: "From your spec sheets and PIM, nothing invented", skus: 94 },
      { text: "Ends search suppression as soon as the rest are filled", skus: 94 },
    ],
    need: {
      text: "We added 412 of 470 attributes on 94 SKUs automatically. The other 58, on 21 SKUs, need your team's input: country of origin, material and safety warnings.",
      toast: "Attributes sent to Ally. 94 SKUs unblock as they sync.",
    },
    skuRows: SKU_ROWS.readiness,
  },
  {
    id: "pim",
    tier: "autopilot",
    type: "Foundational",
    name: "PIM → PDP fixes",
    chip: "Running",
    nudgeSource: "On autopilot since Jul 1",
    skus: 412,
    reviewMinutes: 0,
    value: "$200K",
    approveSkus: 412,
    approveValue: 0.2,
    doneLabel: "Running on autopilot",
    rationale: "Any blank field on a listing is filled from your PIM, no approval needed.",
    exampleSkuId: "sku-5",
    before: "",
    after: "",
    changesTitle: "What Ally fills automatically",
    changes: [
      { text: "Adds images from PIM when a listing has fewer than 5", skus: 164 },
      { text: "Adds the PIM description when a listing has none", skus: 88 },
      { text: "Fills blank bullets from PIM", skus: 121 },
      { text: "Fills blank attributes from PIM", skus: 139 },
    ],
    need: {
      text: "Running on autopilot. When a field on the retailer's page is blank, Ally copies it from your PIM. Nothing for you to do.",
      toast: "",
    },
    skuRows: SKU_ROWS.pim,
  },
]

/** When SKUs the review policy puts on autopilot go live. */
const AUTOPILOT_GO_LIVE = "2026-10-15"
const shortDate = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })
const fmtPart = (v: number) => (v >= 1 ? `$${+v.toFixed(2)}M` : `$${Math.round(v * 1000)}K`)

/**
 * Mike's inbox under a review policy: each batch with a tier split is cut into
 * one item per mode, so every item has one action. Bulk keeps the batch id; the
 * one-by-one part is "<id>-review"; the autopilot part is "<id>-auto" and moves
 * to the autopilot band with its go-live date. No policy = the seed batches.
 */
export function contentBatches(policy?: Policy, launched: string[] = [], launchReady = false): Batch[] {
  const plays = launched.map(playById).filter((p): p is Play => !!p && p.owner === "content").map(playBatch)
  // Once the concept is in and drafted (use case 7), the launch waits one approval, not Mike's input.
  const seed = launchReady ? BATCHES.map((b) => (b.id === "concepts" ? { ...b, tier: "approval" as const, mode: "bulk" as const, doneLabel: "3 published · $420K", rationale: `Ally drafted the 3 new pages from the agency's concept. Approve to publish before ${LAUNCH.due}.` } : b)) : BATCHES
  if (!policy) return plays.length ? [...seed, ...plays] : seed
  const human: Batch[] = []
  const auto: Batch[] = []
  for (const b of seed) {
    if (!b.split || b.tier !== "approval") {
      human.push(b)
      continue
    }
    const plan = shipPlan(policy, { ...b.split, type: b.type })
    // The only tier in a part names it ("Hero", "Tail"); a mixed part goes unlabeled.
    const label = (m: ReviewMode) => {
      const tiers = TIERS.filter((t) => plan[m].byTier[t]) as SkuTier[]
      return tiers.length === 1 ? TIER_INFO[tiers[0]].label : undefined
    }
    const part = (m: ReviewMode, id: string, extra: Partial<Batch>): Batch => {
      const { skus, value } = plan[m]
      return {
        ...b,
        id,
        mode: m,
        partLabel: label(m),
        skus,
        approveSkus: skus,
        value: fmtPart(value),
        approveValue: value,
        doneLabel: `${skus} published · ${fmtPart(value)}`,
        changes: b.changes.map((c) => ({ ...c, skus: Math.round((c.skus * skus) / b.skus) })),
        ...extra,
      }
    }
    const rows = b.skuRows
    // One real SKU row stands in for the one-by-one part; the rest sample the bulk part.
    const reviewRows = plan.each.skus ? rows.slice(0, 1) : []
    const hero = plan.each.byTier.hero ?? 0
    const reassure = !plan.bulk.byTier.hero && hero ? `None of these are hero SKUs. Your ${hero} hero SKUs get reviewed one by one.` : undefined
    if (plan.bulk.skus) human.push(part("bulk", b.id, { skuRows: rows.slice(reviewRows.length), reassure }))
    if (plan.each.skus) human.push(part("each", `${b.id}-review`, { skuRows: reviewRows, reviewMinutes: plan.each.skus }))
    // Held back from autopilot: the same SKUs, one approval away until Mike approves them.
    if (plan.autopilot.skus && policy.holds?.includes(b.id))
      human.push(part("autopilot", `${b.id}-held`, { mode: "bulk", skuRows: rows.slice(-1), reviewMinutes: 5, nudgeSource: "Held from autopilot by you" }))
    else if (plan.autopilot.skus)
      auto.push(
        part("autopilot", `${b.id}-auto`, {
          tier: "autopilot",
          deadline: undefined,
          chip: `Goes live ${shortDate(AUTOPILOT_GO_LIVE)}`,
          reviewMinutes: 0,
          // A real SKU to check before it goes live.
          skuRows: rows.slice(-1),
          doneLabel: `Goes live ${shortDate(AUTOPILOT_GO_LIVE)} on autopilot`,
          need: {
            text: `Your review policy ships these ${plan.autopilot.skus} SKUs on autopilot on ${shortDate(AUTOPILOT_GO_LIVE)}. Nothing for you to do.`,
            toast: "",
          },
        }),
      )
  }
  return [...human, ...plays, ...auto]
}

/**
 * Michelle's inbox under a review policy: an ops item with a tier split is cut
 * like content (bulk keeps the id, one-by-one is "<id>-review"), each part with
 * its own SKUs' evidence. Ops has no autopilot parts: an escalation always has a sender.
 */
export function opsBatches(policy?: Policy): OpsBatch[] {
  if (!policy) return OPS_BATCHES
  return OPS_BATCHES.flatMap((b) => {
    if (!b.split || b.tier !== "approval") return [b]
    const plan = shipPlan(policy, b.split)
    const each = plan.each.skus
    const bulk = plan.bulk.skus + plan.autopilot.skus
    const tiersIn = (ids: SkuTier[]) => (b.sellerSkus ?? []).filter((x) => ids.includes(x.tier))
    const eachTiers = TIERS.filter((t) => plan.each.byTier[t]) as SkuTier[]
    // Only tiers that have SKUs in this item name it ("Core", not "Core and Tail" when tail is empty).
    const bulkTiers = TIERS.filter((t) => !eachTiers.includes(t) && b.split!.tiers[t].skus > 0) as SkuTier[]
    const label = (tiers: SkuTier[]) => (tiers.length === 1 ? TIER_INFO[tiers[0]].label : undefined)
    const part = (id: string, skus: number, value: number, mode: ReviewMode, tiers: SkuTier[], extra: Partial<OpsBatch> = {}): OpsBatch => {
      const perDay = value / OPS_DAYS_SAVED
      const own = tiersIn(tiers)
      // The part tells its own story: its SKU count, its daily loss, a lead example from its own SKUs.
      const lead = own.find((x) => x.asin === b.exampleSku) ?? own[0]
      return {
        ...b,
        id,
        mode,
        partLabel: label(tiers),
        skus,
        value: fmtPart(value),
        approveValue: value,
        sellerSkus: own,
        perDay,
        detected: b.detected.replace(`${b.skus} SKUs`, `${skus} ${skus === 1 ? "SKU" : "SKUs"}`),
        evidence: b.evidence.map((e, i) => {
          // The price line belongs to the lead SKU: rebuild it when this part leads with a different one.
          if (i === 0 && lead && lead.asin !== b.exampleSku && lead.sellers[0]) return `${lead.sellers[0].name} at $${lead.sellers[0].price.toFixed(2)} vs your $${lead.price.toFixed(2)}, below your $${Math.round(lead.map)} MAP floor`
          return e.replace(/\$[\d.]+K a day/, `${fmtPart(perDay)} a day`)
        }),
        exampleSku: lead?.asin ?? b.exampleSku,
        exampleName: lead?.name ?? b.exampleName,
        ...extra,
      }
    }
    const parts: OpsBatch[] = []
    if (each) parts.push(part(`${b.id}-review`, each, plan.each.value, "each", eachTiers))
    if (bulk)
      parts.push(
        part(b.id, bulk, plan.bulk.value + plan.autopilot.value, "bulk", bulkTiers, {
          reassure: each ? `None of these are hero SKUs. Your ${each} hero SKUs get reviewed one by one.` : undefined,
        }),
      )
    return parts
  })
}

const opsItem = (b: OpsBatch): WorkItem => ({ id: b.id, lever: "ops", tier: tierOf(b.tier), value: toM(b.value), skus: b.skus, urgent: b.urgent })

/** Plays launched this session ("launch:<id>" in the acted map), in launch order. */
export function launchedIds(acted: Acted = {}): string[] {
  return Object.keys(acted)
    .filter((k) => k.startsWith("launch:") && acted[k])
    .map((k) => k.slice("launch:".length))
}

/** A launched content play as an inbox item: drafted by Ally for Content, one approval away. */
function playBatch(p: Play): Batch {
  const value = fmtPart(p.quarter)
  return {
    id: `play:${p.id}`,
    tier: "approval",
    mode: "bulk",
    type: "Foundational",
    name: p.what,
    chip: "No deadline",
    nudgeSource: "Launched by Claire from Grow beyond plan",
    skus: p.skus,
    reviewMinutes: 10,
    value,
    approveSkus: p.skus,
    approveValue: p.quarter,
    doneLabel: `${p.skus} published · ${value}`,
    rationale: p.what,
    exampleSkuId: "sku-5",
    before: "",
    after: "",
    changes: [{ text: p.what, skus: p.skus }],
    skuRows: [],
  }
}

export function batchExampleSku(batch: Batch) {
  return MOCK_SKUS.find((sku) => sku.id === batch.exampleSkuId) ?? NEW_SKUS.find((sku) => sku.id === batch.exampleSkuId) ?? MOCK_SKUS[0]
}

export function skuById(id: string) {
  return MOCK_SKUS.find((sku) => sku.id === id) ?? NEW_SKUS.find((sku) => sku.id === id) ?? MOCK_SKUS[0]
}

export function findBatch(id: string) {
  return BATCHES.find((b) => b.id === id) ?? BATCHES[0]
}

/** Already realized and live this quarter. */
export const BANKED_VALUE = "$1.2M"
/** Banked + the three open buckets. */
export const TOTAL_VALUE = "$8.0M"

/** Media and ops banked so far this quarter; content's detail lives in CONTENT_BANKED_Q3. */
export const BANKED_OTHER: { agent: AgentId; promised: number; delivered: number; reason: string }[] = [
  { agent: "media", promised: 0.34, delivered: 0.37, reason: "IROAS $3.05 vs $2.80 plan" },
  { agent: "ops", promised: 0.36, delivered: 0.31, reason: "Buy-box fixes waiting on 2 restocks" },
]

/* ---------------------------------------------------------------------------
 * "How did I do": promise vs delivered per closed period. Content leads (it's
 * the demo); each period's delivered split sums to CLOSED[grain].total. The
 * fully layered content view lives in delivered-content-data.ts.
 * ------------------------------------------------------------------------- */
export interface DeliveredBucket {
  agent: AgentId
  /** $M */
  promised: number
  delivered: number
  /** A short phrase shown inline after the name: what we did or why the gap. */
  reason: string
}
export interface DeliveredPeriod {
  periodName: string
  /** Content first. Totals are computed from these so they always tie. */
  buckets: DeliveredBucket[]
}

export const DELIVERED: Record<ClosedGrain, DeliveredPeriod> = {
  month: {
    periodName: "September",
    buckets: [
      { agent: "content", promised: 0.26, delivered: 0.238, reason: "2 top sellers out of stock" },
      { agent: "media", promised: 0.15, delivered: 0.161, reason: "IROAS ahead of the $2.80 plan" },
      { agent: "ops", promised: 0.06, delivered: 0.031, reason: "Buy-box fixes blocked by stockouts" },
    ],
  },
  quarter: {
    periodName: "Q2 FY26",
    buckets: [
      { agent: "content", promised: 0.89, delivered: 0.7, reason: "280 SKUs improved" },
      { agent: "media", promised: 0.44, delivered: 0.476, reason: "IROAS $3.01 vs $2.80 plan" },
      { agent: "ops", promised: 0.24, delivered: 0.084, reason: "Buy-box fixes blocked by stockouts" },
    ],
  },
  year: {
    periodName: "FY25",
    buckets: [
      { agent: "content", promised: 2.0, delivered: 1.79, reason: "Stockouts on top SKUs during events" },
      { agent: "media", promised: 1.1, delivered: 1.18, reason: "IROAS above plan across 11 events" },
      { agent: "ops", promised: 0.5, delivered: 0.23, reason: "Buy-box fixes blocked by stockouts" },
    ],
  },
}

/* ---------------------------------------------------------------------------
 * Ops (Michelle) queue — real ops use cases lifted from ally_brain's Store Walk.
 * Powers /michelle, mirroring Mike's content queue but with ops detections/actions.
 * ------------------------------------------------------------------------- */
export interface OpsBatch {
  /** A seed id, or a policy part of one ("buybox-review"). */
  id: string
  /** Which of Claire's buckets it sits in, so Michelle's inbox groups the same way her page does. */
  tier: "approval" | "input" | "autopilot"
  /** The kind of ops work. */
  type: "Buy box" | "Promotions" | "Listings" | "Shipping" | "Profit recovery"
  name: string
  /** Urgency or deadline tag; empty when there's none. */
  chip: string
  team: string
  skus: number
  value: string
  approveValue: number
  /** What the ops agent detected. */
  detected: string
  /** The recommended action Michelle signs off. */
  action: string
  doneLabel: string
  /** Lead example SKU. */
  exampleSku: string
  exampleName: string
  evidence: string[]
  /** Needs-your-input items: what Ally drafted, and the one field only Michelle's team can fill. */
  inputs?: { label: string; detail: string; placeholder: string }[]
  /** How many items need input (the Review button's count) and what they're called. */
  inputCount?: number
  inputNoun?: string
  /** Losing sales right now; drives "You're losing $X a day". */
  urgent?: boolean
  /** Ops fixes: daily sales at risk while the issue is open ($M). Value = perDay × days Ally saves (leakage prevented). */
  perDay?: number
  /** Autopilot: what Ally fixes on its own. */
  fixes?: { text: string; count: number }[]
  /** What the fix is, in words a business reader follows ("MAP escalation to your vendor manager"). */
  fixName?: string
  /** The skills Ally ran to find and size it, shown as "Found by N skills · Show steps". */
  skills?: { name: string; did: string }[]
  /** SKUs by revenue tier, so the review policy can cut the item (hero reviewed one by one). */
  split?: import("./policy").TierSplit
  /** Per-SKU evidence for buy-box items: who's winning, at what price, crawl by crawl. */
  sellerSkus?: SellerSku[]
  /** The SKUs under any other issue, each with what Ally saw on it. */
  skuList?: { asin: string; name: string; note: string[] }[]
  /** The escalation Ally drafted for the person who can fix it (sent from the pane; mock). */
  email?: { to: string; role: string; subject: string; body: string }
  /** How this part ships under the review policy (set on policy parts). */
  mode?: import("./policy").ReviewMode
  /** "Hero", "Core" when a part is one tier. */
  partLabel?: string
  /** Under the bulk action: why it's safe. */
  reassure?: string
}

export interface SellerSku {
  asin: string
  name: string
  tier: import("./policy").SkuTier
  /** Your offer on amazon.com, and the floor you set. */
  price: number
  map: number
  sellers: { name: string; price: number; stock: string; rating: number; wins: number }[]
  /** Latest crawls: time, city, who held the buy box. */
  crawls: { when: string; city: string; winner: string }[]
}

const CITIES = ["Los Angeles (90028)", "New York (10025)", "Seattle (98101)", "Chicago (60611)", "Austin (78701)", "Miami (33130)"]
const TIMES = ["Today, 10:00 AM", "Today, 8:00 AM", "Today, 6:00 AM", "Today, 4:00 AM", "Today, 2:00 AM", "Yesterday, 10:00 PM"]
/** One buy-box SKU: two sellers undercutting MAP; the first wins most crawls. */
function buyBoxSku(asin: string, name: string, tier: SellerSku["tier"], price: number, cut: number, wins: number): SellerSku {
  // Round numbers, as a seller would list and a brand would set them: $27.50, a $32 floor.
  const theirs = Math.round(price * (1 - cut) * 2) / 2
  return {
    asin,
    name,
    tier,
    price,
    map: Math.round(price * 0.94),
    sellers: [
      { name: "CandleDepot", price: theirs, stock: "In stock", rating: 4.2, wins },
      { name: "WickWorks", price: theirs, stock: "In stock", rating: 4.1, wins: 12 - wins },
    ],
    crawls: TIMES.map((when, i) => ({ when, city: CITIES[i], winner: i % 5 === 3 ? "WickWorks" : "CandleDepot" })),
  }
}

/**
 * Leakage prevented, the ops method: Ally fixes in about 2 days what takes
 * about 2 weeks by hand, so each open fix is worth its daily sales at risk
 * × the 12 days sooner. The same method measures what it delivered.
 */
export const OPS_DAYS_SAVED = 12

/** An ops item's SKUs as the rail lists them: buy-box SKUs from their seller evidence, the rest from skuList. */
export function opsSkus(b: OpsBatch): { asin: string; name: string; note: string[] }[] {
  if (b.sellerSkus?.length) return b.sellerSkus.map((x) => ({ asin: x.asin, name: x.name, note: [] }))
  return b.skuList ?? []
}
const withLeakage = (b: OpsBatch): OpsBatch => {
  if (!b.perDay) return b
  const v = +(b.perDay * OPS_DAYS_SAVED).toFixed(3)
  return { ...b, approveValue: v, value: v >= 1 ? `$${+v.toFixed(2)}M` : `$${Math.round(v * 1000)}K` }
}

const OPS_SEED: OpsBatch[] = [
  {
    id: "buybox",
    fixName: "MAP escalation to your vendor manager",
    perDay: 0.009,
    tier: "approval",
    type: "Buy box",
    name: "Third-party sellers below MAP",
    urgent: true,
    chip: "Losing the sale now",
    team: "Sales",
    skus: 6,
    value: "$720K",
    approveValue: 0.72,
    detected: "Two third-party sellers are pricing below your MAP floor and winning the buy box on 6 SKUs.",
    action: "Send to your vendor manager",
    doneLabel: "Escalation sent · evidence attached",
    exampleSku: "B07GR5MSKD",
    exampleName: "Aurelle Amber Floral Soy Jar, 16 oz",
    evidence: ["CandleDepot at $27.50 vs your $34.00, below your $32 MAP floor", "You win 0 of the last 12 crawls", "Losing about $9K a day"],
    split: {
      retailer: "Amazon",
      brand: "Aurelle Candles",
      skuGroup: "Jar candles",
      // Daily sales at risk × 12 days saved: hero $6K/day, core $3K/day.
      tiers: { hero: { skus: 4, value: 0.072 }, core: { skus: 2, value: 0.036 }, tail: { skus: 0, value: 0 } },
      titleSkus: 0,
      imageSkus: 0,
    },
    skills: [
      { name: "Store Walk", did: "Crawled each SKU 12 times today across 6 cities" },
      { name: "Buy box check", did: "Compared every seller's price with your MAP floor" },
      { name: "Revenue at risk", did: "Normal daily sales × days without the buy box" },
    ],
    sellerSkus: [
      buyBoxSku("B07GR5MSKD", "Aurelle Amber Floral Soy Jar, 16 oz", "hero", 34, 0.19, 10),
      buyBoxSku("B08NF9KBZ4", "Aurelle Noir Cherry Large Jar, 22 oz", "hero", 38, 0.18, 9),
      buyBoxSku("B00FLYWNYQ", "Aurelle Coastal Linen Large Jar, 22 oz", "hero", 38, 0.17, 10),
      buyBoxSku("B09HWCD118", "Hearthwood Cedar & Smoke Jar, 18 oz", "hero", 32, 0.2, 8),
      buyBoxSku("B0ATT30313", "Aurelle Travel Tin Trio", "core", 24, 0.16, 9),
      buyBoxSku("B0BCM08080", "Bright Citrus Mini Jar, 8 oz", "core", 16, 0.15, 10),
    ],
    email: {
      to: "Dana Ruiz",
      role: "your Amazon vendor manager",
      subject: "MAP violations taking the buy box on {n} SKUs",
      body: "Hi Dana,\n\nCandleDepot and WickWorks are pricing {n} of our SKUs below our MAP floor and holding the buy box: we won 0 of the last 12 crawls on each. Crawl snapshots, seller IDs and price history are attached.\n\nCould you enforce MAP on these offers or open a case with the brand protection team? We're losing about {daily} a day while this runs.\n\nThanks,\nMichelle",
    },
  },
  {
    id: "promo-badge",
    fixName: "Deal badge fix to your vendor manager",
    skuList: [
      { asin: "B08NF9KBZ4", name: "Aurelle Noir Cherry Large Jar, 22 oz", note: ["Deal live Oct 1–31", "Badge not showing", "$30.40 vs $38.00 list; the 20% off isn't shown"] },
      { asin: "B00FLYWNYQ", name: "Aurelle Coastal Linen Large Jar, 22 oz", note: ["Deal live Oct 1–31", "Badge not showing", "$30.40 vs $38.00 list"] },
      { asin: "B0BCM08080", name: "Bright Citrus Mini Jar, 8 oz", note: ["Deal live Oct 1–31", "Strike-through price missing"] },
    ],
    perDay: 0.006,
    tier: "approval",
    type: "Promotions",
    name: "Missing promo badge",
    chip: "Deal ends Oct 31",
    team: "Marketing",
    skus: 5,
    value: "$580K",
    approveValue: 0.58,
    detected: "The Halloween deal is live (Oct 1–31) but the deal badge and strike-through price aren't showing on 5 SKUs.",
    action: "Send to your vendor manager",
    doneLabel: "Badge fix requested · 5 SKUs",
    exampleSku: "B08NF9KBZ4",
    exampleName: "Aurelle Noir Cherry Large Jar, 22 oz",
    evidence: ["Badge visible: no · Strike-through: no", "Selling $30.40 against $38.00 list; the 20% off isn't shown", "Deal window closes Oct 31"],
    skills: [
      { name: "Store Walk", did: "Checked the badge and price display on every deal SKU" },
      { name: "Deal check", did: "Matched the live deal against what the page shows" },
    ],
    email: {
      to: "Dana Ruiz",
      role: "your Amazon vendor manager",
      subject: "Deal badge not showing on 5 Halloween SKUs",
      body: "Hi Dana,\n\nOur Halloween deal (Oct 1–31) is live on 5 SKUs, but the deal badge and strike-through price aren't rendering. Screenshots from this morning's crawl are attached.\n\nCould you have the badge restored? The deal closes Oct 31.\n\nThanks,\nMichelle",
    },
  },
  {
    id: "deal-page",
    fixName: "Get the deal onto the deals page",
    skuList: [
      { asin: "B07GR5MSKD", name: "Aurelle Amber Floral Soy Jar, 16 oz", note: ["Deal active", "Not listed on the deals page"] },
      { asin: "B09HWCD118", name: "Hearthwood Cedar & Smoke Jar, 18 oz", note: ["Deal active", "Not listed on the deals page"] },
      { asin: "B0ATT30313", name: "Aurelle Travel Tin Trio", note: ["Deal active", "Listed only on page 4 of the deals page"] },
    ],
    perDay: 0.004,
    tier: "approval",
    type: "Promotions",
    name: "Deal page visibility",
    chip: "",
    team: "Marketing",
    skus: 8,
    value: "$460K",
    approveValue: 0.46,
    detected: "Active deals aren't appearing on Amazon's deals page for 8 SKUs.",
    action: "Send to your vendor manager",
    doneLabel: "Visibility fix requested · 8 SKUs",
    exampleSku: "B07GR5MSKD",
    exampleName: "Aurelle Amber Floral Soy Jar, 16 oz",
    evidence: ["Deal active but not listed on the deals page", "Deal-page traffic is 40% of event sales"],
    skills: [
      { name: "Store Walk", did: "Searched the deals page for each active deal" },
      { name: "Revenue at risk", did: "Deal-page share of sales × days unlisted" },
    ],
  },
  {
    id: "oos",
    fixName: "Reinstate the suppressed offer",
    skuList: [
      { asin: "B00FLYWNYQ", name: "Aurelle Coastal Linen Large Jar, 22 oz", note: ["2,400 units at the DC", "Page unavailable in 76% of crawls", "Offer suppressed Sep 30"] },
      { asin: "B0BCM08080", name: "Bright Citrus Mini Jar, 8 oz", note: ["900 units at the DC", "Page unavailable in 64% of crawls"] },
    ],
    perDay: 0.005,
    tier: "approval",
    type: "Listings",
    name: "Shows out of stock, but isn't",
    chip: "",
    team: "Operations",
    skus: 5,
    value: "$340K",
    approveValue: 0.34,
    detected: "5 SKUs show unavailable on the page despite stock on hand: a suppressed offer, not a stockout.",
    action: "Reinstate the suppressed offer",
    doneLabel: "Offer reinstated · 5 SKUs",
    exampleSku: "B00FLYWNYQ",
    exampleName: "Aurelle Coastal Linen Large Jar, 22 oz",
    evidence: ["2,400 units on hand at the DC", "Page unavailable in 76% of crawls", "Offer suppressed on Sep 30"],
    skills: [
      { name: "Store Walk", did: "Found the buy button missing on 5 SKUs" },
      { name: "Inventory check", did: "Confirmed stock on hand in Vendor Central" },
    ],
  },
  {
    id: "shipping",
    fixName: "Flag slow shipping to your 3PL",
    skuList: [
      { asin: "B0ATT30313", name: "Aurelle Travel Tin Trio", note: ["Standard 4.5 days vs Prime 1.1 days", "Slower in 8 of 12 ZIPs"] },
      { asin: "B0BCM08080", name: "Bright Citrus Mini Jar, 8 oz", note: ["Standard 4.2 days vs Prime 1.2 days", "Slower in 6 of 12 ZIPs"] },
    ],
    perDay: 0.002,
    tier: "approval",
    type: "Shipping",
    name: "Shipping speed slipped",
    chip: "",
    team: "Operations",
    skus: 4,
    value: "$300K",
    approveValue: 0.3,
    detected: "4 SKUs are shipping 2.5 days slower than the Prime bar across 8 ZIPs.",
    action: "Flag to the 3PL for expedited handling",
    doneLabel: "Flagged to 3PL · 4 SKUs",
    exampleSku: "B0ATT30313",
    exampleName: "Aurelle Travel Tin Trio",
    evidence: ["Standard 4.5 days vs Prime 1.1 days", "Slower in 8 of 12 ZIPs sampled"],
    skills: [{ name: "Store Walk", did: "Read the delivery promise in 12 ZIPs" }],
  },
  {
    id: "chargebacks",
    tier: "input",
    type: "Profit recovery",
    name: "Chargeback disputes",
    chip: "",
    team: "Finance",
    skus: 42,
    value: "$350K",
    approveValue: 0.35,
    detected: "Ally found 42 chargebacks and fees it can dispute and drafted every claim. 9 need proof only your team has.",
    action: "",
    doneLabel: "Proof sent · Ally files all 42 disputes",
    exampleSku: "",
    exampleName: "",
    evidence: ["33 claims are ready to file", "Disputes must be filed within 90 days of the charge"],
    inputCount: 9,
    inputNoun: "claims",
    inputs: [
      { label: "PO 4471823 · $18.2K chargeback", detail: "Amazon says: late delivery", placeholder: "Carrier tracking number or proof-of-delivery link" },
      { label: "PO 4471907 · $12.6K chargeback", detail: "Amazon says: ASN missing", placeholder: "ASN number" },
      { label: "Invoice 88213 · $9.4K fee", detail: "Amazon says: cost price mismatch", placeholder: "Agreed cost price" },
    ],
  },
  {
    id: "shorted-pos",
    tier: "input",
    type: "Profit recovery",
    name: "Shorted POs",
    chip: "",
    team: "Finance",
    skus: 14,
    value: "$250K",
    approveValue: 0.25,
    detected: "Amazon received fewer units than you shipped on 14 POs. Ally drafted every claim; 6 need the shipped quantity confirmed.",
    action: "",
    doneLabel: "Quantities sent · Ally files all 14 claims",
    exampleSku: "",
    exampleName: "",
    evidence: ["8 claims are ready to file", "Quantities come from your ASNs where they exist"],
    inputCount: 6,
    inputNoun: "POs",
    inputs: [
      { label: "PO 4480112 · Aurelle Amber Floral Soy Jar", detail: "Amazon received 180 of 240 units", placeholder: "Units shipped" },
      { label: "PO 4480377 · Aurelle Travel Tin Trio", detail: "Amazon received 96 of 120 units", placeholder: "Units shipped" },
    ],
  },
  {
    id: "promotions",
    tier: "autopilot",
    type: "Promotions",
    name: "Promotions not live",
    chip: "Running",
    team: "Marketing",
    skus: 51,
    value: "$200K",
    approveValue: 0.2,
    detected: "When a promotion fails to go live, Ally fixes the setup and resubmits it. Nothing for you to do.",
    action: "",
    doneLabel: "Running on autopilot",
    exampleSku: "",
    exampleName: "",
    evidence: [],
    fixes: [
      { text: "Resubmitted coupons that failed validation", count: 31 },
      { text: "Fixed deals priced above the deal ceiling", count: 12 },
      { text: "Re-enabled promotions paused by a feed error", count: 8 },
    ],
  },
]

export const OPS_BATCHES: OpsBatch[] = OPS_SEED.map(withLeakage)

/** The five approval batches sum to Claire's ops "one approval away" ($2.4M); input $600K; autopilot $200K; $3.2M open. */
export const OPS_TOTAL_VALUE = "$2.4M"

export interface NudgeTarget {
  recipient: "mike" | "michelle"
  queuePath: string
  batchName: string
  value: string
  skus?: number
  deadlineDays?: number
}


/**
 * Claire's business for the in-flight period, $M: sold so far, where the current
 * run rate lands, and the plan she uploaded. Gap = plan − pace; the open
 * opportunity (OPEN_TOTAL) is what closes it.
 */
export const BUSINESS: Record<Period, { soFar: number; pace: number; plan: number }> = {
  // As of Oct 8, Q4 FY26 (Oct–Dec, holiday-sized). Week = Oct 5–11.
  week: { soFar: 1.9, pace: 3.5, plan: 3.7 },
  month: { soFar: 4.6, pace: 15.2, plan: 16.4 },
  quarter: { soFar: 4.6, pace: 48, plan: 52 },
  year: { soFar: 129.6, pace: 176, plan: 181 },
}

/** $M for business numbers: whole millions when whole, else one decimal, so parts always add up on screen ($40.5M + $4.5M = $45M). */
export function fmtBiz(v: number): string {
  // Under $1M reads in K, like every other number ($200K, not $0.2M).
  if (Math.abs(v) < 0.95) return `$${Math.round(v * 1000)}K`
  const r = Math.round(v * 10) / 10
  return Number.isInteger(r) ? `$${r}M` : `$${r.toFixed(1)}M`
}

/** In-flight business context shown in the status strip — how the current period is tracking. */
export const INFLIGHT: Record<Period, InflightData> = {
  week: { name: "This week", ptd: "$1.9M", ptdLabel: "week to date", plan: "95%", share: "market share flat at 18.6%" },
  month: { name: "October", ptd: "$4.6M", ptdLabel: "month to date", plan: "93%", share: "market share flat at 18.6%" },
  quarter: { name: "Q4 FY26", ptd: "$4.6M", ptdLabel: "quarter to date", plan: "92%", share: "market share flat at 18.6%" },
  year: { name: "FY26", ptd: "$129.6M", ptdLabel: "year to date", plan: "97%", share: "market share up 0.2 pts to 18.6%" },
}
export const TOTAL_SKUS_REMAINING = 1096

/** The "{priorName} · {priorValue} driven by Ally" toggle and its agent breakdown. */
export const CLOSED: Record<ClosedGrain, ClosedPeriodData> = {
  month: {
    name: "September",
    total: "$430K",
    media: "$161K",
    content: "$238K",
    ops: "$31K",
    mediaStory: "took 24,000 bid and budget actions across 1,400 keywords, at $2.94 incremental return on ad spend.",
    contentStory: "updated 70 SKUs for back to school, improved everyday content on 22, and unblocked 8 for syndication.",
    opsStory: "caught 26 SKUs losing the buy box or missing a promo badge, and fixed them in 48 hours.",
  },
  quarter: {
    name: "Q2 FY26",
    total: "$1.26M",
    media: "$476K",
    content: "$700K",
    ops: "$84K",
    mediaStory: "took 78,000 bid and budget actions across 1,400 keywords, at $3.01 incremental return on ad spend.",
    contentStory: "updated 200 SKUs for Mother's Day, improved everyday content on 60, and unblocked 20 for syndication.",
    opsStory:
      "caught 78 SKUs losing the buy box, missing a promo badge, or dropping below the shipping speed bar, and fixed them in 48 hours instead of 2 weeks.",
  },
  year: {
    name: "FY25",
    total: "$3.2M",
    media: "$1.18M",
    content: "$1.79M",
    ops: "$230K",
    mediaStory: "took 291,000 bid and budget actions across 2,100 keywords, at $2.88 incremental return on ad spend.",
    contentStory: "rewrote 740 product pages across 11 shopping events.",
    opsStory: "caught 312 SKUs losing the buy box, missing a promo badge, or dropping below the shipping speed bar, and cut time to fix from 2 weeks to 48 hours.",
  },
}

export const DEFAULT_CLOSED_GRAIN: ClosedGrain = "quarter"

/** "How you compare" — autopilot share of value Ally ships alone. */
export const COMPARE = {
  youPct: 10,
  bestInClassPct: 25,
  expiredYtd: "$1.8M",
}

/* ---------------------------------------------------------------------------
 * Waterfall version (/claire-waterfall) — a SECOND view of the same buckets.
 * Reuses the exact tier rows; adds only stage framing + numeric values so the
 * chart can build up Banked → open buckets → Total. No new source of truth.
 * ------------------------------------------------------------------------- */
export interface WaterfallStage {
  id: "approval" | "team" | "autopilot"
  /** Caption under the bar; defaults to the effort. */
  caption?: string
  label: string
  effort: string
  /** Millions, for bar height + labels. */
  value: number
  /** The same line items as the tier list; empty for stages with no owners. */
  rows: TierRow[]
  canNudgeTeam: boolean
  /** Shown in the detail panel for stages that need no action. */
  note?: string
}

/** Share of each workstream's open opportunity that best-in-class brands run on autopilot (%). */
export const AUTOPILOT_BEST_IN_CLASS: Record<AgentId, number> = { content: 35, media: 60, ops: 30 }


export function fmtM(v: number): string {
  return `$${v.toFixed(1)}M`
}

/** K under a million, two-decimal M above — e.g. 0.478 → "$478K", 1.26 → "$1.26M". */
export function fmtValue(v: number): string {
  return Math.abs(v) >= 1 ? `$${v.toFixed(2)}M` : `$${Math.round(v * 1000)}K`
}

/* ---------------------------------------------------------------------------
 * The data model: work items + reference tables → every total on every page.
 * getSnapshot() is the one place a database plugs in (see model.ts).
 * ------------------------------------------------------------------------- */

/** James's media work. He has no page yet, but his items feed Claire's rows. */
const MEDIA_ITEMS: WorkItem[] = [
  { id: "media-dsp", lever: "media", tier: "approval", value: 0.56, skus: 5 },
  { id: "media-plan", lever: "media", tier: "input", value: 1.04, skus: 1 },
  { id: "media-bids", lever: "media", tier: "autopilot", value: 0.5, skus: 0 },
]

/** $M from a display string: "$500K" → 0.5, "$2.4M" → 2.4. Seed values are still typed as strings on the batches. */
const toM = (v: string) => parseFloat(v.replace(/[$KM,]/g, "")) / (v.endsWith("K") ? 1000 : 1)
const tierOf = (t: "approval" | "input" | "autopilot"): Tier => t
const contentItem = (b: Batch): WorkItem => ({
  id: b.id,
  lever: "content",
  tier: tierOf(b.tier),
  value: toM(b.value),
  skus: b.inputSkus ?? b.approveSkus,
  deadline: b.deadline,
  ends: b.type === "Seasonal" ? HALLOWEEN : undefined,
})

const SNAPSHOT: Snapshot = {
  asOf: AS_OF,
  people: {
    claire: { name: "Claire" },
    mike: { name: "Mike", lever: "content", page: "/mike" },
    michelle: { name: "Michelle", lever: "ops", page: "/michelle" },
    james: { name: "James", lever: "media" },
  },
  items: [
    ...BATCHES.map((b) => contentItem(b)),
    ...OPS_BATCHES.map((b) => ({ id: b.id, lever: "ops" as AgentId, tier: tierOf(b.tier), value: toM(b.value), skus: b.skus, urgent: b.urgent })),
    ...MEDIA_ITEMS,
  ],
  /** Seeded from this week's activity (the Monday email): who had started before this session. */
  activity: {
    "approval:ops": { state: "in-progress", progress: "Reviewing the fixes" },
    "approval:media": { state: "in-progress", progress: "2 of 5 campaigns live" },
    "input:media": { state: "in-progress", progress: "Plan drafted" },
  },
  tiers: {
    approval: {
      effort: "45 min",
      canNudgeTeam: true,
      describe: {
        content: "Halloween seasonal updates and gift sets.",
        ops: "Buy box, promo badge, listing and shipping fixes, one email each.",
        media: "5 new DSP campaigns for new-to-brand shoppers.",
      },
    },
    input: {
      effort: "~3 days",
      canNudgeTeam: true,
      describe: {
        content: "Winter Hearth launch creative and attributes blocking syndication.",
        ops: "Chargebacks, fees, and shorted POs waiting on finance.",
        media: "Media plan for the $1M in newly unlocked budget.",
      },
    },
    autopilot: {
      effort: "0 min",
      canNudgeTeam: false,
      describe: {
        content: "Always-on PIM to PDP fixes.",
        media: "Incremental bid adjustments and budget pacing.",
        ops: "Promotions not live.",
      },
    },
  },
}

const byPolicy = new Map<string, Snapshot>()

/** Last day of the period containing today: week ends Sunday, FY26 ends with Q4. */
export function periodEnd(period: Period): string {
  const d = new Date(`${AS_OF}T12:00:00`)
  if (period === "week") d.setDate(d.getDate() + ((7 - d.getDay()) % 7))
  else if (period === "month") d.setMonth(d.getMonth() + 1, 0)
  else return QUARTER_END
  return d.toISOString().slice(0, 10)
}

/**
 * How much of an item's value lands in the period: its value spreads evenly from
 * today until it ends (a seasonal event's last day, else the quarter's end).
 */
function shareIn(item: WorkItem, period: Period) {
  const ends = item.ends ?? QUARTER_END
  const total = Math.max(daysUntil(ends, AS_OF), 1)
  const within = Math.max(Math.min(daysUntil(periodEnd(period), AS_OF), total), 0)
  return within / total
}

/** The page of the person who owns a lever, if they have one. */
export function ownerPage(lever: AgentId): string | undefined {
  return Object.values(SNAPSHOT.people).find((p) => p.lever === lever)?.page
}

/**
 * The one read of the data. Swap this for a database call returning the same Snapshot.
 * With a review policy, content items are the policy's parts (see contentBatches);
 * with a period, each item counts only the value that lands in it.
 */
export function getSnapshot(policy?: Policy, period: Period = "quarter", launched: string[] = []): Snapshot {
  if (!policy && period === "quarter" && !launched.length) return SNAPSHOT
  const key = `${period}|${launched.join(",")}|${JSON.stringify(policy ?? null)}`
  if (!byPolicy.has(key)) {
    // Launched media and ops plays are work items on their lever; content plays come in through contentBatches.
    const agentPlays: WorkItem[] = launched
      .map(playById)
      .filter((p): p is Play => !!p && (p.owner === "media" || p.owner === "ops"))
      .map((p) => ({ id: `play:${p.id}`, lever: p.owner as AgentId, tier: p.tier, value: p.quarter, skus: p.skus }))
    const items =
      policy || launched.length
        ? [
            ...contentBatches(policy, launched).map(contentItem),
            ...opsBatches(policy).map(opsItem),
            ...SNAPSHOT.items.filter((i) => i.lever !== "content" && i.lever !== "ops"),
            ...agentPlays,
          ]
        : SNAPSHOT.items
    byPolicy.set(key, { ...SNAPSHOT, items: items.map((i) => ({ ...i, value: i.value * shareIn(i, period) })) })
  }
  return byPolicy.get(key)!
}

const AUTOPILOT_ORDER: AgentId[] = ["content", "media", "ops"]

/** A bucket as the pages show it, for this session's actions (none = the starting state). */
export function tierView(tier: Tier, acted: Acted = {}, policy?: Policy, period?: Period) {
  const snap = getSnapshot(policy, period, launchedIds(acted))
  return {
    value: money(tierTotal(snap, tier, acted)),
    effort: snap.tiers[tier].effort,
    canNudgeTeam: snap.tiers[tier].canNudgeTeam,
    rows: tierRows(snap, tier, acted, tier === "autopilot" ? AUTOPILOT_ORDER : undefined),
  }
}

/** The bridge's three steps, in order from no effort to most. */
export function waterfallStages(acted: Acted = {}, policy?: Policy, period?: Period): WaterfallStage[] {
  const snap = getSnapshot(policy, period, launchedIds(acted))
  const stage = (id: WaterfallStage["id"], tier: Tier, label: string, extra: Partial<WaterfallStage> = {}): WaterfallStage => {
    const view = tierView(tier, acted, policy, period)
    return { id, label, effort: view.effort, value: tierTotal(snap, tier, acted), rows: view.rows, canNudgeTeam: view.canNudgeTeam, ...extra }
  }
  return [
    stage("autopilot", "autopilot", "On autopilot", { caption: "Already scheduled, no action required", note: "Runs on its own — no one has to open this screen." }),
    stage("approval", "approval", "One approval away"),
    stage("team", "input", "Needs your team"),
  ]
}

/** Open value by lever and in total, as display strings. */
export function openView(acted: Acted = {}, policy?: Policy, period?: Period) {
  const snap = getSnapshot(policy, period, launchedIds(acted))
  const byArea = openByLever(snap, acted).map((a) => ({ agent: a.agent, value: money(a.value) }))
  const total = sum(snap.items.filter((i) => !acted[i.id]))
  return { byArea, total, totalLabel: money(total), acted: actedValue(snap, acted) }
}

/**
 * What expires first among open items one approval away (the line next to "45 min unlocks…");
 * undefined when nothing does. Pass `undefined` for every bucket (today $1.16M: the $420K Halloween concepts share Oct 8).
 */
export function deadlineView(acted: Acted = {}, tier: Tier | undefined = "approval", policy?: Policy, period?: Period) {
  const e = expiring(getSnapshot(policy, period, launchedIds(acted)), acted, tier)
  // A deadline after the period ends isn't this period's news (the week view doesn't warn about Oct 26).
  if (e && period && e.days > daysUntil(periodEnd(period), AS_OF)) return undefined
  return e && { days: e.days, date: e.date, expiring: money(e.value), value: e.value }
}

// Starting-state exports, same names and shapes the pages already use (/claire reads only these).
export const APPROVAL_TIER = tierView("approval")
export const TEAM_TIER = tierView("input")
export const AUTOPILOT_TIER = tierView("autopilot")
export const WATERFALL_STAGES = waterfallStages()
export const WATERFALL_TOTAL = WATERFALL_STAGES.reduce((s, x) => s + x.value, 0)
export const OPEN_BY_AREA = openView().byArea
export const OPEN_TOTAL = openView().totalLabel
export const OPEN_TOTAL_M = openView().total
export const DEADLINE = deadlineView()!

/** Mike's "One approval away" total; ties to Claire's content row in that bucket. */
export const TOTAL_WAITING_APPROVAL = sum(getSnapshot().items.filter((i) => i.lever === "content" && i.tier === "approval"))

export interface NudgeTarget {
  recipient: "mike" | "michelle"
  queuePath: string
  batchName: string
  value: string
  skus?: number
  deadlineDays?: number
}

/** Which nudges fire a real Slack DM, to whom, and where "Open in Ally" lands. Value, SKUs and deadline come from the items. */
function target(tier: Tier, lever: AgentId, recipient: NudgeTarget["recipient"], queuePath: string, batchName: string, policy?: Policy): NudgeTarget {
  const items = getSnapshot(policy).items.filter((i) => i.tier === tier && i.lever === lever)
  const d = deadlineView({}, "approval", policy)
  return {
    recipient,
    queuePath,
    batchName,
    value: money(sum(items)),
    skus: items.reduce((n, i) => n + i.skus, 0),
    deadlineDays: items.every((i) => i.deadline) ? d?.days : undefined,
  }
}

/** Under a review policy, a nudge carries only what's left for a person (not what's scheduled on autopilot). */
export function nudgeTargets(policy?: Policy): Partial<Record<NudgeKey, NudgeTarget>> {
  return {
    "approval-content": target("approval", "content", "mike", "/mike", "Halloween jar candles and gift sets", policy),
    "team-content": target("input", "content", "mike", "/mike", "Winter Hearth launch and retail readiness", policy),
    "approval-ops": target("approval", "ops", "michelle", "/michelle", "Buy box, promo and listing fixes", policy),
  }
}

export const NUDGE_TARGETS = nudgeTargets()
