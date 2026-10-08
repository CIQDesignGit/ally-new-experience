"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { GROWTH } from "../cs/context-data"

/**
 * Ally getting better, in two numbers: what it has learned about the brand and
 * how often its drafts are right first time. The one motion: the rate counts up
 * from August's, once, when the line comes on screen.
 */
export function LearningLine({ href }: { href: string }) {
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
  const pct = Math.round(first.firstPass + (last.firstPass - first.firstPass) * e)

  return (
    <div ref={ref} className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-slate-600">
      <span className="font-semibold text-ally-700">Getting better every day</span>
      <span className="text-slate-300">·</span>
      <span>
        <span className="font-mono font-semibold text-slate-950 tabular-nums">{last.entries}</span> things learned
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
