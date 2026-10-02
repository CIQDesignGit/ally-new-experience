"use client"

import { THEMES } from "./prime-day"
import type { Bar, RetroSlide, ThemeId } from "./prime-day"

/** Font names PowerPoint knows (the page uses CSS variables for the same faces). */
const FONTS: Record<ThemeId, { display: string; body: string }> = {
  default: { display: "Inter", body: "Inter" },
  aurelle: { display: "Playfair Display", body: "Lato" },
}

const hex = (c: string) => c.replace("#", "").toUpperCase()

/**
 * The deck as a real .pptx: every slide in the chosen look, with native,
 * editable charts (not pictures), in the order the storyboard set.
 */
export async function exportRetroPptx(slides: RetroSlide[], theme: ThemeId, deck: { name: string; file: string } = { name: "Prime Day retro", file: "Prime-Day-retro" }) {
  const { default: PptxGenJS } = await import("pptxgenjs")
  const pptx = new PptxGenJS()
  pptx.layout = "LAYOUT_WIDE" // 13.33 × 7.5 in
  const t = THEMES[theme]
  const f = FONTS[theme]

  slides.forEach((s, i) => {
    const slide = pptx.addSlide()
    slide.background = { color: hex(t.bg) }
    slide.addText(s.eyebrow.toUpperCase(), { x: 0.6, y: 0.4, w: 12, h: 0.3, fontFace: f.body, fontSize: 11, bold: true, color: hex(theme === "default" ? "#7c3aed" : t.accentInk), charSpacing: 2 })
    slide.addText(s.title, { x: 0.6, y: 0.75, w: 12, h: 0.9, fontFace: f.display, fontSize: 28, bold: true, color: hex(t.ink) })
    addChart(pptx, slide, s, theme)
    s.insights.forEach((ins, k) => {
      slide.addText(
        [
          { text: `${ins.figure}\n`, options: { fontFace: f.display, fontSize: 24, bold: true, color: hex(ins.loss ? t.loss : t.accentInk) } },
          { text: ins.text, options: { fontFace: f.body, fontSize: 13, color: hex(t.muted) } },
        ],
        { x: 8.3, y: 2.1 + k * 1.45, w: 4.4, h: 1.3, valign: "top" },
      )
    })
    slide.addShape("line", { x: 8.0, y: 2.0, w: 0, h: 4.6, line: { color: hex(t.rule), width: 1 } })
    slide.addText(t.mark, { x: 0.6, y: 6.95, w: 4, h: 0.3, fontFace: f.display, fontSize: 10, bold: true, color: hex(theme === "default" ? "#475569" : t.ink), charSpacing: theme === "default" ? 0 : 4 })
    slide.addText(`${deck.name} · ${i + 1}`, { x: 8.7, y: 6.95, w: 4, h: 0.3, fontFace: f.body, fontSize: 10, color: hex(t.footer), align: "right" })
  })

  await pptx.writeFile({ fileName: theme === "aurelle" ? `${deck.file} (Aurelle).pptx` : `${deck.file}.pptx` })
}

type PptxSlide = ReturnType<InstanceType<typeof import("pptxgenjs").default>["addSlide"]>

function color(b: Bar, theme: ThemeId) {
  const t = THEMES[theme]
  return hex({ accent: t.accent, muted: t.soft, loss: t.loss, media: t.media, ops: t.ops }[b.tone])
}

function addChart(pptx: InstanceType<typeof import("pptxgenjs").default>, slide: PptxSlide, s: RetroSlide, theme: ThemeId) {
  const t = THEMES[theme]
  const f = FONTS[theme]
  const box = { x: 0.6, y: 2.0, w: 7.1, h: 4.6 }
  const c = s.chart
  if (c.kind === "kpis") {
    c.items.forEach((k, i) => {
      const x = box.x + (i % 2) * 3.6
      const y = box.y + 0.3 + Math.floor(i / 2) * 2.1
      slide.addText(
        [
          { text: `${k.figure}\n`, options: { fontFace: f.display, fontSize: 40, bold: true, color: hex(k.loss ? t.loss : t.ink) } },
          { text: k.label, options: { fontFace: f.body, fontSize: 14, color: hex(t.muted) } },
        ],
        { x, y, w: 3.4, h: 1.9, valign: "top" },
      )
    })
    return
  }
  if (c.kind === "table") {
    const good = theme === "default" ? "067647" : "4D6B2F"
    const head = [...c.columns, ""].map((h, i) => ({ text: h.toUpperCase(), options: { bold: true, fontSize: 11, color: hex(t.muted), align: (i === 0 ? "left" : "right") as "left" | "right" } }))
    const rows = c.rows.map((r) => [
      { text: r.cells[0], options: { bold: true, fontSize: 15, color: hex(t.ink) } },
      { text: r.cells[1], options: { bold: true, fontSize: 15, color: hex(t.ink), align: "right" as const } },
      { text: r.cells[2], options: { bold: true, fontSize: 15, color: hex(t.ink), align: "right" as const } },
      { text: r.verdict === "worked" ? "✓ Worked" : "✕ Didn't", options: { bold: true, fontSize: 14, color: r.verdict === "worked" ? good : hex(t.loss), align: "right" as const } },
    ])
    slide.addTable([head, ...rows], { x: box.x, y: box.y + 0.6, w: box.w, colW: [3.6, 1.0, 1.2, 1.3], fontFace: f.body, border: { type: "solid", pt: 0.75, color: hex(t.rule) }, rowH: 0.7, valign: "middle" })
    return
  }
  if (c.kind === "columns" || c.kind === "rows") {
    slide.addChart(
      pptx.ChartType.bar,
      [{ name: s.title, labels: c.bars.map((b) => b.label), values: c.bars.map((b) => b.value) }],
      {
        ...box,
        barDir: c.kind === "columns" ? "col" : "bar",
        chartColors: c.bars.map((b) => color(b, theme)),
        // One color per bar, not per series.
        ...({ varyColors: true } as object),
        showValue: true,
        dataLabelFormatCode: s.id === "ally" ? '"$"0"K"' : '+0"%";−0"%"',
        dataLabelColor: hex(t.ink),
        dataLabelFontFace: f.body,
        dataLabelFontSize: 12,
        dataLabelFontBold: true,
        catAxisLabelColor: hex(t.muted),
        catAxisLabelFontFace: f.body,
        catAxisLabelFontSize: 12,
        valAxisHidden: true,
        valGridLine: { style: "none" },
        catAxisLineShow: true,
        showLegend: false,
        barGapWidthPct: 60,
      },
    )
    return
  }
  if (c.kind === "slots") {
    c.rows.forEach((r, k) => {
      const y = box.y + 0.5 + k * 1.3
      slide.addText(`${r.label}`, { x: box.x, y, w: 3, h: 0.35, fontFace: f.body, fontSize: 13, color: hex(t.ink) })
      slide.addText(`${r.slots} of ${c.of}`, { x: box.x + 4.6, y, w: 2.2, h: 0.35, fontFace: f.body, fontSize: 13, bold: true, color: hex(t.ink), align: "right" })
      for (let j = 0; j < c.of; j++) {
        const on = j < r.slots
        const fillColor = on ? (r.label === "Brightwick" ? hex(theme === "default" ? "#475569" : t.muted) : color({ label: "", value: 0, display: "", tone: r.tone }, theme)) : hex(theme === "default" ? "#f1f5f9" : "#efe6d8")
        slide.addShape("rect", { x: box.x + j * 0.57, y: y + 0.42, w: 0.48, h: 0.48, fill: { color: fillColor }, line: { color: fillColor } })
      }
    })
    return
  }
  slide.addText(
    c.items.map((item, k) => ({ text: item, options: { bullet: { type: "number" }, breakLine: k < c.items.length - 1 } })),
    { ...box, fontFace: f.body, fontSize: 18, bold: true, color: hex(t.ink), valign: "middle", paraSpaceAfter: 14 },
  )
}
