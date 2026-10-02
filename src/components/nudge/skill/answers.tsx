"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { AlertCircle, Check, Loader2, Upload, Wand2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useNudge } from "../nudge-context"
import { useChat, useTurn } from "../chat/inline-chat"
import type { Attachment, Chip } from "../chat/inline-chat"
import { UploadDialog } from "../chat/upload-dialog"
import { OpenItem } from "../chat/open-item"
import { PRIMARY, SECONDARY } from "../mike/buttons"
import { ASKS, ASKS_TOTAL, COST_FILE, FREIGHT_ASK, PREP_FILES, SKILL, SKILL_STEPS, TAUGHT_STEP, TAUGHT_TOTAL } from "./data"
import { MemorySaved } from "../chat/memory"

/**
 * Use case 8, a skill from past work. Ally asks how the team does it, learns
 * the steps from last year's files, asks for the one missing input, drafts the
 * skill for Michelle to save (only if she wants), then runs it for FY26: a few
 * seconds in view, the rest in the background, and the asks with the actions.
 */

const $m = (v: number) => (v >= 1 ? `$${v.toFixed(2).replace(/0$/, "")}M` : `$${Math.round(v * 1000)}K`)

function Uploader({ label, title, files, onDone }: { label: string; title: string; files: Attachment[]; onDone: (f: Attachment[]) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={cn(PRIMARY, "w-fit")}>
        <Upload className="size-4" /> {label}
      </button>
      {open && (
        <UploadDialog
          title={title}
          files={files}
          onClose={() => setOpen(false)}
          onAttach={(f) => {
            setOpen(false)
            onDone(f)
          }}
        />
      )}
    </>
  )
}

/** Step 1: no playbook yet. With last year's files attached, it shows what it learned. */
function PrepAnswer() {
  const turn = useTurn()
  const { ask } = useChat()
  if (turn?.attach?.length) return <StepsFound />
  return (
    <div className="flex max-w-[640px] flex-col gap-3 text-[15px] leading-relaxed text-slate-700">
      <p>I don&apos;t have a playbook for your Amazon vendor negotiation yet. If you have last year&apos;s prep, upload it and I&apos;ll learn the steps from it.</p>
      <Uploader label="Upload last year's prep" title="Upload last year's prep" files={PREP_FILES} onDone={(f) => ask(PREP_CHIP, undefined, "Here's last year's prep.", f)} />
    </div>
  )
}

/** Step 2: the steps found in last year's work, with the one input it can't find. */
function StepsFound() {
  const { ask } = useChat()
  return (
    <div className="flex max-w-[760px] flex-col gap-4 text-[15px] leading-relaxed text-slate-700">
      <p className="font-semibold text-slate-950">{`Here's how your team prepped last year, in ${SKILL_STEPS.length} steps.`}</p>
      <ol className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {SKILL_STEPS.map((s, i) => (
          <motion.li key={s.text} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.18 }} className={cn("grid grid-cols-[24px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-2.5", i > 0 && "border-t border-slate-100")}>
            <span className="font-mono text-[13px] text-slate-400">{i + 1}</span>
            <span className="text-[14px] text-slate-950">{s.text}</span>
            <span className={cn("flex items-center gap-1.5 text-[12px]", s.ok ? "text-slate-500" : "font-medium text-warning-700")}>
              {s.ok ? <Check className="size-3.5 text-success-600" /> : <AlertCircle className="size-3.5" />}
              {s.ok ? s.source : `${s.source}: missing`}
            </span>
          </motion.li>
        ))}
      </ol>
      <p>I can&apos;t find manufacturing cost by SKU, and step 4 needs it. Upload your cost file and I&apos;ll fill it in.</p>
      <Uploader label="Upload the cost file" title="Upload the cost file" files={COST_FILE} onDone={(f) => ask(COST_CHIP, undefined, "Here's the FY26 cost file.", f)} />
    </div>
  )
}

/** Step 3: the skill, drafted for review. It's stored only if Michelle saves it. */
function SkillDraft() {
  const { skills, saveSkill } = useNudge()
  const { ask } = useChat()
  const [shared, setShared] = useState<"me" | "team" | "account">("me")
  const [decided, setDecided] = useState<"saved" | "skipped" | null>(() => (skills.some((k) => k.id === SKILL.id) ? "saved" : null))
  const who = { me: "Only you", team: "Your team", account: "Everyone at Aurelle" }
  return (
    <div className="flex max-w-[760px] flex-col gap-4 text-[15px] leading-relaxed text-slate-700">
      <p>That fills the gap. Here&apos;s the skill I&apos;d save, so next time you just say the word.</p>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 ring-1 ring-brand-200">
            <Wand2 className="size-4 text-brand-600" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[12px] font-medium text-slate-500">Skill draft</div>
            <div className="text-[17px] font-semibold text-slate-950">{SKILL.name}</div>
            <div className="mt-0.5 text-[14px] text-slate-600">{SKILL.description}</div>
          </div>
        </div>
        <dl className="grid grid-cols-[120px_minmax(0,1fr)] gap-x-4 gap-y-2 px-5 py-4 text-[14px]">
          <dt className="text-slate-500">Say</dt>
          <dd className="font-medium text-slate-950">&ldquo;{SKILL.say}&rdquo;</dd>
          <dt className="text-slate-500">When to use</dt>
          <dd className="text-slate-800">{SKILL.when}</dd>
          <dt className="text-slate-500">Steps</dt>
          <dd className="text-slate-800">
            <ol className="flex flex-col gap-0.5">
              {SKILL_STEPS.map((s, i) => (
                <li key={s.text}>{`${i + 1}. ${s.text}`}</li>
              ))}
            </ol>
          </dd>
          <dt className="text-slate-500">Uses</dt>
          <dd className="text-slate-800">Vendor Central · Ally&apos;s queue · market data · your cost file</dd>
          <dt className="text-slate-500">Time</dt>
          <dd className="text-slate-800">{`${SKILL.before}; now ${SKILL.after}`}</dd>
          <dt className="text-slate-500">Who can use it</dt>
          <dd>
            <span className="inline-flex overflow-hidden rounded-lg border border-slate-200 text-[13px]">
              {(["me", "team", "account"] as const).map((k, i) => (
                <button key={k} type="button" disabled={!!decided} onClick={() => setShared(k)} aria-pressed={shared === k} className={cn("px-3 py-1", i > 0 && "border-l border-slate-200", shared === k ? "bg-slate-100 font-semibold text-slate-950" : "text-slate-600 hover:bg-slate-50")}>
                  {who[k]}
                </button>
              ))}
            </span>
          </dd>
        </dl>
        <div className="flex items-center gap-3 border-t border-slate-100 bg-slate-25 px-5 py-3">
          {decided === "saved" ? (
            <span className="inline-flex items-center gap-1.5 text-[14px] font-medium text-success-700">
              <Check className="size-4" /> {`Saved to your skills · ${who[shared]}`}
            </span>
          ) : decided === "skipped" ? (
            <span className="text-[14px] text-slate-500">Not saved. I&apos;ll still run it this once.</span>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  saveSkill({ id: SKILL.id, name: SKILL.name, shared })
                  setDecided("saved")
                }}
                className={PRIMARY}
              >
                Save skill
              </button>
              <button type="button" onClick={() => setDecided("skipped")} className={SECONDARY}>
                Not now
              </button>
            </>
          )}
        </div>
      </div>
      {decided && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center gap-3">
          <span>Want me to run it now for FY26?</span>
          <button type="button" onClick={() => ask(RUN_CHIP, undefined, "Run it for FY26")} className={PRIMARY}>
            Run it for FY26
          </button>
        </motion.div>
      )}
    </div>
  )
}

const RUN_STATUS = ["Pulling 12 months from Vendor Central…", "Sizing 9 chargebacks and 6 shorted POs…", "Benchmarking co-op and allowances against the category…", "Modeling margin under 3 term scenarios…", "Ranking the asks…", "Building the negotiation deck…"]

/** Step 4: the run. In view for a few seconds, then in the background, then ready. */
function RunAnswer({ version = 1 }: { version?: 1 | 2 }) {
  const steps = version === 2 ? [...SKILL_STEPS.slice(0, 5), { text: TAUGHT_STEP, source: "Taught by you", ok: true }, SKILL_STEPS[5]] : SKILL_STEPS
  const [step, setStep] = useState(0)
  const [phase, setPhase] = useState<"running" | "background" | "ready">("running")
  useEffect(() => {
    // The first run shows 3 steps, then goes to the background; the re-run after teaching only redoes the changed steps.
    const inView = version === 2 ? steps.length : 3
    const t = steps.map((_, i) => window.setTimeout(() => setStep(i + 1), (version === 2 ? 450 : 900) * (i + 1)))
    if (version === 1) t.push(window.setTimeout(() => setPhase("background"), 900 * inView + 300))
    t.push(
      window.setTimeout(
        () => {
          setPhase("ready")
          const total = version === 2 ? TAUGHT_TOTAL : ASKS_TOTAL
          toast.success(`${SKILL.name} is ready · ${version === 2 ? 4 : 3} asks worth $${total.toFixed(2).replace(/0$/, "")}M a year`, { position: "top-right" })
        },
        version === 2 ? 450 * steps.length + 500 : 900 * inView + 4200,
      ),
    )
    return () => t.forEach(window.clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const shown = phase === "running" ? step : 3
  return (
    <div className="flex max-w-[860px] flex-col gap-4 text-[15px] leading-relaxed text-slate-700">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2 text-[14px] font-semibold text-slate-950">
          {phase === "ready" ? <Check className="size-4 text-success-600" /> : <Loader2 className="size-4 animate-spin text-brand-600" />}
          {phase === "ready" ? `${SKILL.name}${version === 2 ? " v2" : ""} · FY26 · done${version === 2 ? "" : " in 10 minutes"}` : `${version === 2 ? "Re-running" : "Running"} ${SKILL.name}${version === 2 ? " v2" : ""} · FY26`}
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <motion.i className="block h-full rounded-full bg-brand-500" animate={{ width: phase === "ready" ? "100%" : phase === "background" ? "48%" : `${(shown / steps.length) * 100}%` }} transition={{ duration: 0.6 }} />
        </div>
        <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-[13px]">
          {steps.map((s, i) => {
            const done = phase === "ready" || i < shown
            const now = phase !== "ready" && i === shown
            return (
              <li key={s.text} className={cn("flex items-center gap-2", done ? "text-slate-800" : now ? "text-slate-950" : "text-slate-400")}>
                {done ? <Check className="size-3.5 shrink-0 text-success-600" /> : now ? <Loader2 className="size-3.5 shrink-0 animate-spin text-brand-600" /> : <i className="size-3.5 shrink-0 rounded-full border border-slate-300" />}
                {s.text}
                {s.source === "Taught by you" && <span className="text-[11px] font-semibold text-brand-700">new</span>}
              </li>
            )
          })}
        </ul>
        <div className="mt-3 text-[13px] text-slate-500">
          {phase === "running" ? (version === 2 ? "Adding the freight allowance and the two columns…" : RUN_STATUS[Math.min(step, RUN_STATUS.length - 1)]) : phase === "background" ? "This runs in the background for about 10 minutes. Keep working; I'll let you know when it's ready." : `Ran ${steps.length} steps on 12 months of data, 412 SKUs and your FY26 costs.`}
        </div>
      </div>

      {phase === "ready" && (
        <>
          {version === 1 && (
            <div className="flex items-center gap-3 text-[12px] font-medium tracking-wide text-slate-400 uppercase">
              <i className="h-px flex-1 bg-slate-200" /> 10 minutes later <i className="h-px flex-1 bg-slate-200" />
            </div>
          )}
          <Results version={version} />
        </>
      )}
    </div>
  )
}

function Results({ version }: { version: 1 | 2 }) {
  const asks = version === 2 ? [...ASKS, FREIGHT_ASK] : ASKS
  const total = version === 2 ? TAUGHT_TOTAL : ASKS_TOTAL
  const fmtTotal = `$${total.toFixed(2).replace(/0$/, "")}M`
  const taught = version === 2
  const [sent, setSent] = useState<string[]>([])
  const send = (k: string, msg: string) => {
    setSent((x) => [...x, k])
    toast.success(msg, { position: "top-right" })
  }
  const newCol = "bg-brand-25"
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
      <p className="text-[17px] font-semibold text-slate-950">{`Your FY26 negotiation prep is ready: ${asks.length} asks worth ${fmtTotal} a year in margin.`}</p>
      <table className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white text-[14px]">
        <thead>
          <tr className="text-left text-[12px] text-slate-500">
            <th className="px-4 py-2 font-medium">Ask</th>
            {taught && <th className={cn("px-3 py-2 text-right font-medium", newCol)}>Last year</th>}
            <th className="px-3 py-2 text-right font-medium">Today</th>
            <th className="px-3 py-2 text-right font-medium">Ask for</th>
            {taught && <th className={cn("px-3 py-2 text-right font-medium", newCol)}>Amazon&apos;s likely counter</th>}
            <th className="px-4 py-2 text-right font-medium">Worth a year</th>
          </tr>
        </thead>
        <tbody>
          {asks.map((a) => (
            <tr key={a.ask} className={cn("border-t border-slate-100 align-top", taught && a.ask === FREIGHT_ASK.ask && "bg-brand-25")}>
              <td className="px-4 py-2.5">
                <div className="font-medium text-slate-950">{a.ask}</div>
                <div className="text-[13px] text-slate-500">{a.why}</div>
              </td>
              {taught && <td className={cn("px-3 py-2.5 text-right font-mono text-slate-600", newCol)}>{a.lastYear}</td>}
              <td className="px-3 py-2.5 text-right font-mono text-slate-700">{a.today}</td>
              <td className="px-3 py-2.5 text-right font-mono text-slate-950">{a.target}</td>
              {taught && <td className={cn("px-3 py-2.5 text-right font-mono text-slate-600", newCol)}>{a.counter}</td>}
              <td className="px-4 py-2.5 text-right font-mono font-semibold text-slate-950">{$m(a.worth)}</td>
            </tr>
          ))}
          <tr className="border-t border-slate-200 bg-slate-25 font-semibold">
            <td className="px-4 py-2 text-slate-950">{`All ${asks.length}`}</td>
            {taught && <td />}
            <td />
            <td />
            {taught && <td />}
            <td className="px-4 py-2 text-right font-mono text-slate-950">{fmtTotal}</td>
          </tr>
        </tbody>
      </table>

      <div>
        <div className="text-[13px] font-medium text-slate-950">What to ask Amazon for</div>
        <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <Action n={1} title="File the $600K recovery claims" sub="$350K of chargeback disputes and $250K of shorted POs, proof attached. Settle them before terms open.">
            <OpenItem batch="chargebacks">Open the claims</OpenItem>
          </Action>
          <Action n={2} title="Ask Dana for a 1.5% damage allowance" sub="12 months of damage at 0.6% against a 3% allowance, with the returns data attached.">
            {sent.includes("damage") ? (
              <Done>Sent to Dana</Done>
            ) : (
              <button type="button" onClick={() => send("damage", "Sent to Dana · damage-allowance case with 12 months of data")} className={SECONDARY}>
                Send to Dana
              </button>
            )}
          </Action>
          <Action n={3} title="Trade a growth commitment for 6% co-op" sub="Commit to 10% more sell-in next year in exchange for co-op at 6%, from 7%.">
            {sent.includes("coop") ? (
              <Done>In the proposal</Done>
            ) : (
              <button type="button" onClick={() => send("coop", "Added to the proposal · 10% more sell-in for 6% co-op")} className={SECONDARY}>
                Add to the proposal
              </button>
            )}
          </Action>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-[14px]">
        <Link href="/michelle/decks/negotiation?view=deck" className="font-medium text-brand-700 hover:underline">
          Open the negotiation deck
        </Link>
        <span className="text-slate-500">· 5 slides: the asks, the case for each, and next steps</span>
      </div>
      {taught && <MemorySaved text={`Skill updated · v2 · now sizes the freight allowance and shows last year and Amazon's counter`} />}
    </motion.div>
  )
}

function Done({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-success-700">
      <Check className="size-3.5" /> {children}
    </span>
  )
}

function Action({ n, title, sub, children }: { n: number; title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className={cn("flex items-center gap-4 px-4 py-3", n > 1 && "border-t border-slate-100")}>
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-50 font-mono text-[12px] font-semibold text-brand-700">{n}</span>
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-semibold text-slate-950">{title}</div>
        <div className="text-[13px] text-slate-500">{sub}</div>
      </div>
      {children}
    </div>
  )
}

/** Run by name once saved; before that, Ally says so. */
function RunByName() {
  const { skills } = useNudge()
  const [has] = useState(() => skills.some((k) => k.id === SKILL.id))
  if (!has)
    return (
      <p className="max-w-[640px] text-[15px] leading-relaxed text-slate-700">
        You don&apos;t have that skill yet. Ask me to prep the vendor negotiation and I&apos;ll learn it from last year&apos;s work.
      </p>
    )
  return <RunAnswer />
}

export const PREP_CHIP: Chip = {
  q: "Prep me for the Amazon vendor negotiation",
  match: /negotiat/i,
  takesFiles: true,
  needsFiles: true,
  think: { ms: 2000, label: "Looking for how your team does this…", filesLabel: "Reading 14 tabs and 22 slides…" },
  render: () => <PrepAnswer />,
}
const COST_CHIP: Chip = { q: "Here's the FY26 cost file.", hidden: true, think: { ms: 2200, label: "Reading the cost file and drafting the skill…" }, render: () => <SkillDraft /> }
const RUN_CHIP: Chip = { q: "Run it for FY26", hidden: true, think: { ms: 1200, label: `Starting ${SKILL.name}…` }, render: () => <RunAnswer /> }
/** Typed by name, the way a saved skill is used. */
export const RUN_BY_NAME_CHIP: Chip = { q: "Open my negotiation prep", hidden: true, match: /open my negotiation prep|run my negotiation/i, think: { ms: 1200, label: `Starting ${SKILL.name}…` }, render: () => <RunByName /> }
