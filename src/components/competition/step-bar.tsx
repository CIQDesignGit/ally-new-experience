"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCompetition, reached, type Stage } from "./state"
import { NAMES } from "./data"
import { BUILD_STEP, useHarness, type Harness } from "./harness"

/** The four steps: who acts, where, and where to go next once this step's work is done. */
const STEPS = [
  { who: `${NAMES.customer} · Aurelle`, where: "Ally", href: "/michelle", next: "/fde/claude-code", ready: "requested" as Stage },
  { who: `${NAMES.fde} · CommerceIQ engineer`, where: "Claude Code", href: "/fde/claude-code", next: "/console/skills/competition-watch", ready: "submitted" as Stage },
  { who: `${NAMES.reviewer} · FDE lead`, where: "Agent Console", href: "/console/skills/competition-watch", next: "/michelle", ready: "live" as Stage },
  { who: `${NAMES.customer} · Aurelle`, where: "Ally", href: "/michelle/dashboards/competition", next: undefined, ready: "live" as Stage },
] as const

/**
 * A thin bar over each screen of the competition demo: whose screen this is,
 * which step, and the way to the next one. Shows only while the demo runs.
 */
export function StepBar({ step, dark, harness }: { step: 1 | 2 | 3 | 4; dark?: boolean; harness?: Harness }) {
  const c = useCompetition()
  // The build step happens where the harness says: Claude Code (borrow) or our Skill Builder (build). Its own page says which it is.
  const chosen = useHarness()
  const build = BUILD_STEP[harness ?? chosen]
  if (!c.on) return null
  const steps = STEPS.map((x, i) => (i === 1 ? { ...x, where: build.where, href: build.href } : i === 0 ? { ...x, next: build.href } : x))
  const s = steps[step - 1]
  const ok = reached(c, s.ready)
  // Step 1 comes back after publishing as step 4: Michelle's page with the tracker live.
  const nextHref = step === 3 ? "/michelle" : s.next
  const nx = steps[step]
  return (
    <div className={cn("flex h-10 items-center gap-3 px-4 text-[13px]", dark ? "bg-black text-slate-300" : "bg-slate-900 text-slate-300")}>
      <span className="font-medium text-white">Step {step} of 4</span>
      <span aria-hidden>·</span>
      <span>{s.who}</span>
      <span aria-hidden>·</span>
      <span>{s.where}</span>
      {nextHref && nx && (
        <Link href={nextHref} aria-disabled={!ok} className={cn("ml-auto inline-flex items-center gap-1 font-medium", ok ? "text-white hover:underline" : "pointer-events-none text-slate-500")}>
          Next: {nx.who.split(" · ")[0]} in {nx.where} <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      )}
    </div>
  )
}
