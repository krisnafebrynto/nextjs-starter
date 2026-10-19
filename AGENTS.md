<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Bun Only

Bun is the runtime and package manager: `bun run <script>`, `bunx --bun <pkg>`, `bun test`. When a doc, guide, or skill names another runtime or package manager, use the Bun equivalent.

- **Scripts:** read `package.json` instead of guessing.
- **Stale output:** `bun run clean` removes `.next` and `next-env.d.ts` (outdated compiled files and cache); follow it with `bun run typegen`.
- **Built-ins first:** Bun's built-in features win over other APIs and new dependencies, so check `node_modules/bun-types/` before reaching for either. Next.js / React best practices still outrank Bun.
- **Audit before upgrading:** `bun audit` covers direct, transitive, and dev-tooling dependencies. Resolve every advisory; leave them unsuppressed.

## Before Writing Code

Training data predates this stack (versions in `package.json`), so ground each change first:

1. **Config:** read `next.config.ts` and implement to the best practices of the Next.js / React features it enables. It is the source of truth: when a skill, doc, guide, or API disagrees, adjust the implementation to the enabled features and ask the user right away.
2. **Skills:** before touching code in a domain, load the matching [skills](./.agents/skills/).
3. **Docs:** before writing code against any library, framework, or CLI, fetch its current docs and API references. Work down these sources and stop at the first that answers (`node_modules/` resolves from this file's directory):
   1. **Local:** `node_modules/next/dist/docs/`, `node_modules/bun-types/docs/`, types in `node_modules/@types/`, TypeScript in `node_modules/@typescript/` and `node_modules/typescript/`.
   2. **Context7:** `bunx --bun ctx7@latest library "<Official Name>" "<specific question>"`, then `bunx --bun ctx7@latest docs <libraryId> "<one concept>"` (`/vercel/next.js` for Next.js). One `docs` call per concept, at most 3 commands per question. On a quota error, tell the user (`ctx7 login` or `CONTEXT7_API_KEY`), then continue with Official.
   3. **Official:** MCP or llms.txt, matched to the domain:
      - Next.js: `bunx --bun -y next-devtools-mcp@latest`, [llms.txt](https://nextjs.org/docs/llms.txt), [llms-full.txt](https://nextjs.org/docs/llms-full.txt) (any docs page is also served as markdown at its `.md` URL).
      - React: [llms.txt](https://react.dev/llms.txt).
      - Bun: [mcp](https://bun.com/docs/mcp), [llms.txt](https://bun.com/llms.txt), [llms-full.txt](https://bun.com/llms-full.txt).
      - Vercel: [llms.txt](https://vercel.com/llms.txt).
      - MDN: [mcp](https://mcp.mdn.mozilla.net).

## Code Conventions

- **kebab-case filenames** (`foo-bar.tsx`). Next.js route-folder syntax (`[slug]/`, `(group)/`) is the only exception.
- **Every import goes through the `@/` alias** (`src/*`).
- **Comment only when necessary:** one line, no ticket or issue references. Prefer a clearer name.
- **Hyphens or rephrasing in place of em dashes**, in code, comments, UI copy, docs, commits, and PRs. Vendored skills in `.agents/skills/` are read-only and exempt.
- **English, with Title Case labels.** Capitalize every word of headings, titles, buttons, links, navigation, eyebrows, badges, and control `aria-label`s ("Get The Starter"), including controls drawn inside illustrations. Type the capitals in source: the CSS `capitalize` class would leave screen readers different text than the screen shows.
- **Sentence case** stays for the hero headline, FAQ questions (phrased as a visitor would ask), descriptions, captions, list items, status lines, and FAQ answers.
- **Docs address humans** who use, support, or deploy the project: plain and concise. Agent guidance lives in this file.
- **Commits** follow Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`). Commit and PR messages carry no `Co-Authored-By` trailer. Hooks run on every commit; fix what they report.

## Rendering Model

With `cacheComponents` and `partialPrefetching` on, static and dynamic output is decided per component.

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

- **TypeScript 7** has no JavaScript compiler API, so typescript-eslint and `eslint-config-next` cannot run. Follow the project's linter rules and formatter.
- `strict` plus `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `noPropertyAccessFromIndexSignature`, and `verbatimModuleSyntax`: use `import type`, narrow indexed reads, and read env vars as `process.env["NAME"]`.
- `typedRoutes` types `href`. After adding or moving a route, run `bun run typegen`; cast computed hrefs to `Route` from `next`.
- TypeScript 6+ no longer auto-discovers `@types/*`, so add each new ambient types package to `types` in `tsconfig.json`. Ask the user before any other edit to `tsconfig.json` or `tsconfig.build.json`.
- **Type checking:** `bun run build` (`next build`) checks every file `tsconfig.build.json` includes.

## Styling

Tailwind CSS 4 loads through the `@tailwindcss/turbopack` rule for `*.css` in `next.config.ts`. Configuration lives in CSS (`@import "tailwindcss"`, `@theme`); no `tailwind.config.js` or PostCSS setup.

## Done Means

Report done only when every item holds:

1. Run `bun run fix` to autofix the safe issues; then `bun run typecheck` and `bun run lint` both exit 0.
2. Every changed UI surface and route is confirmed on the running dev server: `get_compilation_issues` (query `/_next/mcp`) reports none, or follow the `next-dev-loop` skill. Reuse a running server: `next dev` records its PID, port, and URL in `.next/dev/lock`.
3. Rendering, caching, or routing changes also pass `bun run build`; prerender errors surface only there. `bunx --bun next build --debug-prerender` source-maps server errors.
4. The user is satisfied: ask them to confirm.

Linters enforce style mechanically. Spend attention on what they cannot see: business logic, naming, accessibility, edge cases, architecture.

## Agent skills

### Issue tracker

Issues and specs live as GitHub issues in `krisnafebrynto/nextjs-starter`, driven by the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical roles keep their default names: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout: `GLOSSARY.md` and `docs/adr/` at the repo root, created lazily. See `docs/agents/domain.md`.


<!-- BEGIN:nextjs-agent-feedback -->

## Report Next.js feedback

The project owner enabled `experimental.agentFeedback`, authorizing this feedback pass. When enabled, `next dev` writes this block and restores it if removed. Commit `AGENTS.md` with your work to keep the tree clean.

During the current user request, retain anonymized facts as feedback candidates for meaningful or recurring Next.js issues:

- Crashes, hangs, OOMs, or unexpected slowness
- Incorrect behavior, output, errors, or diagnostics
- Missing, unclear, or conflicting documentation
- Unexpected CLI, codemod, Skill, or upgrade behavior and non-obvious workarounds

Continue the current user request without reporting immediately. Routine debugging is not feedback. Verify changes before retaining them as feedback candidates. Never retain code, logs, paths, URLs, secrets, personal information, or project-specific data.

Retain qualifying friction even if it is later fixed or worked around; record the final outcome during the reporting pass.

Before the final response, run one reporting pass. If candidates remain, from this file's directory run `npx --no-install next internal agent-feedback-instructions` once without piping or truncating its output. Follow its output or error guidance. If a network sandbox blocks it, retry with network access; if it still returns no output, continue normally.

<!-- END:nextjs-agent-feedback -->
