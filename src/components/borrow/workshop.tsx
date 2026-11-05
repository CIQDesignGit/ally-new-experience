"use client"

import { useEffect, useState } from "react"
import { FileCode2, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Line, UseCase } from "./data"
import { FDE } from "./data"

/** Delay before each line, by kind: tool calls take longer than their output. */
const PACE: Record<Line["kind"], number> = { user: 900, think: 700, tool: 850, out: 450, file: 500, ok: 500, warn: 600 }

const MARK: Record<Line["kind"], { sign: string; className: string }> = {
  user: { sign: ">", className: "text-white" },
  think: { sign: "✻", className: "text-[#c4b5fd] italic" },
  tool: { sign: "●", className: "text-[#93c5fd]" },
  out: { sign: "⎿", className: "text-slate-400" },
  file: { sign: "✎", className: "text-[#86efac]" },
  ok: { sign: "✓", className: "text-[#86efac]" },
  warn: { sign: "!", className: "text-[#fcd34d]" },
}

/**
 * Step 1: a scripted Claude Code session. The FDE's ask, then tool calls through
 * the data MCP, files written, and the customization moment. Plays once per
 * use case; Replay starts it over.
 */
export function Workshop({ uc, onDone }: { uc: UseCase; onDone: () => void }) {
  const [shown, setShown] = useState(0)
  const lines = uc.workshop.lines
  const done = shown >= lines.length

  useEffect(() => {
    if (done) {
      onDone()
      return
    }
    const t = window.setTimeout(() => setShown((n) => n + 1), PACE[lines[shown].kind])
    return () => window.clearTimeout(t)
  }, [shown, done, lines, onDone])

  // A file lights up once a line mentions it (by its name, without the extension).
  const base = (p: string) => p.split("/").pop()!.split(".")[0]
  const written = uc.workshop.files.filter((f) => lines.slice(0, shown).some((l) => l.text.includes(base(f.path))))

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_300px] gap-4 max-lg:grid-cols-1">
      <div className="overflow-hidden rounded-2xl bg-[#1e1b2e] shadow-pane-lg ring-1 ring-slate-900/10">
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" aria-hidden />
          <span className="size-2.5 rounded-full bg-[#febc2e]" aria-hidden />
          <span className="size-2.5 rounded-full bg-[#28c840]" aria-hidden />
          <span className="ml-2 font-mono text-xs text-slate-400">claude · aurelle-candles · {FDE}</span>
          <button type="button" onClick={() => setShown(0)} className="ml-auto inline-flex items-center gap-1 rounded px-2 py-1 font-mono text-xs text-slate-400 hover:bg-white/10 hover:text-white">
            <RotateCcw className="size-3" aria-hidden /> Replay
          </button>
        </div>
        <div className="flex min-h-[420px] flex-col gap-1.5 px-5 py-4 font-mono text-[13px] leading-relaxed">
          <div className="text-slate-500">✻ Connected to CommerceIQ data MCP · Aurelle Candles · Amazon US</div>
          <div className="mt-2 flex gap-2 text-white">
            <span className="text-slate-400">&gt;</span>
            <span>{uc.workshop.ask}</span>
          </div>
          {lines.slice(0, shown).map((l, i) => (
            <div key={i} className={cn("flex gap-2", l.kind === "out" && "pl-4", l.kind === "user" && "mt-2")}>
              <span className={cn("shrink-0", l.kind === "user" ? "text-slate-400" : MARK[l.kind].className)}>{MARK[l.kind].sign}</span>
              <span className={MARK[l.kind].className}>{l.kind === "file" ? `Wrote ${l.text}` : l.text}</span>
            </div>
          ))}
          {!done && <div className="mt-1 h-4 w-2 animate-pulse bg-slate-400" aria-hidden />}
        </div>
      </div>

      <aside className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-xs ring-1 ring-slate-200">
        <div className="text-[13px] font-medium text-slate-500">Files</div>
        {uc.workshop.files.map((f) => {
          const on = done || written.includes(f)
          return (
            <div key={f.path} className={cn("flex gap-2.5 transition-opacity", on ? "opacity-100" : "opacity-35")}>
              <FileCode2 className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden />
              <div className="min-w-0">
                <div className="truncate font-mono text-[12px] text-slate-950">{f.path}</div>
                <div className="text-[12px] leading-snug text-slate-500">{f.note}</div>
              </div>
            </div>
          )
        })}
      </aside>
    </div>
  )
}
