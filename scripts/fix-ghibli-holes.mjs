/**
 * Process Ghibli strips WITHOUT covering theme art.
 * - Detect pure-white photo windows only
 * - Punch ONLY white pixels (never paint over characters)
 * - Slot rects = tight bounds of each white window (+ tiny pad)
 * No forced 84%-width geometry that nukes decorations.
 */
import sharp from "sharp";
import fs from "fs";
import path from "path";

const SESSION =
  "C:\\Users\\aldii\\.grok\\sessions\\C%3A%5Cprojects%5Cphotobox\\019f5f64-751f-7622-abc1-a98f053463a0\\images";
const OUT = path.resolve("public/frames/by-count");
const CATALOG = path.resolve("public/frames/catalog.json");
const VER = "ghibli3";

const FRAMES = [
  // Totoro 4 (rebuilt art)
  { file: "47.jpg", id: "ghibli-totoro-4", name: "Totoro", tag: "Ghibli · Totoro", shots: 4, bg: "#E8F5E9", ink: "#2E5A3C", accent: "#A5D6A7" },
  { file: "50.jpg", id: "ghibli-rainy-4", name: "Rainy Day", tag: "Ghibli · Totoro", shots: 4, bg: "#E3F2FD", ink: "#1565C0", accent: "#90CAF9" },
  { file: "49.jpg", id: "ghibli-night-4", name: "Night Forest", tag: "Ghibli · Totoro", shots: 4, bg: "#1A237E", ink: "#E8EAF6", accent: "#7986CB" },
  { file: "48.jpg", id: "ghibli-catbus-4", name: "Catbus", tag: "Ghibli · Totoro", shots: 4, bg: "#1B3A2F", ink: "#FFF59D", accent: "#FFD54F" },
  // Ponyo 4
  { file: "54.jpg", id: "ghibli-ponyo-4", name: "Ponyo", tag: "Ghibli · Ponyo", shots: 4, bg: "#E0F7FA", ink: "#006064", accent: "#4DD0E1" },
  { file: "51.jpg", id: "ghibli-seawave-4", name: "Sea Wave", tag: "Ghibli · Ponyo", shots: 4, bg: "#B2EBF2", ink: "#01579B", accent: "#26C6DA" },
  { file: "53.jpg", id: "ghibli-undersea-4", name: "Undersea", tag: "Ghibli · Ponyo", shots: 4, bg: "#E0F2F1", ink: "#004D40", accent: "#80CBC4" },
  // Arrietty + Sho
  { file: "59.jpg", id: "ghibli-arrietty", name: "Arrietty", tag: "Ghibli · Arrietty", shots: 2, bg: "#F1F8E9", ink: "#33691E", accent: "#AED581" },
  { file: "61.jpg", id: "ghibli-arrietty-3", name: "Arrietty", tag: "Ghibli · Arrietty", shots: 3, bg: "#F1F8E9", ink: "#33691E", accent: "#AED581" },
  { file: "52.jpg", id: "ghibli-arrietty-4", name: "Arrietty", tag: "Ghibli · Arrietty", shots: 4, bg: "#F1F8E9", ink: "#33691E", accent: "#AED581" },
  { file: "63.jpg", id: "ghibli-borrowers", name: "Borrowers", tag: "Ghibli · Arrietty", shots: 2, bg: "#FFF8E1", ink: "#5D4037", accent: "#D7CCC8" },
  { file: "64.jpg", id: "ghibli-borrowers-3", name: "Borrowers", tag: "Ghibli · Arrietty", shots: 3, bg: "#FFF8E1", ink: "#5D4037", accent: "#D7CCC8" },
  { file: "58.jpg", id: "ghibli-borrowers-4", name: "Borrowers", tag: "Ghibli · Arrietty", shots: 4, bg: "#FFF8E1", ink: "#5D4037", accent: "#D7CCC8" },
  // Kiki 4
  { file: "55.jpg", id: "ghibli-kiki-4", name: "Kiki", tag: "Ghibli · Kiki", shots: 4, bg: "#E8EAF6", ink: "#4527A0", accent: "#B39DDB" },
  { file: "57.jpg", id: "ghibli-jiji-4", name: "Jiji", tag: "Ghibli · Kiki", shots: 4, bg: "#311B92", ink: "#EDE7F6", accent: "#CE93D8" },
  { file: "65.jpg", id: "ghibli-delivery-4", name: "Delivery", tag: "Ghibli · Kiki", shots: 4, bg: "#FCE4EC", ink: "#6A1B9A", accent: "#F8BBD0" },
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

/** Near-white photo window (AI gens are rarely pure #FFF) */
function isHoleWhite(r, g, b) {
  const min = Math.min(r, g, b);
  const max = Math.max(r, g, b);
  const sat = max - min;
  // pure white windows
  if (min >= 246 && sat <= 10) return true;
  // slightly off-white paper fill
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

async function processFrame(src, wantShots) {
  const cropped = await cropToContent(src);
  const { data, info } = await sharp(cropped)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  // 1) Punch ONLY pure-white pixels → transparent (theme art stays)
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

  // 2) Connected components on transparent mask → photo slots
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

  const area = width * height;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      if (!mask[i] || visited[i]) continue;
      const box = flood(x, y);
      // photo hole: not noise, not whole canvas
      if (box.count < area * 0.012) continue;
      if (box.count > area * 0.32) continue;
      const bh = ((box.maxY - box.minY + 1) / height) * 100;
      const bw = ((box.maxX - box.minX + 1) / width) * 100;
      if (bh < 6 || bh > 42) continue;
      if (bw < 25) continue; // ignore thin cracks
      boxes.push(box);
    }
  }

  boxes.sort((a, b) => a.minY - b.minY);

  // merge overlapping vertically-adjacent fragments of same hole
  const merged = [];
  for (const b of boxes) {
    const prev = merged[merged.length - 1];
    if (
      prev &&
      b.minY <= prev.maxY + height * 0.02 &&
      Math.abs((b.minX + b.maxX) / 2 - (prev.minX + prev.maxX) / 2) <
        width * 0.15
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
  if (chosen.length > wantShots) {
    // keep the largest N by area, then sort top→bottom
    chosen = [...chosen]
      .sort((a, b) => b.count - a.count)
      .slice(0, wantShots)
      .sort((a, b) => a.minY - b.minY);
  }

  const pad = 1;
  const slots = chosen.map((b) => {
    const x = Math.max(0, b.minX - pad);
    const y = Math.max(0, b.minY - pad);
    const w = Math.min(width, b.maxX + pad) - x + 1;
    const h = Math.min(height, b.maxY + pad) - y + 1;
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

  return { png, slots, width, height, found: slots.length };
}

for (const n of [2, 3, 4]) {
  fs.mkdirSync(path.join(OUT, String(n)), { recursive: true });
}

const existing = JSON.parse(fs.readFileSync(CATALOG, "utf8"));
const byId = new Map(existing.map((f) => [f.id, f]));
let ok = 0,
  warn = 0;

for (const item of FRAMES) {
  const src = path.join(SESSION, item.file);
  if (!fs.existsSync(src)) {
    console.log("MISSING", item.file, item.id);
    continue;
  }
  try {
    const { png, slots, width, height, found } = await processFrame(
      src,
      item.shots,
    );
    if (found !== item.shots) {
      console.log(
        "WARN",
        item.id,
        `found ${found} holes, want ${item.shots}`,
      );
      warn++;
      // still save if we have something usable
      if (found === 0) continue;
    } else {
      ok++;
    }

    const dir = path.join(OUT, String(item.shots));
    fs.writeFileSync(path.join(dir, `${item.id}.png`), png);
    await sharp(png)
      .resize({ width: 240 })
      .jpeg({ quality: 85 })
      .toFile(path.join(dir, `${item.id}-thumb.jpg`));

    // If hole count mismatch, keep previous catalog slots if same count, else use found
    let finalSlots = slots;
    if (found !== item.shots) {
      const prev = byId.get(item.id);
      if (prev?.slots?.length === item.shots) {
        // keep old slots only if new detection failed badly
        if (found < item.shots) finalSlots = prev.slots;
      }
      // if we found more/fewer, use detected and update shots? No — keep expected shots with best N
      if (found > item.shots) finalSlots = slots.slice(0, item.shots);
    }

    if (finalSlots.length !== item.shots) {
      console.log("SKIP catalog", item.id, "slots", finalSlots.length);
      // still write PNG for manual check
      continue;
    }

    byId.set(item.id, {
      id: item.id,
      name: item.name,
      tag: item.tag,
      shots: item.shots,
      overlay: `/frames/by-count/${item.shots}/${item.id}.png?${VER}`,
      thumb: `/frames/by-count/${item.shots}/${item.id}-thumb.jpg?${VER}`,
      slots: finalSlots,
      bg: item.bg,
      ink: item.ink,
      accent: item.accent,
      canvasW: width,
      canvasH: height,
    });

    const avgW = (
      finalSlots.reduce((a, s) => a + s.w, 0) / finalSlots.length
    ).toFixed(0);
    const totalH = finalSlots.reduce((a, s) => a + s.h, 0).toFixed(1);
    console.log(
      "OK",
      item.id,
      `holes=${finalSlots.length}`,
      `avgW=${avgW}%`,
      `totalH=${totalH}%`,
    );
  } catch (e) {
    console.error("FAIL", item.id, e.message);
  }
}

// rebuild catalog: ghibli first
const all = [...byId.values()];
const ghibli = all.filter((f) => String(f.id).startsWith("ghibli-"));
const rest = all.filter((f) => !String(f.id).startsWith("ghibli-"));
// stable-ish: keep non-updated ghibli from existing that aren't in FRAMES
const updatedIds = new Set(FRAMES.map((f) => f.id));
const oldGhibli = existing.filter(
  (f) => f.id.startsWith("ghibli-") && !updatedIds.has(f.id),
);
const newGhibli = FRAMES.map((f) => byId.get(f.id)).filter(Boolean);
const mergedGhibli = [...newGhibli, ...oldGhibli];
const nonGhibli = existing.filter((f) => !String(f.id).startsWith("ghibli-"));

fs.writeFileSync(
  CATALOG,
  JSON.stringify([...mergedGhibli, ...nonGhibli], null, 2),
);
console.log(`\nDone. OK=${ok} WARN=${warn}`);
console.log("Catalog", mergedGhibli.length + nonGhibli.length);
