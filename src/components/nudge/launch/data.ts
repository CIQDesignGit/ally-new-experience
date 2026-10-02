import type { Sku } from "@/components/home/types"

/**
 * Use case 7, bring Ally new information: the brand team's launch email and
 * the agency's concept. Ally keeps the facts (Yes / No / Just for me), adapts
 * the one concept into images per SKU within each retailer's rules, and sends
 * the 3 new pages for one approval. Value stays the queue item's $420K.
 */

export const LAUNCH = {
  name: "Winter Hearth collection",
  launch: "Nov 9",
  due: "Nov 6",
  value: "$420K",
  tagline: "Gather round the glow",
  concept: { name: "Gather round the glow · agency concept.jpg", size: "4.2 MB", src: "/images/aurelle/soy-candle-golden-hour.jpg", kind: "image" as const },
}

/** What Mike uploads: the brand team's email and the agency's concept. */
export const LAUNCH_FILES = [{ name: "Re: Winter Hearth launch.eml", size: "38 KB", src: "", kind: "email" as const }, LAUNCH.concept]

export const LAUNCH_EMAIL = `From Priya (brand team): We're the official candle of the Hudson Valley Winter Market, Nov 13–15. We're launching 3 new SKUs on Nov 9: Winter Hearth Jar, Cedar Ember Pillar and Frost Fig Travel Tin Trio. The agency's concept is attached; the tagline is "Gather round the glow." Legal: no "non-toxic" claims on anything.`

/** What's new in the email, each one Michelle or Mike can keep for Ally. */
export const LAUNCH_FACTS = [
  { id: "event", text: "Aurelle is the official candle of the Hudson Valley Winter Market, Nov 13–15", scope: "Events" },
  { id: "launch", text: "Winter Hearth Jar, Cedar Ember Pillar and Frost Fig Travel Tin Trio launch Nov 9", scope: "Launches" },
  { id: "tagline", text: "Winter Hearth tagline: Gather round the glow", scope: "Content" },
  { id: "legal", text: "Never claim \"non-toxic\" on any product", scope: "Content · Legal" },
] as const

/** The rules Ally applied per retailer when adapting the concept. */
export const RETAILER_CHECKS = [
  { retailer: "Amazon", rules: ["Main image on pure white, product fills 85% of the frame", "At least 2,000 px on the long side, under 10 MB", "No text or logos added to the main image"] },
  { retailer: "Walmart", rules: ["Lifestyle images in slots 2–4", "Title cut to 75 characters"] },
  { retailer: "Target", rules: ["No promo language on any image", "Scent notes in the second bullet"] },
]

/** The 3 new SKUs. Two are previewed with their images; all three get drafted. */
export const NEW_SKUS: Sku[] = [
  {
    id: "sku-new-1",
    asin: "B0DWH16OZ1",
    productId: "9900010001",
    category: "Home Fragrance",
    brand: "Aurelle Candles",
    title: "Aurelle Winter Hearth Soy Jar Candle, 16 oz",
    thumbnailUrl: "/images/aurelle/soy-candle-golden-hour.jpg",
    metrics: { compliance: 0, seo: 0, aeo: 0, ops: 0 },
    salsifyIssues: [],
    lastUpdated: "New",
    pimSyncedOn: "2026-10-07",
    aiSyncedOn: "2026-10-07",
    actionStatus: "to-do",
  },
  {
    id: "sku-new-2",
    asin: "B0DFF3TRIO",
    productId: "9900010002",
    category: "Home Fragrance",
    brand: "Aurelle Candles",
    title: "Aurelle Frost Fig Travel Tin Trio, 3 × 4 oz",
    thumbnailUrl: "/images/aurelle/soy-candle-trio-gift-set.jpg",
    metrics: { compliance: 0, seo: 0, aeo: 0, ops: 0 },
    salsifyIssues: [],
    lastUpdated: "New",
    pimSyncedOn: "2026-10-07",
    aiSyncedOn: "2026-10-07",
    actionStatus: "to-do",
  },
  {
    id: "sku-new-3",
    asin: "B0DCEPLR03",
    productId: "9900010003",
    category: "Home Fragrance",
    brand: "Aurelle Candles",
    title: "Aurelle Cedar Ember Pillar Candle, 3 × 6 in",
    thumbnailUrl: "/images/aurelle/travel-tin-candle.jpg",
    metrics: { compliance: 0, seo: 0, aeo: 0, ops: 0 },
    salsifyIssues: [],
    lastUpdated: "New",
    pimSyncedOn: "2026-10-07",
    aiSyncedOn: "2026-10-07",
    actionStatus: "to-do",
  },
]

/** Each previewed SKU's page: its three images from the concept, and its copy. */
export const LAUNCH_PAGES = [
  {
    skuId: "sku-new-1",
    photo: "/images/aurelle/soy-candle-golden-hour.jpg",
    focus: "50% 62%",
    /** The white main image: how far to zoom on the product, and the white mask around it. */
    main: { zoom: 1.55, mask: "26% 44% at 50% 52%" },
    title: "Aurelle Winter Hearth Soy Jar Candle, 16 oz · Cedar, Clove and Vanilla · Gather round the glow",
    bullets: ["Hand-poured soy wax in an amber glass jar, 60-hour burn", "Notes of cedar, clove and warm vanilla", "Gift-ready for the holidays"],
    notes: ["Cedar", "Clove", "Vanilla"],
    story: "Notes",
    removed: "\"non-toxic soy\" from the agency's draft bullet, per Legal's rule in the brief",
  },
  {
    skuId: "sku-new-2",
    photo: "/images/aurelle/soy-candle-trio-gift-set.jpg",
    focus: "48% 58%",
    main: { zoom: 1.2, mask: "50% 38% at 50% 58%" },
    title: "Aurelle Frost Fig Travel Tin Trio, 3 × 4 oz · Fig, Pine and Snow Musk · Gather round the glow",
    bullets: ["Three travel candles, 20-hour burn each", "Notes of black fig, pine and snow musk", "Arrives in a gift box, ready to give"],
    notes: ["Black fig", "Pine", "Snow musk"],
    story: "Gift",
    removed: undefined,
  },
]

/** What Ally keeps from the brief: one fact, recalled later when it matters. */
export const LAUNCH_MEMORY = {
  id: "launch-winter-hearth",
  text: "3 new Winter Hearth SKUs launch Nov 9",
  source: "Priya's launch brief",
}

/** Retail readiness for the 3 new SKUs: two are ready, the travel tin trio is blocked on Walmart attributes. */
export const LAUNCH_READINESS = [
  { name: "Winter Hearth Jar", ready: true },
  { name: "Cedar Ember Pillar", ready: true },
  { name: "Frost Fig Travel Tin Trio", ready: false, missing: ["Burn time", "Wick type", "Item form", "Safety warning"], retailer: "Walmart" },
]
