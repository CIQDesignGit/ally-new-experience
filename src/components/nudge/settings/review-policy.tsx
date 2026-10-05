"use client"

import { useEffect, useState } from "react"
import { Eye, ListChecks, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { AUTOPILOT_GO_LIVE, BATCHES } from "../data"
import { shortDate } from "../model"
import { useNudge } from "../nudge-context"
import { PRIMARY, SECONDARY } from "../mike/buttons"
import { BRANDS, FIELDS, FIELD_LABEL, MODES, MODE_LABEL, RETAILERS, SKU_GROUPS, TIERS, TIER_INFO, shipPlan } from "../policy"
import type { Field, Policy, ReviewMode, ReviewRule, SkuTier } from "../policy"
import { MultiPicker, SinglePicker } from "./scope-picker"

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


/** Each mode in plain words, as the person would say it. */
const MODE_PLAIN: Record<ReviewMode, string> = { each: "You review each change", bulk: "You approve in bulk", autopilot: "Ally ships, you can undo" }
const MODE_ICON: Record<ReviewMode, typeof Eye> = { each: Eye, bulk: ListChecks, autopilot: Zap }
const SHARE_LABEL: Record<SkuTier, string> = { hero: "Top 50% of sales", core: "Next 40%", tail: "Last 10%" }

/** "On Amazon, any change to Hearthwood core SKUs: you review each change." */
function ruleSentence(r: ReviewRule) {
  const what = [r.workType?.toLowerCase(), ...r.skuGroups.map((g) => g.toLowerCase()), r.tier ? TIER_INFO[r.tier].label.toLowerCase() : undefined].filter(Boolean).join(" ")
  const who = r.brands.length ? `${r.brands.join(" and ")} ` : ""
  const change = r.field ? FIELD_LABEL[r.field].toLowerCase() : "any change"
  return `On ${r.retailer}, ${change} to ${who}${what || "all"} SKUs: ${MODE_PLAIN[r.mode].charAt(0).toLowerCase()}${MODE_PLAIN[r.mode].slice(1)}.`
}

const CARD = "overflow-hidden rounded-xl border border-slate-200 bg-white"
const TITLE_BAR = "border-b border-slate-100 bg-slate-25 px-6 py-4"

/** Totals per mode across Mike's batches one approval away, under a policy. */
function planTotals(p: Policy) {
  return BATCHES.filter((b) => b.split).reduce(
    (acc, b) => {
      const plan = shipPlan(p, { ...b.split!, type: b.type, batchId: b.id })
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

  // This week's work under the draft: per tier, how many SKUs land in each mode (live as the draft changes).
  const week = TIERS.reduce(
    (acc, t) => ({ ...acc, [t]: { each: 0, bulk: 0, autopilot: 0, batches: 0 } }),
    {} as Record<SkuTier, Record<ReviewMode, number> & { batches: number }>,
  )
  for (const b of BATCHES.filter((x) => x.split && x.tier === "approval")) {
    const plan = shipPlan(draft, { ...b.split!, type: b.type, batchId: b.id })
    for (const t of TIERS)
      for (const m of MODES) {
        const n = plan[m].byTier[t] ?? 0
        week[t][m] += n
        if (n && m === "bulk") week[t].batches += 1
      }
  }
  const weekLine = (t: SkuTier) => {
    const m = draft.tiers[t]
    const n = week[t][m]
    if (!n) return "Nothing this week"
    if (m === "each") return `This week: ${n} SKUs to review one by one`
    if (m === "bulk") return `This week: ${n} SKUs in ${week[t].batches} ${week[t].batches === 1 ? "approval" : "approvals"}`
    return `This week: ${n} SKUs go live ${shortDate(AUTOPILOT_GO_LIVE)}`
  }
  const [changing, setChanging] = useState<SkuTier | null>(null)

  return (
    <div className="flex flex-col gap-6 pb-28">
      {/* One card per tier: who it is, how its changes ship, and what that means this week. */}
      <div className="grid gap-4 md:grid-cols-3">
        {TIERS.map((t) => {
          const m = draft.tiers[t]
          const Icon = MODE_ICON[m]
          return (
            <section key={t} className="flex flex-col rounded-xl border border-slate-200 bg-white px-5 py-4">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[15px] font-semibold text-slate-950">{TIER_INFO[t].label}</span>
                <span className="text-xs text-slate-500">{SHARE_LABEL[t]}</span>
              </div>
              <div className="mt-0.5 text-[13px] text-slate-500">
                <span className="font-mono tabular-nums">{TIER_INFO[t].skus.toLocaleString()}</span> SKUs · <span className="font-mono tabular-nums">{TIER_INFO[t].share}%</span> of sales
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-950">
                <Icon className={cn("size-4", m === "autopilot" ? "text-autopilot" : "text-slate-500")} />
                {MODE_PLAIN[m]}
              </div>
              <div className="mt-1 text-[13px] text-slate-600">{weekLine(t)}</div>
              {changing === t ? (
                <div className="mt-3">
                  <ModeSwitch
                    value={m}
                    onChange={(next) => {
                      setDraft({ ...draft, tiers: { ...draft.tiers, [t]: next } })
                      setChanging(null)
                    }}
                  />
                </div>
              ) : (
                <button type="button" onClick={() => setChanging(t)} className="mt-3 w-fit text-[13px] font-medium text-brand-700 hover:underline">
                  Change
                </button>
              )}
            </section>
          )
        })}
      </div>

      <section className={CARD}>
        <div className={TITLE_BAR}>
          <div className="text-lg font-semibold text-slate-950">Exceptions</div>
          <div className="mt-0.5 text-sm text-slate-500">An exception wins over its tier.</div>
        </div>
        <div className="px-6 pb-1">
          {draft.rules.length === 0 && <div className="py-4 text-sm text-slate-500">None. Every SKU follows its tier.</div>}
          {draft.rules.map((r) => (
            <div key={r.id} className="flex items-start justify-between gap-4 border-t border-slate-100 py-3.5 first:border-t-0">
              <div className="min-w-0">
                <div className="text-[15px] text-slate-950">{ruleSentence(r)}</div>
                <div className="mt-0.5 text-xs text-slate-500">
                  {r.author} · {r.date}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDraft({ ...draft, rules: draft.rules.filter((x) => x.id !== r.id) })}
                className="shrink-0 text-[13px] font-medium text-slate-500 hover:text-error-600"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        {/* A new exception, written as the sentence it will read as. */}
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 bg-slate-25 px-6 py-4 text-sm text-slate-700">
          <span className="font-medium text-slate-950">New exception:</span>
          <span>On</span>
          <SinglePicker label="Retailer" value={scope.retailer} options={RETAILERS.map((r) => ({ id: r, label: r }))} onChange={(v) => setScope({ ...scope, retailer: v })} />
          <span>,</span>
          <SinglePicker
            label="Changes"
            value={scope.field}
            options={[{ id: "any", label: "any change" }, ...FIELDS.map((f) => ({ id: f, label: FIELD_LABEL[f].toLowerCase() }))]}
            onChange={(v) => setScope({ ...scope, field: v })}
          />
          <span>to</span>
          <MultiPicker label="all brands" value={scope.brands} options={BRANDS} onChange={(v) => setScope({ ...scope, brands: v })} />
          <MultiPicker label="all SKU groups" value={scope.skuGroups} options={SKU_GROUPS} onChange={(v) => setScope({ ...scope, skuGroups: v })} />
          <SinglePicker
            label="Tier"
            value={scope.tier}
            options={[{ id: "any", label: "every tier" }, ...TIERS.map((t) => ({ id: t, label: `${TIER_INFO[t].label.toLowerCase()} SKUs` }))]}
            onChange={(v) => setScope({ ...scope, tier: v })}
          />
          <span>:</span>
          <SinglePicker label="Mode" value={scope.mode} options={MODES.map((m) => ({ id: m, label: MODE_PLAIN[m].toLowerCase() }))} onChange={(v) => setScope({ ...scope, mode: v as ReviewMode })} />
          <button type="button" onClick={addRule} className={cn(PRIMARY, "ml-auto")}>
            Add exception
          </button>
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
