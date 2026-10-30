# Ally MVP: what we build

Published copy: https://claude.ai/artifact/MHhNXkzMgz5eXJFnmmUx14 (this file is the master).

Demo: open any page with `?demo` at the end of the URL (or press Shift + D outside a text box) to show the **Vision / MVP** switch in the bottom-right corner, and again to hide it before a customer demo. Vision is everything we plan, with projections; MVP is this list. A second switch picks the harness: Borrow (the engineer builds the skill in Claude Code) or Build (the same step in our own Skill Builder); only that step changes. Or start at `/demo/mvp`.

## Two rules
- **Measure, never project.** Every dollar on an MVP screen already happened and says how it was measured (vs the 4 weeks before, or vs an A/B control). Open work shows High, Medium or Low impact, not a dollar value. Exceptions: the grow cards and vendor negotiation prep, which are market and customer models, not forecasts of Ally's impact.
- **Borrow the harness.** Skills run on Claude. Our engineers write them in Claude Code; we review, test and publish them in our own Agent Console.

## Features

| # | Feature | What the user sees (UI) | What we build behind it | Demo |
|---|---|---|---|---|
| | **Exec (Claire)** | | | |
| 1 | Gap to plan | Forecast vs plan and the gap. Waterfall: run rate, then On autopilot, One approval away, Needs your team, each at High, Medium or Low impact, stacked below the plan line; final bar has no number. Click a bucket for its actions with an Impact column | Forecast and plan import; actions grouped by autonomy; impact = the action's share of the gap (High 25%+, Medium 10%+, Low below) | `/claire-waterfall` |
| 2 | Delivered this quarter | Measured dollars per lever (content, media, ops), each with its method | Measurement service: pre/post windows on the SKUs Ally changed, A/B where available | `/claire-waterfall` |
| 3 | Grow beyond plan | Market, competition and event readiness cards, with their dollar estimates; each opens a full view | Market share and search data; competitor deals and share of voice; event readiness by lever | `/claire-waterfall` |
| | **Content (Mike)** | | | |
| 4 | Content review queue | Batches of SKUs by deadline; each SKU shows live on Amazon beside Ally's version (removed, kept, added); approve the batch | Content generation per batch; diff; publish to the retailer | `/mike` |
| 5 | Edit with a reason | Edit on each field: the text in a box with a character count, six reason chips, optional details, Approve & lock. The edit replaces Ally's version | Save the edit and reason; turn the reason into a Knowledge rule; apply it to the rest of the batch | `/mike`, Review |
| | **Ops (Michelle)** | | | |
| 6 | Ops fixes with thumbs | Each fix asks: did Ally get this right? Thumbs down opens a box; the answer becomes a rule | Feedback store; rules applied to similar SKUs | `/michelle` |
| 7 | Alerts | One list: her alerts and the built-in ones, each with its number now, trend and autonomy; Export to Excel | Alert engine on daily data; alerts written from chat; .xlsx export | `/michelle/alerts` |
| 8 | Dashboards and decks | Prime Day dashboard: tiles, date range, filters, chat under it; the deck downloads as PowerPoint | Dashboard from a skill's queries; .pptx export in the account's brand template | `/michelle/dashboards/prime-day` |
| | **Everywhere** | | | |
| 9 | Ask Ally | Chat bar on every Ally screen: starters, follow-ups under each answer, its own thread for a big task | Chat on the borrowed harness, routed to the account's skills | Every page |
| 10 | Knowledge | Every rule Ally learned from feedback, with who taught it and where | Rule store, scoped by retailer, brand and SKU group | `/settings`, Knowledge |
| | **Skills (borrowed harness)** | | | |
| 11 | Ask for a new skill | A deep ask in chat becomes a request with a promised time and a tracker: Requested, Being built, Tests passed, In review, Live | Request queue to the CommerceIQ engineering team (FDEs) | `/demo/competition` |
| 12 | Build in Claude Code | The engineer's Claude Code session: Claude drafts SKILL.md and the SQL, the engineer fixes a line, submits | Skill template, dataspace access, submit to the console | `/fde/claude-code` (Build: `/fde/skill-builder`) |
| 13 | Agent Console: skills list | Every skill on the account: what starts it, version, status, last run, tests | Skill registry per account | `/console/skills` |
| 14 | Agent Console: test and publish | Tests on production data, including other customers; fix or send back; publish for one account or all, behind three gates | Test runner, versioning, publish gates | `/console/skills/competition-watch` |
| 15 | Launch skills | Competition watch (dashboard and weekly alert), event recap deck, gap analysis (traffic × conversion × price), vendor negotiation prep | One SKILL.md and its queries each | `/console/skills` |

## Stretch goal: media (James)

| # | Feature | What the user sees (UI) | What we build behind it | Demo |
|---|---|---|---|---|
| S1 | Media plays | James's queue by Claire's buckets: each play shows what Ally found, what it will do and the bid or budget changes; approve the play | Bid and budget changes through the retail media API; pacing by category | `/james` |
| S2 | Edit with a reason | Edit on a play's changes, reason chips (wrong campaign, too much or too little, misses a retail event, brand rule, bid limit), Approve & lock; the table shows his numbers | Edits saved as Knowledge rules; Ally applies them to similar moves | `/james` |
| S3 | Media in Claire's view | Media's actions in the waterfall and its measured dollars in Delivered | Media actions ranked into the same buckets; IROAS measurement | `/claire-waterfall` |

## Not in the MVP
- Projected dollars on actions: "$4.7M in pipeline", "+$1.5M" per bucket, "worth $312K", delivered vs projected.
- A walkthrough of editing an existing skill (shown as live skills in the console instead).
- Our own harness. The MVP builds skills in Claude Code; the Build switch shows our Skill Builder for comparison.
