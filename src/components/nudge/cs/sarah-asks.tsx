"use client"

import Link from "next/link"
import type { Chip } from "../chat/inline-chat"
import { LAUNCH, NEW_SKUS } from "../launch/data"

const CARD = "flex max-w-[860px] flex-col gap-4 rounded-2xl bg-white px-5 py-4 text-[15px] leading-relaxed text-slate-700 ring-1 ring-slate-200"
const HEAD = "text-xs font-medium text-slate-500"

/** This week's Vendor Central pull: sales and inventory, with what Ally did about the gaps. */
const COVER = [
  { sku: "Cedar & Smoke Jar, 18 oz", weeks: "0", note: "Out until Oct 20, as Michelle said on Oct 2 · ads paused" },
  { sku: "Coastal Linen Jar, 8 oz", weeks: "1.4", note: "Open PO 4,200 units short · added to the Amazon VM note" },
  { sku: "Pumpkin Chai Jar, 16 oz", weeks: "1.8", note: "Halloween demand up 38% · reorder drafted for Michelle" },
]
function VendorCentralAnswer() {
  return (
    <div className={CARD}>
      <p>
        <span className="font-semibold text-slate-950">Aurelle shipped $3.6M on Amazon last week, down 4%.</span> 3 SKUs have under 2 weeks of cover going into Halloween.
      </p>
      <div>
        <div className={HEAD}>From Vendor Central · Sep 27 – Oct 3</div>
        <table className="mt-1.5 w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left">
              <th className="pb-1.5 text-xs font-medium text-slate-500">SKU</th>
              <th className="pb-1.5 text-right text-xs font-medium text-slate-500">Weeks of cover</th>
              <th className="pb-1.5 pl-6 text-xs font-medium text-slate-500">What Ally did</th>
            </tr>
          </thead>
          <tbody>
            {COVER.map((r) => (
              <tr key={r.sku} className="border-b border-slate-100 last:border-b-0">
                <td className="py-2 pr-3 text-slate-950">{r.sku}</td>
                <td className="py-2 text-right font-mono text-slate-700">{r.weeks}</td>
                <td className="py-2 pl-6 text-slate-700">{r.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[13px] text-slate-500">Ordered units 41,800 · sellable on hand 96,000 units · pulled daily from Vendor Central</p>
    </div>
  )
}

/** The Winter Hearth launch, across the three agents, with the context each one used. */
function LaunchAnswer() {
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
              <Link href={`${r.href}?from=sarah`} className="text-[13px] font-medium whitespace-nowrap text-brand-700 hover:underline">
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

/**
 * What Sarah can type on her page without a starter: the same skills Michelle,
 * Mike and James use, opened as Sarah, shaped by Aurelle's context.
 */
export const SARAH_TYPED: Chip[] = [
  { q: "Prime Day deck for Claire", hidden: true, match: /prime day/i, task: "/sarah/decks/prime-day?new=1", render: () => null },
  { q: "Prep me for the Amazon vendor negotiation", hidden: true, match: /negotiat|\bavn\b/i, task: "/michelle/c/negotiation?from=sarah", render: () => null },
  { q: "Where is Aurelle against plan?", hidden: true, match: /(not|n't) (meeting|making|hitting) (my |our |the )?plan|behind plan|against plan|gap to plan|short of plan/i, task: "/michelle/gap?from=sarah", render: () => null },
  { q: "Pull this week's Vendor Central numbers", hidden: true, match: /vendor central|\bvc\b|inventory|weeks of cover/i, think: { ms: 1800, label: "Pulling sales and inventory from Vendor Central…" }, render: () => <VendorCentralAnswer /> },
  { q: "Launch the Winter Hearth collection", hidden: true, match: /launch|winter hearth/i, think: { ms: 1800, label: "Checking the launch with the content, media and ops agents…" }, render: () => <LaunchAnswer /> },
]
