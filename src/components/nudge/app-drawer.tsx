"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, BookOpen, Home, LayoutDashboard, MessageSquare, PanelLeft, Pin, PinOff, Presentation, TrendingDown, Wand2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useNudge } from "./nudge-context"
import { AUTOPILOT_GO_LIVE, fmtValue } from "./data"
import { useLive } from "./live-model"
import { shortDate } from "./model"
import { RETRO } from "./retro/prime-day"

const OPEN_W = "264px"
const SHUT_W = "64px"

/**
 * The sidebar, like Claude's: a real left column that pushes the page over.
 * Collapsed to icons on the daily brief (the page is the work); open on a
 * conversation, where what you made is what you move between. Lists only what exists, so nothing leads nowhere.
 */
export function AppDrawer({ home = "/michelle", defaultOpen }: { home?: string; /** Overrides the page-kind default, e.g. collapsed while a deck is open. */ defaultOpen?: boolean }) {
  const path = usePathname()
  const kind = path === home ? "brief" : "conversation"
  // Pinned stays open everywhere; unpinned closes on its own a few seconds after the pointer leaves it.
  const [pinned, setPinned] = useState(false)
  const [open, setOpen] = useState(defaultOpen ?? kind === "conversation")
  // Read after mount, so the server and the first client render agree.
  useEffect(() => {
    const t = window.setTimeout(() => {
      try {
        if (window.localStorage.getItem("ally-drawer-pinned") === "1") {
          setPinned(true)
          setOpen(true)
        }
      } catch {}
    }, 0)
    return () => window.clearTimeout(t)
  }, [])
  const timer = useRef<number | undefined>(undefined)
  const hovering = useRef(false)
  const scheduleClose = () => {
    window.clearTimeout(timer.current)
    if (pinned) return
    timer.current = window.setTimeout(() => {
      if (!hovering.current) setOpen(false)
    }, 3000)
  }
  useEffect(() => {
    if (open && !pinned) scheduleClose()
    return () => window.clearTimeout(timer.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pinned])
  function pin(next: boolean) {
    setPinned(next)
    try {
      window.localStorage.setItem("ally-drawer-pinned", next ? "1" : "0")
    } catch {}
    if (next) setOpen(true)
  }
  const { retro, knowledge, alerts, dashboards, decks, skills, conversations } = useNudge()
  const qbr = decks.qbr
  // Being on the conversation counts as started, even before its state has loaded.
  const started = Object.keys(retro).length > 0 || path === "/michelle/retro"

  function toggle(next = !open) {
    setOpen(next)
  }

  // The page makes room for the sidebar instead of sitting under it (xl and up, where it shows).
  useEffect(() => {
    const root = document.documentElement
    const wide = window.matchMedia("(min-width: 1280px)")
    const apply = () => {
      const w = wide.matches ? (open ? OPEN_W : SHUT_W) : "0px"
      root.style.setProperty("--sidebar-w", w)
      document.body.style.paddingLeft = w
    }
    apply()
    wide.addEventListener("change", apply)
    return () => {
      wide.removeEventListener("change", apply)
      root.style.removeProperty("--sidebar-w")
      document.body.style.paddingLeft = ""
    }
  }, [open])

  // Something just made (a published dashboard) is flagged until it's opened, even with the sidebar collapsed.
  const fresh = !!retro.dashboard && !retro.dashboardSeen

  const sections: { title: string; icon: typeof Home; items: { label: string; sub?: string; href: string; on?: boolean; fresh?: boolean }[]; empty: string; fresh?: boolean }[] = [
    {
      title: "Conversations",
      icon: MessageSquare,
      items: [
        ...(started ? [{ label: RETRO.name, sub: retro.sentToClaire ? "Sent to Claire" : retro.deck ? "Deck built" : retro.stage === "storyline" ? "Storyline" : "Storyboard", href: "/michelle/retro", on: path === "/michelle/retro" }] : []),
        // Every conversation in this person's history, newest first: where it was asked and when.
        ...conversations.filter((c) => c.home === home).map((c) => ({ label: c.title, sub: `${c.where} · ${c.at}`, href: c.href, on: path === c.href.split("?")[0] })),
        ...(qbr || path === "/michelle/decks/qbr" ? [{ label: "Q4 business review", sub: qbr?.sentToClaire ? "Sent to Claire" : qbr?.deck ? "Deck built" : qbr?.stage === "storyboard" ? "Storyboard" : "Storyline", href: "/michelle/decks/qbr", on: path === "/michelle/decks/qbr" }] : []),
      ],
      empty: "Ask Ally a new task to start one",
    },
    {
      title: "Reports and decks",
      icon: Presentation,
      items: [
        ...(retro.deck ? [{ label: RETRO.name, sub: retro.theme === "aurelle" ? "Aurelle Brand 2026" : "CommerceIQ default", href: "/michelle/retro?view=deck" }] : []),
        ...(qbr?.deck ? [{ label: "Q4 business review", sub: qbr.repeat ? "Every Monday · On autopilot" : qbr.theme === "aurelle" ? "Aurelle Brand 2026" : "CommerceIQ default", href: "/michelle/decks/qbr?view=deck" }] : []),
      ],
      empty: "Decks you build show here",
    },
    {
      title: "Dashboards",
      icon: LayoutDashboard,
      fresh: fresh || dashboards.some((d) => !d.seen),
      items: [
        ...(retro.dashboard ? [{ label: RETRO.name, sub: "Live · refreshes daily", href: "/michelle/dashboards/prime-day", on: path === "/michelle/dashboards/prime-day", fresh }] : []),
        ...dashboards.map((d) => ({ label: d.name, sub: `${d.widgets.length} widgets · saved from chat`, href: `/michelle/dashboards/${d.id}`, on: path === `/michelle/dashboards/${d.id}`, fresh: !d.seen })),
      ],
      empty: "Publish a deck or answers as a dashboard",
    },
    { title: "Skills", icon: Wand2, items: skills.map((k) => ({ label: k.name, sub: `Say "open my negotiation prep" · ${k.shared === "me" ? "only you" : k.shared === "team" ? "your team" : "everyone"}`, href: "/michelle" })), empty: "Skills you teach Ally show here" },
    { title: "Alerts", icon: Bell, fresh: alerts.some((a) => !a.seen), items: alerts.map((a) => ({ label: a.name, sub: a.firing ? "Fired today" : "Watching", href: "/michelle/alerts", on: path === "/michelle/alerts", fresh: !a.seen })), empty: "No custom alerts yet" },
  ]

  const iconBtn = (on?: boolean) => cn("flex size-10 items-center justify-center rounded-lg", on ? "bg-brand-400 text-white" : "text-brand-200 hover:bg-white/10 hover:text-white")

  return (
    <aside
      aria-label="Ally"
      style={{ width: open ? OPEN_W : SHUT_W }}
      onMouseEnter={() => {
        hovering.current = true
        window.clearTimeout(timer.current)
      }}
      onMouseLeave={() => {
        hovering.current = false
        if (open) scheduleClose()
      }}
      className="fixed inset-y-0 left-0 z-40 hidden flex-col overflow-hidden bg-brand-950 transition-[width] duration-200 xl:flex"
    >
      <div className={cn("flex h-16 shrink-0 items-center", open ? "justify-between px-4" : "justify-center")}>
        {open && <span className="text-[15px] font-semibold text-white">Ally</span>}
        <span className="flex items-center gap-0.5">
          {open && (
            <button type="button" onClick={() => pin(!pinned)} aria-pressed={pinned} aria-label={pinned ? "Unpin sidebar" : "Pin sidebar open"} title={pinned ? "Unpin sidebar" : "Pin sidebar open"} className={iconBtn(pinned)}>
              {pinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              // Collapsing by hand also unpins: the person asked for it closed.
              if (open && pinned) pin(false)
              toggle()
            }}
            aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
            title={open ? "Collapse sidebar" : "Expand sidebar"}
            className={iconBtn()}
          >
            <PanelLeft className="size-4" />
          </button>
        </span>
      </div>

      {open ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="px-2">
            <Link href={home} className={cn("flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm", path === home ? "bg-brand-400 font-semibold text-white" : "text-brand-100 hover:bg-white/10")}>
              <Home className="size-4" /> Daily brief
            </Link>
            {/* Where the business stands against plan: always there, not something made in a chat. */}
            <Link href="/michelle/gap" className={cn("mt-0.5 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm", path === "/michelle/gap" ? "bg-brand-400 font-semibold text-white" : "text-brand-100 hover:bg-white/10")}>
              <TrendingDown className="size-4" /> Gap to plan
            </Link>
          </div>
          {sections.map((sec) => (
            <div key={sec.title} className="mt-5 px-2">
              <div className="flex items-center gap-2 px-2.5 pb-1.5 text-xs font-medium text-brand-300">
                <sec.icon className="size-3.5" />
                {sec.title}
              </div>
              {sec.items.length ? (
                sec.items.map((it) => (
                  <Link key={it.label} href={it.href} className={cn("block rounded-lg px-2.5 py-2", it.on ? "bg-brand-400" : it.fresh ? "bg-ally-500/15 ring-1 ring-ally-300/40" : "hover:bg-white/10")}>
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-white">{it.label}</span>
                      {it.fresh && <span className="ml-auto shrink-0 text-xs font-semibold text-ally-300">New</span>}
                    </span>
                    {it.sub && <span className="block truncate text-xs text-brand-200">{it.sub}</span>}
                  </Link>
                ))
              ) : (
                <div className="px-2.5 py-1.5 text-[13px] text-brand-300">{sec.empty}</div>
              )}
            </div>
          ))}
          <div className="mt-auto px-3 pb-2">
            <AllyWorking />
          </div>
          <div className="border-t border-white/10 px-2 py-3">
            <Link href="/settings?tab=knowledge" className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-brand-100 hover:bg-white/10">
              <BookOpen className="size-4" />
              <span className="flex-1">Knowledge</span>
              <span className="font-mono text-xs text-brand-300">{knowledge.length}</span>
            </Link>
          </div>
        </div>
      ) : (
        <nav className="flex flex-1 flex-col items-center gap-1">
          <Link href={home} aria-label="Daily brief" title="Daily brief" className={iconBtn(path === home)}>
            <Home className="size-4" />
          </Link>
          <Link href="/michelle/gap" aria-label="Gap to plan" title="Gap to plan" className={iconBtn(path === "/michelle/gap")}>
            <TrendingDown className="size-4" />
          </Link>
          {/* Lists live in the open sidebar: an icon opens it. */}
          {sections.map((sec) => (
            <button key={sec.title} type="button" onClick={() => toggle(true)} aria-label={sec.fresh ? `${sec.title}: 1 new` : sec.title} title={sec.title} className={cn(iconBtn((sec.title === "Conversations" && (path === "/michelle/retro" || path.startsWith("/michelle/c/") || path.startsWith("/c/"))) || (sec.title === "Dashboards" && path.startsWith("/michelle/dashboards")) || (sec.title === "Alerts" && path === "/michelle/alerts")), "relative")}>
              <sec.icon className="size-4" />
              {sec.fresh && <span aria-hidden className="absolute top-2 right-2 size-2 rounded-full bg-ally-500 ring-2 ring-brand-950" />}
            </button>
          ))}
          <Link href="/settings?tab=knowledge" aria-label="Knowledge" title="Knowledge" className={cn(iconBtn(), "mt-auto mb-3")}>
            <BookOpen className="size-4" />
          </Link>
        </nav>
      )}
    </aside>
  )
}

/** Ally's work in flight, at the foot of the rail: what's on autopilot and when it goes live. Real numbers, from the waterfall. */
function AllyWorking() {
  const { stages } = useLive()
  const auto = stages.find((s) => s.id === "autopilot")
  if (!auto || auto.value <= 0) return null
  return (
    <div className="rounded-lg bg-white/5 px-3 py-2.5 ring-1 ring-white/10">
      <div className="flex items-center gap-2 text-[13px] font-semibold text-white">
        <span className="size-2 animate-pulse rounded-full bg-success-500" aria-hidden /> Ally is working
      </div>
      <div className="mt-1 text-xs text-brand-200">
        <span className="font-mono text-white">{fmtValue(auto.value)}</span> on autopilot · goes live {shortDate(AUTOPILOT_GO_LIVE)}
      </div>
    </div>
  )
}
