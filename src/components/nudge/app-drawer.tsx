"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, ClipboardList, Clock, GraduationCap, Home, LayoutDashboard, MessageSquare, PanelLeft, Pin, PinOff, Presentation, Sparkles, TrendingDown, Wand2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useNudge } from "./nudge-context"
import { rememberHome, rememberedHome } from "./top-strip"
import { BUSINESS, contentBatches, fmtBiz, fmtValue, launchedIds, opsBatches } from "./data"
import { useLive } from "./live-model"
import { RETRO } from "./retro/prime-day"
import { MEDIA_BATCHES } from "./media/data"
import { INBOX } from "./cs/data"

const OPEN_W = "264px"
const SHUT_W = "64px"

/**
 * The sidebar, like Claude's: a real left column that pushes the page over.
 * Collapsed to icons on the daily brief (the page is the work); open on a
 * conversation, where what you made is what you move between. Lists only what exists, so nothing leads nowhere.
 */
export function AppDrawer({ home: homeProp, defaultOpen }: { home?: string; /** Overrides the page-kind default, e.g. collapsed while a deck is open. */ defaultOpen?: boolean }) {
  const path = usePathname()
  // On a home page, that person's nav (and remember it); on a shared page, the page's own owner if it names one, else whoever you came from.
  const [saved, setSaved] = useState<string | null>(null)
  useEffect(() => {
    rememberHome(path)
    const t = window.setTimeout(() => setSaved(rememberedHome()), 0)
    return () => window.clearTimeout(t)
  }, [path])
  const home = ["/claire-waterfall", "/mike", "/michelle", "/james", "/sarah"].includes(path) ? path : (homeProp ?? saved ?? "/michelle")
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
  const aside = useRef<HTMLElement>(null)
  // The pointer can already be on the rail when a page opens (after a click in it), with no mouseenter yet: ask the element.
  const pointerOn = () => hovering.current || !!aside.current?.matches(":hover")
  /** Closes after the pointer leaves (quickly) or a while after opening without a hover (slower). */
  const scheduleClose = (ms = 800) => {
    window.clearTimeout(timer.current)
    if (pinned) return
    timer.current = window.setTimeout(() => {
      if (!pointerOn()) setOpen(false)
    }, ms)
  }
  useEffect(() => {
    if (open && !pinned) scheduleClose(3000)
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
  const { retro, alerts, dashboards, decks, skills, conversations, approved, policy, launchReady, period, callItems } = useNudge()
  const qbr = decks.qbr
  // Being on the conversation counts as started, even before its state has loaded.
  const started = Object.keys(retro).length > 0 || path === "/michelle/retro"

  function toggle(next = !open) {
    setOpen(next)
  }

  // The page always makes room, so nothing is covered; it slides in step with the rail (same 200ms), so nothing jumps (xl and up, where it shows).
  useEffect(() => {
    const root = document.documentElement
    const wide = window.matchMedia("(min-width: 1280px)")
    const apply = () => {
      const w = wide.matches ? (open ? OPEN_W : SHUT_W) : "0px"
      root.style.setProperty("--sidebar-w", w)
      document.body.style.transition = "padding-left 200ms ease"
      document.body.style.paddingLeft = w
    }
    apply()
    wide.addEventListener("change", apply)
    return () => {
      wide.removeEventListener("change", apply)
      root.style.removeProperty("--sidebar-w")
      document.body.style.paddingLeft = ""
      document.body.style.transition = ""
    }
  }, [open])

  // Something just made (a published dashboard) is flagged until it's opened, even with the sidebar collapsed.
  const fresh = !!retro.dashboard && !retro.dashboardSeen

  const sections: { title: string; icon: typeof Home; items: { label: string; sub?: string; href: string; on?: boolean; fresh?: boolean }[]; empty: string; fresh?: boolean }[] = [
    {
      title: "Conversations",
      icon: MessageSquare,
      items: [
        ...(started && home === "/michelle" ? [{ label: RETRO.name, sub: retro.sentToClaire ? "Sent to Claire" : retro.deck ? "Deck built" : retro.stage === "storyline" ? "Storyline" : "Storyboard", href: "/michelle/retro", on: path === "/michelle/retro" }] : []),
        // Every conversation in this person's history, newest first: where it was asked and when.
        // Selected only when you're in that conversation (a question reopened on a home page isn't "here").
        ...conversations.filter((c) => c.home === home).map((c) => ({ label: c.title, sub: `${c.where} · ${c.at}`, href: c.href, on: c.href.startsWith("/c/") && path === c.href })),
        ...(home === "/michelle" && (qbr || path === "/michelle/decks/qbr") ? [{ label: "Q4 business review", sub: qbr?.sentToClaire ? "Sent to Claire" : qbr?.deck ? "Deck built" : qbr?.stage === "storyboard" ? "Storyboard" : "Storyline", href: "/michelle/decks/qbr", on: path === "/michelle/decks/qbr" }] : []),
      ],
      empty: "Ask Ally a new task to start one",
    },
    {
      title: "Reports and decks",
      icon: Presentation,
      // Claire sees what Michelle has sent her, the moment she sends it; Michelle sees what she built.
      items: home === "/sarah" ? [
        { label: "Recap · Oct 2 call", sub: "Saved to context", href: "/sarah/recap", on: path === "/sarah/recap" },
        { label: "Aurelle weekly session", sub: "Prep for Thu, 2:00 PM", href: "/sarah/prep", on: path === "/sarah/prep" },
        { label: "AI visibility", sub: "Readout · Oct 5", href: "/reports/ai-visibility", on: path === "/reports/ai-visibility" },
      ] : home === "/claire-waterfall" ? [
        { label: "Your plan with CommerceIQ", sub: "From Sarah Kim", href: "/plan", on: path === "/plan" },
        ...(retro.sentToClaire ? [{ label: RETRO.name, sub: "From Michelle", href: "/michelle/retro?view=deck" }] : []),
        ...(qbr?.sentToClaire ? [{ label: "Q4 business review", sub: qbr.repeat ? "From Michelle · every Monday" : "From Michelle", href: "/michelle/decks/qbr?view=deck" }] : []),
      ] : [
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

  const iconBtn = (on?: boolean) => cn("relative flex size-10 items-center justify-center rounded-lg", on ? "bg-brand-400 text-white" : "text-brand-200 hover:bg-white/10 hover:text-white")
  const row = (on?: boolean) => cn("flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm", on ? "bg-brand-400 font-semibold text-white" : "text-brand-100 hover:bg-white/10 hover:text-white")

  // Live badges: the gap to plan, and how much is waiting on one approval for this person.
  const live = useLive()
  const gap = BUSINESS[period].plan - live.pace(period)
  const waiting =
    home === "/mike"
      ? contentBatches(policy, launchedIds(approved), launchReady).filter((b) => b.tier === "approval" && !approved[b.id]).length
      : home === "/michelle"
        ? opsBatches(policy).filter((b) => b.tier === "approval" && !approved[b.id]).length
        : home === "/james"
          ? MEDIA_BATCHES.filter((b) => b.tier === "approval" && !approved[b.id]).length
          : home === "/sarah"
            ? INBOX.filter((c) => c.kind === "approval" && !callItems[c.id]).length
          : live.approval.rows.filter((r) => (r.valueM ?? 0) > 0).length

  // Lists open in place; only Ask Ally shows its recent items without a click.
  const [openList, setOpenList] = useState<string | null>(path.startsWith("/c/") ? "Ask Ally" : null)
  const [allChats, setAllChats] = useState(false)
  const lists = sections.filter((x) => x.title !== "Conversations")
  const chats = sections.find((x) => x.title === "Conversations")!
  const LIST_ICON: Record<string, typeof Home> = { "Reports and decks": Presentation, Dashboards: LayoutDashboard, Skills: Wand2, Scheduled: Clock }
  const groups = [[lists[0], lists[1]]]
  const newChat = () => document.querySelector<HTMLInputElement>('input[placeholder="What can I take off your plate?"]')?.focus()
  // Groups are separated by space, not lines.
  const divider = <div className="h-4" aria-hidden />

  const listBlock = (sec: (typeof sections)[number], label = sec.title) => {
    const Icon = LIST_ICON[label] ?? sec.icon
    const isOpen = openList === label
    return (
      <div key={label}>
        <button type="button" onClick={() => setOpenList(isOpen ? null : label)} aria-expanded={isOpen} className={cn(row(), "w-full")}>
          <Icon className="size-4" />
          <span className="flex-1 text-left">{label}</span>
          {sec.fresh && <span className="size-2 rounded-full bg-ally-500" aria-label="New" />}
          {sec.items.length > 0 && <span className="font-mono text-xs text-brand-300">{sec.items.length}</span>}
        </button>
        {isOpen && (
          <div className="mb-1 pl-7">
            {sec.items.map((it) => (
              <Link key={it.label} href={it.href} className={cn("block rounded-lg px-2.5 py-1.5", it.on ? "bg-brand-400" : "hover:bg-white/10")}>
                <span className="block truncate text-[13px] text-white">{it.label}</span>
                {it.sub && <span className="block truncate text-xs text-brand-200">{it.sub}</span>}
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <aside
      ref={aside}
      aria-label="Ally"
      style={{ width: open ? OPEN_W : SHUT_W }}
      onMouseEnter={() => {
        hovering.current = true
        window.clearTimeout(timer.current)
        // Opens on hover after a short pause, so a pointer passing across doesn't flicker it.
        if (!open) timer.current = window.setTimeout(() => hovering.current && setOpen(true), 200)
      }}
      onMouseLeave={() => {
        hovering.current = false
        if (open) scheduleClose()
        else window.clearTimeout(timer.current)
      }}
      className={cn("fixed inset-y-0 left-0 z-50 hidden flex-col overflow-hidden bg-brand-950 transition-[width] duration-200 xl:flex")}
    >
      <div className={cn("flex h-16 shrink-0 items-center", open ? "justify-between pr-2 pl-4" : "justify-center")}>
        {open && (
          <span className="flex items-center gap-2 text-[15px] font-semibold text-white">
            <span className="flex size-6 items-center justify-center rounded-md bg-ally-500">
              <Sparkles className="size-3.5 text-white" />
            </span>
            Ally
          </span>
        )}
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
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-2 pb-2">
          {/* The work: what needs you today. */}
          <Link href={home} className={row(path === home)}>
            <Home className="size-4" /> <span className="flex-1">Today</span>
            {/* What's waiting on one approval: owners' rows for Claire, items in the queue for Mike and Michelle. */}
            {waiting > 0 && <span className="rounded-full bg-ally-500 px-1.5 text-[11px] font-semibold text-white">{waiting}</span>}
          </Link>
          {/* The plan agreed between the brand and CommerceIQ, for everyone on the account (Sarah's view for CS). */}
          <Link href="/plan" className={row(path === "/plan")}>
            <ClipboardList className="size-4" /> <span className="flex-1">Joint plan</span>
          </Link>
          <Link href="/michelle/gap" className={row(path === "/michelle/gap")}>
            <TrendingDown className="size-4" /> <span className="flex-1">Gap to plan</span>
            {gap > 0 && <span className="rounded bg-error-600/25 px-1.5 font-mono text-[11px] text-error-200">−{fmtBiz(gap)}</span>}
          </Link>
          {/* Everything that runs on its own clock: the Monday brief and the alerts, on one page. */}
          <Link href="/michelle/alerts" className={row(path === "/michelle/alerts")}>
            <Clock className="size-4" /> <span className="flex-1">Scheduled</span>
          </Link>
          {divider}
          {/* What Ally made for you. */}
          {groups[0].map((x) => listBlock(x))}
          {divider}
          {/* The two Ally verbs, together: teach it (what ships, skills, knowledge), then ask it. The MVP keeps teaching on our side (settings, for FDEs), not in the customer's nav. */}
          {!live.mvp && (
            <Link href="/settings" className={row(path === "/settings")}>
              <GraduationCap className="size-4" /> <span className="flex-1">Teach Ally</span>
            </Link>
          )}
          {/* Ask Ally: folded like the other lists; "+ New" starts a question without opening it. */}
          <div className="flex items-center rounded-lg text-sm text-brand-100 hover:bg-white/10">
            <button type="button" onClick={() => setOpenList(openList === "Ask Ally" ? null : "Ask Ally")} aria-expanded={openList === "Ask Ally"} className="flex flex-1 items-center gap-2.5 px-2.5 py-2 text-left hover:text-white">
              <MessageSquare className="size-4" /> <span className="flex-1">Ask Ally</span>
              {chats.items.length > 0 && <span className="font-mono text-xs text-brand-300">{chats.items.length}</span>}
            </button>
            <button type="button" onClick={newChat} className="mr-1.5 rounded-md px-1.5 py-0.5 text-xs font-medium text-white hover:bg-white/10">
              + New
            </button>
          </div>
          {openList === "Ask Ally" && chats.items.length > 0 && (
            <div className="pl-7">
              {(allChats ? chats.items : chats.items.slice(0, 3)).map((it) => (
                <Link key={it.href + it.label} href={it.href} className={cn("block truncate rounded-lg px-2.5 py-1.5 text-[13px]", it.on ? "bg-brand-400 text-white" : "text-brand-100 hover:bg-white/10 hover:text-white")}>
                  {it.label}
                </Link>
              ))}
              {chats.items.length > 3 && (
                <button type="button" onClick={() => setAllChats((v) => !v)} className="px-2.5 py-1 text-xs text-brand-300 hover:text-white">
                  {allChats ? "Show fewer" : "See all"}
                </button>
              )}
            </div>
          )}
          <div className="mt-auto pt-4">
            <AllyWorking />
          </div>
        </div>
      ) : (
        <nav className="flex flex-1 flex-col items-center gap-1 pb-3">
          <Link href={home} aria-label={`Today · ${waiting} waiting`} title={`Today · ${waiting} waiting`} className={iconBtn(path === home)}>
            <Home className="size-4" />
            {waiting > 0 && <span aria-hidden className="absolute top-2 right-2 size-2 rounded-full bg-ally-500 ring-2 ring-brand-950" />}
          </Link>
          <Link href="/plan" aria-label="Joint plan" title="Joint plan" className={iconBtn(path === "/plan")}>
            <ClipboardList className="size-4" />
          </Link>
          <Link href="/michelle/gap" aria-label="Gap to plan" title={gap > 0 ? `Gap to plan · −${fmtBiz(gap)}` : "Gap to plan"} className={iconBtn(path === "/michelle/gap")}>
            <TrendingDown className="size-4" />
            {gap > 0 && <span aria-hidden className="absolute top-2 right-2 size-2 rounded-full bg-error-500 ring-2 ring-brand-950" />}
          </Link>
          <Link href="/michelle/alerts" aria-label="Scheduled" title="Scheduled" className={iconBtn(path === "/michelle/alerts")}>
            <Clock className="size-4" />
          </Link>
          <span className="h-3" aria-hidden />
          {groups[0].map((x) => {
            const Icon = LIST_ICON[x.title] ?? x.icon
            return (
              <button key={x.title} type="button" onClick={() => toggle(true)} aria-label={x.title} title={x.title} className={iconBtn(x.title === "Dashboards" && path.startsWith("/michelle/dashboards"))}>
                <Icon className="size-4" />
                {x.fresh && <span aria-hidden className="absolute top-2 right-2 size-2 rounded-full bg-ally-500 ring-2 ring-brand-950" />}
              </button>
            )
          })}
          <span className="h-3" aria-hidden />
          {!live.mvp && (
            <Link href="/settings" aria-label="Teach Ally" title="Teach Ally" className={iconBtn(path === "/settings")}>
              <GraduationCap className="size-4" />
            </Link>
          )}
          <button type="button" onClick={() => toggle(true)} aria-label="Ask Ally" title="Ask Ally" className={iconBtn(path.startsWith("/michelle/c/") || path.startsWith("/c/") || path === "/michelle/retro")}>
            <MessageSquare className="size-4" />
          </button>
          <AllyWorkingDot />
        </nav>
      )}
    </aside>
  )
}

/** Ally's work in flight, at the foot of the rail: what's on autopilot. Real numbers, from the waterfall. */
function AllyWorking() {
  const { stages, mvp } = useLive()
  const auto = stages.find((s) => s.id === "autopilot")
  if (!auto || auto.value <= 0) return null
  return (
    <div className="rounded-lg bg-white/5 px-3 py-2.5 ring-1 ring-white/10">
      <div className="flex items-center gap-2 text-[13px] font-semibold text-white">
        <span className="size-2 animate-pulse rounded-full bg-success-500" aria-hidden /> Ally is working
      </div>
      {/* The MVP doesn't put a dollar value on autopilot work. */}
      {!mvp && (
        <div className="mt-1 text-xs text-brand-200">
          <span className="font-mono text-white">{fmtValue(auto.value)}</span> on autopilot
        </div>
      )}
    </div>
  )
}

/** The collapsed rail's version: a green dot that says the same thing on hover. */
function AllyWorkingDot() {
  const { stages, mvp } = useLive()
  const auto = stages.find((x) => x.id === "autopilot")
  if (!auto || auto.value <= 0) return null
  const say = mvp ? "Ally is working" : `Ally is working · ${fmtValue(auto.value)} on autopilot`
  return <span title={say} aria-label={say} className="mt-auto size-2.5 animate-pulse rounded-full bg-success-500" />
}
