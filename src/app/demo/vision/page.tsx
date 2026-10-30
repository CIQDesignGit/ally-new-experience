"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { setMvp } from "@/components/nudge/mvp"

/** Back to the full vision demo (media and projections) on Claire's page. */
export default function StartVisionDemo() {
  const router = useRouter()
  useEffect(() => {
    setMvp(false)
    router.replace("/claire-waterfall")
  }, [router])
  return null
}
