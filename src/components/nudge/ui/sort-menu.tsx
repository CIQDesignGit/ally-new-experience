"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowUpDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { setQueueSort, useQueueSort, type QueueSort } from "../queue-sort"

const OPTIONS: { id: QueueSort; label: string; detail: string }[] = [
  { id: "gap", label: "Gap to plan", detail: "Biggest share of the gap first" },
  { id: "sales", label: "SKU sales", detail: "Best-selling SKUs first" },
]

/**
 * The queue's sort setting, behind a small icon: deadline always comes first,
 * then the choice here. Gap to plan is the default.
 */
export function SortMenu() {
  const sort = useQueueSort()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false)
    document.addEventListener("mousedown", close)
    return () => document.removeEventListener("mousedown", close)
  }, [open])
  return (
    <span ref={ref} className="relative inline-flex">
      <button type="button" aria-label="Sort" title="Sort" aria-expanded={open} onClick={() => setOpen((v) => !v)} className={cn("rounded-md p-1.5 hover:bg-slate-100", open ? "text-slate-700" : "text-slate-400 hover:text-slate-700")}>
        <ArrowUpDown className="size-4" />
      </button>
      {open && (
        <span role="radiogroup" aria-label="Sort by" className="absolute top-9 right-0 z-30 w-[240px] rounded-xl bg-white p-2 text-left shadow-md ring-1 ring-slate-200">
          <span className="block px-2 pt-1 pb-2 text-xs text-slate-500">Deadline first, then</span>
          {OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={sort === o.id}
              onClick={() => {
                setQueueSort(o.id)
                setOpen(false)
              }}
              className="flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left hover:bg-slate-50"
            >
              <Check className={cn("mt-0.5 size-4 shrink-0", sort === o.id ? "text-brand-600" : "invisible")} aria-hidden />
              <span>
                <span className="block text-sm font-medium text-slate-950">{o.label}</span>
                <span className="block text-xs text-slate-500">{o.detail}</span>
              </span>
            </button>
          ))}
        </span>
      )}
    </span>
  )
}
