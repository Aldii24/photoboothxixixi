/**
 * Restore REAL premium illustrated frames (the cute designed ones).
 * Wipes basic white-box frames. Catalog = premium only.
 */
import sharp from "sharp";
import fs from "fs";
import path from "path";

const OVERLAY_DIR = path.resolve("public/frames/overlays");
const OUT = path.resolve("public/frames/by-count");
const CATALOG = path.resolve("public/frames/catalog.json");
const SESSION =
  "C:\\Users\\aldii\\.grok\\sessions\\C%3A%5Cprojects%5Cphotobox\\019f5c19-6b12-7fc0-ba68-da0d7b13d6d4\\images";
const VER = "prem4";

/** Designed premium templates (source art) */
const PREMIUM = [
  // 3-shot designs
  {
    file: path.join(OVERLAY_DIR, "lucky-charm.png"),
    id: "premium-lucky-charm",
    name: "Lucky Charm",
    tag: "Premium · Heart",
    shots: 3,
    bg: "#F5E06A",
    ink: "#E83D7A",
    accent: "#FF8FB5",
  },
  {
    file: path.join(OVERLAY_DIR, "bliss-pop.png"),
    id: "premium-bliss-pop",
    name: "Bliss Pop!",
    tag: "Premium · Y2K",
    shots: 3,
    bg: "#A8D8FF",
    ink: "#FF2E8A",
    accent: "#6BB0FF",
  },
  {
    file: path.join(OVERLAY_DIR, "berry-cafe.png"),
    id: "premium-berry-cafe",
    name: "Strawberry Cafe",
    tag: "Premium · Berry",
    shots: 3,
    bg: "#FFD6E8",
    ink: "#B83D6E",
    accent: "#FF6B9D",
  },
  {
    file: path.join(OVERLAY_DIR, "happy-day.png"),
    id: "premium-happy-day",
    name: "Happy Day",
    tag: "Premium · Fun",
    shots: 3,
    bg: "#FFE566",
    ink: "#1E5A8A",
    accent: "#5B9DFF",
  },
  // 4-shot designs
  {
    file: path.join(OVERLAY_DIR, "kyowo-cat.png"),
    id: "premium-kyowo-cat",
    name: "Kyowo Cat",
    tag: "Premium · Cat",
    shots: 4,
    bg: "#FFE8D0",
    ink: "#E85A8C",
    accent: "#FFB86B",
  },
  {
    file: path.join(OVERLAY_DIR, "lucky-garden.png"),
    id: "premium-lucky-garden",
    name: "Lucky Garden",
    tag: "Premium · Mint",
    shots: 4,
    bg: "#B8F0C8",
    ink: "#2b5c40",
    accent: "#6BCB77",
  },
  {
    file: path.join(OVERLAY_DIR, "mirror-mood.png"),
    id: "premium-mirror-mood",
    name: "Mirror Mood",
    tag: "Premium · Coquette",
    shots: 4,
    bg: "#FFC8DC",
    ink: "#5c2a45",
    accent: "#FF8FB5",
  },
  {
    file: path.join(OVERLAY_DIR, "coquette-xoxo.png"),
    id: "premium-coquette-xoxo",
    name: "Coquette xoxo",
    tag: "Premium · Bow",
    shots: 4,
    bg: "#FFE8F0",
    ink: "#5c2a45",
    accent: "#FF5C9A",
  },
  {
    file: path.join(OVERLAY_DIR, "garden-bloom.png"),
    id: "premium-garden-bloom",
    name: "Garden Bloom",
    tag: "Premium · Floral",
    shots: 4,
    bg: "#FFF0F5",
    ink: "#C45C7A",
    accent: "#FF8FB5",
  },
  {
    file: path.join(OVERLAY_DIR, "night-meow.png"),
    id: "premium-night-meow",
    name: "Night Meow",
    tag: "Premium · Dark",
    shots: 4,
    bg: "#151528",
    ink: "#FFE0F0",
    accent: "#C9B6FF",
  },
  // 2-shot + extra variants from session designs
  {
    file: path.join(SESSION, "56.jpg"),
    id: "premium-lucky-duo",
    name: "Lucky Duo",
    tag: "Premium · Heart",
    shots: 2,
    bg: "#F5E06A",
    ink: "#E83D7A",
    accent: "#FF8FB5",
  },
  {
    file: path.join(SESSION, "57.jpg"),
    id: "premium-kyowo-duo",
    name: "Kyowo Duo",
    tag: "Premium · Cat",
    shots: 2,
    bg: "#FFE8D0",
    ink: "#E85A8C",
    accent: "#FFB86B",
  },
  {
    file: path.join(SESSION, "60.jpg"),
    id: "premium-bliss-duo",
    name: "Bliss Duo",
    tag: "Premium · Y2K",
    shots: 2,
    bg: "#A8D8FF",
    ink: "#FF2E8A",
    accent: "#6BB0FF",
  },
  {
    file: path.join(SESSION, "61.jpg"),
    id: "premium-lucky-trio",
    name: "Lucky Charm Trio",
    tag: "Premium · Heart",
    shots: 3,
    bg: "#F5E06A",
    ink: "#E83D7A",
    accent: "#FF8FB5",
  },
  {
    file: path.join(SESSION, "58.jpg"),
    id: "premium-bliss-trio",
    name: "Bliss Pop Trio",
    tag: "Premium · Y2K",
    shots: 3,
    bg: "#A8D8FF",
    ink: "#FF2E8A",
    accent: "#6BB0FF",
  },
  {
    file: path.join(SESSION, "62.jpg"),
    id: "premium-xoxo-four",
    name: "xoxo Four",
    tag: "Premium · Bow",
    shots: 4,
    bg: "#FFE8F0",
    ink: "#5c2a45",
    accent: "#FF5C9A",
  },
  {
    file: path.join(SESSION, "66.jpg"),
    id: "premium-night-four",
    name: "Night Four",
    tag: "Premium · Dark",
    shots: 4,
    bg: "#151528",
    ink: "#FFE0F0",
    accent: "#C9B6FF",
  },
  {
    file: path.join(SESSION, "65.jpg"),
    id: "premium-garden-duo",
    name: "Bloom Duo",
    tag: "Premium · Floral",
    shots: 2,
    bg: "#FFF0F5",
    ink: "#C45C7A",
    accent: "#FF8FB5",
  },
  {
    file: path.join(SESSION, "59.jpg"),
    id: "premium-berry-duo",
    name: "Berry Duo",
    tag: "Premium · Berry",
    shots: 2,
    bg: "#FFD6E8",
    ink: "#B83D6E",
    accent: "#FF6B9D",
  },
  {
    file: path.join(SESSION, "63.jpg"),
    id: "premium-happy-duo",
    name: "Happy Duo",
    tag: "Premium · Fun",
    shots: 2,
    bg: "#FFE566",
    ink: "#1E5A8A",
    accent: "#5B9DFF",
  },
  {
    file: path.join(SESSION, "64.jpg"),
    id: "premium-mirror-duo",
    name: "Mirror Duo",
    tag: "Premium · Coquette",
    shots: 2,
    bg: "#FFC8DC",
    ink: "#5c2a45",
    accent: "#FF8FB5",
  },
  {
    file: path.join(SESSION, "70.jpg"),
    id: "premium-extra-a",
    name: "Sweet Strip",
    tag: "Premium · Cute",
    shots: 3,
    bg: "#FFF0F5",
    ink: "#8B2A50",
    accent: "#FF8FB5",
  },
  {
    file: path.join(SESSION, "71.jpg"),
    id: "premium-extra-b",
    name: "Pop Strip",
    tag: "Premium · Y2K",
    shots: 3,
    bg: "#B8DFFF",
    ink: "#C2185B",
    accent: "#FF6B9D",
  },
  {
    file: path.join(SESSION, "73.jpg"),
    id: "premium-extra-c",
    name: "Charm Strip",
    tag: "Premium · Heart",
    shots: 4,
    bg: "#FFE566",
    ink: "#C2185B",
    accent: "#FF8FB5",
  },
];

async function processToPng(src, dest) {
  const { data, info } = await sharp(src)
    .ensureAlpha()
    .resize({ width: 720, withoutEnlargement: false })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  // Punch near-white photo holes to transparent
  for (let i = 0; i < width * height; i++) {
    const o = i * channels;
    const r = data[o],
      g = data[o + 1],
      b = data[o + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max - min;
    // pure / near white = hole
    if (r >= 245 && g >= 245 && b >= 245 && sat <= 12) {
      data[o + 3] = 0;
    } else if (r >= 238 && g >= 238 && b >= 238 && sat <= 10) {
      data[o + 3] = Math.min(255, (250 - Math.min(r, g, b)) * 25);
    } else {
      data[o + 3] = 255;
    }
  }

  await sharp(data, { raw: { width, height, channels } })
    .png()
    .toFile(dest);

  await sharp(dest)
    .resize({ width: 260 })
    .jpeg({ quality: 88 })
    .toFile(dest.replace(/\.png$/, "-thumb.jpg"));

  return { width, height };
}

/** Detect transparent photo holes (bounding boxes top→bottom) */
async function detectHoles(pngPath, wantShots) {
  const { data, info } = await sharp(pngPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
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
      // filter noise / full-frame mistakes
      if (b.count < area * 0.012) continue;
      if (b.count > area * 0.42) continue;
      if (bw < width * 0.28) continue;
      if (bh < height * 0.06) continue;
      if (bh > height * 0.55) continue;
      boxes.push(b);
    }
  }

  boxes.sort((a, b) => a.minY - b.minY || a.minX - b.minX);

  // If too many, keep the largest `wantShots` by area, re-sort by Y
  let chosen = boxes;
  if (boxes.length > wantShots) {
    chosen = [...boxes]
      .sort((a, b) => b.count - a.count)
      .slice(0, wantShots)
      .sort((a, b) => a.minY - b.minY);
  }

  return {
    width,
    height,
    holes: chosen.map((b) => ({
      x: +((b.minX / width) * 100).toFixed(2),
      y: +((b.minY / height) * 100).toFixed(2),
      w: +(((b.maxX - b.minX + 1) / width) * 100).toFixed(2),
      h: +(((b.maxY - b.minY + 1) / height) * 100).toFixed(2),
    })),
  };
}

// wipe basic frames
for (const n of [2, 3, 4, 6]) {
  fs.rmSync(path.join(OUT, String(n)), { recursive: true, force: true });
}
for (const n of [2, 3, 4]) {
  fs.mkdirSync(path.join(OUT, String(n)), { recursive: true });
}

const catalog = [];

for (const item of PREMIUM) {
  if (!fs.existsSync(item.file)) {
    console.log("skip missing", item.id, item.file);
    continue;
  }
  const dir = path.join(OUT, String(item.shots));
  const dest = path.join(dir, `${item.id}.png`);
  const { width, height } = await processToPng(item.file, dest);
  const { holes } = await detectHoles(dest, item.shots);

  if (holes.length !== item.shots) {
    console.log(
      "⚠ holes",
      item.id,
      "got",
      holes.length,
      "want",
      item.shots,
      holes.map((h) => `w${h.w}`).join(" "),
    );
    // still include if we got something usable (force count match by pad/slice)
    if (holes.length < 2) {
      console.log("SKIP", item.id);
      continue;
    }
  }

  const slots =
    holes.length >= item.shots
      ? holes.slice(0, item.shots)
      : holes; // under-detected — use what we have, fix shots

  const actualShots = slots.length;
  // re-path if shots differ
  let finalShots = item.shots;
  let finalDest = dest;
  let finalId = item.id;
  if (actualShots !== item.shots && actualShots >= 2 && actualShots <= 4) {
    finalShots = actualShots;
    finalId = `${item.id}-${actualShots}s`;
    const ndir = path.join(OUT, String(finalShots));
    fs.mkdirSync(ndir, { recursive: true });
    finalDest = path.join(ndir, `${finalId}.png`);
    fs.renameSync(dest, finalDest);
    const oldThumb = dest.replace(/\.png$/, "-thumb.jpg");
    const newThumb = finalDest.replace(/\.png$/, "-thumb.jpg");
    if (fs.existsSync(oldThumb)) fs.renameSync(oldThumb, newThumb);
    console.log("  → reclassified as", finalShots, "shots");
  }

  catalog.push({
    id: finalId,
    name: item.name,
    tag: item.tag,
    shots: finalShots,
    overlay: `/frames/by-count/${finalShots}/${finalId}.png?${VER}`,
    thumb: `/frames/by-count/${finalShots}/${finalId}-thumb.jpg?${VER}`,
    slots,
    bg: item.bg,
    ink: item.ink,
    accent: item.accent,
    canvasW: width,
    canvasH: height,
  });

  const avgW = (
    slots.reduce((s, h) => s + h.w, 0) / slots.length
  ).toFixed(1);
  console.log(
    "✓",
    finalId,
    `${finalShots}s`,
    `${width}x${height}`,
    `avgW=${avgW}%`,
  );
}

catalog.sort(
  (a, b) =>
    a.shots - b.shots ||
    a.name.localeCompare(b.name),
);

fs.writeFileSync(CATALOG, JSON.stringify(catalog, null, 2));
console.log(
  "\nPREMIUM ONLY",
  catalog.length,
  [2, 3, 4]
    .map((n) => `${n}=${catalog.filter((c) => c.shots === n).length}`)
    .join(" "),
);
if (catalog.length === 0) process.exit(1);
