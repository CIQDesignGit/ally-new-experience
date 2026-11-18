"use client"

import { ArrowDown, ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"

export function Trend({ pct, className }: { pct: number | null; className?: string }) {
  if (pct === null) return <span className={cn("text-sm text-slate-400", className)}>NA</span>
  const up = pct > 0
  const flat = pct === 0
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 font-mono text-xs tabular-nums whitespace-nowrap",
        flat ? "text-slate-500" : up ? "text-success-700" : "text-error-600",
        className,
      )}
    >
      {!flat && (up ? <ArrowUp className="size-3" aria-hidden /> : <ArrowDown className="size-3" aria-hidden />)}
      {pct > 0 ? "+" : ""}
      {pct}%
    </span>
  )
}