"use client"

import { useState } from "react"
import { ChevronRight, Plus, X } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { PRIMARY, SECONDARY } from "../mike/buttons"
import { useNudge } from "../nudge-context"
import { useHarness } from "../../competition/harness"
import { DOES, DOES_LABEL, SCHEDULES, draftFromSentence, type RunItem } from "./data"

/**
 * The list for anything Ally runs (Scheduled, Skills): one row each, with when it
 * runs, what Ally does, its last run and whether it's live. A row opens in place
 * to edit; "+ New" turns a sentence into a draft you check. Built-in items can be
 * paused or retuned, not deleted.
 */
const GRID = "grid grid-cols-[16px_minmax(10rem,2fr)_repeat(3,minmax(0,1fr))_72px] items-center gap-3 @4xl:grid-cols-[16px_minmax(0,1fr)_160px_180px_140px_72px] @4xl:gap-4"

export function RunList({
  title,
  items,
  kind,
  placeholder,
  editor,
  extra,
  whatLabel,
  lastLabel = "Last run",
  builtInLabel = "built in",
  author = "Claire Bennett",
  planned,
  doesLabel,
  doesHeader = "What Ally does",
}: {
  title: string
  items: RunItem[]
  kind: "scheduled" | "skill"
  /** The "+ New" prompt, as a real example. */
  placeholder: string
  /** A richer editor for some items (an alert with its own card); the generic one otherwise. */
  editor?: (item: RunItem) => React.ReactNode | null
  /** Extra detail under the editor (a skill's version history). */
  extra?: (item: RunItem) => React.ReactNode | null
  /** Column and tag wording for lists that aren't Ally's own (the joint plan: "Deliverable", "Last sent", "in the contract"). */
  whatLabel?: string
  lastLabel?: string
  builtInLabel?: string
  /** Who "+ New" is made by. */
  author?: string
  /** The "What Ally does" column in this list's words (the joint plan: "On autopilot", "Sarah reviews first"); its header too. */
  doesLabel?: Partial<Record<RunItem["does"], string>>
  doesHeader?: string
  /** New items belong to the joint plan. */
  planned?: boolean
}) {
  const { runs, setRuns } = useNudge()
  const borrow = useHarness() === "borrow"
  const [open, setOpen] = useState<string | null>(null)
  const [composing, setComposing] = useState(false)
  const [text, setText] = useState("")
  const [error, setError] = useState("")
  const shown = items.filter((i) => !runs.removed.includes(i.id)).map((i) => ({ ...i, ...runs.edits[i.id] }))

  const edit = (id: string, patch: Partial<RunItem>) => setRuns((r) => ({ ...r, edits: { ...r.edits, [id]: { ...r.edits[id], ...patch } } }))
  const paused = (id: string) => runs.paused.includes(id)
  const togglePause = (i: RunItem) => {
    setRuns((r) => ({ ...r, paused: paused(i.id) ? r.paused.filter((x) => x !== i.id) : [...r.paused, i.id] }))
    toast.success(`${i.name}: ${paused(i.id) ? "live again" : "paused"}`, { position: "top-right" })
  }
  const remove = (i: RunItem) => {
    setRuns((r) => ({ ...r, removed: [...r.removed, i.id], added: r.added.filter((x) => x.id !== i.id) }))
    setOpen(null)
    toast.success(`Deleted ${i.name}`, { position: "top-right" })
  }
  function create() {
    if (!text.trim()) {
      setError(kind === "skill" ? "Describe the skill first" : "Say what to watch for first")
      return
    }
    const item = { ...draftFromSentence(text, kind, author), ...(planned ? { plan: true } : {}) }
    setRuns((r) => ({ ...r, added: [item, ...r.added] }))
    setText("")
    setComposing(false)
    setOpen(item.id)
    toast.success("Ally drafted it. Check the details below.", { position: "top-right" })
  }

  return (
    <section className="@container overflow-hidden rounded-2xl bg-white shadow-xs ring-1 ring-slate-200">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-3.5">
        <span className="text-[15px] font-semibold text-slate-950">
          {title} <span className="ml-1 font-mono text-[13px] font-medium text-slate-400 tabular-nums">{shown.length}</span>
        </span>
        {/* Borrow harness: customers don't make new alerts or briefs in the product (an engineer builds them); the joint plan is CommerceIQ's own list. */}
        {!composing && (planned || !borrow) && (
          <button type="button" onClick={() => setComposing(true)} className={cn(SECONDARY, "h-9 gap-1 px-3")}>
            <Plus className="size-4" /> New
          </button>
        )}
      </div>

      {composing && (
        // Say it the way you'd say it to a person; Ally fills in the rest, and you check it.
        <div className="border-b border-slate-100 bg-slate-25 px-6 py-4">
          <div className="flex items-center gap-3">
            <input
              autoFocus
              value={text}
              onChange={(e) => {
                setText(e.target.value)
                setError("")
              }}
              onKeyDown={(e) => e.key === "Enter" && create()}
              placeholder={placeholder}
              className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
            />
            <button type="button" onClick={create} className={PRIMARY}>
              Create
            </button>
            <button type="button" aria-label="Cancel" onClick={() => setComposing(false)} className="rounded-md p-2 text-slate-400 hover:text-slate-700">
              <X className="size-4" />
            </button>
          </div>
          {error && <p className="mt-1.5 text-[13px] text-error-600">{error}</p>}
        </div>
      )}

      <div className={cn(GRID, "px-6 pt-3 pb-1 text-xs font-medium text-slate-500")}>
        <span />
        <span>{whatLabel ?? (kind === "skill" ? "Skill" : "What")}</span>
        <span>Runs</span>
        <span>{doesHeader}</span>
        <span>{lastLabel}</span>
        <span className="text-right">Status</span>
      </div>
      <div className="px-6 pb-2">
        {shown.map((i) => {
          const isOpen = open === i.id
          const off = paused(i.id)
          return (
            <div key={i.id} className="border-t border-slate-100 first:border-t-0">
              <button type="button" onClick={() => setOpen(isOpen ? null : i.id)} aria-expanded={isOpen} className={cn(GRID, "w-full py-3 text-left text-sm hover:bg-slate-25", off && "opacity-60")}>
                <ChevronRight className={cn("size-4 text-slate-400 transition-transform", isOpen && "rotate-90")} />
                <span className="min-w-0">
                  <span className="block font-medium text-slate-950">{i.name}</span>
                  <span className="block truncate text-[13px] text-slate-500">
                    {i.what}
                    {i.owner === "built in" && builtInLabel ? ` · ${builtInLabel}` : ""}
                  </span>
                </span>
                <span className="text-slate-700">{i.runs}</span>
                <span className="text-slate-700">{doesLabel?.[i.does] ?? DOES_LABEL[i.does]}</span>
                <span className="text-[13px] text-slate-500">{i.last ?? "—"}</span>
                <span className={cn("flex items-center justify-end gap-1.5 text-[13px] font-medium", off ? "text-slate-500" : "text-success-700")}>
                  <span className={cn("size-1.5 rounded-full", off ? "bg-slate-400" : "bg-success-500")} />
                  {off ? "Paused" : "Live"}
                </span>
              </button>
              {isOpen && (
                <div className="mb-3 ml-8 rounded-lg border border-slate-200 bg-white px-5 py-4">
                  {editor?.(i) ?? <GenericEditor item={i} kind={kind} onEdit={(p) => edit(i.id, p)} doesLabel={doesLabel} doesHeader={doesHeader} />}
                  {extra?.(i)}
                  <div className="mt-4 flex items-center gap-5 border-t border-slate-100 pt-3 text-[13px] font-medium">
                    <button type="button" onClick={() => togglePause(i)} className="text-brand-700 hover:underline">
                      {off ? "Resume" : "Pause"}
                    </button>
                    {i.owner === "yours" && (
                      <button type="button" onClick={() => remove(i)} className="text-slate-500 hover:text-error-600">
                        Delete
                      </button>
                    )}
                    {i.by && <span className="ml-auto font-normal text-slate-400">{i.by}</span>}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

const FIELD = "h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"

/** Name, trigger, when it runs and what Ally does; a skill also lists its steps. Built-in items keep their name and steps. */
function GenericEditor({ item, kind, onEdit, doesLabel, doesHeader = "What Ally does" }: { item: RunItem; kind: "scheduled" | "skill"; onEdit: (p: Partial<RunItem>) => void; doesLabel?: Partial<Record<RunItem["does"], string>>; doesHeader?: string }) {
  const mine = item.owner === "yours"
  return (
    <div className="grid gap-4 text-sm md:grid-cols-2">
      {mine && (
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-slate-500">Name</span>
          <input value={item.name} onChange={(e) => onEdit({ name: e.target.value })} className={FIELD} />
        </label>
      )}
      {mine && kind === "scheduled" && (
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-slate-500">{item.kind === "brief" ? "What's in it" : "When"}</span>
          <input value={item.what} onChange={(e) => onEdit({ what: e.target.value })} className={FIELD} />
        </label>
      )}
      {kind === "scheduled" && (
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-slate-500">Runs</span>
          <select value={item.runs} onChange={(e) => onEdit({ runs: e.target.value })} className={FIELD}>
            {[...new Set([item.runs, ...SCHEDULES])].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      )}
      {/* A brief only ever tells you; alerts and skills choose how far Ally goes. */}
      {item.kind !== "brief" && (
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-slate-500">{doesHeader}</span>
        <div className="inline-flex w-fit rounded-lg border border-slate-200 bg-slate-50 p-0.5">
          {DOES.filter((d) => !doesLabel || doesLabel[d]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onEdit({ does: d })}
              aria-pressed={item.does === d}
              className={cn("rounded-md px-3 py-1.5 text-[13px] font-medium whitespace-nowrap", item.does === d ? "bg-white text-slate-950 shadow-xs ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-800")}
            >
              {doesLabel?.[d] ?? DOES_LABEL[d]}
            </button>
          ))}
        </div>
      </div>
      )}
      {kind === "skill" && <Steps item={item} onEdit={onEdit} />}
      {item.usedBy && item.usedBy.length > 0 && (
        <div className="md:col-span-2">
          <span className="text-xs font-medium text-slate-500">Used by</span>
          <div className="mt-1 text-slate-700">{item.usedBy.join(" · ")}</div>
        </div>
      )}
    </div>
  )
}

/** A skill's steps, in order. Yours can be edited: change a step, remove it, add one. */
function Steps({ item, onEdit }: { item: RunItem; onEdit: (p: Partial<RunItem>) => void }) {
  const steps = item.steps ?? (item.owner === "built in" ? [item.what] : [])
  const mine = item.owner === "yours"
  const [adding, setAdding] = useState("")
  return (
    <div className="md:col-span-2">
      <span className="text-xs font-medium text-slate-500">Steps</span>
      <ol className="mt-1.5 flex flex-col gap-1.5">
        {steps.map((st, n) => (
          <li key={n} className="flex items-center gap-2">
            <span className="w-4 shrink-0 font-mono text-xs text-slate-400">{n + 1}</span>
            {mine ? (
              <>
                <input value={st} onChange={(e) => onEdit({ steps: steps.map((x, k) => (k === n ? e.target.value : x)) })} className={FIELD} />
                <button type="button" aria-label="Remove step" onClick={() => onEdit({ steps: steps.filter((_, k) => k !== n) })} className="p-1 text-slate-400 hover:text-error-600">
                  <X className="size-3.5" />
                </button>
              </>
            ) : (
              <span className="text-slate-800">{st}</span>
            )}
          </li>
        ))}
      </ol>
      {mine && (
        <div className="mt-2 flex items-center gap-2 pl-6">
          <input
            value={adding}
            onChange={(e) => setAdding(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && adding.trim()) {
                onEdit({ steps: [...steps, adding.trim()] })
                setAdding("")
              }
            }}
            placeholder="Compare it with last year's event"
            className={FIELD}
          />
        </div>
      )}
    </div>
  )
}
