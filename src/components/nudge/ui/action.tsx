import { Check, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * The one way to show "what to do" (see DESIGN.md): a card with a header and
 * a row per action. Every row has the same shape: name and detail on the
 * left, the button on the right, centered on the text; setup controls (a cap,
 * a scope) go under the detail. Peer rows use the same button style.
 */
export function ActionCard({ title = "What Ally recommends", children, className }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-slate-200 bg-white", className)}>
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-25 px-5 py-2.5 text-[13px] font-semibold text-slate-950">
        <Sparkles className="size-3.5 text-brand-600" /> {title}
      </div>
      <div className="divide-y divide-slate-100">{children}</div>
    </div>
  )
}

export function ActionRow({ title, detail, setup, action, done }: { title: string; detail?: React.ReactNode; /** Under the detail: what the action is set up with (a cap, a scope). */ setup?: React.ReactNode; /** The button; replaced by `done` once it's done. */ action: React.ReactNode; /** "Approved", "Sent to James": shown in place of the button. */ done?: string | false }) {
  return (
    // Two rows: the button centers on the name and detail only; setup sits under them on the left.
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-2.5 px-5 py-4">
      <div className="min-w-0">
        <div className="text-[15px] font-semibold text-slate-950">{title}</div>
        {detail && <div className="mt-0.5 text-[14px] text-slate-600">{detail}</div>}
      </div>
      {/* Peer buttons share one fixed width (not a minimum), so their edges line up down the card. */}
      <div className="flex w-[200px] justify-end [&>button]:w-full">
        {done ? (
          <span className="inline-flex items-center gap-1.5 text-[14px] font-medium text-success-700">
            <Check className="size-4" /> {done}
          </span>
        ) : (
          action
        )}
      </div>
      {setup && <div className="col-start-1">{setup}</div>}
    </div>
  )
}
