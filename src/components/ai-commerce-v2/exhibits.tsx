"use client"

import { Check, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import { META, type Action } from "./data"
import { PRODUCTS } from "./products"

/**
 * One exhibit per lever: the piece of evidence that makes the mechanism visible.
 * Attributes: the empty fields and what Ally fills. Product page: the agent's math.
 * Cross-retailer: three titles, the rule each breaks. Reviews: what shoppers say vs
 * what the page says. Citations: the sources behind the answer. Promote: paid and
 * organic side by side. Shelf: the page at the moment of the click.
 */
export function Exhibit({ action }: { action: Action }) {
  switch (action.lever) {
    case "attributes":
      return <Attributes />
    case "pdp":
      return <Price />
    case "unified":
      return <Unified />
    case "reviews":
      return <Reviews />
    case "citations":
      return <Citations />
    case "promoted":
      return <Promote action={action} />
    case "ops":
      return <Shelf />
  }
}

const TH = "py-1.5 pr-4 text-left text-xs font-medium text-slate-500"
const TD = "py-1.5 pr-4 align-top text-sm"
const TABLE = "w-full min-w-[640px] text-sm"
const MISSING = "text-slate-400"
const BAD = "font-medium text-warning-700"

function Head({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-medium text-slate-500">{children}</div>
}

function Attributes() {
  const p = PRODUCTS[0]
  const rows = p.fields.filter((f) => ["Ply", "Septic safe", "Sheets per roll"].includes(f.name))
  const fill: Record<string, string> = { Ply: "19 of 20", "Septic safe": "17 of 20", "Sheets per roll": "20 of 20" }
  return (
    <div>
      <Head>Backend attributes the agent filters on · {p.sku}</Head>
      <div className="mt-2 overflow-x-auto">
        <table className={TABLE}>
          <thead>
            <tr className="border-b border-slate-100">
              <th className={TH}>Field</th>
              <th className={TH}>Amazon</th>
              <th className={TH}>Walmart</th>
              <th className={TH}>Kroger</th>
              <th className={TH}>Top 20 fill it</th>
              <th className={TH}>Ally fills</th>
              <th className={TH}>From</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((f) => (
              <tr key={f.name} className="border-b border-slate-50">
                <td className={cn(TD, "text-slate-700")}>{f.name}</td>
                {(["Amazon", "Walmart", "Kroger"] as const).map((r) => (
                  <td key={r} className={cn(TD, f.values[r] ? "text-slate-950" : MISSING)}>
                    {f.values[r] ?? "Empty"}
                  </td>
                ))}
                <td className={cn(TD, "font-mono text-slate-950 tabular-nums")}>{fill[f.name]}</td>
                <td className={cn(TD, "font-medium text-slate-950")}>{f.ally?.value}</td>
                <td className={cn(TD, "text-slate-500")}>{f.ally?.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[13px] text-slate-500">Retailer search filters on these before the agent ranks anything. Empty means out, on 14 SKUs.</p>
    </div>
  )
}

function Price() {
  const rows = [
    { who: "What ChatGPT computed from your title", title: "12 Double Rolls = 24 Regular Rolls", sheets: "24 × 30 regular sheets = 720", per: "$3.24 per 100", bad: true },
    { who: "What's true", title: "12 Double rolls, 120 sheets each", sheets: "1,440", per: "$1.62 per 100" },
    { who: "Great Value's title", title: "12 Double Rolls, 132 Sheets Per Roll", sheets: "1,584", per: "$1.12 per 100" },
  ]
  return (
    <div>
      <Head>The agent&apos;s math · Tear-A-Square at $23.33</Head>
      <div className="mt-2 overflow-x-auto">
        <table className={TABLE}>
          <thead>
            <tr className="border-b border-slate-100">
              <th className={TH}></th>
              <th className={TH}>Title says</th>
              <th className={TH}>Sheets the agent counts</th>
              <th className={TH}>Price per sheet it reads</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.who} className="border-b border-slate-50">
                <td className={cn(TD, "font-medium text-slate-950")}>{r.who}</td>
                <td className={cn(TD, "text-slate-700")}>{r.title}</td>
                <td className={cn(TD, "font-mono tabular-nums", r.bad ? BAD : "text-slate-950")}>{r.sheets}</td>
                <td className={cn(TD, "font-mono tabular-nums", r.bad ? BAD : "text-slate-950")}>{r.per}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[13px] text-slate-500">The title is the retrieval key and the place agents read pack size and unit price. Sheet count isn&apos;t a separate field, so they compute from the title.</p>
    </div>
  )
}

function Unified() {
  const f = PRODUCTS[0].fields.find((x) => x.name === "Title")!
  const pack = PRODUCTS[0].fields.find((x) => x.name === "Pack count")!
  const rows = [
    { r: "Amazon" as const, rule: "200 characters", breaks: null },
    { r: "Walmart" as const, rule: "75 characters", breaks: "Truncated: “Tear-A-Square” and “quarter sheets” dropped" },
    { r: "Kroger" as const, rule: "Pack count must match the UPC", breaks: `Shows ${pack.values.Kroger} for the 12-roll pack` },
  ]
  return (
    <div>
      <Head>One product, three titles · {PRODUCTS[0].sku}</Head>
      <div className="mt-2 overflow-x-auto">
        <table className={TABLE}>
          <thead>
            <tr className="border-b border-slate-100">
              <th className={TH}>Retailer</th>
              <th className={TH}>Title the agent reads</th>
              <th className={TH}>Retailer rule</th>
              <th className={TH}>What breaks</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.r} className="border-b border-slate-50">
                <td className={cn(TD, "font-medium text-slate-950")}>{row.r}</td>
                <td className={cn(TD, "text-slate-700")}>{f.values[row.r]}</td>
                <td className={cn(TD, "text-slate-500")}>{row.rule}</td>
                <td className={cn(TD, row.breaks ? BAD : "text-success-700")}>{row.breaks ?? "Nothing"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[13px] text-slate-500">
        Ally keeps one record and renders it to each retailer&apos;s rules: <span className="text-slate-950">{f.ally?.value}</span>, cut to 75 characters on Walmart without losing the product&apos;s name.
      </p>
    </div>
  )
}

function Reviews() {
  const rows = [
    { theme: "Holds up when wet", ours: "2,300", bounty: "6,800", page: false, bountyPage: true },
    { theme: "Quarter sheets, less waste", ours: "1,900", bounty: "—", page: true, bountyPage: false },
    { theme: "Pet messes", ours: "410", bounty: "1,100", page: false, bountyPage: true, want: true },
    { theme: "Kid messes", ours: "190", bounty: "900", page: false, bountyPage: true },
  ]
  return (
    <div>
      <Head>What shoppers say vs what the page says · Tear-A-Square, 40,210 reviews</Head>
      <div className="mt-2 overflow-x-auto">
        <table className={TABLE}>
          <thead>
            <tr className="border-b border-slate-100">
              <th className={TH}>Theme</th>
              <th className={TH}>Your reviews</th>
              <th className={TH}>On your page</th>
              <th className={TH}>{META.leader}&apos;s reviews</th>
              <th className={TH}>On {META.leader}&apos;s page</th>
              <th className={TH}>Ally</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.theme} className="border-b border-slate-50">
                <td className={cn(TD, "font-medium text-slate-950")}>
                  {r.theme}
                  {r.want && <span className="ml-2 text-xs font-normal text-brand-700">Intent you chose to own</span>}
                </td>
                <td className={cn(TD, "font-mono tabular-nums text-slate-950")}>{r.ours}</td>
                <td className={TD}>{r.page ? <Check className="size-4 text-success-700" /> : <Minus className="size-4 text-slate-300" />}</td>
                <td className={cn(TD, "font-mono tabular-nums text-slate-700")}>{r.bounty}</td>
                <td className={TD}>{r.bountyPage ? <Check className="size-4 text-success-700" /> : <Minus className="size-4 text-slate-300" />}</td>
                <td className={cn(TD, "text-slate-700")}>{r.page ? "" : r.want ? "Put the 410 on the page; ask your review partner for more" : "Write the bullet, cite the reviews"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Citations() {
  const rows = [
    { source: "Wirecutter, best paper towels", names: ["Bounty", "Viva", "Scott"], ally: "Pitch drafted: the wet-strength test data" },
    { source: "Good Housekeeping, tested 2026", names: ["Bounty", "Scott", "Sparkle"], ally: "Pitch drafted: samples and the quarter-sheet angle" },
    { source: "Reddit, r/BuyItForLife thread", names: ["Bounty", "Viva"], ally: "Your buying guide, indexed so the agent can cite it" },
  ]
  return (
    <div>
      <Head>The sources behind ChatGPT&apos;s answer</Head>
      <div className="mt-2 overflow-x-auto">
        <table className={TABLE}>
          <thead>
            <tr className="border-b border-slate-100">
              <th className={TH}>Source cited</th>
              <th className={TH}>Brands it names</th>
              <th className={TH}>You</th>
              <th className={TH}>Ally</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.source} className="border-b border-slate-50">
                <td className={cn(TD, "font-medium text-slate-950")}>{r.source}</td>
                <td className={cn(TD, "text-slate-700")}>{r.names.join(", ")}</td>
                <td className={cn(TD, MISSING)}>Not named</td>
                <td className={cn(TD, "text-slate-700")}>{r.ally}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[13px] text-slate-500">Ally drafts; your PR lead sends. The agent trusts these sources more than the product page.</p>
    </div>
  )
}

function Promote({ action }: { action: Action }) {
  const buy = action.kind === "buy"
  const rows = buy
    ? [
        { k: "Organic position today", v: "Not named", bad: true },
        { k: "Sponsored prompt", v: "Open · nobody buying" },
        { k: "Page fix re-indexes", v: "About Nov 6" },
        { k: "Thanksgiving", v: "Nov 26 · question up 2x" },
        { k: "Ally", v: `Buy now at $${action.spend}K a month; hand back to organic when the page ranks top 3` },
      ]
    : [
        { k: "Organic position today", v: "#2 on Alexa for Shopping" },
        { k: "Sponsored prompt", v: `Buying · $${action.spend}K a month`, bad: true },
        { k: "Ally", v: "Pause. Checked weekly; if organic slips below #3, propose the ad again" },
      ]
  return (
    <div>
      <Head>Paid and organic on the same question</Head>
      <div className="mt-2 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-[200px_minmax(0,1fr)]">
        {rows.map((r) => (
          <div key={r.k} className="contents">
            <div className="text-slate-500">{r.k}</div>
            <div className={cn(r.bad ? BAD : "text-slate-950")}>{r.v}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Shelf() {
  const rows = PRODUCTS.slice(0, 2).flatMap((p) => p.fields.filter((f) => f.name === "Buy box" || f.name === "In stock").map((f) => ({ sku: p.sku.split(",")[0], f })))
  return (
    <div>
      <Head>The shelf at the moment of the click</Head>
      <div className="mt-2 overflow-x-auto">
        <table className={TABLE}>
          <thead>
            <tr className="border-b border-slate-100">
              <th className={TH}>Product</th>
              <th className={TH}>Check</th>
              <th className={TH}>Amazon</th>
              <th className={TH}>Walmart</th>
              <th className={TH}>Kroger</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ sku, f }) => (
              <tr key={sku + f.name} className="border-b border-slate-50">
                <td className={cn(TD, "font-medium text-slate-950")}>{sku}</td>
                <td className={cn(TD, "text-slate-700")}>{f.name}</td>
                {(["Amazon", "Walmart", "Kroger"] as const).map((r) => {
                  const v = f.values[r]
                  const bad = v && /Lost|Low|Not listed/.test(v)
                  return (
                    <td key={r} className={cn(TD, v ? (bad ? BAD : "text-slate-950") : MISSING)}>
                      {v ?? "—"}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[13px] text-slate-500">Agents verify price, seller and stock on the live page before they recommend. A broken shelf drops you even when the content won.</p>
    </div>
  )
}
