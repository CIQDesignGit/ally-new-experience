# Session log

## Latest: Oct 30, 2026

**Where things stand:** the MVP demo is live (580ac8a) and pushed. It now shows the whole request loop:
1. Michelle asks Ally for something no skill answers.
2. Nora, the CommerceIQ engineer, builds, tests and gets it published.
3. Michelle is told it's live.

### Done this session
- **AI visibility dashboard:**
  - In the Library under Available; turning it on adds it to My dashboards.
  - Built on the Oct 5 readout, so it ties.
  - The joint plan links to it.
- **MVP, no media:** media plays are off the Grow cards, their views and Ally's answers. The Market total re-adds to +$245K. The rule comes from James being vision-only.
- **Nav:**
  - The section holding your page stays open.
  - Library is no longer a tab. It's reached from a + on My dashboards and "Add from library" on Scheduled.
  - Teach Ally moved to Nora.
- **Ask Ally:**
  - Opens a new chat (`/c/new`) with a greeting and the person's starters.
  - Each home's question set lives in `chat/home-chats.tsx`.
  - History opens each chat on its own page and replays it after a refresh.
  - The competition starters show only in Michelle's new chat.
- **Nora (FDE persona):**
  - She's in the persona menu. Her home is `/fde`, showing open requests (ask, due date, Request/Build/Test/Review/Live, one next step) and done ones.
  - Two improvement requests are open by default.
  - Her nav: Requests, Skills (Agent Console), Teach Ally.
  - Her view never carries onto a customer page.
- **Hand-off notifications:**
  - Michelle's request pops a bottom-right card that opens Nora's view.
  - Publishing pops one that opens Michelle's dashboard.
  - Asking starts the demo; Reset clears it.
- **Agent Console:** uses the standard top strip. The dead tabs and Lena-as-signed-in are gone; Lena is named on the Review step.

### Open questions
- Claire's "$500K" chat answer ends in "Send to James", a media action, while MVP hides media elsewhere.
- The Brightwick pricing brief recommends an option that relies on Ally for Media.
- Build mode (Skill Builder) still shows Nora and the tracker; earlier direction was that Build happens in-product, with no FDE. The storyboard is pending.

### Next steps
- Decide the two media questions above.
- Storyboard Build mode without an FDE.
- See `PLAN.md` for the rest.

## Earlier: Sep 24–25, 2026

**Where things stand:** the demo tells one story end to end.
1. **Claire** sees the gap to plan and what closes it, and nudges her team.
2. **Mike and Michelle** act in their queues.
3. **The results page** proves what content delivered.

Everything is live on Vercel, pushed to GitHub (`claire-exec-demo` on `himanshuciq/content-agent-vision-demo`), and mirrored on a Claude Design canvas for the CEO.

### Done this session
- **Claire:**
  - The hero reads fact, then gap, then pipeline.
  - The bridge chart runs Current run rate → On autopilot → One approval away → Needs your team → Total opportunity.
  - The autopilot table compares share on autopilot with best in class.
  - The Ops row opens a leakage-prevented waterfall.
  - Only Mike's nudge stays visible.
  - Losses are red with a minus sign.
- **Mike:**
  - The top line, two-line headline and progress bar are split into banked, unlocked today and open, with the quarter total.
  - The inbox is grouped by Claire's buckets with a color per group.
  - "Needs your input" items go through "Review N SKUs", with per-SKU input fields.
  - Projected values are signed (+$500K) and turn green once approved.
- **Michelle:** rebuilt on Mike's layout and tied to Claire's ops numbers ($2.4M / $600K / $200K).
- **Results:**
  - Tables follow the measurement method. Vs category: SKU growth vs category demand growth, lead vs usual, adjusted for price, ads and stock. A/B: lift, confidence, test length.
  - Every percentage carries its dollar total.
- **Everywhere:**
  - Ask Ally is on every page, with page-specific questions.
  - Four text shades.
  - One button style.
  - One column-header style.
- **Data:**
  - Content totals exactly $1.5M (the syndication batch is now $140K).
  - Seasonal events are fixed per period: back to school for Q3, Mother's Day for Q2.
- **Tooling:**
  - The `ciq-prototype` skill.
  - `design-specs.md` number rules.
  - The Vercel CLI deploy.
  - The Claude Design canvas: https://claude.ai/artifact/G4XhPgbKTBCvL1dgXp3VKp

### Open questions
- Should the last chart bar be "Total opportunity" ($46.8M) when the headline says $6.8M in the pipeline? My recommendation is "Potential total".
- Halloween (Oct 31, deadline Oct 8) is counted as Q3 money. Say "open now", or move it to Q4?
- Best-in-class autopilot percentages, "usually +X pts" leads and the category demand figures are mock. Do we have real sources?
- Michelle's buy box example has our price ($319) below the $499 MAP floor. Change the floor to $299?
- Should `/` redirect to `/claire-waterfall`?

### Next steps
See `PLAN.md`. The top item is closing the loop: when Mike or Michelle acts, Claire's page should show it.
