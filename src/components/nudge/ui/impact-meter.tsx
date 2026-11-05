import { cn } from "@/lib/utils"
import type { Impact } from "../mvp"

const FILLED: Record<Impact, number> = { High: 3, Medium: 2, Low: 1 }

/** An impact level as three rising bars, so High / Medium / Low reads at a glance next to its word. */
export function ImpactMeter({ level, className }: { level: Impact; className?: string }) {
  return (
    <span className={cn("inline-flex items-end gap-0.5", className)} aria-hidden>
      {[0, 1, 2].map((i) => (
        <span key={i} className={cn("w-1 rounded-full", ["h-2", "h-3", "h-4"][i], i < FILLED[level] ? "bg-slate-950" : "bg-slate-300")} />
      ))}
    </span>
  )
}
