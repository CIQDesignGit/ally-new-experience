"use client"

import { PageShell } from "@/components/layout/page-shell"
import { AiCommerceView } from "@/components/ai-commerce/ai-commerce-view"

/** AI Commerce v1 (measurement): Hershey's candy, illustrative. Local only. */
export default function AiCommercePage() {
  return (
    <PageShell className="bg-slate-50">
      <main className="min-h-screen">
        <AiCommerceView />
      </main>
    </PageShell>
  )
}
