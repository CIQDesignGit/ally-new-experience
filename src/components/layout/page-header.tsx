import { cn } from "@/lib/utils"

/** The one page-title style. Every page's h1 uses it, so headlines read the same size everywhere. */
export const PAGE_TITLE = "text-3xl leading-tight font-semibold tracking-tight text-balance text-slate-950 tabular-nums"

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
 * The page header under the top strip, in three levels: the context line (small,
 * muted), the headline (the one big thing), then status signals. `aside` sits
 * at the right, bottom-aligned with the headline: an action, a chart, a celebration.
 */
export function PageHeader({ eyebrow, title, signals, aside, className }: { eyebrow?: React.ReactNode; title: React.ReactNode; signals?: React.ReactNode; aside?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-end justify-between gap-8 px-10 pt-2 pb-6", className)}>
      <div className="min-w-0">
        {eyebrow && <div className="mb-1.5 text-[15px] text-slate-500 tabular-nums">{eyebrow}</div>}
        <h1 className={PAGE_TITLE}>{title}</h1>
        {signals && <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm">{signals}</div>}
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </div>
  )
}

/** A figure inside the context line: same font, darker, so it reads before the words around it. */
export function Fig({ children }: { children: React.ReactNode }) {
  return <span className="font-semibold text-slate-950">{children}</span>
}
