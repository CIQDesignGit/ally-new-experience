"use client"

import { useMemo, useState } from "react"
import { Check, Search, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { AGENTS, FIXES, GROUPS, INPUTS, INTENTS, META, PRODUCTS, RANK, RETAILERS, SURFACES, TOTAL } from "./data"
import type { IntentId, Status } from "./data"

const CARD = "rounded-2xl bg-white ring-1 ring-slate-200"
const HEAD = "text-xs font-medium text-slate-500"
const SECTION = "text-xl font-semibold tracking-tight text-slate-950"

const money = (k: number) => (k >= 1000 ? `$${(k / 1000).toFixed(1)}M` : `$${k}K`)

const STATUS: Record<Status, { label: string; dot: string }> = {
  meets: { label: "Meets", dot: "bg-success-600" },
  missing: { label: "Missing", dot: "bg-slate-300" },
  conflict: { label: "Conflicts across retailers", dot: "bg-warning-500" },
}

const AUTONOMY = {
  approval: { label: "One approval away", dot: "bg-ally-500", verb: "Approve" },
  input: { label: "Needs your input", dot: "bg-team", verb: "Confirm" },
  autopilot: { label: "On autopilot", dot: "bg-autopilot", verb: "Hold" },
} as const

/** A figure with its range in small type beneath it. */
function Figure({ value, range, note, size = "lg" }: { value: string; range: string; note?: string; size?: "lg" | "md" }) {
  return (
    <span className="inline-flex flex-col">
      <span className={cn("font-mono font-semibold text-slate-950 tabular-nums", size === "lg" ? "text-[40px] leading-none" : "text-lg")}>{value}</span>
      <span className="mt-1 text-xs text-slate-500 tabular-nums">
        {range}
        {note ? ` · ${note}` : ""}
      </span>
    </span>
  )
}

function StatusLine({ status }: { status: Status }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-slate-700">
      <span className={cn("size-1.5 rounded-full", STATUS[status].dot)} />
      {STATUS[status].label}
    </span>
  )
}

/**
 * AI Commerce v2: AI share of sales first (one number, range beneath), then the
 * attribute and intent graph you can search by intent or by product, then the
 * fixes it produces for the brand.
 */
export function AiCommerceV2() {

  const [mode, setMode] = useState<"intent" | "product">("intent")
  const [query, setQuery] = useState("")
  const [intentId, setIntentId] = useState<IntentId>("wet")
  const [productId, setProductId] = useState("br-tear")
  const [focus, setFocus] = useState<Record<string, boolean>>(Object.fromEntries(INTENTS.map((i) => [i.id, i.focus])))
  const [done, setDone] = useState<Record<string, boolean>>({})

  const q = query.trim().toLowerCase()
  // Brand-chosen intents first, then demand.
  const intents = useMemo(
    () => [...INTENTS].filter((i) => !q || i.name.toLowerCase().includes(q)).sort((a, b) => Number(!!focus[b.id]) - Number(!!focus[a.id]) || b.demand - a.demand),
    [q, focus],
  )
  const products = useMemo(() => PRODUCTS.filter((p) => !q || p.name.toLowerCase().includes(q) || p.attributes.some((a) => a.name.toLowerCase().includes(q))), [q])

  const intent = INTENTS.find((i) => i.id === intentId)!
  const product = PRODUCTS.find((p) => p.id === productId)!
  const openFixes = FIXES.filter((f) => !done[f.id])
  const openValue = openFixes.reduce((t, f) => t + f.value, 0)

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-baseline gap-x-3 gap-y-1 px-6 py-3">
          <h1 className="text-xl font-semibold tracking-tight text-slate-950">{META.brand}</h1>
          <span className="text-sm text-slate-700">
            {META.category} · {RETAILERS.join(", ")} · {META.asOf}
          </span>
          <span className="ml-auto rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">Illustrative data</span>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-12 px-6 pt-8 pb-24">
        {/* Rank on every surface, with sales underneath */}
        <section className="flex flex-col gap-5">
          <div className={cn(CARD, "flex flex-wrap items-end gap-x-14 gap-y-6 px-6 py-5")}>
            <div>
              <div className={HEAD}>Share of top positions, every surface</div>
              <div className="mt-2">
                <Figure value={`${RANK.top}%`} range={`Leader: ${RANK.leader.brand} ${RANK.leader.top}%`} />
              </div>
            </div>
            <div>
              <div className={HEAD}>Sales that started with AI, this month</div>
              <div className="mt-2">
                <Figure value={money(TOTAL.est)} range={`${money(TOTAL.low)}–${money(TOTAL.high)}`} />
              </div>
            </div>
            <div className="min-w-[300px] flex-1">
              <div className={HEAD}>What holds back top positions</div>
              <div className="mt-2 flex flex-col gap-1.5">
                {INPUTS.map((i) => (
                  <div key={i.id} className="grid grid-cols-[96px_minmax(0,1fr)_88px] items-center gap-3 text-sm">
                    <span className="font-medium text-slate-950">{i.name}</span>
                    <span className="h-2 rounded-full bg-slate-100">
                      <span className="block h-2 rounded-full bg-brand-500" style={{ width: `${(i.points / INPUTS[0].points) * 100}%` }} />
                    </span>
                    <span className="text-right font-mono text-slate-950 tabular-nums">−{i.points} pts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={cn(CARD, "overflow-x-auto")}>
            <div className="min-w-[720px]">
              <div className={cn(HEAD, "grid grid-cols-[minmax(0,1fr)_150px_150px_170px] gap-4 px-6 pt-3 pb-2")}>
                <span>Surface</span>
                <span className="text-right">Top positions</span>
                <span>Leader</span>
                <span className="text-right">Sales started there</span>
              </div>
              {SURFACES.map((s) => {
                const a = s.sales ? AGENTS.find((x) => x.id === s.sales) : undefined
                return (
                  <div key={s.id} className="grid grid-cols-[minmax(0,1fr)_150px_150px_170px] items-center gap-4 border-t border-slate-100 px-6 py-3">
                    <span>
                      <span className="block text-[15px] font-medium text-slate-950">{s.name}</span>
                      <span className="text-xs text-slate-500">{s.kind}</span>
                    </span>
                    <span className="text-right font-mono text-lg font-semibold text-slate-950 tabular-nums">{s.top}%</span>
                    <span className="text-sm text-slate-700">
                      {s.leader} {s.leaderTop}%
                    </span>
                    <span className="text-right">
                      {a ? <Figure size="md" value={money(a.est)} range={`${money(a.range[0])}–${money(a.range[1])}`} /> : <span className="text-sm text-slate-500">Feeds {s.feeds}</span>}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Top positions: the share of shopper questions and keywords, weighted by sales demand, where you rank top 3, in retailer search and agent answers alike. Sales: questions × click rate at your position × conversion at the retailer. The range narrows as each fix is measured against matched products.
          </p>
        </section>

        {/* Attribute and intent graph */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className={SECTION}>Attribute and intent graph</h3>
            <div className="flex rounded-lg bg-slate-100 p-0.5 text-sm">
              {(["intent", "product"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={cn("rounded-md px-3 py-1.5 font-medium", mode === m ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800")}
                >
                  {m === "intent" ? "By shopper intent" : "By product"}
                </button>
              ))}
            </div>
          </div>
          <label className={cn(CARD, "flex items-center gap-2 px-4 py-2.5")}>
            <Search className="size-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={mode === "intent" ? "Search an intent or attribute, e.g. pets, wet, bulk" : "Search a product or attribute, e.g. Tear-A-Square, pack count"}
              className="w-full bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400"
            />
          </label>

          {mode === "intent" ? (
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[340px_minmax(0,1fr)]">
              <div className={cn(CARD, "overflow-hidden")}>
                {GROUPS.map((g) => {
                  const rows = intents.filter((i) => i.group === g.id)
                  if (!rows.length) return null
                  return (
                    <div key={g.id} className="border-b border-slate-100 last:border-b-0">
                      <div className={cn(HEAD, "px-4 pt-3 pb-1")}>{g.name}</div>
                      {rows.map((i) => (
                        <div key={i.id} className={cn("flex items-center gap-2 px-4 py-2", intentId === i.id && "bg-slate-100")}>
                          <button type="button" onClick={() => setFocus((f) => ({ ...f, [i.id]: !f[i.id] }))} aria-label={focus[i.id] ? "Remove brand focus" : "Mark as brand focus"} className="shrink-0">
                            <Star className={cn("size-4", focus[i.id] ? "fill-brand-500 text-brand-500" : "text-slate-300 hover:text-slate-400")} />
                          </button>
                          <button type="button" onClick={() => setIntentId(i.id)} className="flex min-w-0 flex-1 items-baseline justify-between gap-2 text-left">
                            <span className="truncate text-sm text-slate-950">{i.name}</span>
                            <span className="shrink-0 font-mono text-xs text-slate-500 tabular-nums">{money(i.demand)}/mo</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )
                })}
                <div className="border-t border-slate-100 px-4 py-2 text-xs text-slate-500">
                  <Star className="mr-1 inline size-3 fill-brand-500 text-brand-500" />
                  Intents {META.brand} chose to own rank first
                </div>
              </div>

              <div className={cn(CARD, "overflow-hidden")}>
                <div className="border-b border-slate-100 px-6 py-4">
                  <div className="text-[15px] font-semibold text-slate-950">{intent.name}</div>
                  <div className="mt-0.5 text-sm text-slate-700">
                    <span className="font-mono tabular-nums">{money(intent.demand)}</span> a month of AI-driven category sales · {GROUPS.find((g) => g.id === intent.group)!.name.toLowerCase()}
                  </div>
                </div>
                <div className={cn(HEAD, "grid grid-cols-[minmax(0,1fr)_190px_150px] gap-4 px-6 pt-3 pb-2")}>
                  <span>Product</span>
                  <span>Status</span>
                  <span>Agents that name it</span>
                </div>
                {PRODUCTS.filter((p) => p.intents[intent.id])
                  .sort((a, b) => b.intents[intent.id]!.named.length - a.intents[intent.id]!.named.length)
                  .map((p) => {
                    const v = p.intents[intent.id]!
                    return (
                      <div key={p.id} className="border-t border-slate-100 px-6 py-3">
                        <div className="grid grid-cols-[minmax(0,1fr)_190px_150px] items-center gap-4">
                          <button type="button" onClick={() => { setMode("product"); setProductId(p.id) }} className={cn("text-left text-sm hover:underline", p.ours ? "font-medium text-slate-950" : "text-slate-700")}>
                            {p.name}
                          </button>
                          <StatusLine status={v.status} />
                          <span className="text-sm text-slate-700">{v.named.length ? v.named.join(", ") : <span className="text-slate-400">None</span>}</span>
                        </div>
                        {v.gap && <div className="mt-1 text-xs text-slate-500">{v.gap}</div>}
                      </div>
                    )
                  })}
                {PRODUCTS.filter((p) => p.ours && !p.intents[intent.id]).map((p) => (
                  <div key={p.id} className="grid grid-cols-[minmax(0,1fr)_190px_150px] items-center gap-4 border-t border-slate-100 px-6 py-3">
                    <span className="text-sm text-slate-500">{p.name}</span>
                    <span className="text-sm text-slate-400">Not relevant</span>
                    <span />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[340px_minmax(0,1fr)]">
              <div className={cn(CARD, "overflow-hidden")}>
                {products.map((p) => {
                  const gaps = Object.entries(p.intents).filter(([id, v]) => v && v.status !== "meets" && !done[`${p.id}-${id}`]).length
                  return (
                    <button key={p.id} type="button" onClick={() => setProductId(p.id)} className={cn("flex w-full items-baseline justify-between gap-2 border-b border-slate-100 px-4 py-2.5 text-left last:border-b-0", productId === p.id && "bg-slate-100")}>
                      <span className={cn("min-w-0 text-sm", p.ours ? "font-medium text-slate-950" : "text-slate-700")}>{p.name}</span>
                      {p.ours && gaps > 0 && <span className="shrink-0 text-xs text-slate-500">{gaps} to fix</span>}
                    </button>
                  )
                })}
              </div>

              <div className="flex flex-col gap-3">
                <div className={cn(CARD, "overflow-hidden")}>
                  <div className="border-b border-slate-100 px-6 py-4 text-[15px] font-semibold text-slate-950">{product.name}</div>
                  <div className={cn(HEAD, "grid grid-cols-[minmax(0,1fr)_190px_150px] gap-4 px-6 pt-3 pb-2")}>
                    <span>Shopper intent</span>
                    <span>Status</span>
                    <span>Agents that name it</span>
                  </div>
                  {Object.entries(product.intents).map(([id, v]) => (
                    <div key={id} className="border-t border-slate-100 px-6 py-3">
                      <div className="grid grid-cols-[minmax(0,1fr)_190px_150px] items-center gap-4">
                        <span className="text-sm text-slate-950">
                          {focus[id] && <Star className="mr-1 inline size-3 fill-brand-500 text-brand-500" />}
                          {INTENTS.find((i) => i.id === id)!.name}
                        </span>
                        <StatusLine status={v!.status} />
                        <span className="text-sm text-slate-700">{v!.named.length ? v!.named.join(", ") : <span className="text-slate-400">None</span>}</span>
                      </div>
                      {v!.gap && <div className="mt-1 text-xs text-slate-500">{v!.gap}</div>}
                      {product.ours && v!.fix && <div className="mt-0.5 text-xs font-medium text-slate-700">Fix: {v!.fix}</div>}
                    </div>
                  ))}
                </div>

                <div className={cn(CARD, "overflow-x-auto")}>
                  <div className="min-w-[620px]">
                    <div className={cn(HEAD, "grid grid-cols-[170px_repeat(3,minmax(0,1fr))] gap-4 px-6 pt-3 pb-2")}>
                      <span>Attribute</span>
                      {RETAILERS.map((r) => (
                        <span key={r}>{r}</span>
                      ))}
                    </div>
                    {product.attributes.map((a) => {
                      // Flag only the value that differs from what most retailers show.
                      const shown = RETAILERS.map((r) => a.values[r]).filter((v): v is string => !!v)
                      const common = shown.sort((x, y) => shown.filter((v) => v === y).length - shown.filter((v) => v === x).length)[0]
                      const odd = (v: string | null) => !!v && new Set(shown).size > 1 && v !== common && a.name !== "Price per 100 sheets"
                      return (
                        <div key={a.name} className="grid grid-cols-[170px_repeat(3,minmax(0,1fr))] gap-4 border-t border-slate-100 px-6 py-2.5 text-sm">
                          <span className="text-slate-700">{a.name}</span>
                          {RETAILERS.map((r) => (
                            <span key={r} className={cn(a.values[r] ? "text-slate-950" : "text-slate-400", odd(a.values[r]) && "font-medium text-warning-700")}>
                              {a.values[r] ?? "Not shown"}
                            </span>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Fixes the graph produces */}
        <section className="flex flex-col gap-4">
          <h3 className={SECTION}>
            Fixes for {META.brand} <span className="ml-2 text-base font-medium text-slate-500 tabular-nums">+{money(openValue)} a month projected</span>
          </h3>
          <div className={cn(CARD, "overflow-hidden")}>
            <div className={cn(HEAD, "grid grid-cols-[minmax(0,1fr)_170px_110px_110px] gap-4 px-6 pt-3 pb-2")}>
              <span>Fix</span>
              <span>Autonomy</span>
              <span className="text-right">Projected</span>
              <span />
            </div>
            {FIXES.map((f) => {
              const isDone = !!done[f.id]
              const a = AUTONOMY[f.autonomy]
              return (
                <div key={f.id} className="grid grid-cols-[minmax(0,1fr)_170px_110px_110px] items-center gap-4 border-t border-slate-100 px-6 py-3">
                  <div className="min-w-0">
                    <div className={cn("text-[15px]", isDone ? "text-slate-500" : "font-medium text-slate-950")}>{f.fix}</div>
                    <div className="text-xs text-slate-500">
                      {f.product} · {f.intent} · {f.retailers.join(", ")}
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs text-slate-700">
                    <span className={cn("size-1.5 rounded-full", a.dot)} />
                    {a.label}
                  </span>
                  <span className="text-right font-mono text-sm text-slate-950 tabular-nums">+{money(f.value)}/mo</span>
                  <span className="text-right">
                    {isDone ? (
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-success-700">
                        <Check className="size-4" /> {f.autonomy === "autopilot" ? "Held" : f.autonomy === "input" ? "Confirmed" : "Approved"}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDone((d) => ({ ...d, [f.id]: true }))}
                        className={cn("h-9 rounded-lg px-4 text-sm font-semibold", f.autonomy === "autopilot" ? "bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50" : "bg-brand-500 text-white hover:bg-brand-600")}
                      >
                        {a.verb}
                      </button>
                    )}
                  </span>
                </div>
              )
            })}
          </div>
          <p className="text-xs text-slate-500">Projected values are estimates from the intent&apos;s demand and the gap. Each fix is measured against matched products after it ships.</p>
        </section>
      </div>
    </div>
  )
}
