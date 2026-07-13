/**
 * Build catalog from freshly AI-generated premium frames.
 * Natural hole detection — windows are often soft white (~243), not pure 255.
 * NEVER force-expand over decorations.
 */
import sharp from "sharp";
import fs from "fs";
import path from "path";

const SESSION =
  "C:\\Users\\aldii\\.grok\\sessions\\C%3A%5Cprojects%5Cphotobox\\019f5c19-6b12-7fc0-ba68-da0d7b13d6d4\\images";
const OUT = path.resolve("public/frames/by-count");
const CATALOG = path.resolve("public/frames/catalog.json");
const VER = "regen9";

const FRAMES = [
  { file: "124.jpg", id: "premium-xoxo-duo", name: "xoxo Duo", tag: "Premium · Bow", shots: 2, bg: "#FFE8F0", ink: "#5c2a45", accent: "#FF5C9A" },
  { file: "123.jpg", id: "premium-kyowo-duo", name: "Kyowo Duo", tag: "Premium · Cat", shots: 2, bg: "#FFE8D0", ink: "#E85A8C", accent: "#FFB86B" },
  { file: "127.jpg", id: "premium-lucky-duo", name: "Lucky Duo", tag: "Premium · Heart", shots: 2, bg: "#F5E06A", ink: "#E83D7A", accent: "#FF8FB5" },
  { file: "130.jpg", id: "premium-bliss-duo", name: "Bliss Duo", tag: "Premium · Y2K", shots: 2, bg: "#A8D8FF", ink: "#FF2E8A", accent: "#6BB0FF" },
  { file: "129.jpg", id: "premium-berry-duo", name: "Berry Duo", tag: "Premium · Berry", shots: 2, bg: "#FFD6E8", ink: "#B83D6E", accent: "#FF6B9D" },
  { file: "115.jpg", id: "premium-lucky-charm", name: "Lucky Charm", tag: "Premium · Heart", shots: 3, bg: "#F5E06A", ink: "#E83D7A", accent: "#FF8FB5" },
  { file: "118.jpg", id: "premium-bliss-pop", name: "Bliss Pop!", tag: "Premium · Y2K", shots: 3, bg: "#A8D8FF", ink: "#FF2E8A", accent: "#6BB0FF" },
  { file: "117.jpg", id: "premium-berry-cafe", name: "Strawberry Cafe", tag: "Premium · Berry", shots: 3, bg: "#FFD6E8", ink: "#B83D6E", accent: "#FF6B9D" },
  { file: "121.jpg", id: "premium-happy-day", name: "Happy Day", tag: "Premium · Fun", shots: 3, bg: "#FFE566", ink: "#1E5A8A", accent: "#5B9DFF" },
  { file: "128.jpg", id: "premium-lavender", name: "Lavender Dream", tag: "Premium · Dreamy", shots: 3, bg: "#F3E5F5", ink: "#6A1B9A", accent: "#CE93D8" },
  { file: "125.jpg", id: "premium-matcha", name: "Matcha Mood", tag: "Premium · Calm", shots: 3, bg: "#F1F8E9", ink: "#33691E", accent: "#AED581" },
  { file: "113.jpg", id: "premium-xoxo-four", name: "xoxo Four", tag: "Premium · Bow", shots: 4, bg: "#FFE8F0", ink: "#5c2a45", accent: "#FF5C9A" },
  { file: "114.jpg", id: "premium-kyowo-cat", name: "Kyowo Cat", tag: "Premium · Cat", shots: 4, bg: "#FFE8D0", ink: "#E85A8C", accent: "#FFB86B" },
  { file: "116.jpg", id: "premium-night-meow", name: "Night Meow", tag: "Premium · Dark", shots: 4, bg: "#151528", ink: "#FFE0F0", accent: "#C9B6FF" },
  { file: "120.jpg", id: "premium-garden-bloom", name: "Garden Bloom", tag: "Premium · Floral", shots: 4, bg: "#FFF0F5", ink: "#C45C7A", accent: "#FF8FB5" },
  { file: "122.jpg", id: "premium-lucky-garden", name: "Lucky Garden", tag: "Premium · Mint", shots: 4, bg: "#B8F0C8", ink: "#2b5c40", accent: "#6BCB77" },
  { file: "119.jpg", id: "premium-mirror-mood", name: "Mirror Mood", tag: "Premium · Coquette", shots: 4, bg: "#FFC8DC", ink: "#5c2a45", accent: "#FF8FB5" },
  { file: "126.jpg", id: "premium-bubblegum", name: "Bubblegum", tag: "Premium · Pop", shots: 4, bg: "#FCE4EC", ink: "#AD1457", accent: "#F48FB1" },
];

function isHolePixel(r, g, b, a) {
  if (a < 40) return true;
  const min = Math.min(r, g, b);
  const max = Math.max(r, g, b);
  const sat = max - min;
  // Soft white photo windows from AI gens are often ~240-248 gray-white
  if (min >= 232 && sat <= 18) return true;
  if (min >= 225 && sat <= 12) return true;
  return false;
}

async function process(src) {
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
    if (isHolePixel(r, g, b, a)) {
      data[o] = 255;
      data[o + 1] = 255;
      data[o + 2] = 255;
      data[o + 3] = 0;
    } else {
      data[o + 3] = 255;
    }
  }
  return { data, width, height, channels };
}

function detectHoles(data, width, height, channels, want) {
  const mask = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    mask[i] = data[i * channels + 3] < 50 ? 1 : 0;
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
      if (b.count < area * 0.012) continue;
      if (b.count > area * 0.55) continue;
      if (bw < width * 0.28) continue;
      if (bh < height * 0.05) continue;
      boxes.push(b);
    }
  }
  boxes.sort((a, b) => a.minY - b.minY);

  // If one tall merged column of holes, split into `want` equal vertical slots
  if (boxes.length === 1 && want > 1) {
    const b = boxes[0];
    const bh = b.maxY - b.minY + 1;
    if (bh > height * 0.35) {
      const gap = Math.round(height * 0.012);
      const holeH = Math.floor((bh - gap * (want - 1)) / want);
      const split = [];
      for (let i = 0; i < want; i++) {
        const y0 = b.minY + i * (holeH + gap);
        split.push({
          minX: b.minX,
          maxX: b.maxX,
          minY: y0,
          maxY: y0 + holeH - 1,
          count: holeH * (b.maxX - b.minX),
        });
      }
      boxes.length = 0;
      boxes.push(...split);
    }
  }

  // Too many → keep largest N
  let chosen = boxes;
  if (boxes.length > want) {
    chosen = [...boxes]
      .sort((a, b) => b.count - a.count)
      .slice(0, want)
      .sort((a, b) => a.minY - b.minY);
  }

  // Too few but have some tall ones — try row-band detection
  if (chosen.length < want) {
    // horizontal projection of mask, find peaks
    const rowCounts = new Array(height).fill(0);
    for (let y = 0; y < height; y++) {
      let c = 0;
      for (let x = 0; x < width; x++) if (mask[y * width + x]) c++;
      rowCounts[y] = c;
    }
    const thr = width * 0.25;
    const bands = [];
    let inBand = false,
      start = 0;
    for (let y = 0; y < height; y++) {
      if (rowCounts[y] >= thr && !inBand) {
        inBand = true;
        start = y;
      } else if (rowCounts[y] < thr && inBand) {
        inBand = false;
        if (y - start > height * 0.06) bands.push([start, y - 1]);
      }
    }
    if (inBand && height - start > height * 0.06) bands.push([start, height - 1]);

    if (bands.length >= want) {
      chosen = bands.slice(0, want).map(([y0, y1]) => {
        // find x extent in band
        let minX = width,
          maxX = 0;
        for (let y = y0; y <= y1; y++) {
          for (let x = 0; x < width; x++) {
            if (mask[y * width + x]) {
              minX = Math.min(minX, x);
              maxX = Math.max(maxX, x);
            }
          }
        }
        return {
          minX,
          maxX,
          minY: y0,
          maxY: y1,
          count: (maxX - minX) * (y1 - y0),
        };
      });
    }
  }

  return chosen.map((b) => ({
    x: +((b.minX / width) * 100).toFixed(2),
    y: +((b.minY / height) * 100).toFixed(2),
    w: +(((b.maxX - b.minX + 1) / width) * 100).toFixed(2),
    h: +(((b.maxY - b.minY + 1) / height) * 100).toFixed(2),
  }));
}

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
  const { data, width, height, channels } = await process(src);
  const slots = detectHoles(data, width, height, channels, item.shots);

  if (slots.length < item.shots) {
    console.log(
      "⚠",
      item.id,
      "holes",
      slots.length,
      "want",
      item.shots,
      slots.map((s) => `w${s.w}`).join(" "),
    );
    if (slots.length < 2) continue;
  }

  const useShots =
    slots.length >= item.shots ? item.shots : Math.min(slots.length, 4);
  const useSlots = slots.slice(0, useShots);
  // reject if holes still tiny (< 45% width) — bad generation
  const avgW = useSlots.reduce((a, s) => a + s.w, 0) / useSlots.length;
  if (avgW < 42) {
    console.log("skip tiny", item.id, avgW.toFixed(1));
    continue;
  }

  const dest = path.join(OUT, String(useShots), `${item.id}.png`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  await sharp(data, { raw: { width, height, channels } }).png().toFile(dest);
  await sharp(dest)
    .resize({ width: 260 })
    .jpeg({ quality: 90 })
    .toFile(dest.replace(/\.png$/, "-thumb.jpg"));

  catalog.push({
    id: item.id,
    name: item.name,
    tag: item.tag,
    shots: useShots,
    overlay: `/frames/by-count/${useShots}/${item.id}.png?${VER}`,
    thumb: `/frames/by-count/${useShots}/${item.id}-thumb.jpg?${VER}`,
    slots: useSlots,
    bg: item.bg,
    ink: item.ink,
    accent: item.accent,
    canvasW: width,
    canvasH: height,
  });
  console.log(
    "✓",
    item.id,
    `${useShots}s`,
    `avgW=${avgW.toFixed(1)}%`,
    useSlots.map((s) => `h${s.h}`).join(" "),
  );
}

catalog.sort((a, b) => a.shots - b.shots || a.name.localeCompare(b.name));
fs.writeFileSync(CATALOG, JSON.stringify(catalog, null, 2));
console.log(
  "\nREGEN DONE",
  catalog.length,
  [2, 3, 4]
    .map((n) => `${n}=${catalog.filter((c) => c.shots === n).length}`)
    .join(" "),
);
const xoxo = catalog.find((c) => c.id === "premium-xoxo-four");
console.log("xoxo", xoxo?.slots);
