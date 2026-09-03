import type { NextConfig } from "next";

const registryFiles = ["./content/registry.json"];
const categoryHtmlFiles = ["./content/registry.json", "./contents/*.html"];

const nextConfig: NextConfig = {
  reactCompiler: true,
  // HTML/registry live outside `app/` and are read with fs at runtime.
  // Include them in the Vercel function bundle so /c/[slug]/raw does not 404.
  // Keys cover both route-path and file-path forms used across Next 16 tracers.
  outputFileTracingIncludes: {
    "/": registryFiles,
    "/c/[slug]": registryFiles,
    "/c/[slug]/cover": registryFiles,
    "/c/[slug]/raw": categoryHtmlFiles,
    "/c/[slug]/raw/route": categoryHtmlFiles,
    "app/c/[slug]/raw/route": categoryHtmlFiles,
  },
  outputFileTracingExcludes: {
    "*": ["./contents/.tmp-*/**", "./.tmp-*", "./.tmp-*/**"],
  },
};

export default nextConfig;
