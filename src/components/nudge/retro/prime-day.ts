/**
 * The Prime Day retro: one source for the storyline, the slides, the lessons
 * and the looks. The answer, the storyboard, the deck, the PowerPoint export and
 * Claire's card all read from here, so a number changes in one place.
 *
 * Prime Day is its own event in the demo (Jul 14–15, 2026); its numbers are not
 * part of the Q4 bridge.
 */

export type Bar = { label: string; value: number; display: string; tone: "accent" | "muted" | "loss" | "media" | "ops" }

export type Chart =
  | { kind: "kpis"; items: { figure: string; label: string; loss?: boolean }[] }
  | { kind: "table"; columns: string[]; rows: { cells: string[]; verdict: "worked" | "didnt" }[] }
  | { kind: "columns"; bars: Bar[] }
  | { kind: "rows"; bars: Bar[]; zeroAt?: number }
  | { kind: "slots"; rows: { label: string; slots: number; tone: Bar["tone"] }[]; of: number }
  | { kind: "list"; items: string[] }

export interface Insight {
  figure: string
  text: string
  loss?: boolean
}

export interface RetroSlide {
  id: string
  /** The question the slide answers (the storyboard's Questions view). */
  question: string
  eyebrow: string
  title: string
  chart: Chart
  insights: Insight[]
}

export const RETRO = {
  id: "prime-day-2026",
  name: "Prime Day retro",
  event: "Prime Day 2026",
  dates: "Jul 14–15",
  forWhom: "Claire Bennett",
  /** The answer's verdict, in Ally's voice. */
  verdict: "Prime Day sales grew 28% year over year to $4.6M, 2 points faster than the market. Jar candles led; gift sets lagged behind Brightwick's 30% off.",
  sources: "Vendor Central Jul 14–15 · Amazon Ads · 12 crawls a day",
}

/** What the retro teaches, each one a Knowledge rule once kept. */
export const LESSONS = [
  { id: "lightning", text: "Run lightning deals on hero SKUs, not blanket coupons", why: "Lightning deals lifted 52%; the 20% gift-set coupon 6%", scope: "Events · Promotions" },
  { id: "defend", text: "Defend gift-set terms before the event", why: "Brightwick took 7 of 12 sponsored slots on day 1", scope: "Events · Media" },
  { id: "cover", text: "Build 3 weeks of cover before any event", why: "Travel tins sold out on day 2, down 4%", scope: "Events · Ops" },
  { id: "lock", text: "Lock event content 10 days before", why: "64 deal PDPs rewritten early all went live on time", scope: "Events · Content" },
] as const

export const SLIDES: RetroSlide[] = [
  {
    id: "market",
    question: "Did we grow faster than the market?",
    eyebrow: "Prime Day 2026 · Market",
    title: "We grew 28%, 2 points faster than the market",
    chart: { kind: "columns", bars: [{ label: "Market", value: 26, display: "+26%", tone: "muted" }, { label: "Aurelle", value: 28, display: "+28%", tone: "accent" }] },
    insights: [
      { figure: "$4.6M", text: "Prime Day sales, up from $3.6M" },
      { figure: "+2 pts", text: "faster growth than the category" },
      { figure: "+0.3 pts", text: "market share gained" },
    ],
  },
  {
    id: "categories-up",
    question: "Which categories drove the gain?",
    eyebrow: "Prime Day 2026 · Categories",
    title: "Jar candles and clean-burn soy carried the event",
    chart: {
      kind: "rows",
      bars: [
        { label: "Jar candles", value: 41, display: "+41%", tone: "accent" },
        { label: "Clean-burn soy", value: 36, display: "+36%", tone: "accent" },
        { label: "Pillar candles", value: 24, display: "+24%", tone: "muted" },
        { label: "Wax melts", value: 19, display: "+19%", tone: "muted" },
      ],
    },
    insights: [
      { figure: "$2.1M", text: "jar candles, up 41%" },
      { figure: "+36%", text: "clean-burn soy, the fastest-growing segment" },
      { figure: "62%", text: "of the gain came from hero SKUs" },
    ],
  },
  {
    id: "categories-down",
    question: "Which categories lagged, and why?",
    eyebrow: "Prime Day 2026 · Categories",
    title: "Gift sets and travel tins lagged the market",
    chart: {
      kind: "rows",
      zeroAt: 0.2,
      bars: [
        { label: "Category", value: 24, display: "+24%", tone: "muted" },
        { label: "Gift sets", value: 9, display: "+9%", tone: "muted" },
        { label: "Travel tins", value: -4, display: "−4%", tone: "loss" },
      ],
    },
    insights: [
      { figure: "+9%", text: "gift sets, vs +24% for the category" },
      { figure: "30% off", text: "Brightwick's gift-set price cut" },
      { figure: "−4%", text: "travel tins, sold out on day 2", loss: true },
    ],
  },
  {
    id: "deals",
    question: "Which deals paid off, and which didn't?",
    eyebrow: "Prime Day 2026 · Deals",
    title: "Lightning deals worked; the blanket coupon didn't",
    chart: {
      kind: "columns",
      bars: [
        { label: "Lightning", value: 52, display: "+52%", tone: "accent" },
        { label: "Bundle", value: 18, display: "+18%", tone: "accent" },
        { label: "Coupon", value: 6, display: "+6%", tone: "muted" },
      ],
    },
    insights: [
      { figure: "+$310K", text: "lightning deals on 12 hero jar candles" },
      { figure: "+$90K", text: "3-wick bundle" },
      { figure: "+$40K", text: "20% gift-set coupon, undercut by Brightwick" },
    ],
  },
  {
    id: "competition",
    question: "What did competitors do?",
    eyebrow: "Prime Day 2026 · Competition",
    title: "Brightwick bought the top of the page on gift terms",
    chart: {
      kind: "slots",
      of: 12,
      rows: [
        { label: "Brightwick", slots: 7, tone: "muted" },
        { label: "Aurelle", slots: 3, tone: "accent" },
        { label: "Others", slots: 2, tone: "muted" },
      ],
    },
    insights: [
      { figure: "7 of 12", text: "Brightwick's sponsored slots on day 1" },
      { figure: "$24.99", text: "Lumen & Co's new 3-wick" },
      { figure: "−0.6 pts", text: "our gift-set share", loss: true },
    ],
  },
  {
    id: "lessons",
    question: "What should we do differently next time?",
    eyebrow: "Prime Day 2026 · Learnings",
    title: "Four lessons for Black Friday",
    chart: { kind: "list", items: LESSONS.map((l) => l.text) },
    insights: [
      { figure: "4", text: "lessons from what worked and what didn't" },
      { figure: "Nov 27", text: "Black Friday readiness uses them" },
    ],
  },
  {
    id: "ally",
    question: "What did Ally add, and how?",
    eyebrow: "Prime Day 2026 · Ally",
    title: "Ally added $410K, fixing issues within hours",
    chart: {
      kind: "rows",
      bars: [
        { label: "Media", value: 190, display: "$190K", tone: "media" },
        { label: "Content", value: 180, display: "$180K", tone: "accent" },
        { label: "Ops", value: 40, display: "$40K", tone: "ops" },
      ],
    },
    insights: [
      { figure: "12× a day", text: "Store Walk: 38 issues found, 31 fixed within 6 hours" },
      { figure: "$3.40", text: "IROAS on media, vs $3.01 average" },
      { figure: "64", text: "deal PDPs rewritten before the event" },
    ],
  },
]

/** One line per beat, for the answer's storyline. */
export const STORYLINE = [
  { title: "We outgrew the market", detail: "+28% year over year vs the market's +26% · $4.6M" },
  { title: "What sold", detail: "Jar candles +41% · clean-burn soy +36%" },
  { title: "What lagged, and why", detail: "Gift sets +9%: Brightwick 30% off · travel tins −4%: out of stock day 2" },
  { title: "Our deals: what worked", detail: "Lightning deals +52% lift · 20% coupon +6% · 3-wick bundle +18%" },
  { title: "What competitors did", detail: "Brightwick: 30% off gift sets, 7 of 12 sponsored slots · Lumen & Co: new 3-wick" },
  { title: "What we learned", detail: "4 lessons for Black Friday · saved to Knowledge" },
  { title: "What Ally added", detail: "$410K · Store Walk 12 times a day · content · media · ops" },
]

export type ThemeId = "default" | "aurelle"

/** The two looks: the CommerceIQ default, and the brand's own template once applied. */
export const THEMES: Record<ThemeId, { name: string; bg: string; ink: string; muted: string; accent: string; accentInk: string; soft: string; loss: string; media: string; ops: string; display: string; body: string; mark: string; footer: string; rule: string }> = {
  default: {
    name: "CommerceIQ default",
    bg: "#ffffff",
    ink: "#020617",
    muted: "#64748b",
    accent: "#875bf7",
    accentInk: "#6927da",
    soft: "#cbd5e1",
    loss: "#f04438",
    media: "#3b82f6",
    ops: "#f89b04",
    display: "var(--font-inter), system-ui, sans-serif",
    body: "var(--font-inter), system-ui, sans-serif",
    mark: "CommerceIQ",
    footer: "#94a3b8",
    rule: "#eef0f4",
  },
  aurelle: {
    name: "Aurelle Brand 2026",
    bg: "#F7F1E8",
    ink: "#3B2A20",
    muted: "#6b5240",
    accent: "#C08A3E",
    accentInk: "#9a6a2a",
    soft: "#d9c8b0",
    loss: "#b42318",
    media: "#7a5c3e",
    ops: "#a8763a",
    display: "var(--font-playfair), Georgia, serif",
    body: "var(--font-lato), system-ui, sans-serif",
    mark: "AURELLE",
    footer: "#a08670",
    rule: "#e7dccb",
  },
}

/** The brand template file Michelle attaches in the demo. */
export const BRAND_FILE = { name: "Aurelle_Brand_2026.potx", size: "4.2 MB", layouts: 9, used: 4, colors: 4 }

/** "Add an executive summary at the start": the slide Ally writes and puts first. */
export const EXEC_SLIDE: RetroSlide = {
  id: "summary",
  question: "What should Claire take away in one slide?",
  eyebrow: "Prime Day 2026 · Executive summary",
  title: "We outgrew the market; four lessons carry into Black Friday",
  chart: {
    kind: "kpis",
    items: [
      { figure: "$4.6M", label: "Prime Day sales, up 28%" },
      { figure: "+2 pts", label: "faster than the market" },
      { figure: "$410K", label: "added by Ally" },
      { figure: "4", label: "lessons kept for Black Friday" },
    ],
  },
  insights: [
    { figure: "+41%", text: "jar candles carried the event" },
    { figure: "+9%", text: "gift sets lagged behind Brightwick's 30% off" },
    { figure: "+52%", text: "lightning deals beat the coupon's +6%" },
  ],
}

/** Every slide the storyboard can hold, the summary included. */
export const ALL_SLIDES: RetroSlide[] = [EXEC_SLIDE, ...SLIDES]

/** "Convert slide 4's bar chart": the deals as a scorecard, which says worked or didn't outright. */
export const DEALS_TABLE: Chart = {
  kind: "table",
  columns: ["Deal", "Lift", "Added"],
  rows: [
    { cells: ["Lightning deals · 12 hero jar candles", "+52%", "+$310K"], verdict: "worked" },
    { cells: ["3-wick bundle", "+18%", "+$90K"], verdict: "worked" },
    { cells: ["20% gift-set coupon", "+6%", "+$40K"], verdict: "didnt" },
  ],
}


/**
 * Prime Day by category, for the dashboard's filters. Ties to the deck: the five
 * categories sum to $4.6M (+28%, up from $3.6M), jar candles are $2.1M (+41%),
 * and Ally's $410K splits $190K media, $180K content, $40K ops. Clean-burn soy
 * is a segment inside jar candles, so it isn't added to the total.
 */
export const CATEGORY_SPLIT: Record<string, { sales: string; growth: string; share: string; ally: { Media: number; Content: number; Ops: number }; lessons: number }> = {
  "Jar candles": { sales: "$2.1M", growth: "41%", share: "46%", ally: { Media: 110, Content: 100, Ops: 20 }, lessons: 2 },
  "Clean-burn soy": { sales: "$900K", growth: "36%", share: "20%", ally: { Media: 50, Content: 50, Ops: 10 }, lessons: 2 },
  "Pillar candles": { sales: "$1.6M", growth: "24%", share: "35%", ally: { Media: 40, Content: 35, Ops: 5 }, lessons: 1 },
  "Wax melts": { sales: "$400K", growth: "19%", share: "9%", ally: { Media: 15, Content: 12, Ops: 3 }, lessons: 1 },
  "Gift sets": { sales: "$400K", growth: "9%", share: "9%", ally: { Media: 20, Content: 20, Ops: 10 }, lessons: 2 },
  "Travel tins": { sales: "$100K", growth: "−4%", share: "2%", ally: { Media: 5, Content: 13, Ops: 2 }, lessons: 2 },
}

/** Each deal type's lift and added sales (the deals slide's numbers). */
export const DEAL_SPLIT: Record<string, { added: string; lift: string }> = {
  Lightning: { added: "+$310K", lift: "+52%" },
  Bundle: { added: "+$90K", lift: "+18%" },
  Coupon: { added: "+$40K", lift: "+6%" },
}
