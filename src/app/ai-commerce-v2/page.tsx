"use client"

import { PageShell } from "@/components/layout/page-shell"
import { AiCommerceV2 } from "@/components/ai-commerce-v2/view"

/** AI Commerce v2: AI share of sales, the attribute and intent graph, fixes. Paper towels, illustrative. Local only. */
export default function AiCommerceV2Page() {
  return (
    <PageShell className="bg-slate-50">
      <main className="min-h-screen">
        <AiCommerceV2 />
      </main>
    </PageShell>
  )
}
