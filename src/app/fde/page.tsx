"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Check, Inbox } from "lucide-react"
import { cn } from "@/lib/utils"
import { PageShell } from "@/components/layout/page-shell"
import { Avatar, TopStrip } from "@/components/nudge/top-strip"
import { AppDrawer } from "@/components/nudge/app-drawer"
import { AskBar, ChatProvider, ChatThread } from "@/components/nudge/chat/inline-chat"
import { NoraChat } from "@/components/nudge/chat/home-chats"
import { TRACK, useRequests, type DoneRequest, type OpenRequest } from "@/components/nudge/fde/requests"
import { ResetDemoButton } from "@/components/nudge/reset-demo-button"

/**
 * Nora's home: what customers asked Ally for that no skill answered yet. Each
 * open request shows who asked, by when, where it stands and the one next step;
 * done ones are the skills she published, now in every customer's library.
 */
export default function RequestsPage() {
  return (
    <ChatProvider thread={{ where: "Requests", home: "/fde" }}>
      <NoraChat />
      <PageShell className="bg-slate-50 xl:bg-white">
        <div className="mx-auto max-w-[1280px] overflow-clip bg-white shadow-pane-lg sm:my-6 sm:rounded-2xl sm:ring-1 sm:ring-slate-900/6 xl:my-0 xl:rounded-none xl:shadow-none xl:ring-0">
          <TopStrip person="nora" greeting="Hi Nora" />
          <Requests />
          <ChatThread />
          {/* Demo-only, the same Reset as Michelle's: the next run starts from her asking. Room below for the Ask Ally bar. */}
          <div className="flex justify-end px-10 pb-24 opacity-50 hover:opacity-100">
            <ResetDemoButton />
          </div>
        </div>
        <AppDrawer />
        <AskBar />
      </PageShell>
    </ChatProvider>
  )
}

function Requests() {
  const { open, done } = useRequests()
  const [show, setShow] = useState<"open" | "done">("open")
  return (
    <div className="flex flex-col gap-6 px-10 pt-4 pb-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-[28px] leading-tight font-semibold tracking-tight text-slate-950">Requests</h1>
        <div role="tablist" className="flex rounded-lg border border-slate-200 bg-slate-25 p-1">
          {(["open", "done"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={show === t}
              onClick={() => setShow(t)}
              className={cn("flex items-center gap-2 rounded-md px-3.5 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-300", show === t ? "bg-white text-slate-950 shadow-xs ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-800")}
            >
              {t === "open" ? "Open" : "Done"}
              <span className="font-mono text-xs text-slate-500 tabular-nums">{t === "open" ? open.length : done.length}</span>
            </button>
          ))}
        </div>
      </div>
      {show === "open" ? open.length ? open.map((r) => <RequestCard key={r.id} r={r} />) : <Empty onDone={() => setShow("done")} published={done.length} /> : <DoneList rows={done} />}
    </div>
  )
}

/** One open request: who asked and by when, the ask in their words, where it stands, and the one next step. */
function RequestCard({ r }: { r: OpenRequest }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white">
      <div className="flex items-start justify-between gap-6 px-6 pt-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[13px] text-slate-500">
            <span className="font-mono text-slate-700">{r.id}</span>
            <span className="text-slate-300">·</span>
            {r.account}
            <span className="text-slate-300">·</span>
            Asked {r.asked}
          </div>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">{r.skill}</h2>
        </div>
        {/* A promise to a customer: amber when it's due within a day, the color for what needs action soon. */}
        <span title={r.dueAt} className={cn("shrink-0 pt-0.5 text-[13px] whitespace-nowrap", r.soon ? "font-medium text-warning-700" : "text-slate-500")}>
          Due {r.due}
        </span>
      </div>

      <figure className="mx-6 mt-4 flex gap-3 rounded-lg bg-slate-25 px-4 py-3.5">
        <Avatar person="michelle" className="size-8 shrink-0" />
        <div className="min-w-0">
          <figcaption className="text-[13px] font-medium text-slate-950">{r.from}</figcaption>
          <blockquote className="mt-0.5 text-[15px] leading-relaxed text-slate-700">&ldquo;{r.ask}&rdquo;</blockquote>
          {r.terms && <div className="mt-1.5 text-[13px] text-slate-500">{r.terms}</div>}
        </div>
      </figure>

      {/* The same steps the customer sees on her tracker. */}
      <ol className="mx-6 mt-5 grid grid-cols-5 gap-2">
        {TRACK.map((t, i) => (
          <li key={t} className="flex flex-col gap-1.5">
            <span className={cn("h-1 rounded-full", i < r.step ? "bg-success-500" : i === r.step ? "bg-brand-300" : "bg-slate-200")} aria-hidden />
            <span className={cn("flex items-center gap-1 text-[13px]", i < r.step ? "text-slate-950" : i === r.step ? "font-medium text-brand-700" : "text-slate-400")}>
              {i < r.step && <Check className="size-3.5 text-success-700" aria-hidden />}
              {t}
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-5 flex items-center justify-between gap-4 border-t border-slate-100 px-6 py-4">
        <span className={cn("text-[13px]", r.failing ? "font-medium text-error-600" : "text-slate-500")}>{r.status}</span>
        <Link href={r.next.href} className="inline-flex h-11 items-center gap-1.5 rounded-lg bg-brand-500 px-4 text-[15px] font-semibold text-white transition-colors hover:bg-brand-600">
          {r.next.label} <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </article>
  )
}

function Empty({ published, onDone }: { published: number; onDone: () => void }) {
  // Says what's empty and where the finished work is, nothing else.
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-200 px-6 py-14 text-center">
      <span className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <Inbox className="size-5" aria-hidden />
      </span>
      <div className="mt-3 text-[15px] font-semibold text-slate-950">No open requests</div>
      <button type="button" onClick={onDone} className="mt-3 text-sm font-medium text-brand-700 hover:underline">
        See {published} done
      </button>
    </div>
  )
}

const DONE_COLS = "grid grid-cols-[minmax(0,1fr)_150px_110px_70px_200px] items-center gap-4"

/** Requests that became skills, newest first: what each does, who asked, when it shipped, where it's live for the customer. */
function DoneList({ rows }: { rows: DoneRequest[] }) {
  return (
    <section className="rounded-xl border border-slate-200">
      <div className={cn(DONE_COLS, "border-b border-slate-200 px-5 py-2.5 text-xs font-medium text-slate-500")}>
        <span>Skill</span>
        <span>Asked by</span>
        <span>Published</span>
        <span>Version</span>
        <span>Live in</span>
      </div>
      <ul className="divide-y divide-slate-100">
        {rows.map((r) => (
          <li key={r.id}>
            <Link href={r.href} className={cn(DONE_COLS, "px-5 py-4 text-[14px] hover:bg-slate-50")}>
              <span className="min-w-0">
                <span className="block font-medium text-slate-950">{r.skill}</span>
                <span className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-slate-500">{r.does}</span>
              </span>
              <span className="text-[13px] text-slate-700">{r.from}</span>
              <span className="text-[13px] text-slate-700">{r.published}</span>
              <span className="font-mono text-[13px] text-slate-700">v{r.version}</span>
              <span className="text-[13px] text-slate-700">{r.usedIn}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
