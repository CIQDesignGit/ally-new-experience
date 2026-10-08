"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { ArrowRight, Check, Megaphone } from "lucide-react"
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

/** What the media agent does for a content batch: its actions, the campaigns, and what it queues for James. */
const AGENT: Record<string, { found: string; actions: { text: string; campaigns?: string[] }[]; queued: string; done: string }> = {
  halloween: {
    found: "Found 14 new keywords on these pages",
    actions: [{ text: "Adding them to 3 campaigns for these SKUs", campaigns: ["Halloween · jar candles", "Seasonal gifting", "Brand + seasonal"] }, { text: "Raising bids until share of voice reaches 25%, capped at $6K a week" }],
    queued: "Queued for James to approve · goes live with these pages",
    done: "James approved · bids rise when these pages go live",
  },
  gifts: {
    found: "Found 14 new keywords on these pages",
    actions: [{ text: "Adding them to 3 campaigns for these SKUs", campaigns: ["Gift sets · exact", "Seasonal gifting", "Brand + seasonal"] }, { text: "Raising bids until share of voice reaches 25%, capped at $6K a week" }],
    queued: "Queued for James to approve · goes live with these pages",
    done: "James approved · bids rise when these pages go live",
  },
  concepts: {
    found: "Found 42 keywords in the new copy",
    actions: [
      { text: "Creating a DSP awareness campaign for winter-gift shoppers · $12K, Nov 9 – Dec 15" },
      { text: "Adding the 3 new SKUs to 4 search campaigns", campaigns: ["Brand", "Jar candles", "Gift sets", "Winter scents"] },
    ],
    queued: "Queued for James to approve · starts Nov 9, when the pages go live",
    done: "James approved · starts Nov 9, when the pages go live",
  },
}

/**
 * Under Mike's drafts: the media agent picks up what content just did. Every
 * time a job opens, it pops in, works through its actions for these SKUs,
 * and ends on what it queued for James. Starts when the card is on screen.
 */
export function MediaLink({ batchId }: { batchId: string }) {
  const { approved } = useNudge()
  const base = Object.keys(LINKS).find((k) => batchId === k || batchId.startsWith(`${k}-`))
  const a = base ? AGENT[base] : undefined
  // Beats: 0 hidden · 1 the agent pops in · 2 found · 3.. each action · last: queued.
  const beats = a ? 3 + a.actions.length : 0
  const [beat, setBeat] = useState(0)
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!a) return
    const timers: number[] = []
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce) {
      timers.push(window.setTimeout(() => setBeat(beats), 0))
      return () => timers.forEach(window.clearTimeout)
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return
        io.disconnect()
        for (let i = 1; i <= beats; i++) timers.push(window.setTimeout(() => setBeat(i), i === 1 ? 150 : 400 + (i - 1) * 850))
      },
      { threshold: 0.5 },
    )
    if (box.current) io.observe(box.current)
    return () => {
      io.disconnect()
      timers.forEach(window.clearTimeout)
    }
  }, [a, beats])
  if (!base || !a) return null
  const l = LINKS[base]
  const funded = !!approved[l.play]
  const working = beat > 0 && beat < beats
  const show = (n: number) => beat >= n
  return (
    <div ref={box} className="mt-4 min-h-[72px]">
      <div className={cn("rounded-xl border border-ally-200 bg-white px-5 py-4 shadow-sm transition-all duration-300 ease-out", show(1) ? "translate-y-0 scale-100 opacity-100" : "translate-y-2 scale-[0.98] opacity-0")}>
        <div className="flex items-center gap-3">
          <span className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-ally-500 text-white">
            <Megaphone className="size-4" />
            {working && <span className="absolute inset-0 animate-ping rounded-full bg-ally-400 opacity-40" />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-slate-950">Media agent</span>
            <span className="block text-[13px] text-slate-500">{working ? "Working on these SKUs…" : "Picked up what content changed"}</span>
          </span>
        </div>
        <ul className="mt-3 flex flex-col gap-2 pl-11 text-sm">
          <Beat on={show(2)} done={show(3)}>
            {a.found}
          </Beat>
          {a.actions.map((x, i) => (
            <Beat key={x.text} on={show(3 + i)} done={show(4 + i)}>
              {x.text}
              {x.campaigns && show(3 + i) && (
                <span className="mt-1.5 flex flex-wrap gap-1.5">
                  {x.campaigns.map((c, k) => (
                    <span key={c} className="animate-in fade-in-0 slide-in-from-left-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700" style={{ animationDelay: `${k * 120}ms`, animationFillMode: "both" }}>
                      {c}
                    </span>
                  ))}
                </span>
              )}
            </Beat>
          ))}
        </ul>
        {show(beats) && (
          <div className="mt-3 ml-11 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-ally-50 px-3 py-2 text-sm animate-in fade-in-0 slide-in-from-bottom-1">
            <span className={cn("font-semibold", funded ? "text-success-700" : "text-ally-700")}>{funded ? a.done : a.queued}</span>
            <Link href="/james?from=mike" className="inline-flex items-center gap-0.5 font-medium text-brand-700 hover:underline">
              See in James&apos;s queue <ArrowRight className="size-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

/** One action: appears, works, then checks off. */
function Beat({ on, done, children }: { on: boolean; done: boolean; children: React.ReactNode }) {
  // Not there until its turn, so the card grows as the agent works.
  if (!on) return null
  return (
    <li className="flex gap-2 animate-in fade-in-0 slide-in-from-left-1 duration-300">
      <span className="mt-0.5 shrink-0">{done ? <Check className="size-4 text-ally-600" /> : <span className="block size-4 animate-pulse rounded-full bg-ally-200" />}</span>
      <span className={cn("min-w-0", done ? "text-slate-700" : "text-slate-950")}>{children}</span>
    </li>
  )
}
