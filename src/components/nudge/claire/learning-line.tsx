"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { GROWTH } from "../cs/context-data"

/**
 * Ally getting better, in two numbers: what it has learned about the brand
 * (this week's new things pop in as a chip) and how often its drafts are right
 * first time. Both count up once, when the line comes on screen.
 */
export function LearningLine({ href }: { href: string }) {
  const prev = GROWTH[GROWTH.length - 2]
  const last = GROWTH[GROWTH.length - 1]
  const first = GROWTH[0]
  const ref = useRef<HTMLDivElement>(null)
  const [t, setT] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = 0
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        const start = performance.now()
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / 1200)
          setT(p)
          if (p < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
      },
      { threshold: 0.6 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [])

  // Ease out, so the numbers settle rather than stop.
  const e = 1 - Math.pow(1 - t, 3)
  const known = Math.round(prev.entries + (last.entries - prev.entries) * Math.min(1, e * 1.3))
  const pct = Math.round(first.firstPass + (last.firstPass - first.firstPass) * e)
  const popped = e * 1.3 >= 1

  return (
    <div ref={ref} className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-slate-600">
      <span className="font-semibold text-ally-700">Getting better</span>
      <span className="text-slate-300">·</span>
      <span>
        <span className="font-mono font-semibold text-slate-950 tabular-nums">{known}</span> things learned
      </span>
      <span className={cn("rounded-full bg-ally-50 px-2 py-0.5 text-xs font-medium text-ally-700 transition-all duration-300 ease-[cubic-bezier(.3,1.6,.5,1)]", popped ? "scale-100 opacity-100" : "scale-50 opacity-0")}>
        +{last.entries - prev.entries} this week
      </span>
      <span className="text-slate-300">·</span>
      <span>
        <span className="font-mono font-semibold text-slate-950 tabular-nums">{pct}%</span> right first time
      </span>
      <span className="text-slate-300">·</span>
      <Link href={href} className="font-medium text-brand-700 hover:underline">
        See what Ally knows
      </Link>
    </div>
  )
}
