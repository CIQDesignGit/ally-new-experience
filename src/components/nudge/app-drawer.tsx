"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, BookOpen, Home, LayoutDashboard, MessageSquare, PanelLeft, Presentation, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useNudge } from "./nudge-context"
import { RETRO } from "./retro/prime-day"

/**
 * The drawer: a slim icon strip on the left of every page, opening to the
 * places a person works from. The daily brief first, then conversations and the
 * things they made. Lists only what exists, so nothing leads nowhere.
 */
export function AppDrawer({ home = "/michelle" }: { home?: string }) {
  const [open, setOpen] = useState(false)
  const path = usePathname()
  const { retro, knowledge } = useNudge()
  const started = Object.keys(retro).length > 0

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  const sections: { title: string; icon: typeof Home; items: { label: string; sub?: string; href: string; on?: boolean }[]; empty?: string }[] = [
    { title: "Conversations", icon: MessageSquare, items: started ? [{ label: RETRO.name, sub: retro.sentToClaire ? "Sent to Claire" : retro.deck ? "Deck built" : "Storyboard", href: "/michelle/retro", on: path === "/michelle/retro" }] : [], empty: "Ask Ally a new task to start one" },
    { title: "Reports and decks", icon: Presentation, items: retro.deck ? [{ label: RETRO.name, sub: retro.theme === "aurelle" ? "Aurelle Brand 2026" : "CommerceIQ default", href: "/michelle/retro?view=deck" }] : [], empty: "Decks you build show here" },
    { title: "Dashboards", icon: LayoutDashboard, items: retro.dashboard ? [{ label: RETRO.name, sub: "Live · refreshes daily", href: "/michelle/retro?view=deck" }] : [], empty: "Publish a deck or answers as a dashboard" },
    { title: "Alerts", icon: Bell, items: [], empty: "No custom alerts yet" },
  ]

  const rail: { label: string; icon: typeof Home; href?: string; on?: boolean }[] = [
    { label: "Daily brief", icon: Home, href: home, on: path === home },
    { label: "Conversations", icon: MessageSquare, on: path === "/michelle/retro" },
    { label: "Reports and decks", icon: Presentation },
    { label: "Dashboards", icon: LayoutDashboard },
    { label: "Alerts", icon: Bell },
    { label: "Knowledge", icon: BookOpen, href: "/settings?tab=knowledge" },
  ]

  return (
    <>
      <nav aria-label="Ally" className="fixed top-24 left-4 z-40 hidden flex-col items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-[0_8px_24px_-10px_rgba(15,23,42,0.2)] xl:flex">
        <button type="button" onClick={() => setOpen(true)} aria-label="Open the drawer" title="Open the drawer" className="flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-900">
          <PanelLeft className="size-4" />
        </button>
        <span className="my-1 h-px w-6 bg-slate-100" />
        {rail.map((r) =>
          r.href ? (
            <Link key={r.label} href={r.href} aria-label={r.label} title={r.label} className={cn("flex size-9 items-center justify-center rounded-lg", r.on ? "bg-slate-100 text-slate-950 ring-1 ring-slate-200" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900")}>
              <r.icon className="size-4" />
            </Link>
          ) : (
            <button key={r.label} type="button" onClick={() => setOpen(true)} aria-label={r.label} title={r.label} className={cn("flex size-9 items-center justify-center rounded-lg", r.on ? "bg-slate-100 text-slate-950 ring-1 ring-slate-200" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900")}>
              <r.icon className="size-4" />
            </button>
          ),
        )}
      </nav>

      {open && (
        <div className="fixed inset-0 z-50" onMouseDown={() => setOpen(false)}>
          <aside
            aria-label="Drawer"
            onMouseDown={(e) => e.stopPropagation()}
            className="absolute top-4 bottom-4 left-4 flex w-[300px] flex-col overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-[0_24px_60px_-20px_rgba(15,23,42,0.35)]"
          >
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <span className="text-[15px] font-semibold text-slate-950">Ally</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close the drawer" className="rounded-md p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700">
                <X className="size-4" />
              </button>
            </div>
            <div className="flex flex-col gap-1 px-2">
              <Link href={home} onClick={() => setOpen(false)} className={cn("flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm", path === home ? "bg-slate-100 font-semibold text-slate-950 ring-1 ring-slate-200" : "text-slate-700 hover:bg-slate-50")}>
                <Home className="size-4 text-slate-500" /> Daily brief
              </Link>
            </div>
            {sections.map((sec) => (
              <div key={sec.title} className="mt-4 px-2">
                <div className="flex items-center gap-2 px-2.5 pb-1.5 text-xs font-medium text-slate-500">
                  <sec.icon className="size-3.5" />
                  {sec.title}
                </div>
                {sec.items.length ? (
                  sec.items.map((it) => (
                    <Link key={it.label} href={it.href} onClick={() => setOpen(false)} className={cn("block rounded-lg px-2.5 py-2", it.on ? "bg-slate-100 ring-1 ring-slate-200" : "hover:bg-slate-50")}>
                      <span className="block text-sm font-medium text-slate-950">{it.label}</span>
                      {it.sub && <span className="block text-xs text-slate-500">{it.sub}</span>}
                    </Link>
                  ))
                ) : (
                  <div className="px-2.5 py-1.5 text-[13px] text-slate-400">{sec.empty}</div>
                )}
              </div>
            ))}
            <div className="mt-auto border-t border-slate-100 px-2 py-3">
              <Link href="/settings?tab=knowledge" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-slate-700 hover:bg-slate-50">
                <BookOpen className="size-4 text-slate-500" />
                <span className="flex-1">Knowledge</span>
                <span className="font-mono text-xs text-slate-400">{knowledge.length}</span>
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
