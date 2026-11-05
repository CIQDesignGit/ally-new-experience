import { WIDGET_INSET } from "@/components/layout/page-frame"

/** Title band for the split inbox + detail widget on doer daily-brief pages. */
export function QueueWidgetHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className={`border-b border-slate-200 ${WIDGET_INSET} py-4`}>
      <h2 className="text-base font-semibold text-slate-950">{title}</h2>
      {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
    </div>
  )
}
