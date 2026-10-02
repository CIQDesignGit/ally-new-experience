"use client"

import { createContext, useContext, useRef, useState } from "react"
import { Check, ImagePlus, Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SkuBackgroundSection } from "../types"

type SceneId = "porch" | "moon" | "patch"
export type Applied = { scene: SceneId | "upload"; upload: string | null }

/**
 * Backgrounds applied this session, per SKU, shared by the composer, the SKU
 * pane footer and the rail's checkmarks. Switching SKUs shows that SKU's own state.
 */
const BackgroundContext = createContext<{
  applied: Record<string, Applied>
  apply: (skuId: string, bg: Applied) => void
  last: Applied | null
} | null>(null)

export function BackgroundProvider({ children }: { children: React.ReactNode }) {
  const [applied, setApplied] = useState<Record<string, Applied>>({})
  const [last, setLast] = useState<Applied | null>(null)
  return (
    <BackgroundContext.Provider
      value={{
        applied,
        last,
        apply: (skuId, bg) => {
          setApplied((a) => ({ ...a, [skuId]: bg }))
          setLast(bg)
        },
      }}
    >
      {children}
    </BackgroundContext.Provider>
  )
}

export function useBackgrounds() {
  return useContext(BackgroundContext) ?? { applied: {} as Record<string, Applied>, apply: () => {}, last: null }
}

export const sceneLabel = (bg: Applied) => (bg.scene === "upload" ? "your upload" : SCENES.find((s) => s.id === bg.scene)!.label)

/** Three ready-made Halloween scenes, drawn in SVG so the demo works without uploads. */
const SCENES: { id: SceneId; label: string }[] = [
  { id: "porch", label: "Dusk porch" },
  { id: "moon", label: "Full moon" },
  { id: "patch", label: "Pumpkin patch" },
]

function Pumpkin({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M19 6c0-3 1-5 4-6-2 2-2 4-2 6z" fill="#3f6212" />
      <ellipse cx="11" cy="21" rx="9" ry="13" fill="#ea580c" />
      <ellipse cx="29" cy="21" rx="9" ry="13" fill="#ea580c" />
      <ellipse cx="20" cy="21" rx="9" ry="14" fill="#f97316" />
      <path d="M13 17l4 3h-5zM27 17l-4 3h5zM13 26q7 5 14 0l-2 2-2-1-2 2-2-2-2 1z" fill="#1c1917" />
    </g>
  )
}

function Bat({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${s})`}
      fill="#0c0a09"
      d="M32 8c1.5-3 2.5-4 3-6 .5 2 1 3 1.5 4 4-4 12-5 19-2 3 1 6 3 8.5 6-3-1-6-1-8 1 0 3-3 5-6 5-1-3-4-4-7-3-2 1-4 3-6 5-2-2-4-4-6-5-3-1-6 0-7 3-3 0-6-2-6-5-2-2-5-2-8-1C2.5 7 5.5 5 8.5 4c7-3 15-2 19 2 .5-1 1-2 1.5-4 .5 2 1.5 3 3 6z"
    />
  )
}

export function Scene({ id, className }: { id: SceneId; className?: string }) {
  return (
    <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden>
      <defs>
        <linearGradient id={`sky-${id}`} x1="0" y1="0" x2="0" y2="1">
          {id === "porch" && (
            <>
              <stop offset="0" stopColor="#3b0764" />
              <stop offset="0.6" stopColor="#9a3412" />
              <stop offset="1" stopColor="#f97316" />
            </>
          )}
          {id === "moon" && (
            <>
              <stop offset="0" stopColor="#0f172a" />
              <stop offset="1" stopColor="#312e81" />
            </>
          )}
          {id === "patch" && (
            <>
              <stop offset="0" stopColor="#7c2d12" />
              <stop offset="1" stopColor="#fdba74" />
            </>
          )}
        </linearGradient>
      </defs>
      <rect width="400" height="240" fill={`url(#sky-${id})`} />
      {id === "moon" && <circle cx="300" cy="70" r="46" fill="#fef3c7" opacity="0.95" />}
      {id === "porch" && <circle cx="330" cy="48" r="22" fill="#fde68a" opacity="0.8" />}
      {id === "porch" && (
        <>
          <rect x="0" y="190" width="400" height="50" fill="#292524" />
          <rect x="0" y="186" width="400" height="6" fill="#44403c" />
        </>
      )}
      {id === "moon" && <path d="M0 200 Q100 170 200 195 T400 185 V240 H0z" fill="#020617" />}
      {id === "patch" && <path d="M0 195 Q200 175 400 195 V240 H0z" fill="#422006" />}
      <Bat x={40} y={30} s={0.7} />
      <Bat x={250} y={20} s={0.5} />
      {id !== "patch" && <Bat x={150} y={60} s={0.4} />}
      <Pumpkin x={20} y={id === "patch" ? 188 : 168} s={1.4} />
      <Pumpkin x={330} y={id === "patch" ? 190 : 172} s={1.2} />
      {id === "patch" && (
        <>
          <Pumpkin x={120} y={200} s={0.9} />
          <Pumpkin x={240} y={198} s={1} />
        </>
      )}
    </svg>
  )
}

/**
 * The creative Ally is missing for a concepts SKU: a Halloween background. Mike
 * picks a scene or uploads his own, previews the product on it, and applies it.
 * The product photo sits on the scene as a framed card (a real cut-out needs
 * background removal, which this demo doesn't pretend to do).
 */
export function BackgroundComposer({ section, thumbnailUrl, skuId, onNext }: { section: SkuBackgroundSection; thumbnailUrl?: string; skuId: string; onNext?: () => void }) {
  const bgs = useBackgrounds()
  const applied = bgs.applied[skuId] ?? null
  // Start from this SKU's background, else the last one used, so going one by one is quick.
  const start = applied ?? bgs.last
  const [choice, setChoice] = useState<SceneId | "upload">(start?.scene ?? "porch")
  const [upload, setUpload] = useState<string | null>(start?.upload ?? null)
  const fileRef = useRef<HTMLInputElement>(null)
  const dirty = !applied || applied.scene !== choice || applied.upload !== upload

  function onFile(file?: File) {
    if (!file) return
    setUpload(URL.createObjectURL(file))
    setChoice("upload")
  }

  const background = (scene: SceneId | "upload", src: string | null) =>
    scene === "upload" && src ? <img src={src} alt="Your background" className="absolute inset-0 size-full object-cover" /> : <Scene id={scene === "upload" ? "porch" : scene} className="absolute inset-0 size-full" />

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-25 px-5 py-2.5">
        <span className="text-sm font-semibold text-slate-950">{section.label}</span>
        <span className="text-xs text-slate-500">Your input</span>
      </div>

      <div className="grid grid-cols-2 divide-x divide-slate-100">
        <div className="px-5 py-4">
          <div className="mb-2.5 font-mono text-[11px] tracking-wide text-slate-400 uppercase">Live on Amazon</div>
          <div className="relative h-40 overflow-hidden rounded-md bg-slate-100">
            <img src={thumbnailUrl} alt={section.liveLabel} className="size-full object-cover" />
            <span className="absolute bottom-1.5 left-1.5 rounded bg-white/90 px-1.5 py-0.5 text-[11px] font-medium text-slate-500 shadow-xs">{section.liveLabel}</span>
          </div>
        </div>
        <div className="bg-brand-25/40 px-5 py-4">
          <div className="mb-2.5 font-mono text-[11px] tracking-wide text-brand-600 uppercase">With your background</div>
          {applied ? (
            <div className="relative h-40 overflow-hidden rounded-md ring-2 ring-success-300">
              {background(applied.scene, applied.upload)}
              {/* The product, placed on the scene. */}
              <img
                src={thumbnailUrl}
                alt="Product on the Halloween background"
                className="absolute top-1/2 left-1/2 h-[72%] -translate-x-1/2 -translate-y-[46%] rounded-md object-cover shadow-lg ring-2 ring-white/80"
              />
              <span className="absolute top-1.5 left-1.5 rounded bg-success-600 px-1.5 py-0.5 text-[11px] font-semibold text-white shadow-xs">Halloween main image</span>
            </div>
          ) : (
            <div className="flex h-40 flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-slate-300 bg-white text-center text-sm text-slate-500">
              <ImagePlus className="size-5 text-slate-400" />
              Pick a background below, then apply it
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-slate-100 px-5 py-4">
        <div className="mb-2.5 text-xs font-medium text-slate-500">Background</div>
        <div className="flex flex-wrap items-stretch gap-2.5">
          {SCENES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setChoice(s.id)}
              aria-pressed={choice === s.id}
              className={cn(
                "group w-28 overflow-hidden rounded-lg border bg-white text-left transition-colors",
                choice === s.id ? "border-brand-400 ring-2 ring-brand-100" : "border-slate-200 hover:border-brand-300",
              )}
            >
              <div className="relative h-16">
                <Scene id={s.id} className="absolute inset-0 size-full" />
              </div>
              <div className="flex items-center justify-between px-2 py-1.5 text-xs text-slate-700">
                {s.label}
                {choice === s.id && <Check className="size-3.5 text-brand-600" />}
              </div>
            </button>
          ))}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            aria-pressed={choice === "upload"}
            className={cn(
              "flex w-28 flex-col overflow-hidden rounded-lg border bg-white text-left transition-colors",
              choice === "upload" ? "border-brand-400 ring-2 ring-brand-100" : "border-dashed border-slate-300 hover:border-brand-300",
            )}
          >
            <div className="relative flex h-16 items-center justify-center bg-slate-50">
              {upload ? <img src={upload} alt="Your background" className="absolute inset-0 size-full object-cover" /> : <Upload className="size-4 text-slate-400" />}
            </div>
            <div className="px-2 py-1.5 text-xs text-slate-700">{upload ? "Your upload" : "Upload your own"}</div>
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />

          <div className="ml-auto flex items-center gap-3 self-end">
            {!dirty && onNext && (
              <button type="button" onClick={onNext} className="text-sm font-medium text-brand-700 hover:underline">
                Next SKU →
              </button>
            )}
            {dirty ? (
              <button
                type="button"
                onClick={() => bgs.apply(skuId, { scene: choice, upload })}
                disabled={choice === "upload" && !upload}
                className="rounded-md border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-800 shadow-xs transition-colors hover:border-brand-300 hover:text-brand-700 disabled:opacity-50"
              >
                Apply to this SKU
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-1 py-2 text-sm font-medium text-success-700">
                <Check className="size-4" />
                Applied
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
