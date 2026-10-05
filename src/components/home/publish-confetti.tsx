"use client"

import { useEffect, useRef } from "react"
import confetti from "canvas-confetti"

const COLORS = ["#1f22b2", "#c231ff", "#5aafff", "#f79009", "#5c62de", "#db7dff"]

/** Matches the canvas CSS box (`size-64`) so we can keep `resize: false`. */
const SIZE = 256

/** Centre of the canvas, which is itself centred on the popper icon. */
const ORIGIN = { x: 0.5, y: 0.5 }

/**
 * Sonner fades/slides the toast for 400ms. Firing during that transition makes
 * the burst hitch (opacity + transform on ancestors + canvas resize).
 */
const START_DELAY_MS = 450

/**
 * Burst that leaves the popper icon it is nested inside. Uses a fixed-size
 * canvas (no resize) so the buffer never clears mid-flight.
 */
export function PublishConfetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = SIZE
    canvas.height = SIZE

    const fire = confetti.create(canvas, { resize: false, useWorker: false })
    let cancelled = false

    const startId = window.setTimeout(() => {
      if (cancelled) return

      // One pop after the toast has settled — double-burst felt stuttery.
      void fire({
        particleCount: 52,
        angle: 65,
        spread: 62,
        startVelocity: 28,
        gravity: 1,
        decay: 0.9,
        ticks: 200,
        origin: ORIGIN,
        scalar: 0.55,
        colors: COLORS,
        disableForReducedMotion: false,
      })
    }, START_DELAY_MS)

    return () => {
      cancelled = true
      window.clearTimeout(startId)
      fire.reset()
    }
  }, [])

  return (
    <div className="pointer-events-none absolute top-1/2 left-1/2 z-20 size-64 -translate-x-1/2 -translate-y-1/2">
      <canvas
        ref={canvasRef}
        width={SIZE}
        height={SIZE}
        className="block size-full"
        aria-hidden
      />
    </div>
  )
}
