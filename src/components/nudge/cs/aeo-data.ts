/**
 * Aurelle's AI visibility on Alexa Shopping, Aug 31 – Sep 27, against Aug 3–30.
 * AI visibility is Aurelle's share of what Alexa recommends across the tracked
 * questions, earlier positions counting more. The four weeks average to the
 * headline (9.2%); the previous period's to 11.8%.
 */
export const AEO = {
  assistant: "Alexa Shopping",
  period: "Aug 31 – Sep 27",
  previous: "Aug 3–30",
  updated: "Mon, Oct 5",
  visibility: 9.2,
  prevVisibility: 11.8,
  rank: 5,
  prevRank: 2,
  questions: 15,
}

export const WEEKS = [
  { week: "Aug 31", you: 10.2, prev: 14.2, rank: 2 },
  { week: "Sep 7", you: 9.1, prev: 11.5, rank: 3 },
  { week: "Sep 14", you: 9.2, prev: 11.6, rank: 5 },
  { week: "Sep 21", you: 8.4, prev: 10.0, rank: 5 },
]

/** Top 10, with places moved since the previous period. */
export const LEADERBOARD = [
  { brand: "Bath & Body Works", share: 24.8, moved: 0 },
  { brand: "Voluspa", share: 15.6, moved: 1 },
  { brand: "WoodWick", share: 10.2, moved: 1 },
  { brand: "Yankee Candle", share: 9.8, moved: 1 },
  { brand: "Aurelle", share: 9.2, moved: -3, you: true },
  { brand: "Paddywax", share: 6.0, moved: 0 },
  { brand: "Brooklyn Candle Studio", share: 4.8, moved: 0 },
  { brand: "Chesapeake Bay Candle", share: 4.8, moved: 0 },
  { brand: "DW Home", share: 3.7, moved: 1 },
  { brand: "Nest Fragrances", share: 3.7, moved: -1 },
]

/** Groups of shopper questions: Aurelle's share, place, change, and the leader's share. */
export const TOPICS = [
  { topic: "Clean-burning candles", you: 8.7, rank: 6, change: -9.0, moved: -4, leader: 14.7 },
  { topic: "Unscented candles", you: 3.9, rank: 8, change: -2.4, moved: -1, leader: 30.2 },
  { topic: "Gift sets", you: 10.3, rank: 5, change: -1.7, moved: 0, leader: 15.5 },
  { topic: "Soy candles", you: 4.9, rank: 5, change: -1.1, moved: 0, leader: 27.3 },
  { topic: "Scented jar candles", you: 18.5, rank: 2, change: 1.3, moved: 0, leader: 36.0 },
]
export const LEADER = "Bath & Body Works"

export type Position = "Leading" | "Runner-up" | "Down the list" | "Not surfaced"

/** The questions Aurelle lost ground on, worst first, and what Ally drafted for each. */
export const LOSING = [
  { q: "candles that won't soot or smoke up my walls", topic: "Clean-burning candles", you: 12, change: -15.3, position: "Runner-up" as Position, rank: 3, skus: 1 },
  { q: "non-toxic candles that are safe to burn around pets", topic: "Clean-burning candles", you: 0, change: -7.1, position: "Not surfaced" as Position, skus: 2, note: "Your legal rule rules out \"non-toxic\": Ally answers with the wax and wick facts instead" },
  { q: "unscented candles that still burn for a long time", topic: "Unscented candles", you: 0, change: -6.6, position: "Not surfaced" as Position, skus: 2 },
  { q: "candle gift set for a housewarming", topic: "Gift sets", you: 18, change: -4.6, position: "Runner-up" as Position, rank: 2, skus: 1 },
  { q: "clean-burning candles with lead-free wicks", topic: "Clean-burning candles", you: 9, change: -4.6, position: "Down the list" as Position, rank: 4, skus: 2 },
  { q: "highly rated candles for people with scent allergies", topic: "Soy candles", you: 0, change: -3.5, position: "Not surfaced" as Position, skus: 4 },
  { q: "unscented pillar candles for dinner parties", topic: "Unscented candles", you: 5, change: -0.5, position: "Down the list" as Position, rank: 4, skus: 2 },
  { q: "fragrance-free candles that won't trigger a headache", topic: "Unscented candles", you: 0, change: 0, position: "Not surfaced" as Position, skus: 2 },
]
export const LOSING_SKUS = LOSING.reduce((n, l) => n + l.skus, 0)

/** Where Aurelle sits across all 15 questions. */
export const POSITIONS: { label: Position; n: number }[] = [
  { label: "Leading", n: 1 },
  { label: "Runner-up", n: 2 },
  { label: "Down the list", n: 8 },
  { label: "Not surfaced", n: 4 },
]
