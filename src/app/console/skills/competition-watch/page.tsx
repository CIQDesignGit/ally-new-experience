"use client"

import { AgentConsole } from "@/components/competition/console"
import { ConsoleShell } from "@/components/competition/console-shell"

/** Step 3: Lena reviews, tests and publishes competition watch. */
export default function ConsoleSkillPage() {
  return (
    <ConsoleShell step={3}>
      <AgentConsole />
    </ConsoleShell>
  )
}
