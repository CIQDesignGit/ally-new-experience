"use client"

import { cn } from "@/lib/utils"
import { Points } from "@/components/nudge/points"
import { META, OURS, QUESTIONS, SURFACES, isFixed, isLeader, money, score, share, top3, type Done } from "./data"
import { PRODUCTS } from "./products"

const CARD = "flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left transition-colors hover:border-brand-300"

/** Three cards: what's rising, the product that needs the most, where the leader wins. Each opens its answer in Ask Ally. */
export function Cards({ done, onAsk }: { done: Done; onAsk: (q: string) => void }) {
  const rising = QUESTIONS.filter((q) => q.trend)
  const weakest = [...OURS].sort((a, b) => score(done, undefined, a) - score(done, undefined, b))[0]
  const p = PRODUCTS.find((x) => x.sku === weakest)!
  const missing = p.fields.filter((f) => Object.values(f.values).every((v) => !v)).length
  const behind = p.fields.filter((f) => f.ally && f.bounty && Object.values(f.values).some((v) => !v)).length
  const bySurface = SURFACES.map((s) => ({ s, ours: share(done, undefined, s.id), leader: share(done, isLeader, s.id) }))
  const worst = [...bySurface].sort((a, b) => b.leader - b.ours - (a.leader - a.ours))[0]
  const openSurface = [...bySurface].sort((a, b) => a.leader - b.leader)[0]

  return (
    <section className="px-12 pt-10 pb-4">
      <div className="font-mono text-xs tracking-wide text-slate-500 uppercase">Beyond the gap</div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <button type="button" onClick={() => onAsk("What's rising this month?")} className={CARD}>
          <div className="text-xs font-medium text-slate-500">Rising this month</div>
          <div className="mt-3 text-lg leading-snug font-semibold text-slate-950">“{rising[0].text}” is {rising[0].trend!.toLowerCase()}</div>
          <Points
            className="mt-3"
            items={rising.map((q) => (
              <span key={q.id}>
                {q.text.replace(/\.$/, "")} · <span className="font-mono">{money(Object.values(q.answers).reduce((t, a) => t + a.demand, 0))}</span> · you top 3 on {wins(q, done)} of {Object.keys(q.answers).length}
              </span>
            ))}
          />
          <span className="mt-auto pt-4 text-[15px] font-semibold text-brand-700">See what shoppers are asking →</span>
        </button>

        <button type="button" onClick={() => onAsk(`Audit ${weakest.split(",")[0]} for agents`)} className={CARD}>
          <div className="text-xs font-medium text-slate-500">Weakest product</div>
          <div className="mt-3 text-lg leading-snug font-semibold text-slate-950">{weakest.split(",")[0]}</div>
          <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-slate-25 px-3 py-2.5 text-center">
            <Stat value={`${score(done, undefined, weakest)}`} label="AI Commerce Score" />
            <Stat value={`${missing}`} label="fields on no retailer" bad={missing > 0} />
            <Stat value={`${behind}`} label={`fields ${META.leader} fills, you don't`} bad={behind > 0} />
          </div>
          <span className="mt-auto pt-4 text-[15px] font-semibold text-brand-700">Audit it as the agent reads it →</span>
        </button>

        <button type="button" onClick={() => onAsk(`Why is ${META.leader} winning on ${worst.s.name}?`)} className={CARD}>
          <div className="text-xs font-medium text-slate-500">Where {META.leader} wins</div>
          <div className="mt-3 text-lg leading-snug font-semibold text-slate-950">
            {worst.s.name}: {META.leader} <span className="font-mono">{worst.leader}%</span>, you <span className="font-mono">{worst.ours}%</span>
          </div>
          <div className="mt-3 flex flex-col gap-1.5 rounded-lg bg-slate-25 px-3 py-2.5">
            {bySurface.map(({ s, ours, leader }) => (
              <div key={s.id} className="grid grid-cols-[minmax(0,1fr)_44px_44px] items-center gap-2 text-[13px]">
                <span className="truncate text-slate-700">{s.name}</span>
                <span className="text-right font-mono text-slate-950 tabular-nums">{ours}%</span>
                <span className={cn("text-right font-mono tabular-nums", leader > ours ? "text-slate-500" : "text-success-700")}>{leader}%</span>
              </div>
            ))}
          </div>
          <span className="mt-auto pt-4 text-[15px] font-semibold text-brand-700">
            {openSurface.s.name} is open: {META.leader} at {openSurface.leader}% →
          </span>
        </button>
      </div>
    </section>
  )
}

function Stat({ value, label, bad }: { value: string; label: string; bad?: boolean }) {
  return (
    <div>
      <div className={cn("font-mono text-sm font-semibold", bad ? "text-error-600" : "text-slate-950")}>{value}</div>
      <div className="mt-0.5 text-[11px] text-slate-500">{label}</div>
    </div>
  )
}

const wins = (q: (typeof QUESTIONS)[number], done: Done) => Object.values(q.answers).filter((a) => top3(a) || isFixed(q, done)).length
