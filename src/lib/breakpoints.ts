/**
 * Demo layout thresholds. Keep CSS (@theme sm/md) and JS matchMedia in sync.
 * ~700px separates compact (edge-to-edge) from the comfortable pane chrome.
 */
export const DEMO_LAYOUT_MIN_PX = 700

/** Ally sidebar rail + body offset — same threshold as comfortable layout (~700px). */
export const SIDEBAR_LAYOUT_MIN_PX = DEMO_LAYOUT_MIN_PX

export function minWidthMediaQuery(px: number) {
  return `(min-width: ${px}px)`
}

export const sidebarLayoutMinMediaQuery = minWidthMediaQuery(SIDEBAR_LAYOUT_MIN_PX)
