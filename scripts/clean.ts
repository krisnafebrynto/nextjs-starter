import { lstat, rm, unlink } from "node:fs/promises";
import { isAbsolute, relative, resolve, sep } from "node:path";

const cwd = process.cwd();
const isWindows = process.platform === "win32";

const MAX_ATTEMPTS = 5;
const RETRY_DELAY_MS = 100;
const RETRY_CODES = new Set(["EBUSY", "EMFILE", "ENFILE", "ENOTEMPTY", "EPERM"]);
const BUSY_CODES = new Set(["EACCES", "EBUSY", "EPERM"]);

const HAS_GLOB_MAGIC = /[*?[\]{}]/;
// Matches a dot that starts a path segment or brace alternative.
const NAMES_DOT = /(^|[/\\{,])\./;
const FIRST_WILDCARD = /[*?[]/;
const SEGMENT_BOUNDARY = ["/", "\\", "{", ","];
// `next dev` records its pid, port, and URL in one of these.
const LOCK_CANDIDATES = ["dev/lock", "lock"];

type ExpansionResult =
  | { arg: string; kind: "failed"; message: string }
  | { arg: string; kind: "matched"; paths: Map<string, string> }
  | { arg: string; kind: "missing"; pattern: boolean };

function resolveInsideCwd(target: string): string {
  const absolute = resolve(cwd, target);
  const rel = relative(cwd, absolute);

  if (rel === "" || rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel)) {
    throw new Error("Refusing to delete the project root or a path outside it");
  }

  return absolute;
}

function normalizeSlashes(value: string): string {
  return isWindows ? value.replaceAll("\\", "/") : value;
}

// Only the segment that holds the first wildcard decides hidden matching, so
// `.build/*` keeps its hidden children while `.next*` still matches `.next`.
function namesHiddenEntry(pattern: string): boolean {
  const wildcard = pattern.search(FIRST_WILDCARD);

  if (wildcard === -1) {
    return NAMES_DOT.test(pattern);
  }

  const boundaries = SEGMENT_BOUNDARY.map((boundary) => pattern.lastIndexOf(boundary, wildcard));

  return NAMES_DOT.test(pattern.slice(Math.max(...boundaries) + 1));
}

function errorCode(error: unknown): string | undefined {
  const { code } = error as { code?: unknown };

  return typeof code === "string" ? code : undefined;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function pathExists(absolute: string): Promise<boolean> {
  try {
    await lstat(absolute);
    return true;
  } catch {
    return false;
  }
}

async function expandArg(arg: string): Promise<ExpansionResult> {
  const absolute = resolveInsideCwd(arg);

  if (await pathExists(absolute)) {
    return {
      arg,
      kind: "matched",
      paths: new Map([[absolute, normalizeSlashes(relative(cwd, absolute))]]),
    };
  }

  if (!HAS_GLOB_MAGIC.test(arg)) {
    return { arg, kind: "missing", pattern: false };
  }

  if (isAbsolute(arg)) {
    throw new Error("Glob patterns must be relative to the project");
  }

  const pattern = normalizeSlashes(arg);
  const matches = await Array.fromAsync(
    new Bun.Glob(pattern).scan({
      cwd,
      dot: namesHiddenEntry(pattern),
      followSymlinks: false,
      onlyFiles: false,
    })
  );

  if (matches.length === 0) {
    return { arg, kind: "missing", pattern: true };
  }

  const paths = new Map<string, string>();

  for (const match of matches) {
    paths.set(resolveInsideCwd(match), normalizeSlashes(match));
  }

  return { arg, kind: "matched", paths };
}

async function expand(arg: string): Promise<ExpansionResult> {
  try {
    return await expandArg(arg);
  } catch (error) {
    return { arg, kind: "failed", message: `Cannot clean ${arg}: ${errorMessage(error)}` };
  }
}

function isProcessAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    // EPERM means the process exists but belongs to another user.
    return errorCode(error) === "EPERM";
  }
}

async function describeLock(lockPath: string): Promise<string | undefined> {
  const contents = await Bun.file(lockPath)
    .text()
    .catch(() => undefined);

  if (contents === undefined) {
    return undefined;
  }

  try {
    const parsed: unknown = JSON.parse(contents);

    if (typeof parsed !== "object" || parsed === null) {
      return undefined;
    }

    const { pid, port, appUrl } = parsed as { pid?: unknown; port?: unknown; appUrl?: unknown };

    if (typeof pid !== "number" || !isProcessAlive(pid)) {
      return undefined;
    }

    const url = typeof appUrl === "string" ? appUrl : undefined;
    const where = url ?? (typeof port === "number" ? `http://localhost:${port}` : undefined);

    return where === undefined ? `pid ${pid}` : `pid ${pid} at ${where}`;
  } catch {
    return undefined;
  }
}

async function describeDevServer(distDir: string): Promise<string | undefined> {
  const locks = await Promise.all(
    LOCK_CANDIDATES.map((candidate) => describeLock(resolve(distDir, candidate)))
  );

  return locks.find((lock) => lock !== undefined);
}

async function warnAboutRunningDevServer(targets: Map<string, string>): Promise<void> {
  const distDirs = [...targets.keys()].filter((absolute) => absolute.endsWith(`${sep}.next`));

  if (distDirs.length === 0) {
    return;
  }

  const descriptions = await Promise.all(distDirs.map((distDir) => describeDevServer(distDir)));
  const description = descriptions.find((value) => value !== undefined);

  if (description !== undefined) {
    console.warn(
      `A dev server is running (${description}). Stop \`bun run dev\` before cleaning .next.`
    );
  }
}

async function deletePath(absolute: string): Promise<void> {
  const stats = await lstat(absolute).catch(() => undefined);

  if (stats?.isSymbolicLink()) {
    await unlink(absolute);
    return;
  }

  await rm(absolute, { force: true, recursive: true });
}

// Bun accepts `maxRetries` and `retryDelay` but ignores both, so retry here.
async function deleteWithRetries(absolute: string, attempt = 1): Promise<void> {
  try {
    await deletePath(absolute);
  } catch (error) {
    const code = errorCode(error);
    const retryable = code !== undefined && RETRY_CODES.has(code);

    if (!retryable || attempt >= MAX_ATTEMPTS) {
      throw error;
    }

    await Bun.sleep(RETRY_DELAY_MS * attempt);
    await deleteWithRetries(absolute, attempt + 1);
  }
}

function reportDeleteFailure(display: string, error: unknown): void {
  const code = errorCode(error);
  const suffix = code === undefined ? "" : ` (${code})`;

  console.error(`Error deleting ${display}${suffix}: ${errorMessage(error)}`);

  if (code !== undefined && BUSY_CODES.has(code)) {
    console.error("Files may be in use. Stop `bun run dev` / `bun run start` and retry.");
  }
}

async function main(): Promise<number> {
  const args = Bun.argv.slice(2);

  if (args.length === 0) {
    console.error("Please provide at least one path or glob pattern.");
    console.error("Usage: bun run clean <path|pattern> [path|pattern ...]");
    return 1;
  }

  const expansions = await Promise.all(args.map((arg) => expand(arg)));
  const targets = new Map<string, string>();
  let failed = false;

  for (const expansion of expansions) {
    if (expansion.kind === "failed") {
      failed = true;
      console.error(expansion.message);
      continue;
    }

    if (expansion.kind === "missing") {
      const label = expansion.pattern ? "No matches" : "Not found";
      console.warn(`${label}: ${expansion.arg}`);
      continue;
    }

    for (const [absolute, display] of expansion.paths) {
      targets.set(absolute, display);
    }
  }

  await warnAboutRunningDevServer(targets);

  for (const [absolute, display] of targets) {
    try {
      // biome-ignore lint/performance/noAwaitInLoops: deletes run sequentially so overlapping targets cannot race and output stays deterministic
      await deleteWithRetries(absolute);
      console.log(`Removed: ${display}`);
    } catch (error) {
      failed = true;
      reportDeleteFailure(display, error);
    }
  }

  return failed ? 1 : 0;
}

process.exitCode = await main();
