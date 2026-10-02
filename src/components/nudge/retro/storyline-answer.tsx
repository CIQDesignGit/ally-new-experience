"use client"

import Link from "next/link"
import { PRIMARY } from "../mike/buttons"
import { RETRO, STORYLINE } from "./prime-day"

export const RETRO_QUESTION = "I need a deck on our Prime Day performance for Claire"
/** The chip's label: the task, short. */
export const RETRO_TASK = "Prime Day deck for Claire"

/** Ally runs the analysis first, then proposes the story it would tell; the storyboard is one click away. */
export function StorylineAnswer({ onOpen }: { onOpen?: () => void } = {}) {
  return (
    <div className="flex max-w-[860px] flex-col gap-5">
      <p className="text-[17px] leading-relaxed font-semibold text-slate-950">{RETRO.verdict}</p>
      <div>
        <div className="font-mono text-[11px] tracking-wide text-slate-500 uppercase">The storyline I&apos;d tell Claire</div>
        <ol className="mt-2 flex flex-col">
          {STORYLINE.map((b, i) => (
            <li key={b.title} className="grid grid-cols-[22px_minmax(0,1fr)] gap-3 border-t border-slate-100 py-2.5">
              <span className="font-mono text-[13px] text-slate-400">{i + 1}</span>
              <span>
                <span className="block text-[15px] font-semibold text-slate-950">{b.title}</span>
                <span className="block text-[13px] text-slate-500">{b.detail}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
      <div className="flex flex-wrap gap-2">
        {/* A new request is a new retro: it starts at the storyboard, never on an older deck. */}
        {onOpen ? (
          <button type="button" onClick={onOpen} className={PRIMARY}>
            Open storyboard
          </button>
        ) : (
          <Link href="/michelle/retro?new=1" className={PRIMARY}>
            Open storyboard
          </Link>
        )}
      </div>
      <div className="text-[13px] text-slate-500">{RETRO.sources}</div>
    </div>
  )
}
