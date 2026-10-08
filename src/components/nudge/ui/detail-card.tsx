/**
 * The open item in a queue, on a card: the rail is where you find work, the
 * card is where you act on it. Same on every queue page (Mike, Michelle, James, Sarah).
 */
export function DetailCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-w-0 bg-slate-50 p-6">
      <div className="min-w-0 rounded-2xl border border-slate-300 bg-white shadow-md">{children}</div>
    </div>
  )
}
