/**
 * The open item in a queue, on a card: the rail is where you find work, the
 * card is where you act on it. Same on every queue page (Mike, Michelle, James, Sarah).
 * `flat` when the queue already sits in a Widget: the pane is the card, no card inside it.
 */
export function DetailCard({ children, flat }: { children: React.ReactNode; flat?: boolean }) {
  if (flat) return <div className="min-w-0 bg-white">{children}</div>
  return (
    <div className="min-w-0 bg-slate-50 p-6">
      <div className="min-w-0 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">{children}</div>
    </div>
  )
}
