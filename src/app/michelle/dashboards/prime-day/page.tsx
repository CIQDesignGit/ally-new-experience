"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { CalendarDays, Check, ChevronDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { PageShell } from "@/components/layout/page-shell"
import { TopStrip } from "@/components/nudge/top-strip"
import { AppDrawer } from "@/components/nudge/app-drawer"
import { useNudge } from "@/components/nudge/nudge-context"
import { SECONDARY } from "@/components/nudge/mike/buttons"
import { ChartView } from "@/components/nudge/retro/slide"
import { CATEGORY_SPLIT, DEAL_SPLIT, DEALS_TABLE, RETRO, SLIDES } from "@/components/nudge/retro/prime-day"

/**
 * The retro as a live dashboard: the deck's charts as tiles, refreshed daily,
 * with a date range and filters. A filter picks one thing (a category, an
 * agent, a deal); every chart that has it puts it forward.
 */

const CATEGORIES = Object.keys(CATEGORY_SPLIT)
const AGENTS = ["Content", "Media", "Ops"] as const
const DEALS = Object.keys(DEAL_SPLIT)
const ALLY_TOTAL = { Media: 190, Content: 180, Ops: 40 }
/** Two tiles are both about categories; on the dashboard they say which way. */
const TILE_NAME: Record<string, string> = { "categories-up": "Categories that led", "categories-down": "Categories that trailed" }
const k$ = (n: number) => `$${n}K`

const RANGES = [
  { label: "Prime Day 2026", dates: "Jul 14 – 15, 2026", live: true },
  { label: "Prime Day 2025", dates: "Jul 8 – 11, 2025", live: false },
  { label: "Last 30 days", dates: "Sep 1 – 30, 2026", live: false },
  { label: "Quarter to date", dates: "Oct 1, 2026", live: false },
]

export default function PrimeDayDashboard() {
  const { retro, setRetro } = useNudge()
  const [category, setCategory] = useState<string>()
  const [agent, setAgent] = useState<(typeof AGENTS)[number]>()
  const [deal, setDeal] = useState<string>()
  const alts = retro.alts ?? []

  // Opening it is what clears the sidebar's "new" dot (after the store has loaded).
  useEffect(() => {
    const t = window.setTimeout(() => setRetro({ dashboardSeen: true }), 0)
    return () => window.clearTimeout(t)
  }, [setRetro])

  const order = retro.order?.length ? retro.order : SLIDES.map((s) => s.id)
  const tiles = order
    .map((id) => SLIDES.find((s) => s.id === id))
    .filter((s): s is (typeof SLIDES)[number] => !!s)
    .map((s) => (s.id === "deals" && alts.includes("deals") ? { ...s, chart: DEALS_TABLE } : s))
  const focus = (id: string) => (id === "ally" ? agent : id === "deals" ? deal : category)
  // The top numbers recalculate for the filters; the charts below put the pick forward.
  const cat = category ? CATEGORY_SPLIT[category] : undefined
  const allyBy = cat?.ally ?? ALLY_TOTAL
  const added = agent ? allyBy[agent] : allyBy.Media + allyBy.Content + allyBy.Ops
  const kpis = [
    cat ? { figure: cat.sales, label: `${category} sales, ${cat.growth.startsWith("−") ? "down" : "up"} ${cat.growth.replace("−", "")}` } : { figure: "$4.6M", label: "Prime Day sales, up 28%" },
    cat ? { figure: cat.share, label: "of Prime Day sales" } : { figure: "+2 pts", label: "faster than the market" },
    { figure: k$(added), label: agent ? `added by the ${agent.toLowerCase()} agent` : "added by Ally" },
    deal ? { figure: DEAL_SPLIT[deal].added, label: `from ${deal.toLowerCase()} deals, ${DEAL_SPLIT[deal].lift} lift` } : { figure: String(cat?.lessons ?? 4), label: "lessons kept for Black Friday" },
  ]
  const filtered = !!(category || agent || deal)

  return (
    <PageShell className="bg-slate-50 xl:bg-white">
      <div className="mx-auto max-w-[1280px] overflow-clip bg-white shadow-pane-lg sm:my-6 sm:rounded-2xl sm:ring-1 sm:ring-slate-900/6 xl:my-0 xl:rounded-none xl:shadow-none xl:ring-0">
        <TopStrip person="michelle" crumbs={[{ label: "Daily brief", href: "/michelle" }, { label: "Dashboards" }, { label: RETRO.name }]} />

        <div className="flex items-end justify-between gap-6 px-10 pt-4">
          <div>
            <h1 className="text-[28px] leading-tight font-semibold tracking-tight text-slate-950">{RETRO.name}</h1>
            <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
              <span className="size-1.5 rounded-full bg-success-500" aria-hidden />
              Live · updated today, 9:00 AM
            </div>
          </div>
          <Link href="/michelle/retro?view=deck" className={SECONDARY}>
            Open deck
          </Link>
        </div>

        <div className="sticky top-0 z-30 mt-6 flex flex-wrap items-center gap-2 border-y border-slate-200 bg-white px-10 py-3">
          <DateRange />
          <Menu label="Retailer" value="Amazon" options={["Amazon"]} locked />
          <Menu label="Category" value={category} options={CATEGORIES} onChange={setCategory} />
          <Menu label="Agent" value={agent} options={[...AGENTS]} onChange={(v) => setAgent(v as (typeof AGENTS)[number] | undefined)} />
          <Menu label="Deal" value={deal} options={DEALS} onChange={setDeal} />
          {filtered && (
            <button
              type="button"
              onClick={() => {
                setCategory(undefined)
                setAgent(undefined)
                setDeal(undefined)
              }}
              className="ml-1 rounded-md px-2 py-1.5 text-[13px] text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="flex flex-col gap-6 px-10 pt-6 pb-16">
          <div className="grid grid-cols-4 gap-4">
            {kpis.map((k) => (
              <div key={k.label} className="rounded-xl border border-slate-200 px-5 py-4">
                <div className="font-mono text-[26px] leading-none font-semibold text-slate-950">{k.figure}</div>
                <div className="mt-2 text-[13px] text-slate-500">{k.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {tiles.map((s) => (
              <section key={s.id} aria-label={TILE_NAME[s.id] ?? s.eyebrow.split(" · ")[1]} className="flex flex-col rounded-xl border border-slate-200 p-5">
                <div className="text-xs font-medium tracking-wide text-slate-500 uppercase">{TILE_NAME[s.id] ?? s.eyebrow.split(" · ")[1]}</div>
                <div className="mt-1 text-[15px] font-semibold text-slate-950">{s.title}</div>
                <div className="mt-4 grid flex-1 grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-5">
                  <div className="flex h-[190px] flex-col justify-end" style={{ fontSize: 24 }}>
                    <ChartView chart={s.chart} theme="default" focus={focus(s.id)} />
                  </div>
                  <ul className="flex flex-col justify-center gap-3 border-l border-slate-100 pl-5">
                    {s.insights.map((i) => (
                      <li key={i.figure + i.text} className="text-[13px] leading-snug text-slate-500">
                        <b className={cn("block font-mono text-[17px] font-semibold", i.loss ? "text-error-600" : "text-brand-700")}>{i.figure}</b>
                        {i.text}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            ))}
          </div>
          <div className="text-[13px] text-slate-500">{RETRO.sources}</div>
        </div>
      </div>
      <AppDrawer />
    </PageShell>
  )
}

/** A popover that closes on an outside click or Escape. */
function usePopover() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false)
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])
  return { open, setOpen, ref }
}

const TRIGGER = "inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-[13px] transition-colors"

function Menu({ label, value, options, onChange, locked }: { label: string; value?: string; options: string[]; onChange?: (v?: string) => void; locked?: boolean }) {
  const { open, setOpen, ref } = usePopover()
  const on = !!value && !locked
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className={cn(TRIGGER, on ? "border-brand-300 bg-brand-25 text-brand-800" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300")}>
        <span className="text-slate-500">{label}</span>
        <span className="font-medium">{value ?? "All"}</span>
        {on ? (
          <X
            className="size-3.5"
            aria-label={`Clear ${label.toLowerCase()}`}
            onClick={(e) => {
              e.stopPropagation()
              onChange?.(undefined)
            }}
          />
        ) : (
          <ChevronDown className="size-3.5 text-slate-400" />
        )}
      </button>
      {open && (
        <div role="menu" className="absolute top-full left-0 z-40 mt-1.5 min-w-[200px] rounded-xl border border-slate-200 bg-white p-1 shadow-[0_12px_32px_-12px_rgba(15,23,42,0.3)]">
          {!locked && <Item label="All" on={!value} onPick={() => (onChange?.(undefined), setOpen(false))} />}
          {options.map((o) => (
            <Item key={o} label={o} on={value === o} onPick={() => (onChange?.(o), setOpen(false))} />
          ))}
        </div>
      )}
    </div>
  )
}

function Item({ label, sub, on, onPick, disabled }: { label: string; sub?: string; on?: boolean; onPick?: () => void; disabled?: boolean }) {
  return (
    <button type="button" role="menuitem" disabled={disabled} onClick={onPick} className={cn("flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px]", disabled ? "cursor-default text-slate-300" : "text-slate-800 hover:bg-slate-50")}>
      <span className="flex-1">
        <span className="block">{label}</span>
        {sub && <span className={cn("block text-xs", disabled ? "text-slate-300" : "text-slate-500")}>{sub}</span>}
      </span>
      {on && <Check className="size-3.5 text-brand-600" />}
    </button>
  )
}

/** July 2026 starts on a Wednesday; Prime Day is the 14th and 15th. */
function DateRange() {
  const { open, setOpen, ref } = usePopover()
  const days = Array.from({ length: 31 }, (_, i) => i + 1)
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className={cn(TRIGGER, "border-slate-200 bg-white font-medium text-slate-800 hover:border-slate-300")}>
        <CalendarDays className="size-4 text-slate-500" />
        {RANGES[0].dates}
        <ChevronDown className="size-3.5 text-slate-400" />
      </button>
      {open && (
        <div className="absolute top-full left-0 z-40 mt-1.5 flex w-max rounded-xl border border-slate-200 bg-white shadow-[0_12px_32px_-12px_rgba(15,23,42,0.3)]">
          <div className="w-[200px] shrink-0 border-r border-slate-100 p-1">
            {RANGES.map((r) => (
              <Item key={r.label} label={r.label} sub={r.dates} on={r.live} disabled={!r.live} onPick={() => setOpen(false)} />
            ))}
          </div>
          <div className="p-4">
            <div className="text-center text-[13px] font-semibold text-slate-900">July 2026</div>
            <div className="mt-3 grid grid-cols-7 gap-y-1 text-center text-xs">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <span key={i} className="pb-1 text-slate-400">
                  {d}
                </span>
              ))}
              {Array.from({ length: 3 }, (_, i) => (
                <span key={`pad-${i}`} />
              ))}
              {days.map((d) => {
                const start = d === 14
                const end = d === 15
                return (
                  <span key={d} className={cn("flex h-8 w-9 items-center justify-center font-mono", start || end ? "bg-brand-500 font-semibold text-white" : "text-slate-700", start && "rounded-l-lg", end && "rounded-r-lg")}>
                    {d}
                  </span>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
