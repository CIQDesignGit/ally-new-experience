"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { INFLIGHT } from "./data"
import { useNudge } from "./nudge-context"
import type { Period } from "./types"
import { usePathname } from "next/navigation"
import { RETAILERS, RETAILER_PAGES } from "./retailer"
import type { Retailer } from "./retailer"

const PERIODS: { id: Period; label: string }[] = [
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
  { id: "quarter", label: "This quarter" },
  { id: "year", label: "This year" },
]

/** The period name in every page's top line ("Q4 FY26 ▾"). One shared period: switching here switches every page. */
export function PeriodSwitch() {
  const { period, setPeriod } = useNudge()
  const [open, setOpen] = useState(false)
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-md py-0.5 font-semibold text-slate-950 outline-none">
        {INFLIGHT[period].name}
        <ChevronDown className={cn("size-3.5 text-slate-400 transition-transform", open && "rotate-180")} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={6} className="min-w-40 rounded-xl p-1.5 shadow-md ring-1 ring-slate-200/80">
        <DropdownMenuRadioGroup
          value={period}
          onValueChange={(v) => {
            setPeriod(v as Period)
            setOpen(false)
          }}
        >
          {PERIODS.map((p) => (
            <DropdownMenuRadioItem
              key={p.id}
              value={p.id}
              className="cursor-pointer rounded-lg px-2.5 py-1.5 text-sm outline-hidden select-none focus:bg-brand-50 data-checked:bg-brand-100 data-checked:text-slate-950 **:data-[slot=dropdown-menu-radio-item-indicator]:hidden"
            >
              {p.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** The retailer in the top line ("Amazon ▾"), on the pages whose numbers follow it. */
export function RetailerSwitch() {
  const { retailer, setRetailer } = useNudge()
  const path = usePathname()
  const [open, setOpen] = useState(false)
  if (!RETAILER_PAGES.includes(path)) return null
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-md py-0.5 font-semibold text-slate-950 outline-none">
        {RETAILERS.find((r) => r.id === retailer)?.label}
        <ChevronDown className={cn("size-3.5 text-slate-400 transition-transform", open && "rotate-180")} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={6} className="min-w-40 rounded-xl p-1.5 shadow-md ring-1 ring-slate-200/80">
        <DropdownMenuRadioGroup
          value={retailer}
          onValueChange={(v) => {
            setRetailer(v as Retailer)
            setOpen(false)
          }}
        >
          {RETAILERS.map((r) => (
            <DropdownMenuRadioItem
              key={r.id}
              value={r.id}
              className="cursor-pointer rounded-lg px-2.5 py-1.5 text-sm outline-hidden select-none focus:bg-brand-50 data-checked:bg-brand-100 data-checked:text-slate-950 **:data-[slot=dropdown-menu-radio-item-indicator]:hidden"
            >
              {r.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
