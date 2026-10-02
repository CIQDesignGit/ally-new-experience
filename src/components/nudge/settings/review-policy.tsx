"use client"

import { useEffect, useState } from "react"
import { Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { BATCHES } from "../data"
import { useNudge } from "../nudge-context"
import { PRIMARY, SECONDARY } from "../mike/buttons"
import { BRANDS, FIELDS, FIELD_LABEL, MODES, MODE_LABEL, RETAILERS, SKU_GROUPS, TIERS, TIER_INFO, shipPlan } from "../policy"
import type { Field, Policy, ReviewMode, ReviewRule, SkuTier } from "../policy"
import { MultiPicker, ScopeChips, SinglePicker } from "./scope-picker"

const money = (v: number) => (v >= 0.9995 ? `$${(Math.round(v * 10) / 10).toFixed(1)}M` : `$${Math.round(v * 1000)}K`)

/** Three-way switch for a tier's mode: the selected option is the filled one. */
function ModeSwitch({ value, onChange }: { value: ReviewMode; onChange: (m: ReviewMode) => void }) {
  return (
    <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
      {MODES.map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          aria-pressed={value === m}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
            value === m ? "bg-white text-slate-950 shadow-xs ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-800",
          )}
        >
          {MODE_LABEL[m]}
        </button>
      ))}
    </div>
  )
}

const CARD = "overflow-hidden rounded-xl border border-slate-200 bg-white"
const TITLE_BAR = "border-b border-slate-100 bg-slate-25 px-6 py-4"

/** Totals per mode across Mike's batches one approval away, under a policy. */
function planTotals(p: Policy) {
  return BATCHES.filter((b) => b.split).reduce(
    (acc, b) => {
      const plan = shipPlan(p, b.split!)
      for (const m of MODES) {
        acc[m].skus += plan[m].skus
        acc[m].value += plan[m].value
      }
      return acc
    },
    { each: { skus: 0, value: 0 }, bulk: { skus: 0, value: 0 }, autopilot: { skus: 0, value: 0 } } as Record<ReviewMode, { skus: number; value: number }>,
  )
}

/** "Saving puts 152 more SKUs (+$40K) on autopilot and 12 into review each." */
function effectLine(saved: Policy, draft: Policy) {
  const a = planTotals(saved)
  const b = planTotals(draft)
  const parts = MODES.map((m) => ({ m, skus: b[m].skus - a[m].skus, value: b[m].value - a[m].value })).filter((d) => d.skus > 0)
  if (parts.length === 0) return "Saving changes how new work is routed. Nothing waiting today moves."
  const phrase = (d: (typeof parts)[number]) =>
    `${d.skus} more SKUs (+${money(d.value)}) ${d.m === "autopilot" ? "on autopilot" : d.m === "bulk" ? "into bulk approval" : "into review each"}`
  return `Saving puts ${parts.map(phrase).join(" and ")}.`
}

/**
 * The Review policy tab: tier defaults, and review rules for a scope (and
 * optionally one field), shown like the Knowledge page. Changes preview their effect
 * on today's work before saving.
 */
export function ReviewPolicy() {
  const { policy, savePolicy } = useNudge()
  const [draft, setDraft] = useState<Policy>(policy)
  useEffect(() => setDraft(policy), [policy])

  const [scope, setScope] = useState<{ retailer: string; brands: string[]; skuGroups: string[]; tier: string; field: string; mode: ReviewMode }>({
    retailer: "Amazon",
    brands: [],
    skuGroups: [],
    tier: "any",
    field: "any",
    mode: "each",
  })
  const dirty = JSON.stringify(draft) !== JSON.stringify(policy)

  function addRule() {
    const rule: ReviewRule = {
      id: `r${Date.now()}`,
      retailer: scope.retailer,
      brands: scope.brands,
      skuGroups: scope.skuGroups,
      tier: scope.tier === "any" ? undefined : (scope.tier as SkuTier),
      field: scope.field === "any" ? undefined : (scope.field as Field),
      mode: scope.mode,
      author: "Claire Bennett",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    }
    setDraft({ ...draft, rules: [rule, ...draft.rules] })
    setScope({ ...scope, brands: [], skuGroups: [] })
  }

  return (
    <div className="flex flex-col gap-6 pb-28">
      <section className={CARD}>
        <div className={TITLE_BAR}>
          <div className="text-lg font-semibold text-slate-950">How Ally ships changes, by SKU tier</div>
          <div className="mt-0.5 text-sm text-slate-500">Tiers come from revenue. A review rule below overrides the tier for its scope.</div>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-6 px-6 pt-3 pb-1 text-xs font-medium text-slate-500">
          <span>Tier</span>
          <span>How changes ship</span>
        </div>
        <div className="px-6 pb-2">
          {TIERS.map((t) => (
            <div key={t} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 border-t border-slate-100 py-3.5 first:border-t-0">
              <div>
                <div className="text-[15px] font-semibold text-slate-950">{TIER_INFO[t].label}</div>
                <div className="mt-0.5 text-sm text-slate-500">
                  {TIER_INFO[t].band} · <span className="font-mono tabular-nums">{TIER_INFO[t].skus.toLocaleString()}</span> SKUs ·{" "}
                  <span className="font-mono tabular-nums">{TIER_INFO[t].share}%</span> of sales
                </div>
              </div>
              <ModeSwitch value={draft.tiers[t]} onChange={(m) => setDraft({ ...draft, tiers: { ...draft.tiers, [t]: m } })} />
            </div>
          ))}
        </div>
      </section>

      <section className={CARD}>
        <div className={TITLE_BAR}>
          <div className="text-lg font-semibold text-slate-950">Review rules</div>
          <div className="mt-0.5 text-sm text-slate-500">For a scope or field that needs different handling. The most specific rule wins. A title or image rule only adds review.</div>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-6 py-4">
          <SinglePicker label="Retailer" value={scope.retailer} options={RETAILERS.map((r) => ({ id: r, label: r }))} onChange={(v) => setScope({ ...scope, retailer: v })} />
          <MultiPicker label="All brands" value={scope.brands} options={BRANDS} onChange={(v) => setScope({ ...scope, brands: v })} />
          <MultiPicker label="All SKU groups" value={scope.skuGroups} options={SKU_GROUPS} onChange={(v) => setScope({ ...scope, skuGroups: v })} />
          <SinglePicker
            label="Tier"
            value={scope.tier}
            options={[{ id: "any", label: "Every tier" }, ...TIERS.map((t) => ({ id: t, label: TIER_INFO[t].label }))]}
            onChange={(v) => setScope({ ...scope, tier: v })}
          />
          <SinglePicker
            label="Changes"
            value={scope.field}
            options={[{ id: "any", label: "Any change" }, ...FIELDS.map((f) => ({ id: f, label: FIELD_LABEL[f] }))]}
            onChange={(v) => setScope({ ...scope, field: v })}
          />
          <span className="px-1 text-sm text-slate-400">→</span>
          <SinglePicker label="Mode" value={scope.mode} options={MODES.map((m) => ({ id: m, label: MODE_LABEL[m] }))} onChange={(v) => setScope({ ...scope, mode: v as ReviewMode })} />
          <button type="button" onClick={addRule} className={cn(PRIMARY, "ml-auto")}>
            Add rule
          </button>
        </div>
        <div className="px-6 pt-3 pb-1 text-xs font-medium text-slate-500">
          Rules <span className="ml-1 font-mono tabular-nums">{draft.rules.length}</span>
        </div>
        <div className="px-6 pb-2">
          {draft.rules.length === 0 && <div className="py-4 text-sm text-slate-500">No rules. Every SKU follows its tier.</div>}
          {draft.rules.map((r) => (
            <div key={r.id} className="flex items-start justify-between gap-4 border-t border-slate-100 py-3.5 first:border-t-0">
              <div className="min-w-0">
                <ScopeChips
                  parts={[
                    r.retailer,
                    ...(r.brands.length ? r.brands : ["All brands"]),
                    ...(r.skuGroups.length ? r.skuGroups : []),
                    ...(r.workType ? [r.workType] : []),
                    r.tier ? TIER_INFO[r.tier].label : "Every tier",
                    r.field ? FIELD_LABEL[r.field] : "Any change",
                  ]}
                />
                <div className="mt-1.5 text-[15px] font-semibold text-slate-950">{MODE_LABEL[r.mode]}</div>
                <div className="mt-0.5 text-xs text-slate-500">
                  {r.author} · {r.date}
                </div>
              </div>
              <button
                type="button"
                aria-label="Delete rule"
                onClick={() => setDraft({ ...draft, rules: draft.rules.filter((x) => x.id !== r.id) })}
                className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-50 hover:text-error-600"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {dirty && (
        <div className="fixed inset-x-0 bottom-24 z-30 flex justify-center px-4">
          <div className="flex w-full max-w-[880px] items-center gap-4 rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-pane-lg">
            <span className="min-w-0 flex-1 text-sm text-slate-700">{effectLine(policy, draft)}</span>
            <button type="button" onClick={() => setDraft(policy)} className={cn(SECONDARY, "h-9 px-4 text-sm")}>
              Discard
            </button>
            <button type="button" onClick={() => savePolicy(draft)} className={cn(PRIMARY, "h-9 px-4 text-sm")}>
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
