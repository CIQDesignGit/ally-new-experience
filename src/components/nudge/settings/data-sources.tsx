"use client"

import { useState } from "react"
import { Check, Loader2, Lock } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { PRIMARY, SECONDARY } from "../mike/buttons"

type Status = "connected" | "attention" | "off"
type Method = "amazon" | "password" | "warehouse"

interface Source {
  id: string
  name: string
  group: "Retailers" | "Your data"
  feeds: string
  method: Method
  status: Status
  /** Connected: when it last synced. Needs attention: why. */
  note: string
  logo?: string
  mark: string
}

/**
 * Where Ally's numbers come from. Amazon connects through Amazon's own sign-in
 * (Ally never sees the password); portals with no API, like Scintilla and
 * Partners Online, connect with a username and password kept in a vault; a data
 * lake connects by sharing a database. Demo: nothing typed here is kept.
 */
const SEED: Source[] = [
  { id: "vc", name: "Amazon Vendor Central", group: "Retailers", feeds: "Sales, traffic, inventory, POs", method: "amazon", status: "connected", note: "Synced today, 6:00 AM", logo: "/logos/retailer-amazon.png", mark: "a" },
  { id: "ads", name: "Amazon Ads", group: "Retailers", feeds: "Media agent: bids, budgets, search terms", method: "amazon", status: "connected", note: "Synced today, 7:00 AM", logo: "/logos/retailer-amazon.png", mark: "a" },
  { id: "walmart", name: "Walmart Scintilla", group: "Retailers", feeds: "Sales, inventory, search", method: "password", status: "connected", note: "Synced today, 5:30 AM", mark: "W" },
  { id: "target", name: "Target Partners Online", group: "Retailers", feeds: "Sales, inventory", method: "password", status: "attention", note: "Password changed Oct 6 · synced Oct 5", mark: "T" },
  { id: "pim", name: "Salsify PIM", group: "Your data", feeds: "Content agent: product source of truth", method: "password", status: "connected", note: "Synced today, 4:00 AM", logo: "/logos/salsify.png", mark: "S" },
  { id: "lake", name: "Your data lake", group: "Your data", feeds: "Plan, margin, first-party sales", method: "warehouse", status: "off", note: "Snowflake, BigQuery, Databricks or S3", mark: "D" },
]

// Kept for the visit, so leaving and coming back doesn't undo a connection (a refresh resets the demo).
let saved: Source[] | null = null

const STATUS: Record<Status, { label: string; dot: string; text: string }> = {
  connected: { label: "Connected", dot: "bg-success-500", text: "text-success-700" },
  attention: { label: "Needs attention", dot: "bg-warning-500", text: "text-warning-700" },
  off: { label: "Not connected", dot: "bg-slate-300", text: "text-slate-500" },
}

const FIELD = "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-brand-300 focus:ring-2 focus:ring-brand-100"

export function DataSources() {
  const [sources, setSources] = useState<Source[]>(() => saved ?? SEED)
  const [open, setOpen] = useState<string | null>(null)
  const update = (id: string, patch: Partial<Source>) =>
    setSources((all) => {
      const next = all.map((s) => (s.id === id ? { ...s, ...patch } : s))
      saved = next
      return next
    })
  function connected(s: Source) {
    update(s.id, { status: "connected", note: "First sync running · numbers in about an hour" })
    setOpen(null)
    toast.success(`${s.name} connected`, { position: "top-right" })
  }

  return (
    <div className="flex flex-col gap-8">
      {(["Retailers", "Your data"] as const).map((group) => (
        <section key={group} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-6 py-3.5 text-[15px] font-semibold text-slate-950">{group}</div>
          <div className="grid grid-cols-[36px_minmax(0,1fr)_150px_112px] lg:grid-cols-[36px_minmax(0,1fr)_minmax(0,1fr)_200px_112px] items-center gap-4 px-6 pt-3 pb-1 text-xs font-medium text-slate-500">
            <span />
            <span>Source</span>
            <span className="hidden lg:block">Feeds</span>
            <span>Status</span>
            <span />
          </div>
          <div className="px-6 pb-2">
            {sources
              .filter((s) => s.group === group)
              .map((s) => {
                const st = STATUS[s.status]
                const isOpen = open === s.id
                return (
                  <div key={s.id} className="border-t border-slate-100 first:border-t-0">
                    <div className="grid grid-cols-[36px_minmax(0,1fr)_150px_112px] lg:grid-cols-[36px_minmax(0,1fr)_minmax(0,1fr)_200px_112px] items-center gap-4 py-3 text-sm">
                      {s.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element -- a local demo asset
                        <img src={s.logo} alt="" className="size-9 rounded-lg object-contain ring-1 ring-slate-200" />
                      ) : (
                        <span className="flex size-9 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">{s.mark}</span>
                      )}
                      <span className="min-w-0">
                        <span className="block font-medium text-slate-950">{s.name}</span>
                        <span className="block truncate text-[13px] text-slate-500">{s.note}</span>
                      </span>
                      <span className="hidden text-slate-700 lg:block">{s.feeds}</span>
                      <span className={cn("flex items-center gap-1.5 text-[13px] font-medium", st.text)}>
                        <span className={cn("size-1.5 rounded-full", st.dot)} />
                        {st.label}
                      </span>
                      <span className="flex justify-end">
                        {s.status === "connected" ? (
                          <button type="button" onClick={() => toast(`${s.name}: syncing now`, { position: "top-right" })} className="text-[13px] font-medium text-brand-700 hover:underline">
                            Sync now
                          </button>
                        ) : (
                          !isOpen && (
                            <button type="button" onClick={() => setOpen(s.id)} className={cn(s.status === "attention" ? PRIMARY : SECONDARY, "h-9 px-3")}>
                              {s.status === "attention" ? "Reconnect" : "Connect"}
                            </button>
                          )
                        )}
                      </span>
                    </div>
                    {isOpen && <ConnectForm source={s} onCancel={() => setOpen(null)} onDone={() => connected(s)} />}
                  </div>
                )
              })}
          </div>
        </section>
      ))}
      <p className="flex items-center gap-1.5 text-[13px] text-slate-500">
        <Lock className="size-3.5" /> Passwords are stored encrypted and used only to read reports. Amazon connects through Amazon&apos;s sign-in.
      </p>
    </div>
  )
}

/** How a source connects. The values live only in this form: nothing is saved, and they're cleared on connect. */
function ConnectForm({ source, onCancel, onDone }: { source: Source; onCancel: () => void; onDone: () => void }) {
  const [user, setUser] = useState("")
  const [pass, setPass] = useState("")
  const [host, setHost] = useState("")
  const [kind, setKind] = useState("Snowflake")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  function submit(e?: React.FormEvent) {
    e?.preventDefault()
    if (source.method === "password" && (!user.trim() || !pass)) return setError("Enter the username and password for the portal")
    if (source.method === "warehouse" && !host.trim()) return setError(`Enter your ${kind} account`)
    setError("")
    setBusy(true)
    window.setTimeout(() => {
      setUser("")
      setPass("")
      setBusy(false)
      onDone()
    }, 1200)
  }
  return (
    <form onSubmit={submit} autoComplete="off" className="mb-3 ml-[52px] flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-25 px-5 py-4 text-sm">
      {source.method === "amazon" && <p className="text-slate-700">Opens Amazon&apos;s sign-in. You approve read access there; Ally never sees your password.</p>}
      {source.method === "password" && (
        <div className="grid gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-slate-500">Username</span>
            <input value={user} onChange={(e) => setUser(e.target.value)} autoComplete="off" className={FIELD} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-slate-500">Password</span>
            <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} autoComplete="new-password" className={FIELD} />
          </label>
        </div>
      )}
      {source.method === "warehouse" && (
        <div className="grid gap-3 md:grid-cols-[200px_minmax(0,1fr)]">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-slate-500">Warehouse</span>
            <select value={kind} onChange={(e) => setKind(e.target.value)} className={FIELD}>
              {["Snowflake", "BigQuery", "Databricks", "Amazon S3"].map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-slate-500">{kind === "Amazon S3" ? "Bucket" : "Account"}</span>
            <input value={host} onChange={(e) => setHost(e.target.value)} placeholder={kind === "Snowflake" ? "aurelle.us-east-1" : kind === "BigQuery" ? "aurelle-analytics" : kind === "Databricks" ? "aurelle.cloud.databricks.com" : "s3://aurelle-plan"} className={FIELD} />
          </label>
          <p className="text-slate-500 md:col-span-2">Then share the plan and margin tables with CommerceIQ&apos;s account. Ally reads them; it never writes.</p>
        </div>
      )}
      {error && <p className="text-[13px] text-error-600">{error}</p>}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={busy} className={PRIMARY}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : source.method === "amazon" ? null : <Check className="size-4" />}
          {busy ? "Connecting" : source.method === "amazon" ? "Sign in with Amazon" : "Connect"}
        </button>
        <button type="button" onClick={onCancel} className="text-[13px] font-medium text-slate-500 hover:text-slate-800">
          Cancel
        </button>
      </div>
    </form>
  )
}
