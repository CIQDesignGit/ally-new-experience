"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Copy } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import type { MoverRow } from "./data"
import { Trend } from "./trend"
import { cn } from "@/lib/utils"

/** Row-level insets so the table can run full bleed inside each panel. */
const INSET_L = "pl-2 sm:pl-4"
const INSET_R = "pr-4 sm:pr-10"
const PAGE_SIZE = 3
/** Demo total so pagination reads like classic Business overview. */
const DEMO_TOTAL = 12

function MetricCell({ delta, pct }: { delta: string; pct: number | null }) {
  return (
    <div className="flex flex-col items-end gap-0.5">
      <p className="font-mono text-sm text-slate-950 tabular-nums">{delta}</p>
      <Trend pct={pct} />
    </div>
  )
}

function MoverRowView({ row }: { row: MoverRow }) {
  return (
    <tr className="border-t border-slate-200">
      <td className={cn("w-9 py-3 pr-2 align-top", INSET_L)}>
        <Checkbox aria-label={`Select ${row.id}`} />
      </td>
      <td className="min-w-[10.5rem] py-3 pr-4 align-top">
        <div className="flex gap-3">
          <img
            src={row.image}
            alt=""
            className="size-12 shrink-0 rounded-md object-cover ring-1 ring-slate-200 sm:size-14"
          />
          <div className="min-w-0">
            <p className="line-clamp-2 text-sm font-medium text-slate-950">{row.name}</p>
            <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0 text-xs">
              <span className="inline-flex items-center gap-1 font-mono text-slate-500">
                {row.id}
                <button type="button" className="text-slate-400 hover:text-slate-700" aria-label={`Copy ${row.id}`}>
                  <Copy className="size-3" />
                </button>
              </span>
              <span className="text-slate-300" aria-hidden>
                ·
              </span>
              <button
                type="button"
                className="font-medium whitespace-nowrap text-brand-700 hover:text-brand-800 hover:underline"
                aria-label={`View ${row.recs} recommendations`}
              >
                {row.recs} recs
              </button>
            </div>
          </div>
        </div>
      </td>
      <td className="w-[5.5rem] py-3 pr-2 text-right align-top font-mono text-sm whitespace-nowrap text-slate-950 tabular-nums sm:w-24 sm:pr-3">
        {row.ops}
      </td>
      <td className="w-[5.5rem] py-3 pr-2 text-right align-top whitespace-nowrap sm:w-24 sm:pr-3">
        <MetricCell delta={row.vsCompare.delta} pct={row.vsCompare.pct} />
      </td>
      <td className={cn("w-[5.5rem] py-3 text-right align-top whitespace-nowrap sm:w-24", INSET_R)}>
        {row.vsLy ? (
          <MetricCell delta={row.vsLy.delta} pct={row.vsLy.pct} />
        ) : (
          <span className="block text-sm text-slate-400">NA</span>
        )}
      </td>
    </tr>
  )
}

export function MoverTable({ rows }: { rows: MoverRow[] }) {
  return (
    <table className="w-full min-w-[26.5rem] border-collapse text-left">
      <thead>
        <tr className="text-xs font-medium text-slate-500">
          <th className={cn("w-9 pb-2", INSET_L)} scope="col" aria-label="Select" />
          <th className="pb-2 pr-4 font-medium" scope="col">
            SKU
          </th>
          <th className="w-[5.5rem] pb-2 pr-2 text-right font-normal whitespace-nowrap sm:w-24 sm:pr-3" scope="col">
            OPS
          </th>
          <th className="w-[5.5rem] pb-2 pr-2 text-right font-normal whitespace-nowrap sm:w-24 sm:pr-3" scope="col">
            Vs comparison
          </th>
          <th className={cn("w-[5.5rem] pb-2 text-right font-normal whitespace-nowrap sm:w-24", INSET_R)} scope="col">
            Vs last year
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <MoverRowView key={r.id} row={r} />
        ))}
      </tbody>
    </table>
  )
}

function MoverPagination({
  page,
  totalPages,
  rangeStart,
  rangeEnd,
  total,
  onPageChange,
}: {
  page: number
  totalPages: number
  rangeStart: number
  rangeEnd: number
  total: number
  onPageChange: (page: number) => void
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 border-t border-slate-100 py-2.5",
        INSET_L,
        INSET_R,
      )}
    >
      <p className="text-xs text-slate-500">
        <span className="font-medium tabular-nums text-slate-700">
          {rangeStart}–{rangeEnd}
        </span>{" "}
        of <span className="font-medium tabular-nums text-slate-700">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex size-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="min-w-[3.5rem] text-center font-mono text-xs tabular-nums text-slate-600">
          {page}/{totalPages}
        </span>
        <button
          type="button"
          aria-label="Next page"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex size-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  )
}

export function MoverPanel({ title, rows }: { title: string; rows: MoverRow[] }) {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(DEMO_TOTAL / PAGE_SIZE))
  const rangeStart = (page - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(page * PAGE_SIZE, DEMO_TOTAL)
  // Prototype: cycle the mock rows when paging past the seeded list.
  const offset = ((page - 1) * PAGE_SIZE) % rows.length
  const pageRows = Array.from({ length: Math.min(PAGE_SIZE, rows.length) }, (_, i) => rows[(offset + i) % rows.length])

  return (
    <section
      className={cn(
        "flex min-w-0 flex-1 flex-col border-b border-slate-200 last:border-b-0",
        "@[52rem]:w-1/2 @[52rem]:border-b-0 @[52rem]:border-r @[52rem]:last:border-r-0",
      )}
    >
      <div className={cn("border-b border-slate-100 py-2.5 pr-4 sm:pr-10", INSET_L)}>
        <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      </div>
      <div className="min-w-0 flex-1 overflow-x-auto overscroll-x-contain py-3">
        <MoverTable rows={pageRows} />
      </div>
      <MoverPagination
        page={page}
        totalPages={totalPages}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        total={DEMO_TOTAL}
        onPageChange={setPage}
      />
    </section>
  )
}