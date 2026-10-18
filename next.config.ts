import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

let allowedDevOrigins: string[] = [];

if (!isProd) {
  const devOrigins = process.env["DEV_ORIGINS"];
  if (devOrigins) {
    allowedDevOrigins = devOrigins
      .split(",")
      .map((val) => val.trim())
      .filter(Boolean);
  }
}

const nextConfig: NextConfig = {
  // agentRules: false,
  allowedDevOrigins,
  cacheComponents: true,
  experimental: {
    agentFeedback: true,
    turbopackGc: true,
    turbopackRustReactCompiler: true, // NOTE: If enabled, you do not require `babel-plugin-react-compiler` in your `package.json` as `devDependencies`.
  },
  logging: {
    browserToTerminal: "warn",
    fetches: {
      fullUrl: true,
      hmrRefreshes: true,
    },
    incomingRequests: true,
  },
  partialPrefetching: true,
  reactCompiler: true, // NOTE: Explicitly ensure this always enable
  reactStrictMode: true, // NOTE: Explicitly ensure this always enable
  turbopack: {
    rules: {
      "*.css": {
        as: "*.css",
        loaders: ["@tailwindcss/turbopack"],
      },
    },
  },
  typedRoutes: true,
  typescript: {
    tsconfigPath: isProd ? "tsconfig.build.json" : "tsconfig.json", // NOTE: `bun check` is Bun's built-in type checker since v1.4.3, by default `tsconfig.json` includes `.next/dev/types/` which somehow **may cause compiler errors** during the production build.
    ignoreBuildErrors: false, // NOTE: Explicitly ensure this value always set to false
  },
};

export default nextConfig;
