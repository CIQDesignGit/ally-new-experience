"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Why } from "./data"

/** "Why Ally did this": a quiet icon on finished work; it opens to the context Ally used. */
export function WhyIcon({ why, align = "right" }: { why: Why[]; align?: "left" | "right" }) {
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
      <button type="button" aria-label="Why Ally did this" title="Why Ally did this" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="rounded-md p-1 text-ally-600 hover:bg-ally-50">
        <Sparkles className="size-4" />
      </button>
      {open && (
        <span className={cn("absolute top-8 z-30 w-[340px] rounded-xl bg-white p-4 text-left shadow-md ring-1 ring-slate-200", align === "right" ? "right-0" : "left-0")}>
          <span className="block text-sm font-semibold text-slate-950">Why Ally did this</span>
          <span className="mt-2 flex flex-col gap-2">
            {why.map((w) => (
              <span key={w.text} className="block text-[13px] text-slate-700">
                {w.text}
                <span className="mt-0.5 block text-xs text-slate-500">
                  <span className={w.scope === "Category" ? "font-medium text-info-700" : "font-medium text-ally-700"}>{w.scope} context</span> · {w.source}
                </span>
              </span>
            ))}
          </span>
          <Link href="/settings?tab=context" className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-brand-700 hover:underline">
            See what Ally knows <ArrowRight className="size-3.5" />
          </Link>
        </span>
      )}
    </span>
  )
}

