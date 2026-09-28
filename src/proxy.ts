import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { SESSION_COOKIE } from "@/lib/session"

/** Every page needs a signed-in email (it's where Ally's emails go). Sign-in brings you back where you were. */
export function proxy(request: NextRequest) {
  if (request.cookies.get(SESSION_COOKIE)?.value) return NextResponse.next()
  const url = new URL("/login", request.url)
  const { pathname, search } = request.nextUrl
  if (pathname !== "/") url.searchParams.set("next", pathname + search)
  return NextResponse.redirect(url)
}

export const config = {
  // Pages only: not sign-in itself, the API, Next's files, or anything with a file extension (images, fonts).
  matcher: ["/((?!login|api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
