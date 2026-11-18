/** Mock Business overview — matches classic CommerceIQ demo (Nov 9–15, 2026). */

export const DATE_RANGE = "Nov 09, 2026 – Nov 15, 2026"
export const COMPARE_RANGE = "Nov 02, 2026 – Nov 08, 2026"
export const DATA_THROUGH = "Nov 15, 2026"
export const DATA_AVAILABLE_FROM = "Apr 10, 2018"

export const DEFAULT_DATE_PRESET = "Last 7 Days"
export const DEFAULT_COMPARE_PRESET = "Previous Period"

export type Kpi = {
  id: string
  label: string
  value: string
  changePct: number
  /** Key on each row in `CHART_SERIES` for this metric's trend. */
  chartKey: keyof Omit<ChartRow, "day">
  chartColor: string
  /** Drives the left or right Y axis when this metric is plotted. */
  axis: "currency" | "count"
  defaultOnChart?: boolean
}

export type ChartRow = {
  day: string
  ops: number
  shippedRev: number
  unitsOrd: number
  unitsShip: number
  adSpend: number
  adSales: number
  glanceViews: number
  roas: number
}

/** Chart-only hues — distinct from success, error, warning, and brand tokens. */
export const KPIS: Kpi[] = [
  { id: "ops", label: "Ordered product sales (OPS)", value: "$3.66M", changePct: 1.36, chartKey: "ops", chartColor: "#64748b", axis: "currency" },
  { id: "shipped-rev", label: "Shipped revenue", value: "$3.58M", changePct: -1.29, chartKey: "shippedRev", chartColor: "#78716c", axis: "currency" },
  {
    id: "units-ord",
    label: "Units ordered",
    value: "377.52K",
    changePct: 0.59,
    chartKey: "unitsOrd",
    chartColor: "#e879f9",
    axis: "count",
    defaultOnChart: true,
  },
  { id: "units-ship", label: "Units shipped", value: "370.73K", changePct: -1.94, chartKey: "unitsShip", chartColor: "#c084fc", axis: "count" },
  {
    id: "ad-spend",
    label: "Ad spend",
    value: "$134.05K",
    changePct: 2.16,
    chartKey: "adSpend",
    chartColor: "#38bdf8",
    axis: "currency",
    defaultOnChart: true,
  },
  { id: "ad-sales", label: "Ad sales", value: "$431.26K", changePct: -11.18, chartKey: "adSales", chartColor: "#818cf8", axis: "currency" },
  { id: "glance-views", label: "Glance views", value: "1.28M", changePct: 3.42, chartKey: "glanceViews", chartColor: "#2dd4bf", axis: "count" },
  { id: "roas", label: "ROAS", value: "3.21", changePct: -4.2, chartKey: "roas", chartColor: "#a78bfa", axis: "currency" },
]

export const MAX_CHART_METRICS = 2

export const CHART_SERIES: ChartRow[] = [
  { day: "9 Nov", ops: 3.52, shippedRev: 3.48, unitsOrd: 54.2, unitsShip: 53.1, adSpend: 19.12, adSales: 0.462, glanceViews: 178, roas: 3.28 },
  { day: "10 Nov", ops: 3.49, shippedRev: 3.51, unitsOrd: 53.4, unitsShip: 52.8, adSpend: 18.94, adSales: 0.451, glanceViews: 176, roas: 3.25 },
  { day: "11 Nov", ops: 3.44, shippedRev: 3.46, unitsOrd: 51.8, unitsShip: 51.2, adSpend: 18.74, adSales: 0.438, glanceViews: 172, roas: 3.19 },
  { day: "12 Nov", ops: 3.47, shippedRev: 3.43, unitsOrd: 51.03, unitsShip: 50.6, adSpend: 18.82, adSales: 0.429, glanceViews: 169, roas: 3.15 },
  { day: "13 Nov", ops: 3.58, shippedRev: 3.52, unitsOrd: 55.1, unitsShip: 54.4, adSpend: 19.28, adSales: 0.448, glanceViews: 181, roas: 3.22 },
  { day: "14 Nov", ops: 3.51, shippedRev: 3.49, unitsOrd: 52.6, unitsShip: 51.9, adSpend: 19.63, adSales: 0.421, glanceViews: 167, roas: 3.08 },
  { day: "15 Nov", ops: 3.66, shippedRev: 3.58, unitsOrd: 56.62, unitsShip: 55.8, adSpend: 19.41, adSales: 0.431, glanceViews: 184, roas: 3.21 },
]

export type MoverRow = {
  id: string
  name: string
  image: string
  ops: string
  vsCompare: { delta: string; pct: number }
  vsLy: { delta: string; pct: number } | null
  recs: number
}

export const TOP_GAINERS: MoverRow[] = [
  {
    id: "B07TN3C2HD",
    name: "Cheez-It Cheese Crackers, Baked Snack Crackers, Lunch Snacks, 12.4 oz",
    image: "https://placehold.co/56x56/fef2f2/dc2626?text=CK",
    ops: "$121.8K",
    vsCompare: { delta: "$47.02K", pct: 62.89 },
    vsLy: { delta: "$38.1K", pct: 45.62 },
    recs: 6,
  },
  {
    id: "B000VDZ2D8",
    name: "Pop-Tarts Toaster Pastries, Breakfast Foods, 32 Count",
    image: "https://placehold.co/56x56/fef3c7/b45309?text=PT",
    ops: "$98.4K",
    vsCompare: { delta: "$32.5K", pct: 49.2 },
    vsLy: { delta: "$28.0K", pct: 39.7 },
    recs: 4,
  },
  {
    id: "B01N0DOL1L",
    name: "Pringles Potato Crisps Chips, Lunch Snacks, Snack Stacks, 12 Count",
    image: "https://placehold.co/56x56/dbeafe/1d4ed8?text=PR",
    ops: "$86.2K",
    vsCompare: { delta: "$21.1K", pct: 32.4 },
    vsLy: { delta: "$18.3K", pct: 27.0 },
    recs: 3,
  },
]

export const TOP_LOSERS: MoverRow[] = [
  {
    id: "B000CS9ZME",
    name: "Rice Krispies Treats Crispy Marshmallow Squares, 40 Count",
    image: "https://placehold.co/56x56/ede9fe/6d28d9?text=RK",
    ops: "$24.1K",
    vsCompare: { delta: "$15.57K", pct: -93.35 },
    vsLy: null,
    recs: 8,
  },
  {
    id: "B08XYZ1234",
    name: "Kellogg's Froot Loops Breakfast Cereal, 21.7 oz",
    image: "https://placehold.co/56x56/fce7f3/be123c?text=FL",
    ops: "$31.6K",
    vsCompare: { delta: "$9.42K", pct: -22.95 },
    vsLy: { delta: "$4.1K", pct: -11.5 },
    recs: 5,
  },
  {
    id: "B07EXAMPLE",
    name: "Nutri-Grain Soft Baked Breakfast Bars, 32 Count",
    image: "https://placehold.co/56x56/ecfdf5/047857?text=NG",
    ops: "$28.9K",
    vsCompare: { delta: "$6.8K", pct: -19.05 },
    vsLy: { delta: "$2.2K", pct: -7.1 },
    recs: 2,
  },
]

export type BenchmarkSku = {
  id: string
  name: string
  image: string
  metrics: { label: string; value: string; pct: number }[]
}

export const BENCHMARK_SKUS: BenchmarkSku[] = [
  {
    id: "B000CS9ZME",
    name: "Rice Krispies Treats Crispy Marshmallow Squares, 40 Count",
    image: "https://placehold.co/120x120/ede9fe/6d28d9?text=RK",
    metrics: [
      { label: "Units ordered", value: "17.97K", pct: -5.25 },
      { label: "Glance views", value: "14.69K", pct: -13.35 },
      { label: "OPS", value: "$201.61K", pct: -5.27 },
    ],
  },
  {
    id: "B01N0DOL1L",
    name: "Pringles Potato Crisps Chips, Snack Stacks, 12 Count",
    image: "https://placehold.co/120x120/dbeafe/1d4ed8?text=PR",
    metrics: [
      { label: "Units ordered", value: "9.11K", pct: -4.3 },
      { label: "Glance views", value: "11.2K", pct: -2.1 },
      { label: "OPS", value: "$142.8K", pct: -3.9 },
    ],
  },
  {
    id: "B07TN3C2HD",
    name: "Cheez-It Cheese Crackers, Baked Snack Crackers, 12.4 oz",
    image: "https://placehold.co/120x120/fef2f2/dc2626?text=CK",
    metrics: [
      { label: "Units ordered", value: "7.24K", pct: 60.6 },
      { label: "Glance views", value: "9.88K", pct: 61.61 },
      { label: "OPS", value: "$118.4K", pct: 58.2 },
    ],
  },
  {
    id: "B000VDZ2D8",
    name: "Pop-Tarts Toaster Pastries, Breakfast Foods, 32 Count",
    image: "https://placehold.co/120x120/fef3c7/b45309?text=PT",
    metrics: [
      { label: "Units ordered", value: "21.93K", pct: 2.03 },
      { label: "Glance views", value: "18.4K", pct: 1.12 },
      { label: "OPS", value: "$312.5K", pct: 2.8 },
    ],
  },
]

export type MetricCell = { value: string; pct: number | null; highlight?: boolean }
export type MetricRow = { id: string; label: string; cells: MetricCell[] }
export type MetricGroup = { title: string; rows: MetricRow[] }

export const BENCHMARK_GRID: MetricGroup[] = [
  {
    title: "Sales",
    rows: [
      {
        id: "units-ord",
        label: "Units ordered",
        cells: [
          { value: "17.97K", pct: -5.25 },
          { value: "9.11K", pct: -4.3 },
          { value: "7.24K", pct: 60.6 },
          { value: "21.93K", pct: 2.03 },
        ],
      },
      {
        id: "glance",
        label: "Glance views",
        cells: [
          { value: "14.69K", pct: -13.35 },
          { value: "11.2K", pct: -2.1 },
          { value: "9.88K", pct: 61.61 },
          { value: "18.4K", pct: 1.12 },
        ],
      },
      {
        id: "ops",
        label: "OPS",
        cells: [
          { value: "$201.61K", pct: -5.27 },
          { value: "$142.8K", pct: -3.9 },
          { value: "$118.4K", pct: 58.2 },
          { value: "$312.5K", pct: 2.8 },
        ],
      },
      { id: "margin", label: "Gross margin %", cells: [{ value: "32.4%", pct: 0.13 }, { value: "31.8%", pct: -0.42 }, { value: "33.1%", pct: 1.2 }, { value: "32.0%", pct: 0 }] },
    ],
  },
  {
    title: "Advertising",
    rows: [
      { id: "roas", label: "ROAS", cells: [{ value: "3.21", pct: -4.2 }, { value: "2.98", pct: 2.1 }, { value: "3.45", pct: 6.8 }, { value: "3.12", pct: -1.1 }] },
      { id: "iacos", label: "IACoS", cells: [{ value: "18.2%", pct: 1.4 }, { value: "19.1%", pct: 2.2 }, { value: "17.5%", pct: -0.8 }, { value: "18.8%", pct: 0.5 }] },
      {
        id: "ad-spend",
        label: "Ad spend",
        cells: [
          { value: "$211.28", pct: -7.43, highlight: true },
          { value: "$277.80", pct: 116.79 },
          { value: "$133.47", pct: null },
          { value: "NA", pct: null },
        ],
      },
      { id: "sov", label: "Total category SOV", cells: [{ value: "41.2%", pct: 0.9 }, { value: "38.6%", pct: -1.2 }, { value: "44.1%", pct: 2.4 }, { value: "39.8%", pct: 0.3 }] },
    ],
  },
  {
    title: "Operations",
    rows: [
      { id: "po-fill", label: "PO fill rate", cells: [{ value: "100%", pct: 0 }, { value: "100%", pct: 0 }, { value: "63.93%", pct: -19.23 }, { value: "100%", pct: 0 }] },
      { id: "po-recv", label: "PO receive rate", cells: [{ value: "98.2%", pct: -0.5 }, { value: "99.1%", pct: 0.2 }, { value: "97.4%", pct: -1.1 }, { value: "98.8%", pct: 0 }] },
    ],
  },
]

export const BENCHMARK_COLUMNS = ["B000CS9ZME", "B01N0DOL1L", "B07TN3C2HD", "B000VDZ2D8"]