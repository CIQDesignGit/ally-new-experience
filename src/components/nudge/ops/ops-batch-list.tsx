"use client"

import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { candleThumbnail } from "@/lib/candle-thumbnails"
import { OPS_DAYS_SAVED, fmtValue, opsBatches, opsSkus } from "../data"
import { useNudge } from "../nudge-context"
import { GROUPS } from "../mike/rail"
import { useNote } from "./note-bar"
import type { OpsBatch } from "../data"

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
const perDayOf = (b: OpsBatch) => (b.urgent ? (b.perDay ?? b.approveValue / OPS_DAYS_SAVED) : 0)

/** The waterfall's labels and colors, in the order of the work: what needs her first, autopilot last. */
const FILTERS: { id: InboxFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "approval", label: "1 approval" },
  { id: "input", label: "Your input" },
  { id: "autopilot", label: "Autopilot" },
]
const DOT = Object.fromEntries(GROUPS.map((g) => [g.tier, g.dot])) as Record<OpsBatch["tier"], string>

/**
 * Michelle's inbox as a ledger: one row per issue, by urgency (losing money now,
 * then the nearest deadline, then value), with autopilot last. Effort is the dot;
 * the filters match the waterfall above. The open issue lists its SKUs under it.
 */
/** The inbox's order, shared with the page so a filter can open its top row. */
export function inboxRows(all: OpsBatch[], approved: Record<string, boolean>, filter: InboxFilter) {
  const rank = (b: OpsBatch) => (b.tier === "autopilot" ? 2 : approved[b.id] ? 1 : 0)
  return all
    .filter((b) => filter === "all" || b.tier === filter)
    .sort((x, y) => rank(x) - rank(y) || perDayOf(y) - perDayOf(x) || dueRank(dueOf(x)) - dueRank(dueOf(y)) || money(y.value) - money(x.value))
}

export function OpsBatchList({ selectedId, selectedSku, expandedId, checked, filter, onFilter, onToggleExpand, onSelect, onSelectSku }: OpsBatchListProps) {
  const { approved, policy } = useNudge()
  const { notedIn } = useNote()
  const all = opsBatches(policy)
  const rows = inboxRows(all, approved, filter)

  return (
    <div className="bg-white">
      {/* Same switch as Business / Ops at the top of the page: each part sized to its label, one font. */}
      <div className="border-b border-slate-200 px-3 py-2.5">
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

      <div className="flex flex-col">
        {rows.map((b) => {
          const active = selectedId === b.id
          const done = !!approved[b.id]
          const noted = notedIn(b.id, b.skus)
          const perDay = perDayOf(b)
          const due = dueOf(b)
          // Under the value, the one thing that matters most: what happened, else what it costs, else when it's due.
          const status =
            b.tier === "autopilot" ? (
              <span className="text-slate-500">Running</span>
            ) : done ? (
              <span className="inline-flex items-center gap-1 text-success-700">
                <Check className="size-3" />
                Sent
              </span>
            ) : noted > 0 ? (
              <span className="text-brand-700">In note</span>
            ) : perDay > 0 ? (
              <span className="text-error-600">−{fmtValue(perDay)} a day</span>
            ) : due ? (
              <span className="text-warning-700">{due}</span>
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
                className="grid w-full cursor-pointer focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-300 grid-cols-[8px_minmax(0,1fr)_auto] items-baseline gap-x-3 px-4 py-2.5 text-left outline-none hover:bg-slate-50 focus-visible:bg-slate-50"
              >
                <span className={cn("size-2 -translate-y-px rounded-full", DOT[b.tier])} aria-label={GROUPS.find((g) => g.tier === b.tier)?.label} />
                <span className="min-w-0">
                  <span className={cn("block text-[14px] leading-snug", b.tier === "autopilot" ? "text-slate-500" : "font-medium text-slate-950")}>{b.name}</span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                    {b.partLabel && (
                      <>
                        {b.partLabel}
                        <span className="text-slate-300">·</span>
                      </>
                    )}
                    {skus.length > 0 ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onToggleExpand(b.id)
                        }}
                        aria-expanded={expandedId === b.id}
                        className="inline-flex items-center gap-0.5 rounded outline-none hover:text-brand-700 focus-visible:ring-2 focus-visible:ring-brand-300"
                      >
                        {count} {noun}
                        <ChevronDown className={cn("size-3.5 transition-transform", expandedId === b.id && "rotate-180")} />
                      </button>
                    ) : (
                      <span>
                        {count} {noun}
                      </span>
                    )}
                  </span>
                </span>
                {/* The money column: value, and under it the status or urgency. */}
                <span className="text-right">
                  <span className={cn("block font-mono text-[14px] font-semibold tabular-nums", done ? "text-success-700" : b.tier === "autopilot" ? "text-slate-500" : "text-slate-950")}>{b.value}</span>
                  {status && <span className="mt-0.5 block text-xs font-medium whitespace-nowrap tabular-nums">{status}</span>}
                </span>
              </div>
              {expandedId === b.id && skus.length > 0 && (
                <div className="flex flex-col gap-0.5 px-3 pb-2">
                  {skus.map((s) => (
                    <button
                      key={s.asin}
                      type="button"
                      onClick={() => onSelectSku(b.id, s.asin)}
                      className={cn("flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left transition-colors", selectedSku === s.asin ? "bg-white ring-1 ring-slate-200" : "hover:bg-white")}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- local demo thumbnails */}
                      <img src={candleThumbnail(s.asin)} alt="" className="size-7 shrink-0 rounded object-cover ring-1 ring-slate-200" />
                      <span className="min-w-0 flex-1 text-[13px] leading-tight text-slate-950">{s.name}</span>
                      {checked[b.id]?.[s.asin] && <Check className="size-4 shrink-0 text-success-600" aria-label="Checked" />}
                    </button>
                  ))}
                  {skus.length < b.skus && <div className="px-2.5 pt-0.5 text-xs text-slate-500">{skus.length} of {b.skus}</div>}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
