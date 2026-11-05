"use client"

import { Fig, PageHeader, Signal } from "@/components/layout/page-header"
import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { PublishConfetti } from "@/components/home/publish-confetti"
import { TopStrip, useViewer } from "../top-strip"
import { BUSINESS, fmtBiz, fmtValue } from "../data"
import { DELIVERED } from "../delivered-periods"
import { useLive } from "../live-model"
import { money } from "../model"
import { useNudge } from "../nudge-context"
import { MiniWaterfall } from "../mini-waterfall"
import { QueueDelivered } from "../claire/delivered/bar-row"
import type { Stage } from "../mini-waterfall"
import { SplitBar } from "../mike/split-bar"
import { GROUPS } from "../mike/rail"
import { PRIMARY } from "../mike/buttons"
import { InboxFilters } from "../ops/ops-batch-list"
import type { InboxFilter } from "../ops/ops-batch-list"
import { useChat } from "../chat/inline-chat"
import { LEDGER, LOOP_DELIVERED, MEDIA_BATCHES, MONTH_GONE, PACING, PLAY_RULES, paceOf } from "./data"
import type { MediaBatch } from "./data"
import { budgetChip } from "./answers"
import { contentApproved } from "./content-link"
import { WhyIcon } from "../cs/why-icon"
import type { Why } from "../cs/data"
import { EditFeedback, MEDIA_REASONS, useLockedEdit } from "../edit-feedback"

const editId = (b: MediaBatch) => `james:${b.id}`

/** What each play used: Aurelle's context and what CommerceIQ learned across candle brands. */
const MEDIA_WHY: Record<string, Why[]> = {
  "media-rebalance": [
    { text: "Gift-set searches spike 3 weeks before Thanksgiving", scope: "Category", source: "Proven at 14 brands" },
    { text: "Q4 margin floor is 32%: the move stays above it", scope: "Brand", source: "Oct 2 call" },
    { text: "Priorities this quarter: gift sets, then Halloween", scope: "Brand", source: "Annual plan" },
  ],
  "media-harvest": [{ text: "When organic rank is top 3, paid adds little", scope: "Category", source: "Incrementality tests, 10 brands" }],
  "media-negative": [
    { text: "23 reviews on these 2 SKUs say smoky or left soot", scope: "Brand", source: "Review mining, content agent" },
    { text: "A claim reviews contradict sends paid clicks to 1-star reviews", scope: "Category", source: "Seen at 6 brands" },
  ],
  "media-protect": [
    { text: "These 7 pages convert at half the category rate", scope: "Brand", source: "Amazon Ads and the content agent" },
    { text: "Bidding on a weak page wastes about half the spend; fix the page, then fund it", scope: "Category", source: "Seen at 11 brands" },
  ],
}

const DOT = Object.fromEntries(GROUPS.map((g) => [g.tier, g.dot])) as Record<MediaBatch["tier"], string>
const HEAD = "text-xs font-medium text-slate-500"

/** James's top line: the same forecast, plan and gap as everyone's. */
export function JamesHeader() {
  const { viewer, visiting, home } = useViewer("james")
  const l = useLive()
  const { plan } = BUSINESS[l.period]
  const gap = l.pace(l.period) - plan
  return (
    <TopStrip
      person={viewer}
      home={home}
      greeting={visiting ? undefined : "Hi James"}
      crumbs={visiting ? [{ label: "Home", href: home }, { label: "James's queue" }] : undefined}
      period
      facts={
        <Link href="/michelle/gap" className="rounded hover:text-slate-900 hover:underline hover:decoration-slate-300 hover:underline-offset-4">
          Forecast <span className="font-semibold text-slate-950 tabular-nums">{fmtBiz(l.pace(l.period))}</span>
          <span className="text-slate-300"> · </span>
          Plan <span className="font-semibold text-slate-950 tabular-nums">{fmtBiz(plan)}</span>
          <span className="text-slate-300"> · </span>
          Gap{" "}
          <span className={gap < 0 ? "font-semibold text-error-600 tabular-nums" : "font-semibold text-success-700 tabular-nums"}>
            {gap < 0 ? "−" : "+"}
            {fmtBiz(Math.abs(gap))}
          </span>
        </Link>
      }
    />
  )
}

/** Media's headline in Claire's words, for his slice, beside the quarter's waterfall. */
export function MediaProgress({ celebrate, stage, onStage }: { celebrate: { value: number; label: string } | null; stage?: Stage; onStage?: (s: Exclude<Stage, "banked">) => void }) {
  const { approved } = useNudge()
  const { mvp, pace, period } = useLive()
  const open = (tier: MediaBatch["tier"]) => MEDIA_BATCHES.filter((b) => b.tier === tier && !approved[b.id]).reduce((s, b) => s + b.value, 0)
  const acted = MEDIA_BATCHES.filter((b) => b.tier !== "autopilot" && approved[b.id]).reduce((s, b) => s + b.value, 0)
  const total = MEDIA_BATCHES.reduce((s, b) => s + b.value, 0) - acted
  const left = open("approval")
  const anyDone = MEDIA_BATCHES.some((b) => b.tier === "approval" && approved[b.id])
  const jump = (s: Stage) => {
    if (s === "banked") return document.getElementById("media-delivered")?.scrollIntoView({ behavior: "smooth", block: "start" })
    onStage?.(s)
  }
  if (mvp) {
    // The MVP: the gap to plan that ranks the queue, then what waits on him; no projected dollars.
    const gap = BUSINESS[period].plan - pace(period)
    const waiting = MEDIA_BATCHES.filter((b) => b.tier !== "autopilot" && !approved[b.id])
    const oneApproval = waiting.filter((b) => b.tier === "approval")
    return (
      <PageHeader
        eyebrow={
          <>
            {gap > 0 && (
              <>
                <Fig>{fmtBiz(gap)}</Fig> gap to plan ·{" "}
              </>
            )}
            <Fig>{waiting.length}</Fig> plays waiting on you
          </>
        }
        title={oneApproval.length ? `${oneApproval.length} ${oneApproval.length === 1 ? "is" : "are"} one approval away.` : "Everything one approval away is approved."}
        signals={!approved["media-build"] && <Signal tone="warning">14 keywords from content are waiting for budget</Signal>}
        aside={
          celebrate && (
            <div className="relative text-sm font-semibold text-success-700">
              {celebrate.label}
              <div className="absolute -top-1 left-0 size-16">
                <PublishConfetti />
              </div>
            </div>
          )
        }
      />
    )
  }
  return (
    <>
      <PageHeader
        eyebrow={
          <>
            <Fig>{money(total)}</Fig> of media opportunity is {acted > 0 ? "still " : ""}open this quarter
          </>
        }
        title={left > 0.005 ? `${money(left)} ${anyDone ? "still" : "is"} one approval from live.` : "Everything one approval away is approved."}
        signals={!approved["media-build"] && <Signal tone="warning">14 keywords from content are waiting for budget</Signal>}
        aside={
          <div className="w-[340px]">
            <MiniWaterfall values={{ autopilot: open("autopilot"), approval: left, input: open("input") }} highlight={stage ?? "approval"} onSelect={jump} />
          </div>
        }
      />
      <div className="relative border-y border-slate-200 bg-brand-25 px-10 py-4">
        <SplitBar
          banked={DELIVERED.quarter.media.delivered}
          unlocked={acted}
          open={total}
          aside={
            celebrate && (
              <div className="relative text-sm font-semibold text-success-700">
                +{money(celebrate.value)} · {celebrate.label}
                <div className="absolute -top-1 left-0 size-16">
                  <PublishConfetti />
                </div>
              </div>
            )
          }
        />
      </div>
    </>
  )
}

/** The order of the inbox: open work first (approval, then input), done next, autopilot last; then dollars. */
export function mediaRows(approved: Record<string, boolean>, filter: InboxFilter) {
  const rank = (b: MediaBatch) => (b.tier === "autopilot" ? 3 : approved[b.id] ? 2 : b.tier === "approval" ? 0 : 1)
  return MEDIA_BATCHES.filter((b) => filter === "all" || b.tier === filter).sort((x, y) => rank(x) - rank(y) || y.value - x.value)
}

/** Whether a play waits on content, and the line that says so. */
function waits(b: MediaBatch, approved: Record<string, boolean>) {
  if (!b.waitsOn) return undefined
  const ready = contentApproved(approved, b.waitsOn.batch)
  return { ready, text: ready ? b.waitsOn.ready : b.waitsOn.waiting }
}

export function MediaList({ selectedId, filter, onFilter, onSelect }: { selectedId: string; filter: InboxFilter; onFilter: (f: InboxFilter) => void; onSelect: (id: string) => void }) {
  const { approved } = useNudge()
  const { mvp } = useLive()
  return (
    <div className="bg-white">
      <InboxFilters filter={filter} onFilter={onFilter} />
      <div className="flex flex-col">
        {mediaRows(approved, filter).map((b) => {
          const done = !!approved[b.id]
          const w = waits(b, approved)
          const status =
            b.tier === "autopilot" ? (
              <span className="text-slate-500">Running</span>
            ) : done ? (
              <span className="inline-flex items-center gap-1 text-success-700">
                <Check className="size-3" />
                {b.doneLabel}
              </span>
            ) : w?.ready ? (
              <span className="text-brand-700">Ready</span>
            ) : null
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => onSelect(b.id)}
              className={cn(
                "grid w-full grid-cols-[8px_minmax(0,1fr)_auto] items-baseline gap-x-2.5 border-b border-slate-100 py-2.5 pr-4 pl-10 text-left outline-none hover:bg-slate-50 focus-visible:bg-slate-50",
                selectedId === b.id && "bg-slate-50 shadow-[inset_2px_0_0_var(--color-brand-500)]",
              )}
            >
              <span className={cn("size-2 -translate-y-px rounded-full", DOT[b.tier])} />
              <span className="min-w-0">
                <span className={cn("block text-[14px] leading-snug", b.tier === "autopilot" ? "text-slate-500" : "font-medium text-slate-950")}>{b.name}</span>
                <span className="mt-0.5 flex items-center gap-1.5 text-xs whitespace-nowrap text-slate-500">
                  <span>
                    {b.count.toLocaleString("en-US")} {b.noun}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="min-w-0 truncate">{b.play}</span>
                </span>
              </span>
              <span className="text-right">
                {/* The MVP shows no value here: the order (by gap to plan) says what matters most. */}
                {!mvp && <span className={cn("block font-mono text-[14px] font-semibold tabular-nums", done ? "text-success-700" : b.tier === "autopilot" ? "text-slate-500" : "text-slate-950")}>{fmtValue(b.value)}</span>}
                {status && <span className="mt-0.5 block text-xs font-medium whitespace-nowrap">{status}</span>}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** One play: what Ally found, what it does, the changes, then one action. */
export function MediaDetail({ batch, onAction }: { batch: MediaBatch; onAction: (b: MediaBatch) => void }) {
  const { approved } = useNudge()
  const { mvp, actionImpact } = useLive()
  const { ask } = useChat()
  const done = !!approved[batch.id]
  const w = waits(batch, approved)
  // James's locked edit, one "keyword: value" per line, stands in for what Ally set.
  const lockedEdit = useLockedEdit(editId(batch))?.edit
  const edited = lockedEdit
    ? Object.fromEntries(
        lockedEdit
          .split("\n")
          .map((l) => [l.slice(0, l.lastIndexOf(":")).trim(), l.slice(l.lastIndexOf(":") + 1).trim()])
          .filter(([k, v]) => k && v),
      )
    : undefined
  return (
    <div className="flex min-w-0 flex-col gap-6 px-10 py-8">
      <div className="flex items-start justify-between gap-8">
        <div className="min-w-0">
          <div className="text-sm font-medium text-slate-500">{batch.play}</div>
          <div className="mt-0.5 flex items-center gap-1 text-2xl font-semibold tracking-tight text-slate-950">
            {batch.name}
            {MEDIA_WHY[batch.id] && <WhyIcon why={MEDIA_WHY[batch.id]} align="left" />}
          </div>
          {w && !done && <div className={cn("mt-1 text-sm font-medium", w.ready ? "text-brand-700" : "text-slate-500")}>{w.text}</div>}
        </div>
        {mvp ? (
          <div className="shrink-0 text-right">
            <div className="text-[28px] font-bold tracking-tight text-slate-950">{actionImpact(batch.value)}</div>
            <div className="mt-0.5 text-sm text-slate-500">{batch.spend ? `${batch.spend} · ` : ""}impact on the gap to plan</div>
          </div>
        ) : (
          <div className="shrink-0 text-right">
            <div className={cn("font-mono text-[28px] font-bold tracking-tight tabular-nums", done ? "text-success-700" : "text-slate-950")}>+{fmtValue(batch.value)}</div>
            <div className="mt-0.5 text-sm text-slate-500">{batch.spend ? `${batch.spend} · ` : ""}incremental sales</div>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <div className={HEAD}>What Ally found</div>
          <ul className="mt-2 flex flex-col gap-1.5 text-[15px] text-slate-700">
            {batch.found.map((f) => (
              <li key={f} className="flex gap-2">
                <span className="mt-2 size-1 shrink-0 rounded-full bg-slate-400" />
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className={HEAD}>{batch.tier === "autopilot" ? "What Ally does, on its own" : "What Ally will do"}</div>
          <ul className="mt-2 flex flex-col gap-1.5 text-[15px] text-slate-700">
            {batch.does.map((f) => (
              <li key={f} className="flex gap-2">
                <span className="mt-2 size-1 shrink-0 rounded-full bg-slate-400" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {batch.timeline && (
        <div>
          <div className={HEAD}>On and off with the pages</div>
          <ol className="mt-2 grid gap-2 sm:grid-cols-3">
            {batch.timeline.map((t) => (
              <li key={t.date} className="rounded-lg bg-slate-25 px-3 py-2 ring-1 ring-slate-100">
                <span className="block font-mono text-xs text-slate-500">{t.date}</span>
                <span className="mt-0.5 block text-sm text-slate-950">{t.text}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {batch.changes && (
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <div className="grid grid-cols-[minmax(0,1fr)_90px_110px_minmax(0,220px)] gap-4 border-b border-slate-100 bg-slate-25 px-5 py-2.5">
            <span className={HEAD}>{batch.play === "Rebalance" ? "Category" : "Keyword"}</span>
            <span className={`${HEAD} text-right`}>Now</span>
            <span className={`${HEAD} text-right`}>{edited ? "James set" : batch.tier === "autopilot" ? "Ally set" : "Ally sets"}</span>
            <span className={HEAD}>Why</span>
          </div>
          {batch.changes.map((c) => (
            <div key={c.what} className="grid grid-cols-[minmax(0,1fr)_90px_110px_minmax(0,220px)] items-baseline gap-4 border-b border-slate-100 px-5 py-2.5 text-sm last:border-b-0">
              <span className="min-w-0 truncate font-medium text-slate-950">{c.what}</span>
              <span className="text-right font-mono whitespace-nowrap text-slate-500 tabular-nums">{c.from}</span>
              <span className="text-right font-mono whitespace-nowrap text-slate-950 tabular-nums">{edited?.[c.what] ?? c.to}</span>
              <span className="min-w-0 text-slate-500">{c.why}</span>
            </div>
          ))}
          {batch.count > batch.changes.length && batch.play !== "Rebalance" && batch.play !== "Launch" && (
            <div className="px-5 py-2 text-xs text-slate-500">
              Showing {batch.changes.length} of {batch.count} {batch.noun}
            </div>
          )}
          {!done && (
            <div className="border-t border-slate-100 px-5 py-3">
              <EditFeedback
                key={batch.id}
                id={editId(batch)}
                label="changes"
                value={batch.changes.map((c) => `${c.what}: ${c.to}`).join("\n")}
                multiline
                reasons={MEDIA_REASONS}
                subject={batch.name}
                author="James Okafor"
                applies="Ally applies it to similar moves"
                placeholder={'Add details (optional), e.g. "Keep gift-term bids under $3 until the pages are fixed"'}
              />
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {batch.tier === "autopilot" ? (
          <span className="text-sm text-slate-500">
            On autopilot · <Link href="/settings?tab=policy" className="font-medium text-brand-700 hover:underline">Change in Teach Ally</Link>
          </span>
        ) : done ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-success-700">
            <Check className="size-4" /> {batch.doneLabel}
            {w && !w.ready ? " · starts when the pages go live" : " · Ally starts within the hour"}
          </span>
        ) : batch.tier === "input" ? (
          <button type="button" onClick={() => ask(budgetChip("james"))} className={PRIMARY}>
            {batch.cta}
          </button>
        ) : (
          <button type="button" onClick={() => onAction(batch)} className={PRIMARY}>
            {batch.cta}
          </button>
        )}
      </div>
    </div>
  )
}

/** October budget by category: a track per category, the tick at how much of the month has gone. */
export function PacingSection() {
  return (
    <section className="px-10 pt-8 pb-8">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight text-slate-950">October pacing by category</h2>
        <span className="text-sm text-slate-500">
          <span className="font-mono">{MONTH_GONE}%</span> of the month gone
        </span>
      </div>
      {/* Scrolls on its own below ~900px, so the tracks never collapse. */}
      <div className="overflow-x-auto">
      <div className="min-w-[820px]">
      <div className="mt-4 grid grid-cols-[140px_minmax(0,1fr)_100px_110px_minmax(0,260px)] gap-x-5 border-b border-slate-100 pb-2">
        <span className={HEAD}>Category</span>
        <span className={HEAD}>Spent</span>
        <span className={`${HEAD} text-right`}>Budget</span>
        <span className={HEAD}>Pace</span>
        <span className={HEAD}>What Ally does</span>
      </div>
      {PACING.map((p) => {
        const { pct, state } = paceOf(p.budget, p.spent)
        return (
          <div key={p.category} className="grid grid-cols-[140px_minmax(0,1fr)_100px_110px_minmax(0,260px)] items-center gap-x-5 border-b border-slate-100 py-3 text-sm">
            <span className="font-medium text-slate-950">{p.category}</span>
            <span className="flex items-center gap-3">
              <span className="relative h-2 flex-1 rounded-full bg-slate-100">
                <span className={cn("absolute inset-y-0 left-0 rounded-full", state === "On pace" ? "bg-slate-400" : "bg-warning-500")} style={{ width: `${Math.min(pct, 100)}%` }} />
                <span className="absolute -top-1 h-4 w-0.5 bg-slate-950" style={{ left: `${MONTH_GONE}%` }} aria-hidden />
              </span>
              <span className="w-16 text-right font-mono text-slate-950 tabular-nums">${p.spent}K</span>
            </span>
            <span className="text-right font-mono text-slate-500 tabular-nums">${p.budget}K</span>
            <span className={cn("font-medium", state === "On pace" ? "text-slate-500" : "text-warning-700")}>{state}</span>
            <span className="text-slate-700">{p.does}</span>
          </div>
        )
      })}
      </div>
      </div>
    </section>
  )
}

/** The ledger both agents read and write: each keyword, where it stands organically and on paid, and the play. */
export function LedgerSection() {
  const { approved } = useNudge()
  return (
    <section className="px-10 pt-8 pb-8">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight text-slate-950">Keywords, content and media together</h2>
        <span className="text-sm text-slate-500">{LEDGER.length} of 1,400 keywords</span>
      </div>
      {/* The rule behind each play, once, above the table. */}
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-slate-500">
        {PLAY_RULES.map((r) => (
          <span key={r.play}>
            <span className="font-semibold text-slate-950">{r.play}</span> · {r.when}
          </span>
        ))}
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left">
              <th className={`${HEAD} pb-2`}>Keyword</th>
              <th className={`${HEAD} pb-2`}>On the page</th>
              <th className={`${HEAD} pb-2 text-right`}>Organic rank</th>
              <th className={`${HEAD} pb-2 text-right`}>Share of voice</th>
              <th className={`${HEAD} pb-2 text-right`}>Paid return</th>
              <th className={`${HEAD} pb-2 pl-6`}>Play</th>
              <th className={`${HEAD} pb-2`}>Status</th>
            </tr>
          </thead>
          <tbody>
            {LEDGER.map((r) => {
              // Build waits for Mike's pages; once he approves them, the bids are ready.
              const status = r.play === "Build" ? (approved["media-build"] ? "Funded · bids up when live" : contentApproved(approved, "halloween") || contentApproved(approved, "gifts") ? "Pages approved · ready to fund" : r.status) : r.status
              return (
                <tr key={r.keyword} className="border-b border-slate-100">
                  <td className="py-2.5 pr-4">
                    <span className="block font-medium text-slate-950">{r.keyword}</span>
                    <span className="block text-xs text-slate-500">{r.category}</span>
                  </td>
                  <td className={cn("py-2.5 pr-4", r.onPage === "Missing" ? "text-slate-500" : "text-slate-700")}>{r.onPage}</td>
                  <td className="py-2.5 text-right font-mono text-slate-950 tabular-nums">#{r.organic}</td>
                  <td className="py-2.5 text-right font-mono text-slate-950 tabular-nums">{r.sov}%</td>
                  <td className="py-2.5 text-right font-mono text-slate-950 tabular-nums">${r.iroas.toFixed(2)}</td>
                  <td className="py-2.5 pl-6 font-medium text-slate-950">{r.play}</td>
                  <td className="py-2.5 text-slate-500">
                    {r.play === "Add to the page" ? (
                      <Link href="/mike?from=james" className="inline-flex items-center gap-1 font-medium text-brand-700 hover:underline">
                        {r.status} <ArrowRight className="size-3.5" />
                      </Link>
                    ) : (
                      status
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

/** What media delivered this quarter so far, with the part the content loop drove. */
export function MediaDelivered() {
  const { period } = useNudge()
  const d = DELIVERED[period]
  const m = d.media
  // The loop's share is only known for this quarter's keywords.
  const loop = period === "quarter" || period === "month" ? LOOP_DELIVERED : undefined
  // Media has no breakdown by play yet: Claire's Media row, on its own.
  return (
    <div id="media-delivered">
      <QueueDelivered
        flat
        label={d.label}
        rows={[{ name: "Media", did: m.reason, delivered: m.delivered, promised: m.promised }]}
        footer={loop !== undefined && <p className="text-[15px] text-slate-700">38 keywords harvested · $21K a week moved to them</p>}
      />
    </div>
  )
}

/** After approving a play: the toast, and what it hands to whom. */
export function approvedToast(b: MediaBatch) {
  toast.success(`${b.name} · approved · +${money(b.value)}`, { position: "top-right" })
}
