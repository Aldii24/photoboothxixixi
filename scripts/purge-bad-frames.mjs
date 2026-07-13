/**
 * Drop defective frames: art drawn inside photo holes, tiny windows, bad slots.
 */
import sharp from "sharp";
import fs from "fs";
import path from "path";

const OUT = path.resolve("public/frames/by-count");
const CATALOG = path.resolve("public/frames/catalog.json");

async function hasArtInsideHoles(frame) {
  const rel = frame.overlay.split("?")[0].replace(/^\//, "");
  const pngPath = path.join("public", rel);
  if (!fs.existsSync(pngPath)) return { bad: true, reason: "missing" };

  const { data, info } = await sharp(pngPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  let dirty = 0;
  let samples = 0;

  for (const slot of frame.slots) {
    const x0 = Math.floor(((slot.x + slot.w * 0.28) / 100) * width);
    const y0 = Math.floor(((slot.y + slot.h * 0.28) / 100) * height);
    const x1 = Math.floor(((slot.x + slot.w * 0.72) / 100) * width);
    const y1 = Math.floor(((slot.y + slot.h * 0.72) / 100) * height);
    for (let y = y0; y < y1; y += 2) {
      for (let x = x0; x < x1; x += 2) {
        if (x < 0 || y < 0 || x >= width || y >= height) continue;
        const o = (y * width + x) * channels;
        samples++;
        const a = data[o + 3];
        if (a > 90) {
          const min = Math.min(data[o], data[o + 1], data[o + 2]);
          if (min < 235) dirty++;
        }
      }
    }
  }
  const ratio = samples ? dirty / samples : 0;
  return { bad: ratio > 0.035, ratio, dirty, samples };
}

const cat = JSON.parse(fs.readFileSync(CATALOG, "utf8"));
const keep = [];
const drop = [];

for (const f of cat) {
  const avgW = f.slots.reduce((a, s) => a + s.w, 0) / f.slots.length;
  if (avgW < 44) {
    drop.push({ id: f.id, reason: `smallW ${avgW.toFixed(1)}` });
    continue;
  }
  if (f.shots >= 3 && f.slots.some((s) => s.h > 38)) {
    drop.push({ id: f.id, reason: "slotH too tall" });
    continue;
  }
  if (f.slots.length !== f.shots) {
    drop.push({ id: f.id, reason: `slot count ${f.slots.length}!=${f.shots}` });
    continue;
  }
  const art = await hasArtInsideHoles(f);
  if (art.bad) {
    drop.push({
      id: f.id,
      reason: `art-in-hole ${(art.ratio * 100).toFixed(1)}%`,
    });
    continue;
  }
  keep.push(f);
}

console.log("DROP", drop.length);
for (const d of drop) {
  console.log(" -", d.id, d.reason);
  for (const n of [2, 3, 4]) {
    for (const name of [`${d.id}.png`, `${d.id}-thumb.jpg`]) {
      const p = path.join(OUT, String(n), name);
      try {
        fs.unlinkSync(p);
        console.log("   rm", p);
      } catch {
        /* ok */
      }
    }
  }
}

keep.sort((a, b) => a.shots - b.shots || a.name.localeCompare(b.name));
fs.writeFileSync(CATALOG, JSON.stringify(keep, null, 2));
console.log("\nKEEP", keep.length);
console.log(
  [2, 3, 4]
    .map((n) => `${n}=${keep.filter((c) => c.shots === n).length}`)
    .join(" "),
);
console.log(keep.map((c) => `${c.shots}s ${c.name}`).join(" · "));
