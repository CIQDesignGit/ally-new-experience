"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Check, Loader2, ThumbsDown, ThumbsUp } from "lucide-react"
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

const MISSES = [
  { id: "logic", label: "Wrong logic", ask: "Let's work on the logic. What needs to change?" },
  { id: "presentation", label: "Poor presentation", ask: "What needs to change in the presentation?" },
  { id: "data", label: "Wrong data", ask: "Which data was wrong?" },
] as const
type Miss = (typeof MISSES)[number]["id"]

/** What a correction in plain words changes in the recipe: Ally's read of it, shown back before it's applied. */
function readLogic(text: string, r: GapRecipe): { recipe: GapRecipe; heard: string[] } {
  const t = text.toLowerCase()
  const heard: string[] = []
  let next = { ...r, steps: [...r.steps] }
  const measure = /\b(weight|lbs|pounds)\b/.test(t) ? "weight" : /\bunits?\b/.test(t) ? "units" : /\b(dollars|sales \(\$\)|in sales)\b/.test(t) ? "sales" : undefined
  if (measure && measure !== r.measure) {
    next = { ...next, measure }
    heard.push(`Measure plan in ${MEASURE_LABEL[measure]}, not ${MEASURE_LABEL[r.measure]}`)
  }
  if (/fill.?rate/.test(t) && !next.steps.includes(FILL_STEP)) {
    next.steps.push(FILL_STEP)
    heard.push(`Add a step: ${FILL_STEP.replace(/^Checked/, "check")}`)
  }
  if (!heard.length && t.trim()) {
    const st = text.trim().replace(/^(you )?(should|need to|missed|forgot to)\s*/i, "")
    const step = `Checked ${st.charAt(0).toLowerCase()}${st.slice(1)}`.replace(/^Checked check(ed)? /i, "Checked ")
    next.steps.push(step)
    heard.push(`Add a step: ${step.replace(/^Checked/, "check")}`)
  }
  return { recipe: next, heard }
}
function readPresentation(text: string, r: GapRecipe): { recipe: GapRecipe; heard: string[] } {
  const t = text.toLowerCase()
  const add = ([["units", /\bunits?\b/], ["weight", /\b(weight|lbs|pounds)\b/], ["fill", /fill.?rate/]] as const).filter(([c, re]) => re.test(t) && !r.columns.includes(c)).map(([c]) => c)
  const name = { units: "Units", weight: "Shipped weight", fill: "Fill rate" }
  return { recipe: { ...r, columns: [...r.columns, ...add] }, heard: add.length ? [`Add columns to plan vs actual: ${add.map((c) => name[c]).join(", ")}`] : [] }
}

/** The changes between two versions of the skill file, in its own words. */
function diff(a: GapRecipe, b: GapRecipe) {
  const name = { units: "Units", weight: "Shipped weight", fill: "Fill rate" }
  return [
    a.measure !== b.measure && `Measure plan in: ${MEASURE_LABEL[a.measure]} → ${MEASURE_LABEL[b.measure]}`,
    ...b.steps.filter((x) => !a.steps.includes(x)).map((x) => `Step added: ${x}`),
    ...b.columns.filter((x) => !a.columns.includes(x)).map((x) => `Column added: ${name[x]}`),
  ].filter(Boolean) as string[]
}

/** One of Ally's turns in the correction: a short line, after a beat. */
function AllySays({ children, delay = 0.35 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.25 }} className="text-[15px] font-semibold text-slate-950">
      {children}
    </motion.div>
  )
}

/** The skill file Ally runs gap to plan from: its lines, what changed, and (once approved) the decision log. */
function SkillFile({ base, draft, version, log }: { base: GapRecipe; draft: GapRecipe; version: number; log?: GapRecipe["log"] }) {
  const changes = diff(base, draft)
  const name = { units: "Units", weight: "Shipped weight", fill: "Fill rate" }
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white text-sm">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-25 px-5 py-2.5">
        <span className="font-semibold text-slate-950">Gap to plan · skill file</span>
        <span className="text-xs text-slate-500 tabular-nums">
          v{version}
          {changes.length > 0 && ` → v${version + 1}`}
        </span>
      </div>
      <dl className="grid grid-cols-[120px_minmax(0,1fr)] gap-x-4 gap-y-2 px-5 py-3.5">
        <dt className="text-slate-500">Measure plan in</dt>
        <dd className="text-slate-950">
          {base.measure !== draft.measure && <span className="mr-2 text-slate-400 line-through">{MEASURE_LABEL[base.measure]}</span>}
          <span className={base.measure !== draft.measure ? "font-medium text-brand-700" : undefined}>{MEASURE_LABEL[draft.measure]}</span>
        </dd>
        <dt className="text-slate-500">Steps</dt>
        <dd className="text-slate-950">
          10 standard
          {draft.steps.map((x) => (
            <span key={x} className={cn("block", !base.steps.includes(x) && "font-medium text-brand-700")}>
              + {x}
            </span>
          ))}
        </dd>
        <dt className="text-slate-500">Columns</dt>
        <dd className="text-slate-950">
          Actual, Plan, Gap
          {draft.columns.map((c) => (
            <span key={c} className={cn(!base.columns.includes(c) && "font-medium text-brand-700")}>, {name[c]}</span>
          ))}
        </dd>
      </dl>
      {log && log.length > 0 && (
        <div className="border-t border-slate-100 px-5 py-3">
          <div className="text-xs font-medium text-slate-500">Decision log</div>
          {[...log].reverse().map((e) => (
            <div key={e.version} className="mt-1.5 text-[13px] text-slate-700">
              <span className="font-medium text-slate-950">
                v{e.version} · {e.who}
              </span>{" "}
              changed it for {SCOPE_LABEL[e.scope].toLowerCase().replace("the aurelle account", "the Aurelle account")} · {e.when}
              <span className="block text-slate-500">{e.changes.join(" · ")}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Under the analysis, correcting the recipe as a conversation: what did I miss
 * (logic, presentation, data); Ally asks about each in turn and reads back what
 * it heard; the updated skill file is approved for a scope and logged; then
 * Ally offers to rerun and shows the revised answer.
 */
export function RecipeFeedback({ node, render }: { node: GapNode; render: (recipe: GapRecipe) => React.ReactNode }) {
  const { knowledge, saveKnowledge } = useNudge()
  const lesson = useGapLesson()
  const [base] = useState(lesson?.recipe ?? DEFAULT_RECIPE)
  // The version this correction started from; approving makes the next one (and doesn't renumber itself).
  const [version] = useState((base.log?.length ?? 0) + 1)
  const [vote, setVote] = useState<"up" | "down" | null>(null)
  const [picked, setPicked] = useState<Miss[]>([])
  const [queue, setQueue] = useState<Miss[] | null>(null)
  const [answers, setAnswers] = useState<{ id: Miss; said: string; heard: string[] }[]>([])
  const [draft, setDraft] = useState<GapRecipe>(base)
  const [text, setText] = useState("")
  const [stage, setStage] = useState<"ask" | "updating" | "review" | "scope" | "approved" | "running" | "rerun">("ask")
  const [scope, setScope] = useState<GapRecipe["scope"]>("account")
  const current = queue?.find((q) => !answers.some((a) => a.id === q))
  const miss = MISSES.find((x) => x.id === current)

  // Updating the skill file and rerunning take a visible beat: Ally is doing work, not flipping a switch.
  useEffect(() => {
    if (stage !== "running" && stage !== "updating") return
    const t = window.setTimeout(() => setStage(stage === "updating" ? "review" : "rerun"), stage === "updating" ? 5000 : 2600)
    return () => window.clearTimeout(t)
  }, [stage])

  function answer(said: string) {
    if (!current || !said.trim()) return
    const read = current === "logic" ? readLogic(said, draft) : current === "presentation" ? readPresentation(said, draft) : { recipe: draft, heard: [`Flagged to your data team: ${said.trim()}`] }
    setDraft(read.recipe)
    setAnswers((a) => [...a, { id: current, said: said.trim(), heard: read.heard.length ? read.heard : ["Nothing to change from that; say it another way?"] }])
    setText("")
    if (!queue!.some((q) => q !== current && !answers.some((a) => a.id === q))) setStage("updating")
  }

  function approve() {
    const entry = { version: version + 1, who: "Michelle Ortiz", when: DATE, scope, changes: diff(base, draft) }
    const saved: GapRecipe = { ...draft, scope, log: [...(base.log ?? []), entry] }
    setDraft(saved)
    saveKnowledge([
      { id: LESSON_ID, text: `${lessonText(saved)}.`, retailer: "Amazon", brands: ["Aurelle Candles"], skuGroups: [], author: "Michelle Ortiz", date: DATE, source: `gap-to-plan skill file v${version + 1}`, recipe: saved },
      ...knowledge.filter((x) => x.id !== LESSON_ID),
    ])
    setStage("approved")
  }

  const changed = diff(base, draft).length > 0
  return (
    <div className="flex max-w-[900px] flex-col gap-4 border-t border-slate-100 pt-4">
      {!queue && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm text-slate-500">Did Ally get this right?</span>
          {(["up", "down"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-label={v === "up" ? "Ally got this right" : "Ally missed something"}
              aria-pressed={vote === v}
              onClick={() => setVote(v)}
              className={cn("flex size-9 items-center justify-center rounded-lg border transition-colors", vote === v ? (v === "up" ? "border-success-300 bg-success-50 text-success-600" : "border-slate-300 bg-slate-100 text-slate-700") : "border-slate-200 bg-white text-slate-400 hover:text-slate-600")}
            >
              {v === "up" ? <ThumbsUp className="size-4" /> : <ThumbsDown className="size-4" />}
            </button>
          ))}
          {vote === "up" && <span className="text-sm text-success-700">Thanks. Ally keeps running it this way.</span>}
        </div>
      )}

      {vote === "down" && !queue && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
          <AllySays delay={0.1}>What did I miss?</AllySays>
          <div className="flex flex-wrap gap-1.5">
            {MISSES.map((x) => (
              <button
                key={x.id}
                type="button"
                aria-pressed={picked.includes(x.id)}
                onClick={() => setPicked((p) => (p.includes(x.id) ? p.filter((y) => y !== x.id) : [...p, x.id]))}
                className={cn("inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-colors", picked.includes(x.id) ? "border-brand-300 bg-brand-50 text-brand-800" : "border-slate-200 text-slate-700 hover:border-slate-300")}
              >
                {picked.includes(x.id) && <Check className="size-3.5" />}
                {x.label}
              </button>
            ))}
          </div>
          <button type="button" disabled={!picked.length} onClick={() => setQueue(MISSES.map((x) => x.id).filter((id) => picked.includes(id)))} className={cn(PRIMARY, "w-fit disabled:opacity-50")}>
            Continue
          </button>
        </motion.div>
      )}

      {queue && (
        <div className="flex flex-col gap-4">
          {/* The conversation so far: each question, what was said, and what Ally took from it. */}
          {answers.map((a) => (
            <div key={a.id} className="flex flex-col gap-2">
              <div className="text-[15px] font-semibold text-slate-950">{MISSES.find((x) => x.id === a.id)!.ask}</div>
              <div className="w-fit max-w-[80%] self-end rounded-2xl bg-brand-600 px-4 py-2 text-sm text-white">{a.said}</div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex flex-col gap-1 text-sm text-slate-700">
                <span className="text-slate-500">Got it. I&apos;ll change:</span>
                {a.heard.map((h) => (
                  <span key={h} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-brand-600" />
                    {h}
                  </span>
                ))}
              </motion.div>
            </div>
          ))}

          {stage === "ask" && miss && (
            <div key={miss.id} className="flex flex-col gap-2">
              <AllySays delay={answers.length ? 0.9 : 0.2}>{miss.ask}</AllySays>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  answer(text)
                }}
                className="flex gap-2"
              >
                <input autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder="Type what to change" className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-brand-300 focus:ring-2 focus:ring-brand-100" />
                <button type="submit" disabled={!text.trim()} className={cn(PRIMARY, "disabled:opacity-50")}>
                  Send
                </button>
              </form>
            </div>
          )}

          {stage === "updating" && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="flex items-center gap-2 text-[15px] text-slate-500">
              <Loader2 className="size-4 animate-spin text-brand-600" />
              Updating the skill file…
            </motion.p>
          )}

          {stage !== "ask" && stage !== "updating" && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
              <AllySays delay={0}>{stage === "review" ? (changed ? "Here's the new skill file." : "Nothing in the skill file changes from that.") : "Skill file updated."}</AllySays>
              {/* Before approval: the change against the current version. After: the new version and its log. */}
              {stage === "review" || stage === "scope" ? <SkillFile base={base} draft={draft} version={version} /> : <SkillFile base={draft} draft={draft} version={version + 1} log={draft.log} />}
              {stage === "review" && changed && (
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setStage("scope")} className={PRIMARY}>
                    Approve the skill file
                  </button>
                  <button type="button" onClick={() => setAnswers([])} className="text-sm font-medium text-slate-600 hover:text-slate-950">
                    Start over
                  </button>
                </div>
              )}
              {stage === "scope" && (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm text-slate-700">Change it for</span>
                  <div className="flex h-9 rounded-lg border border-slate-200 bg-slate-25 p-0.5">
                    {(["me", "team", "account"] as const).map((sc) => (
                      <button key={sc} type="button" onClick={() => setScope(sc)} className={cn("rounded-md px-2.5 text-[13px] font-medium whitespace-nowrap", scope === sc ? "bg-white text-slate-950 shadow-xs ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-800")}>
                        {SCOPE_LABEL[sc]}
                      </button>
                    ))}
                  </div>
                  <button type="button" onClick={approve} className={PRIMARY}>
                    <Check className="mr-1 inline size-4" /> Approve
                  </button>
                </div>
              )}
              {stage === "approved" && (
                <>
                  <MemorySaved text={`Learned: ${lessonText(draft)}. Applies to ${SCOPE_LABEL[scope].toLowerCase().replace("the aurelle account", "the Aurelle account")}.`} />
                  <AllySays delay={0.8}>Do you want me to run the analysis again?</AllySays>
                  <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} type="button" onClick={() => setStage("running")} className={cn(PRIMARY, "w-fit")}>
                    Run it again
                  </motion.button>
                </>
              )}
              {stage === "running" && (
                <p className="flex items-center gap-2 text-[15px] text-slate-500">
                  <Loader2 className="size-4 animate-spin text-brand-600" />
                  Rerunning gap to plan on skill file v{version + 1}…
                </p>
              )}
              {stage === "rerun" && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2">
                  <div className="text-sm text-slate-500">
                    Revised answer · skill file v{version + 1} · {node.id === "overall" ? "overall business" : node.name}
                  </div>
                  {render(draft)}
                  <AfterRerun />
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}

/** The thumbs again, under the revised answer: the loop closes on a thumbs up. */
function AfterRerun() {
  const [vote, setVote] = useState<"up" | "down" | null>(null)
  return (
    <div className="flex flex-wrap items-center gap-2 pt-1">
      <span className="mr-1 text-sm text-slate-500">Did Ally get this right?</span>
      {(["up", "down"] as const).map((v) => (
        <button key={v} type="button" aria-label={v === "up" ? "Ally got this right" : "Ally missed something"} aria-pressed={vote === v} onClick={() => setVote(v)} className={cn("flex size-9 items-center justify-center rounded-lg border transition-colors", vote === v ? (v === "up" ? "border-success-300 bg-success-50 text-success-600" : "border-slate-300 bg-slate-100 text-slate-700") : "border-slate-200 bg-white text-slate-400 hover:text-slate-600")}>
          {v === "up" ? <ThumbsUp className="size-4" /> : <ThumbsDown className="size-4" />}
        </button>
      ))}
      {vote === "up" && <span className="text-sm text-success-700">Thanks. Ally runs gap to plan this way from now on.</span>}
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
