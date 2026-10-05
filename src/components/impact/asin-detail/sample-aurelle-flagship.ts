import type { AidDetail } from "./types"

/**
 * Aurelle flagship candle story, adapted from the approved demo mockup
 * (asin-detail-consolidated_1.html). Dollar figures and the unit counts
 * tied to them were rescaled (~13% of the original) so the all-time total
 * matches the $80K shown for this ASIN on the dashboard table — every
 * rate, percentage, date and diff is untouched from the original mockup.
 * Do not run this through the generic generator.
 */
export const AURELLE_FLAGSHIP_ASIN = "B0D8QXK4TN"

export const AURELLE_FLAGSHIP_DETAIL: AidDetail = {
  asin: "B0D8QXK4TN",
  productName: "Aurelle Vegan Soy Candle, Golden Hour, 8oz",
  brand: "Aurelle",
  category: "Home Fragrance · Candles",
  thumbnailEmoji: "🕯️",
  thumbnailUrl: "/images/aurelle/soy-candle-golden-hour.jpg",
  dateRangeLabel: "Aug 23 – Nov 30, 2026",
  currentMethod: "ab",
  allTimeSalesCents: 8_000_000,
  inPeriodSalesLine: [
    { text: "$8,127", bold: true },
    { text: " in Aug 23 – Nov 30, 2026" },
  ],
  dailyRunRateLabel: "↑ earning ~$59/day at current sales",
  cyclesFootnote: "Across 4 cycles since Jan 2026 · 2 A/B tests · 1 modelled · 1 resumed",
  currentLiftLabel: "+4.2%",
  currentRateFromToLabel: "6.87% → 7.16% on Amazon's split",
  currentCycleSourceLabel: "From the Holiday 2026 cycle. Earlier cycles measured separately — see history.",
  aiVisibilityDeltaLabel: "+6.25 pp",
  aiVisibilityRangeLine: [{ text: "Brand citation rate " }, { text: "18.75% → 25.0%", bold: true }],
  aiVisibilityFootnote: "Measured continuously since 26 Jul — not reset by method changes",
  allTimeUnits: 2_609,
  inPeriodUnitsLine: [{ text: "280", bold: true }, { text: " in Aug 23 – Nov 30, 2026" }],
  nextQueuedText:
    "a bullet refresh is in the candidate queue awaiting batch sign-off. Nothing changes on this ASIN until it ships and concludes.",
  cycles: [
    {
      key: "holiday",
      label: "Holiday 2026",
      periodLabel: "Live 20 Nov — present",
      field: "Title",
      method: "ab",
      verdictLabel: "Challenger won",
      verdictTone: "won",
      rateLabel: "+4.2%",
      rateTone: "pos",
      lifetimeCents: 59_300,
      inPeriodLabel: "$593 in period",
      status: "active",
      startDate: "2026-11-20",
      endDate: "2026-11-30",
      color: "#C231FF",
      ab: {
        originalVisitors: 1850,
        originalRate: 6.87,
        originalUnits: 127,
        challengerVisitors: 1844,
        challengerRate: 7.16,
        challengerUnits: 132,
        confidenceTone: "strong",
        confidencePct: 81,
        testWindowLabel: "23 Oct – 19 Nov 2026",
        publishedOnLabel: "20 Nov 2026",
        claimRateLabel: "4.22% of daily OPS",
        activeForLabel: "10 days so far",
        incrementalSalesLabel: "$593",
        incrementalUnits: 20,
        footnote: {
          variant: "method",
          text: "Amazon split shoppers between the two versions on this page and reported the result. The dollar figure is that rate applied to actual daily sales since the content went live — not an estimate of what might happen.",
        },
      },
      diff: {
        incumbentNote: "the New Year 2026 winner, unchanged through Back-to-School and Post-season",
        challengerNote: "now live",
        lines: [
          {
            incumbent: "Aurelle Vegan Soy Candle, Golden Hour, 8oz",
            challenger: [
              { text: "Aurelle Vegan Soy Candle, Golden Hour, 8oz" },
              { text: " — Hand-Poured Small Batch", ins: true },
            ],
          },
          {
            incumbent: "Clean-burning, vegan & cruelty-free soy wax",
            challenger: [
              { text: "Clean-burning, vegan & cruelty-free soy wax" },
              { text: ", never tested on animals", ins: true },
            ],
          },
          {
            incumbent: "45+ hour burn time in a reusable glass vessel",
            challenger: [{ text: "45+ hour burn time in a reusable glass vessel" }],
          },
        ],
      },
    },
    {
      key: "postseason",
      label: "Post-season, Autumn 2026",
      periodLabel: "Live 23 Aug — 19 Nov",
      field: "No content change",
      method: "resumed",
      verdictLabel: "No new test",
      verdictTone: "resumed",
      rateLabel: "+6.0%*",
      rateTone: "inherited",
      lifetimeCents: 753_400,
      inPeriodLabel: "$7,534 in period",
      status: "ended",
      startDate: "2026-08-23",
      endDate: "2026-11-19",
      color: "#DB7DFF",
      resumed: {
        whyText:
          "When the Back-to-School window closed on 22 Aug, this ASIN reverted to the content that won the New Year 2026 cycle. No new test ran — there was nothing new to test, since the content is identical to what Amazon already measured. It resumed accruing at that test's proven +6.0% rate rather than starting over.",
        rateInheritedFromLabel: "New Year 2026 cycle",
        evidenceRefLabel: "See New Year 2026 below",
        claimRateLabel: "6.0% of daily OPS (inherited, not re-measured)",
        activeForLabel: "89 days",
        incrementalSalesLabel: "$7,534",
        incrementalUnits: 260,
        methodLineText:
          "This is a continuation, not a measurement. The dollar figure applies the New Year 2026 rate to actual sales during this window — the same content, the same proven lift, simply picking back up.",
      },
    },
    {
      key: "backtoschool",
      label: "Back-to-School 2026",
      periodLabel: "Live 26 Jul — 22 Aug",
      field: "Title, bullets",
      method: "model",
      verdictLabel: "Modelled",
      verdictTone: "model",
      rateLabel: "+14.1%",
      rateTone: "pos",
      lifetimeCents: 5_485_500,
      inPeriodLabel: "— outside period",
      status: "ended",
      startDate: "2026-07-26",
      endDate: "2026-08-22",
      color: "#1D4FD8",
      model: {
        methodLineText:
          "Measured by CommerceIQ's model — not A/B tested. This window fell inside your Back-to-School push, where there wasn't time to hold out a control group without losing the moment. Impact is measured against a pre-period baseline over a 28-day post window, adjusted for category demand and price.",
        contextStats: [
          { label: "Category demand", value: "−17.8%", tone: "neg", sub: "post vs pre-period mean" },
          { label: "Ad spend", value: "−36.1%", tone: "neg", sub: "paid support fell over the window" },
          { label: "Price", value: "−0.6%", sub: "ASP $31.49 post period" },
          { label: "Out of stock", value: "0% / 0%", sub: "pre / post" },
        ],
        calcRows: [
          { key: "pre", label: "Organic units, pre period", value: "5,979" },
          { key: "factor", label: "category demand factor", operator: "×", value: "0.8221" },
          { key: "adjusted", label: "demand-adjusted units", operator: "=", value: "4,916", variant: "derived" },
          { key: "pricefactor", label: "price factor · elasticity −5.24", operator: "×", value: "1.0335" },
          { key: "expected", label: "expected organic units", operator: "=", value: "5,081", variant: "derived" },
          { key: "actual", label: "Actual organic units", value: "6,823" },
          { key: "residual", label: "Residual, organic units", value: "+1,742", variant: "residual" },
          { key: "valued", label: "Valued at post-period ASP $31.49", value: "+$55K", variant: "valued" },
        ],
        confidencePct: 79,
        sustainedLabel: "Yes — both halves",
        confoundLabel: "Opposed the residual",
        coChangesLabel: "None detected",
        whyNotHigherLabel: "Why 79%, not higher",
        whyNotHigherText:
          "Sustained lift and wrong-direction confounders both support the read — this is as strong as a modelled cycle gets. It's capped below a typical strong A/B result because there's no held-out control group; some part of the residual could still be unmeasured noise. Even at a 50% conservative attribution factor, this ASIN contributes +$27K.",
        whatNotText:
          "Review count and star rating sit inside the residual alongside content and cannot be separated. Keyword rank movement and competitor activity are not modelled.",
        windowsNoteText:
          "Windows. Pre period is the mean of three 28-day periods, 3 May – 25 Jul 2026. Post period is 26 Jul – 22 Aug 2026, the 28 days after the content change.",
      },
      diff: {
        incumbentNote: "the New Year 2026 winner",
        challengerNote: "reverted after the event, resumed in the next cycle",
        lines: [
          {
            incumbent: "Aurelle Vegan Soy Candle, Golden Hour, 8oz",
            challenger: [
              { text: "Aurelle Vegan Soy Candle, Golden Hour, 8oz" },
              { text: " — Dorm Room Must-Have", ins: true },
            ],
          },
          {
            incumbent: "Clean-burning, vegan & cruelty-free soy wax",
            challenger: [{ text: "Clean-burning, vegan & cruelty-free soy wax" }],
          },
          {
            incumbent: "45+ hour burn time in a reusable glass vessel",
            challenger: [
              { text: "45+ hour burn time " },
              { text: "— the self-care essential for late-night study sessions", ins: true },
            ],
          },
        ],
      },
    },
    {
      key: "newyear",
      label: "New Year 2026",
      periodLabel: "Live 5 Jan — 25 Jul",
      field: "Title, bullets",
      method: "ab",
      verdictLabel: "Challenger won",
      verdictTone: "won",
      rateLabel: "+6.0%",
      rateTone: "pos",
      lifetimeCents: 1_701_800,
      inPeriodLabel: "— outside period",
      status: "ended",
      startDate: "2026-01-05",
      endDate: "2026-07-25",
      color: "#0B93D5",
      ab: {
        originalVisitors: 12_300,
        originalRate: 6.04,
        originalUnits: 743,
        challengerVisitors: 12_300,
        challengerRate: 6.4,
        challengerUnits: 787,
        confidenceTone: "mild",
        confidencePct: 64,
        testWindowLabel: "8 Dec 2025 – 4 Jan 2026",
        publishedOnLabel: "5 Jan 2026",
        claimRateLabel: "6.0% of daily OPS",
        activeForLabel: "201 days",
        incrementalSalesLabel: "$17K",
        incrementalUnits: 587,
        footnote: {
          variant: "zero",
          text: "This cycle stopped accruing when the Back-to-School window opened on 26 Jul, but the $17K it earned while active is permanent and is included in the total above. Its rate resumed later in the Post-season cycle above.",
        },
      },
      diff: {
        incumbentNote: "pre-agent content",
        challengerNote: "became incumbent for every cycle since",
        lines: [
          {
            incumbent: "Aurelle Soy Candle, Golden Hour, 8oz",
            challenger: [
              { text: "Aurelle " },
              { text: "Vegan", ins: true },
              { text: " Soy Candle, Golden Hour, 8oz" },
            ],
          },
          {
            incumbent: "Made with natural soy wax",
            challenger: [
              { text: "Clean-burning, vegan & cruelty-free", ins: true },
              { text: " soy wax" },
            ],
          },
          {
            incumbent: "Long-lasting burn",
            challenger: [{ text: "45+ hour burn time in a reusable glass vessel", ins: true }],
          },
        ],
      },
    },
  ],
}
