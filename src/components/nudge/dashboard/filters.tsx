"use client"

import { useEffect, useRef, useState } from "react"
import { CalendarDays, Check, ChevronDown, X } from "lucide-react"
import { cn } from "@/lib/utils"

/** Dashboard filter controls, shared by every dashboard: a date range and dropdown menus. */

/** A popover that closes on an outside click or Escape. */
function usePopover() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false)
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])
  return { open, setOpen, ref }
}

const TRIGGER = "inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-[13px] transition-colors"

export function Menu({ label, value, options, onChange, locked }: { label: string; value?: string; options: string[]; onChange?: (v?: string) => void; locked?: boolean }) {
  const { open, setOpen, ref } = usePopover()
  const on = !!value && !locked
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className={cn(TRIGGER, on ? "border-brand-300 bg-brand-25 text-brand-800" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300")}>
        <span className="text-slate-500">{label}</span>
        <span className="font-medium">{value ?? "All"}</span>
        {on ? (
          <X
            className="size-3.5"
            aria-label={`Clear ${label.toLowerCase()}`}
            onClick={(e) => {
              e.stopPropagation()
              onChange?.(undefined)
            }}
          />
        ) : (
          <ChevronDown className="size-3.5 text-slate-400" />
        )}
      </button>
      {open && (
        <div role="menu" className="absolute top-full left-0 z-40 mt-1.5 min-w-[200px] rounded-xl border border-slate-200 bg-white p-1 shadow-[0_12px_32px_-12px_rgba(15,23,42,0.3)]">
          {!locked && <Item label="All" on={!value} onPick={() => (onChange?.(undefined), setOpen(false))} />}
          {options.map((o) => (
            <Item key={o} label={o} on={value === o} onPick={() => (onChange?.(o), setOpen(false))} />
          ))}
        </div>
      )}
    </div>
  )
}

function Item({ label, sub, on, onPick, disabled }: { label: string; sub?: string; on?: boolean; onPick?: () => void; disabled?: boolean }) {
  return (
    <button type="button" role="menuitem" disabled={disabled} onClick={onPick} className={cn("flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px]", disabled ? "cursor-default text-slate-300" : "text-slate-800 hover:bg-slate-50")}>
      <span className="flex-1">
        <span className="block">{label}</span>
        {sub && <span className={cn("block text-xs", disabled ? "text-slate-300" : "text-slate-500")}>{sub}</span>}
      </span>
      {on && <Check className="size-3.5 text-brand-600" />}
    </button>
  )
}

/** A date range: presets (only the live one has data) and the month with the range marked. */
export function DateRange({ label, ranges, month, startPad, days, from, to }: { label: string; ranges: { label: string; dates: string; live: boolean }[]; month: string; startPad: number; days: number; from: number; to: number }) {
  const { open, setOpen, ref } = usePopover()
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className={cn(TRIGGER, "border-slate-200 bg-white font-medium text-slate-800 hover:border-slate-300")}>
        <CalendarDays className="size-4 text-slate-500" />
        {label}
        <ChevronDown className="size-3.5 text-slate-400" />
      </button>
      {open && (
        <div className="absolute top-full left-0 z-40 mt-1.5 flex w-max rounded-xl border border-slate-200 bg-white shadow-[0_12px_32px_-12px_rgba(15,23,42,0.3)]">
          <div className="w-[200px] shrink-0 border-r border-slate-100 p-1">
            {ranges.map((r) => (
              <Item key={r.label} label={r.label} sub={r.dates} on={r.live} disabled={!r.live} onPick={() => setOpen(false)} />
            ))}
          </div>
          <div className="p-4">
            <div className="text-center text-[13px] font-semibold text-slate-900">{month}</div>
            <div className="mt-3 grid grid-cols-7 gap-y-1 text-center text-xs">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <span key={i} className="pb-1 text-slate-400">
                  {d}
                </span>
              ))}
              {Array.from({ length: startPad }, (_, i) => (
                <span key={`pad-${i}`} />
              ))}
              {Array.from({ length: days }, (_, i) => i + 1).map((d) => {
                const inside = d >= from && d <= to
                return (
                  <span key={d} className={cn("flex h-8 w-9 items-center justify-center font-mono", inside ? "bg-brand-500 font-semibold text-white" : "text-slate-700", d === from && "rounded-l-lg", d === to && "rounded-r-lg")}>
                    {d}
                  </span>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
