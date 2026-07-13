/**
 * ZERO empty side margins.
 * Photo holes = almost full strip width (~96.5%).
 * Only a thin colored stroke + tiny footer strip — no empty chrome.
 */
import sharp from "sharp";
import fs from "fs";
import path from "path";

const SESSION =
  "C:\\Users\\aldii\\.grok\\sessions\\C%3A%5Cprojects%5Cphotobox\\019f5c19-6b12-7fc0-ba68-da0d7b13d6d4\\images";
const OUT = path.resolve("public/frames/by-count");
const CATALOG = path.resolve("public/frames/catalog.json");
const VER = "edge11";

// Edge-to-edge: ~8px side each → hole ~97.8%. Almost no empty chrome.
const PAD_X_PX = 8;
const PAD_TOP = 0.008;
const PAD_BOT = 0.038; // name strip only
const GAP = 0.006;

const FRAMES = [
  { file: "132.jpg", id: "premium-xoxo-four", name: "xoxo Four", tag: "Premium · Bow", shots: 4, bg: "#FFF0F5", ink: "#C2185B", accent: "#FF5C9A" },
  { file: "134.jpg", id: "premium-kyowo-cat", name: "Kyowo Cat", tag: "Premium · Cat", shots: 4, bg: "#FFE8D0", ink: "#E85A8C", accent: "#FFB86B" },
  { file: "137.jpg", id: "premium-night-meow", name: "Night Meow", tag: "Premium · Dark", shots: 4, bg: "#151528", ink: "#FFE0F0", accent: "#C9B6FF" },
  { file: "142.jpg", id: "premium-garden-bloom", name: "Garden Bloom", tag: "Premium · Floral", shots: 4, bg: "#FFF0F5", ink: "#C45C7A", accent: "#FF8FB5" },
  { file: "138.jpg", id: "premium-lucky-garden", name: "Lucky Garden", tag: "Premium · Mint", shots: 4, bg: "#E8F5E9", ink: "#2E7D32", accent: "#66BB6A" },
  { file: "113.jpg", id: "premium-kiss-tell", name: "Kiss Tell", tag: "Premium · Coquette", shots: 4, bg: "#FFF0F5", ink: "#C2185B", accent: "#FF80AB" },
  { file: "114.jpg", id: "premium-meow-four", name: "Meow Four", tag: "Premium · Cat", shots: 4, bg: "#FFE8D0", ink: "#E85A8C", accent: "#FFAB91" },
  { file: "126.jpg", id: "premium-bubblegum-four", name: "Bubblegum Four", tag: "Premium · Pop", shots: 4, bg: "#FCE4EC", ink: "#AD1457", accent: "#F48FB1" },

  { file: "136.jpg", id: "premium-lucky-charm", name: "Lucky Charm", tag: "Premium · Heart", shots: 3, bg: "#FFF59D", ink: "#C2185B", accent: "#FF8FB5" },
  { file: "135.jpg", id: "premium-bliss-pop", name: "Bliss Pop!", tag: "Premium · Y2K", shots: 3, bg: "#BBDEFB", ink: "#C2185B", accent: "#FF6B9D" },
  { file: "139.jpg", id: "premium-berry-cafe", name: "Strawberry Cafe", tag: "Premium · Berry", shots: 3, bg: "#FCE4EC", ink: "#AD1457", accent: "#FF6B9D" },
  { file: "115.jpg", id: "premium-lucky-three", name: "Lucky Three", tag: "Premium · Heart", shots: 3, bg: "#FFF59D", ink: "#C2185B", accent: "#FF8FB5" },
  { file: "118.jpg", id: "premium-bliss-three", name: "Bliss Three", tag: "Premium · Y2K", shots: 3, bg: "#BBDEFB", ink: "#C2185B", accent: "#FF6B9D" },
  { file: "128.jpg", id: "premium-lavender", name: "Lavender Dream", tag: "Premium · Dreamy", shots: 3, bg: "#F3E5F5", ink: "#6A1B9A", accent: "#CE93D8" },

  { file: "133.jpg", id: "premium-xoxo-duo", name: "xoxo Duo", tag: "Premium · Bow", shots: 2, bg: "#FFF0F5", ink: "#C2185B", accent: "#FF5C9A" },
  { file: "141.jpg", id: "premium-kyowo-duo", name: "Kyowo Duo", tag: "Premium · Cat", shots: 2, bg: "#FFE8D0", ink: "#E85A8C", accent: "#FFB86B" },
  { file: "140.jpg", id: "premium-lucky-duo", name: "Lucky Duo", tag: "Premium · Heart", shots: 2, bg: "#FFF59D", ink: "#C2185B", accent: "#FF8FB5" },
  { file: "124.jpg", id: "premium-bow-duo", name: "Bow Duo", tag: "Premium · Bow", shots: 2, bg: "#FFF0F5", ink: "#C2185B", accent: "#FF5C9A" },
  { file: "130.jpg", id: "premium-y2k-duo", name: "Y2K Duo", tag: "Premium · Y2K", shots: 2, bg: "#BBDEFB", ink: "#C2185B", accent: "#FF6B9D" },
  { file: "129.jpg", id: "premium-berry-duo", name: "Berry Duo", tag: "Premium · Berry", shots: 2, bg: "#FCE4EC", ink: "#AD1457", accent: "#FF6B9D" },
];

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function inRoundRect(px, py, rx, ry, rw, rh, rad) {
  if (px < rx || py < ry || px >= rx + rw || py >= ry + rh) return false;
  const lx = px - rx,
    ly = py - ry;
  if (lx >= rad && lx < rw - rad) return true;
  if (ly >= rad && ly < rh - rad) return true;
  let dx = 0,
    dy = 0;
  if (lx < rad) dx = rad - lx;
  else if (lx >= rw - rad) dx = lx - (rw - rad);
  if (ly < rad) dy = rad - ly;
  else if (ly >= rh - rad) dy = ly - (rh - rad);
  if (dx === 0 || dy === 0) return true;
  return dx * dx + dy * dy <= rad * rad;
}

function layout(shots, W, H) {
  const padX = PAD_X_PX;
  const holeW = W - padX * 2;
  const padTop = Math.max(6, Math.round(H * PAD_TOP));
  const padBot = Math.max(28, Math.round(H * PAD_BOT));
  const gap = Math.max(4, Math.round(H * GAP));
  const holeH = Math.floor((H - padTop - padBot - gap * (shots - 1)) / shots);
  const slots = [];
  for (let i = 0; i < shots; i++) {
    const y = padTop + i * (holeH + gap);
    slots.push({
      x: padX,
      y,
      w: holeW,
      h: holeH,
      xp: +((padX / W) * 100).toFixed(2),
      yp: +((y / H) * 100).toFixed(2),
      wp: +((holeW / W) * 100).toFixed(2),
      hp: +((holeH / H) * 100).toFixed(2),
    });
  }
  return slots;
}

function chromeSvg(W, H, name, ink, accent, padBot) {
  // Footer strip only — no side chrome
  const fy = H - padBot;
  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="${fy}" width="${W}" height="${padBot}" fill="${accent}" opacity="0.18"/>
  <text x="${W / 2}" y="${H - Math.round(padBot * 0.35)}" text-anchor="middle"
    font-family="Georgia, 'Times New Roman', serif" font-size="18"
    font-weight="700" fill="${ink}">${esc(name)}</text>
</svg>`);
}

async function buildOne(item) {
  const src = path.join(SESSION, item.file);
  if (!fs.existsSync(src)) throw new Error("missing " + item.file);

  const W = 720;
  const H = item.shots === 2 ? 1080 : item.shots === 3 ? 1340 : 1580;

  // Solid bg color fill first, then light AI texture only on footer zone
  const bg = hexToRgb(item.bg);
  const br = hexToRgb(item.accent);

  // Solid accent chrome only — no empty side panels, no wide AI margins
  const padBot = Math.max(28, Math.round(H * PAD_BOT));
  const padTop = Math.max(6, Math.round(H * PAD_TOP));

  let base = await sharp({
    create: {
      width: W,
      height: H,
      channels: 4,
      background: { r: br.r, g: br.g, b: br.b, alpha: 1 },
    },
  })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = base;
  const { width, height, channels } = info;
  const slotsPx = layout(item.shots, width, height);
  const r = 10;
  const borderW = 4;

  // Entire frame starts as accent color (gaps + edges filled — zero empty dead space)
  // Punch photo holes only
  for (const s of slotsPx) {
    for (let y = s.y; y < s.y + s.h; y++) {
      for (let x = s.x; x < s.x + s.w; x++) {
        if (x < 0 || y < 0 || x >= width || y >= height) continue;
        const o = (y * width + x) * channels;
        if (inRoundRect(x, y, s.x, s.y, s.w, s.h, r)) {
          data[o] = 255;
          data[o + 1] = 255;
          data[o + 2] = 255;
          data[o + 3] = 0;
        }
      }
    }
    // white highlight ring just inside border (1px)
    for (let y = s.y; y < s.y + s.h; y++) {
      for (let x = s.x; x < s.x + s.w; x++) {
        const inside = inRoundRect(x, y, s.x, s.y, s.w, s.h, r);
        const inner = inRoundRect(
          x,
          y,
          s.x + 2,
          s.y + 2,
          s.w - 4,
          s.h - 4,
          Math.max(4, r - 2),
        );
        if (inside && !inner) {
          const o = (y * width + x) * channels;
          // keep transparent hole — ring is the opaque gap between holes which is accent
        }
      }
    }
  }

  let png = await sharp(data, { raw: { width, height, channels } })
    .png()
    .toBuffer();

  const chrome = await sharp(
    chromeSvg(width, height, item.name, item.ink, item.accent, padBot),
  )
    .png()
    .toBuffer();
  png = await sharp(png)
    .composite([{ input: chrome, top: 0, left: 0 }])
    .png()
    .toBuffer();

  const dir = path.join(OUT, String(item.shots));
  fs.mkdirSync(dir, { recursive: true });
  const dest = path.join(dir, `${item.id}.png`);
  fs.writeFileSync(dest, png);
  await sharp(png)
    .resize({ width: 280 })
    .jpeg({ quality: 90 })
    .toFile(path.join(dir, `${item.id}-thumb.jpg`));

  return {
    id: item.id,
    name: item.name,
    tag: item.tag,
    shots: item.shots,
    overlay: `/frames/by-count/${item.shots}/${item.id}.png?${VER}`,
    thumb: `/frames/by-count/${item.shots}/${item.id}-thumb.jpg?${VER}`,
    slots: slotsPx.map((s) => ({
      x: s.xp,
      y: s.yp,
      w: s.wp,
      h: s.hp,
    })),
    bg: item.bg,
    ink: item.ink,
    accent: item.accent,
    canvasW: width,
    canvasH: height,
  };
}

for (const n of [2, 3, 4]) {
  fs.rmSync(path.join(OUT, String(n)), { recursive: true, force: true });
  fs.mkdirSync(path.join(OUT, String(n)), { recursive: true });
}

const catalog = [];
for (const item of FRAMES) {
  if (!fs.existsSync(path.join(SESSION, item.file))) {
    console.log("skip missing", item.file);
    continue;
  }
  try {
    const entry = await buildOne(item);
    console.log(
      "✓",
      entry.id,
      `${entry.shots}s`,
      `w=${entry.slots[0].w}%`,
      `x=${entry.slots[0].x}%`,
      `h=${entry.slots[0].h}%`,
    );
    catalog.push(entry);
  } catch (e) {
    console.error("fail", item.id, e.message);
  }
}

catalog.sort((a, b) => a.shots - b.shots || a.name.localeCompare(b.name));
fs.writeFileSync(CATALOG, JSON.stringify(catalog, null, 2));
console.log(
  "\nEDGE-TO-EDGE",
  catalog.length,
  [2, 3, 4]
    .map((n) => `${n}=${catalog.filter((c) => c.shots === n).length}`)
    .join(" "),
);
console.log("hole w=", catalog[0]?.slots[0]?.w + "%  side=", catalog[0]?.slots[0]?.x + "%");
if (!catalog[0] || catalog[0].slots[0].w < 96) {
  console.error("FAIL: still too much side margin");
  process.exit(1);
}
