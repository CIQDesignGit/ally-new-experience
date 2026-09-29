"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useNudge } from "../nudge-context"
import { SECONDARY } from "../mike/buttons"
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
            placeholder="e.g. Titles must not contain trademark symbols and must not exceed 150 characters."
            className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 px-6 py-4">
          <span className="mr-1 text-sm text-slate-500">Applies to</span>
          <SinglePicker label="Retailer" value={scope.retailer} options={RETAILERS.map((r) => ({ id: r, label: r }))} onChange={(v) => setScope({ ...scope, retailer: v })} />
          <MultiPicker label="All brands" value={scope.brands} options={BRANDS} onChange={(v) => setScope({ ...scope, brands: v })} />
          <MultiPicker label="All SKU groups" value={scope.skuGroups} options={SKU_GROUPS} onChange={(v) => setScope({ ...scope, skuGroups: v })} />
          <button type="button" onClick={add} disabled={!text.trim()} className={cn(SECONDARY, "ml-auto h-9 px-4 text-sm disabled:opacity-50")}>
            Add
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 bg-slate-25 px-6 py-4 text-lg font-semibold text-slate-950">
          Knowledge <span className="ml-1 font-mono text-[15px] font-medium text-slate-500 tabular-nums">{knowledge.length}</span>
        </div>
        <div className="px-6 pb-2">
          {knowledge.map((k) => (
            <div key={k.id} className="flex items-start justify-between gap-4 border-t border-slate-100 py-3.5 first:border-t-0">
              <div className="min-w-0">
                <ScopeChips parts={[k.retailer, ...(k.brands.length ? k.brands : ["All brands"]), ...k.skuGroups]} />
                <p className="mt-1.5 text-[15px] leading-relaxed text-slate-950">{k.text}</p>
                <div className="mt-0.5 text-xs text-slate-500">
                  {k.author} · {k.date}
                  {k.source && ` · ${k.source}`}
                </div>
              </div>
              <button
                type="button"
                aria-label="Delete knowledge"
                onClick={() => saveKnowledge(knowledge.filter((x) => x.id !== k.id))}
                className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-50 hover:text-error-600"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
