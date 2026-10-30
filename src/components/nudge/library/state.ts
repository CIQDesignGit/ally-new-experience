"use client"

import { useSyncExternalStore } from "react"
import type { LibrarySkill } from "./data"

/**
 * What this account has turned on from the library, and what's waiting on the
 * customer's input (ready by tomorrow). Its own localStorage key, like the
 * demo's other stores; the gap analysis starts on (Michelle already uses it).
 */
export interface LibraryState {
  on: string[]
  /** Turned on, waiting for the customer's input to be processed. */
  pending: string[]
}

const KEY = "ally-library"
const INITIAL: LibraryState = { on: ["gap-analysis"], pending: [] }
const listeners = new Set<() => void>()
let state: LibraryState | null = null

function read(): LibraryState {
  if (state === null) {
    try {
      const raw = window.localStorage.getItem(KEY)
      state = raw ? { ...INITIAL, ...JSON.parse(raw) } : INITIAL
    } catch {
      state = INITIAL
    }
  }
  return state!
}

function write(next: LibraryState) {
  state = next
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next))
  } catch {}
  listeners.forEach((l) => l())
}

/** Turn a skill on: at once, or pending when it needs the customer's input. */
export function turnOn(skill: LibrarySkill) {
  const s = read()
  if (skill.needs) write({ ...s, pending: [...new Set([...s.pending, skill.id])] })
  else write({ ...s, on: [...new Set([...s.on, skill.id])] })
}

export function resetLibrary() {
  write(INITIAL)
}

export function useLibrary(): LibraryState {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    read,
    () => INITIAL,
  )
}

export type SkillStatus = "On" | "Available" | "Locked" | "Ready by tomorrow"

/**
 * Where a skill stands for this account, which decides what its card shows:
 * a check (On), a Turn on button (Available), a lock (Locked), or the wait
 * for the customer's input (Ready by tomorrow).
 */
export function statusOf(skill: LibrarySkill, s: LibraryState): SkillStatus {
  // The first match decides: core is always on; a tier lock beats the switch, so no one gets a paid skill by accident.
  if (skill.core) return "On"
  if (skill.tier) return "Locked"
  if (s.on.includes(skill.id)) return "On"
  if (s.pending.includes(skill.id)) return "Ready by tomorrow"
  return "Available"
}
