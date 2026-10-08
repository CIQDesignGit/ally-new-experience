/**
 * Review policy: how much a person reviews depends on how much a SKU matters.
 * SKU tiers come from revenue; each tier has a default mode; review rules
 * override for a scope (retailer, brands, SKU groups, tier). The most specific
 * rule wins. A rule can name a field (title, main image): changes touching it
 * take the stricter of the SKU's mode and the rule's, so it only adds review. "Needs your input" is not a mode: it's a state of the work.
 */

export type SkuTier = "hero" | "core" | "tail"
export type ReviewMode = "each" | "bulk" | "autopilot"

export const MODE_LABEL: Record<ReviewMode, string> = { each: "Review each", bulk: "Approve in bulk", autopilot: "Autopilot" }
export const MODES: ReviewMode[] = ["each", "bulk", "autopilot"]
export const TIERS: SkuTier[] = ["hero", "core", "tail"]

export type Field = "title" | "image"
export const FIELD_LABEL: Record<Field, string> = { title: "Title changes", image: "Main image changes" }
export const FIELDS: Field[] = ["title", "image"]
/** Higher is stricter: more human review. */
const STRICTNESS: Record<ReviewMode, number> = { autopilot: 0, bulk: 1, each: 2 }

/** Tier definitions by share of sales, and the catalog's current size in each (mock). */
export const TIER_INFO: Record<SkuTier, { label: string; band: string; skus: number; share: number }> = {
  hero: { label: "Hero", band: "SKUs making your top 50% of sales", skus: 42, share: 48 },
  core: { label: "Core", band: "The next 40% of sales", skus: 610, share: 41 },
  tail: { label: "Tail", band: "The last 10% of sales", skus: 2300, share: 11 },
}

export interface Scope {
  retailer: string
  brands: string[]
  skuGroups: string[]
}

export interface ReviewRule extends Scope {
  id: string
  /** Undefined = every tier. */
  tier?: SkuTier
  /** Undefined = any change. */
  field?: Field
  /** A kind of work ("Seasonal"); undefined = all work. */
  workType?: string
  /** Batches the rule doesn't touch: work already handled when it was made, so it starts with the next event. */
  except?: string[]
  mode: ReviewMode
  author: string
  date: string
}

export interface KnowledgeEntry extends Scope {
  id: string
  text: string
  author: string
  date: string
  /** Where it came from when it wasn't typed in Settings, e.g. a thumbs down on one SKU. */
  source?: string
  /** A corrected recipe (how an analysis runs), when the lesson is one. */
  recipe?: GapRecipe
}

/** How gap to plan runs: what plan is measured in, steps added to Ally's, and the columns shown. */
export interface GapRecipe {
  measure: "sales" | "units" | "weight"
  steps: string[]
  columns: ("units" | "weight" | "fill")[]
  scope: "me" | "team" | "account"
  /** Who changed the skill file, for whom, and what changed: newest last. */
  log?: { version: number; who: string; when: string; scope: "me" | "team" | "account"; changes: string[] }[]
}

export interface Policy {
  tiers: Record<SkuTier, ReviewMode>
  /** Batches whose autopilot part Mike held back for review, just this once (not a rule). */
  holds?: string[]
  rules: ReviewRule[]
}

export const RETAILERS = ["Amazon", "Walmart", "Target"]
export const BRANDS = ["Aurelle Candles", "Hearthwood", "Bright Citrus", "Rasa"]
export const SKU_GROUPS = ["Jar candles", "Gift sets", "Pillar candles", "Travel tins"]

export const DEFAULT_POLICY: Policy = {
  tiers: { hero: "each", core: "bulk", tail: "autopilot" },
  rules: [
    { id: "r1", retailer: "Amazon", brands: ["Hearthwood"], skuGroups: [], tier: "core", mode: "each", author: "Claire Bennett", date: "Sep 22, 2026" },
  ],
}

export const DEFAULT_KNOWLEDGE: KnowledgeEntry[] = [
  // Kept by Ally from the Oct 1 call with Claire (Sarah's account); undo is on Sarah's page.
  { id: "kn-margin", text: "Q4 margin floor is 32%: no media or promo play below it", retailer: "All retailers", brands: [], skuGroups: [], author: "Ally, from the Oct 1 call", date: "Oct 1", source: "from the Oct 1 call with Claire" },
  {
    id: "k1",
    text: 'Do not use language such as "Made in USA". We\'re not legally allowed to make that claim; where relevant, "Originates in USA" can be used.',
    retailer: "Amazon",
    brands: ["Aurelle Candles"],
    skuGroups: [],
    author: "Mike Chen",
    date: "May 13, 2026",
  },
  {
    id: "k2",
    text: "Titles must not contain trademark symbols and must not exceed 150 characters.",
    retailer: "Amazon",
    brands: ["Aurelle Candles", "Hearthwood"],
    skuGroups: ["Jar candles"],
    author: "Mike Chen",
    date: "Jun 2, 2026",
  },
]

/** How specific a rule is: SKU groups beat brands, brands beat retailer-only; a kind of work counts like a tier. */
const specificity = (r: ReviewRule) => (r.skuGroups.length ? 4 : 0) + (r.brands.length ? 2 : 0) + (r.tier ? 1 : 0) + (r.workType ? 1 : 0)

type SkuKey = { retailer: string; brand: string; skuGroup: string; tier: SkuTier; type?: string; batchId?: string }

/** The rule that governs a SKU (or one field of it), if any: matching scope, most specific first, newest on a tie. */
export function ruleFor(policy: Policy, sku: SkuKey, field?: Field) {
  return policy.rules
    .filter(
      (r) =>
        r.field === field &&
        r.retailer === sku.retailer &&
        (r.brands.length === 0 || r.brands.includes(sku.brand)) &&
        (r.skuGroups.length === 0 || r.skuGroups.includes(sku.skuGroup)) &&
        (!r.tier || r.tier === sku.tier) &&
        (!r.workType || r.workType === sku.type) &&
        !(sku.batchId && r.except?.includes(sku.batchId)),
    )
    .sort((a, b) => specificity(b) - specificity(a) || b.id.localeCompare(a.id))[0]
}

/** The mode for a SKU: its rule if one matches, else its tier's default. */
export function modeFor(policy: Policy, sku: SkuKey): ReviewMode {
  return ruleFor(policy, sku)?.mode ?? policy.tiers[sku.tier]
}

/** A batch's SKUs by tier ($M), and which fields its changes touch. */
export interface TierSplit {
  retailer: string
  brand: string
  skuGroup: string
  /** The kind of work ("Seasonal"), for rules scoped to it. */
  type?: string
  /** The batch it splits, for rules that skip work already handled. */
  batchId?: string
  tiers: Record<SkuTier, { skus: number; value: number }>
  /** SKUs whose change touches the title / the main image. */
  titleSkus: number
  imageSkus: number
}

/**
 * How a batch ships under a policy: SKUs and value per mode. A field rule that
 * is stricter than the SKU's mode pulls the SKUs whose change touches that
 * field into the rule's mode, in proportion within each tier.
 */
export function shipPlan(policy: Policy, split: TierSplit) {
  const out: Record<ReviewMode, { skus: number; value: number; byTier: Partial<Record<SkuTier, number>> }> = {
    each: { skus: 0, value: 0, byTier: {} },
    bulk: { skus: 0, value: 0, byTier: {} },
    autopilot: { skus: 0, value: 0, byTier: {} },
  }
  const total = Math.max(TIERS.reduce((n, t) => n + split.tiers[t].skus, 0), 1)
  const touched: Record<Field, number> = { title: split.titleSkus, image: split.imageSkus }
  for (const tier of TIERS) {
    const { skus, value } = split.tiers[tier]
    if (!skus) continue
    const sku = { ...split, tier }
    const mode = modeFor(policy, sku)
    // Stricter field rules for this SKU; SKUs touching several fields go to the strictest.
    const stricter = FIELDS.map((f) => ({ f, mode: ruleFor(policy, sku, f)?.mode }))
      .filter((x): x is { f: Field; mode: ReviewMode } => !!x.mode && STRICTNESS[x.mode] > STRICTNESS[mode])
    const add = (m: ReviewMode, n: number) => {
      if (!n) return
      out[m].skus += n
      out[m].value += (value * n) / skus
      out[m].byTier[tier] = (out[m].byTier[tier] ?? 0) + n
    }
    let pulled = 0
    for (const m of MODES.filter((m) => stricter.some((x) => x.mode === m))) {
      // MODES runs strictest first, so each mode gets what a stricter one hasn't taken.
      const share = Math.min(1, Math.max(...stricter.filter((x) => STRICTNESS[x.mode] >= STRICTNESS[m]).map((x) => touched[x.f])) / total)
      const n = Math.round(skus * share) - pulled
      add(m, n)
      pulled += Math.max(n, 0)
    }
    add(mode, skus - pulled)
  }
  return out
}
