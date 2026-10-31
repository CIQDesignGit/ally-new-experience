"use client"

import { AgentConsole } from "@/components/competition/console"
import { ConsoleShell } from "@/components/competition/console-shell"
import { NAMES } from "@/components/competition/data"

/** Step 3: Lena reviews, tests and publishes competition watch. */
export default function ConsoleSkillPage() {
  return (
    <ConsoleShell step={3} crumbs={[{ label: "Skills", href: "/console/skills" }, { label: NAMES.skill }]}>
      <AgentConsole />
    </ConsoleShell>
  )
}
