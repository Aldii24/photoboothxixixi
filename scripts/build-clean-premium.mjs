/**
 * Clean premium frames ONLY from original illustrated art.
 * - Natural photo holes only (detect transparency/white)
 * - NEVER force-expand / punch over decorations
 * - Design stays intact (bows, cats, stickers fully visible)
 */
import sharp from "sharp";
import fs from "fs";
import path from "path";

const OVERLAY = path.resolve("public/frames/overlays");
const SESSION =
  "C:\\Users\\aldii\\.grok\\sessions\\C%3A%5Cprojects%5Cphotobox\\019f5c19-6b12-7fc0-ba68-da0d7b13d6d4\\images";
const OUT = path.resolve("public/frames/by-count");
const CATALOG = path.resolve("public/frames/catalog.json");
const VER = "clean7";

/** Original designed frames — art is sacred, holes match the design */
const FRAMES = [
  // 2-shot variants from session (designed strips)
  { src: path.join(SESSION, "56.jpg"), id: "premium-lucky-duo", name: "Lucky Duo", tag: "Premium · Heart", shots: 2, bg: "#F5E06A", ink: "#E83D7A", accent: "#FF8FB5" },
  { src: path.join(SESSION, "57.jpg"), id: "premium-kyowo-duo", name: "Kyowo Duo", tag: "Premium · Cat", shots: 2, bg: "#FFE8D0", ink: "#E85A8C", accent: "#FFB86B" },
  { src: path.join(SESSION, "60.jpg"), id: "premium-bliss-duo", name: "Bliss Duo", tag: "Premium · Y2K", shots: 2, bg: "#A8D8FF", ink: "#FF2E8A", accent: "#6BB0FF" },
  { src: path.join(SESSION, "59.jpg"), id: "premium-berry-duo", name: "Berry Duo", tag: "Premium · Berry", shots: 2, bg: "#FFD6E8", ink: "#B83D6E", accent: "#FF6B9D" },
  { src: path.join(SESSION, "63.jpg"), id: "premium-happy-duo", name: "Happy Duo", tag: "Premium · Fun", shots: 2, bg: "#FFE566", ink: "#1E5A8A", accent: "#5B9DFF" },
  { src: path.join(SESSION, "64.jpg"), id: "premium-mirror-duo", name: "Mirror Duo", tag: "Premium · Coquette", shots: 2, bg: "#FFC8DC", ink: "#5c2a45", accent: "#FF8FB5" },
  { src: path.join(SESSION, "65.jpg"), id: "premium-garden-duo", name: "Bloom Duo", tag: "Premium · Floral", shots: 2, bg: "#FFF0F5", ink: "#C45C7A", accent: "#FF8FB5" },

  // 3-shot original overlays
  { src: path.join(OVERLAY, "lucky-charm.png"), id: "premium-lucky-charm", name: "Lucky Charm", tag: "Premium · Heart", shots: 3, bg: "#F5E06A", ink: "#E83D7A", accent: "#FF8FB5" },
  { src: path.join(OVERLAY, "bliss-pop.png"), id: "premium-bliss-pop", name: "Bliss Pop!", tag: "Premium · Y2K", shots: 3, bg: "#A8D8FF", ink: "#FF2E8A", accent: "#6BB0FF" },
  { src: path.join(OVERLAY, "berry-cafe.png"), id: "premium-berry-cafe", name: "Strawberry Cafe", tag: "Premium · Berry", shots: 3, bg: "#FFD6E8", ink: "#B83D6E", accent: "#FF6B9D" },
  { src: path.join(OVERLAY, "happy-day.png"), id: "premium-happy-day", name: "Happy Day", tag: "Premium · Fun", shots: 3, bg: "#FFE566", ink: "#1E5A8A", accent: "#5B9DFF" },
  { src: path.join(SESSION, "61.jpg"), id: "premium-lucky-trio", name: "Lucky Charm Trio", tag: "Premium · Heart", shots: 3, bg: "#F5E06A", ink: "#E83D7A", accent: "#FF8FB5" },
  { src: path.join(SESSION, "58.jpg"), id: "premium-bliss-trio", name: "Bliss Pop Trio", tag: "Premium · Y2K", shots: 3, bg: "#A8D8FF", ink: "#FF2E8A", accent: "#6BB0FF" },

  // 4-shot original overlays
  { src: path.join(OVERLAY, "kyowo-cat.png"), id: "premium-kyowo-cat", name: "Kyowo Cat", tag: "Premium · Cat", shots: 4, bg: "#FFE8D0", ink: "#E85A8C", accent: "#FFB86B" },
  { src: path.join(OVERLAY, "coquette-xoxo.png"), id: "premium-coquette-xoxo", name: "Coquette xoxo", tag: "Premium · Bow", shots: 4, bg: "#FFE8F0", ink: "#5c2a45", accent: "#FF5C9A" },
  { src: path.join(OVERLAY, "night-meow.png"), id: "premium-night-meow", name: "Night Meow", tag: "Premium · Dark", shots: 4, bg: "#151528", ink: "#FFE0F0", accent: "#C9B6FF" },
  { src: path.join(OVERLAY, "lucky-garden.png"), id: "premium-lucky-garden", name: "Lucky Garden", tag: "Premium · Mint", shots: 4, bg: "#B8F0C8", ink: "#2b5c40", accent: "#6BCB77" },
  { src: path.join(OVERLAY, "garden-bloom.png"), id: "premium-garden-bloom", name: "Garden Bloom", tag: "Premium · Floral", shots: 4, bg: "#FFF0F5", ink: "#C45C7A", accent: "#FF8FB5" },
  { src: path.join(OVERLAY, "mirror-mood.png"), id: "premium-mirror-mood", name: "Mirror Mood", tag: "Premium · Coquette", shots: 4, bg: "#FFC8DC", ink: "#5c2a45", accent: "#FF8FB5" },
  { src: path.join(SESSION, "62.jpg"), id: "premium-xoxo-four", name: "xoxo Four", tag: "Premium · Bow", shots: 4, bg: "#FFE8F0", ink: "#5c2a45", accent: "#FF5C9A" },
  { src: path.join(SESSION, "66.jpg"), id: "premium-night-four", name: "Night Four", tag: "Premium · Dark", shots: 4, bg: "#151528", ink: "#FFE0F0", accent: "#C9B6FF" },
];

async function toOverlayPng(src, dest) {
  const { data, info } = await sharp(src)
    .ensureAlpha()
    .resize({ width: 720, withoutEnlargement: false })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  for (let i = 0; i < width * height; i++) {
    const o = i * channels;
    const r = data[o],
      g = data[o + 1],
      b = data[o + 2],
      a = data[o + 3];
    // Keep existing transparency as hole
    if (a < 40) {
      data[o] = 255;
      data[o + 1] = 255;
      data[o + 2] = 255;
      data[o + 3] = 0;
      continue;
    }
    const sat = Math.max(r, g, b) - Math.min(r, g, b);
    // Only pure / near-white becomes hole — do NOT expand beyond design
    if (r >= 248 && g >= 248 && b >= 248 && sat <= 10) {
      data[o + 3] = 0;
    } else if (r >= 242 && g >= 242 && b >= 242 && sat <= 8) {
      data[o + 3] = Math.min(255, (250 - Math.min(r, g, b)) * 28);
    } else {
      data[o + 3] = 255; // solid frame art — never cut
    }
  }

  await sharp(data, { raw: { width, height, channels } }).png().toFile(dest);
  await sharp(dest)
    .resize({ width: 260 })
    .jpeg({ quality: 88 })
    .toFile(dest.replace(/\.png$/, "-thumb.jpg"));
  return { width, height, data, channels };
}

function detectHoles(data, width, height, channels, want) {
  const mask = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    mask[i] = data[i * channels + 3] < 48 ? 1 : 0;
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
      const bw = b.maxX - b.minX;
      const bh = b.maxY - b.minY;
      if (b.count < area * 0.01) continue;
      if (b.count > area * 0.4) continue;
      if (bw < width * 0.22) continue;
      if (bh < height * 0.055) continue;
      if (bh > height * 0.52) continue;
      boxes.push(b);
    }
  }

  boxes.sort((a, b) => a.minY - b.minY || a.minX - b.minX);

  // Prefer exact count: take largest N by area, re-sort by Y
  let chosen = boxes;
  if (boxes.length > want) {
    chosen = [...boxes]
      .sort((a, b) => b.count - a.count)
      .slice(0, want)
      .sort((a, b) => a.minY - b.minY);
  }

  return chosen.map((b) => ({
    x: +((b.minX / width) * 100).toFixed(2),
    y: +((b.minY / height) * 100).toFixed(2),
    w: +(((b.maxX - b.minX + 1) / width) * 100).toFixed(2),
    h: +(((b.maxY - b.minY + 1) / height) * 100).toFixed(2),
  }));
}

// clean slate
for (const n of [2, 3, 4, 6]) {
  fs.rmSync(path.join(OUT, String(n)), { recursive: true, force: true });
}
for (const n of [2, 3, 4]) {
  fs.mkdirSync(path.join(OUT, String(n)), { recursive: true });
}

const catalog = [];

for (const item of FRAMES) {
  if (!fs.existsSync(item.src)) {
    console.log("skip missing", item.id);
    continue;
  }

  const dir = path.join(OUT, String(item.shots));
  const dest = path.join(dir, `${item.id}.png`);
  const { width, height, data, channels } = await toOverlayPng(item.src, dest);
  let slots = detectHoles(data, width, height, channels, item.shots);

  if (slots.length !== item.shots) {
    console.log(
      "⚠",
      item.id,
      "holes",
      slots.length,
      "want",
      item.shots,
      slots.map((s) => `w${s.w}`).join(" "),
    );
    if (slots.length < 2) {
      console.log("  SKIP");
      try {
        fs.unlinkSync(dest);
      } catch {}
      continue;
    }
    // reclassify if detection found different count
    if (slots.length >= 2 && slots.length <= 4 && slots.length !== item.shots) {
      const actual = slots.length;
      const newId = item.id;
      const newDir = path.join(OUT, String(actual));
      fs.mkdirSync(newDir, { recursive: true });
      const newDest = path.join(newDir, `${newId}.png`);
      fs.renameSync(dest, newDest);
      try {
        fs.renameSync(
          dest.replace(/\.png$/, "-thumb.jpg"),
          newDest.replace(/\.png$/, "-thumb.jpg"),
        );
      } catch {}
      catalog.push({
        id: newId,
        name: item.name,
        tag: item.tag,
        shots: actual,
        overlay: `/frames/by-count/${actual}/${newId}.png?${VER}`,
        thumb: `/frames/by-count/${actual}/${newId}-thumb.jpg?${VER}`,
        slots,
        bg: item.bg,
        ink: item.ink,
        accent: item.accent,
        canvasW: width,
        canvasH: height,
      });
      console.log("  →", actual, "shots avgW", (slots.reduce((a, s) => a + s.w, 0) / slots.length).toFixed(1));
      continue;
    }
  }

  const avgW = (slots.reduce((a, s) => a + s.w, 0) / slots.length).toFixed(1);
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
  console.log("✓", item.id, `${item.shots}s`, `avgW=${avgW}%`, `${width}x${height}`);
}

catalog.sort((a, b) => a.shots - b.shots || a.name.localeCompare(b.name));
fs.writeFileSync(CATALOG, JSON.stringify(catalog, null, 2));
console.log(
  "\nCLEAN PREMIUM",
  catalog.length,
  [2, 3, 4]
    .map((n) => `${n}=${catalog.filter((c) => c.shots === n).length}`)
    .join(" "),
);
console.log("NO force-expand. Designs intact.");
