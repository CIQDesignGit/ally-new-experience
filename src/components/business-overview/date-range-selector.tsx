"use client"

import { useState } from "react"
import { Calendar, ChevronDown, Info, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  COMPARE_RANGE,
  DATA_AVAILABLE_FROM,
  DATA_THROUGH,
  DATE_RANGE,
  DEFAULT_COMPARE_PRESET,
  DEFAULT_DATE_PRESET,
} from "./data"
import { DateRangeMonthGrid } from "./date-range-month-grid"

const SEGMENT =
  "inline-flex h-10 shrink-0 items-center justify-center text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"

type Draft = {
  primaryLabel: string
  compareLabel: string
  datePreset: string
  comparePreset: string
  primaryStart: string
  primaryEnd: string
  compareStart: string
  compareEnd: string
}

const INITIAL: Draft = {
  primaryLabel: DATE_RANGE,
  compareLabel: COMPARE_RANGE,
  datePreset: DEFAULT_DATE_PRESET,
  comparePreset: DEFAULT_COMPARE_PRESET,
  primaryStart: "Nov 09, 2026",
  primaryEnd: "Nov 15, 2026",
  compareStart: "Nov 02, 2026",
  compareEnd: "Nov 08, 2026",
}

export function BusinessOverviewDateRangeSelector() {
  const [open, setOpen] = useState(false)
  const [applied, setApplied] = useState(INITIAL)
  const [draft, setDraft] = useState(INITIAL)

  function openPanel(next: boolean) {
    if (next) setDraft(applied)
    setOpen(next)
  }

  function apply() {
    setApplied({
      ...draft,
      primaryLabel: `${draft.primaryStart} – ${draft.primaryEnd}`,
      compareLabel: `${draft.compareStart} – ${draft.compareEnd}`,
    })
    setOpen(false)
  }

  function reset() {
    setDraft(INITIAL)
  }

  return (
    <div className="inline-flex items-stretch overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs">
      <button
        type="button"
        className={cn(SEGMENT, "w-10 border-r border-slate-200")}
        aria-label="About date range"
      >
        <Info className="size-4 text-slate-500" />
      </button>

      <Popover open={open} onOpenChange={openPanel}>
        <PopoverTrigger
          className={cn(
            "inline-flex h-10 max-w-[min(100vw-12rem,20rem)] min-w-[14.5rem] flex-1 items-center gap-2 border-r border-slate-200 px-3 text-left transition-colors",
            "hover:bg-slate-50 data-popup-open:bg-brand-25",
          )}
        >
          <Calendar className="size-4 shrink-0 text-slate-500" aria-hidden />
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-[13px] font-medium text-slate-900">
              {applied.primaryLabel}
            </span>
            <span className="block truncate text-[11px] text-slate-500">
              Compare to : {applied.compareLabel}
            </span>
          </span>
          <ChevronDown className="size-3.5 shrink-0 text-slate-400" aria-hidden />
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={8}
          className="w-[min(100vw-2rem,920px)] max-w-none gap-0 overflow-hidden rounded-xl p-0 shadow-[0_16px_40px_-16px_rgba(15,23,42,0.35)] ring-slate-200"
        >
          <div className="flex flex-col lg:flex-row">
            <div className="flex flex-col gap-6 border-b border-slate-200 p-5 sm:flex-row lg:border-b-0 lg:border-r">
              <DateRangeMonthGrid
                title="October 2026"
                weekNumbers={[39, 40, 41, 42, 43, 44]}
                startPad={4}
                daysInMonth={31}
                showNav="prev"
              />
              <div
                className="hidden w-px self-stretch border-l border-dashed border-slate-200 sm:block"
                aria-hidden
              />
              <DateRangeMonthGrid
                title="November 2026"
                weekNumbers={[44, 45, 46, 47, 48]}
                startPad={0}
                daysInMonth={30}
                primary={{ from: 9, to: 15 }}
                compare={{ from: 2, to: 8 }}
                disabledAfter={15}
                today={18}
                showNav="next"
              />
            </div>
            <aside className="w-full shrink-0 space-y-5 p-5 lg:w-56">
              <section className="space-y-2">
                <p className="text-xs font-semibold text-brand-700">Date range</p>
                <Select
                  value={draft.datePreset}
                  onValueChange={(v) => v && setDraft((d) => ({ ...d, datePreset: v }))}
                >
                  <SelectTrigger size="sm" className="w-full border-slate-200 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Last 7 Days">Last 7 Days</SelectItem>
                    <SelectItem value="Last 14 Days">Last 14 Days</SelectItem>
                    <SelectItem value="Last 30 Days">Last 30 Days</SelectItem>
                    <SelectItem value="Custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={draft.primaryStart}
                    className="h-9 min-w-0 flex-1 rounded-md border border-brand-400 bg-white px-2 text-xs text-slate-800"
                    aria-label="Range start"
                  />
                  <span className="text-slate-400">–</span>
                  <input
                    readOnly
                    value={draft.primaryEnd}
                    className="h-9 min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-800"
                    aria-label="Range end"
                  />
                </div>
              </section>
              <section className="space-y-2">
                <p className="text-xs font-semibold text-warning-700">Compare to</p>
                <Select
                  value={draft.comparePreset}
                  onValueChange={(v) => v && setDraft((d) => ({ ...d, comparePreset: v }))}
                >
                  <SelectTrigger size="sm" className="w-full border-slate-200 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Previous Period">Previous Period</SelectItem>
                    <SelectItem value="Previous Year">Previous Year</SelectItem>
                    <SelectItem value="None">None</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={draft.compareStart}
                    className="h-9 min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-800"
                    aria-label="Compare start"
                  />
                  <span className="text-slate-400">–</span>
                  <input
                    readOnly
                    value={draft.compareEnd}
                    className="h-9 min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-800"
                    aria-label="Compare end"
                  />
                </div>
              </section>
            </aside>
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-3">
            <Button type="button" variant="outline" size="sm" onClick={reset}>
              Reset
            </Button>
            <Button type="button" size="sm" className="bg-brand-600 text-white hover:bg-brand-700" onClick={apply}>
              Apply
            </Button>
          </div>
          <div className="flex items-start gap-2 border-t border-slate-200 bg-brand-50 px-4 py-3 text-xs text-slate-600">
            <Info className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
            <p>
              Data available from{" "}
              <span className="font-semibold text-slate-800">
                {DATA_AVAILABLE_FROM} – {DATA_THROUGH}
              </span>
              . Hence the date selection can be done only within this range.
            </p>
          </div>
        </PopoverContent>
      </Popover>

      <button type="button" className={cn(SEGMENT, "w-10")} aria-label="Share date range">
        <Share2 className="size-4 text-slate-600" />
      </button>
    </div>
  )
}