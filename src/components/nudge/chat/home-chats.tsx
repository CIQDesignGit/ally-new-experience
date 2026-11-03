"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AnswerCard, useChat, useChatSource } from "./inline-chat"
import type { Chip } from "./inline-chat"
import type { Person } from "../top-strip"
import { Answer, QUESTIONS } from "../claire/ask-ally-answers"
import { budgetChip, togetherChip } from "../media/answers"
import { aeoChip } from "../cs/aeo-report"
import { launchStatusChip } from "../launch/status"
import { ForwardAnalysis } from "../ops/gap-view"
import { GAP_TREE } from "../ops/gap-data"
import { competitionChips } from "../../competition/michelle"
import { useCompetition } from "../../competition/state"
import { useHarness } from "../../competition/harness"
import { MICHELLE_QUESTIONS, MIKE_QUESTIONS, michelleAnswer, mikeAnswer } from "../ask-ally-personas"
import { PromoAnswer, SAVE_ASK, SaveDashboardAnswer } from "../promo/answers"
import { PROMO_QUESTIONS, PROMO_WIDGETS } from "../promo/data"
import type { PromoWidget } from "../promo/data"
import { PREP_CHIP, RUN_BY_NAME_CHIP } from "../skill/answers"
import { LESSON_CHIP } from "../ops/gap-training"
import { ALERT_ASK, GIFT_QUESTION } from "../alerts/data"
import { GiftAlertAnswer } from "../alerts/answers"
import { RETRO_TASK, StorylineAnswer } from "../retro/storyline-answer"
import { useMvp } from "../mvp"
import { LibraryMatch } from "../library/match"
import { LAUNCH_CHIP } from "../launch/answers"
import { LAUNCH_FILES } from "../launch/data"
import { ASKS, LAST_CALL, PLAN } from "../cs/data"
import { SARAH_TYPED } from "../cs/sarah-asks"
import { TRACK, useRequests } from "../fde/requests"

/**
 * What each person can ask Ally from their home: the starters on their bar,
 * and the questions answered when typed. A home page and a new chat register
 * the same set, so a question works the same in both places.
 */

/** Claire's questions (the views on her page register their own). */
export function ClaireChat() {
  // Four starters; "why is content behind" and "email this summary" still answer when typed.
  const router = useRouter()
  // "How am I doing compared to plan?" is forward-looking: where the week lands and what closes it.
  const planChip: Chip = { q: "How am I doing compared to plan?", match: /\b(make|making|against|compared to|vs\.?|versus|behind|short of|gap to) plan\b/i, render: () => <ForwardAnalysis node={GAP_TREE} onInbox={(id) => router.push(`/michelle?open=${id}`)} /> }
  // The MVP has no media lever: the budget question steps aside for "why is content behind", and asked anyway, Ally says so.
  const mvp = useMvp()
  const answer = (q: (typeof QUESTIONS)[number], hidden: boolean): Chip => ({ q, hidden, render: () => <div className="max-w-[860px] rounded-2xl bg-white px-5 py-4 text-[15px] leading-relaxed text-slate-700 ring-1 ring-slate-200"><Answer q={q} /></div> })
  const contentChip = answer(QUESTIONS[2], !mvp)
  const budget: Chip = mvp
    ? { ...budgetChip("claire"), q: QUESTIONS[0], hidden: true, think: undefined, followUps: [contentChip], render: () => <AnswerCard>Media budgets aren&apos;t in this version of Ally yet, so I can&apos;t split the $500K. Today Ally runs content and ops.</AnswerCard> }
    : { ...budgetChip("claire"), q: QUESTIONS[0] }
  const chips: Chip[] = [
    ...QUESTIONS.map((q, i) => (i === 4 ? planChip : i === 0 ? budget : i === 2 ? contentChip : answer(q, i === 5))),
    // The monthly AI visibility readout: answered when asked, not one of the four starters.
    { ...aeoChip, hidden: true },
    { ...togetherChip, hidden: true },
    launchStatusChip("claire"),
  ]
  useChatSource({ chips }, `home-${mvp}`)
  // A question reopened from Ask Ally's history ("?ask=…") is asked again, once.
  const { ask } = useChat()
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("ask")
    const chip = q && chips.find((c) => c.q === q)
    if (!chip) return
    window.history.replaceState(null, "", window.location.pathname)
    const t = window.setTimeout(() => ask(chip), 400)
    return () => window.clearTimeout(t)
    // Once, on arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}

// Use case 3: three promo answers, each offering the others and "save these as a dashboard".
const SAVE_CHIP: Chip = { q: SAVE_ASK, match: /dashboard/i, render: () => <SaveDashboardAnswer /> }
/** The promo answers, each offering the others; with `save`, also "save these as a dashboard" (not in the borrow harness, where dashboards are built by an engineer). */
function promoChips(save: boolean) {
  const c = Object.fromEntries(PROMO_WIDGETS.map((w) => [w, { q: PROMO_QUESTIONS[w], render: () => <PromoAnswer id={w} /> } as Chip])) as Record<PromoWidget, Chip>
  c["promo-month"].match = /promo(tion)?s?.*(doing|perform|month)/i
  c["promo-badge"].match = /badge/i
  c["promo-vs-brightwick"].match = /(compare|vs|versus).*brightwick|brightwick.*promo/i
  const extra = save ? [SAVE_CHIP] : []
  c["promo-month"].followUps = [c["promo-badge"], c["promo-vs-brightwick"], ...extra]
  c["promo-badge"].followUps = [c["promo-vs-brightwick"], c["promo-month"], ...extra]
  c["promo-vs-brightwick"].followUps = [c["promo-badge"], c["promo-month"], ...extra]
  return c
}
const PROMO_WITH_SAVE = promoChips(true)
const PROMO_NO_SAVE = promoChips(false)

/** Michelle's questions (gap to plan registers its own per node). In a new chat, the competition ask leads. */
export function MichelleChat({ newChat = false }: ChatProps) {
  const competition = useCompetition()
  const mvp = useMvp()
  // Borrow harness: nothing new is built in the product (dashboards, lessons); an engineer does that.
  const borrow = useHarness() === "borrow"
  const PROMO_CHIPS = borrow ? PROMO_NO_SAVE : PROMO_WITH_SAVE
  useChatSource(
    {
      chips: [
        // The competition demo's questions lead while it runs.
        ...competitionChips(competition, newChat, !borrow),
        // Build harness only: she sets the alert herself. On Borrow, alerts are built by the FDE (the tracker request carries its own).
        ...(borrow ? [] : [{ q: ALERT_ASK.q, match: /\b(alert|tell|notify|let) me\b.*(gift|share)/i, think: { ms: 900, label: "Checking your gift-term share" }, render: () => <GiftAlertAnswer /> }]),
        PROMO_CHIPS["promo-month"],
        // An investigation that ends in actions and alerts: its own thread.
        { q: GIFT_QUESTION, match: /gift.?sets?/i, task: "/michelle/c/gift-sets", render: () => null },
        ...(borrow ? [] : [LESSON_CHIP]),
        // Run-by-name first: "open my negotiation prep" means the saved skill, not a new prep.
        // A new task, so a new thread: the negotiation opens in its own conversation.
        { ...RUN_BY_NAME_CHIP, task: "/michelle/c/negotiation?run=1" },
        // Not a starter: Ally has no negotiation playbook to offer until one is taught. Typed, it still opens the thread.
        { ...PREP_CHIP, hidden: true, task: "/michelle/c/negotiation" },
        // Answered when asked, not offered: the bar keeps five starters, one per job.
        ...MICHELLE_QUESTIONS.map((q) => ({ q, hidden: true, render: () => <div className="max-w-[860px] rounded-2xl bg-white px-5 py-4 text-[15px] leading-relaxed text-slate-700 ring-1 ring-slate-200">{michelleAnswer(q)}</div> })),
        // A task, not a question about the brief: it opens its own conversation. The MVP offers the library skill first.
        mvp
          ? { q: RETRO_TASK, match: /recap|prime day (deck|recap)/i, render: () => <LibraryMatch skillId="prime-day-deck" go="/michelle/retro?new=1" goLabel="Start the Prime Day deck" /> }
          : { q: RETRO_TASK, task: "/michelle/retro?new=1", render: () => <StorylineAnswer /> },
        { q: "Claire's Q4 business review", hidden: true, task: "/michelle/decks/qbr?new=1", match: /\b(qbr|business review)\b/i, render: () => null },
        // Gap to plan has its own page; asking for it goes there.
        { q: "Where are we against plan?", task: "/michelle/gap", match: /\b(gap to plan|against plan|behind plan|vs\.? plan|short of plan)\b/i, render: () => null },
        launchStatusChip("michelle"),
      ],
    },
    `inbox-${competition.on}-${competition.stage}-${mvp}-${borrow}-${newChat}`,
  )
  return null
}

/** Mike's questions; answers appear at the end of the page. */
export function MikeChat() {
  useChatSource(
    {
      chips: [LAUNCH_CHIP, ...MIKE_QUESTIONS.map((q, i) => ({ q, hidden: i === 3, match: i === 2 ? /how am i doing|how('s| is| did).*(quarter|content)/i : undefined, render: () => <div className="max-w-[860px] rounded-2xl bg-white px-5 py-4 text-[15px] leading-relaxed text-slate-700 ring-1 ring-slate-200">{mikeAnswer(q)}</div> }))],
      files: LAUNCH_FILES,
    },
    "mike",
  )
  return null
}

/** Sarah's questions: prep opens its own page; the rest answer from the plan and the call. */
export function SarahChat() {
  useChatSource(
    {
      chips: [
        // Typed only, checked first: "launch…" or "prime day…" means the skill, not a question about the call.
        ...SARAH_TYPED,
        aeoChip,
        togetherChip,
        { q: "Prep me for my Aurelle meeting", match: /prep|meeting|session/i, task: "/sarah/prep", render: () => null },
        {
          q: "What did Claire ask for last time?",
          match: /ask(ed)?|last (call|time|week)/i,
          render: () => (
            <AnswerCard>
              <p className="font-semibold text-slate-950">{ASKS.length} asks on the {LAST_CALL.short} call. Ally did all of them; 3 wait for your approval.</p>
              <ul className="mt-2 flex flex-col gap-1 text-[14px]">
                {ASKS.map((c) => (
                  <li key={c.id}>· {c.title}</li>
                ))}
              </ul>
            </AnswerCard>
          ),
        },
        {
          q: "What's due this week?",
          match: /due|owe|this week/i,
          render: () => (
            <AnswerCard>
              <ul className="flex flex-col gap-1 text-[14px]">
                {PLAN[0].items.map((i) => (
                  <li key={i.id}>
                    · <b className="font-semibold text-slate-950">{i.name}</b> · {i.last}
                  </li>
                ))}
              </ul>
            </AnswerCard>
          ),
        },
      ],
    },
    "sarah",
  )
  return null
}

/** What's open in Nora's queue, from the same requests her page shows. */
function OpenAnswer() {
  const { open } = useRequests()
  return (
    <AnswerCard>
      {open.length ? (
        <ul className="flex flex-col gap-1 text-[14px]">
          {open.map((r) => (
            <li key={r.id}>
              · <b className="font-semibold text-slate-950">{r.skill}</b> for {r.from} · due {r.due} · {TRACK[r.step]}
            </li>
          ))}
        </ul>
      ) : (
        <p>Nothing open. Every request so far is published.</p>
      )}
    </AnswerCard>
  )
}

/** What Nora has published, newest first. */
function PublishedAnswer() {
  const { done } = useRequests()
  return (
    <AnswerCard>
      <ul className="flex flex-col gap-1 text-[14px]">
        {done.map((r) => (
          <li key={r.id}>
            · <b className="font-semibold text-slate-950">{r.skill}</b> · v{r.version} · published {r.published} · used in {r.usedIn}
          </li>
        ))}
      </ul>
    </AnswerCard>
  )
}

/** Nora's questions: her queue and what she's shipped. */
export function NoraChat() {
  useChatSource(
    {
      chips: [
        { q: "What's due next?", match: /due|open|next|queue/i, render: () => <OpenAnswer /> },
        { q: "What have I published?", match: /publish|shipped|live|skills/i, render: () => <PublishedAnswer /> },
      ],
    },
    "nora",
  )
  return null
}

/** Where a question set is registered: a new chat offers new asks as starters. */
interface ChatProps {
  newChat?: boolean
}

/** Each person's question set; anyone without one (a vision-only page) gets Michelle's. */
export const HOME_CHAT: Partial<Record<Person, (p: ChatProps) => null>> ={ claire: ClaireChat, michelle: MichelleChat, mike: MikeChat, sarah: SarahChat, nora: NoraChat }
