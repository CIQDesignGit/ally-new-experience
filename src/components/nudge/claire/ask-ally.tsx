"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Send, Sparkles, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Answer, QUESTIONS } from "./ask-ally-answers"

/** Claire's keyword match so a typed question lands on the same answers as the chips. */
function claireMatch(text: string): string | null {
  const t = text.toLowerCase()
  if (t.includes("invest") || t.includes("budget") || t.includes("$500k")) return QUESTIONS[0]
  if (t.includes("adoption") || t.includes("hasn't acted") || t.includes("by team")) return QUESTIONS[1]
  if (t.includes("behind") || t.includes("miss") || t.includes("60")) return QUESTIONS[2]
  if (t.includes("autopilot")) return QUESTIONS[3]
  if (t.includes("email") || t.includes("send")) return QUESTIONS[5]
  if (t.includes("plan")) return QUESTIONS[4]
  return null
}

/** Other pages: a typed question lands on the chip that shares the most words with it. */
function wordMatch(questions: readonly string[], text: string): string | null {
  const words = text.toLowerCase().split(/\W+/).filter((w) => w.length > 3)
  let best: string | null = null
  let score = 0
  for (const q of questions) {
    const n = words.filter((w) => q.toLowerCase().includes(w)).length
    if (n > score) [best, score] = [q, n]
  }
  return best
}

interface AskAllyProps {
  /** Chips for this page; defaults to Claire's. */
  questions?: readonly string[]
  /** Renders the answer for a chip; defaults to Claire's answers. */
  renderAnswer?: (q: string) => React.ReactNode
  placeholder?: string
}

/**
 * Ask Ally as a floating bar: a slim translucent pill that stays out of the way.
 * Focus opens the chips above it; a chip or a typed question opens the answer
 * there, built from the numbers already on the page.
 */
export function AskAlly({ questions = QUESTIONS, renderAnswer, placeholder = "What can I take off your plate?" }: AskAllyProps = {}) {
  const isClaire = !renderAnswer
  const answer = (q: string) => (renderAnswer ? renderAnswer(q) : <Answer q={q as (typeof QUESTIONS)[number]} />)
  const match = (text: string) => (isClaire ? claireMatch(text) : wordMatch(questions, text))
  const [value, setValue] = useState("")
  const [open, setOpen] = useState(false)
  const [asked, setAsked] = useState<string | null>(null)
  const [thinking, setThinking] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  const rootRef = useRef<HTMLDivElement>(null)

  // Clicking anywhere outside collapses the drawer back to the pill; the last answer stays for next time.
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [open])

  function ask(q: string | null, text?: string) {
    if (text !== undefined) setValue(text)
    if (!q) return
    window.clearTimeout(timer.current)
    setAsked(q)
    setOpen(true)
    setThinking(true)
    timer.current = window.setTimeout(() => setThinking(false), 700)
  }

  function close() {
    setOpen(false)
    setAsked(null)
    setValue("")
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-40 flex justify-center px-4">
      <div ref={rootRef} className="pointer-events-auto flex w-full max-w-[760px] flex-col gap-2">
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-h-[60vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-pane-lg backdrop-blur"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {questions.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => ask(q, q)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm transition-colors",
                      asked === q
                        ? "border-brand-300 bg-brand-50 text-brand-700"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700",
                    )}
                  >
                    {q}
                  </button>
                ))}
              </div>
              <button type="button" aria-label="Close" onClick={close} className="shrink-0 text-slate-400 hover:text-slate-700">
                <X className="size-4" />
              </button>
            </div>
            {asked && (
              <div className="rounded-xl border border-slate-100 bg-slate-25 px-4 py-4 text-sm leading-relaxed text-slate-700">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-brand-700">
                  <Sparkles className="size-3.5" />
                  {asked}
                </div>
                {thinking ? (
                  <div className="flex gap-1.5 py-2" aria-label="Ally is working on it">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="size-1.5 rounded-full bg-brand-400"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                    {answer(asked)}
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault()
            ask(match(value))
          }}
          className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 py-1.5 pr-1.5 pl-4 shadow-pane backdrop-blur transition-colors focus-within:border-brand-300 focus-within:bg-white"
        >
          <Sparkles className="size-4 shrink-0 text-ally-600" />
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setOpen(true)}
            onClick={() => setOpen(true)}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400"
          />
          <button
            type="submit"
            aria-label="Ask Ally"
            className="flex size-8 items-center justify-center rounded-full bg-brand-500 text-white transition-colors hover:bg-brand-600"
          >
            <Send className="size-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
