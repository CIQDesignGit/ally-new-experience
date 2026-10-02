"use client"

import { useState } from "react"
import { Download, Loader2, Mail } from "lucide-react"
import { cn } from "@/lib/utils"
import { downloadExecSummary, execSummaryForEmail } from "../exec-pdf"
import { emailMe } from "../email-me"
import { useNudge } from "../nudge-context"
import type { Period } from "../types"
import { ICON_BTN } from "./team-bell"

/** Two icons in Claire's top line, both the page as a PDF (fully expanded): email it to me, or download it. */
export function EmailPdfButton({ period }: { period: Period }) {
  const { approved, nudged, policy, asks, approvedBy, autoShipped, launchReady, day } = useNudge()
  const [busy, setBusy] = useState<"download" | "email" | null>(null)

  async function run(kind: "download" | "email") {
    setBusy(kind)
    try {
      if (kind === "download") await downloadExecSummary(period, { approved, nudged, policy })
      else await emailMe({ kind: "summary", ...(await execSummaryForEmail(period, { approved, nudged, policy, asks, approvedBy, autoShipped, launchReady, day })) })
    } finally {
      setBusy(null)
    }
  }

  return (
    <>
      <button type="button" onClick={() => run("email")} disabled={!!busy} aria-label="Email me the PDF" title="Email me the PDF" className={cn(ICON_BTN, "disabled:opacity-60")}>
        {busy === "email" ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
      </button>
      <button type="button" onClick={() => run("download")} disabled={!!busy} aria-label="Download PDF" title="Download PDF" className={cn(ICON_BTN, "disabled:opacity-60")}>
        {busy === "download" ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
      </button>
    </>
  )
}
