"use client"

import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react"
import Link from "next/link"
import { Check, ChevronRight, LogOut } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { RETAILER_PAGES } from "./retailer"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { PeriodSwitch, RetailerSwitch } from "./period-switch"
import { dayLabel } from "./claire/claire-actions"
import { useNudge } from "./nudge-context"

/** Ally's mark, redrawn as a vector from the brand file (public/ally-logo.png): hair and ring, two sparks and a streak. */
export function AllyLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="11 6 44 37" className={cn("h-8 w-auto", className)} role="img" aria-label="Ally">
      <defs>
        <linearGradient id="ally-streak" x1="21" y1="31" x2="38" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FAECFF" stopOpacity="0.2" />
          <stop offset="1" stopColor="#C231FF" />
        </linearGradient>
        <linearGradient id="ally-spark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#C231FF" />
          <stop offset="1" stopColor="#8613B8" />
        </linearGradient>
      </defs>
      <path d="M19.23 22.4 A15 15 0 1 1 21 32.5" fill="none" stroke="#210235" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M13.5 17.2c-.3-5 3.8-8.2 8.3-7.2 1.3.3 2.4.9 3.2 1.7-3.3 1.8-5 5.2-4.9 9.3.1 1.3.3 2.4.7 3.4-4.1-.5-7.1-3.2-7.3-7.2z" fill="#210235" />
      <path d="M21.2 22c.4-8.2 6.4-13.6 13.8-13.4 6.3.2 10.8 3.9 12.2 9-3.4-2.6-7.6-2.9-10.6-.9-3.9 2.6-7.3 5.9-15.4 8.4z" fill="#210235" />
      <path d="M21 31.5L38 24.7l.4 2.6z" fill="url(#ally-streak)" />
      {/* Two sparks, the eyes. A thin white edge keeps the second one from melting into the ring at small sizes. */}
      <path d="M37.6 18.4c.8 4.4 2.3 5.9 6.7 6.7-4.4.8-5.9 2.3-6.7 6.7-.8-4.4-2.3-5.9-6.7-6.7 4.4-.8 5.9-2.3 6.7-6.7z" fill="url(#ally-spark)" stroke="white" strokeWidth="1.2" paintOrder="stroke" />
      <path d="M45.6 18.4c.6 3.1 1.6 4.1 4.6 4.6-3 .6-4 1.6-4.6 4.6-.6-3-1.6-4-4.6-4.6 3-.5 4-1.5 4.6-4.6z" fill="url(#ally-spark)" stroke="white" strokeWidth="1.2" paintOrder="stroke" />
    </svg>
  )
}

export type Person = "claire" | "mike" | "michelle" | "james" | "sarah"

/** Illustrated people in the logo's style: no real faces. Each is a skin tone, a hair shape and a backdrop. */
const PEOPLE: Record<Person, { name: string; bg: string; skin: string; hair: string; style: "bob" | "short" | "long" }> = {
  claire: { name: "Claire Bennett", bg: "#EDE9FE", skin: "#F1C7A5", hair: "#5B3A29", style: "bob" },
  mike: { name: "Mike Chen", bg: "#DBEAFE", skin: "#E8B98F", hair: "#1F2937", style: "short" },
  michelle: { name: "Michelle Ortiz", bg: "#FCE7F3", skin: "#C98E68", hair: "#2B1B14", style: "long" },
  james: { name: "James Okafor", bg: "#DCFCE7", skin: "#8D5A3B", hair: "#1A1110", style: "short" },
  sarah: { name: "Sarah Kim", bg: "#FEF3C7", skin: "#EBC29E", hair: "#3B2416", style: "long" },
}

export function Avatar({ person, className }: { person: Person; className?: string }) {
  const p = PEOPLE[person]
  return (
    <svg viewBox="0 0 36 36" className={cn("size-9 rounded-full ring-1 ring-slate-200", className)} role="img" aria-label={p.name}>
      <title>{p.name}</title>
      <circle cx="18" cy="18" r="18" fill={p.bg} />
      {p.style === "long" && <path d="M8.5 17c0-6.8 4.2-10.8 9.5-10.8s9.5 4 9.5 10.8v10.5h-19z" fill={p.hair} />}
      {/* Shoulders */}
      <path d="M5 36c.8-6.6 6.2-10.4 13-10.4S30.2 29.4 31 36z" fill={person === "mike" ? "#1E3A8A" : person === "claire" ? "#6D28D9" : person === "james" ? "#166534" : person === "sarah" ? "#B45309" : "#9D174D"} />
      {/* Neck and head */}
      <rect x="15.2" y="20" width="5.6" height="6.4" rx="2.4" fill={p.skin} />
      <ellipse cx="18" cy="15.6" rx="6.3" ry="7" fill={p.skin} />
      {p.style === "bob" && <path d="M11.2 17.4c-1.2-6.6 2-10.8 6.8-10.8 5 0 8.2 4.2 6.8 10.8-.6-3.4-2.6-5.6-6.8-6-4.2.4-6.2 2.6-6.8 6z" fill={p.hair} />}
      {p.style === "short" && <path d="M11.6 14.2c0-4.8 2.8-7.6 6.4-7.6 3.8 0 6.6 2.6 6.4 7.4-1.4-2.4-3.8-3.2-6.6-3.2s-4.8.8-6.2 3.4z" fill={p.hair} />}
      {p.style === "long" && <path d="M11.6 15c.2-4.6 2.8-7.8 6.4-7.8s6.4 3.2 6.4 7.8c-1.8-2.4-4-3.6-6.4-3.6s-4.6 1.2-6.4 3.6z" fill={p.hair} />}
    </svg>
  )
}

/**
 * The avatar is the account menu: who's signed in (the presenter, whose inbox gets
 * Ally's emails) and Sign out, which returns to the sign-in page.
 */
/** The demo's people, as the account menu switches between them. */
const ROLES: Record<Person, string> = { claire: "VP Ecommerce", michelle: "Sales analyst", mike: "Content lead", james: "Media lead", sarah: "Retail expert · CommerceIQ" }

function AccountMenu({ person }: { person: Person }) {
  const [email, setEmail] = useState<string | null>(null)
  const router = useRouter()
  return (
    <DropdownMenu
      onOpenChange={(open) => {
        // The sign-in cookie is server-only, so ask the server who this is.
        if (open && !email)
          fetch("/api/session")
            .then((r) => r.json())
            .then((r: { email: string | null }) => setEmail(r.email))
            .catch(() => {})
      }}
    >
      <DropdownMenuTrigger aria-label="Account" className="ml-1 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-brand-300">
        <Avatar person={person} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-80 rounded-xl p-1.5 shadow-md ring-1 ring-slate-200/80">
        <div className="px-2.5 py-2">
          <div className="text-sm font-semibold text-slate-950">{PEOPLE[person].name}</div>
          <div className="mt-0.5 truncate text-xs text-slate-500">{email ? `Signed in as ${email}` : "\u00a0"}</div>
        </div>
        <DropdownMenuSeparator />
        <div className="px-2.5 pt-1.5 pb-1 text-xs font-medium text-slate-500">View as</div>
        {(["claire", "michelle", "mike", "james", "sarah"] as const).map((p) => (
          <DropdownMenuItem key={p} onClick={() => router.push(HOMES[p])} className="gap-2.5 px-2.5 py-2 text-sm">
            <Avatar person={p} className="size-7" />
            <span className="flex-1">
              <span className="block font-medium text-slate-950">{PEOPLE[p].name}</span>
              <span className="block text-xs text-slate-500">{ROLES[p]}</span>
            </span>
            {p === person && <Check className="size-4 text-brand-600" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            await fetch("/api/session", { method: "DELETE" }).catch(() => {})
            // A full load, so the sign-in page starts clean.
            window.location.href = "/login"
          }}
          className="gap-2.5 px-2.5 py-2 text-sm"
        >
          <LogOut className="size-4 text-slate-500" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const HOMES: Record<Person, string> = { claire: "/claire-waterfall", mike: "/mike", michelle: "/michelle", james: "/james", sarah: "/sarah" }
const VIEWER_KEY = "ally-viewer-home"

/**
 * Whose view you're in: the last home page you were on. Shared pages (Scheduled,
 * decks, dashboards, Teach Ally) use it, so Claire stays Claire when she opens one.
 */
export function rememberHome(path: string) {
  if (!Object.values(HOMES).includes(path)) return
  try {
    window.sessionStorage.setItem(VIEWER_KEY, path)
  } catch {}
}
export function rememberedHome(): string | null {
  try {
    return window.sessionStorage.getItem(VIEWER_KEY)
  } catch {
    return null
  }
}

/**
 * Who's looking at a page. A link from someone else's page carries ?from=claire,
 * so the page isn't their home: the strip shows a breadcrumb back instead of a greeting.
 */
export function useViewer(owner: Person): { viewer: Person; visiting: boolean; home: string } {
  const [from, setFrom] = useState<Person | null>(null)
  useEffect(() => {
    // A link's ?from wins; else, on a shared page, whoever's home you came from.
    const q = new URLSearchParams(window.location.search).get("from") as Person | null
    const onHome = Object.values(HOMES).includes(window.location.pathname)
    const saved = onHome ? null : (Object.entries(HOMES).find(([, h]) => h === rememberedHome())?.[0] as Person | undefined)
    const f = q ?? saved ?? null
    const t = window.setTimeout(() => f && f in HOMES && f !== owner && setFrom(f), 0)
    return () => window.clearTimeout(t)
  }, [owner])
  const viewer = from ?? owner
  return { viewer, visiting: !!from, home: HOMES[viewer] }
}

export interface Crumb {
  label: string
  href?: string
  onClick?: () => void
}

interface TopStripProps {
  person: Person
  /** Home pages: "Hi Claire". Any other screen passes crumbs instead (the first one is the way back). */
  greeting?: string
  crumbs?: Crumb[]
  /** Show the period switch (only where the numbers follow it). */
  period?: boolean
  /** Short facts after the period, home pages only (an analyst's KPIs). */
  facts?: React.ReactNode
  /** Page controls, just before the global icons (Michelle's Business | Ops). */
  controls?: React.ReactNode
  /** Global icons that differ by page (Claire's email and team bell; Mike's bell); the gear is always last. */
  icons?: React.ReactNode
  /** The person's home (kept for callers; the breadcrumb's first step links there). */
  home?: string
  /** Side padding, to line up with the page's content. */
  className?: string
}

const Sep = () => <span className="text-slate-300">·</span>

/**
 * The glance metrics. They get whatever room is left on the row, and a metric
 * either fits whole or drops out (last first, with its separator): never cut mid-number.
 */
function Facts({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null)
  useLayoutEffect(() => {
    const box = ref.current
    const row = box?.parentElement
    if (!box || !row) return
    const fit = () => {
      const items = [...box.children] as HTMLElement[]
      items.forEach((el) => (el.style.display = ""))
      box.style.display = ""
      const limit = row.getBoundingClientRect().right
      let cut = items.findIndex((el) => el.getBoundingClientRect().right > limit + 0.5)
      if (cut === -1) return
      // Don't leave a separator dangling at the end.
      while (cut > 0 && items[cut - 1].textContent?.trim() === "·") cut--
      items.slice(cut).forEach((el) => (el.style.display = "none"))
      if (cut <= 1) box.style.display = "none"
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(row)
    return () => ro.disconnect()
  }, [children])
  return (
    <span ref={ref} className="flex shrink-0 items-center gap-x-2">
      <Sep />
      {children}
    </span>
  )
}

/**
 * The one top strip, the same on every page: brand, where you are, the period,
 * then page controls, the global icons and who's signed in. Home pages greet;
 * every other screen shows a breadcrumb whose first step is the way back.
 */
export function TopStrip({ person, greeting, crumbs, period, facts, controls, icons, className }: TopStripProps) {
  return (
    // Always one row: the left side never wraps; when it runs out of room, whole metrics drop from the end.
    <header className={cn("flex h-[72px] items-center justify-between gap-6 px-10 pt-4", className)}>
      <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-x-2 overflow-hidden text-sm whitespace-nowrap text-slate-500">
        {/* No logo: the strip starts with where you are (the greeting, or the breadcrumb home). AllyLogo stays available above. */}
        {crumbs?.length ? (
          <nav aria-label="Breadcrumb" className="flex shrink-0 items-center gap-1.5">
            {crumbs.map((c, i) => {
              const last = i === crumbs.length - 1
              const cls = last ? "font-semibold text-slate-950" : "text-slate-500 hover:text-brand-700 hover:underline"
              return (
                <Fragment key={c.label}>
                  {i > 0 && <ChevronRight className="size-3.5 text-slate-300" />}
                  {last ? (
                    <span className={cls}>{c.label}</span>
                  ) : c.href ? (
                    <Link href={c.href} className={cls}>
                      {c.label}
                    </Link>
                  ) : (
                    <button type="button" onClick={c.onClick} className={cls}>
                      {c.label}
                    </button>
                  )}
                </Fragment>
              )
            })}
          </nav>
        ) : (
          <span className="shrink-0">{greeting}</span>
        )}
        {period && (
          <>
            <RetailerPart />
            <Sep />
            <PeriodSwitch />
            <Sep />
            <Today />
          </>
        )}
        {facts && <Facts>{facts}</Facts>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {controls && <div className="mr-2 flex items-center">{controls}</div>}
        {icons}
        <AccountMenu person={person} />
      </div>
    </header>
  )
}

/** Today, from the demo clock ("Next check-in" moves it), so the audience sees the day change. */
function Today() {
  const { day } = useNudge()
  return <span className="shrink-0 text-slate-500 tabular-nums">{dayLabel(day)}</span>
}

/** The retailer switch and its separator, only where the numbers follow it. */
function RetailerPart() {
  const path = usePathname()
  if (!RETAILER_PAGES.includes(path)) return null
  return (
    <>
      <Sep />
      <RetailerSwitch />
    </>
  )
}
