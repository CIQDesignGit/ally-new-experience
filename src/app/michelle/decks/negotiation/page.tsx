"use client"

import { DeckWorkspace } from "@/components/nudge/deck/workspace"
import { NEGOTIATION_DECK } from "@/components/nudge/deck/spec"

/** The deck the negotiation skill builds: the deck engine with the FY26 asks. */
export default function NegotiationDeckPage() {
  return <DeckWorkspace spec={NEGOTIATION_DECK} />
}
