import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { fontDisplay, fontHeading, fontMono, fontSans } from "@/resources/fonts";
import { site } from "@/resources/site";
import { siteViewport } from "@/resources/viewport";

export const metadata: Metadata = {
  description: site.pitch,
  metadataBase: new URL(site.canonicalUrl),
  openGraph: {
    description: site.pitch,
    locale: "en_US",
    siteName: site.name,
    title: site.name,
    type: "website",
    url: site.canonicalUrl,
  },
  title: {
    default: site.name,
    template: `%s | ${site.name}`,
  },
};

export const viewport: Viewport = siteViewport;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      className={cn(
        fontDisplay.variable,
        fontHeading.variable,
        fontMono.variable,
        fontSans.variable,
        "antialiased"
      )}
      lang="en"
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider storageKey="theme">{children}</ThemeProvider>
      </body>
    </html>
  );
}
