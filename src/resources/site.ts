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

export type StackIcon = "bun" | "nextdotjs" | "react" | "shadcn" | "tailwindcss" | "typescript";

export interface StackEntry {
  icon: StackIcon;
  name: string;
  role: string;
  version?: string | undefined;
}

const stack: readonly StackEntry[] = [
  {
    icon: "bun",
    name: "Bun",
    role: "Runtime, package manager, and script runner for the whole workflow.",
    version: "1",
  },
  {
    icon: "nextdotjs",
    name: "Next.js",
    role: "App Router, Server Components, and Cache Components for the rendering model.",
    version: "16",
  },
  {
    icon: "react",
    name: "React",
    role: "Server and Client Components, with the React Compiler enabled.",
    version: "19",
  },
  {
    icon: "typescript",
    name: "TypeScript",
    role: "Strict types across the starter, checked by the Bun type checker.",
    version: "7",
  },
  {
    icon: "tailwindcss",
    name: "Tailwind CSS",
    role: "Utility-first styling configured directly in CSS.",
    version: "4",
  },
  {
    icon: "shadcn",
    name: "shadcn/ui",
    role: "Base UI primitives copied into the app as editable source.",
  },
];

export const site = {
  canonicalUrl: readCanonicalUrl(),
  license: {
    name: "MIT License",
    url: `${repositoryUrl}/blob/main/LICENSE`,
  },
  name: "Next.js Starter",
  pitch: "A Bun-first Next.js starter for full-stack developers and small teams.",
  repositoryUrl,
  stack,
  templateUrl: `${repositoryUrl}/generate`,
} as const;
