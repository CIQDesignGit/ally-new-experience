"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { ArrowRight, Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { HarnessMock, IncrementalityMock, ShopperMock } from "./concept-mocks"

/** The demo's identity: whoever signs in is who Ally emails. Read by the email routes. */
export const SESSION_COOKIE = "ally_demo_email"

const SLIDES = [
  { tag: "Retail harness", title: "The world's first retail harness", Mock: HarnessMock },
  { tag: "Always on", title: "Agents that win AI shopping agents, 24/7", Mock: ShopperMock },
  { tag: "Retail media", title: "Incrementality for retail media", Mock: IncrementalityMock },
]
const SLIDE_MS = 6000

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Left: the concepts, rotating. Right: sign in with an email, no password. */
export function LoginScreen() {
  return (
    <main className="grid min-h-screen grid-cols-1 bg-white lg:grid-cols-[minmax(0,1.35fr)_minmax(440px,1fr)]">
      <Concepts />
      <SignIn />
    </main>
  )
}

function Concepts() {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const still = useReducedMotion()
  useEffect(() => {
    if (paused || still) return
    const t = window.setTimeout(() => setI((n) => (n + 1) % SLIDES.length), SLIDE_MS)
    return () => window.clearTimeout(t)
  }, [i, paused, still])
  const s = SLIDES[i]

  return (
    <section
      className="relative hidden overflow-hidden bg-[#210235] px-14 py-12 text-white lg:flex lg:flex-col"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="What CommerceIQ does"
    >
      {/* One soft light behind the mock; no gradients on text or surfaces. */}
      <div aria-hidden className="pointer-events-none absolute top-1/2 left-1/2 size-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/20 blur-[120px]" />

      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative mx-auto flex w-full max-w-[600px] flex-1 flex-col justify-center pb-6"
          aria-live="polite"
        >
          {/* Room for a two-line headline, so the mock doesn't jump between slides. */}
          <div className="flex min-h-[116px] flex-col justify-end">
            <div className="text-xs font-semibold tracking-[0.14em] text-[#C9B8FF] uppercase">{s.tag}</div>
          <h2 className="mt-3 text-[40px] leading-[1.1] font-semibold tracking-tight text-balance">{s.title}</h2>
          </div>
          <div className="mt-10">
            <s.Mock />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Story-style progress: each segment fills while its slide shows; click to jump. */}
      <div className="relative mx-auto flex w-full max-w-[600px] gap-2" role="tablist" aria-label="Choose a concept">
        {SLIDES.map((x, n) => (
          <button
            key={x.tag}
            type="button"
            role="tab"
            aria-selected={n === i}
            aria-label={x.title}
            onClick={() => setI(n)}
            className="group h-6 flex-1 py-2.5"
          >
            <span className="block h-1 overflow-hidden rounded-full bg-white/15 group-hover:bg-white/25">
              <span
                key={`${i}-${n}-${paused}`}
                className={cn("block h-full rounded-full bg-white", n < i && "w-full", n > i && "w-0")}
                style={
                  n === i
                    ? paused || still
                      ? { width: "100%", opacity: 0.6 }
                      : { width: 0, animation: `login-fill ${SLIDE_MS}ms linear forwards` }
                    : undefined
                }
              />
            </span>
          </button>
        ))}
      </div>
      <style>{`@keyframes login-fill { to { width: 100%; } }`}</style>
    </section>
  )
}

function SignIn() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [state, setState] = useState<"idle" | "busy" | "done">("idle")

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const value = email.trim().toLowerCase()
    if (!EMAIL.test(value)) {
      setError("Enter a valid email address")
      return
    }
    setError(null)
    setState("busy")
    // Per browser, so two people on the same link each stay themselves.
    document.cookie = `${SESSION_COOKIE}=${encodeURIComponent(value)}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`
    try {
      localStorage.setItem(SESSION_COOKIE, value)
    } catch {}
    const next = new URLSearchParams(window.location.search).get("next")
    window.setTimeout(() => {
      setState("done")
      router.push(next?.startsWith("/") ? next : "/claire-waterfall")
    }, 450)
  }

  return (
    <section className="flex min-h-screen flex-col px-8 py-10 sm:px-14">
      <div className="text-[19px] font-semibold tracking-tight text-[#210235]">
        Commerce<span className="text-brand-600">IQ</span>
      </div>

      <div className="flex flex-1 items-center">
        <form onSubmit={submit} noValidate className="w-full max-w-[380px]">
          <h1 className="text-[30px] leading-tight font-semibold tracking-tight text-slate-950">Welcome back to CommerceIQ</h1>

          <label htmlFor="email" className="mt-9 block text-sm font-medium text-slate-700">
            Work email
          </label>
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (error) setError(null)
            }}
            placeholder="you@company.com"
            aria-invalid={!!error}
            aria-describedby={error ? "email-error" : undefined}
            className={cn(
              "mt-2 h-12 w-full rounded-lg border bg-white px-4 text-[15px] text-slate-950 shadow-xs outline-none transition-colors placeholder:text-slate-400",
              error ? "border-error-500 focus:ring-2 focus:ring-error-100" : "border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100",
            )}
          />
          {/* The line is always there, so an error doesn't shift the form. */}
          <p id="email-error" role="alert" className="mt-2 min-h-5 text-sm text-error-600">
            {error}
          </p>

          <button
            type="submit"
            disabled={state !== "idle"}
            className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand-500 text-[15px] font-semibold text-white shadow-xs transition-colors hover:bg-brand-600 disabled:cursor-default disabled:opacity-90"
          >
            {state === "idle" && (
              <>
                Sign in <ArrowRight className="size-4" />
              </>
            )}
            {state === "busy" && <Loader2 className="size-4 animate-spin" aria-label="Signing in" />}
            {state === "done" && <Check className="size-4" aria-label="Signed in" />}
          </button>
        </form>
      </div>

      <div className="text-xs text-slate-400">© 2026 CommerceIQ</div>
    </section>
  )
}
