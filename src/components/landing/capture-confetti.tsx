"use client"

import { useEffect, useRef } from "react"
import { Confetti, type ConfettiRef } from "@/components/ui/confetti"

// canvas-confetti paints onto a canvas, so these have to be colour values
// rather than Tailwind classes — brand purple through the chart ramp.
const COLORS = ["#1f22b2", "#c231ff", "#5aafff", "#f79009", "#5c62de", "#db7dff"]
const GLOBAL = { resize: true, useWorker: false } as const

/** Matches the note's entrance delay so the burst lands with the pill. */
const START_DELAY_MS = 250

/**
 * One pop as the capture note arrives. Lives inside the note so the canvas
 * inherits its fade and travels with it on the way out.
 */
export function CaptureConfetti() {
  const canvasRef = useRef<ConfettiRef>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void canvasRef.current?.fire({
        particleCount: 34,
        angle: 90,
        spread: 96,
        startVelocity: 22,
        gravity: 0.85,
        decay: 0.92,
        ticks: 150,
        origin: { x: 0.5, y: 0.5 },
        scalar: 0.5,
        colors: COLORS,
        disableForReducedMotion: true,
      })
    }, START_DELAY_MS)

    return () => window.clearTimeout(timer)
  }, [])

  return (
    <span className="pointer-events-none absolute top-1/2 left-1/2 h-56 w-80 -translate-x-1/2 -translate-y-1/2">
      <Confetti
        ref={canvasRef}
        manualstart
        globalOptions={GLOBAL}
        className="block size-full"
      />
    </span>
  )
}
