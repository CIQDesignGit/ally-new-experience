"use client"

import {
  BellRing,
  Calculator,
  ChevronUp,
  ChevronsLeft,
  FileSearch,
  FileText,
  Mail,
  Network,
  Puzzle,
  ScanSearch,
  Search,
  Settings,
  Sparkles,
  Star,
  Store,
  Trophy,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useExperienceMode } from "@/lib/experience-mode"

type NavItem = {
  label: string
  icon: LucideIcon
  href?: string
  isNew?: boolean
}

const main: NavItem[] = [
  { label: "Command Center", icon: Network },
  { label: "Business Overview", icon: Store },
  { label: "Recommendations", icon: BellRing },
  { label: "Agentspace", icon: Sparkles, href: "/claire-waterfall" },
  { label: "News Feed & Alerts", icon: Mail, isNew: true },
  { label: "Reports", icon: FileText, isNew: true },
]

const groups: { title: string; items: NavItem[] }[] = [
  { title: "Strategy & Planning", items: [{ label: "Category Leaderboard", icon: Trophy }] },
  {
    title: "Digital Shelf",
    items: [
      { label: "Market Insights", icon: ScanSearch },
      { label: "Price War", icon: Zap },
      { label: "Content Scorecard", icon: Calculator },
    ],
  },
  { title: "Supply Chain", items: [{ label: "Profit Recovery Overview", icon: FileSearch }] },
]

const utilityNav: NavItem[] = [
  { label: "Tools and Settings", icon: Wrench },
  { label: "Chrome Plugin", icon: Puzzle },
]

function NavRow({ item }: { item: NavItem }) {
  const pathname = usePathname()
  const active = item.href != null && item.href === pathname
  const Icon = item.icon
  const className = cn(
    "relative flex w-full items-center gap-3 px-4 py-2 text-left type-body transition-colors",
    active ? "bg-slate-700 text-white" : "text-slate-100 hover:bg-slate-700/60",
  )
  const content = (
    <>
      {active && <span className="absolute inset-y-0 left-0 w-1 bg-blue-500" aria-hidden />}
      <Icon className="size-4 shrink-0" aria-hidden />
      <span className="flex-1 truncate">{item.label}</span>
      {item.isNew && <span className="rounded-full bg-emerald-600 px-2 type-caption-strong text-white">NEW</span>}
    </>
  )

  if (item.href) {
    return (
      <Link href={item.href} aria-current={active ? "page" : undefined} className={className}>
        {content}
      </Link>
    )
  }

  return (
    <button type="button" className={className}>
      {content}
    </button>
  )
}

function OldExperienceFooterToggle() {
  const { setMode } = useExperienceMode()
  return (
    <label className="flex cursor-pointer items-center justify-between gap-2 px-4 py-2 type-caption transition-colors">
      <span className="min-w-0 flex-1 leading-snug text-slate-300">Try the new experience</span>
      <button
        type="button"
        role="switch"
        aria-checked={false}
        aria-label="Turn on to try the new Ally experience"
        onClick={() => setMode("new")}
        className="relative h-5 w-9 shrink-0 scale-75 rounded-full bg-slate-600 transition-colors"
      >
        <span aria-hidden className="absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow-sm" />
      </button>
    </label>
  )
}

/** Classic CommerceIQ left rail (from alerts-skill-customization). */
export function OldExperienceSidebar() {
  return (
    <aside className="relative flex h-screen w-64 shrink-0 flex-col bg-slate-800 text-white">
      <button
        type="button"
        aria-label="Collapse sidebar"
        className="absolute top-3 -right-3 z-10 flex size-6 items-center justify-center rounded-full bg-blue-500"
      >
        <ChevronsLeft className="size-4" aria-hidden />
      </button>

      <div className="px-4 pt-3">
        <div className="text-xl font-semibold">
          Commerce<span className="text-sky-400">IQ</span>
        </div>
        <p className="mt-3 type-caption text-slate-300">Region &amp; Retailer</p>
        <div className="mt-1 flex items-center justify-between rounded bg-slate-600 px-3 py-1.5 type-body">
          <span>🇺🇸 US Amazon</span>
          <Settings className="size-4" aria-hidden />
        </div>
      </div>

      <button type="button" className="mt-3 flex items-center gap-3 px-4 py-2 type-body text-slate-100">
        <Search className="size-4" aria-hidden />
        Search for SKUs
      </button>

      <div className="px-4 pt-3 pb-3">
        <p className="type-caption-strong text-amber-400 uppercase">My workspace</p>
        <p className="mt-1 flex items-center gap-1 type-caption text-slate-300">
          <Star className="size-3" aria-hidden />
          Star any page for easy access.
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto border-t border-slate-600 py-2">
        {main.map((item) => (
          <NavRow key={item.label} item={item} />
        ))}
        {groups.map((group) => (
          <div key={group.title} className="pt-2">
            <div className="flex items-center justify-between px-4 py-1.5">
              <span className="type-caption-strong text-cyan-400 uppercase">{group.title}</span>
              <ChevronUp className="size-4 text-cyan-400" aria-hidden />
            </div>
            {group.items.map((item) => (
              <NavRow key={item.label} item={item} />
            ))}
          </div>
        ))}
        {utilityNav.map((item) => (
          <NavRow key={item.label} item={item} />
        ))}
      </nav>

      <div className="shrink-0 border-t border-slate-600 py-2">
        <OldExperienceFooterToggle />
      </div>
    </aside>
  )
}
