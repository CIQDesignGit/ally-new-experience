"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { BRAND_CONTEXT, BRAND_TOTAL, CATEGORY, GROWTH, NEW_BRAND_START, PATTERNS, TYPE_COUNTS } from "./context-data"
import type { ContextEntry, ContextType } from "./context-data"

const HEAD = "text-xs font-medium text-slate-500"

/**
 * What Ally knows about Aurelle: always learning (the newest thing, live), the
 * buckets, each thing it learned with what it unlocks, and the category
 * patterns learned across brands.
 */
export function ContextView({ editor, extra = [] }: { /** The editable rules, opened from the list. */ editor?: React.ReactNode; /** Entries that live elsewhere (the Business view's choices), shown with the rest. */ extra?: ContextEntry[] }) {
  const first = GROWTH[0]
  const last = GROWTH[GROWTH.length - 1]
  return (
    <div className="flex flex-col gap-10">
      <div>
        <LearningNow />
        <h2 className="mt-3 text-2xl leading-tight font-bold tracking-tight text-slate-950">
          Ally knows <span className="font-mono">{BRAND_TOTAL}</span> things about Aurelle.
        </h2>
        <div className="mt-1 text-lg text-slate-700">
          <span className="font-mono font-semibold text-slate-950">{last.firstPass}%</span> of drafts right first time, up from <span className="font-mono">{first.firstPass}%</span> in August.
        </div>
      </div>

      <BrandContext editor={editor} extra={extra} />

      <section>
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">Learned across {CATEGORY.name.toLowerCase()}</h2>
          <span className="text-sm text-slate-500">
            {CATEGORY.brands} brands · the pattern travels, no brand&apos;s data does · published by {CATEGORY.lead}
          </span>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left">
                <th className={`${HEAD} pb-2`}>Pattern</th>
                <th className={`${HEAD} pb-2`}>Evidence</th>
                <th className={`${HEAD} pb-2`}>Status</th>
                <th className={`${HEAD} pb-2`}>For Aurelle</th>
              </tr>
            </thead>
            <tbody>
              {PATTERNS.map((p) => (
                <tr key={p.text} className="border-b border-slate-100">
                  <td className="py-3 pr-6 font-medium text-slate-950">{p.text}</td>
                  <td className="py-3 pr-6 text-slate-700">{p.evidence}</td>
                  <td className="py-3 pr-6 whitespace-nowrap">
                    <span className={cn("inline-flex items-center gap-1.5 text-[13px] font-medium", p.status === "Proven" ? "text-success-700" : p.status === "Testing" ? "text-slate-500" : "text-warning-700")}>
                      <span className={cn("size-1.5 rounded-full", p.status === "Proven" ? "bg-success-500" : p.status === "Testing" ? "bg-slate-400" : "bg-warning-500")} />
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 text-slate-700">{p.aurelle}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[13px] text-slate-500">
          Seen at 3 or more brands, then tested, then proven, then signed off before it reaches every account. A brand&apos;s own rule always comes first. A new candle brand starts at about{" "}
          <span className="font-mono">{NEW_BRAND_START}%</span> first-time approval on day one, not <span className="font-mono">{first.firstPass}%</span>.
        </p>
      </section>
    </div>
  )
}

/** The newest things Ally learned, one at a time: the page's one motion, so "always learning" is something you see. */
const LATEST = [
  { text: "Cedar & Smoke back in stock Oct 20", from: "the Oct 2 call" },
  { text: "Claire loved the competitor slide: lead with it", from: "the Oct 2 recap" },
  { text: "Q4 margin floor is 32%", from: "the Oct 2 call" },
  { text: "WBR on Tuesdays, with Target", from: "the Oct 2 call" },
]
function LearningNow() {
  const [i, setI] = useState(0)
  const [shown, setShown] = useState(true)
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const id = window.setInterval(() => {
      setShown(false)
      window.setTimeout(() => {
        setI((x) => (x + 1) % LATEST.length)
        setShown(true)
      }, 300)
    }, 3500)
    return () => window.clearInterval(id)
  }, [])
  const l = LATEST[i]
  return (
    <div className="flex items-center gap-2.5 text-sm text-slate-500">
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-ally-400 opacity-60" />
        <span className="relative inline-flex size-2 rounded-full bg-ally-500" />
      </span>
      <span className="font-medium text-ally-700">Learning now</span>
      <span className={cn("min-w-0 truncate transition-all duration-300", shown ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0")}>
        <span className="text-slate-950">{l.text}</span> · from {l.from}
      </span>
    </div>
  )
}

/** The buckets, in plain words. */
const BUCKET: Record<ContextType, string> = { Voice: "Brand voice", Rules: "Claims and legal", Calendar: "Calendar", Operations: "Operations", Business: "Business goals", People: "People", Preferences: "Preferences" }
const BUCKET_ORDER: ContextType[] = ["Voice", "Rules", "Calendar", "Operations", "Business", "People", "Preferences"]

/** The library: entries by type, each with where it came from and what it changed. */
function BrandContext({ editor, extra }: { editor?: React.ReactNode; extra: ContextEntry[] }) {
  const [type, setType] = useState<ContextType | "All">("All")
  const [editing, setEditing] = useState(false)
  const rows = [...BRAND_CONTEXT, ...extra].filter((e) => type === "All" || e.type === type)
  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight text-slate-950">By bucket</h2>
        {editor && (
          <button type="button" onClick={() => setEditing((v) => !v)} aria-expanded={editing} className="text-sm font-medium text-brand-700 hover:underline">
            {editing ? "Done editing" : "Add or edit"}
          </button>
        )}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
        {(["All", ...BUCKET_ORDER] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            aria-pressed={type === t}
            className={cn(
              "flex flex-col items-start rounded-xl border px-3 py-2.5 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-300",
              type === t ? "border-slate-300 bg-white shadow-sm" : "border-slate-200 bg-slate-25 hover:bg-white",
            )}
          >
            <span className="font-mono text-lg font-semibold text-slate-950 tabular-nums">{t === "All" ? BRAND_TOTAL : TYPE_COUNTS[t]}</span>
            <span className="text-[13px] text-slate-600">{t === "All" ? "All" : BUCKET[t]}</span>
          </button>
        ))}
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left">
              <th className={`${HEAD} pb-2`}>What it learned</th>
              <th className={`${HEAD} pb-2`}>From</th>
              <th className={`${HEAD} pb-2 pl-6`}>What it unlocks</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.text} className="border-b border-slate-100 align-baseline">
                <td className="py-3 pr-6">
                  <div className="font-medium text-slate-950">{e.text}</div>
                  <div className="mt-0.5 text-[13px] text-slate-500">
                    {BUCKET[e.type]} · used {e.applied} {e.applied === 1 ? "time" : "times"}
                    {e.expires && ` · until ${e.expires}`}
                  </div>
                </td>
                <td className="py-3 pr-6 whitespace-nowrap text-slate-700">{e.source}</td>
                <td className={cn("py-3 pl-6", e.result ? "text-slate-950" : "text-slate-400")}>{e.result ?? "Not measured yet"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 rounded-lg bg-ally-50 px-4 py-3 text-sm text-ally-800">
        <span className="font-semibold">Next unlock:</span> seasonal pages ship on autopilot from the next event, 394 more SKUs
      </div>
      <p className="mt-2 text-[13px] text-slate-500">
        Showing {rows.length} of {type === "All" ? BRAND_TOTAL : TYPE_COUNTS[type]} · from calls, edits, the brand team and legal
      </p>
      {editing && <div className="mt-5">{editor}</div>}
    </section>
  )
}
