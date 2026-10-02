/* eslint-disable @next/next/no-img-element -- demo art composed from local photos with CSS clips, crops and grades */
"use client"

import { cn } from "@/lib/utils"
import { LAUNCH } from "./data"
import type { Cut } from "./data"

/**
 * The agency's one concept, and the Amazon image set Ally makes from it per
 * SKU, composed from the brand's own photos: the product traced out of its
 * photo onto pure white (Amazon's main-image rule), a lifestyle shot graded to
 * the concept, and an infographic with the product, its notes and its facts.
 */

const GRADE = "saturate(0.9) contrast(1.06) brightness(1.03) hue-rotate(-6deg)"
const PHOTO = { w: 800, h: 436 }

function Frost() {
  return (
    <>
      <i aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(196,222,240,0.32), rgba(196,222,240,0) 45%)", mixBlendMode: "soft-light" }} />
      <i aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(120% 90% at 50% 55%, transparent 60%, rgba(236,244,250,0.55) 100%)" }} />
    </>
  )
}

function Lockup({ small }: { small?: boolean }) {
  return (
    <div className={cn("absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent text-white", small ? "px-2.5 pt-6 pb-2" : "px-6 pt-16 pb-5")}>
      <div className={cn("font-semibold tracking-[0.18em] uppercase opacity-80", small ? "text-[7px]" : "text-[11px]")}>Aurelle · Winter Hearth</div>
      <div className={cn("leading-tight", small ? "text-[13px]" : "text-[30px]")} style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
        {LAUNCH.tagline}
      </div>
    </div>
  )
}

/** The concept as the agency sent it. */
export function ConceptImage({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn("relative overflow-hidden rounded-xl bg-slate-900", className)} style={{ aspectRatio: "16 / 9" }}>
      <img src={LAUNCH.concept.src} alt="Agency concept: an amber jar candle lit on a wooden table before a stone hearth fire, frost at the window" className="absolute inset-0 size-full object-cover" style={{ filter: GRADE }} />
      <Frost />
      <Lockup small={compact} />
    </div>
  )
}

/**
 * The product traced out of its photo: each shape is a polygon (in % of the
 * photo), drawn as its own clipped copy so a trio stays three objects. Sized so
 * the product fills `fill` of the frame, centered, on whatever is behind it.
 */
export function Cutout({ cut, fill = 0.82, shadow = true }: { cut: Cut; fill?: number; shadow?: boolean }) {
  const [x0, y0, x1, y1] = cut.bbox
  const a = PHOTO.w / PHOTO.h
  const bw = (x1 - x0) / 100
  const bh = (y1 - y0) / 100
  const k = fill / Math.max(bh, bw * a)
  const cx = (x0 + x1) / 200
  const cy = (y0 + y1) / 200
  const style = { width: `${k * a * 100}%`, left: `${50 - cx * k * a * 100}%`, top: `${50 - cy * k * 100}%` }
  return (
    <>
      {shadow && <i aria-hidden className="absolute left-1/2 -translate-x-1/2 rounded-[50%] bg-black/25 blur-md" style={{ width: `${bw * k * a * 85}%`, height: "7%", top: `${50 + (bh * k * 100) / 2 - 4}%` }} />}
      {cut.shapes.map((shape) => (
        <img key={shape} src={cut.src} alt="" className="absolute max-w-none" style={{ ...style, clipPath: `polygon(${shape})` }} />
      ))}
    </>
  )
}

/** One image of a SKU's Amazon image set. */
export function AdaptedImage({ kind, photo, focus, notes, story, cut, facts, bare }: { kind: "main" | "lifestyle" | "story"; photo: string; focus: string; notes: string[]; story: string; cut: Cut; facts: { burn: string; size: string }; /** No labels: as the shopper sees it. */ bare?: boolean }) {
  if (kind === "main")
    return (
      <figure className="relative aspect-square overflow-hidden rounded-lg bg-white ring-1 ring-slate-200">
        <Cutout cut={cut} />
        {!bare && <Caption>Main · white</Caption>}
      </figure>
    )
  if (kind === "lifestyle")
    return (
      <figure className="relative aspect-square overflow-hidden rounded-lg bg-slate-900 ring-1 ring-slate-200">
        <img src={photo} alt="Lifestyle image in the Winter Hearth concept" className="absolute inset-0 size-full object-cover" style={{ objectPosition: focus, filter: GRADE }} />
        <Frost />
        <Lockup small />
        {!bare && <Caption light>Lifestyle</Caption>}
      </figure>
    )
  return (
    <figure className="relative flex aspect-square flex-col overflow-hidden rounded-lg ring-1 ring-slate-200" style={{ background: "#f6efe4", color: "#3b2a1c" }}>
      <div className="grid min-h-0 flex-1 grid-cols-[1.05fr_1fr]">
        <div className="flex items-center">
          {/* The cutout sizes against a square, so give it one. */}
          <div className="relative aspect-square w-full">
            <Cutout cut={cut} fill={0.86} />
          </div>
        </div>
        <div className="flex flex-col justify-center gap-[6%] pr-[8%]">
          <div className="text-[7px] font-semibold tracking-[0.2em] uppercase opacity-60">{story === "Gift" ? "Ready to give" : "Notes of"}</div>
          {notes.map((n) => (
            <div key={n} className="flex items-center gap-1.5 text-[11px] leading-none" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              <i className="size-1 shrink-0 rounded-full bg-[#b07a3c]" />
              {n}
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-around border-t border-[#3b2a1c]/10 bg-[#efe5d6] py-[4%] text-[8px] font-semibold tracking-[0.12em] uppercase">
        <span>{facts.burn}</span>
        <span>{facts.size}</span>
        <span>Soy wax</span>
      </div>
      {!bare && <Caption>Infographic</Caption>}
    </figure>
  )
}

function Caption({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return <figcaption className={cn("absolute top-1.5 left-1.5 rounded px-1.5 py-0.5 text-[10px] font-medium", light ? "bg-black/45 text-white" : "bg-white/90 text-slate-700 ring-1 ring-slate-200")}>{children}</figcaption>
}
