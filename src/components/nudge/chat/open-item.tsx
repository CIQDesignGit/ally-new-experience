"use client"

import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

/** What an answer's action asks the page to open: an item in its queue, shown or straight into review. */
export type OpenItemDetail = { batch: string; review?: boolean }
export const OPEN_ITEM_EVENT = "ally-open-item"

/** An answer's next step on this page: opens the item in the queue, the same as clicking it there. */
export function OpenItem({ batch, review, primary, children }: OpenItemDetail & { primary?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent<OpenItemDetail>(OPEN_ITEM_EVENT, { detail: { batch, review } }))}
      className={cn(
        "mt-3 inline-flex h-9 items-center gap-1.5 rounded-md px-3.5 text-sm font-semibold transition-colors",
        primary ? "bg-brand-500 text-white hover:bg-brand-600" : "border border-slate-200 bg-white text-slate-950 hover:border-brand-300 hover:text-brand-700",
      )}
    >
      {children}
      <ArrowRight className="size-3.5" />
    </button>
  )
}
