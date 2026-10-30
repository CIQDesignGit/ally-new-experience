# MVP demo storyboard

Status: draft for Himanshu's OK. Nothing built yet.

## What the MVP demo shows
Only what the product will do at MVP. Content and ops. No media. No dollar projections. Chat on every Ally screen.

## The rules for the cut
| Rule | What it means on screen |
|---|---|
| Measure, never project | No number about the future: no "worth $X", "projected", "opportunity", "at risk", "would recover". Every dollar is something that already happened, with how it was measured next to it (vs the 4 weeks before, or vs an A/B control) |
| No media | James leaves the person switcher and the drawer. Media leaves Claire's levers |
| Content and ops only | Mike and Michelle carry the story. Claire sees both on one page |
| Chat always there | Ask bar on every Ally screen. Claude Code and Agent Console are CommerceIQ tools, so they have no Ally chat |
| Exports are real files | Dashboards → PowerPoint. Alerts → Excel |

## Projected → measured, screen by screen
| Screen | Today (a projection) | MVP (a measurement) | File |
|---|---|---|---|
| Claire · gap to plan | Waterfall ends in "Total opportunity $XM" | Keep the gap to plan (actual vs her plan, measured). Bars show what caused last month's gap (lost buy box, out of stock, content), not what fixing it would win back | `waterfall/waterfall-chart.tsx`, `area-detail.tsx` |
| Claire · this quarter | "Projected $X · Delivered $Y · −$Z" | "Delivered $Y" only, each lever with its method: content = sales on updated SKUs vs before; ops = sales restored on SKUs that got the buy box back | `claire/this-quarter-section.tsx`, `delivered-periods.ts` |
| Claire · autopilot | "% of your open opportunity runs itself" | "% of last month's fixes ran without a person" | `waterfall/autopilot-detail.tsx` |
| Claire · competition cards | "−$X at risk this quarter" | "Their share of voice rose 9 pts in 8 weeks; your sales on those terms fell $X" | `market/grow-cards.tsx` |
| Mike · progress | "$X of content opportunity open" | "12 SKUs waiting on you · 40 live this quarter" | `mike/mike-progress.tsx` |
| Mike · delivered | Delivered vs promised per work type | Delivered per work type, measured | `mike/mike-delivered.tsx` |
| Content results | Delivered vs projected | Measured lift per SKU, vs before or vs A/B control | `content-results` |
| Michelle · alerts | "Five fired… worth $312K" | "Five fired. These SKUs sold $312K last week" (their size today, not a forecast) | `michelle/alerts/page.tsx` |
| Every queue card | Fix value "one approval away, $X" | SKU's last 4 weeks of sales. Ranking stays deadline first, then this number | `nudge/data.ts` |

## How we build it
One codebase with an MVP switch, not a copy. `/demo/mvp` turns the switch on; the same pages hide media and projections. The full vision demo stays as it is at its own links.

## The story: 9 screens, one actor each

### Part 1 · Content (Mike)
**1. Mike's queue** · Mike Chen · Ally
- Sees: content Ally wrote for 12 holiday gift sets, ready to review
- Does: opens one, reads the new title and bullets
- Next: gives feedback

**2. Regenerate from feedback** · Mike Chen · Ally
- Sees: the draft next to the live content
- Does: types "Too salesy. Lead with the wax type and burn time"
- Ally: rewrites in seconds, shows what changed, offers "Apply to all 12"
- Does: applies to all 12, approves, publishes
- Shows: feedback is instant, no ticket, no engineer

### Part 2 · Ops (Michelle)
**3. Michelle's Today** · Michelle Ortiz · Ally
- Sees: what Ally fixed overnight and what it measured so far, what needs her (2 decisions), the chat bar
- Does: asks two quick questions, gets instant answers

**4. Alerts** · Michelle Ortiz · Ally
- Sees: alerts that fired this week, grouped, each with the fix Ally made or proposes
- Does: Export to Excel (real .xlsx)

**5. Dashboard** · Michelle Ortiz · Ally
- Sees: Prime Day recap dashboard, chat under it
- Does: asks a follow-up in chat, then Export to PowerPoint (real .pptx)

### Part 3 · Edit a skill: the RCA (why did we miss?)
**6. The answer she corrects** · Michelle Ortiz · Ally
- Does: asks "Why did we miss plan last week?"
- Ally: answers in dollars only
- Does: "You missed that units were flat. Price went up. Check pounds, not just dollars"
- Ally: "I'll add a units and price check to this analysis. Nora reviews it today." Request #413
- Shows: her correction becomes a skill change, not a one-off answer

**7. The skill change** · Lena Brooks · Agent Console
- Sees: the RCA skill, the new step as a diff ("split the gap into units and price")
- Does: runs tests on the last 8 weekly misses. 7 of 8 pass, 1 fails: a week with a price change and a stockout together
- Does: fixes the order of the checks, reruns, 8 of 8, publishes for Aurelle
- Back on Michelle's page: the same question now answers in units and price

### Part 4 · Create a skill: competition watch (built already, 4 screens)
**8. Request** · Michelle Ortiz · Ally → **Build** · Nora Diaz · Claude Code → **Test and publish** · Lena Brooks · Agent Console
- As built today: quick answers, the deep ask, "ready by tomorrow, 10 AM", Nora edits the SQL, tests find 2 real issues, publish for Aurelle or all customers

**9. Live** · Michelle Ortiz · Ally
- Sees: the competition dashboard (PowerPoint export), the new alert in her inbox (Excel export)

### Claire (exec), optional closer
- One page: gap to plan and what caused it, content and ops delivered (measured), decisions waiting, the chat bar
- Open question below: keep Claire in the MVP demo or end on Michelle

## What changes in the code
| Area | Change | Size |
|---|---|---|
| MVP switch | `/demo/mvp` sets a mode; pages read it | Small |
| Media | Hide James in switcher and drawer; drop media lever on Claire | Small |
| Projections | Swap each projection for its measurement (table above). Numbers must still tie across pages | Medium: about 10 files, `delivered-periods.ts` is the biggest |
| Mike regenerate | New feedback box, rewrite, diff, apply to all | Medium |
| RCA skill edit | Michelle's correction, request #413, console with RCA skill and 8 tests | Medium: reuses the competition console |
| Competition | Done. Step bar gets the MVP order (screens 8–9) | Small |
| Exports | Done for competition. Add PowerPoint to Prime Day dashboard | Small |

## Build order
1. MVP switch, media out, projections out (the cut)
2. Mike regenerate
3. RCA skill edit
4. Stitch the 9 screens into one step bar, click through at 1440px, deploy

## Decided
- Oct 29: no projections, measured results are in. Every dollar shown has already happened and says how it was measured.

## Open questions
1. Claire: keep her as the closer, or end on Michelle?
