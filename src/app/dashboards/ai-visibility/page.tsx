"use client"

import { Fragment, useState, type ReactNode } from "react"
import { Sparkles, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { PageShell } from "@/components/layout/page-shell"
import { PageFrame } from "@/components/layout/page-frame"
import { TopStrip, useViewer } from "@/components/nudge/top-strip"
import { AppDrawer } from "@/components/nudge/app-drawer"
import { AskBar, ChatProvider, ChatThread } from "@/components/nudge/chat/inline-chat"
import { ExportButton } from "@/components/nudge/ui/export-button"
import { InfoIcon } from "@/components/nudge/ui/info-icon"
import { exportXlsx } from "@/components/competition/exports"
import { AEO, LEADER, LEADERBOARD, LOSING, LOSING_SKUS, TOPICS } from "@/components/nudge/cs/aeo-data"
import { QUESTIONS, RIVALS, TOPIC_QUESTIONS, TREND, type Question } from "@/components/nudge/cs/aeo-dashboard-data"

const HEAD = "text-xs font-medium text-slate-500"
const pts = (v: number) => (v === 0 ? "flat" : `${v > 0 ? "+" : "−"}${Math.abs(v).toFixed(1)} pts`)
const tone = (v: number) => (v > 0 ? "text-success-700" : v < 0 ? "text-error-600" : "text-slate-500")
const moved = (m: number) => (m === 0 ? "—" : m > 0 ? `up ${m}` : `down ${-m}`)

/**
 * AI visibility, as a dashboard from the library: how often Alexa recommends
 * you, your place, which topics and questions moved, and who's ahead. Same
 * numbers as the readout Ally sends; nothing projects value.
 */
export default function AiVisibilityDashboard() {
  const { viewer, home } = useViewer("michelle")
  return (
    <ChatProvider thread={{ where: "AI visibility", home }}>
      <PageShell className="bg-slate-50">
        <PageFrame>
          <TopStrip person={viewer} home={home} crumbs={[{ label: "Home", href: home }, { label: "My dashboards" }, { label: "AI visibility" }]} />
          <Dashboard />
          <ChatThread />
        </PageFrame>
        <AppDrawer />
        <AskBar />
      </PageShell>
    </ChatProvider>
  )
}

/** A section: title, optional info and control, its body, then one line from Ally. */
function Card({ title, info, control, ally, children, className }: { title: string; info?: string[]; control?: ReactNode; ally?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-2xl bg-white p-5 shadow-xs ring-1 ring-slate-200", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-1 text-sm font-semibold text-slate-950">
          {title}
          {info && <InfoIcon title={title} points={info} align="left" />}
        </h2>
        {control}
      </div>
      <div className="mt-4">{children}</div>
      {ally && (
        <div className="mt-4 flex items-start gap-2 border-t border-slate-100 pt-3 text-sm text-slate-700">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-ally-600" aria-hidden />
          <span>{ally}</span>
        </div>
      )}
    </section>
  )
}

/** A small segmented control. */
function Segment<T extends string>({ options, value, onChange }: { options: T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-[13px]">
      {options.map((o) => (
        <button key={o} type="button" aria-pressed={value === o} onClick={() => onChange(o)} className={cn("rounded-md px-3 py-1 font-medium", value === o ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-900")}>
          {o}
        </button>
      ))}
    </div>
  )
}

function Dashboard() {
  const change = +(AEO.visibility - AEO.prevVisibility).toFixed(1)
  const placesDown = AEO.rank - AEO.prevRank
  const losing = TOPICS.filter((t) => t.change < 0).length

  const exportAll = () =>
    exportXlsx("AI-visibility.xlsx", "AI visibility", [
      ["AI visibility", AEO.assistant, `${AEO.period} vs ${AEO.previous}`],
      ["AI visibility (%)", AEO.visibility, "Previous", AEO.prevVisibility],
      ["AI rank", AEO.rank, "Previous", AEO.prevRank],
      [],
      ["Week", ...TREND.map((t) => t.week)],
      ["You (%)", ...TREND.map((t) => t.you)],
      ["Rank", ...TREND.map((t) => t.rank)],
      ...RIVALS.map((r) => [`${r.brand} (%)`, ...r.values]),
      [],
      ["Topic", "You (%)", "Rank", "Change (pts)", `${LEADER} (%)`],
      ...TOPICS.map((t) => [t.topic, t.you, t.rank, t.change, t.leader]),
      [],
      ["Question", "Topic", "Where you appear", "You (%)", "Change (pts)"],
      ...QUESTIONS.map((q) => [q.q, q.topic, q.position, q.you, q.change]),
      [],
      ["Brand", "AI visibility (%)", "Places moved"],
      ...LEADERBOARD.map((b) => [b.brand, b.share, b.moved]),
    ])

  return (
    <>
      <div className="flex items-end justify-between gap-6 px-10 pt-4 pb-6">
        <div>
          <h1 className="text-[28px] leading-tight font-semibold tracking-tight text-slate-950">AI visibility</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
            <span className="size-1.5 rounded-full bg-success-500" aria-hidden />
            {AEO.assistant} · {AEO.period} vs {AEO.previous} · {AEO.questions} questions · updated {AEO.updated}
          </div>
        </div>
        <ExportButton onExport={exportAll} />
      </div>

      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
          <Stat label="AI visibility" value={`${AEO.visibility}%`} delta={pts(change)} bad={change < 0} />
          <Stat label="AI rank" value={`#${AEO.rank}`} delta={`${moved(-placesDown)} ${Math.abs(placesDown) === 1 ? "place" : "places"}`} bad={placesDown > 0} />
          <Stat label="Topics losing ground" value={`${losing}`} unit={` of ${TOPICS.length}`} />
        </div>
        <Trend />
        <Topics />
        <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-5 max-lg:grid-cols-1">
          <Questions />
          <Leaderboard />
        </div>
      </div>
    </>
  )
}

function Stat({ label, value, unit, delta, bad }: { label: string; value: string; unit?: string; delta?: string; bad?: boolean }) {
  return (
    <div className="rounded-2xl bg-white px-5 py-4 shadow-xs ring-1 ring-slate-200">
      <div className={HEAD}>{label}</div>
      <div className="mt-1 font-mono text-[28px] leading-tight font-semibold text-slate-950 tabular-nums">
        {value}
        {unit && <span className="text-base font-medium text-slate-500">{unit}</span>}
      </div>
      {delta && (
        <div className="mt-0.5 text-[13px]">
          <span className={cn("font-mono font-medium", bad ? "text-error-600" : "text-success-700")}>{delta}</span>
          <span className="text-slate-500"> vs {AEO.previous}</span>
        </div>
      )}
    </div>
  )
}

type Line = "AI visibility" | "AI rank" | "Leaders"

/** 12 weeks: your visibility (left axis), your place (right axis, 1 at the top), and the top 3 on request. */
function Trend() {
  const [on, setOn] = useState<Record<Line, boolean>>({ "AI visibility": true, "AI rank": true, Leaders: false })
  const W = 1140
  const H = 240
  const PAD = { l: 44, r: 44, t: 16, b: 28 }
  const x = (i: number) => PAD.l + (i * (W - PAD.l - PAD.r)) / (TREND.length - 1)
  const yv = (v: number) => PAD.t + (1 - v / 30) * (H - PAD.t - PAD.b)
  const yr = (r: number) => PAD.t + ((r - 1) / 9) * (H - PAD.t - PAD.b)
  const path = (vals: number[], y: (v: number) => number) => vals.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ")
  const last = TREND.length - 1
  const peak = TREND.reduce((a, b) => (b.you > a.you ? b : a))
  // The first week the runner-up passed you.
  const passed = TREND.findIndex((t, i) => RIVALS[1].values[i] > t.you)
  const lines: { key: Line; swatch: string }[] = [
    { key: "AI visibility", swatch: "bg-ally-500" },
    { key: "AI rank", swatch: "border-t-2 border-dashed border-brand-600" },
    { key: "Leaders", swatch: "border-t-2 border-dashed border-slate-400" },
  ]
  return (
    <Card
      title="Performance over time"
      info={["Weekly, Monday to Sunday", "Left axis: AI visibility, your share of what Alexa recommends", "Right axis: your place among brands; 1 is the top"]}
      control={
        <div className="flex gap-2">
          {lines.map((l) => (
            <button key={l.key} type="button" aria-pressed={on[l.key]} onClick={() => setOn((s) => ({ ...s, [l.key]: !s[l.key] }))} className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[13px] font-medium", on[l.key] ? "border-slate-300 bg-white text-slate-950" : "border-slate-200 bg-slate-50 text-slate-400")}>
              <span className={cn("inline-block w-4", l.swatch, l.key === "AI visibility" && "h-0.5", !on[l.key] && "opacity-40")} />
              {l.key}
            </button>
          ))}
        </div>
      }
      ally={
        <>
          Peaked at <span className="font-mono">{peak.you}%</span> the week of {peak.week} · {RIVALS[1].brand} passed you {TREND[passed].week} · now <span className="font-mono">{TREND[last].you}%</span>, <span className="font-mono">#{TREND[last].rank}</span>
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`AI visibility from ${TREND[0].you}% to ${TREND[last].you}% over 12 weeks; place #${TREND[last].rank}`}>
        {[0, 10, 20, 30].map((t) => (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={yv(t)} y2={yv(t)} className="stroke-slate-100" />
            <text x={PAD.l - 10} y={yv(t) + 4} textAnchor="end" className="fill-ally-700 text-[11px]">
              {t}%
            </text>
          </g>
        ))}
        {on["AI rank"] &&
          [1, 4, 7, 10].map((r) => (
            <text key={r} x={W - PAD.r + 10} y={yr(r) + 4} className="fill-brand-700 text-[11px]">
              #{r}
            </text>
          ))}
        {on.Leaders &&
          RIVALS.map((r, i) => (
            <g key={r.brand}>
              <path d={path(r.values, yv)} fill="none" className={i ? "stroke-slate-300" : "stroke-slate-400"} strokeWidth={2} strokeDasharray="5 4" />
              <text x={x(last) - 8} y={yv(r.values[last]) - 8} textAnchor="end" className="fill-slate-500 text-[11px]">
                {r.brand} {r.values[last]}%
              </text>
            </g>
          ))}
        {on["AI rank"] && (
          <g>
            <path d={path(TREND.map((t) => t.rank), yr)} fill="none" className="stroke-brand-600" strokeWidth={2} strokeDasharray="6 4" strokeLinejoin="round" />
            <circle cx={x(last)} cy={yr(TREND[last].rank)} r={4.5} className="fill-white stroke-brand-600" strokeWidth={2.5} />
          </g>
        )}
        {on["AI visibility"] && (
          <g>
            <path d={path(TREND.map((t) => t.you), yv)} fill="none" className="stroke-ally-500" strokeWidth={2.5} strokeLinejoin="round" />
            {TREND.map((t, i) => (
              <circle key={t.week} cx={x(i)} cy={yv(t.you)} r={i === last ? 5 : 3} className={i === last ? "fill-white stroke-ally-500" : "fill-ally-500"} strokeWidth={i === last ? 2.5 : 0}>
                <title>{`${t.week}: ${t.you}%, #${t.rank}`}</title>
              </circle>
            ))}
            <text x={x(last) - 10} y={yv(TREND[last].you) - 10} textAnchor="end" className="fill-slate-950 font-mono text-[12px] font-semibold">
              {TREND[last].you}%
            </text>
          </g>
        )}
        {TREND.map((t, i) =>
          // Every other week, ending on the latest.
          i % 2 === last % 2 ? (
            <text key={t.week} x={x(i)} y={H - 6} textAnchor="middle" className="fill-slate-400 text-[11px]">
              {t.week}
            </text>
          ) : null,
        )}
      </svg>
    </Card>
  )
}

/** Your share of a topic, as a ring. */
function Donut({ share }: { share: number }) {
  const r = 36
  const c = 2 * Math.PI * r
  return (
    <svg viewBox="0 0 100 100" className="size-[72px] shrink-0" aria-hidden>
      <circle cx={50} cy={50} r={r} fill="none" strokeWidth={14} className="stroke-slate-100" />
      <circle cx={50} cy={50} r={r} fill="none" strokeWidth={14} className="stroke-ally-500" strokeDasharray={`${(share / 100) * c} ${c}`} transform="rotate(-90 50 50)" />
      <text x={50} y={56} textAnchor="middle" className="fill-slate-950 font-mono text-[18px] font-semibold">
        {share}%
      </text>
    </svg>
  )
}

const where = (q: Question) => (q.position === "Not surfaced" ? "Not surfaced" : `Appeared · #${q.rank}`)

/** Topics as rings, worst move first; open one to see its questions under its row. */
function Topics() {
  const [sort, setSort] = useState<"By movement" | "By share">("By movement")
  const [open, setOpen] = useState<string | null>(null)
  const cols = 3
  const topics = [...TOPIC_QUESTIONS].sort((a, b) => (sort === "By movement" ? a.change - b.change : b.you - a.you))
  const pick = topics.find((t) => t.topic === open)
  const openRow = pick ? Math.floor(topics.indexOf(pick) / cols) : -1
  const worst = [...TOPICS].sort((a, b) => a.change - b.change)[0]
  return (
    <Card
      title="Topics"
      info={["Each ring is your share of what Alexa recommends for that topic", "Open a topic to see its questions"]}
      control={<Segment options={["By movement", "By share"]} value={sort} onChange={setSort} />}
      ally={
        <>
          Most of the drop: {worst.topic.toLowerCase()} (<span className="font-mono text-error-600">{pts(worst.change)}</span>) · {LEADER} leads every topic
        </>
      }
    >
      <div className="grid grid-cols-3 gap-3 max-lg:grid-cols-1">
        {topics.map((t, i) => (
          <Fragment key={t.topic}>
            <button type="button" aria-expanded={open === t.topic} onClick={() => setOpen(open === t.topic ? null : t.topic)} className={cn("flex items-center gap-4 rounded-xl border p-4 text-left transition-colors", open === t.topic ? "border-ally-300 bg-ally-50/60" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50")}>
              <Donut share={t.you} />
              <span className="min-w-0">
                <span className="block font-medium text-slate-950">{t.topic}</span>
                <span className="mt-0.5 block text-[13px] text-slate-500">
                  <span className="font-mono">#{t.rank}</span> · <span className={cn("font-mono font-medium", tone(t.change))}>{pts(t.change)}</span>
                </span>
                <span className="mt-1 block text-[13px] font-medium text-brand-700">
                  {t.questions.length} {t.questions.length === 1 ? "question" : "questions"}
                </span>
              </span>
            </button>
            {pick && Math.floor(i / cols) === openRow && (i % cols === cols - 1 || i === topics.length - 1) && <TopicDetail topic={pick} onClose={() => setOpen(null)} />}
          </Fragment>
        ))}
      </div>
    </Card>
  )
}

function TopicDetail({ topic, onClose }: { topic: (typeof TOPIC_QUESTIONS)[number]; onClose: () => void }) {
  const absent = topic.questions.filter((q) => q.position === "Not surfaced").length
  const skus = topic.questions.reduce((n, q) => n + (q.skus ?? 0), 0)
  const others = +(100 - topic.you - topic.leader).toFixed(1)
  return (
    <div className="col-span-3 rounded-xl border border-ally-200 bg-white p-5 max-lg:col-span-1">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-slate-950">{topic.topic}</h3>
          <div className="mt-0.5 text-[13px] text-slate-500">
            <span className="font-mono">{topic.you}%</span> share · <span className="font-mono">#{topic.rank}</span> · <span className={cn("font-mono", tone(topic.change))}>{pts(topic.change)}</span> vs {AEO.previous}
          </div>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
          <X className="size-4" />
        </button>
      </div>
      <div className="mt-3 flex flex-col">
        {topic.questions.map((q) => (
          <div key={q.q} className="flex items-center justify-between gap-4 border-b border-slate-100 py-2 text-sm last:border-b-0">
            <span className="text-slate-950">{q.q}</span>
            <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium", q.position === "Not surfaced" ? "bg-slate-100 text-slate-500" : "bg-ally-50 text-ally-700")}>{where(q)}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-slate-700">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-ally-500" /> You <span className="font-mono">{topic.you}%</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-slate-500" /> {LEADER} <span className="font-mono">{topic.leader}%</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-slate-200" /> Everyone else <span className="font-mono">{others}%</span>
        </span>
      </div>
      {(absent > 0 || skus > 0) && (
        <div className="mt-3 flex items-start gap-2 border-t border-slate-100 pt-3 text-sm text-slate-700">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-ally-600" aria-hidden />
          <span>
            {absent > 0 && `Not surfaced on ${absent} of ${topic.questions.length}`}
            {absent > 0 && skus > 0 && " · "}
            {skus > 0 && `fixes drafted for ${skus} ${skus === 1 ? "SKU" : "SKUs"}`}
          </span>
        </div>
      )}
    </div>
  )
}

/** Every tracked question: the ones you lost ground on first. */
function Questions() {
  const [show, setShow] = useState<"Losing" | "All" | "Winning">("Losing")
  const lost = new Set(LOSING.map((l) => l.q))
  const rows = show === "Losing" ? QUESTIONS.filter((q) => lost.has(q.q)) : show === "Winning" ? QUESTIONS.filter((q) => q.change > 0) : QUESTIONS
  return (
    <Card
      title="Questions"
      info={["The shopper questions Ally asks Alexa every week", "Losing: the ones you lost ground on since the previous period"]}
      control={<Segment options={["Losing", "All", "Winning"]} value={show} onChange={setShow} />}
      ally={
        <>
          Fixes drafted for <span className="font-mono">{LOSING_SKUS}</span> SKUs on the questions you lost · live Thu, Oct 8
        </>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left">
              <th className={`${HEAD} pb-2`}>Shopper question</th>
              <th className={`${HEAD} pb-2`}>Where you appear</th>
              <th className={`${HEAD} pb-2 text-right`}>You</th>
              <th className={`${HEAD} pb-2 text-right`}>Change</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((q) => (
              <tr key={q.q} className="border-b border-slate-100 align-top last:border-b-0">
                <td className="py-2.5 pr-4">
                  <span className="block text-slate-950">{q.q}</span>
                  <span className="block text-xs text-slate-500">{q.topic}</span>
                </td>
                <td className={cn("py-2.5 pr-4 whitespace-nowrap", q.position === "Not surfaced" ? "text-slate-500" : "text-slate-700")}>
                  {q.position}
                  {q.rank && <span className="ml-1 font-mono text-xs text-slate-400">#{q.rank}</span>}
                </td>
                <td className="py-2.5 text-right font-mono text-slate-950 tabular-nums">{q.you}%</td>
                <td className={cn("py-2.5 pl-4 text-right font-mono whitespace-nowrap tabular-nums", tone(q.change))}>{pts(q.change)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function Leaderboard() {
  const top = LEADERBOARD[0]
  const you = LEADERBOARD.findIndex((b) => b.you)
  const passedYou = LEADERBOARD.slice(0, you).filter((b) => b.moved > 0)
  return (
    <Card
      title={`Top 10 on ${AEO.assistant}`}
      info={["AI visibility across all tracked questions", `Places moved since ${AEO.previous}`]}
      ally={
        <>
          {passedYou.map((b) => b.brand).join(", ")} moved past you · you&apos;re down {-LEADERBOARD[you].moved} to <span className="font-mono">#{you + 1}</span>
        </>
      }
    >
      <div className="flex flex-col">
        {LEADERBOARD.map((b, i) => (
          <div key={b.brand} className={cn("grid grid-cols-[28px_minmax(0,1fr)_72px_52px_56px] items-center gap-2 rounded-md px-2 py-1.5 text-[13px]", b.you && "bg-ally-50")}>
            <span className="font-mono text-slate-400 tabular-nums">#{i + 1}</span>
            <span className={cn("truncate", b.you ? "font-semibold text-slate-950" : "text-slate-700")}>
              {b.brand}
              {b.you ? " (you)" : ""}
            </span>
            <span className="relative h-1.5 rounded-full bg-slate-100">
              <span className={cn("absolute inset-y-0 left-0 rounded-full", b.you ? "bg-ally-500" : "bg-slate-300")} style={{ width: `${(b.share / top.share) * 100}%` }} />
            </span>
            <span className="text-right font-mono text-slate-950 tabular-nums">{b.share.toFixed(1)}%</span>
            <span className={cn("text-right text-xs font-medium", tone(b.moved), b.moved === 0 && "text-slate-400")}>{moved(b.moved)}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
