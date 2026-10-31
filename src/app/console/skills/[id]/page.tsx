"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowRight, Check, FileCode } from "lucide-react"
import { cn } from "@/lib/utils"
import { ConsoleShell } from "@/components/competition/console-shell"
import { Code, lines } from "@/components/competition/console"
import { LIVE_SKILLS } from "@/components/competition/skills"
import { NAMES } from "@/components/competition/data"

type Tab = "skill" | "tests"

/** A live skill on Aurelle's account: its SKILL.md, the tests it passed, and where Michelle uses it. */
export default function LiveSkillPage() {
  const { id } = useParams<{ id: string }>()
  const s = LIVE_SKILLS.find((k) => k.id === id)
  const [tab, setTab] = useState<Tab>("skill")
  if (!s) {
    return (
      <ConsoleShell>
        <div className="px-10 py-16 text-[15px] text-slate-500">
          No skill here.{" "}
          <Link href="/console/skills" className="text-brand-700 hover:underline">
            All skills
          </Link>
        </div>
      </ConsoleShell>
    )
  }

  return (
    <ConsoleShell crumbs={[{ label: "Skills", href: "/console/skills" }, { label: s.name }]}>
      <header className="px-10 pt-4">
        <div className="text-[13px] text-slate-500">{NAMES.account}</div>
        <h1 className="mt-1 text-[28px] leading-tight font-semibold tracking-tight text-slate-950">{s.name}</h1>
        <div className="mt-1 flex items-center gap-2 text-[14px] text-slate-500">
          <span className="size-1.5 rounded-full bg-success-500" aria-hidden />
          Live · version {s.version} · author {s.author} · reviewer {NAMES.reviewer}
        </div>
      </header>

      <div role="tablist" className="mt-5 flex gap-6 border-b border-slate-200 px-10">
        {(["skill", "tests"] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} type="button" onClick={() => setTab(t)} className={cn("-mb-px border-b-2 py-3 text-[14px] font-medium", tab === t ? "border-brand-500 text-brand-700" : "border-transparent text-slate-500 hover:text-slate-900")}>
            {{ skill: "Skill", tests: "Tests" }[t]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_300px] gap-6 px-10 pt-6 pb-16 max-lg:grid-cols-1">
        {tab === "skill" ? (
          <Code title="SKILL.md" rows={lines(s.skill)} />
        ) : (
          <section className="h-fit rounded-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
              <span className="text-[15px] font-semibold text-slate-950">
                {s.tests.length} of {s.tests.length} passed
              </span>
              <span className="text-[13px] text-slate-500">Before publishing version {s.version} · production data</span>
            </div>
            <ul className="divide-y divide-slate-100">
              {s.tests.map((t) => (
                <li key={t.name + t.customer} className="grid grid-cols-[minmax(0,1fr)_140px_110px] items-center gap-4 px-5 py-3 text-[14px]">
                  <span className="text-slate-950">{t.name}</span>
                  <span className="text-slate-700">{t.customer}</span>
                  <span className="flex items-center gap-1.5 text-success-700">
                    <Check className="size-4" aria-hidden /> Passed
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <aside className="flex h-fit flex-col gap-4 rounded-xl border border-slate-200 p-5 text-[14px]">
          <Fact label="Started by" value={s.trigger} />
          <Fact label="Published" value={`${s.published} · for Aurelle Candles`} />
          <Fact label="Last run" value={s.lastRun} />
          <div>
            <div className="text-[13px] text-slate-500">Files</div>
            <ul className="mt-1 flex flex-col gap-1">
              {s.files.map((f) => (
                <li key={f} className="flex items-center gap-2 font-mono text-[13px] text-slate-700">
                  <FileCode className="size-3.5 text-slate-400" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <Link href={s.usedBy.href} className="inline-flex items-center gap-1 font-medium text-brand-700 hover:underline">
            See it in Ally: {s.usedBy.label} <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </aside>
      </div>
    </ConsoleShell>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[13px] text-slate-500">{label}</div>
      <div className="mt-0.5 text-slate-950">{value}</div>
    </div>
  )
}
