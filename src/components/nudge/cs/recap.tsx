"use client"

import { useState } from "react"
import { Mic, Plus, X } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Widget, WidgetStack } from "@/components/layout/page-frame"
import { useNudge } from "../nudge-context"
import { PRIMARY, SECONDARY } from "../mike/buttons"
import { LAST_CALL, RECAP } from "./data"

const HEAD = "text-xs font-medium text-slate-500"

/**
 * The recap of the last call, drafted by Ally from Gong. Every line is
 * editable; nothing needs approval. It saves itself into Aurelle's context
 * 72 hours after the call. Going forward lines shape every future prep. Add
 * context is for what Ally missed; it saves with the rest.
 */
export function Recap() {
  const { setCallItem } = useNudge()
  // It saved itself 72 hours after the call; edits now update what's saved.
  const saved = true
  // What Ally missed: Sarah adds it, and it saves to context with the rest.
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState("")
  const [added, setAdded] = useState(0)
  function addLine() {
    const v = draft.trim()
    if (!v) return
    setLines((x) => ({ ...x, facts: [...x.facts, v] }))
    setDraft("")
    setAdded((n) => n + 1)
    setAdding(false)
    toast.success("Saved to Aurelle's context", { position: "top-right" })
  }
  const [lines, setLines] = useState(() => Object.fromEntries(RECAP.map((s) => [s.id, s.lines])) as Record<string, string[]>)
  const [editing, setEditing] = useState<string | null>(null)
  const total = Object.values(lines).reduce((n, l) => n + l.length, 0)
  const edit = (sec: string, i: number, v: string) => setLines((x) => ({ ...x, [sec]: x[sec].map((l, k) => (k === i ? v : l)) }))
  const drop = (sec: string, i: number) => setLines((x) => ({ ...x, [sec]: x[sec].filter((_, k) => k !== i) }))

  return (
    <>
    <div className="px-10 pt-2 pb-8">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 text-sm text-slate-500">
            <Mic className="size-3.5" /> {LAST_CALL.title} · {LAST_CALL.date} · {LAST_CALL.length} · from {LAST_CALL.source}
          </div>
          <h1 className="mt-1 text-[28px] leading-tight font-bold tracking-tight text-slate-950">Recap of the {LAST_CALL.short} call</h1>
          <div className={cn("mt-1 text-[15px] font-medium", saved ? "text-success-700" : "text-warning-700")}>
            {saved ? `${total - added} things saved to Aurelle's context on their own, ${LAST_CALL.savedOn}, 72 hours after the call${added ? ` · ${added} added by you` : ""} · edit anytime` : ""}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!saved && (
            <button
              type="button"
              onClick={() => {
                setCallItem("recap-saved", "done")
                toast.success(`Saved ${total} things to Aurelle's context`, { position: "top-right" })
              }}
              className={SECONDARY}
            >
              Save now
            </button>
          )}
          <button type="button" onClick={() => setAdding(true)} className={PRIMARY}>
            <Plus className="size-4" /> Add context
          </button>
        </div>
      </div>
    </div>

    <WidgetStack>
      {adding && (
        <Widget className="flex items-center gap-2 px-6 py-3">
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addLine()
              if (e.key === "Escape") setAdding(false)
            }}
            placeholder="Claire's team is moving to a new 3PL in January"
            aria-label="What should Ally know from this call?"
            className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-[15px] text-slate-950 outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
          />
          <button type="button" onClick={addLine} className={PRIMARY}>
            Save
          </button>
          <button type="button" onClick={() => setAdding(false)} className="px-2 text-[13px] font-medium text-slate-500 hover:text-slate-800">
            Cancel
          </button>
        </Widget>
      )}

      <Widget className="px-10 pt-1 pb-6">
      <div className="flex flex-col">
        {RECAP.map((s) => (
          <section key={s.id} className="grid grid-cols-1 gap-3 border-t border-slate-100 py-5 first:border-t-0 md:grid-cols-[200px_minmax(0,1fr)] md:gap-6">
            <div>
              <h2 className="text-[17px] font-semibold text-slate-950">{s.title}</h2>
              <div className="mt-0.5 text-[13px] text-slate-500">Goes to {s.feeds.toLowerCase()}</div>
            </div>
            <ul className="flex flex-col gap-1.5">
              {lines[s.id].map((l, i) => {
                const key = `${s.id}:${i}`
                return (
                  <li key={key} className="group flex items-center gap-2">
                    <span className="size-1 shrink-0 rounded-full bg-slate-400" />
                    {editing === key ? (
                      <input
                        autoFocus
                        value={l}
                        onChange={(e) => edit(s.id, i, e.target.value)}
                        onBlur={() => setEditing(null)}
                        onKeyDown={(e) => e.key === "Enter" && setEditing(null)}
                        className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 px-3 text-[15px] text-slate-950 outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
                      />
                    ) : (
                      <button type="button" onClick={() => setEditing(key)} title="Edit" className="min-w-0 flex-1 rounded px-1 py-1 text-left text-[15px] text-slate-700 hover:bg-slate-50">
                        {l}
                      </button>
                    )}
                    <button type="button" aria-label="Remove" onClick={() => drop(s.id, i)} className="p-1 text-slate-300 opacity-0 group-hover:opacity-100 hover:text-error-600">
                      <X className="size-3.5" />
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>
      <p className={cn(HEAD, "mt-2")}>Click any line to edit it · nothing here needs approval · Going forward lines appear in every weekly prep</p>
      </Widget>
    </WidgetStack>
    </>
  )
}
