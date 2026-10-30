"use client"

import { useSyncExternalStore } from "react"

/**
 * The competition demo's progress, shared by its four screens: Michelle's
 * page, Claude Code, the Agent Console and her dashboard. Kept in its own
 * localStorage key so it survives moving between pages; /demo/competition
 * starts it over.
 */
export type Stage =
  | "idle" // nothing asked yet
  | "requested" // Michelle sent the request
  | "built" // Nora's skill is drafted and tested in Claude Code
  | "submitted" // version 1 is in the Agent Console
  | "tested" // tests ran: 10 of 12
  | "live" // published

export interface CompetitionState {
  /** The demo is running: the step bar shows on its screens. */
  on: boolean
  stage: Stage
  /** Michelle's choices on the request card. */
  threshold: number
  day: "Monday" | "Friday"
  /** Nora fixed the title match in price_gap.sql. */
  sqlEdited: boolean
  /** Lena added organic results to sov_gift_terms.sql (version 2). */
  sovFixed: boolean
  /** Nora made the competitor an input (version 3). */
  competitorFixed: boolean
  /** Who it went live for. */
  scope?: "aurelle" | "all"
}

const KEY = "ally-competition-demo"
export const INITIAL: CompetitionState = { on: false, stage: "idle", threshold: 5, day: "Monday", sqlEdited: false, sovFixed: false, competitorFixed: false }

let state: CompetitionState = INITIAL
let loaded = false
const listeners = new Set<() => void>()

function load() {
  if (loaded || typeof window === "undefined") return
  loaded = true
  try {
    const raw = window.localStorage.getItem(KEY)
    if (raw) state = { ...INITIAL, ...JSON.parse(raw) }
  } catch {}
}

export function setCompetition(patch: Partial<CompetitionState>) {
  load()
  state = { ...state, ...patch }
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state))
  } catch {}
  listeners.forEach((l) => l())
}

export function startCompetition() {
  setCompetition({ ...INITIAL, on: true })
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function useCompetition(): CompetitionState {
  return useSyncExternalStore(
    subscribe,
    () => {
      load()
      return state
    },
    () => INITIAL,
  )
}

/** Order of stages, for "has it reached X yet". */
const ORDER: Stage[] = ["idle", "requested", "built", "submitted", "tested", "live"]
export const reached = (s: CompetitionState, at: Stage) => ORDER.indexOf(s.stage) >= ORDER.indexOf(at)
