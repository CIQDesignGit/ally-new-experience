"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Bell, Check, ChevronDown, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { useNudge } from "../nudge-context"
import { useChat } from "../chat/inline-chat"
import { PRIMARY, SECONDARY } from "../mike/buttons"
import { ALERT_RULES, BID_CAPS, BRAND_TERMS, CHANNELS, FREQUENCIES, GIFT_DRILL, GIFT_TERMS, IROAS, MICHELLE_LIMIT, MODE_LABEL, THRESHOLDS } from "./data"
import type { AlertMode, CustomAlert } from "./data"
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

      <div>
        <div className="text-[13px] font-medium text-slate-950">Why traffic fell</div>
        <ul className="mt-1.5 flex flex-col gap-1 text-[14px]">
          <li>· Brightwick has run 30% off gift sets since Prime Day.</li>
          <li>
            · Brightwick is bidding on our brand terms: <b className="font-semibold text-slate-950">27% share of voice</b>, up from 8%.
          </li>
          <li>
            · Brightwick is outbidding us on gift terms: <b className="font-semibold text-slate-950">our share is 18%</b>, down from 25%.
          </li>
        </ul>
        <div className="mt-1.5 text-[13px] text-slate-500">Ruled out: stock (99% in stock), content (no changes), ratings (steady at 4.6).</div>
      </div>

      <div className="rounded-xl border border-brand-200 bg-brand-25 px-5 py-4">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-brand-700 uppercase">
          <Sparkles className="size-3.5" /> Recommended
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
        {(Object.keys(ALERT_RULES) as CustomAlert["id"][]).map((id) => {
          const d = drafts[id]
          const off = !!decided || !pick[id]
          return (
            <div key={id} className={cn("flex items-start gap-3 rounded-xl border bg-white px-4 py-3.5 transition-shadow", pick[id] ? "border-brand-300" : "border-slate-200 opacity-60", flash.includes(id) && "ring-4 ring-brand-100")}>
              <input type="checkbox" aria-label={ALERT_RULES[id].name} checked={pick[id]} disabled={!!decided} onChange={(e) => setPick((p) => ({ ...p, [id]: e.target.checked }))} className="mt-1.5 size-4 shrink-0 accent-brand-500" />
              <p className="text-[15px] leading-[2.1] text-slate-700">
                {id === "brand-terms" ? (
                  <>
                    When any competitor gets more than <Pick value={`${d.threshold}%`} options={THRESHOLDS.map((t) => `${t}%`)} onPick={(v) => set(id, { threshold: parseInt(v) })} disabled={off} /> share of voice on our <Terms list={BRAND_TERMS} label={`${BRAND_TERMS.length} brand terms`} />
                  </>
                ) : (
                  <>
                    When our share of voice on <Terms list={GIFT_TERMS} label={`${GIFT_TERMS.length} gift terms`} /> drops below <Pick value={`${d.threshold}%`} options={THRESHOLDS.map((t) => `${t}%`)} onPick={(v) => set(id, { threshold: parseInt(v) })} disabled={off} />
                  </>
                )}
                , the media agent raises our bids: <Pick value={modeLabel(d.mode, cap)} options={MODES.map((m) => modeLabel(m, cap))} onPick={(v) => set(id, { mode: MODES[MODES.map((m) => modeLabel(m, cap)).indexOf(v)] })} disabled={off} />. Check{" "}
                <Pick value={d.frequency} options={[...FREQUENCIES]} onPick={(v) => set(id, { frequency: v as Draft["frequency"] })} disabled={off} /> and send it to <Pick value={d.channel} options={[...CHANNELS]} onPick={(v) => set(id, { channel: v as Draft["channel"] })} disabled={off} />.
              </p>
            </div>
          )
        })}
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
  return (
    <div className="flex max-w-[640px] flex-col gap-3 text-[15px] leading-relaxed text-slate-700">
      <div className="flex flex-col gap-1.5">
        {ids.map((id) => (
          <div key={id} className="flex items-center gap-2 text-[14px]">
            <Bell className="size-4 text-brand-600" />
            <span className="font-semibold text-slate-950">{ALERT_RULES[id].name}</span>
            <span className="text-slate-500">
              · {modeLabel(drafts[id].mode, cap)} · {drafts[id].frequency} · {drafts[id].channel}
            </span>
          </div>
        ))}
      </div>
      <p>
        {ids.length === 1 ? "It's" : "Both are"} already true today, and the media agent is on {ids.length === 1 ? "it" : "them"}. I&apos;ll alert you if {ids.length === 1 ? "it's" : "they're"} still true on Oct 15, or sooner if {ids.length === 1 ? "it gets" : "either gets"} worse.{" "}
        <Link href="/michelle/alerts" className="font-medium text-brand-700 hover:underline">
          See your alerts
        </Link>
      </p>
    </div>
  )
}

type Draft = Pick<CustomAlert, "threshold" | "mode" | "frequency" | "channel">
const MODES: AlertMode[] = ["input", "approval", "autopilot"]
const draftOf = (id: CustomAlert["id"]): Draft => ({ threshold: ALERT_RULES[id].threshold, mode: ALERT_RULES[id].mode, frequency: ALERT_RULES[id].frequency, channel: ALERT_RULES[id].channel })
export const modeLabel = (m: AlertMode, cap = 4) => (m === "autopilot" ? `On autopilot, up to ${k$(cap)} a week` : MODE_LABEL[m])

/** Reads a typed change: which alert ("brand", "gift", else both), and what to set. */
function editFromText(text: string): { ids: CustomAlert["id"][]; patch: Partial<Draft> } | null {
  const t = text.toLowerCase()
  const patch: Partial<Draft> = {}
  const pct = t.match(/(\d{1,2})\s*(%|percent)/)
  if (pct) patch.threshold = Math.min(50, Math.max(5, parseInt(pct[1])))
  if (/autopilot/.test(t)) patch.mode = "autopilot"
  else if (/approv/.test(t)) patch.mode = "approval"
  else if (/\binput\b|alert me|just (tell|alert)/.test(t)) patch.mode = "input"
  if (/twice/.test(t)) patch.frequency = "twice a day"
  else if (/week/.test(t) && !/a week/.test(t)) patch.frequency = "weekly"
  else if (/morning|daily|every day/.test(t)) patch.frequency = "every morning"
  if (/slack/.test(t) && /email/.test(t)) patch.channel = "your email and Slack"
  else if (/slack/.test(t)) patch.channel = "Slack"
  else if (/inbox/.test(t)) patch.channel = "your Ally inbox"
  else if (/e-?mail/.test(t)) patch.channel = "your email"
  if (!Object.keys(patch).length) return null
  const ids: CustomAlert["id"][] = /brand/.test(t) && !/gift/.test(t) ? ["brand-terms"] : /gift/.test(t) && !/brand/.test(t) ? ["gift-terms"] : ["brand-terms", "gift-terms"]
  return { ids, patch }
}

/** A value inside a sentence you can tap to change, like Ally's own words. */
function Pick({ value, options, onPick, disabled }: { value: string; options: string[]; onPick: (v: string) => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false)
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [open])
  return (
    <span ref={ref} className="relative inline-block">
      <button type="button" disabled={disabled} onClick={() => setOpen(!open)} aria-expanded={open} className={cn("inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-medium", disabled ? "text-slate-700" : "bg-brand-50 text-brand-700 hover:bg-brand-100")}>
        {value}
        {!disabled && <ChevronDown className="size-3.5" />}
      </button>
      {open && (
        <span role="listbox" className="absolute top-full left-0 z-30 mt-1 flex w-max min-w-full flex-col rounded-xl border border-slate-200 bg-white p-1 leading-normal shadow-[0_12px_32px_-12px_rgba(15,23,42,0.3)]">
          {options.map((o) => (
            <button
              key={o}
              type="button"
              role="option"
              aria-selected={o === value}
              onClick={() => {
                onPick(o)
                setOpen(false)
              }}
              className="flex items-center justify-between gap-4 rounded-lg px-3 py-1.5 text-left text-[14px] text-slate-800 hover:bg-slate-50"
            >
              {o}
              {o === value && <Check className="size-3.5 text-brand-600" />}
            </button>
          ))}
        </span>
      )}
    </span>
  )
}

/** The terms, listed on hover: chosen in settings, not in a sentence. */
function Terms({ list, label }: { list: string[]; label: string }) {
  return (
    <span title={list.join(", ")} className="cursor-help underline decoration-slate-300 decoration-dotted underline-offset-4">
      {label}
    </span>
  )
}
