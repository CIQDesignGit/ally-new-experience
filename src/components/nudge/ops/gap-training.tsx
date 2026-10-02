"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Check, Loader2, Plus, ThumbsDown, ThumbsUp, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { AS_OF } from "../data"
import { useNudge } from "../nudge-context"
import { PRIMARY } from "../mike/buttons"
import { MemorySaved } from "../chat/memory"
import type { GapRecipe } from "../policy"
import type { GapNode } from "./gap-data"
import type { Chip } from "../chat/inline-chat"

/**
 * Teaching Ally how gap to plan runs (the PRD's "correct the recipe"): a thumbs
 * down asks what Ally missed; the person fixes the logic (a missed step, what
 * plan is measured in) or the presentation (columns) separately; Ally reruns
 * and shows before and after; only a confirmed recipe is saved, at the scope
 * chosen, as a lesson in Knowledge. Every later run uses it and says so.
 */

export const LESSON_ID = "lesson-gap-recipe"
export const DEFAULT_RECIPE: GapRecipe = { measure: "sales", steps: [], columns: [], scope: "account" }
/** The step Ally missed: short-shipped POs explain the Bright Citrus stockout. */
export const FILL_STEP = "Checked fill rate on last week's POs"
const DATE = new Date(`${AS_OF}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })

/** Units and shipped weight from dollars, at the account's mix ($24 a unit, 1.3 lbs a unit). */
export const unitsOf = (m: number) => (m * 1e6) / 24
export const lbsOf = (m: number) => unitsOf(m) * 1.3
// Thousands, one decimal under 10K, so the causes visibly add up to the gap (5.5K + 2.2K + … = 13K).
const k = (v: number) => {
  const a = Math.abs(v) / 1000
  return a >= 10 ? `${Math.round(a)}K` : `${+a.toFixed(1)}K`
}
/** Fill rate on last week's POs; the target is 95%. */
export const FILL = { rate: 88, target: 95, pos: 6 }

/** A value in what plan is measured in: "$3.42M", "143K units", "185K lbs". */
export function inMeasure(m: number, measure: GapRecipe["measure"], signed = false) {
  const sign = signed ? (m < 0 ? "−" : "+") : ""
  if (measure === "units") return `${sign}${k(unitsOf(m))} units`
  if (measure === "weight") return `${sign}${k(lbsOf(m))} lbs`
  const a = Math.abs(m)
  return `${sign}${a >= 1 ? `$${+a.toFixed(2)}M` : a >= 0.1 ? `$${Math.round(a * 1000)}K` : `$${+(a * 1000).toFixed(1)}K`}`
}
export const MEASURE_LABEL: Record<GapRecipe["measure"], string> = { sales: "sales ($)", units: "units", weight: "shipped weight (lbs)" }

/** The saved lesson, if Michelle (or her team) taught Ally how gap to plan runs. */
export function useGapLesson() {
  const { knowledge } = useNudge()
  const lesson = knowledge.find((x) => x.id === LESSON_ID)
  return lesson?.recipe ? { recipe: lesson.recipe, date: lesson.date, text: lesson.text } : undefined
}

/** One sentence for what was learned, the way Ally confirms it. */
export function lessonText(r: GapRecipe) {
  const lower = (t: string) => t.charAt(0).toLowerCase() + t.slice(1)
  const parts = [
    r.measure !== "sales" && `is measured in ${MEASURE_LABEL[r.measure].replace(" (lbs)", "")}`,
    ...r.steps.map((st) => `checks ${lower(st.replace(/^Checked /, ""))}`),
    r.columns.length > 0 && `shows ${r.columns.map((c) => ({ units: "units", weight: "weight", fill: "fill rate" })[c]).join(" and ")}`,
  ].filter(Boolean) as string[]
  const list = parts.length > 1 ? `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}` : parts[0]
  return `Aurelle's gap to plan ${list}`
}
const SCOPE_LABEL: Record<GapRecipe["scope"], string> = { me: "Only you", team: "Your team", account: "The Aurelle account" }

const PICKS = ["Wrong number", "Missed something", "Wrong logic", "Wrong format"]

/**
 * Under the analysis: did Ally get it right? A thumbs down opens "What did I
 * miss?" and the recipe to correct; the rerun shows before and after.
 */
export function RecipeFeedback({ node, render }: { node: GapNode; render: (recipe: GapRecipe) => React.ReactNode }) {
  const { knowledge, saveKnowledge } = useNudge()
  const lesson = useGapLesson()
  const [vote, setVote] = useState<"up" | "down" | null>(null)
  const [picks, setPicks] = useState<string[]>([])
  const [note, setNote] = useState("")
  const [draft, setDraft] = useState<GapRecipe>(lesson?.recipe ?? DEFAULT_RECIPE)
  const [newStep, setNewStep] = useState("")
  const [stage, setStage] = useState<"edit" | "running" | "compare" | "saved">("edit")
  const base = lesson?.recipe ?? DEFAULT_RECIPE

  useEffect(() => {
    if (stage !== "running") return
    const t = window.setTimeout(() => setStage("compare"), 2600)
    return () => window.clearTimeout(t)
  }, [stage])

  function save() {
    saveKnowledge([
      { id: LESSON_ID, text: `${lessonText(draft)}.`, retailer: "Amazon", brands: ["Aurelle Candles"], skuGroups: [], author: "Michelle Ortiz", date: DATE, source: "from correcting the gap-to-plan recipe", recipe: draft },
      ...knowledge.filter((x) => x.id !== LESSON_ID),
    ])
    setStage("saved")
  }

  const gap = node.lastWeek.sales - node.lastWeek.plan
  const pct = Math.round((node.lastWeek.sales / node.lastWeek.plan) * 100)
  const summary = (r: GapRecipe) => (
    <div className="flex flex-col gap-1 text-sm tabular-nums">
      <span className="font-semibold text-slate-950">
        Missed plan by {inMeasure(Math.abs(gap), r.measure)}, {pct}% of plan
      </span>
      <span className="text-slate-600">
        {10 + r.steps.length} steps{r.columns.length > 0 && ` · columns: ${r.columns.map((c) => ({ units: "units", weight: "lbs", fill: "fill rate" })[c]).join(", ")}`}
      </span>
      {r.steps.includes(FILL_STEP) && (
        <span className="text-slate-600">
          Fill rate {FILL.rate}% on {FILL.pos} POs (target {FILL.target}%) explains the Bright Citrus stockout
        </span>
      )}
    </div>
  )

  return (
    <div className="flex max-w-[900px] flex-col gap-4">
      {stage !== "saved" && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm text-slate-500">Did Ally get this right?</span>
          {(["up", "down"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-label={v === "up" ? "Ally got this right" : "Ally missed something"}
              aria-pressed={vote === v}
              onClick={() => setVote(v)}
              className={cn(
                "flex size-9 items-center justify-center rounded-lg border transition-colors",
                vote === v ? (v === "up" ? "border-success-300 bg-success-50 text-success-600" : "border-slate-300 bg-slate-100 text-slate-700") : "border-slate-200 bg-white text-slate-400 hover:text-slate-600",
              )}
            >
              {v === "up" ? <ThumbsUp className="size-4" /> : <ThumbsDown className="size-4" />}
            </button>
          ))}
          {vote === "up" && <span className="text-sm text-success-700">Thanks. Ally keeps running it this way.</span>}
        </div>
      )}

      {vote === "down" && stage === "edit" && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="px-5 pt-4 pb-3">
            <div className="text-sm font-semibold text-slate-950">What did I miss?</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {PICKS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPicks((x) => (x.includes(p) ? x.filter((y) => y !== p) : [...x, p]))}
                  className={cn("rounded-full border px-3 py-1 text-[13px] transition-colors", picks.includes(p) ? "border-brand-300 bg-brand-50 text-brand-800" : "border-slate-200 text-slate-600 hover:border-slate-300")}
                >
                  {p}
                </button>
              ))}
            </div>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="We plan by weight, and you skipped fill rate" className="mt-3 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-brand-300 focus:ring-2 focus:ring-brand-100" />
          </div>

          {/* Logic and presentation are corrected separately. */}
          <div className="grid border-t border-slate-100 md:grid-cols-2">
            <div className="px-5 py-4">
              <div className="text-sm font-semibold text-slate-950">Logic</div>
              <div className="mt-3 text-xs font-medium text-slate-500">Measure plan in</div>
              <div className="mt-1.5 flex h-9 rounded-lg border border-slate-200 bg-slate-25 p-0.5">
                {(["sales", "units", "weight"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, measure: m }))}
                    className={cn("flex-auto rounded-md px-2 text-[13px] font-medium whitespace-nowrap", draft.measure === m ? "bg-white text-slate-950 shadow-xs ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-800")}
                  >
                    {{ sales: "Sales ($)", units: "Units", weight: "Weight (lbs)" }[m]}
                  </button>
                ))}
              </div>
              <div className="mt-4 text-xs font-medium text-slate-500">Steps · 10 Ally ran{draft.steps.length > 0 && `, ${draft.steps.length} you added`}</div>
              <div className="mt-1.5 flex flex-col gap-1">
                {draft.steps.map((s) => (
                  <div key={s} className="flex items-center gap-2 rounded-md bg-brand-25 px-2.5 py-1.5 text-sm text-slate-950">
                    <Plus className="size-3.5 text-brand-600" />
                    <span className="flex-1">{s}</span>
                    <button type="button" aria-label={`Remove ${s}`} onClick={() => setDraft((d) => ({ ...d, steps: d.steps.filter((x) => x !== s) }))} className="text-slate-400 hover:text-slate-700">
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))}
                {!draft.steps.includes(FILL_STEP) && (
                  <button type="button" onClick={() => setDraft((d) => ({ ...d, steps: [...d.steps, FILL_STEP] }))} className="flex items-center gap-2 rounded-md border border-dashed border-slate-300 px-2.5 py-1.5 text-left text-sm text-slate-600 hover:border-brand-300 hover:text-brand-700">
                    <Plus className="size-3.5" /> {FILL_STEP}
                  </button>
                )}
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const t = newStep.trim()
                    if (t && !draft.steps.includes(t)) setDraft((d) => ({ ...d, steps: [...d.steps, t] }))
                    setNewStep("")
                  }}
                >
                  <input value={newStep} onChange={(e) => setNewStep(e.target.value)} placeholder="Add a step" className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm outline-none placeholder:text-slate-400 focus:border-brand-300" />
                </form>
              </div>
            </div>
            <div className="border-t border-slate-100 px-5 py-4 md:border-t-0 md:border-l">
              <div className="text-sm font-semibold text-slate-950">Presentation</div>
              <div className="mt-3 text-xs font-medium text-slate-500">Columns in plan vs actual</div>
              <div className="mt-1.5 flex flex-col gap-1.5 text-sm">
                {["Actual", "Plan", "Gap"].map((c) => (
                  <label key={c} className="flex items-center gap-2 text-slate-500">
                    <input type="checkbox" checked disabled className="accent-slate-400" /> {c}
                  </label>
                ))}
                {(["units", "weight", "fill"] as const).map((c) => (
                  <label key={c} className="flex cursor-pointer items-center gap-2 text-slate-950">
                    <input
                      type="checkbox"
                      checked={draft.columns.includes(c)}
                      onChange={() => setDraft((d) => ({ ...d, columns: d.columns.includes(c) ? d.columns.filter((x) => x !== c) : [...d.columns, c] }))}
                      className="accent-brand-600"
                    />
                    {{ units: "Units", weight: "Shipped weight (lbs)", fill: "Fill rate" }[c]}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 border-t border-slate-100 bg-slate-25 px-5 py-3">
            <button type="button" onClick={() => setStage("running")} disabled={JSON.stringify(draft) === JSON.stringify(base)} className={cn(PRIMARY, "disabled:opacity-50")}>
              Re-run with these changes
            </button>
            <span className="text-xs text-slate-500">Nothing is saved until you confirm.</span>
          </div>
        </motion.div>
      )}

      {stage === "running" && (
        <p className="flex items-center gap-2 text-[15px] text-slate-500">
          <Loader2 className="size-4 animate-spin text-brand-600" />
          Re-running gap to plan with your recipe…
        </p>
      )}

      {stage === "compare" && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
          <div className="grid overflow-hidden rounded-xl border border-slate-200 md:grid-cols-2">
            <div className="px-5 py-4">
              <div className="text-xs font-medium text-slate-500">Before</div>
              <div className="mt-1.5">{summary(base)}</div>
            </div>
            <div className="border-t border-slate-100 bg-brand-25 px-5 py-4 md:border-t-0 md:border-l md:border-l-brand-100">
              <div className="text-xs font-medium text-brand-700">After</div>
              <div className="mt-1.5">{summary(draft)}</div>
            </div>
          </div>
          {render(draft)}
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4">
            <span className="text-sm font-semibold text-slate-950">Save this as how Ally runs gap to plan?</span>
            <div className="flex h-9 rounded-lg border border-slate-200 bg-slate-25 p-0.5">
              {(["me", "team", "account"] as const).map((sc) => (
                <button key={sc} type="button" onClick={() => setDraft((d) => ({ ...d, scope: sc }))} className={cn("rounded-md px-2.5 text-[13px] font-medium whitespace-nowrap", draft.scope === sc ? "bg-white text-slate-950 shadow-xs ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-800")}>
                  {SCOPE_LABEL[sc]}
                </button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-3">
              <button type="button" onClick={() => setStage("edit")} className="text-sm font-medium text-slate-600 hover:text-slate-950">
                Keep editing
              </button>
              <button type="button" onClick={save} className={PRIMARY}>
                <Check className="mr-1 inline size-4" /> Save
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {stage === "saved" && <MemorySaved text={`Learned: ${lessonText(draft)}. Applies to ${SCOPE_LABEL[draft.scope].toLowerCase().replace("the aurelle account", "the Aurelle account")}.`} />}
    </div>
  )
}

/** "Remember that we measure plan by weight", typed anywhere: saved straight away, confirmed in one line. */
export function LessonFromChat() {
  const { knowledge, saveKnowledge } = useNudge()
  const lesson = useGapLesson()
  const [recipe] = useState<GapRecipe>({ ...(lesson?.recipe ?? DEFAULT_RECIPE), measure: "weight" })
  useEffect(() => {
    saveKnowledge([
      { id: LESSON_ID, text: `${lessonText(recipe)}.`, retailer: "Amazon", brands: ["Aurelle Candles"], skuGroups: [], author: "Michelle Ortiz", date: DATE, source: "from Ask Ally", recipe },
      ...knowledge.filter((x) => x.id !== LESSON_ID),
    ])
    // Once, when said.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return <MemorySaved text={`Learned: ${lessonText(recipe)}. Applies to the Aurelle account.`} />
}

/** Plain language anywhere: "Remember that we measure plan by weight". Not a starter: it matches what's typed. */
export const LESSON_CHIP: Chip = { q: "Remember that we measure plan by weight", hidden: true, match: /\bremember\b.*\b(weight|pounds|lbs)\b/i, think: { ms: 1200, label: "Saving to memory" }, render: () => <LessonFromChat /> }
