<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Bun-only Enforced

Bun is the only runtime and package manager:

- `bun run <script>`
- `bunx --bun <pkg>`
- `bun test`
- `bun run clean` removes `.next` and `next-env.d.ts` to cleanup outdated compiled files or cache; follow it with `bun run typegen`.

`package.json` holds the scripts; read it instead of guessing.

Complete local reference at `node_modules/bun-types/`.

Built-in bun's features is always wins (so prioritize this), check it out before applying another APIs or adding new dependencies.

## Docs First

Training data predates this stack see each dependencies version at `package.json`. Fetch current docs and APIs reference before writing code against any library, framework, or CLI.

1. **Local docs**: `node_modules/next/dist/docs/`, `node_modules/bun-types/docs/`. Look up for relevant local docs and APIs reference first within `node_modules/` (resolved from this file's directory) before goes fetching online. Types reference at `node_modules/@types/`.
2. **Context7**: `bunx --bun ctx7@latest library "<Official Name>" "<specific question>"`, then `bunx --bun ctx7@latest docs <libraryId> "<one concept>"` (`/vercel/next.js` for Next.js). One `docs` call per concept, at most 3 commands per question. On a quota error, tell the user (`ctx7 login` or `CONTEXT7_API_KEY`), then continue with step 3.
3. **Official mcp / llms.txt** (sort by any orders):
   - Next.js: `bunx --bun -y next-devtools-mcp@latest`, [llms.txt](https://nextjs.org/docs/llms.txt), [llms-full.txt](https://nextjs.org/docs/llms-full.txt) (any docs page is also served as markdown at its `.md` URL).
   - React: [llms.txt](https://react.dev/llms.txt).
   - Bun: [mcp](https://bun.com/docs/mcp), [llms.txt](https://bun.com/llms.txt), [llms-full.txt](https://bun.com/llms-full.txt).
   - MDN: [mcp](https://mcp.mdn.mozilla.net).
   - Vercel: [llms.txt](https://vercel.com/llms.txt).

## Constraints

- Strictly follows what Next.js / React features are being enabled in `next.config.ts`, before writing any code. Implementation must applied best practices (this priorities wins against bun).
- If skills, docs, guides, APIs, and so on says:
  - Use another runtime engines or package managers, prefer `bun`.
  - Use anything that against `next.config.ts` enabled features, `next.config.ts` wins by adjust the implementation that follows the enabled Next.js / React features. Ask user immediately.
- **Skills By Domain:** Load the matching [skills](./.agents/skills/) before touching code in its domain.
- **TypeScript 7** has no JavaScript compiler API, so typescript-eslint and `eslint-config-next` cannot run. Follow the current project linter rules and formatter. Never edit `tsconfig.json` and `tsconfig.build.json` without user permission. Reference at `node_modules/@typescript/` and `node_modules/typescript/`.
- **Type checking:** `next build` checks every file `tsconfig.build.json` includes, through the `bun run build`.
- **Audit before upgrading.** `bun audit` covers direct, transitive, and dev-tooling dependencies. Resolve advisories; leave them unsuppressed.

## Code Conventions

- **kebab-case filenames** (`foo-bar.tsx`). Next's file conventions (`page.tsx`, `not-found.tsx`, `opengraph-image.tsx`, `[slug]/`, `(group)/`) are the only exception.
- **Every import goes through the `@/` alias**, which maps to `src/*`.
- **Comment only when necessary:** one line, no ticket or issue references. Prefer a clearer name.
- **Hyphens or rephrasing in place of em dashes**, in code, comments, UI copy, docs, commits, and PRs. Vendored skills in `.agents/skills/` are exempt and never hand-edited.
- **English, with Title Case labels.** Capitalize every word of headings, titles, buttons, links, navigation, eyebrows, badges, and control `aria-label`s ("Get The Starter"), including controls drawn inside illustrations. Sentence case stays for the hero headline, FAQ questions (phrased as a visitor would ask), descriptions, captions, list items, status lines, and FAQ answers. Type the capitals in source; the CSS `capitalize` class would leave screen readers a different text than the screen shows.
- **Docs address humans** who use, support, or deploy the project: plain, concise, easy to follow. Agent guidance lives in this file.
- **Commits** follow Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`). Commit and PR messages carry no `Co-Authored-By` trailer. Hooks run on every commit; fix what they report.

## Rendering model

`cacheComponents` and `partialPrefetching` are on, so static and dynamic output is decided per component.

- Request-time data (`cookies()`, `headers()`, `params`, `searchParams`, uncached `fetch`, `connection()`) sits under `<Suspense>` with a useful fallback, so the static shell still prerenders.
- Reusable data goes behind `"use cache"` with `cacheLife(...)` and `cacheTag(...)`; invalidate with `revalidateTag` or `updateTag`. Read request APIs outside the cached scope and pass values in as arguments (`"use cache: private"` is the exception for runtime request data).
- Cache Components replaces route segment configs (`dynamic`, `revalidate`, `fetchCache`) and `unstable_cache`. Reach for `export const instant = false` only after streaming and caching both fail.
- `<Link>` prefetches the static App Shell. Put URL-specific data below Suspense boundaries; see the *Optimizing prefetching* guide for per-link tuning.
- Server Components by default. Add `"use client"` at the smallest leaf that needs state, effects, or browser APIs, and pass that leaf only the props it renders.

## React

- React Compiler memoizes. Write plain components; add `useMemo`, `useCallback`, or `memo` only when a measurement shows a need. Keep renders pure (no mutating props, state, or module-level request state) because the compiler depends on it.
- `babel-plugin-react-compiler` stays in `devDependencies` while `turbopackRustReactCompiler` is `false`.
- Compose with children and explicit variant components; avoid boolean-prop modes.
- Refs are plain props and `use(Context)` replaces `useContext`; `forwardRef` is unnecessary in React 19.
- Import from the source module; skip barrel files. Load heavy client components with `next/dynamic`.
- Derive state during render; keep interaction logic in event handlers; wrap non-urgent updates in `startTransition`.

## TypeScript

- `strict` plus `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `noPropertyAccessFromIndexSignature`, `verbatimModuleSyntax`: use `import type`, narrow indexed reads, and read env vars as `process.env["NAME"]`.
- `@/*` maps to `./src/*`.
- `typedRoutes` types `href`. After adding or moving a route, run `bun run typegen`; cast computed hrefs to `Route` from `next`.
- `tsconfig.json` lists `types` explicitly (`bun`, `react`, `react-dom`) because TypeScript 6+ no longer auto-discovers `@types/*`. Add each new ambient types package to that array.

## Styling

Tailwind CSS 4 loads through the `@tailwindcss/turbopack` rule for `*.css` in `next.config.ts`. Configuration lives in CSS (`@import "tailwindcss"`, `@theme`); no `tailwind.config.js` or PostCSS setup.

## Done Means

1. `bun run typecheck` and `bun run lint` both exit 0. Run `bun run fix` first to autofix the safe fixes.
2. UI and route changes are confirmed on the running dev server: query `/_next/mcp` (`get_compilation_issues`) or follow the `next-dev-loop` skill.
3. Rendering, caching, or routing changes also pass `bun run build`; prerender errors surface only there. Use `next build --debug-prerender` for source-mapped server errors.
4. User satisfied with the results, so always confirm this.

Linters enforces style mechanically. Spend attention on what it cannot see: business logic, naming, accessibility, edge cases, architecture.
Reuse an existing running dev server: `next dev` records its PID, port, and URL in `.next/dev/lock`.
