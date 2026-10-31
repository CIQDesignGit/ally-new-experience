"use client"

import { RotateCcw } from "lucide-react"
import { useNudge } from "./nudge-context"
import { resetCompetition } from "../competition/state"

/** Wipes all nudge/approve state (and the competition request) and reloads, so the demo can be replayed from a clean slate. */
export function ResetDemoButton() {
  const { resetDemo } = useNudge()

  function handleReset() {
    resetDemo()
    // The competition request too, so the next run starts from Michelle asking.
    resetCompetition()
    window.location.reload()
  }

  return (
    <button
      type="button"
      onClick={handleReset}
      title="Reset"
      className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700"
    >
      <RotateCcw className="size-3" />
      Reset
    </button>
  )
}
