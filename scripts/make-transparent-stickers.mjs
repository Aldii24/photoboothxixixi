import sharp from "sharp";
import fs from "fs";
import path from "path";

const IMG =
  "C:\\Users\\aldii\\.grok\\sessions\\C%3A%5Cprojects%5Cphotobox\\019f5c19-6b12-7fc0-ba68-da0d7b13d6d4\\images";
const OUT = path.resolve("public/stickers/png");

/** Map source files → output sticker names */
const MAP = [
  // new batch
  ["12.jpg", "pink-butterfly.png"],
  ["13.jpg", "bee.png"],
  ["14.jpg", "black-bow.png"],
  ["15.jpg", "pink-bow.png"],
  ["16.jpg", "clover.png"],
  ["17.jpg", "blue-butterfly.png"],
  ["18.jpg", "heart.png"],
  ["19.jpg", "star.png"],
  ["20.jpg", "bunny.png"],
  ["21.jpg", "sakura.png"],
  ["22.jpg", "clover-girl.png"],
  ["23.jpg", "yellow-rose.png"],
  ["24.jpg", "pearls.png"],
  ["25.jpg", "tulip.png"],
  ["26.jpg", "watermelon.png"],
  ["27.jpg", "lips.png"],
  ["28.jpg", "rainbow.png"],
  ["29.jpg", "love-bear.png"],
  // earlier singles if present
  ["6.jpg", "heart-gloss.png"],
  ["7.jpg", "bow-classic.png"],
  ["8.jpg", "sakura-alt.png"],
  ["9.jpg", "lips-alt.png"],
  ["10.jpg", "puppy.png"],
  ["11.jpg", "star-glitter.png"],
];

fs.mkdirSync(OUT, { recursive: true });

async function toTransparentPng(src, dest) {
  const { data, info } = await sharp(src)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  for (let i = 0; i < width * height; i++) {
    const o = i * channels;
    const r = data[o];
    const g = data[o + 1];
    const b = data[o + 2];
    // near-white → transparent; soft edge for anti-alias
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const brightness = (r + g + b) / 3;
    const isNearWhite = brightness > 235 && max - min < 40;
    const isSoftWhite = brightness > 220 && max - min < 50;
    if (isNearWhite) {
      data[o + 3] = 0;
    } else if (isSoftWhite) {
      data[o + 3] = Math.round(
        Math.max(0, Math.min(255, (245 - brightness) * 12)),
      );
    }
  }

  await sharp(data, { raw: { width, height, channels } })
    .png()
    .toFile(dest);
  console.log("✓", path.basename(dest));
}

let ok = 0;
for (const [file, name] of MAP) {
  const src = path.join(IMG, file);
  if (!fs.existsSync(src)) {
    console.log("skip missing", file);
    continue;
  }
  await toTransparentPng(src, path.join(OUT, name));
  ok++;
}
console.log(`Done: ${ok} stickers → ${OUT}`);
