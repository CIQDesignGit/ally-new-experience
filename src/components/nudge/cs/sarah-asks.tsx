"use client"

import type { Chip } from "../chat/inline-chat"
import { launchStatusChip } from "../launch/status"

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

/**
 * What Sarah can type on her page without a starter: the same skills Michelle,
 * Mike and James use, opened as Sarah, shaped by Aurelle's context.
 */
export const SARAH_TYPED: Chip[] = [
  { q: "Prime Day deck for Claire", hidden: true, match: /prime day/i, task: "/sarah/decks/prime-day?new=1", render: () => null },
  { q: "Prep me for the Amazon vendor negotiation", hidden: true, match: /negotiat|\bavn\b/i, task: "/michelle/c/negotiation?from=sarah", render: () => null },
  { q: "Where is Aurelle against plan?", hidden: true, match: /(not|n't) (meeting|making|hitting) (my |our |the )?plan|behind plan|against plan|gap to plan|short of plan/i, task: "/michelle/gap?from=sarah", render: () => null },
  { q: "Pull this week's Vendor Central numbers", hidden: true, match: /vendor central|\bvc\b|inventory|weeks of cover/i, think: { ms: 1800, label: "Pulling sales and inventory from Vendor Central…" }, render: () => <VendorCentralAnswer /> },
  launchStatusChip("sarah"),
]
