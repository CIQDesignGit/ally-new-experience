"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useNudge } from "../nudge-context"
import { LEDGER } from "./data"

/** A content batch's id stands for its parts too ("halloween", "halloween-auto"): approved when any part is. */
export const contentApproved = (approved: Record<string, boolean>, batch: string) => Object.keys(approved).some((k) => approved[k] && (k === batch || k.startsWith(`${batch}-`)))

/** Which content batches feed media, and with what: the keywords media funds, and the ad search terms content added. */
const LINKS: Record<string, { play: string; funds: string; done: string; fromAds?: string }> = {
  halloween: { play: "media-build", funds: "the 14 keywords added across the Halloween pages and gift sets", done: "James funded the 14 keywords added across the Halloween pages and gift sets · bids rise when they go live", fromAds: LEDGER.find((r) => r.status.includes("Halloween pages"))?.keyword },
  gifts: { play: "media-build", funds: "the 14 keywords added across the Halloween pages and gift sets", done: "James funded the 14 keywords added across the Halloween pages and gift sets · bids rise when they go live", fromAds: LEDGER.find((r) => r.status.includes("gift sets"))?.keyword },
  concepts: { play: "media-launch", funds: "a launch campaign on 42 keywords from these pages", done: "James approved the launch campaign · it starts when these pages go live" },
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
        {funded ? l.done : `Ally for Media funds ${l.funds} once they're live`}
        <Link href="/james?from=mike" className="ml-2 inline-flex items-center gap-0.5 font-medium text-brand-700 hover:underline">
          James&apos;s queue <ArrowRight className="size-3.5" />
        </Link>
      </div>
      {l.fromAds && (
        <div>
          <span className="font-semibold text-slate-950">From ads · </span>&ldquo;{l.fromAds}&rdquo; converts in ads but isn&apos;t on these pages yet · queued for their next update
        </div>
      )}
    </div>
  )
}
