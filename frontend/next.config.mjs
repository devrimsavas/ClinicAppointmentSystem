import path from "node:path";
import { fileURLToPath } from "node:url";

// The repository root also has a package.json (for "npm run dev" of both apps),
// so tell Next.js that this folder is the app root.
const appRoot = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: { root: appRoot },
  outputFileTracingRoot: appRoot,
  // The staff area used to live under /admin
  async redirects() {
    return [
      { source: "/admin", destination: "/staff", permanent: true },
      { source: "/admin/:path*", destination: "/staff/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
