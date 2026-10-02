"use client"

import { Fragment, useEffect, useRef, useState } from "react"
import { Check, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { PRIMARY } from "../mike/buttons"
import { candleThumbnail } from "@/lib/candle-thumbnails"
import { BUSINESS, contentBatches, fmtBiz, launchedIds, opsBatches } from "../data"
import { ITEM_ACTIVE, ITEM_IDLE } from "../mike/rail"
import { useLive } from "../live-model"
import { playById } from "../market"
import { useLaunch } from "../market/plays"
import { useNudge } from "../nudge-context"
import { useFireNudge } from "../use-fire-nudge"
import { toast } from "sonner"
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
  /** Once acted on: what was done, shown in place of the button. */
  acted?: string
}

// Fixes act in place (send, ask, approve); none navigates away.
function useFixes() {
  const { approved, approve, nudged, policy, note } = useNudge()
  const { launch, isLaunched } = useLaunch()
  const { fire } = useFireNudge()
  const ops = opsBatches(policy)
  const content = contentBatches(policy, launchedIds(approved))
  return (fix: Fix, asin?: string): FixView | undefined => {
    if (fix.kind === "ops") {
      const b = ops.find((x) => x.id === fix.id) ?? ops.find((x) => x.id.startsWith(fix.id))
      if (!b) return undefined
      const mine = note.filter((i) => i.batchId === b.id && (!asin || i.asin === asin))
      const sentOn = mine.find((i) => i.sentOn)?.sentOn
      const status = approved[b.id] || sentOn ? `sent to Amazon VM, ${sentOn ?? "Oct 8"}` : mine.length ? "in your note to Amazon VM · not sent" : "ready to review"
      return { lever: "ops", name: b.fixName ?? b.name, owner: "You", status, tone: approved[b.id] || sentOn ? "done" : mine.length ? "moving" : "todo", acted: approved[b.id] || sentOn ? "Sent to Amazon VM" : undefined, open: () => {
          approve(b.id)
          toast.success(`Sent to your Amazon vendor manager · ${b.fixName ?? b.name}, evidence attached`, { position: "top-right" })
        }, openLabel: "Send to Amazon VM" }
    }
    if (fix.kind === "content") {
      const b = content.find((x) => x.id === fix.id)
      if (!b) return undefined
      const done = !!approved[b.id]
      const pinged = b.nudgeKey && nudged[b.nudgeKey]
      const status = done ? (b.tier === "input" ? "sent to Ally" : "approved") : b.tier === "input" ? "waiting on your team" : pinged ? "nudged, waiting for approval" : "waiting for approval"
      return { lever: "content", name: b.fixName ?? b.name, owner: "Mike", status, tone: done ? "done" : b.tier === "input" ? "todo" : "moving", acted: done ? "Approved" : pinged ? "Asked Mike" : undefined, open: () => b.nudgeKey && fire({ agent: "content", analystName: "Mike", description: b.name, value: b.value, nudgeKey: b.nudgeKey }), openLabel: "Ask Mike to approve" }
    }
    const p = playById(fix.id)
    if (!p) return undefined
    const on = isLaunched(p)
    return { lever: p.owner === "human" ? "content" : p.owner, name: p.what, owner: p.owner === "media" ? "Ally for Media" : "Ally", status: on ? "launched" : "ready to launch", tone: on ? "moving" : "todo", acted: on ? "Approved" : undefined, open: () => launch([p]), openLabel: "Approve the bids" }
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
  const fixFor = useFixes()
  const found = findIn(root, nodeId) ?? { node: root, trail: [] }
  const n = found.node
  const g = gapOf(n)
  const eow = n.eow.projected - n.eow.plan
  const byValue = [...n.drivers].sort((a, b) => (g < 0 ? a.value - b.value : b.value - a.value))
  // What to focus on is what's still live (or worth watching), the biggest three; what's resolved is last week's story, in the analysis.
  const live = byValue.filter((d) => d.tag !== "Resolved").slice(0, 3)
  const label = n.id === root.id ? "the overall business" : n.name
  const analysis: Chip = { q: `Why did ${label === "the overall business" ? "we" : label} miss plan last week?`, render: () => <GapAnalysis node={n} onInbox={(id) => onOpenOps(id, n.asin)} /> }
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

      {/* Forward-looking by default: where this week lands and what closes the gap. Why last week missed is one click away (the analysis). */}
      <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
        {/* Forward first: where this week lands is the lead. Last week is the small link into why. */}
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-2 px-5 py-4">
          <div>
            <div className="text-xs font-medium text-slate-500">This week, projected</div>
            <div className="mt-0.5 flex items-baseline gap-2 tabular-nums">
              <span className={cn("text-[26px] font-semibold tracking-tight", eow < 0 ? "text-error-600" : "text-success-700")}>{m(eow, true)}</span>
              <span className="text-sm text-slate-500">
                {m(n.eow.projected)} of {m(n.eow.plan)} · {pct(n.eow.projected, n.eow.plan)} · {m(n.wtd)} so far
              </span>
            </div>
          </div>
          <button type="button" onClick={() => ask(analysis, n.id)} className="text-sm text-slate-500 tabular-nums hover:text-brand-700">
            Last week <span className={cn("font-semibold", g < 0 ? "text-error-600" : "text-success-700")}>{m(g, true)}</span> · {pct(n.lastWeek.sales, n.lastWeek.plan)} · <span className="font-medium text-brand-700">Why did we miss? →</span>
          </button>
        </div>

        {live.length > 0 ? (
          <div className="border-t border-slate-100 px-5 py-4">
            <div className="text-xs font-medium text-slate-500">Focus on this week</div>
            <ul className="mt-2 flex flex-col gap-2.5">
              {live.map((d) => {
                const f = d.fix && fixFor(d.fix, n.asin)
                return (
                  <li key={d.title} className="grid grid-cols-[minmax(0,1fr)_72px_200px] items-center gap-x-4 text-sm">
                    <span className="min-w-0">
                      <span className="block text-slate-950">{d.title}</span>
                      {/* Once acted on, the done label on the right says it; the line keeps only what and who. */}
                      {f && <span className="mt-0.5 block text-[13px] text-slate-500">{f.name} · {f.acted ? f.owner : `${f.owner}, ${f.status}`}</span>}
                    </span>
                    <span className="text-right font-semibold text-slate-950 tabular-nums">{m(d.value, true)}</span>
                    {/* Every action is purple (DESIGN.md); peers share one width. */}
                    <span className="flex justify-end [&>button]:w-full">
                      {f?.acted ? (
                        <span className="inline-flex items-center gap-1.5 text-[14px] font-medium text-success-700">
                          <Check className="size-4" /> {f.acted}
                        </span>
                      ) : f ? (
                        <button type="button" onClick={f.open} className={PRIMARY}>
                          {f.openLabel}
                        </button>
                      ) : null}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        ) : (
          <div className="border-t border-slate-100 px-5 py-3 text-sm text-success-700">On track · nothing pulling it below plan</div>
        )}

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
