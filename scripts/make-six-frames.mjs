/**
 * Programmatic 6-photo kawaii strip frames — exact 6 white holes.
 */
import sharp from "sharp";
import fs from "fs";
import path from "path";

const OUT = path.resolve("public/frames/by-count/6");
fs.mkdirSync(OUT, { recursive: true });

const W = 720;
const H = 1600; // taller for 6 shots
const PAD_X = 70;
const PAD_TOP = 90;
const PAD_BOT = 140;
const GAP = 16;
const HOLE_W = W - PAD_X * 2;
const HOLE_H = Math.floor((H - PAD_TOP - PAD_BOT - GAP * 5) / 6);
const RADIUS = 28;

const DESIGNS = [
  {
    id: "six-pink",
    name: "Six Pink",
    tag: "Cute Pink",
    bg: "#FFE4F0",
    border: "#FF6BA8",
    accent: "#FF8FB5",
    ink: "#B83D6E",
  },
  {
    id: "six-mint",
    name: "Six Mint",
    tag: "Fresh",
    bg: "#D4F5E4",
    border: "#3ECF8E",
    accent: "#6BCB77",
    ink: "#1a4a3a",
  },
  {
    id: "six-sky",
    name: "Six Sky",
    tag: "Y2K",
    bg: "#D6EEFF",
    border: "#5B9DFF",
    accent: "#6BB0FF",
    ink: "#1E5A8A",
  },
  {
    id: "six-cream",
    name: "Six Cream",
    tag: "Soft",
    bg: "#FFF6E0",
    border: "#FFB86B",
    accent: "#FFC83D",
    ink: "#5c3a2a",
  },
  {
    id: "six-lavender",
    name: "Six Lavender",
    tag: "Dreamy",
    bg: "#F0E8FF",
    border: "#B794F6",
    accent: "#C9B6FF",
    ink: "#4a3566",
  },
  {
    id: "six-night",
    name: "Six Night",
    tag: "Dark",
    bg: "#1A1A2E",
    border: "#C9B6FF",
    accent: "#E0C8FF",
    ink: "#FFE0F0",
  },
];

function svgFrame(d) {
  const holes = [];
  for (let i = 0; i < 6; i++) {
    const y = PAD_TOP + i * (HOLE_H + GAP);
    holes.push(
      `<rect x="${PAD_X}" y="${y}" width="${HOLE_W}" height="${HOLE_H}" rx="${RADIUS}" ry="${RADIUS}" fill="#FFFFFF"/>`,
    );
    // decorative border ring (stroke outside hole via larger rect with hole? use stroke on white)
    holes.push(
      `<rect x="${PAD_X}" y="${y}" width="${HOLE_W}" height="${HOLE_H}" rx="${RADIUS}" ry="${RADIUS}" fill="none" stroke="${d.border}" stroke-width="10"/>`,
    );
  }

  // gingham-ish pattern for light bgs via small rects optional — solid + dots
  const dots = [];
  if (d.bg !== "#1A1A2E") {
    for (let y = 20; y < H; y += 28) {
      for (let x = 20; x < W; x += 28) {
        dots.push(
          `<circle cx="${x}" cy="${y}" r="2.2" fill="${d.accent}" opacity="0.25"/>`,
        );
      }
    }
  } else {
    for (let y = 30; y < H; y += 40) {
      for (let x = 30; x < W; x += 40) {
        dots.push(
          `<circle cx="${x}" cy="${y}" r="1.5" fill="${d.accent}" opacity="0.5"/>`,
        );
      }
    }
  }

  // side stickers as emoji-like circles / hearts simple shapes
  const stickers = [
    `<text x="36" y="80" font-size="36">✨</text>`,
    `<text x="${W - 56}" y="120" font-size="32">💕</text>`,
    `<text x="32" y="${H / 2}" font-size="34">🎀</text>`,
    `<text x="${W - 52}" y="${H / 2 + 40}" font-size="34">⭐</text>`,
    `<text x="36" y="${H - 180}" font-size="32">🌸</text>`,
    `<text x="${W - 56}" y="${H - 160}" font-size="32">🍀</text>`,
  ].join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" rx="48" fill="${d.bg}"/>
  ${dots.join("\n")}
  <rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="40" fill="none" stroke="${d.border}" stroke-width="6" opacity="0.45"/>
  ${holes.join("\n")}
  ${stickers}
  <text x="${W / 2}" y="${H - 70}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="42" font-weight="700" fill="${d.ink}">${d.name}</text>
  <text x="${W / 2}" y="${H - 36}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="18" fill="${d.ink}" opacity="0.7">PhotoBox ★</text>
</svg>`;
}

const catalogExtra = [];

for (const d of DESIGNS) {
  const svg = svgFrame(d);
  const svgPath = path.join(OUT, `${d.id}.svg`);
  fs.writeFileSync(svgPath, svg);

  // Rasterize SVG → PNG, then punch pure white holes to alpha
  const rawPng = path.join(OUT, `${d.id}-raw.png`);
  await sharp(Buffer.from(svg)).png().toFile(rawPng);

  const { data, info } = await sharp(rawPng)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  for (let i = 0; i < width * height; i++) {
    const o = i * channels;
    const r = data[o],
      g = data[o + 1],
      b = data[o + 2];
    if (r >= 250 && g >= 250 && b >= 250) data[o + 3] = 0;
  }
  const dest = path.join(OUT, `${d.id}.png`);
  await sharp(data, { raw: { width, height, channels } }).png().toFile(dest);
  await sharp(rawPng)
    .resize({ width: 240 })
    .jpeg({ quality: 82 })
    .toFile(path.join(OUT, `${d.id}-thumb.jpg`));
  fs.unlinkSync(rawPng);
  try {
    fs.unlinkSync(svgPath);
  } catch {
    /* ignore */
  }

  // slots exact from geometry
  const slots = [];
  for (let i = 0; i < 6; i++) {
    const y = PAD_TOP + i * (HOLE_H + GAP);
    slots.push({
      x: +((PAD_X / W) * 100).toFixed(2),
      y: +((y / H) * 100).toFixed(2),
      w: +((HOLE_W / W) * 100).toFixed(2),
      h: +((HOLE_H / H) * 100).toFixed(2),
    });
  }

  catalogExtra.push({
    id: d.id,
    name: d.name,
    tag: d.tag,
    shots: 6,
    overlay: `/frames/by-count/6/${d.id}.png`,
    thumb: `/frames/by-count/6/${d.id}-thumb.jpg`,
    slots,
    bg: d.bg,
    ink: d.ink,
    accent: d.accent,
  });
  console.log("✓", d.id);
}

// merge into catalog.json
const catPath = path.resolve("public/frames/catalog.json");
const existing = JSON.parse(fs.readFileSync(catPath, "utf8"));
const merged = [
  ...existing.filter((c) => c.shots !== 6 || !c.id.startsWith("six-")),
  ...catalogExtra,
];
// keep other six if any valid
for (const c of existing) {
  if (c.shots === 6 && !catalogExtra.find((x) => x.id === c.id)) {
    // drop broken ones
  }
}
merged.sort((a, b) => a.shots - b.shots || a.name.localeCompare(b.name));
fs.writeFileSync(catPath, JSON.stringify(merged, null, 2));
console.log(
  "catalog",
  merged.length,
  "six=",
  merged.filter((c) => c.shots === 6).length,
);
