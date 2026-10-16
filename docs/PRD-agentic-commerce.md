# PRD: AI Commerce, connecting shopping agents to retail sales

Oct 13, 2026 · Himanshu Jain · Status: draft for iteration · Internal

**Who we are.** CommerceIQ helps consumer and hardline brands grow sales on retailers like Amazon, Walmart and Target. For 2,200+ brands we connect content, retail media and shelf operations to retailer sales.

**The problem.** Shoppers increasingly use AI agents to buy: sometimes as a helper, sometimes letting the agent buy for them. This is growing fast, and brands need to win AI share of sales on this new shelf before competitors do.

**What we're building.** AI Commerce: measure your AI share of sales on every retailer, and Ally does the work, organic and paid, to grow it.

Related docs:
- [PRD-ai-commerce.md](PRD-ai-commerce.md): v1 measurement spec, Hershey's worked example, caveats 1 to 15. This PRD is the strategy layer above it.
- [PRD-ally-brain-vision.md](PRD-ally-brain-vision.md): Brain decides, agents act, Ally proves it. AI Commerce runs inside that model.
- Research: *Profound and AI shopping attribution*, *Profound moat and AI traffic data*, *AI shopping competitors* (in `Content Agent/reports` and `research_notes`).
- Shopping algorithm white paper (Oct 11, 2026).

---

## Summary

Humans and agents now shop together. That has opened new surfaces (ChatGPT, Gemini, Perplexity, Google AI Mode), new modes (personal agents like Muse and Instinct that shortlist and buy), and changed how discovery works on retailers themselves (Alexa for Shopping, Walmart Sparky). Retail search is being disrupted.

Most brands can't:
- **a) Measure** how they show up across these surfaces and modes, and how their existing retail search is changing.
- **b) Tie it to sales**, so they don't know what it's worth.
- **c) Act**, because they don't know what to change to win.

Tools today track visibility and improve it with content and brand-site (DTC) work. None connect it to the retailers, where more than 80% of revenue sits for large consumer and hardline brands.

### Win AI share of sales

*Share of voice tells you if AI mentions you. AI share of sales tells you if AI sells you, then we help you earn the sale (organic) or buy it (paid).*

- **The scoreboard is AI share of sales:** of all category sales that started with an AI agent, how much did you get? It's market share for the AI shelf, the number execs already run the business on. Share of voice becomes a diagnostic, not the headline.
- **Paid and organic in one decision.** In AI answers the ad and the organic recommendation sit in the same response. Ally decides per prompt: stop paying where you'd win anyway, buy while content catches up, fix the page, fix the shelf first.
- **Ally does the work:** product pages, shelf fixes, feeds, citations and media, approved by humans.

**What we keep.** This is an extension of what CommerceIQ already does, not a pivot:
- We already connect inputs (content, media, shelf) to retailer sales.
- We already optimize content for retail search and retailer shopping agents (AllyAI for Content scores every ASIN for Alexa for Shopping).
- We already run retail media.

**What changes.** Traffic can now come from any source, paid or unpaid, and land on any retailer. Agents are the change we focus on.

---

## What's changing

### Humans and agents shop together

| Change | What it is | Examples | What it means for brands |
|---|---|---|---|
| **New surfaces** | General answer agents that shoppers now ask before they go to a retailer | ChatGPT, Gemini, Perplexity, Claude, Google AI Mode | New demand source upstream of the retailer. Brands don't know if they're recommended or where the click lands |
| **New modes** | Personal and autonomous agents that build shortlists and can buy | Muse, Instinct | The agent, not the human, reads the page. Low funnel, fast, price- and spec-driven |
| **Changed retail discovery** | Retailers' own agents sit inside search and the product page | Alexa for Shopping (Rufus merged in May 2026), Walmart Sparky | Retail SEO now has two readers: the ranking algorithm and the assistant |

### What the agents actually do (white paper, Oct 11 2026)

- **Agents pick the retailer per category.** For "halloween candy bulk", ChatGPT searched Costco, Walmart and Target. For air fryers, Walmart and Best Buy. The retailer set is decided by the agent, not the brand.
- **Agents type into the retailer's own search box** and scan 30 to 50 results deep before picking 8 to 10 to verify. Retail search rank still feeds the AI answer, just deeper than page one.
- **The product title does double duty.** It's the retrieval key and the place agents read pack size and unit price. Pack count is often not a separate field, so agents compute value from title text.
- **Agents verify on the live product page:** price, stock, seller, variant. A broken shelf drops you even when you were recommended.

The bridge between the old world and the new one is the retailer product page. That's where CommerceIQ already works.

---

## Problem statement

**Shoppers increasingly use AI agents to buy, sometimes as a helper and sometimes autonomously. It's growing fast, and brands need to win AI share of sales on this new shelf.**

- **Helper:** the shopper asks ChatGPT, Alexa for Shopping or Sparky what to buy, then clicks through to a retailer.
- **Autonomous:** a personal agent like Muse or Instinct shortlists, and sometimes buys, on the shopper's behalf.
- **Growing fast:** AI-referred traffic to US retail sites was up 693% year over year in holiday 2025 and still up 62% in July 2026, and it converts better than other traffic (Adobe Digital Insights). Over 300 million consumers use Alexa for Shopping, driving $12B in incremental annualized sales at a 60% higher conversion rate (Amazon figures, as used in the AllyWorks doc; add source link). Walmart's Sparky is accelerating the same pattern.

Today brands can't win it, because they can't see it: they don't know their AI share of sales, what it's worth, or what to change on which retailer.

**Who has it:** the VP Ecommerce, who is measured on retailer sales. Brand marketing feels it too but measures attention. Content, SEO and media managers do the work. See *Who we sell to*.

**Cost of not solving it:** demand moves upstream into agents that decide before the shopper reaches the shelf. Brands that can't see it lose share without a signal in their retail reports until it's late. Agencies selling AI optimization today can't prove sales impact; one VP Ecommerce told us he is dropping his GEO agency at year end because organic revenue fell.

### Evidence of demand (Gmail and Gong, Jul to Oct 2026)

| Who | Type | What they asked |
|---|---|---|
| Nestle Purina EMEA | Customer | A strategy for ChatGPT and Perplexity alongside retailer AEO |
| Versuni (Philips) | Prospect, pilot | Runs an internal LLM program: measurement, content share of voice, product feeds, retailer assistants. ChatGPT is upper funnel, Alexa lower funnel |
| Fruit of the Loom | Prospect | One solution that baselines presence across retailer platforms and LLMs |
| Former Colgate VP Ecommerce (now at a DTC brand) | Prospect | GEO agency failing across LLMs; organic revenue down |
| Duracell, AMG, Niagara, Medline, Royal Canin, Spectrum Brands, Sodastream | Customers and prospects | Retailer AEO: Alexa for Shopping and Walmart visibility reports, custom prompts (10 to 100), competitor rank |
| Madrona (Scott Jacobson) | Investor | Extend from Alexa and Sparky to answer engines and personal agents: "you don't want to get caught flat-footed" |
| Rahul Shah (CEO), Guru Hariharan (founder) | Internal | Lead with AEO reports; AI visibility could be "much larger than just a small land play"; prototype and validate with customers quickly |
| Courtney Macfarlane (MD, Retail Media) | Internal | Visibility by ChatGPT prompt in Content Agent; prompt-theme reporting; ChatGPT ads bidding |
| Hill's Pet Nutrition (GM) | Customer | Agentic content is the #1 priority, above promotions. Scorecards measure "compliance, not quality". Wants outcomes: consideration, purchase clicks, purchases, with a sales or conversion lift guarantee. Evaluating several similar-looking vendors |

Signal: 3 explicit customer or prospect asks beyond Alexa, 7 retailer-AEO asks, and our free AEO report drove most of 120+ conference meetings (Sep 21 pipeline review). The ask is consistent: **show me where my brand ranks, not just on Alexa but on ChatGPT and the rest.**

---

## Landscape

All competitors are described from public sources and company claims; none is disparaged. Full notes in `research_notes/AI shopping competitors/`.

| Company | Surfaces | Retailers | Acts on | Ties to retailer sales? |
|---|---|---|---|---|
| Profound | Answer agents, ChatGPT Shopping, Muse and Instinct analysis | None; brand site via GA4 and Adobe | Web content, citations, ChatGPT ads (Ads Studio) | No. Stops at the brand's own site |
| Bluefish | Answer agents plus Alexa for Shopping | Amazon only | Content, citations, brand data feed, reviews (Bazaarvoice) | Claims revenue impact; method not public |
| Azoma | Answer agents, Alexa for Shopping, Sparky, agent protocols | Amazon, Walmart, Shopify, Google Merchant Center | Retailer pages, blogs, citation syndication, catalog feed (AMP) | Partly; incrementality on roadmap with dunnhumby |
| DetailPage | Retailer search, answer agents, Rufus, Sparky | Amazon, Walmart, Target, Home Depot | Retailer page text, keywords, images | Partly; claims traffic lift from control-group study |
| Rankscale | 11+ answer engines | None | Audits, recommendations | Traffic only (GA4 beta) |
| Stackline | ChatGPT and Rufus visibility | Amazon | Recommendations | Measures impressions, not sales |

**They measure attention. We measure and drive sales.** Every tool above leads with share of voice, visibility or impressions, because it sells to marketing and can't see retailer sales. Two claims we must not make lightly: "revenue" (Bluefish and Azoma already say it) and "attribution" (nobody has organic attribution for answer agents yet). Our claim is the honest split: proven, estimated with a confidence band, and at risk.

**The gap.** Nobody combines all four: every surface measured, retailer sales as the scoreboard, paid and organic in one system, and the ability to change the retailer page and shelf. Collecting visibility data is becoming a commodity (Adobe Brand Visibility, Google Search Console AI reports, Cloudflare crawler analytics). What's hard to copy is the join with retailer sales, retail media and the product page.

---

## Who we sell to

**We target the VP Ecommerce.** The buyer is defined by the scoreboard, not the budget, and the VP Ecommerce is the person measured on retailer sales.

| Retailer type | Examples | Who owns the P&L | Who runs digital execution | Who we sell to |
|---|---|---|---|---|
| Pure-play | Amazon | Amazon P&L lead (the Amazon sales team), reporting to the VP Ecommerce | Same team | Amazon P&L lead, sponsored by the VP Ecommerce |
| Omnichannel | Walmart, Target, Costco, Best Buy | Sales customer team, because most of the business is in stores | VP Ecommerce or digital team, dotted line mostly to sales, sometimes to marketing (for example Newell, Versuni) | VP Ecommerce |

The VP Ecommerce sits over both: the Amazon P&L lead reports to them, and they run digital execution for every other retailer. They're the one person who sees every retailer's online sales, which is exactly the view AI share of sales needs. Land with the Amazon P&L lead (deepest data, clearest P&L), expand through the VP Ecommerce to other retailers. Champions and users under them: retailer team leads (Amazon lead, Walmart lead), content and digital shelf managers, retail media managers.

Nobody owns AI shopping as a P&L line today. Marketing has the curiosity but not the sales number; ecommerce has the number but sees LLMs as "top of funnel". Whoever turns AI shopping into a sales line makes it someone's job. That's our opening.

### Where the money sits (typical pattern, varies by company)

| Lever | Usual owner | Our read |
|---|---|---|
| Sponsored Prompts (Alexa for Shopping) | Retail sales team, with search ads | Core. Buys like search ads, sits on the sales P&L |
| Walmart retail media, incl. Sparky sponsored prompts | Run by marketing; funding often comes from sales (trade dollars) | Core, two owners: marketing runs it, sales pays for it. The sales funder wants proof it converts on Walmart, which is our number |
| ChatGPT ads (incl. via Amazon DSP) | Marketing, upper funnel | Shared. Sales teams are a growing voice on DSP because they want it to convert on their retailers |
| Retailer content and product pages | Ecommerce team, dotted line to sales, sometimes to marketing (for example Newell, Versuni) | Core. Content Agent sells here today |
| Shelf fixes (stock, buy box, price) | Ecommerce and sales ops | Core |
| Citations, PR, earned media | Marketing and PR | Second door. We bring the numbers and drafts; marketing sends |
| Agency fees (GEO, SEO, retail media agencies) | Split | The budget AI Commerce can replace; one VP Ecommerce is dropping his GEO agency at year end |

Who runs a budget and who funds it are often different people. Our pitch goes to the funder, because the funder wants proof of sales.

Evidence from our calls: Mars Wrigley holds search ads on the sales P&L while brand and DSP budgets sit with a separate marketing team; at Purina, search and DSP sit in separate lanes with brand decisions owned by brand teams; at Versuni, the content budget sits with a digital team under marketing.

### Packaging implications

- **Lead with the VP Ecommerce,** using their levers: retailer content, shelf, Sponsored Prompts and search ads, and services.
- **Bring marketing in second** for ChatGPT ads and citations, with AI share of sales as the shared number.
- **Consider outcome-based pricing** on proven and estimated AI sales lift. It sidesteps the budget split and makes our proven vs estimated honesty a commercial necessity. Hill's responded well to a 60-day pilot with a guaranteed outcome.

**Risk:** the VP Ecommerce may still say ChatGPT is marketing's problem. The answer has to be in their retailer's terms: "$X of your Walmart sales started in ChatGPT last month, and $Y was lost to a stockout on the page it linked to."

---

## Our approach

### Principles

1. **Retail sales is the scoreboard.** AI share of sales is the headline; every number is labeled proven, estimated or at risk.
2. **Any source, any retailer.** We track whichever retailers the agents send shoppers to, per category. Retailer coverage grows with what agents use, not a fixed list.
3. **Paid and organic together.** Sponsored Prompts, Sparky sponsored prompts and ChatGPT ads sit next to organic share, because paid AI placements are both a lever and our calibration for organic traffic.
4. **Ally does the work.** Every finding comes with drafted work: a page rewrite, a citation brief, a feed fix, a shelf fix, a media change. Humans approve or add context.
5. **Honest numbers.** Bands with confidence, not false precision. Correlation is a signal; experiments prove cause.

### The model: four sources, measured the same way

| Source | Surfaces | Metric | What we can see today |
|---|---|---|---|
| Retailer search | Amazon, Walmart, Target and others' search | Share of voice (paid and organic) | Strong: we already track it |
| Retailer shopping agents | Alexa for Shopping, Sparky | AI share of voice | Strong: AllyAI for Content scores this today |
| Answer agents | ChatGPT, Gemini, Perplexity, Claude, AI Mode | Recommendation rate | New: needs prompt runs at scale |
| Personal agents | Muse, Instinct | Recommendation rate in shortlists | New and small: tracked set only |

Each source share is the demand-weighted average of its surfaces. Each is tied to the retailer sales it can reach: retailer surfaces to their own retailer, answer and personal agents to whichever retailers they link to.

### The headline: AI share of sales

| Metric | Question it answers | Formula (proposed) |
|---|---|---|
| **AI share of sales** (headline) | Of all category sales that started with an AI agent, how much did we get? | Our AI-driven sales ÷ category AI-driven sales |
| **AI-driven sales** | How much of our retailer sales started with an agent? | Proven + estimated, in $ and % of our sales |
| AI share of voice (diagnostic) | Why did AI share of sales move? | Demand-weighted recommendation rate |

Competitor AI-driven sales come from the same funnel, using their recommendation rates and our Market Share model's sales estimates (85 to 90% brand-level accuracy on Amazon). AI share of sales is always shown as a range with confidence, never a single precise number.

**Can we make it happen?** For Amazon, mostly yes: Sponsored Prompts gives real paid numbers, Market Share gives competitor sales, our runs give recommendation rates. For Walmart and others it's an estimate with wider bands. We ship it as a band first and tighten it with experiments, tagged links and partnerships.

### Paid and organic, one decision per prompt

| Organic | Paid | What Ally does |
|---|---|---|
| Recommended | Also buying the ad | **Stop paying.** You'd win it anyway |
| Not recommended, high demand | Not buying | **Buy now, fix content.** Pay while the content catches up |
| Not recommended, fixable | Buying | **Fix the page,** then step down spend |
| Recommended, shelf broken | Any | **Fix the shelf first.** Paid or organic, the click is wasted |

This is incrementality (our iROAS strength in retail media) applied to the AI shelf. A visibility vendor can't make this call because it doesn't run the media; a media agency can't because it doesn't control the product page.

### Three jobs, one page

1. **Measure:** AI share of sales and AI-driven sales, with share of voice by source and surface as the diagnostic.
2. **Prove:** proven, estimated, at risk, in retailer sales.
3. **Win:** the paid and organic decision per prompt, plus five action buckets: Ops fixes, Content, Media, Citations, Feeds.

### The five actions: where we're at parity and where we're strong

| Action | What Ally does | Where we stand | Who else does it |
|---|---|---|---|
| **Ops fixes** | Stock, buy box, price gaps, content authority on AI-linked pages | **Strength.** Live automations today (reinstatement, 3P variants, content authority) | Visibility tools don't touch the shelf |
| **Content** | Retailer product pages: titles, bullets, attributes, images, Q&A | **Strength, parity on writing.** Content Agent publishes to Amazon natively and ties changes to sales; rewriting pages alone is offered by Azoma and DetailPage | Azoma, DetailPage, Profitero, Salsify |
| **Media** | Sponsored Prompts, Sparky sponsored prompts, ChatGPT ads; paid and organic call per prompt | **Strength on retailer AI ads, gap on ChatGPT ads.** We run retailer media with iROAS today; ChatGPT ads bidding is not built | Profound (Ads Studio), Criteo |
| **Citations** | Sources AI cites, claims, earned media drafts, links to the right retailer page | **Gap.** Others are ahead; we draft, the brand's PR lead sends | Profound, Bluefish, Azoma |
| **Feeds** | Product data for Google, ChatGPT, Meta and agent protocols | **Parity at best today.** Could become a strength with a cross-retailer attribute graph (see strategic bet) | Azoma (AMP), Salsify, Syndigo, SPINS |

Our edge isn't any single action. It's doing all five against one scoreboard, retailer sales, with paid and organic decided together.

The built demo (`/ai-commerce`, Hershey's, illustrative, local only) shows all three.

---

## Our moat

Content tools are everywhere. Hill's GM told us he's evaluating several "similar-looking solutions". A moat has to be something a competitor can't get with money and a year.

### The core moat: what wins the sale

A cross-retailer product graph, labeled with sales outcomes.

1. **Match** the same product across Amazon, Walmart, Kroger, Albertsons, Target and others: UPC where it exists, otherwise title, brand, size, pack count and image, each with a confidence score. We've done product matching before; extend it.
2. **Consolidate** every attribute from three sources, each with source and date:
   - **Brand MDM / PIM** (Salsify, Stibo, InRiver and others): what the brand says
   - **Live retailer pages:** what each retailer shows, which is what agents read
   - **Labels and certifications:** what's verified
3. **Find gaps:** missing attributes, conflicts across retailers (12 count on Walmart, 10 on Kroger), facts that live only in the title.
4. **Enrich** in tiers:

   | Tier | Example | Rule |
   |---|---|---|
   | Verified | Brand MDM, label | Ally publishes (autopilot or one approval) |
   | Observed | Another retailer shows it | Human approves, then publish |
   | Inferred, non-regulated | "Good for parties" from similar products | Human approves, then publish |
   | Inferred, regulated | Gluten-free, allergens, organic, ingredients | Ally attaches evidence (label photo, spec sheet, certification); a human confirms against it. **No evidence, no publish.** Routes to the brand's legal or regulatory reviewer |

   Every published claim keeps an audit trail: source, evidence, approver, date.
5. **Push** fixes to every retailer through Content Agent syndication, and to Google, ChatGPT and Meta feeds.
6. **Learn:** measure each fix against retailer sales and AI share of sales. Rank the next fixes by what won before.

**Why it's a moat.** Others know part of the picture; only we see the change and the sale.

| Who | What they know |
|---|---|
| SPINS, NielsenIQ (Label Insight) | What's true about the product (label) |
| Salsify, Syndigo | What the brand says (MDM, syndication) |
| Profound, Bluefish | What AI says about you |
| Azoma, DetailPage | How to rewrite a page |
| **CommerceIQ** | **What every retailer shows, what the brand says, the gap, and which fixes sold more** |

**The flywheel:** more brands → more MDM, retailer data and measured fixes → better matching, gap-finding and predictions → better results → more brands.

**How it shows up in a demo:** "Products like yours that added this attribute gained X points of Alexa share and Y% sales across N tests." A content tool can't say that.

**Positioning against SPINS** (launched Agentic Discovery on its Product Knowledge Graph, Sep 22 2026): *They know what's true about your product. We know what agents see on every retailer, where it's wrong, and which fix sells more.*

### Our other moats

| Moat | Type | Strength today | Why it's hard to copy |
|---|---|---|---|
| Retailer sales and account connections (1,450+ retailers) | Hard-won resource, switching cost | Strong | Years of integrations and approvals |
| Paid and organic together | Counter-positioning | Strong | Agencies paid on spend can't tell you to spend less; visibility tools don't run media |
| We act on the retailer (syndication, automations, media accounts) | Process power | Strong | Most AI tools only recommend |
| Market Share model | Improves with more customers | Medium-strong | Calibrated on real Vendor Central sales; makes AI share of sales computable |
| Memory and context (each brand's decisions and results) | Switching cost | Medium, growing | Leaving means starting over |
| Outcome-based pricing | Counter-positioning | Potential | Hard to price on outcomes you can't measure |
| Install base (2,200+ brands, free AEO report) | Distribution | Medium | Sells as expansion, not new logos |

**Not moats:** generating content (commodity), tracking AI visibility (Google, Cloudflare give it away, Adobe bundles it), dashboards, UI.

### Preconditions

1. **Data rights.** Learning across customers from MDM data and outcomes needs contract terms that allow anonymized, aggregate learning. Without them, there is no network effect. *Owner: Legal.*
2. **Volume.** How many content changes have we already measured against sales? Thousands means we have the seed. *Owner: Data.*
3. **Measurement quality.** Outcomes need controls (featured vs control experiments), or the dataset learns coincidences. *Owner: Data science.*
4. **Matching coverage.** What do our existing product matching and Unified Catalog already cover? *Owner: Engineering.*

**First test:** 50 candy products across Amazon, Walmart and Kroger. Count gaps, conflicts and title-only attributes. If the gaps are large, that's the demo.

### Later option: our data as a tool agents call

Shopify now offers its catalog as a skill any agent can use. Our version would be live retailer data (price, stock, unit price, ratings across retailers) as a tool for ChatGPT, Claude or retailer agents. It would make us a source agents read and give us measured prompts, clicks and link-outs. Open risks: consumer distribution, neutrality (organic must stay neutral; sponsored labeled), and rights to redistribute scraped data. Explore after legal review; not in v1.

---

## Goals

| Goal | Measure | Target (to confirm) |
|---|---|---|
| Give brands one view across every shopping surface | Customers with all four sources live | 10 design partners by end of Q1 2027 |
| Tie AI surfaces to retailer sales | Share of a customer's AI-linked sales shown as proven or estimated with a confidence label | 100% of tracked surfaces have a band; at least one proven source per customer |
| Turn insight into work | Ally actions approved per customer per month | 20+ |
| Prove lift | Featured vs control SKU experiments completed with a readout | 1 per design partner in first 90 days |
| Grow the business | AEO report to paid conversion; expansion into Content Agent and Media Agent | Set with GTM |

## Non-goals: what we don't optimize for

These are choices about what we optimize for, not features we're skipping. Each one is a trade-off we'll defend when a customer or competitor pulls the other way.

| We optimize for | Not for | Why it matters |
|---|---|---|
| **Sales** | Visibility, mentions or share of voice | A mention that doesn't sell is noise. We won't chase rank on informational prompts with no shopping intent, even if it looks good on a chart |
| **Retailer sales** | Brand-site (DTC) traffic | More than 80% of revenue for our customers is on retailers. Brand-site work only counts when it moves a retailer sale |
| **Incremental sales** | Total attributed sales or more ad spend | Ally will tell you to stop paying for AI placements you'd win organically, even when that cuts media we manage |
| **Honest numbers** | Precise-looking numbers | Proven, estimated and at risk, always labeled. We'd rather show a wide band than a confident number we can't defend |
| **Depth on shopping prompts** | Breadth of every prompt and every engine | We go deep on the prompts that lead to purchases in our customers' categories, not the biggest prompt panel or the longest engine list |
| **Being the right answer** | Gaming the agent | Accurate product facts, real reviews and fixed shelves. No manipulative content or review tricks: agents verify on the live page and retailers penalize mismatches |
| **The brand's sales** | The retailer's or the AI platform's goals | We partner with retailers and AI platforms for data, but we work for the brand |


---

## User stories

**VP Ecommerce (exec, primary: owns retailer sales)**
- As a VP Ecommerce, I want my AI share of sales against competitors, so I know if we're winning the sales that start with AI, in the same terms as market share.
- As a VP Ecommerce, I want to know where we pay for AI placements we'd win organically, and where we should pay while content catches up, so paid and organic stop working against each other.
- As a VP Ecommerce, I want to see AI-driven sales split into proven, estimated and at risk, so I can defend the investment to my CEO.
- As a VP Ecommerce, I want to see which retailers agents send my shoppers to, by category, so I prioritize the right retailer teams.
- As a VP Ecommerce, I want the top actions ranked by deadline and dollars, so my team works on what matters this week.

**Retailer team lead (doer-exec: Amazon or Walmart lead)**
- As the Amazon lead, I want Sponsored Prompts results next to organic AI share for the same prompts, so I can defend the spend in our joint business plan.

**CMO / brand marketing (exec, secondary)**
- As a CMO, I want our AI visibility tied to retailer sales, not just mentions, so brand and ecommerce budgets are judged on the same number.
- As a CMO, I want to know which sources AI cites about us and competitors, so PR and content go where they count.

**Content and SEO manager (doer)**
- As a content manager, I want to see which product pages, titles and attributes cost us recommendations, with Ally's drafted fix, so I approve instead of writing.
- As an SEO manager, I want retail search rank and AI share side by side for each prompt bucket, so I see whether a page change helped both.

**Media manager (doer)**
- As a media manager, I want Sponsored Prompts and ChatGPT ad results next to organic share for the same prompts, so I spend where organic is weak.

**Edge cases**
- A category where agents rarely show products: show the shopping-mode rate and say so, not an empty chart.
- A retailer we have no sales data for: show traffic estimates only, labeled.
- A surface with too few runs this week: hold the number and say how many runs are left.

---

## Requirements

### P0: must have (v1)

**Measure**

| # | Requirement | Acceptance criteria |
|---|---|---|
| P0.1 | **Prompt set per category from real demand.** Prompts built from retailer search terms (SQP, Walmart search) and grouped into prompt buckets (for example best-for, comparison, deal, gift, reorder) | Given a category, when the set is generated, then each prompt has a bucket, a demand weight and a source term; the PM can add custom prompts (10 to 100) |
| P0.2 | **Runs on every source.** Each prompt runs on answer agents (about 10 runs a week), retailer agents (Alexa for Shopping, Sparky) and a tracked set of personal agents | Given a week, then each surface shows run count, failures and capture method |
| P0.3 | **Share by source and surface.** Recommendation rate and share of voice for us and tracked competitors, rolled up by source with the demand weight | Given the overview, then four source cards show share, leader and trend, and expand to surfaces; numbers tie to the surface rows |
| P0.4 | **Retailer link share, discovered.** Which retailers each answer and personal agent links to, per category | Given candy, then the retailers shown are the ones agents linked to (for example Walmart, Amazon, Costco, Target), not a fixed list |
| P0.5 | **Retail search alongside.** Our existing retail search share of voice in the same view, for the same prompt buckets | Given a prompt bucket, then retail search share and AI share sit side by side |

**Prove**

| # | Requirement | Acceptance criteria |
|---|---|---|
| P0.5a | **AI share of sales (headline).** Our AI-driven sales ÷ category AI-driven sales, by retailer and category, with competitors | Given a category, then the headline shows our AI share of sales as a range with confidence, the leader, and the change vs last period; it ties to the AI-driven sales below |
| P0.6 | **Proven sales from paid AI placements.** Sponsored Prompts (Amazon), Sparky sponsored prompts (Walmart), ChatGPT ads where reported | Given connected ad accounts, then proven sales show with source and date range |
| P0.7 | **Estimated AI traffic and sales in bands.** High, Medium or Low by source and by prompt bucket, with a confidence label | Given a surface, then traffic and sales show as a band with the method and the checks that agree or disagree |
| P0.8 | **At risk at the shelf.** AI-linked product pages with out of stock, lost buy box or a price gap, valued | Given a shelf break on an AI-linked page, then it appears with dollars a week and routes to Ops fixes |
| P0.9 | **Moves with sales.** Week-over-week correlation of each surface's share with its matched retailer sales, after at least 8 weeks | Given fewer than 8 weeks, then show "needs N more weeks", not a number |

**Win**

| # | Requirement | Acceptance criteria |
|---|---|---|
| P0.9a | **Paid and organic decision per prompt bucket.** For each bucket: organic recommendation, paid placement and spend, shelf state, and Ally's call (stop paying, buy now and fix content, fix the page, fix the shelf first) | Given a bucket where we're recommended organically and also paying, then Ally proposes the spend step-down with projected impact; approval routes to Media Agent |
| P0.10 | **Five action buckets with drafted work.** Ops fixes, Content, Media, Citations, Feeds, each with an autonomy state (On autopilot / One approval away / Needs your input) | Given an action, then the draft opens in place and approval removes it from the open total |
| P0.11 | **Ranking.** Actions ranked by deadline first, then dollars | Given two actions with and without a deadline, then the dated one comes first |
| P0.12 | **Experiment to prove lift.** Featured vs matched control SKUs for 4 weeks, read in retailer sales | Given an experiment, then the readout shows lift, confidence and the method |

### P1: should have

- **Tagged links in assets we create.** Amazon Attribution tags on every citation asset and buying guide; Walmart Sales Rewards tags where the customer qualifies.
- **Echo and question-style search signals.** Branded-query lift in SQP when AI share rises; question-style queries tracked as their own bucket.
- **Unexplained traffic.** Page views minus SQP clicks minus other ad clicks minus tagged clicks, trended against AI share.
- **Citation map.** Which sources AI cites for us and competitors, by surface, feeding the Citations bucket.
- **Review and claims mining.** What reviews and AI answers say about us vs competitors, feeding Content.
- **Similarweb AI traffic** to retailer domains, to check our bands.
- **Weekly email** to the VP Ecommerce with the three numbers and top actions.

### P2: future

- Product-level agent traffic from retailers through partnerships (signed-agent standards like Web Bot Auth).
- Autonomous checkout signals (agent orders) as retailers expose them.
- More retailers and markets (Carrefour, EU languages).
- Bidding automation for ChatGPT ads and AI placements in Media Agent.
- Brand-controlled product catalog for agents (feeds direct to agent protocols).

---

## Proposed business logic (to confirm)

1. **Source share** = demand-weighted average of its surfaces' recommendation rates, over at least the run count shown.
2. **Retailers in scope** = retailers that agents link to for the category, ranked by link share. Sales data closes the loop where we have it; otherwise traffic only.
3. **Estimated visits to a retailer** = prompt volume × shopping-mode rate × recommendation rate × click rate × that retailer's link share.
   - Retailer agents skip link share; volume comes from retailer search demand × assistant usage share.
   - Click rate and conversion are calibrated from Sponsored Prompts reports, discounted for organic.
4. **Sales impact**
   - Proven = paid AI placement sales from retailer reports.
   - Estimated = estimated visits × that retailer's conversion × average price, checked against correlation.
   - At risk = AI-linked pages with a shelf break × their estimated visits × conversion × price.
5. **AI share of sales** = our AI-driven sales (proven + estimated) ÷ category AI-driven sales. Competitors' AI-driven sales use their recommendation rates in the same funnel and their sales from the Market Share model. Shown as a range.
6. **Paid and organic call** per prompt bucket: recommended organically and paying → step down; not recommended, high demand, not paying → buy and fix content; not recommended, paying → fix the page; shelf broken → fix the shelf first.
7. **Bands:** High, Medium, Low cut points per category; confidence is High when three checks agree (funnel, unexplained traffic, Similarweb), Medium for two, Low for one.
8. **Action value** = projected incremental sales a week; ranked deadline first, then dollars.

## Success metrics

| Type | Metric | Target (to confirm) |
|---|---|---|
| Leading | Design partners with all four sources live | 10 by end of Q1 2027 |
| Leading | Weekly active execs on the page | 60% of design partners |
| Leading | Actions approved per account per month | 20+ |
| Lagging | AI share change on featured SKUs vs control | Positive and significant in 70% of experiments |
| Lagging | Retailer sales lift on featured SKUs vs control | Set after first 3 experiments |
| Lagging | AEO report to paid conversion; expansion to Content and Media Agent | Set with GTM |

---

## Data and partnerships

| Need | Source | Status |
|---|---|---|
| Prompt demand | Retailer search (SQP, Walmart), Google search; Similarweb or licensed panel to scale | Have retailer search; license TBD |
| Answers | Our own runs on each surface | Build or license capture |
| Paid AI placements | Sponsored Prompts, Sparky sponsored, ChatGPT ads via Amazon DSP pilot | Partly live; pilots |
| Retailer sales and traffic | Vendor Central, Brand Analytics, Walmart, Target, others | Have for connected accounts |
| Tagged traffic | Amazon Attribution, Walmart Sales Rewards | Amazon live; Walmart needs solution provider status |
| Retailer agent traffic | Amazon and Walmart partnership asks | Not available; ask |

---

## Risks and caveats

The detailed list is in [PRD-ai-commerce.md](PRD-ai-commerce.md#caveats-where-we-need-a-solution-or-more-validation). The ones that change scope:

1. **Organic attribution for answer agents isn't possible today.** We show bands and prove with experiments and tagged links.
2. **Capturing consumer AI apps at scale** is new infrastructure and has terms-of-service questions. Needs legal review.
3. **Answers are volatile.** Always rates over many runs, never a rank.
4. **Prompt volume is an estimate** everywhere, including competitors' figures.
5. **Amazon restricts third-party agents** (Muse blocked; Perplexity Comet injunction). Personal-agent coverage stays small.
6. **Buyer split.** We target the VP Ecommerce, but ChatGPT ads and citations budgets often sit with marketing, and omnichannel ecommerce teams report into sales or marketing. Packaging must let the VP Ecommerce buy without waiting on marketing.
7. **Correlation is confounded.** Agents recommend what already sells; claims of impact wait for experiments.

## Open questions

| # | Question | Owner | Blocking? |
|---|---|---|---|
| 1 | Build or license answer capture per engine? | Engineering | Yes |
| 2 | Legal position on automated querying of consumer AI apps | Legal | Yes |
| 3 | Is retailer-agent traffic counted in SQP clicks? Decides the unexplained-traffic method | Data | No |
| 4 | Can CommerceIQ become a Walmart Sales Rewards solution provider? | Partnerships | No |
| 5 | Packaging: one SKU (firstpick) vs inside Content and Media Agent; free AEO report as the land | GTM, Product | No |
| 6 | Which categories first: price-driven consumables (strongest agent impact) vs hardlines | Product | No |
| 7 | What Amazon and Walmart would share on organic assistant performance | Partnerships | No |
| 8 | Validate the buyer map with 5 customers: who owns Sponsored Prompts, ChatGPT ads and retailer content budgets? | GTM, Product | Yes, for packaging |
| 9 | Is AI share of sales accurate enough on Walmart and other retailers without retailer data partnerships? Set the minimum confidence to show it | Data | No |
| 10 | Outcome-based pricing on AI sales lift: how do we price the estimated part? | GTM, Finance | No |
| 11 | Do customer contracts allow anonymized learning across customers (MDM data, outcomes)? | Legal | Yes, for the moat |
| 12 | How many content changes have we measured against sales to date? | Data | No |
| 13 | What does existing product matching and Unified Catalog cover across retailers? | Engineering | No |

## Phasing

| Phase | Scope | When (to confirm) |
|---|---|---|
| Crawl | Extend the free AEO report from Alexa to ChatGPT, Gemini, Perplexity, AI Mode; retailer link share; one category demo | Nov 2026 |
| Walk | Four sources, proven / estimated / at risk, five action buckets, 3 to 5 design partners, first experiments | Q1 2027 |
| Run | Tagged links, partnerships for retailer agent data, Media Agent bidding on AI placements, more retailers and markets | Q2 2027 onward |

## Sources

- Shopping algorithm white paper, revised edition, Oct 11 2026.
- Reports: *Profound and AI shopping attribution*; *Profound moat and AI traffic data* (Oct 13 2026).
- Notes: `research_notes/AI shopping competitors/azoma_detailpage.md`, `bluefish_and_peers.md` (Oct 13 2026).
- Copilot for Amazon powered by AllyAI, Product Box Q1 2026 (Alexa for Shopping optimization).
- Gmail and Gong summaries, Jul to Oct 2026 (internal; customer names confidential).
