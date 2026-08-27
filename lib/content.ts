import { promises as fs } from "fs";
import path from "path";
import type { Registry } from "@/lib/types";

const CONTENT_ROOT = path.join(process.cwd(), "content");
const REGISTRY_PATH = path.join(CONTENT_ROOT, "registry.json");
const CATEGORIES_ROOT = path.join(CONTENT_ROOT, "categories");

export async function readRegistry(): Promise<Registry> {
  const raw = await fs.readFile(REGISTRY_PATH, "utf8");
  const data = JSON.parse(raw) as Registry;
  return { categories: Array.isArray(data.categories) ? data.categories : [] };
}

export async function getCategory(slug: string) {
  const { categories } = await readRegistry();
  return categories.find((item) => item.slug === slug) ?? null;
}

/** Nested `/c/[slug]/raw|cover` handlers: prefer params, fall back to the URL. */
export function categorySlugFromRequest(
  request: Request,
  slug: string | string[] | undefined,
  leaf: "raw" | "cover",
) {
  const fromParams = Array.isArray(slug) ? slug[0] : slug;
  if (fromParams) return fromParams;

  const parts = new URL(request.url).pathname.split("/").filter(Boolean);
  if (parts[0] === "c" && parts[2] === leaf && parts[1]) {
    return parts[1];
  }
  return "";
}

export function categoryDir(slug: string) {
  return path.join(CATEGORIES_ROOT, slug);
}

export function publicCoverUrl(slug: string, cover: string) {
  return `/covers/${slug}/${cover}`;
}

/**
 * HTML is served from `/c/[slug]/raw`, so relative image paths like
 * `G_A_C_image/foo.png` would resolve under `/c/[slug]/`. Point them at
 * static files under `public/contents/` instead (works on Vercel CDN).
 * Also force site-home links out of the iframe (`target="_top"`).
 */
export function prepareCategoryHtml(html: string) {
  const baseTag = '<base href="/contents/">';
  let next = html;
  if (/<base\b/i.test(next)) {
    next = next.replace(/<base\b[^>]*>/i, baseTag);
  } else if (/<head\b[^>]*>/i.test(next)) {
    next = next.replace(/<head\b[^>]*>/i, (match) => `${match}\n  ${baseTag}`);
  } else {
    next = `${baseTag}\n${next}`;
  }

  // iframe 뷰어에서 `/` 링크가 iframe만 이동하지 않도록 top으로 승격
  next = next.replace(/<a\b([^>]*)>/gi, (full, attrs: string) => {
    const isHome =
      /\bhref\s*=\s*(["'])\/\1/i.test(attrs) ||
      /\bhref\s*=\s*\/(?=[\s>])/i.test(attrs);
    if (!isHome || /\btarget\s*=/i.test(attrs)) return full;
    return `<a${attrs} target="_top">`;
  });

  return next;
}

export async function readCategoryHtml(slug: string) {
  const category = await getCategory(slug);
  if (!category) {
    throw new Error(`카테고리를 찾을 수 없습니다: ${slug}`);
  }

  if (category.htmlFile) {
    // Keep path statically scoped under contents/ for Vercel/Turbopack tracing.
    const file = path.join(
      process.cwd(),
      "contents",
      path.basename(category.htmlFile),
    );
    return fs.readFile(file, "utf8");
  }

  const file = path.join(categoryDir(slug), "index.html");
  return fs.readFile(file, "utf8");
}
