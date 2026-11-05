"use client"

import type { ReactNode } from "react"
import { StepBar } from "./step-bar"
import { AppDrawer } from "../nudge/app-drawer"
import { TopStrip, type Crumb } from "../nudge/top-strip"

/**
 * CommerceIQ's Agent Console, where skills are reviewed, tested and published:
 * Nora's Skills, in the same top strip and nav as every other page.
 */
export function ConsoleShell({ step, crumbs = [{ label: "Skills" }], children }: { step?: 2 | 3; /** After Home (Nora's Requests). */ crumbs?: Crumb[]; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {step && <StepBar step={step} harness={step === 2 ? "build" : undefined} />}
      <main className="mx-auto min-h-screen max-w-[1280px] bg-white">
        <TopStrip person="nora" crumbs={[{ label: "Home", href: "/fde" }, ...crumbs]} />
        {children}
      </main>
      {/* The engineer's nav: the console is where her skills live. */}
      <AppDrawer home="/fde" />
    </div>
  )
}
