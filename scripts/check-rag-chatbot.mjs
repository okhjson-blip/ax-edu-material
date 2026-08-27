import { readFileSync, existsSync, readdirSync } from "fs";

const html = readFileSync("contents/rag_chatbot.html", "utf8");
const i = html.indexOf("const slides=");
let depth = 0;
let start = -1;
let end = -1;
for (let k = i; k < html.length; k++) {
  if (html[k] === "[") {
    if (start < 0) start = k;
    depth++;
  } else if (html[k] === "]") {
    depth--;
    if (depth === 0) {
      end = k;
      break;
    }
  }
}
const slides = JSON.parse(html.slice(start, end + 1));
const assets = new Set(readdirSync("contents/rag_chatbot_assets"));
const pubDir = "public/contents/rag_chatbot_assets";
const pub = existsSync(pubDir) ? new Set(readdirSync(pubDir)) : new Set();

let missingSrc = 0;
let missingPub = 0;
let imgs = 0;
for (const slide of slides) {
  for (const el of slide.elements || []) {
    if (el.type !== "image") continue;
    imgs += 1;
    if (!assets.has(el.src)) missingSrc += 1;
    if (!pub.has(el.src)) missingPub += 1;
  }
}

const result = {
  ok:
    slides.length === 23 &&
    missingSrc === 0 &&
    missingPub === 0 &&
    html.includes('id="toc"') &&
    html.includes('id="canvas"') &&
    !html.includes("const titles="),
  slides: slides.length,
  imageRefs: imgs,
  assetsOnDisk: assets.size,
  assetsInPublic: pub.size,
  missingSrc,
  missingPub,
  kb: Math.round(html.length / 1024),
};
console.log(JSON.stringify(result, null, 2));
process.exit(result.ok ? 0 : 1);
