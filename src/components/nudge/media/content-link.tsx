"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowRight, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useNudge } from "../nudge-context"
import { LEDGER } from "./data"

/** A content batch's id stands for its parts too ("halloween", "halloween-auto"): approved when any part is. */
export const contentApproved = (approved: Record<string, boolean>, batch: string) => Object.keys(approved).some((k) => approved[k] && (k === batch || k.startsWith(`${batch}-`)))

/** Which content batches feed media, and with what: the keywords media funds, and the ad search terms content added. */
const LINKS: Record<string, { play: string; funds: string; done: string; fromAds?: string }> = {
  halloween: { play: "media-build", funds: "funding the 14 new keywords to win rank when these pages go live", done: "14 new keywords funded to win rank · bids rise when these pages go live", fromAds: LEDGER.find((r) => r.status.includes("Halloween pages"))?.keyword },
  gifts: { play: "media-build", funds: "funding the 14 new keywords to win rank when these pages go live", done: "14 new keywords funded to win rank · bids rise when these pages go live", fromAds: LEDGER.find((r) => r.status.includes("gift sets"))?.keyword },
  concepts: { play: "media-launch", funds: "launch campaign on 42 keywords from these pages · starts when they go live", done: "launch campaign approved · starts when these pages go live" },
}

/** The ad search term a content batch picked up: shown as one of "What Ally changed". */
export function adTermFor(batchId: string) {
  const base = Object.keys(LINKS).find((k) => batchId === k || batchId.startsWith(`${k}-`))
  const keyword = base ? LINKS[base].fromAds : undefined
  const row = keyword ? LEDGER.find((r) => r.keyword === keyword) : undefined
  return row ? { keyword: row.keyword, iroas: row.iroas } : undefined
}

const CALLED_KEY = "ally-media-called"

/**
 * Under Mike's drafts: content hands its new keywords to the media agent. The
 * first time a batch opens this visit, the handoff plays (calling, then done);
 * after that it shows as done. Follows James's approval.
 */
export function MediaLink({ batchId }: { batchId: string }) {
  const { approved } = useNudge()
  const base = Object.keys(LINKS).find((k) => batchId === k || batchId.startsWith(`${k}-`))
  // Starts as calling, so the finished line never shows before the handoff plays.
  const [calling, setCalling] = useState(true)
  useEffect(() => {
    if (!base) return
    let seen: string[] = []
    try {
      seen = JSON.parse(window.sessionStorage.getItem(CALLED_KEY) ?? "[]")
    } catch {}
    const replay = !seen.includes(base) && !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const on = window.setTimeout(() => setCalling(replay), 0)
    const off = window.setTimeout(() => setCalling(false), replay ? 1600 : 0)
    try {
      window.sessionStorage.setItem(CALLED_KEY, JSON.stringify([...seen, base]))
    } catch {}
    return () => {
      window.clearTimeout(on)
      window.clearTimeout(off)
    }
  }, [base])
  if (!base) return null
  const l = LINKS[base]
  const funded = !!approved[l.play]
  return (
    <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 px-5 py-3.5 text-sm text-slate-700">
      <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-full transition-colors duration-300", calling ? "bg-ally-100" : "bg-ally-500")}>
        {calling ? <span className="size-2 animate-ping rounded-full bg-ally-500" /> : <Check className="size-4 text-white" />}
      </span>
      {calling ? (
        <span className="font-medium text-slate-950">Calling the media agent…</span>
      ) : (
        <span className="min-w-0 animate-in fade-in-0 duration-300">
          <span className="font-semibold text-slate-950">Media agent · </span>
          {funded ? l.done : l.funds}
          <span className="text-slate-300"> · </span>
          <Link href="/james?from=mike" className="inline-flex items-center gap-0.5 font-medium text-brand-700 hover:underline">
            See in James&apos;s queue <ArrowRight className="size-3.5" />
          </Link>
        </span>
      )}
    </div>
  )
}
