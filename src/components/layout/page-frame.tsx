import { cn } from "@/lib/utils"

/**
 * The page layout: the top strip and headline sit on the page background,
 * and each block of work is its own Widget below them. Room at the bottom for the floating Ask Ally bar.
 */
export function PageFrame({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mx-auto flex max-w-[1280px] flex-col pb-24 sm:px-6", className)}>{children}</div>
}

/** One block of work on the page: a white card with a hairline edge. */
export function Widget({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn("overflow-clip bg-white sm:rounded-2xl sm:shadow-xs sm:ring-1 sm:ring-slate-200", className)}>{children}</section>
}

/** The vertical rhythm between widgets. */
export function WidgetStack({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex flex-col gap-6", className)}>{children}</div>
}
