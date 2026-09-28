"use client"

import { useCallback } from "react"
import { toast } from "sonner"
import { useNudge } from "./nudge-context"
import { nudgeTargets } from "./data"
import { useSlackNudgeToast } from "./slack-toast"
import { emailMe } from "./email-me"
import type { TierRow } from "./types"

/**
 * `fire` handles a single-row nudge (mark + Slack for rows that map to a real
 * recipient — Mike for content, Michelle for ops). `sendSlack` fires only the
 * Slack DM + in-app popup, used by "Nudge team" after `nudgeMany` marks the rows.
 */
export function useFireNudge() {
  const { nudge, policy } = useNudge()
  const showSlackToast = useSlackNudgeToast()

  const sendSlack = useCallback(
    (row: TierRow) => {
      if (!row.nudgeKey) return
      const t = nudgeTargets(policy)[row.nudgeKey]
      if (!t) return
      showSlackToast({ batchName: t.batchName, description: row.description, value: t.value, skus: t.skus, deadlineDays: t.deadlineDays, queuePath: t.queuePath })
      void fetch("/api/nudge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchName: t.batchName,
          description: row.description,
          value: t.value,
          skus: t.skus,
          deadlineDays: t.deadlineDays,
          recipient: t.recipient,
          queuePath: t.queuePath,
        }),
      }).catch(() => {})
      // And by email, to whoever is signed in (they play the nudged person).
      void emailMe({ kind: "nudge", batchName: t.batchName, description: row.description, value: t.value, skus: t.skus, deadlineDays: t.deadlineDays, recipient: t.recipient, queuePath: t.queuePath })
    },
    [showSlackToast, policy],
  )

  const fire = useCallback(
    (row: TierRow) => {
      if (!row.nudgeKey) return
      nudge(row.nudgeKey)
      if (nudgeTargets(policy)[row.nudgeKey]) sendSlack(row)
      else toast.success(`Nudged ${row.analystName}`, { position: "top-right" })
    },
    [nudge, sendSlack, policy],
  )

  return { fire, sendSlack }
}
