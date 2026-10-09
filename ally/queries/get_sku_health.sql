-- get_sku_health: the standard first panel for a SKU RCA.
-- One row per week for one SKU: sales vs plan, traffic, price, buy box, stock, ads, reviews,
-- plus data checks so a bad number is flagged before anyone explains it.
-- Params: {{sku}}, {{start_date}}, {{end_date}} (inclusive, YYYY-MM-DD).
-- Account scope (client, retailer) is injected by the CommerceIQ gateway; don't add it here.
WITH weekly AS (
  SELECT sku, week_start_date,
    MEASURE(total_pos) AS revenue,
    MEASURE(ops_plan) AS plan,
    MEASURE(ops_gap) AS gap_to_plan,
    MEASURE(pdp_views) AS glance_views,
    MEASURE(unit_conversion_rate) AS conversion_pct,
    ROUND(MEASURE(digital_pos) / NULLIF(MEASURE(ordered_units_digital_sales), 0), 2) AS avg_price,
    MEASURE(list_price) AS list_price,
    MEASURE(amz_price_war_comp_offer_price) AS competitor_offer_price,
    MEASURE(revenue_lost_due_to_lbb) AS lost_to_buy_box,
    MEASURE(revenue_lost_due_to_oos) AS lost_to_out_of_stock,
    MEASURE(ad_spend) AS ad_spend,
    MEASURE(ad_sales) AS ad_sales,
    MEASURE(iroas) AS incremental_roas,
    MEASURE(review_ratings_total_new_reviews) AS new_reviews,
    MEASURE(review_ratings_star1_new_reviews) AS new_one_star,
    MEASURE(po_unfulfilled_value) AS po_unfulfilled
  FROM client_catalog.bi.sku_fact_metric_view_mv
  WHERE report_date BETWEEN DATE '{{start_date}}' AND DATE '{{end_date}}'
    AND sku = '{{sku}}'
  GROUP BY sku, week_start_date
),
daily AS (
  SELECT sku, week_start_date, report_date, product_name, brand, category, client_id,
    MEASURE(actual_lbb_rate) AS lost_buy_box_pct,
    MEASURE(availability_pct) AS availability_pct,
    MEASURE(weeks_of_cover) AS weeks_of_cover,
    MEASURE(on_hand_inventory) AS on_hand,
    MEASURE(bsr_category1_avg) AS best_seller_rank
  FROM client_catalog.bi.sku_fact_metric_view_mv
  WHERE report_date BETWEEN DATE '{{start_date}}' AND DATE '{{end_date}}'
    AND sku = '{{sku}}'
  GROUP BY sku, week_start_date, report_date, product_name, brand, category, client_id
),
latest AS (
  SELECT * FROM daily
  QUALIFY ROW_NUMBER() OVER (PARTITION BY sku, week_start_date ORDER BY report_date DESC) = 1
)
SELECT
  w.sku, l.product_name, l.brand, l.category, l.client_id, w.week_start_date,
  w.revenue, w.plan, w.gap_to_plan, w.glance_views, w.conversion_pct,
  w.avg_price, w.list_price, w.competitor_offer_price,
  l.lost_buy_box_pct, l.availability_pct, l.weeks_of_cover, l.on_hand, l.best_seller_rank,
  w.lost_to_buy_box, w.lost_to_out_of_stock, w.po_unfulfilled,
  w.ad_spend, w.ad_sales, w.incremental_roas, w.new_reviews, w.new_one_star,
  -- Data checks: flag before explaining.
  ROUND(w.plan / NULLIF(LAG(w.plan) OVER (ORDER BY w.week_start_date), 0), 2) AS check_plan_vs_prior_week,
  (w.lost_to_out_of_stock > 0 AND l.availability_pct >= 99) AS check_oos_conflicts_availability,
  (l.lost_buy_box_pct IS NULL) AS check_buy_box_missing,
  (w.revenue > 100000 AND w.ad_spend < w.revenue * 0.001) AS check_ad_spend_implausible,
  ROUND(w.avg_price / NULLIF(LAG(w.avg_price) OVER (ORDER BY w.week_start_date), 0), 2) AS check_price_vs_prior_week
FROM weekly w
LEFT JOIN latest l ON w.sku = l.sku AND w.week_start_date = l.week_start_date
ORDER BY w.week_start_date DESC
