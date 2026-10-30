"use client"

import { cn } from "@/lib/utils"
import { AgentConsole } from "@/components/competition/console"
import { StepBar } from "@/components/competition/step-bar"

const NAV = ["Skills", "Templates", "Dataspaces", "Runs"] as const

/** Step 3: CommerceIQ's internal Agent Console, where skills are reviewed, tested and published. */
export default function ConsoleSkillPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <StepBar step={3} />
      <div className="flex h-12 items-center gap-8 border-b border-slate-200 bg-white px-10">
        <span className="text-[14px] font-semibold text-slate-950">CommerceIQ Agent Console</span>
        <nav className="flex gap-5 text-[14px]">
          {NAV.map((n) => (
            <span key={n} className={cn(n === "Skills" ? "font-medium text-slate-950" : "text-slate-500")}>
              {n}
            </span>
          ))}
        </nav>
        <span className="ml-auto text-[13px] text-slate-500">Lena Brooks · FDE lead</span>
      </div>
      <main className="mx-auto max-w-[1280px] bg-white">
        <AgentConsole />
      </main>
    </div>
  )
}
