import { redirect } from "next/navigation"

/** Ally exec demo is the product entry; Content launchpad lives at /launchpad. */
export default function RootPage() {
  redirect("/claire-waterfall")
}
