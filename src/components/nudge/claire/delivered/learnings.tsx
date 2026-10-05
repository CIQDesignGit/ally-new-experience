"use client"

import { motion } from "framer-motion"
import { Sparkle, Sparkles } from "lucide-react"
import type { Learning } from "../../delivered-content-data"

/** Small sparkles that pop around the block once, the first time it scrolls into view. */
const BURST = [
  { top: "-8px", left: "12%", size: 12, delay: 0.1 },
  { top: "10px", right: "6%", size: 14, delay: 0.25 },
  { top: "-6px", right: "28%", size: 10, delay: 0.4 },
  { bottom: "18px", left: "-6px", size: 11, delay: 0.55 },
  { bottom: "-7px", right: "14%", size: 12, delay: 0.7 },
]

/** What underperformed, why, and what went into the agent's context: the feedback loop, made visible. */
export function Learnings({ items, applied }: { items: Learning[]; applied: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative rounded-lg border border-brand-200 bg-brand-25"
    >
      {BURST.map((b, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute text-brand-400"
          style={{ top: b.top, left: b.left, right: b.right, bottom: b.bottom }}
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: [0, 1, 0], scale: [0, 1.1, 0], rotate: [0, 90] }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1.1, delay: b.delay, repeat: 1, repeatDelay: 0.3 }}
          aria-hidden="true"
        >
          <Sparkle style={{ width: b.size, height: b.size }} fill="currentColor" />
        </motion.span>
      ))}

      <div className="flex items-center gap-2 border-b border-brand-100 px-4 py-2.5 text-sm font-medium text-slate-900">
        <Sparkles className="size-4 text-ally-600" />
        What didn&apos;t work, and what we changed
      </div>

      {items.map((l, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -6 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.35, delay: 0.2 + i * 0.15 }}
          className="grid grid-cols-[64px_minmax(0,1fr)] gap-3 border-b border-brand-100 bg-white/60 px-4 py-3 last:border-b-0"
        >
          <span className="font-mono text-sm font-semibold text-slate-950 tabular-nums">
            {l.skus} SKU{l.skus === 1 ? "" : "s"}
          </span>
          <div className="flex flex-col gap-1.5 text-sm">
            <span className="text-slate-700">{l.what}</span>
            <span className="flex flex-wrap items-baseline gap-2 text-slate-900">
              <motion.span
                className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-semibold text-brand-700"
                initial={{ scale: 0.9 }}
                whileInView={{ scale: [0.9, 1.06, 1] }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.15 }}
              >
                <motion.span
                  className="inline-flex"
                  animate={{ rotate: [0, 18, -12, 0], scale: [1, 1.25, 1] }}
                  transition={{ duration: 1.4, repeat: 2, repeatDelay: 1.2, delay: 0.6 + i * 0.15 }}
                >
                  <Sparkles className="size-3" />
                </motion.span>
                Added to agent context
              </motion.span>
              <span>{l.change}</span>
            </span>
          </div>
        </motion.div>
      ))}

      <div className="rounded-b-lg px-4 py-2.5 text-[13px] text-slate-600">{applied}</div>
    </motion.div>
  )
}
