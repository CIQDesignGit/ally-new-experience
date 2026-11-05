"use client"

import { useCallback, useState } from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { PageShell } from "@/components/layout/page-shell"
import { PageFrame, Widget, WidgetStack } from "@/components/layout/page-frame"
import { useNudge } from "@/components/nudge/nudge-context"
import { ALERT_RULES } from "@/components/nudge/alerts/data"
import { FILL_STEP, LESSON_ID, lessonText } from "@/components/nudge/ops/gap-training"
import type { GapRecipe } from "@/components/nudge/policy"
import { USE_CASES, FDE, type UseCaseId } from "@/components/borrow/data"
import { Workshop } from "@/components/borrow/workshop"
import { Publish } from "@/components/borrow/publish"
import { Floor } from "@/components/borrow/floor"

const STEPS = [
  { n: 1, name: "Build", who: "FDE in Claude Code" },
  { n: 2, name: "Test and publish", who: "CommerceIQ" },
  { n: 3, name: "Customer view", who: "Ally" },
] as const

/** Gap to plan by weight, with fill rate on POs: the recipe the pounds use case publishes. */
const POUNDS_RECIPE: GapRecipe = { measure: "weight", steps: [FILL_STEP], columns: ["units", "weight", "fill"], scope: "account" }

/**
 * Borrow a harness, as an FDE workflow: build, test and publish, customer view.
 * Publishing writes to the demo's own state, so the Ally pages in step 3 show
 * the dashboard, the alerts and gap to plan in pounds for real.
 */
export default function BorrowPage() {
  const { setRetro, addAlert, knowledge, saveKnowledge } = useNudge()
  const [id, setId] = useState<UseCaseId>("dashboard")
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [built, setBuilt] = useState<Partial<Record<UseCaseId, boolean>>>({})
  const [published, setPublished] = useState<Partial<Record<UseCaseId, string>>>({})
  const uc = USE_CASES.find((u) => u.id === id)!
  const live = !!published[id] && published[id] !== "draft"

  const onBuilt = useCallback(() => setBuilt((b) => (b[id] ? b : { ...b, [id]: true })), [id])

  const onPublish = (mode: string) => {
    setPublished((p) => ({ ...p, [id]: mode }))
    if (mode === "draft") return
    if (id === "dashboard") setRetro({ dashboard: true, dashboardSeen: false })
    if (id === "alerts") (["brand-terms", "gift-terms"] as const).forEach((a) => addAlert({ ...ALERT_RULES[a], created: new Date().toISOString(), seen: false }))
    if (id === "pounds")
      saveKnowledge([
        { id: LESSON_ID, text: `${lessonText(POUNDS_RECIPE)}.`, retailer: "Amazon", brands: ["Aurelle Candles"], skuGroups: [], author: FDE, date: "Oct 8", source: "FDE, from Aurelle's weight file", recipe: POUNDS_RECIPE },
        ...knowledge.filter((x) => x.id !== LESSON_ID),
      ])
  }

  return (
    <PageShell className="bg-slate-50">
      <PageFrame>
        <header className="px-10 pt-8 max-sm:px-4">
          <div className="text-[13px] text-slate-500">FDE workflow · Aurelle Candles · Amazon US</div>
          <h1 className="mt-1 text-3xl leading-tight font-semibold tracking-tight text-slate-950">{uc.label}</h1>
        </header>

        <div className="mt-3 px-10 py-2.5 max-sm:px-4">
          <div role="tablist" aria-label="Use cases" className="flex h-9 overflow-x-auto rounded-lg border border-slate-200 bg-slate-100 p-0.5">
            {USE_CASES.map((u) => (
              <button
                key={u.id}
                type="button"
                role="tab"
                aria-selected={u.id === id}
                onClick={() => {
                  setId(u.id)
                  setStep(1)
                }}
                className={cn(
                  "inline-flex flex-auto items-center justify-center gap-1.5 rounded-md px-3 text-[13px] font-medium whitespace-nowrap transition-colors",
                  u.id === id ? "bg-white text-slate-950 shadow-xs ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-800",
                )}
              >
                {published[u.id] && published[u.id] !== "draft" && <Check className="size-3.5 text-success-700" aria-label="Published" />}
                {u.label}
              </button>
            ))}
          </div>
        </div>

        <WidgetStack className="mt-3">
        <Widget>
        <dl className="grid grid-cols-2 gap-10 px-10 py-5 max-sm:grid-cols-1 max-sm:gap-3 max-sm:px-4">
          <div>
            <dt className="text-[13px] text-slate-500">Today</dt>
            <dd className="mt-0.5 text-[15px] text-slate-950">{uc.today}</dd>
          </div>
          <div>
            <dt className="text-[13px] text-slate-500">With this workflow</dt>
            <dd className="mt-0.5 text-[15px] text-slate-950">{uc.now}</dd>
          </div>
        </dl>

        <ol role="tablist" aria-label="Steps" className="grid grid-cols-3 border-t border-slate-200 max-sm:grid-cols-1">
          {STEPS.map((s) => {
            const open = s.n === 1 || !!built[id]
            const done = (s.n === 1 && built[id]) || (s.n === 2 && live)
            return (
              <li key={s.n}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={step === s.n}
                  disabled={!open}
                  onClick={() => setStep(s.n)}
                  className={cn("flex w-full items-center gap-3 px-10 py-4 text-left disabled:opacity-40 max-sm:px-4", step === s.n ? "shadow-[inset_0_-2px_0] shadow-brand-500" : "hover:bg-slate-50")}
                >
                  <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-medium tabular-nums", done ? "bg-success-50 text-success-700" : step === s.n ? "bg-brand-500 text-white" : "bg-slate-100 text-slate-700")}>
                    {done ? <Check className="size-4" aria-label="Done" /> : s.n}
                  </span>
                  <span>
                    <span className={cn("block text-sm font-semibold", step === s.n ? "text-brand-700" : "text-slate-950")}>{s.name}</span>
                    <span className="block text-[13px] text-slate-500">{s.who}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
        </Widget>

        <div className="max-sm:px-4">
          {step === 1 && <Workshop key={uc.id} uc={uc} onDone={onBuilt} />}
          {step === 2 && <Publish key={uc.id} uc={uc} published={published[id]} onPublish={onPublish} />}
          {step === 3 && <Floor uc={uc} published={live} />}
        </div>
        </WidgetStack>
      </PageFrame>
    </PageShell>
  )
}
