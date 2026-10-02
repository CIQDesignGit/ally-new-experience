import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * The inbox rail shared by Mike's and Michelle's pages. Each bucket is clearly its
 * own section: a tinted header band and a colored edge in the bucket's color (the
 * same colors as Claire's chart), with a line saying what the bucket means. Items
 * sit on white with a neutral selection, so the bucket color never clashes with a
 * selected item or an amber deadline.
 */
export const GROUPS = [
  { tier: "approval", label: "One approval away", dot: "bg-brand-500", edge: "bg-brand-500", band: "bg-brand-100", effort: "One approval each" },
  { tier: "input", label: "Needs your input", dot: "bg-warning-500", edge: "bg-warning-500", band: "bg-warning-100", effort: "~3 days of your team's time" },
  { tier: "autopilot", label: "On autopilot", dot: "bg-info-500", edge: "bg-info-500", band: "bg-info-100", effort: "Already scheduled, no action required" },
] as const

/** Selected item: a soft neutral card, same as the selection box elsewhere. */
export const ITEM_ACTIVE = "bg-slate-100 ring-1 ring-slate-200"
export const ITEM_IDLE = "hover:bg-slate-50"

export function RailGroup({
  group,
  value,
  effort,
  action,
  first,
  children,
}: {
  group: (typeof GROUPS)[number]
  value: string
  /** Overrides the bucket's default effort line when the items know their own (e.g. review minutes). */
  effort?: string
  action?: React.ReactNode
  first?: boolean
  children: React.ReactNode
}) {
  return (
    <section data-tier={group.tier} className={cn("relative scroll-mt-4", !first && "border-t border-slate-200")}>
      <span className={cn("absolute inset-y-0 left-0 w-1", group.edge)} aria-hidden />
      <div className={cn("flex items-start justify-between gap-3 py-3 pr-5 pl-6", group.band)}>
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-950">
            {group.label}
            <span className="font-mono font-medium text-slate-500 tabular-nums">{value}</span>
          </div>
          <div className="mt-0.5 text-xs text-slate-500">{effort ?? group.effort}</div>
        </div>
        {action}
      </div>
      <div className="flex flex-col gap-0.5 bg-white py-2 pr-2 pl-3">{children}</div>
    </section>
  )
}

/** "Approve all" as a quiet text action: the detail pane's button stays the one strong action. */
export function ApproveAll({ pending, onClick }: { pending: number; onClick: () => void }) {
  return pending === 0 ? (
    <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-success-700">
      <Check className="size-3.5" />
      All approved
    </span>
  ) : (
    <button type="button" onClick={onClick} className="shrink-0 text-xs font-semibold text-brand-700 hover:text-brand-800 hover:underline">
      Approve all
    </button>
  )
}

/** One quiet meta line under an item: parts joined by dots, each with its own tone. */
export function MetaLine({ parts }: { parts: (React.ReactNode | false | undefined)[] }) {
  const shown = parts.filter(Boolean)
  if (shown.length === 0) return null
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 text-xs text-slate-500">
      {shown.map((p, i) => (
        <span key={i} className="inline-flex items-center gap-1.5">
          {i > 0 && <span className="text-slate-300">·</span>}
          {p}
        </span>
      ))}
    </div>
  )
}
