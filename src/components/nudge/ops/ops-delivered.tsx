"use client"

import { DELIVERED } from "../delivered-periods"
import { useNudge } from "../nudge-context"
import { QueueDelivered } from "../claire/delivered/bar-row"

/** Claire's Ops row, opened up for Michelle: one bar per kind of fix, the same numbers. */
export function OpsDelivered({ flat }: { flat?: boolean }) {
  const { period } = useNudge()
  const d = DELIVERED[period]
  return <QueueDelivered flat={flat} label={d.label} rows={d.ops.workTypes.map((w) => ({ name: w.name, did: w.did, delivered: w.delivered, promised: w.promised, data: w }))} />
}
