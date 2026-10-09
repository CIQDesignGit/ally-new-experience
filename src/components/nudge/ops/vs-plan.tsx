import { cn } from "@/lib/utils"

/**
 * One "against plan" statement, the same shape everywhere: what it is, the gap
 * (big, colored), then actual of plan and the percent. Context like "57% of the
 * week gone" rides in the label, never between the numbers.
 */
export function VsPlan({ label, actual, plan, fmt, size = "lg" }: { label: string; actual: number; plan: number; fmt: (v: number, signed?: boolean) => string; size?: "lg" | "md" }) {
  const gap = actual - plan
  return (
    <div className="min-w-0">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2 tabular-nums">
        <span className={cn("font-semibold tracking-tight", size === "lg" ? "text-[26px]" : "text-[17px]", gap < 0 ? "text-error-600" : "text-success-700")}>{fmt(gap, true)}</span>
        <span className="text-sm whitespace-nowrap text-slate-500">
          {fmt(actual)} of {fmt(plan)} · {Math.round((actual / plan) * 100)}%
        </span>
      </div>
    </div>
  )
}
