"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { startCompetition } from "@/components/competition/state"

/** Starts the competition demo from the top and opens Michelle's page. */
export default function StartCompetitionDemo() {
  const router = useRouter()
  useEffect(() => {
    startCompetition()
    router.replace("/michelle")
  }, [router])
  return null
}
