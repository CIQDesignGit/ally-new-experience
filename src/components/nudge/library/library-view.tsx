"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Check, ChevronRight, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { PRIMARY, SECONDARY } from "../mike/buttons"
import { useCompetition } from "../../competition/state"
import { CORE, CORE_DASHBOARDS, CORE_SCHEDULED, LOCKED, availableFor, type LibrarySkill } from "./data"
import { statusOf, turnOn, useLibrary } from "./state"

const HEAD = "font-mono text-xs tracking-wide text-slate-500 uppercase"

/**
 * The library: what CommerceIQ has built from its work across brands. Core
 * alerts on for everyone, then what this account can turn on, then what its
 * tier doesn't include yet.
 */
export function LibraryView() {
  // Competition watch joins once it's live: published by an engineer, or built in this account's chat.
  const available = availableFor(useCompetition())
  return (
    <div className="flex flex-col gap-10">
      <section>
        <div className={HEAD}>On for everyone</div>
        <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
          {/* Three groups, each one row; the list behind it opens in place. */}
          <CoreGroup title="Scheduled" skills={CORE_SCHEDULED} open />
          <CoreGroup title="Alerts" skills={CORE} />
          <CoreGroup title="Dashboards" skills={CORE_DASHBOARDS} open />
        </div>
      </section>

      <section>
        <div className={HEAD}>Available</div>
        <div className="mt-3 grid gap-4 lg:grid-cols-3">
          {available.map((s) => (
            <SkillCard key={s.id} skill={s} />
          ))}
        </div>
      </section>

      <section>
        <div className={HEAD}>Not included</div>
        <div className="mt-3 grid gap-4 lg:grid-cols-3">
          {LOCKED.map((s) => (
            <SkillCard key={s.id} skill={s} />
          ))}
        </div>
      </section>
    </div>
  )
}

/** One group of what's on for everyone: a row with its count, opening to the skills in it. */
function CoreGroup({ title, skills, open: startOpen = false }: { title: string; skills: LibrarySkill[]; open?: boolean }) {
  const [open, setOpen] = useState(startOpen)
  return (
    <div className="border-t border-slate-100 first:border-t-0">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex w-full items-center gap-2 px-5 py-3 text-left hover:bg-slate-50">
        <ChevronRight className={cn("size-4 text-slate-400 transition-transform", open && "rotate-90")} aria-hidden />
        <span className="flex-1 text-sm font-semibold text-slate-950">
          {title} <span className="font-mono font-normal text-slate-500">{skills.length}</span>
        </span>
        <span className="inline-flex items-center gap-1 text-sm text-success-700">
          <Check className="size-3.5" aria-hidden /> On
        </span>
      </button>
      {open && (
        <div className="pb-1">
          {skills.map((s) => (
            <div key={s.id} className="grid grid-cols-[minmax(0,240px)_minmax(0,1fr)_auto] items-baseline gap-6 px-5 py-2.5 pl-11">
              <span className="text-sm font-medium text-slate-950">{s.name}</span>
              <span className="text-sm text-slate-500">{s.does}</span>
              {s.output ? (
                <Link href={s.output.href} className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
                  Open <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              ) : (
                <span />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SkillCard({ skill }: { skill: LibrarySkill }) {
  const lib = useLibrary()
  const status = statusOf(skill, lib)
  // A skill that needs the customer's input asks for it before it turns on.
  const [asking, setAsking] = useState(false)
  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="text-[15px] font-semibold text-slate-950">{skill.name}</div>
        <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{skill.gives}</span>
      </div>
      <p className="mt-1.5 text-sm leading-snug text-slate-500">{skill.does}</p>
      {skill.builtFor && <p className="mt-1.5 text-[13px] font-medium text-slate-700">Built in chat for {skill.builtFor} · private</p>}
      <div className="mt-auto pt-4">
        {status === "On" ? (
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="inline-flex items-center gap-1 font-medium text-success-700">
              <Check className="size-4" aria-hidden /> On
            </span>
            {skill.output && (
              <Link href={skill.output.href} className="inline-flex items-center gap-1 font-medium text-brand-700 hover:underline">
                Open <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            )}
          </div>
        ) : status === "Ready by tomorrow" ? (
          <div className="text-sm">
            <span className="font-medium text-slate-950">Ready by tomorrow</span>
            <span className="block text-slate-500">Working from your file</span>
          </div>
        ) : status === "Locked" ? (
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <Lock className="size-3.5" aria-hidden /> {skill.tier}
          </div>
        ) : asking ? (
          <div className="flex flex-col gap-2 text-sm">
            <span className="text-slate-700">Needs {skill.needs?.charAt(0).toLowerCase()}{skill.needs?.slice(1)}</span>
            <div className="flex gap-2">
              <button type="button" onClick={() => turnOn(skill)} className={PRIMARY}>
                Send file
              </button>
              <button type="button" onClick={() => setAsking(false)} className={SECONDARY}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => (skill.needs ? setAsking(true) : turnOn(skill))} className={cn(PRIMARY, "w-fit")}>
            Turn on
          </button>
        )}
      </div>
    </div>
  )
}
