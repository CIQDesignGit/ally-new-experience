"use client"

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { ownerPage } from "./data"
import { useMvp } from "./mvp"
import type { AgentId } from "./types"

/**
 * An owner's name on Claire's page. When they have a page, it opens it (their
 * queue as they see it); otherwise it's plain text. Clicks don't reach the row
 * underneath, so a row that expands on click still does.
 */
export function OwnerName({ lever, name, className }: { lever: AgentId; name: string; className?: string }) {
  // The MVP shows every lever's work, but only opens the pages it ships.
  const page = ownerPage(lever, useMvp())
  if (!page) return <span className={cn("font-medium", className)}>{name}</span>
  return (
    <Link
      href={`${page}?from=claire`}
      onClick={(e) => e.stopPropagation()}
      title={`Open ${name}'s page`}
      className={cn("group/owner inline-flex items-center gap-0.5 font-medium underline decoration-slate-300 underline-offset-2 transition-colors hover:text-brand-700 hover:decoration-brand-300", className)}
    >
      {name}
      <ArrowUpRight className="size-3 text-slate-400 transition-colors group-hover/owner:text-brand-600" />
    </Link>
  )
}
