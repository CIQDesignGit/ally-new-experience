/**
 * Sends email through Resend's HTTP API (no SDK needed). The key stays on the
 * server (RESEND_API_KEY in .env / Vercel). Until a sending domain is verified,
 * Resend only delivers to the email that owns the Resend account.
 */

const FROM = process.env.EMAIL_FROM ?? "Ally by CommerceIQ <onboarding@resend.dev>"
/** A guard against a stuck button or a script: this many emails per address per hour. */
const PER_HOUR = 20
const sent = new Map<string, number[]>()

export type SendResult = { ok: true } | { ok: false; reason: "not-configured" | "rate-limited" | "provider-error"; detail?: string }

export async function sendEmail(msg: {
  to: string
  subject: string
  html: string
  text: string
  attachments?: { filename: string; content: string }[]
}): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.log(`[email] RESEND_API_KEY not set. Would have sent "${msg.subject}" to ${msg.to}`)
    return { ok: false, reason: "not-configured" }
  }

  const now = Date.now()
  const recent = (sent.get(msg.to) ?? []).filter((t) => now - t < 3_600_000)
  if (recent.length >= PER_HOUR) return { ok: false, reason: "rate-limited" }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to: [msg.to], subject: msg.subject, html: msg.html, text: msg.text, attachments: msg.attachments }),
    })
    if (!res.ok) {
      const detail = await res.text()
      console.error("[email] Resend refused:", res.status, detail)
      return { ok: false, reason: "provider-error", detail }
    }
    sent.set(msg.to, [...recent, now])
    return { ok: true }
  } catch (err) {
    console.error("[email] Resend request threw:", err)
    return { ok: false, reason: "provider-error" }
  }
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

/**
 * One email layout for everything Ally sends: wordmark, a headline, a few facts,
 * one button. Tables and inline styles, because that's what mail clients render.
 */
export function layout(o: { preheader: string; heading: string; lines: string[]; facts?: [string, string][]; cta?: { label: string; href: string }; footer: string; pre?: string }) {
  const facts = o.facts?.length
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0 4px;border-collapse:collapse">${o.facts
        .map(
          ([k, v]) =>
            `<tr><td style="padding:6px 24px 6px 0;color:#6B7280;font-size:13px">${esc(k)}</td><td style="padding:6px 0;color:#111827;font-size:15px;font-weight:600;font-family:ui-monospace,Menlo,monospace">${esc(v)}</td></tr>`,
        )
        .join("")}</table>`
    : ""
  const cta = o.cta
    ? `<a href="${esc(o.cta.href)}" style="display:inline-block;margin-top:24px;background:#875BF7;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 22px;border-radius:8px">${esc(o.cta.label)}</a>`
    : ""
  const pre = o.pre
    ? `<pre style="margin:20px 0 0;padding:16px;background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;white-space:pre-wrap;font-family:ui-monospace,Menlo,monospace;font-size:13px;line-height:1.55;color:#1F2937">${esc(o.pre)}</pre>`
    : ""
  return `<!doctype html><html><body style="margin:0;background:#F9FAFB;font-family:Inter,-apple-system,Segoe UI,Helvetica,Arial,sans-serif">
<span style="display:none;max-height:0;overflow:hidden">${esc(o.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;padding:32px 16px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
<tr><td style="padding:0 4px 16px;font-size:17px;font-weight:600;color:#210235">Commerce<span style="color:#7C3AED">IQ</span> <span style="color:#9CA3AF;font-weight:500">· Ally</span></td></tr>
<tr><td style="background:#ffffff;border:1px solid #E5E7EB;border-radius:12px;padding:32px">
<h1 style="margin:0;font-size:22px;line-height:1.3;color:#111827">${esc(o.heading)}</h1>
${o.lines.map((l) => `<p style="margin:12px 0 0;font-size:15px;line-height:1.55;color:#374151">${esc(l)}</p>`).join("")}
${facts}${pre}${cta}
</td></tr>
<tr><td style="padding:16px 4px 0;font-size:12px;color:#9CA3AF">${esc(o.footer)}</td></tr>
</table></td></tr></table></body></html>`
}

export interface Digest {
  subject: string
  preheader: string
  hero: string[]
  chart?: { min: number; max: number; plan: number; planLabel: string; alt: string; cols: { k: string; l: string; s?: string; v: string; a: number; b: number }[] }
  sections: { title: string; total?: { note: string; value: string }; /** One sentence under the title: what replying does. */ lead?: string; rows: { label: string; note?: string; /** A deadline at the end of the note, in amber. */ flag?: string; value?: string; tone?: "warn" | "done"; href?: string }[] }[]
  /** How to act by replying, shown right after the actions. */
  reply?: string
}

/** The summary email: the page's headline, then short sections with the money in a right-hand column. */
/**
 * Where email images load from. Inboxes can't reach localhost, so a test sent from a
 * laptop still points at the live site (set EMAIL_ASSET_ORIGIN to override).
 */
export function assetOrigin(origin: string) {
  if (process.env.EMAIL_ASSET_ORIGIN) return process.env.EMAIL_ASSET_ORIGIN
  return /localhost|127\.0\.0\.1/.test(origin) ? "https://content-agent-demo-dusky.vercel.app" : origin
}

/** The chart picture's address: the bridge's numbers ride in the URL, so the image always matches the email. */
export function chartUrl(chart: NonNullable<Digest["chart"]>, base: string) {
  const { min, max, plan, planLabel, cols } = chart
  // v changes whenever the chart design does, so no inbox shows a cached old picture.
  return `${base}/api/email/chart?v=2&d=${Buffer.from(JSON.stringify({ min, max, plan, planLabel, cols })).toString("base64url")}`
}

export function summaryHtml(d: Digest, origin: string, footer: string, images = assetOrigin(origin)) {
  const TONE = { warn: "#B54708", done: "#067647" } as const
  // Links only ever point inside Ally.
  const link = (href: string) => (href.startsWith("/") && !href.startsWith("//") ? `${origin}${href}` : origin)
  const section = (s: Digest["sections"][number]) => `
<tr><td style="padding:28px 0 6px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td style="font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#6B7280;vertical-align:bottom">${esc(s.title)}</td>
${s.total ? `<td style="text-align:right;white-space:nowrap;vertical-align:bottom;font-size:13px;color:#6B7280"><span style="font-family:ui-monospace,Menlo,monospace;font-size:17px;font-weight:700;color:#7C3AED">${esc(s.total.value)}</span> ${esc(s.total.note)}</td>` : ""}
</tr></table></td></tr>
${s.lead ? `<tr><td style="padding:0 0 10px;font-size:14px;line-height:1.5;color:#374151">${esc(s.lead)}</td></tr>` : ""}
${s.rows
  .map((r) => {
    const color = r.tone ? TONE[r.tone] : "#111827"
    const label = r.href
      ? `<a href="${esc(link(r.href))}" style="color:${color};text-decoration:none;font-weight:600">${esc(r.label)} &rsaquo;</a>`
      : `<span style="color:${color};font-weight:600">${esc(r.label)}</span>`
    return `<tr><td style="border-top:1px solid #F3F4F6;padding:10px 0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td style="font-size:14px;line-height:1.45;vertical-align:top">${label}${r.note || r.flag ? `<div style="color:#6B7280;font-size:13px;margin-top:2px">${esc(r.note ?? "")}${r.flag ? `${r.note ? " · " : ""}<span style="color:#B54708;font-weight:600">${esc(r.flag)}</span>` : ""}</div>` : ""}</td>
<td style="width:96px;text-align:right;vertical-align:top;font-size:15px;font-weight:600;color:${color};font-family:ui-monospace,Menlo,monospace;white-space:nowrap">${esc(r.value ?? "")}</td>
</tr></table></td></tr>`
  })
  .join("")}`
  return `<!doctype html><html><body style="margin:0;background:#F9FAFB;font-family:Inter,-apple-system,Segoe UI,Helvetica,Arial,sans-serif">
<span style="display:none;max-height:0;overflow:hidden">${esc(d.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;padding:32px 16px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px">
<tr><td style="padding:0 4px 16px;font-size:17px;font-weight:600;color:#210235">Commerce<span style="color:#7C3AED">IQ</span> <span style="color:#9CA3AF;font-weight:500">· Ally</span></td></tr>
<tr><td style="background:#ffffff;border:1px solid #E5E7EB;border-radius:12px;padding:32px">
<div style="font-size:15px;color:#374151">${esc(d.hero[0] ?? "")}</div>
<h1 style="margin:6px 0 0;font-size:24px;line-height:1.3;color:#111827">${esc(d.hero[1] ?? "")}</h1>
${
  d.chart
    ? `<div style="margin:28px 0 8px;font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#6B7280">Where it sits today</div>
<a href="${esc(`${origin}/claire-waterfall`)}" style="color:#6B7280;text-decoration:none"><img src="${esc(chartUrl(d.chart, images))}" width="536" alt="${esc(d.chart.alt)}" style="display:block;width:100%;max-width:536px;height:auto;border:0;color:#6B7280;font-size:13px;line-height:1.5" /></a>`
    : ""
}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${d.sections.map(section).join("")}</table>
${d.reply ? `<div style="margin-top:18px;background:#F5F3FF;border:1px solid #DDD6FE;border-radius:10px;padding:14px 16px;font-size:14px;line-height:1.5;color:#3B0764;font-weight:600">${esc(d.reply)}</div>` : ""}
<a href="${esc(`${origin}/claire-waterfall`)}" style="display:inline-block;margin-top:28px;background:#875BF7;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 22px;border-radius:8px">Open in Ally</a>
<div style="margin-top:14px;font-size:13px;color:#6B7280">The full summary is attached as a PDF.</div>
</td></tr>
<tr><td style="padding:16px 4px 0;font-size:12px;color:#9CA3AF">${esc(footer)}</td></tr>
</table></td></tr></table></body></html>`
}

export function summaryText(d: Digest, origin: string, footer: string) {
  const body = d.sections
    .map((s) => [`${s.title.toUpperCase()}${s.total ? `: ${s.total.value} ${s.total.note}` : ""}`, ...(s.lead ? [s.lead] : []), ...s.rows.map((r) => `- ${r.label}${r.value ? `: ${r.value}` : ""}${r.note || r.flag ? ` (${[r.note, r.flag].filter(Boolean).join(" · ")})` : ""}${r.href ? ` ${origin}${r.href}` : ""}`)].join("\n"))
    .join("\n\n")
  return `${d.hero.join(" ")}\n\n${body}${d.reply ? `\n\n${d.reply}` : ""}\n\nOpen in Ally: ${origin}/claire-waterfall\nThe full summary is attached as a PDF.\n\n${footer}`
}
