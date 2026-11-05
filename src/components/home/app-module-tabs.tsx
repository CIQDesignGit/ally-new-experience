"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"

const ALLY_BRAIN_HREF = "https://allybrain.web.app/#/"

const MODULES = [
  { id: "ally", label: "Home", href: ALLY_BRAIN_HREF, external: true },
  { id: "content", label: "Content", href: "/launchpad", external: false },
  { id: "ops", label: "Ops", href: "https://allybrain.web.app/#/ops", external: true },
  { id: "insights", label: "Insights", href: "https://allybrain.web.app/#/insights", external: true },
  { id: "media", label: "Media", href: null, external: false },
] as const

export { ALLY_BRAIN_HREF }

type ModuleId = (typeof MODULES)[number]["id"]

interface AppModuleTabsProps {
  /** Active module. Defaults to Content (this app). */
  active?: ModuleId
  className?: string
}

export function AppModuleTabs({ active = "content", className }: AppModuleTabsProps) {
  return (
    <nav
      aria-label="AllyBrain apps"
      className={cn("flex h-full items-stretch gap-5", className)}
    >
      {MODULES.map((item) => {
        const isActive = active === item.id
        const classNames = cn(
          "relative flex items-center text-[13px] tracking-wide transition-colors",
          "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:transition-colors",
          isActive
            ? "font-semibold text-slate-900 after:bg-slate-900"
            : item.href
              ? "font-medium text-slate-500 after:bg-transparent hover:text-slate-800 hover:after:bg-slate-300"
              : "cursor-not-allowed font-medium text-slate-300 after:bg-transparent",
        )

        if (!item.href) {
          return (
            <span key={item.id} aria-disabled title="Coming soon" className={classNames}>
              {item.label}
            </span>
          )
        }

        if (item.external) {
          return (
            <a
              key={item.id}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={classNames}
            >
              {item.label}
            </a>
          )
        }

        return (
          <Link
            key={item.id}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={classNames}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
