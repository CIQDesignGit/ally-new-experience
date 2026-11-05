"use client"

import { toast } from "sonner"

/** Ask the server to email the signed-in person, and say plainly what happened. */
export async function emailMe(payload: Record<string, unknown>, { quiet = false } = {}) {
  try {
    const res = await fetch("/api/email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    const r = (await res.json()) as { ok: boolean; to?: string; reason?: string; detail?: string }
    if (r.ok) {
      if (!quiet) toast.success(`Emailed to ${r.to}`)
      return true
    }
    const why =
      r.reason === "not-configured"
        ? "Email isn't set up yet (no Resend key)"
        : r.reason === "rate-limited"
          ? "That's 20 emails this hour. Try again later."
          : r.reason === "signed-out"
            ? "Sign in again to get emails"
            : r.detail?.includes("testing emails")
              ? "Resend only delivers to its account owner until a domain is verified"
              : "Couldn't send the email"
    toast.error(why)
  } catch {
    toast.error("Couldn't send the email")
  }
  return false
}
