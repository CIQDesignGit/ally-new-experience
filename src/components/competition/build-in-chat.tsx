"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowRight, Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { AnswerCard } from "../nudge/chat/inline-chat"
import { PRIMARY } from "../nudge/mike/buttons"
import { LineChart } from "../nudge/wbr/line-chart"
import { useCompetition, setCompetition } from "./state"
import { FINDING, MATCHED, MATCHES, NAMES, SOV, SOV_WEEKS, TESTS } from "./data"
import { StandsToday, TrackerSpec } from "./michelle"

/** What Ally does before it asks her anything, then the one thing it tests after. */
const BUILD_STEPS = ["Reading your sales and search data", `Finding ${NAMES.competitor}'s products`, "Matching them to yours"]
const TEST_STEP = "Testing on your last 8 weeks"
const STEP_MS = 1100

/**
 * The deep ask on the build harness: Ally builds the tracker here, in her chat.
 * No request, no engineer, no review: she makes the one business check (are
 * these the right products?), sees it pass on her own weeks, and turns it on.
 * It's private to her account.
 */
export function BuildAnswer() {
  const c = useCompetition()
  const on = c.selfBuilt && c.stage === "live"
  const started = !!c.self || on
  return (
    <div className="flex max-w-[860px] flex-col gap-3">
      <StandsToday verdict={<>Nothing in your library tracks a competitor every week yet. I can build it for you now</>} />
      <TrackerSpec
        locked={started}
        footer={
          <>
            <div className="text-[14px] text-slate-700">Built now, in this chat · private to {NAMES.account}</div>
            {on ? (
              <span className="flex items-center gap-1.5 text-[14px] text-success-700">
                <Check className="size-4" aria-hidden /> On
              </span>
            ) : started ? (
              <span className="text-[14px] text-slate-500">Building</span>
            ) : (
              <button type="button" onClick={() => setCompetition({ self: "building" })} className={PRIMARY}>
                Build it
              </button>
            )}
          </>
        }
      />
      {started && <Building />}
    </div>
  )
}

/** Ally at work, then the check, the test and the switch, each appearing as the one before finishes. */
function Building() {
  const c = useCompetition()
  const on = c.selfBuilt && c.stage === "live"
  const at = on ? "on" : c.self
  // Steps tick over while she watches; the next stage starts when the last one ends.
  const [done, setDone] = useState(at === "building" ? 0 : BUILD_STEPS.length)
  useEffect(() => {
    if (at !== "building") return
    const t = window.setTimeout(() => (done < BUILD_STEPS.length - 1 ? setDone(done + 1) : setCompetition({ self: "check" })), STEP_MS)
    return () => window.clearTimeout(t)
  }, [at, done])
  useEffect(() => {
    if (at !== "testing") return
    const t = window.setTimeout(() => setCompetition({ self: "tested" }), STEP_MS * 1.6)
    return () => window.clearTimeout(t)
  }, [at])

  // Each new card comes into view as it appears, so she never scrolls to find what Ally needs from her.
  const end = useRef<HTMLDivElement>(null)
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [at])

  const past = (s: typeof at) => ["building", "check", "testing", "tested", "on"].indexOf(at ?? "") > ["building", "check", "testing", "tested", "on"].indexOf(s ?? "")
  return (
    <>
      <AnswerCard>
        <Steps steps={BUILD_STEPS} done={at === "building" ? done : BUILD_STEPS.length} />
      </AnswerCard>

      {(at === "check" || past("check")) && (
        <AnswerCard>
          <p className="font-semibold text-slate-950">
            I matched {MATCHED} of {NAMES.competitor}&rsquo;s products to your gift sets. Look right?
          </p>
          <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 text-[14px]">
            <div className="grid grid-cols-2 gap-4 border-b border-slate-200 bg-slate-25 px-4 py-2 text-xs font-medium text-slate-500">
              <span>{NAMES.competitor}</span>
              <span>Your gift set</span>
            </div>
            {MATCHES.map((m) => (
              <div key={m.theirs} className="grid grid-cols-2 gap-4 border-b border-slate-100 px-4 py-2.5 last:border-b-0">
                <span className="text-slate-700">{m.theirs}</span>
                <span>
                  <span className="text-slate-950">{m.ours}</span>
                  {m.note && <span className="mt-0.5 block text-[13px] text-slate-500">{m.note}</span>}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3">
            {at === "check" ? (
              <button type="button" onClick={() => setCompetition({ self: "testing" })} className={PRIMARY}>
                Looks right
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[14px] text-success-700">
                <Check className="size-4" aria-hidden /> You confirmed {MATCHED} matches
              </span>
            )}
          </div>
        </AnswerCard>
      )}

      {(at === "testing" || past("testing")) && (
        <AnswerCard>
          <Steps steps={[TEST_STEP]} done={at === "testing" ? 0 : 1} />
        </AnswerCard>
      )}

      {(at === "tested" || at === "on") && (
        <AnswerCard>
          <p className="font-semibold text-slate-950">
            {TESTS.length} of {TESTS.length} checks passed on your last 8 weeks.
          </p>
          <p className="mt-1 text-[14px] text-slate-700">{FINDING}</p>
          {/* A preview of the dashboard, on her own data. */}
          {/* Sized to the chart's own shape, so it fills the box instead of shrinking into its middle. */}
          <div className="mt-3 max-w-[460px] rounded-lg border border-slate-200 px-4 pt-3 pb-2">
            <LineChart labels={SOV_WEEKS} format={(v) => `${v}%`} series={[{ name: "You", values: SOV.ours, color: "#4f46e5" }, { name: NAMES.competitor, values: SOV.theirs, color: "#d92d20" }]} />
          </div>
          <div className="mt-3">
            {at === "tested" ? (
              <button type="button" onClick={() => setCompetition({ stage: "live", scope: "aurelle", selfBuilt: true, self: undefined })} className={PRIMARY}>
                Turn on
              </button>
            ) : (
              <TurnedOn />
            )}
          </div>
        </AnswerCard>
      )}
      <div ref={end} className="scroll-mb-40" aria-hidden />
    </>
  )
}

/** Where it lives now that it's on: her dashboard, her alert, her library. */
function TurnedOn() {
  const c = useCompetition()
  return (
    <div className="flex flex-col gap-2 text-[14px]">
      <span className="inline-flex items-center gap-1.5 font-medium text-success-700">
        <Check className="size-4" aria-hidden /> On · built for {NAMES.account}
      </span>
      <ul className="flex flex-col gap-1 text-slate-700">
        <li>· Competition dashboard, in My dashboards</li>
        <li>
          · Alert every {c.day} above {c.threshold} pts, in Scheduled
        </li>
        <li>· {NAMES.skill}, in your Library</li>
      </ul>
      <Link href="/michelle/dashboards/competition" className="inline-flex w-fit items-center gap-1 font-medium text-brand-700 hover:underline">
        Open the dashboard <ArrowRight className="size-3.5" aria-hidden />
      </Link>
    </div>
  )
}

/** Labelled working steps: done, in progress, still to come. */
function Steps({ steps, done }: { steps: string[]; done: number }) {
  return (
    <ul className="flex flex-col gap-1.5 text-[14px]">
      {steps.map((s, i) => (
        <li key={s} className={cn("flex items-center gap-2", i < done ? "text-slate-700" : i === done ? "text-slate-950" : "text-slate-400")}>
          {i < done ? <Check className="size-4 text-success-700" aria-hidden /> : i === done ? <Loader2 className="size-4 animate-spin text-brand-600" aria-hidden /> : <span className="size-4" aria-hidden />}
          {s}
        </li>
      ))}
    </ul>
  )
}
