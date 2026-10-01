import { Lato, Playfair_Display } from "next/font/google"

/** The brand template's faces (Aurelle Brand 2026), loaded only where decks render. */
export const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-playfair" })
export const lato = Lato({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-lato" })
