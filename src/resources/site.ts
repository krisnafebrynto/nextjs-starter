const fallbackCanonicalUrl = "http://localhost:3000";
const trailingSlashes = /\/+$/;

function readCanonicalUrl() {
  const configuredUrl = process.env["NEXT_PUBLIC_BASE_URL"]?.trim();

  return configuredUrl ? configuredUrl.replace(trailingSlashes, "") : fallbackCanonicalUrl;
}

export const site = {
  canonicalUrl: readCanonicalUrl(),
  name: "Next.js Starter",
  pitch: "A Bun-first Next.js starter for full-stack developers and small teams.",
  repositoryUrl: "https://github.com/krisnafebrynto/nextjs-starter",
  templateUrl: "https://github.com/krisnafebrynto/nextjs-starter/generate",
} as const;
