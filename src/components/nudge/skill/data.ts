import type { RetroSlide } from "../retro/prime-day"

/**
 * Use case 8, a skill from past work: Michelle's annual Amazon vendor
 * negotiation. Ally learns last year's prep from the files, asks for the one
 * input it can't find (manufacturing cost), and turns it into a skill she runs
 * for FY26. Ties to her queue: $350K of chargeback disputes and $250K of
 * shorted POs. Amazon buys about $96M a year from Aurelle at cost.
 */

export const SKILL = {
  id: "negotiation-prep",
  name: "Vendor negotiation prep",
  say: "open my negotiation prep",
  description: "Preps the annual Amazon vendor negotiation: sizes every term, models margin, ranks the asks, and builds the deck.",
  when: "Before the annual Amazon terms meeting, or whenever terms are up for renewal",
  before: "2 months of an analyst's time last year",
  after: "about 10 minutes",
}

export const PREP_FILES = [
  { name: "FY25 Amazon negotiation prep.xlsx", size: "2.8 MB", src: "", kind: "email" as const },
  { name: "FY25 negotiation deck.pptx", size: "6.1 MB", src: "", kind: "email" as const },
]
export const COST_FILE = [{ name: "FY26 brand margin by product.xlsx", size: "410 KB", src: "", kind: "email" as const }]

/** The steps Ally found in last year's work (the AVN workbench), and where each one's data comes from. */
export const SKILL_STEPS = [
  { text: "Confirm Amazon's numbers: net PPM, contribution margin, price, shipped COGS", source: "Already in Ally", ok: true },
  { text: "Lay our margin over Amazon's, product by product", source: "Brand margin file", ok: false },
  { text: "Read the current terms from last year's agreement", source: "Last year's prep", ok: true },
  { text: "Map volume into the four profitability quadrants", source: "Built from the steps above", ok: true },
  { text: "Find the volume stuck where either side loses, with ad spend", source: "Amazon Ads", ok: true },
  { text: "Recommend the contra COGS mix and the cost of each concession", source: "Rules on the numbers above", ok: true },
  { text: "Build the negotiation deck", source: "Ally's deck builder", ok: true },
]

/** The targets the quadrant lines sit on. */
export const TARGETS = { brand: 35, amazon: 25 }

/** 13 product lines, $96M of shipped COGS a year. Brand margin and Amazon net PPM in %, volume in $M, ad spend in $K a year. */
export const PRODUCTS = [
  { name: "Warm Amber Floral Soy Jar, 16 oz", cogs: 14.0, brand: 42, ppm: 31, ads: 820, cause: "" },
  { name: "Noir Cherry Large Jar, 22 oz", cogs: 11.5, brand: 40, ppm: 29, ads: 640, cause: "" },
  { name: "Coastal Linen Large Jar, 22 oz", cogs: 10.5, brand: 38, ppm: 28, ads: 590, cause: "" },
  { name: "Bright Citrus Mini Jar, 8 oz", cogs: 8.0, brand: 37, ppm: 27, ads: 410, cause: "" },
  { name: "Vanilla Bean Mini Jar, 8 oz", cogs: 7.5, brand: 39, ppm: 30, ads: 380, cause: "" },
  { name: "Hearthwood Cedar & Smoke Jar, 18 oz", cogs: 7.0, brand: 36, ppm: 26, ads: 360, cause: "" },
  { name: "Wax Melt Sampler", cogs: 6.0, brand: 24, ppm: 33, ads: 210, cause: "High cost" },
  { name: "Reed Diffuser, Cashmere Fog", cogs: 5.5, brand: 28, ppm: 29, ads: 190, cause: "High cost" },
  { name: "Soy Candle Trio Gift Set", cogs: 8.0, brand: 41, ppm: 14, ads: 980, cause: "Heavy deal funding" },
  { name: "3-Wick Holiday Gift Set", cogs: 6.0, brand: 38, ppm: 17, ads: 720, cause: "Low price" },
  { name: "Travel Tin Trio", cogs: 4.0, brand: 36, ppm: 12, ads: 460, cause: "Low price" },
  { name: "Classic Pillar Candle, 6 in", cogs: 5.0, brand: 22, ppm: 15, ads: 240, cause: "High cost and low price" },
  { name: "Clean-Burn Votive 12-Pack", cogs: 3.0, brand: 18, ppm: 11, ads: 130, cause: "High cost and low price" },
]
export type Quadrant = "win" | "amazon" | "brand" | "loss"
export const quadrantOf = (p: { brand: number; ppm: number }): Quadrant => (p.brand >= TARGETS.brand ? (p.ppm >= TARGETS.amazon ? "win" : "brand") : p.ppm >= TARGETS.amazon ? "amazon" : "loss")
export const QUADRANT_LABEL: Record<Quadrant, string> = { win: "Mutual win", amazon: "Amazon wins, brand weak", brand: "Brand wins, Amazon weak", loss: "Mutual loss" }

/** Contra COGS on $96M: today against the recommendation, a year and over three years. */
export const CONTRA = [
  { term: "Invoice discount", today: "4%", rec: "4%", bps: 0, year: 0, note: "Hold" },
  { term: "Co-op", today: "7%", rec: "6%", bps: -100, year: 0.96, note: "Category median is 5.5%" },
  { term: "Damage allowance", today: "3%", rec: "1.5%", bps: -150, year: 1.44, note: "Actual damage is 0.6%" },
  { term: "Freight allowance", today: "2%", rec: "2%", bps: 0, year: 0, note: "Hold; show the return on what we pay" },
  { term: "Deal funding", today: "3%", rec: "2.5%", bps: -50, year: 0.48, note: "Focus it on the 3 gift and tin lines" },
  { term: "Growth rebate", today: "None", rec: "1% above 10% growth", bps: 100, year: -1.06, note: "Offered in place of more co-op" },
  { term: "Cost price", today: "—", rec: "+2% on 3 lines", bps: 0, year: 0.36, note: "With a margin guarantee to Amazon" },
]
export const CONTRA_YEAR = 2.18
export const CONTRA_3YR = 6.5

export const NARRATIVE = "Lead with the 61% of volume that works for both of us. Fix the 19% where Amazon loses with a 2% cost increase on the three gift and tin lines, backed by a margin guarantee, and focus deal funding there. Then trade growth for terms: a 1% rebate above 10% growth in place of the co-op Amazon will ask for. Close on damage: 0.6% actual against a 3% allowance."

/** What the FY26 run produces: the asks, ranked by what they're worth a year in margin. */
export const ASKS = [
  { ask: "Damage allowance", today: "3%", target: "1.5%", worth: 1.44, lastYear: "3%, no change", counter: "2%", why: "Our damage rate is 0.6%, a fifth of what the allowance pays for" },
  { ask: "Co-op", today: "7%", target: "6%", worth: 0.96, lastYear: "6.5% to 7%", counter: "6.5%", why: "Category median is 5.5%; we grew 28% on Prime Day" },
  { ask: "Chargebacks and shortages", today: "$600K", target: "Recovered", worth: 0.6, lastYear: "$180K recovered", counter: "70% paid", why: "$350K in disputes and $250K in shorted POs, proof drafted" },
]
export const ASKS_TOTAL = 3.0

/** What training adds: the step it missed, and the two columns Michelle wanted. */
export const TAUGHT_STEP = "Size the freight allowance"
export const FREIGHT_ASK = { ask: "Freight allowance", today: "2%", target: "1.5%", worth: 0.48, lastYear: "2%, no change", counter: "1.75%", why: "We ship 92% full truckloads; the allowance assumes partials" }
export const TAUGHT_TOTAL = 3.48
export const TEACH_ASK = "You missed the freight allowance, and the table needs last year's terms and Amazon's likely counter"

export const NEGOTIATION_SLIDES: RetroSlide[] = [
  {
    id: "volume",
    question: "Where does our volume sit?",
    eyebrow: "FY26 Amazon AVN · Portfolio",
    title: "61% of our volume works for both of us",
    chart: {
      kind: "rows",
      bars: [
        { label: "Mutual win", value: 61, display: "61%", tone: "accent" },
        { label: "Amazon wins, we're weak", value: 12, display: "12%", tone: "muted" },
        { label: "We win, Amazon's weak", value: 19, display: "19%", tone: "loss" },
        { label: "Mutual loss", value: 8, display: "8%", tone: "muted" },
      ],
    },
    insights: [
      { figure: "$96M", text: "shipped COGS across 13 product lines" },
      { figure: "19%", text: "where Amazon's net PPM is under 25%: the pressure point", loss: true },
    ],
  },
  {
    id: "pressure",
    question: "Where will Amazon push?",
    eyebrow: "FY26 Amazon AVN · Pressure",
    title: "Three gift and tin lines make money for us but not for Amazon",
    chart: {
      kind: "rows",
      bars: [
        { label: "Soy Candle Trio Gift Set", value: 14, display: "14%", tone: "loss" },
        { label: "3-Wick Holiday Gift Set", value: 17, display: "17%", tone: "loss" },
        { label: "Travel Tin Trio", value: 12, display: "12%", tone: "loss" },
      ],
    },
    insights: [
      { figure: "25%", text: "Amazon's net PPM target" },
      { figure: "$18M", text: "of volume on these three lines" },
      { figure: "$2.2M", text: "a year of ad spend behind them" },
    ],
  },
  {
    id: "terms",
    question: "What do we ask for?",
    eyebrow: "FY26 Amazon AVN · Terms",
    title: "The new mix is worth $2.18M a year, $6.5M over 3 years",
    chart: {
      kind: "rows",
      zeroAt: 0.3,
      bars: [
        { label: "Damage allowance", value: 1.44, display: "+$1.44M", tone: "accent" },
        { label: "Co-op", value: 0.96, display: "+$960K", tone: "accent" },
        { label: "Deal funding", value: 0.48, display: "+$480K", tone: "accent" },
        { label: "Cost price", value: 0.36, display: "+$360K", tone: "accent" },
        { label: "Growth rebate", value: -1.06, display: "−$1.06M", tone: "loss" },
      ],
    },
    insights: [
      { figure: "0.6%", text: "actual damage against a 3% allowance" },
      { figure: "1%", text: "growth rebate offered in place of more co-op" },
    ],
  },
  {
    id: "recovery",
    question: "What do we recover?",
    eyebrow: "FY26 Amazon AVN · Recovery",
    title: "$600K in chargebacks and shortages, proof already drafted",
    chart: {
      kind: "rows",
      bars: [
        { label: "Chargeback disputes", value: 350, display: "$350K", tone: "ops" },
        { label: "Shorted POs", value: 250, display: "$250K", tone: "ops" },
      ],
    },
    insights: [
      { figure: "9", text: "chargeback claims with proof attached" },
      { figure: "6", text: "shorted POs with shipped quantities" },
    ],
  },
  {
    id: "next",
    question: "How do we run it?",
    eyebrow: "FY26 Amazon AVN · Plan",
    title: "Lead with the mutual wins, then trade growth for terms",
    chart: { kind: "list", items: ["Open on the 61% that works for both of us", "Fix the 3 gift and tin lines: +2% cost with a margin guarantee", "Offer a growth rebate in place of more co-op", "Close on damage: 0.6% actual against 3%"] },
    insights: [{ figure: "$2.18M", text: "a year if the mix lands" }],
  },
]
