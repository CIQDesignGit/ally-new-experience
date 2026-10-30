"use client"

import { useState } from "react"
import { Check, CircleDot, Loader2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { PRIMARY, SECONDARY } from "../nudge/mike/buttons"
import type { Check as CheckRow, UseCase } from "./data"
import { APPROVER, FDE } from "./data"

const ICON: Record<CheckRow["status"], { icon: typeof Check; className: string }> = {
  pass: { icon: Check, className: "text-success-700" },
  warn: { icon: CircleDot, className: "text-slate-400" },
  fail: { icon: X, className: "text-error-600" },
}

/**
 * Step 2, inside CommerceIQ: the checks run where the work will run, a person
 * other than the author approves, and one button publishes exactly the scope
 * shown. Borrowed from the Content Agent Workbench (evals, routed failures,
 * Promote) and the dashboard publish flow (pre-flight, Draft vs Publish).
 */
export function Publish({ uc, published, onPublish }: { uc: UseCase; published?: string; onPublish: (mode: string) => void }) {
  const p = uc.publish
  const [mode, setMode] = useState(p.modes?.[1]?.id ?? "publish")
  const [confirming, setConfirming] = useState(false)
  const [working, setWorking] = useState(false)

  // A scores table: a narrow first column, the checks, and the score right-aligned.
  const scored = !!p.table && /score/i.test(p.table.head[p.table.head.length - 1])
  const cols = scored ? "64px minmax(0,1fr) 140px" : `repeat(${p.table?.head.length ?? 1}, minmax(0, 1fr))`

  const publish = () => {
    setWorking(true)
    window.setTimeout(() => {
      setWorking(false)
      setConfirming(false)
      onPublish(mode)
    }, 1100)
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_320px] gap-6 max-lg:grid-cols-1">
      <div className="flex flex-col gap-6">
        <section className="rounded-xl border border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
            <h3 className="text-[15px] font-semibold text-slate-950">{p.title}</h3>
            <span className="text-[13px] text-slate-500">Checked Oct 8, 9:05 AM</span>
          </div>
          <ul className="divide-y divide-slate-100">
            {p.checks.map((c) => {
              const I = ICON[c.status]
              return (
                <li key={c.label} className="grid grid-cols-[20px_160px_minmax(0,1fr)] items-center gap-3 px-5 py-3 max-sm:grid-cols-[20px_minmax(0,1fr)]">
                  <I.icon className={cn("size-4", I.className)} aria-hidden />
                  <span className="text-sm font-medium text-slate-950">{c.label}</span>
                  <span className="text-sm text-slate-700 max-sm:col-start-2">{c.detail}</span>
                </li>
              )
            })}
          </ul>
        </section>

        {p.table && (
          <section className="rounded-xl border border-slate-200">
            <div className="grid gap-3 border-b border-slate-200 px-5 py-2.5 text-xs font-medium text-slate-500" style={{ gridTemplateColumns: cols }}>
              {p.table.head.map((h, i) => (
                <span key={h} className={cn(scored && i === p.table!.head.length - 1 && "text-right")}>
                  {h}
                </span>
              ))}
            </div>
            <ul className="divide-y divide-slate-100">
              {p.table.rows.map((r) => (
                <li key={r.join()} className="grid gap-3 px-5 py-3 text-sm text-slate-700" style={{ gridTemplateColumns: cols }}>
                  {r.map((cell, i) => (
                    <span key={i} className={cn(i === 0 && "text-slate-950", scored && i === r.length - 1 && "text-right tabular-nums text-slate-950")}>
                      {cell}
                    </span>
                  ))}
                </li>
              ))}
            </ul>
          </section>
        )}

        {p.routed && (
          <section className="rounded-xl border border-slate-200">
            <h3 className="border-b border-slate-200 px-5 py-3 text-[15px] font-semibold text-slate-950">Failures, routed to their cause</h3>
            <ul className="divide-y divide-slate-100">
              {p.routed.map((r) => (
                <li key={r.what} className="flex items-center justify-between gap-4 px-5 py-3">
                  <span className="text-sm text-slate-700">{r.what}</span>
                  <span className="text-sm whitespace-nowrap text-slate-500">{r.where}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <aside className="flex h-fit flex-col gap-4 rounded-xl border border-slate-200 p-5">
        <div>
          <div className="text-[13px] font-medium text-slate-500">Goes live for</div>
          <div className="mt-1 text-[15px] font-semibold text-slate-950">{p.scope}</div>
        </div>

        {p.modes && (
          <div className="flex flex-col gap-2">
            {p.modes.map((m) => (
              <button
                key={m.id}
                type="button"
                disabled={!!published}
                onClick={() => setMode(m.id)}
                className={cn("flex items-start gap-3 rounded-lg px-3 py-2.5 text-left ring-1", mode === m.id ? "bg-slate-100 ring-slate-300" : "ring-slate-200 hover:bg-slate-50")}
              >
                <span className={cn("mt-1 size-3 shrink-0 rounded-full border", mode === m.id ? "border-brand-500 bg-brand-500" : "border-slate-300")} aria-hidden />
                <span>
                  <span className="block text-sm font-medium text-slate-950">{m.label}</span>
                  <span className="block text-[13px] text-slate-500">{m.detail}</span>
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="text-[13px] leading-snug text-slate-500">
          Author {FDE}
          <br />
          Approver {APPROVER}
        </div>

        {published ? (
          <div className="flex items-start gap-2 text-sm text-success-700">
            <Check className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              {published === "draft" ? "Published as a draft" : "Published"}
              <span className="block text-[13px] text-slate-500">Oct 8, 9:12 AM · {APPROVER.split(",")[0]}</span>
            </span>
          </div>
        ) : confirming ? (
          <div className="flex flex-col gap-3 rounded-lg bg-slate-50 p-3">
            <p className="text-sm text-slate-700">{mode === "draft" ? "Our team sees it first. Nothing reaches Aurelle yet." : p.confirm}</p>
            <div className="flex gap-2">
              <button type="button" onClick={publish} disabled={working} className={PRIMARY}>
                {working && <Loader2 className="size-4 animate-spin" aria-hidden />}
                {working ? "Publishing" : "Confirm"}
              </button>
              <button type="button" onClick={() => setConfirming(false)} disabled={working} className={SECONDARY}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirming(true)} className={PRIMARY}>
            {mode === "draft" ? "Publish as draft" : p.primary}
          </button>
        )}
      </aside>
    </div>
  )
}
