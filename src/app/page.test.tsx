import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import Home from "@/app/page";
import { ThemeProvider } from "@/components/theme-provider";
import { site } from "@/resources/site";

// Expected independently of site.stack so a dropped entry fails the test.
const flagshipTechnologies = [
  "Bun",
  "Next.js",
  "React",
  "TypeScript",
  "Tailwind CSS",
  "shadcn/ui",
] as const;

function RootRoute() {
  return (
    <ThemeProvider storageKey="theme">
      <Home />
    </ThemeProvider>
  );
}

function renderRootRoute() {
  render(<RootRoute />);
}

function getSection(title: string) {
  const section = screen.getByRole("heading", { name: title }).closest("section");

  if (!section) {
    throw new Error(`Expected the "${title}" heading to sit inside a section.`);
  }

  return section;
}

describe("root route", () => {
  test("names the Starter in a single h1", () => {
    renderRootRoute();

    const headings = screen.getAllByRole("heading", { level: 1 });

    expect(headings).toHaveLength(1);
    expect(headings[0]?.textContent).toBe("Next.js Starter");
  });

  test("links the primary call to action to the Template URL", () => {
    renderRootRoute();

    const templateLinks = within(screen.getByRole("main")).getAllByRole("link", {
      name: "Use This Template",
    });

    expect(templateLinks).toHaveLength(1);
    expect(templateLinks[0]?.getAttribute("href")).toBe(site.templateUrl);
  });

  test("names the flagship technologies in the stack section", () => {
    renderRootRoute();

    const stack = getSection("The Stack");

    for (const name of flagshipTechnologies) {
      expect(within(stack).getByText(name)).toBeDefined();
    }
  });

  test("shows the install and dev commands in the quickstart", () => {
    renderRootRoute();

    const quickstart = getSection("Quickstart");

    expect(within(quickstart).getByText("bun install")).toBeDefined();
    expect(within(quickstart).getByText("bun run dev")).toBeDefined();
  });

  test("flips the theme from the toggle", async () => {
    renderRootRoute();

    fireEvent.click(screen.getByRole("button", { name: "Switch To Dark Mode" }));

    expect(await screen.findByRole("button", { name: "Switch To Light Mode" })).toBeDefined();
  });

  test("gives each quickstart copy control a unique accessible name", () => {
    renderRootRoute();

    const quickstart = getSection("Quickstart");
    const copyInstall = within(quickstart).getByRole("button", { name: "Copy bun install" });
    const copyDev = within(quickstart).getByRole("button", { name: "Copy bun run dev" });

    expect(copyInstall).not.toBe(copyDev);
    expect(copyInstall.textContent).toContain("bun install");
    expect(copyDev.textContent).toContain("bun run dev");
  });

  test("keeps sections at their final position in the static shell", () => {
    const markup = renderToStaticMarkup(<RootRoute />);

    expect(markup).toContain("Next.js Starter");
    expect(markup).not.toContain("translateY(16px)");
  });
});
