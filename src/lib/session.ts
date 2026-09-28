/**
 * The demo's identity: the email someone signs in with. Kept in a per-browser
 * cookie, so two presenters on the same link each get their own inbox.
 * No database: the browser carries it, the server reads it on each request.
 */
export const SESSION_COOKIE = "ally_demo_email"
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Who may sign in: ALLOWED_EMAIL_DOMAINS, comma-separated ("*" = anyone). Default: CommerceIQ only. */
export function allowedDomains(): string[] | "any" {
  const raw = (process.env.ALLOWED_EMAIL_DOMAINS ?? "commerceiq.ai").trim()
  if (raw === "*") return "any"
  return raw
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean)
}

export function checkEmail(input: unknown): { ok: true; email: string } | { ok: false; reason: string } {
  const email = String(input ?? "").trim().toLowerCase()
  if (!EMAIL.test(email)) return { ok: false, reason: "Enter a valid email address" }
  const domains = allowedDomains()
  const domain = email.split("@")[1]
  if (domains !== "any" && !domains.includes(domain)) {
    return { ok: false, reason: `Use your ${domains.map((d) => `@${d}`).join(" or ")} email` }
  }
  return { ok: true, email }
}
