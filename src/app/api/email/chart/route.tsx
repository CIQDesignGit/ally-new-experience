import { ImageResponse } from "next/og"
import type { NextRequest } from "next/server"

/**
 * The summary email's bridge, as a picture: most inboxes strip charts drawn in
 * code, so the server draws the same waterfall Claire sees (same axis, colors and
 * labels) from numbers in the URL. Numbers only, nothing personal.
 */

type Col = { k: string; l: string; s?: string; v: string; a: number; b: number }
type Chart = { min: number; max: number; plan: number; planLabel: string; cols: Col[] }

// Same fills as the page: run rate and total in slate, each stage in its bucket color.
// The page's colors (DESIGN.md): sky runs on its own, magenta is Ally's work waiting on you, amber needs the team, ink is the total.
const FILL: Record<string, string> = { pace: "#CBD5E1", autopilot: "#5AAFFF", approval: "#C231FF", team: "#F79009", total: "#210235" }
// On the page the selected stage (one approval away) is full color and the others sit back.
const FADE: Record<string, number> = {}

const W = 1072
const H = 540
const PAD_X = 8
const TOP = 72
const BAND = 300
const GAP = 24

function parse(raw: string | null): Chart | null {
  if (!raw || raw.length > 4000) return null
  try {
    const c = JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as Chart
    const ok = (n: unknown) => typeof n === "number" && Number.isFinite(n)
    if (!ok(c.min) || !ok(c.max) || !ok(c.plan) || c.max <= c.min || !Array.isArray(c.cols) || c.cols.length > 8) return null
    if (!c.cols.every((x) => ok(x.a) && ok(x.b) && typeof x.l === "string" && typeof x.v === "string")) return null
    return c
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const c = parse(request.nextUrl.searchParams.get("d"))
  if (!c) return new Response("Bad chart", { status: 400 })

  const n = c.cols.length
  const colW = (W - PAD_X * 2 - GAP * (n - 1)) / n
  const y = (v: number) => TOP + (1 - (v - c.min) / (c.max - c.min)) * BAND
  const planY = y(c.plan)

  return new ImageResponse(
    (
      <div style={{ width: W, height: H, display: "flex", position: "relative", background: "#FFFFFF", fontFamily: "sans-serif" }}>
        {c.cols.map((col, i) => {
          const x = PAD_X + i * (colW + GAP)
          const top = y(col.b)
          const height = Math.max(10, y(col.a) - top)
          const next = c.cols[i + 1]
          const strong = col.k === "pace" || col.k === "total"
          return (
            <div key={col.k} style={{ display: "flex", position: "absolute", left: 0, top: 0, width: W, height: H }}>
              {/* Dashed step from this bar's top to the next bar, as on the page. */}
              {next && next.k !== "total" && (
                <div style={{ position: "absolute", left: x + colW - 24, top, width: GAP + 48, borderTop: "2px dashed #CBD5E1" }} />
              )}
              <div style={{ position: "absolute", left: x + 24, top, width: colW - 48, height, background: FILL[col.k] ?? "#94A3B8", opacity: FADE[col.k] ?? 1, borderRadius: "8px 8px 0 0" }} />
              <div style={{ position: "absolute", left: x, top: top - 46, width: colW, display: "flex", justifyContent: "center", fontSize: 32, fontWeight: 700, color: "#020617" }}>{col.v}</div>
              <div style={{ position: "absolute", left: x, top: TOP + BAND + 18, width: colW, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                <div style={{ fontSize: 26, fontWeight: strong ? 700 : 400, color: strong ? "#020617" : "#64748B", lineHeight: 1.2 }}>{col.l}</div>
                {col.s && <div style={{ marginTop: 6, fontSize: 22, color: "#94A3B8", lineHeight: 1.25 }}>{col.s}</div>}
              </div>
            </div>
          )
        })}
        {/* The plan line runs across every column. Labelled at the left: on the right it would sit on the total's number. */}
        <div style={{ position: "absolute", left: 0, top: planY, width: W, borderTop: "3px dashed rgba(15,23,42,0.6)" }} />
        <div style={{ position: "absolute", left: PAD_X, top: planY - 38, display: "flex", background: "#FFFFFF", paddingRight: 8, fontSize: 26, fontWeight: 700, color: "#020617" }}>{c.planLabel}</div>
      </div>
    ),
    { width: W, height: H, headers: { "Cache-Control": "public, max-age=31536000, immutable" } },
  )
}
