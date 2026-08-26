import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // HTML/registry live outside `app/` and are read with fs at runtime.
  // Include them in the Vercel function bundle so /c/[slug]/raw does not 404.
  outputFileTracingIncludes: {
    "/": ["./content/registry.json"],
    "/c/[slug]": ["./content/registry.json"],
    "/c/[slug]/raw": [
      "./content/registry.json",
      "./contents/*.html",
      "./content/categories/**/*.html",
    ],
    "/c/[slug]/cover": ["./content/registry.json"],
  },
};

export default nextConfig;
