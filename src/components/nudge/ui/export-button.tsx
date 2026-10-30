"use client"

import { useState } from "react"
import { Download, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { ICON_BTN } from "../claire/team-bell"

/** Export, the same icon button as Claire's download: the file type is the page's business, not the label's. */
export function ExportButton({ onExport }: { onExport: () => void | Promise<void> }) {
  const [busy, setBusy] = useState(false)
  return (
    <button
      type="button"
      disabled={busy}
      aria-label="Export"
      title="Export"
      onClick={async () => {
        setBusy(true)
        try {
          await onExport()
        } finally {
          setBusy(false)
        }
      }}
      className={cn(ICON_BTN, "disabled:opacity-60")}
    >
      {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
    </button>
  )
}
