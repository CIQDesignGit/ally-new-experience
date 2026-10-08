import type { RunItem } from "../runs/data"

/**
 * Sarah, CommerceIQ's retail expert on Fully managed accounts. Her view is the
 * joint plan (what Aurelle gets from CommerceIQ, and when) plus what each call
 * changed. The plan is generated from the tier in the services doc, so it's
 * fixed until a call proposes a change and Sarah accepts it.
 *
 * The calendar event and the call are samples in the shape the Google Calendar
 * and Gong connectors return; in production they're read, not seeded.
 */
export const SARAH = { name: "Sarah Kim", first: "Sarah", role: "Retail expert · CommerceIQ" }

export const ACCOUNT = { name: "Aurelle", tier: "Fully managed", contact: "Claire Bennett" }

/** Her accounts. Only Aurelle is built deep in the demo; the rest show where they stand. */
export const PORTFOLIO = [
  { name: "Aurelle", tier: "Fully managed", status: "3 due this week", tone: "due" as const },
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

/** The last call, as Gong recorded it. */
export const LAST_CALL = { title: "Aurelle weekly session", date: "Thu, Oct 1", short: "Oct 1", length: "42 min", source: "Gong" }

export type CallItemKind = "add" | "change" | "work" | "context"

/** One thing Ally heard on the call: the quote, and what it proposes. */
export interface CallItem {
  id: string
  kind: CallItemKind
  who: string
  at: string
  quote: string
  /** What it is, in a few words. */
  title: string
  /** What Ally will do once Sarah says yes. */
  will: string[]
  /** The button. */
  cta: string
  /** Once done: what happened, and where. */
  done: string
}

export const KIND_LABEL: Record<CallItemKind, string> = {
  add: "New deliverable",
  change: "Change to the plan",
  work: "Work to do",
  context: "Context",
}

export const CALL_ITEMS: CallItem[] = [
  {
    id: "call-supply",
    kind: "work",
    who: "Michelle Ortiz",
    at: "18:22",
    quote: "Cedar & Smoke is short at the DC until October 20. We'll be out on Amazon for about ten days.",
    title: "Supply gap: Cedar & Smoke out until Oct 20",
    will: ["Pause its ads until it's back in stock · Ally for Media", "Draft the note to the Amazon VM · Michelle's queue", "Hold its Halloween page update until it's back"],
    cta: "Send to Ally",
    done: "Ads paused · VM note in Michelle's queue · page update held",
  },
  {
    id: "call-launch",
    kind: "work",
    who: "Claire Bennett",
    at: "24:05",
    quote: "We're launching the Pumpkin Chai mini on November 20. Can you have it ready for Black Friday?",
    title: "New SKU: Pumpkin Chai mini, launches Nov 20",
    will: ["Draft the launch page · Mike's queue", "Build a launch campaign from the new copy · James's queue", "Add it to the Black Friday calendar"],
    cta: "Send to Ally",
    done: "Launch page in Mike's queue · campaign in James's queue · on the Black Friday calendar",
  },
  {
    id: "call-walmart",
    kind: "add",
    who: "Claire Bennett",
    at: "12:40",
    quote: "Can we get the same pacing view for Walmart? I'm flying blind there.",
    title: "Walmart media pacing, weekly",
    will: ["Add a weekly Walmart pacing report to the plan", "First one Mon, Oct 12"],
    cta: "Add to plan",
    done: "Added to the plan · first one Mon, Oct 12",
  },
  {
    id: "call-wbr",
    kind: "change",
    who: "Claire Bennett",
    at: "05:10",
    quote: "Monday's too early for the WBR. Tuesday works better, and put Target in it.",
    title: "WBR moves to Tuesday and adds Target",
    will: ["WBR: every Tuesday, 10 AM", "Covers Amazon and Target"],
    cta: "Change the plan",
    done: "WBR now every Tuesday, Amazon and Target",
  },
  {
    id: "call-promo",
    kind: "add",
    who: "Claire Bennett",
    at: "31:48",
    quote: "We didn't hear about Brightwick's gift-set promo until it had been running a week.",
    title: "Brightwick promo alert",
    will: ["Watch Brightwick's prices and deals every morning", "Tell Sarah and Claire the day a promo starts"],
    cta: "Add the alert",
    done: "Alert live · on Scheduled",
  },
  {
    id: "call-margin",
    kind: "context",
    who: "Claire Bennett",
    at: "36:15",
    quote: "Finance moved our Q4 margin floor to 32%, so don't chase volume below that.",
    title: "Q4 margin floor is 32%",
    will: ["Save to Knowledge for the account", "Media and promo plays respect it"],
    cta: "Save to Knowledge",
    done: "Saved to Knowledge",
  },
]

/** The plan, from the Fully managed tier: one list per cadence. Ally drafts each; Sarah checks it before it goes out. */
const d = (id: string, name: string, what: string, runs: string, last: string): RunItem => ({ id: `jbp-${id}`, kind: "brief", name, what, runs, does: "draft", owner: "built in", last, plan: true })

export const PLAN: { title: string; items: RunItem[] }[] = [
  {
    title: "Weekly",
    items: [
      d("wbr", "WBR deck", "Sales vs plan, the gap and why, what shipped, next week · Amazon", "Every Monday, 10 AM", "Due today · draft ready"),
      d("pacing", "Media pacing and budget", "Spend vs plan by category, over- and underpacing, budget moves", "Every Monday, 8 AM", "Sent today, 8 AM"),
      d("actions", "Media actions update", "Bid and budget actions by type: Build, Harvest, Defend, Pause, Pacing, with why", "Every Monday, 8 AM", "Sent today, 8 AM"),
      d("shipped", "Content shipped", "Published, rejected and fixed, by type of work", "Every Friday", "Sent Fri, Oct 2"),
      d("session", "Weekly session", "Agenda from the open items, then the call", "Every Thursday, 2 PM", "Thu, Oct 8 · prep ready"),
    ],
  },
  {
    title: "Monthly",
    items: [
      d("visibility", "AI visibility readout", "AI visibility and weighted share of voice on priority prompts", "First Monday", "Sent today, 9 AM"),
      d("value", "Value report", "Delivered vs projected, the method, and the gap", "First Tuesday", "Due Tue, Oct 6"),
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
  does: "draft",
  owner: "yours",
  last: "First one Mon, Oct 12",
  by: `From the ${LAST_CALL.short} call`,
  plan: true,
}
export const WBR_EDIT: Partial<RunItem> = { runs: "Every Tuesday, 10 AM", what: "Sales vs plan, the gap and why, what shipped, next week · Amazon and Target", last: "Due Tue, Oct 6 · draft ready" }
export const PROMO_ALERT: RunItem = {
  id: "run-brightwick-promo",
  kind: "alert",
  name: "Brightwick promotions",
  what: "When Brightwick starts a price cut or deal on gift sets or jar candles",
  runs: "Every morning",
  does: "tell",
  owner: "yours",
  last: "Not run yet",
  by: `From the ${LAST_CALL.short} call · Sarah Kim`,
}
export const MARGIN_RULE = "Q4 margin floor is 32%: no media or promo play below it"

/** What's moved since the last call, for the prep: a few facts from the live pages. */
export const SINCE_LAST = [
  "Ally delivered $280K of $300K projected this quarter",
  "Halloween content: $660K one approval away, publish by Oct 26",
  "Brightwick cut gift-set prices 20% and took 4 more sponsored slots",
  "38 keywords harvested · $21K a week moved to the keywords content added",
]
