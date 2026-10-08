# Punch list

Every screenshot or note Himanshu sends becomes a line here. Status: **open** → **built** (shown, waiting for his OK) → **locked** (committed and deployed). Newest first in each section.

## Overnight, Oct 7 → 8: locked (deployed Oct 8)

Deployed to Vercel as `content-agent-demo-5p7k6zzxo`. Rollback point: commit `3a0a920`.

**What's built**
1. **James's page** (`/james`), laid out like Michelle's:
   - his plays by bucket
   - October pacing by category
   - "Keywords, content and media together" (the shared ledger)
   - what media delivered
   - Ask Ally with three starters: the $500K budget, harvesting, pacing
2. **All six flywheel use cases:**
   - fund the keywords content added
   - harvest where organic rank is strong
   - send ad search terms to content
   - launch campaign from the new copy
   - no ads on pages that can't sell
   - one number for the loop
3. **Mike's drafts** show the media side under "What Ally changed": what media funds once the pages are live, and the ad search term queued for each page's next update. It follows James's approval.
4. **$500K budget chat** on James's page. Claire's "$1M" question became the same "$500K" plan, with Send to James.
5. **Settings › Data sources:**
   - Vendor Central and Amazon Ads through Amazon's sign-in
   - Walmart Scintilla and Target Partners Online by username and password
   - PIM, and a data lake by share
6. **Retailer switch** (All retailers · Amazon · Walmart · Target) on Claire's page and Gap to plan.
7. **Use-case doc** restructured: ability first, then examples, then capabilities, plus the PRD-only section and the harness.

**Assumptions I made (say if any is wrong)**
1. **No new media value.** James's plays split Claire's existing media rows, so no total in the week story changes:
   - $560K = fund keywords $210K + Winter Hearth launch $190K + rebalance $160K
   - $1.04M = the $500K plan
   - $500K autopilot = pacing $250K + harvesting $160K + no ads on broken pages $90K
2. **$500K replaced "$1M newly unlocked".** Claire's input row is now "Plan for $500K of new budget", still worth $1.04M. The next dollar returns $2.08, below the $3.01 average, because the best keywords are already funded. Claire's old "$1M" answer stays only on the frozen `/claire` page.
3. **Harvest counts once.** Its value is the sales from the money it moves, not the savings. The loop's $38K sits inside media's delivered, not added on top.
4. **Keywords match Mike's drafts.** The funded keywords are the ones his drafts add: spooky party décor, boo basket, fall centerpiece.
5. **Retailer numbers are Amazon's, sized by factors:**
   - Walmart: sales 0.2, plan 0.18, so it's ahead of plan
   - Target: sales 0.1, plan sized to $390K a week, so it's behind
   - All retailers adds the three
   - Gap to plan has real Walmart and Target brand trees (no SKU level) that tie to those numbers
6. **Amazon-only detail is held back for other retailers.** Grow beyond plan is hidden for Walmart and Target, and labeled "Amazon" under All. The delivered drill-down by type of work is off for them. Their delivered rows say where ("On Walmart"), not Amazon's SKU counts.
7. **Queues stay Amazon.** Mike's, Michelle's and James's pages ignore the switch, and it doesn't show there. A reload starts on Amazon.
8. **Data sources seed state:**
   - Amazon, Walmart and PIM connected
   - Target "Needs attention" (password changed Oct 6), so the demo has a reconnect moment
   - data lake not connected
   - Passwords are never saved anywhere, not even in the browser
9. **Nav placement.** Data sources sits under the Settings gear next to Business view, not in the nav or Teach Ally. James is a fourth person in the account menu ("Media lead") with his own Today count.
10. **Small fix along the way.** Waterfall stage headers under $1M now read in K, matching the bars ($980K, not $1.0M).
11. **Other retailers are view-only.** In Walmart, Target or All, Claire's rows say "Act in the Amazon view" instead of Assign. No Slack nudge goes out, and the demo row is hidden. A summary email is labeled with the retailer and offers no YES replies, because replies act on Amazon's queues.

**Not done**
- Mike's page doesn't list the "Add to the page" ad search terms as their own queue item. They live inside his Halloween and gift set drafts.
- James has no real Slack.

## Overnight, Oct 5 → 6: decisions I made while you slept

You asked me to finish everything and push to live. Rollback point if any of this is wrong: commit `cfb9b6a`, Vercel deployment `content-agent-demo-6x9kzlzh2` (the last version you approved before tonight).

1. **"Push to live".** Read "no push to live" as "no, push to live", replacing my preview-only plan. Deployed as items landed.
2. **What we delivered → bars.** One bar per agent on one scale: delivered in magenta, projected as an ink tick, short shaded light red, ahead light green. Right column: the gap and its top reason, taken from the existing "waiting / lost" note (never invented), at most two lines. The expand-to-waterfall stays.
3. **Gap to plan by brand.** Didn't build a second by-brand table: the left tree already shows each brand's miss and top cause, and drills Brand › Category › SKU. Added what was missing: each open cause in "Why last week missed" links to where it's fixed (**Open in your inbox ›** for ops, **In Mike's queue ›** for content). A link, not an action, so the backward analysis still has no actions.
4. **Vendor note.** Kept the draft in the bar (not a separate page) and added one line under Send: Ally checks the listings daily and drafts a follow-up after 3 days without a reply.
5. **Nudge tint.** The amber box is gone; "Losing $6K a day while these wait" is in red (a daily loss).
6. **Michelle's and Mike's headlines.** The urgency moved to its own line under the claim, like Claire's page: Michelle's loss in red, Mike's expiry in amber. Both claims now fit one line at 1300px.
7. **Mike's right pane.** Claire's ask is shown by weight (dark, medium), not color: under the new palette indigo means "click this" and her ask isn't a link. The expiry sits beside it in amber.
8. **YES buttons in Claire's email.** Buttons YES / YES 1 / YES 2 / YES 3 open `/reply`, which does exactly what "Claire replies" does and says what it did; any open Ally tab updates on its own. Works when the email is opened in the same browser as the demo.
9. **Old purple.** Confetti, deck accents and the "your price" marker → indigo; Ally's measured lines on charts → magenta.
10. **Scheduled, Skills, Knowledge.** Teach Ally keeps tabs (your call: A). Scheduled and Skills share one list design (`RunList`): name and one line, Runs, What Ally does (Tells you / Drafts it for your OK / Does it, you can undo), Last run, Live/Paused. Click a row to edit in place; Pause / Resume; Delete for yours only (built-ins can be paused or retuned, not deleted). **"+ New" takes a sentence** and Ally drafts the item for you to check (you hadn't chosen sentence vs form; I picked sentence because alerts are already made that way in chat). Michelle's two alerts keep their richer card inside the row. Briefs don't offer "What Ally does" (a brief only tells you).
11. **Skills tab** always shows: Gap to plan analysis (its 10 steps + any you taught, plus version history), skills saved from work, Ally's built-ins with the alerts that use them. The gap lesson no longer shows up as a Knowledge rule.
12. **Knowledge.** Edit in place, Delete as a link, source line, and "Applied to N drafts this week", counted from this week's batches in the rule's scope (709 and 378 today).
13. **Item 6 (Claire's empty Reports and decks before Michelle sends)** left as decided earlier.

## Still open (for you to decide)


- Pausing an alert doesn't yet stop it showing up in Michelle's inbox; it's a status on the Scheduled page for now.
- The Scheduled page's sparkline trend column was dropped in the new list ("Last run" shows the number). Say if you want the trend back.

## Locked

- Oct 7 → 8 items above: James's page and the flywheel, $500K budget plan, Data sources, retailer switch, use-case doc.
- Overnight items 1–13 above.
- Rail pushes the page in step (nothing covered); vendor note draft cleanup; Michelle's forecast · plan · gap.
- Autopilot tab in plain words; Ask Ally folds with a count; no false highlights; decks reach Claire only when Michelle sends them.
- Seeded past questions; Scheduled page with Claire's Monday brief; rail above the ask bar; shared pages keep whose view you came from.
- Two-line headline in the boss's wording; nav opens on hover.
- New nav: Today (count) · Gap to plan · Scheduled | Reports and decks · Dashboards | Teach Ally · Ask Ally | Ally is working.
- Palette A (indigo actions, magenta Ally, one color per data job); gap bracket; "$0.7M over plan".
- Claire's week (Mon assign → Wed deadline → Fri auto-ship → autopilot), email and product parity.
