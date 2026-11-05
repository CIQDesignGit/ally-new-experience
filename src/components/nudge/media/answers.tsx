"use client"

import { Check } from "lucide-react"
import { toast } from "sonner"
import { PRIMARY } from "../mike/buttons"
import { useNudge } from "../nudge-context"
import { useChat } from "../chat/inline-chat"
import type { Chip } from "../chat/inline-chat"
import { BUDGET_PLAN, BUDGET_SALES, BUDGET_TOTAL, LEDGER, MARGINAL_IROAS, MONTH_GONE, PACING, TOGETHER, TOGETHER_REINVESTED, TOGETHER_TOTAL, paceOf } from "./data"
import { cn } from "@/lib/utils"

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
        <li>Held back: 7 SKUs whose pages convert at half the category rate, until content&rsquo;s fixes go live.</li>
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
                toast.success(`Plan approved · ${k(BUDGET_TOTAL)} across 4 lines, +${k(BUDGET_SALES)} projected`)
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



/** One step of the together story: when, what, then the proof. */
function Step({ n, when, title, children }: { n: number; when: string; title: string; children: React.ReactNode }) {
  return (
    <li className="grid grid-cols-[24px_minmax(0,1fr)] gap-3">
      <span className="font-mono text-sm text-slate-400">{n}</span>
      <div className="min-w-0">
        <div className="text-xs font-medium text-ally-700">{when}</div>
        <div className="text-sm font-semibold text-slate-950">{title}</div>
        <div className="mt-2">{children}</div>
      </div>
    </li>
  )
}

function StepTable({ head, rows }: { head: string[]; rows: (string | undefined)[][] }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-slate-100 text-left">
          {head.map((h, i) => (
            <th key={h} className={cn("pb-1.5 text-xs font-medium text-slate-500", i > 0 && "text-right")}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r[0]} className="border-b border-slate-100 last:border-b-0">
            <td className="py-1.5 pr-3 text-slate-950">
              {r[0]}
              {r[3] && <span className="ml-1.5 text-xs text-slate-500">· {r[3]}</span>}
            </td>
            <td className="py-1.5 pl-3 text-right font-mono whitespace-nowrap text-slate-700">{r[1]}</td>
            <td className="py-1.5 pl-3 text-right font-mono whitespace-nowrap text-slate-700">{r[2]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/**
 * "How are content and media working together?" The lifecycle, keyword by
 * keyword: new keywords get bids to win rank; July's rank on their own now, so
 * bids come down; the money funds starved keywords; a claim reviews contradict
 * goes negative on those SKUs. Ends on the sales it added.
 */
export function TogetherAnswer() {
  const t = TOGETHER
  return (
    <div className="flex max-w-[860px] flex-col gap-5 rounded-2xl bg-white px-5 py-4 text-[15px] leading-relaxed text-slate-700 ring-1 ring-slate-200">
      <p>
        <span className="font-semibold text-slate-950">
          Content and media together added <span className="font-mono text-success-700">+{k(TOGETHER_TOTAL)}</span> in sales {t.since}.
        </span>{" "}
        Content adds the words shoppers use; media funds them until they rank on their own, then moves the money to keywords that had almost none.
      </p>
      <ol className="flex flex-col gap-5">
        <Step n={1} when="This week · content agent → media agent" title={`${t.now.keywords} keywords content just added go into campaigns, bids up to win rank`}>
          <StepTable head={["Keyword", "Share of voice", "Bid"]} rows={t.now.rows.map((r) => [r.keyword, r.sov, r.bid])} />
        </Step>
        <Step n={2} when="Added in July · three months later" title={`Organic rank #${t.july.rank.from} → #${t.july.rank.to} on average, so media cut bids on ${t.july.cut} of the ${t.july.keywords}`}>
          <StepTable head={["Keyword", "Organic rank", "Bid"]} rows={t.july.rows.map((r) => [r.keyword, r.rank, r.bid, r.note])} />
          <div className="mt-2 text-[13px] text-slate-500">
            Cost per click <span className="font-mono">−{Math.abs(t.july.cpc)}%</span> · <span className="font-mono">${t.july.freed}K</span> a week freed, same sales ·{" "}
            <span className="font-mono text-success-700">+{k(t.july.organic)}</span> organic sales
          </div>
        </Step>
        <Step n={3} when="Where the money went" title={`${t.starved.keywords} keywords that had almost no budget, returning $3.40`}>
          <StepTable head={["Keyword", "Spend", "Return"]} rows={t.starved.rows.map((r) => [r.keyword, r.spend, r.ret])} />
          <div className="mt-2 text-[13px] text-slate-500">
            <span className="font-mono">{k(t.starved.moved)}</span> moved earned {k(t.starved.newSales)}, against {k(t.starved.oldSales)} where it sat ·{" "}
            <span className="font-mono text-success-700">+{k(TOGETHER_REINVESTED)}</span> incremental sales
          </div>
        </Step>
        <Step n={4} when="From reviews · content agent → media agent" title={`A claim ${t.negative.reviews} reviews contradict goes negative on ${t.negative.skus}`}>
          <div className="text-sm text-slate-700">
            Content took &ldquo;clean burning&rdquo; off their bullets; media made {t.negative.terms.map((x) => `"${x}"`).join(" and ")} negative on those 2 SKUs only · {t.negative.moved} a week moved to SKUs that convert
          </div>
        </Step>
      </ol>
      <p className="text-[13px] text-slate-500">Method: organic sales from search query share before and after; paid from incrementality, keyword by keyword.</p>
    </div>
  )
}

export const TOGETHER_Q = "How are content and media working together?"
export const togetherChip: Chip = {
  q: TOGETHER_Q,
  match: /content (and|&|x) media|media (and|&) content|working together|starved keywords?/i,
  think: { ms: 1800, label: "Following each keyword from the page to the auction" },
  render: () => <TogetherAnswer />,
}

export const JAMES_CHIPS: Chip[] = [
  budgetChip("james"),
  togetherChip,
  { q: "Which keywords should I harvest?", match: /harvest|organic.*(rank|high)|cannibal/i, render: () => <HarvestAnswer /> },
  { q: "Where am I under- or overpacing?", match: /pac(e|ing)|under.?spend|over.?spend/i, render: () => <PacingAnswer /> },
]
