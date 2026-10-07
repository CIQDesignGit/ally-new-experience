/**
 * Gap to plan for Walmart and Target, and all three together. Same shape as
 * Amazon's tree (gap-data.ts): brand › category, this week. Each retailer's
 * end-of-week projection and plan tie to Claire's week view for that retailer
 * (Amazon's $3.5M and $3.7M times the retailer's factors in retailer.ts).
 * Walmart is ahead of plan; Target is behind.
 */
import { GAP_TREE, treeFor } from "./gap-data"
import type { Driver, GapNode, Hierarchy, Recommendation } from "./gap-data"
import type { Retailer } from "../retailer"

const node = (n: Omit<GapNode, "drivers" | "recommendations"> & { drivers?: Driver[]; recommendations?: Recommendation[] }): GapNode => ({ drivers: [], recommendations: [], ...n })

/* Walmart: $700K projected vs $666K plan this week ------------------------- */
const WM_DRIVERS: Driver[] = [
  { title: "Rollback on 16 oz jar candles", value: 0.022, tag: "Live", points: ["Units up 18% since Oct 1", "Runs to Oct 31"] },
  { title: "Out of stock at 2 Southeast DCs", value: -0.006, tag: "Live", points: ["Hearthwood Cedar & Smoke", "Ships to 14% of ZIPs at 4+ days"] },
  { title: "Gift sets flat while search grows 12%", value: -0.004, tag: "Worth watching", points: ["Your share of gift-set search 9%"] },
]
const walmart = node({
  id: "wm",
  name: "Walmart",
  level: "Retailer",
  lastWeek: { sales: 0.68, plan: 0.66 },
  wtd: 0.39,
  eow: { projected: 0.7, plan: 0.666 },
  equation: { traffic: 4, conversion: 2, price: -1, sales: 5 },
  drivers: WM_DRIVERS,
  recommendations: [
    { title: "Rebalance Cedar & Smoke stock across DCs", points: ["Ask your Walmart buyer · drafted with the DC report", "Recovers about $6K a week"], action: { kind: "watch", label: "Watch DC stock" } },
    { title: "Extend the rollback through Black Friday", points: ["Worth about $40K over 4 weeks"], action: { kind: "watch", label: "Watch the rollback" } },
  ],
  children: [
    node({
      id: "wm-aurelle",
      name: "Aurelle Candles",
      level: "Brand",
      lastWeek: { sales: 0.45, plan: 0.43 },
      wtd: 0.26,
      eow: { projected: 0.46, plan: 0.43 },
      equation: { traffic: 5, conversion: 3, price: -2, sales: 6 },
      drivers: [WM_DRIVERS[0], WM_DRIVERS[2]],
      children: [
        node({ id: "wm-aurelle-jar", name: "Jar candles", level: "Category", lastWeek: { sales: 0.32, plan: 0.3 }, wtd: 0.19, eow: { projected: 0.33, plan: 0.3 }, equation: { traffic: 7, conversion: 4, price: -3, sales: 8 }, drivers: [WM_DRIVERS[0]] }),
        node({ id: "wm-aurelle-gift", name: "Gift sets", level: "Category", lastWeek: { sales: 0.13, plan: 0.13 }, wtd: 0.07, eow: { projected: 0.13, plan: 0.13 }, equation: { traffic: 1, conversion: -1, price: 0, sales: 0 }, drivers: [WM_DRIVERS[2]] }),
      ],
    }),
    node({
      id: "wm-hearthwood",
      name: "Hearthwood",
      level: "Brand",
      lastWeek: { sales: 0.13, plan: 0.136 },
      wtd: 0.08,
      eow: { projected: 0.14, plan: 0.136 },
      equation: { traffic: 2, conversion: -3, price: 0, sales: -1 },
      drivers: [WM_DRIVERS[1]],
      children: [node({ id: "wm-hw-jar", name: "Jar candles", level: "Category", lastWeek: { sales: 0.13, plan: 0.136 }, wtd: 0.08, eow: { projected: 0.14, plan: 0.136 }, equation: { traffic: 2, conversion: -3, price: 0, sales: -1 }, drivers: [WM_DRIVERS[1]] })],
    }),
    node({
      id: "wm-bright",
      name: "Bright Citrus",
      level: "Brand",
      lastWeek: { sales: 0.1, plan: 0.094 },
      wtd: 0.05,
      eow: { projected: 0.1, plan: 0.1 },
      equation: { traffic: 3, conversion: 1, price: 0, sales: 4 },
      children: [node({ id: "wm-bc-jar", name: "Jar candles", level: "Category", lastWeek: { sales: 0.1, plan: 0.094 }, wtd: 0.05, eow: { projected: 0.1, plan: 0.1 }, equation: { traffic: 3, conversion: 1, price: 0, sales: 4 } })],
    }),
  ],
})

/* Target: $350K projected vs $390K plan this week -------------------------- */
const TG_DRIVERS: Driver[] = [
  { title: "Circle offer on jar candles ended Oct 1", value: -0.018, tag: "Resolved", points: ["Units down 14% since", "Next offer Nov 20"] },
  { title: "Off page 1 for \"soy candle\" on target.com", value: -0.012, tag: "Live", points: ["Rank 14, was 6", "Two competitors added the term to titles"] },
  { title: "22 item pages below Target's content bar", value: -0.006, tag: "Live", points: ["Missing scent notes and burn time"] },
]
const target = node({
  id: "tg",
  name: "Target",
  level: "Retailer",
  lastWeek: { sales: 0.34, plan: 0.381 },
  wtd: 0.19,
  eow: { projected: 0.35, plan: 0.39 },
  equation: { traffic: -6, conversion: -4, price: 0, sales: -10 },
  drivers: TG_DRIVERS,
  recommendations: [
    { title: "Get back on page 1 for \"soy candle\"", points: ["Ally for Content adds the term to 22 titles", "About $12K a week"], action: { kind: "watch", label: "Watch the rank" } },
    { title: "Fix the 22 pages below Target's bar", points: ["Scent notes and burn time, drafted for review"], action: { kind: "watch", label: "Watch the pages" } },
  ],
  children: [
    node({
      id: "tg-aurelle",
      name: "Aurelle Candles",
      level: "Brand",
      lastWeek: { sales: 0.23, plan: 0.265 },
      wtd: 0.13,
      eow: { projected: 0.24, plan: 0.27 },
      equation: { traffic: -8, conversion: -5, price: 0, sales: -13 },
      drivers: TG_DRIVERS,
      children: [
        node({ id: "tg-aurelle-jar", name: "Jar candles", level: "Category", lastWeek: { sales: 0.16, plan: 0.185 }, wtd: 0.09, eow: { projected: 0.17, plan: 0.19 }, equation: { traffic: -9, conversion: -6, price: 0, sales: -14 }, drivers: [TG_DRIVERS[0], TG_DRIVERS[1]] }),
        node({ id: "tg-aurelle-gift", name: "Gift sets", level: "Category", lastWeek: { sales: 0.07, plan: 0.08 }, wtd: 0.04, eow: { projected: 0.07, plan: 0.08 }, equation: { traffic: -5, conversion: -3, price: 0, sales: -8 }, drivers: [TG_DRIVERS[2]] }),
      ],
    }),
    node({
      id: "tg-hearthwood",
      name: "Hearthwood",
      level: "Brand",
      lastWeek: { sales: 0.07, plan: 0.075 },
      wtd: 0.04,
      eow: { projected: 0.07, plan: 0.075 },
      equation: { traffic: -3, conversion: -2, price: 0, sales: -5 },
      children: [node({ id: "tg-hw-jar", name: "Jar candles", level: "Category", lastWeek: { sales: 0.07, plan: 0.075 }, wtd: 0.04, eow: { projected: 0.07, plan: 0.075 }, equation: { traffic: -3, conversion: -2, price: 0, sales: -5 } })],
    }),
    node({
      id: "tg-bright",
      name: "Bright Citrus",
      level: "Brand",
      lastWeek: { sales: 0.04, plan: 0.041 },
      wtd: 0.02,
      eow: { projected: 0.04, plan: 0.045 },
      equation: { traffic: -2, conversion: -1, price: 0, sales: -3 },
      children: [node({ id: "tg-bc-jar", name: "Jar candles", level: "Category", lastWeek: { sales: 0.04, plan: 0.041 }, wtd: 0.02, eow: { projected: 0.04, plan: 0.045 }, equation: { traffic: -2, conversion: -1, price: 0, sales: -3 } })],
    }),
  ],
})

const add = (xs: number[]) => +xs.reduce((a, b) => a + b, 0).toFixed(4)

/** The tree for the retailer in view. One retailer: its brands (or categories) under Overall. All: retailer › brand. */
export function retailerTree(order: Hierarchy, retailer: Retailer): GapNode {
  if (retailer === "amazon") return treeFor(order)
  const root = (r: GapNode): GapNode => ({ ...r, id: "overall", name: "Overall", level: undefined })
  if (retailer === "walmart") return root(walmart)
  if (retailer === "target") return root(target)
  const amazon: GapNode = { ...GAP_TREE, id: "amazon", name: "Amazon", level: "Retailer" }
  const kids = [amazon, walmart, target]
  return {
    id: "overall",
    name: "Overall",
    lastWeek: { sales: add(kids.map((k) => k.lastWeek.sales)), plan: add(kids.map((k) => k.lastWeek.plan)) },
    wtd: add(kids.map((k) => k.wtd)),
    eow: { projected: add(kids.map((k) => k.eow.projected)), plan: add(kids.map((k) => k.eow.plan)) },
    equation: GAP_TREE.equation,
    // The biggest causes across all three, by dollars.
    drivers: kids.flatMap((k) => k.drivers).sort((a, b) => a.value - b.value).slice(0, 6),
    recommendations: [...GAP_TREE.recommendations.slice(0, 2), target.recommendations[0]],
    children: kids,
  }
}
