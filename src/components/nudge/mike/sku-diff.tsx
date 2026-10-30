"use client"

import { cn } from "@/lib/utils"
import type { SkuInputSection, SkuSection } from "../types"
import { BackgroundComposer } from "./background-composer"
import { CONTENT_REASONS, EditFeedback, useLockedEdit } from "../edit-feedback"

/** Where an edit to Ally's text is saved, and what's said once it's locked. */
export interface SectionEdit {
  idPrefix: string
  subject: string
  author: string
  applies: string
}

/** Amazon's title limit, counted as Mike edits. */
const TITLE_LIMIT = 200

type Op<T> = { t: "same" | "del" | "add"; v: T }

/** Longest-common-subsequence diff: what stayed, what was removed, what was added, in order. */
function diff<T>(a: T[], b: T[], eq: (x: T, y: T) => boolean): Op<T>[] {
  const n = a.length
  const m = b.length
  const L = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0))
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = eq(a[i], b[j]) ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1])
  const out: Op<T>[] = []
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (eq(a[i], b[j])) {
      out.push({ t: "same", v: b[j] })
      i++
      j++
    } else if (L[i + 1][j] >= L[i][j + 1]) out.push({ t: "del", v: a[i++] })
    else out.push({ t: "add", v: b[j++] })
  }
  while (i < n) out.push({ t: "del", v: a[i++] })
  while (j < m) out.push({ t: "add", v: b[j++] })
  return out
}

/** Words compare without trailing punctuation, so "Jar" and "Jar," count as the same word. */
const norm = (w: string) => w.replace(/[,.;:]+$/, "").toLowerCase()
const words = (s: string) => s.split(/\s+/).filter(Boolean)

function Words({ ops, side }: { ops: Op<string>[]; side: "live" | "draft" }) {
  // Each side shows its own words: live keeps what was removed (struck), the draft keeps what was added (green).
  const visible = ops.filter((o) => o.t === "same" || (side === "live" ? o.t === "del" : o.t === "add"))
  // Merge runs of the same kind, so "Spooky Party Décor" is one green span, not three pills.
  const runs = visible.reduce<Op<string>[]>((acc, o) => {
    const last = acc[acc.length - 1]
    if (last && last.t === o.t) last.v += " " + o.v
    else acc.push({ ...o })
    return acc
  }, [])
  return (
    <>
      {runs.map((o, k) => (
        <span key={k}>
          {k > 0 && " "}
          <span
            className={cn(
              o.t === "del" && "text-slate-400 line-through",
              o.t === "add" && "rounded bg-success-50 px-0.5 font-medium text-success-800",
              o.t === "same" && "text-slate-950",
            )}
          >
            {o.v}
          </span>
        </span>
      ))}
    </>
  )
}

type Row = { kind: "same" | "del" | "add" | "edit"; ops?: Op<string>[]; text?: string }

/** Pair up lines: unchanged, removed, added, or changed (a removed line followed by its replacement). */
function lineRows(live: string[], draft: string[]): Row[] {
  const lines = diff(live, draft, (x, y) => x === y)
  const rows: Row[] = []
  for (let k = 0; k < lines.length; k++) {
    const cur = lines[k]
    const next = lines[k + 1]
    if (cur.t === "del" && next?.t === "add") {
      rows.push({ kind: "edit", ops: diff(words(cur.v), words(next.v), (x, y) => norm(x) === norm(y)) })
      k++
    } else rows.push({ kind: cur.t, text: cur.v })
  }
  return rows
}

/** One side of a text field: live shows kept (black) and removed (struck); Ally's shows kept and added (green). */
function TextSide({ rows, side }: { rows: Row[]; side: "live" | "draft" }) {
  return (
    <div className="flex flex-col gap-1.5 text-sm leading-relaxed">
      {rows
        .filter((r) => r.kind === "same" || r.kind === "edit" || (side === "live" ? r.kind === "del" : r.kind === "add"))
        .map((r, k) => (
          <p
            key={k}
            className={cn(
              r.kind === "del" && "text-slate-400 line-through",
              r.kind === "add" && "w-fit rounded bg-success-50 px-1 font-medium text-success-800",
              r.kind === "same" && "text-slate-950",
            )}
          >
            {r.kind === "edit" ? <Words ops={r.ops!} side={side} /> : r.text}
          </p>
        ))}
    </div>
  )
}

/** Bat silhouette for the Halloween pack shot. */
function Bat({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 28" className={className} fill="currentColor" aria-hidden>
      <path d="M32 8c1.5-3 2.5-4 3-6 .5 2 1 3 1.5 4 4-4 12-5 19-2 3 1 6 3 8.5 6-3-1-6-1-8 1 0 3-3 5-6 5-1-3-4-4-7-3-2 1-4 3-6 5-2-2-4-4-6-5-3-1-6 0-7 3-3 0-6-2-6-5-2-2-5-2-8-1C2.5 7 5.5 5 8.5 4c7-3 15-2 19 2 .5-1 1-2 1.5-4 .5 2 1.5 3 3 6z" />
    </svg>
  )
}

/** Pumpkin for the Halloween pack shot. */
function Pumpkin({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 36" className={className} aria-hidden>
      <path d="M19 6c0-3 1-5 4-6-2 2-2 4-2 6z" fill="#3f6212" />
      <ellipse cx="11" cy="21" rx="9" ry="13" fill="#ea580c" />
      <ellipse cx="29" cy="21" rx="9" ry="13" fill="#ea580c" />
      <ellipse cx="20" cy="21" rx="9" ry="14" fill="#f97316" />
      <path d="M13 17l4 3h-5zM27 17l-4 3h5zM13 26q7 5 14 0l-2 2-2-1-2 2-2-2-2 1z" fill="#1c1917" />
    </svg>
  )
}

/** The seasonal pack shot: the same product styled for Halloween (dusk grade, orange and black, pumpkins and bats). */
function HalloweenShot({ src, label }: { src?: string; label: string }) {
  return (
    <div className="relative h-40 overflow-hidden rounded-md bg-stone-900 ring-2 ring-success-300">
      <img src={src} alt={label} className="size-full object-cover brightness-[0.7] contrast-110 hue-rotate-[-20deg] saturate-150 sepia-[0.35]" />
      <div className="absolute inset-0 bg-gradient-to-b from-violet-950/60 via-transparent to-orange-600/50" />
      <Bat className="absolute top-3 right-3 w-9 text-stone-950" />
      <Bat className="absolute top-10 right-12 w-6 rotate-12 text-stone-950" />
      <Bat className="absolute top-12 left-4 w-5 -rotate-12 text-stone-950" />
      <Pumpkin className="absolute bottom-1.5 left-2 w-11" />
      <Pumpkin className="absolute bottom-1.5 left-12 w-7" />
      <Pumpkin className="absolute right-2 bottom-1.5 w-9" />
      <span className="absolute top-1.5 left-1.5 rounded bg-success-600 px-1.5 py-0.5 text-[11px] font-semibold whitespace-nowrap text-white shadow-xs">{label}</span>
    </div>
  )
}

/** A field only Mike can fill: what's live today, then a full-width box for his input. */
function InputField({ section }: { section: SkuInputSection }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-25 px-5 py-2.5">
        <span className="text-sm font-semibold text-slate-950">{section.label}</span>
        <span className="text-xs text-slate-500">Your input</span>
      </div>
      <div className="px-5 py-4">
        <div className="text-sm text-slate-500">
          Live on Amazon: <span className={section.live === "—" ? "text-slate-400" : "text-slate-700"}>{section.live}</span>
        </div>
        <textarea
          rows={2}
          placeholder={section.placeholder}
          className="mt-3 w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
        />
      </div>
    </div>
  )
}

/**
 * One text field: live on Amazon beside Ally's version. With `edit`, Mike can
 * change Ally's version and say why; once locked, his text stands in its place.
 */
function TextCard({ section, edit }: { section: Extract<SkuSection, { kind: "text" }>; edit?: SectionEdit }) {
  const ally = section.draft.map((d) => d.text)
  const id = edit ? `${edit.idPrefix}:${section.label}` : ""
  const locked = useLockedEdit(id)
  const draft = locked?.edit ? locked.edit.split("\n") : ally
  const rows = lineRows(section.live, draft)
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <div className="border-b border-slate-100 bg-slate-50 px-5 py-2.5 text-sm font-semibold text-slate-950">{section.label}</div>
      <div className="grid grid-cols-2 divide-x divide-slate-100">
        <div className="px-5 py-4">
          <div className="mb-2.5 font-mono text-[11px] tracking-wide text-slate-400 uppercase">Live on Amazon</div>
          <TextSide rows={rows} side="live" />
        </div>
        <div className="bg-brand-25/40 px-5 py-4">
          <div className="mb-2.5 font-mono text-[11px] tracking-wide text-brand-600 uppercase">{locked ? `${edit!.author.split(" ")[0]}'s edit` : "Ally wrote"}</div>
          <TextSide rows={rows} side="draft" />
        </div>
      </div>
      {edit && (
        <div className="border-t border-slate-100 px-5 py-3">
          <EditFeedback
            id={id}
            label={section.label.toLowerCase()}
            value={ally.join("\n")}
            multiline={ally.length > 1}
            limit={section.label === "Title" ? TITLE_LIMIT : undefined}
            reasons={CONTENT_REASONS}
            subject={edit.subject}
            author={edit.author}
            applies={edit.applies}
            placeholder={'Add details (optional), e.g. "Always lead with the wax type and burn time"'}
          />
        </div>
      )}
    </div>
  )
}

/** Every changed field for one SKU, live on Amazon beside Ally's version. */
export function SkuSections({ sections, thumbnailUrl, skuId, onNext, edit }: { sections: SkuSection[]; thumbnailUrl?: string; skuId?: string; onNext?: () => void; edit?: SectionEdit }) {
  return (
    <div className="flex flex-col gap-3">
      {sections.map((section, i) => {
        if (section.kind === "input") return <InputField key={i} section={section} />
        if (section.kind === "background") return <BackgroundComposer key={`${skuId}-${i}`} section={section} thumbnailUrl={thumbnailUrl} skuId={skuId ?? ""} onNext={onNext} />
        if (section.kind === "text") return <TextCard key={`${skuId}-${i}`} section={section} edit={edit} />
        return (
          <div key={i} className="overflow-hidden rounded-xl border border-slate-200">
            <div className="border-b border-slate-100 bg-slate-50 px-5 py-2.5 text-sm font-semibold text-slate-950">{section.label}</div>
            <div className="grid grid-cols-2 divide-x divide-slate-100">
              <div className="px-5 py-4">
                <div className="mb-2.5 font-mono text-[11px] tracking-wide text-slate-400 uppercase">Live on Amazon</div>
                <div className="relative h-40 overflow-hidden rounded-md bg-slate-100">
                  <img src={thumbnailUrl} alt={section.liveLabel} className="size-full object-cover" />
                  <span className="absolute bottom-1.5 left-1.5 rounded bg-white/90 px-1.5 py-0.5 text-[11px] font-medium text-slate-500 shadow-xs">
                    {section.liveLabel}
                  </span>
                </div>
              </div>
              <div className="bg-brand-25/40 px-5 py-4">
                <div className="mb-2.5 font-mono text-[11px] tracking-wide text-brand-600 uppercase">Ally wrote</div>
                <HalloweenShot src={thumbnailUrl} label={section.draftLabel} />
              </div>
            </div>
          </div>
        )
      })}
      {sections.some((sec) => sec.kind === "text" || sec.kind === "image") && (
      <div className="flex gap-4 px-1 text-xs text-slate-500">
        <span className="text-slate-400 line-through">Removed</span>
        <span className="text-slate-950">Kept</span>
        <span className="rounded bg-success-50 px-1 font-medium text-success-800">Added</span>
      </div>
      )}
    </div>
  )
}
