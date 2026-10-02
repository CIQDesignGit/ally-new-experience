"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Brain } from "lucide-react"

/**
 * Memory, as one recognizable mark: the same brain glyph and line when Ally
 * keeps something ("Remembered") and when it brings it back weeks later ("From
 * memory"), so the second moment visibly answers the first.
 */

function Mark() {
  return (
    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-50 ring-1 ring-brand-200">
      <Brain className="size-3.5 text-brand-600" />
    </span>
  )
}

/** One line, when Ally keeps a fact. */
export function MemorySaved({ text, label = "Remembered" }: { text: string; /** Left out when the text says it already ("Learned: …"). */ label?: string | null }) {
  return (
    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.3 }} className="flex items-center gap-2.5 text-[14px]">
      <Mark />
      {label && <span className="text-slate-500">{label}</span>}
      <span className="font-medium text-slate-950">{text}</span>
      <Link href="/settings?tab=knowledge" className="ml-1 text-[13px] text-slate-400 hover:text-brand-700 hover:underline">
        Memory
      </Link>
    </motion.div>
  )
}

/** The callback: what Ally kept, when and from where, above what it now knows because of it. */
export function MemoryRecall({ text, from, children }: { text: string; from: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-brand-200 bg-brand-25 px-4 py-3.5">
      <div className="flex items-center gap-2.5 text-[13px]">
        <Mark />
        <span className="font-medium text-brand-700">From memory</span>
        <span className="text-slate-500">· {from}</span>
      </div>
      <div className="mt-2 pl-[34px] text-[15px] font-semibold text-slate-950">{text}</div>
      {children && <div className="mt-1.5 pl-[34px] text-[14px] text-slate-700">{children}</div>}
    </div>
  )
}
