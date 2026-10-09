# Ally demo: design rules

The starting point is the CommerceIQ design system (`@ciq-dev/ciq-design-system`, shadcn with CIQ tokens). It's a base, not the final word: the demo is also where the design system evolves. When something here works better than CIQ does, we use it and record it under "Proposed changes to the CIQ design system" below, so it can go back into the system.

Every screen follows these rules. When a screen needs something they don't cover, add the rule here first.

## Shared pieces (use these, don't hand-build)

| Piece | File | Use it for |
| --- | --- | --- |
| `PRIMARY`, `SECONDARY` | `components/nudge/mike/buttons.ts` | Every button. Sized to the CIQ Button: 40px, 14px medium, 8px corners. |
| `ActionCard`, `ActionRow` | `components/nudge/ui/action.tsx` | Any "what to do" block: recommendations, next steps, approvals. |
| `AgentRun`, `DidYouKnow` | `components/nudge/chat/agent-run.tsx` | Big runs only (files, skills, analyses). |
| `MemorySaved`, `MemoryRecall` | `components/nudge/chat/memory.tsx` | Anything Ally keeps or recalls. |
| `InboxFilters` | `components/nudge/ops/ops-batch-list.tsx` | Segmented filters (same as Business/Ops style switches). |
| `VsPlan` | `components/nudge/ops/vs-plan.tsx` | Any number against plan (projected, so far, last week): label, gap, then actual of plan and %. |
| `QueueDelivered`, `BarRow`, `WorkTypeBars` | `components/nudge/claire/delivered/bar-row.tsx` | Projected vs delivered on every page: one bar per row, on one scale. |
| `DetailCard` | `components/nudge/ui/detail-card.tsx` | The open item in a queue, on a card. |
| `RunList` | `components/nudge/runs/run-list.tsx` | Anything Ally runs (Scheduled briefs and alerts, Skills): one row each with when it runs, what Ally does, last run and Live / Paused; opens in place to edit; "New" turns a sentence into a draft. Built-in items can be paused or retuned, not deleted. |

## Buttons

1. **Every action is indigo** (`PRIMARY`, CommerceIQ Blue #1F22B2): approve, send, add, assign, run, launch, export. Our focus is actionability, so anything that does something looks like it does something.
2. **Outline (`SECONDARY`) only for buttons that don't act**: the way out (Cancel, Not now, Back, Keep reviewing, Next SKU) and view tools (Expand, Lock, show or hide a sample). Small extras are text links (Start over, Show steps).
3. **Buttons sit on the right of their row**, vertically centered on the text. Controls that set up the action (a cap, a scope) sit under the row's detail, on the left.
4. **Done replaces the button in place**: a green check and the past tense ("Approved", "Sent to Dana").
5. **Peer buttons share one fixed width** (200px in `ActionRow` and the brief), not a minimum, so their edges line up. Never let label length decide a peer button's size.
6. **A button centers on its own name and detail**, not on the whole row; setup controls (a cap, a scope) go on their own line underneath and never push the button down.

7. **A button's label is the action it takes, and clicking it takes that action in place**: "Send to Dana", "Ask Mike to approve", "Approve the bids". Never "Open…", "See…", "Review…" or jargon like "play"; navigation is a link, not a button.

## Rows of the same kind

1. Same structure in every row: name, then one line of detail, then optional setup. If one row's detail wraps, shorten it or move the extra to setup.
2. Same punctuation in every row: parts joined with " · ". No colon in one row and a dot in the next.
3. A figure that changes with a control sits next to that control (the weekly cap and "about $14K a week back" share a line).

## Structure and naming

How things look is the rest of this file. This section is what's there, in what order, and what it's called. It applies to every structure: navs, tables, emails, menus, page sections. Run the `structure-review` skill (`.claude/skills/structure-review/SKILL.md`) before proposing any of them.

1. **Start from the person's jobs, not the existing structure.** List what they do, most urgent and most frequent first. Every container (nav item, column, section) maps to one job. Anything that maps to no job is cut.
2. **Order:** what needs you now → what Ally made for you → how Ally behaves → history, last.
3. **Labels are the person's words, and one word means one thing everywhere** (Assign / Assigned, Task, Ask Ally). No system words ("Conversations", "Alerts") when a plainer one fits ("Ask Ally", "Scheduled").
4. **No heading that only names a group.** Spacing or a divider separates groups; a heading earns its place only if it tells the reader something new.
5. **Every item goes somewhere real and shows its live state** (the gap, a count waiting). Nothing leads to nothing.
6. **One way in per thing.** If the ask bar is on every page, there's no second "Ask Ally" button.
7. **Show a few, reveal the rest:** the three most recent, then "See all". Lists open in place.
8. **One job per column or section.** Status says where the work is; Action says what you can do. The title says what's in it ("Task", not "What's waiting").
9. **Same structure for every person;** only the contents change.

## Consistency

The same kind of statement always has the same shape, on every page. Before adding a number, find where the product already says that kind of thing and copy its order, words and size. Two different shapes for one idea make people re-learn the screen.

**Against plan (projected, so far, last week, a quarter):** one shape, in this order:

1. What it is: Projected · So far · Actual. Context goes in the label ("So far · 57% of the week gone"), never between the numbers.
2. The gap, first and biggest, colored: −$200K.
3. Actual of plan · %: $3.5M of $3.7M · 95%.

Statements side by side use the same size. If one starts with the gap, they all start with the gap. Use `VsPlan`; don't hand-build it.

**Projected vs delivered:** the same bar rows (`BarRow`) on Claire's page and every queue, and a row opened on Claire's page shows the same bars the owner sees.

## Type and numbers

1. One numeric font per line. Mono only for standalone money columns and hero figures; inline numbers are sans with `tabular-nums`.
2. Headlines one line at 1440px wide. Card copy is fragments, not sentences; sentences only in headlines and chat.
3. Sentence case. No em dashes. Real minus sign (−).

## Color meanings

One color per job. Tokens live in `src/app/globals.css`.

| Color | Token | Means | Never for |
| --- | --- | --- | --- |
| Indigo #1F22B2 | `brand-*` | You can click this: buttons, links, the selected nav item and column. The headline's pipeline figure. | Other data, status |
| Deep indigo #14165C | `brand-950` | The nav rail | |
| Magenta #C231FF | `ally-*` | Ally did this or is doing it: its mark, its chat avatar, "Did you know", the "One approval away" bar (Ally's drafts, waiting on you) | Buttons |
| Sky #5AAFFF | `autopilot` | Runs on its own (On autopilot) | |
| Amber #F79009 | `team` | Needs your team (bar) | |
| Dark amber #B54708 | `warning-*` | A deadline ("Expires in 18 days") | Boxes or backgrounds |
| Ink #210235 | `ink` | Headlines, totals (the Total opportunity bar) | |
| Red | `error-*` | A loss that matters (the gap, daily loss). Changes going down. | Thresholds, labels, decoration |
| Green | `success-*` | Done, approved, over plan. Changes going up. | Emphasis |
| Agent dots | `agent-content` violet, `agent-media` teal, `agent-ops` sky | Which agent | Anything bigger than a dot |
| Slate | | Everything else | |

No gradients, glows or tinted boxes to signal a state; state is a word or a dot. Waterfall bars are always at full color; the column highlight shows what's selected.

## Layout

1. 8px spacing grid. The action sits right under its content; no floating labels, no empty bands.
2. Money in one right-aligned column; its status under it.
3. Numbers tie everywhere: a total equals the sum of its parts on every screen that shows it.
4. Focus rings with `focus-visible` only.

## Copy

1. No filler: no label that names the section ("What Ally caught"), no fact said twice, no instructions the UI already shows.
2. Vocabulary: On autopilot · One approval away · Needs your input. Claire's screens say "Needs your team".
3. Don't add or remove copy that wasn't asked for.

## Before showing a screen

First: structure and labels pass `structure-review` (keep / change / cut for every existing item). Then the visual check.

Check at 1440px, and **measure, don't eyeball**: for every set of peers (buttons, rows, cards), compare their left edge, width, and vertical center in the browser; they must match. Then: every action indigo, magenta only for Ally; one numeric font per line; red only for real loss or a falling change; nothing wraps or truncates by accident; every number ties; the same kind of statement has the same shape as everywhere else (see Consistency); every state (empty, in progress, done) looks right.

## Proposed changes to the CIQ design system

What the demo does differently, and why. Each is a candidate to take back into CIQ.

| Area | CIQ today | Demo | Why |
| --- | --- | --- | --- |
| Action rows | No pattern for a list of actions | `ActionCard` / `ActionRow`: name and detail left, equal-width button right, setup under the detail | Recommendations appear on every screen; without one pattern each screen improvised |
| Button roles | `default` (purple) vs `outline` left to each screen | Indigo for every action; outline only for the way out and view tools | One rule anyone can apply: if it does something, it's indigo |
| Agent work | `ChainOfThought` | `AgentRun`: file reading, paced steps, "Did you know" beside the work, folds to one line | Long runs need to show real work and use the wait |
| Color | Purple #875BF7 for actions, selection and AI | Indigo #1F22B2 (CommerceIQ Blue) for actions; magenta #C231FF (CommerceIQ accent) only for Ally's own work; one color per data job | Purple everywhere read as generic AI. Splitting "you can click" from "Ally did this" lets each color carry one meaning, and both come from the CommerceIQ brand guide |
