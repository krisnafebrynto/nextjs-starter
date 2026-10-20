"use client";

import { CopyIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { StatefulButton } from "@/components/motion/button";
import { MotionSection } from "@/components/showcase/motion-section";
import { SectionHeading } from "@/components/showcase/section-heading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { copyToClipboard } from "@/lib/clipboard";

interface QuickstartCommand {
  ariaLabel: string;
  command: string;
  label: string;
}

const quickstartCommands: readonly QuickstartCommand[] = [
  {
    ariaLabel: "Copy Install Command",
    command: "bun install",
    label: "Install dependencies",
  },
  {
    ariaLabel: "Copy Dev Server Command",
    command: "bun run dev",
    label: "Start the dev server",
  },
];

function QuickstartRow({ step }: { step: QuickstartCommand }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    },
    []
  );

  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(step.command);
    if (!success) {
      return;
    }
    setCopied(true);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setCopied(false);
    }, 2000);
  }, [step.command]);

  return (
    <li className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <span className="text-muted-foreground text-sm">{step.label}</span>
      <div className="flex items-center gap-2">
        <button
          aria-label={step.ariaLabel}
          className="group flex cursor-pointer items-center rounded-lg border border-border/60 bg-muted px-3 py-1.5 font-mono text-foreground text-sm transition-colors hover:border-foreground/30 hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          onClick={handleCopy}
          type="button"
        >
          <code>{step.command}</code>
        </button>
        <StatefulButton
          aria-label={step.ariaLabel}
          icon={<CopyIcon className="size-3.5" />}
          onClick={handleCopy}
          size="sm"
          state={copied ? "success" : "idle"}
          successText="Copied"
          variant="outline"
        >
          Copy
        </StatefulButton>
      </div>
    </li>
  );
}

function QuickstartSection() {
  return (
    <MotionSection className="border-border/60 border-t">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-16 sm:py-20 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center">
        <SectionHeading
          description="Create an app from the template, then run two commands from its directory."
          title="Quickstart"
        />
        <Card>
          <CardHeader>
            <CardTitle>Run The Commands</CardTitle>
            <CardDescription>Run these commands from the app directory.</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="flex flex-col gap-3">
              {quickstartCommands.map((step) => (
                <QuickstartRow
                  key={step.command}
                  step={step}
                />
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </MotionSection>
  );
}

export { QuickstartSection };
