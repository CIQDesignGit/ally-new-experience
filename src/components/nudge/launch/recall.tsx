"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useNudge } from "../nudge-context"
import { useChat } from "../chat/inline-chat"
import { MemoryRecall } from "../chat/memory"
import { PRIMARY } from "../mike/buttons"
import { LAUNCH_MEMORY, LAUNCH_READINESS } from "./data"

/**
 * The callback: weeks after the brief, a quarter answer remembers the launch
 * and checks on it. Shown only when the memory was actually kept, so the demo
 * earns it (upload the brief first, then ask how the quarter is going).
 */
export function LaunchRecall() {
  const { knowledge } = useNudge()
  const { ask } = useChat()
  // Memory as of when this was asked: an answer from before the brief arrived stays as it was.
  const [kept] = useState(() => knowledge.find((k) => k.id === LAUNCH_MEMORY.id))
  if (!kept) return null
  const ready = LAUNCH_READINESS.filter((r) => r.ready)
  const blocked = LAUNCH_READINESS.find((r) => !r.ready)!
  return (
    <div className="mt-4">
      <MemoryRecall text={`Your ${LAUNCH_READINESS.length} new Winter Hearth SKUs launch Nov 9.`} from={`saved ${kept.date} from ${LAUNCH_MEMORY.source}`}>
        <ul className="flex flex-col gap-1">
          {LAUNCH_READINESS.map((r) => (
            <li key={r.name} className="flex items-center gap-2">
              {r.ready ? <Check className="size-4 text-success-600" /> : <X className="size-4 text-error-600" />}
              <span className={cn(r.ready ? "text-slate-700" : "font-medium text-slate-950")}>{r.name}</span>
              <span className="text-slate-500">{r.ready ? "· retail ready" : `· not ready: ${r.retailer} needs ${r.missing!.length} attributes`}</span>
            </li>
          ))}
        </ul>
        <button type="button" onClick={() => ask(DIG_CHIP)} className={cn(PRIMARY, "mt-3")}>
          {`Dig into the ${blocked.name}`}
        </button>
        <span className="sr-only">{`${ready.length} of ${LAUNCH_READINESS.length} are ready.`}</span>
      </MemoryRecall>
    </div>
  )
}

function DigAnswer() {
  const blocked = LAUNCH_READINESS.find((r) => !r.ready)!
  return (
    <div className="flex max-w-[760px] flex-col gap-4 text-[15px] leading-relaxed text-slate-700">
      <p className="font-semibold text-slate-950">{`${blocked.name} can't list on ${blocked.retailer} yet: 4 required attributes are empty. I can fill 3 from your product data; burn time has to come from the brand team.`}</p>
      <table className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white text-[14px]">
        <thead>
          <tr className="text-left text-[12px] text-slate-500">
            <th className="px-4 py-2 font-medium">Attribute</th>
            <th className="px-4 py-2 font-medium">Where it comes from</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["Wick type", "Product data: cotton, lead-free"],
            ["Item form", "Product data: tin"],
            ["Safety warning", "Your standard candle warning"],
            ["Burn time", "Needs the brand team"],
          ].map(([a, b]) => (
            <tr key={a} className="border-t border-slate-100">
              <td className="px-4 py-2 text-slate-950">{a}</td>
              <td className={cn("px-4 py-2", b.startsWith("Needs") ? "font-medium text-warning-700" : "text-slate-700")}>{b}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <button type="button" onClick={() => toast.success("Filled 3 attributes · asked Priya for burn time", { position: "top-right" })} className={PRIMARY}>
          Fill 3 and ask Priya for burn time
        </button>
      </div>
    </div>
  )
}

const DIG_CHIP = { q: `Dig into the ${LAUNCH_READINESS.find((r) => !r.ready)!.name}`, render: () => <DigAnswer /> }
