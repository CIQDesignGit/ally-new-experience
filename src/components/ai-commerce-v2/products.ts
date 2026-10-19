import { OURS, type Sku } from "./data"

export const RETAILERS = ["Amazon", "Walmart", "Kroger"] as const
export type Retailer = (typeof RETAILERS)[number]

/**
 * One field of the page as the agent reads it, per retailer, next to the leader's value on Amazon.
 * null = not on the page. `ally` = the value Ally would fill and where it came from.
 */
export type Field = {
  name: string
  values: Record<Retailer, string | null>
  bounty: string | null
  conflict?: boolean
  ally?: { value: string; source: string }
}

export type Product = {
  sku: Sku
  asin: string
  fields: Field[]
  /** The page today and after Ally's rewrite, on Amazon. */
  page: { title: string; bullets: string[] }
  rewrite: { title: string; bullets: string[] }
}

const R = (amazon: string | null, walmart: string | null, kroger: string | null): Record<Retailer, string | null> => ({ Amazon: amazon, Walmart: walmart, Kroger: kroger })

export const PRODUCTS: Product[] = [
  {
    sku: OURS[0],
    asin: "B07XBRAWNY1",
    fields: [
      { name: "Title", values: R("Brawny Tear-A-Square Paper Towels, 12 Double Rolls = 24 Regular Rolls, 3 Sheet Size Options", "Brawny Paper Towels, 12 Double Rolls = 24 Regular Rolls, 3 Sheet Sizes", "Brawny Tear-A-Square Paper Towels, 6 Double Rolls"), bounty: "Bounty Select-A-Size Paper Towels, 12 Double Rolls = 24 Regular Rolls, 90 Sheets Per Roll, 2-Ply", conflict: true, ally: { value: "Brawny Tear-A-Square Paper Towels, 12 Double Rolls, 120 Sheets Each, Quarter Sheets, 2-Ply", source: "Rendered to each retailer's title rule" } },
      { name: "Pack count", values: R("12 Double rolls", "12 Double rolls", "6 Double rolls"), bounty: "12 Double rolls", conflict: true, ally: { value: "12 Double rolls", source: "Brand product data" } },
      { name: "Sheets per roll", values: R(null, null, "120"), bounty: "90", ally: { value: "120", source: "Brand product data" } },
      { name: "Ply", values: R("2", null, null), bounty: "2", ally: { value: "2-ply", source: "Amazon listing; 19 of top 20 fill it" } },
      { name: "Septic safe", values: R(null, null, null), bounty: "Yes", ally: { value: "Yes", source: "Brand spec sheet" } },
      { name: "Sheet size", values: R("Quarter, half, full", "Half, full", "Half, full"), bounty: "Half, full", conflict: true, ally: { value: "Quarter, half, full", source: "Brand product data" } },
      { name: "Price per 100 sheets", values: R("Not shown", "Not shown", "$3.42"), bounty: "$2.05", ally: { value: "$1.62", source: "Computed from 1,440 sheets" } },
      { name: "Wet strength claim", values: R(null, null, null), bounty: "“2x more absorbent*” with footnote", ally: { value: "Holds up when wet: rated 4.8 for strength by 2,300 reviewers", source: "Reviews" } },
      { name: "Use cases", values: R("Kitchen", "Kitchen", null), bounty: "Kitchen, pets, kids, outdoors", ally: { value: "Kitchen, pet messes, kids, hosting", source: "410 pet mentions, 190 kid mentions in reviews" } },
      { name: "Buy box", values: R("Lost Oct 3 · 3P seller $31.99", "Won", "Won"), bounty: "Won" },
      { name: "In stock", values: R("Yes", "Yes", "Yes"), bounty: "Yes" },
      { name: "Rating", values: R("4.6 · 40,210 reviews", "4.5 · 3,180 reviews", "4.4 · 212 reviews"), bounty: "4.8 · 112,400 reviews" },
      { name: "Open questions", values: R("12 unanswered", "3 unanswered", null), bounty: "Answered within 48 hours" },
      { name: "Sources that cite it", values: R("None", null, null), bounty: "Wirecutter, Good Housekeeping, Reddit", ally: { value: "Pitch drafted to all three", source: "ChatGPT's cited sources" } },
      { name: "Last page update", values: R("Mar 2026", "Mar 2026", "Nov 2025"), bounty: "Sep 2026" },
    ],
    page: {
      title: "Brawny Tear-A-Square Paper Towels, 12 Double Rolls = 24 Regular Rolls, 3 Sheet Size Options",
      bullets: ["12 Double rolls equal 24 Regular rolls", "Tear-A-Square: quarter, half and full sheets", "Strong and absorbent", "Great for everyday kitchen use"],
    },
    rewrite: {
      title: "Brawny Tear-A-Square Paper Towels, 12 Double Rolls, 120 Sheets Each, Quarter Sheets, 2-Ply",
      bullets: [
        "Holds up when wet: rated 4.8 for strength by 2,300 reviewers",
        "Tear off a quarter sheet for small jobs, a full sheet for big spills",
        "Cleans up after dogs and kids: 410 reviewers use it for pet and kid messes",
        "12 Double rolls, 120 sheets per roll, $1.62 per 100 sheets, septic safe",
        "Thanksgiving hosting: strong enough for the kitchen, soft enough for the table",
      ],
    },
  },
  {
    sku: OURS[1],
    asin: "B07XBRAWNY2",
    fields: [
      { name: "Title", values: R("Brawny Pick-A-Size Paper Towels, 6 Triple Rolls = 18 Regular Rolls", "Brawny Pick-A-Size Paper Towels, 6 Triple Rolls", "Brawny Pick-A-Size, 6 Triple Rolls"), bounty: "Bounty Select-A-Size Paper Towels, 6 Triple Rolls = 18 Regular Rolls, 2-Ply", ally: { value: "Brawny Pick-A-Size Paper Towels, 6 Triple Rolls, 165 Sheets Each, Half Sheets, 2-Ply", source: "Rendered to each retailer's title rule" } },
      { name: "Pack count", values: R("6 Triple rolls", "6 Triple rolls", "6 Triple rolls"), bounty: "6 Triple rolls" },
      { name: "Sheets per roll", values: R(null, "165", "165"), bounty: "135", ally: { value: "165", source: "Brand product data" } },
      { name: "Ply", values: R("2", null, null), bounty: "2", ally: { value: "2-ply", source: "Amazon listing" } },
      { name: "Septic safe", values: R(null, null, null), bounty: "Yes", ally: { value: "Yes", source: "Brand spec sheet" } },
      { name: "Sheet size", values: R("Half, full", "Half, full", "Half, full"), bounty: "Half, full" },
      { name: "Price per 100 sheets", values: R("Not shown", "Not shown", "$1.59"), bounty: "$2.11", ally: { value: "$1.48", source: "Computed from 990 sheets" } },
      { name: "Wet strength claim", values: R("Strong when wet", null, null), bounty: "“2x more absorbent*” with footnote", conflict: true, ally: { value: "Strong when wet, on every retailer", source: "Amazon listing" } },
      { name: "Use cases", values: R(null, null, null), bounty: "Kitchen, pets, kids, outdoors", ally: { value: "Kitchen grease, kid messes, party napkins", source: "Review themes" } },
      { name: "Buy box", values: R("Won", "Won", "Won"), bounty: "Won" },
      { name: "In stock", values: R("Yes", "Yes", "Low"), bounty: "Yes" },
      { name: "Rating", values: R("4.6 · 18,420 reviews", "4.6 · 2,040 reviews", "4.5 · 96 reviews"), bounty: "4.8 · 64,100 reviews" },
      { name: "Open questions", values: R("12 unanswered", null, null), bounty: "Answered within 48 hours" },
      { name: "Sources that cite it", values: R("None", null, null), bounty: "Wirecutter, Good Housekeeping" },
      { name: "Last page update", values: R("Mar 2026", "Jan 2026", "Nov 2025"), bounty: "Sep 2026" },
    ],
    page: {
      title: "Brawny Pick-A-Size Paper Towels, 6 Triple Rolls = 18 Regular Rolls",
      bullets: ["6 Triple rolls equal 18 Regular rolls", "Pick-A-Size half sheets", "Strong when wet", "Absorbent"],
    },
    rewrite: {
      title: "Brawny Pick-A-Size Paper Towels, 6 Triple Rolls, 165 Sheets Each, Half Sheets, 2-Ply",
      bullets: [
        "Strong when wet, on every retailer's page",
        "Family messes: half sheets for kids' spills, full sheets for the big ones",
        "Kitchen grease and frying: absorbs oil without falling apart",
        "6 Triple rolls, 165 sheets per roll, $1.48 per 100 sheets, septic safe",
      ],
    },
  },
  {
    sku: OURS[2],
    asin: "B07XBRAWNY3",
    fields: [
      { name: "Title", values: R("Brawny Professional Shop Towels, 3 Rolls, Solvent and Oil Resistant", "Brawny Professional Shop Towels, 3 Rolls", null), bounty: null },
      { name: "Pack count", values: R("3 rolls", "3 rolls", null), bounty: null },
      { name: "Sheets per roll", values: R("55", "55", null), bounty: null },
      { name: "Ply", values: R("1", "1", null), bounty: null },
      { name: "Septic safe", values: R("No", "No", null), bounty: null },
      { name: "Sheet size", values: R("Full", "Full", null), bounty: null },
      { name: "Price per 100 sheets", values: R("$6.10", "$5.90", null), bounty: null },
      { name: "Wet strength claim", values: R("Solvent and oil resistant", "Solvent and oil resistant", null), bounty: null },
      { name: "Use cases", values: R("Garage, shop, kitchen grease", "Garage, shop", null), bounty: null },
      { name: "Buy box", values: R("Won", "Won", null), bounty: null },
      { name: "In stock", values: R("Yes", "Yes", "Not listed"), bounty: null },
      { name: "Rating", values: R("4.7 · 6,110 reviews", "4.6 · 410 reviews", null), bounty: null },
      { name: "Open questions", values: R("2 unanswered", null, null), bounty: null },
      { name: "Sources that cite it", values: R("Reddit", null, null), bounty: null },
      { name: "Last page update", values: R("Aug 2026", "Aug 2026", null), bounty: null },
    ],
    page: {
      title: "Brawny Professional Shop Towels, 3 Rolls, Solvent and Oil Resistant",
      bullets: ["Solvent and oil resistant", "Garage, shop and kitchen grease", "55 full sheets per roll", "3 rolls"],
    },
    rewrite: {
      title: "Brawny Professional Shop Towels, 3 Rolls, 55 Sheets Each, Solvent and Oil Resistant",
      bullets: ["Solvent and oil resistant", "Garage, shop and kitchen grease", "55 full sheets per roll", "3 rolls"],
    },
  },
]
