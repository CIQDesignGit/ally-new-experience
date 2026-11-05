# Instructions

Follow this file on **every task** in this repo (UI changes, data edits, refactors, commands, and reviews).

---

## 1. Do not change or remove without confirming

- **Do not change or remove any UI element, copy, layout block, or data point** until you have **confirmed with the user** (or they explicitly asked for that change in the current request).
- This includes: labels, numbers, mock data fields, nav items, table columns, chart series, nudges, and demo state.
- Prefer **additive** changes when intent is unclear. If something looks redundant or wrong, **ask** before deleting or rewriting it.
- Exception: the user’s message clearly names what to change (e.g. “remove the hero subtitle”) — that counts as confirmation.

---

## 2. CIQ Design System (required for UI)

This app uses **[`@ciq-dev/ciq-design-system`](https://www.npmjs.com/package/@ciq-dev/ciq-design-system)** on top of **shadcn/ui** and **Tailwind CSS**.

### Install and wire-up

If the package or styles are missing, install dependencies from the repo root:

```bash
npm install @ciq-dev/ciq-design-system
npm install tailwindcss @tailwindcss/postcss
# shadcn is already configured via components.json; add primitives with: npx shadcn@latest add <component>
```

**Global styles:** import the design system in the root layout (before app CSS):

```tsx
import "@ciq-dev/ciq-design-system/styles";
import "./globals.css";
```

(`src/app/layout.tsx` should already do this.)

**Next.js:** keep `@ciq-dev/ciq-design-system` in `transpilePackages` in `next.config.ts` if you add or upgrade the package.

### How to style UI

- **Colors, spacing, typography, radius, shadows:** use tokens and utilities from **`@ciq-dev/ciq-design-system`** and the project’s mapped tokens in `src/app/globals.css` / `design-specs.md`.
- **Do not introduce arbitrary values** — no one-off hex colors, random `px` spacing, or custom CSS variables unless they already exist in the design system or `globals.css` `@theme`.
- **Components:** use shadcn/ui primitives from `src/components/ui/` (Button, Badge, Card, etc.). Use **Lucide React** for icons (`lucide-react` only).
- **If a pattern is not in CIQ:** check shadcn docs and add the component via the shadcn CLI; style it with design-system tokens, not ad-hoc classes.
- **Tailwind:** utility classes only (Tailwind v4). No inline `style={{ }}` except where the codebase already requires it for charts/layout math.

### Source of truth (in order)

1. `@ciq-dev/ciq-design-system` (package styles and exported utilities)
2. `src/app/globals.css` and `design-specs.md`
3. shadcn/ui patterns in `src/components/ui/`
4. `.cursor/rules/design-instructions.mdc` and `.claude/skills/ciq-prototype/` for Ally demo copy, numbers, and workflow

---

## Related docs

| File | Purpose |
| --- | --- |
| `design-specs.md` | Figma-aligned tokens and number rules |
| `product-context.md` | Product behaviour (queues, status, drawers) |
| `CLAUDE.md` / `TESTING.md` | Ally demo scope and manual QA |
| `components.json` | shadcn configuration |
