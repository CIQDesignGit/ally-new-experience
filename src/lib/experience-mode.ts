"use client"

import { useCallback, useEffect, useState } from "react"

const KEY = "ally-experience"
const EVENT = "ally-experience-change"

export type ExperienceMode = "new" | "old"

export function readExperienceMode(): ExperienceMode {
  if (typeof window === "undefined") return "new"
  return window.localStorage.getItem(KEY) === "old" ? "old" : "new"
}

export function writeExperienceMode(mode: ExperienceMode) {
  window.localStorage.setItem(KEY, mode)
  window.dispatchEvent(new Event(EVENT))
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
