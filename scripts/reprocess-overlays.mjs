/**
 * Re-process frame overlays: ONLY pure white → transparent.
 * Keeps gingham/checker colors intact (previous process ate light blues/yellows).
 */
import sharp from "sharp";
import fs from "fs";
import path from "path";

const IMG =
  "C:\\Users\\aldii\\.grok\\sessions\\C%3A%5Cprojects%5Cphotobox\\019f5c19-6b12-7fc0-ba68-da0d7b13d6d4\\images";
const OUT = path.resolve("public/frames/overlays");

const MAP = [
  ["40.jpg", "lucky-charm.png"],
  ["42.jpg", "garden-bloom.png"],
  ["41.jpg", "berry-cafe.png"],
  ["43.jpg", "bliss-pop.png"],
  ["44.jpg", "mirror-mood.png"],
  ["47.jpg", "kyowo-cat.png"],
  ["48.jpg", "lucky-garden.png"],
  ["45.jpg", "coquette-xoxo.png"],
  ["49.jpg", "happy-day.png"],
  ["46.jpg", "night-meow.png"],
];

fs.mkdirSync(OUT, { recursive: true });

async function processFrame(src, dest) {
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
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max - min;
    const brightness = (r + g + b) / 3;

    // STRICT pure white only (photo holes) — do NOT touch pastels
    if (brightness >= 252 && sat <= 6) {
      data[o + 3] = 0;
    } else if (brightness >= 248 && sat <= 5) {
      data[o + 3] = Math.round(Math.max(0, (255 - brightness) * 40));
    }
    // everything else fully opaque
    else {
      data[o + 3] = 255;
    }
  }

  await sharp(data, { raw: { width, height, channels } })
    .png()
    .toFile(dest);

  // thumb
  await sharp(src)
    .resize({ width: 280 })
    .jpeg({ quality: 85 })
    .toFile(dest.replace(".png", "-thumb.jpg"));

  console.log("✓", path.basename(dest));
}

for (const [file, name] of MAP) {
  const src = path.join(IMG, file);
  if (!fs.existsSync(src)) {
    console.log("MISSING", file);
    continue;
  }
  await processFrame(src, path.join(OUT, name));
}
console.log("done");
