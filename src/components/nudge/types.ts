export type AgentId = "content" | "ops" | "media"

/** Which specific nudge button was clicked. Only the two "content" keys page a real Slack DM to Mike. */
export type NudgeKey =
  | "approval-content"
  | "approval-ops"
  | "approval-media"
  | "team-content"
  | "team-ops"
  | "team-media"

export interface TierRow {
  agent: AgentId
  /** Empty for autopilot rows (no human owner). */
  analystName: string
  description: string
  value: string
  /** Present only on rows that have a Nudge button (autopilot rows have none). */
  nudgeKey?: NudgeKey
  /** Warning chip shown under the owner — the deadline lives on the row it belongs to, not the tier header. */
  deadline?: string
  /** Where the owner stands on this week's Monday email: not started, or in progress with how far along. */
  weekly?: { state: "not-started" | "in-progress" | "done"; progress?: string }
  /** The same row as numbers, for ranking across buckets (open value in $M; days until the deadline). */
  valueM?: number
  days?: number
}

/** Title-case agent label for the "Mike Content" owner line. */
export const AGENT_LABEL: Record<AgentId, string> = {
  content: "Content",
  ops: "Ops",
  media: "Media",
}

export interface BatchChange {
  /** What the agent changed, e.g. "Added \"Halloween\" to the title". */
  text: string
  /** Optional supporting detail, e.g. the specific keywords. */
  detail?: string
  /** How many SKUs in the batch got this change — the scope signal. */
  skus: number
}

export interface Batch {
  /** A seed batch id, or a policy part of one ("halloween-review", "halloween-auto"). */
  id: string
  /** How this part ships under the review policy; unset on unsplit batches. */
  mode?: import("./policy").ReviewMode
  /** What the work is, for readers outside the content team ("Halloween title and image update"). */
  fixName?: string
  /** Why a part is separate, shown after the type: "Hero", "Tail". */
  partLabel?: string
  /** Which of Claire's buckets it sits in, so Mike's inbox groups the same way her page does. */
  tier: "approval" | "input" | "autopilot"
  /** The kind of content work, as Claire's page names it. */
  type: "Seasonal" | "Foundational" | "Retail readiness"
  /** ISO date the value expires, when it does. */
  deadline?: string
  /** SKUs by revenue tier and the fields the changes touch, for the review policy. */
  split?: import("./policy").TierSplit
  /** For "Needs your input" batches: how many SKUs need Mike's input (the Review button's count). */
  inputSkus?: number
  /** What Ally needs (input) or is doing (autopilot), shown in place of the approve button; toast fires when inputs are sent. */
  need?: { text: string; toast: string; cta?: string }
  /** Under the bulk approve: why it's safe, e.g. "None of these are hero SKUs." */
  reassure?: string
  /** Heading over the changes list; defaults to "What Ally changed". */
  changesTitle?: string
  name: string
  chip: string
  /** Where the item came from, before anyone nudges. */
  nudgeSource: string
  /** Claire's nudge for this item; once sent, the source reads "Nudged by Claire, just now". */
  nudgeKey?: NudgeKey
  skus: number
  reviewMinutes: number
  value: string
  approveSkus: number
  approveValue: number
  doneLabel: string
  rationale: string
  exampleSkuId: string
  before: string
  after: string
  changes: BatchChange[]
  /** The "See all N SKUs" expand list — one entry per real SKU shown, first one is exampleSkuId. */
  skuRows: SkuRow[]
}

export interface SkuTextSection {
  kind: "text"
  label: string
  live: string[]
  /** Segments already split into kept/changed so the pane can style the new parts. */
  draft: { text: string; changed?: boolean }[]
}

export interface SkuImageSection {
  kind: "image"
  label: string
  liveLabel: string
  draftLabel: string
}

/** A field Ally can't fill on its own: what's live today, and a box for Mike's input. */
export interface SkuInputSection {
  kind: "input"
  label: string
  live: string
  placeholder: string
}

/** The Halloween background Mike picks or uploads; Ally places the product on it. */
export interface SkuBackgroundSection {
  kind: "background"
  label: string
  liveLabel: string
}

export type SkuSection = SkuTextSection | SkuImageSection | SkuInputSection | SkuBackgroundSection

export interface SkuRow {
  skuId: string
  sections: SkuSection[]
}

export type Period = "week" | "month" | "quarter" | "year"

export interface InflightData {
  /** Fiscal name shown in the switcher, e.g. "Q3 FY26". */
  name: string
  /** Revenue to date, e.g. "$37M". */
  ptd: string
  /** e.g. "quarter to date". */
  ptdLabel: string
  /** Plan attainment, e.g. "95%". */
  plan: string
  /** e.g. "share flat at 18.6%". */
  share: string
}

export type ClosedGrain = "month" | "quarter" | "year"

export interface ClosedPeriodData {
  name: string
  total: string
  media: string
  content: string
  ops: string
  mediaStory: string
  contentStory: string
  opsStory: string
}
