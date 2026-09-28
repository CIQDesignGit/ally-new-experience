import { NextRequest, NextResponse } from "next/server"
import { SESSION_COOKIE, SESSION_MAX_AGE, checkEmail } from "@/lib/session"

/** Sign in: check the email, then remember it in this browser only. */
export async function POST(request: NextRequest) {
  const { email } = (await request.json().catch(() => ({}))) as { email?: string }
  const check = checkEmail(email)
  if (!check.ok) return NextResponse.json({ ok: false, reason: check.reason }, { status: 400 })
  const res = NextResponse.json({ ok: true, email: check.email })
  res.cookies.set(SESSION_COOKIE, check.email, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  })
  return res
}

/** Who's signed in here (for "Signed in as"). */
export async function GET(request: NextRequest) {
  return NextResponse.json({ email: request.cookies.get(SESSION_COOKIE)?.value ?? null })
}

/** Switch email: forget this browser's sign-in. */
export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete(SESSION_COOKIE)
  return res
}
