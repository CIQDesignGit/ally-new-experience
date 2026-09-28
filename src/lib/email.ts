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
