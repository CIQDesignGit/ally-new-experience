/**
 * "Borrow a harness": six use cases in three steps. An FDE builds in Claude
 * Code, tests and publishes inside CommerceIQ, and the customer sees it in Ally. Figures reuse the demo's own data so they
 * tie: the Prime Day retro, Michelle's two custom alerts, gap to plan by weight.
 */
import { FILL, inMeasure } from "../nudge/ops/gap-training"
import { GAP_TREE, GAP_WEEK } from "../nudge/ops/gap-data"
import { BRAND_TERMS, GIFT_TERMS } from "../nudge/alerts/data"

export type UseCaseId = "dashboard" | "alerts" | "pounds" | "teach" | "eval" | "regen"

/** One line in the Claude Code terminal. */
export interface Line {
  kind: "user" | "think" | "tool" | "out" | "file" | "ok" | "warn"
  text: string
}

export interface Check {
  label: string
  detail: string
  status: "pass" | "warn" | "fail"
}

export interface UseCase {
  id: UseCaseId
  label: string
  /** Who sees it at run time. */
  persona: string
  /** How this works today, in one line. */
  today: string
  /** How it works when we borrow the harness. */
  now: string
  workshop: { ask: string; lines: Line[]; files: { path: string; note: string }[] }
  publish: {
    title: string
    checks: Check[]
    table?: { head: string[]; rows: string[][] }
    routed?: { what: string; where: string }[]
    scope: string
    modes?: { id: string; label: string; detail: string }[]
    primary: string
    confirm: string
  }
  floor: { title: string; points: string[]; href?: string; cta?: string }
}

export const FDE = "Nora Diaz, FDE"
export const APPROVER = "Lena Brooks, FDE lead"

/** Last week's gap to plan, from the same data Michelle's gap page reads, in dollars and in pounds. */
const WEEK_GAP = GAP_TREE.lastWeek.sales - GAP_TREE.lastWeek.plan
const GAP_LBS = inMeasure(WEEK_GAP, "weight", true)
const GAP_USD = inMeasure(WEEK_GAP, "sales", true)

export const USE_CASES: UseCase[] = [
  {
    id: "dashboard",
    label: "Prime Day recap dashboard",
    persona: "Michelle",
    today: "FDEs build dashboards outside the product; customers get a separate link",
    now: "Built in Claude Code, published as a tab under Dashboards",
    workshop: {
      ask: "Build Aurelle's Prime Day recap dashboard: sales vs last year and the market, what Ally added by agent, deals and categories.",
      lines: [
        { kind: "think", text: "Using skill fde-dashboard-workflow" },
        { kind: "tool", text: "brain.list_dataspaces()" },
        { kind: "out", text: "amazon_dataspace · Aurelle Candles · Amazon US" },
        { kind: "tool", text: 'brain.discover_fields("prime day sales, deals, sponsored share, units")' },
        { kind: "out", text: "total_pos, deal_type, sponsored_share, ordered_units and 6 more" },
        { kind: "tool", text: 'brain.answer_query("Prime Day 2026 sales vs Prime Day 2025")' },
        { kind: "out", text: "$4.6M, up 28% · market up 26%" },
        { kind: "ok", text: "Matches Vendor Central for Jul 14–15" },
        { kind: "file", text: "app/api/prime-day/route.ts" },
        { kind: "file", text: "app/dashboards/PrimeDayRecap.tsx · 6 tiles" },
        { kind: "user", text: "Add a tile for the 4 lessons we're keeping for Black Friday." },
        { kind: "file", text: "app/dashboards/LessonsTile.tsx" },
        { kind: "tool", text: "npm run build" },
        { kind: "out", text: "Build succeeded · source: bi-semantic (live, not mock)" },
        { kind: "ok", text: "app/ is ready, you can publish it now" },
      ],
      files: [
        { path: "app/api/prime-day/route.ts", note: "Queries through the data MCP; client filter added by the platform" },
        { path: "app/dashboards/PrimeDayRecap.tsx", note: "6 tiles, filters for category, agent and deal" },
        { path: "app/dashboards/LessonsTile.tsx", note: "Aurelle-only tile" },
      ],
    },
    publish: {
      title: "Pre-flight checks",
      checks: [
        { label: "Config", detail: "4 of 4 keys set", status: "pass" },
        { label: "Dashboard key", detail: "aurelle-prime-day-recap--2026-10-08--nora", status: "pass" },
        { label: "Clean build", detail: "Mock files and caches removed", status: "pass" },
        { label: "Live data", detail: "source: bi-semantic · $4.6M matches", status: "pass" },
        { label: "Route", detail: "Registered under Dashboards", status: "pass" },
        { label: "Catalog", detail: "Registered · embed link created", status: "pass" },
      ],
      scope: "Aurelle Candles · Amazon US",
      modes: [
        { id: "draft", label: "Draft", detail: "Our team only" },
        { id: "publish", label: "Publish", detail: "Everyone at Aurelle with access" },
      ],
      primary: "Publish",
      confirm: "Prime Day retro goes live under Dashboards for Aurelle.",
    },
    floor: {
      title: "Michelle opens Dashboards",
      points: ["$4.6M Prime Day sales, up 28%", "+2 pts faster than the market", "$410K added by Ally", "Ask Ally answers follow-ups on the dashboard"],
      href: "/michelle/dashboards/prime-day",
      cta: "Michelle's Prime Day retro",
    },
  },
  {
    id: "alerts",
    label: "Custom alerts",
    persona: "Michelle",
    today: "Built-in alerts only; anything account-specific waits for engineering",
    now: "FDE writes and back-tests the alert, Aurelle gets it the same day",
    workshop: {
      ask: `From the Prime Day retro: alert when a competitor passes 20% share of voice on our ${BRAND_TERMS.length} brand terms, and when our share drops below 20% on ${GIFT_TERMS.length} gift terms. Every morning, by email.`,
      lines: [
        { kind: "think", text: "Using skill alert-builder" },
        { kind: "tool", text: 'brain.discover_fields("sponsored share of voice by search term")' },
        { kind: "out", text: "sov_by_term · daily · Amazon US" },
        { kind: "tool", text: `brain.discover_values("search_term", ${BRAND_TERMS.length + GIFT_TERMS.length} terms)` },
        { kind: "out", text: `${BRAND_TERMS.length + GIFT_TERMS.length} of ${BRAND_TERMS.length + GIFT_TERMS.length} terms found` },
        { kind: "tool", text: "backtest(alerts, Jul 1 – Oct 7)" },
        { kind: "out", text: "Brand terms: fired 9 days, Brightwick every time" },
        { kind: "out", text: "Gift terms: fired 14 days, all in the 3 weeks after Prime Day" },
        { kind: "ok", text: "Today: Brightwick at 27% on brand terms · our gift share 18%" },
        { kind: "file", text: "alerts/aurelle-brand-terms.yaml" },
        { kind: "file", text: "alerts/aurelle-gift-terms.yaml" },
        { kind: "user", text: "Brand terms on autopilot, up to $4K a week. Gift terms one approval away." },
        { kind: "file", text: "alerts/aurelle-actions.yaml · caps enforced in code" },
      ],
      files: [
        { path: "alerts/aurelle-brand-terms.yaml", note: `${BRAND_TERMS.length} terms · above 20% · every morning` },
        { path: "alerts/aurelle-gift-terms.yaml", note: `${GIFT_TERMS.length} terms · below 20% · every morning` },
        { path: "alerts/aurelle-actions.yaml", note: "Autopilot capped at $4K a week" },
      ],
    },
    publish: {
      title: "Test on real history",
      checks: [
        { label: "Terms resolve", detail: `${BRAND_TERMS.length + GIFT_TERMS.length} of ${BRAND_TERMS.length + GIFT_TERMS.length} found in search data`, status: "pass" },
        { label: "Back-test", detail: "Jul 1 – Oct 7 · 23 fires, each on a real share move", status: "pass" },
        { label: "Fires today", detail: "Brightwick 27% on brand terms · our gift share 18%", status: "warn" },
        { label: "Action limits", detail: "Autopilot up to $4K a week, in code", status: "pass" },
        { label: "Review", detail: "Approver isn't the author", status: "pass" },
      ],
      scope: "Aurelle Candles only",
      primary: "Publish 2 alerts",
      confirm: "Both alerts go live for Aurelle tomorrow morning.",
    },
    floor: {
      title: "Michelle opens Alerts",
      points: ["Competitors on our brand terms · on autopilot", "Our share on gift terms · one approval away", "The media agent is already acting on Brightwick's 27%"],
      href: "/michelle/alerts",
      cta: "Michelle's alerts",
    },
  },
  {
    id: "pounds",
    label: "Gap to plan in pounds",
    persona: "Michelle",
    today: "Gap to plan runs in dollars; Aurelle plans in pounds shipped",
    now: "FDE loads their weights and plan, and gap to plan runs in pounds",
    workshop: {
      ask: "Aurelle plans in shipped weight. Load their item weights and pounds plan, run gap to plan in pounds, and check fill rate on POs.",
      lines: [
        { kind: "user", text: "Uploaded aurelle_item_weights.xlsx and aurelle_q4_plan_lbs.xlsx" },
        { kind: "tool", text: "customer_data.upload(template: numeric attribute, key: ASIN)" },
        { kind: "out", text: "Matched 99.9% of units · 2 SKUs quarantined (no weight)" },
        { kind: "tool", text: "customer_data.upload(template: plan, grain: week, calendar: retail)" },
        { kind: "out", text: "Normalised to daily · covers Oct 1 – Dec 31" },
        { kind: "tool", text: 'register_metric("shipped_weight_lbs", "SUM(units × weight)")' },
        { kind: "out", text: "Computed per row, never on totals" },
        { kind: "tool", text: `brain.answer_query("gap to plan last week, ${GAP_WEEK.last}, in $ and lbs")` },
        { kind: "out", text: `${GAP_USD} in sales · ${GAP_LBS} shipped` },
        { kind: "ok", text: `Fill rate ${FILL.rate}% on ${FILL.pos} POs (target ${FILL.target}%) explains the Bright Citrus stockout` },
        { kind: "file", text: "recipes/aurelle-gap-to-plan.md" },
      ],
      files: [
        { path: "data/aurelle_item_weights", note: "Numeric attribute · per SKU · history kept" },
        { path: "data/aurelle_q4_plan_lbs", note: "Plan · daily · retail calendar" },
        { path: "recipes/aurelle-gap-to-plan.md", note: "Measure: weight · checks fill rate · shows units, weight, fill" },
      ],
    },
    publish: {
      title: "Check the data before it goes live",
      checks: [
        { label: "Coverage", detail: "99.9% of units matched · above the 98% bar", status: "pass" },
        { label: "Missing weights", detail: "2 SKUs shown as excluded, not dropped", status: "warn" },
        { label: "Pounds per row", detail: "SUM(units × weight), not totals × weight", status: "pass" },
        { label: "Totals reconcile", detail: "Dollar facts unchanged after the join", status: "pass" },
        { label: "Isolation", detail: "Visible to Aurelle only, closed by default", status: "pass" },
      ],
      scope: "Aurelle Candles · Amazon US",
      primary: "Publish to Aurelle",
      confirm: "Gap to plan runs in pounds for Aurelle, with fill rate on POs.",
    },
    floor: {
      title: "Michelle asks why the business missed plan last week",
      points: ["The answer runs in pounds shipped", "Causes ranked by weight", `Fill rate ${FILL.rate}% on ${FILL.pos} POs behind the Bright Citrus stockout`],
      href: "/michelle/gap",
      cta: "Michelle's gap to plan",
    },
  },
  {
    id: "teach",
    label: "Teach from documents",
    persona: "Mike",
    today: "Decks go through an endpoint nobody sees; no one knows what reached each SKU",
    now: "FDE uploads the deck, reviews the rules it found, and approves them",
    workshop: {
      ask: "Aurelle sent their Q4 brand book and Amazon's title rule update. Turn them into rules, flag conflicts, and show which SKUs each rule reaches.",
      lines: [
        { kind: "user", text: "Uploaded aurelle_brand_book_q4.pdf (24 slides) and amazon_title_update.pdf" },
        { kind: "tool", text: "convert_to_markdown(2 files)" },
        { kind: "out", text: "24 of 24 slides, 6 of 6 pages · tables kept" },
        { kind: "think", text: "Extracting rules, each tied to its source slide" },
        { kind: "out", text: "14 rules found · 2 already in Knowledge" },
        { kind: "warn", text: "Conflict: brand book says lead with the scent; Amazon says lead with the brand" },
        { kind: "out", text: "Proposed order: retailer rule, then legal, then brand voice" },
        { kind: "tool", text: "apply_rules(20 sample SKUs)" },
        { kind: "out", text: "12 live titles break the title rule · rewrites drafted" },
        { kind: "file", text: "knowledge/aurelle-q4-rules.csv · 12 new rules" },
        { kind: "file", text: "tests/aurelle-title-rules.yaml · 20 cases" },
      ],
      files: [
        { path: "knowledge/aurelle-q4-rules.csv", note: "One row per rule: text, scope, source slide, priority" },
        { path: "tests/aurelle-title-rules.yaml", note: "20 SKUs with the expected result" },
      ],
    },
    publish: {
      title: "Review the rules Ally found",
      checks: [
        { label: "Extracted", detail: "14 rules · 2 duplicates merged · 12 new", status: "pass" },
        { label: "Conflict", detail: "Scent-first vs brand-first, resolved by priority", status: "warn" },
        { label: "Sources", detail: "Every rule links to its slide", status: "pass" },
        { label: "Tests", detail: "20 of 20 sample SKUs as expected", status: "pass" },
      ],
      table: {
        head: ["Rule", "Applies to", "Source"],
        rows: [
          ["Lead with the brand, then scent, then size", "All Amazon titles", "Amazon update, p. 2"],
          ["Never claim “non-toxic”", "All SKUs", "Brand book, slide 18"],
          ["Say “hand-poured” on jar candles", "Jar candles", "Brand book, slide 7"],
          ["Name the burn time when it's over 50 hours", "Jar candles", "Brand book, slide 9"],
        ],
      },
      scope: "Aurelle Candles · Amazon US",
      primary: "Approve 12 rules",
      confirm: "12 rules join Aurelle's context. Each SKU gets only the rules that apply to it.",
    },
    floor: {
      title: "Mike sees the result",
      points: ["12 live titles break the title rule", "Compliant rewrites ready, one approval away", "Every rewrite shows the rule and slide it came from"],
    },
  },
  {
    id: "eval",
    label: "Content evals",
    persona: "Mike",
    today: "MLE re-tunes and re-checks by hand; results come back next week",
    now: "FDE changes the template, evals run on what changed, then Promote",
    workshop: {
      ask: "I changed the jar candle title template to lead with the scent after the brand. Re-run evals for Aurelle jar candles and tell me if it's ready to promote.",
      lines: [
        { kind: "tool", text: "workbench.run(brand: Aurelle, type: jar_candles)" },
        { kind: "out", text: "48 of 59 SKUs changed inputs · 11 keep their scores" },
        { kind: "out", text: "Cost estimate $3.40 · confirmed" },
        { kind: "tool", text: "eval.run(layers: 0–3)" },
        { kind: "out", text: "Hard rules 100% · retailer policy 98% · quality scorecard 93%" },
        { kind: "warn", text: "3 SKUs fail structure match → the template's slot order" },
        { kind: "user", text: "Move size after scent and re-run those 3." },
        { kind: "out", text: "3 of 3 pass · quality scorecard 96%" },
        { kind: "file", text: "templates/jar_candles.yaml · v4" },
      ],
      files: [{ path: "templates/jar_candles.yaml", note: "v4 · brand, scent, size, burn time" }],
    },
    publish: {
      title: "Evals",
      checks: [
        { label: "Changed only", detail: "48 of 59 SKUs re-ran · 11 kept their scores", status: "pass" },
        { label: "Cost", detail: "$3.40, confirmed before running", status: "pass" },
        { label: "Few-shot examples", detail: "3 approved titles for this type", status: "pass" },
      ],
      table: {
        head: ["Layer", "Checks", "Score"],
        rows: [
          ["0", "Hard brand and retailer rules", "100%"],
          ["1", "Retailer content policy", "98%"],
          ["2", "24-check quality scorecard", "96%"],
          ["3", "LLM judge", "4 suggestions"],
        ],
      },
      routed: [
        { what: "2 SKUs miss the keyword “soy wax”", where: "Check keyword mapping" },
        { what: "1 SKU: grounding fails, no clear cause", where: "Raise to engineering" },
      ],
      scope: "Aurelle Candles · jar candles",
      primary: "Promote",
      confirm: "Jar candles (59 SKUs) go to Mike's queue. Gift sets haven't cleared and stay in staging.",
    },
    floor: {
      title: "Mike's queue",
      points: ["59 jar candle rewrites, one approval away", "Only promoted types reach customers", "First-time acceptance tracked per type"],
    },
  },
  {
    id: "regen",
    label: "Instant regeneration",
    persona: "Mike",
    today: "1–2 weeks a round · feedback, MLE tuning, shown on next week's call",
    now: "On the call · regenerate from feedback, or the moment new data lands",
    workshop: {
      ask: "Aurelle keeps asking for “soy wax” and “hand-poured” in jar candle titles. Add few-shot examples, target the rule to the jar candle cluster, and let Mike regenerate on the spot.",
      lines: [
        { kind: "tool", text: "context_store.write(cluster: jar_candles, rule: “include soy wax and hand-poured”)" },
        { kind: "out", text: "Targets 59 SKUs, not the whole catalog" },
        { kind: "tool", text: "fewshots.add(type: jar_candles, 3 approved titles)" },
        { kind: "out", text: "Gate met: few-shot examples present" },
        { kind: "tool", text: "trigger.on(new keyword file → regenerate affected cluster)" },
        { kind: "out", text: "Regenerations are timestamped and kept as versions" },
        { kind: "tool", text: "eval.run(jar_candles)" },
        { kind: "out", text: "Quality scorecard 96%" },
        { kind: "file", text: "skills/content-regenerate.md" },
      ],
      files: [
        { path: "skills/content-regenerate.md", note: "One call per edit; keeps the rest of the title intact" },
        { path: "fewshots/jar_candles.json", note: "3 approved titles" },
      ],
    },
    publish: {
      title: "Gate before it reaches customers",
      checks: [
        { label: "Few-shot examples", detail: "3 for jar candles · required before publishing", status: "pass" },
        { label: "Evals", detail: "Quality scorecard 96% (target 95%)", status: "pass" },
        { label: "Scope", detail: "Jar candle cluster only (59 SKUs)", status: "pass" },
        { label: "Versions", detail: "Every regeneration timestamped", status: "pass" },
      ],
      scope: "Aurelle Candles · jar candles",
      primary: "Publish",
      confirm: "Mike can regenerate jar candle content on the spot.",
    },
    floor: { title: "Mike regenerates with Aurelle on the call", points: [] },
  },
]

/** The one SKU the regeneration act plays on. */
export const REGEN_SKU = {
  name: "Aurelle Candles Amber Floral Soy Candle, 16 oz",
  options: [
    { id: "champion", label: "Ally's pick", text: "Aurelle Candles Amber Floral Soy Candle, 16 oz, Jasmine & Amber, 60-Hour Burn" },
    { id: "challenger-1", label: "Option 2", text: "Aurelle Candles Amber Floral Candle, 16 oz Jar, Clean Floral Scent, 60-Hour Burn" },
    { id: "challenger-2", label: "Option 3", text: "Aurelle Candles Amber Floral 16 oz Jar Candle, Jasmine, Amber & Musk" },
  ],
  /** The feedback Aurelle gives on the call, and what one regeneration returns. */
  feedback: "Add soy wax and hand-poured",
  regenerated: "Aurelle Candles Amber Floral Hand-Poured Soy Wax Candle, 16 oz, Jasmine & Amber, 60-Hour Burn",
  added: ["Hand-Poured", "Wax"],
  note: "Kept the brand and scent first · 90 characters, under the limit",
}
