/**
 * Premium frames: AI cute backgrounds + LARGE photo holes that still SHOW design.
 * - Photo width ~92% (big face, not tiny window)
 * - Visible pattern: top banner, bottom footer, side strips, gaps between shots
 * - Corner stickers + name so templates look designed, not empty white boxes
 */
import sharp from "sharp";
import fs from "fs";
import path from "path";

const SESSION_IMG =
  "C:\\Users\\aldii\\.grok\\sessions\\C%3A%5Cprojects%5Cphotobox\\019f5c19-6b12-7fc0-ba68-da0d7b13d6d4\\images";
const BG_DIR = path.resolve("public/frames/bgs");
const OUT = path.resolve("public/frames/by-count");
const CATALOG = path.resolve("public/frames/catalog.json");
const VER = "v3"; // cache bust

const THEMES = [
  { file: "83.jpg", id: "coquette-pink", name: "Coquette Pink", tag: "Premium · Coquette", bg: "#FFF0F5", ink: "#8B2A50", accent: "#FF8FB5", border: "#FF5C9A" },
  { file: "81.jpg", id: "coquette-noir", name: "Noir Bow", tag: "Premium · Coquette", bg: "#1A1A1A", ink: "#FFE0EC", accent: "#FF8FB5", border: "#FF8FB5" },
  { file: "86.jpg", id: "lucky-charm", name: "Lucky Charm", tag: "Premium · Y2K", bg: "#FFE566", ink: "#C2185B", accent: "#FF8FB5", border: "#FF5C9A" },
  { file: "85.jpg", id: "bliss-pop", name: "Bliss Pop", tag: "Premium · Y2K", bg: "#B8DFFF", ink: "#C2185B", accent: "#FF6B9D", border: "#FF2E8A" },
  { file: "84.jpg", id: "strawberry", name: "Strawberry Snap", tag: "Premium · Berry", bg: "#FFD6E8", ink: "#B83D6E", accent: "#FF6B9D", border: "#E83D7A" },
  { file: "82.jpg", id: "kyowo-cat", name: "Kyowo Cat", tag: "Premium · Cat", bg: "#FFE8D0", ink: "#E85A8C", accent: "#FFAB91", border: "#FF8A65" },
  { file: "92.jpg", id: "night-meow", name: "Night Meow", tag: "Premium · Dark", bg: "#1A1A2E", ink: "#FFE0F0", accent: "#C9B6FF", border: "#C9B6FF" },
  { file: "91.jpg", id: "sakura", name: "Sakura Lane", tag: "Premium · Floral", bg: "#FFF5F8", ink: "#880E4F", accent: "#F8BBD0", border: "#F06292" },
  { file: "88.jpg", id: "matcha", name: "Matcha Mood", tag: "Premium · Calm", bg: "#F1F8E9", ink: "#33691E", accent: "#AED581", border: "#7CB342" },
  { file: "87.jpg", id: "lavender", name: "Lavender Dream", tag: "Premium · Dreamy", bg: "#F3E5F5", ink: "#6A1B9A", accent: "#CE93D8", border: "#AB47BC" },
  { file: "89.jpg", id: "honey", name: "Honey Cream", tag: "Premium · Warm", bg: "#FFF8E1", ink: "#E65100", accent: "#FFD54F", border: "#F9A825" },
  { file: "90.jpg", id: "bubblegum", name: "Bubblegum", tag: "Premium · Pop", bg: "#FCE4EC", ink: "#AD1457", accent: "#F48FB1", border: "#EC407A" },
];

/** Large photos + visible design chrome */
function layout(shots) {
  const W = 720;
  // taller canvas so photos stay big even with header/footer
  const H = shots === 2 ? 1180 : shots === 3 ? 1520 : 1860;
  const padX = 22; // ~93.9% width — still BIG
  const padTop = 58; // header band for bows / pattern
  const padBot = 70; // footer for name
  const gap = 16; // pattern strip BETWEEN photos (design shows)
  const holeW = W - padX * 2;
  const holeH = Math.floor((H - padTop - padBot - gap * (shots - 1)) / shots);
  const r = 18;
  return { W, H, padX, padTop, padBot, gap, holeW, holeH, r };
}

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function decorSvg(theme, W, H) {
  // Corner motifs + footer title — sits on chrome, not over holes
  const c = theme.border;
  const ink = theme.ink;
  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <!-- header accent line -->
  <rect x="40" y="18" width="${W - 80}" height="4" rx="2" fill="${c}" opacity="0.45"/>
  <!-- bows top -->
  <g transform="translate(36,34) scale(1.15)">
    <ellipse cx="-10" cy="0" rx="12" ry="8" fill="${c}"/>
    <ellipse cx="10" cy="0" rx="12" ry="8" fill="${c}"/>
    <ellipse cx="0" cy="0" rx="5" ry="5" fill="${c}"/>
    <path d="M-3 2 L-7 14 L0 8 L7 14 L3 2" fill="${c}"/>
  </g>
  <g transform="translate(${W - 36},34) scale(1.15)">
    <ellipse cx="-10" cy="0" rx="12" ry="8" fill="${c}"/>
    <ellipse cx="10" cy="0" rx="12" ry="8" fill="${c}"/>
    <ellipse cx="0" cy="0" rx="5" ry="5" fill="${c}"/>
    <path d="M-3 2 L-7 14 L0 8 L7 14 L3 2" fill="${c}"/>
  </g>
  <!-- heart center header -->
  <path d="M${W / 2} 42 C${W / 2 - 10} 32 ${W / 2 - 10} 24 ${W / 2} 28 C${W / 2 + 10} 24 ${W / 2 + 10} 32 ${W / 2} 42Z" fill="${c}" opacity="0.9"/>
  <!-- footer band -->
  <rect x="24" y="${H - 58}" width="${W - 48}" height="42" rx="12" fill="#ffffff" opacity="0.55"/>
  <text x="${W / 2}" y="${H - 30}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="22" font-weight="700" fill="${ink}">${theme.name}</text>
  <!-- bottom bows -->
  <g transform="translate(40,${H - 28}) scale(0.9)">
    <ellipse cx="-9" cy="0" rx="10" ry="7" fill="${c}"/>
    <ellipse cx="9" cy="0" rx="10" ry="7" fill="${c}"/>
    <ellipse cx="0" cy="0" rx="4" ry="4" fill="${c}"/>
  </g>
  <g transform="translate(${W - 40},${H - 28}) scale(0.9)">
    <ellipse cx="-9" cy="0" rx="10" ry="7" fill="${c}"/>
    <ellipse cx="9" cy="0" rx="10" ry="7" fill="${c}"/>
    <ellipse cx="0" cy="0" rx="4" ry="4" fill="${c}"/>
  </g>
  <!-- outer border -->
  <rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="26" fill="none" stroke="${c}" stroke-width="5" opacity="0.55"/>
</svg>`);
}

function inRoundRect(px, py, rx, ry, rw, rh, rad) {
  if (px < rx || py < ry || px >= rx + rw || py >= ry + rh) return false;
  const lx = px - rx;
  const ly = py - ry;
  if (lx < rad && ly < rad) {
    const dx = rad - lx,
      dy = rad - ly;
    return dx * dx + dy * dy <= rad * rad;
  }
  if (lx >= rw - rad && ly < rad) {
    const dx = lx - (rw - rad),
      dy = rad - ly;
    return dx * dx + dy * dy <= rad * rad;
  }
  if (lx < rad && ly >= rh - rad) {
    const dx = rad - lx,
      dy = ly - (rh - rad);
    return dx * dx + dy * dy <= rad * rad;
  }
  if (lx >= rw - rad && ly >= rh - rad) {
    const dx = lx - (rw - rad),
      dy = ly - (rh - rad);
    return dx * dx + dy * dy <= rad * rad;
  }
  return true;
}

async function prepareBg(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  await sharp(src)
    .rotate()
    .resize(720, 1860, { fit: "cover", position: "centre" })
    .jpeg({ quality: 92 })
    .toFile(dest);
}

async function buildFrame(theme, shots, bgPath) {
  const { W, H, padX, padTop, gap, holeW, holeH, r } = layout(shots);
  const slots = [];
  const holeRects = [];

  for (let i = 0; i < shots; i++) {
    const y = padTop + i * (holeH + gap);
    holeRects.push({ x: padX, y, w: holeW, h: holeH });
    slots.push({
      x: +((padX / W) * 100).toFixed(2),
      y: +((y / H) * 100).toFixed(2),
      w: +((holeW / W) * 100).toFixed(2),
      h: +((holeH / H) * 100).toFixed(2),
    });
  }

  // Base: AI background
  let base = await sharp(bgPath)
    .resize(W, H, { fit: "cover", position: "centre" })
    .ensureAlpha()
    .png()
    .toBuffer();

  // Composite decor SVG (bows, footer, border)
  const decor = await sharp(decorSvg(theme, W, H)).png().toBuffer();
  base = await sharp(base)
    .composite([{ input: decor, top: 0, left: 0 }])
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = base;
  const { width, height, channels } = info;
  const br = hexToRgb(theme.border);
  const outer = 8;

  for (const hole of holeRects) {
    for (let y = hole.y - outer; y < hole.y + hole.h + outer; y++) {
      for (let x = hole.x - outer; x < hole.x + hole.w + outer; x++) {
        if (x < 0 || y < 0 || x >= width || y >= height) continue;
        const o = (y * width + x) * channels;
        const inside = inRoundRect(x, y, hole.x, hole.y, hole.w, hole.h, r);
        const inBorder = inRoundRect(
          x,
          y,
          hole.x - outer,
          hole.y - outer,
          hole.w + outer * 2,
          hole.h + outer * 2,
          r + 5,
        );
        if (inside) {
          data[o] = 255;
          data[o + 1] = 255;
          data[o + 2] = 255;
          data[o + 3] = 0;
        } else if (inBorder) {
          data[o] = br.r;
          data[o + 1] = br.g;
          data[o + 2] = br.b;
          data[o + 3] = 255;
        }
      }
    }
  }

  // soft white inner rim on border (1px)
  for (const hole of holeRects) {
    for (let y = hole.y - 2; y < hole.y + hole.h + 2; y++) {
      for (let x = hole.x - 2; x < hole.x + hole.w + 2; x++) {
        if (x < 0 || y < 0 || x >= width || y >= height) continue;
        const inside = inRoundRect(x, y, hole.x, hole.y, hole.w, hole.h, r);
        const justOutside =
          !inside &&
          inRoundRect(x, y, hole.x - 2, hole.y - 2, hole.w + 4, hole.h + 4, r + 2);
        if (justOutside) {
          const o = (y * width + x) * channels;
          data[o] = 255;
          data[o + 1] = 255;
          data[o + 2] = 255;
          data[o + 3] = 200;
        }
      }
    }
  }

  const pngBuf = await sharp(data, {
    raw: { width, height, channels },
  })
    .png()
    .toBuffer();

  return { pngBuf, slots, W, H };
}

// wipe old by-count completely
for (const n of [2, 3, 4, 6]) {
  fs.rmSync(path.join(OUT, String(n)), { recursive: true, force: true });
}
for (const n of [2, 3, 4]) {
  fs.mkdirSync(path.join(OUT, String(n)), { recursive: true });
}
fs.mkdirSync(BG_DIR, { recursive: true });

for (const t of THEMES) {
  const src = path.join(SESSION_IMG, t.file);
  if (!fs.existsSync(src)) {
    // fallback to already prepared bg
    const existing = path.join(BG_DIR, `${t.id}.jpg`);
    if (!fs.existsSync(existing)) {
      console.error("MISSING", t.file);
      process.exit(1);
    }
    console.log("reuse bg", t.id);
    continue;
  }
  await prepareBg(src, path.join(BG_DIR, `${t.id}.jpg`));
  console.log("bg", t.id);
}

const catalog = [];

for (const theme of THEMES) {
  const bgPath = path.join(BG_DIR, `${theme.id}.jpg`);
  for (const shots of [2, 3, 4]) {
    const id = `prem-${shots}s-${theme.id}`;
    const { pngBuf, slots } = await buildFrame(theme, shots, bgPath);
    const dir = path.join(OUT, String(shots));
    fs.writeFileSync(path.join(dir, `${id}.png`), pngBuf);
    await sharp(pngBuf)
      .resize({ width: 280 })
      .jpeg({ quality: 90 })
      .toFile(path.join(dir, `${id}-thumb.jpg`));

    if (slots[0].w < 88) {
      console.error("FAIL small hole", id, slots[0].w);
      process.exit(1);
    }

    catalog.push({
      id,
      name: theme.name,
      tag: theme.tag,
      shots,
      overlay: `/frames/by-count/${shots}/${id}.png?${VER}`,
      thumb: `/frames/by-count/${shots}/${id}-thumb.jpg?${VER}`,
      slots,
      bg: theme.bg,
      ink: theme.ink,
      accent: theme.accent,
    });
    console.log("✓", id, `w=${slots[0].w}% h=${slots[0].h}%`);
  }
}

catalog.sort((a, b) => a.shots - b.shots || a.name.localeCompare(b.name));
fs.writeFileSync(CATALOG, JSON.stringify(catalog, null, 2));
console.log("\nDONE", catalog.length);
console.log("sample", catalog[0].slots[0]);
console.log(
  [2, 3, 4]
    .map((n) => `${n}=${catalog.filter((c) => c.shots === n).length}`)
    .join(" "),
);
