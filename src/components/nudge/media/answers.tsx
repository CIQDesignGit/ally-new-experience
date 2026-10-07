"use client"

import { Check } from "lucide-react"
import { toast } from "sonner"
import { PRIMARY } from "../mike/buttons"
import { useNudge } from "../nudge-context"
import { useChat } from "../chat/inline-chat"
import type { Chip } from "../chat/inline-chat"
import { BUDGET_PLAN, BUDGET_SALES, BUDGET_TOTAL, LEDGER, MARGINAL_IROAS, MONTH_GONE, PACING, paceOf } from "./data"

const k = (v: number) => (v >= 1000 ? `$${(v / 1000).toFixed(2).replace(/0$/, "")}M` : `$${v}K`)
const cell = "px-3 py-2.5"
const HEAD = "px-3 pb-2 text-xs font-medium text-slate-500"

/**
 * "I have $500K more budget. How do I spend it?" Ally's split: funded where the
 * next dollar returns most, held back from pages that can't sell. James approves
 * it (the plan is his Needs your input item); from Claire's page it's sent to him.
 */
export function BudgetPlanAnswer({ who }: { who: "james" | "claire" }) {
  const { approved, approve } = useNudge()
  const done = !!approved["media-plan"]
  return (
    <div className="flex max-w-[860px] flex-col gap-4 rounded-2xl bg-white px-5 py-4 text-[15px] leading-relaxed text-slate-700 ring-1 ring-slate-200">
      <p>
        <span className="font-semibold text-slate-950">
          Spend it where content just went live and on what&apos;s underpacing: about <span className="font-mono">{k(BUDGET_SALES)}</span> in incremental sales.
        </span>{" "}
        The next dollar returns <span className="font-mono">${MARGINAL_IROAS.toFixed(2)}</span>, below your <span className="font-mono">$3.01</span> average, because your best keywords are already funded.
      </p>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left">
            <th className={HEAD}>Where</th>
            <th className={`${HEAD} text-right`}>Spend</th>
            <th className={`${HEAD} text-right`}>Return</th>
            <th className={`${HEAD} text-right`}>Sales</th>
          </tr>
        </thead>
        <tbody>
          {BUDGET_PLAN.map((r) => (
            <tr key={r.where} className="border-t border-slate-100">
              <td className={`${cell} text-slate-700`}>{r.where}</td>
              <td className={`${cell} text-right font-mono whitespace-nowrap text-slate-950 tabular-nums`}>{k(r.spend)}</td>
              <td className={`${cell} text-right font-mono whitespace-nowrap text-slate-500 tabular-nums`}>${r.iroas.toFixed(2)}</td>
              <td className={`${cell} text-right font-mono whitespace-nowrap text-slate-950 tabular-nums`}>+{k(r.sales)}</td>
            </tr>
          ))}
          <tr className="border-t border-slate-200 font-semibold">
            <td className={`${cell} text-slate-950`}>Total</td>
            <td className={`${cell} text-right font-mono text-slate-950 tabular-nums`}>{k(BUDGET_TOTAL)}</td>
            <td className={cell} />
            <td className={`${cell} text-right font-mono text-slate-950 tabular-nums`}>+{k(BUDGET_SALES)}</td>
          </tr>
        </tbody>
      </table>
      <ul className="flex flex-col gap-1 text-sm text-slate-500">
        <li>Held back: 11 SKUs that lost the buy box or show out of stock. Spend there goes to other sellers.</li>
        <li>Not on your brand terms: you already rank in the top 3 there.</li>
      </ul>
      {who === "james" ? (
        done ? (
          <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-success-700">
            <Check className="size-4" /> Plan approved · Ally starts today
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                approve("media-plan")
                toast.success(`Plan approved · ${k(BUDGET_TOTAL)} across 4 lines, +${k(BUDGET_SALES)} projected`, { position: "top-right" })
              }}
              className={PRIMARY}
            >
              Approve the plan
            </button>
          </div>
        )
      ) : (
        <SendToJames />
      )}
    </div>
  )
}

function SendToJames() {
  const { approved } = useNudge()
  const { turns, ask } = useChat()
  const sent = turns.some((t) => t.chip === SENT_CHIP.q)
  if (approved["media-plan"]) return <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-success-700"><Check className="size-4" /> James approved it</div>
  if (sent) return <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-success-700"><Check className="size-4" /> Sent to James</div>
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={() => ask(SENT_CHIP)} className={PRIMARY}>
        Send to James
      </button>
    </div>
  )
}

const SENT_CHIP: Chip = {
  q: "Send the $500K plan to James",
  render: () => (
    <div className="max-w-[860px] rounded-2xl bg-white px-5 py-4 text-[15px] text-slate-700 ring-1 ring-slate-200">
      Sent to James. It&apos;s waiting on his page as the plan for <span className="font-mono">$500K</span>; Ally starts the day he approves.
    </div>
  ),
}

export const BUDGET_Q = "I have $500K more budget. How do I spend it?"
export const budgetChip = (who: "james" | "claire"): Chip => ({
  q: BUDGET_Q,
  match: /(\$?500\s?k|additional|extra|more|new|unlocked).*budget|budget.*(spend|invest|allocate)|invest an additional/i,
  think: { ms: 1800, label: "Ranking where the next dollar returns most" },
  render: () => <BudgetPlanAnswer who={who} />,
})

/** Keyword harvesting: where paid adds little because you already rank. */
export function HarvestAnswer() {
  const rows = LEDGER.filter((r) => r.play === "Harvest")
  return (
    <div className="flex max-w-[860px] flex-col gap-3 rounded-2xl bg-white px-5 py-4 text-[15px] leading-relaxed text-slate-700 ring-1 ring-slate-200">
      <p>
        <span className="font-semibold text-slate-950">38 keywords rank in the top 3 organically and return under $1.20 on paid.</span> Ally cut their bids 40% and moved <span className="font-mono">$21K</span> a week to the keywords content just added.
      </p>
      <ul className="flex flex-col gap-1 text-sm">
        {rows.map((r) => (
          <li key={r.keyword}>
            <span className="font-medium text-slate-950">{r.keyword}</span> · organic #{r.organic} · <span className="font-mono">${r.iroas.toFixed(2)}</span> return
          </li>
        ))}
        <li className="text-slate-500">Bids come back if organic rank slips below #5.</li>
      </ul>
    </div>
  )
}

/** Pacing by category this month. */
export function PacingAnswer() {
  return (
    <div className="flex max-w-[860px] flex-col gap-3 rounded-2xl bg-white px-5 py-4 text-[15px] leading-relaxed text-slate-700 ring-1 ring-slate-200">
      <p>
        <span className="font-semibold text-slate-950">Gift sets and wax melts are underpacing; large jars is overpacing.</span> {MONTH_GONE}% of October is gone.
      </p>
      <ul className="flex flex-col gap-1 text-sm">
        {PACING.map((p) => {
          const { pct, state } = paceOf(p.budget, p.spent)
          return (
            <li key={p.category}>
              <span className="font-medium text-slate-950">{p.category}</span> · <span className="font-mono">{pct}%</span> spent ·{" "}
              <span className={state === "On pace" ? "text-slate-500" : "text-warning-700"}>{state}</span> · {p.does}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export const JAMES_CHIPS: Chip[] = [
  budgetChip("james"),
  { q: "Which keywords should I harvest?", match: /harvest|organic.*(rank|high)|cannibal/i, render: () => <HarvestAnswer /> },
  { q: "Where am I under- or overpacing?", match: /pac(e|ing)|under.?spend|over.?spend/i, render: () => <PacingAnswer /> },
]

