import { cn } from "@/lib/utils"

/** Shared max width for page content and the Ask Ally dock so they stay aligned. */
export const PAGE_MAX = "max-w-[1240px]"

/**
 * Horizontal edge for the top strip, page headline, and section titles on the gray
 * background: flush with white cards on sm+, inset on small screens.
 */
export const PAGE_EDGE = "px-4 sm:px-0"

/** @deprecated Same as PAGE_EDGE */
export const PAGE_CHROME = PAGE_EDGE

/**
 * Vertical rhythm: space below the page headline before the next block (card, widget stack, table).
 */
export const PAGE_HEAD_SPACE = "mb-8"

/**
 * Inside white widgets (queue header, detail pane): tighter on small screens when
 * the card goes edge to edge.
 */
export const WIDGET_INSET = "px-4 sm:px-10"

/** @deprecated Use PAGE_CHROME or WIDGET_INSET */
export const PAGE_INSET = WIDGET_INSET

/**
 * The page layout: the top strip and headline sit on the page background,
 * and each block of work is its own Widget below them. Room at the bottom for the floating Ask Ally bar.
 */
export function PageFrame({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mx-auto flex flex-col pb-24 sm:px-6", PAGE_MAX, className)}>{children}</div>
}

/** One block of work on the page: a white card with a hairline edge. */
export function Widget({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn("overflow-clip bg-white sm:rounded-2xl sm:shadow-xs sm:ring-1 sm:ring-slate-200", className)}>{children}</section>
}

/** Title band at the top of a Widget; separated from body by a hairline. */
export function WidgetHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("border-b border-slate-200 py-4", WIDGET_INSET, className)}>{children}</div>
}

/** Main content of a Widget. `pad={false}` for full-bleed tables inside the card. */
export function WidgetBody({ children, className, pad = true }: { children: React.ReactNode; className?: string; pad?: boolean }) {
  return <div className={cn(pad && WIDGET_INSET, pad && "py-4", className)}>{children}</div>
}

/** Optional actions or meta below the body. */
export function WidgetFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("border-t border-slate-200 py-3", WIDGET_INSET, className)}>{children}</div>
}

/**
 * The title of a group of cards that sits on the page background, outside any Widget.
 * Flush with the card edges; titles inside a Widget keep the Widget's own inset.
 */
export function SectionTitle({ children, aside, className }: { children: React.ReactNode; aside?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-baseline gap-2", PAGE_EDGE, className)}>
      <h2 className="text-base font-semibold text-slate-950">{children}</h2>
      {aside && <span className="text-sm text-slate-500">{aside}</span>}
    </div>
  )
}

/** The vertical rhythm between widgets. */
export function WidgetStack({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex flex-col gap-6", className)}>{children}</div>
}
