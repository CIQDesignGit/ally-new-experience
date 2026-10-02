import type { SellerSku } from "../data"

/**
 * The buy box problem as one picture, for the lead SKU: where every offer sits
 * against your MAP floor, then one line on who won the last 12 crawls. Purple is
 * you, slate the other sellers; no red here (the pane's daily loss is the red).
 */

const SELLER = "#64748b" // slate-500: the other sellers
const YOU = "#7c3aed" // brand
const INK = "#334155" // slate-700: the MAP line and its label

const usd = (v: number) => `$${v.toFixed(2)}`

export function BuyBoxVisual({ sku }: { sku: SellerSku }) {
  const yours = 12 - sku.sellers.reduce((n, s) => n + s.wins, 0)
  return (
    <div className="px-5 py-4">
      <div className="text-sm font-semibold text-slate-950">
        Offers vs MAP <span className="font-normal text-slate-500">· {sku.name}</span>
      </div>
      <PriceLadder sku={sku} />
      <div className="mt-3 border-t border-slate-100 pt-3 text-sm text-slate-600 tabular-nums">
        You won <span className="font-semibold text-slate-950">{yours} of the last 12</span> crawls
        {sku.sellers.map((s) => (
          <span key={s.name}>
            <span className="text-slate-300"> · </span>
            {s.name} {s.wins}
          </span>
        ))}
      </div>
    </div>
  )
}

/** One price axis: the zone below MAP lightly tinted, a dot per offer, the price and who under it. */
function PriceLadder({ sku }: { sku: SellerSku }) {
  const W = 640
  const lo = Math.floor(Math.min(...sku.sellers.map((s) => s.price)) - 3)
  const hi = Math.ceil(sku.price + 3)
  const x = (v: number) => 12 + ((v - lo) / (hi - lo)) * (W - 24)
  const axis = 26
  // Sellers at the same price share one dot and one label.
  const groups = Object.values(
    sku.sellers.reduce<Record<string, { price: number; names: string[] }>>((m, s) => {
      ;(m[s.price.toFixed(2)] ??= { price: s.price, names: [] }).names.push(s.name)
      return m
    }, {}),
  )
  return (
    <svg viewBox={`0 0 ${W} 70`} className="mt-2 w-full overflow-visible" role="img" aria-label={`MAP ${usd(sku.map)}; you ${usd(sku.price)}; ${sku.sellers.map((s) => `${s.name} ${usd(s.price)}`).join(", ")}`}>
      <rect x={x(lo)} y={axis - 10} width={x(sku.map) - x(lo)} height={20} rx={4} fill="#fef2f2" />
      <line x1={x(lo)} x2={x(hi)} y1={axis} y2={axis} stroke="#cbd5e1" />
      <line x1={x(sku.map)} x2={x(sku.map)} y1={axis - 14} y2={axis + 14} stroke={INK} strokeWidth={1.5} strokeDasharray="3 3" />
      <text x={x(sku.map)} y={axis - 18} textAnchor="middle" fontSize={12} fontWeight={600} fill={INK}>
        MAP {usd(sku.map)}
      </text>
      {groups.map((g) => (
        <g key={g.price}>
          <circle cx={x(g.price)} cy={axis} r={6} fill={SELLER} stroke="#fff" strokeWidth={2} />
          <text x={x(g.price)} y={axis + 26} textAnchor="middle" fontSize={13} fontWeight={600} fill="#0f172a">
            {usd(g.price)}
          </text>
          <text x={x(g.price)} y={axis + 42} textAnchor="middle" fontSize={12} fill="#64748b">
            {g.names.join(" · ")}
          </text>
        </g>
      ))}
      <circle cx={x(sku.price)} cy={axis} r={7} fill={YOU} stroke="#fff" strokeWidth={2} />
      <text x={x(sku.price)} y={axis + 26} textAnchor="middle" fontSize={13} fontWeight={600} fill={YOU}>
        {usd(sku.price)}
      </text>
      <text x={x(sku.price)} y={axis + 42} textAnchor="middle" fontSize={12} fill={YOU}>
        You
      </text>
    </svg>
  )
}
