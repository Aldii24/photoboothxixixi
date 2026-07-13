import sharp from "sharp";
import fs from "fs";
import path from "path";

const IMG =
  "C:\\Users\\aldii\\.grok\\sessions\\C%3A%5Cprojects%5Cphotobox\\019f5c19-6b12-7fc0-ba68-da0d7b13d6d4\\images";
const OUT = path.resolve("public/frames/windows");
fs.mkdirSync(OUT, { recursive: true });

const MAP = [
  ["51.jpg", "heart-pink.png"],
  ["50.jpg", "rounded-pink.png"],
  ["52.jpg", "oval-pearl.png"],
];

/**
 * Magenta bg → transparent
 * Near-white center (photo hole) → transparent
 * Keep colored frame border
 */
async function process(src, dest) {
  const { data, info } = await sharp(src)
    .ensureAlpha()
    .resize({ width: 900, withoutEnlargement: true })
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

    // magenta / hot pink bg key
    const isMagenta =
      r > 180 && b > 180 && g < 120 && r - g > 40 && b - g > 40;
    const isNearMagenta =
      r > 200 && b > 150 && g < 160 && r > g + 30;

    // pure white hole
    const isWhiteHole = brightness >= 245 && sat <= 18;
    const isSoftWhite = brightness >= 235 && sat <= 22;

    if (isMagenta || isNearMagenta) {
      data[o + 3] = 0;
    } else if (isWhiteHole) {
      data[o + 3] = 0;
    } else if (isSoftWhite) {
      data[o + 3] = Math.round(Math.max(0, (248 - brightness) * 20));
    }
  }

  await sharp(data, { raw: { width, height, channels } })
    .png()
    .toFile(dest);
  console.log("✓", path.basename(dest));
}

for (const [file, name] of MAP) {
  const src = path.join(IMG, file);
  if (!fs.existsSync(src)) {
    console.log("skip", file);
    continue;
  }
  await process(src, path.join(OUT, name));
}
console.log("done");
