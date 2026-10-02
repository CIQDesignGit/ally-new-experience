"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, Check, ChevronDown, ChevronRight, Loader2, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { OPS_BATCHES, fmtValue } from "../data"
import { playById } from "../market"
import { Points } from "../points"
import { ChatThread, useChat, useChatSource, useTurn } from "../chat/inline-chat"
import type { Chip } from "../chat/inline-chat"
import { useLaunch } from "../market/plays"
import { GAP_STEPS, GAP_TREE, GAP_WEEK, gapNode, pathTo } from "./gap-data"
import type { Driver, GapAction, GapNode, Recommendation } from "./gap-data"
import type { GapRecipe } from "../policy"
import { MemoryRecall } from "../chat/memory"
import { ActionCard, ActionRow } from "../ui/action"
import { PRIMARY } from "../mike/buttons"
import { DidYouKnow } from "../chat/agent-run"
import { BY, DEFAULT_RECIPE, FILL, FILL_STEP, RecipeFeedback, inMeasure, lbsOf, lessonText, unitsOf, useGapLesson } from "./gap-training"

/** $M → "$5.8K", "$1.32M"; signed when asked. */
const m = (v: number, signed = false) => {
  const abs = Math.abs(v)
  const s = abs >= 1 ? `$${+abs.toFixed(2)}M` : abs >= 0.1 ? `$${Math.round(abs * 1000)}K` : `$${+(abs * 1000).toFixed(1)}K`
  return signed ? `${v < 0 ? "−" : "+"}${s}` : s
}
const pct = (a: number, b: number) => `${Math.round((a / b) * 100)}%`

/* ------------------------------------------------------------------------- */
/* Rail: brands and categories, sales and gap                                 */
/* ------------------------------------------------------------------------- */

function TreeRow({ node, depth, selected, onSelect }: { node: GapNode; depth: number; selected: string; onSelect: (id: string) => void }) {
  // Open down to the SKUs of the first category, so the demo can reach a SKU in one click.
  const [open, setOpen] = useState(depth < 2 || node.id === "cat-jar")
  const gap = node.lastWeek.sales - node.lastWeek.plan
  const kids = node.children ?? []
  return (
    <div>
      <div
        className={cn("flex items-center gap-1.5 rounded-lg py-2 pr-3 transition-colors", selected === node.id ? "bg-slate-100 ring-1 ring-slate-200" : "hover:bg-slate-50")}
        style={{ paddingLeft: 10 + depth * 14 }}
      >
        {kids.length ? (
          <button type="button" onClick={() => setOpen((o) => !o)} aria-label={open ? "Collapse" : "Expand"} className="text-slate-400 hover:text-slate-700">
            <ChevronRight className={cn("size-4 transition-transform", open && "rotate-90")} />
          </button>
        ) : (
          <span className="w-4" />
        )}
        <button type="button" onClick={() => onSelect(node.id)} className="flex min-w-0 flex-1 items-baseline justify-between gap-2 text-left">
          <span className="min-w-0">
            <span className={cn("block truncate text-sm", node.level === "SKU" ? "text-slate-700" : "font-semibold text-slate-950")}>{node.name}</span>
            <span className="block text-[11px] text-slate-500">{node.asin ?? (node.level ? `${kids.length}${node.more ? `+${node.more}` : ""} ${node.level === "Brand" ? "categories" : "SKUs"}` : `${kids.length} brands`)}</span>
          </span>
          <span className="shrink-0 text-right">
            <span className="block font-mono text-[13px] font-semibold text-slate-950">{m(node.lastWeek.sales)}</span>
            <span className={cn("block font-mono text-[11px]", gap < 0 ? "text-error-600" : "text-success-700")}>{m(gap, true)}</span>
          </span>
        </button>
      </div>
      {open && kids.map((c) => <TreeRow key={c.id} node={c} depth={depth + 1} selected={selected} onSelect={onSelect} />)}
      {open && node.more && <div className="py-1.5 text-[11px] text-slate-400" style={{ paddingLeft: 34 + depth * 14 }}>and {node.more} more SKUs</div>}
    </div>
  )
}

export function GapTree({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  return (
    <div className="px-2 py-3">
      <div className="px-3 pb-2 text-xs text-slate-500">Last week vs plan · sorted by sales</div>
      <TreeRow node={GAP_TREE} depth={0} selected={selected} onSelect={onSelect} />
    </div>
  )
}

/* ------------------------------------------------------------------------- */
/* The analysis, as an answer in the page's conversation                       */
/* ------------------------------------------------------------------------- */

/**
 * The run, the way an agent shows its work: each step appears with a spinner and
 * turns into a check. The first five take a second or two (they read data); the
 * rest go quickly. Then it folds into one line you can open, and the answer follows.
 */
function Steps({ extra = [], measure = "sales", onDone }: { extra?: string[]; measure?: GapRecipe["measure"]; onDone?: () => void }) {
  const steps = [...GAP_STEPS.slice(0, -2), ...extra, ...GAP_STEPS.slice(-2)].map((st) => st.replace("by dollars", `by ${BY[measure]}`))
  // How long each step takes: slow for the data pulls, quick for the rest.
  const [plan] = useState(() => steps.map((_, i) => (i < 5 ? 1100 + ((i * 397) % 700) : 260 + ((i * 131) % 160))))
  const total = plan.reduce((a, b) => a + b, 0)
  // Reopened from history: already done, nothing replays.
  const restored = !!useTurn()?.restored
  const [ran, setRan] = useState(() => (restored ? steps.length : 0))
  const [open, setOpen] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const running = ran < steps.length
  useEffect(() => {
    if (restored) return
    const at = plan.reduce<number[]>((acc, ms) => [...acc, (acc[acc.length - 1] ?? 0) + ms], [])
    const ts = at.map((t, i) => window.setTimeout(() => setRan(i + 1), t))
    const tick = window.setInterval(() => setElapsed((e) => e + 1), 1000)
    ts.push(window.setTimeout(() => window.clearInterval(tick), total))
    return () => {
      ts.forEach(window.clearTimeout)
      window.clearInterval(tick)
    }
    // Once, when the answer starts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    if (!running) onDone?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])
  const secs = Math.max(1, Math.round(total / 1000))

  if (running)
    return (
      <div className="grid gap-5 text-sm md:grid-cols-[minmax(0,1fr)_280px]">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-slate-600">
          <Loader2 className="size-4 animate-spin text-brand-600" />
          <span className="font-medium text-slate-950">Analyzing</span>
          <span className="text-slate-400 tabular-nums">· {elapsed}s</span>
        </div>
        <ol className="mt-2 flex flex-col gap-1.5 border-l-2 border-slate-100 pl-4">
          {steps.slice(0, ran + 1).map((st, i) => (
            <motion.li key={st} initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="flex items-center gap-2">
              {i < ran ? <Check className="size-3.5 shrink-0 text-success-600" /> : <Loader2 className="size-3.5 shrink-0 animate-spin text-brand-600" />}
              <span className={i < ran ? "text-slate-500" : "text-slate-950"}>{st}</span>
              {extra.includes(st) && <span className="text-xs text-brand-700">you added</span>}
            </motion.li>
          ))}
        </ol>
      </div>
      <DidYouKnow className="self-start" />
      </div>
    )
  return (
    <div className="text-sm">
      <button type="button" onClick={() => setOpen((o) => !o)} className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900">
        <Check className="size-4 text-success-600" /> Analyzed in {steps.length} steps <span className="text-slate-400 tabular-nums">· {secs}s</span> <span className="text-slate-300">·</span>
        <span className="font-medium text-brand-700">{open ? "Hide steps" : "Show all steps"}</span>
        <ChevronDown className={cn("size-3.5 text-brand-700 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <ol className="mt-2 flex flex-col gap-1.5 border-l-2 border-slate-100 pl-4 text-slate-600">
          {steps.map((st, i) => (
            <li key={st} className={extra.includes(st) ? "text-slate-950" : undefined}>
              <span className="mr-2 font-mono text-xs text-slate-400">{i + 1}</span>
              {st}
              {extra.includes(st) && <span className="ml-2 text-xs text-brand-700">you added</span>}
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

export function ActionButton({ action, onInbox }: { action: GapAction; onInbox: (batchId: string) => void }) {
  const { launch, isLaunched } = useLaunch()
  const play = action.kind === "play" ? playById(action.playId) : undefined
  // Done replaces the button in place (DESIGN.md).
  if (play && isLaunched(play))
    return (
      <span className="inline-flex items-center gap-1.5 text-[14px] font-medium text-success-700">
        <Check className="size-4" /> Launched
      </span>
    )
  return (
    <button
      type="button"
      onClick={() => {
        if (action.kind === "inbox") onInbox(action.batchId)
        else if (play) launch([play])
        else toast.success(`${action.label}: Ally will tell you the moment it moves.`, { position: "top-right" })
      }}
      className={PRIMARY}
    >
      {action.label}
      <ArrowRight className="size-3.5" />
    </button>
  )
}

/** One color per cause state, shared with the gap page: live dark, worth watching amber, resolved faded. */
const DOT: Record<Driver["tag"], string> = { Live: "bg-slate-700", "Worth watching": "bg-warning-400", Resolved: "bg-slate-300" }
const SEC = "text-sm font-semibold text-slate-950"
const ROW = "border-t border-slate-100"

/** Gap-to-plan analysis for a node: the finding, plan vs actual, what moved sales, why (by dollars), and what to do. */
export function GapAnalysis({ node, onInbox, recipe: given, nested }: { node: GapNode; onInbox: (batchId: string) => void; /** A recipe being tried, before it's saved. */ recipe?: GapRecipe; /** Inside the before/after: no feedback row of its own. */ nested?: boolean }) {
  // What Ally knew when this was asked: a lesson saved later doesn't rewrite an earlier answer.
  const live = useGapLesson()
  const [lesson] = useState(live)
  // The answer waits for the run to finish, step by step.
  const [ready, setReady] = useState(false)
  const recipe = given ?? lesson?.recipe ?? DEFAULT_RECIPE
  const mm = (v: number, signed = false) => inMeasure(v, recipe.measure, signed)
  const fill = recipe.steps.includes(FILL_STEP)
  const gap = node.lastWeek.sales - node.lastWeek.plan
  // The added fill-rate step names the cause behind the stockout; the dollars stay with the stockout, so the total still ties.
  const drivers = [...node.drivers]
    .sort((a, b) => a.value - b.value)
    .map((d) => (fill && /out of stock/i.test(d.title) ? { ...d, points: [`Cause: fill rate ${FILL.rate}% on ${FILL.pos} POs (target ${FILL.target}%)`, ...d.points] } : d))
  const recs: Recommendation[] = fill
    ? [...node.recommendations, { title: `Claim the ${FILL.pos} short-shipped POs`, points: [`Fill rate ${FILL.rate}% vs ${FILL.target}% target`, "The same POs as Shorted POs in your queue"], action: { kind: "inbox", label: "Open the claims", batchId: "shorted-pos" } }]
    : node.recommendations
  const extra = (["units", "weight", "fill"] as const).filter((c) => recipe.columns.includes(c) && !(c === "units" && recipe.measure === "units") && !(c === "weight" && recipe.measure === "weight"))
  const cols = `minmax(0,1fr) repeat(${3 + extra.length}, 88px)`
  const top = drivers[0]
  const eq = node.equation
  const sign = (v: number) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v)}%`
  return (
    <div className="flex max-w-[900px] flex-col gap-5 rounded-2xl bg-white px-5 py-4 ring-1 ring-slate-200">
      {lesson && !given && (
        <MemoryRecall text={`${lessonText(lesson.recipe)}.`} from={`you taught Ally, ${lesson.date}`} />
      )}
      <Steps extra={recipe.steps} measure={recipe.measure} onDone={() => setReady(true)} />
      {ready && (
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="ally-reveal flex flex-col gap-5">
      <div className="flex flex-col gap-5">

      <div>
        <p className="text-[17px] leading-snug font-semibold text-slate-950">
          {gap < 0 ? "Missed" : "Beat"} plan by <span className={gap < 0 ? "text-error-600" : "text-success-700"}>{mm(Math.abs(gap))}</span> last week, {pct(node.lastWeek.sales, node.lastWeek.plan)} of plan.
        </p>
        {top && (
          <p className="mt-1 text-sm text-slate-600 tabular-nums">
            Biggest cause: {top.title.charAt(0).toLowerCase() + top.title.slice(1)} ({mm(top.value, true)}). This week is projected at {mm(node.eow.projected)}, {pct(node.eow.projected, node.eow.plan)} of plan.
          </p>
        )}
      </div>

      <div>
        <div className={SEC}>Plan vs actual</div>
        <div className="mt-2 text-sm tabular-nums">
          <div className="grid gap-3 pb-1.5 text-xs text-slate-500" style={{ gridTemplateColumns: cols }}>
            <span />
            <span className="text-right">Actual</span>
            <span className="text-right">Plan</span>
            <span className="text-right">Gap</span>
            {extra.map((c) => (
              <span key={c} className="text-right text-brand-700">
                {{ units: "Units", weight: "Weight", fill: "Fill rate" }[c]}
              </span>
            ))}
          </div>
          {[
            { k: `Last week · ${GAP_WEEK.last}`, a: node.lastWeek.sales, p: node.lastWeek.plan, lead: true },
            { k: `This week, projected · ${GAP_WEEK.current}`, a: node.eow.projected, p: node.eow.plan, lead: false },
          ].map((r) => (
            <div key={r.k} className={cn("grid gap-3 py-2", ROW)} style={{ gridTemplateColumns: cols }}>
              <span className="text-slate-700">{r.k}</span>
              <span className="text-right text-slate-950">{mm(r.a)}</span>
              <span className="text-right text-slate-500">{mm(r.p)}</span>
              <span className={cn("text-right font-semibold", r.lead && r.a < r.p ? "text-error-600" : "text-slate-950")}>{mm(r.a - r.p, true)}</span>
              {extra.map((c) => (
                <span key={c} className="text-right text-slate-950">
                  {c === "units" ? `${Math.round(unitsOf(r.a) / 1000)}K` : c === "weight" ? `${Math.round(lbsOf(r.a) / 1000)}K lbs` : r.lead ? `${FILL.rate}%` : "–"}
                </span>
              ))}
            </div>
          ))}
          <div className={cn("py-2 text-slate-500", ROW)}>
            Week to date <span className="font-semibold text-slate-950">{mm(node.wtd)}</span> · {Math.round(GAP_WEEK.elapsed * 100)}% of the week gone
          </div>
        </div>
      </div>

      <div>
        <div className={SEC}>What moved sales, vs the week before</div>
        <div className="mt-2 flex flex-wrap items-center gap-2.5 text-sm tabular-nums">
          {(
            [
              ["Traffic", eq.traffic],
              ["Conversion", eq.conversion],
              ["Price", eq.price],
            ] as const
          ).map(([k, v], i) => (
            <span key={k} className="flex items-center gap-2.5">
              {i > 0 && <span className="text-slate-400">×</span>}
              <span className="rounded-lg border border-slate-200 px-3 py-1.5 text-center">
                <span className="block font-semibold text-slate-950">{sign(v)}</span>
                <span className="block text-xs text-slate-500">{k}</span>
              </span>
            </span>
          ))}
          <span className="text-slate-400">=</span>
          <span className="rounded-lg bg-slate-900 px-3 py-1.5 text-center text-white">
            <span className="block font-semibold">{sign(eq.sales)}</span>
            <span className="block text-xs text-slate-300">Sales</span>
          </span>
        </div>
      </div>

      <div>
        <div className={SEC}>Why, by {recipe.measure === "sales" ? "dollars" : recipe.measure === "units" ? "units" : "weight"}</div>
        <div className="mt-2">
          {drivers.map((d) => (
            <div key={d.title} className={cn("grid grid-cols-[8px_minmax(0,1fr)_72px] items-baseline gap-x-3 py-2.5 text-sm", ROW)}>
              <span className={cn("size-2 -translate-y-px rounded-full", DOT[d.tag])} />
              <span className="min-w-0">
                <span className="block text-slate-950">{d.title}</span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  {d.tag}
                  {d.points.length > 0 && ` · ${d.points.join(" · ")}`}
                </span>
              </span>
              <span className="text-right font-semibold text-slate-950 tabular-nums">{mm(d.value, true)}</span>
            </div>
          ))}
        </div>
      </div>

      <ActionCard>
        {recs.map((r) => (
          <ActionRow key={r.title} title={r.title} detail={r.points.length > 0 ? r.points.join(" · ") : undefined} action={<ActionButton action={r.action} onInbox={onInbox} />} />
        ))}
      </ActionCard>
      {!nested && <RecipeFeedback node={node} render={(r) => <GapAnalysis node={node} onInbox={onInbox} recipe={r} nested />} />}
      </div>
      </motion.div>
      )}
    </div>
  )
}

/** Crawl history for a SKU node: who held the buy box on the latest crawls. */
function CrawlHistory({ node }: { node: GapNode }) {
  const sku = OPS_BATCHES.flatMap((b) => b.sellerSkus ?? []).find((s) => s.asin === node.asin)
  if (!sku)
    return (
      <div className="max-w-[900px] rounded-2xl bg-white px-5 py-4 text-[15px] text-slate-700 ring-1 ring-slate-200">
        No buy-box or availability issues on this SKU in last week&apos;s crawls: in stock and holding the buy box on all 84.
      </div>
    )
  return (
    <div className="flex max-w-[900px] flex-col gap-3 rounded-2xl bg-white px-5 py-4 ring-1 ring-slate-200">
      <p className="text-[15px] font-semibold text-slate-950">
        You held the buy box on 0 of the last {sku.crawls.length} crawls. {sku.sellers[0].name} held it on most, at ${sku.sellers[0].price.toFixed(2)} (your MAP floor is ${sku.map.toFixed(2)}).
      </p>
      <div className="overflow-hidden rounded-xl border border-slate-200 text-sm">
        {sku.crawls.map((c) => (
          <div key={c.when} className="grid grid-cols-[1fr_1fr_1fr] gap-2 border-t border-slate-100 px-4 py-2 first:border-t-0">
            <span className="text-slate-700">{c.when}</span>
            <span className="text-slate-500">{c.city}</span>
            <span className="font-medium text-slate-950">{c.winner}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------------- */
/* Right pane: the three numbers, "Explore more", and the conversation         */
/* ------------------------------------------------------------------------- */

function Card({ eyebrow, value, bad, lines }: { eyebrow: string; value: string; bad?: boolean; lines: string[] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3.5">
      <div className="font-mono text-[11px] tracking-wide text-slate-500 uppercase">{eyebrow}</div>
      <div className={cn("mt-1.5 font-mono text-2xl font-bold tracking-tight", bad ? "text-error-600" : "text-slate-950")}>{value}</div>
      <Points className="mt-1.5 text-[13px]" items={lines} />
    </div>
  )
}

export function GapDiagnostic({ nodeId, onInbox }: { nodeId: string; onInbox: (batchId: string) => void }) {
  const node = gapNode(nodeId)
  const { ask } = useChat()
  const gap = node.lastWeek.sales - node.lastWeek.plan
  const eowGap = node.eow.projected - node.eow.plan
  const path = pathTo(node.id) ?? []
  const chips: Chip[] = [
    { q: `Run gap-to-plan analysis for ${node.name} for last week`, render: () => <GapAnalysis node={node} onInbox={onInbox} /> },
    ...(node.level === "SKU" ? [{ q: `Last week's crawl history for ${node.name}`, render: () => <CrawlHistory node={node} /> }] : []),
  ]
  useChatSource({ about: node.name, chips }, node.id)

  return (
    <div className="flex min-w-0 flex-col px-10 py-8">
      <div className="text-sm font-medium text-slate-500">{[...path, node.level ?? "All brands"].join(" · ")}</div>
      <div className="mt-0.5 text-2xl font-semibold tracking-tight text-slate-950">{node.name}</div>
      {node.asin && <div className="mt-1 font-mono text-xs text-slate-500">{node.asin}</div>}

      <div className="mt-6 grid gap-3 lg:grid-cols-3">
        <Card
          eyebrow={`Last week · ${GAP_WEEK.last}`}
          value={m(gap, true)}
          bad={gap < 0}
          lines={[`${m(node.lastWeek.sales)} of ${m(node.lastWeek.plan)} plan`, `${pct(node.lastWeek.sales, node.lastWeek.plan)} of plan`]}
        />
        <Card eyebrow={`Week to date · ${GAP_WEEK.current}`} value={m(node.wtd)} lines={["in sales", `${Math.round(GAP_WEEK.elapsed * 100)}% of the week gone`]} />
        <Card
          eyebrow="Projected end of week"
          value={`${m(eowGap, true)}`}
          bad={eowGap < 0}
          lines={[`${m(node.eow.projected)} of ${m(node.eow.plan)} plan`, `${pct(node.eow.projected, node.eow.plan)} of plan`]}
        />
      </div>

      <div className="mt-6">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-brand-700">
          <Sparkles className="size-4" /> Explore more
        </div>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {chips.map((c) => (
            <button key={c.q} type="button" onClick={() => ask(c)} className="rounded-full border border-brand-200 bg-white px-4 py-2 text-sm text-brand-700 transition-colors hover:bg-brand-50">
              {c.q}
            </button>
          ))}
        </div>
      </div>

      <ChatThread className="mt-6 -mx-10 px-10" />
    </div>
  )
}

/** Value-at-risk check for the rail header. */
export const gapTotal = () => fmtValue(Math.abs(GAP_TREE.lastWeek.sales - GAP_TREE.lastWeek.plan))
