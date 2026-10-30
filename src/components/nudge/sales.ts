import { TIER_INFO, type SkuTier } from "./policy"
import type { Batch } from "./types"

/**
 * What the SKUs in a content batch sold in the last 4 weeks: the MVP ranks
 * Mike's queue by it (after the deadline) instead of projected value. Per-SKU
 * sales follow the review policy's tiers (hero 42 SKUs make 48% of sales, core
 * 41%, tail 11%) on 4 of the quarter's 13 weeks of Claire's $48M forecast.
 */
export const FOUR_WEEK_SALES = (48 * 4) / 13
const perSku = (t: SkuTier) => (FOUR_WEEK_SALES * TIER_INFO[t].share) / 100 / TIER_INFO[t].skus
const AVG_SKU = FOUR_WEEK_SALES / (TIER_INFO.hero.skus + TIER_INFO.core.skus + TIER_INFO.tail.skus)

/** $M of 4-week sales for SKUs counted by tier. */
export const tierSales = (byTier: Partial<Record<SkuTier, number>>) => (Object.keys(byTier) as SkuTier[]).reduce((s, t) => s + (byTier[t] ?? 0) * perSku(t), 0)

export function batchSales(b: Batch): number {
  if (b.sales4w !== undefined) return b.sales4w
  if (b.split) return tierSales(Object.fromEntries(Object.entries(b.split.tiers).map(([t, v]) => [t, v.skus])))
  return (b.inputSkus ?? b.skus) * AVG_SKU
}

/** $M → "$1.9M" or "$480K". */
export const fmtSales = (v: number) => (v >= 1 ? `$${v.toFixed(1)}M` : `$${Math.round(v * 1000)}K`)
