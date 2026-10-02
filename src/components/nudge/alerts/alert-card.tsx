"use client"

import { useEffect, useRef, useState } from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { ALERT_RULES, ALERT_TRENDS, BRAND_TERMS, CHANNELS, FREQUENCIES, GIFT_TERMS, MODE_LABEL, THRESHOLDS } from "./data"
import type { AlertMode, CustomAlert } from "./data"

/**
 * One alert, the same in chat and on the alerts page: what it watches with its
 * live number and trend, the rule as a sentence you can tap into, and the
 * autonomy it runs at as a three-step track (the waterfall's own words).
 */

export type Draft = Pick<CustomAlert, "threshold" | "mode" | "frequency" | "channel">
export const MODES: AlertMode[] = ["input", "approval", "autopilot"]
export const draftOf = (id: CustomAlert["id"]): Draft => ({ threshold: ALERT_RULES[id].threshold, mode: ALERT_RULES[id].mode, frequency: ALERT_RULES[id].frequency, channel: ALERT_RULES[id].channel })
export const modeLabel = (m: AlertMode, cap = 4) => (m === "autopilot" ? `On autopilot, up to $${cap}K a week` : MODE_LABEL[m])

/** Is the rule already true at today's number? */
export const isCrossed = (id: CustomAlert["id"], threshold: number) => (id === "brand-terms" ? NOW[id].value > threshold : NOW[id].value < threshold)

const NOW: Record<CustomAlert["id"], { value: number; label: string }> = {
  "brand-terms": { value: 27, label: "Brightwick today" },
  "gift-terms": { value: 18, label: "Our share today" },
}

export function AlertCard({
  id,
  draft,
  onChange,
  cap = 4,
  status,
  include,
  onInclude,
  locked,
  flash,
}: {
  id: CustomAlert["id"]
  draft: Draft
  onChange?: (patch: Partial<Draft>) => void
  cap?: number
  /** Overrides the computed status line. */
  status?: string
  /** In chat, a proposed alert can be left out. */
  include?: boolean
  onInclude?: (on: boolean) => void
  locked?: boolean
  flash?: boolean
}) {
  const rule = ALERT_RULES[id]
  const now = NOW[id]
  const off = locked || include === false
  const crossed = isCrossed(id, draft.threshold)
  return (
    <div className={cn("rounded-xl border bg-white px-5 py-4 transition-shadow", include === false ? "border-slate-200 opacity-60" : "border-slate-200", flash && "ring-4 ring-brand-100")}>
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-[15px] font-semibold text-slate-950">{rule.name}</span>
        <span className="text-[13px] text-slate-500">{status ?? (crossed ? "Already true · the media agent is on it" : "Not crossed today")}</span>
      </div>

      <div className="mt-3 flex items-center gap-6">
        <div className="shrink-0">
          <div className={cn("font-mono text-[28px] leading-none font-semibold", crossed ? "text-error-600" : "text-slate-950")}>{now.value}%</div>
          <div className="mt-1 text-[12px] text-slate-500">{now.label}</div>
        </div>
        <Trend values={ALERT_TRENDS[id]} threshold={draft.threshold} />
      </div>

      <p className="mt-3 text-[15px] leading-relaxed text-slate-700">
        {id === "brand-terms" ? (
          <>
            When any competitor passes <Editable value={`${draft.threshold}%`} options={THRESHOLDS.map((t) => `${t}%`)} onPick={(v) => onChange?.({ threshold: parseInt(v) })} disabled={off} /> share of voice on our <Terms list={BRAND_TERMS} label={`${BRAND_TERMS.length} brand terms`} />
          </>
        ) : (
          <>
            When our share of voice on <Terms list={GIFT_TERMS} label={`${GIFT_TERMS.length} gift terms`} /> drops below <Editable value={`${draft.threshold}%`} options={THRESHOLDS.map((t) => `${t}%`)} onPick={(v) => onChange?.({ threshold: parseInt(v) })} disabled={off} />
          </>
        )}
        , the media agent raises our bids, up to ${cap}K a week.
      </p>

      <div role="radiogroup" aria-label="When it fires" className="mt-3 grid grid-cols-3 overflow-hidden rounded-lg border border-slate-200 text-[13px]">
        {MODES.map((m, i) => (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={draft.mode === m}
            disabled={off}
            onClick={() => onChange?.({ mode: m })}
            className={cn("px-3 py-2 transition-colors", i > 0 && "border-l border-slate-200", draft.mode === m ? "bg-slate-100 font-semibold text-slate-950" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800")}
          >
            {MODE_LABEL[m].replace(/, up to.*$/, "")}
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between gap-4 text-[13px] text-slate-500">
        <span>
          Checks <Editable value={draft.frequency} options={[...FREQUENCIES]} onPick={(v) => onChange?.({ frequency: v as Draft["frequency"] })} disabled={off} /> · sends to{" "}
          <Editable value={draft.channel} options={[...CHANNELS]} onPick={(v) => onChange?.({ channel: v as Draft["channel"] })} disabled={off} />
        </span>
        {onInclude && (
          <label className="flex cursor-pointer items-center gap-1.5 text-slate-700">
            <input type="checkbox" checked={include} disabled={locked} onChange={(e) => onInclude(e.target.checked)} className="size-4 accent-brand-500" />
            Include
          </label>
        )}
      </div>
    </div>
  )
}

/** The number over 8 weeks against its threshold (dashed), on a fixed 0–40% scale. */
function Trend({ values, threshold }: { values: number[]; threshold: number }) {
  const W = 320
  const H = 56
  const y = (v: number) => 4 + (1 - v / 40) * (H - 8)
  const x = (i: number) => (i / (values.length - 1)) * (W - 36)
  const last = values.length - 1
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-14 min-w-0 flex-1" role="img" aria-label={`Last 8 weeks: ${values[0]}% to ${values[last]}%, against a ${threshold}% line`}>
      <line x1={0} x2={W - 36} y1={y(threshold)} y2={y(threshold)} stroke="#94a3b8" strokeDasharray="3 3" />
      <text x={W - 30} y={y(threshold) + 4} fontSize={11} fill="#94a3b8" fontFamily="var(--font-mono)">
        {threshold}%
      </text>
      <polyline points={values.map((v, i) => `${x(i)},${y(v)}`).join(" ")} fill="none" stroke="#dc2626" strokeWidth={2} strokeLinejoin="round" />
      <circle cx={x(last)} cy={y(values[last])} r={3.5} fill="#dc2626" />
    </svg>
  )
}

/** A value in a sentence you can tap to change: dashed underline, no sticker. */
export function Editable({ value, options, onPick, disabled }: { value: string; options: string[]; onPick: (v: string) => void; disabled?: boolean }) {
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
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className={cn("border-b border-dashed font-medium transition-colors", disabled ? "border-transparent text-slate-800" : "border-slate-400 text-slate-950 hover:border-brand-500 hover:text-brand-700")}
      >
        {value}
      </button>
      {open && (
        <span role="listbox" className="absolute top-full left-0 z-30 mt-1.5 flex w-max min-w-full flex-col rounded-xl border border-slate-200 bg-white p-1 leading-normal shadow-[0_12px_32px_-12px_rgba(15,23,42,0.3)]">
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
    <span title={list.join(", ")} className="cursor-help text-slate-950 underline decoration-slate-300 decoration-dotted underline-offset-4">
      {label}
    </span>
  )
}

/** Reads a typed change: which alert ("brand", "gift", else both), and what to set. */
export function editFromText(text: string): { ids: CustomAlert["id"][]; patch: Partial<Draft> } | null {
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
