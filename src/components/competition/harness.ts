"use client"

import { useSyncExternalStore } from "react"

/**
 * Which harness the skill is built on, for the demo. Borrow: the engineer works
 * in Claude Code. Build: the same work in CommerceIQ's own Skill Builder. Only
 * the build step changes; the request, the Agent Console and what Michelle gets
 * are the same. Kept in its own localStorage key, like the MVP switch.
 */
export type Harness = "borrow" | "build"

const KEY = "ally-harness"
const listeners = new Set<() => void>()
let stored: Harness | null = null

function read(): Harness {
  if (stored === null) {
    try {
      stored = window.localStorage.getItem(KEY) === "build" ? "build" : "borrow"
    } catch {
      stored = "borrow"
    }
  }
  return stored
}

export function setHarness(h: Harness) {
  stored = h
  try {
    if (h === "build") window.localStorage.setItem(KEY, h)
    else window.localStorage.removeItem(KEY)
  } catch {}
  listeners.forEach((l) => l())
}

/** Borrow on the server and the first client render, so the page hydrates; then the stored choice. */
export function useHarness(): Harness {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    read,
    () => "borrow",
  )
}

/** Where the engineer builds the skill, and what that place is called. */
export const BUILD_STEP: Record<Harness, { href: string; where: string }> = {
  borrow: { href: "/fde/claude-code", where: "Claude Code" },
  build: { href: "/fde/skill-builder", where: "Skill Builder" },
}
