"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Bell, Check, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { useNudge } from "../nudge-context"
import { useChat } from "../chat/inline-chat"
import { PRIMARY, SECONDARY } from "../mike/buttons"
import { ALERT_RULES, BID_CAPS, BRAND_TERM_SOV, BRAND_TERMS, GIFT_DRILL, GIFT_PRICES, GIFT_TERM_SOV, GIFT_TERMS, IROAS, MICHELLE_LIMIT } from "./data"
import type { CustomAlert } from "./data"
import { AlertCard, draftOf, editFromText, isCrossed, modeLabel } from "./alert-card"
import type { Draft } from "./alert-card"
import { TYPED_EVENT } from "../chat/inline-chat"

/**
 * The gift-sets drill, as the orchestrator works it: what happened, the one
 * factor that explains it, why, and one recommended action. Approving hands the
 * task to the media agent; the alerts Ally then proposes come from the task's
 * own goal (the two 20% lines), and nothing is created until Michelle says so.
 */

const k$ = (n: number) => `$${Number.isInteger(n) ? n : n.toFixed(1)}K`
const back = (cap: number) => Math.round(cap * IROAS)

export function GiftSetsAnswer() {
  const { turns, ask } = useChat()
  const [cap, setCap] = useState<number>(4)
  const [coupon, setCoupon] = useState(false)
  const sent = turns.find((t) => t.chip.startsWith("Approve") || t.chip.startsWith("Send to James"))
  const needsJames = cap > MICHELLE_LIMIT

  return (
    <div className="flex max-w-[860px] flex-col gap-5 text-[15px] leading-relaxed text-slate-700">
      <p className="text-[17px] font-semibold text-slate-950">Gift-set sales are down 14% year over year over the last 4 weeks. Traffic is the cause: it fell 12%.</p>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-baseline justify-between">
          <span className="text-[13px] font-medium text-slate-950">Gift sets, weekly, vs last year</span>
          <span className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <i className="h-0.5 w-4 rounded bg-slate-700" /> Sales
            </span>
            <span className="flex items-center gap-1.5">
              <i className="h-0.5 w-4 rounded bg-brand-500" /> Traffic
            </span>
          </span>
        </div>
        <TrendChart />
        <div className="mt-4 flex items-stretch gap-2 border-t border-slate-100 pt-4 text-center">
          {GIFT_DRILL.drivers.map((d, i) => (
            <div key={d.label} className="flex flex-1 items-center gap-2">
              {i > 0 && <span className="font-mono text-sm text-slate-400">{i === 1 ? "=" : "×"}</span>}
              <div className={cn("flex-1 rounded-lg px-3 py-2", d.cause ? "bg-brand-25 ring-1 ring-brand-300" : "bg-slate-25")}>
                <div className={cn("font-mono text-[18px] font-semibold", d.value.startsWith("−") ? "text-error-600" : "text-slate-950")}>{d.value}</div>
                <div className={cn("text-xs", d.cause ? "font-semibold text-brand-700" : "text-slate-500")}>{d.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why, in three moves: each row is the claim and its number; click to jump to its proof below. */}
      <div>
        <div className="text-[13px] font-medium text-slate-950">Why traffic fell: Brightwick came at us three ways</div>
        <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {WHYS.map((w, i) => (
            <button
              key={w.id}
              type="button"
              onClick={() => document.getElementById(`why-${w.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className={cn("grid w-full grid-cols-[20px_minmax(0,1fr)_auto_auto] items-baseline gap-x-3 px-4 py-3 text-left hover:bg-slate-25", i > 0 && "border-t border-slate-100")}
            >
              <span className="text-[13px] text-slate-400 tabular-nums">{i + 1}</span>
              <span className="text-[15px] text-slate-950">{w.claim}</span>
              <span className="text-[14px] text-slate-600 tabular-nums">{w.figure}</span>
              <Change v={w.change} unit={w.unit} />
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <Why id="price" n={1} title="They undercut us on price: 30% off their gift set, $7 below ours.">
          <div className="grid grid-cols-2 gap-3">
            <PriceTile who="Brightwick" name={GIFT_PRICES.them.name} list={GIFT_PRICES.them.list} price={GIFT_PRICES.them.promo} />
            <PriceTile who="Us" name={GIFT_PRICES.us.name} price={GIFT_PRICES.us.price} ours />
          </div>
        </Why>

        <Why id="brand" n={2} title="They're conquering our brand terms: 27% share of voice, up from 8%.">
          <SovTable rows={BRAND_TERM_SOV} label="All 6 brand keywords" />
        </Why>

        <Why id="gift" n={3} title="They outbid us on high-traffic gift terms: our share is 18%, down from 25%.">
          <SovTable rows={GIFT_TERM_SOV} label="All 5 gift keywords" />
        </Why>

        <div className="text-[13px] text-slate-500">Ruled out: stock (99% in stock), content (no changes), ratings (steady at 4.6).</div>
      </div>

      {/* The answer to the price cut; the bids below answer the other two. */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4">
        <div className="min-w-0">
          <div className="text-xs font-medium text-slate-500">Answers 1 · price</div>
          <div className="mt-0.5 text-[15px] font-semibold text-slate-950">A 15% coupon on our 3 gift sets through Nov 30: $29.74, within $2 of Brightwick</div>
        </div>
        {coupon ? (
          <span className="inline-flex items-center gap-1.5 text-[14px] font-medium text-success-700">
            <Check className="size-4" /> Coupon approved
          </span>
        ) : (
          <button type="button" onClick={() => setCoupon(true)} className={SECONDARY}>
            Approve the coupon
          </button>
        )}
      </div>

      <div className="rounded-xl border border-brand-200 bg-brand-25 px-5 py-4">
        <div className="flex items-center gap-2 text-xs font-medium text-brand-700">
          <Sparkles className="size-3.5" /> Answers 2 and 3 · share of voice
        </div>
        <p className="mt-1.5 text-[15px] font-semibold text-slate-950">
          {`Raise bids on our ${BRAND_TERMS.length} brand and ${GIFT_TERMS.length} gift terms until we're back above 20% share of voice.`}
        </p>
        <div className="mt-1 text-[14px] text-slate-600">
          Cap {k$(cap)} a week · about {k$(back(cap))} a week back at the media agent&apos;s ${IROAS.toFixed(2)} IROAS
        </div>
        {sent ? (
          <div className="mt-3 inline-flex items-center gap-1.5 text-[14px] font-medium text-success-700">
            <Check className="size-4" /> {sent.chip.startsWith("Send") ? "Sent to James" : "Approved"}
          </div>
        ) : (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => ask(needsJames ? jamesChip(cap) : approveChip(cap))} className={PRIMARY}>
              {needsJames ? "Send to James to approve" : "Approve for media agent"}
            </button>
            <span className="flex items-center gap-1 text-[13px] text-slate-500">
              Cap
              {BID_CAPS.map((c) => (
                <button key={c} type="button" onClick={() => setCap(c)} aria-pressed={cap === c} className={cn("rounded-md px-2 py-1 font-mono", cap === c ? "bg-white font-semibold text-slate-950 ring-1 ring-slate-300" : "hover:bg-white/70")}>
                  {k$(c)}
                </button>
              ))}
            </span>
            {needsJames && <span className="text-[13px] text-slate-500">Above your {k$(MICHELLE_LIMIT)} a week limit</span>}
          </div>
        )}
      </div>
    </div>
  )
}

function Why({ id, n, title, children }: { id: string; n: number; title: string; children: React.ReactNode }) {
  return (
    <div id={`why-${id}`} className="scroll-mt-24">
      <div className="mb-2 flex items-baseline gap-2 text-[14px] text-slate-800">
        <span className="text-[13px] text-slate-400 tabular-nums">{n}</span>
        {title}
      </div>
      {children}
    </div>
  )
}

/** A change, colored by direction: up green, down red. */
function Change({ v, unit = "pts" }: { v: number; unit?: string }) {
  return <span className={cn("text-[13px] font-medium whitespace-nowrap tabular-nums", v < 0 ? "text-error-600" : "text-success-700")}>{`${v > 0 ? "▲" : "▼"} ${Math.abs(v)}${unit === "%" ? "%" : ` ${unit}`}`}</span>
}

/** The three moves, in the order the proof follows. */
const WHYS = [
  { id: "price", claim: "They undercut us on price", figure: "$27.99 vs our $34.99", change: -30, unit: "%" },
  { id: "brand", claim: "They're conquering our brand terms", figure: "Brightwick 27% share", change: 19, unit: "pts" },
  { id: "gift", claim: "They outbid us on high-traffic gift terms", figure: "Our share 18%", change: -7, unit: "pts" },
]

const $ = (n: number) => `$${n.toFixed(2)}`

function PriceTile({ who, name, list, price, ours }: { who: string; name: string; list?: number; price: number; ours?: boolean }) {
  return (
    <div className={cn("rounded-xl border px-4 py-3", ours ? "border-brand-200 bg-white" : "border-slate-200 bg-white")}>
      <div className="text-xs font-medium text-slate-500">{who}</div>
      <div className="mt-0.5 truncate text-[13px] text-slate-700">{name}</div>
      <div className="mt-1.5 flex items-baseline gap-2 font-mono">
        {list && <s className="text-[14px] text-slate-400">{$(list)}</s>}
        <span className={cn("text-[20px] font-semibold", ours ? "text-slate-950" : "text-error-600")}>{$(price)}</span>
        {list && <span className="font-sans text-[12px] font-medium text-error-600">{Math.round((1 - price / list) * 100)}% off</span>}
      </div>
    </div>
  )
}

/** Share of voice by keyword, ours and Brightwick's, each with its change over 4 weeks (up green, down red); the last row is the average the headline quotes. */
function SovTable({ rows, label }: { rows: { term: string; them: number; us: number; was: { them: number; us: number } }[]; label: string }) {
  const avg = (get: (r: (typeof rows)[number]) => number) => Math.round(rows.reduce((n, r) => n + get(r), 0) / rows.length)
  const cell = (now: number, was: number) => (
    <span className="inline-flex items-baseline justify-end gap-2">
      <span className="font-mono">{now}%</span>
      <span className="w-12 text-left">
        <Change v={now - was} />
      </span>
    </span>
  )
  return (
    <table className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white text-[14px]">
      <thead>
        <tr className="text-left text-[12px] text-slate-500">
          <th className="px-4 py-2 font-medium">Keyword</th>
          <th className="w-[170px] px-4 py-2 text-right font-medium">Our share · 4 wk change</th>
          <th className="w-[210px] px-4 py-2 text-right font-medium">Brightwick&apos;s share · change</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.term} className="border-t border-slate-100">
            <td className="px-4 py-2 text-slate-800">{r.term}</td>
            <td className="px-4 py-2 text-right text-slate-950">{cell(r.us, r.was.us)}</td>
            <td className="px-4 py-2 text-right text-slate-950">{cell(r.them, r.was.them)}</td>
          </tr>
        ))}
        <tr className="border-t border-slate-200 bg-slate-25 font-semibold">
          <td className="px-4 py-2 text-slate-950">{label}</td>
          <td className="px-4 py-2 text-right text-slate-950">{cell(avg((r) => r.us), avg((r) => r.was.us))}</td>
          <td className="px-4 py-2 text-right text-slate-950">{cell(avg((r) => r.them), avg((r) => r.was.them))}</td>
        </tr>
      </tbody>
    </table>
  )
}

/** Sales and traffic, % vs last year, on one axis; Prime Day marked. */
function TrendChart() {
  const W = 760
  const H = 180
  const pad = { l: 36, r: 64, t: 14, b: 26 }
  const min = -16
  const max = 12
  const x = (i: number) => pad.l + (i / (GIFT_DRILL.weeks.length - 1)) * (W - pad.l - pad.r)
  const y = (v: number) => pad.t + ((max - v) / (max - min)) * (H - pad.t - pad.b)
  const line = (vals: number[]) => vals.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ")
  const last = GIFT_DRILL.weeks.length - 1
  const pd = x(GIFT_DRILL.primeDayWeek)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full" role="img" aria-label="Gift-set sales and traffic, weekly, percent vs last year: both fell from about +10% in the Prime Day week to −14% and −12%">
      {[10, 0, -10].map((v) => (
        <g key={v}>
          <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} stroke={v === 0 ? "#94a3b8" : "#f1f5f9"} strokeWidth={1} />
          <text x={pad.l - 8} y={y(v) + 4} textAnchor="end" fontSize={11} fill="#94a3b8" fontFamily="var(--font-mono)">
            {v > 0 ? `+${v}%` : v < 0 ? `−${-v}%` : "0"}
          </text>
        </g>
      ))}
      <line x1={pd} x2={pd} y1={pad.t} y2={H - pad.b} stroke="#cbd5e1" strokeDasharray="3 3" />
      <text x={pd + 5} y={pad.t + 8} fontSize={11} fill="#64748b">
        Prime Day
      </text>
      <path d={line(GIFT_DRILL.traffic)} fill="none" stroke="#875bf7" strokeWidth={2} strokeLinejoin="round" />
      <path d={line(GIFT_DRILL.sales)} fill="none" stroke="#334155" strokeWidth={2} strokeLinejoin="round" />
      {GIFT_DRILL.sales.map((v, i) => (
        <g key={i}>
          <rect x={x(i) - 14} y={pad.t} width={28} height={H - pad.t - pad.b} fill="transparent">
            <title>{`Week of ${GIFT_DRILL.weeks[i]}: sales ${v < 0 ? "−" : "+"}${Math.abs(v)}%, traffic ${GIFT_DRILL.traffic[i] < 0 ? "−" : "+"}${Math.abs(GIFT_DRILL.traffic[i])}%`}</title>
          </rect>
        </g>
      ))}
      <circle cx={x(last)} cy={y(GIFT_DRILL.sales[last])} r={4} fill="#334155" stroke="#fff" strokeWidth={2} />
      <circle cx={x(last)} cy={y(GIFT_DRILL.traffic[last])} r={4} fill="#875bf7" stroke="#fff" strokeWidth={2} />
      <text x={x(last) + 9} y={y(GIFT_DRILL.sales[last]) + 4} fontSize={12} fontWeight={600} fill="#334155" fontFamily="var(--font-mono)">
        −14%
      </text>
      <text x={x(last) + 9} y={y(GIFT_DRILL.traffic[last]) - 2} fontSize={12} fontWeight={600} fill="#6d3fd9" fontFamily="var(--font-mono)">
        −12%
      </text>
      {[0, GIFT_DRILL.primeDayWeek + 3, 8, last].map((i) => (
        <text key={i} x={x(i)} y={H - 6} textAnchor="middle" fontSize={11} fill="#94a3b8">
          {GIFT_DRILL.weeks[i]}
        </text>
      ))}
    </svg>
  )
}

function approveChip(cap: number) {
  return { q: `Approve: raise bids, ${k$(cap)} a week cap`, render: () => <MediaTaskAnswer cap={cap} /> }
}
function jamesChip(cap: number) {
  return { q: `Send to James: raise bids, ${k$(cap)} a week cap`, render: () => <MediaTaskAnswer cap={cap} viaJames /> }
}

/** The handoff, visible: which agent, what task, its stop rule, when it reports back. Then the alerts its goal implies, as drafts. */
function MediaTaskAnswer({ cap, viaJames }: { cap: number; viaJames?: boolean }) {
  const { turns, ask } = useChat()
  const [pick, setPick] = useState<Record<CustomAlert["id"], boolean>>({ "brand-terms": true, "gift-terms": true })
  const [drafts, setDrafts] = useState<Record<CustomAlert["id"], Draft>>(() => ({ "brand-terms": draftOf("brand-terms"), "gift-terms": draftOf("gift-terms") }))
  const [flash, setFlash] = useState<CustomAlert["id"][]>([])
  const decided = turns.find((t) => t.chip.startsWith("Create") || t.chip === "Not now")
  const chosen = (Object.keys(pick) as CustomAlert["id"][]).filter((id) => pick[id])
  const set = (id: CustomAlert["id"], patch: Partial<Draft>) => setDrafts((d) => ({ ...d, [id]: { ...d[id], ...patch } }))

  // Typed changes ("make the brand one 25%", "send them to Slack") land on the sentences in place.
  useEffect(() => {
    if (decided) return
    const onTyped = (e: Event) => {
      const hit = editFromText((e as CustomEvent<string>).detail)
      if (!hit) return
      e.preventDefault()
      setDrafts((d) => {
        const next = { ...d }
        for (const id of hit.ids) next[id] = { ...next[id], ...hit.patch }
        return next
      })
      setFlash(hit.ids)
      window.setTimeout(() => setFlash([]), 1200)
    }
    window.addEventListener(TYPED_EVENT, onTyped)
    return () => window.removeEventListener(TYPED_EVENT, onTyped)
  }, [decided])

  return (
    <div className="flex max-w-[760px] flex-col gap-4 text-[15px] leading-relaxed text-slate-700">
      <p className="font-semibold text-slate-950">{viaJames ? "Sent to James to approve. The media agent starts as soon as he does." : "Media agent is at work."}</p>

      <dl className="grid grid-cols-[110px_minmax(0,1fr)] gap-x-4 gap-y-1.5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[14px]">
        <dt className="text-slate-500">Assigned to</dt>
        <dd className="font-medium text-slate-950">Media agent{viaJames ? ", once James approves" : ""}</dd>
        <dt className="text-slate-500">Task</dt>
        <dd className="text-slate-950">
          Raise bids on {BRAND_TERMS.length + GIFT_TERMS.length} terms, up to {k$(cap)} a week
        </dd>
        <dt className="text-slate-500">Stops when</dt>
        <dd className="text-slate-950">Our gift-term share is above 20% and Brightwick is below 20% on our brand terms</dd>
        <dt className="text-slate-500">Bids live</dt>
        <dd className="text-slate-950">{viaJames ? "Within the hour of James's approval" : "Within the hour"}</dd>
        <dt className="text-slate-500">Reports back</dt>
        <dd className="text-slate-950">Tomorrow, 9 AM, then daily</dd>
        <dt className="text-slate-500">Approved by</dt>
        <dd className="text-slate-950">{viaJames ? `James (above your ${k$(MICHELLE_LIMIT)} a week limit)` : `Michelle, within her ${k$(MICHELLE_LIMIT)} a week limit`}</dd>
      </dl>

      <p className="pt-1">Want me to watch this going forward? I&apos;d set two alerts, on the same two lines the task is working to.</p>
      <div className="flex flex-col gap-2">
        {(Object.keys(ALERT_RULES) as CustomAlert["id"][]).map((id) => (
          <AlertCard
            key={id}
            id={id}
            draft={drafts[id]}
            onChange={(patch) => set(id, patch)}
            cap={cap}
            include={pick[id]}
            onInclude={(on) => setPick((p) => ({ ...p, [id]: on }))}
            locked={!!decided}
            flash={flash.includes(id)}
          />
        ))}
      </div>
      {!decided && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={!chosen.length}
            onClick={() => ask({ q: `Create ${chosen.length === 1 ? "the alert" : `${chosen.length} alerts`}`, render: () => <AlertsCreatedAnswer ids={chosen} drafts={drafts} cap={cap} /> })}
            className={cn(PRIMARY, !chosen.length && "pointer-events-none opacity-50")}
          >
            Create {chosen.length === 1 ? "alert" : `${chosen.length} alerts`}
          </button>
          <button type="button" onClick={() => ask({ q: "Not now", render: () => <p className="text-[15px] text-slate-700">OK, no alerts. The media agent still reports back tomorrow at 9 AM.</p> })} className={SECONDARY}>
            Not now
          </button>
        </div>
      )}
    </div>
  )
}

// One save per alert per page load, even when React mounts the answer twice in development.
const saved = new Set<string>()

/** Saved, and quiet for now: both lines are already crossed, but the media agent is on them, so Ally waits a week before alerting. */
function AlertsCreatedAnswer({ ids, drafts, cap }: { ids: CustomAlert["id"][]; drafts: Record<CustomAlert["id"], Draft>; cap: number }) {
  const { addAlert } = useNudge()
  useEffect(() => {
    for (const id of ids) {
      if (saved.has(id)) continue
      saved.add(id)
      addAlert({ ...ALERT_RULES[id], ...drafts[id], created: new Date().toISOString(), seen: false })
    }
  }, [ids, drafts, addAlert])
  // What each rule reads today, so a rule that's already true says so in its row.
  const today: Record<CustomAlert["id"], string> = { "brand-terms": "Brightwick is at 27%", "gift-terms": "our share is 18%" }
  const short = (id: CustomAlert["id"], t: number) => (id === "brand-terms" ? `Any competitor above ${t}% share on ${BRAND_TERMS.length} brand terms` : `Our share below ${t}% on ${GIFT_TERMS.length} gift terms`)
  const cap1 = (t: string) => t.charAt(0).toUpperCase() + t.slice(1)
  return (
    <div className="max-w-[720px] overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <span className="inline-flex items-center gap-2 text-[15px] font-semibold text-slate-950">
          <Check className="size-4 text-success-600" />
          {ids.length === 1 ? "Alert on" : `${ids.length} alerts on`}
        </span>
        <Link href="/michelle/alerts" className="text-[13px] font-medium text-brand-700 hover:underline">
          See your alerts
        </Link>
      </div>
      {ids.map((id, i) => {
        const d = drafts[id]
        const hot = isCrossed(id, d.threshold)
        return (
          <div key={id} className={cn("grid grid-cols-[16px_minmax(0,1fr)_auto] gap-x-3 px-5 py-3.5", i > 0 && "border-t border-slate-100")}>
            <Bell className="mt-0.5 size-4 text-brand-600" />
            <div className="min-w-0">
              <div className="text-[14px] font-semibold text-slate-950">{ALERT_RULES[id].name}</div>
              <div className="mt-0.5 text-[13px] text-slate-500">{short(id, d.threshold)}</div>
              {hot && <div className="mt-1 text-[13px] font-medium text-warning-700">True now: {today[id]}</div>}
            </div>
            <div className="text-right">
              <div className="text-[13px] font-medium text-slate-950">{modeLabel(d.mode, cap)}</div>
              <div className="mt-0.5 text-[13px] text-slate-500">
                {cap1(d.frequency)} · {d.channel.replace("your ", "")}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

