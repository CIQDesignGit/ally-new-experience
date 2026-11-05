/* eslint-disable @next/next/no-img-element -- local demo thumbnails */
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { candleThumbnail } from "@/lib/candle-thumbnails"
import type { OpsBatch } from "../data"

/**
 * One picture per issue type, in the same frame as the buy box ladder: a title
 * with the lead SKU, the picture, then one line of proof. Purple is you, slate
 * is neutral, amber is only what waits on your team. No red: the pane's daily
 * loss is the red.
 */

function Frame({ title, sub, line, children }: { title: string; sub?: string; line?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col">
      <div className="border-b border-slate-100 bg-slate-50 px-5 py-3">
        <div className="text-sm font-semibold text-slate-950">
          {title}
          {sub && <span className="font-normal text-slate-500"> · {sub}</span>}
        </div>
      </div>
      <div className="px-5 py-4">{children}</div>
      {line && <div className="border-t border-slate-100 bg-slate-25 px-5 py-3 text-sm leading-snug text-slate-600 tabular-nums">{line}</div>}
    </div>
  )
}

const short = (name: string) => name.replace(/^Aurelle /, "").split(",")[0]

/** Issue types that have a picture; the rest keep the evidence list. */
export const hasIssueVisual = (b: OpsBatch) => ["promo-badge", "deal-page", "oos", "shipping", "chargebacks", "shorted-pos"].includes(b.id)

/** The SKU a picture is about: the one asked for, else the issue's lead example. */
const skuOf = (batch: OpsBatch, asin?: string) => {
  const list = batch.skuList ?? []
  return list.find((x) => x.asin === (asin ?? batch.exampleSku)) ?? list[0] ?? { asin: batch.exampleSku, name: batch.exampleName, note: [] as string[] }
}

/** The issue as a picture: for the lead SKU on the issue, or for one SKU when reviewing SKU by SKU. */
export function IssueVisual({ batch, asin }: { batch: OpsBatch; asin?: string }) {
  switch (batch.id) {
    case "promo-badge":
      return <BadgeVisual batch={batch} asin={asin} />
    case "deal-page":
      return <DealPageVisual batch={batch} asin={asin} />
    case "oos":
      return <StockVisual batch={batch} asin={asin} />
    case "shipping":
      return <ShippingVisual batch={batch} asin={asin} />
    case "chargebacks":
    case "shorted-pos":
      return <ClaimsVisual batch={batch} />
    default:
      return null
  }
}

type TileTone = "problem" | "goal"

/** One Amazon price tile: without the deal showing, or with it. */
function Tile({
  asin,
  label,
  labelTone,
  deal,
  badge,
  price,
  list,
  tone,
}: {
  asin: string
  label: string
  labelTone?: TileTone
  deal: boolean
  badge: boolean
  price: number
  list: number
  tone: TileTone
}) {
  const showPromoBadge = deal || badge
  return (
    <div className="min-w-0">
      <div className={cn("text-xs font-semibold", labelTone === "problem" ? "text-warning-800" : labelTone === "goal" ? "text-slate-950" : "text-slate-500")}>{label}</div>
      <div
        className={cn(
          "mt-2 flex items-center gap-3 rounded-lg p-3",
          tone === "problem" ? "border border-warning-200 bg-warning-50/50" : "border border-slate-200 bg-white shadow-xs",
        )}
      >
        <img src={candleThumbnail(asin)} alt="" className="size-14 shrink-0 rounded-md object-cover ring-1 ring-slate-200" />
        <div className="min-w-0">
          {showPromoBadge ? (
            <span className="inline-block rounded bg-slate-900 px-1.5 py-0.5 text-[11px] font-semibold whitespace-nowrap text-white">Halloween deal · 20% off</span>
          ) : (
            <span className="inline-block rounded border border-dashed border-warning-300 bg-white px-1.5 py-0.5 text-[11px] font-medium whitespace-nowrap text-warning-800">No badge</span>
          )}
          <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2 tabular-nums">
            <span className="text-lg font-semibold whitespace-nowrap text-slate-950">${price.toFixed(2)}</span>
            {deal ? (
              <span className="text-xs whitespace-nowrap text-slate-500 line-through">List ${list.toFixed(2)}</span>
            ) : (
              <span className="text-xs whitespace-nowrap text-slate-500">no list price shown</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/** List prices for the deal SKUs; the deal is 20% off. */
const LIST: Record<string, number> = { B08NF9KBZ4: 38, B00FLYWNYQ: 38, B0BCM08080: 16 }

/** The price tile as shoppers see it now, and as the live deal should show it. */
function BadgeVisual({ batch, asin }: { batch: OpsBatch; asin?: string }) {
  const sku = skuOf(batch, asin)
  const list = LIST[sku.asin] ?? 38
  const price = +(list * 0.8).toFixed(2)
  // Some SKUs show the badge but not the strike-through: only what's missing is missing.
  const badgeShows = !sku.note.some((n) => /badge not showing/i.test(n))
  return (
    <Frame
      title="What shoppers see"
      sub={short(sku.name)}
      line={asin ? <>Deal live Oct 1–31 · {badgeShows ? "strike-through missing" : "badge and strike-through missing"}</> : <>Deal live Oct 1–31 · badge and strike-through missing on <span className="font-semibold whitespace-nowrap text-slate-950">{batch.skus} SKUs</span></>}
    >
      <div className="@container">
        <div className="grid grid-cols-1 items-stretch gap-4 @md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] @md:items-center @md:gap-3">
          <Tile asin={sku.asin} label="Now" labelTone="problem" tone="problem" deal={false} badge={badgeShows} price={price} list={list} />
          <ArrowRight className="mx-auto hidden size-5 shrink-0 text-slate-300 @md:block" aria-hidden />
          <Tile asin={sku.asin} label="With the deal showing" labelTone="goal" tone="goal" deal badge price={price} list={list} />
        </div>
      </div>
    </Frame>
  )
}

/** Pages 1–4 of the deals page and "not listed", with each SKU where it is. */
function DealPageVisual({ batch, asin }: { batch: OpsBatch; asin?: string }) {
  const slots = ["Page 1", "Page 2", "Page 3", "Page 4", "Not listed"]
  const where = (note: string[]) => {
    const page = note.join(" ").match(/page (\d)/)?.[1]
    return page ? Number(page) - 1 : 4
  }
  const list = batch.skuList ?? []
  return (
    <Frame title="Where your deals appear" sub={asin ? short(skuOf(batch, asin).name) : "Amazon deals page"} line={<>Deal-page traffic is <span className="font-semibold text-slate-950">40%</span> of event sales</>}>
      <div className="grid grid-cols-5 gap-2">
        {slots.map((label, i) => {
          const here = list.filter((s) => where(s.note) === i)
          return (
            <div key={label} className="flex flex-col">
              <div className={i === 4 ? "text-xs font-medium text-slate-950" : "text-xs text-slate-500"}>{label}</div>
              <div className="mt-1.5 flex min-h-[64px] flex-wrap content-start gap-1.5 rounded-lg bg-slate-50 p-2">
                {here.map((s) => (
                  <img key={s.asin} src={candleThumbnail(s.asin)} alt={s.name} title={s.name} className={cn("size-9 rounded-md object-cover", asin === s.asin ? "ring-2 ring-brand-500" : asin ? "opacity-40 ring-1 ring-slate-200" : "ring-1 ring-slate-200")} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </Frame>
  )
}

/** Stock on hand beside what the page tells shoppers. */
function StockVisual({ batch, asin }: { batch: OpsBatch; asin?: string }) {
  const lead = skuOf(batch, asin)
  const units = lead?.note[0]?.match(/[\d,]+/)?.[0] ?? ""
  const share = lead?.note[1]?.match(/\d+%/)?.[0] ?? ""
  return (
    <Frame title="Stock vs the page" sub={short(lead.name)} line={<>Unavailable in <span className="font-semibold text-slate-950">{share}</span> of crawls{lead.note[2] ? ` · ${lead.note[2].charAt(0).toLowerCase()}${lead.note[2].slice(1)}` : ""}</>}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs font-medium text-slate-500">At your DC</div>
          <div className="mt-1.5 rounded-lg bg-slate-50 p-3">
            <div className="text-[22px] font-semibold text-slate-950 tabular-nums">{units}</div>
            <div className="text-xs text-slate-500">units on hand</div>
          </div>
        </div>
        <div>
          <div className="text-xs font-medium text-slate-500">On Amazon</div>
          <div className="mt-1.5 flex items-center gap-3 rounded-lg bg-slate-50 p-3">
            <img src={candleThumbnail(lead.asin)} alt="" className="size-10 shrink-0 rounded-md object-cover opacity-60 ring-1 ring-slate-200" />
            <div>
              <div className="text-[15px] font-semibold text-slate-950">Currently unavailable.</div>
              <div className="text-xs text-slate-500">No buy button</div>
            </div>
          </div>
        </div>
      </div>
    </Frame>
  )
}

/** The delivery promise in days: the Prime bar against yours. */
function ShippingVisual({ batch, asin }: { batch: OpsBatch; asin?: string }) {
  const lead = skuOf(batch, asin)
  const zips = lead.note[1]?.match(/(\d+) of (\d+)/)
  const [ours, prime] = (lead?.note[0]?.match(/[\d.]+/g) ?? ["0", "0"]).map(Number)
  const max = Math.ceil(ours + 0.5)
  const rows = [
    { label: "Prime", days: prime, tone: "bg-slate-400", ink: "text-slate-950" },
    { label: "You", days: ours, tone: "bg-brand-500", ink: "text-brand-700" },
  ]
  return (
    <Frame title="Delivery promise" sub={short(lead.name)} line={<>Slower in <span className="font-semibold text-slate-950">{zips ? `${zips[1]} of ${zips[2]}` : "8 of 12"}</span> ZIPs sampled</>}>
      <div className="flex flex-col gap-2">
        {rows.map((r) => (
          <div key={r.label} className="grid grid-cols-[48px_minmax(0,1fr)_72px] items-center gap-3">
            <span className={`text-sm font-medium ${r.ink}`}>{r.label}</span>
            {/* No track: the bar's length alone is the number. */}
            <div className="h-3">
              <div className={`h-3 rounded-full ${r.tone}`} style={{ width: `${(r.days / max) * 100}%` }} />
            </div>
            <span className={`text-right text-sm font-semibold tabular-nums ${r.ink}`}>{r.days} days</span>
          </div>
        ))}
      </div>
    </Frame>
  )
}

/** Every claim Ally drafted: ready to file, and the ones waiting on your team. */
function ClaimsVisual({ batch }: { batch: OpsBatch }) {
  const total = batch.skus
  const need = batch.inputCount ?? 0
  const ready = total - need
  const noun = batch.id === "chargebacks" ? "disputes" : "claims"
  return (
    <Frame title={`${total} ${noun} drafted by Ally`} line={batch.evidence[1]}>
      <div className="flex h-3 gap-0.5 overflow-hidden rounded-full">
        <div className="bg-brand-500" style={{ flex: ready }} />
        <div className="bg-warning-400" style={{ flex: need }} />
      </div>
      <div className="mt-2 flex justify-between text-sm tabular-nums">
        <span className="text-slate-600">
          <span className="font-semibold text-slate-950">{ready}</span> ready to file
        </span>
        <span className="text-slate-600">
          <span className="font-semibold text-warning-700">{need}</span> {batch.id === "chargebacks" ? "need your proof" : "need shipped quantities"}
        </span>
      </div>
    </Frame>
  )
}
