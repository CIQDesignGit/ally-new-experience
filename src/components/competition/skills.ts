/**
 * The Agent Console's other live skills for Aurelle: the vision demo's use cases,
 * run on the same harness as competition watch. Each lists its SKILL.md, the
 * tests it passed and where Michelle uses it, so the console shows every use case
 * without walking through each build. Figures tie to the customer screens.
 */
import { GIFT_QUESTION } from "../nudge/alerts/data"

export interface LiveSkill {
  id: string
  name: string
  does: string
  /** How a person starts it. */
  trigger: string
  version: number
  author: string
  published: string
  lastRun: string
  /** Where it shows up for the customer. */
  usedBy: { label: string; href: string }
  files: string[]
  skill: string
  tests: { name: string; customer: string }[]
}

export const LIVE_SKILLS: LiveSkill[] = [
  {
    id: "prime-day-deck",
    name: "Event recap deck",
    does: "Turns a retail event into a storyline, a dashboard and a deck in the account's brand template",
    trigger: "Michelle asks for a recap of Prime Day",
    version: 4,
    author: "Nora Diaz",
    published: "Jul 2",
    lastRun: "Jul 16, 8:10 AM",
    usedBy: { label: "Prime Day dashboard", href: "/michelle/dashboards/prime-day" },
    files: ["SKILL.md", "event_sales.sql", "ally_added.sql", "deck_template.json"],
    skill: `# Event recap deck

Recap a retail event for this account, then build the deck.

## Steps
1. Run event_sales.sql for the event dates against the same days last year.
2. Split sales by category and by deal type.
3. Run ally_added.sql: what each agent added, measured against the 4 weeks before.
4. Propose a storyline: one question per slide, the answer as the title.
5. Wait for the person to reorder or cut slides.
6. Build the deck in the account's brand template, and a live dashboard of the same charts.
7. Every number comes from a query. Name the date range on every slide.`,
    tests: [
      { name: "Prime Day 2026 totals", customer: "Aurelle" },
      { name: "Prime Day 2025 totals", customer: "Aurelle" },
      { name: "Category split adds up", customer: "Aurelle" },
      { name: "Ally-added, measured window", customer: "Aurelle" },
      { name: "Brand template applied", customer: "Aurelle" },
      { name: "Black Friday recap", customer: "Juniper Home" },
      { name: "Big Spring Sale recap", customer: "Larkspur Pet" },
    ],
  },
  {
    id: "gap-analysis",
    name: "Gap analysis",
    does: "Explains why a product line is behind: splits sales into traffic, conversion and price, then names the cause",
    trigger: `Michelle asks "${GIFT_QUESTION}"`,
    version: 6,
    author: "Nora Diaz",
    published: "Sep 30",
    lastRun: "Oct 8, 9:12 AM",
    usedBy: { label: "Gift sets thread", href: "/michelle/c/gift-sets" },
    files: ["SKILL.md", "sales_drivers.sql", "sov_by_term.sql", "competitor_prices.sql"],
    skill: `# Gap analysis

Why is a product line behind last year or plan?

## Steps
1. Run sales_drivers.sql for the last 4 weeks against last year.
2. Split the change: sales = traffic × conversion × price.
3. Take the biggest driver. For traffic, run sov_by_term.sql on the line's search terms.
4. Run competitor_prices.sql on matched products.
5. Name the cause in one line, then show the numbers.
6. Offer the fixes Ally can make, and an alert so it's caught next time.`,
    tests: [
      { name: "Gift sets, weeks of Sep 7 to Sep 28", customer: "Aurelle" },
      { name: "Drivers multiply to the sales change", customer: "Aurelle" },
      { name: "Traffic named as the cause", customer: "Aurelle" },
      { name: "Jar candles on plan (no gap)", customer: "Aurelle" },
      { name: "Price-led gap", customer: "Juniper Home" },
      { name: "Conversion-led gap", customer: "Larkspur Pet" },
    ],
  },
  {
    id: "negotiation-prep",
    name: "Vendor negotiation prep",
    does: "Preps the annual Amazon vendor negotiation: sizes every term, models margin, ranks the asks and builds the deck",
    trigger: 'Michelle says "open my negotiation prep"',
    version: 2,
    author: "Ally, from last year's prep",
    published: "Oct 6",
    lastRun: "Oct 6, 3:40 PM",
    usedBy: { label: "Amazon vendor negotiation", href: "/michelle/c/negotiation" },
    files: ["SKILL.md", "amazon_margin.sql", "terms.sql", "brand_margin.xlsx"],
    skill: `# Vendor negotiation prep

Prep the annual Amazon vendor negotiation.

## Steps
1. Confirm Amazon's numbers: net PPM, contribution margin, price, shipped COGS.
2. Lay the brand's margin over Amazon's, product by product.
3. Read the current terms from last year's agreement.
4. Map volume into the four profitability quadrants.
5. Find the volume where either side loses, with ad spend.
6. Size the freight allowance.
7. Recommend the contra COGS mix and the cost of each concession.
8. Rank the asks with last year's terms and Amazon's likely counter.
9. Build the negotiation deck.`,
    tests: [
      { name: "13 product lines, $96M COGS", customer: "Aurelle" },
      { name: "Quadrants add to 100%", customer: "Aurelle" },
      { name: "Freight allowance sized", customer: "Aurelle" },
      { name: "Asks ranked, with counters", customer: "Aurelle" },
      { name: "Deck builds from the asks", customer: "Aurelle" },
    ],
  },
]
