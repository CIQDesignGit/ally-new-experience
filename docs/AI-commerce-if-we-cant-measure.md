# AI commerce if we can't measure AI share of sales

Memo for Himanshu. Draft, October 2026. Numbers in section 5 are illustrative.

## The uncomfortable starting point

- This isn't a hypothetical. It's close to the real world today.
- "AI share of sales" needs two numbers we don't observe: our AI-started sales (numerator) and everyone's AI-started sales (denominator).
- The numerator is part proven (paid) and part modeled (organic). The denominator is almost all modeled: competitors' organic AI sales via a funnel stacked on our Market Share model.
- Seven multiplied estimates compound error. A ±20% error on each factor can put the result off by 2x or more. A CFO will spot this in one question.
- So the real choice isn't "measure vs don't." It's which number we stand behind, and which we label as modeled.

## 1. What we can still measure credibly

| Signal | What it proves | Strength | Main limit |
|---|---|---|---|
| Proven paid AI sales (Sponsored Prompts, Sparky sponsored prompts, ChatGPT ads) | Retailer-reported sales from AI placements | Strong | Paid only; retailer's own attribution window and rules |
| Tagged links we control (Amazon Attribution tags, UTM on feeds, citations, brand pages) | Clicks and sales from links that carry our tag | Strong where it applies | Covers only links we place; agents may rewrite or strip tags |
| Controlled experiments (fixed vs matched control SKUs, paid on/off switchbacks) | Incremental retailer sales caused by our actions | Strongest causal proof | Slow (6 to 10 weeks), needs volume, control SKUs give up gains |
| Demand-weighted share of voice (recommendation rate × prompt demand $) | Presence where buying intent is | Medium | Prompt volume is modeled; answers vary run to run |
| Shelf integrity on AI-linked pages (in stock, price, Buy Box, content, ratings) | The page the agent sends shoppers to can convert | Strong (fully observed) | It's an input, not an outcome |
| Correlation (visibility change vs retailer sales change) | Directional link | Weak alone | Confounded: agents recommend what already sells |

- Two of these are direct measurement (paid, tagged). One is causal proof (experiments). The rest are inputs or leading signals.
- None of them gives a category-wide share of sales. All of them can be defended line by line.

## 2. What the headline metric becomes

| Option | Definition | Pro | Con |
|---|---|---|---|
| A. AI share of demand ($) | Share of AI shopping demand in the category, by $, where we're recommended | Weekly, steerable, $-denominated, ties to category size | Still a presence metric; demand $ is modeled |
| B. AI commerce index (0 to 100) | Composite of visibility, shelf integrity, paid efficiency | One number, easy to trend | Opaque weights; finance discounts indices; easy to game |
| C. Proven AI sales | Paid + tagged + experiment-proven lift, in $ | Every dollar is defensible | Small early; understates organic; no competitor view |

- Recommendation: report **AI share of demand ($)** as the headline, always shown with **proven AI sales** directly beneath it as the floor.
- Share of demand is what the team steers by each week. Proven AI sales is the receipt. Neither works alone: A without C looks like visibility; C without A looks small and backward.
- Reject the index (B). It hides the very assumptions a VP Ecommerce will be asked to defend.
- "Win AI share of sales" survives as the **promise**, not a reported number. Keep it in positioning and the pitch; never put a percent on it in the product until the denominator is observable.

## 3. How proof works without the number

- **Experiments are the proof.** Ally fixes content, citations and shelf issues on a treatment set of SKUs; a matched control set (same velocity, category, price band) stays as is. Compare retailer sales over 6 to 10 weeks (difference in differences).
- **Switchbacks prove the paid plus organic decision.** Turn sponsored prompts off on prompts where we rank well organically, alternate by week, measure total sales. This proves "stop paying where you'd win anyway" with real dollars.
- **Proven paid calibrates the funnel.** Paid placements give us real click and conversion rates for AI traffic. Use them to tune the organic funnel's click and conversion factors, so the modeled pieces drift less over time.
- **Correlation is a leading signal only.** It tells Ally where to look and what to test next. It never appears as a dollar claim.

What a CFO accepts vs rejects:

| Accepts | Rejects |
|---|---|
| Retailer-reported sales as the source of truth | Modeled organic AI sales stated as fact |
| Pre-agreed test design with a holdout | Before vs after with no control |
| Incremental $ with a confidence range | Share of voice converted to $ by assumption |
| Conservative floor that grows | One big number that can't be traced |

## 4. What changes

**Product**
- Add an experiment engine as a first-class feature: pick SKUs, auto-match controls, run, report lift. This becomes the core proof loop, not a services add-on.
- Every visibility metric links to a shelf state and an action Ally can take. No metric without a next step.
- Label every number as proven, tested or modeled, in the UI itself.

**Pricing**
- Platform fee for the software and Ally's work.
- Outcome fee only on what's proven: paid spend saved and experiment-proven lift. Never on modeled share.
- Watch-outs: experiments are slow, holdouts cost the customer real sales, and disputes over control matching are likely. Start outcome pricing in pilots with pre-agreed rules, not as the default.

**Positioning (avoiding me-too visibility)**
- The risk is real: without a sales number, "share of demand" can sound like share of voice with a dollar sign.
- What keeps us different:
  - Dollar-weighted demand tied to retailer sales data we already see for 2,200+ brands, not mention counts.
  - Proven paid AI sales and the paid plus organic decision per prompt. Visibility-only tools don't run the media.
  - Experiment-proven lift on retailer sales. That's the claim to lead with in every pitch.
  - Ally does the fix, not just the report.
- Line to use: "Visibility shows where you appear. CommerceIQ proves what it sold, and does the work."

**Moat**
- The cross-retailer product and attribute graph stays the moat, but the labels change: from attributed sales to experiment outcomes.
- Pooled experiments across thousands of brands answer "which fix moves AI-driven sales, in which category." That's causal data, harder to copy than correlations, and it compounds with every customer.

## 5. What the exec page shows (illustrative)

- AI share of demand: 31% of $48M category AI demand, +4 pts in 30 days
- Proven AI sales: $1.2M this quarter (sponsored prompts + tagged links)
- Proven lift: +6.8% sales on 40 fixed SKUs vs matched control, 8 weeks
- Paid you can cut: $86K/month on prompts you win organically
- Biggest gap: "best travel stroller," $3.1M demand, not recommended; fixes ready, one approval away

## 6. Recommendation

- **Yes, design v1 for this world.** It's the honest world today, and the measurement-heavy version depends on data retailers and agents don't share.
- Build so the upgrade is additive, not a rewrite:
  - **v1:** AI share of demand + proven AI sales + shelf integrity on AI-linked pages + experiment engine.
  - **v2:** Publish a calibrated organic estimate as a range, once enough experiments and paid data tune the funnel.
  - **v3:** Report AI share of sales as a number if and when retailers or agents expose referral or agent-checkout data.
- Lead sales conversations with experiment-proven lift, not with share. Proof first, share second.
- Push back on one thing: don't let the headline promise outrun the product. A VP who gets "Win AI share of sales" in the pitch and "share of demand" in the product will feel the switch. Say it up front: we promise the share, we report demand and proven sales, and we show the path.

## What would have to be true for correlation alone to be worth selling

- AI traffic is a big enough share of category sales to show up above normal noise.
- Visibility changes lead sales changes with a consistent lag, not the other way round.
- More visibility, more sales, in proportion (a dose response), across many brands, not one.
- The link holds after controlling for media spend, price, promotions, in-stock and seasonality.
- At least a handful of experiments confirm the direction and rough size.
- If these hold, correlation can be sold as a forecast. If not, it's a hunch with a chart.

## Risks

- **Confounding and reverse causality.** Agents recommend products that already sell, have reviews and are in stock. Sales may drive visibility, not the reverse.
- **Seasonality and promotions.** Prime Day, holiday and price cuts move both visibility and sales at once and create false wins.
- **Goodhart.** Once share of demand is the target, teams optimize for our prompt panel, not real shoppers. Rotate and refresh prompts, and keep sales as the judge.
- **Model drift.** An agent model update can shift recommendations overnight. Trends need annotated breaks, not silent restatements.
- **Answer variance.** Run-to-run noise can look like movement. Report ranges and only flag changes above noise.
- **Holdout fatigue.** Customers may refuse to leave control SKUs unfixed. Rotate controls and keep test windows short.
