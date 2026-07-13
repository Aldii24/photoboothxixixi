/**
 * HD (1080px) + clean photostrips — uses proven crop, cleaner holes.
 */
import sharp from "sharp";
import fs from "fs";
import path from "path";

const SESSION =
  "C:\\Users\\aldii\\.grok\\sessions\\C%3A%5Cprojects%5Cphotobox\\019f5c19-6b12-7fc0-ba68-da0d7b13d6d4\\images";
const OUT = path.resolve("public/frames/by-count");
const CATALOG = path.resolve("public/frames/catalog.json");
const VER = "hd17";
const HD_W = 1080;

const ALL = [
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
  { file: "154.jpg", id: "strip-berry", name: "Berry", tag: "Strip · Berry", shots: 3, bg: "#FFD6E8", ink: "#C62828", accent: "#EF5350" },
  { file: "158.jpg", id: "strip-sky", name: "Sky", tag: "Strip · Cool", shots: 3, bg: "#E3F2FD", ink: "#1565C0", accent: "#64B5F6" },
  { file: "159.jpg", id: "strip-honey", name: "Honey", tag: "Strip · Warm", shots: 3, bg: "#FFF8E1", ink: "#F57F17", accent: "#FFD54F" },
  { file: "165.jpg", id: "strip-chill", name: "Chill", tag: "Strip · Cool", shots: 3, bg: "#E0F7FA", ink: "#00838F", accent: "#4DD0E1" },
  { file: "163.jpg", id: "strip-cherry", name: "Cherry", tag: "Strip · Heart", shots: 3, bg: "#FFEBEE", ink: "#C62828", accent: "#EF9A9A" },
  { file: "155.jpg", id: "strip-matcha", name: "Matcha", tag: "Strip · Calm", shots: 4, bg: "#F1F8E9", ink: "#33691E", accent: "#AED581" },
  { file: "157.jpg", id: "strip-starry", name: "Starry", tag: "Strip · Dreamy", shots: 4, bg: "#EDE7F6", ink: "#4527A0", accent: "#B39DDB" },
  { file: "162.jpg", id: "strip-candy", name: "Candy", tag: "Strip · Pop", shots: 4, bg: "#FCE4EC", ink: "#AD1457", accent: "#F48FB1" },
  { file: "164.jpg", id: "strip-bow", name: "Bow", tag: "Strip · Coquette", shots: 2, bg: "#FFF0F5", ink: "#C2185B", accent: "#FF80AB" },
  { file: "160.jpg", id: "strip-fresh", name: "Fresh", tag: "Strip · Mint", shots: 2, bg: "#E8F5E9", ink: "#2E7D32", accent: "#81C784" },
  { file: "161.jpg", id: "strip-daisy", name: "Daisy", tag: "Strip · Floral", shots: 2, bg: "#FFFDE7", ink: "#F9A825", accent: "#FFE082" },
];

function isPaleBg(r, g, b) {
  const min = Math.min(r, g, b);
  const max = Math.max(r, g, b);
  const sat = max - min;
  if (b > r + 12 && min > 180 && sat < 50) return true;
  if (sat < 10 && min > 218) return true;
  return false;
}

async function loadStripHD(src) {
  // 1) trim solid borders
  let buf;
  try {
    buf = await sharp(src)
      .trim({ threshold: 16 })
      .ensureAlpha()
      .png()
      .toBuffer();
  } catch {
    buf = await sharp(src).ensureAlpha().png().toBuffer();
  }

  let meta = await sharp(buf).metadata();

  // 2) if too square/wide → densest vertical column band from ORIGINAL
  if (meta.width / meta.height > 0.68) {
    const full = await sharp(src)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const w = full.info.width,
      h = full.info.height,
      ch = full.info.channels;
    const col = new Array(w).fill(0);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const o = (y * w + x) * ch;
        if (!isPaleBg(full.data[o], full.data[o + 1], full.data[o + 2]))
          col[x]++;
      }
    }
    let best = 0,
      bestX = 0,
      bestW = Math.round(w * 0.36);
    for (const frac of [0.3, 0.34, 0.38, 0.42]) {
      const bandW = Math.round(w * frac);
      for (let x = 0; x <= w - bandW; x += 3) {
        let s = 0;
        for (let i = 0; i < bandW; i++) s += col[x + i];
        if (s > best) {
          best = s;
          bestX = x;
          bestW = bandW;
        }
      }
    }
    buf = await sharp(src)
      .extract({ left: bestX, top: 0, width: bestW, height: h })
      .ensureAlpha()
      .png()
      .toBuffer();
    meta = await sharp(buf).metadata();
  }

  // 3) upscale to HD
  return sharp(buf)
    .resize({
      width: HD_W,
      kernel: sharp.kernel.lanczos3,
      withoutEnlargement: false,
    })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
}

function processHoles(data, width, height, channels, want) {
  const isW = (r, g, b) => {
    const min = Math.min(r, g, b);
    const sat = Math.max(r, g, b) - min;
    return min >= 246 && sat <= 10;
  };
  const isNW = (r, g, b) => {
    const min = Math.min(r, g, b);
    const sat = Math.max(r, g, b) - min;
    return min >= 236 && sat <= 16;
  };

  const mask = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const o = i * channels;
    if (isW(data[o], data[o + 1], data[o + 2])) mask[i] = 1;
  }
  // expand near-white into holes (remove smudges)
  const q = [];
  for (let i = 0; i < mask.length; i++) if (mask[i]) q.push(i);
  while (q.length) {
    const i = q.pop();
    const x = i % width,
      y = (i / width) | 0;
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
      if (mask[ni]) continue;
      const o = ni * channels;
      if (isNW(data[o], data[o + 1], data[o + 2])) {
        mask[ni] = 1;
        q.push(ni);
      }
    }
  }

  // components
  const vis = new Uint8Array(width * height);
  const comps = [];
  const area = width * height;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      if (!mask[i] || vis[i]) continue;
      const st = [[x, y]];
      vis[i] = 1;
      const pix = [];
      let minX = x,
        maxX = x,
        minY = y,
        maxY = y;
      while (st.length) {
        const [cx, cy] = st.pop();
        pix.push(cy * width + cx);
        minX = Math.min(minX, cx);
        maxX = Math.max(maxX, cx);
        minY = Math.min(minY, cy);
        maxY = Math.max(maxY, cy);
        for (const [dx, dy] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) {
          const nx = cx + dx,
            ny = cy + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          const ni = ny * width + nx;
          if (vis[ni] || !mask[ni]) continue;
          vis[ni] = 1;
          st.push([nx, ny]);
        }
      }
      if (pix.length >= area * 0.012) {
        comps.push({ pix, minX, maxX, minY, maxY, count: pix.length });
      }
    }
  }
  comps.sort((a, b) => b.count - a.count);
  const keep = comps.slice(0, want).sort((a, b) => a.minY - b.minY);
  const final = new Uint8Array(width * height);
  for (const c of keep) for (const p of c.pix) final[p] = 1;

  // clean interior smudges in bbox
  for (const c of keep) {
    for (let y = c.minY; y <= c.maxY; y++) {
      for (let x = c.minX; x <= c.maxX; x++) {
        const i = y * width + x;
        if (final[i]) continue;
        const o = i * channels;
        if (!isNW(data[o], data[o + 1], data[o + 2])) continue;
        let n = 0;
        for (const [dx, dy] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) {
          const nx = x + dx,
            ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          if (final[ny * width + nx]) n++;
        }
        if (n >= 2) final[i] = 1;
      }
    }
  }

  // apply clean alpha + pure white holes
  for (let i = 0; i < width * height; i++) {
    const o = i * channels;
    if (final[i]) {
      data[o] = 255;
      data[o + 1] = 255;
      data[o + 2] = 255;
      data[o + 3] = 0;
    } else {
      data[o + 3] = 255;
    }
  }

  // slots with tiny inset
  return keep.map((c) => {
    const ix = Math.max(2, Math.round((c.maxX - c.minX) * 0.015));
    const iy = Math.max(2, Math.round((c.maxY - c.minY) * 0.015));
    const x0 = c.minX + ix,
      y0 = c.minY + iy;
    const x1 = c.maxX - ix,
      y1 = c.maxY - iy;
    return {
      x: +((x0 / width) * 100).toFixed(2),
      y: +((y0 / height) * 100).toFixed(2),
      w: +(((x1 - x0 + 1) / width) * 100).toFixed(2),
      h: +(((y1 - y0 + 1) / height) * 100).toFixed(2),
    };
  });
}

for (const n of [2, 3, 4]) {
  fs.rmSync(path.join(OUT, String(n)), { recursive: true, force: true });
  fs.mkdirSync(path.join(OUT, String(n)), { recursive: true });
}

const catalog = [];

for (const item of ALL) {
  const src = path.join(SESSION, item.file);
  if (!fs.existsSync(src)) {
    console.log("missing", item.file);
    continue;
  }
  try {
    const { data, info } = await loadStripHD(src);
    const { width, height, channels } = info;

    if (height < width * 1.1) {
      console.log("skip short", item.id, width + "x" + height);
      continue;
    }

    const slots = processHoles(data, width, height, channels, item.shots);
    if (slots.length < 2) {
      console.log("skip holes", item.id, slots.length);
      continue;
    }

    const finalShots =
      slots.length >= item.shots ? item.shots : slots.length;
    const use = slots.slice(0, finalShots);
    const avgW = use.reduce((a, s) => a + s.w, 0) / use.length;

    const png = await sharp(data, { raw: { width, height, channels } })
      .sharpen({ sigma: 0.5, m1: 0.35, m2: 0.2 })
      .png({ compressionLevel: 6, quality: 100 })
      .toBuffer();

    const dest = path.join(OUT, String(finalShots), `${item.id}.png`);
    fs.writeFileSync(dest, png);
    await sharp(png)
      .resize({ width: 360 })
      .jpeg({ quality: 92 })
      .toFile(dest.replace(/\.png$/, "-thumb.jpg"));

    catalog.push({
      id: item.id,
      name: item.name,
      tag: item.tag,
      shots: finalShots,
      overlay: `/frames/by-count/${finalShots}/${item.id}.png?${VER}`,
      thumb: `/frames/by-count/${finalShots}/${item.id}-thumb.jpg?${VER}`,
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
      `${finalShots}s`,
      `${width}x${height}`,
      `w=${avgW.toFixed(1)}%`,
      `${(png.length / 1024).toFixed(0)}KB`,
    );
  } catch (e) {
    console.error("fail", item.id, e.message);
  }
}

catalog.sort((a, b) => a.shots - b.shots || a.name.localeCompare(b.name));
fs.writeFileSync(CATALOG, JSON.stringify(catalog, null, 2));
console.log(
  "\nDONE",
  catalog.length,
  [2, 3, 4]
    .map((n) => `${n}=${catalog.filter((c) => c.shots === n).length}`)
    .join(" "),
  "| HD",
  HD_W + "px",
);
