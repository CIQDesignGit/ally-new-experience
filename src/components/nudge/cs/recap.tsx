"use client"

import { useState } from "react"
import { Check, Mic, X } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useNudge } from "../nudge-context"
import { PRIMARY, SECONDARY } from "../mike/buttons"
import { LAST_CALL, RECAP } from "./data"

const HEAD = "text-xs font-medium text-slate-500"

/**
 * The recap of the last call, drafted by Ally from Gong. Every line is
 * editable; nothing needs approval. It saves itself into Aurelle's context
 * 72 hours after the call, or now with Save. Going forward lines shape every
 * future prep. Send to Claire delivers the recap itself.
 */
export function Recap() {
  const { callItems, setCallItem } = useNudge()
  const saved = callItems["recap-saved"] === "done"
  const sent = callItems["recap-sent"] === "done"
  const [lines, setLines] = useState(() => Object.fromEntries(RECAP.map((s) => [s.id, s.lines])) as Record<string, string[]>)
  const [editing, setEditing] = useState<string | null>(null)
  const total = Object.values(lines).reduce((n, l) => n + l.length, 0)
  const edit = (sec: string, i: number, v: string) => setLines((x) => ({ ...x, [sec]: x[sec].map((l, k) => (k === i ? v : l)) }))
  const drop = (sec: string, i: number) => setLines((x) => ({ ...x, [sec]: x[sec].filter((_, k) => k !== i) }))

  return (
    <div className="px-10 pt-2 pb-12">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 text-sm text-slate-500">
            <Mic className="size-3.5" /> {LAST_CALL.title} · {LAST_CALL.date} · {LAST_CALL.length} · from {LAST_CALL.source}
          </div>
          <h1 className="mt-1 text-[28px] leading-tight font-bold tracking-tight text-slate-950">Recap of the {LAST_CALL.short} call</h1>
          <div className={cn("mt-1 text-[15px] font-medium", saved ? "text-success-700" : "text-warning-700")}>
            {saved ? `Saved to Aurelle's context · ${total} things` : `${total} things save to Aurelle's context ${LAST_CALL.savesAt}, 72 hours after the call`}
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
          {sent ? (
            <span className="inline-flex h-10 items-center gap-1.5 px-2 text-sm font-medium text-success-700">
              <Check className="size-4" /> Sent to Claire
            </span>
          ) : (
            <button
              type="button"
              onClick={() => {
                setCallItem("recap-sent", "done")
                toast.success("Recap sent to Claire", { position: "top-right" })
              }}
              className={PRIMARY}
            >
              Send to Claire
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col">
        {RECAP.map((s) => (
          <section key={s.id} className="grid grid-cols-1 gap-3 border-t border-slate-100 py-5 md:grid-cols-[200px_minmax(0,1fr)] md:gap-6">
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
    </div>
  )
}
