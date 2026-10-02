import { NextRequest, NextResponse } from "next/server"

interface NudgeRequestBody {
  batchName: string
  description: string
  value: string
  skus?: number
  deadlineDays?: number
  /** Which analyst gets the DM — picks the recipient env var and the queue link. */
  recipient?: "mike" | "michelle"
  /** In-app path the "Open in Ally" button deep-links to. */
  queuePath?: string
  /** The first line, when it isn't "Claire nudged you" (Ally's assignment, Claire's deadline). */
  headline?: string
  /** The due chip, in place of "N days to act". */
  chip?: string
}

const RECIPIENT_ENV: Record<string, string> = {
  mike: "SLACK_MIKE_USER_ID",
  michelle: "SLACK_MICHELLE_USER_ID",
}

const RECIPIENT_NAME: Record<string, string> = {
  mike: "Mike",
  michelle: "Michelle",
}

/**
 * Sends the "Claire nudged you" Slack DM to the right analyst (Mike for content,
 * Michelle for ops). Sent by the Ally bot, never as Claire or the analyst.
 *
 * No SLACK_BOT_TOKEN / recipient id configured → logs the exact payload and
 * reports back gracefully; the nudge button still flips either way.
 */
export async function POST(request: NextRequest) {
  const body = (await request.json()) as NudgeRequestBody
  const recipient = body.recipient ?? "mike"
  const origin = new URL(request.url).origin
  const openInAllyHref = `${origin}${body.queuePath ?? "/mike"}`

  const token = process.env.SLACK_BOT_TOKEN
  const userId =
    process.env[RECIPIENT_ENV[recipient] ?? "SLACK_MIKE_USER_ID"] ??
    // Old name, from before Priya was renamed Michelle: existing .env files keep working.
    (recipient === "michelle" ? process.env.SLACK_PRIYA_USER_ID : undefined)

  const blocks = buildSlackBlocks(body, openInAllyHref, userId)
  const text = body.headline ?? `Claire nudged you on ${body.batchName}${body.deadlineDays ? `. Window closes in ${body.deadlineDays} days.` : "."}`

  if (!token || !userId) {
    console.log(
      `[nudge] SLACK_BOT_TOKEN / ${RECIPIENT_ENV[recipient]} not configured. Would have sent to ${RECIPIENT_NAME[recipient]}:\n`,
      JSON.stringify({ text, blocks }, null, 2),
    )
    return NextResponse.json({ ok: false, reason: "slack-not-configured" })
  }

  try {
    const openRes = await fetch("https://slack.com/api/conversations.open", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ users: userId }),
    })
    const openJson = await openRes.json()
    if (!openJson.ok) {
      console.error("[nudge] conversations.open failed:", openJson.error)
      return NextResponse.json({ ok: false, reason: openJson.error ?? "conversations-open-failed" })
    }

    const channel = openJson.channel.id as string
    const postRes = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ channel, text, blocks }),
    })
    const postJson = await postRes.json()
    if (!postJson.ok) {
      console.error("[nudge] chat.postMessage failed:", postJson.error)
      return NextResponse.json({ ok: false, reason: postJson.error ?? "post-message-failed" })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[nudge] Slack request threw:", err)
    return NextResponse.json({ ok: false, reason: "network-error" })
  }
}

function buildSlackBlocks(body: NudgeRequestBody, openInAllyHref: string, userId: string | undefined) {
  const mention = userId ? `<@${userId}>` : RECIPIENT_NAME[body.recipient ?? "mike"]
  const blocks: Record<string, unknown>[] = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: body.headline ? `${body.headline} ${mention}` : `*Claire* nudged you on *${body.batchName}*${body.deadlineDays ? `. Window closes in ${body.deadlineDays} days.` : "."} ${mention}`,
      },
    },
  ]

  const fields: string[] = []
  if (body.chip) fields.push(`*${body.chip}*`)
  else if (body.deadlineDays) fields.push(`*${body.deadlineDays} days to act*`)
  fields.push(`*${body.value}*${body.skus ? `  ·  ${body.skus} SKUs` : ""}`)

  blocks.push({ type: "section", text: { type: "mrkdwn", text: `*${body.batchName}*\n${body.description}\n\n${fields.join("\n")}` } })
  blocks.push({
    type: "actions",
    elements: [{ type: "button", text: { type: "plain_text", text: "Open in Ally →" }, url: openInAllyHref, style: "primary" }],
  })
  return blocks
}
