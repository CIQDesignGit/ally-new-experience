"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { setMvp } from "@/components/nudge/mvp"

/** Turns on the MVP version of the demo (no media, no projected dollars) and opens Claire's page. */
export default function StartMvpDemo() {
  const router = useRouter()
  useEffect(() => {
    setMvp(true)
    router.replace("/claire-waterfall")
  }, [router])
  return null
}
