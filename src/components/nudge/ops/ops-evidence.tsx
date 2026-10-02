"use client"

import { useState } from "react"
import { Check, ChevronDown, Mail, Paperclip, Pencil, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { candleThumbnail } from "@/lib/candle-thumbnails"
import { opsSkus } from "../data"
import type { OpsBatch, SellerSku } from "../data"
import { Points } from "../points"
import { BuyBoxVisual } from "./buybox-visual"
import { IssueVisual, hasIssueVisual } from "./issue-visuals"

/** "Found by 3 skills · Show steps": what Ally ran to find and size the issue, collapsed by default. */
export function SkillsTrace({ skills }: { skills: NonNullable<OpsBatch["skills"]> }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="text-sm">
      <button type="button" onClick={() => setOpen((o) => !o)} className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900">
        <Check className="size-4 text-success-600" />
        Found by {skills.length} {skills.length === 1 ? "skill" : "skills"}
        <span className="text-slate-300">·</span>
        <span className="font-medium text-brand-700">{open ? "Hide steps" : "Show steps"}</span>
        <ChevronDown className={cn("size-3.5 text-brand-700 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <ol className="mt-2.5 flex flex-col gap-2 border-l-2 border-slate-100 pl-4">
          {skills.map((s, i) => (
            <li key={s.name} className="flex gap-2">
              <span className="font-mono text-xs text-slate-400">{i + 1}</span>
              <span>
                <span className="font-medium text-slate-950">{s.name}</span> <span className="text-slate-600">· {s.did}</span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

const usd = (v: number) => `$${v.toFixed(2)}`

/**
 * Buy-box evidence for one SKU: your offer against each seller (price, stock,
 * rating, buy-box wins), then the latest crawls with who held the box.
 */
export function SellerEvidence({ sku }: { sku: SellerSku }) {
  const cols = [{ name: "amazon.com", price: sku.price, stock: "In stock", rating: 0, wins: 12 - sku.sellers.reduce((n, s) => n + s.wins, 0), you: true }, ...sku.sellers.map((s) => ({ ...s, you: false }))]
  // Column count follows the sellers, so the template is inline (Tailwind can't build a dynamic class).
  const grid = "grid gap-x-4"
  const style = { gridTemplateColumns: `150px repeat(${cols.length}, minmax(0, 1fr))` }
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <div style={style} className={cn(grid, "border-b border-slate-100 bg-slate-25 px-5 py-3 text-sm font-semibold text-slate-950")}>
        <span className="text-xs font-medium text-slate-500">
          MAP floor <span className="font-mono">{usd(sku.map)}</span>
        </span>
        {cols.map((c) => (
          <span key={c.name}>
            {c.name}
            {c.you && <span className="ml-1.5 text-xs font-normal text-slate-500">you</span>}
          </span>
        ))}
      </div>
      {(
        [
          ["Price", (c: (typeof cols)[number]) => <span className={cn("font-mono", !c.you && c.price < sku.map && "font-semibold text-error-600")}>{usd(c.price)}</span>],
          ["Availability", (c: (typeof cols)[number]) => c.stock],
          ["Rating", (c: (typeof cols)[number]) => (c.rating ? `${c.rating} ★` : "–")],
          ["Buy box wins", (c: (typeof cols)[number]) => <span className={cn("font-mono font-semibold", c.you ? "text-error-600" : "text-slate-950")}>{c.wins} of 12</span>],
        ] as const
      ).map(([label, cell]) => (
        <div key={label} style={style} className={cn(grid, "border-t border-slate-100 px-5 py-2.5 text-sm first-of-type:border-t-0")}>
          <span className="text-slate-500">{label}</span>
          {cols.map((c) => (
            <span key={c.name} className="text-slate-700">
              {cell(c)}
            </span>
          ))}
        </div>
      ))}
      <div className="border-t border-slate-200 bg-slate-25 px-5 pt-3 pb-1 text-xs font-medium text-slate-500">Latest crawls · who held the buy box</div>
      {sku.crawls.map((cr) => (
        <div key={cr.when} style={style} className={cn(grid, "border-t border-slate-100 px-5 py-2 text-sm")}>
          <span className="text-slate-600">
            {cr.when}
            <span className="block text-[11px] text-slate-400">{cr.city}</span>
          </span>
          {cols.map((c) => (
            <span key={c.name} className="flex items-center">
              {cr.winner === c.name ? <Check className="size-4 text-success-600" /> : <X className="size-4 text-slate-300" />}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

/** The escalation Ally drafted, addressed and ready; Edit turns it into a text box. Placeholders fill from the item. */
export function EmailDraft({ email, fill }: { email: NonNullable<OpsBatch["email"]>; fill: Record<string, string> }) {
  const sub = (t: string) => t.replace(/\{(\w+)\}/g, (_, k) => fill[k] ?? "")
  const [editing, setEditing] = useState(false)
  const [body, setBody] = useState(sub(email.body))
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-25 px-5 py-3">
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-950">
          <Mail className="size-4 text-brand-600" /> Drafted by Ally · evidence attached
        </span>
        <button type="button" onClick={() => setEditing((e) => !e)} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-700">
          <Pencil className="size-3.5" /> {editing ? "Done" : "Edit"}
        </button>
      </div>
      <div className="px-5 py-4 text-sm">
        <div className="text-slate-500">
          To <span className="font-medium text-slate-950">{email.to}</span>, {email.role}
        </div>
        <div className="mt-1 font-medium text-slate-950">{sub(email.subject)}</div>
        {editing ? (
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={9}
            className="mt-3 w-full resize-y rounded-md border border-slate-200 bg-white px-3 py-2 text-sm leading-relaxed text-slate-950 outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
          />
        ) : (
          <p className="mt-3 leading-relaxed whitespace-pre-line text-slate-700">{body}</p>
        )}
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {["Crawl snapshots (12)", "Seller IDs", "Price history"].map((a) => (
            <span key={a} className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-slate-600">
              <Paperclip className="size-3" /> {a}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/** A SKU's header in the pane: thumbnail, ASIN, name. */
export function SkuHeader({ asin, name, label }: { asin: string; name: string; label?: string }) {
  return (
    <div className="flex items-center gap-4">
      <img src={candleThumbnail(asin)} alt={name} className="size-12 shrink-0 rounded-lg object-cover shadow-sm ring-1 ring-slate-200" />
      <div className="min-w-0">
        <div className="font-mono text-xs text-slate-500">
          {label ? `${label} · ` : ""}
          {asin}
        </div>
        <div className="mt-0.5 text-lg font-semibold tracking-tight text-slate-950">{name}</div>
      </div>
    </div>
  )
}

/** What Ally saw on one SKU: the seller comparison for buy-box issues, else its notes. */
export function SkuEvidence({ batch, asin }: { batch: OpsBatch; asin: string }) {
  const seller = batch.sellerSkus?.find((x) => x.asin === asin)
  // SKU by SKU, the same picture as the issue, with this SKU's own numbers.
  if (seller)
    return (
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <BuyBoxVisual sku={seller} />
      </div>
    )
  if (hasIssueVisual(batch))
    return (
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <IssueVisual batch={batch} asin={asin} />
      </div>
    )
  const sku = opsSkus(batch).find((x) => x.asin === asin)
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <div className="border-b border-slate-100 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-950">What Ally saw on this SKU</div>
      <div className="px-5 py-4">
        <Points items={sku?.note ?? []} />
      </div>
    </div>
  )
}
