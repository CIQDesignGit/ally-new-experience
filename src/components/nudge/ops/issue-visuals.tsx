/* eslint-disable @next/next/no-img-element -- local demo thumbnails */
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
    <div className="px-5 py-4">
      <div className="text-sm font-semibold text-slate-950">
        {title}
        {sub && <span className="font-normal text-slate-500"> · {sub}</span>}
      </div>
      <div className="mt-3">{children}</div>
      {line && <div className="mt-3 border-t border-slate-100 pt-3 text-sm text-slate-600 tabular-nums">{line}</div>}
    </div>
  )
}

const short = (name: string) => name.replace(/^Aurelle /, "").split(",")[0]

/** Issue types that have a picture; the rest keep the evidence list. */
export const hasIssueVisual = (b: OpsBatch) => ["promo-badge", "deal-page", "oos", "shipping", "chargebacks", "shorted-pos"].includes(b.id)

export function IssueVisual({ batch }: { batch: OpsBatch }) {
  switch (batch.id) {
    case "promo-badge":
      return <BadgeVisual batch={batch} />
    case "deal-page":
      return <DealPageVisual batch={batch} />
    case "oos":
      return <StockVisual batch={batch} />
    case "shipping":
      return <ShippingVisual batch={batch} />
    case "chargebacks":
    case "shorted-pos":
      return <ClaimsVisual batch={batch} />
    default:
      return null
  }
}

/** One Amazon price tile: without the deal showing, or with it. */
function Tile({ asin, label, deal }: { asin: string; label: string; deal: boolean }) {
  return (
    <div className="min-w-0">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-1.5 flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
        <img src={candleThumbnail(asin)} alt="" className="size-14 shrink-0 rounded-md object-cover ring-1 ring-slate-200" />
        <div className="min-w-0">
          {deal ? (
            <span className="inline-block rounded bg-slate-900 px-1.5 py-0.5 text-[11px] font-semibold text-white">Halloween deal · 20% off</span>
          ) : (
            <span className="inline-block rounded border border-dashed border-slate-300 px-1.5 py-0.5 text-[11px] text-slate-400">No badge</span>
          )}
          <div className="mt-1 flex items-baseline gap-2 tabular-nums">
            <span className="text-[17px] font-semibold text-slate-950">$30.40</span>
            {deal ? <span className="text-xs text-slate-500 line-through">List $38.00</span> : <span className="text-xs text-slate-400">no list price shown</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

/** The price tile as shoppers see it now, and as the live deal should show it. */
function BadgeVisual({ batch }: { batch: OpsBatch }) {
  const asin = batch.exampleSku
  return (
    <Frame title="What shoppers see" sub={short(batch.exampleName)} line={<>Deal live Oct 1–31 · badge and strike-through missing on <span className="font-semibold text-slate-950">{batch.skus} SKUs</span></>}>
      <div className="grid grid-cols-2 gap-4">
        <Tile asin={asin} label="Now" deal={false} />
        <Tile asin={asin} label="With the deal showing" deal />
      </div>
    </Frame>
  )
}

/** Pages 1–4 of the deals page and "not listed", with each SKU where it is. */
function DealPageVisual({ batch }: { batch: OpsBatch }) {
  const slots = ["Page 1", "Page 2", "Page 3", "Page 4", "Not listed"]
  const where = (note: string[]) => {
    const page = note.join(" ").match(/page (\d)/)?.[1]
    return page ? Number(page) - 1 : 4
  }
  const list = batch.skuList ?? []
  return (
    <Frame title="Where your deals appear" sub="Amazon deals page" line={<>Deal-page traffic is <span className="font-semibold text-slate-950">40%</span> of event sales</>}>
      <div className="grid grid-cols-5 gap-2">
        {slots.map((label, i) => {
          const here = list.filter((s) => where(s.note) === i)
          return (
            <div key={label} className="flex flex-col">
              <div className={i === 4 ? "text-xs font-medium text-slate-950" : "text-xs text-slate-500"}>{label}</div>
              <div className="mt-1.5 flex min-h-[64px] flex-wrap content-start gap-1.5 rounded-lg border border-slate-200 bg-slate-25 p-2">
                {here.map((s) => (
                  <img key={s.asin} src={candleThumbnail(s.asin)} alt={s.name} title={s.name} className="size-9 rounded-md object-cover ring-1 ring-slate-200" />
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
function StockVisual({ batch }: { batch: OpsBatch }) {
  const lead = batch.skuList?.find((s) => s.asin === batch.exampleSku) ?? batch.skuList?.[0]
  const units = lead?.note[0]?.match(/[\d,]+/)?.[0] ?? ""
  const share = lead?.note[1]?.match(/\d+%/)?.[0] ?? ""
  return (
    <Frame title="Stock vs the page" sub={short(batch.exampleName)} line={<>Unavailable in <span className="font-semibold text-slate-950">{share}</span> of crawls · offer suppressed Sep 30</>}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs font-medium text-slate-500">At your DC</div>
          <div className="mt-1.5 rounded-lg border border-slate-200 p-3">
            <div className="text-[22px] font-semibold text-slate-950 tabular-nums">{units}</div>
            <div className="text-xs text-slate-500">units on hand</div>
          </div>
        </div>
        <div>
          <div className="text-xs font-medium text-slate-500">On Amazon</div>
          <div className="mt-1.5 flex items-center gap-3 rounded-lg border border-slate-200 p-3">
            <img src={candleThumbnail(batch.exampleSku)} alt="" className="size-10 shrink-0 rounded-md object-cover opacity-60 ring-1 ring-slate-200" />
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
function ShippingVisual({ batch }: { batch: OpsBatch }) {
  const lead = batch.skuList?.find((s) => s.asin === batch.exampleSku) ?? batch.skuList?.[0]
  const [ours, prime] = (lead?.note[0]?.match(/[\d.]+/g) ?? ["0", "0"]).map(Number)
  const max = Math.ceil(ours + 0.5)
  const rows = [
    { label: "Prime", days: prime, tone: "bg-slate-400", ink: "text-slate-950" },
    { label: "You", days: ours, tone: "bg-brand-500", ink: "text-brand-700" },
  ]
  return (
    <Frame title="Delivery promise" sub={short(batch.exampleName)} line={<>Slower in <span className="font-semibold text-slate-950">8 of 12</span> ZIPs sampled</>}>
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
