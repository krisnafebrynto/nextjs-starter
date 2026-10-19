import { ArrowUpRightIcon } from "lucide-react";
import Link from "next/link";
import { MotionSection } from "@/components/showcase/motion-section";
import { ThemeToggle } from "@/components/showcase/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { site } from "@/resources/site";

const footerLinks = [
  { href: site.repositoryUrl, label: "GitHub Repository" },
  { href: site.templateUrl, label: "Use This Template" },
];

const footerLinkClassName =
  "rounded-sm underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

function Showcase() {
  return (
    <>
      <a
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-foreground focus:outline-none focus:ring-3 focus:ring-ring/50"
        href="#main-content"
      >
        Skip To Main Content
      </a>
      <div className="flex min-h-svh flex-col">
        <header className="border-border/60 border-b">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
            <Link
              className="rounded-md font-heading font-semibold text-lg tracking-tight focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              href="/"
            >
              {site.name}
            </Link>
            <ThemeToggle />
          </div>
        </header>
        <main
          className="flex-1"
          id="main-content"
          tabIndex={-1}
        >
          <MotionSection className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pt-24 pb-20 sm:pt-32 sm:pb-28">
            <h1 className="max-w-3xl font-display font-semibold text-4xl leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              {site.name}
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed sm:text-xl">
              {site.pitch}
            </p>
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <a
                className={buttonVariants({ size: "lg" })}
                href={site.templateUrl}
                rel="noreferrer"
                target="_blank"
              >
                Use This Template
                <ArrowUpRightIcon data-icon="inline-end" />
              </a>
              <a
                className={buttonVariants({ size: "lg", variant: "outline" })}
                href={site.repositoryUrl}
                rel="noreferrer"
                target="_blank"
              >
                View The Repository
                <ArrowUpRightIcon data-icon="inline-end" />
              </a>
            </div>
          </MotionSection>
        </main>
        <footer className="border-border/60 border-t">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-8 text-muted-foreground text-sm sm:flex-row sm:items-center sm:justify-between">
            <p>
              {site.name} is released under the{" "}
              <a
                className={footerLinkClassName}
                href={site.license.url}
                rel="noreferrer"
                target="_blank"
              >
                {site.license.name}
              </a>
            </p>
            <nav
              aria-label="Footer"
              className="flex flex-wrap items-center gap-x-6 gap-y-2"
            >
              {footerLinks.map((link) => (
                <a
                  className={footerLinkClassName}
                  href={link.href}
                  key={link.label}
                  rel="noreferrer"
                  target="_blank"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </footer>
      </div>
    </>
  );
}

export { Showcase };
