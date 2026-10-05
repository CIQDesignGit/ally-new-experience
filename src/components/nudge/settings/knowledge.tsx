"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { useNudge } from "../nudge-context"
import { BATCHES } from "../data"
import { PRIMARY } from "../mike/buttons"
import { BRANDS, RETAILERS, SKU_GROUPS } from "../policy"
import { MultiPicker, ScopeChips, SinglePicker } from "./scope-picker"

/**
 * The Knowledge tab: guidance Ally follows when it writes (claims to avoid,
 * title rules), each for a scope. Same look as the product's Knowledge page,
 * on this design system.
 */
export function Knowledge() {
  const { knowledge, saveKnowledge } = useNudge()
  const [text, setText] = useState("")
  const [scope, setScope] = useState({ retailer: "Amazon", brands: [] as string[], skuGroups: [] as string[] })
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState("")
  // Rules only: a corrected analysis is a skill (it lives on the Skills tab).
  const rules = knowledge.filter((k) => !k.recipe)
  const saveEdit = (id: string) => {
    saveKnowledge(knowledge.map((x) => (x.id === id ? { ...x, text: draft.trim() } : x)))
    setEditing(null)
  }
  const applied = (k: (typeof knowledge)[number]) =>
    BATCHES.filter((b) => b.split && b.split.retailer === k.retailer && (!k.brands.length || k.brands.includes(b.split.brand)) && (!k.skuGroups.length || k.skuGroups.includes(b.split.skuGroup))).reduce((n, b) => n + b.skus, 0)

  function add() {
    if (!text.trim()) return
    saveKnowledge([
      {
        id: `k${Date.now()}`,
        text: text.trim(),
        ...scope,
        author: "Claire Bennett",
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      },
      ...knowledge,
    ])
    setText("")
  }

  return (
    <div className="flex flex-col gap-6 pb-28">
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 bg-slate-25 px-6 py-4">
          <div className="text-lg font-semibold text-slate-950">Add knowledge</div>
          <div className="mt-0.5 text-sm text-slate-500">Ally follows these when it writes content for this scope.</div>
        </div>
        <div className="px-6 pt-4">
          <label className="sr-only" htmlFor="knowledge-text">
            Knowledge
          </label>
          <textarea
            id="knowledge-text"
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Never call a candle organic unless it's certified."
            className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 px-6 py-4">
          <span className="mr-1 text-sm text-slate-500">Applies to</span>
          <SinglePicker label="Retailer" value={scope.retailer} options={RETAILERS.map((r) => ({ id: r, label: r }))} onChange={(v) => setScope({ ...scope, retailer: v })} />
          <MultiPicker label="All brands" value={scope.brands} options={BRANDS} onChange={(v) => setScope({ ...scope, brands: v })} />
          <MultiPicker label="All SKU groups" value={scope.skuGroups} options={SKU_GROUPS} onChange={(v) => setScope({ ...scope, skuGroups: v })} />
          <button type="button" onClick={add} disabled={!text.trim()} className={cn(PRIMARY, "ml-auto disabled:opacity-50")}>
            Add
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 bg-slate-25 px-6 py-4 text-lg font-semibold text-slate-950">
          Knowledge <span className="ml-1 font-mono text-[15px] font-medium text-slate-500 tabular-nums">{rules.length}</span>
        </div>
        <div className="px-6 pb-2">
          {rules.map((k) => (
            <div key={k.id} className="flex items-start justify-between gap-4 border-t border-slate-100 py-3.5 first:border-t-0">
              <div className="min-w-0 flex-1">
                <ScopeChips parts={[k.retailer, ...(k.brands.length ? k.brands : ["All brands"]), ...k.skuGroups]} />
                {editing === k.id ? (
                  <div className="mt-2">
                    <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={2} className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-950 outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100" />
                    <div className="mt-2 flex items-center gap-3">
                      <button type="button" onClick={() => saveEdit(k.id)} disabled={!draft.trim()} className={cn(PRIMARY, "h-9 px-4 disabled:opacity-50")}>
                        Save
                      </button>
                      <button type="button" onClick={() => setEditing(null)} className="text-[13px] font-medium text-slate-500 hover:text-slate-800">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-1.5 text-[15px] leading-relaxed text-slate-950">{k.text}</p>
                )}
                <div className="mt-0.5 text-xs text-slate-500">
                  {k.author} · {k.date}
                  {k.source && ` · ${k.source}`}
                  {/* It working: how many of this week's drafts it shaped, from the batches in its scope. */}
                  {applied(k) > 0 && <span className="text-slate-700"> · Applied to {applied(k).toLocaleString()} drafts this week</span>}
                </div>
              </div>
              {editing !== k.id && (
                <div className="flex shrink-0 items-center gap-4 pt-0.5 text-[13px] font-medium">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(k.id)
                      setDraft(k.text)
                    }}
                    className="text-brand-700 hover:underline"
                  >
                    Edit
                  </button>
                  <button type="button" onClick={() => saveKnowledge(knowledge.filter((x) => x.id !== k.id))} className="text-slate-500 hover:text-error-600">
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
