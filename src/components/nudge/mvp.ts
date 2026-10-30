"use client"

import { useSyncExternalStore } from "react"

/**
 * The MVP version of the demo: the same pages with only what the product ships
 * first. No projected dollars: every dollar on screen is measured,
 * and open work shows an impact level instead of what it's worth. /demo/mvp
 * turns it on, /demo/vision turns it off. Kept in its own localStorage key so
 * it survives reloads and the demo's own resets.
 */
const KEY = "ally-mvp"
const listeners = new Set<() => void>()
let stored: boolean | null = null

function read(): boolean {
  if (stored === null) {
    try {
      stored = window.localStorage.getItem(KEY) === "1"
    } catch {
      stored = false
    }
  }
  return stored
}

export function setMvp(on: boolean) {
  stored = on
  try {
    if (on) window.localStorage.setItem(KEY, "1")
    else window.localStorage.removeItem(KEY)
  } catch {}
  listeners.forEach((l) => l())
}

/** Off on the server and on the first client render, so the page hydrates; then the stored choice. */
export function useMvp(): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    read,
    () => false,
  )
}

// Set by the provider on every render, before its children read any number (as the retailer is).
let current = false
export const setCurrentMvp = (on: boolean) => {
  current = on
}
export const mvpNow = () => current

export type Impact = "High" | "Medium" | "Low"

/** What impact is measured against: the gap to plan, or when ahead of plan 5% of it (a typical gap). */
export const gapUnit = (planM: number, paceM: number) => Math.max(planM - paceM, planM * 0.05)

/** An action's impact from its share of the gap to plan: High is a quarter of it or more, Medium a tenth. */
export function impactOf(valueM: number, gapM: number): Impact {
  const share = valueM / gapM
  return share >= 0.25 ? "High" : share >= 0.1 ? "Medium" : "Low"
}

/** How tall each level stands in the waterfall, as a share of the gap: three Highs still stop below the plan line. */
export const IMPACT_HEIGHT: Record<Impact, number> = { High: 0.3, Medium: 0.2, Low: 0.1 }

/** "$660K" or "$1.5M" → $M. */
export const toM = (s: string) => parseFloat(s.replace(/[^0-9.]/g, "")) / (s.trim().endsWith("K") ? 1000 : 1)
