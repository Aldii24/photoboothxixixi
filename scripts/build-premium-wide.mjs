/**
 * Premium frames with WIDE photos — keep illustrated design, enlarge photo column.
 *
 * Method: split original art into [left décor | photo column | right décor],
 * re-compose with photo column ~80% width. Decorations stay intact (scaled into
 * thin side strips). No plain pink bars, no destroying stickers.
 */
import sharp from "sharp";
import fs from "fs";
import path from "path";

const OVERLAY = path.resolve("public/frames/overlays");
const SESSION =
  "C:\\Users\\aldii\\.grok\\sessions\\C%3A%5Cprojects%5Cphotobox\\019f5c19-6b12-7fc0-ba68-da0d7b13d6d4\\images";
const OUT = path.resolve("public/frames/by-count");
const CATALOG = path.resolve("public/frames/catalog.json");
const VER = "wide12";

// Target photo column width as fraction of canvas
const TARGET_COL = 0.78; // 78% photos — décor 11% each side
const SIDE_EACH = (1 - TARGET_COL) / 2;

const FRAMES = [
  // 4-shot premium illustrated
  { src: path.join(OVERLAY, "kyowo-cat.png"), id: "premium-kyowo-cat", name: "Kyowo Cat", tag: "Premium · Cat", shots: 4, bg: "#FFE8D0", ink: "#E85A8C", accent: "#FFB86B" },
  { src: path.join(OVERLAY, "coquette-xoxo.png"), id: "premium-coquette-xoxo", name: "Coquette xoxo", tag: "Premium · Bow", shots: 4, bg: "#FFE8F0", ink: "#5c2a45", accent: "#FF5C9A" },
  { src: path.join(OVERLAY, "night-meow.png"), id: "premium-night-meow", name: "Night Meow", tag: "Premium · Dark", shots: 4, bg: "#151528", ink: "#FFE0F0", accent: "#C9B6FF" },
  { src: path.join(OVERLAY, "lucky-garden.png"), id: "premium-lucky-garden", name: "Lucky Garden", tag: "Premium · Mint", shots: 4, bg: "#B8F0C8", ink: "#2b5c40", accent: "#6BCB77" },
  { src: path.join(OVERLAY, "garden-bloom.png"), id: "premium-garden-bloom", name: "Garden Bloom", tag: "Premium · Floral", shots: 4, bg: "#FFF0F5", ink: "#C45C7A", accent: "#FF8FB5" },
  { src: path.join(OVERLAY, "mirror-mood.png"), id: "premium-mirror-mood", name: "Mirror Mood", tag: "Premium · Coquette", shots: 4, bg: "#FFC8DC", ink: "#5c2a45", accent: "#FF8FB5" },
  { src: path.join(SESSION, "62.jpg"), id: "premium-xoxo-four", name: "xoxo Four", tag: "Premium · Bow", shots: 4, bg: "#FFE8F0", ink: "#5c2a45", accent: "#FF5C9A" },
  // 3-shot
  { src: path.join(OVERLAY, "lucky-charm.png"), id: "premium-lucky-charm", name: "Lucky Charm", tag: "Premium · Heart", shots: 3, bg: "#F5E06A", ink: "#E83D7A", accent: "#FF8FB5" },
  { src: path.join(OVERLAY, "bliss-pop.png"), id: "premium-bliss-pop", name: "Bliss Pop!", tag: "Premium · Y2K", shots: 3, bg: "#A8D8FF", ink: "#FF2E8A", accent: "#6BB0FF" },
  { src: path.join(OVERLAY, "berry-cafe.png"), id: "premium-berry-cafe", name: "Strawberry Cafe", tag: "Premium · Berry", shots: 3, bg: "#FFD6E8", ink: "#B83D6E", accent: "#FF6B9D" },
  { src: path.join(OVERLAY, "happy-day.png"), id: "premium-happy-day", name: "Happy Day", tag: "Premium · Fun", shots: 3, bg: "#FFE566", ink: "#1E5A8A", accent: "#5B9DFF" },
  { src: path.join(SESSION, "61.jpg"), id: "premium-lucky-trio", name: "Lucky Charm Trio", tag: "Premium · Heart", shots: 3, bg: "#F5E06A", ink: "#E83D7A", accent: "#FF8FB5" },
  // 2-shot
  { src: path.join(SESSION, "56.jpg"), id: "premium-lucky-duo", name: "Lucky Duo", tag: "Premium · Heart", shots: 2, bg: "#F5E06A", ink: "#E83D7A", accent: "#FF8FB5" },
  { src: path.join(SESSION, "57.jpg"), id: "premium-kyowo-duo", name: "Kyowo Duo", tag: "Premium · Cat", shots: 2, bg: "#FFE8D0", ink: "#E85A8C", accent: "#FFB86B" },
  { src: path.join(SESSION, "60.jpg"), id: "premium-bliss-duo", name: "Bliss Duo", tag: "Premium · Y2K", shots: 2, bg: "#A8D8FF", ink: "#FF2E8A", accent: "#6BB0FF" },
  { src: path.join(SESSION, "59.jpg"), id: "premium-berry-duo", name: "Berry Duo", tag: "Premium · Berry", shots: 2, bg: "#FFD6E8", ink: "#B83D6E", accent: "#FF6B9D" },
  { src: path.join(SESSION, "64.jpg"), id: "premium-mirror-duo", name: "Mirror Duo", tag: "Premium · Coquette", shots: 2, bg: "#FFC8DC", ink: "#5c2a45", accent: "#FF8FB5" },
  { src: path.join(SESSION, "65.jpg"), id: "premium-garden-duo", name: "Bloom Duo", tag: "Premium · Floral", shots: 2, bg: "#FFF0F5", ink: "#C45C7A", accent: "#FF8FB5" },
];

function isWhite(r, g, b, a) {
  if (a < 40) return true;
  // STRICT pure white only — cream gingham / light pink must NOT count
  const min = Math.min(r, g, b);
  const max = Math.max(r, g, b);
  const sat = max - min;
  return min >= 248 && sat <= 8;
}

async function loadRaw(src) {
  const { data, info } = await sharp(src)
    .ensureAlpha()
    .resize({ width: 720 })
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height, channels: info.channels };
}

/** Find photo column bounds from white/transparent holes */
function findPhotoColumn(data, width, height, channels) {
  const colScore = new Array(width).fill(0);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * channels;
      if (isWhite(data[o], data[o + 1], data[o + 2], data[o + 3])) {
        colScore[x]++;
      }
    }
  }
  const thr = height * 0.08;
  let minX = 0,
    maxX = width - 1;
  // find first/last column with significant white
  for (let x = 0; x < width; x++) {
    if (colScore[x] >= thr) {
      minX = x;
      break;
    }
  }
  for (let x = width - 1; x >= 0; x--) {
    if (colScore[x] >= thr) {
      maxX = x;
      break;
    }
  }
  // pad a little so pink window borders go with the column
  minX = Math.max(0, minX - 8);
  maxX = Math.min(width - 1, maxX + 8);
  if (maxX - minX < width * 0.25) {
    // fallback center 50%
    minX = Math.round(width * 0.25);
    maxX = Math.round(width * 0.75);
  }
  return { minX, maxX };
}

async function recomposeWide(src, shots) {
  const { data, width, height, channels } = await loadRaw(src);
  const { minX, maxX } = findPhotoColumn(data, width, height, channels);
  const colW = maxX - minX + 1;

  // Source strips
  const leftW = Math.max(1, minX);
  const rightW = Math.max(1, width - 1 - maxX);
  const centerW = colW;

  const rawBuf = await sharp(data, {
    raw: { width, height, channels },
  })
    .png()
    .toBuffer();

  // Extract three vertical strips
  const leftStrip =
    leftW > 2
      ? await sharp(rawBuf)
          .extract({ left: 0, top: 0, width: leftW, height })
          .png()
          .toBuffer()
      : null;
  const centerStrip = await sharp(rawBuf)
    .extract({ left: minX, top: 0, width: centerW, height })
    .png()
    .toBuffer();
  const rightStrip =
    rightW > 2
      ? await sharp(rawBuf)
          .extract({ left: maxX + 1, top: 0, width: rightW, height })
          .png()
          .toBuffer()
      : null;

  const outW = 720;
  const outH = height;
  const sideW = Math.round(outW * SIDE_EACH);
  const midW = outW - sideW * 2;

  // Resize strips to target widths
  const leftOut = leftStrip
    ? await sharp(leftStrip).resize(sideW, outH, { fit: "fill" }).png().toBuffer()
    : await sharp({
        create: {
          width: sideW,
          height: outH,
          channels: 3,
          background: { r: 255, g: 240, b: 245 },
        },
      })
        .png()
        .toBuffer();

  const centerOut = await sharp(centerStrip)
    .resize(midW, outH, { fit: "fill" })
    .png()
    .toBuffer();

  const rightOut = rightStrip
    ? await sharp(rightStrip).resize(sideW, outH, { fit: "fill" }).png().toBuffer()
    : await sharp({
        create: {
          width: sideW,
          height: outH,
          channels: 3,
          background: { r: 255, g: 240, b: 245 },
        },
      })
        .png()
        .toBuffer();

  // Compose
  let composed = await sharp({
    create: {
      width: outW,
      height: outH,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([
      { input: leftOut, left: 0, top: 0 },
      { input: centerOut, left: sideW, top: 0 },
      { input: rightOut, left: sideW + midW, top: 0 },
    ])
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Punch soft-white to alpha on composed image
  const d = composed.data;
  const w = composed.info.width;
  const h = composed.info.height;
  const ch = composed.info.channels;
  for (let i = 0; i < w * h; i++) {
    const o = i * ch;
    if (isWhite(d[o], d[o + 1], d[o + 2], d[o + 3])) {
      d[o] = 255;
      d[o + 1] = 255;
      d[o + 2] = 255;
      d[o + 3] = 0;
    } else {
      d[o + 3] = 255;
    }
  }

  // Detect holes on wide result
  const slots = detectHoles(d, w, h, ch, shots);

  const png = await sharp(d, { raw: { width: w, height: h, channels: ch } })
    .png()
    .toBuffer();

  return { png, slots, width: w, height: h, oldCol: +(colW / width * 100).toFixed(1) };
}

function detectHoles(data, width, height, channels, want) {
  const mask = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    mask[i] = data[i * channels + 3] < 50 ? 1 : 0;
  }
  // horizontal bands
  const row = new Array(height).fill(0);
  for (let y = 0; y < height; y++) {
    let c = 0;
    for (let x = 0; x < width; x++) if (mask[y * width + x]) c++;
    row[y] = c;
  }
  const thr = width * 0.2;
  const bands = [];
  let inB = false,
    s = 0;
  for (let y = 0; y < height; y++) {
    if (row[y] >= thr && !inB) {
      inB = true;
      s = y;
    } else if (row[y] < thr && inB) {
      inB = false;
      if (y - s > height * 0.05) bands.push([s, y - 1]);
    }
  }
  if (inB && height - s > height * 0.05) bands.push([s, height - 1]);

  let chosen = bands;
  if (bands.length > want) {
    // keep largest by height
    chosen = [...bands]
      .sort((a, b) => b[1] - b[0] - (a[1] - a[0]))
      .slice(0, want)
      .sort((a, b) => a[0] - b[0]);
  }

  // if too few, equal-split the transparent vertical range
  if (chosen.length < want) {
    let minY = height,
      maxY = 0,
      minX = width,
      maxX = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (mask[y * width + x]) {
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
        }
      }
    }
    if (maxY > minY) {
      const gap = Math.round(height * 0.01);
      const holeH = Math.floor((maxY - minY - gap * (want - 1)) / want);
      chosen = [];
      for (let i = 0; i < want; i++) {
        const y0 = minY + i * (holeH + gap);
        chosen.push([y0, y0 + holeH - 1]);
      }
      // use minX maxX for all
      return chosen.map(([y0, y1]) => ({
        x: +((minX / width) * 100).toFixed(2),
        y: +((y0 / height) * 100).toFixed(2),
        w: +(((maxX - minX + 1) / width) * 100).toFixed(2),
        h: +(((y1 - y0 + 1) / height) * 100).toFixed(2),
      }));
    }
  }

  return chosen.map(([y0, y1]) => {
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
    if (maxX < minX) {
      minX = Math.round(width * SIDE_EACH);
      maxX = Math.round(width * (1 - SIDE_EACH));
    }
    return {
      x: +((minX / width) * 100).toFixed(2),
      y: +((y0 / height) * 100).toFixed(2),
      w: +(((maxX - minX + 1) / width) * 100).toFixed(2),
      h: +(((y1 - y0 + 1) / height) * 100).toFixed(2),
    };
  });
}

// wipe
for (const n of [2, 3, 4]) {
  fs.rmSync(path.join(OUT, String(n)), { recursive: true, force: true });
  fs.mkdirSync(path.join(OUT, String(n)), { recursive: true });
}

const catalog = [];

for (const item of FRAMES) {
  if (!fs.existsSync(item.src)) {
    console.log("skip missing", item.id);
    continue;
  }
  try {
    const { png, slots, width, height, oldCol } = await recomposeWide(
      item.src,
      item.shots,
    );
    if (slots.length < item.shots) {
      console.log(
        "⚠",
        item.id,
        "slots",
        slots.length,
        "want",
        item.shots,
        slots.map((s) => `w${s.w}`).join(" "),
      );
      if (slots.length < 2) continue;
    }
    const use = slots.slice(0, Math.min(slots.length, item.shots));
    const shots = use.length;
    const avgW = use.reduce((a, s) => a + s.w, 0) / use.length;

    const dest = path.join(OUT, String(shots), `${item.id}.png`);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, png);
    await sharp(png)
      .resize({ width: 260 })
      .jpeg({ quality: 90 })
      .toFile(dest.replace(/\.png$/, "-thumb.jpg"));

    catalog.push({
      id: item.id,
      name: item.name,
      tag: item.tag,
      shots,
      overlay: `/frames/by-count/${shots}/${item.id}.png?${VER}`,
      thumb: `/frames/by-count/${shots}/${item.id}-thumb.jpg?${VER}`,
      slots: use,
      bg: item.bg,
      ink: item.ink,
      accent: item.accent,
      canvasW: width,
      canvasH: height,
    });
    console.log(
      "✓",
      item.id,
      `${shots}s`,
      `col ${oldCol}%→ photoW=${avgW.toFixed(1)}%`,
    );
  } catch (e) {
    console.error("fail", item.id, e.message);
  }
}

catalog.sort((a, b) => a.shots - b.shots || a.name.localeCompare(b.name));
fs.writeFileSync(CATALOG, JSON.stringify(catalog, null, 2));
console.log(
  "\nPREMIUM WIDE",
  catalog.length,
  [2, 3, 4]
    .map((n) => `${n}=${catalog.filter((c) => c.shots === n).length}`)
    .join(" "),
);
if (catalog.length) {
  const avg =
    catalog.reduce(
      (a, c) => a + c.slots.reduce((s, sl) => s + sl.w, 0) / c.slots.length,
      0,
    ) / catalog.length;
  console.log("avg photo width", avg.toFixed(1) + "%");
}
