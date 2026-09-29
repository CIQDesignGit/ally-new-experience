"use client"

import { Fragment, useEffect, useRef, useState } from "react"
import { ChevronRight, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { candleThumbnail } from "@/lib/candle-thumbnails"
import { BUSINESS, contentBatches, fmtBiz, launchedIds, opsBatches } from "../data"
import { ITEM_ACTIVE, ITEM_IDLE } from "../mike/rail"
import { Points } from "../points"
import { AGENT_DOT } from "../agent-style"
import { useLive } from "../live-model"
import { playById } from "../market"
import { useLaunch } from "../market/plays"
import { useNudge } from "../nudge-context"
import { ChatThread, useChat, useChatSource } from "../chat/inline-chat"
import type { Chip } from "../chat/inline-chat"
import type { AgentId, Period } from "../types"
import { GAP_TREE, findIn, skusUnder } from "./gap-data"
import type { Driver, Fix, GapNode } from "./gap-data"
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
const STATE: Record<Driver["tag"], string> = { Live: "text-error-700", Resolved: "text-success-700", "Worth watching": "text-warning-700" }
const live = (d: Driver) => d.tag !== "Resolved"

/* ------------------------------------------------------------------------- */
/* Hero: follows the period switch, like Claire's                              */
/* ------------------------------------------------------------------------- */

export function BusinessHero() {
  const l = useLive()
  const { plan } = BUSINESS[l.period]
  const pace = l.pace(l.period)
  const weekGap = GAP_TREE.eow.projected - GAP_TREE.eow.plan
  return (
    <div className="px-10 pt-2 pb-7">
      <div className="text-2xl font-semibold tracking-tight text-slate-700">
        Amazon is projected to land at <span className="font-mono text-slate-950">{fmtBiz(pace)}</span> {PERIOD_WORDS[l.period]}.
      </div>
      <h1 className="mt-1 text-[40px] leading-tight font-bold tracking-tight text-slate-950">
        That&apos;s <span className="font-mono">{fmtBiz(plan - pace)}</span> short of your <span className="font-mono">{fmtBiz(plan)}</span> plan.{" "}
        <span className="font-mono text-brand-600">{l.open.totalLabel}</span> of work is in flight to close it.
      </h1>
      <div className="mt-2 text-base text-slate-500">
        {l.open.byArea.map((a, i) => (
          <span key={a.agent}>
            {i > 0 && <span className="text-slate-300"> · </span>}
            <span className="font-semibold text-slate-700">{a.value}</span> in {a.agent}
          </span>
        ))}
        {l.period !== "week" && (
          <>
            <span className="text-slate-300"> · </span>
            This week <span className={cn("font-mono font-semibold", weekGap < 0 ? "text-error-600" : "text-success-700")}>{m(weekGap, true)}</span> vs plan
          </>
        )}
      </div>
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

const TONE = { todo: "text-warning-700", moving: "text-info-700", done: "text-success-700" }

function FixLine({ f }: { f: FixView }) {
  return (
    <span className="flex items-start gap-2">
      <span className={cn("mt-1.5 size-2 shrink-0 rounded-sm", AGENT_DOT[f.lever])} />
      <span className="min-w-0">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            f.open()
          }}
          className="text-left text-slate-950 underline decoration-slate-300 underline-offset-2 hover:text-brand-700 hover:decoration-brand-300"
        >
          {f.name}
        </button>
        <span className="block text-xs text-slate-500">
          {f.owner} · <span className={TONE[f.tone]}>{f.status}</span>
        </span>
      </span>
    </span>
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
            <span className={cn("shrink-0 font-mono text-[13px] font-semibold", g < 0 ? "text-error-600" : "text-success-700")}>{m(g, true)}</span>
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
      <div className="mb-2 flex rounded-lg border border-slate-200 bg-slate-25 p-1">
        {[
          [false, businessGroup === "Brand" ? "Brand › Category › SKU" : "Category › Brand › SKU"],
          [true, "All SKUs"],
        ].map(([v, label]) => (
          <button
            key={String(v)}
            type="button"
            onClick={() => setFlat(v as boolean)}
            className={cn("flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors", flat === v ? "bg-white text-slate-950 shadow-xs ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-800")}
          >
            {label as string}
          </button>
        ))}
      </div>
      <div className="px-2 pb-2 text-[11px] text-slate-500">
        Last week vs plan · ranked by {businessSort === "sales" ? "sales" : "gap"}
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

function Cause({ d, fixFor, asin }: { d: Driver; fixFor: ReturnType<typeof useFixes>; asin?: string }) {
  const f = d.fix && fixFor(d.fix, asin)
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_76px_minmax(0,1fr)] items-start gap-4 border-t border-slate-100 py-3 text-sm first:border-t-0">
      <span>
        <span className="text-slate-950">{d.title}</span> <span className={cn("text-xs", STATE[d.tag])}>· {d.tag}</span>
      </span>
      <span className={cn("text-right font-mono font-semibold", d.value < 0 ? "text-error-600" : "text-success-700")}>{m(d.value, true)}</span>
      <span>{f ? <FixLine f={f} /> : <span className="text-slate-500">{d.tag === "Resolved" ? "No action needed" : d.tag === "Worth watching" ? "Watching · no action yet" : "No fix in flight"}</span>}</span>
    </div>
  )
}

const BOX = "overflow-hidden rounded-xl border border-slate-200 bg-white"
const HEAD = "border-b border-slate-100 bg-slate-25 px-5 py-3 text-sm font-semibold text-slate-950"

export function BusinessPane({ root, nodeId, onSelect, onOpenOps }: { root: GapNode; nodeId: string; onSelect: (id: string) => void; onOpenOps: (batchId: string, asin?: string) => void }) {
  const { businessSort } = useNudge()
  const { ask } = useChat()
  const fixFor = useFixes(onOpenOps)
  const [all, setAll] = useState(false)
  const found = findIn(root, nodeId) ?? { node: root, trail: [] }
  const n = found.node
  const isSku = n.level === "SKU"
  const g = gapOf(n)
  const eow = n.eow.projected - n.eow.plan
  const byValue = [...n.drivers].sort((a, b) => (g < 0 ? a.value - b.value : b.value - a.value))
  const label = n.id === root.id ? "the overall business" : n.name
  const analysis: Chip = { q: `Run gap-to-plan analysis for ${label} for last week`, render: () => <GapAnalysis node={n} onInbox={(id) => onOpenOps(id, n.asin)} /> }
  useChatSource({ about: n.id === root.id ? undefined : n.name, anchor: n.id, chips: [analysis] }, `business-${n.id}`)

  // One level down, where the next decision is: the overall business lists its categories,
  // a brand its categories, a category its SKUs.
  const categories = (x: GapNode): GapNode[] => (x.level === "Category" ? [x] : (x.children ?? []).flatMap(categories))
  const below = n.id === root.id || n.level === "Brand" ? categories(n) : skusUnder(n)
  const belowNoun = below[0]?.level === "SKU" ? "SKUs" : "categories"
  const brandOf = (x: GapNode) => (x.level === "Category" ? findIn(root, x.id)?.trail.find((t) => t.level === "Brand")?.name : undefined)
  const ranked = below.filter((x) => businessSort === "sales" || gapOf(x) < 0).sort(rank(businessSort))
  const top = all ? ranked : ranked.slice(0, 5)

  return (
    <div className="flex min-w-0 flex-col px-10 py-8">
      {found.trail.length > 0 && (
        <div className="flex flex-wrap items-center gap-1 text-sm text-slate-500">
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
      <div className="mt-1 flex items-start gap-4">
        {n.asin && <img src={candleThumbnail(n.asin)} alt="" className="size-12 shrink-0 rounded-lg object-cover shadow-sm ring-1 ring-slate-200" />}
        <div className="min-w-0">
          <div className="text-sm font-medium text-slate-500">{n.level ?? "All brands"}</div>
          <div className="text-2xl font-semibold tracking-tight text-slate-950">{n.id === root.id ? "Overall business" : n.name}</div>
          {n.asin && <div className="font-mono text-xs text-slate-500">{n.asin}</div>}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-500">
        <span>
          Last week <span className={cn("font-mono font-semibold", g < 0 ? "text-error-600" : "text-success-700")}>{m(g, true)}</span> vs plan ({pct(n.lastWeek.sales, n.lastWeek.plan)})
        </span>
        <span>
          This week, projected <span className={cn("font-mono font-semibold", eow < 0 ? "text-error-600" : "text-success-700")}>{m(eow, true)}</span> ({pct(n.eow.projected, n.eow.plan)})
        </span>
        <span>
          Week to date <span className="font-mono font-semibold text-slate-950">{m(n.wtd)}</span>
        </span>
      </div>

      {isSku ? (
        <div className="mt-6 flex flex-col gap-4">
          {byValue[0] && (
            <div className={BOX}>
              <div className={HEAD}>Why last week</div>
              <div className="px-5 py-4 text-sm">
                <div>
                  <span className="font-medium text-slate-950">{byValue[0].title}</span> <span className={cn("text-xs", STATE[byValue[0].tag])}>· {byValue[0].tag}</span>
                  <span className={cn("ml-2 font-mono font-semibold", byValue[0].value < 0 ? "text-error-600" : "text-success-700")}>{m(byValue[0].value, true)}</span>
                </div>
                <Points className="mt-2" items={byValue[0].points} />
              </div>
            </div>
          )}
          <div className={BOX}>
            <div className={HEAD}>Right now → the fix</div>
            <div className="px-5 py-1">
              {byValue.filter(live).length ? (
                byValue.filter(live).map((d) => <Cause key={d.title} d={d} fixFor={fixFor} asin={n.asin} />)
              ) : (
                <div className="py-3 text-sm text-success-700">{g < 0 ? "Resolved · nothing live" : "On track"}</div>
              )}
            </div>
          </div>
          <AllyFeedback key={n.id} id={`michelle:business:${n.id}`} sku={n.name} author="Michelle Ortiz" />
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          <div className={BOX}>
            <div className={HEAD}>What&apos;s wrong{n.id === root.id ? "" : ` in ${n.name}`}</div>
            <div className="px-5 py-1">
              {byValue.map((d) => (
                <Cause key={d.title} d={d} fixFor={fixFor} />
              ))}
            </div>
          </div>
          <div className={BOX}>
            <div className={HEAD}>
              Top {Math.min(5, ranked.length)} {belowNoun} {businessSort === "sales" ? "by sales" : "behind plan"}
            </div>
            {top.map((x) => {
              const xg = gapOf(x)
              const c = topCause(x)
              return (
                <button
                  key={x.id}
                  type="button"
                  onClick={() => onSelect(x.id)}
                  className="flex w-full items-center gap-3 border-t border-slate-100 px-5 py-3 text-left first-of-type:border-t-0 hover:bg-slate-25"
                >
                  {x.asin && <img src={candleThumbnail(x.asin)} alt="" className="size-8 shrink-0 rounded-md object-cover ring-1 ring-slate-200" />}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-950">
                      {x.name}
                      {brandOf(x) && n.level !== "Brand" && <span className="font-normal text-slate-500"> · {brandOf(x)}</span>}
                    </span>
                    {c && (
                      <span className="block truncate text-xs text-slate-500">
                        {c.title} · <span className={STATE[c.tag]}>{c.tag.toLowerCase()}</span>
                      </span>
                    )}
                  </span>
                  <span className={cn("shrink-0 font-mono text-sm font-semibold", xg < 0 ? "text-error-600" : "text-success-700")}>{m(xg, true)}</span>
                  <ChevronRight className="size-4 shrink-0 text-slate-300" />
                </button>
              )
            })}
            {ranked.length > 5 && (
              <button type="button" onClick={() => setAll((a) => !a)} className="w-full border-t border-slate-100 px-5 py-2.5 text-left text-sm text-slate-500 hover:text-brand-700">
                {all ? "Show the top 5" : `Show all ${ranked.length}`}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => ask(analysis, n.id)} className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white px-4 py-2 text-sm text-brand-700 transition-colors hover:bg-brand-50">
          <Sparkles className="size-3.5" /> Run gap-to-plan analysis
        </button>
        <span className="text-xs text-slate-500">or ask about {n.id === root.id ? "the overall business" : n.name} in the bar below</span>
      </div>
      {/* Answers about what's open here appear here. */}
      <ChatThread anchor={n.id} className="mt-4" />
    </div>
  )
}
