"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useExperienceTransitionBusy } from "@/lib/experience-mode"

type ExperienceModeToggleProps = {
  /** Ally rail (brand-950) vs classic CommerceIQ rail (slate-800). */
  variant: "ally" | "classic"
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  title?: string
}

const thumbSpring = { type: "spring" as const, stiffness: 520, damping: 34, mass: 0.35 }

/** Footer switch shared by the new Ally rail and the classic sidebar — one layout, theme-specific colors only. */
export function ExperienceModeToggle({ variant, checked, onCheckedChange, title }: ExperienceModeToggleProps) {
  const busy = useExperienceTransitionBusy()
  const borderClass = variant === "ally" ? "border-white/10" : "border-slate-600"
  const labelClass = variant === "ally" ? "text-brand-200" : "text-slate-300"
  const trackOff = variant === "ally" ? "bg-white/20" : "bg-slate-600"
  const [pending, setPending] = useState<boolean | null>(null)
  const shown = pending ?? checked

  useEffect(() => {
    setPending(null)
  }, [checked])

  return (
    <div className={cn("shrink-0 border-t pt-3", borderClass)}>
      <div className="flex items-center justify-between gap-2 px-2.5 py-2">
        <span className={cn("min-w-0 flex-1 text-sm leading-snug", labelClass)}>Try new Ally</span>
        <button
          type="button"
          role="switch"
          disabled={busy}
          aria-checked={shown}
          aria-busy={busy}
          aria-label="Try new Ally"
          title={title}
          onClick={() => {
            if (busy) return
            const next = !shown
            setPending(next)
            onCheckedChange(next)
          }}
          className={cn(
            "relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ease-out",
            busy && "opacity-80",
            shown ? "bg-ally-500" : trackOff,
          )}
        >
          <motion.span
            aria-hidden
            className="absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow-sm"
            animate={{ x: shown ? 16 : 0 }}
            transition={thumbSpring}
          />
        </button>
      </div>
    </div>
  )
}