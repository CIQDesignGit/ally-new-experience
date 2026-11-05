"use client"

import { useEffect, useMemo, useState } from "react"
import { PageShell } from "@/components/layout/page-shell"
import { PageFrame, Widget, WidgetStack } from "@/components/layout/page-frame"
import { AppDrawer } from "@/components/nudge/app-drawer"
import { AskBar, ChatProvider, ChatThread, useChat, useChatSource } from "@/components/nudge/chat/inline-chat"
import { ACTIONS, type Done } from "./data"
import { Hero } from "./hero"
import { Stand } from "./stand"
import { Bridge, type BridgeSelection } from "./bridge"
import { ActionsTable } from "./table"
import { SoFar } from "./so-far"
import { Cards } from "./cards"
import { chips } from "./answers"

/** Ally has already paused the ad it didn't need this week; everything else waits for a person. */
const START: Done = Object.fromEntries(ACTIONS.filter((a) => a.kind === "pause").map((a) => [a.id, true]))

/**
 * AI Commerce, on Claire's page grammar: where she stands in AI answers against the
 * leader, the bridge by input, what to approve by owner (each action one lever across
 * N SKUs, with its exhibit and the questions it wins), what shipped, three cards, and
 * Ask Ally for the rest (the SKU audit, one question on every agent, why the leader
 * wins, what's rising).
 */
export function AiCommerceV2() {
  return (
    <ChatProvider thread={{ where: "AI Commerce", home: "/ai-commerce-v2" }}>
      <Page />
    </ChatProvider>
  )
}

function Page() {
  const [done, setDone] = useState<Done>(START)
  const [filter, setFilter] = useState<BridgeSelection>("all")
  const fix = (id: string) => setDone((d) => ({ ...d, [id]: true }))
  const { ask } = useChat()

  const list = useMemo(() => chips({ done, onFix: fix }), [done])
  useChatSource({ chips: list }, "ai-commerce")

  // A card asks its question in the bar's words, so the answer lands in the thread below.
  const askText = (q: string) => {
    const chip = list.find((c) => c.q === q) ?? list.find((c) => c.match?.test(q))
    if (chip) ask(chip)
    window.setTimeout(() => document.getElementById("ai-commerce-thread")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50)
  }

  useEffect(() => {
    if (filter !== "all") document.getElementById("actions-table")?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [filter])

  return (
    <PageShell className="bg-slate-50">
      <PageFrame>
        <Hero done={done} />
        <WidgetStack>
          <Stand done={done} />
          <Widget>
            <div className="px-12 pt-8 pb-3">
              <div className="font-mono text-xs tracking-wide text-slate-500 uppercase">Where the gaps are</div>
            </div>
            <div className="px-12 pb-10">
              <Bridge done={done} selected={filter} onSelect={setFilter} />
              <div id="actions-table" className="scroll-mt-4">
                <ActionsTable done={done} onFix={fix} filter={filter} onClear={() => setFilter("all")} />
              </div>
            </div>
          </Widget>
          <Widget>
            <SoFar done={done} />
          </Widget>
          <Cards done={done} onAsk={askText} />
        </WidgetStack>
        <div id="ai-commerce-thread" className="scroll-mt-4">
          <ChatThread />
        </div>
        <div className="flex items-center justify-between px-12 pt-6 text-xs text-slate-400">
          <span>Illustrative data. Questions come from retailer search terms and the prompts shoppers put to each agent, asked about 10 times a week; a brand counts as top 3 when it lands there in most runs.</span>
        </div>
      </PageFrame>
      <AppDrawer home="/ai-commerce-v2" />
      <AskBar placeholder="Ask about any question, product or agent" />
    </PageShell>
  )
}
