"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { copyToClipboard } from "@/lib/clipboard";

interface QuickstartCopyButtonProps {
  command: string;
}

function QuickstartCopyButton({ command }: QuickstartCopyButtonProps) {
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
    const success = await copyToClipboard(command);
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
  }, [command]);

  return (
    <>
      <button
        className="group flex cursor-pointer items-center gap-2 rounded-lg border border-border/60 bg-muted px-3 py-1.5 font-mono text-foreground text-sm transition-colors hover:border-foreground/30 hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        onClick={handleCopy}
        type="button"
      >
        <span className="sr-only">Copy </span>
        <code>{command}</code>
        {copied ? (
          <CheckIcon
            aria-hidden="true"
            className="size-3.5"
          />
        ) : (
          <CopyIcon
            aria-hidden="true"
            className="size-3.5 text-muted-foreground transition-colors group-hover:text-foreground"
          />
        )}
      </button>
      <span
        aria-live="polite"
        className="sr-only"
      >
        {copied ? "Copied" : ""}
      </span>
    </>
  );
}

export { QuickstartCopyButton };
