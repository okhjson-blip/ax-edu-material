import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
} from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.join(root, "contents");
const destRoot = path.join(root, "public", "contents");

mkdirSync(destRoot, { recursive: true });

if (!existsSync(sourceRoot)) {
  console.warn("skip: contents/ missing");
  process.exit(0);
}

/** Auto-discover asset folders under contents/ (e.g. G_A_C_image, rag_chatbot_assets). */
const imageDirs = readdirSync(sourceRoot, { withFileTypes: true })
  .filter(
    (entry) => entry.isDirectory() && /(_image|_assets)$/i.test(entry.name),
  )
  .map((entry) => entry.name)
  .sort();

if (imageDirs.length === 0) {
  console.warn("no *_image / *_assets directories under contents/");
  process.exit(0);
}

for (const dir of imageDirs) {
  const from = path.join(sourceRoot, dir);
  const to = path.join(destRoot, dir);
  rmSync(to, { recursive: true, force: true });
  cpSync(from, to, { recursive: true });
  console.log(`synced contents/${dir} → public/contents/${dir} (${countFiles(to)} files)`);
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
