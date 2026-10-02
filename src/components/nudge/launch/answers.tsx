"use client"

import { useState } from "react"
import { Check, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { useNudge } from "../nudge-context"
import { useChat } from "../chat/inline-chat"
import type { Chip } from "../chat/inline-chat"
import { OpenItem } from "../chat/open-item"
import { PRIMARY } from "../mike/buttons"
import { AS_OF } from "../data"
import { LAUNCH, LAUNCH_FACTS, LAUNCH_PAGES, NEW_SKUS, RETAILER_CHECKS } from "./data"
import { AdaptedImage, ConceptImage } from "./images"

/**
 * Use case 7. First Ally reads the email and offers to keep what's new; each
 * fact is Mike's call (Yes / No / Just for me). Then it adapts the concept per
 * SKU within each retailer's rules and sends the pages for one approval.
 */

const DATE = new Date(`${AS_OF}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

export function LaunchBriefAnswer() {
  const { knowledge, saveKnowledge } = useNudge()
  const [choice, setChoice] = useState<Record<string, "yes" | "me" | "no">>({})

  function keep(id: (typeof LAUNCH_FACTS)[number]["id"], c: "yes" | "me" | "no") {
    setChoice((x) => ({ ...x, [id]: c }))
    if (c === "no") return saveKnowledge(knowledge.filter((k) => k.id !== `launch-${id}`))
    const f = LAUNCH_FACTS.find((x) => x.id === id)!
    const entry = { id: `launch-${id}`, text: f.text, retailer: "Amazon", brands: [] as string[], skuGroups: [] as string[], author: "Mike Chen", date: DATE, source: c === "me" ? "from the brand team's launch email · just for Mike" : "from the brand team's launch email" }
    saveKnowledge([entry, ...knowledge.filter((k) => k.id !== entry.id)])
  }

  return (
    <div className="flex max-w-[860px] flex-col gap-4 text-[15px] leading-relaxed text-slate-700">
      <p className="text-[17px] font-semibold text-slate-950">A new launch, an event and a concept. Here&apos;s what&apos;s new; keep what Ally should use from now on.</p>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {LAUNCH_FACTS.map((f, i) => (
          <div key={f.id} className={cn("flex items-center gap-4 px-4 py-3", i > 0 && "border-t border-slate-100")}>
            <div className="min-w-0 flex-1">
              <div className="text-[14px] text-slate-950">{f.text}</div>
              <div className="text-[12px] text-slate-500">{f.scope}</div>
            </div>
            <div className="flex shrink-0 overflow-hidden rounded-lg border border-slate-200 text-[13px]">
              {(
                [
                  ["yes", "Yes"],
                  ["me", "Just for me"],
                  ["no", "No"],
                ] as const
              ).map(([c, label], k) => (
                <button key={c} type="button" onClick={() => keep(f.id, c)} aria-pressed={choice[f.id] === c} className={cn("px-3 py-1.5", k > 0 && "border-l border-slate-200", choice[f.id] === c ? "bg-slate-100 font-semibold text-slate-950" : "text-slate-600 hover:bg-slate-50")}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-center gap-5">
        <ConceptImage />
        <p className="text-[14px]">
          {`The agency's concept is in. I'll adapt it into images for each of the ${NEW_SKUS.length} new SKUs, within each retailer's rules, and draft their pages.`}
        </p>
      </div>
    </div>
  )
}

export function LaunchAdaptAnswer() {
  const { launchReady, setLaunchReady } = useNudge()
  const { turns } = useChat()
  const sent = launchReady || turns.some((t) => t.chip === SEND_ASK)
  return (
    <div className="flex max-w-[960px] flex-col gap-5 text-[15px] leading-relaxed text-slate-700">
      <p className="text-[17px] font-semibold text-slate-950">
        {NEW_SKUS.length} pages drafted from one concept: {NEW_SKUS.length * 3} images, titles and bullets. Here are two.
      </p>

      {LAUNCH_PAGES.map((p) => {
        const sku = NEW_SKUS.find((s) => s.id === p.skuId)!
        return (
          <div key={p.skuId} className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-5 rounded-xl border border-slate-200 bg-white p-4">
            <div className="grid grid-cols-3 gap-2">
              {(["main", "lifestyle", "story"] as const).map((k) => (
                <AdaptedImage key={k} kind={k} photo={p.photo} focus={p.focus} notes={p.notes} story={p.story} main={p.main} />
              ))}
            </div>
            <div className="min-w-0">
              <div className="text-[12px] font-medium text-slate-500">{sku.asin} · new</div>
              <div className="mt-1 text-[15px] leading-snug font-semibold text-slate-950">{p.title}</div>
              <ul className="mt-2 flex flex-col gap-1 text-[13px] text-slate-700">
                {p.bullets.map((b) => (
                  <li key={b}>· {b}</li>
                ))}
              </ul>
              {p.removed && (
                <div className="mt-2.5 flex items-start gap-1.5 text-[12px] text-success-700">
                  <ShieldCheck className="mt-0.5 size-3.5 shrink-0" /> Removed {p.removed}
                </div>
              )}
            </div>
          </div>
        )
      })}

      <div>
        <div className="text-[13px] font-medium text-slate-950">Checked against each retailer&apos;s rules</div>
        <div className="mt-2 grid grid-cols-3 gap-3">
          {RETAILER_CHECKS.map((r) => (
            <div key={r.retailer} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
              <div className="text-[14px] font-semibold text-slate-950">{r.retailer}</div>
              <ul className="mt-1.5 flex flex-col gap-1">
                {r.rules.map((x) => (
                  <li key={x} className="flex items-start gap-1.5 text-[12px] text-slate-600">
                    <Check className="mt-0.5 size-3 shrink-0 text-success-600" /> {x}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {sent ? (
        <SentLine />
      ) : (
        <div>
          <button type="button" onClick={() => setLaunchReady(true)} className={PRIMARY}>
            Send {NEW_SKUS.length} SKUs for approval
          </button>
        </div>
      )}
    </div>
  )
}

function SentLine() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="inline-flex items-center gap-1.5 text-[14px] font-medium text-success-700">
        <Check className="size-4" /> Sent. The {LAUNCH.name} is one approval away: {NEW_SKUS.length} SKUs, {LAUNCH.value}, due {LAUNCH.due}.
      </span>
      <OpenItem batch="concepts">Open it in your queue</OpenItem>
    </div>
  )
}

export const ADAPT_ASK = "Adapt the concept for the 3 new SKUs"
export const SEND_ASK = "Send the 3 SKUs for approval"

const ADAPT_CHIP: Chip = { q: ADAPT_ASK, match: /adapt|draft|images?/i, render: () => <LaunchAdaptAnswer /> }
/** The brief arrives as files (from the queue item or the 📎); it isn't offered as a starter. */
export const LAUNCH_CHIP: Chip = {
  q: "Here's the Winter Hearth launch brief",
  match: /launch|winter hearth|brand team|brief/i,
  hidden: true,
  takesFiles: true,
  render: () => <LaunchBriefAnswer />,
  followUps: [ADAPT_CHIP],
}
