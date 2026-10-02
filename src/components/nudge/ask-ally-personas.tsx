import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { OpenItem } from "./chat/open-item"
import { OPS_BATCHES, fmtValue } from "./data"

/** The urgent ops item, for the "losing sales right now" answer. */
const BUYBOX = OPS_BATCHES.find((b) => b.urgent)!
import { DELIVERED } from "./delivered-periods"

/**
 * Ask Ally chips and answers for Mike, Michelle and the results page. Every
 * number comes from what's on that page, so the answer never disagrees with it.
 */
const N = ({ children }: { children: React.ReactNode }) => <span className="font-mono font-semibold text-slate-950">{children}</span>

function Results({ href = "/content-results?period=qtd" }: { href?: string }) {
  return (
    <Link href={href} className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800">
      See SKU-level results
      <ArrowRight className="size-3.5" />
    </Link>
  )
}

export const MIKE_QUESTIONS = ["What should I approve first?", "What does Ally need from me?", "How did my content do this quarter?", "What's running on autopilot?"] as const

export function mikeAnswer(q: string) {
  if (q === MIKE_QUESTIONS[0])
    return (
      <div>
        <p>
          Your hero SKUs first, one by one: <N>$240K</N> on <N>12</N> Halloween jar candles and <N>$115K</N> on <N>8</N> gift sets. Then the core in one approval each: <N>$305K</N> on <N>394</N> SKUs. All of it expires in 18 days.
        </p>
        <OpenItem batch="halloween" review primary>
          Review the 12 hero SKUs
        </OpenItem>
      </div>
    )
  if (q === MIKE_QUESTIONS[1])
    return (
      <div>
        <p>
          Your Winter Hearth launch creative for <N>3</N> new SKUs (<N>$420K</N>), and <N>58</N> attributes on <N>21</N> SKUs that are blocked from syndication (<N>$140K</N>).
        </p>
        <OpenItem batch="concepts" primary>
          Open the Winter Hearth launch
        </OpenItem>
      </div>
    )
  if (q === MIKE_QUESTIONS[2])
    return (
      <div>
        <p>
          {/* This quarter as every page shows it (Q4 FY26 so far). */}
          <N>{fmtValue(DELIVERED.quarter.content.delivered)}</N> delivered of <N>{fmtValue(DELIVERED.quarter.content.promised)}</N> projected. {DELIVERED.quarter.content.summary[1]}
        </p>
        <Results />
      </div>
    )
  return (
    <div>
      <p>
        <N>$280K</N> this quarter: PIM → PDP fixes (<N>$200K</N>), where Ally fills a blank image, description, bullet or attribute from your PIM, and Halloween updates on tail SKUs (<N>$80K</N>), going live Oct 15.
      </p>
      <OpenItem batch="pim">See what&apos;s on autopilot</OpenItem>
    </div>
  )
}

export const MICHELLE_QUESTIONS = ["What's losing sales right now?", "What does Ally need from me?", "How did ops do this quarter?", "What's running on autopilot?"] as const

export function michelleAnswer(q: string) {
  if (q === MICHELLE_QUESTIONS[0])
    return (
      <div>
        <p>
          Lost buy box on <N>{BUYBOX.skus}</N> SKUs: you&apos;re losing <N>{fmtValue(BUYBOX.perDay ?? 0)}</N> a day, <N>{BUYBOX.value}</N> if Ally fixes it 12 days sooner. Two sellers are pricing below your MAP floor; the escalation to your vendor manager is drafted.
        </p>
        <OpenItem batch="buybox-review" review primary>
          Review the buy box SKUs
        </OpenItem>
      </div>
    )
  if (q === MICHELLE_QUESTIONS[1])
    return (
      <div>
        <p>
          Proof on <N>9</N> chargeback disputes (<N>$350K</N>) and shipped quantities on <N>6</N> shorted POs (<N>$250K</N>). Ally has drafted every claim.
        </p>
        <OpenItem batch="chargebacks" primary>
          Open the chargeback disputes
        </OpenItem>
      </div>
    )
  if (q === MICHELLE_QUESTIONS[2])
    return (
      <div>
        <p>
          <N>{fmtValue(DELIVERED.quarter.ops.delivered)}</N> of leakage prevented of <N>{fmtValue(DELIVERED.quarter.ops.promised)}</N> projected. {DELIVERED.quarter.ops.summary[1]}
        </p>
        <OpenItem batch="promo-badge">Review the promo badges</OpenItem>
      </div>
    )
  return (
    <div>
      <p>
        Promotions that fail to go live, <N>$200K</N> this quarter. Ally fixes the setup and resubmits them: <N>51</N> so far.
      </p>
      <OpenItem batch="promotions">See the promotions on autopilot</OpenItem>
    </div>
  )
}

export const RESULTS_QUESTIONS = ["How is incremental sales measured?", "Why did the travel tin trio lose?", "Which SKUs should get more ad spend?"] as const

export function resultsAnswer(q: string) {
  if (q === RESULTS_QUESTIONS[0])
    return (
      <p>
        Seasonal work is compared with category demand over the same weeks and with each SKU&apos;s usual lead, after adjusting for price, ad spend and
        stockouts. Foundational and retail readiness work is A/B tested against the old content on a 50/50 traffic split.
      </p>
    )
  if (q === RESULTS_QUESTIONS[1])
    return (
      <p>
        It ran out of stock for <N>11</N> days during back to school, so its sales fell <N>6%</N> while category demand grew <N>8%</N>. That cost{" "}
        <N>$15K</N>. Ally now flags SKUs likely to run out 3 weeks before an event.
      </p>
    )
  return (
    <p>
      The <N>3</N> back-to-school SKUs that outgrew the category by the most: the dorm-size mini jar (<N>+6.2</N> pts), the study focus eucalyptus jar (
      <N>+4.1</N>) and the teacher gift set (<N>+3.5</N>).
    </p>
  )
}
