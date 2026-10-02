"use client"

import { DeckWorkspace } from "@/components/nudge/deck/workspace"
import { QBR_DECK } from "@/components/nudge/deck/spec"

/** Claire's Q4 business review, built by Michelle with Ally: the deck engine with the QBR's content. */
export default function QbrPage() {
  return <DeckWorkspace spec={QBR_DECK} />
}
