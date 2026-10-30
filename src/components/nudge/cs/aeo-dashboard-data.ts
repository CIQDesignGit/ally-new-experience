/**
 * The AI visibility dashboard's numbers. The last 8 weeks are the readout's own:
 * Aug 3–24 are the previous period's weeks, Aug 31 – Sep 21 this period's, so
 * both averages tie (11.8% and 9.2%). Only the 4 July weeks are new here. The
 * leaders' lines average to their leaderboard share over this period.
 */
import { AEO, LEADERBOARD, LOSING, TOPICS, WEEKS, type Position } from "./aeo-data"

const JULY = [
  { week: "Jul 6", you: 12.8, rank: 2 },
  { week: "Jul 13", you: 13.4, rank: 2 },
  { week: "Jul 20", you: 13.9, rank: 2 },
  { week: "Jul 27", you: 14.6, rank: 2 },
]
const AUGUST = ["Aug 3", "Aug 10", "Aug 17", "Aug 24"]

/** 12 weeks of your AI visibility (%) and place. */
export const TREND = [
  ...JULY,
  ...WEEKS.map((w, i) => ({ week: AUGUST[i], you: w.prev, rank: AEO.prevRank })),
  ...WEEKS.map((w) => ({ week: w.week, you: w.you, rank: w.rank })),
]

/** The top 3 brands over the same 12 weeks, %. */
export const RIVALS = [
  { brand: LEADERBOARD[0].brand, values: [23.6, 23.8, 24.0, 24.1, 24.2, 24.4, 24.5, 24.7, 24.3, 24.6, 25.0, 25.3] },
  { brand: LEADERBOARD[1].brand, values: [9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 10.0, 15.8, 17.6, 19.0] },
  { brand: LEADERBOARD[2].brand, values: [8.8, 8.9, 9.0, 9.1, 9.2, 9.3, 9.4, 9.5, 9.0, 8.9, 11.2, 11.7] },
]

export interface Question {
  q: string
  topic: string
  you: number
  change: number
  position: Position
  rank?: number
  /** Ally drafted a fix for these SKUs. */
  skus?: number
}

/** All 15 tracked questions: the 8 you lost ground on, then the 7 you held or gained. */
export const QUESTIONS: Question[] = [
  ...LOSING,
  { q: "best smelling jar candle for a living room", topic: "Scented jar candles", you: 31, change: 2.4, position: "Leading", rank: 1 },
  { q: "long-lasting scented candles under $30", topic: "Scented jar candles", you: 14, change: 0.8, position: "Down the list", rank: 4 },
  { q: "candles that smell like fall", topic: "Scented jar candles", you: 11, change: 0.6, position: "Down the list", rank: 4 },
  { q: "luxury candle gift for her", topic: "Gift sets", you: 8, change: 0.4, position: "Down the list", rank: 4 },
  { q: "candle gift set under $50", topic: "Gift sets", you: 6, change: 0.3, position: "Down the list", rank: 5 },
  { q: "soy wax candles that burn clean", topic: "Soy candles", you: 6, change: 0.2, position: "Down the list", rank: 4 },
  { q: "candle that burns evenly without tunneling", topic: "Clean-burning candles", you: 5, change: 0, position: "Down the list", rank: 5 },
]

/** Topics with their questions. */
export const TOPIC_QUESTIONS = TOPICS.map((t) => ({ ...t, questions: QUESTIONS.filter((q) => q.topic === t.topic) }))
