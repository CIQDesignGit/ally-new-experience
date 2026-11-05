"use client"

import { Suspense } from "react"
import { PageShell } from "@/components/layout/page-shell"
import { PageFrame } from "@/components/layout/page-frame"
import { ContentResults } from "@/components/nudge/results/content-results"
import { AskAlly } from "@/components/nudge/claire/ask-ally"
import { RESULTS_QUESTIONS, resultsAnswer } from "@/components/nudge/ask-ally-personas"

/** "See all SKUs": every content change last quarter, by type of work, with its lifts. Reached from the How we did cards. */
export default function ContentResultsPage() {
  return (
    <PageShell className="bg-slate-50">
      <PageFrame>
        <Suspense fallback={null}>
          <ContentResults />
        </Suspense>
      </PageFrame>
      <AskAlly questions={RESULTS_QUESTIONS} renderAnswer={resultsAnswer} placeholder="Ask Ally about these results" />
    </PageShell>
  )
}
