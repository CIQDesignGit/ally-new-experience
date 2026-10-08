"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { GROWTH } from "../cs/context-data"

const W = 96
const H = 24

/**
 * Ally getting better, shown as it happens: when the line comes on screen, the
 * ten weeks of first-time approvals draw in, the percentage counts up from
 * August's, and this week's new things tick in at the end.
 */
export function LearningLine({ href }: { href: string }) {
  const first = GROWTH[0]
  const last = GROWTH[GROWTH.length - 1]
  const newThisWeek = last.entries - GROWTH[GROWTH.length - 2].entries
  const ref = useRef<HTMLParagraphElement>(null)
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
          const p = Math.min(1, (now - start) / 1600)
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

  // Ease out, so it settles rather than stops.
  const e = 1 - Math.pow(1 - t, 3)
  const pct = Math.round(first.firstPass + (last.firstPass - first.firstPass) * e)
  const min = first.firstPass - 4
  const max = 100
  const pts = GROWTH.map((g, i) => [(i / (GROWTH.length - 1)) * (W - 4) + 2, H - 2 - ((g.firstPass - min) / (max - min)) * (H - 4)] as const)
  const path = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ")
  const len = 140
  const end = pts[pts.length - 1]

  return (
    <p ref={ref} className="mt-2 flex items-center gap-2.5 text-sm text-slate-600">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden className="shrink-0">
        <path d={path} fill="none" stroke="var(--color-ally-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={len * (1 - e)} />
        <circle cx={end[0]} cy={end[1]} r="3" fill="var(--color-ally-500)" opacity={t >= 1 ? 1 : 0} className="transition-opacity duration-300" />
      </svg>
      <span className="min-w-0">
        Ally learns from your team every day:{" "}
        <span className={t >= 1 ? "font-semibold text-slate-950 transition-colors duration-500" : "font-semibold text-slate-400"}>{newThisWeek} new things</span> about Aurelle this week, and{" "}
        <span className="font-semibold text-slate-950 tabular-nums">{pct}%</span> of its drafts are now approved first time, up from {first.firstPass}% in August.{" "}
        <Link href={href} className="font-medium text-brand-700 hover:underline">
          See what Ally knows
        </Link>
      </span>
    </p>
  )
}
