"use client"

import { useState } from "react"
import { ArrowLeft, ArrowRight, Info, Send, Sparkles, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { PAGE_MAX } from "@/components/layout/page-frame"
import { PageShell } from "@/components/layout/page-shell"

/**
 * MOCK for review, not wired to the data model: the "Grow beyond plan" cards
 * at the bottom of Claire's page, the Market view they open, and the Ally chat
 * panel beside it. Numbers are placeholders chosen to tie with each other.
 */

type Segment = { id: string; name: string; size: number; growth: number; share: number; change: number }

/** Candle segments on Amazon, trailing 12 months: size $M, growth %, your share %, share change in points. */
const SEGMENTS: Segment[] = [
  { id: "jar", name: "Jar candles", size: 420, growth: 6, share: 21, change: 0.4 },
  { id: "gift", name: "Gift sets", size: 260, growth: 9, share: 17, change: -0.6 },
  { id: "pillar", name: "Pillar candles", size: 140, growth: -3, share: 24, change: 0.1 },
  { id: "melts", name: "Wax melts", size: 90, growth: 14, share: 6, change: 0.3 },
  { id: "soy", name: "Clean-burn soy", size: 120, growth: 22, share: 4, change: -0.2 },
  { id: "tins", name: "Travel tins", size: 40, growth: 3, share: 9, change: 0 },
]
const MARKET_GROWTH = 7 // category growth, splits the chart left/right
const SHARE_SPLIT = 12 // splits high/low share

/** Card copy is bullets of fragments, never sentences: a label, a number, a few words. */
function Points({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="mt-3 flex flex-col gap-1.5 text-sm text-slate-700">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2">
          <span className="mt-[7px] size-1 shrink-0 rounded-full bg-slate-400" />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  )
}
const Num = ({ children, bad }: { children: React.ReactNode; bad?: boolean }) => (
  <span className={cn("font-mono font-semibold", bad ? "text-error-600" : "text-slate-950")}>{children}</span>
)

const CARD = "flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-brand-300"

/* ------------------------------------------------------------------------- */
/* The 2x2: share against segment growth, bubble = segment size               */
/* ------------------------------------------------------------------------- */

function MarketMap({ selected, onSelect, compact = false }: { selected?: string; onSelect?: (id: string) => void; compact?: boolean }) {
  // Drawn at the size it shows, so labels stay 11–12px.
  const W = compact ? 300 : 480
  const H = compact ? 170 : 400
  // Both sizes carry real axes: a baseline, ticks and a title on each, so the quadrants read without explaining.
  const pad = compact ? { l: 42, r: 8, t: 8, b: 30 } : { l: 64, r: 24, t: 28, b: 54 }
  const xMin = -6, xMax = 26, yMin = 0, yMax = 30
  const x = (v: number) => pad.l + ((v - xMin) / (xMax - xMin)) * (W - pad.l - pad.r)
  const y = (v: number) => H - pad.b - ((v - yMin) / (yMax - yMin)) * (H - pad.t - pad.b)
  const r = (size: number) => Math.sqrt(size) * (compact ? 1.0 : 1.9)
  const fill = (c: number) => (c > 0.05 ? "var(--color-success-500)" : c < -0.05 ? "var(--color-error-500)" : "var(--color-slate-400)")
  const tick = compact ? "text-[10px]" : "text-[11px]"
  const title = compact ? "text-[10px]" : "text-[12px]"
  const quad = [
    { label: "Defend", x: x(xMin) + 10, y: y(yMax) + 18, anchor: "start" },
    { label: "Lead", x: x(xMax) - 10, y: y(yMax) + 18, anchor: "end" },
    { label: "Deprioritize", x: x(xMin) + 10, y: y(yMin) - 10, anchor: "start" },
    { label: "Attack", x: x(xMax) - 10, y: y(yMin) - 10, anchor: "end" },
  ] as const

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Your share against segment growth; bubble size is the segment's sales">
      {/* The attack quadrant is the one worth a tint: growing segments where you're small. */}
      <rect x={x(MARKET_GROWTH)} y={y(SHARE_SPLIT)} width={x(xMax) - x(MARKET_GROWTH)} height={y(yMin) - y(SHARE_SPLIT)} fill="var(--color-brand-50)" />
      <line x1={x(MARKET_GROWTH)} x2={x(MARKET_GROWTH)} y1={y(yMax)} y2={y(yMin)} stroke="var(--color-slate-300)" strokeDasharray="4 4" />
      <line x1={x(xMin)} x2={x(xMax)} y1={y(SHARE_SPLIT)} y2={y(SHARE_SPLIT)} stroke="var(--color-slate-300)" strokeDasharray="4 4" />
      {/* Axes */}
      <line x1={x(xMin)} x2={x(xMax)} y1={y(yMin)} y2={y(yMin)} stroke="var(--color-slate-400)" />
      <line x1={x(xMin)} x2={x(xMin)} y1={y(yMin)} y2={y(yMax)} stroke="var(--color-slate-400)" />
      {[0, 10, 20].map((v) => (
        <g key={`x${v}`}>
          <line x1={x(v)} x2={x(v)} y1={y(yMin)} y2={y(yMin) + 4} stroke="var(--color-slate-400)" />
          <text x={x(v)} y={y(yMin) + (compact ? 13 : 17)} textAnchor="middle" className={cn("fill-slate-500 font-mono", tick)}>
            {v}%
          </text>
        </g>
      ))}
      {(compact ? [0, 10, 20] : [0, 10, 20, 30]).map((v) => (
        <g key={`y${v}`}>
          <line x1={x(xMin) - 4} x2={x(xMin)} y1={y(v)} y2={y(v)} stroke="var(--color-slate-400)" />
          <text x={x(xMin) - 7} y={y(v) + 3.5} textAnchor="end" className={cn("fill-slate-500 font-mono", tick)}>
            {v}%
          </text>
        </g>
      ))}
      <text x={(pad.l + W - pad.r) / 2} y={H - (compact ? 3 : 12)} textAnchor="middle" className={cn("fill-slate-600 font-medium", title)}>
        {compact ? "Segment growth →" : "Segment growth vs last year →"}
      </text>
      <text
        x={compact ? 7 : 16}
        y={(pad.t + H - pad.b) / 2}
        textAnchor="middle"
        transform={`rotate(-90 ${compact ? 7 : 16} ${(pad.t + H - pad.b) / 2})`}
        className={cn("fill-slate-600 font-medium", title)}
      >
        {compact ? "Your share →" : "Your share of the segment →"}
      </text>
      {!compact &&
        quad.map((q) => (
          <text key={q.label} x={q.x} y={q.y} textAnchor={q.anchor} className="fill-slate-400 font-mono text-[11px] tracking-wide uppercase">
            {q.label}
          </text>
        ))}
      {!compact && (
        <text x={x(MARKET_GROWTH)} y={pad.t - 10} textAnchor="middle" className="fill-slate-400 text-[11px]">
          Category +{MARKET_GROWTH}%
        </text>
      )}
      {[...SEGMENTS].sort((a, b) => b.size - a.size).map((s) => {
        const active = selected === s.id
        return (
          <g key={s.id} onClick={() => onSelect?.(s.id)} className={cn(onSelect && "cursor-pointer")}>
            <circle cx={x(s.growth)} cy={y(s.share)} r={r(s.size)} fill={fill(s.change)} fillOpacity={active ? 0.9 : 0.55} stroke="white" strokeWidth={2} />
            {active && <circle cx={x(s.growth)} cy={y(s.share)} r={r(s.size) + 4} fill="none" stroke="var(--color-slate-900)" strokeWidth={1.5} />}
            {!compact && (
              <text x={x(s.growth)} y={y(s.share) - r(s.size) - 6} textAnchor="middle" className={cn("text-[12px]", active ? "fill-slate-950 font-semibold" : "fill-slate-700")}>
                {s.name}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

/* ------------------------------------------------------------------------- */
/* Home: the bottom row                                                        */
/* ------------------------------------------------------------------------- */

function ReadinessDot({ state }: { state: "ready" | "partial" | "risk" }) {
  return (
    <span
      className={cn(
        "inline-block size-2.5 rounded-full",
        state === "ready" && "bg-success-500",
        state === "partial" && "bg-warning-500",
        state === "risk" && "bg-error-500",
      )}
    />
  )
}

function HomeCards({ onOpen }: { onOpen: () => void }) {
  return (
    <section className="px-12 pt-10 pb-12">
      <div className="font-mono text-xs tracking-wide text-slate-500 uppercase">Grow beyond plan</div>
      <div className="mt-4 grid grid-cols-3 gap-4">
        <button type="button" onClick={onOpen} className={cn(CARD, "text-left")}>
          <div className="text-xs font-medium text-slate-500">Market</div>
          <div className="mt-2 rounded-lg bg-slate-25 px-2 py-1">
            <MarketMap compact selected="soy" />
          </div>
          <Points
            items={[
              <>
                Clean-burn soy <Num>+22%</Num>, fastest-growing
              </>,
              <>
                Your share <Num>4%</Num>
              </>,
            ]}
          />
          <span className="mt-auto pt-4 text-[15px] font-semibold text-brand-700">Win share in clean-burn soy →</span>
          <span className="mt-0.5 text-xs text-slate-500">
            About <span className="font-mono">+$340K</span> a year
          </span>
        </button>

        <div className={CARD}>
          <div className="text-xs font-medium text-slate-500">Competition</div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-lg font-semibold text-slate-950">Brightwick</span>
            <span className="text-sm text-slate-500">in gift sets</span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-slate-25 px-3 py-2.5 text-center">
            {[
              ["Price", "−20%"],
              ["Sponsored", "7 of 12"],
              ["Your share", "−0.6 pts"],
            ].map(([k, v]) => (
              <div key={k}>
                <div className={cn("font-mono text-sm font-semibold", v.startsWith("−") ? "text-error-600" : "text-slate-950")}>{v}</div>
                <div className="mt-0.5 text-[11px] text-slate-500">{k}</div>
              </div>
            ))}
          </div>
          <Points
            items={[
              <>
                Your gift sets now <Num>25%</Num> above Brightwick
              </>,
              <>Your branded terms still hold</>,
            ]}
          />
          <span className="mt-auto pt-4 text-[15px] font-semibold text-brand-700">Respond to Brightwick&apos;s price cut →</span>
          <span className="mt-0.5 text-xs text-slate-500">
            <span className="font-mono text-error-600">−$180K</span> at risk this quarter
          </span>
        </div>

        <div className={CARD}>
          <div className="text-xs font-medium text-slate-500">Event readiness</div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-lg font-semibold text-slate-950">Black Friday</span>
            <span className="text-sm text-slate-500">Nov 27 · 7 weeks</span>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2 rounded-lg bg-slate-25 px-3 py-2.5 text-center">
            {(
              [
                ["Content", "partial"],
                ["Stock", "risk"],
                ["Deals", "risk"],
                ["Media", "ready"],
              ] as const
            ).map(([k, st]) => (
              <div key={k} className="flex flex-col items-center gap-1.5">
                <ReadinessDot state={st} />
                <div className="text-[11px] text-slate-500">{k}</div>
              </div>
            ))}
          </div>
          <Points
            items={[
              <>
                Last year <Num bad>−$420K</Num>
              </>,
              <>
                No deal on <Num>6</Num> strong SKUs
              </>,
              <>Top sponsored slots lost to Brightwick</>,
              <>This year: stock and deals not set</>,
            ]}
          />
          <span className="mt-auto pt-4 text-[15px] font-semibold text-brand-700">Get ready for Black Friday →</span>
          <span className="mt-0.5 text-xs text-slate-500">
            <span className="font-mono">$1.1M</span> at stake
          </span>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------------- */
/* Market view + chat panel                                                    */
/* ------------------------------------------------------------------------- */

const PLAYS: Record<string, { plays: { who: string; what: string; value: string }[]; points: string[] }> = {
  soy: {
    points: [
      "Growing 3× the category",
      "Shoppers search \"clean burn\", \"non-toxic\", \"soy\"; your PDPs don't use those words",
      "Leaders: Brightwick 31%, Lumen & Co 18%",
      "Your $/oz 18% above median; one 8 oz pack",
    ],
    plays: [
      { who: "Ally for Content", what: "Rewrite 11 PDPs for clean-burn query language", value: "+$140K" },
      { who: "Ally for Media", what: "Bid the clean-burn term cluster (+$12K a month)", value: "+$95K" },
      { who: "Your team", what: "NPI brief: a 12 oz soy jar at the median $/oz", value: "+$105K" },
    ],
  },
}

function MarketView({ onBack }: { onBack: () => void }) {
  const [selected, setSelected] = useState("soy")
  const [chatOpen, setChatOpen] = useState(true)
  const s = SEGMENTS.find((x) => x.id === selected)!
  const detail = PLAYS[selected]

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto]">
      <div className="min-w-0 px-12 pt-8 pb-12">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
          <ArrowLeft className="size-4" />
          Back to home
        </button>
        <div className="mt-4 font-mono text-xs tracking-wide text-slate-500 uppercase">Your market · Candles on Amazon · last 12 months</div>
        <h1 className="mt-2 text-[28px] leading-tight font-bold tracking-tight text-slate-950">
          You lead jar candles. Clean-burn soy is the fastest-growing segment, and you hold 4% of it.
        </h1>
        <p className="mt-2 text-base text-slate-500">You&apos;re losing share in gift sets (−0.6 pts) to Brightwick&apos;s price cut.</p>

        <div className="mt-6 grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] gap-6">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <MarketMap selected={selected} onSelect={setSelected} />
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 px-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-success-500/70" /> Gaining share</span>
              <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-error-500/70" /> Losing share</span>
              <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-slate-400/70" /> Flat</span>
              <span className="ml-auto">Size = segment sales</span>
            </div>
          </div>

          <div className="flex flex-col rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 bg-slate-25 px-5 py-3.5">
              <div className="text-lg font-semibold text-slate-950">{s.name}</div>
              <div className="mt-1 grid grid-cols-3 gap-2 text-sm">
                {[
                  ["Segment", `$${s.size}M`],
                  ["Growth", `${s.growth > 0 ? "+" : ""}${s.growth}%`],
                  ["Your share", `${s.share}%`],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div className="font-mono font-semibold text-slate-950">{v}</div>
                    <div className="text-xs text-slate-500">{k}</div>
                  </div>
                ))}
              </div>
            </div>
            {detail ? (
              <div className="flex flex-1 flex-col gap-3 px-5 py-4 text-sm">
                <Points items={detail.points} />
                <div className="mt-1 text-xs font-medium text-slate-500">What Ally can do</div>
                {detail.plays.map((p) => (
                  <div key={p.what} className="flex items-start justify-between gap-3 border-t border-slate-100 pt-2.5">
                    <div>
                      <div className="text-slate-950">{p.what}</div>
                      <div className="text-xs text-slate-500">{p.who}</div>
                    </div>
                    <span className="font-mono font-semibold text-slate-950">{p.value}</span>
                  </div>
                ))}
                <div className="mt-auto flex flex-wrap gap-2 pt-3">
                  <button type="button" className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600">
                    Launch 2 plays · +$235K
                  </button>
                  <button type="button" className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50">
                    Draft the NPI brief
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-5 py-4 text-sm text-slate-500">In the mock, clean-burn soy has the full detail. Pick it on the chart.</div>
            )}
          </div>
        </div>
      </div>

      {chatOpen ? (
        <aside className="flex w-[380px] flex-col border-l border-slate-200 bg-slate-25">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-950">
              <Sparkles className="size-4 text-brand-600" /> Ask Ally
            </span>
            <button type="button" onClick={() => setChatOpen(false)} aria-label="Close chat" className="text-slate-400 hover:text-slate-700">
              <X className="size-4" />
            </button>
          </div>
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 text-sm">
            <span className="w-fit rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">About: {s.name}</span>
            <div className="ml-8 rounded-xl bg-brand-500 px-3.5 py-2.5 text-white">Who&apos;s taking share here, and what should we do?</div>
            <div className="flex flex-col gap-2.5 rounded-xl bg-white px-4 py-3.5 ring-1 ring-slate-200">
              <p className="font-semibold text-slate-950">Brightwick is. They hold 31% and 7 of 12 sponsored slots on clean-burn terms.</p>
              <p className="text-slate-700">
                The segment grew 22%, three times the category. You hold 4% because your PDPs don&apos;t use the words shoppers search, and your only pack is 18% above the median $/oz. Ruled out: availability (in stock all period) and ratings (4.6, above the segment).
              </p>
              <p className="text-slate-700">
                If nothing changes, you stay near <span className="font-mono">4%</span> while the segment adds about <span className="font-mono">$26M</span> next year.
              </p>
              <div className="mt-1 flex flex-col gap-1.5">
                {["Launch the content and media plays · +$235K", "Draft the NPI brief", "Break this down by competitor", "Watch this segment weekly"].map((a, i) => (
                  <button
                    key={a}
                    type="button"
                    className={cn(
                      "flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium",
                      i === 0 ? "bg-brand-500 text-white hover:bg-brand-600" : "bg-slate-50 text-slate-800 ring-1 ring-slate-200 hover:bg-white",
                    )}
                  >
                    {a}
                    <ArrowRight className="size-3.5" />
                  </button>
                ))}
              </div>
              <div className="mt-1 flex items-center gap-1.5 border-t border-slate-100 pt-2 text-[11px] text-slate-500">
                <Info className="size-3" /> Medium confidence: competitor sales are estimated from share and rank. Data as of Oct 8.
              </div>
            </div>
          </div>
          <div className="border-t border-slate-200 p-3">
            <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 ring-1 ring-slate-200">
              <span className="flex-1 text-sm text-slate-400">Ask a follow-up about {s.name.toLowerCase()}</span>
              <Send className="size-4 text-brand-500" />
            </div>
          </div>
        </aside>
      ) : (
        <button type="button" onClick={() => setChatOpen(true)} className="m-4 h-fit rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-md">
          <Sparkles className="mr-1.5 inline size-4" />
          Ask Ally
        </button>
      )}
    </div>
  )
}

export default function MockBrainPage() {
  const [view, setView] = useState<"home" | "market">("home")
  return (
    <PageShell className="bg-slate-50">
      <div className={cn("mx-auto overflow-hidden bg-white shadow-pane-lg sm:my-6 sm:rounded-2xl sm:ring-1 sm:ring-slate-900/6", PAGE_MAX)}>
        <div className="flex items-center justify-between border-b border-dashed border-slate-200 bg-warning-50 px-12 py-2 text-xs text-warning-800">
          <span>Mock for review · not wired to data</span>
          <span className="flex gap-3">
            <button type="button" onClick={() => setView("home")} className={cn(view === "home" && "font-semibold underline")}>
              1. Home, bottom row
            </button>
            <button type="button" onClick={() => setView("market")} className={cn(view === "market" && "font-semibold underline")}>
              2. Market view + chat
            </button>
          </span>
        </div>
        {view === "home" ? (
          <>
            <div className="px-12 pt-8 text-sm text-slate-400">… hero, bridge, captured value (unchanged) …</div>
            <HomeCards onOpen={() => setView("market")} />
          </>
        ) : (
          <MarketView onBack={() => setView("home")} />
        )}
      </div>
    </PageShell>
  )
}
