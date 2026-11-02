# Plan

Ordered by what matters for the MVP demo the team sees. Refreshed Nov 2, 2026; the Sep 24 founder-lens list is folded in below (done items listed at the end).

## Now: the MVP demo and its spec
1. **Bring the MVP feature doc up to date.** `docs/mvp-features.md` and its published copy are the team's spec, and they predate several changes:
   - Nora's Requests page and the hand-off notifications
   - Build mode (built in chat, no engineer)
   - Ask Ally's new chat
   - Library reached from My dashboards and Scheduled
   - Teach Ally moved to Nora

   Edit the local file, then republish.
2. **Skill Builder page.** `/fde/skill-builder` is no longer reached (Build happens in chat). Retire it, or keep it for the vision.
3. **One money format.** About 10 local formatters repeat the K/M rule with small differences (two decimals or one, a + or not, $0.0K). Make one shared formatter: K below $1M, M with one decimal, and replace the copies.
4. **"Nudge again" before anyone has nudged** (`claire/area-view.tsx`). Say "Nudge" until a nudge is sent.
5. **"See all N SKUs" links** (Mike's batch detail, the A/B test and event details). Make them open a real list, or say "See examples".

## Next: consistency
6. **One color per meaning.**
   - Amber means both "needs your team" and "expiring".
   - Blue means both autopilot and the ops agent.
   - Keep color for state, and use a label or icon for the agent. Audit every page.
7. **Sentence-case section labels** instead of all-caps mono (Library, Grow beyond plan, the market map).
8. **Hero number colors.** Color only the numbers, by what they mean in the chart.
9. **Retire `/claire`**, or port the waterfall changes to it (`docs/waterfall-changelog.md`).
10. **Mock benchmarks** (best-in-class autopilot, "usually +X pts", category demand): find real sources, or label them illustrative.
11. **Deploys.** Connect Vercel to GitHub so a push deploys by itself. Either link the himanshuciq account to the Vercel login, or move the repo under himanshuj18.

## Vision backlog (not MVP)
- **Media:**
  - James's page
  - the media drill-down from Claire's page (IROAS by campaign)
  - the $500K budget plan
  - the Brightwick brief's slot-recovery option

  All exist or are designed for the vision; MVP hides them.
- **Joint plan:** past copies of each linked document, not just the latest.
- **Ask Ally history:** keep chats for good, show about 5 recent, and add a "See all" page with search.
- **Nora's queue across customers**, and CommerceIQ reviewing a customer-built skill before publishing it to every brand's Library.

## Parked for the real product: the clock-driven demo
Agreed Sep 25, 2026 to keep the demo on a fixed date (Oct 8, Q4 FY26) for now. When this becomes the product:
- **Event calendar.** Per-event dates are data, not code. Each event has:
  - an event day;
  - recommendations appearing 5 weeks before;
  - a live-by date 3 weeks before (full value);
  - an optional lead-out.

  Through year end: Halloween (Oct 31, live by Oct 10); Thanksgiving / Black Friday / Cyber Monday (Nov 27, Cyber Monday Nov 30; the next event takes over); Holiday gifting (Dec 25).
- **Value scales, doesn't expire.** Live after the live-by date = value × days left in the window; $0 once the window closes. Copy: "Full value if live by Oct 10" → "Worth $240K now · drops about $24K a day".
- **Always-on value.** Starts at go-live and persists until the next change on that SKU (accretive). The A/B result confirms it 4–6 weeks later: "Measuring" → "Confirmed", delivered back-filled from launch.
- **Delivered as dated records** (by lever, type of work, week), so any period is a sum. The date moving is the weekly refresh: on Oct 1, everything becomes Q4.
- **Demo date control** next to Reset, to rehearse any day.
- Left out even then: traffic curves inside an event window; per-event content swap rules.

## Done or dropped since Sep 24
- **Close the loop:** Claire's page updates live when Mike or Michelle act.
- **Hero headline numbers** are no longer mono at 44px.
- **Q3 vs Q4:** the demo is Q4 FY26, and Halloween is open now.
- **Dropped:** the stale "$1M / 384 SKUs" answer. It only lives on the frozen `/claire`.
- **Ask Ally** no longer covers content: pages reserve room for the bar.
- **Top lines** drop whole metrics instead of wrapping on a 13" laptop.
- **Decided:** James's page is vision-only. Media is a non-clickable bucket on Claire's page in MVP.
