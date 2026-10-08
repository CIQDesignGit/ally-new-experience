"use client"

import { DeckWorkspace } from "@/components/nudge/deck/workspace"
import { SARAH_PRIME_DAY_DECK } from "@/components/nudge/deck/spec"

/** Sarah's Prime Day deck for Claire: Michelle's retro skill, shaped by Aurelle's context. */
export default function SarahPrimeDayPage() {
  return <DeckWorkspace spec={SARAH_PRIME_DAY_DECK} />
}
