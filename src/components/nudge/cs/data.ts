import type { RunItem } from "../runs/data"

/**
 * Sarah, CommerceIQ's retail expert on Fully managed accounts. Ally does the
 * work as soon as the joint plan or a call creates it; Sarah approves what
 * changes money or makes a new promise, and everything else runs on autopilot.
 * What the call taught Ally goes to the account's context.
 *
 * The calendar event and the call are samples in the shape the Google Calendar
 * and Gong connectors return; in production they're read, not seeded.
 */
export const SARAH = { name: "Sarah Kim", first: "Sarah", role: "Retail expert · CommerceIQ" }

export const ACCOUNT = { name: "Aurelle", tier: "Fully managed", contact: "Claire Bennett" }

/** Her accounts. Only Aurelle is built deep in the demo; the rest show where they stand. */
export const PORTFOLIO = [
  { name: "Aurelle", tier: "Fully managed", status: "", tone: "due" as const },
  { name: "Lumen Pet", tier: "Fully managed", status: "1 late", tone: "late" as const },
  { name: "Northwind Home", tier: "Agent + FDE", status: "On track", tone: "ok" as const },
  { name: "Brightway Foods", tier: "Agent + FDE", status: "On track", tone: "ok" as const },
]

/** The next meeting with the account, from Sarah's calendar. */
export const NEXT_MEETING = {
  title: "Aurelle weekly session",
  when: "Thu, Oct 8 · 2:00 PM",
  day: 0,
  length: "45 min",
  attendees: ["Claire Bennett", "Mike Chen", "Michelle Ortiz"],
  source: "Google Calendar",
}

/** The last call, as Gong recorded it. Its recap saved itself to context 72 hours after the call, since nobody edited it. */
export const LAST_CALL = { title: "Aurelle weekly session", date: "Fri, Oct 2", short: "Oct 2", length: "42 min", source: "Gong", savedOn: "Mon, Oct 5" }

/** Sarah's clock in the demo: Wednesday, 9:00 PM, the night before the weekly session (Thu, 2:00 PM). */
export const SARAH_NOW = { label: "Wed, 9:00 PM", callIn: "17 hours", callInShort: "17h" }

/** Sarah's approval limit for budget moves; above it, Ally drafts the move and waits. Set per account in the joint plan. */
export const BUDGET_LIMIT = "$5K a week"

/** What the customer asked for on the call, each with the inbox item that answers it. */
export interface Ask {
  id: string
  who: string
  at: string
  quote: string
  title: string
  answeredBy: string
  /** What was done about it, for the agenda; and how it reads while it's still open. */
  did: string
  pending: string
}

export const ASKS: Ask[] = [
  { id: "ask-supply", who: "Michelle Ortiz", at: "18:22", quote: "Cedar & Smoke is short at the DC until October 20. We'll be out on Amazon for about ten days.", title: "Supply gap: Cedar & Smoke out until Oct 20", answeredBy: "a-supply", did: "Cedar & Smoke ads paused until it's back", pending: "Cedar & Smoke ads" },
  { id: "ask-launch", who: "Claire Bennett", at: "24:05", quote: "We're launching the Pumpkin Chai mini on November 20. Can you have it ready for Black Friday?", title: "New SKU: Pumpkin Chai mini, launches Nov 20", answeredBy: "p-launch", did: "Pumpkin Chai mini launch kit approved", pending: "the Pumpkin Chai mini launch kit (ready Friday)" },
  { id: "ask-walmart", who: "Claire Bennett", at: "12:40", quote: "Can we get the same pacing view for Walmart? I'm flying blind there.", title: "Walmart media pacing, weekly", answeredBy: "a-plan", did: "Walmart pacing added every Monday", pending: "Walmart pacing" },
  { id: "ask-wbr", who: "Claire Bennett", at: "05:10", quote: "Monday's too early for the WBR. Tuesday works better, and put Target in it.", title: "WBR on Tuesdays, with Target", answeredBy: "a-plan", did: "WBR moved to Tuesdays with Target", pending: "the WBR move" },
  { id: "ask-promo", who: "Claire Bennett", at: "31:48", quote: "We didn't hear about Brightwick's gift-set promo until it had been running a week.", title: "Brightwick promo alert", answeredBy: "a-alert", did: "Brightwick promo alert on", pending: "the Brightwick alert" },
  { id: "ask-gifts", who: "Claire Bennett", at: "29:10", quote: "Gift sets feel underfunded going into holiday.", title: "More budget behind gift sets", answeredBy: "p-budget", did: "$24K moved to gift sets", pending: "the $24K move to gift sets" },
]

/** Why Ally did it: the context it used, brand or category, and its source. */
export interface Why {
  text: string
  scope: "Brand" | "Category"
  source: string
}

/**
 * The inbox: everything Ally did since Sarah was last here. "autopilot" items are
 * done (Sarah can recall or undo); "approval" items are done as drafts and wait
 * for her, because they change money or make a new promise.
 */
export interface InboxItem {
  id: string
  kind: "autopilot" | "approval"
  /** The line in "Ally did N things". */
  line: string
  /** The ask it answers, when it came from the call; else the plan item. */
  ask?: string
  source: string
  /** Approval only: when the customer expects it, and the work to review. */
  due?: string
  artifact?: { kind: "budget"; rows: { what: string; from: string; to: string }[]; note: string } | { kind: "launch"; parts: { label: string; value: string }[] } | { kind: "email"; to: string; subject: string; body: string } | { kind: "call" }
  why: Why[]
  /** The undo verb for autopilot items: "Recall" for something sent, "Hold" for something about to send, "Undo" for a change. */
  undo?: "Recall" | "Undo" | "Hold"
  /** What approving it does beyond marking it done (a queue item it approves). */
  approves?: string
  href?: string
}

export const INBOX: InboxItem[] = [
  {
    id: "a-wbr",
    kind: "autopilot",
    line: "Sent the WBR to Claire, now with Target · Tue, 10 AM",
    ask: "ask-wbr",
    source: "Plan · weekly",
    undo: "Recall",
    href: "/sarah/decks/weekly",
    why: [
      { text: "WBR on Tuesdays, with Target", scope: "Brand", source: "Oct 2 call" },
      { text: "Claire loved the competitor slide: it leads now", scope: "Brand", source: "Oct 2 recap" },
    ],
  },
  {
    id: "a-supply",
    kind: "autopilot",
    line: "Paused Cedar & Smoke ads until it's back on Oct 20",
    ask: "ask-supply",
    source: "Oct 2 call",
    undo: "Undo",
    why: [
      { text: "Cedar & Smoke short at the DC until Oct 20", scope: "Brand", source: "Oct 2 call" },
      { text: "Paused before Amazon's stock count shows the gap, so no spend lands on a page about to go out", scope: "Brand", source: "Oct 2 call" },
    ],
  },
  {
    id: "a-plan",
    kind: "autopilot",
    line: "Added Walmart pacing to the plan and moved the WBR to Tuesdays",
    ask: "ask-walmart",
    source: "Oct 2 call",
    undo: "Undo",
    href: "/plan",
    why: [{ text: "Claire asked for both on the call", scope: "Brand", source: "Oct 2 call" }],
  },
  {
    id: "a-alert",
    kind: "autopilot",
    line: "Set up a Brightwick promo alert, every morning",
    ask: "ask-promo",
    source: "Oct 2 call",
    undo: "Undo",
    href: "/michelle/alerts",
    why: [{ text: "Brightwick is Aurelle's main gift-set competitor", scope: "Brand", source: "Onboarding" }],
  },
  {
    id: "a-reports",
    kind: "autopilot",
    line: "Sent media pacing, the media actions update and the AI visibility readout",
    source: "Plan · weekly and monthly",
    undo: "Recall",
    why: [{ text: "Routine reports run on autopilot", scope: "Brand", source: "Joint plan" }],
  },
  {
    id: "p-call",
    kind: "approval",
    line: "Built the plan for Thursday's call",
    source: "Plan · weekly session",
    due: "Thu, 2:00 PM",
    artifact: { kind: "call" },
    href: "/sarah/prep",
    why: [
      { text: "Open each session with the Halloween countdown", scope: "Brand", source: "Oct 2 recap" },
      { text: "Add the Brightwick promo tracker to every prep", scope: "Brand", source: "Oct 2 recap" },
    ],
  },
  {
    id: "p-budget",
    kind: "approval",
    line: "Drafted the $24K move from large jars to gift sets",
    ask: "ask-gifts",
    source: "Oct 2 call",
    due: "Today",
    approves: "media-rebalance",
    artifact: {
      kind: "budget",
      rows: [
        { what: "Large jars, October", from: "$90K", to: "$66K" },
        { what: "Gift sets, October", from: "$60K", to: "$84K" },
      ],
      note: `Above your ${"$5K a week"} limit, so it waits for you · +$160K projected this quarter`,
    },
    why: [
      { text: "Gift-set searches spike 3 weeks before Thanksgiving", scope: "Category", source: "Proven at 14 brands" },
      { text: "Q4 margin floor is 32%: the move stays above it", scope: "Brand", source: "Oct 2 call" },
      { text: "Gift sets 15% spent, 26% of October gone", scope: "Brand", source: "Amazon Ads" },
    ],
  },
  {
    id: "p-launch",
    kind: "approval",
    line: "Drafted the Pumpkin Chai mini launch kit",
    ask: "ask-launch",
    source: "Oct 2 call",
    due: "Fri, Oct 9",
    artifact: {
      kind: "launch",
      parts: [
        { label: "Title", value: "Aurelle Pumpkin Chai Mini Jar Candle, 8 oz · Spiced Pumpkin, Chai and Clove · 40-Hour Burn" },
        { label: "Bullets", value: "Gather round the glow · 40-hour burn · Soy wax, cotton wick" },
        { label: "Campaign", value: "38 keywords from the new copy · $18K, Nov 20–Dec 15 · ramps, then tapers" },
        { label: "Calendar", value: "Black Friday slot, Nov 27 · page live by Nov 18" },
      ],
    },
    why: [
      { text: "Tagline: Gather round the glow", scope: "Brand", source: "Brand team" },
      { text: "Never claim \"non-toxic\"", scope: "Brand", source: "Legal" },
      { text: "Burn time and scent notes lift conversion 3–6%", scope: "Category", source: "Proven at 9 brands" },
    ],
  },
  {
    id: "p-vm",
    kind: "approval",
    line: "Drafted the Amazon VM note on Cedar & Smoke",
    ask: "ask-supply",
    source: "Oct 2 call",
    due: "Today",
    artifact: {
      kind: "email",
      to: "Amazon vendor manager",
      subject: "Cedar & Smoke Jar: inbound short until Oct 20",
      body: "Hi Dana, our Cedar & Smoke 18 oz jar is short at the DC until Oct 20. We've paused its ads so shoppers aren't sent to an unavailable page. Could you hold the listing's Halloween placement and confirm the PO for Oct 20? Thanks, Michelle",
    },
    why: [
      { text: "Michelle owns vendor escalations", scope: "Brand", source: "Oct 2 call" },
      { text: "Escalations to the retailer always need approval", scope: "Brand", source: "Joint plan" },
    ],
  },
]

/** The recap of the last call: each section feeds something. Saves to context 72 hours after the call unless Sarah edits it. */
export const RECAP: { id: string; title: string; feeds: string; lines: string[] }[] = [
  { id: "decided", title: "Decided", feeds: "Actions", lines: ["Halloween content ships by Oct 26; Mike approves core SKUs this week", "Walmart gets the same pacing view as Amazon"] },
  { id: "asked", title: "Asked for", feeds: "The joint plan", lines: ["Walmart media pacing, weekly", "WBR on Tuesdays, with Target", "A Brightwick promo alert", "Pumpkin Chai mini ready for Black Friday"] },
  { id: "liked", title: "What landed well", feeds: "Context · preferences", lines: ["Claire loved the competitor slide: Brightwick's share of voice on our terms", "Michelle liked seeing the VM note before it went out"] },
  { id: "forward", title: "Going forward", feeds: "Every weekly prep", lines: ["Open each session with the Halloween countdown", "Add the Brightwick promo tracker to every prep", "Show vendor notes before they send"] },
  { id: "facts", title: "Facts we learned", feeds: "Context", lines: ["Cedar & Smoke short at the DC until Oct 20", "Pumpkin Chai mini launches Nov 20", "Q4 margin floor is 32%", "Claire approves anything over $50K"] },
]

/** What's moved since the last call, for the prep: a few facts from the live pages. */
export const SINCE_LAST = [
  "Ally delivered $280K of $300K projected this quarter",
  "Halloween content: $660K one approval away, publish by Oct 26",
  "Brightwick cut gift-set prices 20% and took 4 more sponsored slots",
  "38 keywords harvested · $21K a week moved to the keywords content added",
]

/** The plan, from the Fully managed tier: one list per cadence. Reports run on autopilot; what makes a new promise is drafted for Sarah. */
/** "draft": Ally drafts it for Sarah's review; "act": routine, it goes to the customer on its own. */
const d = (id: string, name: string, what: string, runs: string, last: string, does: RunItem["does"] = "draft"): RunItem => ({ id: `jbp-${id}`, kind: "brief", name, what, runs, does, owner: "built in", last, plan: true })

export const PLAN: { title: string; items: RunItem[] }[] = [
  {
    title: "Weekly",
    items: [
      d("wbr", "WBR deck", "Sales vs plan, the gap and why, what shipped, next week · Amazon", "Every Monday, 10 AM", "Sent Mon, Oct 5, 10 AM", "act"),
      d("pacing", "Media pacing and budget", "Spend vs plan by category, over- and underpacing, budget moves", "Every Monday, 8 AM", "Sent Mon, Oct 5, 8 AM", "act"),
      d("actions", "Media actions update", "Bid and budget actions by type: Build, Harvest, Defend, Pause, Pacing, with why", "Every Monday, 8 AM", "Sent Mon, Oct 5, 8 AM", "act"),
      d("shipped", "Content shipped", "Published, rejected and fixed, by type of work", "Every Friday", "Sent Fri, Oct 2", "act"),
      d("session", "Weekly session", "Prep and agenda the day before, then the call", "Every Thursday, 2 PM", "Next Thu, Oct 8"),
    ],
  },
  {
    title: "Monthly",
    items: [
      d("visibility", "AI visibility readout", "AI visibility and weighted share of voice on priority prompts", "First Monday", "Sent Mon, Oct 5, 9 AM", "act"),
      d("value", "Value report", "Delivered vs projected, the method, and the gap", "First Tuesday", "Sent Tue, Oct 6"),
      d("competitors", "Competitor insights", "Price, promos, share, sponsored slots, launches", "Second Monday", "Due Mon, Oct 12"),
    ],
  },
  {
    title: "Quarterly",
    items: [
      d("qbr", "QBR deck", "The quarter, value delivered, next quarter's plan", "Each quarter", "Q3 review sent Oct 2"),
      d("trends", "Industry and category trends", "Segment growth, new shopper questions, retailer rule changes", "Each quarter", "Sent Oct 2"),
      d("case", "Business case for leadership", "The value story for Claire's CEO", "Each quarter", "Sent Oct 2"),
    ],
  },
  {
    title: "Events and annual",
    items: [
      d("seasonal", "Seasonal calendar and readiness", "Content, deals, stock and media per event, reverted after", "3 weeks before each event", "Black Friday plan due Nov 6"),
      d("annual", "Annual plan", "Goals, retailers, the calendar", "Every December", "FY27 plan due Dec 15"),
    ],
  },
]

/** What accepting a call item does to the plan: a new item, or an edit to one. */
export const WALMART_PACING: RunItem = {
  id: "jbp-walmart-pacing",
  kind: "brief",
  name: "Walmart media pacing",
  what: "Spend vs plan by category on Walmart, over- and underpacing",
  runs: "Every Monday, 8 AM",
  does: "act",
  owner: "yours",
  last: "First one Mon, Oct 12",
  by: `From the ${LAST_CALL.short} call`,
  plan: true,
}
export const WBR_EDIT: Partial<RunItem> = { runs: "Every Tuesday, 10 AM", what: "Sales vs plan, the gap and why, what shipped, next week · Amazon and Target", last: "Sent Tue, Oct 6, 10 AM" }
export const PROMO_ALERT: RunItem = {
  id: "run-brightwick-promo",
  kind: "alert",
  name: "Brightwick promotions",
  what: "When Brightwick starts a price cut or deal on gift sets or jar candles",
  runs: "Every morning",
  does: "tell",
  owner: "yours",
  last: "Not run yet",
  by: `From the ${LAST_CALL.short} call`,
}
export const MARGIN_RULE = "Q4 margin floor is 32%: no media or promo play below it"


/** What ran on its own since Thursday, for the "Ally already did this" band: the autopilot items plus the drafts Ally built. */
export const REEL = [
  "Sent media pacing, the actions update and the AI visibility readout",
  "Paused Cedar & Smoke ads until it's back on Oct 20",
  "Added Walmart pacing to the plan and moved the WBR to Tuesdays",
  "Set up a Brightwick promo alert",
  "Drafted the recap of the Oct 2 call",
  "Built Thursday's prep and agenda",
]

/** How a plan deliverable reaches the customer: on its own, or after Sarah reviews it. */
export const PLAN_DOES: Partial<Record<RunItem["does"], string>> = { act: "On autopilot", draft: "Sarah reviews first" }
