"use client"

import { useEffect, useRef, useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * "Ally already did this": what ran on its own since the person was last here.
 * On every load the items check off one by one, unhurried, then the band folds
 * into one line; "See all" opens the list again. Reduced motion shows it folded.
 */
export function DoneReel({ items, since = "since Thursday" }: { items: string[]; since?: string }) {
  // -1 before it starts · 0..n items ticked · folded once it's done.
  const [ticked, setTicked] = useState(-1)
  const [folded, setFolded] = useState(false)
  const [open, setOpen] = useState(false)
  const timers = useRef<number[]>([])
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const t = timers.current
    if (reduce) {
      t.push(window.setTimeout(() => {
        setTicked(items.length)
        setFolded(true)
      }, 0))
    } else {
      // About 6 seconds in all: each item 700ms apart, then a pause before it folds.
      t.push(window.setTimeout(() => setTicked(0), 300))
      items.forEach((_, i) => t.push(window.setTimeout(() => setTicked(i + 1), 900 + i * 700)))
      t.push(window.setTimeout(() => setFolded(true), 900 + items.length * 700 + 1600))
    }
    return () => t.forEach(window.clearTimeout)
  }, [items])
  const count = Math.max(1, ticked)
  // One phrase, playing and folded: "Since yesterday, Ally did 6 things".
  const lead = since.charAt(0).toUpperCase() + since.slice(1)
  return (
    <div className={cn("rounded-xl px-5 transition-all duration-500", folded ? "bg-ally-50/70 py-3" : "bg-ally-50 py-4")}>
      {folded ? (
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex w-full items-center gap-2.5 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-brand-300">
          <span className="flex size-5 items-center justify-center rounded-full bg-ally-500">
            <Check className="size-3 text-white" />
          </span>
          <span className="text-sm font-semibold text-ally-800">
            {lead}, Ally did {items.length} things on autopilot
          </span>
          <span className="ml-auto inline-flex items-center gap-0.5 text-[13px] font-medium text-brand-700">
            {open ? "Hide" : "See all"}
            <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
          </span>
        </button>
      ) : (
        <div className="text-sm font-semibold text-ally-800">
          {lead}, Ally did <span className="font-mono">{count}</span> {count === 1 ? "thing" : "things"}
        </div>
      )}
      {(!folded || open) && (
        <ul className="mt-2.5 flex flex-col gap-2">
          {items.map((x, i) => {
            const shown = folded || i < ticked + 1
            const done = folded || i < ticked
            return (
              <li key={x} className={cn("flex items-center gap-2.5 text-sm transition-all duration-300", shown ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0")}>
                <span className={cn("flex size-[18px] shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors duration-200", done ? "border-ally-500 bg-ally-500" : "border-ally-300 bg-white")}>
                  <svg viewBox="0 0 12 12" className="size-[11px]" aria-hidden>
                    <path d="M2 6.5l2.5 2.5L10 3.5" fill="none" stroke="white" strokeWidth={3} strokeDasharray={20} strokeDashoffset={done ? 0 : 20} style={{ transition: "stroke-dashoffset 350ms ease 60ms" }} />
                  </svg>
                </span>
                <span className={done ? "text-slate-900" : "text-slate-500"}>{x}</span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
