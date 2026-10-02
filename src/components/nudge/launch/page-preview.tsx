/* eslint-disable @next/next/no-img-element -- demo art composed from local photos */
"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { skuById } from "../data"
import { LAUNCH, LAUNCH_PAGES, NEW_SKUS, PAGE_FACTS } from "./data"
import { AdaptedImage } from "./images"

/**
 * A new SKU has no live page to compare against, so the review is the page
 * itself: the Amazon detail page as it will publish, with the gallery and its
 * carousel, the details and buy box, and the A+ content built from the concept.
 */

const KINDS = ["main", "lifestyle", "story"] as const

export function LaunchPagePreview({ skuId }: { skuId: string }) {
  const page = LAUNCH_PAGES.find((p) => p.skuId === skuId) ?? LAUNCH_PAGES[0]
  const facts = PAGE_FACTS[page.skuId]
  const sku = skuById(page.skuId)
  const [shown, setShown] = useState(0)
  const go = (d: number) => setShown((i) => (i + d + KINDS.length) % KINDS.length)

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {/* The browser frame, so it reads as the retailer's page, not ours. */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2">
        <span className="flex gap-1">
          <i className="size-2.5 rounded-full bg-slate-300" />
          <i className="size-2.5 rounded-full bg-slate-300" />
          <i className="size-2.5 rounded-full bg-slate-300" />
        </span>
        <span className="flex-1 truncate rounded-md bg-white px-2.5 py-1 font-mono text-[11px] text-slate-500 ring-1 ring-slate-200">amazon.com/dp/{sku.asin}</span>
        <span className="text-[11px] font-medium text-slate-500">Preview · publishes {LAUNCH.launch}</span>
      </div>

      <div className="px-6 py-5">
        <div className="text-[11px] text-slate-500">Home &amp; Kitchen › Home Décor › Candles &amp; Holders</div>

        <div className="mt-3 grid grid-cols-[52px_minmax(0,1.15fr)_minmax(0,1fr)_200px] gap-5">
          {/* Thumbnails */}
          <div className="flex flex-col gap-2">
            {KINDS.map((k, i) => (
              <button key={k} type="button" onClick={() => setShown(i)} aria-label={`Image ${i + 1}`} className={cn("overflow-hidden rounded-md ring-2", i === shown ? "ring-[#e77600]" : "ring-transparent hover:ring-slate-300")}>
                <AdaptedImage kind={k} photo={page.photo} focus={page.focus} notes={page.notes} story={page.story} cut={page.cut} facts={PAGE_FACTS[page.skuId]} bare />
              </button>
            ))}
          </div>

          {/* Main image with the carousel */}
          <div className="relative">
            <AdaptedImage kind={KINDS[shown]} photo={page.photo} focus={page.focus} notes={page.notes} story={page.story} cut={page.cut} facts={PAGE_FACTS[page.skuId]} bare />
            <button type="button" onClick={() => go(-1)} aria-label="Previous image" className="absolute top-1/2 left-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow ring-1 ring-slate-200 hover:bg-white">
              <ChevronLeft className="size-4" />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Next image" className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow ring-1 ring-slate-200 hover:bg-white">
              <ChevronRight className="size-4" />
            </button>
            <div className="mt-2 flex justify-center gap-1.5">
              {KINDS.map((k, i) => (
                <i key={k} className={cn("size-1.5 rounded-full", i === shown ? "bg-slate-700" : "bg-slate-300")} />
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="min-w-0">
            <div className="text-[13px] text-[#007185]">Visit the Aurelle Candles Store</div>
            <h3 className="mt-1 text-[18px] leading-snug font-normal text-slate-950">{page.title}</h3>
            <div className="mt-1.5 flex items-center gap-2 text-[13px] text-slate-500">
              <span className="flex text-slate-300">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className="size-3.5" />
                ))}
              </span>
              New listing · no reviews yet
            </div>
            <div className="mt-3 border-t border-slate-200 pt-3 text-[26px] text-slate-950">{facts.price}</div>
            <div className="mt-2 text-[13px] text-slate-700">
              <b className="font-semibold">Size:</b> {facts.size}
            </div>
            <div className="mt-3 text-[14px] font-semibold text-slate-950">About this item</div>
            <ul className="mt-1 list-disc pl-5 text-[13px] leading-relaxed text-slate-800">
              {page.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>

          {/* Buy box, as the shopper will see it (not clickable in a preview) */}
          <div className="h-fit rounded-lg border border-slate-200 px-4 py-3 text-[13px]" aria-hidden>
            <div className="text-[22px] text-slate-950">{facts.price}</div>
            <div className="mt-1 text-slate-600">Ships from launch day, {LAUNCH.launch}</div>
            <div className="mt-2 font-medium text-[#007600]">Available to pre-order</div>
            <div className="mt-3 rounded-full bg-[#ffd814] py-1.5 text-center text-slate-950">Add to Cart</div>
            <div className="mt-2 rounded-full bg-[#ffa41c] py-1.5 text-center text-slate-950">Buy Now</div>
          </div>
        </div>

        {/* A+ content: the concept carried down the page */}
        <div className="mt-8 border-t border-slate-200 pt-5">
          <div className="text-[16px] font-semibold text-slate-950">From the brand</div>
          <div className="relative mt-3 overflow-hidden rounded-lg" style={{ aspectRatio: "970 / 300" }}>
            <img src={LAUNCH.concept.src} alt="" className="absolute inset-0 size-full object-cover" style={{ objectPosition: "50% 60%", filter: "saturate(0.9) contrast(1.06) brightness(1.03) hue-rotate(-6deg)" }} />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
            <div className="absolute top-1/2 left-8 -translate-y-1/2 text-white">
              <div className="text-[11px] font-semibold tracking-[0.18em] uppercase opacity-80">Aurelle · Winter Hearth</div>
              <div className="mt-1 text-[32px] leading-tight" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                {LAUNCH.tagline}
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-3">
            {[
              { k: "Scent", v: facts.scent },
              { k: "Burn time", v: facts.burn },
              { k: "Ready to give", v: "Gift box included" },
            ].map((t) => (
              <div key={t.k} className="rounded-lg px-4 py-4 text-center" style={{ background: "#f6efe4", color: "#3b2a1c" }}>
                <div className="text-[11px] font-semibold tracking-[0.16em] uppercase opacity-70">{t.k}</div>
                <div className="mt-1 text-[16px]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                  {t.v}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-[14px] font-semibold text-slate-950">The Winter Hearth collection</div>
          <table className="mt-2 w-full text-[13px]">
            <tbody>
              <tr>
                <td className="w-[110px]" />
                {NEW_SKUS.map((s) => {
                  const p = LAUNCH_PAGES.find((x) => x.skuId === s.id)!
                  return (
                    <td key={s.id} className={cn("px-2 pb-2 text-center align-bottom", s.id === page.skuId && "bg-[#fff8e6]")}>
                      <div className="mx-auto w-20">
                        <AdaptedImage kind="main" photo={p.photo} focus={p.focus} notes={p.notes} story={p.story} cut={p.cut} facts={PAGE_FACTS[p.skuId]} bare />
                      </div>
                      <div className="mt-1 text-[12px] font-medium text-slate-950">{s.title.replace("Aurelle ", "").split(",")[0]}</div>
                    </td>
                  )
                })}
              </tr>
              {(["price", "size", "burn", "scent"] as const).map((f) => (
                <tr key={f} className="border-t border-slate-100">
                  <td className="py-1.5 text-slate-500">{{ price: "Price", size: "Size", burn: "Burn time", scent: "Scent" }[f]}</td>
                  {NEW_SKUS.map((s) => (
                    <td key={s.id} className={cn("px-2 py-1.5 text-center text-slate-800", s.id === page.skuId && "bg-[#fff8e6]")}>
                      {PAGE_FACTS[s.id][f]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
