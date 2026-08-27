import { readFileSync, existsSync, writeFileSync } from "fs";
import { spawnSync } from "child_process";

const url = process.argv[2] || "http://localhost:3456/rag_chatbot.html";
const chromeCandidates = [
  process.env.PROGRAMFILES + "\\Google\\Chrome\\Application\\chrome.exe",
  process.env["PROGRAMFILES(X86)"] + "\\Google\\Chrome\\Application\\chrome.exe",
  process.env.LOCALAPPDATA + "\\Google\\Chrome\\Application\\chrome.exe",
].filter(Boolean);

const chrome = chromeCandidates.find((p) => existsSync(p));
if (!chrome) {
  console.log(JSON.stringify({ ok: false, reason: "chrome-not-found" }));
  process.exit(1);
}

const outFile = ".tmp-rag-dom.html";
const r = spawnSync(
  chrome,
  ["--headless=new", "--disable-gpu", "--virtual-time-budget=8000", "--dump-dom", url],
  { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 },
);
writeFileSync(outFile, r.stdout || "");
const h = r.stdout || "";
const buttons = (h.match(/<button\b/gi) || []).length;
const imgs = (h.match(/rag_chatbot_assets\//g) || []).length;
const result = {
  ok: buttons >= 20 && imgs > 0 && /01\s*\/\s*23/.test(h),
  chrome: true,
  buttons,
  assetSrcCount: imgs,
  hasProgress: /01\s*\/\s*23/.test(h),
  hasActive: /active/.test(h),
  title: (h.match(/<title>([^<]*)<\/title>/i) || [,""])[1],
  stderr: (r.stderr || "").slice(0, 200),
};
console.log(JSON.stringify(result, null, 2));
process.exit(result.ok ? 0 : 1);
