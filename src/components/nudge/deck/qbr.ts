import type { RetroSlide } from "../retro/prime-day"

/**
 * Claire's Q4 business review, from numbers the demo already shows: tracking
 * $48M against the $52M plan; $4.7M in the pipeline ($980K on autopilot, $1.5M
 * one approval away, $2.2M needs the team); Ally's $280K of $300K delivered so
 * far (content $100K, media $100K, ops $80K); $660K of Halloween content due Oct 26;
 * Brightwick at 27% on our brand terms; promo sales $1.2M, up 14%.
 */

export const QBR_SLIDES: RetroSlide[] = [
  {
    id: "landing",
    question: "Where will we land this quarter?",
    eyebrow: "Q4 FY26 · Outlook",
    title: "We're tracking to $48M, $4M short of the $52M plan",
    chart: {
      kind: "columns",
      bars: [
        { label: "Plan", value: 52, display: "$52M", tone: "muted" },
        { label: "Tracking", value: 48, display: "$48M", tone: "accent" },
      ],
    },
    insights: [
      { figure: "$48M", text: "at today's run rate" },
      { figure: "−$4M", text: "gap to the $52M plan", loss: true },
      { figure: "$4.7M", text: "in the pipeline to close it" },
    ],
  },
  {
    id: "pipeline",
    question: "What closes the gap?",
    eyebrow: "Q4 FY26 · Pipeline",
    title: "$4.7M in the pipeline covers the gap if it ships",
    chart: {
      kind: "rows",
      bars: [
        { label: "On autopilot", value: 0.98, display: "$980K", tone: "muted" },
        { label: "One approval away", value: 1.5, display: "$1.5M", tone: "accent" },
        { label: "Needs your team", value: 2.2, display: "$2.2M", tone: "muted" },
      ],
    },
    insights: [
      { figure: "45 min", text: "of your team's time unlocks $1.5M" },
      { figure: "$980K", text: "ships on autopilot with no one needed" },
      { figure: "$2.2M", text: "waits on your team's input" },
    ],
  },
  {
    id: "delivered",
    question: "What has Ally delivered so far?",
    eyebrow: "Q4 FY26 · Delivered",
    title: "Ally delivered $280K of $300K projected so far",
    chart: {
      kind: "rows",
      bars: [
        { label: "Media", value: 100, display: "$100K", tone: "media" },
        { label: "Content", value: 100, display: "$100K", tone: "accent" },
        { label: "Ops", value: 80, display: "$80K", tone: "ops" },
      ],
    },
    insights: [
      { figure: "$3.08", text: "IROAS on media, vs $2.80 plan" },
      { figure: "52", text: "SKUs improved by the content agent" },
      { figure: "18", text: "SKUs fixed in 48 hours by the ops agent" },
    ],
  },
  {
    id: "risk",
    question: "What's at risk?",
    eyebrow: "Q4 FY26 · At risk",
    title: "$660K of Halloween content expires in 18 days",
    chart: {
      kind: "rows",
      bars: [
        { label: "Jar candles · hero", value: 240, display: "$240K", tone: "accent" },
        { label: "Jar candles · core", value: 205, display: "$205K", tone: "accent" },
        { label: "Gift sets · hero", value: 115, display: "$115K", tone: "accent" },
        { label: "Gift sets · core", value: 100, display: "$100K", tone: "accent" },
      ],
    },
    insights: [
      { figure: "Oct 26", text: "publish-by date for Halloween" },
      { figure: "414", text: "SKUs waiting on one approval from Mike" },
    ],
  },
  {
    id: "competition",
    question: "What are competitors doing?",
    eyebrow: "Q4 FY26 · Competition",
    title: "Brightwick is buying our brand terms and undercutting gift sets",
    chart: {
      kind: "kpis",
      items: [
        { figure: "27%", label: "Brightwick's share of voice on our brand terms", loss: true },
        { figure: "18%", label: "our share of voice on gift terms", loss: true },
        { figure: "30% off", label: "Brightwick's gift-set promo" },
        { figure: "−14%", label: "our gift-set sales, last 4 weeks", loss: true },
      ],
    },
    insights: [
      { figure: "$4K", text: "a week on bids to win the terms back, on autopilot" },
      { figure: "2", text: "alerts watching both lines" },
    ],
  },
  {
    id: "promotions",
    question: "How are promotions performing?",
    eyebrow: "Q4 FY26 · Promotions",
    title: "Promo sales are $1.2M, up 14%; the Halloween deal lags",
    chart: {
      kind: "rows",
      bars: [
        { label: "Lightning deals", value: 38, display: "+38%", tone: "accent" },
        { label: "Bundles", value: 12, display: "+12%", tone: "accent" },
        { label: "Halloween deal", value: 11, display: "+11%", tone: "loss" },
        { label: "Coupons", value: 4, display: "+4%", tone: "muted" },
      ],
    },
    insights: [
      { figure: "$72K", text: "at risk on 5 SKUs missing the deal badge" },
      { figure: "+38%", text: "lift on lightning deals" },
    ],
  },
  {
    id: "asks",
    question: "What do I need from Claire?",
    eyebrow: "Q4 FY26 · Asks",
    title: "Two nudges unlock $972K this month",
    chart: { kind: "list", items: ["Nudge Mike to approve $660K of Halloween content by Oct 26", "Nudge Michelle to send $312K of ops fixes", "Widen autopilot on tail SKUs so more ships untouched"] },
    insights: [
      { figure: "$660K", text: "Mike, due Oct 26" },
      { figure: "$312K", text: "Michelle, $9K a day while it waits" },
    ],
  },
]

/** The question Michelle can add: answered from memory once the launch brief was kept. */
export const QBR_LAUNCH: RetroSlide = {
  id: "launch",
  question: "How is the Winter Hearth launch tracking?",
  eyebrow: "Q4 FY26 · Launch",
  title: "3 new Winter Hearth SKUs launch Nov 9; 2 of 3 are ready",
  chart: { kind: "list", items: ["Winter Hearth Jar · ready", "Cedar Ember Pillar · ready", "Frost Fig Travel Tin Trio · 4 attributes missing"] },
  insights: [
    { figure: "$420K", text: "launch-quarter sales for the 3 SKUs" },
    { figure: "Nov 9", text: "launch, ahead of the Winter Market" },
  ],
}

export const QBR = {
  id: "qbr",
  name: "Q4 business review",
  forWhom: "Claire Bennett",
  ask: "Build Claire's Q4 business review",
  verdict: "Q4 is tracking to $48M, $4M short of the $52M plan. $4.7M in the pipeline closes it if it ships, and $1.5M of it is one approval away.",
  sources: "Vendor Central Oct 1–8 · Amazon Ads · the Ally queue · 12 crawls a day",
}
