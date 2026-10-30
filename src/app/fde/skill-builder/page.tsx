"use client"

import { ClaudeCode } from "@/components/competition/claude-code"
import { ConsoleShell } from "@/components/competition/console-shell"

/** Step 2 on the build harness: Nora builds the skill in CommerceIQ's own Skill Builder, with Ally. */
export default function SkillBuilderPage() {
  return (
    <ConsoleShell step={2}>
      <ClaudeCode harness="build" />
    </ConsoleShell>
  )
}
