"use client"

import { useEffect, useState } from "react"
import { Check, Loader2, Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import { useNudge } from "../nudge-context"
import { useChat, useTurn } from "../chat/inline-chat"
import { UploadDialog } from "../chat/upload-dialog"
import type { Chip } from "../chat/inline-chat"
import { OpenItem } from "../chat/open-item"
import { PRIMARY } from "../mike/buttons"
import { AS_OF } from "../data"
import { AMAZON_CHECKS, LAUNCH, LAUNCH_FILES, LAUNCH_MEMORY, LAUNCH_PAGES, NEW_SKUS, PAGE_FACTS } from "./data"
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
  // Paced so each beat lands: what you sent, then the localizing, then the queue and the memory.
  const [localizing, setLocalizing] = useState(false)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const t = window.setTimeout(() => setLocalizing(true), 1400)
    return () => window.clearTimeout(t)
  }, [])

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
      <p className="font-semibold text-slate-950">Here&apos;s the brand brief and the creative asset.</p>
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-3">
        <BriefCard />
        <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
          <ConceptImage compact className="rounded-none" />
          <div className="px-3 py-2 text-[12px] text-slate-500">{`Creative asset · ${LAUNCH.concept.name}`}</div>
        </div>
      </div>
      {localizing && <ConceptTransform onDone={() => window.setTimeout(() => setShown(true), 700)} />}
      {shown && <QueuedCard />}
    </div>
  )
}

/** The email, read: who it's from and the lines that matter. */
function BriefCard() {
  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white px-4 py-3.5">
      <div className="text-[12px] text-slate-500">Brand brief · from Priya, brand team</div>
      <div className="mt-0.5 text-[14px] font-semibold text-slate-950">Re: Winter Hearth launch</div>
      <ul className="mt-2.5 flex flex-col gap-1.5 text-[13px] text-slate-700">
        <li>{`· ${NEW_SKUS.length} new SKUs launch ${LAUNCH.launch}`}</li>
        <li>· Official candle of the Hudson Valley Winter Market, Nov 13–15</li>
        <li>{`· Tagline: "${LAUNCH.tagline}"`}</li>
        <li>· Legal: no &quot;non-toxic&quot; claims</li>
      </ul>
    </div>
  )
}

const handled = { current: false }

/** The close: what's waiting and where, and what Ally kept, in one card. */
function QueuedCard() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center gap-4 px-4 py-3.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-success-50 ring-1 ring-success-200">
          <Check className="size-4 text-success-600" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-semibold text-slate-950">Queued for your approval</div>
          <div className="text-[13px] text-slate-500">{`${NEW_SKUS.length} new SKUs · ${LAUNCH.value} · due ${LAUNCH.due}`}</div>
        </div>
        <OpenItem batch="concepts" primary>
          View in queue
        </OpenItem>
      </div>
      <div className="border-t border-slate-100 bg-slate-25 px-4 py-2.5">
        <MemorySaved text={LAUNCH_MEMORY.text} />
      </div>
    </motion.div>
  )
}

/** The brief arrives as files (from the queue item or the 📎); it isn't offered as a starter. */
export const LAUNCH_CHIP: Chip = {
  q: "Here's the Winter Hearth launch brief",
  match: /launch|winter hearth|brand team|brief/i,
  hidden: true,
  takesFiles: true,
  needsFiles: true,
  think: { ms: 2000, label: "Looking at the launch…", filesLabel: "Reading the brief and the creative…" },
  render: () => <LaunchBriefAnswer />,
}

/**
 * Localizing the one concept for each SKU on Amazon: the steps check off as
 * Ally works, and the first SKU's image set lands beside them, then the other
 * two SKUs. The pages themselves wait in the queue.
 */
function ConceptTransform({ onDone }: { onDone: () => void }) {
  const first = LAUNCH_PAGES[0]
  const rest = LAUNCH_PAGES.slice(1)
  const [step, setStep] = useState(0)
  useEffect(() => {
    const t = [800, 1600, 2400, 3200, 4000].map((ms, i) => window.setTimeout(() => setStep(i + 1), ms))
    t.push(window.setTimeout(onDone, 4600))
    return () => t.forEach(window.clearTimeout)
    // Runs once, when the answer appears.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const steps = ["Main image on pure white", "Lifestyle shot in the concept", "Infographic with scent notes and burn time", `Checked against Amazon's rules (${AMAZON_CHECKS.length})`, "The other 2 SKUs"]
  const sku = NEW_SKUS.find((x) => x.id === first.skuId)!
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-[14px] font-semibold text-slate-950">
        {step < 5 ? <Loader2 className="size-4 animate-spin text-brand-600" /> : <Check className="size-4 text-success-600" />}
        {step < 5 ? "Localizing images for your Amazon pages…" : `Localized for ${NEW_SKUS.length} SKUs on Amazon: ${NEW_SKUS.length * 3} images`}
      </div>
      <div className="mt-3 grid grid-cols-[200px_minmax(0,1fr)] gap-5">
        <ul className="flex flex-col gap-2 text-[13px]">
          {steps.map((label, i) => (
            <li key={label} className={cn("flex items-center gap-2", step > i ? "text-slate-800" : step === i ? "text-slate-950" : "text-slate-400")}>
              {step > i ? <Check className="size-3.5 shrink-0 text-success-600" /> : step === i ? <Loader2 className="size-3.5 shrink-0 animate-spin text-brand-600" /> : <i className="size-3.5 shrink-0 rounded-full border border-slate-300" />}
              {label}
            </li>
          ))}
        </ul>
        <div>
          <div className="mb-2 text-[12px] font-medium text-slate-500">{sku.title.replace("Aurelle ", "")}</div>
          <div className="grid grid-cols-3 gap-2">
            {(["main", "lifestyle", "story"] as const).map((k, i) =>
              step >= 5 ? (
                <motion.div key={k} initial={{ opacity: 0, scale: 0.9, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 260, damping: 24, delay: i * 0.12 }}>
                  <AdaptedImage kind={k} photo={first.photo} focus={first.focus} notes={first.notes} story={first.story} cut={first.cut} facts={PAGE_FACTS[first.skuId]} />
                </motion.div>
              ) : (
                <div key={k} className="relative flex aspect-square items-end overflow-hidden rounded-lg bg-slate-100 p-2">
                  <motion.i aria-hidden className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/70 to-transparent" initial={{ left: "-50%" }} animate={{ left: "110%" }} transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }} />
                  <span className="relative text-[11px] font-medium text-slate-400">{["Main image", "Lifestyle", "Infographic"][i]}</span>
                </div>
              ),
            )}
          </div>
          {step >= 5 && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 flex items-center gap-3 border-t border-slate-100 pt-3">
              <span className="flex -space-x-2">
                {rest.map((p) => (
                  <span key={p.skuId} className="block w-10 overflow-hidden rounded-md ring-2 ring-white">
                    <AdaptedImage kind="main" photo={p.photo} focus={p.focus} notes={p.notes} story={p.story} cut={p.cut} facts={PAGE_FACTS[p.skuId]} bare />
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
    </div>
  )
}
