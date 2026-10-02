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
export const COST_FILE = [{ name: "FY26 manufacturing cost by SKU.xlsx", size: "410 KB", src: "", kind: "email" as const }]

/** The steps Ally found in last year's work, and where each one's data comes from. */
export const SKILL_STEPS = [
  { text: "Pull 12 months of sales and margin by SKU", source: "Vendor Central", ok: true },
  { text: "Size chargebacks and shortages by type", source: "Ally's queue", ok: true },
  { text: "Benchmark co-op and allowance rates against the category", source: "Ally's market data", ok: true },
  { text: "Model margin under 3 term scenarios", source: "Manufacturing cost by SKU", ok: false },
  { text: "Rank the asks by dollar value", source: "Built from the steps above", ok: true },
  { text: "Build the negotiation deck", source: "Ally's deck builder", ok: true },
]

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
    id: "asks",
    question: "What are we asking for?",
    eyebrow: "FY26 Amazon terms · The asks",
    title: "Three asks worth $3.0M a year in margin",
    chart: {
      kind: "rows",
      bars: [
        { label: "Damage allowance", value: 1.44, display: "$1.44M", tone: "accent" },
        { label: "Co-op", value: 0.96, display: "$960K", tone: "accent" },
        { label: "Chargebacks", value: 0.6, display: "$600K", tone: "accent" },
      ],
    },
    insights: [
      { figure: "$3.0M", text: "a year in margin across the three" },
      { figure: "$96M", text: "Amazon buys from us a year, at cost" },
    ],
  },
  {
    id: "damage",
    question: "Why lower the damage allowance?",
    eyebrow: "FY26 Amazon terms · Damage allowance",
    title: "We pay 3% for damage that runs 0.6%",
    chart: {
      kind: "columns",
      bars: [
        { label: "Allowance", value: 3, display: "3%", tone: "muted" },
        { label: "Actual damage", value: 0.6, display: "0.6%", tone: "accent" },
        { label: "Our ask", value: 1.5, display: "1.5%", tone: "accent" },
      ],
    },
    insights: [
      { figure: "$1.44M", text: "a year at 1.5 points on $96M" },
      { figure: "0.6%", text: "damage rate, last 12 months" },
    ],
  },
  {
    id: "coop",
    question: "Why lower co-op?",
    eyebrow: "FY26 Amazon terms · Co-op",
    title: "Our co-op is 1.5 points above the category, and we're growing faster",
    chart: {
      kind: "columns",
      bars: [
        { label: "Ours today", value: 7, display: "7%", tone: "muted" },
        { label: "Category median", value: 5.5, display: "5.5%", tone: "muted" },
        { label: "Our ask", value: 6, display: "6%", tone: "accent" },
      ],
    },
    insights: [
      { figure: "$960K", text: "a year at 1 point on $96M" },
      { figure: "+28%", text: "our Prime Day growth, 2 points above the market" },
    ],
  },
  {
    id: "recovery",
    question: "What do we recover?",
    eyebrow: "FY26 Amazon terms · Recovery",
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
    question: "What happens before the meeting?",
    eyebrow: "FY26 Amazon terms · Next steps",
    title: "Three things to do before the meeting",
    chart: { kind: "list", items: ["Dispute the $350K of chargebacks so they're settled first", "Send Dana the asks as a pre-read", "Walk in with this deck"] },
    insights: [{ figure: "$3.0M", text: "a year if all three asks land" }],
  },
]
