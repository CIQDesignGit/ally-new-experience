"use client"

import { useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BENCHMARK_METRIC_MENU } from "./data"
import { cn } from "@/lib/utils"

function menuItemClass(selected: boolean) {
  return cn(
    "cursor-pointer gap-2 rounded-md px-2 py-1.5 text-sm text-slate-800",
    selected && "bg-brand-50 text-brand-800",
  )
}

export function BenchmarkMetricPicker({
  rowId,
  label,
  choiceId,
  onSelect,
}: {
  rowId: string
  label: string
  choiceId: string | null
  onSelect: (rowId: string, choiceId: string, displayLabel: string) => void
}) {
  const [open, setOpen] = useState(false)

  function pick(id: string, displayLabel: string) {
    onSelect(rowId, id, displayLabel)
    setOpen(false)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex max-w-full items-center gap-1 rounded-md py-0.5 pr-1 text-left text-sm text-slate-700",
          "hover:bg-slate-100 hover:text-slate-950 data-popup-open:bg-slate-100",
        )}
        aria-label={`Metric: ${label}. Change metric`}
      >
        <span className="truncate">{label}</span>
        <ChevronDown className="size-3 shrink-0 text-slate-400" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={6} className="w-60 p-1 shadow-lg ring-slate-200">
        {BENCHMARK_METRIC_MENU.map((entry) =>
          entry.submenu ? (
            <DropdownMenuSub key={entry.id}>
              <DropdownMenuSubTrigger className={menuItemClass(choiceId === entry.id)}>
                {entry.label}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-44 p-1">
                {entry.submenu.map((sub) => {
                  const selected = choiceId === sub.id
                  return (
                    <DropdownMenuItem
                      key={sub.id}
                      className={menuItemClass(selected)}
                      onClick={() => pick(sub.id, `${entry.label} · ${sub.label}`)}
                    >
                      <span className="flex-1">{sub.label}</span>
                      {selected ? <Check className="size-3.5 text-brand-600" /> : null}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          ) : (
            <DropdownMenuItem
              key={entry.id}
              className={menuItemClass(choiceId === entry.id)}
              onClick={() => pick(entry.id, entry.label)}
            >
              <span className="flex-1">{entry.label}</span>
              {choiceId === entry.id ? <Check className="size-3.5 text-brand-600" /> : null}
            </DropdownMenuItem>
          ),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}