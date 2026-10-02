import { NextRequest, NextResponse } from "next/server"
import { SESSION_COOKIE } from "@/lib/session"
import { layout, sendEmail, summaryHtml, summaryText } from "@/lib/email"
import type { Digest } from "@/lib/email"

/**
 * Everything Ally emails in the demo goes to whoever is signed in on this
 * browser: they play the person receiving it (Mike when Claire nudges content,
 * Dana when Michelle sends her note). The address comes from the cookie, never the request body.
 */
type Body =
  | { kind: "nudge"; batchName: string; description: string; value: string; skus?: number; deadlineDays?: number; recipient?: "mike" | "michelle"; queuePath?: string }
  | { kind: "summary"; quarter: string; filename: string; pdfBase64: string; digest?: Digest }
  | { kind: "note"; subject: string; body: string; skus: number; issues: number }
  | { kind: "alert"; name: string; watches: string; when: string; now: string }

const NAME = { mike: "Mike", michelle: "Michelle" } as const

export async function POST(request: NextRequest) {
  const to = request.cookies.get(SESSION_COOKIE)?.value
  if (!to) return NextResponse.json({ ok: false, reason: "signed-out" }, { status: 401 })
  const b = (await request.json()) as Body
  const origin = new URL(request.url).origin
  const footer = `Sent to ${to} from the Ally demo.`

  let msg: Parameters<typeof sendEmail>[0]
  if (b.kind === "nudge") {
    const who = NAME[b.recipient ?? "mike"]
    const when = b.deadlineDays ? `${b.deadlineDays} days to act` : undefined
    const subject = `Claire nudged you: ${b.batchName} · ${b.value}`
    const facts: [string, string][] = [["Value", b.value]]
    if (b.skus) facts.push(["SKUs", String(b.skus)])
    if (when) facts.push(["Window", when])
    const href = `${origin}${b.queuePath ?? "/mike"}`
    msg = {
      to,
      subject,
      html: layout({
        preheader: `${b.batchName} · ${b.value}${when ? ` · ${when}` : ""}`,
        heading: `Claire nudged you on ${b.batchName}`,
        lines: [`Hi ${who},`, b.description],
        facts,
        cta: { label: "Open in Ally", href },
        footer: `${footer} You're receiving it as ${who}.`,
      }),
      text: `Hi ${who},\n\nClaire nudged you on ${b.batchName}.\n${b.description}\n\n${facts.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nOpen in Ally: ${href}\n\n${footer}`,
    }
  } else if (b.kind === "summary") {
    // A PDF of a few pages; anything far bigger isn't ours.
    if (!b.pdfBase64 || b.pdfBase64.length > 8_000_000) return NextResponse.json({ ok: false, reason: "bad-attachment" }, { status: 400 })
    const attachments = [{ filename: b.filename, content: b.pdfBase64 }]
    const d = b.digest
    msg =
      d && Array.isArray(d.sections) && Array.isArray(d.hero)
        ? { to, subject: d.subject, html: summaryHtml(d, origin, footer), text: summaryText(d, origin, footer), attachments }
        : {
            to,
            subject: `Your Ally summary · ${b.quarter}`,
            html: layout({
              preheader: `The ${b.quarter} summary, attached as a PDF`,
              heading: `Your ${b.quarter} summary`,
              lines: ["The summary is attached as a PDF, every section expanded, ready to forward to your team."],
              cta: { label: "Open in Ally", href: `${origin}/claire-waterfall` },
              footer,
            }),
            text: `Your ${b.quarter} summary is attached as a PDF.\n\nOpen in Ally: ${origin}/claire-waterfall\n\n${footer}`,
            attachments,
          }
  } else if (b.kind === "note") {
    msg = {
      to,
      subject: b.subject,
      html: layout({
        preheader: `${b.skus} SKUs across ${b.issues} ${b.issues === 1 ? "issue" : "issues"}`,
        heading: b.subject,
        lines: [],
        pre: b.body,
        footer: `${footer} You're receiving it as Dana, the vendor manager.`,
      }),
      text: `${b.body}\n\n${footer}`,
    }
  } else if (b.kind === "alert") {
    // A custom alert firing: the rule Michelle wrote, and where the number is now.
    const href = `${origin}/michelle/alerts`
    msg = {
      to,
      subject: `Ally alert: ${b.name}`,
      html: layout({
        preheader: b.now,
        heading: b.now,
        lines: ["Hi Michelle,", `Your alert "${b.name}" just fired.`],
        facts: [
          ["Watches", b.watches],
          ["Alerts when", b.when],
        ],
        cta: { label: "Open in Ally", href },
        footer: `${footer} You're receiving it as Michelle.`,
      }),
      text: `Hi Michelle,\n\nYour alert "${b.name}" just fired.\n${b.now}\n\nWatches: ${b.watches}\nAlerts when: ${b.when}\n\nOpen in Ally: ${href}\n\n${footer}`,
    }
  } else {
    return NextResponse.json({ ok: false, reason: "unknown-kind" }, { status: 400 })
  }

  // Local only: return the email instead of sending it, to check the design.
  if (process.env.NODE_ENV !== "production" && request.headers.get("x-email-preview") === "1") {
    return NextResponse.json({ ok: true, to, preview: { subject: msg.subject, html: msg.html, text: msg.text } })
  }

  const result = await sendEmail(msg)
  return NextResponse.json({ ...result, to })
}
