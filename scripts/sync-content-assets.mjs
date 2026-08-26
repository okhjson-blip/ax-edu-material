import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.join(root, "contents");
const destRoot = path.join(root, "public", "contents");

const IMAGE_DIRS = [
  "G_A_C_image",
  "ChatGPT_Work_Codex_image",
  "Claude_image",
];

mkdirSync(destRoot, { recursive: true });

for (const dir of IMAGE_DIRS) {
  const from = path.join(sourceRoot, dir);
  const to = path.join(destRoot, dir);
  if (!existsSync(from)) {
    console.warn(`skip missing: contents/${dir}`);
    continue;
  }
  rmSync(to, { recursive: true, force: true });
  cpSync(from, to, { recursive: true });
  const files = countFiles(to);
  console.log(`synced contents/${dir} → public/contents/${dir} (${files} files)`);
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
