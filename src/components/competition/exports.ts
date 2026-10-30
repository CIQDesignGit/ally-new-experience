"use client"

import { DEALS, FINDING, NAMES, SOV, SOV_WEEKS } from "./data"

/** The competition dashboard as a real .pptx: the finding, share of voice as a native chart, and the deals. */
export async function exportCompetitionPptx() {
  const { default: PptxGenJS } = await import("pptxgenjs")
  const pptx = new PptxGenJS()
  pptx.layout = "LAYOUT_WIDE"
  const ink = "0F172A"
  const muted = "64748B"

  const title = pptx.addSlide()
  title.addText(`${NAMES.competitor} vs Aurelle`, { x: 0.6, y: 0.6, w: 12, h: 0.8, fontFace: "Inter", fontSize: 32, bold: true, color: ink })
  title.addText(FINDING, { x: 0.6, y: 1.6, w: 12, h: 1.2, fontFace: "Inter", fontSize: 18, color: ink })
  title.addText("Competition tracker · Amazon US · week of Oct 4", { x: 0.6, y: 6.6, w: 12, h: 0.4, fontFace: "Inter", fontSize: 12, color: muted })

  const sov = pptx.addSlide()
  sov.addText("Share of voice on gift terms, last 8 weeks", { x: 0.6, y: 0.5, w: 12, h: 0.6, fontFace: "Inter", fontSize: 24, bold: true, color: ink })
  sov.addChart(
    "line",
    [
      { name: NAMES.competitor, labels: SOV_WEEKS, values: SOV.theirs.map((v) => v / 100) },
      { name: "Aurelle", labels: SOV_WEEKS, values: SOV.ours.map((v) => v / 100) },
    ],
    { x: 0.6, y: 1.3, w: 12, h: 5.4, chartColors: ["94A3B8", "1F22B2"], lineSize: 2, valAxisLabelFormatCode: "0%", showLegend: true, legendPos: "b", catAxisLabelFontFace: "Inter", valAxisLabelFontFace: "Inter" },
  )

  const deals = pptx.addSlide()
  deals.addText(`${NAMES.competitor} deals on your matched gift sets`, { x: 0.6, y: 0.5, w: 12, h: 0.6, fontFace: "Inter", fontSize: 24, bold: true, color: ink })
  const head = ["Their product", "Your product", "Deal", "Since", "Price gap"].map((t) => ({ text: t, options: { bold: true, color: muted } }))
  deals.addTable([head, ...DEALS.map((d) => [d.theirs, d.ours, d.deal, d.since, `−$${Math.abs(d.gap).toFixed(2)}`].map((t) => ({ text: t })))], { x: 0.6, y: 1.3, w: 12, fontFace: "Inter", fontSize: 13, color: ink, border: { type: "solid", pt: 0.5, color: "E2E8F0" } })

  await pptx.writeFile({ fileName: "Aurelle-competition-tracker.pptx" })
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

/** Rows as a real .xlsx (one sheet), built with the zip library pptxgenjs already ships. */
export async function exportXlsx(fileName: string, sheet: string, rows: (string | number)[][]) {
  const { default: JSZip } = await import("jszip")
  const col = (i: number) => String.fromCharCode(65 + i)
  const cells = rows
    .map((r, ri) => `<row r="${ri + 1}">${r.map((v, ci) => (typeof v === "number" ? `<c r="${col(ci)}${ri + 1}"><v>${v}</v></c>` : `<c r="${col(ci)}${ri + 1}" t="inlineStr"><is><t>${esc(v)}</t></is></c>`)).join("")}</row>`)
    .join("")
  const zip = new JSZip()
  zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`)
  zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`)
  zip.file("xl/workbook.xml", `<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${esc(sheet)}" sheetId="1" r:id="rId1"/></sheets></workbook>`)
  zip.file("xl/_rels/workbook.xml.rels", `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`)
  zip.file("xl/worksheets/sheet1.xml", `<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${cells}</sheetData></worksheet>`)
  const blob = await zip.generateAsync({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
  const a = document.createElement("a")
  a.href = URL.createObjectURL(blob)
  a.download = fileName
  a.click()
  URL.revokeObjectURL(a.href)
}
