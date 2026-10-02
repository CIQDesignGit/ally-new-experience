"use client"
import type { CustomAlert } from "./alerts/data"

import { createContext, useCallback, useContext, useEffect, useState } from "react"
import type { NudgeKey, Period } from "./types"
import { DEFAULT_KNOWLEDGE, DEFAULT_POLICY } from "./policy"
import type { KnowledgeEntry, Policy } from "./policy"

const STORAGE_KEY = "ally-nudge-demo-state"

/** The two nudges that page Mike for real — the rest just flip local UI state. */
const MIKE_NUDGE_KEYS: NudgeKey[] = ["approval-content", "team-content"]

interface StoredState {
  nudged: Partial<Record<NudgeKey, boolean>>
  approved: Record<string, boolean>
  /** Review policy and knowledge from the settings page; absent = defaults. */
  policy?: Policy
  knowledge?: KnowledgeEntry[]
  /** How the Business view ranks top SKUs; set per customer in Settings. */
  businessSort?: BusinessSort
  /** The Business view's hierarchy: Brand › Category › SKU (default) or Category › Brand › SKU. */
  businessGroup?: BusinessGroup
  /** Michelle's running note to the vendor manager: fixes approved, not yet sent. */
  note?: NoteItem[]
  /** Thumbs up or down on Ally's call for one SKU, by where it was given ("mike:batch:sku"). */
  feedback?: Record<string, Feedback>
  /** Michelle's Prime Day retro: slide order, look, and where it has gone. */
  retro?: RetroState
  /** Alerts Michelle wrote in chat. */
  alerts?: CustomAlert[]
  /** Dashboards saved from chat answers; each widget is an answer, still live. */
  dashboards?: SavedDashboard[]
  /** The Winter Hearth launch's pages are drafted from the agency concept (use case 7). */
  launchReady?: boolean
  /** Every other deck built in chat (the QBR, the deep dives), by id; the Prime Day retro keeps `retro`. */
  decks?: Record<string, RetroState>
  /** Skills Michelle saved from past work, and who they're shared with. */
  skills?: { id: string; name: string; shared: "me" | "team" | "account"; version?: number }[]
}

export interface SavedDashboard {
  id: string
  name: string
  widgets: string[]
  created: string
  seen?: boolean
}

export interface RetroState {
  order?: string[]
  theme?: "default" | "aurelle"
  locked?: boolean
  /** Deck made from the storyboard. */
  deck?: boolean
  sentToClaire?: boolean
  dashboard?: boolean
  /** The dashboard has been opened since it was published (the sidebar stops flagging it). */
  dashboardSeen?: boolean
  /** Lessons kept (each is also a Knowledge entry). */
  saved?: string[]
  /** Slides shown in their other form (deals as a scorecard instead of bars). */
  alts?: string[]
  /** Refreshed on a schedule and sent on autopilot. */
  repeat?: boolean
  /** Where the retro is: still shaping the storyline, or on the storyboard. */
  stage?: "storyline" | "storyboard"
  /** Michelle's rewording of a storyline question, by slide id. */
  questions?: Record<string, string>
  /** Her rewording of an answer (the slide's title), by slide id. */
  answers?: Record<string, string>
}

/** A vote on Ally's call, and the context sent with it. */
export interface Feedback {
  vote: "up" | "down"
  text?: string
  sent?: boolean
}

/** One SKU of one ops issue, added to the note on a day; sentOn once the note goes. */
export interface NoteItem {
  batchId: string
  asin: string
  addedOn: string
  sentOn?: string
  /** Added with the whole issue ("Add 8 SKUs to your note"), not one SKU at a time: counts every SKU in it. */
  whole?: boolean
}

/** The demo's note starts with yesterday's work, so it's clearly built up over time. */
/** The note starts empty: its bar appears with the first SKU Michelle adds. */
const SEED_NOTE: NoteItem[] = []

export type BusinessSort = "gap" | "sales"
export type BusinessGroup = "Category" | "Brand"

interface NudgeContextValue extends StoredState {
  nudge: (key: NudgeKey) => void
  /** Marks several keys nudged in one state update (so a "Nudge team" click doesn't clobber). */
  nudgeMany: (keys: NudgeKey[]) => void
  approve: (batchId: string) => void
  policy: Policy
  savePolicy: (p: Policy) => void
  knowledge: KnowledgeEntry[]
  saveKnowledge: (k: KnowledgeEntry[]) => void
  mikeNotified: boolean
  clearNotification: () => void
  /** Wipes all nudge/approve state so the demo can be replayed from scratch. */
  resetDemo: () => void
  /** The period every page shows (Claire's, Mike's and Michelle's switches share it). Not stored: a reload starts on the quarter. */
  period: Period
  setPeriod: (p: Period) => void
  businessSort: BusinessSort
  setBusinessSort: (s: BusinessSort) => void
  businessGroup: BusinessGroup
  setBusinessGroup: (g: BusinessGroup) => void
  note: NoteItem[]
  addToNote: (batchId: string, asins: string[], whole?: boolean) => void
  /** Sends everything unsent: stamps the items and approves every issue whose SKUs have all been sent. */
  sendNote: (complete: string[]) => void
  feedback: Record<string, Feedback>
  setFeedback: (id: string, f: Feedback) => void
  alerts: CustomAlert[]
  /** Adds or replaces an alert by id. */
  addAlert: (a: CustomAlert) => void
  markAlertsSeen: () => void
  dashboards: SavedDashboard[]
  /** Adds or replaces a dashboard by id. */
  saveDashboard: (d: SavedDashboard) => void
  markDashboardSeen: (id: string) => void
  launchReady: boolean
  setLaunchReady: (v: boolean) => void
  decks: Record<string, RetroState>
  setDeck: (id: string, patch: Partial<RetroState>) => void
  skills: { id: string; name: string; shared: "me" | "team" | "account"; version?: number }[]
  saveSkill: (k: { id: string; name: string; shared: "me" | "team" | "account"; version?: number }) => void
  retro: RetroState
  setRetro: (patch: Partial<RetroState>) => void
}

const EMPTY_STATE: StoredState = { nudged: {}, approved: {} }

const NudgeContext = createContext<NudgeContextValue | null>(null)

function readStoredState(): StoredState {
  try {
    // A refresh starts the demo over; moving between pages keeps what was done.
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined
    if (nav?.type === "reload") {
      window.localStorage.removeItem(STORAGE_KEY)
      return EMPTY_STATE
    }
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : EMPTY_STATE
  } catch {
    // Private window or blocked storage — demo just starts fresh.
    return EMPTY_STATE
  }
}

export function NudgeProvider({ children }: { children: React.ReactNode }) {
  // Always starts at EMPTY_STATE so the first client render matches the
  // server-rendered HTML; the real (possibly localStorage-backed) state is
  // synced in right after mount, once — an external-system read, not a
  // response to a state change, so it belongs in an effect.
  const [state, setState] = useState<StoredState>(EMPTY_STATE)
  const [notifCleared, setNotifCleared] = useState(false)
  const [period, setPeriod] = useState<Period>("quarter")

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from localStorage (an external system) right after mount, not a response to a state change.
    setState(readStoredState())
  }, [])

  // Functional updates so several nudges fired in one tick accumulate instead
  // of clobbering each other; localStorage is written from the same next state.
  const update = useCallback((updater: (prev: StoredState) => StoredState) => {
    setState((prev) => {
      const next = updater(prev)
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // Best effort only.
      }
      return next
    })
  }, [])

  const nudge = useCallback(
    (key: NudgeKey) => {
      update((prev) => ({ ...prev, nudged: { ...prev.nudged, [key]: true } }))
      if (MIKE_NUDGE_KEYS.includes(key)) setNotifCleared(false)
    },
    [update],
  )

  const nudgeMany = useCallback(
    (keys: NudgeKey[]) => {
      update((prev) => ({
        ...prev,
        nudged: { ...prev.nudged, ...Object.fromEntries(keys.map((k) => [k, true])) },
      }))
      if (keys.some((k) => MIKE_NUDGE_KEYS.includes(k))) setNotifCleared(false)
    },
    [update],
  )

  const approve = useCallback(
    (batchId: string) => {
      update((prev) => ({ ...prev, approved: { ...prev.approved, [batchId]: true } }))
    },
    [update],
  )

  const savePolicy = useCallback((policy: Policy) => update((prev) => ({ ...prev, policy })), [update])
  const saveKnowledge = useCallback((knowledge: KnowledgeEntry[]) => update((prev) => ({ ...prev, knowledge })), [update])

  const mikeNotified =
    !notifCleared && MIKE_NUDGE_KEYS.some((key) => state.nudged[key])

  const resetDemo = useCallback(() => {
    // Cleared right away, not inside the state update, so a read of storage in the same tick sees the reset.
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Best effort only.
    }
    update(() => EMPTY_STATE)
    setNotifCleared(false)
  }, [update])

  return (
    <NudgeContext.Provider
      value={{
        ...state,
        nudge,
        nudgeMany,
        approve,
        policy: state.policy ?? DEFAULT_POLICY,
        savePolicy,
        knowledge: state.knowledge ?? DEFAULT_KNOWLEDGE,
        saveKnowledge,
        mikeNotified,
        clearNotification: () => setNotifCleared(true),
        resetDemo,
        period,
        setPeriod,
        businessSort: state.businessSort ?? "gap",
        setBusinessSort: (businessSort) => update((prev) => ({ ...prev, businessSort })),
        businessGroup: state.businessGroup ?? "Brand",
        setBusinessGroup: (businessGroup) => update((prev) => ({ ...prev, businessGroup })),
        note: state.note ?? SEED_NOTE,
        addToNote: (batchId, asins, whole) =>
          update((prev) => {
            const cur = (prev.note ?? SEED_NOTE).map((i) => (whole && i.batchId === batchId && !i.sentOn ? { ...i, whole: true } : i))
            const fresh = asins.filter((a) => !cur.some((i) => i.batchId === batchId && i.asin === a))
            return { ...prev, note: [...cur, ...fresh.map((asin) => ({ batchId, asin, addedOn: "Oct 8", ...(whole ? { whole: true } : {}) }))] }
          }),
        feedback: state.feedback ?? {},
        setFeedback: (id, f) => update((prev) => ({ ...prev, feedback: { ...(prev.feedback ?? {}), [id]: f } })),
        alerts: state.alerts ?? [],
        addAlert: (a) => update((prev) => ({ ...prev, alerts: [...(prev.alerts ?? []).filter((x) => x.id !== a.id), a] })),
        markAlertsSeen: () => update((prev) => ({ ...prev, alerts: (prev.alerts ?? []).map((x) => ({ ...x, seen: true })) })),
        launchReady: !!state.launchReady,
        decks: state.decks ?? {},
        skills: state.skills ?? [],
        saveSkill: (k) => update((prev) => ({ ...prev, skills: [...(prev.skills ?? []).filter((x) => x.id !== k.id), k] })),
        setDeck: (id, patch) => update((prev) => ({ ...prev, decks: { ...(prev.decks ?? {}), [id]: { ...(prev.decks?.[id] ?? {}), ...patch } } })),
        setLaunchReady: (v) => update((prev) => ({ ...prev, launchReady: v })),
        dashboards: state.dashboards ?? [],
        saveDashboard: (d) => update((prev) => ({ ...prev, dashboards: [...(prev.dashboards ?? []).filter((x) => x.id !== d.id), d] })),
        markDashboardSeen: (id) => update((prev) => ({ ...prev, dashboards: (prev.dashboards ?? []).map((x) => (x.id === id ? { ...x, seen: true } : x)) })),
        retro: state.retro ?? {},
        setRetro: (patch) => update((prev) => ({ ...prev, retro: { ...(prev.retro ?? {}), ...patch } })),
        sendNote: (complete) =>
          update((prev) => ({
            ...prev,
            note: (prev.note ?? SEED_NOTE).map((i) => (i.sentOn ? i : { ...i, sentOn: "Oct 8" })),
            approved: { ...prev.approved, ...Object.fromEntries(complete.map((id) => [id, true])) },
          })),
      }}
    >
      {children}
    </NudgeContext.Provider>
  )
}

export function useNudge() {
  const ctx = useContext(NudgeContext)
  if (!ctx) throw new Error("useNudge must be used inside NudgeProvider")
  return ctx
}
