---
name: sku-rca
description: Root cause analysis for one SKU's week, on Amazon. Use when someone asks why a SKU missed plan, dropped, spiked or underperformed in a given week ("why did B07S652B12 miss plan the week of Sep 20?"), or when an alert on a SKU needs an explanation. Ends in sized actions, not just an explanation.
---

# SKU root cause analysis

Explain why one SKU's sales moved in one week, size each cause in dollars, rule things out out loud, and end with actions a person can take or approve. Write for a retail exec: plain words, dollars first, no field names.

## Inputs

- `sku` (ASIN). Required.
- `week`: the week to explain (week start date). Default: the most recent complete week.
- Account scope comes from the gateway. Never put client or retailer in a query.

## Step 1: Pull the standard panel

Call `get_sku_health` with `start_date` = 8 weeks before the week, `end_date` = the week's last day. Nine weeks of rows: the week plus 8 for a baseline. Always this window, so every run on a SKU sees the same data.

## Step 2: Check the data before explaining anything

Read the check columns first. Each one changes what you are allowed to say:

| Check | If it fires | What to do |
|---|---|---|
| `check_plan_vs_prior_week` above 3 or below 0.33 | The plan jumped or collapsed in one week | Plan likely sits on the wrong week (event timing). Don't treat the gap to plan as performance. Compare against the baseline (step 3) and say the plan looks misaligned. |
| `check_oos_conflicts_availability` true | Out-of-stock loss reported while availability is ~100% | Don't cite the out-of-stock loss as a cause. Say the two fields disagree. |
| `check_buy_box_missing` true | Lost buy box % is blank | Say buy box couldn't be checked for that week. Never read blank as 0%. |
| `check_ad_spend_implausible` true | Ad spend under 0.1% of revenue on a $100K+ week | Don't rule ads in or out. Say ad attribution looks incomplete for this SKU. |
| `check_price_vs_prior_week` under 0.85 or over 1.15 | Price moved 15%+ | A deal started or ended. Expect it to be a lead cause; confirm in step 4. |

Also check: is there any week with revenue but no plan, or plan but no revenue? Name it.

## Step 3: Set the baseline and the size of the move

- **Gap to plan**: revenue minus plan for the week. Report it, but only as the headline if the plan check passed.
- **Baseline**: the median revenue of the prior 8 weeks, excluding weeks where price was 15%+ below its usual level (deal weeks). This is "a normal week" for the SKU.
- **The move to explain**: week revenue minus baseline. If the plan check fired, this is the headline number, not the gap to plan.

## Step 4: Decompose and test causes

Revenue ≈ glance views × conversion × average price. Compare the week to the baseline weeks on each factor and say which moved and by how much.

Then test causes in this order. For each one, state the evidence and whether it is **in**, **out**, or **can't tell**:

1. **Price and deals.** Our price vs our usual price, and vs `competitor_offer_price`. A competitor 15%+ cheaper while we are at full price is a lead cause.
2. **Traffic.** Glance views and best seller rank. Traffic falling with price flat points to search or ads.
3. **Availability.** Availability %, out-of-stock loss (only if the check passed), weeks of cover under 2.
4. **Buy box.** Lost buy box % and revenue lost to buy box (only if not blank).
5. **Supply.** Purchase orders unfulfilled: large values mean the retailer ordered less than it asked for.
6. **Ads.** Spend and incremental ROAS week vs baseline (only if the ad check passed).
7. **Reviews.** New 1-star reviews as a share of new reviews; a jump above 15% matters.

If the panel can't settle a cause, ask one follow-up with `ask_data` (for example, the promo calendar for the SKU around the week). At most two follow-ups.

## Step 5: Size the causes

Put a dollar amount on each cause that is **in**, using the decomposition: what revenue would have been with that factor at baseline. Causes can overlap; give ranges, and say how much of the move is unexplained. If more than 40% is unexplained, say so in the verdict.

## Step 6: Decide the actions

Map each cause to an action, an owner and a bucket:

| Cause | Action | Owner | Bucket |
|---|---|---|---|
| Plan misaligned with event | Re-phase the event plan to the actual deal dates | Planning (customer) | Needs your input |
| Competitor undercut at full price | Pricing decision brief: match, hold, or deal | Customer (pricing is never automatic) | Needs your input |
| Deal ended, traffic fell | Next deal or coupon window, with expected lift | Sales / promo owner | Needs your input |
| Out of stock or low cover | Vendor manager note with dates and dollars at risk | Ops agent drafts, person sends | One approval away |
| Lost buy box | Vendor manager escalation with seller evidence | Ops agent drafts | One approval away |
| Unfulfilled POs | PO fill escalation | Ops agent drafts | One approval away |
| Ads under-funded on a converting SKU | Budget increase on the SKU's best terms | Media agent | One approval away (autopilot for tail SKUs) |
| Rating drop | Review investigation brief | Customer quality team | Needs your input |
| Data problem | Name the field and who fixes it | CommerceIQ data team | Needs your input |

Give each action a dollar value (what it recovers or protects, as a range) and a deadline when one exists. Rank by deadline, then dollars. Two to four actions.

## Step 7: Answer

Return this shape:

1. **Verdict**: one sentence: what happened, how much, the main cause.
2. **Why, in dollars**: the causes that are in, each with its dollar range and evidence in plain words.
3. **Ruled out**: what you checked and cleared, and what you couldn't check.
4. **Where it lands**: if the cause is still live, what next week looks like if nothing changes.
5. **Next actions**: the two to four actions, each with owner, bucket, value and deadline.
6. **Trust**: the weeks and fields used, the checks that fired, and your confidence (high, medium or low) with the reason.

Keep the verdict and the why under 120 words. Never invent a number the panel didn't give you. If a check fired, it must appear in Trust.
