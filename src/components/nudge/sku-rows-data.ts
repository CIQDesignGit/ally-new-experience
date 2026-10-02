import type { SkuRow, SkuSection } from "./types"

const NEW = { changed: true }

function text(label: string, live: string[], draft: { text: string; changed?: boolean }[]): SkuSection {
  return { kind: "text", label, live, draft }
}

function input(label: string, live: string, placeholder: string): SkuSection {
  return { kind: "input", label, live, placeholder }
}

function image(label: string, liveLabel: string, draftLabel: string): SkuSection {
  return { kind: "image", label, liveLabel, draftLabel }
}

/**
 * Per-SKU multi-section Live vs. Ally-draft content for the "See all N SKUs"
 * expand list — real Aurelle catalog rows (sku-1..sku-10), matching the
 * mock's SKUSETS structure (title/bullets/image, or search-terms/attributes).
 */
export const SKU_ROWS: Record<string, SkuRow[]> = {
  halloween: [
    {
      skuId: "sku-1",
      sections: [
        text(
          "Title",
          ["Aurelle Candles Noir Cherry Large Scented Jar Candle, 22 oz, Home Fragrance Gift"],
          [{ text: "Halloween Aurelle Candles Noir Cherry Large Scented Jar, 22 oz, Spooky Party Décor, 150-Hr Burn", ...NEW }],
        ),
        text(
          "Bullet points",
          ["Rich black cherry with warm spice undertones.", "Up to 150 hours from a single 22 oz jar."],
          [
            { text: "Rich black cherry with warm spice undertones." },
            { text: "Up to 150 hours from a single 22 oz jar." },
            { text: "Save 20% October 1–31 with the on-page coupon.", ...NEW },
          ],
        ),
        image("Primary image", "Standard pack shot", "Halloween pack shot"),
      ],
    },
    {
      skuId: "sku-2",
      sections: [
        text(
          "Title",
          ["Bright Citrus Zest Hand-Poured Soy Jar Candle, 14 oz, Scented Candles for Home"],
          [{ text: "Halloween Bright Citrus Zest Hand-Poured Soy Jar Candle, 14 oz, Fall Hosting Décor, 90-Hr Burn", ...NEW }],
        ),
        text(
          "Bullet points",
          ["Grapefruit and lemon zest over clean soy.", "Small-batch soy wax with a lead-free cotton wick."],
          [
            { text: "Grapefruit and lemon zest over clean soy." },
            { text: "Small-batch soy wax with a lead-free cotton wick." },
            { text: "Save 20% October 1–31 with the on-page coupon.", ...NEW },
          ],
        ),
        image("Primary image", "Standard pack shot", "Halloween pack shot"),
      ],
    },
    {
      skuId: "sku-3",
      sections: [
        text(
          "Title",
          ["Warm Amber Floral Soy Jar Candle, 16 oz, Best Seller"],
          [{ text: "Halloween Warm Amber Floral Soy Jar Candle, 16 oz, Autumn Mantel Décor, 110-Hr Burn", ...NEW }],
        ),
        text(
          "Bullet points",
          ["Amber resin layered with soft florals.", "Wide 16 oz vessel for a consistent melt pool."],
          [
            { text: "Amber resin layered with soft florals." },
            { text: "Wide 16 oz vessel for a consistent melt pool." },
            { text: "Save 20% October 1–31 with the on-page coupon.", ...NEW },
          ],
        ),
        image("Primary image", "Standard pack shot", "Halloween pack shot"),
      ],
    },
    {
      skuId: "sku-5",
      sections: [
        text(
          "Title",
          ["Room-Filling Spiced Cedar Three-Wick Soy Candle, 21 oz, Large Candle"],
          [{ text: "Halloween Room-Filling Spiced Cedar Three-Wick Soy Candle, 21 oz, Fall Centerpiece Décor, 120-Hr Burn", ...NEW }],
        ),
        text(
          "Bullet points",
          ["Cracked pepper over dry cedar blend.", "Three wicks for even throw across medium and large rooms."],
          [
            { text: "Cracked pepper over dry cedar blend." },
            { text: "Three wicks for even throw across medium and large rooms." },
            { text: "Save 20% October 1–31 with the on-page coupon.", ...NEW },
          ],
        ),
        image("Primary image", "Standard pack shot", "Halloween pack shot"),
      ],
    },
  ],

  gifts: [
    {
      skuId: "sku-7",
      sections: [
        text(
          "Title",
          ["Bergamot Grove Decorative Scented Pillar Candle Set, Home Décor"],
          [{ text: "Halloween Gift Bergamot Grove Decorative Scented Pillar Candle Set, Boo Basket Stuffer, Hostess Gift", ...NEW }],
        ),
        text(
          "Bullet points",
          ["Bergamot and grove florals in a two-piece pillar set.", "Gift-ready packaging."],
          [
            { text: "Bergamot and grove florals in a two-piece pillar set." },
            { text: "Gift-ready packaging, a ready-made boo basket filler.", ...NEW },
            { text: "Save 20% October 1–31 with the on-page coupon.", ...NEW },
          ],
        ),
        image("Primary image", "Standard pack shot", "Halloween gift pack shot"),
      ],
    },
    {
      skuId: "sku-10",
      sections: [
        text(
          "Title",
          ["Rasa Decorative Scented Candle Duo Gift Set, Home Fragrance"],
          [{ text: "Halloween Gift Rasa Decorative Scented Candle Duo Gift Set, Spooky Season Hostess Gift", ...NEW }],
        ),
        text(
          "Bullet points",
          ["Two coordinating scents in one box.", "Gift-ready packaging."],
          [
            { text: "Two coordinating scents in one box." },
            { text: "Gift-ready packaging." },
            { text: "Save 20% October 1–31 with the on-page coupon.", ...NEW },
          ],
        ),
        image("Primary image", "Standard pack shot", "Halloween gift pack shot"),
      ],
    },
  ],

  concepts: [
    {
      skuId: "sku-new-1",
      sections: [
        input("Launch concept", "New SKU · no page yet", "Theme or tagline, e.g. Gather round the glow"),
        { kind: "background", label: "Main image", liveLabel: "No image yet" },
      ],
    },
    {
      skuId: "sku-new-2",
      sections: [
        input("Launch concept", "New SKU · no page yet", "Theme or tagline, e.g. Gather round the glow"),
        { kind: "background", label: "Main image", liveLabel: "No image yet" },
      ],
    },
    {
      skuId: "sku-new-3",
      sections: [
        input("Launch concept", "New SKU · no page yet", "Theme or tagline, e.g. Gather round the glow"),
        { kind: "background", label: "Main image", liveLabel: "No image yet" },
      ],
    },
  ],

  readiness: [
    {
      skuId: "sku-4",
      sections: [
        text("Filled by Ally", ["Item form: — · Age range: —"], [{ text: "Item form: solid · Age range: adult", ...NEW }]),
        input("Country of origin", "—", "e.g. United States"),
        input("Safety warning", "—", "e.g. Never leave a burning candle unattended"),
      ],
    },
    {
      skuId: "sku-9",
      sections: [
        text("Filled by Ally", ["Item form: — · Age range: —"], [{ text: "Item form: solid · Age range: adult", ...NEW }]),
        input("Material", "—", "e.g. soy wax, glass jar"),
      ],
    },
  ],

  pim: [
    {
      skuId: "sku-5",
      sections: [
        text("Images", ["3 images"], [{ text: "5 images, 2 added from PIM", ...NEW }]),
        text(
          "Description",
          [],
          [{ text: "Three cotton wicks and 21 oz of soy wax fill a room in minutes with cedar, clove and warm spice.", ...NEW }],
        ),
      ],
    },
  ],
}
