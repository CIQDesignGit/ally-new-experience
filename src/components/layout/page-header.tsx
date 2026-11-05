import { cn } from "@/lib/utils"
import { PAGE_EDGE } from "./page-frame"

/** Shared page headline — one size on every persona and plan page. */
export const PAGE_TITLE = "text-2xl leading-tight font-semibold tracking-tight text-balance text-slate-950 tabular-nums"

/** Muted numbers in the context line under the headline. */
export const FIG_EYEBROW = "font-medium text-slate-700"

const TONE = {
  neutral: { dot: "bg-slate-400", text: "text-slate-700" },
  brand: { dot: "bg-brand-500", text: "text-brand-700" },
  warning: { dot: "bg-warning-500", text: "text-warning-700" },
  error: { dot: "bg-error-500", text: "text-error-700" },
} as const

/** One status fact under the headline: a dot for its meaning, then a short phrase. */
export function Signal({ tone = "neutral", children }: { tone?: keyof typeof TONE; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-medium", TONE[tone].text)}>
      <span className={cn("size-2 shrink-0 rounded-full", TONE[tone].dot)} aria-hidden />
      {children}
    </span>
  )
}

/**
 * Page header under the top strip: headline first, context under it, then signals.
 * `aside` sits at the right, aligned with the headline block.
 */
export function PageHeader({
  eyebrow,
  title,
  signals,
  aside,
  className,
}: {
  eyebrow?: React.ReactNode
  title: React.ReactNode
  signals?: React.ReactNode
  aside?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex items-start justify-between gap-6", PAGE_EDGE, "pt-4 mb-6", className)}>
      <div className="min-w-0">
        <h1 className={PAGE_TITLE}>{title}</h1>
        {eyebrow && <p className="mt-1 text-sm leading-snug tabular-nums text-slate-500">{eyebrow}</p>}
        {signals && <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">{signals}</div>}
      </div>
      {aside && <div className="shrink-0 self-end">{aside}</div>}
    </div>
  )
}

/** A figure inside the context line: darker than surrounding copy so numbers scan first. */
export function Fig({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("font-semibold text-slate-950", className)}>{children}</span>
}
