# Next.js Starter

A Bun-first Next.js starter for full-stack developers and small teams.

[![CI](https://github.com/krisnafebrynto/nextjs-starter/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/krisnafebrynto/nextjs-starter/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/krisnafebrynto/nextjs-starter)](https://github.com/krisnafebrynto/nextjs-starter/blob/main/LICENSE)

The Starter ships a live showcase at the root route and removes it in one documented step, so every App starts clean without inheriting demo code.

> **Requires Bun 1.4.3 or newer.** The repository enforces the runtime through `packageManager`, `engines`, and `devEngines`. Use `bun` and `bunx`; npm, pnpm, and yarn are unsupported.

## Quickstart

Create an App from the Template, then run these commands from its directory:

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000). The root route renders the Showcase.

To check the production output:

```bash
bun run build
bun run start
```

## The Stack

Versions match the release commit. Update this table at release time.

| Layer | Technology | Version |
| --- | --- | --- |
| Runtime and package manager | Bun | 1.4.3 |
| Framework | Next.js | 16.4.2 |
| UI | React and React DOM | 19.3.1 |
| Language | TypeScript | 7.0.2 |
| Styling | Tailwind CSS | 4.3.3 |
| Components | shadcn/ui CLI | 4.22.0 |
| Primitives | Base UI | 1.9.0 |
| Animation | Motion | 14.3.0 |
| Themes | next-themes | 0.4.6 |
| Icons | Lucide | 1.59.0 |
| Lint and format | Ultracite | 8.0.1 |
| Lint and format core | Biome | 2.5.15 |
| Testing | Bun test, Testing Library, happy-dom | 1.4.3, 16.3.3, 21.0.3 |
| Git hooks | Lefthook | 2.2.2 |

## Scripts

| Script | What It Does |
| --- | --- |
| `bun run dev` | Starts the Next.js dev server with Turbopack. |
| `bun run build` | Creates the production build. |
| `bun run start` | Serves the production build. |
| `bun run lint` | Runs the Ultracite check over the repository. |
| `bun run lint:ci` | Runs the Biome CI check used by GitHub Actions. |
| `bun run fix` | Applies Ultracite's safe autofixes. |
| `bun run fmt` | Formats files with Biome. |
| `bun run typecheck` | Regenerates route types, then checks `tsconfig.build.json` with the Bun type checker. |
| `bun run typegen` | Regenerates Next.js route types for `typedRoutes`. |
| `bun run check:build` | Runs the Bun type checker against `tsconfig.build.json`. |
| `bun run test` | Runs the test suite with Bun's built-in runner. |
| `bun run clean` | Removes `.next` and `next-env.d.ts`. |

## Project Structure

```text
.
├── .github/workflows/ci.yml   # Lint, typecheck, test, and build on every pull request
├── docs/
│   ├── adr/                   # Architecture decisions
│   └── agents/                # Agent workflows for this repository
├── public/
├── scripts/clean.ts           # Removes .next and next-env.d.ts
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.test.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── motion/            # Motion primitives and the theme toggle
│   │   ├── showcase/          # The removable showcase module
│   │   ├── theme-provider.tsx
│   │   └── ui/                # shadcn/ui primitives: badge, button, card
│   ├── hooks/
│   ├── lib/
│   └── resources/             # fonts.ts, site.ts, viewport.ts
├── test/setup.ts              # happy-dom preload and Testing Library cleanup
├── bunfig.toml                # Registers the test preload
├── lefthook.yml               # Pre-commit lint and format
├── next.config.ts
└── package.json
```

## Rendering Model

`next.config.ts` enables `cacheComponents`, `partialPrefetching`, `typedRoutes`, and the React Compiler. Static and dynamic output is decided per component, not per route.

### Static Shell

Next.js prerenders a static App Shell for each route. The current root route has no request-time data, so `/` is fully static at build time. With `partialPrefetching`, `<Link>` prefetches that shell. URL-specific content resolves after navigation unless the link opts into `prefetch={true}`.

### Streaming

Request-time data (`cookies()`, `headers()`, `params`, `searchParams`, uncached `fetch`, `connection()`) belongs under a `<Suspense>` boundary with a useful fallback. The static shell renders first, then the dynamic region streams in when it resolves. Keep headings and other stable UI outside the boundary so a fallback does not replace them.

### Caching

Reusable data goes behind `"use cache"` with `cacheLife(...)` and `cacheTag(...)`. Invalidate it with `revalidateTag` or `updateTag`. Read request APIs outside the cached scope and pass values in as arguments.

Cache Components replaces route segment configs (`dynamic`, `revalidate`, `fetchCache`) and `unstable_cache`. Reach for `export const instant = false` only after streaming and caching both fail.

## Testing

Bun's test runner is the only test framework. `bunfig.toml` preloads `test/setup.ts`, which registers happy-dom, cleans up Testing Library after each test, and disables Motion animations that happy-dom cannot finish. Assertions use Bun's built-in matchers; there is no jest-dom augmentation.

The suite has one seam: the root route render, inside the same `ThemeProvider` composition the root layout provides. Here is one passing example from `src/app/page.test.tsx`:

```tsx
import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import Home from "@/app/page";
import { ThemeProvider } from "@/components/theme-provider";

function RootRoute() {
  return (
    <ThemeProvider storageKey="theme">
      <Home />
    </ThemeProvider>
  );
}

describe("root route", () => {
  test("names the Starter in a single h1", () => {
    render(<RootRoute />);

    const headings = screen.getAllByRole("heading", { level: 1 });

    expect(headings).toHaveLength(1);
    expect(headings[0]?.textContent).toBe("Next.js Starter");
  });
});
```

Run it with:

```bash
bun test
```

## Deployment

Vercel is the reference target. `vercel.json` pins the Bun 1.4.x runtime.

### Environment Variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_BASE_URL` | Canonical origin for metadata, Open Graph URLs, and the site resource. Defaults to `http://localhost:3000` when unset. |
| `DEV_ORIGINS` | Comma-separated allowed dev origins for tunnels. Development only. |

For local overrides, copy `.example.env` to `.env.local` and fill in the values.

### Vercel

Set `NEXT_PUBLIC_BASE_URL` to the App's deployed origin, for example `https://your-app.vercel.app`, in the Vercel Production environment. The `http://localhost:3000` fallback is correct for local development but wrong for a deployed App.

## What Is Not Included

v1.0 stays app-agnostic by design (ADR-0001). The Starter does not include:

- Authentication and user accounts
- Database and ORM
- Payments and billing
- Internationalization
- Analytics
- Content management system
- Email and transactional messages

Add these when your App needs them. The Starter does not force a choice.

## Make It Yours

The Showcase is the Starter's live demo, not part of your App. The Strip Step makes four changes and leaves the rest of the tree alone. No strip script ships in v1.0.

### Delete The Showcase Module

```bash
rm -rf src/components/showcase
```

The module has eight files: `index.tsx`, `motion-section.tsx`, `quickstart-copy-button.tsx`, `quickstart-section.tsx`, `scope-section.tsx`, `section-heading.tsx`, `stack-section.tsx`, and `theme-toggle.tsx`. Nothing outside `src/app/page.tsx` imports it.

### Replace The Root Route

Replace `src/app/page.tsx` with this minimal Server Component. It keeps no `metadata` export and no `"use client"` directive.

```tsx
import { site } from "@/resources/site";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pt-24 pb-20 sm:pt-32 sm:pb-28">
      <h1 className="font-display font-semibold text-4xl leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
        {site.name}
      </h1>
      <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed sm:text-xl">
        {site.pitch}
      </p>
    </main>
  );
}
```

### Replace The Root-Route Test

Replace `src/app/page.test.tsx` with this minimal test. It renders the route inside the layout's `ThemeProvider` and asserts one level-1 heading plus the pitch paragraph.

```tsx
import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import Home from "@/app/page";
import { ThemeProvider } from "@/components/theme-provider";
import { site } from "@/resources/site";

function RootRoute() {
  return (
    <ThemeProvider storageKey="theme">
      <Home />
    </ThemeProvider>
  );
}

describe("root route", () => {
  test("names the Starter in a single h1 with the pitch", () => {
    render(<RootRoute />);

    const headings = screen.getAllByRole("heading", { level: 1 });

    expect(headings).toHaveLength(1);
    expect(headings[0]?.textContent).toBe(site.name);
    expect(screen.getByText(site.pitch)).toBeDefined();
  });
});
```

Replace the test instead of deleting it. On Bun 1.4.3, `bun test` with zero test files exits 1, which would leave the CI test step red.

### Trim The Site Resource

Replace `src/resources/site.ts` with the identity-only version. The `stack` array and its `StackIcon` and `StackEntry` types go because the stack section was their only consumer.

```ts
const fallbackCanonicalUrl = "http://localhost:3000";
function readCanonicalUrl() {
  const configuredUrl = process.env["NEXT_PUBLIC_BASE_URL"]?.trim();

  if (!configuredUrl) {
    return fallbackCanonicalUrl;
  }

  try {
    const url = new URL(configuredUrl);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.origin
      : fallbackCanonicalUrl;
  } catch {
    return fallbackCanonicalUrl;
  }
}

const repositoryUrl = "https://github.com/krisnafebrynto/nextjs-starter";

export const site = {
  canonicalUrl: readCanonicalUrl(),
  license: {
    name: "MIT License",
    url: `${repositoryUrl}/blob/main/LICENSE`,
  },
  name: "Next.js Starter",
  pitch: "A Bun-first Next.js starter for full-stack developers and small teams.",
  repositoryUrl,
  templateUrl: `${repositoryUrl}/generate`,
} as const;
```

### What Stays

The Strip Step keeps the rest of the Starter:

- `src/app/layout.tsx` and `src/app/globals.css`
- `src/components/theme-provider.tsx` and the `src/components/ui/` primitives
- The motion toolkit in `src/components/motion/`, including `theme-toggle.tsx`
- `src/hooks/`, `src/lib/`, `src/resources/fonts.ts`, and `src/resources/viewport.ts`
- The Bun test preload, test dependencies, and `test` script
- `.github/workflows/ci.yml` and `lefthook.yml`

Some toolkit files are unused today and stay on purpose: that is the Starter's toolkit for your App.

### Verify The Strip

Run the four checks after the file changes:

```bash
bun run lint
bun run typecheck
bun test
NEXT_PUBLIC_BASE_URL="http://localhost:3000" bun run build
```

### Optional: Drop The SVG Icons

`@thesvg/react` had one consumer, the stack section. If you do not need it, remove it and run the build again:

```bash
bun remove @thesvg/react
NEXT_PUBLIC_BASE_URL="http://localhost:3000" bun run build
```

## License

MIT. See [LICENSE](https://github.com/krisnafebrynto/nextjs-starter/blob/main/LICENSE).
