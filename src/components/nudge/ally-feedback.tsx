"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, MessageSquarePlus, ThumbsDown, ThumbsUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { AS_OF } from "./data"
import { useNudge } from "./nudge-context"
import { BRANDS } from "./policy"
import { PRIMARY } from "./mike/buttons"
import { useMvp } from "./mvp"

const THUMB = "flex size-10 items-center justify-center rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
const DATE = new Date(`${AS_OF}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

/**
 * Thumbs up or down on Ally's call for one SKU. Down opens the context box right
 * away (that's where Ally learns most); up only offers it. A thumbs down with
 * context becomes Knowledge, so it shows in Settings as a rule Ally follows.
 */
export function AllyFeedback({ id, sku, author, className }: { id: string; sku: string; author: string; className?: string }) {
  const { feedback, setFeedback, knowledge, saveKnowledge } = useNudge()
  const mvp = useMvp()
  const f = feedback[id]
  const [draft, setDraft] = useState("")
  const [open, setOpen] = useState(false)
  const showBox = !!f && !f.sent && (f.vote === "down" || open)

  function vote(v: "up" | "down") {
    // The same thumb again changes nothing; the other one switches the vote and starts over.
    if (f?.vote === v) return
    setFeedback(id, { vote: v })
    setOpen(false)
  }

  function send() {
    const text = draft.trim()
    if (!text || !f) return
    setFeedback(id, { ...f, text, sent: true })
    if (f.vote === "down") {
      const brand = BRANDS.find((b) => sku.startsWith(b.split(" ")[0]))
      saveKnowledge([
        { id: `fb-${id}`, text, retailer: "Amazon", brands: brand ? [brand] : [], skuGroups: [], author, date: DATE, source: `from a thumbs down on ${sku}` },
        ...knowledge.filter((k) => k.id !== `fb-${id}`),
      ])
    }
    setDraft("")
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm text-slate-500">Did Ally get this right?</span>
        <button
          type="button"
          aria-label="Ally got this right"
          title="Ally got this right"
          aria-pressed={f?.vote === "up"}
          onClick={() => vote("up")}
          className={cn(THUMB, f?.vote === "up" ? "border-success-300 bg-success-50 text-success-600" : "border-slate-200 bg-white text-slate-400 hover:text-slate-600")}
        >
          <ThumbsUp className="size-4" fill={f?.vote === "up" ? "currentColor" : "none"} />
        </button>
        <button
          type="button"
          aria-label="Ally got this wrong"
          title="Ally got this wrong"
          aria-pressed={f?.vote === "down"}
          onClick={() => vote("down")}
          className={cn(THUMB, f?.vote === "down" ? "border-error-300 bg-error-50 text-error-600" : "border-slate-200 bg-white text-slate-400 hover:text-slate-600")}
        >
          <ThumbsDown className="size-4" fill={f?.vote === "down" ? "currentColor" : "none"} />
        </button>

        {f?.vote === "up" && !f.sent && !open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="ml-1 inline-flex h-10 items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3.5 text-sm text-slate-500 hover:border-slate-400 hover:text-slate-700"
          >
            <MessageSquarePlus className="size-4" /> Add context
          </button>
        )}
        {f?.sent && (
          <span className="ml-1 flex items-center gap-1.5 text-sm text-slate-500">
            <Check className="size-4 text-success-600" />
            {f.vote === "down" ? (
              <>
                Sent · Ally applies this to similar SKUs
                {/* Knowledge lives in settings, our side, in the MVP: no link for the customer. */}
                {!mvp && (
                  <>
                    {" · "}
                    <Link href="/settings?tab=knowledge" className="text-brand-700 hover:underline">
                      See in Knowledge
                    </Link>
                  </>
                )}
              </>
            ) : (
              "Sent · Ally will do more of it"
            )}
          </span>
        )}
      </div>

      {showBox && (
        <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-100">
          <textarea
            // Down opens this on its own, so the cursor is already where the answer goes.
            autoFocus
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send()
            }}
            placeholder={f.vote === "down" ? "What did Ally get wrong? It'll apply your answer to similar SKUs." : "What made this right? Ally will do more of it."}
            aria-label={f.vote === "down" ? "What Ally got wrong" : "What Ally got right"}
            className="block w-full resize-none bg-transparent px-4 py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400"
          />
          <div className="flex justify-end border-t border-slate-100 px-3 py-2.5">
            <button type="button" onClick={send} disabled={!draft.trim()} className={cn(PRIMARY, "disabled:opacity-50")}>
              Send to Ally
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
