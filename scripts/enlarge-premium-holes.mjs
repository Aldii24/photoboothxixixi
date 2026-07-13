/**
 * Enlarge photo holes on premium illustrated frames.
 * Keeps edge decorations, expands white windows to ~74–78% width.
 * Replaces tiny 40% windows that waste space (like xoxo-four).
 */
import sharp from "sharp";
import fs from "fs";
import path from "path";

const OUT = path.resolve("public/frames/by-count");
const CATALOG = path.resolve("public/frames/catalog.json");
const VER = "bigwin5";

const TARGET_W = 76; // % width of photo hole
const MIN_SIDE = 10; // % side margin min for décor
const TARGET_GAP = 1.8; // % gap between photos
const PAD_TOP = 7.5; // %
const PAD_BOT = 11; // % for logo/footer

function hexToRgb(hex) {
  const h = (hex || "#FF5C9A").replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16) || 255,
    g: parseInt(h.slice(2, 4), 16) || 92,
    b: parseInt(h.slice(4, 6), 16) || 154,
  };
}

async function detectHoles(pngPath) {
  const { data, info } = await sharp(pngPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const mask = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const o = i * channels;
    const a = data[o + 3];
    const r = data[o],
      g = data[o + 1],
      b = data[o + 2];
    const sat = Math.max(r, g, b) - Math.min(r, g, b);
    mask[i] =
      a < 50 || (r >= 245 && g >= 245 && b >= 245 && sat <= 12) ? 1 : 0;
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
      if (b.count < area * 0.008) continue;
      if (b.count > area * 0.42) continue;
      if (bw < width * 0.2) continue;
      if (bh < height * 0.05) continue;
      if (bh > height * 0.55) continue;
      boxes.push(b);
    }
  }
  boxes.sort((a, b) => a.minY - b.minY);
  return { width, height, channels, data, boxes };
}

function layoutEnlarged(shots, width, height) {
  const holeW = Math.round((TARGET_W / 100) * width);
  const padX = Math.round((width - holeW) / 2);
  const padTop = Math.round((PAD_TOP / 100) * height);
  const padBot = Math.round((PAD_BOT / 100) * height);
  const gap = Math.round((TARGET_GAP / 100) * height);
  const holeH = Math.floor(
    (height - padTop - padBot - gap * (shots - 1)) / shots,
  );
  const slots = [];
  for (let i = 0; i < shots; i++) {
    const y = padTop + i * (holeH + gap);
    slots.push({
      x: padX,
      y,
      w: holeW,
      h: holeH,
      // percent
      xp: +((padX / width) * 100).toFixed(2),
      yp: +((y / height) * 100).toFixed(2),
      wp: +((holeW / width) * 100).toFixed(2),
      hp: +((holeH / height) * 100).toFixed(2),
    });
  }
  return slots;
}

function inRoundRect(px, py, rx, ry, rw, rh, rad) {
  if (px < rx || py < ry || px >= rx + rw || py >= ry + rh) return false;
  const lx = px - rx;
  const ly = py - ry;
  if (lx >= rad && lx < rw - rad) return true;
  if (ly >= rad && ly < rh - rad) return true;
  // corners
  const cx = lx < rad ? rad : lx >= rw - rad ? rw - rad - 1 : lx;
  const cy = ly < rad ? rad : ly >= rh - rad ? rh - rad - 1 : ly;
  // proper corner test
  let dx = 0,
    dy = 0;
  if (lx < rad) dx = rad - lx;
  else if (lx >= rw - rad) dx = lx - (rw - rad - 1);
  if (ly < rad) dy = rad - ly;
  else if (ly >= rh - rad) dy = ly - (rh - rad - 1);
  if (dx === 0 || dy === 0) return true;
  return dx * dx + dy * dy <= rad * rad;
}

async function enlargeFrame(entry) {
  const rel = entry.overlay.split("?")[0].replace(/^\//, "");
  const srcPath = path.resolve("public", rel.replace(/^frames/, "frames"));
  // path is frames/by-count/...
  const full = path.resolve("public", entry.overlay.split("?")[0].replace(/^\//, ""));
  if (!fs.existsSync(full)) {
    console.log("missing", full);
    return null;
  }

  const shots = entry.shots;
  const { width, height, channels, data } = await detectHoles(full);
  const slotsPx = layoutEnlarged(shots, width, height);
  const border = hexToRgb(entry.accent || entry.ink);
  const r = Math.max(12, Math.round(width * 0.028));
  const borderW = Math.max(6, Math.round(width * 0.012));

  // Clone pixel buffer
  const out = Buffer.from(data);

  // First: fill ALL old transparent/near-white hole areas with a soft fill
  // sampled from nearby frame bg so we don't leave ghost tiny windows
  // Sample median-ish bg color from corner
  const sample = (x, y) => {
    const o = (Math.min(height - 1, Math.max(0, y)) * width +
      Math.min(width - 1, Math.max(0, x))) *
      channels;
    return [out[o], out[o + 1], out[o + 2]];
  };
  const bgC = sample(8, 8);

  for (let i = 0; i < width * height; i++) {
    const o = i * channels;
    const a = out[o + 3];
    const r0 = out[o],
      g0 = out[o + 1],
      b0 = out[o + 2];
    const sat = Math.max(r0, g0, b0) - Math.min(r0, g0, b0);
    if (a < 50 || (r0 >= 248 && g0 >= 248 && b0 >= 248 && sat <= 10)) {
      // fill old hole with bg so only new large holes remain
      out[o] = bgC[0];
      out[o + 1] = bgC[1];
      out[o + 2] = bgC[2];
      out[o + 3] = 255;
    } else {
      out[o + 3] = 255;
    }
  }

  // Punch LARGE new holes + border rings
  for (const s of slotsPx) {
    const x0 = s.x;
    const y0 = s.y;
    const hw = s.w;
    const hh = s.h;
    for (let y = y0 - borderW - 2; y < y0 + hh + borderW + 2; y++) {
      for (let x = x0 - borderW - 2; x < x0 + hw + borderW + 2; x++) {
        if (x < 0 || y < 0 || x >= width || y >= height) continue;
        const o = (y * width + x) * channels;
        const inside = inRoundRect(x, y, x0, y0, hw, hh, r);
        const inOuter = inRoundRect(
          x,
          y,
          x0 - borderW,
          y0 - borderW,
          hw + borderW * 2,
          hh + borderW * 2,
          r + 4,
        );
        if (inside) {
          out[o] = 255;
          out[o + 1] = 255;
          out[o + 2] = 255;
          out[o + 3] = 0;
        } else if (inOuter) {
          out[o] = border.r;
          out[o + 1] = border.g;
          out[o + 2] = border.b;
          out[o + 3] = 255;
        }
      }
    }
  }

  // Soft white inner rim
  for (const s of slotsPx) {
    for (let y = s.y - 1; y < s.y + s.h + 1; y++) {
      for (let x = s.x - 1; x < s.x + s.w + 1; x++) {
        if (x < 0 || y < 0 || x >= width || y >= height) continue;
        const inside = inRoundRect(x, y, s.x, s.y, s.w, s.h, r);
        const near =
          !inside &&
          inRoundRect(x, y, s.x - 2, s.y - 2, s.w + 4, s.h + 4, r + 2);
        if (near) {
          const o = (y * width + x) * channels;
          out[o] = 255;
          out[o + 1] = 255;
          out[o + 2] = 255;
          out[o + 3] = 220;
        }
      }
    }
  }

  await sharp(out, { raw: { width, height, channels } })
    .png()
    .toFile(full);

  await sharp(full)
    .resize({ width: 260 })
    .jpeg({ quality: 88 })
    .toFile(full.replace(/\.png$/, "-thumb.jpg"));

  const slots = slotsPx.map((s) => ({
    x: s.xp,
    y: s.yp,
    w: s.wp,
    h: s.hp,
  }));

  return {
    ...entry,
    slots,
    canvasW: width,
    canvasH: height,
    overlay: entry.overlay.split("?")[0] + `?${VER}`,
    thumb: entry.thumb.split("?")[0] + `?${VER}`,
  };
}

const catalog = JSON.parse(fs.readFileSync(CATALOG, "utf8"));
const next = [];

for (const entry of catalog) {
  // Only enlarge if holes are "small" (< 62% width) — always enlarge for consistency
  const avgW =
    entry.slots.reduce((s, h) => s + h.w, 0) / entry.slots.length;
  try {
    const updated = await enlargeFrame(entry);
    if (!updated) {
      next.push(entry);
      continue;
    }
    console.log(
      "✓",
      entry.id,
      `wasW=${avgW.toFixed(1)}% → nowW=${updated.slots[0].w}%`,
    );
    next.push(updated);
  } catch (e) {
    console.error("fail", entry.id, e.message);
    next.push(entry);
  }
}

fs.writeFileSync(CATALOG, JSON.stringify(next, null, 2));
console.log("\nDONE", next.length, "frames enlarged to ~", TARGET_W, "% width");
console.log(
  "sample",
  next.find((c) => c.id.includes("xoxo"))?.slots?.[0],
);
