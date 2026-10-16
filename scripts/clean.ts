import { rm } from "node:fs/promises";
import { isAbsolute, relative, resolve, sep } from "node:path";

const cwd = process.cwd();

function resolveInsideCwd(target: string): string {
  const absolute = resolve(cwd, target);
  const rel = relative(cwd, absolute);

  if (rel === "" || rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel)) {
    throw new Error("Refusing to delete the project root or paths outside it");
  }

  return absolute;
}

const targets = Bun.argv.slice(2);

if (targets.length === 0) {
  console.error("Please provide at least one file or folder path.");
  console.error("Usage: bun clean <path1> [path2 ...]");
  process.exit(1);
}

let failed = false;

for (const target of targets) {
  try {
    await rm(resolveInsideCwd(target), {
      recursive: true,
      force: true,
      maxRetries: 3,
      retryDelay: 100,
    });
    console.log(`Removed: ${target}`);
  } catch (error) {
    failed = true;
    const code = (error as { code?: string }).code;
    console.error(`Error deleting "${target}"${code ? ` (${code})` : ""}:`, error);
    if (code === "EBUSY" || code === "EPERM") {
      console.error("Files may be in use. Stop `bun dev` / `bun start` and retry.");
    }
  }
}

if (failed) process.exitCode = 1;
