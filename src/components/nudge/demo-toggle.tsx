"use client"

import { useEffect, useSyncExternalStore } from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { setMvp, useMvp } from "./mvp"
import { setHarness, useHarness, type Harness } from "../competition/harness"

/** Pages outside the Ally demo (other prototypes in this repo) don't get the switch. */
const HIDDEN = ["/ai-commerce", "/login", "/mock", "/title-optimization", "/workbench"]

// Whether the switches are showing: in memory only, so every reload starts hidden and a customer demo never sees them.
const listeners = new Set<() => void>()
let shown = false
const read = () => shown
function setShown(on: boolean) {
  shown = on
  listeners.forEach((l) => l())
}

/**
 * Demo-only switches: the vision (everything we plan, with projections) or the
 * MVP (what ships first, measured only, the default); and the harness a skill is
 * built on, borrowed (Claude Code, the default) or built (our Skill Builder).
 * Hidden until the presenter presses Shift+D, then small in the bottom-right
 * corner, across pages; Shift+D again (or a reload) hides them.
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
      // Shift+D (D for demo).
      if (!(e.shiftKey && e.code === "KeyD") || e.metaKey || e.ctrlKey || e.altKey) return
      // Typing a capital D in a field is just typing.
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
