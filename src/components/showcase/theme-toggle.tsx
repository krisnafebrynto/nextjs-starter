"use client";

import { ThemeToggle as MotionThemeToggle } from "@/components/motion/theme-toggle";

function ThemeToggle() {
  return (
    <MotionThemeToggle
      className="size-10 rounded-full border border-border/80 bg-background text-foreground transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      iconClassName="size-4"
      start="bottom-up"
      variant="circle"
    />
  );
}

export { ThemeToggle };
