"use client"

import { useEffect, useRef, useState } from "react"
import { Info } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * How something works, behind a small icon: the page shows only the product,
 * the explanation opens on click. Short points, not sentences.
 */
export function InfoIcon({ title, points, align = "right" }: { title: string; points: string[]; align?: "left" | "right" }) {
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
      <button type="button" aria-label={title} title={title} aria-expanded={open} onClick={() => setOpen((v) => !v)} className={cn("rounded-md p-1.5 hover:bg-slate-100", open ? "text-slate-700" : "text-slate-400 hover:text-slate-700")}>
        <Info className="size-4" />
      </button>
      {open && (
        <span className={cn("absolute top-9 z-30 w-[280px] rounded-xl bg-white p-4 text-left shadow-md ring-1 ring-slate-200", align === "right" ? "right-0" : "left-0")}>
          <span className="block text-sm font-semibold text-slate-950">{title}</span>
          <span className="mt-2 flex flex-col gap-1.5">
            {points.map((p) => (
              <span key={p} className="flex gap-2 text-[13px] text-slate-700">
                <span className="mt-2 size-1 shrink-0 rounded-full bg-slate-400" aria-hidden />
                {p}
              </span>
            ))}
          </span>
        </span>
      )}
    </span>
  )
}
