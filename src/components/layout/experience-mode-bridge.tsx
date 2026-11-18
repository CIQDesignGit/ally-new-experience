"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { DURATION, EASE_SWAP } from "@/lib/motion"
import {
  EXPERIENCE_TRANSITION_END_EVENT,
  EXPERIENCE_TRANSITION_EVENT,
  writeExperienceMode,
  type ExperienceTransitionDetail,
} from "@/lib/experience-mode"

/** Brief scrim while experience mode (and optional route) commits — one motion for every toggle. */
export function ExperienceModeBridge() {
  const router = useRouter()
  const busy = useRef(false)
  const [scrim, setScrim] = useState(false)

  useEffect(() => {
    const onTransition = (e: Event) => {
      const { next, href } = (e as CustomEvent<ExperienceTransitionDetail>).detail
      if (busy.current) return
      busy.current = true
      setScrim(true)

      const coverMs = Math.round(DURATION.calm * 1000)
      const revealMs = Math.round(DURATION.base * 1000)

      window.setTimeout(() => {
        writeExperienceMode(next)
        if (href) router.push(href)
      }, Math.round(coverMs * 0.82))

      window.setTimeout(() => setScrim(false), coverMs + 24)

      window.setTimeout(() => {
        busy.current = false
        window.dispatchEvent(new Event(EXPERIENCE_TRANSITION_END_EVENT))
      }, coverMs + revealMs + 24)
    }
    window.addEventListener(EXPERIENCE_TRANSITION_EVENT, onTransition)
    return () => window.removeEventListener(EXPERIENCE_TRANSITION_EVENT, onTransition)
  }, [router])

  return (
    <AnimatePresence>
      {scrim && (
        <motion.div
          key="experience-scrim"
          role="presentation"
          aria-hidden
          className="pointer-events-auto fixed inset-0 z-[200] bg-slate-950/30 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: DURATION.calm, ease: EASE_SWAP }}
        />
      )}
    </AnimatePresence>
  )
}