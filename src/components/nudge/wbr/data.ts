/**
 * The weekly business review's numbers. Everything comes from the demo's own
 * sources (the gap-to-plan analysis, delivered, alerts, competition) except the
 * 8-week history of sales against plan, which is new here and ends on the gap
 * analysis's last week ($3.42M of $3.66M), so it ties.
 */
import { GAP_TREE, skusUnder } from "../ops/gap-data"
import { SOV, SOV_WEEKS } from "../../competition/data"

/** Week ending, Aug 16 to Oct 4 (last week, Sep 28 – Oct 4): sales and plan, $M. */
export const WEEKS = SOV_WEEKS
export const SALES_8W = [3.71, 3.68, 3.62, 3.58, 3.55, 3.49, 3.46, GAP_TREE.lastWeek.sales]
export const PLAN_8W = [3.62, 3.63, 3.64, 3.64, 3.65, 3.65, 3.66, GAP_TREE.lastWeek.plan]

/** Share of voice on the gift terms, %: yours and Brightwick's, same 8 weeks. */
export const SOV_8W = { ours: SOV.ours, theirs: SOV.theirs }

/** SKUs furthest below plan last week. */
export const WORST_SKUS = skusUnder(GAP_TREE)
  .map((n) => ({ name: n.name, sales: n.lastWeek.sales, plan: n.lastWeek.plan, gap: n.lastWeek.sales - n.lastWeek.plan }))
  .filter((s) => s.gap < 0)
  .sort((a, b) => a.gap - b.gap)
  .slice(0, 6)
