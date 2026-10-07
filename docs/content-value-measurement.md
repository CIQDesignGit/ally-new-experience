# Content agent value measurement — decisions

Working decisions from the exec-review follow-up (Sep 2026). Scope: content agent only.

## Naming
- Always: Seasonal (event: Mother's Day), Foundational (everyday content outside events: keywords, titles, images), Retail readiness. In sentences say "improved everyday content", never "fixed foundational". Content leads every list; last quarter splits content $700K · media $476K · ops $84K = $1.26M.

## How we say the method
- Each work-type row carries a tag: "vs category" (Seasonal) or "A/B tested" (Foundational, Retail readiness). Hover or click the tag for one sentence. No method paragraph on the page.
- vs category: compared with the category over the same weeks. We don't split event traffic, so every shopper sees your event content. (Amazon allows seasonal A/B tests; we choose not to.)
- A/B tested: half your shoppers saw the old content and half the new, at the same time. We state it for the SKUs as a whole; long-tail SKUs too small to test are not called out (their sales are minor).
- Retail readiness is A/B tested once unblocked (old vs new content), like Foundational.

## Principles
- Promised and delivered use the same method and the same baseline (the promise). No re-based "expected" numbers in the headline.
- Isolate content: stockouts, traffic, price/promo and ad spend changes are removed or shown as "not content." No other agent is credited or blamed in the content view.
- Plain language first, numbers second. Litmus test: an exec with no context understands the card on one read.
- Same shape at every level: promised vs delivered → why short → proof → SKUs.
- Freeze the promise when it's made; never revise it afterwards.

## Work types (kept separate in the detail view, rolled up for the exec)
| Work type | Method | Label | Counts for |
|---|---|---|---|
| Seasonal (Mother's Day) | YoY pre vs post vs category (see below) | Adjusted | Event window only |
| Foundational | A/B test | Measured | Banked; later changes measured against the new content (accretive) |
| Retail readiness | Content value on SKUs blocked today; one bucket per SKU (no double counting) | Estimated | [12 weeks] — open |

## Seasonal method
- Category = shoppers searching the same Amazon search terms, this year vs last.
- Lead before: your SKUs' growth minus category growth, 4 weeks before the event vs same weeks last year.
- Lead during: same, event vs last year's event.
- Content lift = lead during − lead before (e.g. 6.1% − 3.0% = 3.1%). SKUs may already beat the category; that's fine.
- Delivered = content lift × actual event sales on live SKUs.
- Promised = expected lift × expected event sales.
- Expected lift (seasonal) = average new-title lift in the brand's last 4 seasonal events, measured the same way. Shown in "How we calculated". Must never be confused with the SKUs' usual lead over the category; keep the numbers visibly different in the mock (lead 2.5%, expected lift 3.0%, measured 3.1%).
- Expected event sales (default) = last year's event sales × 4-week pre-event trend. Customer plan may override (live product).
- New SKUs with no history: compare with similar SKUs. Changed event format: compare per day.

## Content summary (under the Content row)
- Line 1: result. "Content delivered $700K of the $890K promised."
- Line 2: the gap in two parts plus learning: missed the window ($185K: 58 SKUs awaiting approval + 8 retail readiness SKUs still blocked), stockouts ($45K), and live changes beat plan (+$40K) with the few failures fixed and learned.
- Ties: $890K − $185K − $45K + $40K = $700K. Failures are framed as learnings, not a loss, because live changes beat plan net.

## Demo structure (content, last quarter)
- One seasonal event only: Mother's Day. Not Prime Day: a deal event where discount depth confounds the lift, and it falls in Q3.
- Content row: "$X delivered of $Y promised" + one summary line of what we did (Mother's Day SKUs updated, foundational SKUs fixed, SKUs unblocked for syndication).
- Click: three rows (Seasonal (Mother's Day) · Foundational · Retail readiness), each "what we did" + delivered of promised.
- Click Mother's Day: its card. Foundational and retail readiness open A/B cards; all cards link to the Content results page (/content-results).
- No content-wide funnel; each type has its own. "Increase autopilot" sits on the "not approved in time" row.

## Seasonal card (mock)
- Headline: $X delivered of $Y promised.
- Two lines: what went live and the lead change; why short.
- Two bars: "4 weeks before [event]" and "[event], with new titles", each "% faster than category".
- One check line under the bars: "Same price and ads as before", own-SKU average selling price and ad spend, event weeks vs 4 weeks before. Only our own numbers (category price/ads not used).
- Rule: funnel = things that changed the dollars (not approved, stockouts). Checks = things that could explain the lift but didn't (price, ads).
- Funnel: promised → not approved in time → out of stock → expected on live SKUs → delivered (+/− vs expected).
- "How we calculated" collapsed.
- SKU list columns: SKU · What happened · Event sales · vs category 4 wks before · vs category during. No per-SKU dollar lift (too noisy).

## Lift rates
- Rates depend on the SKU's starting point (first optimization vs re-optimization); a change resets the baseline. Keyed on content score before the change. Not shown to execs.

## Foundational card (mock)
- Proof: A/B tests on the 60 live SKUs shown as dots (51 won, 9 lost and went back to old content) + lift across all 60 (+4.2%).
- Check line: same shoppers, same weeks, so price, ads and season can't explain the lift.
- Expected lift 3.8% = average of the brand's last 3 baseline A/B tests.
- Banking: we bank the lift; any later change on those SKUs is measured against the new content, so it only adds.
- Funnel has no stockout row: in an A/B test both halves share the same stock, so a stockout can't explain a gap vs promise.
- Expected lift = result of the brand's last baseline A/B test; this test's result becomes the next expected lift.

## Learnings (both cards)
- "What didn't work, and what we changed": each group of underperforming SKUs, why, and "Agent now: …". Ends with where the fix is already applied (e.g. this quarter's Halloween batch).
- Seasonal learnings include stockouts (the agent now checks weeks of stock before events). Foundational learnings are only about content, since A/B tests remove stock effects.

## Deferred to live product
- "Event demand came in lower/higher than forecast" funnel row.
- Customer event plan as forecast override.
- "Value you're keeping": lift from past changes still in place, proven by quarterly holdout re-tests. Answers the renewal objection (value shrinking over time). Pair with new value this quarter and next quarter's open pipeline.
- SKU list as its own page, aggregated across all types of work and agents (replaces the inline "See all SKUs" table).

## Weekly auto-nudge (Claire's page)
- Auto-send on by default: Ally emails each owner their actions every Monday 8:00 AM. Setting in the banner: "Send every Monday automatically" / "Let me review first" (review mode shows "Review and send").
- Banner under the header: "Monday 8:00 AM: we emailed this week's actions to your team." + who's in progress + who hasn't started, with "Nudge [name]" (fires the real Slack DM).
- Row statuses: "Emailed Mon · not started" or "In progress · X of Y". Row action becomes "Nudge again"; after a nudge, "Nudged today".
- Demo state: Mike not started (keeps the live Slack moment), Michelle 12 of 30 POs sent, James reviewing his plays. Tier values show what's left, so no totals change.
- Not doing: a Thursday auto-reminder (adds a concept).
- Hero order: total → split by area → effort and expiry.

## Banked (current quarter) and area views
- Banked expand uses the same table as "How we did": Banked · Promised · vs promise. Content first (opens to its summary and Seasonal / Foundational / Retail readiness), then media and ops. Q3 so far: content $520K of $580K, media $370K of $340K, ops $310K of $360K = $1.2M of $1.28M. Seasonal event this quarter: back to school.
- Tier version: "By status / By area" toggle on "Where it sits today". By area = open only ($1.5M content · $3.2M ops · $2.1M media = $6.8M), content first, each group nudges its owner and opens to its statuses.
- Waterfall version: no toggle. Clicking the Total bar opens "Total opportunity by area": the same area groups plus Banked = $8.0M.
