"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"
import { AnswerCard } from "../chat/inline-chat"
import { PRIMARY, SECONDARY } from "../mike/buttons"
import { AVAILABLE, type LibrarySkill } from "./data"
import { statusOf, turnOn, useLibrary } from "./state"

/**
 * A question answered with the library first: Ally names the skill that does
 * it and offers to turn it on. On, it goes straight to the work; "Not what I
 * need" is where a request to the engineers starts.
 */
export function LibraryMatch({ skillId, go, goLabel }: { skillId: string; /** Where the work starts once it's on. */ go: string; goLabel: string }) {
  const lib = useLibrary()
  const skill = AVAILABLE.find((s) => s.id === skillId) as LibrarySkill
  const status = statusOf(skill, lib)
  const [declined, setDeclined] = useState(false)

  if (declined) {
    return (
      <AnswerCard>
        <p className="text-slate-700">Tell me what you need instead, and I&apos;ll ask our engineers to build it.</p>
      </AnswerCard>
    )
  }

  return (
    <AnswerCard>
      <p className="font-semibold text-slate-950">
        {status === "On" ? `${skill.name} is on.` : `We have this in your library: ${skill.name}.`}
      </p>
      <p className="mt-1 text-[14px] text-slate-600">{skill.does}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {status === "On" ? (
          <>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-success-700">
              <Check className="size-4" aria-hidden /> On
            </span>
            <Link href={go} className={PRIMARY}>
              {goLabel} <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </>
        ) : (
          <>
            <button type="button" onClick={() => turnOn(skill)} className={PRIMARY}>
              Turn on
            </button>
            <button type="button" onClick={() => setDeclined(true)} className={SECONDARY}>
              Not what I need
            </button>
          </>
        )}
      </div>
    </AnswerCard>
  )
}
