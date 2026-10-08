"use client"

import { DeckWorkspace } from "@/components/nudge/deck/workspace"
import { WEEKLY_DECK } from "@/components/nudge/cs/weekly-deck"

/** Sarah's weekly session deck: the deck engine with this week's storyline. */
export default function WeeklyDeckPage() {
  return <DeckWorkspace spec={WEEKLY_DECK} />
}
