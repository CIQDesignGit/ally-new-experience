"use client"

import { useState } from "react"
import { Download, Loader2, Mail, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { downloadExecSummary, execSummaryForEmail } from "../exec-pdf"
import { emailMe } from "../email-me"
import { useNudge } from "../nudge-context"
import type { Period } from "../types"
import { ICON_BTN } from "./team-bell"

/** The mail icon in Claire's top line: the page as a PDF, fully expanded. Download it, or have it emailed to you. */
export function EmailPdfButton({ period }: { period: Period }) {
  const { approved, nudged, policy } = useNudge()
  const [busy, setBusy] = useState<"download" | "email" | null>(null)

  async function run(kind: "download" | "email") {
    setBusy(kind)
    try {
      if (kind === "download") await downloadExecSummary(period, { approved, nudged, policy })
      else await emailMe({ kind: "summary", ...(await execSummaryForEmail(period, { approved, nudged, policy })) })
    } finally {
      setBusy(null)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger disabled={!!busy} aria-label="Share this summary" title="Share this summary" className={cn(ICON_BTN, "disabled:opacity-60")}>
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-56 rounded-xl p-1.5 shadow-md ring-1 ring-slate-200/80">
        <DropdownMenuItem onClick={() => run("email")} className="gap-2.5 px-2.5 py-2 text-sm">
          <Send className="size-4 text-slate-500" /> Email me the PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => run("download")} className="gap-2.5 px-2.5 py-2 text-sm">
          <Download className="size-4 text-slate-500" /> Download PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
