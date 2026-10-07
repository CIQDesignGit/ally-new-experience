# Waterfall-only change log

From Sep 2026, design changes land in `/claire-waterfall` only. `/claire` (tier version) is frozen at its pre-"business-first" state: status strip + "driven by Ally" pill, hero, tiers with Already banked, How we did (Q2) with the Mother's Day / Foundational / Retail readiness cards, How you compare, inline Ask Ally.

Each row is a waterfall change to port to `/claire` if we keep it.

| Date | Change (waterfall) | Files | Port to /claire? |
|---|---|---|---|
| Sep 23 2026 | Business-first hero: "$37M so far · on pace for $40M against a $45M plan" + "$5M short of plan. $6.8M open to close it." Replaces status strip, "driven by Ally" pill and "Hi Claire" | `claire/business-hero.tsx`, `data.ts` (BUSINESS, fmtBiz) | Open |
| Sep 23 2026 | Bridge to plan chart: on pace $40M → +3.7 / +2.2 / +0.9 → with Ally $46.8M, dashed plan line; banked stage removed; "With Ally" opens open-by-area | `waterfall/waterfall-chart.tsx`, `waterfall/stage-detail.tsx`, `data.ts` (WATERFALL_STAGES) | n/a (waterfall-only chart) |
| Sep 23 2026 | "This quarter so far": Projected $1.28M · Delivered $1.20M, paired bars by area, content opens bars by type + dot bullets + link to results (period=qtd). Replaces How we did (Q2) and Already banked | `claire/this-quarter-section.tsx`, `delivered-content-data.ts` (bullets) | Open |
| Sep 23 2026 | Removed How you compare (autopilot) | page only | Open |
| Sep 23 2026 | Floating translucent Ask Ally bar; chip "Why is content $60K behind projection?" (Q3) | `claire/ask-ally.tsx`, `ask-ally-answers.tsx` | Open (/claire uses `ask-ally-inline.tsx`) |
| Sep 23 2026 | Results page: "This quarter" period (default), "projected" wording | `results/*`, `content-results-data.ts` | Shared (Q2 cards link with period=quarter) |
| Sep 23 2026 | "This quarter so far": paired bars replaced by the table; columns Projected · Delivered · vs projected (Delivered stays bold); Content opens to dot bullets, type rows, then "See SKU-level results and method" | `claire/this-quarter-section.tsx`, `delivered/columns.tsx` (projectedFirst), `delivered/content-delivered-row.tsx` (bullets, resultsHref), `delivered/delivered-summary-row.tsx` | Open: /claire still uses Delivered · Promised · vs promise |
| Sep 23 2026 | Headline: "$5M gap to plan. $6.8M of opportunity can close it." (was "$5M short of plan. $6.8M open to close it.") | `claire/business-hero.tsx` | Only if /claire adopts the business-first hero |
| Sep 23 2026 | Content opens to a waterfall by type (Foundational → Seasonal → Retail readiness → Content) against a dashed "Projected" line; each bar shows 2–3 dot bullets, total shows content bullets; results link below | `claire/content-waterfall.tsx` (new), `claire/this-quarter-section.tsx`, `delivered-content-data.ts` (bullets per type, Q3) | Open |
| Sep 23 2026 | Content waterfall bullets: TEMPORARY "Try: Hover · Click · Panel" switch. Hover = card beside the bar; Click = popover under the bar, closes on outside click; Panel = card below the chart. Pick one, then remove the switch | `claire/content-waterfall.tsx` | Decide first |
| Sep 23 2026 | Content waterfall: Panel chosen (below the chart, opens on the Content total). Hover/Click and the Try switch removed | `claire/content-waterfall.tsx` | Open (with the content waterfall) |
| Sep 24 2026 | Header bar removed (logo, Reset, Email to my team, avatar). Small Ally mark moves onto the hero's first line; Reset becomes a faint link at the page bottom; email moves to an Ask Ally chip ("Email this summary to my team" downloads the PDF) | `app/claire-waterfall/page.tsx`, `claire/business-hero.tsx`, `claire/ask-ally-answers.tsx` | Open |
| Sep 24 2026 | Weekly banner is an overlay card at the top, auto-hides after 5s, stays while hovered | `claire/weekly-banner.tsx` (overlay prop) | Open |
| Sep 24 2026 | Ask Ally drawer collapses on click outside; clicking the pill reopens it with the last answer | `claire/ask-ally.tsx` | Open |
| Sep 24 2026 | Stage rows: weekly status gets its own column (lg and up), with the "Expires in N days" chip under it; owner column is just the name. Below lg both stack under the owner | `claire/nudge-row.tsx` (statusColumn prop), `waterfall/stage-detail.tsx` | Open (By area rows in area-view still stack) |
| Sep 24 2026 | Stage panel header uses the row grid: total aligns over row values, Nudge team over the Nudge again buttons | `waterfall/stage-detail.tsx` | n/a (waterfall panel) |
| Sep 24 2026 | Content waterfall total bar gray (slate-400), matching the bridge chart: steps colored, totals neutral; type bars stay one content purple | `claire/content-waterfall.tsx` | Open (with the content waterfall) |
| Sep 24 2026 | Content waterfall colors (checked in browser): types one purple (brand-400, no dimming), total slate-500, neutral selection box. Rejected: gray total on lavender box (muddy); hue per type (too loud, teal read as success green) | `claire/content-waterfall.tsx` | Open (with the content waterfall) |
| Sep 24 2026 | Content bullets rewritten (Q3, ties to $60K gap): went live + approval ($45K) + stockout ($15K) with hover "Increase autopilot" (toast); lift 3.4% vs control (A/B split, or category for seasonal) adjusted for ad spend, price, availability; 25 of 207 underperformed, Ally tuned itself (sparkle bullet) | `delivered-content-data.ts` (Bullet type, learn tone, action), `claire/content-waterfall.tsx` | Open |
| Sep 24 2026 | Content bullets 2–3 in Himanshu's wording (3.2% vs control; "Ally tuned itself … to make the next run better"); results page Q3 lifts aligned to 3.2% | `delivered-content-data.ts`, `content-results-data.ts` | Open |
| Sep 24 2026 | Type bullets refined: Foundational (38 of 45 won, 4.0%; 7 lost → agent context); Seasonal back to school (150 of 168, 2.9% over category adjusted; $40K = 18 unapproved $25K + stockout $15K, hover Increase autopilot); Retail readiness (10 unblocked via 28 backend attributes; 3 need team input $10K, hover Nudge team → real Slack DM to Mike). Content totals re-tied: 205 of 236 live, $35K approval + $10K team + $15K stockout = $60K | `delivered-content-data.ts`, `content-results-data.ts`, `claire/content-waterfall.tsx` | Open |

## Mike's home: inbox grouped like Claire's page (shared data change)
- **Shared data (affects /claire and /claire-waterfall):** `DEADLINE.expiring` is now $500K (was $740K), the Halloween batch alone. The content approval row reads "Halloween seasonal updates and a foundational refresh." ($740K = Halloween $500K + Foundational refresh $240K). Mike's nudge target now names both batches.
- Batch approve values now equal their listed values (Halloween $500K, Foundational $240K, Retail readiness $180K) so Mike's totals tie to Claire's.
- /mike: headline only ("$740K is one approval from live. $500K of it expires in 18 days."), inbox grouped One approval away / Needs your input / On autopilot, Approve all on the first group.
- Sample SKU: side by side, live on Amazon beside Ally's version, with word-level marks (removed struck on the live side, added green on Ally's side). The Halloween pack shot is now styled for Halloween (dusk grade, pumpkins, bats) instead of a grayscale copy.

## All $740K one approval away is seasonal (shared data change)
- **Shared data (affects /claire and /claire-waterfall):** `DEADLINE.expiring` back to $740K. The second approval batch is now "Halloween gift sets" ($240K, 339 SKUs, expires Oct 8) in place of the Foundational refresh. Claire's content row reads "Halloween seasonal updates and gift sets."
- /claire-waterfall: "Hi Claire" restored in the top line, before the period switcher (same spot as "Hi Mike").
- /mike: grounding above the action: "$1.5M of content opportunity is open this quarter." plus Value delivered ($520K of $580K projected), SEO share of voice (42%, up 0.8 pts), AI share of voice (34%, up 1.4 pts), Days saved (7.7). Headline now "$740K is one approval from live. All of it expires in 18 days."

## Links and Mike's top shaped like Claire's
- Every "back to Claire" link and redirect (Mike, Michelle, content results, impact back bar) now goes to /claire-waterfall.
- /mike top: one line like Claire's ("Hi Mike · Q3 FY26 · $520K of $580K delivered · SEO share of voice 42% ↑0.8 pts · AI share of voice 34% ↑1.4 pts · 7.7 days saved"), then the 40px headline, then "$1.5M open in content · $740K one approval away · $600K needs your input · $200K on autopilot". Metric tiles removed; Reset moved to a faint control below the page.

## Mike: two-line headline, banked bar, work types, delivered section
- /mike headline: "$1.5M of content opportunity is open this quarter." (24px) over "$740K is one approval from live. All of it expires in 18 days." (40px). Breakdown line removed.
- Progress bar is the quarter's content: $520K banked (dark), what Mike approves (lighter), $1.5M open.
- Left rail names each batch by work type with a subscript: Seasonal (Halloween moments / Halloween gift sets), Foundational (Backend keywords and attributes), Retail readiness (Attributes Amazon requires; PIM → PDP fixes on autopilot). SKU counts now equal what gets approved (378, 331, 273, 94); the separate "N SKUs" line is gone, only "See all N SKUs".
- New "This quarter so far" section on /mike, content only: Claire's content waterfall, without the Nudge team button (on Mike's page the team is Mike).
- **Shared data:** the approval batch counts changed (Halloween 384→378, gift sets 339→331, readiness 100→94); the team-content nudge now reads "Foundational and retail readiness".

## Mike: colored buckets, input and autopilot batches, bar moves on every action
- Left rail groups use Claire's waterfall colors: purple One approval away, amber Needs your input, blue On autopilot (tinted header + colored edge).
- Needs your input: "Add Halloween concepts" (Seasonal, $420K, 245 SKUs; Ally localizes concepts per retailer and customizes per SKU) replaces Backend keywords and attributes. Retail readiness renamed "Listings blocked from syndication" with the callout "We added 412 of 470 attributes on 94 SKUs automatically. The other 58, on 21 SKUs, need your team's input…" and a Fill 58 attributes button.
- On autopilot: PIM → PDP fixes is Foundational and clickable (fills blank images, descriptions, bullets, attributes from PIM).
- Progress bar moves on every action (approve, add concepts, fill attributes); open = sum of batches not yet acted on.
- Top line no longer shows delivered (it's in the section below). Reset moved inside the page bottom, like Claire's.
- **Shared data:** Claire's team-tier content row now reads "Halloween concepts and attributes blocking syndication."

## Needs-your-input flow, buttons, text colors
- /mike input batches: button "Review N SKUs" (245 concepts, 21 retail readiness) opens the first SKU; each field Ally can't fill is a full-width "Your input" box with the live value above it; footer "Send to Ally". List tags show only the deadline or state (no repeated counts).
- /mike buttons: one shared style (44px, 15px semibold, same border and radius); primary filled, secondary outlined. "Or review all N SKUs one by one" moved under the buttons.
- Text colors standardized to four shades: slate-950 headings and numbers, slate-700 body, slate-500 secondary, slate-400 hints (900→950, 800→700, 600→500). Applied to Mike and waterfall-only Claire components. **Shared:** ask-ally-answers.tsx is also used by /claire's inline Ask Ally, so its text shades changed there too. Not yet applied: nudge-row, delivered/columns, weekly-banner (shared with /claire).

## Autopilot drill-down: share on autopilot vs best in class
- /claire-waterfall, On autopilot stage: new table (waterfall/autopilot-detail.tsx). Per workstream: what runs itself, value, % of its open opportunity on autopilot (content 13%, media 24%, ops 6%), best in class (35%, 60%, 30%), and Increase autopilot on hover. Header shows the totals (13% vs 40% weighted) and Increase autopilot for all.
- New data constant AUTOPILOT_BEST_IN_CLASS in data.ts (benchmarks are mock).

## Autopilot table redo + one column-header standard
- Autopilot drill-down redesigned: header states the claim ("13% of your open opportunity runs itself. Best-in-class brands run 40%.") with value and Increase autopilot; each row shows share on autopilot as a filled track with a best-in-class tick on the same track (the gap reads without math). Action column sized so the button never touches the value; descriptions stack under the workstream below lg.
- Column-header standard for every table: one row under the table's title bar, 12px medium slate-500, sentence case, number columns right-aligned (same as "This quarter so far"). Added to the One approval away / Needs your team stage tables (Owner · What's waiting · This week · Value) and autopilot (Workstream · What runs itself · On autopilot vs best in class · Value).
- Value columns line up at the same x across all three stage tables.

## Seasonal events by period (shared data)
- Rule: Q3 FY26 (Jul–Sep, current) = back to school; August = back to school; Q2 FY26 (Apr–Jun) = Mother's Day; FY25 = 11 shopping events. Halloween is the upcoming event (open work, publish by Oct 8).
- **Shared data:** August's content story changed from "rewrote 61 product pages ahead of back to school" to "updated 70 SKUs for back to school, improved everyday content on 22, and unblocked 8 for syndication" to match August's results (100 SKUs live).
- Not changed: the old launchpad home (/, components/landing) still says Prime Day for Q3; it isn't part of the Claire/Mike demo.

## Results page: tables by measurement method (shared page)
- vs category (seasonal): SKU · Result · SKU impressions · Category impressions (the demand benchmark, event weeks vs the 4 weeks before) · Lead (pts, the only colored column) · Adjusted for (price, ad spend, days out of stock; material ones in amber) · Incremental sales (after normalizing). Caption states the method.
- A/B tested (foundational, retail readiness): SKU · Result · Lift vs old content (colored) · Confidence · Test length · Incremental sales. Caption: both halves see the same price, ads and stock, so nothing needs adjusting.
- Units, traffic and conversion lifts removed from the tables and the summary strip. Strip is method-aware: seasonal = your impressions, category impressions, lead; A/B = lift, tests won, average confidence; all = sales lift, seasonal lead, A/B tests won.
- Back to school (Q3, August) has its own SKUs (dorm jar, teacher gift set…); the $15K stockout row ties to Claire's Q3 story. Q2 keeps Mother's Day SKUs. Foundational Q3 ties to Claire's "38 of 45 won, 4.0%".
- Result shown as a small status dot plus text, not a pill.

## Results page design pass (shared page)
- Result column is an outcome ("Outgrew the category", "Grew slower than the category", "Out of stock 11 days", "Not approved in time"); A/B keeps "Won A/B test" / "Lost, back to old content".
- vs category: SKU growth and category demand growth (category impressions as the demand signal) drawn as two bars on one scale (SKU purple, category gray, negative red); "Lead vs usual" judged against the SKU's lead in the previous period ("usually +1.0 pts"), so pre-existing outperformance gets no credit.
- Money lost is red everywhere; gains stay neutral; verdict columns green/red.
- Headline leads with "$520K delivered of $580K projected" ($ in brand purple); summary strip's first cell tinted with a progress bar; positive/negative evidence colored.
- Each type is a card like Claire's tables: title bar with type mark (shades of content purple), method tag, method note, and delivered-vs-projected with progress bar; then column headers and rows with hover.
- Results page: period is now a dropdown in the top line ("Content results · Q3 FY26 so far ▾"), same control as Claire's top line; type tabs stay as tabs. Segmented buttons no longer keep a focus outline after a click.
- Q3 content bullet tense fixed: "3 needed your team's input" (shared data).

## Ops row opens like Content (This quarter so far)
- /claire-waterfall: the Ops row ($310K of $360K) opens to the same waterfall as Content: Buy box $150K · Promo badge $100K · Shipping speed $60K → Ops $310K against projected, ops-blue bars, bullets per bar, Nudge team on hover nudges Michelle.
- Ops $ = revenue leakage prevented (new method tag "Leakage prevented"): each SKU's normal daily sales × the 12 days sooner it was fixed (48 hours instead of 2 weeks), adjusted for price and seasonality.
- ContentWaterfall generalized (order, total label, bar color, owner row; results link optional). New data OPS_BANKED_Q3 in delivered-content-data.ts ties to BANKED_OTHER ops.

## Ask Ally everywhere; Michelle rebuilt like Mike
- Ask Ally floating bar on /mike, /michelle and /content-results (Claire already had it), each with its own chips and answers built from that page's numbers (ask-ally-personas.tsx). AskAlly now takes questions, renderAnswer and placeholder.
- /michelle rebuilt on Mike's layout: top line (Hi Michelle · Q3 FY26 · buy box win rate, promo badges live, days to fix), two-line headline ("$3.2M of ops opportunity is open this quarter." / "$2.4M is one approval from live. $720K of it is losing the sale right now."), banked progress bar, color-coded buckets with Approve all, same detail pane and buttons, per-item input for Needs your input (chargeback disputes $350K, shorted POs $250K), autopilot promotions $200K, and the ops "This quarter so far" waterfall at the bottom.
- **Shared data:** Claire's ops approval row now reads "Buy box, promo badge, listing and shipping fixes, one email each." with weekly "Reviewing the fixes" (was "PO email for low-inventory SKUs", "12 of 30 POs sent"). Promo window moved to Sep 15–Oct 5 (it had ended before the demo date).

## Claire's pace line as a sentence
- /claire-waterfall: "$37M so far · on pace for $40M against a $45M plan" moved out of the top line into its own sentence above the headline, 24px like Mike's and Michelle's first line: "You're on pace to hit $40M in sales against a plan of $45M." The top line is now just "Hi Claire · Q3 FY26 ▾". "$37M so far" dropped.
- "On pace" renamed "current run rate": sentence now "Your current run rate is $40M in sales against a plan of $45M."; first chart bar "Current run rate · if nothing changes".
- First chart bar caption removed: just "Current run rate".
- Bridge order: Current run rate → On autopilot → One approval away → Needs your team → With Ally (zero effort first, then rising effort).
- "With Ally" bar caption "by area" removed.
- On autopilot bar caption: "Already scheduled, no action required" (was "0 min"); chart label area 60→72px so the two-line caption plus Select/Viewing fits.
- Hero reworded fact → fear → comfort (VP of Sales voice): "You're tracking to $40M in sales this quarter." / "That's $5M short of your $45M plan." / "We have $6.8M in the pipeline to close it." Each headline sentence on its own line; period word follows the dropdown.
- Last chart bar renamed "With Ally" → "Total opportunity".
- Stage rows: Mike (content) shows "Nudge again" without hover; Michelle and James rows have no nudge button (they have started). NudgeRow got a `nudge` prop ("hover" default keeps /claire unchanged).
- Number rule (now in design-specs.md → "Number and Color Rules"): every lost or owed amount in bullets carries a minus and is red ("(−$35K)"); gain figures in "worked" bullets are green ("3.2%"); figures never wrap. The "vs projected" column and section deltas are red when negative (was amber). **Shared:** the delivered columns and bullet data are also used by /claire, so its negative deltas turn red too.
- Every percentage now carries its total: "Sales increased $520K (3.2%)", seasonal "$260K (2.9%)", foundational "$180K (4.0%)", Mike Ask Ally answer. Rule added to design-specs.md and the ciq-prototype skill.
- Results summary: the percentage rides with its dollar figure ("$520K +3.2%" in the first cell); the duplicate "Sales lift" / "Lift vs old content" cells removed, so All and A/B tabs show 3 cells, Seasonal 4.

## Progress bar as labeled pieces (Mike and Michelle)
- The bar no longer implies a total (banked + open = $2.02M, a number the user never saw). It's split into pieces with a gap between them and a legend in the same colors: ● $520K banked this quarter · ● $X unlocked today (after he acts) · ○ $1.5M open (white, outlined). Nothing sits at the right edge. Shared component mike/split-bar.tsx.
- "What the agent changed" → "What Ally changed".
- Progress bar shows the total at the right ("$2.02M this quarter") alongside the pieces ($520K banked · $1.5M open). **Shared data:** content now totals exactly $1.5M — retail readiness batch $180K → $140K; Claire team-tier content row $0.6M → $560K (team tier still rounds to $2.2M).
- Mike and Michelle: batch values and group totals are signed ("+$500K", "One approval away · +$740K") so they read as projected incremental value, not revenue. Detail header says "projected incremental sales" (ops: "projected leakage prevented"). Values stay black until approved, then turn green.

## Data model and live loop (no more hard-coding)
- **One table of work items** (`data.ts` → `getSnapshot()`, logic in `model.ts`): content, ops and media items with lever, bucket, value, SKUs, deadline date, urgency. James's media items are seeded (no page yet).
  - Everything is derived from it: Claire's tier rows, totals, bridge values, the split by area, "$X expires in N days" (days from the date and the demo's as-of date), nudge targets, and Mike's approval total.
- **Status is derived:** seeded weekly activity merged with this session's actions. Anyone who approves becomes "In progress · 1 of 2 approved", then "All approved".
  - **Nudge buttons show only for owners who haven't started.** This replaces the rule that was keyed to Mike.
  - The weekly banner, Mike's bell (what was actually nudged), Michelle's "losing the sale" (the `urgent` flag) and Mike's "All of it expires" (true only if every open item has the deadline) are all derived.
- **Claire's page is live** (`live-model.ts`, `useLive()`). When Mike or Michelle act, the hero ("tracking to", gap, pipeline), the split by area, "45 min unlocks", the expiry line, the bridge and the stage rows all update. Approved value moves into the current run rate.
- **The "This quarter so far" drill-down is data-driven.** Any lever with a breakdown opens; media has none yet.
- **Formats:** money uses K below $1M (for example $0.56M → $560K, and /claire's $0.9M → $900K). Business numbers keep one decimal when they aren't whole, so the parts add up on screen.
- **Shared data:** media team work is $1.04M (was a typed $1.0M) so the team bucket really sums to $2.2M.
- Stage tables: "Nudge team" removed. Each row nudges its owner only if they haven't started.
- Autopilot: "Increase autopilot" moved from the header to each area's row, always visible, same button style as row nudges.
- "Total opportunity" drill-down rebuilt as the same card as the other stage tables (`waterfall/area-detail.tsx`, live):
  - title "Open opportunity by area", with the tie-out line "$40M current run rate + $6.8M open = $46.8M, against a $45M plan"
  - one column-header row
  - each area's open money as a stacked bar in the bridge's colors, with the three amounts under it
  - values on the same edge as the other tables
  - the old AreaView stays on /claire
- **Mike and Michelle inbox rail redesigned (shared `mike/rail.tsx`):**
  - a white rail with a small colored dot per bucket instead of tinted headers and side bars
  - a shared deadline said once in the group header ("Expires Oct 8 · 18 days"), with an item showing its own only when it differs
  - a neutral selected card, and "Approve all" as a quiet text action
  - one meta line per item ("378 SKUs ▾" · state)
- **Claire:**
  - the area table's nudge now reads "Nudge", and stage rows say "Nudge" (was "Nudge again")
  - disclosure chevrons moved to the leading edge in the area table and "This quarter so far", with media indented to line up
- Inbox rail, second pass:
  - bucket sections back as clear bands (tinted header one shade darker, colored edge) with a line saying what each bucket means. Mike's approval line is computed from review minutes; the default is "One approval each"
  - each expiring item shows its own "Expires in 18 days" as amber text, no filled chip. The deadline is per item, never assumed for the whole group
  - items on white, neutral selection

## Review policy, step 1: gear and settings page
- **Gear icon** in the top line of Claire, Mike, Michelle and the results page opens `/settings`.
- **Settings → Review policy:**
  - tier defaults (Hero · top 50% of sales, Core · next 40%, Tail · last 10%) with Review each / Approve in bulk / Autopilot
  - two optional switches (every title change, every main image change) that send matching SKUs to review whatever the tier
  - review rules scoped by retailer, brands, SKU groups and tier, with the most specific one winning. They look like the product's Knowledge page, with neutral chips and the author and date
  - a save bar that previews the effect on today's work ("Saving puts 394 more SKUs (+$590K) on autopilot")
- **Settings → Knowledge:** a simple version of the product's Knowledge page on this design system.
- The policy is saved with the demo state (Reset restores the defaults). Model in `policy.ts`; Mike's two approval batches carry SKU splits by tier (mock).

## Review policy: title and image review folded into Review rules
- Removed the "Also review, for every SKU" switches. A review rule now has a "Changes" picker: Any change, Title changes, Main image changes.
- `Policy` drops `reviewTitles` / `reviewImages`; `ReviewRule` gains optional `field`. A field rule applies only to changes touching that field and takes the stricter of its mode and the SKU's mode, so it only adds review.
- `shipPlan` pulls touched SKUs into the stricter field-rule mode per tier. Same numbers as the old switch for an "Amazon · All brands · Every tier · Title changes → Review each" rule.

## Review policy step 2: Mike's inbox cut by the policy (one item, one action)
- `contentBatches(policy)` (data.ts) cuts each batch with a tier split into parts: bulk keeps the batch id, the one-by-one part is `<id>-review`, the autopilot part is `<id>-auto` (moves to the autopilot band, "Goes live Oct 1", no deadline). Parts carry `mode` and `partLabel` ("Core", "Hero", "Tail" when a part is one tier). Change counts scale to the part.
- `getSnapshot(policy?)`, `tierView`, `waterfallStages`, `openView`, `deadlineView` take an optional policy; `useLive` passes the saved one, so Claire's buckets, bridge and expiry follow it. No policy = the seed batches, so /claire stays frozen.
- Default policy: one approval away $680K (Halloween core $400K, hero $60K; gift sets core $190K, hero $30K); autopilot +$60K (tails, Oct 1). Claire shows $680K for Mike and "$680K expires in 18 days".
- Approve all ships bulk items only; with only one-by-one items left it hides. One-by-one items: "Review N SKUs" opens the first SKU; the SKU pane footer approves the part.
- `nudgeTargets(policy)` replaces the static targets in the Slack nudge and Mike's bell, so the DM ties too.

## Review policy: value by sales share, sample on hero items, clearer names, nudge-driven source
- Tier split value follows share of sales (hero 48%, core 41%, tail 11%), not SKU count. Halloween: hero $240K, core $205K, tail $55K. Gift sets: hero $115K, core $100K, tail $25K. One approval away $660K; autopilot +$80K from tails.
- "Preview a sample" → "Review sample SKU", now also on one-by-one (hero) items.
- "Halloween moments" → "Halloween jar candles" (event + category); Slack nudge batch name to match.
- `Batch.nudgeKey`: the source line reads "Emailed Monday 8:00 AM" until Claire nudges, then "Nudged by Claire, just now".
- Mike's Ask Ally "approve first" answer updated to hero first, then core.

## Claire's top line: email PDF, team bell, reset on load
- Opening or reloading /claire-waterfall resets the demo (nudges, approvals, policy). A module-scope flag keeps in-app navigation from resetting. `resetDemo` clears storage synchronously so the provider's mount read can't restore old state.
- Weekly banner overlay removed from /claire-waterfall (kept on frozen /claire). New `TeamBell`: bell with a count of owners not started and not nudged; panel "This week" with the email line, who started, who hasn't (with Nudge), Auto-send toggle.
- Mail icon (`EmailPdfButton`) left of the bell downloads the summary PDF.
- `exec-pdf.ts` rebuilt from the live model to mirror the page, fully expanded: hero sentences, the bridge chart against plan, every stage's rows with this week's status, open opportunity by area and bucket, this quarter so far with each lever's breakdown and bullets. Takes `{ approved, nudged, policy }`.
- Total opportunity drill-down now reads the review policy. Slack popup moved to bottom-right so it doesn't cover the bell panel.

## Mike: trust signals, review-all lands on the first SKU, hold autopilot, Halloween background
- Core items carry `reassure` ("None of these are hero SKUs. Your 12 hero SKUs get reviewed one by one."), derived from the plan, shown under the approve buttons.
- Every "Review N SKUs" / "Or review all N one by one" opens the first SKU side by side, expands its list in the rail and scrolls the queue to the top (smooth, with a jump fallback).
- Hero sample ends with "This is 1 of 12 hero SKUs…" + Review 12 SKUs + "Or approve all 12".
- Autopilot parts (tails) get a sample SKU, "See all N SKUs", and "Hold these N SKUs for your review": `policy.holds` (one-off, not a rule) turns the part into a `<id>-held` item one approval away; Claire's buckets follow.
- Concepts: new `background` section kind. `BackgroundComposer`: three SVG Halloween scenes or an upload, "Apply to this SKU" places the product photo on the scene; footer CTA "Apply to all 245 SKUs" (`need.cta`).

## Concepts: apply per SKU, then next SKU or apply to all
- `BackgroundProvider` (mike page) keeps the background applied per SKU; switching SKUs shows that SKU's own state (fixes "Applied" carrying over). New SKUs start from the last background used.
- Composer: "Apply to this SKU" → "✓ Applied" + "Next SKU →". Footer: "N of 245 SKUs have a Halloween background. Use {scene} for the other X, or go one by one." with Next SKU and Apply to all 245 (disabled until one is applied). Rail shows a check on SKUs with a background.

## Oct 8, Q4 FY26; one shared period drives every page
- `AS_OF` 2026-10-08, Halloween publish-by Oct 26 (still "18 days"), tails go live Oct 15. Q4 FY26 = Oct–Dec; FY26 ends with it. `BUSINESS`/`INFLIGHT` are Q4-sized (quarter $48M run rate vs $52M plan).
- `getSnapshot(policy, period)`: each item counts only the value that lands in the period (spread evenly from today to its end: Halloween Oct 31 for seasonal, else Dec 31). All views take `period`; `useLive` passes the shared one. Quarter = unchanged totals.
- `period` lives in `NudgeProvider` (not stored); `PeriodSwitch` in Claire's, Mike's and Michelle's headers.
- Bridge: plan and run rate for the period, axis start derived (90% of the lower, rounded), steps under $1M in K.
- `delivered-periods.ts`: `DELIVERED[period]` (week, October = Q4 so far, FY26) for content, ops, media; Claire's section, Mike's and Michelle's sections, the progress bars' banked value, the PDF and Ask Ally all read it. Q3 data stays for the results page, relabeled "Last quarter".
- `fmtBiz` reads K under $1M; the expiry line hides when the deadline falls after the period.

## Inbox order and delivered bullets
- Mike's and Michelle's rails: bands by ease (group order), items by value within a band. Mike's page opens on the top approval item (Halloween jar candles · Hero, +$240K).
- Removed "Increase autopilot" from delivered bullets (content waterfall) and funnel rows. It stays on Claire's On autopilot rows.

## Brain phase 1a: Grow beyond plan (Market, Competition, Event readiness) with the Ally panel
- `market.ts`: candle segments (size, growth, share, change, bullets, plays), competitors (headline, moves, stats, at-risk), next event (Black Friday: readiness by lever, last year's replay, plays). Plays carry owner (content, media, ops, human), annual and quarter value, SKUs, tier.
- Launching a play records `launch:<id>` in the shared state. `getSnapshot(policy, period, launched)` adds media and ops plays as work items; `contentBatches(policy, launched)` adds content plays as Mike's inbox items (`play:<id>`, Foundational, bulk). Human plays (NPI, pricing) are drafted briefs and don't touch the bridge.
- Claire's page: `GrowCards` after "so far", labels derived from the data (top segment, competitor with most at risk, next event). Each opens a view (`views.tsx`) over the page with the top line only; Back returns to the same scroll.
- `AllyPanel`: one thread per context (segment, competitor, event), answer contract (verdict, why, if nothing changes, actions, trust), suggested follow-ups, typed questions matched to them. Actions launch plays, ask follow-ups or confirm a watch.
- Page container `overflow-clip` so the panel can stick. Chat scrolls its own list (newer browsers return a Promise from scrollIntoView).

## Inline chat replaces the side panel (Claire's home and views)
- `chat/inline-chat.tsx`: `ChatProvider` (thread + current source), `useChatSource(source, key)` (a screen registers what it's about and its chips), `AskBar` (fixed bottom; chips for what's on screen above the input; typed text matches the closest chip; "Clear conversation"), `ChatThread` (answers full width below the page content, scrolls each new answer into view).
- Views register `{ about, chips }` from the selected segment, competitor or event; answers use the same contract (`market/answers.tsx`) and can carry visuals (`market/answer-visuals.tsx`: competitor shares, share trend with the "if nothing changes" point dashed). Home registers its chips (`QUESTIONS`, answers from `ask-ally-answers`). Opening or leaving a view clears the thread.
- Stale Q3 copy in Claire's answers now derived: the content chip names the Q4 gap; the invest answer uses the Halloween batch's SKUs and date; "Will I make plan?" reads live run rate, plan and the one-approval value.

## Michelle: ops inbox cut by policy; skills, seller evidence and the drafted escalation
- Ops data moved to the candle catalog (Aurelle, Hearthwood, Bright Citrus) with fictional sellers (CandleDepot, WickWorks); promo dates fixed for Oct 8; MAP now ties (sellers below a floor under your price). Totals unchanged ($3.2M ops).
- `OpsBatch` gains `skills`, `split`, `sellerSkus`, `email`, `mode`, `partLabel`, `reassure`. `opsBatches(policy)` cuts split items like content: hero one by one (`buybox-review`, 4 SKUs, +$480K), core in bulk (`buybox`, 2 SKUs, +$240K, with the no-hero line). The snapshot reads ops from it, so Claire's rows tie.
- Detail pane: "Found by N skills · Show steps"; SKU pills with per-SKU seller comparison (price vs MAP, stock, rating, buy-box wins) and the latest crawls; the drafted vendor-manager email (editable, attachments); hero items need each SKU checked before Send. Send is a mock with a confirmation.
- Hero line: "You're losing $9K a day right now" (urgent open value ÷ days left in the quarter). Approve all skips one-by-one items.

## Michelle: gap to plan by brand and category, analysis inline
- `ops/gap-data.ts`: Overall → brand → category → SKU, last week vs plan, week to date, projected end of week; each node's drivers (tagged Live, Resolved, Worth watching) sum to its gap, and its recommendations point to an inbox item, a play or a watch. Overall's projection ties to Claire's week view ($3.5M vs $3.7M).
- Rail switch Issues | Brand & category. Picking a node shows three cards and "Explore more" chips; the analysis answers inline in the page's conversation: "Analyzed in 10 steps", key finding, plan vs actual, traffic × conversion × price = sales, drivers ranked by dollars, recommendations with actions. Crawl history for SKUs.
- Michelle's page moves to the inline chat (ChatProvider, AskBar); the inbox registers its questions, each gap node its own.

## Owner names open their pages
- `Person.page` in the snapshot (Mike /mike, Michelle /michelle; James none yet); `ownerPage(lever)`. `OwnerName` renders a link with a small arrow when there's a page, plain text otherwise, and stops the click from toggling the row under it. Used in the stage tables, the Total opportunity split and the bell panel.

## Ops recalibrated to one method: leakage prevented
- Each open ops fix stores `perDay` (daily sales at risk); its value is derived: perDay × `OPS_DAYS_SAVED` (12: fixed in about 2 days vs about 2 weeks). Same method as delivered. Buy box $108K (hero $72K, core $36K), promo badge $72K, deal page $48K, suppressed offers $60K, shipping $24K. Profit recovery (claims) and autopilot (recurring, sized from history) unchanged.
- Ops open $3.2M → $1.1M; pipeline $6.8M → $4.7M; bridge One approval away $3.6M → $1.5M; total $52.7M vs $52M plan. "Losing $X a day" and the email read `perDay`.
- One framework for all levers (run rate includes normal incidents; open work; autopilot for recurring types; delivered by method; expired). No separate forecast line.

## Michelle's Ops view rebuilt on Mike's design
- Rail: `OpsListItem` mirrors Mike's batch row: type · tier, value, issue, "N SKUs ▾" opening the SKUs under it (thumbnail, ASIN, name, check when reviewed). `opsSkus()` gives every issue its SKUs (buy box from seller evidence, the rest from `skuList`).
- Issue pane: what Ally found (skills), drafted email, then the action: core "Send · N SKUs" with the no-hero line and "Or review all N one by one", hero "Review N SKUs"; "Review sample SKU" opens one SKU inline with the same next step.
- SKU pane (`OpsSkuPane`): back to the issue, SKU header, gap to plan for that SKU, evidence; hero footer "Looks right · next SKU" until all are checked, then Send; core footer sends all.
- "Review N SKUs" opens the first SKU, expands the list and scrolls to the queue. The rail's Issues / Brand & category toggle is removed; the Business view replaces it next.

## Michelle: Business view | Ops view; business list sorted by gap (setting)
- Page toggle: Business view (default) and Ops view. Business hero is forward-looking (Amazon projected landing vs plan, work in flight by lever, this week vs plan).
- `BusinessView`: SKU | Category | Brand rows from the gap data: last week vs plan, this week projected, why (top driver, tagged), work in flight read from the queues (ops issues containing the SKU, content batches containing it, with owner and status in its own bucket). A row opens causes, what to do (opens the ops item, launches a play, or links to Mike's queue) and "Run gap-to-plan analysis" inline.
- Sort: gap to plan by default; Settings → Business view switches to sales (`businessSort` in the shared state).

## Rank urgency first, then dollars (every list)
- `tierRows` sorts rows by soonest deadline, then open dollars (no fixed lever order); `rankLevers()` does the same for areas (Total opportunity split, PDF). Delivered rows sort by delivered dollars. Rule added to the skill (number rules and audit checklist), design-specs and MISTAKES.

## Business view rethought: scope summary, top SKUs, why last week vs right now, anchored answers
- Hero follows the period switch (was hard-wired to the quarter).
- Scope chips ("Where the gap is"): All + categories or brands (Settings → Business view → Narrow by). The scope card says what's wrong in it: causes ranked by dollars with state (Live / Resolved / Worth watching) and the fix in flight. Overall and brand causes are real causes now (sum to the gap), not brand names.
- Top 5 SKUs behind plan (or by sales), "Show all". Columns: last week vs plan · why last week (state) · this week projected · right now → the fix. `Driver.fix` links each cause to its ops item, content batch or play; fixes are named for a business reader (`fixName`) with owner and status, and every one is a link (ops opens the exact SKU in the Ops view; content opens `/mike?batch=…`; plays launch).
- Chat: turns carry an `anchor`; `ChatThread anchor` renders them under the object. Opening a row points the bar at it ("Ask about …"), and its analysis appears under the row.

## Business view as rail + pane; Brand › Category › SKU (default) or Category › Brand › SKU
- Rail (`BusinessRail`): the hierarchy in Mike's rail style, ranked at every level (gap, or sales per Settings); each row shows its gap and top cause with state; expand/collapse; "All SKUs" flat mode with each SKU's path. Replaces the table and the scope chips.
- Pane (`BusinessPane`): breadcrumbs; header with last week vs plan, this week projected, week to date. A brand, category or Amazon: "What's wrong" (cause · $ · state → fix, linked) and its top SKUs behind plan (click to open). A SKU: "Why last week" and "Right now → the fix". "Run gap-to-plan analysis" answers under the pane's content (anchored).
- `treeFor(order)` regroups the stored Brand › Category › SKU tree into Category › Brand › SKU (categories sum their brands; totals tie). Hearthwood and Bright Citrus get a Jar candles category. Settings → Business view → "Organize the Business view as".

## Business view: "Overall business", one level down, rail follows the pane
- Top level named "Overall business" (rail, breadcrumbs, pane).
- The pane lists one level down: overall → top 5 categories (with their brand), brand → its categories, category → top 5 SKUs.
- Picking anything in the pane opens its path in the rail, highlights it and scrolls it into view (`RailRow` opens when on the selected path).

## Michelle lands on the Ops view; review first; one note to the vendor manager
- Default view: Ops.
- Issue pane: hero → "Review N SKUs" only; core → "Add N SKUs to your note" + "Review sample SKU" (+ no-hero line). No email in the pane ("Nothing is sent from here").
- SKU pane: hero "Looks right · add to note" steps through; when all are in, "Keep reviewing" or "Send note to vendor manager". Core: "Add N SKUs to your note".
- `note` in the shared state (per SKU of an issue, day added, day sent), seeded with yesterday's deal-page work (Oct 7). `NoteBar` (sticky, top of the Ops view): "Note to Dana · N SKUs across M issues · started Oct 7 · −$X a day" with "Send note to vendor manager" anytime. At $12K a day waiting it turns amber: "Send now" / "Keep reviewing". Send opens one draft by Ally, a section per issue, a line per SKU ("and N more" for whole issues), attachments per issue, editable; "Send to Dana" stamps the items and approves issues sent whole, so Michelle's, Claire's and the Business view's numbers and statuses move.
- Rail meta "In your note · k of n" / "Sent to Dana"; Business view fixes "ready to review" → "in your note to Dana · not sent" → "sent to Dana, Oct 8".

## Ask Ally chips fixed and tested on every page
- Answers were stuck on the "working" dots (effect keyed on a filtered array that changed every render); now keyed on the newest turn's id.
- Scrolls to the new question with a jump fallback; page-level answers render last on Michelle's page; switching Business/Ops clears the conversation; Mike's page moves from the old popover to the same inline chat; "Run gap-to-plan analysis for the overall business".

## Plays act per row; briefs are real documents; bar a little higher
- `PlayList`: each play has its own action on its row (Launch for Ally's plays, Draft brief → View brief for a person's decision); the combined "Launch N plays" is gone. Chat answers offer one action per play too.
- "NPI" → "new product" everywhere. `Play.brief`: the new product brief (opportunity, product, why it wins, numbers, risks, if approved, then "Take this to your product team?") and the pricing brief (options A/B/C, B recommended). `BriefDoc` opens under the row; the decision confirms and records.
- Ask Ally bar sits 32px above the bottom (was 20px).

## One top strip on every page
- `TopStrip` (top-strip.tsx): Ally logo (redrawn from public/ally-logo.png) → where you are (greeting on a home page, a breadcrumb anywhere else, first crumb is the way back) → period (where numbers follow it) → page facts (analyst KPIs) … page controls (Business | Ops) → page icons (email, bell) → gear → avatar (illustrated, no real faces).
- Used by Claire's home and views (views drop "Back to home"; breadcrumb Home › Market), Mike, Michelle, Settings (Home › Settings) and results (Home › Content results).
- `useViewer`: links from someone else's page carry `?from=claire` / `?from=michelle`; the page then shows "Home › Mike's queue" with the viewer's avatar instead of Mike's greeting.
| Oct 8 2026 | Media rows come from James's plays (`media/data.ts`): approval "Fund content's new keywords, launch Winter Hearth, move budget to gift sets." ($560K, 3 plays, was 1 DSP item), input "Plan for $500K of new budget." ($1.04M), autopilot "Bids and pacing, keyword harvesting, no ads on pages that can't sell." ($500K). Seeded media status "Reviewing the plays" (was "2 of 5 campaigns live"). Totals unchanged | `data.ts` (MEDIA_ITEMS, describe, activity), `claire/claire-actions.ts` (itemsFor approval-media), `claire/demo-controls.tsx` | Shared: reaches /claire, Claire's emails and PDF |
| Oct 8 2026 | `fmtM` reads K under $1M ($980K, not $1.0M), matching the bar labels | `data.ts` | Shared: stage headers on both pages, exec PDF |
| Oct 8 2026 | Invest chip is "$500K" and opens James's budget plan (Send to James); /claire keeps the old "$1M" answer | `claire/ask-ally-answers.tsx`, `app/claire-waterfall/page.tsx`, `media/answers.tsx` | /claire keeps $1M on purpose |
| Oct 8 2026 | Retailer switch (All · Amazon · Walmart · Target) with ahead-of-plan hero line; other retailers are view-only (no Assign, no Slack, no demo row) | `retailer.ts`, `period-switch.tsx`, `top-strip.tsx`, `claire/business-hero.tsx`, `claire/claire-row.tsx`, `exec-pdf.ts` | n/a (/claire isn't a retailer page: always Amazon) |
| Oct 8 2026 | Media delivered note adds "$38K on keywords content added" (this quarter) | `delivered-periods.ts` | Shared: /claire's How we did shows Q2, unaffected |
