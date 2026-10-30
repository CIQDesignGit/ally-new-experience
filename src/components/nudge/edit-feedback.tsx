"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, MessageSquareText, Pencil } from "lucide-react"
import { cn } from "@/lib/utils"
import { AS_OF } from "./data"
import { useNudge } from "./nudge-context"
import { BRANDS } from "./policy"
import { PRIMARY, SECONDARY } from "./mike/buttons"

const DATE = new Date(`${AS_OF}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

export const CONTENT_REASONS = ["Missing keywords", "Relevant business knowledge not applied", "Inaccurate product info", "Doesn't match brand voice", "Breaks retailer guidelines", "Too long or too short"]
export const MEDIA_REASONS = ["Wrong campaign", "Too much or too little", "Misses a retail event", "Brand rule not applied", "Bid limit not applied"]

/** Edited and locked, or not yet: the recommendation's text to show in its place. */
export function useLockedEdit(id: string) {
  const { feedback } = useNudge()
  const f = feedback[id]
  return f?.sent && f.edit !== undefined ? f : undefined
}

interface EditFeedbackProps {
  id: string
  /** What's being edited, for the header ("title", "budget"). */
  label: string
  /** Ally's recommendation, prefilled to edit. */
  value: string
  reasons: string[]
  /** Character limit, shown as a count (titles). */
  limit?: number
  multiline?: boolean
  /** What the edit is about, for Knowledge ("Aurelle Amber & Fig Gift Set"). */
  subject: string
  author: string
  /** What Ally does with it next, said once it's locked. */
  applies: string
  placeholder?: string
  className?: string
}

/**
 * Edit on one of Ally's recommendations: change it, say why (a reason or more,
 * details optional), then Approve & lock. The reason goes to Knowledge, so Ally
 * applies it to similar work; the edited text replaces Ally's.
 */
export function EditFeedback({ id, label, value, reasons, limit, multiline, subject, author, applies, placeholder, className }: EditFeedbackProps) {
  const { feedback, setFeedback, knowledge, saveKnowledge } = useNudge()
  const locked = useLockedEdit(id)
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(value)
  const [picked, setPicked] = useState<string[]>([])
  const [details, setDetails] = useState("")
  const left = limit ? limit - draft.length : undefined

  if (locked) {
    return (
      <div className={cn("flex items-start gap-1.5 text-sm text-slate-500", className)}>
        <Check className="mt-0.5 size-4 shrink-0 text-success-600" aria-hidden />
        <span>
          Locked by {author.split(" ")[0]} · {locked.reasons?.join(", ")} · {applies} ·{" "}
          <Link href="/settings?tab=knowledge" className="text-brand-700 hover:underline">
            See in Knowledge
          </Link>
        </span>
      </div>
    )
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={cn(SECONDARY, "gap-1.5", className)}>
        <Pencil className="size-3.5" aria-hidden /> Edit
      </button>
    )
  }

  function cancel() {
    setOpen(false)
    setDraft(value)
    setPicked([])
    setDetails("")
  }

  function lock() {
    const text = [picked.join(", "), details.trim()].filter(Boolean).join(": ")
    setFeedback(id, { ...(feedback[id] ?? {}), vote: "down", edit: draft.trim(), reasons: picked, text, sent: true })
    const brand = BRANDS.find((b) => subject.startsWith(b.split(" ")[0]))
    saveKnowledge([{ id: `fb-${id}`, text: details.trim() || `${picked.join(", ")} on the ${label}`, retailer: "Amazon", brands: brand ? [brand] : [], skuGroups: [], author, date: DATE, source: `from an edit to ${subject}` }, ...knowledge.filter((k) => k.id !== `fb-${id}`)])
    setOpen(false)
  }

  const over = left !== undefined && left < 0
  const ready = picked.length > 0 && draft.trim() !== "" && !over

  return (
    <div className={cn("rounded-xl border border-brand-200 bg-brand-25/40 p-4", className)}>
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium text-slate-950">Ally recommended {label}</span>
        <span className="text-brand-700">· Editing</span>
      </div>

      <div className="mt-3 overflow-hidden rounded-lg border border-brand-300 bg-white focus-within:ring-2 focus-within:ring-brand-100">
        {multiline ? (
          <textarea autoFocus rows={4} value={draft} onChange={(e) => setDraft(e.target.value)} aria-label={`Edit the ${label}`} className="block w-full resize-none bg-transparent px-4 py-3 text-[15px] text-slate-950 outline-none" />
        ) : (
          <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} aria-label={`Edit the ${label}`} className="block w-full bg-transparent px-4 py-3 text-[15px] text-slate-950 outline-none" />
        )}
        {limit !== undefined && (
          <div className={cn("flex justify-between px-4 pb-2.5 text-xs", over ? "text-error-600" : "text-slate-500")}>
            <span>{over ? `${-left!} characters over` : `${left} characters left`}</span>
            <span className="font-mono">
              {draft.length} / {limit}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-slate-700">
        <MessageSquareText className="size-4 text-slate-400" aria-hidden />
        Tell us why you&apos;re editing the {label}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {reasons.map((r) => {
          const on = picked.includes(r)
          return (
            <button key={r} type="button" aria-pressed={on} onClick={() => setPicked(on ? picked.filter((p) => p !== r) : [...picked, r])} className={cn("rounded-full border px-3.5 py-1.5 text-sm transition-colors", on ? "border-brand-300 bg-brand-50 text-brand-700" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300")}>
              {r}
            </button>
          )
        })}
      </div>
      <textarea rows={2} value={details} onChange={(e) => setDetails(e.target.value)} placeholder={placeholder ?? "Add details (optional)"} aria-label="Details" className="mt-3 block w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-brand-300 focus:ring-2 focus:ring-brand-100" />

      <div className="mt-4 flex justify-end gap-2 border-t border-slate-200/70 pt-4">
        <button type="button" onClick={cancel} className={SECONDARY}>
          Cancel
        </button>
        <button type="button" onClick={lock} disabled={!ready} className={cn(PRIMARY, "disabled:opacity-50")}>
          Approve &amp; lock
        </button>
      </div>
    </div>
  )
}
