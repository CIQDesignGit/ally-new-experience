import { cn } from "@/lib/utils"

/**
 * The page layout: the top strip and headline sit on the page background,
 * and each block of work is its own Widget below them. Room at the bottom for the floating Ask Ally bar.
 */
export function PageFrame({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mx-auto flex max-w-[1280px] flex-col pb-24 sm:px-6", className)}>{children}</div>
}

/**
 * The side padding for anything on the page background (top strip, page header,
 * section titles, tabs): flush with the Widget edges on wide screens, inset when
 * Widgets go edge to edge on mobile.
 */
export const PAGE_EDGE = "px-4 sm:px-0"

/** One block of work on the page: a white card with a hairline edge. */
export function Widget({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn("overflow-clip bg-white sm:rounded-2xl sm:shadow-xs sm:ring-1 sm:ring-slate-200", className)}>{children}</section>
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
