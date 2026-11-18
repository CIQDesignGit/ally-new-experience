"use client"

import { useCallback, useEffect, useState } from "react"

const KEY = "ally-experience"
const EVENT = "ally-experience-change"
export const EXPERIENCE_TRANSITION_EVENT = "ally-experience-transition"
export const EXPERIENCE_TRANSITION_END_EVENT = "ally-experience-transition-end"

export type ExperienceTransitionDetail = {
  next: ExperienceMode
  href?: string
}

export type ExperienceMode = "new" | "old"

export function readExperienceMode(): ExperienceMode {
  if (typeof window === "undefined") return "new"
  return window.localStorage.getItem(KEY) === "old" ? "old" : "new"
}

export function writeExperienceMode(mode: ExperienceMode) {
  window.localStorage.setItem(KEY, mode)
  window.dispatchEvent(new Event(EVENT))
}

/** Crossfade + navigation: switch commits under a brief scrim so old ↔ new doesn’t snap. */
export function beginExperienceTransition(next: ExperienceMode, opts?: { href?: string }) {
  if (typeof window === "undefined") return
  window.dispatchEvent(
    new CustomEvent<ExperienceTransitionDetail>(EXPERIENCE_TRANSITION_EVENT, {
      detail: { next, href: opts?.href },
    }),
  )
}

export function useExperienceTransitionBusy() {
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    const start = () => setBusy(true)
    const end = () => setBusy(false)
    window.addEventListener(EXPERIENCE_TRANSITION_EVENT, start)
    window.addEventListener(EXPERIENCE_TRANSITION_END_EVENT, end)
    return () => {
      window.removeEventListener(EXPERIENCE_TRANSITION_EVENT, start)
      window.removeEventListener(EXPERIENCE_TRANSITION_END_EVENT, end)
    }
  }, [])
  return busy
}

export function useExperienceMode() {
  const [mode, setModeState] = useState<ExperienceMode>(() => readExperienceMode())

  useEffect(() => {
    const sync = () => setModeState(readExperienceMode())
    sync()
    window.addEventListener(EVENT, sync)
    return () => window.removeEventListener(EVENT, sync)
  }, [])

  const setMode = useCallback((next: ExperienceMode) => {
    writeExperienceMode(next)
    setModeState(next)
  }, [])

  return { mode, setMode, isOld: mode === "old" }
}
