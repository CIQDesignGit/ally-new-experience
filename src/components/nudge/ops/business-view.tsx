"use client"

import { Fragment, useEffect, useRef, useState } from "react"
import { ChevronRight, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { candleThumbnail } from "@/lib/candle-thumbnails"
import { BUSINESS, contentBatches, fmtBiz, launchedIds, opsBatches } from "../data"
import { ITEM_ACTIVE, ITEM_IDLE } from "../mike/rail"
import { useLive } from "../live-model"
import { playById } from "../market"
import { useLaunch } from "../market/plays"
import { useNudge } from "../nudge-context"
import { ChatThread, useChat, useChatSource } from "../chat/inline-chat"
import type { Chip } from "../chat/inline-chat"
import type { AgentId, Period } from "../types"
import { findIn, skusUnder } from "./gap-data"
import type { Fix, GapNode } from "./gap-data"
import { GapAnalysis } from "./gap-view"
import { VENDOR_MANAGER } from "./note-bar"
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
/* Fixes: what's in flight for a cause, named for a business reader, linked    */
/* ------------------------------------------------------------------------- */

interface FixView {
  lever: AgentId
  name: string
  owner: string
  status: string
  tone: "todo" | "moving" | "done"
  open: () => void
  openLabel: string
}

function useFixes(onOpenOps: (batchId: string, asin?: string) => void) {
  const { approved, nudged, policy, note } = useNudge()
  const { launch, isLaunched } = useLaunch()
  const ops = opsBatches(policy)
  const content = contentBatches(policy, launchedIds(approved))
  return (fix: Fix, asin?: string): FixView | undefined => {
    if (fix.kind === "ops") {
      const b = ops.find((x) => x.id === fix.id) ?? ops.find((x) => x.id.startsWith(fix.id))
      if (!b) return undefined
      const mine = note.filter((i) => i.batchId === b.id && (!asin || i.asin === asin))
      const sentOn = mine.find((i) => i.sentOn)?.sentOn
      const status = approved[b.id] || sentOn ? `sent to ${VENDOR_MANAGER.name}, ${sentOn ?? "Oct 8"}` : mine.length ? `in your note to ${VENDOR_MANAGER.name} · not sent` : "ready to review"
      return { lever: "ops", name: b.fixName ?? b.name, owner: "You", status, tone: approved[b.id] || sentOn ? "done" : mine.length ? "moving" : "todo", open: () => onOpenOps(b.id, asin), openLabel: "Open" }
    }
    if (fix.kind === "content") {
      const b = content.find((x) => x.id === fix.id)
      if (!b) return undefined
      const done = !!approved[b.id]
      const pinged = b.nudgeKey && nudged[b.nudgeKey]
      const status = done ? (b.tier === "input" ? "sent to Ally" : "approved") : b.tier === "input" ? "waiting on your team" : pinged ? "nudged, waiting for approval" : "waiting for approval"
      return { lever: "content", name: b.fixName ?? b.name, owner: "Mike", status, tone: done ? "done" : b.tier === "input" ? "todo" : "moving", open: () => (window.location.href = `/mike?batch=${b.id}&from=michelle`), openLabel: "Open in Mike's queue" }
    }
    const p = playById(fix.id)
    if (!p) return undefined
    const on = isLaunched(p)
    return { lever: p.owner === "human" ? "content" : p.owner, name: p.what, owner: p.owner === "media" ? "Ally for Media" : "Ally", status: on ? "launched" : "ready to launch", tone: on ? "moving" : "todo", open: () => launch([p]), openLabel: on ? "Launched" : "Launch" }
  }
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


export function BusinessPane({ root, nodeId, onSelect, onOpenOps }: { root: GapNode; nodeId: string; onSelect: (id: string) => void; onOpenOps: (batchId: string, asin?: string) => void }) {
  const { ask } = useChat()
  const fixFor = useFixes(onOpenOps)
  const found = findIn(root, nodeId) ?? { node: root, trail: [] }
  const n = found.node
  const g = gapOf(n)
  const eow = n.eow.projected - n.eow.plan
  const byValue = [...n.drivers].sort((a, b) => (g < 0 ? a.value - b.value : b.value - a.value))
  // What to watch is what's still live (or worth watching), the biggest three; what's resolved is last week's story.
  const live = byValue.filter((d) => d.tag !== "Resolved").slice(0, 3)
  const resolved = byValue.filter((d) => d.tag === "Resolved")
  const label = n.id === root.id ? "the overall business" : n.name
  const analysis: Chip = { q: `Run gap-to-plan analysis for ${label} for last week`, render: () => <GapAnalysis node={n} onInbox={(id) => onOpenOps(id, n.asin)} /> }
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

      {/* A brief, not the analysis: where it stands, then what to focus on this week and what's already resolved. The breakdown is one click away. */}
      <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
        <div className="grid grid-cols-2 divide-x divide-slate-100">
          <div className="px-5 py-4">
            <div className="text-xs font-medium text-slate-500">Last week vs plan</div>
            <div className="mt-0.5 flex items-baseline gap-2 tabular-nums">
              <span className={cn("text-[26px] font-semibold tracking-tight", g < 0 ? "text-error-600" : "text-success-700")}>{m(g, true)}</span>
              <span className="text-sm text-slate-500">
                {m(n.lastWeek.sales)} of {m(n.lastWeek.plan)} · {pct(n.lastWeek.sales, n.lastWeek.plan)}
              </span>
            </div>
          </div>
          <div className="px-5 py-4">
            <div className="text-xs font-medium text-slate-500">This week, projected</div>
            <div className="mt-0.5 flex items-baseline gap-2 tabular-nums">
              <span className="text-[26px] font-semibold tracking-tight text-slate-950">{m(eow, true)}</span>
              <span className="text-sm text-slate-500">
                {pct(n.eow.projected, n.eow.plan)} of plan · {m(n.wtd)} so far
              </span>
            </div>
          </div>
        </div>

        {live.length > 0 ? (
          <div className="border-t border-slate-100 px-5 py-4">
            <div className="text-xs font-medium text-slate-500">Focus on this week</div>
            <ul className="mt-2 flex flex-col gap-2.5">
              {live.map((d) => {
                const f = d.fix && fixFor(d.fix, n.asin)
                return (
                  <li key={d.title} className="grid grid-cols-[minmax(0,1fr)_72px] gap-x-4 text-sm">
                    <span className="min-w-0">
                      <span className="text-slate-950">{d.title}</span>
                      {f && (
                        <button type="button" onClick={f.open} className="mt-0.5 block text-left text-[13px] text-slate-500 hover:text-brand-700">
                          {f.name} · {f.owner}, {f.status} →
                        </button>
                      )}
                    </span>
                    <span className="text-right font-semibold text-slate-950 tabular-nums">{m(d.value, true)}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        ) : (
          <div className="border-t border-slate-100 px-5 py-3 text-sm text-success-700">On track · nothing pulling it below plan</div>
        )}

        {resolved.length > 0 && (
          <div className="border-t border-slate-100 px-5 py-4">
            <div className="text-xs font-medium text-slate-500">Resolved from last week</div>
            <ul className="mt-2 flex flex-col gap-1.5">
              {resolved.map((d) => (
                <li key={d.title} className="grid grid-cols-[minmax(0,1fr)_72px] gap-x-4 text-sm text-slate-500">
                  <span className="min-w-0">{d.title}</span>
                  <span className="text-right tabular-nums">{m(d.value, true)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {n.level === "SKU" && (
        <div className="mt-4">
          <AllyFeedback key={n.id} id={`michelle:business:${n.id}`} sku={n.name} author="Michelle Ortiz" />
        </div>
      )}

      <div className="mt-5">
        <button type="button" onClick={() => ask(analysis, n.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-white px-4 py-2 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-50">
          <Sparkles className="size-3.5" /> Run gap-to-plan analysis
        </button>
      </div>
      {/* Answers about what's open here appear here. */}
      <ChatThread anchor={n.id} className="mt-4" />
    </div>
  )
}
