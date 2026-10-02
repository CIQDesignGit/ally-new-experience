import { REPLY_LINE, replyActions } from "./claire/claire-actions"
import { AS_OF, BUSINESS, INFLIGHT, deadlineView, fmtBiz, fmtM, fmtValue, getSnapshot, launchedIds, nudgeTargets, openView, tierView, waterfallStages } from "./data"
import { rankLevers } from "./model"
import { axisMin, buildColumns } from "./waterfall/waterfall-chart"
import type { ContentDelivered } from "./delivered-content-data"
import { DELIVERED, leverDelivered } from "./delivered-periods"
import type { Acted } from "./model"
import type { Policy } from "./policy"
import { AGENT_LABEL, type AgentId, type NudgeKey, type Period, type TierRow } from "./types"

type RGB = [number, number, number]
const INK: RGB = [3, 7, 18]
const BODY: RGB = [55, 65, 81]
const MUTED: RGB = [107, 114, 128]
const BRAND: RGB = [124, 58, 237]
const WARN: RGB = [180, 83, 9]
const GOOD: RGB = [4, 120, 87]
const BAD: RGB = [217, 45, 32]
const INFO: RGB = [21, 94, 239]
const HAIR: RGB = [226, 232, 240]
/** Bar fills, matching the page's bridge: run rate and total in slate, each stage in its own tint. */
const BAR: Record<string, RGB> = { pace: [203, 213, 225], autopilot: [147, 197, 253], approval: [167, 139, 250], team: [253, 186, 116], total: [100, 116, 139] }

const PERIOD_WORDS: Record<Period, string> = { week: "this week", month: "this month", quarter: "this quarter", year: "this year" }

/** Helvetica in jsPDF has no Unicode minus or arrows: keep the text in its character set. */
const pdfText = (s: string) => s.replace(/[−–]/g, "-").replace(/→/g, "to").replace(/[“”]/g, '"').replace(/[‘’]/g, "'")
const signed = (v: number) => `${v >= 0 ? "+" : "-"}${fmtValue(Math.abs(v))}`

/** What the page is showing right now: this session's nudges, approvals and review policy. */
export interface ExecState {
  approved: Acted
  nudged: Partial<Record<NudgeKey, boolean>>
  policy?: Policy
  /** Claire's asks, own approvals and the demo clock, so the email's reply actions match her page. */
  asks?: Partial<Record<NudgeKey, { due: string; dueDay: number }>>
  approvedBy?: Partial<Record<NudgeKey, string>>
  day?: number
}

/** The "This week" status, worded as the stage tables word it. */
function weekStatus(row: TierRow, nudged: ExecState["nudged"]): { text: string; color: RGB } | undefined {
  const w = row.weekly
  if (!w) return undefined
  if (w.state === "done") return { text: w.progress ?? "All approved", color: GOOD }
  if (w.state === "in-progress") return { text: `In progress · ${w.progress}`, color: INFO }
  if (row.nudgeKey && nudged[row.nudgeKey]) return { text: "Nudged today", color: GOOD }
  return { text: "Emailed Mon · not started", color: MUTED }
}

/**
 * The exec summary PDF: /claire-waterfall top to bottom with every section
 * expanded (each stage's line items, each area's buckets, each lever's
 * breakdown), from the same live model the page reads. jsPDF loads on demand.
 */
/** Builds the PDF; download or email it with the two helpers below. */
async function buildExecSummary(period: Period, state: ExecState) {
  const { approved, nudged, policy, day = 0 } = state
  const { jsPDF } = await import("jspdf")
  const doc = new jsPDF({ unit: "pt", format: "letter" })
  const M = 56
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()
  const R = W - M
  let y = 64

  const open = openView(approved, policy, period)
  const stages = waterfallStages(approved, policy, period)
  const approval = tierView("approval", approved, policy, period)
  const dl = deadlineView(approved, "approval", policy, period)
  // Counted down by the demo clock, as the page counts it.
  const deadline = dl && { ...dl, days: dl.days - day }
  const done = DELIVERED[period]
  const biz = BUSINESS[period]
  // Same as the page: the run rate plus what was approved this session.
  const pace = biz.pace + (period === "quarter" || period === "year" ? open.acted : 0)
  const gap = biz.plan - pace
  const quarter = INFLIGHT[period].name

  const text = (s: string, x: number, o: { size?: number; bold?: boolean; color?: RGB; right?: boolean; at?: number } = {}) => {
    doc.setFont("helvetica", o.bold ? "bold" : "normal")
    doc.setFontSize(o.size ?? 10.5)
    doc.setTextColor(...(o.color ?? INK))
    doc.text(pdfText(s), o.right ? (o.at ?? R) : x, y, { align: o.right ? "right" : "left" })
  }
  const width = (s: string, size: number, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal")
    doc.setFontSize(size)
    return doc.getTextWidth(pdfText(s))
  }
  /** Wrapped text; moves y past it. */
  const para = (s: string, x: number, w: number, o: { size?: number; color?: RGB; bold?: boolean; lead?: number } = {}) => {
    doc.setFont("helvetica", o.bold ? "bold" : "normal")
    doc.setFontSize(o.size ?? 10)
    doc.setTextColor(...(o.color ?? BODY))
    const lines = doc.splitTextToSize(pdfText(s), w) as string[]
    doc.text(lines, x, y)
    y += lines.length * (o.lead ?? 13)
  }
  const rule = () => {
    doc.setDrawColor(...HAIR)
    doc.setLineWidth(0.75)
    doc.line(M, y, R, y)
  }
  const ensure = (need: number) => {
    if (y + need > H - 56) {
      doc.addPage()
      y = 64
    }
  }
  const eyebrow = (s: string) => {
    ensure(80)
    text(s.toUpperCase(), M, { size: 8.5, bold: true, color: MUTED })
    y += 18
  }

  // Header
  text("Ally", M, { size: 11, bold: true, color: BRAND })
  text(`${quarter} summary · prepared ${new Date(`${AS_OF}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`, M, { size: 9.5, color: MUTED, right: true })
  y += 14
  rule()
  y += 32

  // The hero, as the page says it
  text(`You're tracking to ${fmtBiz(pace)} in sales ${PERIOD_WORDS[period]}.`, M, { size: 13, color: BODY })
  y += 26
  text(`That's ${fmtBiz(gap)} short of your ${fmtBiz(biz.plan)} plan.`, M, { size: 20, bold: true })
  y += 25
  const lead = width("We have ", 20, true)
  text("We have ", M, { size: 20, bold: true })
  text(open.totalLabel, M + lead, { size: 20, bold: true, color: BRAND })
  text(" in the pipeline to close it.", M + lead + width(open.totalLabel, 20, true), { size: 20, bold: true })
  y += 20
  text(open.byArea.map((a) => `${a.value} in ${a.agent}`).join("  ·  "), M, { size: 10.5, color: MUTED })
  y += 20
  const unlock = `${approval.effort} of your team's time unlocks ${approval.value}`
  text(unlock, M, { size: 12, bold: true, color: BRAND })
  if (deadline) text(`  ·  ${deadline.expiring} expires in ${deadline.days} days`, M + width(unlock, 12, true), { size: 12, bold: true, color: WARN })
  y += 36

  // Where it sits today: the bridge, run rate through each stage to total opportunity, against plan
  eyebrow("Where it sits today")
  const bars: { key: string; label: string; from: number; to: number; value: string }[] = [{ key: "pace", label: "Current run rate", from: 0, to: pace, value: fmtBiz(pace) }]
  stages.forEach((s) => {
    const from = bars[bars.length - 1].to
    bars.push({ key: s.id, label: s.label, from, to: from + s.value, value: `+${fmtM(s.value)}` })
  })
  const total = bars[bars.length - 1].to
  bars.push({ key: "total", label: "Total opportunity", from: 0, to: total, value: fmtM(total) })
  const floor = Math.floor(Math.min(pace, biz.plan) * 0.9)
  const top = Math.max(total, biz.plan) * 1.04
  const chartH = 150
  const chartTop = y + 10
  const base = chartTop + chartH
  const slot = (R - M) / bars.length
  const yOf = (v: number) => base - ((Math.max(v, floor) - floor) / (top - floor)) * chartH
  bars.forEach((b, i) => {
    const w = slot * 0.62
    const x = M + i * slot + (slot - w) / 2
    const y1 = yOf(b.to)
    const y0 = b.from ? yOf(b.from) : base
    doc.setFillColor(...BAR[b.key])
    doc.roundedRect(x, y1, w, Math.max(y0 - y1, 1.5), 2, 2, "F")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(9.5)
    doc.setTextColor(...INK)
    doc.text(pdfText(b.value), x + w / 2, y1 - 6, { align: "center" })
    doc.setFontSize(8.5)
    doc.text(doc.splitTextToSize(pdfText(b.label), slot - 8) as string[], x + w / 2, base + 14, { align: "center" })
  })
  doc.setDrawColor(...MUTED)
  doc.setLineWidth(0.75)
  doc.setLineDashPattern([3, 3], 0)
  doc.line(M, yOf(biz.plan), R, yOf(biz.plan))
  doc.setLineDashPattern([], 0)
  y = yOf(biz.plan) - 5
  text(`Plan ${fmtBiz(biz.plan)}`, M, { size: 8.5, bold: true, color: MUTED })
  y = base + 42
  text(`Axis starts at ${fmtBiz(floor)}`, M, { size: 8, color: MUTED })
  y += 34

  // Each stage, every line item
  const COL = { owner: M, what: M + 112, week: M + 300 }
  stages.forEach((s) => {
    ensure(70 + s.rows.length * 40)
    text(s.label, M, { size: 13, bold: true })
    text(s.id === "autopilot" ? "Already scheduled, no action required" : s.effort, M + width(s.label, 13, true) + 10, { size: 10, color: MUTED })
    text(`+${fmtM(s.value)}`, M, { size: 13, bold: true, right: true })
    y += 18
    text("Owner", COL.owner, { size: 8.5, color: MUTED })
    text("What's waiting", COL.what, { size: 8.5, color: MUTED })
    text("This week", COL.week, { size: 8.5, color: MUTED })
    text("Value", M, { size: 8.5, color: MUTED, right: true })
    y += 8
    s.rows.forEach((r) => {
      rule()
      y += 15
      const rowTop = y
      text(r.analystName || AGENT_LABEL[r.agent], COL.owner, { size: 10, bold: true })
      if (r.analystName) text(AGENT_LABEL[r.agent], COL.owner + width(r.analystName, 10, true) + 4, { size: 10, color: MUTED })
      text(r.value, M, { size: 10, bold: true, right: true })
      para(r.description, COL.what, COL.week - COL.what - 16, { size: 9.5 })
      const whatEnd = y
      y = rowTop
      const st = weekStatus(r, nudged)
      if (st) {
        text(st.text, COL.week, { size: 9.5, color: st.color, bold: st.color !== MUTED })
        y += 13
      }
      if (r.deadline) {
        text(r.deadline, COL.week, { size: 9, bold: true, color: WARN })
        y += 13
      }
      y = Math.max(y, whatEnd) + 4
    })
    y += 24
  })

  // Total opportunity, by area and bucket
  ensure(170)
  text("Open opportunity by area", M, { size: 13, bold: true })
  text(open.totalLabel, M, { size: 13, bold: true, right: true })
  y += 12
  const buckets = (["approval", "input", "autopilot"] as const).map((t) => ({
    t,
    view: tierView(t, approved, policy, period),
    label: t === "approval" ? "One approval away" : t === "input" ? "Needs your team" : "On autopilot",
  }))
  // Same ranking as the page: soonest deadline, then open dollars.
  rankLevers(getSnapshot(policy, period, launchedIds(approved)), approved).forEach((agent) => {
    const rows = buckets.flatMap((b) => b.view.rows.filter((r) => r.agent === agent).map((row) => ({ ...b, row })))
    ensure(34 + rows.length * 16)
    rule()
    y += 16
    text(AGENT_LABEL[agent], M, { size: 11, bold: true })
    text(open.byArea.find((a) => a.agent === agent)?.value ?? "", M, { size: 11, bold: true, right: true })
    y += 16
    rows.forEach(({ label, t, view, row }) => {
      text(label, M + 14, { size: 9.5, color: BODY })
      text(t === "autopilot" ? "Already scheduled" : view.effort, M + 150, { size: 9.5, color: MUTED })
      const st = weekStatus(row, nudged)
      if (st) text(st.text, M + 262, { size: 9.5, color: st.color })
      text(row.value, M, { size: 9.5, right: true, color: BODY })
      y += 15
    })
    y += 2
  })
  y += 30

  // This quarter so far, every lever opened
  eyebrow(done.label)
  const LEVERS = (["content", "media", "ops"] as AgentId[]).sort((a, b) => leverDelivered(done, b).delivered - leverDelivered(done, a).delivered)
  const projected = LEVERS.reduce((s, a) => s + leverDelivered(done, a).promised, 0)
  const delivered = LEVERS.reduce((s, a) => s + leverDelivered(done, a).delivered, 0)
  const pLabel = `Projected ${fmtValue(projected)}`
  text(pLabel, M, { size: 15, bold: true, color: MUTED })
  const dx = M + width(pLabel, 15, true) + 20
  text("Delivered ", dx, { size: 15, bold: true })
  const dx2 = dx + width("Delivered ", 15, true)
  text(fmtValue(delivered), dx2, { size: 15, bold: true, color: BRAND })
  text(signed(delivered - projected), dx2 + width(fmtValue(delivered), 15, true) + 12, { size: 11, bold: true, color: delivered >= projected ? GOOD : BAD })
  y += 24
  const COLQ = { proj: R - 150, del: R - 75 }
  text("Projected", M, { size: 8.5, color: MUTED, right: true, at: COLQ.proj })
  text("Delivered", M, { size: 8.5, color: MUTED, right: true, at: COLQ.del })
  text("vs projected", M, { size: 8.5, color: MUTED, right: true })
  y += 8

  const DRILL: Partial<Record<AgentId, ContentDelivered>> = { content: done.content, ops: done.ops }
  const leverRow = (name: string, note: string, p: number, d: number, bold: boolean, indent = 0) => {
    text(name, M + indent, { size: bold ? 11 : 10, bold })
    text(note, M + indent + width(name, bold ? 11 : 10, bold) + 8, { size: 9.5, color: MUTED })
    text(fmtValue(p), M, { size: 10, right: true, at: COLQ.proj, color: BODY })
    text(fmtValue(d), M, { size: 10, bold: true, right: true, at: COLQ.del })
    text(signed(d - p), M, { size: 10, bold: true, right: true, color: d >= p ? GOOD : BAD })
    y += 15
  }
  LEVERS.forEach((agent) => {
    const drill = DRILL[agent]
    const summary = leverDelivered(done, agent)
    ensure(drill ? 110 : 40)
    rule()
    y += 16
    if (drill) {
      leverRow(AGENT_LABEL[agent], drill.did, drill.promised, drill.delivered, true)
      drill.workTypes.forEach((wt) => {
        ensure(70)
        y += 4
        leverRow(wt.name, wt.did, wt.promised, wt.delivered, false, 14)
        ;(wt.bullets ?? []).forEach((b) => {
          ensure(30)
          // Orange is what's waiting, muted is what the agent learned, as on the page.
          para(`•  ${b.text}`, M + 28, COLQ.proj - M - 90, { size: 9, color: b.tone === "orange" ? WARN : b.tone === "learn" ? MUTED : BODY, lead: 12 })
          y += 2
        })
      })
      y += 4
    } else if (summary) {
      leverRow(AGENT_LABEL[agent], summary.reason, summary.promised, summary.delivered, true)
    }
  })

  return { doc, quarter, filename: `ally-summary-${quarter.replace(/\s+/g, "-").toLowerCase()}.pdf` }
}

export async function downloadExecSummary(period: Period, state: ExecState) {
  const { doc, filename } = await buildExecSummary(period, state)
  doc.save(filename)
}

/** The same PDF, as base64 for an email attachment, plus the summary the email body leads with. */
export async function execSummaryForEmail(period: Period, state: ExecState) {
  const { doc, quarter, filename } = await buildExecSummary(period, state)
  const pdfBase64 = (doc.output("datauristring") as string).split(",")[1]
  return { quarter, filename, pdfBase64, digest: execDigest(period, state) }
}

export interface DigestRow {
  label: string
  note?: string
  value?: string
  tone?: "warn" | "done"
  href?: string
}
/** The page's bridge as numbers, for the email's chart picture: axis, plan and each column. */
export interface DigestChart {
  min: number
  max: number
  plan: number
  planLabel: string
  alt: string
  cols: { k: string; l: string; s?: string; v: string; a: number; b: number }[]
}
export interface ExecDigest {
  subject: string
  preheader: string
  hero: string[]
  chart?: DigestChart
  sections: { title: string; total?: { note: string; value: string }; rows: DigestRow[] }[]
  /** How to act by replying: "Reply YES to do all of these, or YES 1…". */
  reply?: string
}

/**
 * The email's own summary, from the same model as the page and the PDF, so every
 * number ties: where you stand, what's open, what we delivered, and the top
 * three actions (soonest deadline first, then dollars). Links open Ally; they never act.
 */
export function execDigest(period: Period, { approved, policy, asks = {}, approvedBy = {}, day = 0 }: ExecState): ExecDigest {
  const open = openView(approved, policy, period)
  const approval = tierView("approval", approved, policy, period)
  const dl = deadlineView(approved, "approval", policy, period)
  // Counted down by the demo clock, as the page counts it.
  const deadline = dl && { ...dl, days: dl.days - day }
  const done = DELIVERED[period]
  const biz = BUSINESS[period]
  const pace = biz.pace + (period === "quarter" || period === "year" ? open.acted : 0)
  const gap = biz.plan - pace
  const quarter = INFLIGHT[period].name
  // The same bridge the page draws: same axis, same columns, same labels.
  const cols = buildColumns(waterfallStages(approved, policy, period), pace, axisMin(pace, biz.plan))
  const chart: DigestChart = {
    min: axisMin(pace, biz.plan),
    max: Math.max(cols[cols.length - 1].end, biz.plan) * 1.03,
    plan: biz.plan,
    planLabel: `Plan ${fmtBiz(biz.plan)}`,
    alt: `Where it sits today: ${cols.map((c) => `${c.label} ${c.valueLabel}`).join(", ")}, against a ${fmtBiz(biz.plan)} plan`,
    // A narrow email column: autopilot's long caption becomes a short one.
    cols: cols.map((c) => ({ k: c.key, l: c.label, s: c.key === "autopilot" ? "No action needed" : c.sub || undefined, v: c.valueLabel, a: c.start, b: c.end })),
  }
  const standing = gap > 0 ? `${fmtBiz(gap)} short of your ${fmtBiz(biz.plan)} plan` : `${fmtBiz(-gap)} ahead of your ${fmtBiz(biz.plan)} plan`

  const levers = (["content", "media", "ops"] as AgentId[]).sort((a, b) => leverDelivered(done, b).delivered - leverDelivered(done, a).delivered)
  const drill: Partial<Record<AgentId, ContentDelivered>> = { content: done.content, ops: done.ops }
  const delivered = levers.reduce((n, a) => n + leverDelivered(done, a).delivered, 0)
  const projected = levers.reduce((n, a) => n + leverDelivered(done, a).promised, 0)

  // The actions Claire can take by replying, numbered as her page numbers them.
  const replies = replyActions(tierView("approval", approved, policy, period).rows, asks, approvedBy, day, policy)
  const actions: DigestRow[] = replies.map((r) => ({ label: `${r.n} · ${r.label}`, note: r.note, value: r.row?.value, tone: r.kind === "approve" ? "warn" : undefined }))

  return {
    subject: `${quarter}: ${gap > 0 ? `${fmtBiz(gap)} short of plan, ${open.totalLabel} in the pipeline to close it` : `${fmtBiz(-gap)} ahead of plan`}`,
    preheader: deadline ? `${deadline.expiring} expires in ${deadline.days} days` : `${approval.effort} of your team's time unlocks ${approval.value}`,
    chart,
    hero: [`You're tracking to ${fmtBiz(pace)} in sales ${PERIOD_WORDS[period]}.`, `That's ${standing}.`],
    sections: [
      {
        title: "Where the money is",
        rows: [
          { label: "In the pipeline", note: open.byArea.map((a) => `${a.value} ${a.agent}`).join(" · "), value: open.totalLabel },
          { label: `${approval.effort} of your team's time unlocks`, value: approval.value },
          ...(deadline ? [{ label: `Expires in ${deadline.days} days`, value: deadline.expiring, tone: "warn" as const }] : []),
        ],
      },
      {
        title: `What we delivered · ${done.label}`,
        total: { note: `of ${fmtValue(projected)} projected`, value: fmtValue(delivered) },
        rows: levers.map((a) => {
          const l = leverDelivered(done, a)
          return { label: a, note: drill[a]?.did ?? l.reason, value: fmtValue(l.delivered) }
        }),
      },
      ...(actions.length ? [{ title: "Reply to act", rows: actions }] : []),
    ],
    reply: actions.length ? REPLY_LINE : undefined,
  }
}
