"use client"

import { ClaudeCode } from "@/components/competition/claude-code"
import { StepBar } from "@/components/competition/step-bar"

/** Step 2: Nora, a CommerceIQ engineer, builds the skill in Claude Code. */
export default function ClaudeCodePage() {
  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <StepBar step={2} dark harness="borrow" />
      <ClaudeCode />
    </div>
  )
}
