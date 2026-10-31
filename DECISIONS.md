# Decisions

Newest first. Each entry records the decision, why, and what was rejected.

**Oct 30, 2026: an FDE persona (Nora) owns the internal tools.**
- Requests, the Agent Console and Teach Ally live in her nav, not the customer's.
- She shows in the persona menu for everyone. *Rejected:* hiding her behind Shift+D, because the menu is already the presenter's control.

**Oct 30, 2026: a request is one record with two views.**
- Michelle's tracker and Nora's queue read the same state and the same five stages.
- *Why:* the customer and the engineer can't disagree.
- Steps are named as stages (Test), not outcomes (Tests passed). *Why:* "Tests passed" would show while two tests fail.

**Oct 30, 2026: hand-offs are notifications, not URLs.**
- Reuse the bottom-right Slack-style card, with "Open in Ally" switching persona.
- Asking starts the demo, and Reset clears it. *Rejected:* `/demo/competition` as the only way in.

**Oct 30, 2026: Nora's queue starts with improvement requests.** Event recap deck v5 and negotiation prep v3 keep both skills live. *Rejected:* making them unbuilt, which would contradict the Library and the console.

**Oct 30, 2026: MVP scope is derived, not hand-edited.** A lever whose owner is vision-only (media, via James) offers no plays, and totals re-add from what's offered.

**Oct 30, 2026: Ask Ally opens a new chat, like Claude.**
- One question set per person, shared by their home and the new chat.
- New asks (the competition request) are offered only in the new chat.

**Oct 30, 2026: Library is reached where you'd want more.** It's a + on My dashboards and a button on Scheduled, not a nav tab. *Why:* it overlapped Scheduled, and chat is the main way skills are found.

**Sep 2026: one table of work items drives everything.**
- Each item has a lever, bucket, value, deadline and urgency. Tier rows, totals, the bridge, deadlines, statuses and nudges are all derived from the items plus this session's actions.
- A nudge shows only for an owner who hasn't started.
- Claire's page updates live when her team acts.
- *Why:* a nudge rule keyed to "Mike" would break with real data. `getSnapshot()` is where a database plugs in.
- *Rejected:* special cases by name or id.

**Sep 2026: projected values are signed, not green.** "+$500K" in black, labeled "projected incremental sales". It turns green only once approved. *Why:* a bare "$500K" read as the SKUs' revenue, and green means delivered. *Rejected:* green projected values.

**Sep 2026: the progress bar is labeled pieces plus a total.** Pieces are $520K banked, $X unlocked today and $1.5M open, with "$2.02M this quarter" at the end. *Why:* the user keeps the $1.5M they know, and the total is fine next to it. Content data was trimmed so the parts add up exactly.

**Sep 2026: every percentage carries its dollar total.** For example "Sales increased $520K (3.2%)". *Why:* a percentage alone doesn't say how much it's worth.

**Sep 2026: results tables follow the measurement method.**
- *Vs category (seasonal):* SKU growth vs category demand growth (category impressions as the demand signal), lead vs the SKU's usual lead (a difference-in-differences comparison), and adjustments for price, ad spend and stockouts.
- *A/B tested (foundational, retail readiness):* lift vs old content, confidence and test length.
- *Why:* the columns are the proof each method produces. *Rejected:* generic lifts (units, traffic, conversion) on every table.

**Sep 2026: ops value is revenue leakage prevented.** Each SKU's normal daily sales × the days sooner it was fixed.

**Sep 2026: doer pages share one layout and tie to the exec page.** Top line, two-line headline, progress bar, an inbox grouped by Claire's buckets (purple one approval away, amber needs your input, blue autopilot), a detail pane, and the delivered section.

**Sep 2026: "Needs your input" works like approval.** A "Review N SKUs" button opens per-SKU input fields and ends with "Send to Ally".

**Sep 2026: all $740K one approval away is seasonal.** The foundational refresh moved out of that bucket. *Why:* the "Expires in 18 days" tag sits on the whole row.

**Sep 2026: exec hero is fact → fear → comfort.** "You're tracking to $40M… That's $5M short of your $45M plan. We have $6.8M in the pipeline to close it." *Rejected:* dashboard shorthand ("$5M gap to plan").

**Sep 2026: bridge order goes from no effort to most effort.** Current run rate → autopilot → one approval → needs your team → total.

**Sep 2026: headlines over new charts.** The CEO dislikes new visualization types. Use a headline number, and add a chart only where it earns its place (the bridge, the content and ops waterfalls).

**Sep 2026: waterfall version is the active design.** `/claire` is frozen, and changes are logged for porting.
