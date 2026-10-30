"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { StepBar } from "./step-bar"

const NAV = ["Skills", "Templates", "Dataspaces", "Runs"] as const

/** CommerceIQ's internal Agent Console: where skills are reviewed, tested and published. */
export function ConsoleShell({ step, children }: { step?: 2 | 3; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {step && <StepBar step={step} harness={step === 2 ? "build" : undefined} />}
      <div className="flex h-12 items-center gap-8 border-b border-slate-200 bg-white px-10">
        <span className="text-[14px] font-semibold text-slate-950">CommerceIQ Agent Console</span>
        <nav className="flex gap-5 text-[14px]">
          {NAV.map((n) =>
            n === "Skills" ? (
              <Link key={n} href="/console/skills" className="font-medium text-slate-950 hover:text-brand-700">
                {n}
              </Link>
            ) : (
              <span key={n} className="text-slate-500">
                {n}
              </span>
            ),
          )}
        </nav>
        <span className="ml-auto text-[13px] text-slate-500">Lena Brooks · FDE lead</span>
      </div>
      <main className="mx-auto max-w-[1280px] bg-white">{children}</main>
    </div>
  )
}
