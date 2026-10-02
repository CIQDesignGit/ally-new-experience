"use client"

import { useEffect, useState } from "react"
import { Check, ShieldCheck, Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import { useNudge } from "../nudge-context"
import { useChat, useTurn } from "../chat/inline-chat"
import { UploadDialog } from "../chat/upload-dialog"
import type { Chip } from "../chat/inline-chat"
import { OpenItem } from "../chat/open-item"
import { PRIMARY } from "../mike/buttons"
import { AS_OF } from "../data"
import { LAUNCH, LAUNCH_FILES, LAUNCH_MEMORY, LAUNCH_PAGES, NEW_SKUS, RETAILER_CHECKS } from "./data"
import { MemorySaved } from "../chat/memory"
import { AdaptedImage } from "./images"

/**
 * Use case 7. First Ally reads the email and offers to keep what's new; each
 * fact is Mike's call (Yes / No / Just for me). Then it adapts the concept per
 * SKU within each retailer's rules and sends the pages for one approval.
 */

const DATE = new Date(`${AS_OF}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

export function LaunchBriefAnswer() {
  // Asked for without the brief attached: Ally asks for it instead of pretending to have read it.
  const turn = useTurn()
  if (!turn?.attach?.length) return <NeedBrief />
  return <BriefRead />
}

/** No brief yet: one line and the upload, which asks again with the files. */
function NeedBrief() {
  const { ask } = useChat()
  const [open, setOpen] = useState(false)
  return (
    <div className="flex max-w-[640px] flex-col gap-3 text-[15px] leading-relaxed text-slate-700">
      <p>{`To draft the ${NEW_SKUS.length} Winter Hearth pages I need the launch brief: the brand team's email and the agency's concept.`}</p>
      <button type="button" onClick={() => setOpen(true)} className={cn(PRIMARY, "w-fit")}>
        <Upload className="size-4" /> Upload the brief
      </button>
      {open && (
        <UploadDialog
          title="Upload the launch brief"
          files={LAUNCH_FILES}
          onClose={() => setOpen(false)}
          onAttach={(files) => {
            setOpen(false)
            ask(LAUNCH_CHIP, undefined, "Here's the Winter Hearth launch brief.", files)
          }}
        />
      )}
    </div>
  )
}

/** The brief is in: Ally drafts the pages, queues them for approval, then says what it's keeping in memory. */
function BriefRead() {
  const { knowledge, saveKnowledge, setLaunchReady } = useNudge()

  // Drafting and queueing happen on arrival; the facts go to Knowledge (editable there, under Settings).
  useEffect(() => {
    if (handled.current) return
    handled.current = true
    setLaunchReady(true)
    // One fact, not the whole email: the thing worth bringing back later.
    const entry = { id: LAUNCH_MEMORY.id, text: LAUNCH_MEMORY.text, retailer: "Amazon", brands: [] as string[], skuGroups: [] as string[], author: "Mike Chen", date: DATE, source: `from ${LAUNCH_MEMORY.source}` }
    saveKnowledge([entry, ...knowledge.filter((k) => k.id !== entry.id && !k.id.startsWith("launch-"))])
  }, [knowledge, saveKnowledge, setLaunchReady])

  return (
    <div className="flex max-w-[960px] flex-col gap-5 text-[15px] leading-relaxed text-slate-700">
      <p>{`Got Priya's brief: ${NEW_SKUS.length} new SKUs launch ${LAUNCH.launch} for the Hudson Valley Winter Market, with the agency's concept, "${LAUNCH.tagline}." I drafted their pages from it: ${NEW_SKUS.length * 3} images, titles and bullets. Here are two.`}</p>

      {LAUNCH_PAGES.map((p) => {
        const sku = NEW_SKUS.find((x) => x.id === p.skuId)!
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
                  <ShieldCheck className="mt-0.5 size-3.5 shrink-0" /> {`Removed ${p.removed}`}
                </div>
              )}
            </div>
          </div>
        )
      })}

      <div className="text-[13px] text-slate-500">
        {`Checked against each retailer's rules: ${RETAILER_CHECKS.map((r) => `${r.retailer} (${r.rules[0].toLowerCase()})`).join(" · ")}.`}
      </div>

      <SentLine />

      <MemorySaved text={LAUNCH_MEMORY.text} />
    </div>
  )
}

// Once per page load, even when React mounts the answer twice in development.
const handled = { current: false }

function SentLine() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="inline-flex items-center gap-1.5 text-[14px] font-medium text-success-700">
        <Check className="size-4" /> {`Queued for your approval: ${NEW_SKUS.length} SKUs, ${LAUNCH.value}, due ${LAUNCH.due}.`}
      </span>
      <OpenItem batch="concepts">Open it in your queue</OpenItem>
    </div>
  )
}

/** The brief arrives as files (from the queue item or the 📎); it isn't offered as a starter. */
export const LAUNCH_CHIP: Chip = {
  q: "Here's the Winter Hearth launch brief",
  match: /launch|winter hearth|brand team|brief/i,
  hidden: true,
  takesFiles: true,
  needsFiles: true,
  render: () => <LaunchBriefAnswer />,
}
