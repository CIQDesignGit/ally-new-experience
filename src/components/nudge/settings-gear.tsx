import Link from "next/link"
import { Settings } from "lucide-react"

/** The gear in every page's top line: settings live one click away, never on the main path. */
export function SettingsGear() {
  return (
    <Link
      href="/settings?tab=business"
      aria-label="Settings"
      className="flex size-9 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition-colors hover:border-brand-300 hover:text-brand-700"
    >
      <Settings className="size-4" />
    </Link>
  )
}
