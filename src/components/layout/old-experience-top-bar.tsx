"use client"

import {
  Bell,
  Bot,
  ChevronRight,
  CircleHelp,
  Download,
  House,
  Library,
  Lightbulb,
  Megaphone,
  MessageCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

/** Classic CommerceIQ chrome header (from alerts-skill-customization). */
export function OldExperienceTopBar({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        "flex h-12 shrink-0 items-center justify-between border-b border-border-default bg-surface px-4",
        className,
      )}
    >
      <div className="flex items-center gap-1 type-body text-fg-tertiary">
        <House className="size-4" aria-hidden />
        <ChevronRight className="size-3.5" aria-hidden />
        <span>Agents</span>
        <ChevronRight className="size-3.5" aria-hidden />
      </div>
      <div className="flex items-center gap-3 text-slate-600">
        <span className="relative">
          <Bot className="size-5" aria-hidden />
          <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-emerald-500 ring-2 ring-surface" aria-hidden />
        </span>
        <span className="relative">
          <Bell className="size-5" aria-hidden />
          <span className="absolute top-0 right-0 size-1.5 rounded-full bg-rose-600 ring-2 ring-surface" aria-hidden />
        </span>
        <CircleHelp className="size-5" aria-hidden />
        <Lightbulb className="size-5" aria-hidden />
        <Download className="size-5" aria-hidden />
        <Library className="size-5" aria-hidden />
        <span className="relative">
          <Megaphone className="size-5" aria-hidden />
          <span className="absolute top-0 right-0 size-1.5 rounded-full bg-rose-600 ring-2 ring-surface" aria-hidden />
        </span>
        <MessageCircle className="size-5" aria-hidden />
        <span className="flex size-7 items-center justify-center rounded-full bg-rose-700 type-caption-strong text-white">VW</span>
      </div>
    </header>
  )
}
