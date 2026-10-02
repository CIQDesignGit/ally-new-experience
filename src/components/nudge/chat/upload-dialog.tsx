"use client"

import { useEffect, useState } from "react"
import { CloudUpload, FileImage, Mail, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { PRIMARY, SECONDARY } from "../mike/buttons"
import type { Attachment } from "./inline-chat"

/**
 * The upload dialog: a drop zone, files arriving with progress, then Attach.
 * In the demo nothing leaves the browser; the files are the scenario's own
 * (the brand team's email and the agency's concept), so the flow behind them is real.
 */
export function UploadDialog({ title = "Upload files", files, onClose, onAttach }: { title?: string; files: Attachment[]; onClose: () => void; onAttach: (files: Attachment[]) => void }) {
  const [picked, setPicked] = useState(false)
  const [progress, setProgress] = useState<number[]>(() => files.map(() => 0))
  const done = picked && progress.every((p) => p >= 100)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  // Each file climbs at its own pace, the image slower than the email.
  useEffect(() => {
    if (!picked) return
    const t = window.setInterval(() => setProgress((p) => p.map((v, i) => Math.min(100, v + (files[i].kind === "email" ? 22 : 9)))), 90)
    return () => window.clearInterval(t)
  }, [picked, files])

  return (
    <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-[60] flex items-start justify-center bg-slate-950/25 px-4 pt-28" onMouseDown={onClose}>
      <div className="w-full max-w-[520px] overflow-hidden rounded-2xl bg-white shadow-[0_30px_80px_-20px_rgba(15,23,42,0.35)] ring-1 ring-slate-200" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <span className="text-[15px] font-semibold text-slate-950">{title}</span>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700">
            <X className="size-4" />
          </button>
        </div>

        <div className="px-5 py-5">
          <button
            type="button"
            onClick={() => setPicked(true)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              setPicked(true)
            }}
            className={cn("flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors", picked ? "border-slate-200 bg-slate-25" : "border-slate-300 hover:border-brand-400 hover:bg-brand-25")}
          >
            <CloudUpload className="size-7 text-brand-600" />
            <span className="text-[14px] font-medium text-slate-950">Drop files here, or browse</span>
            <span className="text-[12px] text-slate-500">Emails, PDFs and images, up to 25 MB each</span>
          </button>

          {picked && (
            <ul className="mt-4 flex flex-col gap-2">
              {files.map((f, i) => (
                <li key={f.name} className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5">
                  {f.kind === "email" ? <Mail className="size-5 shrink-0 text-slate-500" /> : <FileImage className="size-5 shrink-0 text-slate-500" />}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="truncate text-[13px] font-medium text-slate-950">{f.name}</span>
                      <span className="shrink-0 font-mono text-[12px] text-slate-500">{progress[i] >= 100 ? f.size : `${progress[i]}%`}</span>
                    </div>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-100">
                      <i className={cn("block h-full rounded-full transition-[width] duration-100", progress[i] >= 100 ? "bg-success-500" : "bg-brand-500")} style={{ width: `${progress[i]}%` }} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-3">
          <button type="button" onClick={onClose} className={SECONDARY}>
            Cancel
          </button>
          <button type="button" disabled={!done} onClick={() => onAttach(files)} className={cn(PRIMARY, !done && "pointer-events-none opacity-50")}>
            Attach {files.length} files
          </button>
        </div>
      </div>
    </div>
  )
}
