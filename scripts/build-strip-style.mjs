/**
 * Build photostrips matching user's reference style (cute flat vector strips).
 * Auto-crop empty side canvas, punch pure white holes, detect slots.
 */
import sharp from "sharp";
import fs from "fs";
import path from "path";

const SESSION =
  "C:\\Users\\aldii\\.grok\\sessions\\C%3A%5Cprojects%5Cphotobox\\019f5c19-6b12-7fc0-ba68-da0d7b13d6d4\\images";
const OUT = path.resolve("public/frames/by-count");
const CATALOG = path.resolve("public/frames/catalog.json");
const VER = "strip13";

const FRAMES = [
  // from reference recreations
  { file: "146.jpg", id: "strip-love-hearts", name: "Love Around", tag: "Strip · Heart", shots: 3, bg: "#FFD6E8", ink: "#5B8DEF", accent: "#8BB8F0" },
  { file: "144.jpg", id: "strip-home-sweet", name: "Home Sweet", tag: "Strip · Home", shots: 2, bg: "#FFF0F5", ink: "#E85A8C", accent: "#FF8FB5" },
  { file: "143.jpg", id: "strip-the-moment", name: "The Moment", tag: "Strip · Fun", shots: 3, bg: "#FFFFFF", ink: "#222222", accent: "#FF6B9D" },
  { file: "147.jpg", id: "strip-fearless-house", name: "Fearless House", tag: "Strip · Pastel", shots: 4, bg: "#FFE8F0", ink: "#7E57C2", accent: "#FF80AB" },
  { file: "145.jpg", id: "strip-best-day", name: "Best Day", tag: "Strip · Camera", shots: 3, bg: "#FFD6E8", ink: "#C2185B", accent: "#FF8FB5" },
  { file: "151.jpg", id: "strip-lucky-day", name: "Lucky Day", tag: "Strip · Mint", shots: 3, bg: "#E8F5E9", ink: "#2E7D32", accent: "#66BB6A" },
  { file: "150.jpg", id: "strip-dream", name: "Dream", tag: "Strip · Dreamy", shots: 4, bg: "#F3E5F5", ink: "#6A1B9A", accent: "#CE93D8" },
  { file: "148.jpg", id: "strip-sweet", name: "Sweet", tag: "Strip · Warm", shots: 2, bg: "#FFF9C4", ink: "#F57F17", accent: "#FFD54F" },
  { file: "149.jpg", id: "strip-bubble", name: "Bubble", tag: "Strip · Cool", shots: 2, bg: "#E3F2FD", ink: "#1565C0", accent: "#64B5F6" },
  { file: "152.jpg", id: "strip-meow", name: "Meow", tag: "Strip · Cat", shots: 4, bg: "#FFE8D0", ink: "#E85A8C", accent: "#FFAB91" },
  { file: "153.jpg", id: "strip-xoxo", name: "xoxo", tag: "Strip · Coquette", shots: 3, bg: "#FFF0F5", ink: "#C2185B", accent: "#FF80AB" },
];

function isBgPixel(r, g, b) {
  // empty canvas around strip: light blue / light gray / near white uniform
  const min = Math.min(r, g, b);
  const max = Math.max(r, g, b);
  const sat = max - min;
  // solid pale blue sky
  if (b > r + 15 && b > g + 5 && min > 180) return true;
  // solid light gray
  if (sat < 12 && min > 200 && min < 250) return true;
  // pure white canvas
  if (min > 250 && sat < 5) return true;
  return false;
}

function isHolePixel(r, g, b, a) {
  if (a < 40) return true;
  const min = Math.min(r, g, b);
  const sat = Math.max(r, g, b) - min;
  // pure white photo windows only
  return min >= 248 && sat <= 8;
}

async function cropToStrip(src) {
  const { data, info } = await sharp(src)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  let minX = width,
    maxX = 0,
    minY = height,
    maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * channels;
      const r = data[o],
        g = data[o + 1],
        b = data[o + 2];
      if (!isBgPixel(r, g, b)) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }
  // pad
  const pad = 4;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(width - 1, maxX + pad);
  maxY = Math.min(height - 1, maxY + pad);

  if (maxX <= minX || maxY <= minY) {
    // no crop
    return sharp(src).ensureAlpha().resize({ width: 720 }).png().toBuffer();
  }

  const cw = maxX - minX + 1;
  const ch = maxY - minY + 1;
  return sharp(src)
    .extract({ left: minX, top: minY, width: cw, height: ch })
    .resize({ width: 720 })
    .ensureAlpha()
    .png()
    .toBuffer();
}

async function processFrame(src, wantShots) {
  const cropped = await cropToStrip(src);
  const { data, info } = await sharp(cropped)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  // punch holes
  for (let i = 0; i < width * height; i++) {
    const o = i * channels;
    if (isHolePixel(data[o], data[o + 1], data[o + 2], data[o + 3])) {
      data[o] = 255;
      data[o + 1] = 255;
      data[o + 2] = 255;
      data[o + 3] = 0;
    } else {
      data[o + 3] = 255;
    }
  }

  // band detect
  const mask = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    mask[i] = data[i * channels + 3] < 50 ? 1 : 0;
  }
  const row = new Array(height).fill(0);
  for (let y = 0; y < height; y++) {
    let c = 0;
    for (let x = 0; x < width; x++) if (mask[y * width + x]) c++;
    row[y] = c;
  }
  const thr = width * 0.15;
  const bands = [];
  let inB = false,
    s = 0;
  for (let y = 0; y < height; y++) {
    if (row[y] >= thr && !inB) {
      inB = true;
      s = y;
    } else if (row[y] < thr && inB) {
      inB = false;
      if (y - s > height * 0.04) bands.push([s, y - 1]);
    }
  }
  if (inB && height - s > height * 0.04) bands.push([s, height - 1]);

  let chosen = bands;
  if (bands.length > wantShots) {
    chosen = [...bands]
      .sort((a, b) => b[1] - b[0] - (a[1] - a[0]))
      .slice(0, wantShots)
      .sort((a, b) => a[0] - b[0]);
  }

  const slots = chosen.map(([y0, y1]) => {
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
      minX = Math.round(width * 0.12);
      maxX = Math.round(width * 0.88);
    }
    return {
      x: +((minX / width) * 100).toFixed(2),
      y: +((y0 / height) * 100).toFixed(2),
      w: +(((maxX - minX + 1) / width) * 100).toFixed(2),
      h: +(((y1 - y0 + 1) / height) * 100).toFixed(2),
    };
  });

  const png = await sharp(data, {
    raw: { width, height, channels },
  })
    .png()
    .toBuffer();

  return { png, slots, width, height };
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
  try {
    const { png, slots, width, height } = await processFrame(src, item.shots);
    if (slots.length < 2) {
      console.log("⚠ few holes", item.id, slots.length);
      continue;
    }
    const shots = Math.min(slots.length, item.shots);
    // if detected count differs meaningfully, use detected
    const useShots =
      Math.abs(slots.length - item.shots) <= 1
        ? Math.min(slots.length, item.shots === 2 ? 2 : item.shots === 3 ? 3 : 4)
        : Math.min(slots.length, 4);
    // prefer declared if close
    let finalShots = item.shots;
    let useSlots = slots;
    if (slots.length >= item.shots) {
      useSlots = slots.slice(0, item.shots);
      finalShots = item.shots;
    } else {
      useSlots = slots;
      finalShots = slots.length;
      if (finalShots < 2 || finalShots > 4) {
        console.log("skip", item.id, "shots", finalShots);
        continue;
      }
    }

    const avgW =
      useSlots.reduce((a, s) => a + s.w, 0) / useSlots.length;

    const dest = path.join(OUT, String(finalShots), `${item.id}.png`);
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
      shots: finalShots,
      overlay: `/frames/by-count/${finalShots}/${item.id}.png?${VER}`,
      thumb: `/frames/by-count/${finalShots}/${item.id}-thumb.jpg?${VER}`,
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
      `${finalShots}s`,
      `w=${avgW.toFixed(1)}%`,
      `${width}x${height}`,
    );
  } catch (e) {
    console.error("fail", item.id, e.message);
  }
}

catalog.sort((a, b) => a.shots - b.shots || a.name.localeCompare(b.name));
fs.writeFileSync(CATALOG, JSON.stringify(catalog, null, 2));
console.log(
  "\nSTRIP STYLE",
  catalog.length,
  [2, 3, 4]
    .map((n) => `${n}=${catalog.filter((c) => c.shots === n).length}`)
    .join(" "),
);
