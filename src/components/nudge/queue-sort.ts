"use client"

import { useSyncExternalStore } from "react"

/**
 * How the MVP's queues are ordered after the deadline: by the gap to plan (the
 * default: the work's share of the gap, then effort) or by what the SKUs sell.
 * A per-person setting, in its own localStorage key.
 */
export type QueueSort = "gap" | "sales"

const KEY = "ally-queue-sort"
const listeners = new Set<() => void>()
let stored: QueueSort | null = null

/** The current choice; the queue sort functions read it, the components subscribe with useQueueSort. */
export function queueSortNow(): QueueSort {
  if (stored === null) {
    try {
      stored = window.localStorage.getItem(KEY) === "sales" ? "sales" : "gap"
    } catch {
      stored = "gap"
    }
  }
  return stored
}

export function setQueueSort(s: QueueSort) {
  stored = s
  try {
    if (s === "sales") window.localStorage.setItem(KEY, s)
    else window.localStorage.removeItem(KEY)
  } catch {}
  listeners.forEach((l) => l())
}

export function useQueueSort(): QueueSort {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    queueSortNow,
    () => "gap",
  )
}
