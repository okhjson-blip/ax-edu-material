import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
} from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.join(root, "contents");
const destRoot = path.join(root, "public", "contents");
const registryPath = path.join(root, "content", "registry.json");

if (!existsSync(sourceRoot)) {
  console.error("contents/ is missing — Vercel cannot serve category HTML");
  process.exit(1);
}

validateRegistry();

mkdirSync(destRoot, { recursive: true });

/** Auto-discover asset folders under contents/ (e.g. G_A_C_image, rag_chatbot_assets). */
const imageDirs = readdirSync(sourceRoot, { withFileTypes: true })
  .filter(
    (entry) =>
      entry.isDirectory() &&
      /(_image|_assets)$/i.test(entry.name) &&
      !entry.name.startsWith("."),
  )
  .map((entry) => entry.name)
  .sort();

if (imageDirs.length === 0) {
  console.warn("no *_image / *_assets directories under contents/");
} else {
  for (const dir of imageDirs) {
    const from = path.join(sourceRoot, dir);
    const to = path.join(destRoot, dir);
    rmSync(to, { recursive: true, force: true });
    cpSync(from, to, { recursive: true });
    console.log(`synced contents/${dir} → public/contents/${dir} (${countFiles(to)} files)`);
  }
}

function validateRegistry() {
  if (!existsSync(registryPath)) {
    console.error("missing content/registry.json");
    process.exit(1);
  }

  let data;
  try {
    data = JSON.parse(readFileSync(registryPath, "utf8"));
  } catch (error) {
    console.error("invalid content/registry.json:", error);
    process.exit(1);
  }

  const categories = Array.isArray(data.categories) ? data.categories : [];
  if (categories.length === 0) {
    console.error("content/registry.json has no categories");
    process.exit(1);
  }

  let failed = false;
  for (const item of categories) {
    const slug = String(item.slug ?? "");
    if (item.htmlFile) {
      const file = path.join(root, "contents", path.basename(item.htmlFile));
      if (!existsSync(file)) {
        console.error(`missing HTML for ${slug}: ${item.htmlFile}`);
        failed = true;
      }
    } else {
      const file = path.join(root, "content", "categories", slug, "index.html");
      if (!existsSync(file)) {
        console.error(`missing HTML for ${slug}: content/categories/${slug}/index.html`);
        failed = true;
      }
    }

    if (item.cover) {
      const cover = path.join(root, "public", "covers", slug, item.cover);
      if (!existsSync(cover)) {
        console.error(`missing cover for ${slug}: public/covers/${slug}/${item.cover}`);
        failed = true;
      }
    }
  }

  if (failed) process.exit(1);
  console.log(`validated ${categories.length} registry categories`);
}

function countFiles(dir) {
  let count = 0;
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) count += countFiles(full);
    else count += 1;
  }
  return count;
}
