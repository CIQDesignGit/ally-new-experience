"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface SlackNudgePreview {
  batchName: string
  description: string
  /** The dollar figure, when there is one (a nudge has it; a request or a release doesn't). */
  value?: string
  skus?: number
  deadlineDays?: number
  /** Where "Open in Ally" and the desktop notification deep-link. */
  queuePath: string
  /** The first line and the due chip, when it isn't a plain "Claire nudged you". */
  headline?: string
  chip?: string
  /** How long it stays, ms (8s; a hand-off the presenter talks through stays longer). */
  duration?: number
}

/**
 * In-app Slack-style popup so a live demo can show what fired without alt-tabbing.
 * The REAL notification is the Slack DM sent by /api/nudge in parallel — that
 * surfaces as a native Slack desktop notification on the recipient's machine.
 */
function SlackToastCard({ preview, onOpen }: { preview: SlackNudgePreview; onOpen: () => void }) {
  return (
    <div className="w-90 rounded-lg border border-slate-200 bg-white p-3.5 shadow-lg">
      <div className="flex items-center gap-2">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-brand-500">
          <span className="size-2 rounded-full bg-brand-200" />
        </span>
        <span className="text-sm font-bold text-slate-950">Ally</span>
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">APP</span>
        <span className="text-xs text-slate-400">now</span>
      </div>
      <div className="mt-2 text-sm leading-snug text-slate-800">
        {preview.headline ?? (
          <>
            <span className="font-semibold">Claire</span> nudged you on <span className="font-semibold">{preview.batchName}</span>
            {preview.deadlineDays ? `. Window closes in ${preview.deadlineDays} days.` : "."}
          </>
        )}
      </div>
      <div className="mt-2.5 rounded-md border border-slate-200 border-l-[3px] border-l-brand-500 p-3">
        {(preview.chip || preview.deadlineDays) && (
          <span className="mb-1.5 inline-block rounded-full bg-warning-100 px-2 py-0.5 text-[11px] font-semibold text-warning-700">
            {preview.chip ?? `${preview.deadlineDays} days to act`}
          </span>
        )}
        <div className="text-sm font-semibold text-slate-950">{preview.batchName}</div>
        <div className="mt-0.5 text-xs leading-snug text-slate-600">{preview.description}</div>
        {(preview.value || preview.skus) && (
          <div className="mt-1.5 flex items-baseline gap-2">
            {preview.value && <span className="font-mono text-[15px] font-bold text-slate-950">{preview.value}</span>}
            {preview.skus ? <span className="text-xs text-slate-400">{preview.skus} SKUs</span> : null}
          </div>
        )}
        <button
          type="button"
          onClick={onOpen}
          className="mt-2.5 rounded-md bg-brand-500 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-600"
        >
          Open in Ally →
        </button>
      </div>
    </div>
  )
}

export function useSlackNudgeToast() {
  const router = useRouter()

  return function showSlackNudgeToast(preview: SlackNudgePreview) {
    toast.custom(
      (id) => (
        <SlackToastCard
          preview={preview}
          onOpen={() => {
            toast.dismiss(id)
            router.push(preview.queuePath)
          }}
        />
      ),
      { duration: preview.duration ?? 8000 },
    )
  }
}
