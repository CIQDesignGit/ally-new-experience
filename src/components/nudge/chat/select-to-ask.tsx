"use client"

import { useEffect, useRef, useState } from "react"
import { Sparkles } from "lucide-react"

/** Fired with the selected text; the Ask bar shows it as a quote above the input. */
export const QUOTE_EVENT = "ally-quote"

/**
 * Select-to-ask, the way Claude and ChatGPT do it: highlight a number, a row or
 * a line anywhere inside, and an "Ask Ally" pill appears by the selection. It
 * quotes the selection into the Ask bar; the answer lands on this page.
 */
export function SelectToAsk({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [pill, setPill] = useState<{ x: number; y: number; text: string } | null>(null)

  useEffect(() => {
    const onUp = () => {
      // After the browser settles the selection.
      window.setTimeout(() => {
        const sel = window.getSelection()
        const text = sel?.toString().replace(/\s+/g, " ").trim() ?? ""
        if (!sel || sel.rangeCount === 0 || text.length < 2 || text.length > 240 || !ref.current?.contains(sel.anchorNode)) return setPill(null)
        const r = sel.getRangeAt(0).getBoundingClientRect()
        setPill({ x: Math.min(r.right, window.innerWidth - 120), y: r.top, text })
      }, 0)
    }
    const hide = () => setPill(null)
    document.addEventListener("mouseup", onUp)
    window.addEventListener("scroll", hide, true)
    return () => {
      document.removeEventListener("mouseup", onUp)
      window.removeEventListener("scroll", hide, true)
    }
  }, [])

  return (
    <div ref={ref} className={className}>
      {children}
      {pill && (
        <button
          type="button"
          // Keep the selection while clicking the pill.
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            window.dispatchEvent(new CustomEvent(QUOTE_EVENT, { detail: pill.text }))
            window.getSelection()?.removeAllRanges()
            setPill(null)
          }}
          style={{ left: pill.x, top: pill.y - 40 }}
          className="fixed z-50 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-[13px] font-medium text-white shadow-lg hover:bg-slate-800"
        >
          <Sparkles className="size-3.5" /> Ask Ally
        </button>
      )}
    </div>
  )
}
