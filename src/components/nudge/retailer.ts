/**
 * Which retailer the numbers are for. Amazon is the full demo; Walmart and
 * Target are smaller businesses with their own plan and pipeline, and "All
 * retailers" adds the three. Each retailer is Amazon's numbers times its own
 * factors (sales, plan, pipeline, delivered), so every total still ties on the
 * page. Only Claire's page and Gap to plan switch; the work queues are Amazon's.
 */
export type Retailer = "all" | "amazon" | "walmart" | "target"

export const RETAILERS: { id: Retailer; label: string }[] = [
  { id: "all", label: "All retailers" },
  { id: "amazon", label: "Amazon" },
  { id: "walmart", label: "Walmart" },
  { id: "target", label: "Target" },
]

type Factors = { sales: number; plan: number; open: number; delivered: number }
const ONE: Record<Exclude<Retailer, "all">, Factors> = {
  amazon: { sales: 1, plan: 1, open: 1, delivered: 1 },
  // Ahead of plan: a smaller business that's growing.
  walmart: { sales: 0.2, plan: 0.18, open: 0.15, delivered: 0.1 },
  // Further behind plan, with less of it worked by Ally yet.
  // Plan sized so the week reads $390K against Amazon's $3.7M.
  target: { sales: 0.1, plan: 0.39 / 3.7, open: 0.12, delivered: 0.08 },
}
const sumOf = (k: keyof Factors) => ONE.amazon[k] + ONE.walmart[k] + ONE.target[k]
export const FACTORS: Record<Retailer, Factors> = { ...ONE, all: { sales: sumOf("sales"), plan: sumOf("plan"), open: sumOf("open"), delivered: sumOf("delivered") } }

/** The pages whose numbers follow the switch. */
export const RETAILER_PAGES = ["/claire-waterfall", "/michelle/gap"]

// Set by the provider on every render, before its children read any number.
let current: Retailer = "amazon"
export const setCurrentRetailer = (r: Retailer) => {
  current = r
}
export const currentRetailer = () => current
export const factors = () => FACTORS[current]
