"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { PRIMARY } from "../nudge/mike/buttons"
import type { UseCase } from "./data"
import { REGEN_SKU } from "./data"

/**
 * Step 3, the customer's side. Most use cases open the real Ally page, which
 * now carries what was published. Regeneration plays here: Mike picks among
 * options and regenerates from Aurelle's feedback while they're on the call.
 */
export function Floor({ uc, published }: { uc: UseCase; published: boolean }) {
  if (!published) {
    return <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500">Publish in step 2 to see what {uc.persona} gets</div>
  }
  if (uc.id === "regen") return <Regenerate />
  return (
    <section className="flex flex-col gap-5 rounded-2xl bg-white shadow-xs ring-1 ring-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-950">{uc.floor.title}</h3>
      <ul className="flex flex-col gap-2.5">
        {uc.floor.points.map((p) => (
          <li key={p} className="flex items-start gap-2.5 text-[15px] text-slate-700">
            <Check className="mt-0.5 size-4 shrink-0 text-success-700" aria-hidden />
            {p}
          </li>
        ))}
      </ul>
      {uc.floor.href && (
        <Link href={uc.floor.href} className="inline-flex w-fit items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-600">
          {uc.floor.cta} <ArrowRight className="size-4" aria-hidden />
        </Link>
      )}
    </section>
  )
}

/** Words in `text` that `base` doesn't have, so the new ones can be marked. */
const fresh = (text: string, words: string[]) => text.split(/(\s+)/).map((w, i) => ({ w, i, added: words.some((a) => w.replace(/[,]/g, "") === a) }))

function Regenerate() {
  const [pick, setPick] = useState(REGEN_SKU.options[0].id)
  const [input, setInput] = useState("")
  const [state, setState] = useState<"idle" | "working" | "done" | "accepted">("idle")
  const [batch, setBatch] = useState<"idle" | "working" | "done">("idle")
  const chosen = REGEN_SKU.options.find((o) => o.id === pick)!

  const regenerate = () => {
    setState("working")
    window.setTimeout(() => setState("done"), 1300)
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl bg-white shadow-xs ring-1 ring-slate-200">
        <div className="border-b border-slate-200 px-5 py-3">
          <div className="text-[13px] text-slate-500">Mike · Jar candles · Title</div>
          <div className="text-[15px] font-semibold text-slate-950">{REGEN_SKU.name}</div>
        </div>

        <div className="flex flex-col gap-2 p-5">
          {REGEN_SKU.options.map((o) => (
            <button
              key={o.id}
              type="button"
              disabled={state !== "idle"}
              onClick={() => setPick(o.id)}
              className={cn("flex flex-col gap-1 rounded-lg px-4 py-3 text-left ring-1", pick === o.id ? "bg-slate-100 ring-slate-300" : "ring-slate-200 hover:bg-slate-50", state !== "idle" && pick !== o.id && "opacity-50")}
            >
              <span className={cn("text-xs font-medium", o.id === "champion" ? "text-ally-700" : "text-slate-500")}>{o.label}</span>
              <span className="text-sm text-slate-950">{o.text}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 p-5">
          {state === "idle" && (
            <>
              <label htmlFor="regen-input" className="text-[13px] font-medium text-slate-500">
                Aurelle&rsquo;s feedback
              </label>
              <div className="flex gap-2 max-sm:flex-col">
                <input
                  id="regen-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={REGEN_SKU.feedback}
                  className="h-10 flex-1 rounded-lg border border-slate-200 px-3 text-sm text-slate-950 placeholder:text-slate-400 focus-visible:border-brand-300 focus-visible:outline-none"
                />
                <button type="button" onClick={regenerate} className={PRIMARY}>
                  Regenerate
                </button>
              </div>
              <button type="button" onClick={() => setInput(REGEN_SKU.feedback)} className="w-fit text-[13px] text-brand-700 hover:text-brand-600">
                Use &ldquo;{REGEN_SKU.feedback}&rdquo;
              </button>
            </>
          )}
          {state === "working" && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="size-4 animate-spin" aria-hidden /> Regenerating {chosen.label === "Ally's pick" ? "Ally's pick" : chosen.label.toLowerCase()}, keeping the rest
            </div>
          )}
          {(state === "done" || state === "accepted") && (
            <div className="flex flex-col gap-3">
              <div className="rounded-lg bg-slate-50 px-4 py-3">
                <div className="text-xs font-medium text-slate-500">Regenerated · Oct 8, 10:14 AM</div>
                <div className="mt-1 text-sm text-slate-950">
                  {fresh(REGEN_SKU.regenerated, REGEN_SKU.added).map(({ w, i, added }) => (
                    <span key={i} className={cn(added && "font-semibold")}>
                      {w}
                    </span>
                  ))}
                </div>
                <div className="mt-2 text-[13px] text-slate-500">
                  Kept the brand and scent first · {REGEN_SKU.regenerated.length} characters, under the limit
                </div>
              </div>
              {state === "done" ? (
                <div className="flex gap-2">
                  <button type="button" onClick={() => setState("accepted")} className={PRIMARY}>
                    Accept
                  </button>
                  <button type="button" onClick={() => setState("idle")} className={PRIMARY}>
                    Regenerate again
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-success-700">
                  <Check className="size-4" aria-hidden /> Accepted · saved as feedback for the jar candle cluster
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="flex items-center justify-between gap-4 rounded-2xl bg-white shadow-xs ring-1 ring-slate-200 px-5 py-4 max-sm:flex-col max-sm:items-start">
        <div>
          <div className="text-sm font-medium text-slate-950">New data from Aurelle: holiday keyword file</div>
          <div className="text-[13px] text-slate-500">
            {batch === "done" ? "18 jar candle SKUs regenerated · Oct 8, 10:20 AM · ready for review" : "Regenerates only the SKUs the new keywords reach"}
          </div>
        </div>
        {batch === "done" ? (
          <span className="flex items-center gap-1.5 text-sm text-success-700">
            <Check className="size-4" aria-hidden /> Done
          </span>
        ) : (
          <button
            type="button"
            disabled={batch === "working"}
            onClick={() => {
              setBatch("working")
              window.setTimeout(() => setBatch("done"), 1500)
            }}
            className={PRIMARY}
          >
            {batch === "working" && <Loader2 className="size-4 animate-spin" aria-hidden />}
            {batch === "working" ? "Regenerating" : "Regenerate affected SKUs"}
          </button>
        )}
      </section>

      <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
        <div className="rounded-2xl bg-white shadow-xs ring-1 ring-slate-200 px-5 py-4">
          <div className="font-mono text-[26px] leading-none font-semibold text-slate-950">{state === "accepted" ? 1 : 0}</div>
          <div className="mt-2 text-[13px] text-slate-500">Actions taken on this call</div>
        </div>
        <div className="rounded-2xl bg-white shadow-xs ring-1 ring-slate-200 px-5 py-4">
          <div className="font-mono text-[26px] leading-none font-semibold text-slate-950">{batch === "done" ? 18 : 0}</div>
          <div className="mt-2 text-[13px] text-slate-500">SKUs regenerated from new data</div>
        </div>
      </div>
    </div>
  )
}
