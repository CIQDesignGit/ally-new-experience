"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { candleThumbnail } from "@/lib/candle-thumbnails"
import { FILL_PREVIEW } from "./sku-fill"
import type { FillRow } from "./sku-fill"

/**
 * The SKUs under an inbox row, all of them: the first dozen, then "Show all N".
 * Rows with full data open side by side; the rest are listed, not clickable.
 */
export function SkuFillList({ rows, selectedId, onSelect, checked, thumb }: { rows: FillRow[]; selectedId: string | null; onSelect: (id: string) => void; checked?: (id: string) => boolean; thumb?: (id: string) => string }) {
  const [all, setAll] = useState(false)
  const shown = all ? rows : rows.slice(0, FILL_PREVIEW)
  return (
    <div className="flex flex-col gap-0.5 px-3 pb-2">
      {shown.map((r) => {
        const body = (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- local demo thumbnails */}
            <img src={thumb?.(r.id) ?? candleThumbnail(r.id)} alt="" className="size-7 shrink-0 rounded object-cover ring-1 ring-slate-200" />
            <span className="min-w-0 flex-1 text-[13px] leading-tight text-slate-950">{r.name}</span>
            {checked?.(r.id) && <Check className="size-4 shrink-0 text-success-600" aria-label="Checked" />}
          </>
        )
        return r.real ? (
          <button
            key={r.id}
            type="button"
            onClick={() => onSelect(r.id)}
            className={cn("flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left transition-colors", selectedId === r.id ? "bg-white ring-1 ring-slate-200" : "hover:bg-white")}
          >
            {body}
          </button>
        ) : (
          <div key={r.id} className="flex w-full items-center gap-2.5 px-2.5 py-1.5">
            {body}
          </div>
        )
      })}
      {rows.length > FILL_PREVIEW && (
        <button type="button" onClick={() => setAll((v) => !v)} className="w-fit px-2.5 pt-1 text-xs font-medium text-brand-700 hover:text-brand-800">
          {all ? "Show fewer" : `Show all ${rows.length}`}
        </button>
      )}
    </div>
  )
}
