"use client"

import Link from "next/link"
import type { Chip } from "../chat/inline-chat"
import { LAUNCH, NEW_SKUS } from "./data"

const CARD = "flex max-w-[860px] flex-col gap-4 rounded-2xl bg-white px-5 py-4 text-[15px] leading-relaxed text-slate-700 ring-1 ring-slate-200"

/** The Winter Hearth launch, across the three agents, with the context each one used. */
function LaunchStatus({ from }: { from: string }) {
  const rows = [
    { agent: "Content agent", did: `${NEW_SKUS.length} new pages drafted, tagline "${LAUNCH.tagline}", no "non-toxic" claims`, status: `Waiting for Mike · due ${LAUNCH.due}`, href: "/mike" },
    { agent: "Media agent", did: "$30K launch: a $12K DSP awareness campaign and the 3 SKUs in 4 search campaigns", status: "Waiting for James", href: "/james" },
    { agent: "Ops agent", did: "Checked inbound: all 3 SKUs land at the DC by Nov 4", status: "Done", href: undefined },
  ]
  return (
    <div className={CARD}>
      <p>
        <span className="font-semibold text-slate-950">
          The {LAUNCH.name} launches {LAUNCH.launch}, {LAUNCH.value} in sales at stake.
        </span>{" "}
        Ally has the pages and the campaigns built; two approvals stand between it and launch.
      </p>
      <ul className="flex flex-col">
        {rows.map((r) => (
          <li key={r.agent} className="grid grid-cols-[120px_minmax(0,1fr)_auto] items-baseline gap-4 border-t border-slate-100 py-2.5 first:border-t-0">
            <span className="text-sm font-medium text-slate-950">{r.agent}</span>
            <span className="text-slate-700">{r.did}</span>
            {r.href ? (
              <Link href={`${r.href}?from=${from}`} className="text-[13px] font-medium whitespace-nowrap text-brand-700 hover:underline">
                {r.status}
              </Link>
            ) : (
              <span className="text-[13px] whitespace-nowrap text-success-700">{r.status}</span>
            )}
          </li>
        ))}
      </ul>
      <p className="text-[13px] text-slate-500">From Aurelle&apos;s context: the brand team&apos;s launch email, the Winter Market Nov 13–15, the legal rule on claims</p>
    </div>
  )
}

/** "Launch the Winter Hearth collection", typed on a page that isn't Mike's: where the launch stands across the agents. */
export const launchStatusChip = (from: string): Chip => ({
  q: "Launch the Winter Hearth collection",
  hidden: true,
  match: /launch|winter hearth/i,
  think: { ms: 1800, label: "Checking the launch with the content, media and ops agents…" },
  render: () => <LaunchStatus from={from} />,
})
