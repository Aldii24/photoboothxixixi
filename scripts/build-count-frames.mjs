/**
 * Process generated frames → transparent-hole PNGs, detect holes,
 * only keep frames whose hole count matches target (2/3/4/6).
 * Writes public/frames/catalog.json for the app.
 */
import sharp from "sharp";
import fs from "fs";
import path from "path";
// sharp used for process + thumbs

const IMG =
  "C:\\Users\\aldii\\.grok\\sessions\\C%3A%5Cprojects%5Cphotobox\\019f5c19-6b12-7fc0-ba68-da0d7b13d6d4\\images";
const OUT = path.resolve("public/frames/by-count");

/** filename → meta */
const CATALOG_SRC = [
  // 2-shot
  { file: "56.jpg", id: "duo-lucky-heart", name: "Lucky Duo", tag: "Heart · Gingham", shots: 2 },
  { file: "57.jpg", id: "duo-kyowo", name: "Kyowo Duo", tag: "Cat", shots: 2 },
  { file: "60.jpg", id: "duo-bliss", name: "Bliss Duo", tag: "Y2K · Heart", shots: 2 },
  { file: "69.jpg", id: "duo-bestie", name: "Bestie Duo", tag: "Pearl · Oval", shots: 2 },
  { file: "79.jpg", id: "duo-soft", name: "Soft Duo", tag: "Lavender · Oval", shots: 2 },
  // 3-shot
  { file: "61.jpg", id: "trio-lucky", name: "Lucky Charm", tag: "Heart · Gingham", shots: 3 },
  { file: "59.jpg", id: "trio-berry", name: "Berry Cafe", tag: "Strawberry", shots: 3 },
  { file: "58.jpg", id: "trio-bliss", name: "Bliss Pop", tag: "Y2K · Heart", shots: 3 },
  { file: "70.jpg", id: "trio-bloom", name: "Bloom Trio", tag: "Floral", shots: 3 },
  // 4-shot
  { file: "67.jpg", id: "quad-kyowo", name: "Kyowo Cat", tag: "Cat · Gingham", shots: 4 },
  { file: "63.jpg", id: "quad-garden", name: "Lucky Garden", tag: "Mint", shots: 4 },
  { file: "64.jpg", id: "quad-mirror", name: "Mirror Mood", tag: "Coquette", shots: 4 },
  { file: "65.jpg", id: "quad-floral", name: "Garden Bloom", tag: "Floral", shots: 4 },
  { file: "62.jpg", id: "quad-xoxo", name: "Coquette xoxo", tag: "Bow", shots: 4 },
  { file: "66.jpg", id: "quad-night", name: "Night Meow", tag: "Dark Cat", shots: 4 },
  { file: "77.jpg", id: "quad-kyowo2", name: "Kyowo Four", tag: "Cat", shots: 4 },
  { file: "78.jpg", id: "quad-garden2", name: "Garden Four", tag: "Mint", shots: 4 },
  // 6-shot
  { file: "73.jpg", id: "six-shots", name: "Six Shots", tag: "Gingham", shots: 6 },
  { file: "72.jpg", id: "six-cat", name: "Cat Strip 6", tag: "Cat", shots: 6 },
  { file: "68.jpg", id: "six-lucky", name: "Lucky Six", tag: "Mint", shots: 6 },
  { file: "71.jpg", id: "six-pop", name: "Pop Six", tag: "Y2K · Heart", shots: 6 },
  { file: "76.jpg", id: "six-cute", name: "Six Cute", tag: "Pink", shots: 6 },
  { file: "74.jpg", id: "six-stars", name: "Six Stars", tag: "Gingham", shots: 6 },
  { file: "75.jpg", id: "six-clover", name: "Six Clover", tag: "Mint", shots: 6 },
];

async function toTransparentPng(src, dest) {
  const { data, info } = await sharp(src)
    .ensureAlpha()
    .resize({ width: 720, withoutEnlargement: true })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  for (let i = 0; i < width * height; i++) {
    const o = i * channels;
    const r = data[o];
    const g = data[o + 1];
    const b = data[o + 2];
    const sat = Math.max(r, g, b) - Math.min(r, g, b);
    if (r >= 246 && g >= 246 && b >= 246 && sat <= 10) data[o + 3] = 0;
    else if (r >= 240 && g >= 240 && b >= 240 && sat <= 8)
      data[o + 3] = Math.min(255, Math.round((248 - Math.min(r, g, b)) * 20));
    else data[o + 3] = 255;
  }

  await sharp(data, { raw: { width, height, channels } }).png().toFile(dest);
  await sharp(src)
    .resize({ width: 240 })
    .jpeg({ quality: 82 })
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
    const stack = [[sx, sy]];
    visited[sy * width + sx] = 1;
    while (stack.length) {
      const [x, y] = stack.pop();
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
        stack.push([nx, ny]);
      }
    }
    return { minX, maxX, minY, maxY, count };
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      if (!mask[i] || visited[i]) continue;
      const box = flood(x, y);
      // ignore noise; ignore giant false holes (>35% area)
      const area = width * height;
      if (box.count < area * 0.008) continue;
      if (box.count > area * 0.28) continue;
      const h = ((box.maxY - box.minY) / height) * 100;
      if (h > 45) continue; // not a single photo hole
      boxes.push(box);
    }
  }
  boxes.sort((a, b) => a.minY - b.minY);

  const pad = 2;
  return boxes.map((b) => {
    const x = Math.max(0, b.minX - pad);
    const y = Math.max(0, b.minY - pad);
    const w = Math.min(width, b.maxX + pad) - x;
    const h = Math.min(height, b.maxY + pad) - y;
    return {
      x: +((x / width) * 100).toFixed(2),
      y: +((y / height) * 100).toFixed(2),
      w: +((w / width) * 100).toFixed(2),
      h: +((h / height) * 100).toFixed(2),
    };
  });
}

const catalog = [];

for (const item of CATALOG_SRC) {
  const src = path.join(IMG, item.file);
  if (!fs.existsSync(src)) {
    console.log("MISSING", item.file, item.id);
    continue;
  }
  const dir = path.join(OUT, String(item.shots));
  fs.mkdirSync(dir, { recursive: true });
  const dest = path.join(dir, `${item.id}.png`);
  await toTransparentPng(src, dest);
  const holes = await detectHoles(dest);
  console.log(
    item.id,
    "expect",
    item.shots,
    "got",
    holes.length,
    holes.length === item.shots ? "OK" : "SKIP",
  );
  if (holes.length !== item.shots) {
    // still keep if close (±0) only exact
    fs.unlinkSync(dest);
    const thumb = dest.replace(/\.png$/, "-thumb.jpg");
    if (fs.existsSync(thumb)) fs.unlinkSync(thumb);
    continue;
  }
  catalog.push({
    id: item.id,
    name: item.name,
    tag: item.tag,
    shots: item.shots,
    overlay: `/frames/by-count/${item.shots}/${item.id}.png`,
    thumb: `/frames/by-count/${item.shots}/${item.id}-thumb.jpg`,
    slots: holes,
    bg: "#fff8f3",
    ink: "#2b2430",
    accent: "#FF5C9A",
  });
}

// Also import previously good overlays if hole counts match expected
const LEGACY = [
  {
    file: "public/frames/overlays/lucky-charm.png",
    id: "legacy-lucky-3",
    name: "Lucky Charm Classic",
    tag: "Heart · Gingham",
    shots: 3,
  },
  {
    file: "public/frames/overlays/kyowo-cat.png",
    id: "legacy-kyowo-4",
    name: "Kyowo Cat Classic",
    tag: "Cat",
    shots: 4,
  },
  {
    file: "public/frames/overlays/lucky-garden.png",
    id: "legacy-garden-4",
    name: "Lucky Garden Classic",
    tag: "Mint",
    shots: 4,
  },
  {
    file: "public/frames/overlays/mirror-mood.png",
    id: "legacy-mirror-4",
    name: "Mirror Mood Classic",
    tag: "Coquette",
    shots: 4,
  },
  {
    file: "public/frames/overlays/coquette-xoxo.png",
    id: "legacy-xoxo-4",
    name: "xoxo Classic",
    tag: "Bow",
    shots: 4,
  },
  {
    file: "public/frames/overlays/night-meow.png",
    id: "legacy-night-4",
    name: "Night Meow Classic",
    tag: "Dark",
    shots: 4,
  },
  {
    file: "public/frames/overlays/garden-bloom.png",
    id: "legacy-bloom-4",
    name: "Garden Bloom Classic",
    tag: "Floral",
    shots: 4,
  },
  {
    file: "public/frames/overlays/berry-cafe.png",
    id: "legacy-berry-3",
    name: "Berry Cafe Classic",
    tag: "Strawberry",
    shots: 3,
  },
  {
    file: "public/frames/overlays/bliss-pop.png",
    id: "legacy-bliss-3",
    name: "Bliss Pop Classic",
    tag: "Y2K",
    shots: 3,
  },
  {
    file: "public/frames/overlays/happy-day.png",
    id: "legacy-happy-3",
    name: "Happy Day Classic",
    tag: "Fun",
    shots: 3,
  },
];

for (const item of LEGACY) {
  if (!fs.existsSync(item.file)) continue;
  const holes = await detectHoles(item.file);
  // bliss-pop may have 3 good holes after filter
  let slots = holes;
  if (holes.length !== item.shots) {
    // try filter by height
    slots = holes.filter((h) => h.h < 40 && h.h > 5);
  }
  if (slots.length !== item.shots) {
    console.log("legacy skip", item.id, holes.length);
    continue;
  }
  const dir = path.join(OUT, String(item.shots));
  fs.mkdirSync(dir, { recursive: true });
  const dest = path.join(dir, `${item.id}.png`);
  fs.copyFileSync(item.file, dest);
  // thumb
  try {
    await sharp(item.file)
      .resize({ width: 240 })
      .jpeg({ quality: 82 })
      .toFile(dest.replace(/\.png$/, "-thumb.jpg"));
  } catch {
    /* ignore */
  }
  catalog.push({
    id: item.id,
    name: item.name,
    tag: item.tag,
    shots: item.shots,
    overlay: `/frames/by-count/${item.shots}/${item.id}.png`,
    thumb: `/frames/by-count/${item.shots}/${item.id}-thumb.jpg`,
    slots,
    bg: "#fff8f3",
    ink: "#2b2430",
    accent: "#FF5C9A",
  });
  console.log("legacy OK", item.id, slots.length);
}

// Sort by shots then name
catalog.sort((a, b) => a.shots - b.shots || a.name.localeCompare(b.name));

fs.writeFileSync(
  path.resolve("public/frames/catalog.json"),
  JSON.stringify(catalog, null, 2),
);
console.log("\nCatalog total:", catalog.length);
console.log(
  "By count:",
  [2, 3, 4, 6]
    .map((n) => `${n}=${catalog.filter((c) => c.shots === n).length}`)
    .join(" "),
);
