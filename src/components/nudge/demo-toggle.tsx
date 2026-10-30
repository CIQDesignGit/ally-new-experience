"use client"

import { useEffect, useSyncExternalStore } from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { setMvp, useMvp } from "./mvp"
import { setHarness, useHarness, type Harness } from "../competition/harness"

/** Pages outside the Ally demo (other prototypes in this repo) don't get the switch. */
const HIDDEN = ["/ai-commerce", "/login", "/mock", "/title-optimization", "/workbench"]

// Whether the switch is showing: hidden by default, so a customer demo never sees it.
const KEY = "ally-demo-toggle"
const listeners = new Set<() => void>()
let shown: boolean | null = null
function read() {
  if (shown === null) {
    try {
      shown = window.localStorage.getItem(KEY) === "1"
    } catch {
      shown = false
    }
  }
  return shown
}
function setShown(on: boolean) {
  shown = on
  try {
    if (on) window.localStorage.setItem(KEY, "1")
    else window.localStorage.removeItem(KEY)
  } catch {}
  listeners.forEach((l) => l())
}

/**
 * Demo-only switches: the vision (everything we plan, with projections) or the
 * MVP (what ships first, measured only); and the harness a skill is built on,
 * borrowed (Claude Code) or built (our Skill Builder). Hidden until the presenter
 * presses ` (backtick), then small in the bottom-right corner; ` again hides them.
 */
export function DemoToggle() {
  const mvp = useMvp()
  const harness = useHarness()
  const path = usePathname()
  const visible = useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    read,
    () => false,
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "`" || e.metaKey || e.ctrlKey || e.altKey) return
      // Typing a backtick in a field is just typing.
      const t = e.target as HTMLElement | null
      if (t && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName))) return
      setShown(!read())
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  if (!visible || path === "/" || HIDDEN.some((p) => path.startsWith(p))) return null
  return (
    <div className="fixed right-3 bottom-3 z-[70] flex gap-2">
      <Segments label="Demo version" value={mvp ? "mvp" : "vision"} options={[{ id: "vision", label: "Vision" }, { id: "mvp", label: "MVP" }]} onPick={(id) => setMvp(id === "mvp")} />
      <Segments label="Harness" value={harness} options={[{ id: "borrow", label: "Borrow" }, { id: "build", label: "Build" }]} onPick={(id) => setHarness(id as Harness)} />
    </div>
  )
}

function Segments({ label, value, options, onPick }: { label: string; value: string; options: { id: string; label: string }[]; onPick: (id: string) => void }) {
  return (
    <div role="radiogroup" aria-label={label} title={label} className="flex rounded-full bg-slate-900 p-0.5 text-[12px] font-medium shadow-lg">
      {options.map((o) => (
        <button key={o.id} type="button" role="radio" aria-checked={value === o.id} onClick={() => onPick(o.id)} className={cn("rounded-full px-3 py-1 transition-colors", value === o.id ? "bg-white text-slate-950" : "text-slate-300 hover:text-white")}>
          {o.label}
        </button>
      ))}
    </div>
  )
}
