import type { ImpactRow } from "../types"
import { categoryEmoji, lastCategorySegment } from "../category-emoji"
import { formatCompactUsd } from "./format"
import type { AidCalcRow, AidDetail, AidMethod } from "./types"

const TODAY = new Date("2026-09-16")

const CATEGORY_ENHANCEMENT: Record<string, string> = {
  Candles: "Hand-Poured Small Batch",
  Diffusers: "Reusable Rattan Reeds",
  "Wax Melts": "100% Soy Wax",
  "Gift Sets": "Plastic-Free Packaging",
  Warmers: "Flame-Free Design",
}

const SEASON_BY_MONTH = [
  "New Year",
  "New Year",
  "Spring",
  "Spring",
  "Early Summer",
  "Early Summer",
  "Back-to-School",
  "Back-to-School",
  "Fall",
  "Fall",
  "Holiday",
  "Holiday",
]

/** Deterministic 0..1 pseudo-random from a string seed (stable across server/client render). */
function seeded(seed: string): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 10000) / 10000
}

function seededRange(seed: string, min: number, max: number): number {
  return min + seeded(seed) * (max - min)
}

const formatUsd = formatCompactUsd

function formatPct(value: number, digits = 2): string {
  return `${value.toFixed(digits)}%`
}

function parseChangedOn(label: string): Date {
  const parsed = new Date(label)
  return Number.isNaN(parsed.getTime()) ? TODAY : parsed
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86_400_000)
}

function formatShort(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function daysBetween(a: Date, b: Date): number {
  return Math.max(1, Math.round((b.getTime() - a.getTime()) / 86_400_000))
}

function seasonLabel(date: Date): string {
  return `${SEASON_BY_MONTH[date.getMonth()]} ${date.getFullYear()}`
}

export function buildAsinDetail(row: ImpactRow): AidDetail {
  const method: AidMethod = row.attributionApproach === "A/B test" ? "ab" : "model"
  const changedOn = parseChangedOn(row.changedOn)
  const activeDays = daysBetween(changedOn, TODAY)
  const totalCents = row.impactCents
  const liftPct = seededRange(`${row.asin}-lift`, 3.5, 16)
  const cycleLabel = seasonLabel(changedOn)
  const categorySegment = lastCategorySegment(row.category)
  const enhancement = CATEGORY_ENHANCEMENT[categorySegment] ?? "Enhanced Everyday Design"
  const hasFieldChange = row.whatChanged !== "—"
  const changesTitle = row.whatChanged.includes("Title")
  const changesBullets = row.whatChanged.includes("Bullet")

  const runRatePerDay = Math.round(totalCents / 100 / activeDays)

  let ab: NonNullable<AidDetail["cycles"][number]["ab"]> | undefined
  let model: NonNullable<AidDetail["cycles"][number]["model"]> | undefined

  if (method === "ab") {
    const originalRate = seededRange(`${row.asin}-orig`, 4.5, 8.5)
    const challengerRate = originalRate * (1 + liftPct / 100)
    const visitors = Math.round(seededRange(`${row.asin}-visitors`, 900, 2600))
    const originalUnits = Math.round((visitors * originalRate) / 100)
    const challengerUnits = Math.round((visitors * challengerRate) / 100)
    const confidencePct = Math.round(seededRange(`${row.asin}-conf`, 62, 88))
    const testEnd = addDays(changedOn, -1)
    const testStart = addDays(testEnd, -27)

    ab = {
      originalVisitors: visitors,
      originalRate,
      originalUnits,
      challengerVisitors: visitors,
      challengerRate,
      challengerUnits,
      confidenceTone: liftPct >= 9 ? "strong" : liftPct >= 5 ? "mild" : "weak",
      confidencePct,
      testWindowLabel: `${formatShort(testStart)} – ${formatShort(testEnd)}`,
      publishedOnLabel: formatShort(changedOn),
      claimRateLabel: `${liftPct.toFixed(1)}% of daily OPS`,
      activeForLabel: `${activeDays} days so far`,
      incrementalSalesLabel: formatUsd(totalCents),
      incrementalUnits: challengerUnits - originalUnits,
      footnote: {
        variant: "method",
        text: "Amazon split shoppers between the two versions on this page and reported the result. The dollar figure is that rate applied to actual daily sales since the content went live — not an estimate of what might happen.",
      },
    }
  } else {
    const preUnits = Math.round(seededRange(`${row.asin}-preunits`, 18000, 42000))
    const demandFactor = seededRange(`${row.asin}-demand`, 0.85, 1.15)
    const demandAdjusted = Math.round(preUnits * demandFactor)
    const actualUnits = Math.round(demandAdjusted * (1 + liftPct / 100))
    const residual = Math.max(1, actualUnits - demandAdjusted)
    const asp = totalCents / 100 / residual
    const adSpendDelta = seededRange(`${row.asin}-ad`, -40, 10)

    const calcRows: AidCalcRow[] = [
      { key: "pre", label: "Organic units, pre period", value: preUnits.toLocaleString("en-US") },
      { key: "factor", label: "category demand factor", operator: "×", value: demandFactor.toFixed(4) },
      { key: "adjusted", label: "demand-adjusted units", operator: "=", value: demandAdjusted.toLocaleString("en-US"), variant: "derived" },
      { key: "actual", label: "Actual organic units", value: actualUnits.toLocaleString("en-US") },
      { key: "residual", label: "Residual, organic units", value: `+${residual.toLocaleString("en-US")}`, variant: "residual" },
      { key: "valued", label: `Valued at post-period ASP $${asp.toFixed(2)}`, value: `+${formatUsd(totalCents)}`, variant: "valued" },
    ]

    const demandDeltaPct = (demandFactor - 1) * 100
    model = {
      methodLineText:
        "Measured by CommerceIQ's model — not A/B tested. Impact is measured against a pre-period baseline over a 28-day post window, adjusted for category demand and price.",
      contextStats: [
        {
          label: "Category demand",
          value: `${demandDeltaPct >= 0 ? "+" : ""}${demandDeltaPct.toFixed(1)}%`,
          tone: demandDeltaPct >= 0 ? "pos" : "neg",
          sub: "post vs pre-period mean",
        },
        {
          label: "Ad spend",
          value: `${adSpendDelta >= 0 ? "+" : ""}${adSpendDelta.toFixed(1)}%`,
          tone: adSpendDelta >= 0 ? "pos" : "neg",
          sub: "paid support vs pre-period",
        },
        { label: "Price", value: `$${asp.toFixed(2)}`, sub: "ASP post period" },
        { label: "Out of stock", value: "0% / 0%", sub: "pre / post" },
      ],
      calcRows,
      confidencePct: Math.round(seededRange(`${row.asin}-mconf`, 68, 84)),
      sustainedLabel: "Yes — both halves",
      confoundLabel: "Opposed the residual",
      coChangesLabel: "None detected",
      whyNotHigherLabel: "Why not higher",
      whyNotHigherText:
        "Sustained lift and wrong-direction confounders both support the read. It's capped below a typical strong A/B result because there's no held-out control group; some part of the residual could still be unmeasured noise.",
      whatNotText:
        "Review count and star rating sit inside the residual alongside content and cannot be separated. Keyword rank movement and competitor activity are not modelled.",
      windowsNoteText: `Windows. Pre period is the mean of three 28-day periods ending ${formatShort(addDays(changedOn, -1))}. Post period is ${formatShort(changedOn)} – ${formatShort(addDays(changedOn, 27))}, the 28 days after the content change.`,
    }
  }

  const diff = hasFieldChange
    ? {
        incumbentNote: "pre-agent content",
        challengerNote: "now live",
        lines: [
          {
            incumbent: row.productName,
            challenger: changesTitle
              ? [{ text: row.productName }, { text: ` — ${enhancement}`, ins: true }]
              : [{ text: row.productName }],
          },
          {
            incumbent: `Reliable everyday performance for ${categorySegment.toLowerCase()}`,
            challenger: changesBullets
              ? [
                  { text: `Reliable everyday performance for ${categorySegment.toLowerCase()}` },
                  { text: ", backed by a 2-year warranty", ins: true },
                ]
              : [{ text: `Reliable everyday performance for ${categorySegment.toLowerCase()}` }],
          },
        ],
      }
    : undefined

  const cycle = {
    key: "current",
    label: cycleLabel,
    periodLabel: `Live ${formatShort(changedOn)} — present`,
    field: hasFieldChange ? row.whatChanged : "No content change",
    method,
    verdictLabel: method === "ab" ? "Challenger won" : "Modelled",
    verdictTone: method === "ab" ? ("won" as const) : ("model" as const),
    rateLabel: `+${liftPct.toFixed(1)}%`,
    rateTone: "pos" as const,
    lifetimeCents: totalCents,
    inPeriodLabel: `${formatUsd(totalCents)} in period`,
    status: "active" as const,
    startDate: changedOn.toISOString().slice(0, 10),
    endDate: TODAY.toISOString().slice(0, 10),
    color: method === "ab" ? "#C231FF" : "#1F22B2",
    ab,
    model,
    diff,
    noDiffNote: hasFieldChange
      ? undefined
      : "No product content changed in this cycle — the lift came from a non-content lever (price, imagery, or placement) tracked outside this view.",
  }

  const aiFrom = seededRange(`${row.asin}-aifrom`, 10, 22)
  const aiDelta = seededRange(`${row.asin}-aidelta`, 3, 9)
  const residualRow = model?.calcRows.find((r) => r.key === "residual")
  const modelUnits = residualRow ? Number(residualRow.value.replace(/[+,]/g, "")) : 0
  const incrementalUnits = ab?.incrementalUnits ?? modelUnits

  return {
    asin: row.asin,
    productName: row.productName,
    brand: row.brand,
    category: row.category,
    thumbnailEmoji: categoryEmoji(row.category),
    thumbnailUrl: row.thumbnailUrl.startsWith("/") ? row.thumbnailUrl : undefined,
    dateRangeLabel: "Jan 1 – Dec 31, 2026",
    currentMethod: method,
    allTimeSalesCents: totalCents,
    inPeriodSalesLine: [
      { text: formatUsd(totalCents), bold: true },
      { text: " in Jan 1 – Dec 31, 2026" },
    ],
    dailyRunRateLabel: `↑ earning ~$${runRatePerDay.toLocaleString("en-US")}/day at current sales`,
    cyclesFootnote: `Since ${formatShort(changedOn)} · 1 ${method === "ab" ? "A/B test" : "modelled cycle"}`,
    currentLiftLabel: cycle.rateLabel,
    currentRateFromToLabel: ab
      ? `${formatPct(ab.originalRate)} → ${formatPct(ab.challengerRate)} on Amazon's split`
      : "vs. modelled demand-adjusted baseline",
    currentCycleSourceLabel: `From the ${cycleLabel} cycle.`,
    aiVisibilityDeltaLabel: `+${aiDelta.toFixed(2)} pp`,
    aiVisibilityRangeLine: [
      { text: "Brand citation rate " },
      { text: `${aiFrom.toFixed(1)}% → ${(aiFrom + aiDelta).toFixed(1)}%`, bold: true },
    ],
    aiVisibilityFootnote: "Measured continuously — not reset by method changes",
    allTimeUnits: incrementalUnits,
    inPeriodUnitsLine: [
      { text: incrementalUnits.toLocaleString("en-US"), bold: true },
      { text: " in Jan 1 – Dec 31, 2026" },
    ],
    cycles: [cycle],
    nextQueuedText: `A ${categorySegment.toLowerCase()} content refresh is in the candidate queue awaiting batch sign-off. Nothing changes on this ASIN until it ships and concludes.`,
  }
}
