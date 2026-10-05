"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Mail, Paperclip } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { OPS_DAYS_SAVED, fmtValue, opsBatches, opsSkus } from "../data"
import type { OpsBatch } from "../data"
import { useNudge } from "../nudge-context"
import { PRIMARY, SECONDARY } from "../mike/buttons"
import { emailMe } from "../email-me"

/** One vendor manager for the demo. */
/** Labels and buttons say "Amazon VM"; the letter itself is to a person, so it greets her by name. */
export const VENDOR_MANAGER = { label: "Amazon VM", name: "Dana", full: "Dana Ruiz", role: "your Amazon VM" }
/** When what's waiting in the note costs this much a day ($M), the bar asks to send. */
const SEND_NUDGE_PER_DAY = 0.012

/** The unsent note, grouped by issue, with what it costs per day to keep waiting. */
export function useNote() {
  const { note, policy } = useNudge()
  const ops = opsBatches(policy)
  const unsent = note.filter((i) => !i.sentOn)
  const groups = ops
    .map((b) => ({ batch: b, items: unsent.filter((i) => i.batchId === b.id) }))
    .filter((g) => g.items.length)
  // An issue added whole counts all its SKUs, not just the ones listed with detail.
  // An issue added whole counts all its SKUs; otherwise, the ones added.
  const countOf = (g: { batch: OpsBatch; items: { asin: string; whole?: boolean }[] }) => (g.items.some((i) => i.whole) ? g.batch.skus : g.items.length)
  /** How many of an issue's SKUs are in the note (all of them once it was added whole). */
  const notedIn = (batchId: string, total: number) => {
    const items = unsent.filter((i) => i.batchId === batchId)
    return items.some((i) => i.whole) ? total : items.length
  }
  // What waiting costs: each issue's daily loss, for the share of its SKUs in the note.
  const perDay = groups.reduce((n, g) => n + (g.batch.perDay ?? g.batch.approveValue / OPS_DAYS_SAVED) * (countOf(g) / Math.max(g.batch.skus, 1)), 0)
  const skuCount = groups.reduce((n, g) => n + countOf(g), 0)
  const inNote = (batchId: string, asin: string) => note.some((i) => i.batchId === batchId && i.asin === asin)
  const sent = (batchId: string, asin: string) => note.some((i) => i.batchId === batchId && i.asin === asin && i.sentOn)
  return { groups, perDay, skus: skuCount, countOf, notedIn, started: unsent[0]?.addedOn, inNote, sent, ops }
}

/** The email Ally drafts from the note: one message, a section per issue, a line per SKU. */
function draft(groups: { batch: OpsBatch; items: { asin: string }[] }[], perDay: number, countOf: (g: { batch: OpsBatch; items: { asin: string }[] }) => number) {
  const sections = groups.map((g, i) => {
    const names = opsSkus(g.batch).filter((s) => g.items.some((x) => x.asin === s.asin))
    const n = countOf(g)
    return [
      `${i + 1}. ${g.batch.name} (${n} ${n === 1 ? "SKU" : "SKUs"})`,
      `   ${g.batch.evidence[0] ?? g.batch.detected}`,
      ...names.map((s) => `   - ${s.name} (${s.asin})`),
      ...(n > names.length ? [`   - and ${n - names.length} more (full list attached)`] : []),
    ].join("\n")
  })
  return [
    `Hi ${VENDOR_MANAGER.name},`,
    "",
    `A few things on our Amazon listings that need your help. Evidence for each is attached.`,
    "",
    sections.join("\n\n"),
    "",
    `We're losing about ${fmtValue(perDay)} a day while these are open. Could you take a look this week?`,
    "",
    "Thanks,",
    "Michelle",
  ].join("\n")
}

/**
 * The note to the vendor manager, at the top of the Ops view. Reviewing adds to
 * it; it builds up over days; Michelle sends when she's ready, finished or not.
 * When waiting gets expensive, it asks: Send now, or keep reviewing.
 */
/** `onSent`: what went, so the page celebrates it like any other action. */
export function NoteBar({ onSent }: { onSent?: (sent: { value: number; label: string }) => void }) {
  const { sendNote } = useNudge()
  const { groups, perDay, skus, countOf } = useNote()
  const [open, setOpen] = useState(false)
  const [snoozedAt, setSnoozedAt] = useState(0)
  const [body, setBody] = useState<string | null>(null)
  const nudge = perDay >= SEND_NUDGE_PER_DAY && perDay > snoozedAt * 1.5
  // "Send note to vendor manager" anywhere on the page opens the draft here, at the top.
  useEffect(() => {
    // The bar is sticky, so it's already on screen: just open the draft.
    const onOpen = () => setOpen(true)
    window.addEventListener("open-note", onOpen)
    return () => window.removeEventListener("open-note", onOpen)
  }, [])
  const text = body ?? draft(groups, perDay, countOf)

  function send() {
    // An issue counts as sent when every one of its SKUs has gone; the rest stay open.
    const complete = groups
      .filter((g) => g.items.some((i) => i.whole) || (opsSkus(g.batch).length >= g.batch.skus && opsSkus(g.batch).every((s) => g.items.some((x) => x.asin === s.asin))))
      .map((g) => g.batch.id)
    sendNote(complete)
    // Dollars only for issues that went whole, the same amount the progress bar moves by.
    onSent?.({ value: groups.filter((g) => complete.includes(g.batch.id)).reduce((n, g) => n + g.batch.approveValue, 0), label: `${skus} SKUs sent to the ${VENDOR_MANAGER.label}` })
    // The signed-in person gets the email, playing Dana.
    void emailMe({ kind: "note", subject: `${groups.length} ${groups.length === 1 ? "issue" : "issues"} on our Amazon listings · ${skus} SKUs`, body: text, skus, issues: groups.length }, { quiet: true })
    toast.success(`Sent to ${VENDOR_MANAGER.full}, ${VENDOR_MANAGER.label} · ${skus} SKUs across ${groups.length} ${groups.length === 1 ? "issue" : "issues"}, evidence attached`, { position: "top-right" })
    setOpen(false)
    setBody(null)
  }

  // The first add explains the note once, at the moment it starts; later adds just confirm.
  const hadNote = useRef(skus > 0)
  useEffect(() => {
    if (skus > 0 && !hadNote.current) toast.success(`Added ${skus} ${skus === 1 ? "SKU" : "SKUs"} to your note to the ${VENDOR_MANAGER.label}`, { description: "Everything you add goes out as one email when you send.", position: "top-right" })
    hadNote.current = skus > 0
  }, [skus])

  // Nothing in the note, nothing to show: the bar appears with the first add.
  if (!skus && !open) return null
  return (
    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} data-sticky-top={open ? undefined : true} className={cn("z-30 border-y border-slate-200 bg-white/95 backdrop-blur", !open && "sticky top-0")}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-10 py-3">
        <Mail className={cn("size-4 shrink-0", skus ? "text-brand-600" : "text-slate-400")} />
        {skus ? (
          <div className="min-w-0 flex-1 text-sm">
            <span className="font-semibold text-slate-950">Note to the {VENDOR_MANAGER.label}</span>
            <span className="text-slate-500">
              {" "}
              · {skus} {skus === 1 ? "SKU" : "SKUs"} across {groups.length} {groups.length === 1 ? "issue" : "issues"}
            </span>
            {nudge && !open ? (
              <span className="ml-2 font-medium text-error-600">Losing {fmtValue(perDay)} a day while these wait</span>
            ) : (
              <>
                <span className="ml-2 font-mono text-error-600">−{fmtValue(perDay)} a day</span> <span className="text-slate-500">while they wait</span>
              </>
            )}
          </div>
        ) : (
          <div className="min-w-0 flex-1 text-sm text-slate-500">Your note to the {VENDOR_MANAGER.label} is empty. SKUs you review are added here, and go out together when you send.</div>
        )}
        {skus > 0 && !open && (
          <div className="flex items-center gap-2">
            {nudge && (
              <button type="button" onClick={() => setSnoozedAt(perDay)} className={cn(SECONDARY, "h-9 px-3.5 text-sm")}>
                Keep reviewing
              </button>
            )}
            <button type="button" onClick={() => setOpen(true)} className={cn(PRIMARY, "h-9 px-4 text-sm")}>
              {nudge ? "Send now" : `Review and send`}
            </button>
          </div>
        )}
      </div>

      {open && (
        <div className="border-t border-slate-100 bg-slate-25 px-10 py-5">
          {/* The email as it will go: who it's to, its subject, the letter (editable), what's attached. Counts live in the bar above, once. */}
          <div className="mx-auto max-w-[880px] overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="flex flex-col gap-1 border-b border-slate-100 px-5 py-3 text-sm">
              <div>
                <span className="text-slate-500">To</span> <span className="font-medium text-slate-950">{VENDOR_MANAGER.full}</span> <span className="text-slate-500">· {VENDOR_MANAGER.label}</span>
              </div>
              <div>
                <span className="text-slate-500">Subject</span> <span className="font-medium text-slate-950">{groups.length} {groups.length === 1 ? "issue" : "issues"} on our Amazon listings · {skus} SKUs</span>
              </div>
            </div>
            <div className="px-5 py-4">
              <textarea
                value={text}
                onChange={(e) => setBody(e.target.value)}
                rows={Math.min(22, text.split("\n").length + 1)}
                className="w-full resize-y rounded-md border border-slate-200 bg-white px-4 py-3 text-[14px] leading-relaxed text-slate-800 outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
              />
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {groups.map((g) => (
                  <span key={g.batch.id} className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-slate-600">
                    <Paperclip className="size-3" /> {g.batch.name} · {countOf(g)} screenshots and the SKU list
                  </span>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-3">
                <button type="button" onClick={send} className={PRIMARY}>
                  Send to {VENDOR_MANAGER.label} · {skus} SKUs
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    setSnoozedAt(perDay)
                  }}
                  className={SECONDARY}
                >
                  Keep reviewing
                </button>
              </div>
              {/* What happens next, once: Ally keeps watching the listings after the email goes. */}
              <p className="mt-3 text-[13px] text-slate-500">After you send, Ally checks these listings every day and drafts a follow-up if there&apos;s no reply in 3 days.</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
