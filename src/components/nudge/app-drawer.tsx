"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, BookOpen, Home, LayoutDashboard, MessageSquare, PanelLeft, Presentation, Wand2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useNudge } from "./nudge-context"
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
  const [open, setOpen] = useState(defaultOpen ?? kind === "conversation")
  const { retro, knowledge, alerts, dashboards, decks, skills } = useNudge()
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

  const iconBtn = (on?: boolean) => cn("flex size-10 items-center justify-center rounded-lg", on ? "bg-slate-100 text-slate-950" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900")

  return (
    <aside
      aria-label="Ally"
      style={{ width: open ? OPEN_W : SHUT_W }}
      className="fixed inset-y-0 left-0 z-40 hidden flex-col overflow-hidden border-r border-slate-200 bg-slate-50 transition-[width] duration-200 xl:flex"
    >
      <div className={cn("flex h-16 shrink-0 items-center", open ? "justify-between px-4" : "justify-center")}>
        {open && <span className="text-[15px] font-semibold text-slate-950">Ally</span>}
        <button type="button" onClick={() => toggle()} aria-label={open ? "Collapse sidebar" : "Expand sidebar"} title={open ? "Collapse sidebar" : "Expand sidebar"} className={iconBtn()}>
          <PanelLeft className="size-4" />
        </button>
      </div>

      {open ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="px-2">
            <Link href={home} className={cn("flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm", path === home ? "bg-slate-100 font-semibold text-slate-950" : "text-slate-700 hover:bg-slate-50")}>
              <Home className="size-4 text-slate-500" /> Daily brief
            </Link>
          </div>
          {sections.map((sec) => (
            <div key={sec.title} className="mt-5 px-2">
              <div className="flex items-center gap-2 px-2.5 pb-1.5 text-xs font-medium text-slate-500">
                <sec.icon className="size-3.5" />
                {sec.title}
              </div>
              {sec.items.length ? (
                sec.items.map((it) => (
                  <Link key={it.label} href={it.href} className={cn("block rounded-lg px-2.5 py-2", it.on ? "bg-slate-100" : it.fresh ? "bg-brand-25 ring-1 ring-brand-200" : "hover:bg-slate-50")}>
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-slate-950">{it.label}</span>
                      {it.fresh && <span className="ml-auto shrink-0 text-xs font-semibold text-brand-700">New</span>}
                    </span>
                    {it.sub && <span className="block truncate text-xs text-slate-500">{it.sub}</span>}
                  </Link>
                ))
              ) : (
                <div className="px-2.5 py-1.5 text-[13px] text-slate-400">{sec.empty}</div>
              )}
            </div>
          ))}
          <div className="mt-auto border-t border-slate-100 px-2 py-3">
            <Link href="/settings?tab=knowledge" className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-slate-700 hover:bg-slate-50">
              <BookOpen className="size-4 text-slate-500" />
              <span className="flex-1">Knowledge</span>
              <span className="font-mono text-xs text-slate-400">{knowledge.length}</span>
            </Link>
          </div>
        </div>
      ) : (
        <nav className="flex flex-1 flex-col items-center gap-1">
          <Link href={home} aria-label="Daily brief" title="Daily brief" className={iconBtn(path === home)}>
            <Home className="size-4" />
          </Link>
          {/* Lists live in the open sidebar: an icon opens it. */}
          {sections.map((sec) => (
            <button key={sec.title} type="button" onClick={() => toggle(true)} aria-label={sec.fresh ? `${sec.title}: 1 new` : sec.title} title={sec.title} className={cn(iconBtn((sec.title === "Conversations" && path === "/michelle/retro") || (sec.title === "Dashboards" && path.startsWith("/michelle/dashboards")) || (sec.title === "Alerts" && path === "/michelle/alerts")), "relative")}>
              <sec.icon className="size-4" />
              {sec.fresh && <span aria-hidden className="absolute top-2 right-2 size-2 rounded-full bg-brand-500 ring-2 ring-slate-50" />}
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
