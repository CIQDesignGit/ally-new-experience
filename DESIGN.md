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

## Buttons

1. **One purple button per view.** It's the single most important action. Everything else is `SECONDARY` (outline) or a text link.
2. **Peers look the same.** Two actions of the same kind (two approvals, two sends) use the same button style, the same position and the same height. In an `ActionCard` with more than one row, every row uses `SECONDARY`; a card with one row uses `PRIMARY`.
3. **Buttons sit on the right of their row**, vertically centered on the text. Controls that set up the action (a cap, a scope) sit under the row's detail, on the left.
4. **Done replaces the button in place**: a green check and the past tense ("Approved", "Sent to Dana").
5. **Peer buttons share one width**, so their edges line up down the card (`ActionRow` sets 176px). Never let label length decide a peer button's size.
6. **A button centers on its own name and detail**, not on the whole row; setup controls (a cap, a scope) go on their own line underneath and never push the button down.

## Rows of the same kind

1. Same structure in every row: name, then one line of detail, then optional setup. If one row's detail wraps, shorten it or move the extra to setup.
2. Same punctuation in every row: parts joined with " · ". No colon in one row and a dot in the next.
3. A figure that changes with a control sits next to that control (the weekly cap and "about $14K a week back" share a line).

## Type and numbers

1. One numeric font per line. Mono only for standalone money columns and hero figures; inline numbers are sans with `tabular-nums`.
2. Headlines one line at 1440px wide. Card copy is fragments, not sentences; sentences only in headlines and chat.
3. Sentence case. No em dashes. Real minus sign (−).

## Color meanings

| Color | Means | Never for |
| --- | --- | --- |
| Purple (brand) | You, Ally, the one primary action, selection | Status |
| Red | A loss that matters (daily loss, the main gap). Changes going down. | Thresholds, labels, decoration |
| Green | Done, approved. Changes going up. | Emphasis |
| Amber | A deadline ("Expires in 18 days"), "Needs your input", "true now" | Boxes or backgrounds |
| Slate | Everything else | |

No tinted boxes to signal a state; state is a word or a dot.

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

Check at 1440px, and **measure, don't eyeball**: for every set of peers (buttons, rows, cards), compare their left edge, width, and vertical center in the browser; they must match. Then: one purple button; one numeric font per line; red only for real loss or a falling change; nothing wraps or truncates by accident; every number ties; every state (empty, in progress, done) looks right.

## Proposed changes to the CIQ design system

What the demo does differently, and why. Each is a candidate to take back into CIQ.

| Area | CIQ today | Demo | Why |
| --- | --- | --- | --- |
| Action rows | No pattern for a list of actions | `ActionCard` / `ActionRow`: name and detail left, equal-width button right, setup under the detail | Recommendations appear on every screen; without one pattern each screen improvised |
| Primary button | Any number of `default` (purple) buttons per view | One purple per view; none when the actions are equal choices | Purple should point at the one next step |
| Agent work | `ChainOfThought` | `AgentRun`: file reading, paced steps, "Did you know" beside the work, folds to one line | Long runs need to show real work and use the wait |
