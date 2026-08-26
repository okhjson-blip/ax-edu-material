import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const CONTENT_MAX_WIDTH = 1600;
const COVER_MAX_WIDTH = 1280;
const HOME_BG_MAX_WIDTH = 1920;
const CONTENT_MIN_BYTES = 100 * 1024;
const COVER_JPEG_MIN_BYTES = 200 * 1024;

async function walk(dir, out = []) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, out);
    else if (/\.(png|jpe?g|webp)$/i.test(entry.name)) out.push(full);
  }
  return out;
}

async function writeIfSmaller(file, buffer, note) {
  const before = (await fs.stat(file)).size;
  if (buffer.length >= before * 0.98) {
    return { file, before, after: before, skipped: true, note: "already small" };
  }
  await fs.writeFile(file, buffer);
  return { file, before, after: buffer.length, skipped: false, note };
}

async function optimizePngInPlace(file, maxWidth) {
  const meta = await sharp(file).metadata();
  const needsResize = (meta.width ?? 0) > maxWidth;
  const before = (await fs.stat(file)).size;
  if (!needsResize && before < CONTENT_MIN_BYTES) {
    return { file, before, after: before, skipped: true, note: "under threshold" };
  }
  const buffer = await sharp(file)
    .resize({ width: maxWidth, withoutEnlargement: true })
    .png({ compressionLevel: 9, effort: 10, adaptiveFiltering: true })
    .toBuffer();
  return writeIfSmaller(file, buffer, needsResize ? `png<=${maxWidth}w` : "png recompress");
}

async function convertToJpeg(srcPng, destJpg, maxWidth, quality = 82) {
  const before = (await fs.stat(srcPng)).size;
  const buffer = await sharp(srcPng)
    .resize({ width: maxWidth, withoutEnlargement: true })
    .jpeg({ quality, mozjpeg: true })
    .toBuffer();
  await fs.writeFile(destJpg, buffer);
  if (path.resolve(srcPng) !== path.resolve(destJpg)) {
    await fs.unlink(srcPng);
  }
  return { file: destJpg, before, after: buffer.length, skipped: false, note: `jpeg q${quality}` };
}

function rel(file) {
  return path.relative(root, file).replace(/\\/g, "/");
}

function kb(n) {
  return `${(n / 1024).toFixed(0)}KB`;
}

async function main() {
  const results = [];

  // 1) Content HTML screenshots — keep PNG paths
  const contentDirs = [
    path.join(root, "contents", "G_A_C_image"),
    path.join(root, "contents", "ChatGPT_Work_Codex_image"),
    path.join(root, "contents", "Claude_image"),
  ];
  for (const dir of contentDirs) {
    for (const file of await walk(dir)) {
      // skip stray desktop screenshots
      if (/스크린샷|screenshot/i.test(path.basename(file))) continue;
      results.push(await optimizePngInPlace(file, CONTENT_MAX_WIDTH));
    }
  }

  // 2) Category covers — photographic → JPEG when large
  const categoriesRoot = path.join(root, "content", "categories");
  const categoryDirs = (await fs.readdir(categoriesRoot, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const coverUpdates = {};
  for (const slug of categoryDirs) {
    const dir = path.join(categoriesRoot, slug);
    const files = await fs.readdir(dir);
    const cover = files.find((f) => /^cover\.(png|jpe?g|webp)$/i.test(f));
    if (!cover) continue;
    const src = path.join(dir, cover);
    const before = (await fs.stat(src)).size;
    const meta = await sharp(src).metadata();
    const shouldJpeg =
      before >= COVER_JPEG_MIN_BYTES || (meta.width ?? 0) > COVER_MAX_WIDTH;

    if (shouldJpeg) {
      const dest = path.join(dir, "cover.jpg");
      results.push(await convertToJpeg(src, dest, COVER_MAX_WIDTH, 82));
      coverUpdates[slug] = "cover.jpg";
    } else {
      results.push(await optimizePngInPlace(src, COVER_MAX_WIDTH));
      coverUpdates[slug] = cover;
    }
  }

  // 3) home background
  const homeBgPng = path.join(root, "public", "home-bg.png");
  const homeBgJpg = path.join(root, "public", "home-bg.jpg");
  if (await exists(homeBgPng)) {
    results.push(await convertToJpeg(homeBgPng, homeBgJpg, HOME_BG_MAX_WIDTH, 80));
  } else if (await exists(homeBgJpg)) {
    const before = (await fs.stat(homeBgJpg)).size;
    const buffer = await sharp(homeBgJpg)
      .resize({ width: HOME_BG_MAX_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer();
    results.push(await writeIfSmaller(homeBgJpg, buffer, "home-bg recompress"));
  }

  // 4) Update registry cover filenames
  const registryPath = path.join(root, "content", "registry.json");
  const registry = JSON.parse(await fs.readFile(registryPath, "utf8"));
  let registryChanged = false;
  for (const item of registry.categories) {
    const next = coverUpdates[item.slug];
    if (next && item.cover !== next) {
      item.cover = next;
      registryChanged = true;
    }
  }
  if (registryChanged) {
    await fs.writeFile(registryPath, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
  }

  // 5) Sync public/covers from content/categories
  const publicCovers = path.join(root, "public", "covers");
  for (const slug of categoryDirs) {
    const coverName = coverUpdates[slug];
    if (!coverName) continue;
    const from = path.join(categoriesRoot, slug, coverName);
    const destDir = path.join(publicCovers, slug);
    await fs.mkdir(destDir, { recursive: true });
    // remove old cover.* then copy
    for (const f of await fs.readdir(destDir)) {
      if (/^cover\./i.test(f)) await fs.unlink(path.join(destDir, f));
    }
    await fs.copyFile(from, path.join(destDir, coverName));
  }

  const changed = results.filter((r) => !r.skipped);
  const saved = changed.reduce((s, r) => s + (r.before - r.after), 0);
  console.log("Optimized files:");
  for (const r of changed.sort((a, b) => b.before - a.before)) {
    console.log(
      `  ${kb(r.before).padStart(7)} → ${kb(r.after).padStart(6)}  ${r.note}  ${rel(r.file)}`,
    );
  }
  console.log(
    `\nChanged ${changed.length}/${results.length}, saved ${kb(saved)} (${(saved / 1024 / 1024).toFixed(2)} MB)`,
  );
  if (registryChanged) console.log("Updated content/registry.json cover filenames");
}

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
