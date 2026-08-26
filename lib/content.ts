import { promises as fs } from "fs";
import path from "path";
import type { Category, Registry } from "@/lib/types";
import { isValidSlug } from "@/lib/types";

const CONTENT_ROOT = path.join(process.cwd(), "content");
const REGISTRY_PATH = path.join(CONTENT_ROOT, "registry.json");
const CATEGORIES_ROOT = path.join(CONTENT_ROOT, "categories");
const PUBLIC_COVERS_ROOT = path.join(process.cwd(), "public", "covers");

const COVER_TYPES: Record<string, string> = {
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export function contentTypeForCover(filename: string) {
  return COVER_TYPES[path.extname(filename).toLowerCase()] ?? "application/octet-stream";
}

export async function readRegistry(): Promise<Registry> {
  const raw = await fs.readFile(REGISTRY_PATH, "utf8");
  const data = JSON.parse(raw) as Registry;
  return { categories: Array.isArray(data.categories) ? data.categories : [] };
}

export async function getCategory(slug: string) {
  const { categories } = await readRegistry();
  return categories.find((item) => item.slug === slug) ?? null;
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
 */
export function prepareCategoryHtml(html: string) {
  const baseTag = '<base href="/contents/">';
  if (/<base\b/i.test(html)) {
    return html.replace(/<base\b[^>]*>/i, baseTag);
  }
  if (/<head\b[^>]*>/i.test(html)) {
    return html.replace(/<head\b[^>]*>/i, (match) => `${match}\n  ${baseTag}`);
  }
  return `${baseTag}\n${html}`;
}

export async function readCategoryHtml(slug: string) {
  const category = await getCategory(slug);
  if (category?.htmlFile) {
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

export async function readCoverFile(slug: string, filename: string) {
  const file = path.join(categoryDir(slug), filename);
  return fs.readFile(file);
}

async function writeRegistry(registry: Registry) {
  await fs.writeFile(REGISTRY_PATH, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
}

export type SaveCategoryInput = {
  slug: string;
  title: string;
  description: string;
  html: string;
  coverFilename?: string;
  coverBytes?: Buffer;
  previousSlug?: string;
};

export async function saveCategory(input: SaveCategoryInput) {
  if (!isValidSlug(input.slug)) {
    throw new Error("슬러그는 영문 소문자, 숫자, 하이픈만 사용할 수 있습니다.");
  }
  if (!input.title.trim()) {
    throw new Error("제목을 입력하세요.");
  }
  if (!input.html.trim()) {
    throw new Error("HTML 본문을 입력하세요.");
  }

  const registry = await readRegistry();
  const previousSlug = input.previousSlug ?? input.slug;
  const existing = registry.categories.find((item) => item.slug === previousSlug);

  if (input.slug !== previousSlug) {
    const exists = registry.categories.some((item) => item.slug === input.slug);
    if (exists) {
      throw new Error("이미 사용 중인 슬러그입니다.");
    }
  }

  const dir = categoryDir(input.slug);
  await fs.mkdir(dir, { recursive: true });

  if (input.slug !== previousSlug && existing?.cover) {
    const from = path.join(categoryDir(previousSlug), existing.cover);
    const to = path.join(dir, existing.cover);
    if (await fileExists(from)) {
      await fs.copyFile(from, to);
    }
  }

  await fs.writeFile(path.join(dir, "index.html"), input.html, "utf8");

  let cover = existing?.cover ?? "cover.svg";

  if (input.coverBytes && input.coverFilename) {
    const ext = path.extname(input.coverFilename).toLowerCase();
    if (!COVER_TYPES[ext]) {
      throw new Error("커버 이미지는 svg, png, jpg, webp, gif만 가능합니다.");
    }
    cover = `cover${ext}`;
    await fs.writeFile(path.join(dir, cover), input.coverBytes);
  } else if (!(await fileExists(path.join(dir, cover)))) {
    throw new Error("커버 이미지를 업로드하세요.");
  }

  if (input.slug !== previousSlug) {
    await fs.rm(categoryDir(previousSlug), { recursive: true, force: true });
    await fs.rm(path.join(PUBLIC_COVERS_ROOT, previousSlug), {
      recursive: true,
      force: true,
    });
  }

  await syncPublicCover(input.slug, cover);

  const nextItem: Category = {
    slug: input.slug,
    title: input.title.trim(),
    description: input.description.trim(),
    cover,
  };

  const categories = registry.categories.filter((item) => item.slug !== previousSlug);
  const index = registry.categories.findIndex((item) => item.slug === previousSlug);
  if (index >= 0) {
    categories.splice(index, 0, nextItem);
  } else {
    categories.push(nextItem);
  }

  await writeRegistry({ categories });
}

export async function deleteCategory(slug: string) {
  if (!isValidSlug(slug)) {
    throw new Error("잘못된 슬러그입니다.");
  }
  const registry = await readRegistry();
  await fs.rm(categoryDir(slug), { recursive: true, force: true });
  await fs.rm(path.join(PUBLIC_COVERS_ROOT, slug), {
    recursive: true,
    force: true,
  });
  await writeRegistry({
    categories: registry.categories.filter((item) => item.slug !== slug),
  });
}

async function syncPublicCover(slug: string, filename: string) {
  const from = path.join(categoryDir(slug), filename);
  if (!(await fileExists(from))) {
    return;
  }
  const destDir = path.join(PUBLIC_COVERS_ROOT, slug);
  await fs.mkdir(destDir, { recursive: true });
  await fs.copyFile(from, path.join(destDir, filename));
}

async function fileExists(file: string) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}
