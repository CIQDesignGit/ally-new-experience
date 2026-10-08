"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Check, GripVertical, Loader2, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { PRIMARY } from "../mike/buttons"
import type { RetroSlide } from "./prime-day"
import { DidYouKnow } from "../chat/agent-run"

/**
 * The storyline before the storyboard, in two steps on one list. First the
 * questions Ally would answer for Claire: reword, reorder, drop or add one.
 * Then Ally answers each one under its question; reword an answer and it
 * becomes that slide's title. Editing here is cheap; editing slides isn't.
 */
export function StorylineStep(p: {
  verdict: string
  sources: string
  /** What the account's context changed in this storyline. */
  context?: string
  /** Who the deck is for, by first name. */
  forWhom: string
  step: "questions" | "answers"
  slides: RetroSlide[]
  onRename: (id: string, text: string) => void
  onReword: (id: string, text: string) => void
  onRemove: (id: string) => void
  onMove: (from: number, to: number) => void
  /** False when Ally has no data to answer it. */
  onAdd: (text: string) => boolean
  onAnswer: () => void
  onBack: () => void
  onStoryboard: () => void
}) {
  const [drag, setDrag] = useState<number | null>(null)
  const [over, setOver] = useState<number | null>(null)
  const [adding, setAdding] = useState(false)
  const [unknown, setUnknown] = useState(false)
  const asking = p.step === "questions"
  const n = p.slides.length

  // Paced, never instant: Ally plans (the questions arrive one by one), then runs
  // the analysis (each question works, then its answer lands), then concludes.
  const [planned, setPlanned] = useState(0)
  const [plannedDone, setPlannedDone] = useState(false)
  const [answered, setAnswered] = useState(0)
  useEffect(() => {
    if (!asking || plannedDone) return
    const t = Array.from({ length: n }, (_, i) => window.setTimeout(() => setPlanned((x) => Math.max(x, i + 1)), 900 + i * 260))
    // Planning happens once: questions added or removed afterwards don't restart it.
    t.push(window.setTimeout(() => setPlannedDone(true), 900 + n * 260))
    return () => t.forEach(window.clearTimeout)
    // Once per arrival on the questions; edits after that don't replay it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asking])
  useEffect(() => {
    if (asking) return
    const reset = window.setTimeout(() => setAnswered(0), 0)
    // The first answers take longest (they read the data); the rest come quicker.
    const at = (i: number) => 900 + Math.min(i, 4) * 1300 + Math.max(0, i - 4) * 500
    const t = Array.from({ length: n }, (_, i) => window.setTimeout(() => setAnswered(i + 1), at(i)))
    return () => [reset, ...t].forEach(window.clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asking])
  const planning = asking && !plannedDone
  const running = !asking && answered < n

  return (
    <div className="flex min-w-0 flex-1 items-start gap-6">
    <div className="flex max-w-[860px] min-w-0 flex-1 flex-col gap-5">
      {planning || running ? (
        <p className="flex items-center gap-2 text-[15px] text-slate-500">
          <Loader2 className="size-4 animate-spin text-brand-600" />
          {planning ? "Planning the analysis…" : `Running the analysis… ${answered} of ${n}`}
        </p>
      ) : (
        <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-[17px] leading-relaxed font-semibold text-slate-950">
          {asking ? `Here are the ${n} questions I'd answer for ${p.forWhom}.` : p.verdict}
        </motion.p>
      )}
      {p.context && !planning && <p className="-mt-3 text-[14px] text-slate-500">{p.context}</p>}

      <ol className="flex flex-col">
        {p.slides.map((s, i) => (planning && i >= planned ? null : (
          <motion.li
            key={s.id}
            initial={asking ? { opacity: 0, y: 6 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            draggable={asking}
            onDragStart={() => setDrag(i)}
            onDragOver={(e) => {
              e.preventDefault()
              setOver(i)
            }}
            onDragEnd={() => {
              setDrag(null)
              setOver(null)
            }}
            onDrop={() => {
              if (drag !== null) p.onMove(drag, i)
              setDrag(null)
              setOver(null)
            }}
            className={cn("group grid grid-cols-[18px_22px_minmax(0,1fr)_28px] items-start gap-2 border-t border-slate-100 py-3", drag === i && "opacity-40", over === i && drag !== i && "border-t-2 border-t-brand-400")}
          >

            <span className={cn("mt-0.5", asking ? "cursor-grab text-slate-300 group-hover:text-slate-500 active:cursor-grabbing" : "invisible")} aria-hidden>
              <GripVertical className="size-4" />
            </span>
            <span className="mt-px font-mono text-[13px] text-slate-400">{i + 1}</span>
            {asking ? (
              <EditableText value={s.question} onSave={(t) => p.onRename(s.id, t)} className="text-[15px] font-semibold text-slate-950" label={`Question ${i + 1}`} />
            ) : i < answered ? (
              <motion.span initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="min-w-0">
                <span className="flex items-center gap-1.5 text-[13px] text-slate-500">
                  <Check className="size-3.5 text-success-600" /> {s.question}
                </span>
                <EditableText value={s.title} onSave={(t) => p.onReword(s.id, t)} className="mt-0.5 text-[15px] font-semibold text-slate-950" label={`Answer ${i + 1}`} />
                <span className="mt-0.5 block text-[13px] text-slate-500">{s.insights.slice(0, 2).map((x) => `${x.figure} ${x.text}`).join(" · ")}</span>
              </motion.span>
            ) : (
              <span className={cn("flex items-center gap-2 text-[15px]", i === answered ? "text-slate-950" : "text-slate-400")}>
                {i === answered && <Loader2 className="size-4 animate-spin text-brand-600" />}
                {s.question}
              </span>
            )}
            {asking && p.slides.length > 1 ? (
              <button type="button" onClick={() => p.onRemove(s.id)} aria-label={`Remove question ${i + 1}`} className="flex size-7 items-center justify-center rounded-md text-slate-300 opacity-0 group-hover:opacity-100 hover:bg-slate-50 hover:text-slate-700 focus-visible:opacity-100">
                <X className="size-4" />
              </button>
            ) : (
              <span />
            )}
          </motion.li>
        )))}
        {asking && !planning && (
          <li className="border-t border-slate-100 py-3 pl-[48px]">
            {adding ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const text = String(new FormData(e.currentTarget).get("q") ?? "").trim()
                  if (!text) return setAdding(false)
                  if (p.onAdd(text)) {
                    setAdding(false)
                    setUnknown(false)
                  } else setUnknown(true)
                }}
              >
                <input name="q" autoFocus placeholder="Type a question for the deck" onKeyDown={(e) => e.key === "Escape" && setAdding(false)} className="w-full border-b border-brand-300 bg-transparent pb-1 text-[15px] text-slate-950 outline-none placeholder:text-slate-400" />
                {unknown && <span className="mt-1.5 block text-[13px] text-slate-500">I don&apos;t have data to answer that yet.</span>}
              </form>
            ) : (
              <button type="button" onClick={() => setAdding(true)} className="inline-flex items-center gap-1.5 text-[14px] font-medium text-brand-700 hover:text-brand-800">
                <Plus className="size-4" /> Add a question
              </button>
            )}
          </li>
        )}
      </ol>

      {!planning && !running && (
      <div className="flex flex-wrap items-center gap-3">
        {asking ? (
          <button type="button" onClick={p.onAnswer} className={PRIMARY}>
            Run the analysis
          </button>
        ) : (
          <>
            <button type="button" onClick={p.onStoryboard} className={PRIMARY}>
              Make the storyboard
            </button>
            <button type="button" onClick={p.onBack} className="text-sm font-medium text-slate-600 hover:text-slate-950">
              Edit questions
            </button>
          </>
        )}
      </div>
      )}
      {!asking && !running && <div className="text-[13px] text-slate-500">{p.sources}</div>}
    </div>
    {/* While the questions are answered, "Did you know" sits beside them. */}
    {running && <DidYouKnow className="sticky top-6 hidden w-[260px] shrink-0 lg:flex" />}
    </div>
  )
}

/** Text that turns into an input on click; Enter or leaving saves, Escape cancels. */
function EditableText({ value, onSave, className, label }: { value: string; onSave: (t: string) => void; className?: string; label: string }) {
  const [editing, setEditing] = useState(false)
  if (editing)
    return (
      <input
        autoFocus
        defaultValue={value}
        aria-label={label}
        onBlur={(e) => {
          const t = e.currentTarget.value.trim()
          if (t && t !== value) onSave(t)
          setEditing(false)
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur()
          if (e.key === "Escape") setEditing(false)
        }}
        className={cn("block w-full border-b border-brand-300 bg-transparent outline-none", className)}
      />
    )
  return (
    <button type="button" onClick={() => setEditing(true)} title="Click to edit" className={cn("block w-full cursor-text rounded-sm text-left hover:bg-slate-50", className)}>
      {value}
    </button>
  )
}
