"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useNudge } from "../nudge-context"
import { LEDGER } from "./data"

/** A content batch's id stands for its parts too ("halloween", "halloween-auto"): approved when any part is. */
export const contentApproved = (approved: Record<string, boolean>, batch: string) => Object.keys(approved).some((k) => approved[k] && (k === batch || k.startsWith(`${batch}-`)))

/** Which content batches feed media, and with what: the keywords media funds, and the ad search terms content added. */
const LINKS: Record<string, { play: string; funds: string; done: string; fromAds?: string }> = {
  halloween: { play: "media-build", funds: "14 new keywords get budget when these pages go live", done: "14 new keywords funded · bids rise when these pages go live", fromAds: LEDGER.find((r) => r.status.includes("Halloween pages"))?.keyword },
  gifts: { play: "media-build", funds: "14 new keywords get budget when these pages go live", done: "14 new keywords funded · bids rise when these pages go live", fromAds: LEDGER.find((r) => r.status.includes("gift sets"))?.keyword },
  concepts: { play: "media-launch", funds: "Launch campaign on 42 keywords from these pages · starts when they go live", done: "Launch campaign approved · starts when these pages go live" },
}

/**
 * Under Mike's drafts: the other half of the loop. What media does once these
 * pages are live, and the search term media found converting in ads that these
 * drafts now use. Follows James's approval.
 */
export function MediaLink({ batchId }: { batchId: string }) {
  const { approved } = useNudge()
  const base = Object.keys(LINKS).find((k) => batchId === k || batchId.startsWith(`${k}-`))
  if (!base) return null
  const l = LINKS[base]
  const funded = !!approved[l.play]
  return (
    <div className="mt-4 flex flex-col gap-1.5 rounded-xl border border-slate-200 px-5 py-3.5 text-sm text-slate-700">
      <div>
        <span className="font-semibold text-slate-950">Media · </span>
        {funded ? l.done : l.funds}
        <span className="text-slate-300"> · </span>
        <Link href="/james?from=mike" className="inline-flex items-center gap-0.5 font-medium text-brand-700 hover:underline">
          See in James&apos;s queue <ArrowRight className="size-3.5" />
        </Link>
      </div>
      {l.fromAds && (
        <div>
          <span className="font-semibold text-slate-950">From ads · </span>&ldquo;{l.fromAds}&rdquo; converts in ads, not on these pages yet · added in their next update
        </div>
      )}
    </div>
  )
}
