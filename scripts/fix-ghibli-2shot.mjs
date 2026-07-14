/**
 * Rebuild all Ghibli 2-shot templates from regenerated art.
 * Natural white-hole detection only — never force-punch over theme art.
 */
import sharp from "sharp";
import fs from "fs";
import path from "path";

const SESSION =
  "C:\\Users\\aldii\\.grok\\sessions\\C%3A%5Cprojects%5Cphotobox\\019f5f64-751f-7622-abc1-a98f053463a0\\images";
const OUT = path.resolve("public/frames/by-count/2");
const CATALOG = path.resolve("public/frames/catalog.json");
const VER = "ghibli2s1";

const FRAMES = [
  { file: "69.jpg", id: "ghibli-totoro", name: "Totoro", tag: "Ghibli · Totoro", bg: "#E8F5E9", ink: "#2E5A3C", accent: "#A5D6A7" },
  { file: "67.jpg", id: "ghibli-rainy", name: "Rainy Day", tag: "Ghibli · Totoro", bg: "#E3F2FD", ink: "#1565C0", accent: "#90CAF9" },
  { file: "68.jpg", id: "ghibli-night", name: "Night Forest", tag: "Ghibli · Totoro", bg: "#1A237E", ink: "#E8EAF6", accent: "#7986CB" },
  { file: "66.jpg", id: "ghibli-catbus", name: "Catbus", tag: "Ghibli · Totoro", bg: "#1B3A2F", ink: "#FFF59D", accent: "#FFD54F" },
  { file: "73.jpg", id: "ghibli-ponyo", name: "Ponyo", tag: "Ghibli · Ponyo", bg: "#E0F7FA", ink: "#006064", accent: "#4DD0E1" },
  { file: "70.jpg", id: "ghibli-seawave", name: "Sea Wave", tag: "Ghibli · Ponyo", bg: "#B2EBF2", ink: "#01579B", accent: "#26C6DA" },
  { file: "72.jpg", id: "ghibli-undersea", name: "Undersea", tag: "Ghibli · Ponyo", bg: "#E0F2F1", ink: "#004D40", accent: "#80CBC4" },
  { file: "71.jpg", id: "ghibli-arrietty", name: "Arrietty", tag: "Ghibli · Arrietty", bg: "#F1F8E9", ink: "#33691E", accent: "#AED581" },
  { file: "77.jpg", id: "ghibli-borrowers", name: "Borrowers", tag: "Ghibli · Arrietty", bg: "#FFF8E1", ink: "#5D4037", accent: "#D7CCC8" },
  { file: "75.jpg", id: "ghibli-kiki", name: "Kiki", tag: "Ghibli · Kiki", bg: "#E8EAF6", ink: "#4527A0", accent: "#B39DDB" },
  { file: "76.jpg", id: "ghibli-jiji", name: "Jiji", tag: "Ghibli · Kiki", bg: "#311B92", ink: "#EDE7F6", accent: "#CE93D8" },
  { file: "74.jpg", id: "ghibli-delivery", name: "Delivery", tag: "Ghibli · Kiki", bg: "#FCE4EC", ink: "#6A1B9A", accent: "#F8BBD0" },
];

function isOuterBg(r, g, b) {
  const min = Math.min(r, g, b);
  const max = Math.max(r, g, b);
  const sat = max - min;
  if (min > 248 && sat < 8) return true;
  if (sat < 16 && min > 228) return true;
  if (b > r + 12 && b > g + 6 && min > 215 && sat < 40) return true;
  if (sat < 28 && min > 210) return true;
  return false;
}

function isHoleWhite(r, g, b) {
  const min = Math.min(r, g, b);
  const max = Math.max(r, g, b);
  const sat = max - min;
  if (min >= 246 && sat <= 10) return true;
  if (min >= 240 && sat <= 6) return true;
  return false;
}

async function cropToContent(src) {
  const { data, info } = await sharp(src)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  let minX = width,
    maxX = 0,
    minY = height,
    maxY = 0;
  let found = false;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * channels;
      if (!isOuterBg(data[o], data[o + 1], data[o + 2])) {
        found = true;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }
  if (!found || maxX - minX < width * 0.35) {
    return sharp(src).ensureAlpha().resize({ width: 720 }).png().toBuffer();
  }
  const pad = 2;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(width - 1, maxX + pad);
  maxY = Math.min(height - 1, maxY + pad);
  return sharp(src)
    .extract({
      left: minX,
      top: minY,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
    })
    .resize({ width: 720 })
    .ensureAlpha()
    .png()
    .toBuffer();
}

async function processFrame(src) {
  const cropped = await cropToContent(src);
  const { data, info } = await sharp(cropped)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  // Punch only pure white → transparent
  for (let i = 0; i < width * height; i++) {
    const o = i * channels;
    if (isHoleWhite(data[o], data[o + 1], data[o + 2])) {
      data[o] = 255;
      data[o + 1] = 255;
      data[o + 2] = 255;
      data[o + 3] = 0;
    } else {
      data[o + 3] = 255;
    }
  }

  // Connected components
  const mask = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    mask[i] = data[i * channels + 3] < 40 ? 1 : 0;
  }
  const visited = new Uint8Array(width * height);
  const boxes = [];
  const area = width * height;

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
      if (box.count < area * 0.02) continue;
      if (box.count > area * 0.4) continue;
      const bh = ((box.maxY - box.minY + 1) / height) * 100;
      const bw = ((box.maxX - box.minX + 1) / width) * 100;
      if (bh < 10 || bh > 48) continue;
      if (bw < 30) continue;
      boxes.push(box);
    }
  }
  boxes.sort((a, b) => a.minY - b.minY);

  // merge fragments
  const merged = [];
  for (const b of boxes) {
    const prev = merged[merged.length - 1];
    if (
      prev &&
      b.minY <= prev.maxY + height * 0.025 &&
      Math.abs((b.minX + b.maxX) / 2 - (prev.minX + prev.maxX) / 2) <
        width * 0.2
    ) {
      prev.minX = Math.min(prev.minX, b.minX);
      prev.maxX = Math.max(prev.maxX, b.maxX);
      prev.minY = Math.min(prev.minY, b.minY);
      prev.maxY = Math.max(prev.maxY, b.maxY);
      prev.count += b.count;
    } else {
      merged.push({ ...b });
    }
  }

  let chosen = merged;
  if (chosen.length > 2) {
    chosen = [...chosen]
      .sort((a, b) => b.count - a.count)
      .slice(0, 2)
      .sort((a, b) => a.minY - b.minY);
  }

  const pad = 1;
  const slots = chosen.map((b) => {
    const x = Math.max(0, b.minX - pad);
    const y = Math.max(0, b.minY - pad);
    const w = Math.min(width - 1, b.maxX + pad) - x + 1;
    const h = Math.min(height - 1, b.maxY + pad) - y + 1;
    return {
      x: +((x / width) * 100).toFixed(2),
      y: +((y / height) * 100).toFixed(2),
      w: +((w / width) * 100).toFixed(2),
      h: +((h / height) * 100).toFixed(2),
    };
  });

  const png = await sharp(data, { raw: { width, height, channels } })
    .png()
    .toBuffer();

  return { png, slots, width, height };
}

fs.mkdirSync(OUT, { recursive: true });
const existing = JSON.parse(fs.readFileSync(CATALOG, "utf8"));
const byId = new Map(existing.map((f) => [f.id, f]));

for (const item of FRAMES) {
  const src = path.join(SESSION, item.file);
  if (!fs.existsSync(src)) {
    console.log("MISSING", item.file);
    continue;
  }
  try {
    const { png, slots, width, height } = await processFrame(src);
    if (slots.length !== 2) {
      console.log("WARN", item.id, "slots", slots.length);
      if (slots.length < 2) continue;
    }
    const useSlots = slots.slice(0, 2);
    fs.writeFileSync(path.join(OUT, `${item.id}.png`), png);
    await sharp(png)
      .resize({ width: 240 })
      .jpeg({ quality: 85 })
      .toFile(path.join(OUT, `${item.id}-thumb.jpg`));

    byId.set(item.id, {
      id: item.id,
      name: item.name,
      tag: item.tag,
      shots: 2,
      overlay: `/frames/by-count/2/${item.id}.png?${VER}`,
      thumb: `/frames/by-count/2/${item.id}-thumb.jpg?${VER}`,
      slots: useSlots,
      bg: item.bg,
      ink: item.ink,
      accent: item.accent,
      canvasW: width,
      canvasH: height,
    });

    const totalH = useSlots.reduce((a, s) => a + s.h, 0);
    const minW = Math.min(...useSlots.map((s) => s.w));
    console.log(
      "OK",
      item.id,
      `w=${minW.toFixed(0)}%`,
      `totalH=${totalH.toFixed(1)}%`,
      `${width}x${height}`,
    );
  } catch (e) {
    console.error("FAIL", item.id, e.message);
  }
}

const updatedIds = new Set(FRAMES.map((f) => f.id));
const newG2 = FRAMES.map((f) => byId.get(f.id)).filter(Boolean);
const otherGhibli = existing.filter(
  (f) => f.id.startsWith("ghibli-") && !updatedIds.has(f.id),
);
const nonGhibli = existing.filter((f) => !String(f.id).startsWith("ghibli-"));

// 2-shot ghibli first among ghibli group for visibility
fs.writeFileSync(
  CATALOG,
  JSON.stringify([...newG2, ...otherGhibli, ...nonGhibli], null, 2),
);
console.log("\nUpdated", newG2.length, "two-shot Ghibli frames.");
