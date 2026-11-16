"use client"

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { Check, ChevronDown, Search, Settings, X } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"

type Country = {
  id: string
  label: string
  short: string
  /** ISO 3166-1 alpha-2, used for the flag image. */
  code: string
}

type RetailerOption = {
  id: string
  label: string
  short: string
  mark: string
  markClass: string
}

const COUNTRIES: Country[] = [
  { id: "us", label: "United States", short: "US", code: "us" },
  { id: "ca", label: "Canada", short: "CA", code: "ca" },
  { id: "uk", label: "United Kingdom", short: "UK", code: "gb" },
  { id: "de", label: "Germany", short: "DE", code: "de" },
  { id: "in", label: "India", short: "IN", code: "in" },
]

function FlagThumb({ code, label, className }: { code: string; label: string; className?: string }) {
  return (
    <span className={cn("relative block shrink-0 overflow-hidden rounded-md bg-slate-800 ring-1 ring-white/15", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://flagcdn.com/${code}.svg`}
        alt=""
        aria-hidden
        className="size-full object-cover"
      />
      <span className="sr-only">{label} flag</span>
    </span>
  )
}

const RETAILERS: RetailerOption[] = [
  { id: "omni", label: "Omni Channel", short: "Omni", mark: "O", markClass: "bg-violet-600 text-white" },
  { id: "albertsons", label: "Albertsons (Criteo)", short: "Albertsons", mark: "A", markClass: "bg-red-600 text-white" },
  { id: "amazon", label: "Amazon (Retail)", short: "Amazon", mark: "a", markClass: "bg-slate-900 text-amber-400" },
  { id: "chewy", label: "Chewy (Retail)", short: "Chewy", mark: "C", markClass: "bg-sky-600 text-white" },
  { id: "dollar-general", label: "Dollar General (Retail)", short: "DG", mark: "DG", markClass: "bg-yellow-400 text-slate-900" },
  { id: "doordash", label: "DoorDash (Retail)", short: "DoorDash", mark: "D", markClass: "bg-red-500 text-white" },
  { id: "instacart", label: "Instacart (Retail)", short: "Instacart", mark: "i", markClass: "bg-emerald-500 text-white" },
  { id: "walmart", label: "Walmart (Retail)", short: "Walmart", mark: "W", markClass: "bg-sky-500 text-white" },
  { id: "target", label: "Target (Retail)", short: "Target", mark: "T", markClass: "bg-red-600 text-white" },
  { id: "kroger", label: "Kroger (Retail)", short: "Kroger", mark: "K", markClass: "bg-sky-700 text-white" },
  { id: "costco", label: "Costco (Retail)", short: "Costco", mark: "C", markClass: "bg-red-700 text-white" },
  { id: "best-buy", label: "Best Buy (Retail)", short: "Best Buy", mark: "bb", markClass: "bg-slate-800 text-yellow-400" },
  { id: "cvs", label: "CVS (Retail)", short: "CVS", mark: "CVS", markClass: "bg-red-700 text-white" },
]

function Mark({ mark, markClass }: { mark: string; markClass: string }) {
  return (
    <span
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded text-[10px] font-bold leading-none",
        markClass,
      )}
      aria-hidden
    >
      {mark}
    </span>
  )
}

function SearchablePicker<T extends { id: string; label: string }>({
  title,
  value,
  options,
  onSelect,
  renderTrigger,
  renderOption,
}: {
  title: string
  value: string
  options: T[]
  onSelect: (id: string) => void
  renderTrigger: (selected: T | undefined, open: boolean) => ReactNode
  renderOption: (option: T, selected: boolean) => ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const root = useRef<HTMLDivElement>(null)
  const selected = options.find((o) => o.id === value)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((o) => o.label.toLowerCase().includes(q))
  }, [options, query])

  useEffect(() => {
    if (!open) return
    const onPointer = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) {
        setOpen(false)
        setQuery("")
      }
    }
    document.addEventListener("mousedown", onPointer)
    return () => document.removeEventListener("mousedown", onPointer)
  }, [open])

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => {
          setOpen((v) => !v)
          if (open) setQuery("")
        }}
        className="flex h-10 w-full items-center justify-between gap-2 rounded-md border border-slate-200 bg-white px-3 text-left text-sm text-slate-900 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-info-500"
      >
        {renderTrigger(selected, open)}
      </button>

      {open && (
        <div className="absolute top-[calc(100%+6px)] right-0 left-0 z-10 rounded-lg bg-white shadow-md ring-1 ring-slate-200">
          <p className="px-3 pt-2.5 pb-1 text-xs text-slate-500">{title}</p>
          <div className="px-2 pb-2">
            <label className="relative block">
              <span className="sr-only">Search</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-9 w-full rounded-md border border-info-500 bg-white pr-9 pl-3 text-sm text-slate-900 outline-none"
                autoFocus
              />
              <Search className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
            </label>
          </div>
          <div className="max-h-56 overflow-y-auto border-t border-slate-100 py-1" role="listbox">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-sm text-slate-500">No matches</p>
            ) : (
              filtered.map((option) => {
                const isSelected = option.id === value
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onSelect(option.id)
                      setOpen(false)
                      setQuery("")
                    }}
                    className={cn(
                      "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-slate-50",
                      isSelected && "bg-slate-50",
                    )}
                  >
                    {renderOption(option, isSelected)}
                    {isSelected && <Check className="ml-auto size-4 shrink-0 text-brand-600" aria-hidden />}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/** Region & Retailer control for the Ally rail: shows the pick, opens country/retailer settings. */
export function RegionRetailerSettings({
  onOpenChange,
}: {
  onOpenChange?: (open: boolean) => void
}) {
  const [open, setOpen] = useState(false)
  const [countryId, setCountryId] = useState("us")
  const [retailerId, setRetailerId] = useState("amazon")

  const country = COUNTRIES.find((c) => c.id === countryId) ?? COUNTRIES[0]
  const retailer = RETAILERS.find((r) => r.id === retailerId) ?? RETAILERS[2]
  const summary = `${country.short} ${retailer.short}`

  function setDialogOpen(next: boolean) {
    setOpen(next)
    onOpenChange?.(next)
  }

  return (
    <>
      <div className="shrink-0 px-3 pb-5">
        <p className="mb-2 text-[11px] font-medium text-brand-300">
          Region &amp; Retailer
        </p>
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={`Region and retailer: ${summary}. Open settings.`}
          className={cn(
            "group flex w-full items-center gap-2 rounded-lg bg-white/5 px-2 py-1.5 text-left outline-none ring-1 ring-white/10 transition-colors",
            "hover:bg-white/10 hover:ring-white/20",
            "focus-visible:ring-2 focus-visible:ring-white/40",
            open && "bg-white/10 ring-white/25",
          )}
        >
          <FlagThumb code={country.code} label={country.label} className="size-6" />

          <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-white">
            {summary}
          </span>

          <span
            className={cn(
              "flex size-6 shrink-0 items-center justify-center rounded-md text-brand-200 transition-colors",
              "group-hover:bg-white/10 group-hover:text-white",
              open && "bg-white/10 text-white",
            )}
            aria-hidden
          >
            <Settings className="size-3.5" />
          </span>
        </button>
      </div>

      <Dialog open={open} onOpenChange={setDialogOpen}>
        <DialogContent
          showCloseButton={false}
          className="z-[60] max-w-[560px] gap-0 overflow-visible rounded-xl p-0 sm:max-w-[560px]"
          overlayClassName="z-[60]"
        >
          <div className="flex items-center justify-between rounded-t-xl bg-slate-700 px-4 py-3">
            <DialogTitle className="text-sm font-medium text-white">
              Country and Retailer Settings
            </DialogTitle>
            <DialogClose
              render={
                <button
                  type="button"
                  className="rounded p-1 text-white outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/40"
                  aria-label="Close"
                />
              }
            >
              <X className="size-4" />
            </DialogClose>
          </div>

          <div className="grid gap-4 rounded-b-xl bg-white p-5 sm:grid-cols-2">
            <div className="min-w-0 space-y-1.5">
              <p className="text-sm font-medium text-slate-900">
                Country <span className="font-normal text-slate-500">({COUNTRIES.length})</span>
              </p>
              <SearchablePicker
                title="Select Country:"
                value={countryId}
                options={COUNTRIES}
                onSelect={setCountryId}
                renderTrigger={(selected) => (
                  <>
                    <span className="flex min-w-0 items-center gap-2">
                      {selected && (
                        <FlagThumb
                          code={selected.code}
                          label={selected.label}
                          className="size-5 ring-slate-200"
                        />
                      )}
                      <span className="truncate">{selected?.label}</span>
                    </span>
                    <ChevronDown className="size-4 shrink-0 text-slate-400" aria-hidden />
                  </>
                )}
                renderOption={(option) => (
                  <>
                    <FlagThumb
                      code={option.code}
                      label={option.label}
                      className="size-5 ring-slate-200"
                    />
                    <span className="truncate text-slate-900">{option.label}</span>
                  </>
                )}
              />
            </div>

            <div className="min-w-0 space-y-1.5">
              <p className="text-sm font-medium text-slate-900">
                Retailer <span className="font-normal text-slate-500">({RETAILERS.length})</span>
              </p>
              <SearchablePicker
                title="Select Retailer:"
                value={retailerId}
                options={RETAILERS}
                onSelect={setRetailerId}
                renderTrigger={(selected) => (
                  <>
                    <span className="flex min-w-0 items-center gap-2">
                      {selected && <Mark mark={selected.mark} markClass={selected.markClass} />}
                      <span className="truncate">{selected?.label}</span>
                    </span>
                    <ChevronDown className="size-4 shrink-0 text-slate-400" aria-hidden />
                  </>
                )}
                renderOption={(option) => (
                  <>
                    <Mark mark={option.mark} markClass={option.markClass} />
                    <span className="truncate text-slate-900">{option.label}</span>
                  </>
                )}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
