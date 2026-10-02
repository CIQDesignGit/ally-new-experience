/* eslint-disable @next/next/no-img-element -- demo art composed from local photos with CSS crops, masks and grades */
"use client"

import { cn } from "@/lib/utils"
import { LAUNCH } from "./data"

/**
 * The agency's one concept, and what Ally makes from it per SKU, composed from
 * the brand's own photos: a crop on the product, a winter grade, frost at the
 * edges, and the tagline lockup. Amazon's main image stays on pure white.
 */

const GRADE = "saturate(0.9) contrast(1.06) brightness(1.03) hue-rotate(-6deg)"

function Frost() {
  return (
    <>
      {/* Cold light from the window side, warm fire stays. */}
      <i aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(196,222,240,0.32), rgba(196,222,240,0) 45%)", mixBlendMode: "soft-light" }} />
      <i aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(120% 90% at 50% 55%, transparent 60%, rgba(236,244,250,0.55) 100%)" }} />
    </>
  )
}

function Lockup({ small }: { small?: boolean }) {
  return (
    <div className={cn("absolute left-0 right-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent text-white", small ? "px-2.5 pt-6 pb-2" : "px-6 pt-16 pb-5")}>
      <div className={cn("font-semibold tracking-[0.18em] uppercase opacity-80", small ? "text-[7px]" : "text-[11px]")}>Aurelle · Winter Hearth</div>
      <div className={cn("font-serif leading-tight", small ? "text-[12px]" : "text-[30px]")} style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
        {LAUNCH.tagline}
      </div>
    </div>
  )
}

/** The concept as the agency sent it. */
export function ConceptImage({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-xl bg-slate-900", className)} style={{ aspectRatio: "16 / 9" }}>
      <img src={LAUNCH.concept.src} alt="Agency concept: an amber jar candle lit on a wooden table before a stone hearth fire, frost at the window" className="absolute inset-0 size-full object-cover" style={{ filter: GRADE }} />
      <Frost />
      <Lockup />
    </div>
  )
}

/** One adapted image for one SKU. */
export function AdaptedImage({ kind, photo, focus, notes, story, main }: { kind: "main" | "lifestyle" | "story"; photo: string; focus: string; notes: string[]; story: string; main: { zoom: number; mask: string } }) {
  if (kind === "main")
    return (
      <figure className="relative aspect-square overflow-hidden rounded-lg bg-white ring-1 ring-slate-200">
        {/* Pure white, product centered and filling the frame: Amazon's main-image rule. */}
        <img
          src={photo}
          alt="Main image: the product on pure white"
          className="absolute inset-0 size-full object-cover"
          style={{ objectPosition: focus, transform: `scale(${main.zoom})`, transformOrigin: focus, filter: "brightness(1.08) contrast(1.04)", WebkitMaskImage: `radial-gradient(${main.mask}, #000 78%, transparent 100%)`, maskImage: `radial-gradient(${main.mask}, #000 78%, transparent 100%)` }}
        />
        <Caption>Main · white</Caption>
      </figure>
    )
  if (kind === "lifestyle")
    return (
      <figure className="relative aspect-square overflow-hidden rounded-lg bg-slate-900 ring-1 ring-slate-200">
        <img src={photo} alt="Lifestyle image in the Winter Hearth concept" className="absolute inset-0 size-full object-cover" style={{ objectPosition: focus, filter: GRADE }} />
        <Frost />
        <Lockup small />
        <Caption light>Lifestyle</Caption>
      </figure>
    )
  return (
    <figure className="relative grid aspect-square grid-cols-2 overflow-hidden rounded-lg ring-1 ring-slate-200" style={{ background: "#f6efe4" }}>
      <div className="relative overflow-hidden">
        <img src={photo} alt="" className="absolute inset-0 size-full object-cover" style={{ objectPosition: focus, transform: "scale(1.6)", transformOrigin: focus, filter: GRADE }} />
      </div>
      <div className="flex flex-col justify-center gap-1.5 px-2.5" style={{ color: "#3b2a1c" }}>
        <div className="text-[7px] font-semibold tracking-[0.18em] uppercase opacity-70">{story === "Gift" ? "Ready to give" : "Notes of"}</div>
        {notes.map((n) => (
          <div key={n} className="border-t border-[#3b2a1c]/15 pt-1 text-[11px] leading-tight" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
            {n}
          </div>
        ))}
      </div>
      <Caption>{story === "Gift" ? "Gift" : "Scent notes"}</Caption>
    </figure>
  )
}

function Caption({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return <figcaption className={cn("absolute top-1.5 left-1.5 rounded px-1.5 py-0.5 text-[10px] font-medium", light ? "bg-black/45 text-white" : "bg-white/90 text-slate-700 ring-1 ring-slate-200")}>{children}</figcaption>
}
