"use client"

import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { AS_OF, OPS_DAYS_SAVED, opsBatches, opsSkus } from "../data"
import { daysUntil } from "../model"
import { useNudge } from "../nudge-context"
import { GROUPS } from "../mike/rail"
import { useNote } from "./note-bar"
import { fillSkus } from "../sku-fill"
import { SkuFillList } from "../sku-fill-list"
import type { OpsBatch } from "../data"
import { useLive } from "../live-model"
import { IMPACT_RANK, type Impact } from "../mvp"

export type InboxFilter = "all" | "autopilot" | "approval" | "input"

interface OpsBatchListProps {
  selectedId: OpsBatch["id"]
  selectedSku: string | null
  expandedId: string | null
  checked: Record<string, Record<string, boolean>>
  filter: InboxFilter
  onFilter: (f: InboxFilter) => void
  onToggleExpand: (id: string) => void
  onSelect: (id: OpsBatch["id"]) => void
  onSelectSku: (batchId: string, asin: string) => void
}

const money = (s: string) => parseFloat(s.replace(/[$KM,]/g, "")) / (s.endsWith("K") ? 1000 : 1)
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
/** "Deal ends Oct 31" → "Oct 31"; a chip with no date has no deadline. */
const dueOf = (b: OpsBatch) => b.chip?.match(/[A-Z][a-z]{2} \d{1,2}$/)?.[0]
const dueRank = (d?: string) => (d ? MONTHS.indexOf(d.slice(0, 3)) * 100 + parseInt(d.slice(4)) : Infinity)
/** Days left, from the chip's date: the same "Expires in N days" as Mike's queue. */
const daysLeft = (b: OpsBatch) => {
  const d = dueOf(b)
  return d ? daysUntil(`${AS_OF.slice(0, 4)}-${String(MONTHS.indexOf(d.slice(0, 3)) + 1).padStart(2, "0")}-${d.slice(4).padStart(2, "0")}`, AS_OF) : undefined
}
const perDayOf = (b: OpsBatch) => (b.urgent ? (b.perDay ?? b.approveValue / OPS_DAYS_SAVED) : 0)

/** The waterfall's labels and colors, in the order of the work: what needs her first, autopilot last. */
const FILTERS: { id: InboxFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "approval", label: "One approval" },
  { id: "input", label: "Your input" },
  { id: "autopilot", label: "Autopilot" },
]
const DOT = Object.fromEntries(GROUPS.map((g) => [g.tier, g.dot])) as Record<OpsBatch["tier"], string>

/**
 * Michelle's inbox as a ledger: one row per issue, by urgency (the nearest deadline,
 * then losing money now, then value), with autopilot last. Effort is the dot;
 * the filters match the waterfall above. The open issue lists its SKUs under it.
 */
/**
 * The inbox's order, shared with the page so a filter can open its top row. With
 * `level` (the MVP), after the deadline: impact on the gap to plan, then effort
 * (one approval before your input), instead of money lost a day and value.
 */
export function inboxRows(all: OpsBatch[], approved: Record<string, boolean>, filter: InboxFilter, level?: (b: OpsBatch) => Impact) {
  const rank = (b: OpsBatch) => (b.tier === "autopilot" ? 2 : approved[b.id] ? 1 : 0)
  const effort = (b: OpsBatch) => (b.tier === "approval" ? 0 : 1)
  return all
    .filter((b) => filter === "all" || b.tier === filter)
    .sort(
      (x, y) =>
        rank(x) - rank(y) ||
        dueRank(dueOf(x)) - dueRank(dueOf(y)) ||
        (level ? IMPACT_RANK[level(x)] - IMPACT_RANK[level(y)] || effort(x) - effort(y) : perDayOf(y) - perDayOf(x)) ||
        money(y.value) - money(x.value),
    )
}

/** The MVP's level for one fix, from the live model: its share of the gap to plan. */
export function useOpsLevel() {
  const { mvp, actionImpact } = useLive()
  return mvp ? (b: OpsBatch) => actionImpact(money(b.value)) : undefined
}

export function OpsBatchList({ selectedId, selectedSku, expandedId, checked, filter, onFilter, onToggleExpand, onSelect, onSelectSku }: OpsBatchListProps) {
  const { approved, policy } = useNudge()
  const { notedIn } = useNote()
  const level = useOpsLevel()
  const all = opsBatches(policy)
  const rows = inboxRows(all, approved, filter, level)

  return (
    <div className="bg-white">
      <InboxFilters filter={filter} onFilter={onFilter} />
      {level && <div className="px-10 pt-1 pb-2 text-xs text-slate-500">Sorted by deadline, then impact on the gap to plan (High 5% of it or more, Medium 1.5%), then one approval before your input</div>}

      <div className="flex flex-col">
        {rows.map((b) => {
          const active = selectedId === b.id
          const done = !!approved[b.id]
          const noted = notedIn(b.id, b.skus)
          const days = daysLeft(b)
          // Under the value, the one thing that matters most: what happened, else when it expires (until sent, that outranks being in the note).
          const status =
            b.tier === "autopilot" ? (
              <span className="text-slate-500">Running</span>
            ) : done ? (
              <span className="inline-flex items-center gap-1 text-success-700">
                <Check className="size-3" />
                Sent
              </span>
            ) : days !== undefined ? (
              <span className="text-warning-700">Expires in {days} days</span>
            ) : noted > 0 ? (
              <span className="text-brand-700">In note</span>
            ) : null
          const skus = opsSkus(b)
          const count = b.tier === "input" ? b.inputCount : b.skus
          const noun = b.tier === "input" ? (b.inputNoun ?? "items") : "SKUs"
          return (
            <div key={b.id} className={cn("border-b border-slate-100", active && !selectedSku && "bg-slate-50 shadow-[inset_2px_0_0_var(--color-brand-500)]")}>
              {/* A row, not a button: the SKU count inside it is its own button. */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => onSelect(b.id)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onSelect(b.id))}
                className="grid w-full cursor-pointer focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-300 grid-cols-[8px_minmax(0,1fr)_auto] items-baseline gap-x-2.5 py-2.5 pr-4 pl-10 text-left outline-none hover:bg-slate-50 focus-visible:bg-slate-50"
              >
                <span className={cn("size-2 -translate-y-px rounded-full", DOT[b.tier])} aria-label={GROUPS.find((g) => g.tier === b.tier)?.label} />
                <span className="min-w-0">
                  <span className={cn("block text-[14px] leading-snug", b.tier === "autopilot" ? "text-slate-500" : "font-medium text-slate-950")}>{b.name}</span>
                  {/* Count first, so it lines up down the list; then the part. */}
                  <span className="mt-0.5 flex items-center gap-1.5 text-xs whitespace-nowrap text-slate-500">
                    {skus.length > 0 ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onToggleExpand(b.id)
                        }}
                        aria-expanded={expandedId === b.id}
                        className="inline-flex shrink-0 items-center gap-0.5 rounded outline-none hover:text-brand-700 focus-visible:ring-2 focus-visible:ring-brand-300"
                      >
                        {count} {noun}
                        <ChevronDown className={cn("size-3.5 transition-transform", expandedId === b.id && "rotate-180")} />
                      </button>
                    ) : (
                      <span>
                        {count} {noun}
                      </span>
                    )}
                    {b.partLabel && (
                      <>
                        <span className="text-slate-300">·</span>
                        <span className="min-w-0 truncate">{b.partLabel}</span>
                      </>
                    )}
                  </span>
                </span>
                {/* The money column: value, and under it the status or urgency. */}
                <span className="text-right">
                  {level ? (
                    // The MVP: its impact on the gap to plan, not what it's projected to recover.
                    <span className={cn("block text-[14px] font-semibold", b.tier === "autopilot" ? "text-slate-500" : "text-slate-950")}>
                      {level(b)}
                      <span className="text-xs font-normal text-slate-500"> impact</span>
                    </span>
                  ) : (
                    <span className={cn("block font-mono text-[14px] font-semibold tabular-nums", done ? "text-success-700" : b.tier === "autopilot" ? "text-slate-500" : "text-slate-950")}>{b.value}</span>
                  )}
                  {status && <span className="mt-0.5 block text-xs font-medium whitespace-nowrap tabular-nums">{status}</span>}
                </span>
              </div>
              {expandedId === b.id && skus.length > 0 && (
                <SkuFillList
                  rows={fillSkus(b.id, skus.map((x) => ({ id: x.asin, name: x.name })), b.skus)}
                  selectedId={selectedSku}
                  onSelect={(asin) => onSelectSku(b.id, asin)}
                  checked={(asin) => !!checked[b.id]?.[asin]}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** The inbox filters, shared by Mike's and Michelle's pages: the page's switch style, each part sized to its label. */
export function InboxFilters({ filter, onFilter }: { filter: InboxFilter; onFilter: (f: InboxFilter) => void }) {
  return (
      <div className="border-b border-slate-200 py-2.5 pr-4 pl-10">
        <div className="flex h-9 rounded-lg border border-slate-200 bg-slate-25 p-0.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onFilter(f.id)}
              aria-pressed={filter === f.id}
              className={cn(
                "inline-flex flex-auto items-center justify-center gap-1.5 rounded-md px-2 text-[13px] font-medium whitespace-nowrap transition-colors",
                filter === f.id ? "bg-white text-slate-950 shadow-xs ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-800",
              )}
            >
              {f.id !== "all" && <span className={cn("size-1.5 shrink-0 rounded-full", DOT[f.id])} />}
              {f.label}
            </button>
          ))}
        </div>
      </div>
  )
}
