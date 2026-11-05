"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { DELIVERED } from "../delivered-periods"
import { useNudge } from "../nudge-context"
import { QueueDelivered } from "../claire/delivered/bar-row"

/** Claire's Content row, opened up for Mike: one bar per kind of content work, the same numbers. */
export function MikeDelivered({ flat }: { flat?: boolean }) {
  const { period } = useNudge()
  const d = DELIVERED[period]
  return (
    <QueueDelivered
      flat={flat}
      label={d.label}
      rows={d.content.workTypes.map((w) => ({ name: w.name, did: w.did, delivered: w.delivered, promised: w.promised, data: w }))}
      footer={
        <Link href="/content-results?period=qtd" className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
          See SKU-level results and method <ArrowRight className="size-3.5" />
        </Link>
      }
    />
  )
}
