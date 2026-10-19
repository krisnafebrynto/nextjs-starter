"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { oppositeTheme } from "@/lib/theme";

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  function toggleTheme() {
    setTheme(oppositeTheme(resolvedTheme));
  }

  return (
    <Button
      aria-label="Toggle Theme"
      className="size-11"
      // biome-ignore lint/performance/noJsxPropsBind: React Compiler memoizes this handler.
      onClick={toggleTheme}
      size="icon-lg"
      variant="outline"
    >
      <MoonIcon className="dark:hidden" />
      <SunIcon className="hidden dark:block" />
    </Button>
  );
}

export { ThemeToggle };
