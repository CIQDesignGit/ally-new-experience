/**
 * The drill-down under the waterfall runs edge to edge in its widget: it cancels
 * the widget's px-10 / pb-10 so it reads as the chart's lower half, not a card in a card.
 */
export const PANEL = "-mx-10 -mb-10 mt-8 border-t border-slate-200"
/** The panel's title: stage name and summary on white, like a section title above the table. */
export const PANEL_HEAD = "border-b border-slate-100 px-10 pt-5 pb-3"
/** Column labels: same band as joint plan and RunList (12px medium slate-500 on slate-25). */
export const PANEL_COLS = "border-b border-slate-100 bg-slate-25 px-10 py-2 text-xs font-medium text-slate-500"
export const PANEL_BODY = "px-10 pb-5"
