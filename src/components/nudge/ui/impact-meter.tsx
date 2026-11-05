import { cn } from "@/lib/utils"
import type { Impact } from "../mvp"

const FILLED: Record<Impact, number> = { High: 3, Medium: 2, Low: 1 }

/** Text and bar colors for High / Medium / Low — one meaning everywhere impact shows. */
export const IMPACT_TONE: Record<Impact, { text: string; bar: string }> = {
  High: { text: "text-error-600", bar: "bg-error-600" },
  Medium: { text: "text-warning-700", bar: "bg-warning-600" },
  Low: { text: "text-slate-500", bar: "bg-slate-400" },
}

/** An impact level as three rising bars, so High / Medium / Low reads at a glance next to its word. */
export function ImpactMeter({ level, className }: { level: Impact; className?: string }) {
  const bar = IMPACT_TONE[level].bar
  return (
    <span className={cn("inline-flex items-end gap-0.5", className)} aria-hidden>
      {[0, 1, 2].map((i) => (
        <span key={i} className={cn("w-1 rounded-full", ["h-2", "h-3", "h-4"][i], i < FILLED[level] ? bar : "bg-slate-200")} />
      ))}
    </span>
  )
}
