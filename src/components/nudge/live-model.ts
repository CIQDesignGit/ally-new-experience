"use client"

import { useMemo } from "react"
import { BUSINESS, deadlineView, getSnapshot, launchedIds, openView, tierView, waterfallStages } from "./data"
import { useNudge } from "./nudge-context"
import type { Period } from "./types"

/**
 * The model for this session: the data plus what people have done (approvals and
 * inputs sent on Mike's and Michelle's pages) under the review policy. Claire's page reads this, so her
 * rows, totals, bridge and statuses move as her team acts.
 */
export function useLive() {
  const { approved, policy, period, retailer } = useNudge()
  return useMemo(() => {
    const open = openView(approved, policy, period)
    return {
      period,
      snapshot: getSnapshot(policy, period, launchedIds(approved)),
      stages: waterfallStages(approved, policy, period),
      approval: tierView("approval", approved, policy, period),
      open,
      deadline: deadlineView(approved, "approval", policy, period),
      /** Where the period lands: the run rate plus what was approved this session (it's now on its way live). */
      pace: (period: Period) => BUSINESS[period].pace + (period === "quarter" || period === "year" ? open.acted : 0),
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- the retailer changes what the data reads return
  }, [approved, policy, period, retailer])
}
