/**
 * Process Studio Ghibli photostrip templates → transparent holes + catalog merge.
 * Does NOT wipe existing frames.
 */
import sharp from "sharp";
import fs from "fs";
import path from "path";

const SESSION =
  "C:\\Users\\aldii\\.grok\\sessions\\C%3A%5Cprojects%5Cphotobox\\019f5f64-751f-7622-abc1-a98f053463a0\\images";
const OUT = path.resolve("public/frames/by-count");
const CATALOG = path.resolve("public/frames/catalog.json");
const VER = "ghibli1";

/**
 * file → meta. shots is expected hole count; process will verify.
 * Mapping from generation session (verified by visual review + hole detection).
 */
const FRAMES = [
  // ——— Totoro ———
  { file: "4.jpg", id: "ghibli-totoro", name: "Totoro", tag: "Ghibli · Totoro", shots: 2, bg: "#E8F5E9", ink: "#2E5A3C", accent: "#A5D6A7" },
  { file: "17.jpg", id: "ghibli-totoro-3", name: "Totoro", tag: "Ghibli · Totoro", shots: 3, bg: "#E8F5E9", ink: "#2E5A3C", accent: "#A5D6A7" },
  { file: "14.jpg", id: "ghibli-totoro-4", name: "Totoro", tag: "Ghibli · Totoro", shots: 4, bg: "#E8F5E9", ink: "#2E5A3C", accent: "#A5D6A7" },

  { file: "7.jpg", id: "ghibli-rainy", name: "Rainy Day", tag: "Ghibli · Totoro", shots: 2, bg: "#E3F2FD", ink: "#1565C0", accent: "#90CAF9" },
  { file: "18.jpg", id: "ghibli-rainy-3", name: "Rainy Day", tag: "Ghibli · Totoro", shots: 3, bg: "#E3F2FD", ink: "#1565C0", accent: "#90CAF9" },
  { file: "21.jpg", id: "ghibli-rainy-4", name: "Rainy Day", tag: "Ghibli · Totoro", shots: 4, bg: "#E3F2FD", ink: "#1565C0", accent: "#90CAF9" },

  { file: "2.jpg", id: "ghibli-night", name: "Night Forest", tag: "Ghibli · Totoro", shots: 2, bg: "#1A237E", ink: "#E8EAF6", accent: "#7986CB" },
  { file: "22.jpg", id: "ghibli-night-3", name: "Night Forest", tag: "Ghibli · Totoro", shots: 3, bg: "#1A237E", ink: "#E8EAF6", accent: "#7986CB" },
  { file: "43.jpg", id: "ghibli-night-4", name: "Night Forest", tag: "Ghibli · Totoro", shots: 4, bg: "#1A237E", ink: "#E8EAF6", accent: "#7986CB" },

  { file: "13.jpg", id: "ghibli-catbus", name: "Catbus", tag: "Ghibli · Totoro", shots: 2, bg: "#1B3A2F", ink: "#FFF59D", accent: "#FFD54F" },
  { file: "36.jpg", id: "ghibli-catbus-3", name: "Catbus", tag: "Ghibli · Totoro", shots: 3, bg: "#1B3A2F", ink: "#FFF59D", accent: "#FFD54F" },
  { file: "42.jpg", id: "ghibli-catbus-4", name: "Catbus", tag: "Ghibli · Totoro", shots: 4, bg: "#1B3A2F", ink: "#FFF59D", accent: "#FFD54F" },

  // ——— Ponyo ———
  { file: "5.jpg", id: "ghibli-ponyo", name: "Ponyo", tag: "Ghibli · Ponyo", shots: 2, bg: "#E0F7FA", ink: "#006064", accent: "#4DD0E1" },
  { file: "15.jpg", id: "ghibli-ponyo-3", name: "Ponyo", tag: "Ghibli · Ponyo", shots: 3, bg: "#E0F7FA", ink: "#006064", accent: "#4DD0E1" },
  { file: "16.jpg", id: "ghibli-ponyo-4", name: "Ponyo", tag: "Ghibli · Ponyo", shots: 4, bg: "#E0F7FA", ink: "#006064", accent: "#4DD0E1" },

  { file: "3.jpg", id: "ghibli-seawave", name: "Sea Wave", tag: "Ghibli · Ponyo", shots: 2, bg: "#B2EBF2", ink: "#01579B", accent: "#26C6DA" },
  { file: "24.jpg", id: "ghibli-seawave-3", name: "Sea Wave", tag: "Ghibli · Ponyo", shots: 3, bg: "#B2EBF2", ink: "#01579B", accent: "#26C6DA" },
  { file: "25.jpg", id: "ghibli-seawave-4", name: "Sea Wave", tag: "Ghibli · Ponyo", shots: 4, bg: "#B2EBF2", ink: "#01579B", accent: "#26C6DA" },

  { file: "12.jpg", id: "ghibli-undersea", name: "Undersea", tag: "Ghibli · Ponyo", shots: 2, bg: "#E0F2F1", ink: "#004D40", accent: "#80CBC4" },
  { file: "34.jpg", id: "ghibli-undersea-3", name: "Undersea", tag: "Ghibli · Ponyo", shots: 3, bg: "#E0F2F1", ink: "#004D40", accent: "#80CBC4" },
  { file: "35.jpg", id: "ghibli-undersea-4", name: "Undersea", tag: "Ghibli · Ponyo", shots: 4, bg: "#E0F2F1", ink: "#004D40", accent: "#80CBC4" },

  // ——— Arrietty ———
  { file: "6.jpg", id: "ghibli-arrietty", name: "Arrietty", tag: "Ghibli · Arrietty", shots: 2, bg: "#F1F8E9", ink: "#33691E", accent: "#AED581" },
  { file: "19.jpg", id: "ghibli-arrietty-3", name: "Arrietty", tag: "Ghibli · Arrietty", shots: 3, bg: "#F1F8E9", ink: "#33691E", accent: "#AED581" },
  { file: "20.jpg", id: "ghibli-arrietty-4", name: "Arrietty", tag: "Ghibli · Arrietty", shots: 4, bg: "#F1F8E9", ink: "#33691E", accent: "#AED581" },

  { file: "11.jpg", id: "ghibli-borrowers", name: "Borrowers", tag: "Ghibli · Arrietty", shots: 2, bg: "#FFF8E1", ink: "#5D4037", accent: "#D7CCC8" },
  { file: "30.jpg", id: "ghibli-borrowers-3", name: "Borrowers", tag: "Ghibli · Arrietty", shots: 3, bg: "#FFF8E1", ink: "#5D4037", accent: "#D7CCC8" },
  { file: "31.jpg", id: "ghibli-borrowers-4", name: "Borrowers", tag: "Ghibli · Arrietty", shots: 4, bg: "#FFF8E1", ink: "#5D4037", accent: "#D7CCC8" },

  // ——— Kiki ———
  { file: "9.jpg", id: "ghibli-kiki", name: "Kiki", tag: "Ghibli · Kiki", shots: 2, bg: "#E8EAF6", ink: "#4527A0", accent: "#B39DDB" },
  { file: "26.jpg", id: "ghibli-kiki-3", name: "Kiki", tag: "Ghibli · Kiki", shots: 3, bg: "#E8EAF6", ink: "#4527A0", accent: "#B39DDB" },
  { file: "29.jpg", id: "ghibli-kiki-4", name: "Kiki", tag: "Ghibli · Kiki", shots: 4, bg: "#E8EAF6", ink: "#4527A0", accent: "#B39DDB" },

  { file: "8.jpg", id: "ghibli-jiji", name: "Jiji", tag: "Ghibli · Kiki", shots: 2, bg: "#311B92", ink: "#EDE7F6", accent: "#CE93D8" },
  { file: "28.jpg", id: "ghibli-jiji-3", name: "Jiji", tag: "Ghibli · Kiki", shots: 3, bg: "#311B92", ink: "#EDE7F6", accent: "#CE93D8" },
  { file: "27.jpg", id: "ghibli-jiji-4", name: "Jiji", tag: "Ghibli · Kiki", shots: 4, bg: "#311B92", ink: "#EDE7F6", accent: "#CE93D8" },

  { file: "10.jpg", id: "ghibli-delivery", name: "Delivery", tag: "Ghibli · Kiki", shots: 2, bg: "#FCE4EC", ink: "#6A1B9A", accent: "#F8BBD0" },
  { file: "46.jpg", id: "ghibli-delivery-3", name: "Delivery", tag: "Ghibli · Kiki", shots: 3, bg: "#FCE4EC", ink: "#6A1B9A", accent: "#F8BBD0" },
  { file: "45.jpg", id: "ghibli-delivery-4", name: "Delivery", tag: "Ghibli · Kiki", shots: 4, bg: "#FCE4EC", ink: "#6A1B9A", accent: "#F8BBD0" },
];

function isHolePixel(r, g, b, a) {
  if (a < 40) return true;
  const min = Math.min(r, g, b);
  const sat = Math.max(r, g, b) - min;
  // pure / near-white photo windows
  return min >= 242 && sat <= 14;
}

function isOuterBg(r, g, b) {
  // pale canvas around the strip card (common AI gen padding)
  const min = Math.min(r, g, b);
  const max = Math.max(r, g, b);
  const sat = max - min;
  if (min > 248 && sat < 8) return true;
  if (sat < 15 && min > 220 && min < 250) return true;
  // very pale blue/gray studio backdrop
  if (b > r + 8 && b > g + 4 && min > 200 && sat < 40) return true;
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
  if (!found || maxX - minX < width * 0.3) {
    return sharp(src).ensureAlpha().resize({ width: 720 }).png().toBuffer();
  }
  const pad = 6;
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

  // punch holes transparent
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

  // band-based slot detection (row coverage)
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
  const thr = width * 0.18;
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

  // filter bands that are too short or too tall
  let chosen = bands.filter(([a, b]) => {
    const h = (b - a + 1) / height;
    return h >= 0.06 && h <= 0.42;
  });

  if (chosen.length > wantShots) {
    chosen = [...chosen]
      .sort((a, b) => b[1] - b[0] - (a[1] - a[0]))
      .slice(0, wantShots)
      .sort((a, b) => a[0] - b[0]);
  }

  // if too few holes, invent evenly spaced slots as fallback
  if (chosen.length < wantShots) {
    const top = 0.08;
    const bottom = 0.18;
    const usable = 1 - top - bottom;
    const gap = 0.02;
    const h = (usable - gap * (wantShots - 1)) / wantShots;
    chosen = [];
    for (let i = 0; i < wantShots; i++) {
      const y0 = Math.round((top + i * (h + gap)) * height);
      const y1 = Math.round(y0 + h * height);
      chosen.push([y0, y1]);
      // punch geometric holes so photos show
      const x0 = Math.round(width * 0.08);
      const x1 = Math.round(width * 0.92);
      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          const o = (y * width + x) * channels;
          data[o] = 255;
          data[o + 1] = 255;
          data[o + 2] = 255;
          data[o + 3] = 0;
          mask[y * width + x] = 1;
        }
      }
    }
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
      minX = Math.round(width * 0.1);
      maxX = Math.round(width * 0.9);
    }
    // slight pad
    minX = Math.max(0, minX - 2);
    maxX = Math.min(width - 1, maxX + 2);
    return {
      x: +((minX / width) * 100).toFixed(2),
      y: +((y0 / height) * 100).toFixed(2),
      w: +(((maxX - minX + 1) / width) * 100).toFixed(2),
      h: +(((y1 - y0 + 1) / height) * 100).toFixed(2),
    };
  });

  const png = await sharp(data, { raw: { width, height, channels } })
    .png()
    .toBuffer();

  return { png, slots, width, height, bandCount: chosen.length };
}

// ensure dirs
for (const n of [2, 3, 4]) {
  fs.mkdirSync(path.join(OUT, String(n)), { recursive: true });
}

const existing = JSON.parse(fs.readFileSync(CATALOG, "utf8"));
// remove previous ghibli entries if re-running
const kept = existing.filter((f) => !String(f.id).startsWith("ghibli-"));
const added = [];

for (const item of FRAMES) {
  const src = path.join(SESSION, item.file);
  if (!fs.existsSync(src)) {
    console.log("MISSING", item.file, item.id);
    continue;
  }
  try {
    const { png, slots, width, height, bandCount } = await processFrame(
      src,
      item.shots,
    );
    if (slots.length !== item.shots) {
      console.log(
        "WARN slots",
        item.id,
        "got",
        slots.length,
        "want",
        item.shots,
        "bands",
        bandCount,
      );
    }
    const dir = path.join(OUT, String(item.shots));
    const base = item.id;
    const pngPath = path.join(dir, `${base}.png`);
    const thumbPath = path.join(dir, `${base}-thumb.jpg`);
    fs.writeFileSync(pngPath, png);
    await sharp(png)
      .resize({ width: 240 })
      .jpeg({ quality: 84 })
      .toFile(thumbPath);

    const entry = {
      id: item.id,
      name: item.name,
      tag: item.tag,
      shots: item.shots,
      overlay: `/frames/by-count/${item.shots}/${base}.png?${VER}`,
      thumb: `/frames/by-count/${item.shots}/${base}-thumb.jpg?${VER}`,
      slots,
      bg: item.bg,
      ink: item.ink,
      accent: item.accent,
      canvasW: width,
      canvasH: height,
    };
    added.push(entry);
    console.log(
      "OK",
      item.id,
      `slots=${slots.length}`,
      `${width}x${height}`,
    );
  } catch (e) {
    console.error("FAIL", item.id, e.message);
  }
}

// put Ghibli frames first in each group for visibility, or append
const merged = [...kept, ...added];
fs.writeFileSync(CATALOG, JSON.stringify(merged, null, 2));
console.log(
  `\nDone. Added ${added.length} Ghibli frames. Catalog total: ${merged.length}`,
);
console.log(
  "By shots:",
  [2, 3, 4].map((n) => ({
    n,
    ghibli: added.filter((f) => f.shots === n).length,
    total: merged.filter((f) => f.shots === n).length,
  })),
);
