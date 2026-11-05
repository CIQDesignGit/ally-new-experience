"use client"

import { useState } from "react"
import { Check, FileText } from "lucide-react"
import { Points } from "../points"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { VISION_ONLY_LEVERS, fmtValue } from "../data"
import { useNudge } from "../nudge-context"
import { useMvp } from "../mvp"
import type { Brief, Play } from "../market"

const OWNER: Record<Play["owner"], string> = { content: "Ally for Content", media: "Ally for Media", ops: "Ally for Ops", human: "Your team" }
/** Where a launched play lands, said on the confirmation. */
const LANDS: Record<Play["owner"], string> = {
  content: "in Mike's inbox, one approval away",
  media: "with Ally for Media, one approval away",
  ops: "in Michelle's queue, one approval away",
  human: "in Reports as a brief",
}

/** Launch state for plays: a launched play is a work item on the bridge ("launch:<id>" in the shared state). */
export function useLaunch() {
  const { approved, approve } = useNudge()
  const isLaunched = (p: Play) => !!approved[`launch:${p.id}`]
  function launch(plays: Play[]) {
    const fresh = plays.filter((p) => !isLaunched(p))
    fresh.forEach((p) => approve(`launch:${p.id}`))
    if (fresh.length) {
      const agents = fresh.filter((p) => p.owner !== "human")
      toast.success(
        agents.length
          ? `${agents.length} ${agents.length === 1 ? "play" : "plays"} launched · +${fmtValue(agents.reduce((n, p) => n + p.quarter, 0))} this quarter, ${
              new Set(agents.map((p) => p.owner)).size === 1 ? LANDS[agents[0].owner] : "one approval away on your bridge"
            }`
          : "Brief drafted · in Reports",
      )
    }
  }
  return { isLaunched, launch }
}

/** The plays on offer: the MVP drops those for a vision-only lever, and a brief that counted on one reads its MVP version. */
export const offered = (plays: Play[], mvp: boolean) => (mvp ? plays.filter((p) => !VISION_ONLY_LEVERS.includes(p.owner)).map((p) => (p.mvpBrief ? { ...p, brief: p.mvpBrief } : p)) : plays)
export const agentPlays = (plays: Play[]) => plays.filter((p) => p.owner !== "human")
export const humanPlays = (plays: Play[]) => plays.filter((p) => p.owner === "human")
export const annual = (plays: Play[]) => plays.reduce((n, p) => n + p.annual, 0)
/** Event plays land inside the quarter; the rest are yearly run-rate gains. */
export const unit = (plays: Play[]) => (plays.every((p) => p.annual === p.quarter) ? "this quarter" : "a year")

/** "Your product team" reads "your product team" mid-sentence; a name ("Claire and…") keeps its capital. */
const midSentence = (to: string) => (/^Your\b/.test(to) ? `y${to.slice(1)}` : to)

/** A brief Ally drafted for a person's decision: sections as bullets, then the decision. */
export function BriefDoc({ brief }: { brief: Brief }) {
  const [decided, setDecided] = useState<string | null>(null)
  return (
    <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-25 px-5 py-3 text-sm">
        <span className="flex items-center gap-2 font-semibold text-slate-950">
          <FileText className="size-4 text-brand-600" /> Drafted by Ally · {brief.kind}
        </span>
        <span className="text-slate-500">For {midSentence(brief.to)}</span>
      </div>
      <div className="px-5 py-4">
        <div className="text-base font-semibold text-slate-950">{brief.title}</div>
        <div className="mt-3 flex flex-col gap-3.5">
          {brief.sections.map((sec) => (
            <div key={sec.heading}>
              <div className="text-xs font-medium text-slate-500">{sec.heading}</div>
              <Points className="mt-1.5" items={sec.points} />
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
          {decided ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success-700">
              <Check className="size-4" /> {decided === "Not now" ? "Parked for now" : `${decided === "Approve" ? "Approved" : decided} · sent to ${midSentence(brief.to)}`}
            </span>
          ) : (
            <>
              <span className="mr-1 text-sm font-medium text-slate-950">{brief.decision.ask}</span>
              {brief.decision.options.map((o, i) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => {
                    setDecided(o)
                    if (o !== "Not now") toast.success(`${brief.kind} sent to ${midSentence(brief.to)}`)
                  }}
                  className={cn(
                    "rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors",
                    i === 0 ? "bg-brand-500 text-white hover:bg-brand-600" : "border border-slate-200 text-slate-800 hover:bg-slate-50",
                  )}
                >
                  {o}
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/** The plays for a finding, each with its own action on its row: Launch for Ally's plays, Draft brief for your team's. */
export function PlayList({ plays: all }: { plays: Play[] }) {
  const { isLaunched, launch } = useLaunch()
  const [openBrief, setOpenBrief] = useState<string | null>(null)
  const plays = offered(all, useMvp())
  if (!plays.length) return <div className="text-sm text-slate-500">No move needed here.</div>
  return (
    <div className="flex flex-col">
      <div className="text-xs font-medium text-slate-500">What Ally can do</div>
      {plays.map((p) => {
        const done = isLaunched(p)
        const brief = p.owner === "human"
        return (
          <div key={p.id} className="border-t border-slate-100 py-3 first-of-type:border-t-0">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm text-slate-950">{p.what}</div>
              <div className="mt-0.5 text-xs text-slate-500">
                {OWNER[p.owner]} · <span className="font-mono font-semibold text-slate-700">+{fmtValue(p.annual)}</span> {unit([p])}
              </div>
            </div>
            {done && brief && p.brief ? (
              <button
                type="button"
                onClick={() => setOpenBrief(openBrief === p.id ? null : p.id)}
                className="shrink-0 rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                {openBrief === p.id ? "Hide brief" : "View brief"}
              </button>
            ) : done ? (
              <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-success-700">
                <Check className="size-4" /> {brief ? "Drafted" : "Launched"}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  launch([p])
                  if (brief) setOpenBrief(p.id)
                }}
                className={cn(
                  "shrink-0 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors",
                  brief ? "border border-slate-200 text-slate-800 hover:bg-slate-50" : "bg-brand-500 text-white hover:bg-brand-600",
                )}
              >
                {brief ? "Draft brief" : "Launch"}
              </button>
            )}
          </div>
          {openBrief === p.id && p.brief && <BriefDoc brief={p.brief} />}
          </div>
        )
      })}
    </div>
  )
}
