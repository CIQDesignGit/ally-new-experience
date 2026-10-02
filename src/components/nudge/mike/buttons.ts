// Mike's buttons share one box: height, border, radius, type. Only the fill says which one leads.
// Sized to the CIQ design system Button (default size): 40px tall, 14px medium, 8px corners.
const BUTTON = "inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg border px-4 text-sm font-medium whitespace-nowrap shadow-xs transition-colors disabled:pointer-events-none disabled:opacity-50"

export const PRIMARY = `${BUTTON} border-brand-500 bg-brand-500 text-white hover:border-brand-600 hover:bg-brand-600`
export const SECONDARY = `${BUTTON} border-slate-200 bg-white text-slate-950 hover:border-brand-300 hover:text-brand-700`
