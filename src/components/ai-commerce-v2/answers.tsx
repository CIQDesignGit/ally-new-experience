"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { PRIMARY } from "@/components/nudge/mike/buttons"
import { Num, Points } from "@/components/nudge/points"
import type { Chip } from "@/components/nudge/chat/inline-chat"
import { ACTIONS, INPUTS, META, QUESTIONS, SURFACES, inputScores, isFixed, isLeader, money, opportunity, ownerOf, questionsOf, score, share, type Done, type Sku } from "./data"
import { PRODUCTS, RETAILERS } from "./products"
import { Evidence } from "./table"

const BOX = "flex max-w-[960px] flex-col gap-5 rounded-2xl bg-white px-6 py-5 text-[15px] leading-relaxed text-slate-700 ring-1 ring-slate-200"
const HEAD = "text-xs font-medium text-slate-500"

type Ctx = { done: Done; onFix: (id: string) => void }

/** The SKU as the agent reads it: every field on every retailer, Bounty beside you, what Ally fills, the rewrite. */
function Audit({ sku, done, onFix }: { sku: Sku } & Ctx) {
  const p = PRODUCTS.find((x) => x.sku === sku)!
  const s = inputScores(done, undefined, sku)
  const qs = QUESTIONS.filter((q) => q.sku === sku)
  const missing = p.fields.filter((f) => Object.values(f.values).every((v) => !v))
  const behind = p.fields.filter((f) => f.ally && f.bounty && Object.values(f.values).some((v) => !v))
  const openActions = ACTIONS.filter((a) => !done[a.id] && questionsOf(a).some((q) => q.sku === sku))
  const content = openActions.find((a) => ownerOf(a).lever === "content")
  return (
    <div className={BOX}>
      <div>
        <div className={HEAD}>
          SKU audit · {p.sku} · {p.asin}
        </div>
        <p className="mt-2 text-lg leading-snug font-semibold text-slate-950">
          AI Commerce Score <span className="font-mono">{score(done, undefined, sku)}</span>. Agents can&apos;t see <span className="font-mono">{missing.length}</span> {missing.length === 1 ? "field" : "fields"} on any retailer, and {META.leader} fills <span className="font-mono">{behind.length}</span> that you leave empty somewhere.
        </p>
        <p className="mt-1">
          It&apos;s in the answer for <Num>{share(done, undefined, undefined, sku)}%</Num> of the demand on its {qs.length} questions. {openActions.length} {openActions.length === 1 ? "action touches" : "actions touch"} it: {openActions.map((a) => `${a.tag} (${ownerOf(a).name})`).join(", ") || "none open"}.
        </p>
      </div>
      <div className="grid grid-cols-5 gap-2 rounded-lg bg-slate-25 px-3 py-2.5 text-center">
        {INPUTS.map((i) => (
          <div key={i.id}>
            <div className={cn("font-mono text-sm font-semibold", s[i.id] < 70 ? "text-error-600" : "text-slate-950")}>{s[i.id]}</div>
            <div className="mt-0.5 text-[11px] text-slate-500">{i.name}</div>
          </div>
        ))}
      </div>
      <section>
        <h3 className="text-sm font-semibold text-slate-950">What the agent reads, on each retailer, next to {META.leader}</h3>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-medium text-slate-500">
                <th className="py-1.5 pr-3 font-medium">Field</th>
                {RETAILERS.map((r) => (
                  <th key={r} className="py-1.5 pr-3 font-medium">
                    {r}
                  </th>
                ))}
                <th className="py-1.5 pr-3 font-medium">{META.leader} on Amazon</th>
                <th className="py-1.5 pr-3 font-medium">Ally fills</th>
              </tr>
            </thead>
            <tbody>
              {p.fields.map((f) => (
                <tr key={f.name} className="border-b border-slate-50 align-top">
                  <td className="py-1.5 pr-3 text-slate-700">{f.name}</td>
                  {RETAILERS.map((r) => {
                    const v = f.values[r]
                    const odd = f.conflict && v && v !== f.values.Amazon
                    const bad = v && /Lost|unanswered|Low|Not listed|Not shown|None/.test(v)
                    return (
                      <td key={r} className={cn("max-w-[220px] py-1.5 pr-3", v ? "text-slate-950" : "text-slate-400", (odd || bad) && "font-medium text-warning-700")}>
                        {v ?? "Missing"}
                      </td>
                    )
                  })}
                  <td className="max-w-[220px] py-1.5 pr-3 text-slate-700">{f.bounty ?? <span className="text-slate-400">—</span>}</td>
                  <td className="max-w-[240px] py-1.5 pr-3">
                    {f.ally ? (
                      <>
                        <span className="font-medium text-slate-950">{f.ally.value}</span>
                        <span className="block text-xs text-slate-500">{f.ally.source}</span>
                      </>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-950">Amazon page today</h3>
          <p className="mt-2 text-sm font-medium text-slate-950">{p.page.title}</p>
          <Points className="mt-2" items={p.page.bullets} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-950">Ally&apos;s rewrite</h3>
          <p className="mt-2 text-sm font-medium text-slate-950">{p.rewrite.title}</p>
          <Points className="mt-2" items={p.rewrite.bullets} />
        </div>
      </section>
      <div className="flex items-center gap-3">
        {content ? (
          <button type="button" onClick={() => onFix(content.id)} className={PRIMARY}>
            Approve {content.tag.toLowerCase()} for {ownerOf(content).name}
          </button>
        ) : (
          <span className="inline-flex h-10 items-center gap-1.5 text-sm font-medium text-success-700">
            <Check className="size-4" /> Every content action for this product is live
          </span>
        )}
      </div>
    </div>
  )
}

/** The same question on every agent, side by side. */
function Everywhere({ id, done, onFix }: { id: string } & Ctx) {
  const q = QUESTIONS.find((x) => x.id === id)!
  const fixed = isFixed(q, done)
  return (
    <div className={BOX}>
      <div>
        <div className={HEAD}>One question, every agent</div>
        <p className="mt-2 text-lg leading-snug font-semibold text-slate-950">Three agents, three different answers. {META.leader} is in all of them; you&apos;re in none.</p>
      </div>
      <Evidence q={q} fixed={fixed} />
      {q.action && !fixed && (
        <button type="button" onClick={() => onFix(q.action!)} className={cn(PRIMARY, "w-fit")}>
          Fix and ask again
        </button>
      )}
      {fixed && (
        <span className="inline-flex h-10 items-center gap-1.5 text-sm font-medium text-success-700">
          <Check className="size-4" /> Fixed and asked again
        </span>
      )}
    </div>
  )
}

/** Why the leader wins a surface: the inputs where their pages pass and yours don't. */
function LeaderWins({ done }: Ctx) {
  const by = SURFACES.map((s) => ({ s, ours: share(done, undefined, s.id), leader: share(done, isLeader, s.id) }))
  const worst = [...by].sort((a, b) => b.leader - b.ours - (a.leader - a.ours))[0]
  const ours = inputScores(done)
  const theirs = inputScores(done, isLeader)
  const gaps = INPUTS.map((i) => ({ i, d: theirs[i.id] - ours[i.id] })).sort((a, b) => b.d - a.d)
  const lost = QUESTIONS.filter((q) => q.answers[worst.s.id] && q.action && !isFixed(q, done) && q.answers[worst.s.id]!.list.some(isLeader) && !q.answers[worst.s.id]!.list.some((n) => n.startsWith(META.brand)))
  return (
    <div className={BOX}>
      <div>
        <div className={HEAD}>
          {META.leader} on {worst.s.name}
        </div>
        <p className="mt-2 text-lg leading-snug font-semibold text-slate-950">
          {META.leader} is in <span className="font-mono">{worst.leader}%</span> of {worst.s.name} answers, you&apos;re in <span className="font-mono">{worst.ours}%</span>. The difference is on the page and in the sources, not the product.
        </p>
      </div>
      <div className="grid grid-cols-5 gap-2 rounded-lg bg-slate-25 px-3 py-2.5 text-center">
        {gaps.map(({ i, d }) => (
          <div key={i.id}>
            <div className={cn("font-mono text-sm font-semibold", d >= 15 ? "text-error-600" : "text-slate-950")}>
              {ours[i.id]} <span className="text-slate-400">vs</span> {theirs[i.id]}
            </div>
            <div className="mt-0.5 text-[11px] text-slate-500">{i.name}</div>
          </div>
        ))}
      </div>
      <Points
        items={lost.map((q) => (
          <span key={q.id}>
            “{q.text}” · <Num>{money(q.answers[worst.s.id]!.demand)}</Num> a month · {q.why?.split(".")[0]}
          </span>
        ))}
      />
      <p className="text-slate-500">
        {META.leader} fills every attribute, footnotes its claims, answers questions inside 48 hours and is cited by the three sources ChatGPT reads. Closing the whole gap is worth <Num>{money(Math.max(opportunity(done), 0))}</Num> a month.
      </p>
    </div>
  )
}

function Rising({ done }: Ctx) {
  const qs = QUESTIONS.filter((q) => q.trend)
  return (
    <div className={BOX}>
      <div>
        <div className={HEAD}>Rising this month</div>
        <p className="mt-2 text-lg leading-snug font-semibold text-slate-950">Two questions are climbing: dorm restocks and Thanksgiving hosting. You&apos;re in neither answer.</p>
      </div>
      {qs.map((q) => (
        <Evidence key={q.id} q={q} fixed={isFixed(q, done)} />
      ))}
      <p className="text-slate-500">Shopping moments move the questions before they move the sales. Ally watches demand weekly and lifts the rising ones to the top of the table.</p>
    </div>
  )
}

function Saved({ done }: Ctx) {
  const a = ACTIONS.find((x) => x.kind === "pause")!
  const q = questionsOf(a)[0]
  return (
    <div className={BOX}>
      <div>
        <div className={HEAD}>Promoted</div>
        <p className="mt-2 text-lg leading-snug font-semibold text-slate-950">
          {done[a.id] ? (
            <>
              Pausing the Alexa sponsored prompt on “{q.text}” saves <span className="font-mono">${a.spend}K</span> a month. You&apos;re still <span className="font-mono">#2</span> organically.
            </>
          ) : (
            <>
              You&apos;re paying <span className="font-mono">${a.spend}K</span> a month on “{q.text}” and you already rank <span className="font-mono">#2</span> organically.
            </>
          )}
        </p>
      </div>
      <Points
        items={[
          <span key="1">The rule: pay where organic can&apos;t win yet; stop paying where it already does</span>,
          <span key="2">Checked weekly. If organic slips below #3, Ally proposes the ad again</span>,
          <span key="3">The money moves to Thanksgiving hosting, where no page can rank for three weeks</span>,
        ]}
      />
    </div>
  )
}

function Email({ done }: Ctx) {
  return (
    <div className={BOX}>
      <p className="text-slate-950">
        <Check className="mr-1.5 inline size-4 text-success-700" />
        Sent to your team: AI Commerce Score {score(done)} ({META.leader} {score(done, isLeader)}), in the answer for {share(done)}% ({META.leader} {share(done, isLeader)}%), gap {money(Math.max(opportunity(done), 0))} a month, and the actions to approve with owners.
      </p>
    </div>
  )
}

/** The page's Ask Ally starters, written from its numbers; answers end in a next step. */
export function chips(ctx: Ctx): Chip[] {
  const weakest = [...PRODUCTS].sort((a, b) => score(ctx.done, undefined, a.sku) - score(ctx.done, undefined, b.sku))[0].sku
  const wet = QUESTIONS.find((q) => q.id === "wet")!
  const auditChip: Chip = { q: `Audit ${weakest.split(",")[0]} for agents`, match: /audit|as the agent (reads|sees)|tear-a-square|pick-a-size|shop towels/i, render: () => <Audit sku={weakest} {...ctx} /> }
  const everywhereChip: Chip = { q: `Show me “${wet.text.replace(/\?$/, "")}” on every agent`, match: /every agent|all agents|on each agent|hold up when wet|side by side/i, render: () => <Everywhere id="wet" {...ctx} />, followUps: [auditChip] }
  const leaderChip: Chip = { q: `Why is ${META.leader} winning on Alexa?`, match: /bounty|leader|winning|ahead/i, render: () => <LeaderWins {...ctx} />, followUps: [everywhereChip] }
  const risingChip: Chip = { q: "What's rising this month?", match: /rising|trending|this month|seasonal|back to school|thanksgiving|dorm/i, render: () => <Rising {...ctx} /> }
  const savedChip: Chip = { q: "What did pausing the ad save?", match: /pause|paused|ad spend|sponsored|save/i, render: () => <Saved {...ctx} />, hidden: true }
  const emailChip: Chip = { q: "Email this to my team", match: /email|send (this|it)|share/i, render: () => <Email {...ctx} />, hidden: true }
  return [leaderChip, everywhereChip, auditChip, risingChip, savedChip, emailChip]
}
