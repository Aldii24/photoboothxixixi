/**
 * Restore AI premium overlays into by-count catalog (merge with big frames).
 * Does NOT delete big-* frames.
 */
import sharp from "sharp";
import fs from "fs";
import path from "path";

const OVERLAY_DIR = path.resolve("public/frames/overlays");
const OUT = path.resolve("public/frames/by-count");

const PREMIUM = [
  { file: "lucky-charm.png", id: "premium-lucky-charm", name: "Lucky Charm", tag: "★ Premium · Heart", shots: 3, bg: "#F5E06A", ink: "#E83D7A", accent: "#FF8FB5" },
  { file: "bliss-pop.png", id: "premium-bliss-pop", name: "Bliss Pop!", tag: "★ Premium · Y2K", shots: 3, bg: "#A8D8FF", ink: "#FF2E8A", accent: "#6BB0FF" },
  { file: "berry-cafe.png", id: "premium-berry", name: "Berry Cafe", tag: "★ Premium · Strawberry", shots: 3, bg: "#FFD6E8", ink: "#B83D6E", accent: "#FF6B9D" },
  { file: "happy-day.png", id: "premium-happy-day", name: "Happy Day", tag: "★ Premium · Fun", shots: 3, bg: "#FFE566", ink: "#1E5A8A", accent: "#5B9DFF" },
  { file: "kyowo-cat.png", id: "premium-kyowo-cat", name: "Kyowo Cat", tag: "★ Premium · Cat", shots: 4, bg: "#FFE8D0", ink: "#E85A8C", accent: "#FFB86B" },
  { file: "lucky-garden.png", id: "premium-lucky-garden", name: "Lucky Garden", tag: "★ Premium · Mint", shots: 4, bg: "#B8F0C8", ink: "#2b5c40", accent: "#6BCB77" },
  { file: "mirror-mood.png", id: "premium-mirror-mood", name: "Mirror Mood", tag: "★ Premium · Coquette", shots: 4, bg: "#FFC8DC", ink: "#5c2a45", accent: "#FF8FB5" },
  { file: "coquette-xoxo.png", id: "premium-coquette-xoxo", name: "Coquette xoxo", tag: "★ Premium · Bow", shots: 4, bg: "#FFE8F0", ink: "#5c2a45", accent: "#FF5C9A" },
  { file: "garden-bloom.png", id: "premium-garden-bloom", name: "Garden Bloom", tag: "★ Premium · Floral", shots: 4, bg: "#FFF0F5", ink: "#C45C7A", accent: "#FF8FB5" },
  { file: "night-meow.png", id: "premium-night-meow", name: "Night Meow", tag: "★ Premium · Dark", shots: 4, bg: "#151528", ink: "#FFE0F0", accent: "#C9B6FF" },
];

// Also check session images for duo frames if any remain
const IMG =
  "C:\\Users\\aldii\\.grok\\sessions\\C%3A%5Cprojects%5Cphotobox\\019f5c19-6b12-7fc0-ba68-da0d7b13d6d4\\images";
const EXTRA = [
  { file: path.join(IMG, "56.jpg"), id: "premium-lucky-duo", name: "Lucky Duo", tag: "★ Premium · Heart", shots: 2, bg: "#F5E06A", ink: "#E83D7A", accent: "#FF8FB5" },
  { file: path.join(IMG, "57.jpg"), id: "premium-kyowo-duo", name: "Kyowo Duo", tag: "★ Premium · Cat", shots: 2, bg: "#FFE8D0", ink: "#E85A8C", accent: "#FFB86B" },
  { file: path.join(IMG, "60.jpg"), id: "premium-bliss-duo", name: "Bliss Duo", tag: "★ Premium · Y2K", shots: 2, bg: "#A8D8FF", ink: "#FF2E8A", accent: "#6BB0FF" },
  { file: path.join(IMG, "61.jpg"), id: "premium-lucky-trio", name: "Lucky Charm Trio", tag: "★ Premium · Heart", shots: 3, bg: "#F5E06A", ink: "#E83D7A", accent: "#FF8FB5" },
  { file: path.join(IMG, "58.jpg"), id: "premium-bliss-trio", name: "Bliss Pop Trio", tag: "★ Premium · Y2K", shots: 3, bg: "#A8D8FF", ink: "#FF2E8A", accent: "#6BB0FF" },
  { file: path.join(IMG, "67.jpg"), id: "premium-kyowo-four", name: "Kyowo Four", tag: "★ Premium · Cat", shots: 4, bg: "#FFE8D0", ink: "#E85A8C", accent: "#FFB86B" },
  { file: path.join(IMG, "62.jpg"), id: "premium-xoxo-four", name: "xoxo Four", tag: "★ Premium · Bow", shots: 4, bg: "#FFE8F0", ink: "#5c2a45", accent: "#FF5C9A" },
  { file: path.join(IMG, "66.jpg"), id: "premium-night-four", name: "Night Four", tag: "★ Premium · Dark", shots: 4, bg: "#151528", ink: "#FFE0F0", accent: "#C9B6FF" },
];

async function processToPng(src, dest) {
  const { data, info } = await sharp(src)
    .ensureAlpha()
    .resize({ width: 720, withoutEnlargement: true })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  for (let i = 0; i < width * height; i++) {
    const o = i * channels;
    const r = data[o],
      g = data[o + 1],
      b = data[o + 2];
    const sat = Math.max(r, g, b) - Math.min(r, g, b);
    if (r >= 246 && g >= 246 && b >= 246 && sat <= 10) data[o + 3] = 0;
    else if (r >= 240 && g >= 240 && b >= 240 && sat <= 8)
      data[o + 3] = Math.min(255, (248 - Math.min(r, g, b)) * 20);
    else data[o + 3] = 255;
  }
  await sharp(data, { raw: { width, height, channels } }).png().toFile(dest);
  await sharp(src)
    .resize({ width: 260 })
    .jpeg({ quality: 85 })
    .toFile(dest.replace(/\.png$/, "-thumb.jpg"));
}

async function detectHoles(pngPath) {
  const { data, info } = await sharp(pngPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const mask = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    mask[i] = data[i * channels + 3] < 40 ? 1 : 0;
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
      if (b.count < area * 0.008) continue;
      if (b.count > area * 0.28) continue;
      const hh = ((b.maxY - b.minY) / height) * 100;
      if (hh > 42) continue;
      boxes.push(b);
    }
  }
  boxes.sort((a, b) => a.minY - b.minY);
  return boxes.map((b) => ({
    x: +((b.minX / width) * 100).toFixed(2),
    y: +((b.minY / height) * 100).toFixed(2),
    w: +(((b.maxX - b.minX) / width) * 100).toFixed(2),
    h: +(((b.maxY - b.minY) / height) * 100).toFixed(2),
  }));
}

const premium = [];

for (const item of PREMIUM) {
  const src = path.join(OVERLAY_DIR, item.file);
  if (!fs.existsSync(src)) {
    console.log("missing", item.file);
    continue;
  }
  const dir = path.join(OUT, String(item.shots));
  fs.mkdirSync(dir, { recursive: true });
  // copy already-processed overlay if good, reprocess to be safe
  const dest = path.join(dir, `${item.id}.png`);
  await processToPng(src, dest);
  let holes = await detectHoles(dest);
  if (holes.length !== item.shots) {
    console.log("SKIP", item.id, "holes", holes.length, "want", item.shots);
    continue;
  }
  premium.push({
    id: item.id,
    name: item.name,
    tag: item.tag,
    shots: item.shots,
    overlay: `/frames/by-count/${item.shots}/${item.id}.png`,
    thumb: `/frames/by-count/${item.shots}/${item.id}-thumb.jpg`,
    slots: holes,
    bg: item.bg,
    ink: item.ink,
    accent: item.accent,
  });
  console.log("✓ premium", item.id, holes.length);
}

for (const item of EXTRA) {
  if (!fs.existsSync(item.file)) {
    console.log("missing extra", item.id);
    continue;
  }
  const dir = path.join(OUT, String(item.shots));
  fs.mkdirSync(dir, { recursive: true });
  const dest = path.join(dir, `${item.id}.png`);
  await processToPng(item.file, dest);
  let holes = await detectHoles(dest);
  if (holes.length !== item.shots) {
    console.log("SKIP extra", item.id, "holes", holes.length);
    continue;
  }
  premium.push({
    id: item.id,
    name: item.name,
    tag: item.tag,
    shots: item.shots,
    overlay: `/frames/by-count/${item.shots}/${item.id}.png`,
    thumb: `/frames/by-count/${item.shots}/${item.id}-thumb.jpg`,
    slots: holes,
    bg: item.bg,
    ink: item.ink,
    accent: item.accent,
  });
  console.log("✓ extra", item.id, holes.length);
}

const catPath = path.resolve("public/frames/catalog.json");
const existing = JSON.parse(fs.readFileSync(catPath, "utf8")).filter(
  (c) => c.shots === 2 || c.shots === 3 || c.shots === 4,
);

// Merge: premium first, then big frames (no dups by id)
const byId = new Map();
for (const p of premium) byId.set(p.id, p);
for (const e of existing) {
  if (!byId.has(e.id)) byId.set(e.id, e);
}

const merged = [...byId.values()].sort(
  (a, b) =>
    a.shots - b.shots ||
    // premium tag first
    (b.tag.startsWith("★") ? 1 : 0) - (a.tag.startsWith("★") ? 1 : 0) ||
    a.name.localeCompare(b.name),
);

fs.writeFileSync(catPath, JSON.stringify(merged, null, 2));
console.log(
  "\nMERGED",
  merged.length,
  "premium",
  premium.length,
  [2, 3, 4]
    .map((n) => `${n}=${merged.filter((c) => c.shots === n).length}`)
    .join(" "),
);
console.log(
  "premium ids:",
  premium.map((p) => p.id).join(", "),
);
