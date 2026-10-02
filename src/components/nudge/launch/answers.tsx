"use client"

import { useEffect, useState } from "react"
import { Check, ChevronRight, Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import { useNudge } from "../nudge-context"
import { useChat, useTurn } from "../chat/inline-chat"
import { UploadDialog } from "../chat/upload-dialog"
import type { Chip } from "../chat/inline-chat"
import { OpenItem } from "../chat/open-item"
import { PRIMARY } from "../mike/buttons"
import { AS_OF } from "../data"
import { LAUNCH, LAUNCH_FILES, LAUNCH_MEMORY, LAUNCH_PAGES, NEW_SKUS } from "./data"
import { MemorySaved } from "../chat/memory"
import { AdaptedImage, ConceptImage } from "./images"
import { motion } from "framer-motion"

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
  const [shown, setShown] = useState(false)

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
    <div className="flex max-w-[860px] flex-col gap-5 text-[15px] leading-relaxed text-slate-700">
      <p>{`Got Priya's brief: ${NEW_SKUS.length} new SKUs launch ${LAUNCH.launch} for the Hudson Valley Winter Market, with the agency's concept, "${LAUNCH.tagline}." Adapting it for each SKU now.`}</p>
      <ConceptTransform onDone={() => setShown(true)} />
      {shown && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
          <SentLine />

          <MemorySaved text={LAUNCH_MEMORY.text} />
        </motion.div>
      )}
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

/**
 * The one concept becoming many images: the concept, a scan across it while
 * Ally works, then the first SKU's three images landing one by one, and the
 * other two SKUs stacked as "+2 more". The pages themselves wait in the queue.
 */
function ConceptTransform({ onDone }: { onDone: () => void }) {
  const first = LAUNCH_PAGES[0]
  const rest = LAUNCH_PAGES.slice(1)
  const [step, setStep] = useState(0)
  useEffect(() => {
    const t = [450, 1100, 1700, 2300, 2900].map((ms, i) => window.setTimeout(() => setStep(i + 1), ms))
    t.push(window.setTimeout(onDone, 3200))
    return () => t.forEach(window.clearTimeout)
    // Runs once, when the answer appears.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const status = ["Reading the concept…", "Placing the jar on white for Amazon's main image…", "Grading the lifestyle shot to the concept…", "Writing the scent notes…", "Doing the same for the other 2 SKUs…", `${NEW_SKUS.length * 3} images ready, checked against Amazon, Walmart and Target rules.`]
  const sku = NEW_SKUS.find((x) => x.id === first.skuId)!
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-[minmax(0,1fr)_28px_minmax(0,1.5fr)] items-center gap-3">
        <div className="relative overflow-hidden rounded-xl">
          <ConceptImage compact />
          {step < 5 && (
            <motion.i
              aria-hidden
              className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/35 to-transparent"
              initial={{ left: "-35%" }}
              animate={{ left: "105%" }}
              transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </div>
        <ChevronRight className="size-5 text-slate-400" />
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="mb-2 text-[12px] font-medium text-slate-500">{sku.title.replace("Aurelle ", "")}</div>
          <div className="grid grid-cols-3 gap-2">
            {(["main", "lifestyle", "story"] as const).map((k, i) =>
              step > i ? (
                <motion.div key={k} initial={{ opacity: 0, scale: 0.7, x: -60 }} animate={{ opacity: 1, scale: 1, x: 0 }} transition={{ type: "spring", stiffness: 240, damping: 22 }}>
                  <AdaptedImage kind={k} photo={first.photo} focus={first.focus} notes={first.notes} story={first.story} main={first.main} />
                </motion.div>
              ) : (
                <div key={k} className="aspect-square animate-pulse rounded-lg bg-slate-100" />
              ),
            )}
          </div>
          {step >= 4 && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 flex items-center gap-3 border-t border-slate-100 pt-3">
              <span className="flex -space-x-3">
                {rest.map((p) => (
                  <span key={p.skuId} className="block w-10 overflow-hidden rounded-md ring-2 ring-white">
                    <AdaptedImage kind="main" photo={p.photo} focus={p.focus} notes={p.notes} story={p.story} main={p.main} bare />
                  </span>
                ))}
              </span>
              <span className="text-[13px] text-slate-700">
                <b className="font-semibold text-slate-950">+2 more SKUs</b>
                {` · ${rest.map((p) => NEW_SKUS.find((x) => x.id === p.skuId)!.title.replace("Aurelle ", "").split(",")[0]).join(" and ")}`}
              </span>
            </motion.div>
          )}
        </div>
      </div>
      <div className={cn("text-[13px]", step >= 5 ? "text-success-700" : "text-slate-500")}>{status[step]}</div>
    </div>
  )
}
