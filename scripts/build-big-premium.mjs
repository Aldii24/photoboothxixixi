/**
 * Build catalog from AI-edited LARGE-window premium frames.
 * Detect holes; if still < 68% width, force-expand to ~76% keeping edge décor.
 */
import sharp from "sharp";
import fs from "fs";
import path from "path";

const SESSION =
  "C:\\Users\\aldii\\.grok\\sessions\\C%3A%5Cprojects%5Cphotobox\\019f5c19-6b12-7fc0-ba68-da0d7b13d6d4\\images";
const OUT = path.resolve("public/frames/by-count");
const CATALOG = path.resolve("public/frames/catalog.json");
const VER = "xl6";

const FRAMES = [
  { file: "98.jpg", id: "premium-xoxo-four", name: "xoxo Four", tag: "Premium · Bow", shots: 4, bg: "#FFE8F0", ink: "#5c2a45", accent: "#FF5C9A" },
  { file: "102.jpg", id: "premium-coquette-xoxo", name: "Coquette xoxo", tag: "Premium · Bow", shots: 4, bg: "#FFE8F0", ink: "#5c2a45", accent: "#FF5C9A" },
  { file: "104.jpg", id: "premium-kyowo-cat", name: "Kyowo Cat", tag: "Premium · Cat", shots: 4, bg: "#FFE8D0", ink: "#E85A8C", accent: "#FFB86B" },
  { file: "99.jpg", id: "premium-night-meow", name: "Night Meow", tag: "Premium · Dark", shots: 4, bg: "#151528", ink: "#FFE0F0", accent: "#C9B6FF" },
  { file: "111.jpg", id: "premium-night-four", name: "Night Four", tag: "Premium · Dark", shots: 4, bg: "#151528", ink: "#FFE0F0", accent: "#C9B6FF" },
  { file: "110.jpg", id: "premium-garden-bloom", name: "Garden Bloom", tag: "Premium · Floral", shots: 4, bg: "#FFF0F5", ink: "#C45C7A", accent: "#FF8FB5" },
  { file: "106.jpg", id: "premium-lucky-garden", name: "Lucky Garden", tag: "Premium · Mint", shots: 4, bg: "#B8F0C8", ink: "#2b5c40", accent: "#6BCB77" },
  { file: "105.jpg", id: "premium-mirror-mood", name: "Mirror Mood", tag: "Premium · Coquette", shots: 4, bg: "#FFC8DC", ink: "#5c2a45", accent: "#FF8FB5" },
  { file: "101.jpg", id: "premium-lucky-charm", name: "Lucky Charm", tag: "Premium · Heart", shots: 3, bg: "#F5E06A", ink: "#E83D7A", accent: "#FF8FB5" },
  { file: "100.jpg", id: "premium-bliss-pop", name: "Bliss Pop!", tag: "Premium · Y2K", shots: 3, bg: "#A8D8FF", ink: "#FF2E8A", accent: "#6BB0FF" },
  { file: "103.jpg", id: "premium-berry-cafe", name: "Strawberry Cafe", tag: "Premium · Berry", shots: 3, bg: "#FFD6E8", ink: "#B83D6E", accent: "#FF6B9D" },
  { file: "107.jpg", id: "premium-happy-day", name: "Happy Day", tag: "Premium · Fun", shots: 3, bg: "#FFE566", ink: "#1E5A8A", accent: "#5B9DFF" },
  { file: "109.jpg", id: "premium-lucky-duo", name: "Lucky Duo", tag: "Premium · Heart", shots: 2, bg: "#F5E06A", ink: "#E83D7A", accent: "#FF8FB5" },
  { file: "108.jpg", id: "premium-kyowo-duo", name: "Kyowo Duo", tag: "Premium · Cat", shots: 2, bg: "#FFE8D0", ink: "#E85A8C", accent: "#FFB86B" },
  { file: "112.jpg", id: "premium-bliss-duo", name: "Bliss Duo", tag: "Premium · Y2K", shots: 2, bg: "#A8D8FF", ink: "#FF2E8A", accent: "#6BB0FF" },
];

const TARGET_W = 0.76;

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
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

async function processRaw(src) {
  const { data, info } = await sharp(src)
    .ensureAlpha()
    .resize({ width: 720 })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  for (let i = 0; i < width * height; i++) {
    const o = i * channels;
    const r = data[o],
      g = data[o + 1],
      b = data[o + 2],
      a = data[o + 3];
    if (a < 40) {
      data[o] = 255;
      data[o + 1] = 255;
      data[o + 2] = 255;
      data[o + 3] = 0;
      continue;
    }
    const sat = Math.max(r, g, b) - Math.min(r, g, b);
    if (r >= 236 && g >= 236 && b >= 236 && sat <= 16) data[o + 3] = 0;
    else if (r >= 225 && g >= 225 && b >= 225 && sat <= 12)
      data[o + 3] = Math.min(255, (240 - Math.min(r, g, b)) * 15);
    else data[o + 3] = 255;
  }
  return { data, width, height, channels };
}

function detectHoles(data, width, height, channels, want) {
  const mask = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    mask[i] = data[i * channels + 3] < 55 ? 1 : 0;
  }
  const visited = new Uint8Array(width * height);
  const boxes = [];
  function flood(sx, sy) {
    let minX = sx,
      maxX = sx,
      minY = sy,
      maxY = sy,
      count = 0;
    const st = [[sx, sy]];
    visited[sy * width + sx] = 1;
    while (st.length) {
      const [x, y] = st.pop();
      count++;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const nx = x + dx,
          ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const ni = ny * width + nx;
        if (visited[ni] || !mask[ni]) continue;
        visited[ni] = 1;
        st.push([nx, ny]);
      }
    }
    return { minX, maxX, minY, maxY, count };
  }
  const area = width * height;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      if (!mask[i] || visited[i]) continue;
      const b = flood(x, y);
      const bw = b.maxX - b.minX,
        bh = b.maxY - b.minY;
      if (b.count < area * 0.008) continue;
      if (b.count > area * 0.45) continue;
      if (bw < width * 0.2) continue;
      if (bh < height * 0.05) continue;
      if (bh > height * 0.55) continue;
      boxes.push(b);
    }
  }
  boxes.sort((a, b) => a.minY - b.minY);
  let chosen = boxes;
  if (boxes.length > want)
    chosen = [...boxes]
      .sort((a, b) => b.count - a.count)
      .slice(0, want)
      .sort((a, b) => a.minY - b.minY);
  return chosen;
}

function forceExpand(data, width, height, channels, shots, accent) {
  // fill old holes with bg from (8,8)
  const so = (8 * width + 8) * channels;
  const bg = [data[so], data[so + 1], data[so + 2]];
  for (let i = 0; i < width * height; i++) {
    const o = i * channels;
    if (data[o + 3] < 55) {
      data[o] = bg[0];
      data[o + 1] = bg[1];
      data[o + 2] = bg[2];
      data[o + 3] = 255;
    } else data[o + 3] = 255;
  }

  const holeW = Math.round(width * TARGET_W);
  const padX = Math.round((width - holeW) / 2);
  // keep more room for title footer / header décor
  const padTop = Math.round(height * 0.08);
  const padBot = Math.round(height * 0.12);
  const gap = Math.round(height * 0.015);
  const holeH = Math.floor(
    (height - padTop - padBot - gap * (shots - 1)) / shots,
  );
  const r = Math.round(width * 0.03);
  const borderW = Math.max(6, Math.round(width * 0.011));
  const br = hexToRgb(accent);

  const slots = [];
  for (let i = 0; i < shots; i++) {
    const y = padTop + i * (holeH + gap);
    const x = padX;
    for (let py = y - borderW - 1; py < y + holeH + borderW + 1; py++) {
      for (let px = x - borderW - 1; px < x + holeW + borderW + 1; px++) {
        if (px < 0 || py < 0 || px >= width || py >= height) continue;
        const o = (py * width + px) * channels;
        const inside = inRoundRect(px, py, x, y, holeW, holeH, r);
        const outer = inRoundRect(
          px,
          py,
          x - borderW,
          y - borderW,
          holeW + borderW * 2,
          holeH + borderW * 2,
          r + 3,
        );
        if (inside) {
          data[o] = 255;
          data[o + 1] = 255;
          data[o + 2] = 255;
          data[o + 3] = 0;
        } else if (outer) {
          data[o] = br.r;
          data[o + 1] = br.g;
          data[o + 2] = br.b;
          data[o + 3] = 255;
        }
      }
    }
    slots.push({
      x: +((x / width) * 100).toFixed(2),
      y: +((y / height) * 100).toFixed(2),
      w: +((holeW / width) * 100).toFixed(2),
      h: +((holeH / height) * 100).toFixed(2),
    });
  }
  return slots;
}

// wipe
for (const n of [2, 3, 4]) {
  fs.rmSync(path.join(OUT, String(n)), { recursive: true, force: true });
  fs.mkdirSync(path.join(OUT, String(n)), { recursive: true });
}

const catalog = [];

for (const item of FRAMES) {
  const src = path.join(SESSION, item.file);
  if (!fs.existsSync(src)) {
    console.log("missing", item.file);
    continue;
  }
  let { data, width, height, channels } = await processRaw(src);
  let boxes = detectHoles(data, width, height, channels, item.shots);
  let slots;

  const avgW =
    boxes.length > 0
      ? boxes.reduce((s, b) => s + (b.maxX - b.minX + 1), 0) /
        boxes.length /
        width
      : 0;

  // Always force expand to guaranteed large windows (AI often still undersizes)
  // BUT: if AI already gave >= 70% width and correct count, keep natural art holes
  if (boxes.length === item.shots && avgW >= 0.68) {
    slots = boxes.map((b) => ({
      x: +((b.minX / width) * 100).toFixed(2),
      y: +((b.minY / height) * 100).toFixed(2),
      w: +(((b.maxX - b.minX + 1) / width) * 100).toFixed(2),
      h: +(((b.maxY - b.minY + 1) / height) * 100).toFixed(2),
    }));
    console.log(
      "✓ keep",
      item.id,
      `w=${(avgW * 100).toFixed(1)}% (AI large enough)`,
    );
  } else {
    slots = forceExpand(
      data,
      width,
      height,
      channels,
      item.shots,
      item.accent,
    );
    console.log(
      "✓ expand",
      item.id,
      `was=${(avgW * 100).toFixed(1)}% holes=${boxes.length} → w=${slots[0].w}%`,
    );
  }

  const dest = path.join(OUT, String(item.shots), `${item.id}.png`);
  await sharp(data, { raw: { width, height, channels } }).png().toFile(dest);
  await sharp(dest)
    .resize({ width: 260 })
    .jpeg({ quality: 88 })
    .toFile(dest.replace(/\.png$/, "-thumb.jpg"));

  catalog.push({
    id: item.id,
    name: item.name,
    tag: item.tag,
    shots: item.shots,
    overlay: `/frames/by-count/${item.shots}/${item.id}.png?${VER}`,
    thumb: `/frames/by-count/${item.shots}/${item.id}-thumb.jpg?${VER}`,
    slots,
    bg: item.bg,
    ink: item.ink,
    accent: item.accent,
    canvasW: width,
    canvasH: height,
  });
}

catalog.sort((a, b) => a.shots - b.shots || a.name.localeCompare(b.name));
fs.writeFileSync(CATALOG, JSON.stringify(catalog, null, 2));
console.log(
  "\nDONE",
  catalog.length,
  [2, 3, 4]
    .map((n) => `${n}=${catalog.filter((c) => c.shots === n).length}`)
    .join(" "),
);
const xoxo = catalog.find((c) => c.id === "premium-xoxo-four");
console.log("xoxo-four slots", xoxo?.slots);
