"use client"

import type { CSSProperties } from "react"
import { THEMES } from "./prime-day"
import type { Bar, Chart, RetroSlide, ThemeId } from "./prime-day"

/**
 * One slide in one look, at any size: the storyboard thumbnail, the deck and
 * the branded deck are the same slide. Everything is sized in em, so `size`
 * (the slide's base font size in px) scales the whole slide. Template: label and
 * action title on top, the chart on the left, the insights on the right.
 */
export function Slide({ slide, index, theme = "default", size = 16, className, style }: { slide: RetroSlide; index: number; theme?: ThemeId; size?: number; className?: string; style?: CSSProperties }) {
  const t = THEMES[theme]
  return (
    <div
      className={className}
      style={{
        fontSize: size,
        aspectRatio: "16 / 9",
        width: "100%",
        background: t.bg,
        color: t.ink,
        borderRadius: "0.45em",
        boxShadow: `0 0 0 1px ${t.rule}, 0 8px 18px -12px rgba(15,23,42,.3)`,
        padding: "1em 1.2em 0.7em",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: t.body,
        ...style,
      }}
    >
      <div style={{ fontSize: "0.48em", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: theme === "default" ? "#7c3aed" : t.accentInk }}>{slide.eyebrow}</div>
      <div style={{ marginTop: "0.3em", fontFamily: t.display, fontSize: theme === "default" ? "0.92em" : "1em", fontWeight: 700, lineHeight: 1.2, letterSpacing: theme === "default" ? "-0.01em" : 0 }}>{slide.title}</div>
      <div style={{ flex: 1, minHeight: 0, marginTop: "0.7em", display: "grid", gridTemplateColumns: "56% minmax(0, 1fr)", gap: "0.9em" }}>
        <div style={{ minHeight: 0, borderRight: `1px solid ${t.rule}`, paddingRight: "0.8em", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <ChartView chart={slide.chart} theme={theme} />
        </div>
        <div style={{ minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: "0.6em" }}>
          {slide.insights.map((i) => (
            <div key={i.figure + i.text} style={{ fontSize: "0.52em", lineHeight: 1.3, color: t.muted }}>
              <b style={{ display: "block", fontFamily: theme === "default" ? "var(--font-mono), monospace" : t.display, fontSize: "1.35em", lineHeight: 1.1, fontWeight: 700, color: i.loss ? t.loss : t.accentInk }}>{i.figure}</b>
              {i.text}
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop: "0.45em", display: "flex", justifyContent: "space-between", fontSize: "0.4em", color: t.footer }}>
        <span style={{ fontWeight: 700, letterSpacing: theme === "default" ? "0.02em" : "0.18em", color: theme === "default" ? "#475569" : t.ink, fontFamily: theme === "default" ? t.body : t.display }}>{t.mark}</span>
        <span>Prime Day retro · {index}</span>
      </div>
    </div>
  )
}

function fill(tone: Bar["tone"], theme: ThemeId) {
  const t = THEMES[theme]
  return { accent: t.accent, muted: t.soft, loss: t.loss, media: t.media, ops: t.ops }[tone]
}
function ink(tone: Bar["tone"], theme: ThemeId) {
  const t = THEMES[theme]
  return { accent: t.accentInk, muted: t.muted, loss: t.loss, media: t.media, ops: t.ops }[tone]
}

const MONO = "var(--font-mono), ui-monospace, monospace"

function ChartView({ chart, theme }: { chart: Chart; theme: ThemeId }) {
  const t = THEMES[theme]
  if (chart.kind === "kpis") {
    // The summary's headline numbers: big figures, short labels, two by two.
    return (
      <div style={{ height: "100%", display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", alignContent: "center", gap: "0.9em 0.8em" }}>
        {chart.items.map((k) => (
          <div key={k.label}>
            <div style={{ fontFamily: theme === "default" ? MONO : t.display, fontSize: "1.25em", lineHeight: 1.05, fontWeight: 700, color: k.loss ? t.loss : t.ink }}>{k.figure}</div>
            <div style={{ marginTop: "0.25em", fontSize: "0.46em", lineHeight: 1.3, color: t.muted }}>{k.label}</div>
          </div>
        ))}
      </div>
    )
  }
  if (chart.kind === "table") {
    // A scorecard: each row ends in its verdict, so "worked or didn't" reads without comparing bars.
    const good = theme === "default" ? "#067647" : "#4d6b2f"
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 3em 3.6em 4.2em", gap: "0.5em", paddingBottom: "0.3em", borderBottom: `1px solid ${t.rule}`, fontSize: "0.4em", color: t.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {chart.columns.map((c, i) => (
            <span key={c} style={{ textAlign: i === 0 ? "left" : "right" }}>
              {c}
            </span>
          ))}
          <span />
        </div>
        {chart.rows.map((r) => (
          <div key={r.cells[0]} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 3em 3.6em 4.2em", gap: "0.5em", alignItems: "center", padding: "0.45em 0", borderBottom: `1px solid ${t.rule}` }}>
            <span style={{ fontSize: "0.46em", fontWeight: 600, color: t.ink }}>{r.cells[0]}</span>
            <span style={{ fontFamily: MONO, fontSize: "0.46em", fontWeight: 700, textAlign: "right", color: t.ink }}>{r.cells[1]}</span>
            <span style={{ fontFamily: MONO, fontSize: "0.46em", fontWeight: 700, textAlign: "right", color: t.ink }}>{r.cells[2]}</span>
            <span style={{ fontSize: "0.44em", fontWeight: 700, textAlign: "right", color: r.verdict === "worked" ? good : t.loss }}>{r.verdict === "worked" ? "✓ Worked" : "✕ Didn't"}</span>
          </div>
        ))}
      </div>
    )
  }
  if (chart.kind === "columns") {
    const max = Math.max(...chart.bars.map((b) => b.value))
    return (
      <>
        <div style={{ height: "100%", display: "flex", alignItems: "flex-end", justifyContent: "space-around", gap: "0.6em", borderBottom: `1px solid ${t.rule}` }}>
          {chart.bars.map((b) => (
            <div key={b.label} style={{ flex: 1, maxWidth: "3.4em", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: "0.15em" }}>
              <span style={{ fontFamily: MONO, fontSize: "0.5em", fontWeight: 700, color: ink(b.tone, theme) }}>{b.display}</span>
              {/* One scale for every bar, leaving room above the tallest for its value. */}
              <span style={{ width: "100%", height: `${(b.value / max) * 82}%`, background: fill(b.tone, theme), borderRadius: "0.2em 0.2em 0 0" }} />
            </div>
          ))}
        </div>
        <div style={{ marginTop: "0.25em", display: "flex", justifyContent: "space-around", gap: "0.6em" }}>
          {chart.bars.map((b) => (
            <span key={b.label} style={{ flex: 1, maxWidth: "3.4em", textAlign: "center", fontSize: "0.42em", color: t.muted, whiteSpace: "nowrap" }}>{b.label}</span>
          ))}
        </div>
      </>
    )
  }
  if (chart.kind === "rows") {
    const zero = chart.zeroAt ?? 0
    const max = Math.max(...chart.bars.map((b) => Math.abs(b.value)))
    const pos = Math.max(...chart.bars.map((b) => b.value))
    const neg = Math.max(0, ...chart.bars.map((b) => -b.value))
    // Negative bars grow left from the zero line, positive ones right, on one scale.
    const scale = zero ? Math.max(pos / (1 - zero), neg / zero) : max
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: "0.45em" }}>
        {chart.bars.map((b) => (
          <div key={b.label} style={{ display: "grid", gridTemplateColumns: "max-content minmax(0, 1fr) max-content", gap: "0.45em", alignItems: "center" }}>
            <span style={{ fontSize: "0.44em", color: t.ink, whiteSpace: "nowrap", minWidth: "6.5em" }}>{b.label}</span>
            <span style={{ position: "relative", height: "0.55em" }}>
              {zero > 0 && <i style={{ position: "absolute", left: `${zero * 100}%`, top: "-0.2em", bottom: "-0.2em", width: 1, background: t.footer }} />}
              <i
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  borderRadius: "0.12em",
                  background: fill(b.tone, theme),
                  ...(b.value >= 0 ? { left: `${zero * 100}%`, width: `${(b.value / scale) * 100}%` } : { right: `${(1 - zero) * 100}%`, width: `${(-b.value / scale) * 100}%` }),
                }}
              />
            </span>
            <span style={{ fontFamily: MONO, fontSize: "0.46em", fontWeight: 700, textAlign: "right", minWidth: "3.4em", color: ink(b.tone, theme) }}>{b.display}</span>
          </div>
        ))}
      </div>
    )
  }
  if (chart.kind === "slots") {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: "0.5em" }}>
        {chart.rows.map((r) => (
          <div key={r.label}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.44em", color: t.ink }}>
              <span>{r.label}</span>
              <span style={{ fontFamily: MONO, fontWeight: 700 }}>
                {r.slots} of {chart.of}
              </span>
            </div>
            <div style={{ marginTop: "0.2em", display: "grid", gridTemplateColumns: `repeat(${chart.of}, 1fr)`, gap: "0.18em" }}>
              {Array.from({ length: chart.of }, (_, j) => (
                <i key={j} style={{ aspectRatio: "1", borderRadius: "0.15em", background: j < r.slots ? (r.label === "Brightwick" ? (theme === "default" ? "#475569" : t.muted) : fill(r.tone, theme)) : theme === "default" ? "#f1f5f9" : "#efe6d8" }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: "0.5em" }}>
      {chart.items.map((item, i) => (
        <div key={item} style={{ display: "grid", gridTemplateColumns: "1.3em 1fr", gap: "0.4em", alignItems: "baseline" }}>
          <span style={{ fontFamily: MONO, fontSize: "0.5em", fontWeight: 700, color: theme === "default" ? "#7c3aed" : t.accentInk }}>{i + 1}</span>
          <span style={{ fontSize: "0.5em", lineHeight: 1.3, fontWeight: 600 }}>{item}</span>
        </div>
      ))}
    </div>
  )
}
