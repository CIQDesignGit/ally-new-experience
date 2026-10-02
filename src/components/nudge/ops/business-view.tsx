"use client"

import { Fragment, useEffect, useRef, useState } from "react"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { PRIMARY } from "../mike/buttons"
import { candleThumbnail } from "@/lib/candle-thumbnails"
import { BUSINESS, fmtBiz } from "../data"
import { ITEM_ACTIVE, ITEM_IDLE } from "../mike/rail"
import { useLive } from "../live-model"
import { useNudge } from "../nudge-context"
import { ChatThread, useChat, useChatSource } from "../chat/inline-chat"
import type { Chip } from "../chat/inline-chat"
import type { Period } from "../types"
import { GAP_WEEK, findIn, skusUnder } from "./gap-data"
import type { GapNode } from "./gap-data"
import { GapAnalysis } from "./gap-view"
import { AllyFeedback } from "../ally-feedback"

/** $M → "$5.8K" / "$240K" / "$2.1M"; signed when asked. */
const m = (v: number, signed = false) => {
  const a = Math.abs(v)
  const s = a >= 1 ? `$${+a.toFixed(2)}M` : a >= 0.1 ? `$${Math.round(a * 1000)}K` : `$${+(a * 1000).toFixed(1)}K`
  return signed ? `${v < 0 ? "−" : "+"}${s}` : s
}
const pct = (a: number, b: number) => `${Math.round((a / b) * 100)}%`
const PERIOD_WORDS: Record<Period, string> = { week: "this week", month: "this month", quarter: "this quarter", year: "this year" }

/* ------------------------------------------------------------------------- */
/* Hero: follows the period switch, like Claire's                              */
/* ------------------------------------------------------------------------- */

export function BusinessHero() {
  const l = useLive()
  const { plan } = BUSINESS[l.period]
  const pace = l.pace(l.period)
  return (
    <div className="px-10 pt-2 pb-7">
      <div className="text-2xl font-semibold tracking-tight text-slate-700">
        Amazon is projected to land at <span className="font-mono text-slate-950">{fmtBiz(pace)}</span> {PERIOD_WORDS[l.period]}.
      </div>
      {/* One line, the same size as Mike's and Michelle's headlines. */}
      <h1 className="mt-1 text-[28px] leading-tight font-bold tracking-tight text-slate-950">
        That&apos;s <span className="font-mono">{fmtBiz(plan - pace)}</span> short of your <span className="font-mono">{fmtBiz(plan)}</span> plan.{" "}
        <span className="font-mono text-brand-600">{l.open.totalLabel}</span> of work is in flight to close it.
      </h1>
    </div>
  )
}

/* ------------------------------------------------------------------------- */
/* Rail: the hierarchy, ranked at every level                                  */
/* ------------------------------------------------------------------------- */

const gapOf = (n: GapNode) => n.lastWeek.sales - n.lastWeek.plan
const rank = (sort: "gap" | "sales") => (a: GapNode, b: GapNode) => (sort === "sales" ? b.lastWeek.sales - a.lastWeek.sales : gapOf(a) - gapOf(b))
/** The cause that explains most of a node's week, in its own words. */
const topCause = (n: GapNode) => [...n.drivers].sort((a, b) => (gapOf(n) < 0 ? a.value - b.value : b.value - a.value))[0]

function RailRow({ node, depth, selected, trail, onSelect, sort, path }: { node: GapNode; depth: number; selected: string; trail: string[]; onSelect: (id: string) => void; sort: "gap" | "sales"; path?: string }) {
  const kids = [...(node.children ?? [])].sort(rank(sort))
  const [open, setOpen] = useState(depth === 0 || trail.includes(node.id))
  const onPath = trail.includes(node.id)
  const rowRef = useRef<HTMLDivElement>(null)
  // The rail follows the pane: picking something below this row opens it, and the picked row scrolls into view.
  useEffect(() => {
    if (onPath) setOpen(true)
  }, [onPath])
  useEffect(() => {
    if (selected === node.id) rowRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" })
  }, [selected, node.id])
  const g = gapOf(node)
  const cause = topCause(node)
  return (
    <div>
      <div ref={rowRef} className={cn("flex scroll-mt-4 items-start gap-1 rounded-lg px-2 py-2.5 transition-colors", selected === node.id ? ITEM_ACTIVE : ITEM_IDLE)} style={{ marginLeft: depth * 12 }}>
        {kids.length ? (
          <button type="button" onClick={() => setOpen((o) => !o)} aria-label={open ? "Collapse" : "Expand"} className="mt-0.5 text-slate-400 hover:text-slate-700">
            <ChevronRight className={cn("size-4 transition-transform", open && "rotate-90")} />
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}
        <button type="button" onClick={() => onSelect(node.id)} className="min-w-0 flex-1 text-left outline-none">
          <div className="flex items-baseline justify-between gap-2">
            <span className={cn("truncate text-sm", node.level === "SKU" ? "text-slate-950" : "font-semibold text-slate-950")}>{node.id === "overall" ? "Overall business" : node.name}</span>
            <span className="shrink-0 font-mono text-[13px] font-semibold text-slate-950 tabular-nums">{m(g, true)}</span>
          </div>
          <div className="mt-0.5 truncate text-xs text-slate-500">{path ?? (cause ? `${cause.title} · ${cause.tag.toLowerCase()}` : "On track")}</div>
        </button>
      </div>
      {open && kids.map((c) => <RailRow key={c.id} node={c} depth={depth + 1} selected={selected} trail={trail} onSelect={onSelect} sort={sort} />)}
    </div>
  )
}

export function BusinessRail({ root, selected, onSelect }: { root: GapNode; selected: string; onSelect: (id: string) => void }) {
  const { businessSort, businessGroup } = useNudge()
  const [flat, setFlat] = useState(false)
  const trail = (findIn(root, selected)?.trail ?? []).map((n) => n.id)
  const skus = skusUnder(root).sort(rank(businessSort))
  const pathOf = (id: string) =>
    (findIn(root, id)?.trail ?? [])
      .filter((n) => n.id !== root.id)
      .map((n) => n.name)
      .join(" › ")
  return (
    <div className="px-2 py-3">
      <div className="mb-2 flex h-9 rounded-lg border border-slate-200 bg-slate-25 p-0.5">
        {[
          [false, businessGroup === "Brand" ? "Brand › Category › SKU" : "Category › Brand › SKU"],
          [true, "All SKUs"],
        ].map(([v, label]) => (
          <button
            key={String(v)}
            type="button"
            onClick={() => setFlat(v as boolean)}
            className={cn("flex-1 rounded-md px-2 text-[13px] font-medium whitespace-nowrap transition-colors", flat === v ? "bg-white text-slate-950 shadow-xs ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-800")}
          >
            {label as string}
          </button>
        ))}
      </div>
      {flat ? (
        skus.map((n) => <RailRow key={n.id} node={n} depth={0} selected={selected} trail={[]} onSelect={onSelect} sort={businessSort} path={pathOf(n.id)} />)
      ) : (
        <RailRow node={root} depth={0} selected={selected} trail={trail} onSelect={onSelect} sort={businessSort} />
      )}
    </div>
  )
}

/* ------------------------------------------------------------------------- */
/* Pane: a scope's story (what's wrong, its top SKUs) or one SKU's             */
/* ------------------------------------------------------------------------- */


/** A % change colored by direction (DESIGN.md): up green, down red, flat neutral. */
function Pct({ v }: { v: number }) {
  return <span className={cn("font-semibold", v < 0 ? "text-error-600" : v > 0 ? "text-success-700" : "text-slate-950")}>{v > 0 ? "+" : v < 0 ? "−" : ""}{v === 0 ? "flat" : `${Math.abs(v)}%`}</span>
}

export function BusinessPane({ root, nodeId, onSelect, onOpenOps }: { root: GapNode; nodeId: string; onSelect: (id: string) => void; onOpenOps: (batchId: string, asin?: string) => void }) {
  const { ask } = useChat()
  const found = findIn(root, nodeId) ?? { node: root, trail: [] }
  const n = found.node
  const g = gapOf(n)
  const eow = n.eow.projected - n.eow.plan
  const label = n.id === root.id ? "the overall business" : n.name
  const analysis: Chip = { q: `Run detailed gap-to-plan analysis for ${label}`, render: () => <GapAnalysis node={n} onInbox={(id) => onOpenOps(id, n.asin)} /> }
  useChatSource({ about: n.id === root.id ? undefined : n.name, anchor: n.id, chips: [analysis] }, `business-${n.id}`)

  return (
    <div className="flex min-w-0 flex-col px-10 py-7">
      {found.trail.length > 0 && (
        <div className="mb-1 flex flex-wrap items-center gap-1 text-sm text-slate-500">
          {found.trail.map((t) => (
            <Fragment key={t.id}>
              <button type="button" onClick={() => onSelect(t.id)} className="hover:text-brand-700 hover:underline">
                {t.id === root.id ? "Overall business" : t.name}
              </button>
              <ChevronRight className="size-3.5 text-slate-300" />
            </Fragment>
          ))}
        </div>
      )}
      <div className="flex items-center gap-3">
        {n.asin && <img src={candleThumbnail(n.asin)} alt="" className="size-10 shrink-0 rounded-lg object-cover ring-1 ring-slate-200" />}
        <div className="min-w-0">
          <div className="text-2xl font-semibold tracking-tight text-slate-950">{n.id === root.id ? "Overall business" : n.name}</div>
          {(n.level || n.asin) && <div className="text-sm text-slate-500">{[n.level, n.asin].filter(Boolean).join(" · ")}</div>}
        </div>
      </div>

      {/* What the product knows without running anything: where it lands, so far, last week, and the simple reason.
          The detailed analysis (causes and this week's actions) runs only when asked. */}
      <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
        <div className="px-5 pt-4 pb-3">
          <div className="text-xs font-medium text-slate-500">This week, projected</div>
          <div className="mt-0.5 flex items-baseline gap-2 tabular-nums">
            <span className={cn("text-[26px] font-semibold tracking-tight", eow < 0 ? "text-error-600" : "text-success-700")}>{m(eow, true)}</span>
            <span className="text-sm text-slate-500">
              {m(n.eow.projected)} of {m(n.eow.plan)} plan · {pct(n.eow.projected, n.eow.plan)}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 divide-x divide-slate-100 border-t border-slate-100 text-sm tabular-nums">
          <div className="px-5 py-3">
            <div className="text-xs text-slate-500">So far this week</div>
            <div className="mt-0.5 text-slate-950">
              <span className="font-semibold">{m(n.wtd)}</span> <span className="text-slate-500">· {Math.round(GAP_WEEK.elapsed * 100)}% of the week gone</span>
            </div>
          </div>
          <div className="px-5 py-3">
            <div className="text-xs text-slate-500">Last week vs plan</div>
            <div className="mt-0.5 text-slate-950">
              <span className={cn("font-semibold", g < 0 ? "text-error-600" : "text-success-700")}>{m(g, true)}</span> <span className="text-slate-500">· {m(n.lastWeek.sales)} of {m(n.lastWeek.plan)} · {pct(n.lastWeek.sales, n.lastWeek.plan)}</span>
            </div>
          </div>
        </div>
        {/* The simple reason: sales split into traffic, conversion and price. */}
        <div className="border-t border-slate-100 px-5 py-3 text-sm text-slate-600 tabular-nums">
          <span className="text-slate-500">Why</span> · Sales <Pct v={n.equation.sales} /> vs the week before: traffic <Pct v={n.equation.traffic} />, conversion <Pct v={n.equation.conversion} />, price <Pct v={n.equation.price} />
        </div>
      </div>

      <div className="mt-5">
        <button type="button" onClick={() => ask(analysis, n.id)} className={PRIMARY}>
          Run detailed gap-to-plan analysis
        </button>
      </div>

      {n.level === "SKU" && (
        <div className="mt-4">
          <AllyFeedback key={n.id} id={`michelle:business:${n.id}`} sku={n.name} author="Michelle Ortiz" />
        </div>
      )}

      {/* Answers about what's open here appear here. */}
      <ChatThread anchor={n.id} className="mt-4" />
    </div>
  )
}
