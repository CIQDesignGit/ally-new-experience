"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowRight, ChevronDown, Megaphone } from "lucide-react"
import { toast } from "sonner"
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

/** What the media agent was pinged to do for a content batch, in one line, and the campaigns it touches. */
const AGENT: Record<string, { line: string; campaigns: string[]; ping: string }> = {
  halloween: { line: "Adding 14 keywords to 3 campaigns", campaigns: ["Halloween · jar candles", "Seasonal gifting", "Brand + seasonal"], ping: "14 keywords for 3 campaigns" },
  gifts: { line: "Adding 14 keywords to 3 campaigns", campaigns: ["Gift sets · exact", "Seasonal gifting", "Brand + seasonal"], ping: "14 keywords for 3 campaigns" },
  concepts: { line: "DSP awareness campaign and 4 search campaigns for the 3 new SKUs", campaigns: ["DSP · winter-gift shoppers", "Brand", "Jar candles", "Gift sets", "Winter scents"], ping: "the Winter Hearth launch campaigns" },
}
const PINGED_KEY = "ally-james-pinged"

/**
 * Under Mike's drafts, quietly: the media agent was pinged with what content
 * changed. One line; open it for the campaigns and James's queue. James's ping
 * shows once as a notification at the side, the first time each job opens.
 */
export function MediaLink({ batchId }: { batchId: string }) {
  const { approved } = useNudge()
  const base = Object.keys(LINKS).find((k) => batchId === k || batchId.startsWith(`${k}-`))
  const a = base ? AGENT[base] : undefined
  const [open, setOpen] = useState(false)
  const funded = base ? !!approved[LINKS[base].play] : false
  useEffect(() => {
    if (!base || !a || funded) return
    let seen: string[] = []
    try {
      seen = JSON.parse(window.sessionStorage.getItem(PINGED_KEY) ?? "[]")
    } catch {}
    if (seen.includes(base)) return
    const t = window.setTimeout(() => {
      toast("James was pinged", { description: `${a.ping} · waiting for his approval`, position: "top-right", icon: <Megaphone className="size-4 text-ally-600" /> })
      try {
        window.sessionStorage.setItem(PINGED_KEY, JSON.stringify([...seen, base]))
      } catch {}
    }, 700)
    return () => window.clearTimeout(t)
  }, [base, a, funded])
  if (!base || !a) return null
  return (
    <div className="mt-3 animate-in fade-in-0 duration-500">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex w-full items-center gap-2 rounded-lg px-1 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-50">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-ally-100 text-ally-700">
          <Megaphone className="size-3.5" />
        </span>
        <span className="font-semibold text-slate-950">{funded ? "Media agent · James approved" : "Media agent pinged"}</span>
        <span className="min-w-0 truncate text-slate-500">· {a.line}</span>
        <ChevronDown className={cn("ml-auto size-4 shrink-0 text-slate-400 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="mt-1 ml-9 flex flex-col gap-2 text-sm animate-in fade-in-0 slide-in-from-top-1 duration-200">
          <span className="flex flex-wrap gap-1.5">
            {a.campaigns.map((c) => (
              <span key={c} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                {c}
              </span>
            ))}
          </span>
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className={funded ? "text-success-700" : "text-slate-500"}>{funded ? "Bids rise when these pages go live" : "Waiting for James to approve · goes live with these pages"}</span>
            <Link href="/james?from=mike" className="inline-flex items-center gap-0.5 font-medium text-brand-700 hover:underline">
              See in James&apos;s queue <ArrowRight className="size-3.5" />
            </Link>
          </span>
        </div>
      )}
    </div>
  )
}
