"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { ConsoleShell } from "@/components/competition/console-shell"
import { LIVE_SKILLS } from "@/components/competition/skills"
import { NAMES, TESTS, TIMES } from "@/components/competition/data"
import { useCompetition, reached } from "@/components/competition/state"

const COLS = "grid grid-cols-[minmax(0,1.6fr)_minmax(0,1.3fr)_90px_150px_150px_90px] items-center gap-4"

/** Every skill on Aurelle's account: what starts it, which version is live, and its last test run. */
export default function ConsoleSkillsPage() {
  const c = useCompetition()
  const live = c.stage === "live"
  const version = c.competitorFixed ? 3 : c.sovFixed ? 2 : 1
  const competition = {
    id: "competition-watch",
    name: NAMES.skill,
    does: "Weekly read of a competitor: promotions, price gaps on matched products and share of voice",
    trigger: "Michelle asks Ally to track Brightwick every week",
    version: reached(c, "submitted") ? version : 0,
    status: live ? "Live" : reached(c, "submitted") ? "In review" : "Being built",
    lastRun: live ? TIMES.live : "Not run yet",
    tests: live ? `${TESTS.length} of ${TESTS.length}` : reached(c, "tested") ? `${TESTS.length - 2} of ${TESTS.length}` : "Not run",
    href: "/console/skills/competition-watch",
  }
  const rows = [
    ...LIVE_SKILLS.map((s) => ({ id: s.id, name: s.name, does: s.does, trigger: s.trigger, version: s.version, status: "Live", lastRun: s.lastRun, tests: `${s.tests.length} of ${s.tests.length}`, href: `/console/skills/${s.id}` })),
    // Competition watch exists once Michelle has asked an engineer for it; built in her chat, it's private to her account.
    ...(reached(c, "requested") && !c.selfBuilt ? [competition] : []),
  ]
  const liveCount = rows.filter((r) => r.status === "Live").length

  return (
    <ConsoleShell>
      <header className="px-10 pt-4">
        <div className="text-[13px] text-slate-500">{NAMES.account}</div>
        <h1 className="mt-1 text-[28px] leading-tight font-semibold tracking-tight text-slate-950">Skills</h1>
        <div className="mt-1 text-[14px] text-slate-500">
          {liveCount} live{rows.length > liveCount ? ` · ${rows.length - liveCount} in progress` : ""}
        </div>
      </header>

      <section className="mx-10 mt-6 mb-16 rounded-xl border border-slate-200">
        <div className={cn(COLS, "border-b border-slate-200 px-5 py-2.5 text-xs font-medium text-slate-500")}>
          <span>Skill</span>
          <span>Started by</span>
          <span>Version</span>
          <span>Status</span>
          <span>Last run</span>
          <span>Tests</span>
        </div>
        <ul className="divide-y divide-slate-100">
          {rows.map((r) => (
            <li key={r.id}>
              <Link href={r.href} className={cn(COLS, "px-5 py-4 text-[14px] hover:bg-slate-50")}>
                <span>
                  <span className="block font-medium text-brand-700">{r.name}</span>
                  <span className="mt-0.5 block text-[13px] leading-snug text-slate-500">{r.does}</span>
                </span>
                <span className="text-[13px] leading-snug text-slate-700">{r.trigger}</span>
                <span className="font-mono text-slate-700">{r.version ? `v${r.version}` : "—"}</span>
                <span className="flex items-center gap-2 text-slate-700">
                  <span className={cn("size-1.5 rounded-full", r.status === "Live" ? "bg-success-500" : "bg-slate-400")} aria-hidden />
                  {r.status}
                </span>
                <span className="text-slate-700">{r.lastRun}</span>
                <span className={cn("text-slate-700", r.tests !== "Not run" && "font-mono")}>{r.tests}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </ConsoleShell>
  )
}
