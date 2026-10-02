"use client"

import { useState } from "react"
import { GripVertical, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { PRIMARY } from "../mike/buttons"
import { RETRO } from "./prime-day"
import type { RetroSlide } from "./prime-day"

/**
 * The storyline before the storyboard, in two steps on one list. First the
 * questions Ally would answer for Claire: reword, reorder, drop or add one.
 * Then Ally answers each one under its question; reword an answer and it
 * becomes that slide's title. Editing here is cheap; editing slides isn't.
 */
export function StorylineStep(p: {
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

  return (
    <div className="flex max-w-[860px] min-w-0 flex-1 flex-col gap-5">
      <p className="text-[17px] leading-relaxed font-semibold text-slate-950">{asking ? `Here are the ${p.slides.length} questions I'd answer for Claire.` : RETRO.verdict}</p>

      <ol className="flex flex-col">
        {p.slides.map((s, i) => (
          <li
            key={s.id}
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
            ) : (
              <span className="min-w-0">
                <span className="block text-[13px] text-slate-500">{s.question}</span>
                <EditableText value={s.title} onSave={(t) => p.onReword(s.id, t)} className="mt-0.5 text-[15px] font-semibold text-slate-950" label={`Answer ${i + 1}`} />
                <span className="mt-0.5 block text-[13px] text-slate-500">{s.insights.slice(0, 2).map((x) => `${x.figure} ${x.text}`).join(" · ")}</span>
              </span>
            )}
            {asking && p.slides.length > 1 ? (
              <button type="button" onClick={() => p.onRemove(s.id)} aria-label={`Remove question ${i + 1}`} className="flex size-7 items-center justify-center rounded-md text-slate-300 opacity-0 group-hover:opacity-100 hover:bg-slate-50 hover:text-slate-700 focus-visible:opacity-100">
                <X className="size-4" />
              </button>
            ) : (
              <span />
            )}
          </li>
        ))}
        {asking && (
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
                <input name="q" autoFocus placeholder="How did our ads perform?" onKeyDown={(e) => e.key === "Escape" && setAdding(false)} className="w-full border-b border-brand-300 bg-transparent pb-1 text-[15px] text-slate-950 outline-none placeholder:text-slate-400" />
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

      <div className="flex flex-wrap items-center gap-3">
        {asking ? (
          <button type="button" onClick={p.onAnswer} className={PRIMARY}>
            Answer these
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
      {!asking && <div className="text-[13px] text-slate-500">{RETRO.sources}</div>}
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
