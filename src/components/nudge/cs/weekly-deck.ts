import type { DeckSpec } from "../deck/spec"
import { QBR_SLIDES } from "../deck/qbr"
import type { RetroSlide } from "../retro/prime-day"
import { MEDIA_BATCHES } from "../media/data"

/**
 * Sarah's weekly session deck: the same deck engine as the QBR, this week's
 * storyline. Where it lands, what Ally did in media and why, what's at risk,
 * the competition, and what the customer asked for last week.
 */
const pick = (id: string) => QBR_SLIDES.find((s) => s.id === id)!
const k = (v: number) => `$${Math.round(v * 1000)}K`

const MEDIA_ACTIONS: RetroSlide = {
  id: "media-actions",
  question: "What did Ally do in media, and why?",
  eyebrow: "Week of Oct 5 · Media",
  title: "Ally's bid and budget actions this week, by why",
  chart: {
    kind: "rows",
    bars: MEDIA_BATCHES.map((b) => ({ label: `${b.play} · ${b.name}`, value: Math.round(b.value * 1000), display: k(b.value), tone: b.tier === "autopilot" ? "muted" : "media" })),
  },
  insights: [
    { figure: "38", text: "keywords harvested: strong organic rank, paid adds little" },
    { figure: "$21K", text: "a week moved to the keywords content added" },
    { figure: "11", text: "SKUs with ads paused until they can sell" },
  ],
}

const ASKS: RetroSlide = {
  id: "asks",
  question: "What did you ask for last week?",
  eyebrow: "Week of Oct 5 · Your asks",
  title: "What you asked for on Oct 1, and where each stands",
  chart: {
    kind: "list",
    items: ["Walmart media pacing, weekly", "WBR on Tuesdays, with Target", "Brightwick promo alert", "Cedar & Smoke supply gap handled", "Pumpkin Chai mini ready for Nov 20", "Q4 margin floor 32% in every play"],
  },
  insights: [{ figure: "6", text: "asks from the Oct 1 call" }],
}

const SLIDES = [pick("landing"), pick("delivered"), MEDIA_ACTIONS, pick("risk"), pick("competition"), ASKS]

export const WEEKLY_DECK: DeckSpec = {
  id: "aurelle-weekly",
  name: "Aurelle weekly session",
  forWhom: "Claire Bennett",
  path: "/sarah/decks/weekly",
  ask: "Build the deck for my Aurelle session on Thursday",
  verdict: "Tracking to $48M, $4M short of plan. $660K of Halloween content is one approval away; media moved $21K a week into the keywords content added.",
  sources: "Claire's page · James's media actions · the Oct 1 call",
  file: "Aurelle-weekly-session",
  slides: SLIDES,
  all: SLIDES,
  repeat: { title: "Refresh it before every session", sub: "Same storyline, this week's numbers, the night before" },
  author: { person: "sarah", home: "/sarah", label: "Today" },
}
