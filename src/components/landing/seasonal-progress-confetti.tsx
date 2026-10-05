"use client"

import { useEffect, useRef } from "react"
import { Confetti, type ConfettiRef } from "@/components/ui/confetti"

/** Success greens + a brand accent — canvas-confetti needs colour values. */
const COLORS = [
  "#10b981",
  "#059669",
  "#34d399",
  "#a7f3d0",
  "#1f22b2",
  "#fcd34d",
]

/** Soft burst over the progress strip — fires when `burstKey` increments. */
export function SeasonalProgressConfetti({ burstKey }: { burstKey: number }) {
  const canvasRef = useRef<ConfettiRef>(null)

  useEffect(() => {
    if (burstKey === 0) return

    void canvasRef.current?.fire({
      particleCount: 28,
      angle: 90,
      spread: 70,
      startVelocity: 18,
      gravity: 0.95,
      decay: 0.92,
      ticks: 120,
      origin: { x: 0.22, y: 0.55 },
      scalar: 0.45,
      colors: COLORS,
      disableForReducedMotion: true,
    })
  }, [burstKey])

  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl"
    >
      <Confetti
        ref={canvasRef}
        manualstart
        globalOptions={{ resize: true, useWorker: false }}
        className="absolute inset-0 size-full"
      />
    </span>
  )
}
