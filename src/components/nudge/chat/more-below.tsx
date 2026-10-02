"use client"

import { useEffect, useState } from "react"
import { ArrowDown } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * The ↓ above the Ask Ally box, like Claude's: shows only while there's more
 * below (the page, or a scrolling list), and takes you to the end.
 */
export function MoreBelow({ list, className }: { list?: React.RefObject<HTMLElement | null>; className?: string }) {
  const [more, setMore] = useState(false)

  useEffect(() => {
    const el = list?.current
    const check = () => {
      const gap = el ? el.scrollHeight - el.scrollTop - el.clientHeight : document.documentElement.scrollHeight - window.scrollY - window.innerHeight
      setMore(gap > 24)
    }
    const t = el ?? window
    t.addEventListener("scroll", check, { passive: true })
    window.addEventListener("resize", check)
    // Content grows (answers, expanding rows) without a scroll event.
    const ro = new ResizeObserver(check)
    ro.observe(el ?? document.body)
    check()
    return () => {
      t.removeEventListener("scroll", check)
      window.removeEventListener("resize", check)
      ro.disconnect()
    }
  }, [list])

  if (!more) return null
  return (
    <button
      type="button"
      aria-label="Scroll to the end"
      onClick={() => {
        const el = list?.current
        if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
        else window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" })
      }}
      className={cn("pointer-events-auto flex size-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-[0_4px_12px_-4px_rgba(15,23,42,0.2)] hover:text-slate-950", className)}
    >
      <ArrowDown className="size-4" />
    </button>
  )
}

/** Content fades out above the box instead of being cut mid-line. */
export function FadeAbove({ from = "from-white", className }: { from?: string; className?: string }) {
  return <div aria-hidden className={cn("pointer-events-none h-8 bg-gradient-to-t to-transparent", from, className)} />
}
