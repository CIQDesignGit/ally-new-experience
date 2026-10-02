import type { SellerSku } from "../data"

/**
 * The buy box problem as a picture, for the lead SKU: where every seller's price
 * sits against your MAP floor, then who won the last 12 crawls. Color carries one
 * meaning each: purple is you, slate is the other sellers, red is only the MAP
 * violation and the loss it causes.
 */

const SELLER_TONES = ["#475569", "#94a3b8"] // slate-600, slate-400
const YOU = "#7c3aed" // brand
const LOSS = "#dc2626" // error-600

const usd = (v: number) => `$${v.toFixed(2)}`

export function BuyBoxVisual({ sku }: { sku: SellerSku }) {
  const lowest = Math.min(...sku.sellers.map((s) => s.price))
  const below = sku.sellers.filter((s) => s.price < sku.map)
  const yourWins = 12 - sku.sellers.reduce((n, s) => n + s.wins, 0)
  const facts = [
    { figure: `${yourWins} of 12`, label: "crawls you won", loss: yourWins === 0 },
    { figure: `−${usd(sku.price - lowest)}`, label: "under your price", loss: true },
    { figure: String(below.length), label: below.length === 1 ? "seller below MAP" : "sellers below MAP" },
  ]

  return (
    <div className="flex flex-col">
      {/* Facts: one row, the same left edge as everything under it. */}
      <div className="grid grid-cols-3 border-b border-slate-100">
        {facts.map((f, i) => (
          <div key={f.label} className={i > 0 ? "border-l border-slate-100 px-5 py-3" : "px-5 py-3"}>
            <div className="font-mono text-[17px] font-semibold tabular-nums" style={{ color: f.loss ? LOSS : "#0f172a" }}>
              {f.figure}
            </div>
            <div className="mt-0.5 text-xs text-slate-500">{f.label}</div>
          </div>
        ))}
      </div>

      <div className="px-5 pt-3.5 pb-4">
        <div className="text-sm font-semibold text-slate-950">
          Offers vs MAP <span className="font-normal text-slate-500">· {sku.name}</span>
        </div>
        <PriceLadder sku={sku} />

        <div className="mt-3 text-sm font-semibold text-slate-950">Buy box, last 12 crawls</div>
        <CrawlStrip sku={sku} />
      </div>
    </div>
  )
}

/** One price axis: the zone below MAP shaded red, a dot per offer, labels under. */
function PriceLadder({ sku }: { sku: SellerSku }) {
  const W = 640
  const lo = Math.floor(Math.min(...sku.sellers.map((s) => s.price)) - 3)
  const hi = Math.ceil(sku.price + 3)
  const x = (v: number) => 12 + ((v - lo) / (hi - lo)) * (W - 24)
  const axis = 44
  // Sellers at the same price share one dot and one stacked label.
  const groups = Object.values(
    sku.sellers.reduce<Record<string, { price: number; names: { name: string; tone: string }[] }>>((m, s, i) => {
      const k = s.price.toFixed(2)
      ;(m[k] ??= { price: s.price, names: [] }).names.push({ name: s.name, tone: SELLER_TONES[i] ?? SELLER_TONES[1] })
      return m
    }, {}),
  )
  return (
    <svg viewBox={`0 0 ${W} 112`} className="mt-1 w-full" role="img" aria-label={`MAP ${usd(sku.map)}; you ${usd(sku.price)}; ${sku.sellers.map((s) => `${s.name} ${usd(s.price)}`).join(", ")}`}>
      <rect x={x(lo)} y={axis - 14} width={x(sku.map) - x(lo)} height={28} rx={4} fill="#fef2f2" />
      <text x={x(lo) + 8} y={axis - 20} fontSize={12} fill={LOSS} fontWeight={500}>
        Below your MAP floor
      </text>
      <line x1={x(lo)} x2={x(hi)} y1={axis} y2={axis} stroke="#cbd5e1" />
      <line x1={x(sku.map)} x2={x(sku.map)} y1={axis - 22} y2={axis + 18} stroke={LOSS} strokeWidth={1.5} strokeDasharray="4 3" />
      <text x={x(sku.map)} y={axis + 34} textAnchor="middle" fontSize={12} fill={LOSS} fontWeight={600} fontFamily="var(--font-mono)">
        MAP {usd(sku.map)}
      </text>
      {groups.map((g) => (
        <g key={g.price}>
          <circle cx={x(g.price)} cy={axis} r={7} fill={g.names[0].tone} stroke="#fff" strokeWidth={2} />
          <text x={x(g.price)} y={axis + 34} textAnchor="middle" fontSize={12} fill="#0f172a" fontWeight={600} fontFamily="var(--font-mono)">
            {usd(g.price)}
          </text>
          {g.names.map((n, i) => (
            <text key={n.name} x={x(g.price)} y={axis + 50 + i * 15} textAnchor="middle" fontSize={12} fill="#64748b">
              {n.name}
            </text>
          ))}
        </g>
      ))}
      <circle cx={x(sku.price)} cy={axis} r={8} fill={YOU} stroke="#fff" strokeWidth={2} />
      <text x={x(sku.price)} y={axis + 34} textAnchor="middle" fontSize={12} fill={YOU} fontWeight={700} fontFamily="var(--font-mono)">
        {usd(sku.price)}
      </text>
      <text x={x(sku.price)} y={axis + 50} textAnchor="middle" fontSize={12} fill={YOU} fontWeight={600}>
        You
      </text>
    </svg>
  )
}

/** Twelve cells, one per crawl, in the winner's color; a legend with each seller's count. */
function CrawlStrip({ sku }: { sku: SellerSku }) {
  const yours = 12 - sku.sellers.reduce((n, s) => n + s.wins, 0)
  const who = [{ name: "You", tone: YOU, wins: yours }, ...sku.sellers.map((s, i) => ({ name: s.name, tone: SELLER_TONES[i] ?? SELLER_TONES[1], wins: s.wins }))]
  // Spread the smaller winners through the strip rather than bunching them at one end.
  const cells: string[] = Array(12).fill(who[1]?.tone ?? YOU)
  let slot = 3
  for (const w of who.filter((_, i) => i !== 1))
    for (let n = 0; n < w.wins; n++) {
      cells[slot % 12] = w.tone
      slot += 5
    }
  return (
    <>
      <div className="mt-2.5 grid grid-cols-12 gap-1">
        {cells.map((c, i) => (
          <div key={i} className="h-7 rounded" style={{ background: c }} />
        ))}
      </div>
      <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
        {who.map((w) => (
          <span key={w.name} className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm" style={{ background: w.tone }} />
            {w.name} <span className="font-mono font-semibold text-slate-950 tabular-nums">{w.wins}</span>
          </span>
        ))}
      </div>
    </>
  )
}
