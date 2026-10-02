/**
 * An item that says "12 SKUs" lists 12. The demo has full data for a few SKUs
 * per item; the rest of the count is filled with catalog-style rows (same brand,
 * scents and sizes), deterministic per item so a list never reshuffles.
 */

const BRANDS = ["Aurelle", "Hearthwood", "Bright"]
const SCENTS = ["Amber Floral", "Noir Cherry", "Coastal Linen", "Vanilla Tobacco", "Cedar & Smoke", "Pink Sands", "Spiced Pumpkin", "Black Fig", "Sea Salt Sage", "Citrus Grove", "Harvest Apple", "Smoked Vanilla", "Midnight Rose", "Fireside Oak", "Wild Mint", "Honey Oat"]
const FORMATS = ["Soy Jar, 16 oz", "Large Jar, 22 oz", "Mini Jar, 8 oz", "Three-Wick, 21 oz", "Tumbler, 10 oz", "Travel Tin, 4 oz", "Gift Set of 3", "Pillar, 12 oz"]

function hash(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

export interface FillRow {
  id: string
  name: string
  /** Has full data behind it (opens side by side); filled rows are list-only. */
  real: boolean
}

export function fillSkus(seed: string, real: { id: string; name: string }[], total: number): FillRow[] {
  const rows: FillRow[] = real.slice(0, total).map((r) => ({ ...r, real: true }))
  const taken = new Set(rows.map((r) => r.name))
  // Walk every brand × scent × format once, in an order spread by the seed (97 is coprime to the 384 combinations).
  const combos = BRANDS.length * SCENTS.length * FORMATS.length
  const off = hash(seed)
  for (let i = 0; rows.length < total; i++) {
    const k = (i * 97 + off) % combos
    const pack = i >= combos ? ` (${Math.floor(i / combos) + 1}-pack)` : ""
    const name = `${BRANDS[k % BRANDS.length]} ${SCENTS[Math.floor(k / BRANDS.length) % SCENTS.length]} ${FORMATS[Math.floor(k / (BRANDS.length * SCENTS.length))]}${pack}`
    if (taken.has(name)) continue
    taken.add(name)
    const h = hash(`${seed}:${i}`)
    rows.push({ id: `B0${(h % 0xffffff).toString(16).toUpperCase().padStart(6, "0")}${String(i % 100).padStart(2, "0")}`, name, real: false })
  }
  return rows
}

/** Rows shown before "Show all": enough to scan, not a wall. */
export const FILL_PREVIEW = 12
