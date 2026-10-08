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

/** What the customer asked for on the call, each with the work that answers it. */
export interface Ask {
  id: string
  who: string
  at: string
  quote: string
  title: string
  /** The review item or the Ally change that answers it. */
  answeredBy: string
}

export const ASKS: Ask[] = [
  { id: "ask-supply", who: "Michelle Ortiz", at: "18:22", quote: "Cedar & Smoke is short at the DC until October 20. We'll be out on Amazon for about ten days.", title: "Supply gap: Cedar & Smoke out until Oct 20", answeredBy: "rev-supply" },
  { id: "ask-launch", who: "Claire Bennett", at: "24:05", quote: "We're launching the Pumpkin Chai mini on November 20. Can you have it ready for Black Friday?", title: "New SKU: Pumpkin Chai mini, launches Nov 20", answeredBy: "rev-launch" },
  { id: "ask-walmart", who: "Claire Bennett", at: "12:40", quote: "Can we get the same pacing view for Walmart? I'm flying blind there.", title: "Walmart media pacing, weekly", answeredBy: "rev-walmart" },
  { id: "ask-wbr", who: "Claire Bennett", at: "05:10", quote: "Monday's too early for the WBR. Tuesday works better, and put Target in it.", title: "WBR on Tuesdays, with Target", answeredBy: "rev-wbr" },
  { id: "ask-promo", who: "Claire Bennett", at: "31:48", quote: "We didn't hear about Brightwick's gift-set promo until it had been running a week.", title: "Brightwick promo alert", answeredBy: "did-alert" },
  { id: "ask-margin", who: "Claire Bennett", at: "36:15", quote: "Finance moved our Q4 margin floor to 32%, so don't chase volume below that.", title: "Q4 margin floor is 32%", answeredBy: "did-margin" },
]

/** Finished work, waiting for Sarah to review it and send it to the customer. */
export interface ReviewItem {
  id: string
  title: string
  /** What Ally already did. */
  did: string[]
  /** Where it came from: the plan, or the call. */
  source: string
  /** The ask it answers, when it came from the call. */
  ask?: string
  due: string
  /** Days from Mon, Oct 5: ranks the queue, soonest first. */
  dueIn: number
  to: string[]
  /** The work itself. */
  open: { label: string; href: string }
  /** The note to the customer, drafted by Ally. */
  note: string
}

export const REVIEW_ITEMS: ReviewItem[] = [
  {
    id: "rev-wbr",
    title: "WBR deck · Amazon and Target",
    did: ["Built this week's deck: sales vs plan, the gap and why, what shipped, next week", "Added Target, as asked on the Oct 1 call"],
    source: "Plan · weekly, moved to Tuesday on the Oct 1 call",
    ask: "ask-wbr",
    due: "Today",
    dueIn: 0,
    to: ["Claire Bennett"],
    open: { label: "Open the WBR", href: "/sarah/decks/weekly" },
    note: "Hi Claire, this week's WBR is attached, now with Target. You're tracking to $48M, $4M short of plan. $660K of Halloween content is one approval away; it has to publish by Oct 26.",
  },
  {
    id: "rev-supply",
    title: "Cedar & Smoke supply gap",
    did: ["Paused its ads until it's back in stock on Oct 20", "Drafted the note to the Amazon VM, in Michelle's queue", "Held its Halloween page update until it's back"],
    source: "Oct 1 call",
    ask: "ask-supply",
    due: "Today",
    dueIn: 0,
    to: ["Michelle Ortiz", "Claire Bennett"],
    open: { label: "Open the VM note", href: "/michelle?from=sarah" },
    note: "Hi Michelle, on Cedar & Smoke: we paused its ads until Oct 20 so no spend goes to a page that can't sell, held its Halloween update, and drafted the note to your Amazon VM. It's in your queue to send.",
  },
  {
    id: "rev-prep",
    title: "Agenda for Thursday's session",
    did: ["Built the prep from Thursday's calendar event", "Drafted a 5-line agenda, ranked by deadline"],
    source: "Plan · weekly session",
    due: "Wed, Oct 7",
    dueIn: 2,
    to: ["Claire Bennett", "Mike Chen", "Michelle Ortiz"],
    open: { label: "Open meeting prep", href: "/sarah/prep" },
    note: "Agenda for Thursday: Halloween content (publish by Oct 26), Black Friday deals (set by Nov 6), the $500K budget plan, seasonal autopilot, and where last week's asks stand.",
  },
  {
    id: "rev-launch",
    title: "Pumpkin Chai mini launch kit",
    did: ["Drafted the launch page: title, bullets and images, checked against your claim rules", "Built a launch campaign on 38 keywords from the new copy, starts Nov 20", "Added it to the Black Friday calendar"],
    source: "Oct 1 call",
    ask: "ask-launch",
    due: "Fri, Oct 9",
    dueIn: 4,
    to: ["Claire Bennett"],
    open: { label: "Open the launch page", href: "/mike?from=sarah" },
    note: "Hi Claire, the Pumpkin Chai mini is ready for Nov 20: page, launch campaign and Black Friday slot. One thing needs you: approve the page copy by Nov 6.",
  },
  {
    id: "rev-walmart",
    title: "Walmart media pacing · first report",
    did: ["Added a weekly Walmart pacing report to the plan", "Built the first one: gift sets underpacing, large jars on pace"],
    source: "Oct 1 call",
    ask: "ask-walmart",
    due: "Mon, Oct 12",
    dueIn: 7,
    to: ["Claire Bennett"],
    open: { label: "Open Walmart pacing", href: "/claire-waterfall" },
    note: "Hi Claire, here's the Walmart pacing view you asked for. Gift sets are underpacing ahead of holiday; we'll send this every Monday.",
  },
]

/** What Ally changed on its own from the call, each with undo. */
export const ALLY_DID = [
  { id: "did-plan-walmart", text: "Added Walmart media pacing to the plan, weekly", ask: "ask-walmart" },
  { id: "did-plan-wbr", text: "Moved the WBR to Tuesdays and added Target", ask: "ask-wbr" },
  { id: "did-alert", text: "Set up the Brightwick promo alert, every morning", ask: "ask-promo" },
  { id: "did-margin", text: "Saved the 32% margin floor to Knowledge and applied it to 3 plays", ask: "ask-margin" },
]

/** Routine deliverables that went to the customer on their own this week. */
export const AUTOSENT = [
  { name: "Media pacing and budget", when: "Sent today, 8 AM" },
  { name: "Media actions update", when: "Sent today, 8 AM" },
  { name: "AI visibility readout", when: "Sent today, 9 AM" },
]

/** The plan, from the Fully managed tier: one list per cadence. Ally drafts each; Sarah checks it before it goes out. */
/** "draft": Ally drafts it for Sarah's review; "act": routine, it goes to the customer on its own. */
const d = (id: string, name: string, what: string, runs: string, last: string, does: RunItem["does"] = "draft"): RunItem => ({ id: `jbp-${id}`, kind: "brief", name, what, runs, does, owner: "built in", last, plan: true })

export const PLAN: { title: string; items: RunItem[] }[] = [
  {
    title: "Weekly",
    items: [
      d("wbr", "WBR deck", "Sales vs plan, the gap and why, what shipped, next week · Amazon", "Every Monday, 10 AM", "Due today · draft ready"),
      d("pacing", "Media pacing and budget", "Spend vs plan by category, over- and underpacing, budget moves", "Every Monday, 8 AM", "Sent today, 8 AM", "act"),
      d("actions", "Media actions update", "Bid and budget actions by type: Build, Harvest, Defend, Pause, Pacing, with why", "Every Monday, 8 AM", "Sent today, 8 AM", "act"),
      d("shipped", "Content shipped", "Published, rejected and fixed, by type of work", "Every Friday", "Sent Fri, Oct 2", "act"),
      d("session", "Weekly session", "Agenda from the open items, then the call", "Every Thursday, 2 PM", "Thu, Oct 8 · prep ready"),
    ],
  },
  {
    title: "Monthly",
    items: [
      d("visibility", "AI visibility readout", "AI visibility and weighted share of voice on priority prompts", "First Monday", "Sent today, 9 AM", "act"),
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
