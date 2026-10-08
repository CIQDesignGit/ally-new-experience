"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

/** Context lives in Teach Ally now; old links land there. */
export default function ContextPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/settings?tab=context")
  }, [router])
  return null
}
