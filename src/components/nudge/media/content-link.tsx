"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
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

/** What the media agent does, step by step, while Mike watches. */
const STEPS: Record<string, string[]> = {
  halloween: ["Reading the 14 new keywords on these pages", "Checking share of voice: 6–14% today", "Setting bids to win rank when the pages go live"],
  gifts: ["Reading the 14 new keywords on these pages", "Checking share of voice: 6–14% today", "Setting bids to win rank when the pages go live"],
  concepts: ["Reading 42 keywords from the new copy", "Building the launch campaign, 3 ad groups", "Scheduling it for Nov 9, when the pages go live"],
}

/**
 * Under Mike's drafts: content hands its new keywords to the media agent. It
 * plays when the box comes into view (once a batch, each visit; Replay plays
 * it again): calling, each step checking off, then the line it settles into.
 */
export function MediaLink({ batchId }: { batchId: string }) {
  const { approved } = useNudge()
  const base = Object.keys(LINKS).find((k) => batchId === k || batchId.startsWith(`${k}-`))
  const steps = base ? STEPS[base] : []
  // -1: waiting to be seen · 0..n-1: steps checking off · n: done.
  const [step, setStep] = useState(-1)
  const box = useRef<HTMLDivElement>(null)
  const timers = useRef<number[]>([])
  function play() {
    timers.current.forEach(window.clearTimeout)
    setStep(0)
    timers.current = steps.map((_, i) => window.setTimeout(() => setStep(i + 1), 900 + i * 800))
  }
  useEffect(() => {
    if (!base) return
    let seen: string[] = []
    try {
      seen = JSON.parse(window.sessionStorage.getItem(CALLED_KEY) ?? "[]")
    } catch {}
    if (seen.includes(base) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const t = window.setTimeout(() => setStep(steps.length), 0)
      return () => window.clearTimeout(t)
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return
        io.disconnect()
        play()
        try {
          window.sessionStorage.setItem(CALLED_KEY, JSON.stringify([...seen, base]))
        } catch {}
      },
      { threshold: 0.6 },
    )
    if (box.current) io.observe(box.current)
    const all = timers.current
    return () => {
      io.disconnect()
      all.forEach(window.clearTimeout)
    }
    // Once per batch shown.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base])
  if (!base) return null
  const l = LINKS[base]
  const funded = !!approved[l.play]
  const done = step >= steps.length
  return (
    <div ref={box} className={cn("mt-4 rounded-xl border px-5 py-3.5 text-sm text-slate-700 transition-colors duration-500", done ? "border-slate-200" : "border-ally-200 bg-ally-50/40")}>
      <div className="flex items-center gap-3">
        <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-full transition-colors duration-300", done ? "bg-ally-500" : "bg-ally-100")}>
          {done ? <Check className="size-4 text-white" /> : <span className="size-2 animate-ping rounded-full bg-ally-500" />}
        </span>
        {done ? (
          <span className="min-w-0 flex-1 animate-in fade-in-0 duration-300">
            <span className="font-semibold text-slate-950">Media agent · </span>
            {funded ? l.done : l.funds}
            <span className="text-slate-300"> · </span>
            <Link href="/james?from=mike" className="inline-flex items-center gap-0.5 font-medium text-brand-700 hover:underline">
              See in James&apos;s queue <ArrowRight className="size-3.5" />
            </Link>
          </span>
        ) : (
          <span className="flex-1 font-medium text-slate-950">Calling the media agent…</span>
        )}
        {done && (
          <button type="button" onClick={play} className="shrink-0 text-[13px] text-slate-400 hover:text-slate-700">
            Replay
          </button>
        )}
      </div>
      {!done && step >= 0 && (
        <ul className="mt-2.5 flex flex-col gap-1.5 pl-10">
          {steps.map((x, i) => (
            <li key={x} className={cn("flex items-center gap-2 text-[13px] transition-all duration-300", i < step ? "text-slate-700 opacity-100" : i === step ? "text-slate-500 opacity-100" : "opacity-0")}>
              {i < step ? <Check className="size-3.5 text-ally-600" /> : <span className="size-3.5 animate-pulse rounded-full bg-ally-200" />}
              {x}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
