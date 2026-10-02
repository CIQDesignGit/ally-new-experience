import type { Chart, RetroSlide } from "../retro/prime-day"
import { ADS_SLIDE, ALL_SLIDES, DEALS_TABLE, EXEC_SLIDE, RETRO, SLIDES } from "../retro/prime-day"
import { RETRO_QUESTION } from "../retro/storyline-answer"
import { QBR, QBR_LAUNCH, QBR_SLIDES } from "./qbr"
import { NEGOTIATION_SLIDES } from "../skill/data"
import type { RetroState } from "../nudge-context"

/**
 * A deck Ally builds in chat. The flow is the same for every deck: questions,
 * answers, storyline, storyboard, deck, brand template, share. A spec is only
 * the content and the few extras that deck offers.
 */
export interface DeckSpec {
  id: string
  name: string
  forWhom: string
  /** Where its conversation lives. */
  path: string
  /** The request that starts it, as Michelle said it. */
  ask: string
  verdict: string
  sources: string
  /** The file name base for exports ("Prime-Day-retro"). */
  file: string
  slides: RetroSlide[]
  /** Every slide it can hold: the storyline plus any extras. */
  all: RetroSlide[]
  /** A question Michelle can add, and the slide that answers it. */
  addable?: { match: RegExp; slide: RetroSlide }
  /** An executive summary slide that can go first. */
  summary?: string
  /** A slide that can be shown as a table instead. */
  table?: { id: string; chart: Chart }
  /** A suggested reorder ("Put deals right after the market slide"). */
  reorder?: { id: string; after: string; label: string }
  /** Retro extras: lessons kept to Knowledge after sharing, and a live dashboard. */
  lessons?: boolean
  dashboard?: boolean
  repeat: { title: string; sub: string }
}

export const PRIME_DAY_DECK: DeckSpec = {
  id: "prime-day-retro",
  name: RETRO.name,
  forWhom: RETRO.forWhom,
  path: "/michelle/retro",
  ask: RETRO_QUESTION,
  verdict: RETRO.verdict,
  sources: RETRO.sources,
  file: "Prime-Day-retro",
  slides: SLIDES,
  all: ALL_SLIDES,
  addable: { match: /\b(ad|ads|advertising|media|sponsored|roas|iroas|spend)\b/i, slide: ADS_SLIDE },
  summary: EXEC_SLIDE.id,
  table: { id: "deals", chart: DEALS_TABLE },
  reorder: { id: "deals", after: "market", label: "Put deals right after the market slide" },
  lessons: true,
  dashboard: true,
  repeat: { title: "Run this after every event", sub: "Next: Black Friday, Nov 27 · same storyline, fresh numbers" },
}

export const QBR_DECK: DeckSpec = {
  id: QBR.id,
  name: QBR.name,
  forWhom: QBR.forWhom,
  path: "/michelle/decks/qbr",
  ask: QBR.ask,
  verdict: QBR.verdict,
  sources: QBR.sources,
  file: "Q4-business-review",
  slides: QBR_SLIDES,
  all: [...QBR_SLIDES, QBR_LAUNCH],
  addable: { match: /winter hearth|launch|new skus?/i, slide: QBR_LAUNCH },
  repeat: { title: "Refresh it every Monday", sub: "Same storyline, this week's numbers, on autopilot" },
}

/** Built by the negotiation skill: it opens as a finished deck. */
export const NEGOTIATION_DECK: DeckSpec = {
  id: "negotiation",
  name: "FY26 Amazon AVN",
  forWhom: "Michelle Ortiz",
  path: "/michelle/decks/negotiation",
  ask: "Open my negotiation prep",
  verdict: "61% of our volume works for both of us; 19% makes money for us but not for Amazon. The new terms mix is worth $2.18M a year, $6.5M over three years.",
  sources: "Vendor Central, 12 months · Ally's queue · category benchmarks · FY26 manufacturing cost",
  file: "FY26-Amazon-negotiation",
  slides: NEGOTIATION_SLIDES,
  all: NEGOTIATION_SLIDES,
  repeat: { title: "Run it again before next year's meeting", sub: "Same skill, fresh numbers, in about 10 minutes" },
}

export const DECKS: Record<string, DeckSpec> = { [PRIME_DAY_DECK.id]: PRIME_DAY_DECK, [QBR_DECK.id]: QBR_DECK, [NEGOTIATION_DECK.id]: NEGOTIATION_DECK }

/** The deck as Michelle shaped it: her order, her wording, any slide in its other form. */
export function deckSlides(spec: DeckSpec, order: string[], edits: Pick<RetroState, "alts" | "questions" | "answers"> = {}): RetroSlide[] {
  return order
    .map((id) => spec.all.find((s) => s.id === id))
    .filter((s): s is RetroSlide => !!s)
    .map((s) => ({
      ...s,
      chart: spec.table && s.id === spec.table.id && edits.alts?.includes(s.id) ? spec.table.chart : s.chart,
      question: edits.questions?.[s.id] ?? s.question,
      title: edits.answers?.[s.id] ?? s.title,
    }))
}
