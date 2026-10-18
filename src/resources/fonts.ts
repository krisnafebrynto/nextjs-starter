import { Cinzel, Geist, JetBrains_Mono } from "next/font/google";

export const fontHeading = Geist({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const fontDisplay = Cinzel({
  subsets: ["latin"],
  variable: "--font-display",
});

export const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});
