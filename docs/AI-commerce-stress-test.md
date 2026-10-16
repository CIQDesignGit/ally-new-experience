# AI Commerce: stress test

Oct 14, 2026 · Himanshu Jain · Internal · Companion to [PRD-agentic-commerce.md](PRD-agentic-commerce.md)

Purpose: try to prove "Win AI share of sales" wrong before we polish it. Three parts: the assumptions it rests on, an exact spec for the metric, and how it fails.

---

## 1. Leap-of-faith assumptions

Scored 1 to 3 on **risk** (if wrong, does the plan die?) and **uncertainty** (how little do we know?). Test the highest scores first.

| # | Assumption | Risk | Unc. | Score | Cheapest test | Pass | Kill |
|---|---|---|---|---|---|---|---|
| A1 | **AI-started sales are already material.** Big enough in dollars to matter to a VP Ecommerce today | 3 | 3 | 9 | Size it on one real account (SharkNinja, Amazon): Sponsored Prompts actuals + funnel estimate + unexplained page views | AI-started sales ≥2% of Amazon sales, Medium confidence | <0.5% and growing less than 50% a year |
| A2 | **The VP Ecommerce will pay,** not just find it interesting | 3 | 3 | 9 | Press release and FAQ with a price, shown to 5 VP Ecommerce or Amazon P&L leads | 3 paid pilots or letters of intent at a stated price within 60 days | 0 of 5 commit |
| A3 | **AI share of sales is measurable** within a useful error | 3 | 2 | 6 | Run-to-run variance on 50 prompts; backtest the paid estimate against held-out Sponsored Prompts weeks | Actuals land inside the band in 4 of 5 held-out weeks; band narrow enough to see a 3-point move | Band wider than the moves we claim to detect |
| A4 | **Fixes cause lift** in AI share and sales | 3 | 2 | 6 | 20 featured vs 20 matched control products, 4 weeks, with a power analysis first | Significant AI share lift; sales lift in the same direction | No AI share movement after 2 experiments |
| A5 | **Retailers won't give it away free** within 18 months | 3 | 2 | 6 | Ask Amazon and Walmart partner contacts; watch Brand Analytics releases | Not killable by a test. Design so it doesn't matter (see part 3) | |
| A6 | **The outcome moat is real:** enough measured changes, and rights to learn across customers | 2 | 3 | 6 | Count Content Agent changes with sales readouts; legal review of contracts | 1,000+ measured changes, and rights or a path to them | Rights blocked with no path: the moat is only a head start |
| A7 | **Unit economics work:** capture and runs cost far less than the price | 2 | 2 | 4 | Cost model: prompts × surfaces × runs × brands | Cost per brand under 20% of price | Over 50% of price |
| A8 | **Retailer agents carry the money now,** not ChatGPT | 2 | 2 | 4 | Same sizing as A1, split by source | Retailer agents are the largest proven and estimated source | Changes sequencing, not the plan |
| A9 | **Product matching is accurate** across retailers | 2 | 1 | 2 | Hand-label 200 products as a gold set; measure precision and recall | 95%+ precision on top categories | Under 85% |

**Order to test:** A1 and A3 together (one data pull, low cost), then A2 (interviews), then A4 (needs 4+ weeks), with A6 and A7 in parallel as desk work.

---

## 2. Metric spec: AI share of sales

### Definitions

- **AI-started sale:** a retailer sale where an AI agent recommended that product on the path to purchase.
  - *Helper mode:* the shopper clicked from an AI answer or assistant to the product.
  - *Autonomous mode:* an agent placed or built the order.
- **Proven:** reported by the retailer or ad platform for paid AI placements (Sponsored Prompts, Sparky sponsored prompts, ChatGPT ads), using that platform's attribution window. Also tagged links.
- **Estimated:** organic AI-started sales from the funnel model below.

### Formula

For brand *b*, category *c*, retailer *r*, period *t*:

**AI share of sales** = AI-started sales of *b* ÷ AI-started sales of all tracked brands in *c*

**AI-started sales of b** = proven paid + estimated organic, summed over surfaces *s* and prompt buckets *k*:

Estimated organic = demand(k) × shopping-mode rate(s, k) × recommendation rate(b, s, k) × click rate(s) × link share(s, r) × conversion(b, r) × price(b, r)

- **Retailer agents** skip link share (the click already lands on the retailer). Demand = retailer search demand × share of shoppers using the assistant.
- **Competitors** use the same funnel with their own recommendation rates; conversion and price come from the Market Share model.
- **Click rate** is calibrated from Sponsored Prompts and discounted for organic.

### Uncertainty

- Every input carries a range, not a point (for example, click rate between the organic and paid bounds).
- Run 10,000 simulated draws. Report the **median and the P10 to P90 range**.
- Recommendation rate error from runs: standard error = √(p(1−p)/n). At p = 38%, 480 runs a week gives ±2.2 points. **Minimum: 260 runs per surface per week** (keeps error at or under 3 points).

### When to show it, and when to hold

| Condition | Show |
|---|---|
| At least 8 weeks of data, minimum runs met, P10 to P90 range no wider than the median, and 2 of 3 checks agree (funnel, unexplained traffic trend, paid calibration) | The number, as a range |
| Any condition missing | "Building: N weeks left", plus share of voice as the interim diagnostic |
| Week-over-week change inside the overlap of the two ranges | "No significant change" (no arrow, no color) |

### Audit

- Every number clicks through to its inputs, sources, run logs and dates.
- The method has a version number; changes are logged and old periods aren't silently restated.
- Quarterly calibration report: estimates vs experiment readouts and paid actuals.

### Known biases (stated in product, not hidden)

- Re-runs approximate a typical answer, not each shopper's personalized one.
- Prompt demand is modeled, not counted.
- Organic click rate is assumed lower than paid.
- Amazon blocks AI crawlers, so answer-agent links to Amazon are under-counted.
- Competitor conversion and price are estimates.

---

## 3. How it fails

### Pre-mortem: it's April 2028 and AI Commerce failed. Why?

Ranked by likelihood.

1. **Amazon gave it away.** Brand Analytics added Alexa for Shopping metrics (assistant impressions, clicks, purchases by query), free. Our Amazon measurement, where most of the money sits, became a commodity overnight.
2. **Nobody believed the number.** A customer's CFO compared our estimate to an internal read, found it off, and the "honest proof" brand broke. One bad number undid a year of trust.
3. **We sold to the wrong buyer.** VP Ecommerce said ChatGPT was marketing's problem; marketing bought Profound or Adobe. We ended up selling Alexa reports at a low price.
4. **We were one of many.** Azoma, SPINS and Stackline all said "sales" too. Buyers like Hill's couldn't tell the difference, and we competed on price.
5. **Agents stopped reading retailer pages.** OpenAI and Google built direct catalogs and checkout fed by Shopify, Salsify and agent protocols. Our page lever weakened.
6. **Capture broke or cost too much.** Consumer AI apps blocked automated runs or changed terms; costs ate the margin.
7. **The effect stayed small.** AI-started sales stayed under 1% in most categories for two years, and budgets didn't move.
8. **We spread too thin.** Five action buckets, all half-built; citations stayed a gap.

### What each failure tells us to do now

| Failure | Do now |
|---|---|
| 1. Amazon gives it away | Never sell measurement alone. Measurement is the input; deciding paid vs organic and doing the work is the product. Price on outcomes, not dashboards. Free Amazon data then makes our model better, not obsolete |
| 2. Number not believed | Ship the metric spec above. Lead with proven; hold anything under the bar |
| 3. Wrong buyer | Start with retailer agents, which the VP Ecommerce clearly owns. Speak in dollars per retailer |
| 4. Me-too | Every demo shows outcome evidence ("products like yours that added X gained Y") and offers a guaranteed-outcome pilot |
| 5. Agents skip pages | Build Feeds and the attribute graph so we push into agent protocols too |
| 6. Capture cost | Cost model before scale (A7); license where cheaper; sample prompts by demand |
| 7. Effect small | A1 is the first test. If it fails, AI Commerce becomes a feature of Content Agent, not a product |
| 8. Spread thin | v1 does three buckets well: Ops fixes, Content, Media. Citations and Feeds follow |

### Platform war game: the next 18 months

| Player | Likely move | Effect on us | Our response |
|---|---|---|---|
| Amazon | Free assistant analytics in Brand Analytics; more Sponsored Prompts; tighter limits on scraping | Measurement commoditized; media grows; scraping risk | Use their data as input; win on paid vs organic decisions and doing the work |
| Walmart | Sparky ads grow; assistant data sold through Luminate or Connect | Partner opportunity | Ask to be a data and solution partner |
| OpenAI, Google | Brand or merchant analytics for ChatGPT and AI Mode (Google already piloting); direct product feeds | Answer-agent visibility commoditized | Same: measurement is an input |
| Profound, Adobe | Buy a retail data company to reach retailer sales | Funded direct competitor | Speed and install base; go deep on retailer agents first |
| SPINS, NielsenIQ | Label truth plus point-of-sale data for agents | Closest to our attribute moat | Partner possibility: their label truth plus our observed truth |

**What we still own if every platform gives measurement away:** acting on 1,450+ retailers, the paid vs organic decision across retailers, the view across retailers and agents, the outcome graph, and the install base. Free platform data lowers our cost and improves our model.

### Moat test (7 Powers)

Each power needs a **benefit** (it improves our economics) and a **barrier** (others can't copy it).

| Moat | Power | Benefit | Barrier | Verdict |
|---|---|---|---|---|
| What wins the sale (outcome graph) | Network economies, cornered resource | Better predictions with every customer | Needs sales loop, contract rights and volume | **Real if A6 passes.** Potential today |
| Acting on the retailer | Process power | We execute, others recommend | Years of operational know-how; slow to copy | **Strong** |
| Paid and organic together | Counter-positioning | Incrementality | Agencies are paid on spend. But software vendors (Profound takes no media margin) can copy | **Strong against agencies, medium against software** |
| Retailer sales connections | Switching costs | Data access | Weaker than we think: retailer APIs are open to anyone with approval | **Medium** |
| Market Share model | Scale and learning | Makes AI share of sales computable | Calibration on real sales across many customers | **Medium** |
| Memory and context | Switching costs | Better work per brand over time | Leaving means starting over | **Medium, growing** |
| Brand in AI shopping | Branding | | Profound owns the mindshare | **None yet** |

**Conclusion:** no single power is decisive today. The strongest now are process power and counter-positioning; the network effect comes later and only if A6 passes. That makes **speed** the strategy: get measured outcomes at volume before others do.

---

## What this changes in the PRD

1. **Measurement is not the product.** It's the input. The product is the paid vs organic decision and the work, priced on outcomes.
2. **Crawl starts with retailer agents on Amazon,** where the VP Ecommerce clearly owns the problem and data is deepest.
3. **Add the metric spec,** including the hold rule.
4. **Add kill criteria** from part 1.
5. **v1 builds three buckets well** (Ops fixes, Content, Media); Citations and Feeds follow.
6. **Add platform risk** to the risks section.

## Next tests worth paying for

| Test | Answers | Cost | Time |
|---|---|---|---|
| Size SharkNinja Amazon AI-started sales; backtest the paid estimate | A1, A3, A8 | Low: data MCP queries plus about 500 prompt runs | 1 week |
| Five VP Ecommerce conversations with a press release and price | A2 | Time only | 2 to 3 weeks |
| Count measured Content Agent changes; legal review of contracts | A6 | Desk work | 1 week |
| Cost model | A7 | Spreadsheet | 2 days |
| Matched-product experiment | A4 | Needs a design partner | 6 weeks |
