"use client"

import { Check } from "lucide-react"
import { toast } from "sonner"
import { PRIMARY } from "../mike/buttons"
import { useNudge } from "../nudge-context"
import { useChat } from "../chat/inline-chat"
import type { Chip } from "../chat/inline-chat"
import { BUDGET_PLAN, BUDGET_SALES, BUDGET_TOTAL, LEDGER, MARGINAL_IROAS, MONTH_GONE, PACING, TOGETHER, TOGETHER_REINVESTED, TOGETHER_TOTAL, paceOf } from "./data"

const k = (v: number) => (v >= 1000 ? `$${(v / 1000).toFixed(2).replace(/0$/, "")}M` : `$${v}K`)
const cell = "px-3 py-2.5"
const HEAD = "px-3 pb-2 text-xs font-medium text-slate-500"

/**
 * "I have $500K more budget. How do I spend it?" Ally's split: funded where the
 * next dollar returns most, held back from pages content is still fixing. James approves
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
        <li>Held back: 7 SKUs whose pages convert at half the category rate, until content's fixes go live.</li>
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



/**
 * "How are content and media working together?" The chain, with its sales:
 * content lifts organic rank; media pulls back where organic took over; the
 * money funds keywords that were starved; sales rise. Sep 7 – Oct 4.
 */
export function TogetherAnswer() {
  const t = TOGETHER
  const max = Math.max(...t.weekly)
  return (
    <div className="flex max-w-[860px] flex-col gap-5 rounded-2xl bg-white px-5 py-4 text-[15px] leading-relaxed text-slate-700 ring-1 ring-slate-200">
      <p>
        <span className="font-semibold text-slate-950">
          Content and media together added <span className="font-mono text-success-700">+{k(TOGETHER_TOTAL)}</span> in sales, {t.period}.
        </span>{" "}
        Content&apos;s keywords lifted organic rank, so media spent less on them and funded keywords that had been starved.
      </p>
      <ol className="flex flex-col gap-3">
        {[
          { n: 1, who: "Content agent", text: <>Added {t.keywords} trending keywords to {t.pages} pages · organic rank <span className="font-mono">#{t.rank.from} → #{t.rank.to}</span> on average</>, value: `+${k(t.organic)}`, note: "organic sales" },
          { n: 2, who: "Media agent", text: <>Cut bids on the {t.harvested} that reached the top 3, plus 29 already there · cost per click <span className="font-mono">−{Math.abs(t.cpc)}%</span>, <span className="font-mono">${t.freed}K</span> a week freed</>, value: `$${t.freed}K/wk`, note: "freed, same sales" },
          { n: 3, who: "Media agent", text: <>Moved it to {t.starved} starved keywords returning $3.40 · <span className="font-mono">{k(t.moved)}</span> earned {k(t.newSales)}, against {k(t.oldSales)} where it sat</>, value: `+${k(TOGETHER_REINVESTED)}`, note: "incremental sales" },
        ].map((x) => (
          <li key={x.n} className="grid grid-cols-[24px_minmax(0,1fr)_auto] items-baseline gap-3">
            <span className="font-mono text-sm text-slate-400">{x.n}</span>
            <span className="min-w-0">
              <span className="block text-xs font-medium text-ally-700">{x.who}</span>
              <span className="block text-sm text-slate-950">{x.text}</span>
            </span>
            <span className="text-right">
              <span className="block font-mono text-sm font-semibold whitespace-nowrap text-slate-950 tabular-nums">{x.value}</span>
              <span className="block text-xs whitespace-nowrap text-slate-500">{x.note}</span>
            </span>
          </li>
        ))}
      </ol>
      <div className="grid gap-5 md:grid-cols-[220px_minmax(0,1fr)]">
        <div>
          <div className="text-xs font-medium text-slate-500">Weekly sales on these keywords</div>
          <div className="mt-2 flex h-24 items-end gap-2">
            {t.weekly.map((v, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <span className="font-mono text-[11px] text-slate-700 tabular-nums">${v}K</span>
                <span className={i === t.weekly.length - 1 ? "w-full rounded-t-sm bg-ally-500" : "w-full rounded-t-sm bg-ally-200"} style={{ height: `${(v / max) * 64}px` }} />
              </div>
            ))}
          </div>
          <div className="mt-1 flex justify-between text-[11px] text-slate-400">
            <span>Sep 7</span>
            <span>Sep 28</span>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left">
              <th className="pb-1.5 text-xs font-medium text-slate-500">Keyword content added</th>
              <th className="pb-1.5 text-xs font-medium text-slate-500">Organic</th>
              <th className="pb-1.5 text-xs font-medium text-slate-500">Bid</th>
            </tr>
          </thead>
          <tbody>
            {t.rows.map((r) => (
              <tr key={r.keyword} className="border-b border-slate-100 align-top">
                <td className="py-2 pr-3">
                  <span className="block text-slate-950">{r.keyword}</span>
                  <span className="block text-xs text-slate-500">{r.note}</span>
                </td>
                <td className="py-2 pr-3 font-mono whitespace-nowrap text-slate-700">{r.rank}</td>
                <td className="py-2 font-mono whitespace-nowrap text-slate-700">{r.bid}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[13px] text-slate-500">Method: organic sales from search query share before and after; paid from incrementality, keyword by keyword.</p>
    </div>
  )
}

export const TOGETHER_Q = "How are content and media working together?"
export const togetherChip: Chip = {
  q: TOGETHER_Q,
  match: /content (and|&|x) media|media (and|&) content|working together|starved keywords?/i,
  think: { ms: 1800, label: "Following 12 keywords from the page to the auction" },
  render: () => <TogetherAnswer />,
}

export const JAMES_CHIPS: Chip[] = [
  budgetChip("james"),
  togetherChip,
  { q: "Which keywords should I harvest?", match: /harvest|organic.*(rank|high)|cannibal/i, render: () => <HarvestAnswer /> },
  { q: "Where am I under- or overpacing?", match: /pac(e|ing)|under.?spend|over.?spend/i, render: () => <PacingAnswer /> },
]
