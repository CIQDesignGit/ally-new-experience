"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { META, SOURCES, SURFACES, TRENDS, brandRank, linkSplit, money, sov, surfacesOf, visibility, voices, type Done, type SourceId } from "./data"

const CARD = "flex min-w-0 flex-col rounded-2xl bg-white p-6 text-left shadow-xs ring-1 transition-shadow"
const LABEL: Record<string, string> = { Measured: "bg-success-50 text-success-700", Estimated: "bg-warning-50 text-warning-700", "No volume": "bg-slate-100 text-slate-600", Modeled: "bg-slate-100 text-slate-600" }

function Tag({ label }: { label: string }) {
  return <span className={cn("rounded px-1.5 py-0.5 text-[11px] font-medium", LABEL[label] ?? "bg-slate-100 text-slate-600")}>{label}</span>
}

/**
 * Where you stand, by source. Position is measured everywhere; volume is measured on retail
 * search, estimated with a named proxy on agents, and absent on personal agents. Dollars
 * inherit the weakest term, so two sources show a band instead of a number.
 */
export function Stand({ done }: { done: Done }) {
  const [open, setOpen] = useState<SourceId | null>(null)
  const cur = open ? SOURCES.find((s) => s.id === open)! : null
  return (
    <section>
      <div className="flex items-baseline gap-3 px-12">
        <div className="font-mono text-xs tracking-wide text-slate-500 uppercase">Where you stand</div>
        <div className="text-xs text-slate-500">AI visibility by source · AI rank · coverage</div>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-4">
        {SOURCES.map((src) => {
          const ss = surfacesOf(src.id)
          const v = visibility(done, undefined, ss)
          const r = brandRank(done, ss)
          const isOpen = open === src.id
          return (
            <button key={src.id} type="button" onClick={() => setOpen(isOpen ? null : src.id)} className={cn(CARD, isOpen ? "ring-2 ring-brand-300" : "ring-slate-200 hover:shadow-sm hover:ring-brand-300")}>
              <div className="text-xs font-medium text-slate-500">{src.name}</div>
              <div className="mt-3 font-mono text-[28px] leading-none font-semibold text-slate-950 tabular-nums">{sov(done, META.brand, ss)}%</div>
              <div className="mt-2 text-[13px] text-slate-500">
                <span className="font-mono tabular-nums">#{r.rank}</span> of {r.of} brands
              </div>
              <div className="mt-0.5 flex items-baseline justify-between gap-2 text-[13px] text-slate-500">
                <span>
                  <span className="font-mono tabular-nums">{v.in}</span> of {v.of} answers
                </span>
                <Tag label={src.volume.label} />
              </div>
              <span className="mt-auto pt-4 text-[15px] font-semibold text-brand-700">{isOpen ? "Less" : "More →"}</span>
            </button>
          )
        })}
      </div>

      {cur && (
        <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-xs ring-1 ring-slate-200">
          <div className="grid gap-6 px-6 py-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <div>
              <div className="text-xs font-medium text-slate-500">By surface · AI visibility · coverage · AI rank</div>
              <div className="mt-2 flex flex-col">
                {surfacesOf(cur.id).map((sid) => {
                  const v = visibility(done, undefined, [sid])
                  const r = brandRank(done, [sid])
                  return (
                    <div key={sid} className="grid grid-cols-[minmax(0,1fr)_90px_120px_90px] items-center gap-3 border-t border-slate-100 py-2.5 text-sm first:border-t-0">
                      <span className="font-medium text-slate-950">{SURFACES.find((s) => s.id === sid)!.name}</span>
                      <span className="text-right font-mono text-slate-950 tabular-nums">{sov(done, META.brand, [sid])}%</span>
                      <span className="text-right font-mono text-xs text-slate-500 tabular-nums">
                        in {v.in} of {v.of}
                      </span>
                      <span className="text-right font-mono text-xs text-slate-500 tabular-nums">#{r.rank} of {r.of}</span>
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-[150px_minmax(0,1fr)]">
                <div className="text-slate-500">Rank among brands</div>
                <div className="font-mono text-slate-950 tabular-nums">#{brandRank(done, surfacesOf(cur.id)).rank} of {brandRank(done, surfacesOf(cur.id)).of}</div>
                <div className="text-slate-500">Since last month</div>
                <div className="text-slate-950">{TRENDS[cur.id]}</div>
                <div className="text-slate-500">Volume</div>
                <div className="text-slate-950">
                  {cur.volume.text} <Tag label={cur.volume.label} />
                  <span className="block text-xs text-slate-500">{cur.volume.from}</span>
                </div>
                <div className="text-slate-500">Worth</div>
                <div className="text-slate-950">
                  {cur.worth.kind === "dollars" ? (
                    <>
                      <span className="font-mono font-semibold">{money(cur.worth.est)}</span> a month ({money(cur.worth.low)} to {money(cur.worth.high)})
                    </>
                  ) : (
                    <>{cur.worth.band} until measured</>
                  )}{" "}
                  <Tag label={cur.worth.label} />
                </div>
              </div>
              <div className="mt-3 text-xs text-slate-500">Position: {cur.id === "search" ? "share of voice tracking, weekly" : "our runs, about 10 a week per question"}.</div>
            </div>
            <div>
              {cur.id === "answer" || cur.id === "personal" ? (
                <>
                  <div className="text-xs font-medium text-slate-500">Where the links go</div>
                  <div className="mt-2 flex flex-col gap-1.5">
                    {linkSplit(done, surfacesOf(cur.id)).map((l) => (
                      <div key={l.retailer} className="grid grid-cols-[110px_minmax(0,1fr)_44px] items-center gap-3 text-sm">
                        <span className="text-slate-950">{l.retailer}</span>
                        <span className="h-2 rounded-full bg-slate-100">
                          <span className="block h-2 rounded-full bg-ally-500" style={{ width: `${l.pct}%` }} />
                        </span>
                        <span className="text-right font-mono text-slate-950 tabular-nums">{l.pct}%</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-slate-500">The agent picks the retailer, not you. Your Walmart page matters to ChatGPT even if your Walmart team never thinks about AI.</div>
                </>
              ) : (
                <>
                  <div className="text-xs font-medium text-slate-500">Brands by AI visibility</div>
                  <div className="mt-2 flex flex-col gap-1.5">
                    {voices(done, surfacesOf(cur.id))
                      .slice(0, 6)
                      .map((b, i) => (
                        <div key={b.brand} className={cn("grid grid-cols-[20px_minmax(0,1fr)_44px] items-center gap-2 rounded-md px-2 py-1 text-sm", b.brand === META.brand && "bg-ally-50")}>
                          <span className="font-mono text-xs text-slate-400 tabular-nums">#{i + 1}</span>
                          <span className={cn("truncate", b.brand === META.brand ? "font-semibold text-slate-950" : "text-slate-700")}>{b.brand}</span>
                          <span className="text-right font-mono text-slate-950 tabular-nums">{b.pct}%</span>
                        </div>
                      ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="mt-3 px-12 text-[11px] text-slate-400">AI visibility: each product in an answer weighted 1 ÷ its position (1st = 1, 2nd = ½, 3rd = ⅓ …); your share of that weight. AI rank: your place among brands by AI visibility. Coverage: the answers you appear in, out of all tracked; prompts on agents, keywords on retail search (page one). Dollars: questions × click rate at your position × conversion at the retailer; a band where volume isn&apos;t measured.</div>
    </section>
  )
}
