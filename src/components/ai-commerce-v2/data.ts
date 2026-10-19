/**
 * AI Commerce v2 (paper towels, illustrative, local only).
 *
 * Two kinds of record. A QUESTION is what a shopper asks an agent, with each agent's
 * answer and why we're missing: it's the unit of measurement. An ACTION is one lever
 * applied across N SKUs, owned by one person: it's the unit of work. An action wins
 * questions. Every number on the page derives from these two lists.
 */

export const META = {
  brand: "Brawny",
  category: "Paper towels",
  leader: "Bounty",
  asOf: "Month to Oct 12",
}

/** Where agents answer. ChatGPT and Muse search a retailer or the web; the answer records which. */
export const SURFACES = [
  { id: "amz", name: "Amazon search", source: "search" },
  { id: "wmt", name: "Walmart search", source: "search" },
  { id: "alexa", name: "Alexa for Shopping", source: "agents" },
  { id: "sparky", name: "Walmart Sparky", source: "agents" },
  { id: "chatgpt", name: "ChatGPT", source: "answer" },
  { id: "gemini", name: "Gemini", source: "answer" },
  { id: "muse", name: "Muse", source: "personal" },
] as const
export type SurfaceId = (typeof SURFACES)[number]["id"]

/**
 * The four sources, each with a different evidence standard. Position is measured on all of
 * them (our runs; share of voice tracking on search). Volume is measured only on retail search;
 * elsewhere it's an estimate with a named proxy, or nothing. Dollars inherit the weakest term.
 */
export const SOURCES = [
  { id: "answer", name: "Answer agents", what: "ChatGPT, Gemini, Perplexity, Claude, AI Mode", inAnswer: "Named", volume: { label: "Estimated", text: "1M to 3M questions a month, a wide range", from: "AI referral visits to retailer sites (clickstream panels) ÷ our click rates" }, worth: { kind: "band", band: "High", label: "Modeled" } },
  { id: "agents", name: "Shopping agents", what: "Alexa for Shopping, Walmart Sparky", inAnswer: "Named", volume: { label: "Estimated", text: "About 3M questions a month", from: "Scaled from paid impressions in Amazon's Prompts report; Sparky not yet" }, worth: { kind: "dollars", est: 760, low: 610, high: 930, label: "Estimated" } },
  { id: "search", name: "Retail search", what: "The results agents and shoppers both read", inAnswer: "Top 10", volume: { label: "Measured", text: "20M searches a month", from: "Search Query Performance, Walmart search" }, worth: { kind: "dollars", est: 620, low: 540, high: 700, label: "Measured" } },
  { id: "personal", name: "Personal agents", what: "Muse, Instinct", inAnswer: "Shortlisted", volume: { label: "No volume", text: "Tracked set, 40 questions", from: "Our runs only" }, worth: { kind: "band", band: "Low", label: "Modeled" } },
] as const
export type SourceId = (typeof SOURCES)[number]["id"]
export const surfacesOf = (source: SourceId) => SURFACES.filter((s) => s.source === source).map((s) => s.id as SurfaceId)

/** The five inputs agents check. Four you earn, one you buy. Weights sum to 100. */
export const INPUTS = [
  { id: "findable", name: "Findable", what: "Attributes and page content answer the question", weight: 30 },
  { id: "shoppable", name: "Shoppable", what: "In stock, buy box, price per unit", weight: 20 },
  { id: "trusted", name: "Trusted", what: "Reviews, answered questions, sources that cite you", weight: 15 },
  { id: "unified", name: "Unified", what: "Same facts on every retailer, each retailer's rules met", weight: 15 },
  { id: "promoted", name: "Promoted", what: "Sponsored prompts bought where content can't win yet", weight: 20, paid: true },
] as const
export type InputId = (typeof INPUTS)[number]["id"]

/** The seven levers Ally pulls, each moving one input. Two levers move Findable; two move Trusted. */
export const LEVERS = [
  { id: "attributes", name: "Attributes", input: "findable", owner: "content" },
  { id: "pdp", name: "Product page", input: "findable", owner: "content" },
  { id: "unified", name: "Cross-retailer", input: "unified", owner: "content" },
  { id: "reviews", name: "Reviews", input: "trusted", owner: "content" },
  { id: "citations", name: "Citations", input: "trusted", owner: "content" },
  { id: "promoted", name: "Promote", input: "promoted", owner: "media" },
  { id: "ops", name: "Shelf", input: "shoppable", owner: "ops" },
] as const
export type LeverId = (typeof LEVERS)[number]["id"]
export type Lever = (typeof LEVERS)[number]

/** Amazon's five intent groups (COSMO, SIGMOD 2024), in shopper words. */
export const GROUPS = [
  { id: "function", name: "What it does" },
  { id: "audience", name: "Who it's for" },
  { id: "context", name: "When and where it's used" },
  { id: "kind", name: "What kind of product" },
  { id: "pairs", name: "What shoppers value with it" },
] as const
export type GroupId = (typeof GROUPS)[number]["id"]

export const OURS = ["Brawny Tear-A-Square, 12 Double rolls", "Brawny Pick-A-Size, 6 Triple rolls", "Brawny Shop Towels, 3 rolls"] as const
export type Sku = (typeof OURS)[number]
const TEAR = OURS[0], PICK = OURS[1], SHOP = OURS[2]

const BOUNTY = "Bounty Select-A-Size, 12 Double rolls"
const BOUNTY_E = "Bounty Essentials, 8 rolls"
const VIVA = "Viva Multi-Surface Cloth, 6 Big rolls"
const GV = "Great Value Ultra Strong, 12 Double rolls"
const SPARKLE = "Sparkle Pick-A-Size, 6 Double rolls"
const SCOTT = "Scott Choose-A-Sheet, 6 Mega rolls"
const BASICS = "Amazon Basics, 12 rolls"
const SCOTT_SHOP = "Scott Shop Towels, 10 pack"
const ZEP = "Zep Shop Towels, 3 rolls"
const SEVENTH = "Seventh Generation, 6 rolls"
const MARCAL = "Marcal 100% Recycled, 12 rolls"

export type Autonomy = "approval" | "input" | "autopilot"

/** One lever across N SKUs, owned by one person. */
export type Action = {
  id: string
  lever: LeverId
  /** The row: what Ally will do, in one line. */
  text: string
  /** Two words for a summary of a person's actions. */
  tag: string
  skus: number
  autonomy: Autonomy
  kind?: "content" | "shelf" | "pause" | "buy"
  /** Measured 4 weeks after shipping: sales change on the fixed SKUs vs 20 matched control SKUs. Illustrative. */
  lift?: { fixed: number; control: number }
  /** For a paid move: the monthly spend it starts or stops. */
  spend?: number
}

export const ACTIONS: Action[] = [
  { id: "attributes", lever: "attributes", tag: "Attributes", text: "Fill ply, septic-safe and sheet count on 14 SKUs on Walmart and Kroger, from your product data and what the top 20 fill in", skus: 14, autonomy: "approval" },
  { id: "pdp", lever: "pdp", tag: "Price per sheet", text: "Put sheet count and price per 100 sheets in the title on 6 SKUs, so agents compute value from the truth", skus: 6, autonomy: "approval", lift: { fixed: 6.8, control: 1.1 } },
  { id: "unified", lever: "unified", tag: "One record", text: "One product record, rendered to each retailer's rules: Walmart's 75-character title, Kroger's pack count, on 9 SKUs", skus: 9, autonomy: "autopilot" },
  { id: "reviews", lever: "reviews", tag: "Reviews", text: "Claim what 2,300 reviewers already say about wet strength, and ask your review partner for reviews on pet messes, on 4 SKUs", skus: 4, autonomy: "approval" },
  { id: "citations", lever: "citations", tag: "Citations", text: "Pitch the three sources ChatGPT cites for paper towels, and get your buying guide indexed", skus: 3, autonomy: "input" },
  { id: "thanks", lever: "promoted", tag: "Thanksgiving prompt", text: "Buy the Alexa sponsored prompt for Thanksgiving hosting now; hand it back to organic when the page ranks", skus: 3, autonomy: "approval", kind: "buy", spend: 12 },
  { id: "spills", lever: "promoted", tag: "Spills ad", text: "Pause the Alexa sponsored prompt on big spills, where you're already #2 organically", skus: 1, autonomy: "autopilot", kind: "pause", spend: 9 },
  { id: "shelf", lever: "ops", tag: "Buy box, stock", text: "Win back the Amazon buy box on Tear-A-Square and restock Pick-A-Size at Kroger", skus: 2, autonomy: "autopilot", kind: "shelf", lift: { fixed: 4.2, control: 0.9 } },
]
export const actionOf = (id: string) => ACTIONS.find((a) => a.id === id)!
export const leverOf = (a: Action): Lever => LEVERS.find((l) => l.id === a.lever)!

/** One agent's answer to one question: the top 3 it named, which retailer or sources it used, and where we sit if not in the top 3. */
export type Answer = { list: string[]; via?: string; demand: number; oursBeyond?: number }

export type Question = {
  id: string
  text: string
  group: GroupId
  answers: Partial<Record<SurfaceId, Answer>>
  /** Which inputs fail for our best product where we're not in the top 3. Empty with no action = a fair loss. */
  fails: InputId[]
  /** The leader's failing inputs where the leader is not in the top 3. */
  leaderFails?: InputId[]
  /** One line, in shopper words, on why the agent left us out. */
  why?: string
  sku?: Sku
  /** The action that wins it, and where we land afterwards (past 3 = named, deeper in the list). */
  action?: string
  after?: Partial<Record<SurfaceId, number>>
  trend?: string
  notRelevant?: string
}

export const QUESTIONS: Question[] = [
  // Attributes: filtered out before the ranking starts.
  {
    id: "ply",
    text: "2-ply select-a-size paper towels, septic safe",
    group: "kind",
    answers: {
      amz: { list: [BOUNTY, SPARKLE, SCOTT], demand: 900, oursBeyond: 14 },
      wmt: { list: [GV, SPARKLE, SCOTT], demand: 700, oursBeyond: 22 },
      alexa: { list: [BOUNTY, SPARKLE, SCOTT], demand: 540 },
      sparky: { list: [GV, SPARKLE, SCOTT], demand: 460 },
      chatgpt: { list: [BOUNTY, GV, SPARKLE], via: "Walmart", demand: 300 },
    },
    fails: ["findable"],
    why: "Ply and septic-safe are empty on Walmart and Kroger. 19 of the top 20 fill them, and the agent filters on them before it ranks.",
    sku: TEAR,
    action: "attributes",
    after: { amz: 6, wmt: 8, alexa: 2, sparky: 4, chatgpt: 4 },
  },
  {
    id: "sheets",
    text: "Paper towels with the most sheets per pack",
    group: "kind",
    answers: {
      alexa: { list: [BASICS, SCOTT, SPARKLE], demand: 380 },
    },
    fails: ["findable"],
    why: "Sheet count isn't a field on your Amazon listing, so the agent can't sort you in. Scott carries 1,200 sheets as a backend attribute.",
    sku: PICK,
    action: "attributes",
    after: { alexa: 3 },
  },
  // Product page: the title does double duty, and the agent does the math.
  {
    id: "value",
    text: "Restock paper towels for my dorm. Best value.",
    group: "kind",
    answers: {
      wmt: { list: [GV, BASICS, SPARKLE], demand: 1100, oursBeyond: 9 },
      sparky: { list: [GV, BASICS, SPARKLE], demand: 840, oursBeyond: 6 },
      chatgpt: { list: [GV, BOUNTY_E, SPARKLE], via: "Walmart", demand: 420 },
      gemini: { list: [GV, BOUNTY_E, SPARKLE], via: "Walmart", demand: 260 },
      muse: { list: [GV, BOUNTY_E, BASICS], via: "Walmart", demand: 300, oursBeyond: 34 },
    },
    fails: ["findable"],
    why: "Your title says 12 Double rolls and no sheet count, so ChatGPT computes price per sheet from regular rolls and reads you 2x too expensive. Great Value's title carries 132 sheets.",
    sku: TEAR,
    action: "pdp",
    after: { wmt: 4, sparky: 3, chatgpt: 4, gemini: 5, muse: 5 },
    trend: "Up 3x this month",
  },
  // Cross-retailer: one product, three titles, two pack counts.
  {
    id: "quarter",
    text: "Paper towels with quarter sheets",
    group: "function",
    answers: {
      amz: { list: [TEAR, BOUNTY, SPARKLE], demand: 400 },
      wmt: { list: [SPARKLE, GV, SCOTT], demand: 520, oursBeyond: 31 },
      sparky: { list: [SPARKLE, GV, SCOTT], demand: 420 },
      chatgpt: { list: [BOUNTY, SPARKLE, SCOTT], via: "Walmart", demand: 260 },
      alexa: { list: [TEAR, BOUNTY, SPARKLE], demand: 330 },
    },
    fails: ["unified"],
    why: "Walmart's 75-character title rule cut “Tear-A-Square, quarter sheets” from the title, so on Walmart the agent can't see the one thing this product does. Amazon still has it, and you're #1 there.",
    sku: TEAR,
    action: "unified",
    after: { wmt: 7, sparky: 2, chatgpt: 4 },
  },
  // Reviews: shoppers already say it; the page doesn't.
  {
    id: "wet",
    text: "Which paper towels hold up when wet without falling apart?",
    group: "function",
    answers: {
      amz: { list: [BOUNTY, VIVA, SPARKLE], demand: 1500, oursBeyond: 6 },
      alexa: { list: [BOUNTY, VIVA, SPARKLE], demand: 620, oursBeyond: 9 },
      chatgpt: { list: [BOUNTY, VIVA, GV], via: "Amazon", demand: 480 },
      gemini: { list: [BOUNTY, VIVA, SCOTT], via: "Amazon", demand: 300 },
      sparky: { list: [GV, SPARKLE, VIVA], demand: 380 },
    },
    fails: ["trusted"],
    why: "2,300 reviews praise wet strength and no bullet claims it. The agent reads the page, not the reviews. Bounty's bullet 1 says it, with a footnote.",
    sku: TEAR,
    action: "reviews",
    after: { amz: 3, alexa: 2, chatgpt: 4, gemini: 4 },
  },
  {
    id: "pets",
    text: "Best paper towels for cleaning up after a dog",
    group: "audience",
    answers: {
      amz: { list: [BOUNTY, VIVA, SCOTT], demand: 800, oursBeyond: 12 },
      alexa: { list: [BOUNTY, VIVA, SCOTT], demand: 520 },
      chatgpt: { list: [BASICS, VIVA, SCOTT], via: "Amazon", demand: 320 },
      gemini: { list: [BOUNTY, VIVA, SCOTT], via: "Amazon", demand: 200 },
    },
    fails: ["trusted"],
    why: "You chose pet messes as an intent to own. You have 40 reviews on it; Bounty has 1,100. Ally puts your 410 pet mentions on the page and asks your review partner for more.",
    sku: TEAR,
    action: "reviews",
    after: { amz: 5, alexa: 3, gemini: 6 },
  },
  // Citations: the answer is built from sources, and you're in none of them.
  {
    id: "experts",
    text: "Which paper towels do experts recommend?",
    group: "pairs",
    answers: {
      chatgpt: { list: [BOUNTY, VIVA, SCOTT], via: "Wirecutter, Good Housekeeping, Reddit", demand: 520 },
      gemini: { list: [BOUNTY, SCOTT, VIVA], via: "Good Housekeeping, Wirecutter", demand: 340 },
    },
    fails: ["trusted"],
    why: "ChatGPT built this answer from three sources. Bounty is in all three; you're in none. The sources are what the agent trusts, more than the page.",
    sku: TEAR,
    action: "citations",
    after: { chatgpt: 3, gemini: 3 },
  },
  // Promote: time-boxed demand the page can't catch in time.
  {
    id: "thanks",
    text: "Paper towels for a Thanksgiving crowd, multipack",
    group: "context",
    answers: {
      amz: { list: [SPARKLE, BASICS, SCOTT], demand: 300, oursBeyond: 18 },
      alexa: { list: [SPARKLE, BASICS, SCOTT], demand: 260 },
      sparky: { list: [GV, SPARKLE, BASICS], demand: 220 },
    },
    fails: ["promoted"],
    leaderFails: ["findable"],
    why: "Thanksgiving is five weeks out and this question is up 2x. The page fix takes three weeks to re-index. The sponsored prompt is open, and nobody has bought it.",
    sku: TEAR,
    action: "thanks",
    after: { alexa: 2 },
    trend: "Up 2x this month",
  },
  {
    id: "spills",
    text: "Paper towels that soak up big spills fast",
    group: "function",
    answers: {
      alexa: { list: [BOUNTY, TEAR, VIVA], demand: 900 },
      sparky: { list: [GV, PICK, SPARKLE], demand: 700 },
    },
    fails: ["promoted"],
    why: "You're #2 organically on Alexa and still buying the sponsored prompt for it.",
    sku: TEAR,
    action: "spills",
    after: {},
  },
  // Shelf: recommended, then skipped at the click.
  {
    id: "stock",
    text: "Paper towels, 12 pack, delivered today",
    group: "kind",
    answers: {
      amz: { list: [BOUNTY, BASICS, SPARKLE], demand: 600, oursBeyond: 4 },
      alexa: { list: [BOUNTY, BASICS, SPARKLE], demand: 480, oursBeyond: 5 },
      sparky: { list: [GV, SPARKLE, TEAR], demand: 360 },
    },
    fails: ["shoppable"],
    why: "Tear-A-Square lost the Amazon buy box on Oct 3 to a third-party seller at $31.99. The agent verifies price and seller on the live page, then skips it.",
    sku: TEAR,
    action: "shelf",
    after: { alexa: 2 },
  },
  {
    id: "reorder",
    text: "Reorder my paper towels from Kroger",
    group: "pairs",
    answers: {
      muse: { list: [BOUNTY, SPARKLE], via: "Kroger", demand: 220 },
    },
    fails: ["shoppable"],
    why: "Pick-A-Size shows low stock at Kroger, so Muse drops it from the shortlist and buys the next one.",
    sku: PICK,
    action: "shelf",
    after: { muse: 2 },
  },
  // Where you already win, and fair losses: the baseline.
  {
    id: "kitchen",
    text: "Strong paper towels for the kitchen",
    group: "context",
    sku: PICK,
    answers: {
      amz: { list: [BOUNTY, PICK, VIVA], demand: 1200 },
      alexa: { list: [BOUNTY, PICK, VIVA], demand: 500 },
    },
    fails: [],
  },
  {
    id: "garage",
    text: "Shop towels for oil and solvents in the garage",
    group: "context",
    sku: SHOP,
    answers: {
      chatgpt: { list: [SHOP, SCOTT_SHOP, ZEP], via: "Amazon", demand: 220 },
      alexa: { list: [SHOP, SCOTT_SHOP, ZEP], demand: 160 },
    },
    fails: [],
  },
  {
    id: "repeat",
    text: "Buy the paper towels I usually get if the price is good",
    group: "pairs",
    sku: TEAR,
    answers: {
      muse: { list: [BOUNTY, TEAR], via: "Amazon", demand: 260 },
    },
    fails: [],
  },
  {
    id: "brand",
    text: "Brawny 12 pack, price per roll",
    group: "kind",
    sku: TEAR,
    answers: {
      amz: { list: [TEAR, PICK], demand: 600 },
      wmt: { list: [TEAR, PICK], demand: 300 },
      alexa: { list: [TEAR, PICK], demand: 240 },
      sparky: { list: [TEAR, PICK], demand: 200 },
    },
    fails: [],
  },
  {
    id: "cheap",
    text: "Cheapest paper towels per sheet",
    group: "kind",
    answers: {
      wmt: { list: [GV, BASICS, SCOTT], demand: 900, oursBeyond: 8 },
      sparky: { list: [GV, BASICS, SCOTT], demand: 560, oursBeyond: 8 },
      chatgpt: { list: [GV, BASICS, BOUNTY_E], via: "Walmart", demand: 300 },
    },
    fails: [],
    why: "At $1.55 per 100 sheets you're 38% above Great Value. A fair loss; Ally won't buy this question.",
    sku: TEAR,
  },
  {
    id: "recycled",
    text: "Recycled or sustainable paper towels",
    group: "pairs",
    answers: {
      chatgpt: { list: [SEVENTH, MARCAL, SCOTT], via: "Amazon", demand: 260 },
      alexa: { list: [SEVENTH, MARCAL, SCOTT], demand: 160 },
    },
    fails: [],
    notRelevant: "No Brawny product fits. Nothing to fix.",
  },
]

/* ---------- Derivations ---------- */

export const isOurs = (name: string) => name.startsWith(META.brand)
export const isLeader = (name: string) => name.startsWith(META.leader)

/** Our position in an answer: 1 to 3 if named, the deeper rank if known, else null (not named). */
export const position = (a: Answer, who: (n: string) => boolean = isOurs): number | null => {
  const i = a.list.findIndex(who)
  if (i >= 0) return i + 1
  return who === isOurs ? (a.oursBeyond ?? null) : null
}

/** In the answer: named by the agent, or on page one of retail search. */
export const top3 = (a: Answer, who: (n: string) => boolean = isOurs) => {
  const p = position(a, who)
  return p !== null && p <= 10
}

/** The answer after the action ships: we're asked again and land at `after`. */
export const afterFix = (q: Question, s: SurfaceId, a: Answer): Answer => {
  const at = q.after?.[s]
  const cur = position(a)
  if (!at || (cur !== null && cur <= at)) return a
  // Past the top 3: the agent now names us, deeper in its list.
  if (at > 3) return { ...a, oursBeyond: at }
  const list = a.list.filter((n) => !isOurs(n))
  list.splice(at - 1, 0, q.sku ?? OURS[0])
  return { ...a, list: list.slice(0, 3), oursBeyond: undefined }
}

/** Which actions have shipped, by action id. */
export type Done = Record<string, boolean>
export const isFixed = (q: Question, done: Done) => !!q.action && !!done[q.action]

/** Every (question, surface) answer, after any shipped action. `sku` narrows to one product's questions. */
export const pairs = (done: Done, sku?: Sku) =>
  QUESTIONS.filter((q) => !sku || q.sku === sku).flatMap((q) =>
    (Object.entries(q.answers) as [SurfaceId, Answer][]).map(([s, a]) => ({ q, s, a: isFixed(q, done) ? afterFix(q, s, a) : a, fixed: isFixed(q, done) })),
  )

export const totalDemand = QUESTIONS.reduce((t, q) => t + Object.values(q.answers).reduce((u, a) => u + a.demand, 0), 0)

/** Share of AI answers: demand of answers where the brand is top 3 ÷ all demand. */
export const share = (done: Done, who: (n: string) => boolean = isOurs, surface?: SurfaceId, sku?: Sku) => {
  const ps = pairs(done, sku).filter((p) => !surface || p.s === surface)
  const all = ps.reduce((t, p) => t + p.a.demand, 0)
  const won = ps.filter((p) => top3(p.a, who)).reduce((t, p) => t + p.a.demand, 0)
  return all ? Math.round((won / all) * 100) : 0
}

/** Which inputs fail on one answer. Organic inputs fail only where we're not top 3; Promoted can fail while we win. */
const failsOn = (q: Question, a: Answer, fixed: boolean, who: (n: string) => boolean): InputId[] => {
  const list = who === isOurs ? q.fails : (q.leaderFails ?? [])
  if (fixed) return []
  return list.filter((i) => i === "promoted" || !top3(a, who))
}

/** Each input's score: demand-weighted share of answers where the input is met. */
export const inputScores = (done: Done, who: (n: string) => boolean = isOurs, sku?: Sku) => {
  const ps = pairs(done, sku)
  const all = ps.reduce((t, p) => t + p.a.demand, 0) || 1
  return Object.fromEntries(
    INPUTS.map((i) => {
      const lost = ps.filter((p) => failsOn(p.q, p.a, p.fixed, who).includes(i.id)).reduce((t, p) => t + p.a.demand, 0)
      return [i.id, Math.round(100 * (1 - lost / all))]
    }),
  ) as Record<InputId, number>
}

/** AI Commerce Score: the five input scores, weighted. */
export const score = (done: Done, who: (n: string) => boolean = isOurs, sku?: Sku) => {
  const s = inputScores(done, who, sku)
  return Math.round(INPUTS.reduce((t, i) => t + (s[i.id] * i.weight) / 100, 0))
}

/**
 * Sales that started with AI this month, modeled ($K): rank converts to sales through click
 * rate by position and conversion at the retailer. Illustrative; the method sits in the footnote.
 */
export const SALES = { est: 1400, low: 1000, high: 1900 }

/** What a point of share of voice is worth, and the gap to the leader in dollars. Defined below the share-of-voice math. */
export let perPoint = (done: Done): number => SALES.est / Math.max(share(done), 1)
export let opportunity = (done: Done): number => Math.round(((share(done, isLeader) - share(done)) * perPoint(done)) / 10) * 10

/** The demand an action is missing from today, and the demand it wins once shipped. */
export const questionsOf = (a: Action) => QUESTIONS.filter((q) => q.action === a.id)
export const lostDemand = (q: Question) => (Object.values(q.answers) as Answer[]).filter((a) => !top3(a)).reduce((t, a) => t + a.demand, 0)
export const actionDemand = (a: Action) => questionsOf(a).reduce((t, q) => t + lostDemand(q), 0)
export const actionWins = (a: Action) => questionsOf(a).reduce((t, q) => t + (Object.entries(q.answers) as [SurfaceId, Answer][]).filter(([s, x]) => !top3(x) && top3(afterFix(q, s, x))).reduce((u, [, x]) => u + x.demand, 0), 0)

/** Actions ranked by the demand they're missing from; a pause ranks by what it saves. */
export const TO_WIN = [...ACTIONS].sort((x, y) => actionDemand(y) - actionDemand(x))

export const money = (k: number) => (k >= 1000 ? `$${(k / 1000).toFixed(1)}M` : `$${Math.round(k)}K`)

/** Who does the work. */
export type Owner = { lever: "content" | "ops" | "media"; name: string }
export const OWNERS: Record<Owner["lever"], Owner> = { content: { lever: "content", name: "Mike" }, ops: { lever: "ops", name: "Michelle" }, media: { lever: "media", name: "James" } }
export const ownerOf = (a: Action): Owner => OWNERS[leverOf(a).owner]

/** The input an action is credited to. */
export const creditedInput = (a: Action): InputId => leverOf(a).input

/** Demand one approval from live: the open actions, in demand we're missing from. */
export const openDemand = (done: Done) => TO_WIN.filter((a) => !done[a.id]).reduce((t, a) => t + actionDemand(a), 0)

/* ---------- Where you stand: visibility, share of voice, rank ---------- */

/** The brand a product name belongs to. */
export const brandOf = (n: string) => (["Great Value", "Amazon Basics", "Seventh Generation", "Taste of the Wild"].find((b) => n.startsWith(b)) ?? n.split(" ")[0])

const pairsOn = (done: Done, surfaces?: SurfaceId[]) => pairs(done).filter((p) => !surfaces || surfaces.includes(p.s))

/** AI visibility: the answers you're in, out of all answers on these surfaces. Counted, not weighted. */
export const visibility = (done: Done, who: (n: string) => boolean = isOurs, surfaces?: SurfaceId[]) => {
  const ps = pairsOn(done, surfaces)
  const inAnswer = ps.filter((p) => top3(p.a, who)).length
  return { in: inAnswer, of: ps.length, pct: ps.length ? Math.round((inAnswer / ps.length) * 100) : 0 }
}

/** Position weight: 1st = 1, 2nd = ½, 3rd = ⅓ … */
const w = (pos: number) => 1 / pos

/** Share of voice by brand across these surfaces: each brand's position weight ÷ all position weight. */
export const voices = (done: Done, surfaces?: SurfaceId[]) => {
  const total: Record<string, number> = {}
  let all = 0
  for (const p of pairsOn(done, surfaces)) {
    p.a.list.forEach((n, i) => {
      total[brandOf(n)] = (total[brandOf(n)] ?? 0) + w(i + 1)
      all += w(i + 1)
    })
    // Named past the top 3: counted at its position, up to page one.
    if (p.a.oursBeyond && p.a.oursBeyond <= 10 && !p.a.list.some(isOurs)) {
      total[META.brand] = (total[META.brand] ?? 0) + w(p.a.oursBeyond)
      all += w(p.a.oursBeyond)
    }
  }
  return Object.entries(total)
    .map(([brand, v]) => ({ brand, pct: all ? Math.round((v / all) * 100) : 0 }))
    .sort((x, y) => y.pct - x.pct)
}
export const sov = (done: Done, brand = META.brand, surfaces?: SurfaceId[]) => voices(done, surfaces).find((v) => v.brand === brand)?.pct ?? 0
/** Your rank among brands by share of voice. */
export const brandRank = (done: Done, surfaces?: SurfaceId[]) => {
  const vs = voices(done, surfaces)
  return { rank: vs.findIndex((v) => v.brand === META.brand) + 1, of: vs.length, leader: vs[0]?.brand ?? META.leader }
}

/** Where an answer engine's links go: the retailer each answer searched, weighted by demand. */
export const linkSplit = (done: Done, surfaces: SurfaceId[]) => {
  const total: Record<string, number> = {}
  let all = 0
  for (const p of pairsOn(done, surfaces)) {
    const via = p.a.via
    if (!via || via.includes(",")) continue
    total[via] = (total[via] ?? 0) + p.a.demand
    all += p.a.demand
  }
  return Object.entries(total)
    .map(([retailer, v]) => ({ retailer, pct: all ? Math.round((v / all) * 100) : 0 }))
    .sort((x, y) => y.pct - x.pct)
}

/** Illustrative movement since last month's runs, per source. */
export const TRENDS: Record<SourceId, string> = {
  search: "Flat since September",
  agents: "Up 2 answers since September",
  answer: "Down 1 answer since September",
  personal: "New this month",
}

perPoint = (done: Done) => SALES.est / Math.max(sov(done), 1)
opportunity = (done: Done) => Math.round(((sov(done, META.leader) - sov(done)) * perPoint(done)) / 10) * 10

/** The bridge: share of voice today, then the points each input adds if its open actions ship, to where every action takes you. */
export const bridge = (done: Done) => {
  const today = sov(done)
  const all = Object.fromEntries(ACTIONS.map((a) => [a.id, true]))
  let acc = { ...done }
  const steps = INPUTS.map((i) => {
    const as = TO_WIN.filter((a) => !done[a.id] && creditedInput(a) === i.id)
    const before = sov(acc)
    acc = { ...acc, ...Object.fromEntries(as.map((a) => [a.id, true])) }
    return { input: i, points: sov(acc) - before, actions: as.length }
  })
  return { today, steps, end: sov(all) }
}
