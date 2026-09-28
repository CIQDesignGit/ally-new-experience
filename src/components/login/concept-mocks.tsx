"use client"

import { motion } from "framer-motion"
import { Bot, Sparkles, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Three product glimpses for the sign-in page. Real slices of the demo, with its
 * numbers (media delivered $694K at $3.01 iROAS; AI share of voice 34%), not illustrations.
 */

const CARD = "w-full rounded-2xl bg-white p-6 text-slate-950 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.55)]"
const LIVE = "size-1.5 rounded-full bg-success-500"

/** Retail harness: one layer between every retailer and every agent. */
export function HarnessMock() {
  const retailers = ["Amazon", "Walmart", "Target", "Instacart"]
  const agents = [
    { name: "content agent", doing: "Rewriting 12 PDPs" },
    { name: "ops agent", doing: "Fixing buy box · 4 SKUs" },
    { name: "media agent", doing: "Pacing 1,400 keywords" },
  ]
  return (
    <div className={CARD}>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="font-semibold tracking-wide text-slate-700 uppercase">Harness</span>
        <span className="flex items-center gap-1.5">
          <span className={LIVE} /> 4 retailers · 3 agents · live
        </span>
      </div>
      <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <ul className="flex flex-col gap-2">
          {retailers.map((r, n) => (
            <motion.li
              key={r}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + n * 0.08 }}
              className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              {r}
              <span className={LIVE} />
            </motion.li>
          ))}
        </ul>
        <div className="relative flex size-24 items-center justify-center">
          <motion.span
            className="absolute inset-0 rounded-full border border-brand-200"
            animate={{ scale: [1, 1.18, 1], opacity: [0.9, 0.2, 0.9] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="absolute inset-3 rounded-full bg-brand-50" />
          <span className="relative flex flex-col items-center text-xs font-semibold text-brand-700">
            <Sparkles className="mb-1 size-4" />
            Ally
          </span>
        </div>
        <ul className="flex flex-col gap-2">
          {agents.map((a, n) => (
            <motion.li
              key={a.name}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + n * 0.1 }}
              className="rounded-lg border border-slate-200 px-3 py-2"
            >
              <div className="text-sm font-medium">{a.name}</div>
              <div className="text-xs text-slate-500">{a.doing}</div>
            </motion.li>
          ))}
        </ul>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500">
        <Stat v="2,480" l="SKUs watched" />
        <Stat v="96K" l="actions this quarter" />
        <Stat v="48 hrs" l="to fix, down from 2 wks" />
      </div>
    </div>
  )
}

/** Agents that win AI shopping agents: a shopper's AI asks, ours answers overnight. */
export function ShopperMock() {
  const ranked = [
    { name: "Aurelle Amber Floral Soy Jar", ours: true },
    { name: "Brightwick Vanilla Bean", ours: false },
    { name: "Lumen & Co Cedar Tin", ours: false },
  ]
  const feed = [
    { t: "2:14 AM", who: "content agent", what: `Added "housewarming" to 12 PDPs` },
    { t: "3:02 AM", who: "media agent", what: "Raised bids on 38 gifting keywords" },
    { t: "6:40 AM", who: "Ally", what: "AI share of voice 34%, up 1.4 pts" },
  ]
  return (
    <div className={CARD}>
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Bot className="size-4 text-slate-400" />
        <span className="font-semibold tracking-wide text-slate-700 uppercase">AI shopping agent</span>
      </div>
      <div className="mt-3 ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-slate-100 px-4 py-2.5 text-sm">
        Best soy candle for a housewarming gift?
      </div>
      <ol className="mt-3 flex flex-col gap-1.5">
        {ranked.map((r, n) => (
          <motion.li
            key={r.name}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + n * 0.12 }}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm",
              r.ours ? "bg-brand-50 font-medium text-brand-900 ring-1 ring-brand-200" : "text-slate-600",
            )}
          >
            <span className="w-4 font-mono text-xs text-slate-400">{n + 1}</span>
            {r.name}
            {r.ours && <span className="ml-auto text-xs font-medium text-brand-700">Recommended</span>}
          </motion.li>
        ))}
      </ol>
      <div className="mt-5 border-t border-slate-100 pt-4">
        <div className="text-xs font-medium text-slate-500">Overnight</div>
        <ul className="mt-2 flex flex-col gap-2">
          {feed.map((f, n) => (
            <motion.li
              key={f.t}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 + n * 0.15 }}
              className="flex gap-3 text-sm"
            >
              <span className="w-16 shrink-0 font-mono text-xs leading-5 text-slate-400">{f.t}</span>
              <span>
                <span className="font-medium">{f.who}</span> <span className="text-slate-600">{f.what}</span>
              </span>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/** Incrementality: what media added on top of what would have sold anyway. */
export function IncrementalityMock() {
  // Incremental rows sum to the $694K media delivered; one scale for every bar, so length matches the number.
  const rows = [
    { name: "Brand search", base: 520, lift: 312 },
    { name: "Category search", base: 380, lift: 248 },
    { name: "Competitor conquest", base: 150, lift: 134 },
  ]
  const max = Math.max(...rows.map((r) => r.base + r.lift))
  return (
    <div className={CARD}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-semibold tracking-wide text-slate-700 uppercase">Incremental sales</div>
          <div className="mt-1 font-mono text-[34px] leading-none font-semibold tracking-tight">$694K</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500">iROAS</div>
          <div className="mt-1 flex items-center gap-1 font-mono text-xl font-semibold text-success-700">
            <TrendingUp className="size-4" />
            $3.01
          </div>
        </div>
      </div>
      <ul className="mt-6 flex flex-col gap-4">
        {rows.map((r, n) => (
          <li key={r.name}>
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-medium">{r.name}</span>
              <span className="font-mono text-slate-950">+${r.lift}K</span>
            </div>
            <div className="mt-1.5 flex h-2.5 gap-0.5">
              <motion.span
                className="rounded-l-full bg-slate-200"
                initial={{ width: 0 }}
                animate={{ width: `${(r.base / max) * 100}%` }}
                transition={{ delay: 0.2 + n * 0.1, duration: 0.6, ease: "easeOut" }}
              />
              <motion.span
                className="rounded-r-full bg-brand-500"
                initial={{ width: 0 }}
                animate={{ width: `${(r.lift / max) * 100}%` }}
                transition={{ delay: 0.5 + n * 0.1, duration: 0.6, ease: "easeOut" }}
              />
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-5 flex gap-5 border-t border-slate-100 pt-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-slate-200" /> Would have sold anyway
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-brand-500" /> Added by media
        </span>
      </div>
    </div>
  )
}

function Stat({ v, l }: { v: string; l: string }) {
  return (
    <div>
      <div className="font-mono text-base font-semibold text-slate-950">{v}</div>
      <div>{l}</div>
    </div>
  )
}
