const fallbackCanonicalUrl = "http://localhost:3000";
const trailingSlashes = /\/+$/;

function readCanonicalUrl() {
  const configuredUrl = process.env["NEXT_PUBLIC_BASE_URL"]?.trim();

  return configuredUrl ? configuredUrl.replace(trailingSlashes, "") : fallbackCanonicalUrl;
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
