"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { AlertCircle, Check, Loader2, Upload, Wand2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useNudge } from "../nudge-context"
import { useChat, useTurn } from "../chat/inline-chat"
import { AgentRun, DidYouKnow } from "../chat/agent-run"
import type { Attachment, Chip } from "../chat/inline-chat"
import { UploadDialog } from "../chat/upload-dialog"
import { OpenItem } from "../chat/open-item"
import { PRIMARY, SECONDARY } from "../mike/buttons"
import { ASKS_TOTAL, CONTRA, CONTRA_3YR, CONTRA_YEAR, COST_FILE, NARRATIVE, PREP_FILES, PRODUCTS, QUADRANT_LABEL, SKILL, SKILL_STEPS, TAUGHT_STEP, TAUGHT_TOTAL, TARGETS, quadrantOf } from "./data"
import type { Quadrant } from "./data"

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
  const [read, setRead] = useState(false)
  // With last year's files: Ally reads them first, visibly, before it says what it found.
  if (turn?.attach?.length)
    return (
      <div className="flex flex-col gap-4">
      <AgentRun
        title="Reading last year's prep"
        files={[
          { name: PREP_FILES[0].name, size: PREP_FILES[0].size, detail: "14 tabs · 2,140 rows" },
          { name: PREP_FILES[1].name, size: PREP_FILES[1].size, detail: "22 slides" },
        ]}
        steps={["Matched each tab to the slide it fed", "Traced every number back to its source", `Found the ${SKILL_STEPS.length} steps your team ran`, "Checked which data Ally already has", "Flagged the one input Ally can't find"]}
        slow={3}
        onDone={() => setRead(true)}
      />
      {read && <StepsFound />}
      </div>
    )
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
      <p>Amazon&apos;s side is already in Ally. Your side isn&apos;t: step 2 needs your margin by product. Upload your brand margin file and I&apos;ll lay it over Amazon&apos;s.</p>
      <Uploader label="Upload the brand margin file" title="Upload the brand margin file" files={COST_FILE} onDone={(f) => ask(COST_CHIP, undefined, "Here's our FY26 brand margin file.", f)} />
    </div>
  )
}

/** The margin file, read before the skill is drafted from it. */
function MarginRead() {
  const [read, setRead] = useState(false)
  return (
    <div className="flex flex-col gap-4">
    <AgentRun
      title="Reading your brand margin file"
      files={[{ name: COST_FILE[0].name, size: COST_FILE[0].size, detail: "13 product lines · FY26" }]}
      readMs={5000}
      steps={["Matched 13 product lines to Amazon's catalog", "Laid your margin over Amazon's, line by line", "Drafted the skill from the 7 steps"]}
      slow={2}
      onDone={() => setRead(true)}
    />
    {read && <SkillDraft />}
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
      <p>All 13 product lines matched Amazon&apos;s catalog. That fills the gap. Here&apos;s the skill I&apos;d save, so next time you just say the word.</p>
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
          <dd className="text-slate-800">Amazon net PPM and contribution margin · Amazon Ads · last year&apos;s terms · your brand margin file</dd>
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

const RUN_STATUS = ["Pulling net PPM and contribution margin for 13 product lines…", "Laying your margin over Amazon's…", "Reading last year's terms…", "Mapping $96M of volume into the four quadrants…", "Finding the volume stuck where either side loses…", "Testing the contra COGS mix against both margins…", "Building the negotiation deck…"]

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
          void TAUGHT_TOTAL
          void ASKS_TOTAL
          toast.success(`${SKILL.name} is ready · +$${CONTRA_YEAR.toFixed(2)}M a year in better terms`, { position: "top-right" })
        },
        version === 2 ? 450 * steps.length + 500 : 900 * inView + 4200,
      ),
    )
    return () => t.forEach(window.clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const shown = phase === "running" ? step : 3
  return (
    <div className="flex max-w-[980px] flex-col gap-4 text-[15px] leading-relaxed text-slate-700">
      {/* While it runs, "Did you know" sits beside the work; it goes when the results land. */}
      <div className={cn("grid gap-5", phase !== "ready" && "md:grid-cols-[minmax(0,1fr)_280px]")}>
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
          {phase === "running" ? (version === 2 ? "Adding the freight allowance and the two columns…" : RUN_STATUS[Math.min(step, RUN_STATUS.length - 1)]) : phase === "background" ? "This runs in the background for about 10 minutes. Keep working; I'll let you know when it's ready." : `Ran ${steps.length} steps on 12 months of data, 13 product lines and $96M of volume.`}
        </div>
      </div>
      {phase !== "ready" && <DidYouKnow className="self-start" />}
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
  void version
  const [sent, setSent] = useState<string[]>([])
  const send = (k: string, msg: string) => {
    setSent((x) => [...x, k])
    toast.success(msg, { position: "top-right" })
  }
  const share = (q: Quadrant) => Math.round((PRODUCTS.filter((p) => quadrantOf(p) === q).reduce((n, p) => n + p.cogs, 0) / 96) * 100)
  // Where either side loses first, then by volume: that's where the negotiation will go.
  const order: Quadrant[] = ["brand", "loss", "amazon", "win"]
  const rows = [...PRODUCTS].sort((a, b) => order.indexOf(quadrantOf(a)) - order.indexOf(quadrantOf(b)) || b.cogs - a.cogs)
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5">
      <p className="text-[17px] font-semibold text-slate-950">{`Your FY26 AVN prep is ready. ${share("win")}% of your volume is a mutual win; ${share("brand")}% makes money for you but not for Amazon, and that's where the pressure will come.`}</p>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-[13px] font-medium text-slate-950">Portfolio profitability · 13 product lines · $96M shipped COGS</span>
          <span className="text-[12px] text-slate-500">Bubble size is volume</span>
        </div>
        <ShareBar share={share} />
        <Quadrants />
      </div>

      <div>
        <div className="text-[13px] font-medium text-slate-950">By product line</div>
        <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11px] text-slate-500">
                <th className="px-3 py-2 font-medium">Product line</th>
                <th className="px-3 py-2 text-right font-medium">Shipped COGS</th>
                <th className="px-3 py-2 text-right font-medium">Our margin</th>
                <th className="px-3 py-2 text-right font-medium">Amazon net PPM</th>
                <th className="px-3 py-2 text-right font-medium">Ad spend</th>
                <th className="px-3 py-2 font-medium">Quadrant</th>
                <th className="px-3 py-2 font-medium">Main cause</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const q = quadrantOf(p)
                return (
                  <tr key={p.name} className="border-t border-slate-100">
                    <td className="px-3 py-1.5 text-slate-950">{p.name}</td>
                    <td className="px-3 py-1.5 text-right font-mono text-slate-800">{`$${p.cogs.toFixed(1)}M`}</td>
                    <td className={cn("px-3 py-1.5 text-right font-mono", p.brand < TARGETS.brand ? "text-error-600" : "text-slate-800")}>{`${p.brand}%`}</td>
                    <td className={cn("px-3 py-1.5 text-right font-mono", p.ppm < TARGETS.amazon ? "text-error-600" : "text-slate-800")}>{`${p.ppm}%`}</td>
                    <td className="px-3 py-1.5 text-right font-mono text-slate-800">{`$${p.ads}K`}</td>
                    <td className="px-3 py-1.5">
                      <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-slate-700">
                        <i className={cn("size-2 rounded-full", QDOT[q])} /> {QUADRANT_LABEL[q]}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 text-slate-500">{p.cause || "—"}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-1.5 text-[12px] text-slate-500">{`Targets: our margin ${TARGETS.brand}%, Amazon net PPM ${TARGETS.amazon}%. Red is below target.`}</div>
      </div>

      <div>
        <div className="text-[13px] font-medium text-slate-950">Contra COGS: today against what to ask for</div>
        <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11px] text-slate-500">
                <th className="px-3 py-2 font-medium">Term</th>
                <th className="px-3 py-2 text-right font-medium">Today</th>
                <th className="px-3 py-2 text-right font-medium">Recommended</th>
                <th className="px-3 py-2 text-right font-medium">Change</th>
                <th className="px-3 py-2 text-right font-medium">A year</th>
                <th className="px-3 py-2 font-medium">Why</th>
              </tr>
            </thead>
            <tbody>
              {CONTRA.map((c) => (
                <tr key={c.term} className="border-t border-slate-100">
                  <td className="px-3 py-1.5 font-medium text-slate-950">{c.term}</td>
                  <td className="px-3 py-1.5 text-right font-mono text-slate-700">{c.today}</td>
                  <td className="px-3 py-1.5 text-right font-mono text-slate-950">{c.rec}</td>
                  <td className="px-3 py-1.5 text-right font-mono text-slate-700">{c.bps ? `${c.bps > 0 ? "+" : "−"}${Math.abs(c.bps)} bps` : "—"}</td>
                  <td className={cn("px-3 py-1.5 text-right font-mono font-semibold", c.year < 0 ? "text-error-600" : "text-slate-950")}>{c.year ? `${c.year < 0 ? "−" : "+"}${$m(Math.abs(c.year))}` : "—"}</td>
                  <td className="px-3 py-1.5 text-slate-500">{c.note}</td>
                </tr>
              ))}
              <tr className="border-t border-slate-200 bg-slate-25 font-semibold">
                <td className="px-3 py-2 text-slate-950">Net to us</td>
                <td />
                <td />
                <td />
                <td className="px-3 py-2 text-right font-mono text-slate-950">{`+${$m(CONTRA_YEAR)}`}</td>
                <td className="px-3 py-2 text-slate-700">{`$${CONTRA_3YR}M over 3 years, since terms carry forward`}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-brand-200 bg-brand-25 px-4 py-3">
        <div className="flex items-center gap-1.5 text-[12px] font-semibold text-brand-700">
          <Wand2 className="size-3.5" /> How to run the negotiation
        </div>
        <p className="mt-1 text-[14px] text-slate-800">{NARRATIVE}</p>
        <div className="mt-1 text-[11px] text-slate-500">Written from the numbers above only.</div>
      </div>

      <div>
        <div className="text-[13px] font-medium text-slate-950">What to ask Amazon for</div>
        <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <Action n={1} title="A 2% cost increase on the 3 gift and tin lines, with a margin guarantee" sub="Lifts Amazon's net PPM on $18M of volume toward its 25% target, so the pressure comes off the rest.">
            {sent.includes("cost") ? <Done>In the proposal</Done> : <button type="button" onClick={() => send("cost", "Added to the proposal · +2% cost on 3 lines, with a margin guarantee")} className={PRIMARY}>Add to the proposal</button>}
          </Action>
          <Action n={2} title="A 1% growth rebate in place of more co-op" sub="Co-op from 7% to 6%; Amazon earns the 1% back only if we grow 10%.">
            {sent.includes("rebate") ? <Done>Sent to Amazon VM</Done> : <button type="button" onClick={() => send("rebate", "Sent to Amazon VM · growth rebate in place of co-op")} className={PRIMARY}>Send to Dana</button>}
          </Action>
          <Action n={3} title="File the $600K recovery claims" sub="$350K of chargeback disputes and $250K of shorted POs, proof attached. Settle them before terms open.">
            <OpenItem batch="chargebacks">Open the claims</OpenItem>
          </Action>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-[14px]">
        <Link href="/michelle/decks/negotiation?view=deck" className="font-medium text-brand-700 hover:underline">
          Open the negotiation deck
        </Link>
        <span className="text-slate-500">· 5 slides: where the volume sits, the asks, and next steps</span>
      </div>
    </motion.div>
  )
}

const QDOT: Record<Quadrant, string> = { win: "bg-brand-500", amazon: "bg-slate-400", brand: "bg-warning-500", loss: "bg-error-500" }
const QFILL: Record<Quadrant, string> = { win: "#875bf7", amazon: "#94a3b8", brand: "#f89b04", loss: "#ef4444" }

function ShareBar({ share }: { share: (q: Quadrant) => number }) {
  const qs: Quadrant[] = ["win", "amazon", "brand", "loss"]
  return (
    <div className="mt-3">
      <div className="flex h-2.5 overflow-hidden rounded-full">
        {qs.map((q) => (
          <i key={q} className={QDOT[q]} style={{ width: `${share(q)}%` }} />
        ))}
      </div>
      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-slate-600">
        {qs.map((q) => (
          <span key={q} className="flex items-center gap-1.5">
            <i className={cn("size-2 rounded-full", QDOT[q])} />
            {`${QUADRANT_LABEL[q]} ${share(q)}%`}
          </span>
        ))}
      </div>
    </div>
  )
}

/** Our margin across, Amazon's net PPM up, one bubble per product line sized by volume; target lines split the quadrants. */
function Quadrants() {
  const W = 760
  const H = 300
  const pad = { l: 44, r: 16, t: 28, b: 32 }
  const x = (v: number) => pad.l + ((v - 15) / (45 - 15)) * (W - pad.l - pad.r)
  const y = (v: number) => pad.t + ((36 - v) / (36 - 8)) * (H - pad.t - pad.b)
  const r = (c: number) => 5 + Math.sqrt(c) * 4.2
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full" role="img" aria-label="Quadrant chart of 13 product lines by our margin and Amazon net PPM">
      <rect x={x(TARGETS.brand)} y={y(36)} width={x(45) - x(TARGETS.brand)} height={y(TARGETS.amazon) - y(36)} fill="#875bf7" opacity={0.05} />
      <line x1={x(TARGETS.brand)} x2={x(TARGETS.brand)} y1={pad.t} y2={H - pad.b} stroke="#94a3b8" strokeDasharray="4 4" />
      <line x1={pad.l} x2={W - pad.r} y1={y(TARGETS.amazon)} y2={y(TARGETS.amazon)} stroke="#94a3b8" strokeDasharray="4 4" />
      {[
        { t: "Mutual win", x: x(44), y: y(35), a: "end" },
        { t: "Amazon wins, brand weak", x: x(16), y: y(35), a: "start" },
        { t: "Brand wins, Amazon weak", x: x(44), y: y(9), a: "end" },
        { t: "Mutual loss", x: x(16), y: y(9), a: "start" },
      ].map((l) => (
        <text key={l.t} x={l.x} y={l.y} textAnchor={l.a as "start" | "end"} fontSize={11} fill="#94a3b8">
          {l.t}
        </text>
      ))}
      {[20, 25, 30, 35, 40].map((v) => (
        <text key={`x${v}`} x={x(v)} y={H - 12} textAnchor="middle" fontSize={11} fill="#94a3b8" fontFamily="var(--font-mono)">{`${v}%`}</text>
      ))}
      {[10, 15, 20, 25, 30, 35].map((v) => (
        <text key={`y${v}`} x={pad.l - 8} y={y(v) + 4} textAnchor="end" fontSize={11} fill="#94a3b8" fontFamily="var(--font-mono)">{`${v}%`}</text>
      ))}
      <text x={W - pad.r} y={H - 0} textAnchor="end" fontSize={11} fill="#64748b">Our margin →</text>
      <text x={4} y={12} fontSize={11} fill="#64748b">Amazon net PPM ↑</text>
      {PRODUCTS.map((p, i) => {
        const q = quadrantOf(p)
        return (
          <motion.circle key={p.name} cx={x(p.brand)} cy={y(p.ppm)} initial={{ r: 0 }} animate={{ r: r(p.cogs) }} transition={{ delay: i * 0.05, type: "spring", stiffness: 200, damping: 18 }} fill={QFILL[q]} fillOpacity={0.55} stroke={QFILL[q]} strokeWidth={1.5}>
            <title>{`${p.name}: $${p.cogs}M, our margin ${p.brand}%, Amazon net PPM ${p.ppm}%`}</title>
          </motion.circle>
        )
      })}
    </svg>
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
  think: { ms: 2200, label: "Looking for how your team does this…", filesLabel: "Opening the files…" },
  render: () => <PrepAnswer />,
}
const COST_CHIP: Chip = { q: "Here's our FY26 brand margin file.", hidden: true, think: { ms: 900 }, render: () => <MarginRead /> }
const RUN_CHIP: Chip = { q: "Run it for FY26", hidden: true, think: { ms: 1200, label: `Starting ${SKILL.name}…` }, render: () => <RunAnswer /> }
/** Typed by name, the way a saved skill is used. */
export const RUN_BY_NAME_CHIP: Chip = { q: "Open my negotiation prep", hidden: true, match: /open my negotiation prep|run my negotiation/i, think: { ms: 1200, label: `Starting ${SKILL.name}…` }, render: () => <RunByName /> }
