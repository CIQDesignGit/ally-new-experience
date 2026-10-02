"use client"

import { DeckWorkspace } from "@/components/nudge/deck/workspace"
import { PRIME_DAY_DECK } from "@/components/nudge/deck/spec"

/** Michelle's Prime Day retro: the deck engine with the retro's content. */
export default function RetroPage() {
  return <DeckWorkspace spec={PRIME_DAY_DECK} />
}
