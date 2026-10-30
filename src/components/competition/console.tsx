"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, Loader2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { PRIMARY, SECONDARY } from "../nudge/mike/buttons"
import { useCompetition, setCompetition, reached } from "./state"
import { NAMES, SQL, SKILL, TESTS, TIMES } from "./data"

type Tab = "skill" | "sql" | "tests" | "publish"

/**
 * Step 3: the Agent Console, inside CommerceIQ. Lena reviews Nora's skill:
 * reads the SQL, runs the tests on production data, fixes what's hers to fix,
 * sends the rest back to Nora, then publishes for Aurelle or for everyone.
 */
export function AgentConsole() {
  const c = useCompetition()
  const [tab, setTab] = useState<Tab>("tests")
  const [running, setRunning] = useState(false)
  const [runs, setRuns] = useState(reached(c, "tested") ? 1 : 0)
  const [editing, setEditing] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [scope, setScope] = useState<"aurelle" | "all">("aurelle")

  const version = c.competitorFixed ? 3 : c.sovFixed ? 2 : 1
  const bothFixed = c.sovFixed && c.competitorFixed
  // The last run's results: version 1 fails two; after both fixes, all pass once re-run.
  const allPass = bothFixed && runs >= 2
  const results = TESTS.map((t) => ({ ...t, pass: !t.fails || allPass }))
  const passed = results.filter((r) => r.pass).length
  const live = c.stage === "live"

  if (!reached(c, "submitted")) {
    return <div className="px-10 py-16 text-[15px] text-slate-500">No version waiting for review. {NAMES.fde} submits from Claude Code.</div>
  }

  const run = () => {
    setRunning(true)
    window.setTimeout(() => {
      setRunning(false)
      setRuns((r) => r + 1)
      if (!reached(c, "tested")) setCompetition({ stage: "tested" })
    }, 2200)
  }

  return (
    <div className="flex flex-col">
      <header className="flex items-start justify-between gap-6 px-10 pt-6">
        <div>
          <div className="text-[13px] text-slate-500">
            <Link href="/console/skills" className="hover:text-slate-900">
              Skills
            </Link>{" "}
            · Aurelle Candles · request {NAMES.request}
          </div>
          <h1 className="mt-1 text-[28px] leading-tight font-semibold tracking-tight text-slate-950">{NAMES.skill}</h1>
          <div className="mt-1 flex items-center gap-2 text-[14px] text-slate-500">
            <span className={cn("size-1.5 rounded-full", live ? "bg-success-500" : "bg-slate-400")} aria-hidden />
            {live ? `Live · version ${version}` : `Version ${version} · in review`} · author {NAMES.fde} · reviewer {NAMES.reviewer}
          </div>
        </div>
      </header>

      <div role="tablist" className="mt-5 flex gap-6 border-b border-slate-200 px-10">
        {(["skill", "sql", "tests", "publish"] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} type="button" onClick={() => setTab(t)} className={cn("-mb-px border-b-2 py-3 text-[14px] font-medium", tab === t ? "border-brand-500 text-brand-700" : "border-transparent text-slate-500 hover:text-slate-900")}>
            {{ skill: "Skill", sql: "SQL", tests: "Tests", publish: "Publish" }[t]}
          </button>
        ))}
      </div>

      <div className="px-10 pt-6 pb-16">
        {tab === "skill" && <Code title="SKILL.md" note={c.competitorFixed ? `Step 4 changed by ${NAMES.fde} in version 3` : undefined} rows={c.competitorFixed ? [...lines(SKILL.head), ...del(SKILL.wrong), ...add(SKILL.right), ...lines(SKILL.tail)] : lines(`${SKILL.head}\n${SKILL.wrong}\n${SKILL.tail}`)} />}

        {tab === "sql" && (
          <div className="flex flex-col gap-6">
            <Code title="promotions.sql" rows={lines(SQL.promotions)} />
            <Code title="price_gap.sql" note={`${NAMES.fde} changed the join before submitting`} rows={[...lines(SQL.priceGap.head), ...del(SQL.priceGap.wrong), ...add(SQL.priceGap.right)]} />
            <section className="rounded-xl border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
                <span className="font-mono text-[13px] text-slate-950">sov_gift_terms.sql</span>
                {c.sovFixed ? (
                  <span className="text-[13px] text-slate-500">Line 6 changed by {NAMES.reviewer} in version 2</span>
                ) : editing ? (
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setEditing(false)} className={SECONDARY}>
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCompetition({ sovFixed: true })
                        setEditing(false)
                      }}
                      className={PRIMARY}
                    >
                      Save as version 2
                    </button>
                  </div>
                ) : (
                  reached(c, "tested") && (
                    <button type="button" onClick={() => setEditing(true)} className={PRIMARY}>
                      Edit line 6
                    </button>
                  )
                )}
              </div>
              <CodeRows rows={c.sovFixed || editing ? [...lines(SQL.sov.head), ...del(SQL.sov.wrong), ...add(SQL.sov.right), ...lines(SQL.sov.tail)] : lines(`${SQL.sov.head}\n${SQL.sov.wrong}\n${SQL.sov.tail}`)} />
            </section>
          </div>
        )}

        {tab === "tests" && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-6">
              <div>
                <div className="text-[15px] font-semibold text-slate-950">{runs === 0 ? "12 tests · not run yet" : `${passed} of ${results.length} passed`}</div>
                <div className="text-[13px] text-slate-500">10 known weeks for Aurelle · 2 other customers, required before publishing to everyone · production data</div>
              </div>
              <button type="button" onClick={run} disabled={running || live} className={PRIMARY}>
                {running && <Loader2 className="size-4 animate-spin" aria-hidden />}
                {running ? "Running" : runs === 0 ? "Run tests" : "Run tests again"}
              </button>
            </div>

            {runs > 0 && !running && (
              <section className="rounded-xl border border-slate-200">
                <div className="grid grid-cols-[minmax(0,1fr)_140px_110px] gap-4 border-b border-slate-200 px-5 py-2.5 text-xs font-medium text-slate-500">
                  <span>Test</span>
                  <span>Customer</span>
                  <span>Result</span>
                </div>
                <ul className="divide-y divide-slate-100">
                  {results.map((r) => (
                    <li key={r.name + r.customer} className="px-5 py-3">
                      <div className="grid grid-cols-[minmax(0,1fr)_140px_110px] items-center gap-4 text-[14px]">
                        <span className="text-slate-950">{r.name}</span>
                        <span className="text-slate-700">{r.customer}</span>
                        <span className={cn("flex items-center gap-1.5", r.pass ? "text-success-700" : "text-error-600")}>
                          {r.pass ? <Check className="size-4" aria-hidden /> : <X className="size-4" aria-hidden />}
                          {r.pass ? "Passed" : "Failed"}
                        </span>
                      </div>
                      {!r.pass && r.fails && (
                        <div className="mt-2 flex items-center justify-between gap-4 rounded-lg bg-slate-50 px-4 py-3">
                          <div className="text-[13px] leading-snug">
                            <div className="text-slate-700">{r.fails.why}</div>
                            <div className="mt-0.5 text-slate-500">Fix in {r.fails.where}</div>
                          </div>
                          {r.fails.fixIn === "sql" ? (
                            c.sovFixed ? (
                              <span className="flex shrink-0 items-center gap-1.5 text-[13px] text-success-700">
                                <Check className="size-4" aria-hidden /> Fixed in version 2
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setTab("sql")
                                  setEditing(true)
                                }}
                                className={PRIMARY}
                              >
                                Fix the query
                              </button>
                            )
                          ) : c.competitorFixed ? (
                            <span className="flex shrink-0 items-center gap-1.5 text-[13px] text-success-700">
                              <Check className="size-4" aria-hidden /> Fixed by {NAMES.fde} in version 3
                            </span>
                          ) : (
                            <Link href="/fde/claude-code" className={PRIMARY}>
                              Send to {NAMES.fde}
                            </Link>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {bothFixed && runs < 2 && !running && <p className="text-[14px] text-slate-700">Both fixes are in. Run the tests again before publishing.</p>}
          </div>
        )}

        {tab === "publish" && (
          <div className="grid grid-cols-[minmax(0,1fr)_340px] gap-6 max-lg:grid-cols-1">
            <section className="flex flex-col gap-3">
              <div className="text-[15px] font-semibold text-slate-950">Who gets it</div>
              {(
                [
                  { id: "aurelle", label: "Aurelle Candles only", detail: `Watches ${NAMES.competitor} · alert above ${c.threshold} pts · every ${c.day}` },
                  { id: "all", label: "All customers", detail: "Each account watches its own competitor list · switched on per account" },
                ] as const
              ).map((o) => (
                <button key={o.id} type="button" disabled={live} onClick={() => setScope(o.id)} className={cn("flex items-start gap-3 rounded-lg px-4 py-3 text-left ring-1", scope === o.id ? "bg-slate-100 ring-slate-300" : "ring-slate-200 hover:bg-slate-50")}>
                  <span className={cn("mt-1 size-3 shrink-0 rounded-full border", scope === o.id ? "border-brand-500 bg-brand-500" : "border-slate-300")} aria-hidden />
                  <span>
                    <span className="block text-[14px] font-medium text-slate-950">{o.label}</span>
                    <span className="block text-[13px] text-slate-500">{o.detail}</span>
                  </span>
                </button>
              ))}
            </section>
            <aside className="flex h-fit flex-col gap-3 rounded-xl border border-slate-200 p-5 text-[14px]">
              <Gate ok={allPass} text={allPass ? "12 of 12 tests passed" : "Tests must all pass"} />
              <Gate ok text={`Reviewer ${NAMES.reviewer} isn't the author`} />
              <Gate ok={scope === "aurelle" || c.competitorFixed} text="Works for any account's competitors" />
              {live ? (
                <div className="flex items-start gap-2 text-success-700">
                  <Check className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <span>
                    Published for {c.scope === "all" ? "all customers" : "Aurelle Candles"}
                    <span className="block text-[13px] text-slate-500">
                      {TIMES.live} · {NAMES.reviewer}
                    </span>
                  </span>
                </div>
              ) : confirm ? (
                <div className="flex flex-col gap-3 rounded-lg bg-slate-50 p-3">
                  <p className="text-slate-700">{scope === "all" ? "Version 3 goes live for every account. Each sees its own competitors." : `Version 3 goes live for Aurelle. ${NAMES.customer} gets the dashboard and the weekly alert.`}</p>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setCompetition({ stage: "live", scope })} className={PRIMARY}>
                      Publish
                    </button>
                    <button type="button" onClick={() => setConfirm(false)} className={SECONDARY}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button type="button" disabled={!allPass} onClick={() => setConfirm(true)} className={PRIMARY}>
                  Publish
                </button>
              )}
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}

function Gate({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div className={cn("flex items-center gap-2", ok ? "text-slate-950" : "text-slate-500")}>
      {ok ? <Check className="size-4 text-success-700" aria-hidden /> : <X className="size-4 text-slate-400" aria-hidden />}
      {text}
    </div>
  )
}

type R = { t: string; kind: "plain" | "del" | "add" }
export const lines =(s: string): R[] => s.split("\n").map((t) => ({ t, kind: "plain" }))
const del = (s: string): R[] => s.split("\n").map((t) => ({ t, kind: "del" }))
const add = (s: string): R[] => s.split("\n").map((t) => ({ t, kind: "add" }))

export function Code({ title, note, rows }: { title: string; note?: string; rows: R[] }) {
  return (
    <section className="rounded-xl border border-slate-200">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
        <span className="font-mono text-[13px] text-slate-950">{title}</span>
        {note && <span className="text-[13px] text-slate-500">{note}</span>}
      </div>
      <CodeRows rows={rows} />
    </section>
  )
}

function CodeRows({ rows }: { rows: R[] }) {
  let n = 0
  return (
    <div className="overflow-x-auto py-3 font-mono text-[12.5px] leading-[1.7]">
      {rows.map((r, i) => {
        if (r.kind !== "del") n++
        return (
          <div key={i} className={cn("flex", r.kind === "del" && "bg-error-50 text-error-700 line-through", r.kind === "add" && "bg-success-50 text-success-800")}>
            <span className="w-12 shrink-0 pr-4 text-right text-slate-400 select-none">{r.kind === "del" ? "−" : n}</span>
            <span className={cn("pr-5 whitespace-pre", r.kind === "plain" && "text-slate-700")}>{r.t || " "}</span>
          </div>
        )
      })}
    </div>
  )
}
