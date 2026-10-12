# PRD: AI Commerce, turning AI shopping demand into retailer sales (v1: measurement)

Oct 12, 2026 · Himanshu Jain · Status: draft for review · Internal only

Internal shorthand, not positioning: **"Profound for indirect retail."** For most consumer brands the sale happens on Amazon, Walmart, Target and other retailers, not on the brand's own site. AI visibility tools measure and optimize toward the brand's own site. CommerceIQ makes AI-driven demand turn into sales on retailers, across every agent a shopper uses.

Working name: AI Commerce. Final name is an open question (canon's approved names are Content Agent, Media Agent and Ally; see `00-naming-and-voice.md`).

## Problem statement

Shoppers now ask AI agents what to buy. General answer agents (ChatGPT, Claude, Gemini, Perplexity) are a new traffic source brands are asking about most, retailer shopping agents (Alexa for Shopping, Sparky) sit at the moment of purchase, and autonomous shopping agents are starting to buy on a shopper's behalf. For brands that sell mostly through retailers, nobody can answer the question that matters: **did AI recommend us, and did that turn into a sale on the retailer?** Today's AI visibility tools stop at mentions, citations and visits to the brand's own site; they can't see the retailer shelf the shopper lands on (stock, buy box, price) or the retailer sale. CommerceIQ is strong on retailer surfaces and retailer data, and weak on general answer agents: we don't track them and we don't influence the web content and citations they read.

Cost of not solving it: brands buy a separate visibility tool for answer agents that can't prove sales, AI-driven demand leaks at the shelf unseen, and competitors who cover answer agents and retailer agents together (for example Azoma, Bluefish) close the gap with our accounts.

## Who this is for

| Persona | Job | What they get |
|---|---|---|
| Brand ecommerce or digital shelf lead (Claire's altitude) | Grow retailer sales; report on new channels | AI share of demand in dollars, by agent and competitor, and what it's worth at the shelf |
| Content and SEO manager (Mike) | Get products found and chosen | Which reasons win the category, which SKUs to push, what to change on the page and the web |
| Retail media manager (James) | Spend where it returns | Where organic AI visibility is weak and demand is worth buying, in AI ad placements |
| Brand PR or communications lead | Earned coverage | Evidence packs and a target list of the sources agents cite, drafted by Ally, sent by them |
| CommerceIQ CS (Sarah) | Prove value, expand accounts | An AI visibility audit and a results report tied to retailer sales |

## The three surfaces, and their role

| | 1. General answer agents | 2. Retailer shopping agents and retail search | 3. Autonomous shopping agents |
|---|---|---|---|
| Examples | ChatGPT, Claude, Gemini, Perplexity, Google AI Mode | Alexa for Shopping (formerly Rufus), Walmart Sparky, retailer search | Agents that search and buy on retailers for the shopper |
| Customer demand | Highest: a new traffic source | High | Nascent |
| Where they get candidates | Product catalog plus open web (observed for ChatGPT) | The retailer's own index | Catalog plus live retailer search and product pages |
| Our position today | Weakest: no tracking, no web or citation levers | Strongest: tracking (Hershey's proposal is Rufus-first), content, media | Strongest value: every lever is a retailer lever |
| Role in v1 | Lead surface for measurement | Measured alongside, same dashboard | Measured on a small prompt set; the long-term moat |

## The approach

Answer agents recommend products for reasons: best value per piece, nut-free for school, individually wrapped, won't melt. The brand with the most credible, evidenced reasons, in the places agents read, gets recommended. Our edge is that we know which reasons shoppers actually search for and praise, which of them a SKU can prove, which SKUs are growing and loved, and what happens at the retailer after the recommendation.

Four components, built in this order:

1. **Measure:** AI share of demand in dollars, by agent, prompt, SKU and competitor.
2. **Connect to the shelf:** for each SKU an agent recommends, the shelf at the retailer it links to (stock, buy box, price, rating) and the dollars leaking there.
3. **Category Truth Engine:** what to say, which SKUs to push, and where (page, product feed, brand site, earned media).
4. **Close the loop on sales:** correlation first, then controlled SKU experiments, then paid AI placements measured in retailer reporting.

v1 ships 1 and 2, the measurement half of 3, and correlation from 4.

## Worked example: Hershey's, candy

Hershey's is the anchor: CommerceIQ proposed a Rufus-first AI Visibility Audit to Hershey's on Apr 13, 2026 (200 prompts, top 50 SKUs, a 60-day Content Agent pilot with A/B tests against control SKUs). This PRD extends that scope to answer agents and the shelf. Competitors in the candy set: Mars, Ferrero, Mondelez. All numbers below are **illustrative** until run on real data.

A v1 readout would say:

- **Demand:** "Halloween candy" prompts carry about $X a month of retailer search demand. "Nut-free for school parties" grew 3× year over year.
- **Share:** ChatGPT recommends Hershey's on 31% of runs across those prompts, Mars on 44%. In dollars: Hershey's holds $4.2M of the month's demand, Mars $6.1M.
- **Shelf:** ChatGPT links 58% of candy recommendations to Walmart. Hershey's 200 ct variety bag, recommended on 9 prompts, is out of stock at Walmart for 6 days: about $X of AI-driven demand is going to the next pick.
- **Why:** reviewers praise variety and piece count (4.7★, 12K reviews); 14% of a rival's recent reviews mention "melted on arrival." Answer agents cite two buying guides that list a discontinued Hershey's SKU.
- **What to do:** put "200 ct" and "individually wrapped" at the front of the title on 5 SKUs; send the Walmart stock gap to the Ops agent; draft an evidence pack for the two guides; test Sponsored Prompts on the 3 prompts where organic share is lowest.

Seasonality caveat: Halloween ends Oct 31, so a first read is fast but the baseline moves. Holiday and Valentine's candy are the next windows.

## Goals

1. **Show AI share of demand in dollars for one category, across all three surfaces,** for the first design-partner brand within 6 weeks of start.
2. **Find leaking demand at the shelf:** identify recommended SKUs with an integrity failure at the linked retailer, and route each to an owner, for 100% of tracked prompts.
3. **Show a credible link to retailer sales:** a weekly correlation between recommendation rate and retailer traffic and sales for tracked SKUs, and a designed controlled experiment ready to start by the end of v1.
4. **Win the design partner:** convert Hershey's (or the first partner) from audit to paid within 90 days.

## Non-goals (v1)

1. **A blog or content factory.** Generating articles at volume is commoditized and isn't our edge. We create evidence-based assets from retail data (v2), not volume.
2. **Deterministic organic attribution** (one AI answer to one retailer order). Retailers don't share referrers with brands; we use shelf integrity, correlation and experiments instead.
3. **Brand-site (DTC) analytics** such as server logs, AI crawler traffic and DTC conversions. Other tools do this well, and it isn't where these brands' sales happen.
4. **Acting on content in v1.** Content Agent already acts on product pages; v1 is measurement plus recommendations. Acting on the web and feeds is v2.
5. **Placing earned media or paying for citations.** Ally drafts evidence and outreach; a person at the brand sends it. No paid editorial, no fake reviews, no undisclosed seeding.

## User stories

**Brand ecommerce lead**
- As a brand ecommerce lead, I want to see what share of AI shopping demand in my category recommends my products, in dollars and against competitors, so I can decide how much this channel matters.
- As a brand ecommerce lead, I want to know when AI recommends my product but the shopper hits a broken shelf, so the demand isn't wasted.
- As a brand ecommerce lead, I want to see whether my AI share moves with my retailer sales, so I can tell my CEO whether this is real.

**Content and SEO manager**
- As a content manager, I want to know which shopper needs win in my category and which my SKUs can prove, so I change the right words on the right SKUs.
- As a content manager, I want to see what answer agents say about my products and which sources they cite, including anything wrong, so I can correct it.
- As a content manager, I want a ranked list of SKUs to push, growing, well reviewed and in stock, so I don't push products that will leak.

**Retail media manager**
- As a media manager, I want to see prompts where organic AI share is low and the demand is worth buying, so I can test paid AI placements where they'll return.

**CS lead**
- As a CS lead, I want an audit report for a prospect from the same data, so I can run the Hershey's-style proposal without manual work.

**Edge cases**
- As a user, when a prompt never triggers product recommendations, I want it labeled "no shopping answer" rather than shown as 0% share.
- As a user, when a recommended product can't be matched to a SKU, I want it listed as unmatched with what the agent said, not dropped.
- As a user, when an engine blocks or fails a run, I want coverage shown, not silently missing data.

## Requirements

### P0: must have

**P0.1 Prompt set from real shopper demand**
- Build each category's prompt set from retailer search demand (search terms, volume, category dollars) plus conversational expansion of those terms into the questions shoppers ask agents. Tag each prompt with its needs (bulk, nut-free, individually wrapped…) and importance.
- *Acceptance:* Given a category, when the prompt set is built, then every prompt has a demand-dollar value, its source search terms and its need tags, and a CS lead can add, remove or reweight prompts.

**P0.2 Repeated capture across surfaces**
- Run each prompt repeatedly on ChatGPT, Gemini, Perplexity, Claude and Google AI Mode (surface 1), Alexa for Shopping and Sparky (surface 2), and at least one autonomous agent on a small set (surface 3). Capture what the shopper sees: recommended products, order, any shopping tiles, retailer links, cited sources and the answer text.
- *Acceptance:* Given a tracked prompt, when a week completes, then each engine has at least 10 runs or a logged failure, and every run stores products, retailer links, citations and text.

**P0.3 Recommendation rate and AI share of demand ($)**
- Report recommendation rate as a percentage over runs, never as a single rank, and AI share of demand in dollars, by engine, prompt, need, brand, SKU and competitor. Show the shopping-mode rate (share of runs with product recommendations or tiles).
- *Acceptance:* Given captured runs, when the dashboard loads, then brand and competitor share appear in percent and dollars with run counts, and prompts with no shopping answer are labeled as such.

**P0.4 Match recommendations to SKUs**
- Resolve recommended products (by name, size, pack, retailer link) to the brand's and competitors' SKUs across retailers.
- *Acceptance:* Given a recommended product, then it's matched to a SKU with a confidence level, or listed as unmatched; match precision is at least 95% on a hand-checked sample of 100.

**P0.5 Retailer link share and shelf integrity**
- For each recommendation, record which retailer the agent links to, and check the SKU's shelf there: in stock, buy box owner, price vs competitors, rating. Compute leaking demand in dollars.
- *Acceptance:* Given a recommended SKU with a retailer link, then integrity is shown for that retailer from data no older than 24 hours, and failures appear as items for the Ops agent with dollars at risk.

**P0.6 Dashboard: extend the existing AI tracking page**
- Extend the demo's `/ai-tracking` page (brand standing, Alexa leaderboard, prompt performance, competitor comparison, gap table) with: AI share of demand in dollars across all surfaces, retailer link share, the shelf integrity panel, and a recommendation rate vs retailer traffic and sales view.
- *Acceptance:* Given a category, then one page answers: how much AI demand we win vs competitors, where it sends shoppers, where it leaks, and whether it moves with sales.

**P0.7 Share by surface, rolled up by source, and its link to sales by retailer**
- Show every surface at once (Amazon, Walmart and Target search; Alexa for Shopping and Sparky; ChatGPT, Gemini, Google AI Mode, Perplexity and Claude; Muse and Instinct), each with its native metric (share of voice, AI share of voice, AI visibility), the leader, the trend and what it's based on. Each source's overall sits over its surfaces as a summary row: the demand-weighted average of its surfaces, derived, never typed. No grand total across sources: they're different measures.
- Correlate each with **sales by retailer**: retailer surfaces against their own retailer's sales (Amazon search and Alexa for Shopping vs Amazon sales); answer and autonomous agents against total sales. Use week-over-week changes, so seasonality alone doesn't create a link, and test same week vs one week ahead.
- *Acceptance:* Given at least 8 weeks of data for a surface, then it shows correlation strength, value, timing and which sales it's compared with; with fewer weeks it says "Not enough data yet". The method and "correlation isn't cause" are visible on the page.
- *Data dependency:* weekly sales by retailer (Amazon, Walmart, Target) for the brand's tracked SKUs.

### P1: nice to have

**P1.1 Category Truth Engine, measurement half**
- Needs demand by attribute; review mining for our SKUs and competitors' (what's praised, what's complained about, per need); verified product facts and unit economics (for example price per piece); the SKU pick score; and a differentiator matrix per SKU and need.

**P1.2 Citation and claims audit**
- For each prompt, the sources agents cite, what they say about us vs competitors, and factual errors (wrong count, discontinued SKU, wrong price).

**P1.3 Paid AI placement view**
- Show where organic share is low and demand is high, alongside Amazon Sponsored Prompts results (live since Mar 2026) and other AI ad placements as they become measurable. Hand off to the Media agent.

**P1.4 Experiment design**
- Pick featured and matched control SKUs and a measurement window, ready to start when v2 acts on content (extends the Hershey's pilot design).

### P2: future

- **Act:** Content Agent applies the plays (title and attribute changes, product feed updates, brand-site evidence pages), and Ally drafts earned-media evidence packs and outreach for the brand's PR lead to send.
- **Controlled experiments and lift reporting** against control SKUs.
- **Paid plus organic in one loop:** organic AI share informs AI ad spend, and ad results inform content.
- **Autonomous agent readiness score** per SKU, from the agent funnel (search rank in the top 50, title quantities, product page facts, stock, seller).
- **Organic attribution ideas** (see caveats) when retailers or protocols expose more.

## Proposed business logic (to confirm with the PM before build)

1. **AI share of demand ($)** = Σ over prompts of (prompt demand $ × brand recommendation rate). Prompt demand $ = Σ over its mapped search terms of (search volume × category revenue per search).
2. **Recommendation rate** = share of runs where a brand's product is recommended, from at least 10 runs per prompt, per engine, per week.
3. **Shelf integrity** for a recommended SKU at the linked retailer = in stock and buy box held by the brand or retailer and price within 10% of the median competitor and rating at least 4.0. **Leaking demand ($)** = demand $ of prompts where we're recommended and integrity fails.
4. **SKU pick score** = demand fit × momentum (4-week vs 12-week sales growth) × proof (rating × log(1 + review count)) × integrity × margin.
5. **Correlation (v1):** weekly recommendation rate vs glance views and sales, lagged 1–2 weeks. **Lift (v2):** difference in differences, featured vs matched control SKUs.

## Success metrics

**Leading (weeks)**
- Coverage: at least 90% of planned runs completed per engine per week.
- Match precision: at least 95% of recommendations matched correctly on a weekly hand-checked sample.
- Shelf integrity items routed: 100% of failures on recommended SKUs reach an owner within 24 hours.
- Design partner engagement: weekly review of the dashboard by the brand team.

**Lagging (months)**
- Design partner converts from audit to paid within 90 days (success); a second brand signs (stretch).
- A measurable relationship between recommendation rate and retailer sales on tracked SKUs (success: correlation reported for 80% of SKUs; stretch: a controlled lift result in v2).
- Customer value in v2: sales, traffic and conversion lift on featured vs control SKUs.

## Caveats: where we need a solution or more validation

**Validate before building more (week 1–2)**

1. **Do candy prompts trigger product recommendations at all?** If ChatGPT rarely shows products for candy questions, v1 measures mentions in text, not shopping tiles. *Validate:* run 50 candy prompts × 10 runs on each engine; report the shopping-mode rate.
2. **How much do answer agents cite or read retailer product pages for candy prompts?** The thesis that one page change helps every surface depends on it. If retailer pages are rarely cited, web and earned plays matter more. *Validate:* citation audit on the same runs.
3. **Do consumer apps and APIs give the same answers?** What a shopper sees in the ChatGPT app differs from the API, and personalization and location change answers. *Validate:* compare app and API runs on 20 prompts. Choose a capture method per engine.
4. **Can we turn retailer search terms into realistic prompts?** Shoppers type keywords on Amazon and full questions in ChatGPT. *Validate:* compare generated prompts with real conversational queries where available (panel data, Brand Analytics), and test that the dollar weighting ranks prompts sensibly.

**Needs a solution**

5. **Capturing answer agents at scale.** Repeated, faithful capture of consumer apps is new infrastructure for us (browser capture, accounts, locations, failure handling). Build or license is an open question.
6. **Terms of service and legal.** Automated querying of consumer AI apps and scraping citations raise terms-of-service questions; comparative and "best" claims need substantiation; allergen claims need certification; review programs must follow retailer and FTC rules. Needs legal review before launch.
7. **Matching products to SKUs** across retailers, sizes, multipacks and variants, and for competitors. Needs a matching service with a confidence score and human review for low confidence.
8. **Review text access.** Our current SKU panel has review counts by star, not review text. The Category Truth Engine needs text for our SKUs and competitors' across Amazon, Walmart and Target. Needs a data source check.
9. **Answer volatility.** Answers vary run to run; a January 2026 study found the same brand list repeats under 1% of the time. Always report rates over many runs, with run counts and confidence. Never rank.

**Needs more validation over time**

10. **Correlation is confounded.** Agents recommend what already sells, so visibility and sales rise together without one causing the other. Correlation is a leading signal only; claims of impact wait for controlled experiments.
11. **Organic attribution isn't possible today.** Retailers don't share referrer or UTM data with brands; agent checkouts keep the retailer as merchant of record; OpenAI ended Instant Checkout around March 2026. Ideas to test later: Amazon Attribution tags on links the brand controls (brand site, earned assets); paid AI placements measured in retailer reporting (Sponsored Prompts, ChatGPT ads through Amazon DSP, piloting since Sept 2026); matched-market or matched-SKU lift tests; any agent-order signal retailers start to expose.
12. **Data access per customer.** Brand Analytics for vendors, Walmart and Target data coverage, and competitor data vary by account.
13. **Seasonality.** Candy demand peaks around Halloween, holiday and Valentine's; baselines must be season-matched.
14. **Autonomous agents are nascent.** Few agents, changing behavior, and Amazon restricts third-party shopping agents (litigation ongoing). Keep surface 3 to a small tracked set in v1.
15. **Competitive overlap.** Azoma (covers answer agents and retailer agents, seeds reviews and citations) and Bluefish (Amazon assistant coverage, AI commerce module) are closer to this than visibility-only tools. Our differentiators to hold: the breadth of context we feed in (brand, category, competitive, retail media), the directed learning loop, paid and organic in one system, and measuring in retailer sales. Keep claims to facts and capability.

## Open questions

| # | Question | Owner | Blocking? |
|---|---|---|---|
| 1 | Product name: an extension of Content Agent, or a new name (AI Commerce, Shopping Agent)? | Product, marketing | No |
| 2 | Build or license answer-agent capture? | Engineering | Yes, for P0.2 |
| 3 | Legal position on automated capture of consumer AI apps and citations | Legal | Yes, before launch |
| 4 | Review text source for us and competitors | Data | Yes, for P1.1 |
| 5 | Confirm the five business logic formulas | Product | Yes |
| 6 | Design partner: Hershey's, and which data access we have (Brand Analytics, Walmart) | GTM, CS | Yes |
| 7 | Which autonomous agent(s) to track in v1 | Product | No |
| 8 | Pricing: extend the Hershey's audit tiers ($2K–$6K a month) or reprice for multi-surface | GTM | No |

## Timeline considerations

- **Weeks 1–2: validate.** Caveats 1–4 on candy, on real runs. Go or no-go on the surface 1 thesis.
- **Weeks 3–6: v1 for the design partner.** P0.1–P0.7 on one category; dashboard on `/ai-tracking`.
- **Weeks 7–10: P1.** Category Truth Engine (measurement), citation audit, paid placement view, experiment design.
- **v2: act and prove.** Content Agent plays, earned evidence packs, controlled experiments, paid plus organic loop.
- **Dependencies:** answer-agent capture (build or license), legal review, review text source, SKU matching.

## Sources

- Shopping algorithm white paper, revised edition, Oct 2026 (how answer agents and autonomous agents retrieve, scan, verify and decide; title quantities drive scan-stage value; ads carry no merit weight).
- Research report: "Profound and AI shopping attribution," Oct 12, 2026 (`/Users/himanshujain/Content Agent/reports/`).
- Canon: `00-naming-and-voice.md`, `13-positioning-content.md`, `14-competitive-landscape.md` (Aug 2026).
- Hershey's AI Visibility Audit proposal, Apr 13, 2026.
- Existing prototype: `/ai-tracking` page; `docs/PRD-ally-brain-vision.md`.
