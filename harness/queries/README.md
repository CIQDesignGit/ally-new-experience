# Ally query library

Saved SQL templates, run through the CommerceIQ MCP gateway (`nlq__execute_sql`).
Each template is written once (from `answer_query`, mode sql), validated, then rerun with new
parameters, so the same analysis always fetches the same data the same way.
The gateway injects account scope (client, retailer); templates never hard-code it.

| Template | Params | Returns | Validated |
|---|---|---|---|
| `get_sku_health.sql` | `sku`, `start_date`, `end_date` | One row per week for one SKU: sales vs plan, traffic, conversion, price (ours, competitor), buy box, availability, stock, POs, ads, reviews, plus data checks | Oct 9 on 2 SKUs (cordless stick, espresso): matches `answer_query` output exactly, ~3.5s |

## Data checks in `get_sku_health`

Run before any explanation. A flagged week is reported as a data finding, not explained as performance.

- `check_plan_vs_prior_week`: plan ratio vs the week before. Big jumps (9-12x) seen when the plan's event week
  doesn't match the actual event week (Prime Day 2026: plan peaked Sep 20 week, deals ran Sep 27).
- `check_oos_conflicts_availability`: out-of-stock loss reported while availability is ~100%.
- `check_buy_box_missing`: lost buy box % is null (history only populated for the latest week, Oct 2026).
- `check_ad_spend_implausible`: ad spend under 0.1% of revenue on a $100K+ week.
- `check_price_vs_prior_week`: price ratio vs the week before (deal start or end).
