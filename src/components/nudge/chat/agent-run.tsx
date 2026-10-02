"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Check, ChevronDown, FileSpreadsheet, FileText, Loader2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * A big piece of work, shown the way an agent works: Ally's mark turning, the
 * files it reads (each with its own progress), then the steps ticking through,
 * slow where it reads data and quick after. Beside it, "Did you know" rotates
 * facts from the account while Ally works. When it's done it folds into one
 * line you can open, and the answer follows. Only for real work: a quick
 * question gets a short beat in the chat, never this.
 */

export interface RunFile {
  name: string
  size?: string
  /** What reading it found: "14 tabs", "22 slides". */
  detail: string
}

/** Facts from the demo's own numbers, so each one ties to a page. */
export const FACTS = [
  { figure: "$1.5M", text: "is one approval away across the queues.", from: "Claire's brief" },
  { figure: "18 days", text: "until $660K of Halloween content expires.", from: "Mike's queue" },
  { figure: "30% off", text: "Brightwick's gift sets this week. Ours are at full price.", from: "Store Walk" },
  { figure: "94%", text: "buy box win rate, up 2 points this quarter.", from: "Michelle's ops" },
  { figure: "$3.40", text: "back for every $1 of Prime Day media, vs a $3.01 average.", from: "Prime Day retro" },
  { figure: "$4.7M", text: "of work is in flight to close the $4M gap to plan.", from: "Gap to plan" },
]

function AllyMark({ spinning }: { spinning: boolean }) {
  return (
    <span className="relative flex size-9 shrink-0 items-center justify-center">
      {spinning && <span className="absolute inset-0 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" style={{ animationDuration: "1.1s" }} aria-hidden />}
      <span className="flex size-7 items-center justify-center rounded-full bg-brand-50">
        <Sparkles className="size-3.5 text-brand-600" />
      </span>
    </span>
  )
}

/** "Did you know": one fact at a time, a new one every 3 seconds. */
export function DidYouKnow({ className }: { className?: string }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = window.setInterval(() => setI((x) => (x + 1) % FACTS.length), 3000)
    return () => window.clearInterval(t)
  }, [])
  const f = FACTS[i]
  return (
    <motion.aside initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6, duration: 0.3 }} className={cn("flex flex-col rounded-xl bg-brand-25 px-5 py-4 ring-1 ring-brand-100", className)} aria-live="polite">
      <div className="text-xs font-medium text-brand-700">Did you know</div>
      <div className="relative mt-2 min-h-[92px]">
        {/* A new fact replaces the last and fades in; no waiting on an exit, so it always moves on. */}
        <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="text-[26px] leading-none font-semibold tracking-tight text-slate-950 tabular-nums">{f.figure}</div>
            <div className="mt-2 text-sm leading-snug text-slate-700">{f.text}</div>
            <div className="mt-2 text-xs text-slate-500">{f.from}</div>
        </motion.div>
      </div>
      <div className="mt-3 flex gap-1" aria-hidden>
        {FACTS.map((_, k) => (
          <span key={k} className={cn("h-1 rounded-full transition-all", k === i ? "w-4 bg-brand-500" : "w-1.5 bg-brand-200")} />
        ))}
      </div>
    </motion.aside>
  )
}

export function AgentRun({ title, files = [], steps, readMs, slow = 5, facts = true, onDone, className }: { title: string; files?: RunFile[]; steps: string[]; /** How long the files take to read; about 8s by default when there are files. */ readMs?: number; /** Steps that take a second or two; the rest are quick. */ slow?: number; facts?: boolean; onDone?: () => void; className?: string }) {
  const read = files.length ? (readMs ?? 8000) : 0
  // When each step finishes: slow for the data reads, quick after.
  const [plan] = useState(() => steps.map((_, i) => (i < slow ? 1000 + ((i * 397) % 700) : 240 + ((i * 131) % 160))))
  const total = read + plan.reduce((a, b) => a + b, 0)
  const [now, setNow] = useState(0)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const start = Date.now()
    const t = window.setInterval(() => {
      const e = Date.now() - start
      setNow(Math.min(e, total))
      if (e >= total) window.clearInterval(t)
    }, 100)
    return () => window.clearInterval(t)
    // Once, when the work starts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const done = now >= total
  useEffect(() => {
    if (done) onDone?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done])

  const ends = plan.reduce<number[]>((acc, ms) => [...acc, (acc[acc.length - 1] ?? read) + ms], [])
  const ran = ends.filter((e) => now >= e).length
  // Files read one after another across the reading time.
  const per = files.length ? read / files.length : 0
  const secs = Math.max(1, Math.round(total / 1000))

  if (done)
    return (
      <div className={cn("text-sm", className)}>
        <button type="button" onClick={() => setOpen((o) => !o)} className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900">
          <Check className="size-4 text-success-600" /> Worked through {steps.length} steps <span className="text-slate-400 tabular-nums">· {secs}s</span> <span className="text-slate-300">·</span>
          <span className="font-medium text-brand-700">{open ? "Hide steps" : "Show steps"}</span>
          <ChevronDown className={cn("size-3.5 text-brand-700 transition-transform", open && "rotate-180")} />
        </button>
        {open && (
          <ol className="mt-2 flex flex-col gap-1.5 border-l-2 border-slate-100 pl-4 text-slate-600">
            {files.map((f) => (
              <li key={f.name}>
                Read {f.name} · {f.detail}
              </li>
            ))}
            {steps.map((st, i) => (
              <li key={st}>
                <span className="mr-2 font-mono text-xs text-slate-400">{i + 1}</span>
                {st}
              </li>
            ))}
          </ol>
        )}
      </div>
    )

  return (
    <div className={cn("grid max-w-[980px] gap-5", facts && "md:grid-cols-[minmax(0,1fr)_280px]", className)}>
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <AllyMark spinning />
          <div className="min-w-0">
            <div className="text-[15px] font-semibold text-slate-950">{title}</div>
            <div className="text-xs text-slate-500 tabular-nums">{Math.floor(now / 1000)}s</div>
          </div>
        </div>

        {files.length > 0 && (
          <div className="mt-4 flex flex-col gap-2">
            {files.map((f, i) => {
              const start = i * per
              const p = Math.max(0, Math.min(1, (now - start) / per))
              const Icon = /\.xlsx?$/i.test(f.name) ? FileSpreadsheet : FileText
              return (
                <div key={f.name} className="relative overflow-hidden rounded-lg border border-slate-200 bg-white px-3.5 py-2.5">
                  {/* The scan: a soft band moving across while this file is read. */}
                  {p > 0 && p < 1 && <motion.i aria-hidden className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-brand-50 to-transparent" animate={{ x: ["-100%", "320%"] }} transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }} />}
                  <div className="relative flex items-center gap-3">
                    <Icon className={cn("size-5 shrink-0", p >= 1 ? "text-success-600" : "text-slate-400")} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-slate-950">{f.name}</div>
                      <div className="text-xs text-slate-500">{p >= 1 ? f.detail : p > 0 ? "Reading…" : "Waiting"}</div>
                    </div>
                    {p >= 1 ? <Check className="size-4 shrink-0 text-success-600" /> : p > 0 ? <Loader2 className="size-4 shrink-0 animate-spin text-brand-600" /> : null}
                  </div>
                  <div className="relative mt-2 h-1 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-brand-500 transition-[width] duration-100" style={{ width: `${p * 100}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {now >= read && (
          <ol className="mt-4 flex flex-col gap-1.5 border-l-2 border-slate-100 pl-4 text-sm">
            {steps.slice(0, ran + 1).map((st, i) => (
              <motion.li key={st} initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="flex items-center gap-2">
                {i < ran ? <Check className="size-3.5 shrink-0 text-success-600" /> : <Loader2 className="size-3.5 shrink-0 animate-spin text-brand-600" />}
                <span className={i < ran ? "text-slate-500" : "text-slate-950"}>{st}</span>
              </motion.li>
            ))}
          </ol>
        )}
      </div>
      {facts && <DidYouKnow className="self-start" />}
    </div>
  )
}
