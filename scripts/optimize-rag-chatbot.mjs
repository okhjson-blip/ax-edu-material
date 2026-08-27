/**
 * Optimize contents/rag_chatbot.html only (not shared across other decks).
 * - one UI shell for all 23 pages
 * - compact slides JSON; drop duplicate titles[]
 * - remove unused PNGs under rag_chatbot_assets/
 */
import { readFileSync, writeFileSync, readdirSync, unlinkSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const htmlPath = path.join(root, "contents", "rag_chatbot.html");
const assetsDir = path.join(root, "contents", "rag_chatbot_assets");
const IMAGE_DIR_EXPR = `(function(){try{if(location.protocol==="file:")return"rag_chatbot_assets/";}catch(e){}return"/contents/rag_chatbot_assets/";})()`;

const html = readFileSync(htmlPath, "utf8");
const slidesAt = html.indexOf("const slides=");
const titlesAt = html.indexOf("const titles=");
if (slidesAt < 0) throw new Error("slides marker not found");

function extractArray(fromIndex) {
  let depth = 0;
  let start = -1;
  for (let k = fromIndex; k < html.length; k++) {
    const c = html[k];
    if (c === "[") {
      if (start < 0) start = k;
      depth++;
    } else if (c === "]") {
      depth--;
      if (depth === 0) return html.slice(start, k + 1);
    }
  }
  throw new Error("unclosed array");
}

const slides = JSON.parse(extractArray(slidesAt));

function compact(value, key) {
  if (Array.isArray(value)) return value.map((v) => compact(v));
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, val] of Object.entries(value)) {
      if (
        val === false &&
        (k === "flipH" ||
          k === "flipV" ||
          k === "bold" ||
          k === "italic" ||
          k === "underline")
      ) {
        continue;
      }
      if (val === 0 && k === "rot") continue;
      if (val === null && (k === "fill" || k === "bullet" || k === "color")) continue;
      if (k === "line" && val && !val.color && !(val.width > 0)) continue;
      if (k === "dash" && val === "solid") continue;
      if (k === "width" && key === "line" && val === 0) continue;
      if (typeof val === "number") {
        out[k] = Math.round(val * 1000) / 1000;
        continue;
      }
      out[k] = compact(val, k);
    }
    return out;
  }
  return value;
}

const compactSlides = slides.map((s) => {
  const next = compact(s);
  if (!Array.isArray(next.code) || next.code.length === 0) delete next.code;
  return next;
});

const usedImages = new Set();
for (const slide of compactSlides) {
  for (const el of slide.elements || []) {
    if (el.type === "image" && el.src) usedImages.add(el.src);
  }
}

let removedPng = 0;
for (const name of readdirSync(assetsDir)) {
  if (!name.endsWith(".png")) continue;
  if (!usedImages.has(name)) {
    unlinkSync(path.join(assetsDir, name));
    removedPng++;
  }
}

const n = compactSlides.length;
const out = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#0f172a">
  <title>RAG 챗봇 구축 완전 입문 매뉴얼</title>
  <style>
    :root{--sidebar:min(19vw,280px);--nav:#0f172a;--stage:#07111f;--green:#22c55e;--muted:rgba(255,255,255,.68)}
    *{box-sizing:border-box;margin:0;padding:0}
    html,body{width:100%;height:100%;height:100dvh;overflow:hidden;background:var(--stage);font-family:Poppins,"Noto Sans KR","Malgun Gothic",sans-serif}
    body{display:flex;color:#f8fafc}
    aside{width:var(--sidebar);max-width:20vw;min-width:210px;flex:0 0 var(--sidebar);display:flex;flex-direction:column;overflow:hidden;background:var(--nav);box-shadow:8px 0 30px rgb(2 6 23/.2);z-index:5}
    .brand{padding:18px clamp(15px,1.5vw,22px) 15px;border-bottom:1px solid rgba(255,255,255,.11)}
    .kicker{display:flex;align-items:center;gap:7px;margin-bottom:7px;color:#86efac;font-size:11px;font-weight:800;letter-spacing:.09em}
    .kicker:before{width:8px;height:8px;border-radius:50%;background:var(--green);box-shadow:0 0 0 4px rgb(34 197 94/.13);content:""}
    .brand h1{font-size:clamp(15px,1.25vw,20px);line-height:1.4;letter-spacing:-.045em}
    .progress{padding:12px clamp(15px,1.5vw,22px) 10px}
    .progress-row{display:flex;justify-content:space-between;margin-bottom:7px;color:var(--muted);font-size:11.5px;font-variant-numeric:tabular-nums}
    .track{height:5px;overflow:hidden;border-radius:99px;background:rgba(255,255,255,.13)}
    .bar{height:100%;background:linear-gradient(90deg,var(--green),#bbf7d0);transition:width .18s}
    .agenda{padding:6px clamp(15px,1.5vw,22px) 4px;color:rgba(255,255,255,.43);font-size:10px;font-weight:800;letter-spacing:.12em}
    nav{flex:1;min-height:0;overflow-y:auto;padding:2px 10px 12px;scrollbar-width:thin}
    nav button{display:grid;grid-template-columns:25px minmax(0,1fr);gap:6px;width:100%;margin:2px 0;padding:7px 8px;border:1px solid transparent;border-radius:8px;background:transparent;color:var(--muted);font:inherit;font-size:clamp(11px,.83vw,13px);line-height:1.34;text-align:left;cursor:pointer;overflow-wrap:break-word;word-break:keep-all;line-break:strict}
    nav button:hover{color:#fff;background:rgba(255,255,255,.07)}
    nav button:focus-visible{outline:2px solid #86efac;outline-offset:-2px}
    nav button.active{color:#fff;border-color:rgba(255,255,255,.11);background:linear-gradient(90deg,#173f9f,#1657be)}
    .toc-no{padding-top:1px;color:#86efac;font-size:10px;font-weight:800}
    .home{margin:0 15px 15px;padding-top:11px;border-top:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.79);font-size:12px;text-decoration:none}
    main{flex:1;min-width:0;display:flex;align-items:center;justify-content:center;padding:clamp(10px,1.6vw,24px);background:radial-gradient(circle at 90% 5%,rgb(34 197 94/.09),transparent 25rem),var(--stage)}
    .stage{position:relative;width:min(100%,calc((100dvh - 48px)*1.77778));aspect-ratio:16/9;overflow:hidden;border:1px solid rgba(255,255,255,.09);border-radius:12px;background:#fff;box-shadow:0 26px 70px rgb(0 0 0/.35);cursor:pointer}
    .stage:focus-visible{outline:3px solid #86efac;outline-offset:4px}
    .viewport{position:absolute;inset:0;overflow:hidden}
    .canvas{position:absolute;left:50%;top:50%;width:1600px;height:900px;transform-origin:center center;background:#fff;overflow:hidden;color:#0c1a3a}
    .canvas:before{position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at 5% 85%,rgb(34 197 94/.055),transparent 240px),radial-gradient(circle at 92% 7%,rgb(20 40 160/.055),transparent 250px);content:""}
    .ppt-el{position:absolute}
    .ppt-shape{display:flex;overflow:hidden}
    .ppt-shape.roundRect{border-radius:12px}
    .ppt-shape.ellipse{border-radius:50%}
    .ppt-text{width:100%;display:flex;flex-direction:column;min-height:0}
    .ppt-text.anchor-ctr{justify-content:center}
    .ppt-text.anchor-b{justify-content:flex-end}
    .ppt-text p{margin:0;white-space:pre-line;overflow-wrap:break-word;word-break:keep-all;line-break:strict;line-height:1.3}
    .ppt-image{display:block;object-fit:fill}
    .ppt-table{border-collapse:collapse;table-layout:fixed;background:#fff}
    .ppt-table td{border:1px solid #cbd5e1;vertical-align:middle;overflow:hidden}
    .ppt-line{height:0;transform-origin:left center}
    .code-block{position:absolute;z-index:2;padding:18px 24px;border-radius:9px;background:#0b1d46;color:#e2e8f0;font:15px/1.45 Consolas,"Cascadia Code",monospace;white-space:pre-wrap;overflow:hidden;box-shadow:inset 0 0 0 1px rgb(23 63 159/.55)}
    .slide-dark:before{background:radial-gradient(circle at 10% 90%,rgb(34 197 94/.13),transparent 270px),linear-gradient(135deg,#10205d,#173498)!important}
    .stage-last{cursor:default}
    @media(max-width:900px){
      body{flex-direction:column}
      aside{width:100%;max-width:none;min-width:0;max-height:36dvh;flex:0 0 auto}
      .brand{padding:11px 16px 8px}.kicker{margin-bottom:2px}.brand h1{font-size:15px}
      .progress{padding:7px 16px 5px}.agenda{display:none}
      nav{display:flex;gap:5px;flex:0 0 auto;overflow-x:auto;overflow-y:hidden;padding:2px 12px 8px}
      nav button{display:block;width:auto;min-width:58px;max-width:180px;margin:0;padding:7px 9px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .toc-no{margin-right:5px}.home{display:none}main{min-height:0;padding:8px}.stage{width:100%;border-radius:8px}
    }
    @media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important;transition:none!important}}
  </style>
</head>
<body>
  <!-- Common frame for all ${n} pages -->
  <aside aria-label="교육자료 내비게이션">
    <div class="brand">
      <div class="kicker">RAG CHATBOT GUIDE</div>
      <h1>RAG 챗봇 구축<br>완전 입문 매뉴얼</h1>
    </div>
    <div class="progress">
      <div class="progress-row"><span>진행률</span><span id="progress-text" aria-live="polite">01 / ${n}</span></div>
      <div class="track" role="progressbar" aria-valuemin="1" aria-valuemax="${n}" aria-valuenow="1"><div class="bar" id="progress-bar"></div></div>
    </div>
    <div class="agenda">AGENDA</div>
    <nav id="toc" aria-label="페이지 목록"></nav>
    <a class="home" href="/" target="_top">← 목록으로</a>
  </aside>
  <main>
    <div class="stage" id="stage" role="button" tabindex="0" aria-label="현재 페이지. 클릭하면 다음 페이지로 이동합니다">
      <div class="viewport"><div class="canvas" id="canvas"></div></div>
    </div>
  </main>
  <script>
    const IMAGE_DIR = ${IMAGE_DIR_EXPR};
    const slides = ${JSON.stringify(compactSlides)};

    const canvas = document.getElementById("canvas");
    const stage = document.getElementById("stage");
    const toc = document.getElementById("toc");
    const progressText = document.getElementById("progress-text");
    const progressBar = document.getElementById("progress-bar");
    const progressTrack = document.querySelector(".track");
    let index = 0;

    function el(tag, cls) {
      const node = document.createElement(tag);
      if (cls) node.className = cls;
      return node;
    }
    function style(node, styles) {
      Object.assign(node.style, styles);
      return node;
    }
    function fontFamily(name) {
      return '"' + String(name || "Noto Sans KR").replaceAll('"', "") + '", "Noto Sans KR", sans-serif';
    }
    function transform(item) {
      return "rotate(" + (item.rot || 0) + "deg) scaleX(" + (item.flipH ? -1 : 1) + ") scaleY(" + (item.flipV ? -1 : 1) + ")";
    }
    function renderText(data, host) {
      if (!data) return;
      const box = el("div", "ppt-text anchor-" + data.anchor);
      const m = data.margins || { t: 0, r: 0, b: 0, l: 0 };
      style(box, { padding: m.t + "px " + m.r + "px " + m.b + "px " + m.l + "px" });
      (data.paragraphs || []).forEach(function (p) {
        const para = el("p");
        style(para, { textAlign: p.align, paddingLeft: ((p.level || 0) * 22) + "px" });
        if (p.bullet) {
          const b = el("span");
          b.textContent = p.bullet + " ";
          para.appendChild(b);
        }
        (p.runs || []).forEach(function (r) {
          const span = el("span");
          span.textContent = r.text;
          style(span, {
            fontSize: (r.size || 16) + "px",
            fontWeight: r.bold ? "700" : "400",
            fontStyle: r.italic ? "italic" : "normal",
            textDecoration: r.underline ? "underline" : "none",
            color: r.color || "#334155",
            fontFamily: fontFamily(r.font)
          });
          para.appendChild(span);
        });
        box.appendChild(para);
      });
      host.appendChild(box);
    }
    function renderElement(item) {
      var node;
      if (item.type === "shape") {
        node = el("div", "ppt-el ppt-shape " + (item.geom || "rect"));
        var line = item.line;
        style(node, {
          left: item.x + "px", top: item.y + "px", width: item.w + "px", height: item.h + "px",
          zIndex: item.z, background: item.fill || "transparent",
          border: line && line.color && line.width ? line.width + "px solid " + line.color : "none",
          transform: transform(item)
        });
        renderText(item.text, node);
      } else if (item.type === "image") {
        node = el("img", "ppt-el ppt-image");
        node.src = IMAGE_DIR + item.src;
        node.alt = "";
        node.decoding = "async";
        node.loading = "lazy";
        style(node, {
          left: item.x + "px", top: item.y + "px", width: item.w + "px", height: item.h + "px",
          zIndex: item.z, transform: transform(item)
        });
      } else if (item.type === "line") {
        node = el("div", "ppt-el ppt-line");
        var dx = item.flipH ? -item.w : item.w;
        var dy = item.flipV ? -item.h : item.h;
        style(node, {
          left: item.x + (item.flipH ? item.w : 0) + "px",
          top: item.y + (item.flipV ? item.h : 0) + "px",
          width: Math.hypot(dx, dy) + "px",
          zIndex: item.z,
          borderTop: (item.width || 1) + "px solid " + (item.color || "#94a3b8"),
          transform: "rotate(" + (Math.atan2(dy, dx) * 180 / Math.PI) + "deg)"
        });
      } else if (item.type === "table") {
        node = el("table", "ppt-el ppt-table");
        style(node, {
          left: item.x + "px", top: item.y + "px", width: item.w + "px", height: item.h + "px", zIndex: item.z
        });
        var colgroup = el("colgroup");
        var total = (item.cols || []).reduce(function (a, b) { return a + b; }, 0) || 1;
        (item.cols || []).forEach(function (w) {
          var col = el("col");
          col.style.width = (w / total * 100) + "%";
          colgroup.appendChild(col);
        });
        node.appendChild(colgroup);
        (item.rows || []).forEach(function (row) {
          var tr = el("tr");
          tr.style.height = row.h + "px";
          (row.cells || []).forEach(function (cell) {
            var td = el("td");
            td.style.background = cell.fill || "#fff";
            renderText(cell.text, td);
            tr.appendChild(td);
          });
          node.appendChild(tr);
        });
      }
      if (node) canvas.appendChild(node);
    }
    function renderSlide(i) {
      var slide = slides[i];
      canvas.replaceChildren();
      canvas.style.background = slide.background || "#fff";
      canvas.classList.toggle("slide-dark", i === 14);
      (slide.code || []).forEach(function (block) {
        var pre = el("pre", "code-block");
        pre.textContent = block[4];
        style(pre, { left: block[0] + "px", top: block[1] + "px", width: block[2] + "px", height: block[3] + "px" });
        canvas.appendChild(pre);
      });
      (slide.elements || []).forEach(renderElement);
    }
    function preload(i) {
      if (i < 0 || i >= slides.length) return;
      (slides[i].elements || []).forEach(function (item) {
        if (item.type !== "image" || !item.src) return;
        var img = new Image();
        img.src = IMAGE_DIR + item.src;
      });
    }

    // ---- Common frame controller (shared by every page) ----
    slides.forEach(function (slide, i) {
      var btn = el("button");
      btn.type = "button";
      btn.tabIndex = i ? -1 : 0;
      var no = el("span", "toc-no");
      no.textContent = String(i + 1).padStart(2, "0");
      var label = el("span");
      label.textContent = slide.title || ("페이지 " + (i + 1));
      btn.appendChild(no);
      btn.appendChild(label);
      btn.addEventListener("click", function () { show(i, false); });
      toc.appendChild(btn);
    });
    var buttons = Array.prototype.slice.call(toc.querySelectorAll("button"));

    function fit() {
      var rect = stage.getBoundingClientRect();
      var scale = Math.min(rect.width / 1600, rect.height / 900);
      canvas.style.transform = "translate(-50%, -50%) scale(" + scale + ")";
    }
    function show(i, focusToc) {
      index = Math.max(0, Math.min(slides.length - 1, i));
      renderSlide(index);
      buttons.forEach(function (btn, n) {
        var active = n === index;
        btn.classList.toggle("active", active);
        btn.tabIndex = active ? 0 : -1;
        btn.setAttribute("aria-current", active ? "page" : "false");
      });
      buttons[index].scrollIntoView({ block: "nearest", inline: "nearest" });
      progressText.textContent = String(index + 1).padStart(2, "0") + " / " + slides.length;
      progressBar.style.width = ((index + 1) / slides.length * 100) + "%";
      progressTrack.setAttribute("aria-valuenow", String(index + 1));
      stage.classList.toggle("stage-last", index === slides.length - 1);
      stage.setAttribute("aria-label", index === slides.length - 1 ? "마지막 페이지" : "현재 페이지. 클릭하면 다음 페이지로 이동합니다");
      document.title = (slides[index].title || "RAG") + " | RAG 챗봇 구축 가이드";
      if (focusToc) buttons[index].focus({ preventScroll: true });
      fit();
      preload(index + 1);
    }
    function move(delta, focusToc) {
      var next = Math.max(0, Math.min(slides.length - 1, index + delta));
      if (next !== index) show(next, focusToc);
    }

    stage.addEventListener("click", function () { if (index < slides.length - 1) show(index + 1, false); });
    stage.addEventListener("keydown", function (e) {
      if ((e.key === "Enter" || e.key === " ") && index < slides.length - 1) {
        e.preventDefault();
        show(index + 1, false);
      }
    });
    toc.addEventListener("keydown", function (e) {
      if (!["ArrowDown","ArrowUp","ArrowRight","ArrowLeft","PageDown","PageUp","Home","End"].includes(e.key)) return;
      e.preventDefault();
      e.stopPropagation();
      if (e.key === "Home") return show(0, true);
      if (e.key === "End") return show(slides.length - 1, true);
      move(["ArrowDown","ArrowRight","PageDown"].includes(e.key) ? 1 : -1, true);
    });
    document.addEventListener("keydown", function (e) {
      if (e.defaultPrevented || e.target.closest("a,button,input,textarea,select")) return;
      if (["ArrowDown","ArrowRight","PageDown"].includes(e.key)) { e.preventDefault(); move(1, false); }
      if (["ArrowUp","ArrowLeft","PageUp"].includes(e.key)) { e.preventDefault(); move(-1, false); }
      if (e.key === "Home") { e.preventDefault(); show(0, false); }
      if (e.key === "End") { e.preventDefault(); show(slides.length - 1, false); }
    });
    new ResizeObserver(fit).observe(stage);
    show(0, false);
  </script>
</body>
</html>
`;

writeFileSync(htmlPath, out, "utf8");
console.log(
  JSON.stringify(
    {
      slides: n,
      removedPng,
      usedImages: usedImages.size,
      beforeBytes: html.length,
      afterBytes: out.length,
      savedBytes: html.length - out.length,
      savedPct: Math.round((1 - out.length / html.length) * 100),
      droppedTitlesArray: titlesAt >= 0,
    },
    null,
    2,
  ),
);
