"use client"

import { useRef, useState } from "react"
import { motion } from "framer-motion"
import { Sparkles, Send } from "lucide-react"
import { Answer, QUESTIONS_Q2 } from "./ask-ally-answers"
import type { Question } from "./ask-ally-answers"

/** Keyword match so a typed question lands on the same answers as the chips. */
function match(text: string): Question | null {
  const t = text.toLowerCase()
  if (t.includes("invest") || t.includes("$1m")) return QUESTIONS_Q2[0]
  if (t.includes("adoption") || t.includes("hasn't acted") || t.includes("by team")) return QUESTIONS_Q2[1]
  if (t.includes("miss") || t.includes("190")) return QUESTIONS_Q2[2]
  if (t.includes("autopilot")) return QUESTIONS_Q2[3]
  if (t.includes("plan")) return QUESTIONS_Q2[4]
  return null
}

/**
 * The tier version's Ask Ally (/claire): one label, chips inside the card, and
 * each chip answers with a card built from the numbers on the page. The
 * waterfall version uses the floating bar in ask-ally.tsx instead.
 */
export function AskAllyInline() {
  const [value, setValue] = useState("")
  const [asked, setAsked] = useState<Question | null>(null)
  const [thinking, setThinking] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  function ask(q: Question | null, text?: string) {
    if (text !== undefined) setValue(text)
    if (!q) return
    window.clearTimeout(timer.current)
    setAsked(q)
    setThinking(true)
    timer.current = window.setTimeout(() => setThinking(false), 700)
  }

  return (
    <div className="mx-12 mt-6 mb-10">
      <div className="mb-2.5 flex items-center gap-1.5 text-sm font-semibold text-brand-700">
        <Sparkles className="size-4" />
        Ask Ally
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-pane">
        <div className="flex flex-wrap gap-2 px-0.5 pb-3">
          {QUESTIONS_Q2.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => ask(q, q)}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                asked === q
                  ? "border-brand-300 bg-brand-50 text-brand-700"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
              }`}
            >
              {q}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            ask(match(value))
          }}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 transition-colors focus-within:border-brand-400"
        >
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="What can I take off your plate?"
            className="flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
          <button
            type="submit"
            aria-label="Ask Ally"
            className="flex size-8 items-center justify-center rounded-lg bg-brand-500 text-white transition-colors hover:bg-brand-600"
          >
            <Send className="size-4" />
          </button>
        </form>

        {asked && (
          <div className="mt-3 rounded-xl border border-slate-100 bg-slate-25 px-4 py-4 text-sm leading-relaxed text-slate-700">
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
                <Answer q={asked} lastQuarter />
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
