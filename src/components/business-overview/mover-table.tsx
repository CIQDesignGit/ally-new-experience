"use client"

import { Bell, Copy } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import type { MoverRow } from "./data"
import { Trend } from "./trend"

function MoverRowView({ row }: { row: MoverRow }) {
  return (
    <tr className="border-t border-slate-200">
      <td className="w-8 py-3 pr-2 align-top">
        <Checkbox aria-label={`Select ${row.id}`} />
      </td>
      <td className="max-w-0 py-3 pr-4 align-top">
        <div className="flex min-w-[12rem] gap-3">
          <img src={row.image} alt="" className="size-14 shrink-0 rounded-md object-cover ring-1 ring-slate-200" />
          <div className="min-w-0">
            <p className="line-clamp-2 text-sm font-medium text-slate-950">{row.name}</p>
            <p className="mt-0.5 flex items-center gap-1 font-mono text-xs text-slate-500">
              {row.id}
              <button type="button" className="text-slate-400 hover:text-slate-700" aria-label={`Copy ${row.id}`}>
                <Copy className="size-3" />
              </button>
            </p>
            <button type="button" className="mt-1 inline-flex max-w-full items-center gap-1 text-left text-xs font-medium text-brand-700 hover:underline">
              <Bell className="size-3 shrink-0" aria-hidden /> View {row.recs} recommendations
            </button>
          </div>
        </div>
      </td>
      <td className="w-28 py-3 pr-3 text-right align-top font-mono text-sm whitespace-nowrap text-slate-950 tabular-nums">{row.ops}</td>
      <td className="w-28 py-3 pr-3 text-right align-top whitespace-nowrap">
        <p className="font-mono text-sm text-slate-950 tabular-nums">{row.vsCompare.delta}</p>
        <Trend pct={row.vsCompare.pct} className="justify-end" />
      </td>
      <td className="w-28 py-3 text-right align-top whitespace-nowrap">
        {row.vsLy ? (
          <>
            <p className="font-mono text-sm text-slate-950 tabular-nums">{row.vsLy.delta}</p>
            <Trend pct={row.vsLy.pct} className="justify-end" />
          </>
        ) : (
          <span className="text-sm text-slate-400">NA</span>
        )}
      </td>
    </tr>
  )
}

export function MoverTable({ rows }: { rows: MoverRow[] }) {
  return (
    <table className="w-full min-w-[36rem] table-fixed border-collapse text-left">
      <thead>
        <tr className="text-xs font-medium text-slate-500">
          <th className="w-8 pb-2" scope="col" />
          <th className="pb-2 pr-4" scope="col">
            SKU
          </th>
          <th className="w-28 pb-2 pr-3 text-right font-normal whitespace-nowrap" scope="col">
            OPS
          </th>
          <th className="w-28 pb-2 pr-3 text-right font-normal whitespace-nowrap" scope="col">
            Vs comparison
          </th>
          <th className="w-28 pb-2 text-right font-normal whitespace-nowrap" scope="col">
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

export function MoverPanel({ title, rows }: { title: string; rows: MoverRow[] }) {
  return (
    <section className="min-w-0 flex-1 border-b border-slate-200 last:border-b-0 lg:w-1/2 lg:border-b-0 lg:border-r lg:last:border-r-0">
      <div className="border-b border-slate-100 px-4 py-3 sm:px-10">
        <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      </div>
      <div className="overflow-x-auto overscroll-x-contain px-4 py-3 sm:px-10">
        <MoverTable rows={rows} />
      </div>
    </section>
  )
}