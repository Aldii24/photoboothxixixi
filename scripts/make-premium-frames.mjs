/**
 * Premium kawaii frames with LARGE photo holes for 2, 3, 4 shots only.
 * Guaranteed exact hole counts + transparent pure-white windows.
 */
import sharp from "sharp";
import fs from "fs";
import path from "path";

const ROOT = path.resolve("public/frames/by-count");

const THEMES = [
  { id: "pink", name: "Pink Pop", tag: "Cute", bg: "#FFE4F0", border: "#FF5C9A", ink: "#B83D6E", accent: "#FF8FB5", emoji: ["✨", "💕", "🎀", "🌸"] },
  { id: "mint", name: "Mint Fresh", tag: "Fresh", bg: "#D4F5E4", border: "#2FA86A", ink: "#1a4a3a", accent: "#6BCB77", emoji: ["🍀", "🐝", "🌿", "✨"] },
  { id: "sky", name: "Sky Pop", tag: "Y2K", bg: "#D6EEFF", border: "#4A8FE8", ink: "#1E5A8A", accent: "#6BB0FF", emoji: ["⭐", "💫", "☁️", "💙"] },
  { id: "cream", name: "Honey Cream", tag: "Warm", bg: "#FFF3D6", border: "#F0A04B", ink: "#5c3a2a", accent: "#FFC83D", emoji: ["🍯", "⭐", "🌼", "✨"] },
  { id: "lavender", name: "Lavender Dream", tag: "Soft", bg: "#F0E8FF", border: "#A78BFA", ink: "#4a3566", accent: "#C9B6FF", emoji: ["💜", "✨", "🦋", "🌙"] },
  { id: "peach", name: "Peach Kiss", tag: "Sweet", bg: "#FFE8D6", border: "#FF8A5B", ink: "#8B3A2A", accent: "#FFB086", emoji: ["🍑", "💕", "✨", "🎀"] },
  { id: "berry", name: "Strawberry Snap", tag: "Strawberry", bg: "#FFD6E8", border: "#E83D7A", ink: "#B83D6E", accent: "#FF6B9D", emoji: ["🍓", "💕", "🎀", "✨"] },
  { id: "night", name: "Night Sparkle", tag: "Dark", bg: "#1A1A2E", border: "#C9B6FF", ink: "#FFE0F0", accent: "#E0C8FF", emoji: ["✨", "🌙", "⭐", "💜"] },
  { id: "matcha", name: "Matcha Mood", tag: "Calm", bg: "#E8F5D8", border: "#6B9E3E", ink: "#2d4a1a", accent: "#8FBF5A", emoji: ["🍵", "🌿", "✨", "🍀"] },
  { id: "coquette", name: "Coquette Bow", tag: "Bow", bg: "#FFF0F5", border: "#FF6BA8", ink: "#8B2A50", accent: "#FF8FB5", emoji: ["🎀", "🖤", "💕", "✨"] },
  { id: "citrus", name: "Citrus Zest", tag: "Fun", bg: "#FFF9C4", border: "#F9A825", ink: "#5D4037", accent: "#FFD54F", emoji: ["🍋", "⭐", "✨", "🌼"] },
  { id: "ocean", name: "Ocean Breeze", tag: "Cool", bg: "#E0F7FA", border: "#00ACC1", ink: "#006064", accent: "#4DD0E1", emoji: ["🌊", "💙", "✨", "🐚"] },
];

const COUNTS = [2, 3, 4];

function layout(shots) {
  // LARGE holes — photos dominate
  const W = 720;
  const H = shots === 2 ? 980 : shots === 3 ? 1180 : 1380;
  const padX = 48; // wide windows
  const padTop = shots === 2 ? 88 : 78;
  const padBot = 100;
  const gap = shots === 2 ? 22 : shots === 3 ? 18 : 14;
  const holeW = W - padX * 2;
  const holeH = Math.floor((H - padTop - padBot - gap * (shots - 1)) / shots);
  const radius = shots === 2 ? 40 : 32;
  return { W, H, padX, padTop, padBot, gap, holeW, holeH, radius };
}

function buildSvg(theme, shots) {
  const { W, H, padX, padTop, gap, holeW, holeH, radius } = layout(shots);
  const holes = [];
  const slots = [];
  for (let i = 0; i < shots; i++) {
    const y = padTop + i * (holeH + gap);
    holes.push(
      `<rect x="${padX}" y="${y}" width="${holeW}" height="${holeH}" rx="${radius}" ry="${radius}" fill="#FFFFFF"/>`,
    );
    holes.push(
      `<rect x="${padX}" y="${y}" width="${holeW}" height="${holeH}" rx="${radius}" ry="${radius}" fill="none" stroke="${theme.border}" stroke-width="12"/>`,
    );
    // inner soft highlight border
    holes.push(
      `<rect x="${padX + 8}" y="${y + 8}" width="${holeW - 16}" height="${holeH - 16}" rx="${Math.max(12, radius - 10)}" fill="none" stroke="#ffffff" stroke-width="3" opacity="0.55"/>`,
    );
    slots.push({
      x: +((padX / W) * 100).toFixed(2),
      y: +((y / H) * 100).toFixed(2),
      w: +((holeW / W) * 100).toFixed(2),
      h: +((holeH / H) * 100).toFixed(2),
    });
  }

  // soft dots pattern
  const dots = [];
  const step = theme.bg === "#1A1A2E" ? 36 : 30;
  for (let y = 24; y < H; y += step) {
    for (let x = 24; x < W; x += step) {
      dots.push(
        `<circle cx="${x}" cy="${y}" r="${theme.bg === "#1A1A2E" ? 1.6 : 2.4}" fill="${theme.accent}" opacity="${theme.bg === "#1A1A2E" ? 0.45 : 0.22}"/>`,
      );
    }
  }

  const [e1, e2, e3, e4] = theme.emoji;
  const stickers = `
    <text x="28" y="70" font-size="40">${e1}</text>
    <text x="${W - 68}" y="95" font-size="36">${e2}</text>
    <text x="30" y="${H / 2}" font-size="36">${e3}</text>
    <text x="${W - 64}" y="${H / 2 + 50}" font-size="36">${e4}</text>
    <text x="32" y="${H - 150}" font-size="34">${e2}</text>
    <text x="${W - 66}" y="${H - 130}" font-size="34">${e1}</text>
  `;

  const title = shots === 2 ? `${theme.name}` : theme.name;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" rx="52" fill="${theme.bg}"/>
  <rect width="100%" height="100%" rx="52" fill="url(#sheen)"/>
  ${dots.join("\n")}
  <rect x="14" y="14" width="${W - 28}" height="${H - 28}" rx="42" fill="none" stroke="${theme.border}" stroke-width="7" opacity="0.5"/>
  <rect x="26" y="26" width="${W - 52}" height="${H - 52}" rx="36" fill="none" stroke="#ffffff" stroke-width="3" opacity="0.45"/>
  ${holes.join("\n")}
  ${stickers}
  <text x="${W / 2}" y="54" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="28" font-weight="800" fill="${theme.ink}" opacity="0.9">${e1} ${title}</text>
  <text x="${W / 2}" y="${H - 48}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="40" font-weight="800" fill="${theme.ink}">${theme.name}</text>
  <text x="${W / 2}" y="${H - 18}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="16" fill="${theme.ink}" opacity="0.65">PhotoBox ★ · ${shots} shots</text>
</svg>`;

  return { svg, slots, W, H };
}

async function punchWhite(pngPath, dest) {
  const { data, info } = await sharp(pngPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (let i = 0; i < info.width * info.height; i++) {
    const o = i * info.channels;
    const r = data[o],
      g = data[o + 1],
      b = data[o + 2];
    // strict pure white for holes only
    if (r >= 252 && g >= 252 && b >= 252) data[o + 3] = 0;
    else if (r >= 248 && g >= 248 && b >= 248)
      data[o + 3] = Math.min(255, (255 - Math.min(r, g, b)) * 30);
  }
  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: info.channels },
  })
    .png()
    .toFile(dest);
}

const catalog = [];

for (const shots of COUNTS) {
  const dir = path.join(ROOT, String(shots));
  fs.mkdirSync(dir, { recursive: true });
  for (const theme of THEMES) {
    const id = `${shots}s-${theme.id}`;
    const { svg, slots } = buildSvg(theme, shots);
    const raw = path.join(dir, `${id}-raw.png`);
    const dest = path.join(dir, `${id}.png`);
    await sharp(Buffer.from(svg)).png().toFile(raw);
    await punchWhite(raw, dest);
    await sharp(raw)
      .resize({ width: 260 })
      .jpeg({ quality: 85 })
      .toFile(path.join(dir, `${id}-thumb.jpg`));
    fs.unlinkSync(raw);

    catalog.push({
      id,
      name: theme.name,
      tag: theme.tag,
      shots,
      overlay: `/frames/by-count/${shots}/${id}.png`,
      thumb: `/frames/by-count/${shots}/${id}-thumb.jpg`,
      slots,
      bg: theme.bg,
      ink: theme.ink,
      accent: theme.accent,
    });
    console.log("✓", id);
  }
}

// Keep only best AI-generated frames with correct hole counts (2/3/4), drop 6 & broken berry
const AI_KEEP = [
  // 2
  "duo-lucky-heart",
  "duo-kyowo",
  "duo-bliss",
  "duo-pink",
  "duo-mint",
  "duo-sky",
  "duo-night",
  // 3
  "trio-lucky",
  "trio-bliss",
  "trio-bloom",
  "legacy-lucky-3",
  "legacy-bliss-3",
  "legacy-happy-3",
  // 4
  "quad-mirror",
  "quad-floral",
  "quad-xoxo",
  "quad-night",
  "quad-kyowo2",
  "quad-garden2",
  "legacy-kyowo-4",
  "legacy-garden-4",
  "legacy-mirror-4",
  "legacy-xoxo-4",
  "legacy-night-4",
  "legacy-bloom-4",
];

const oldCat = path.resolve("public/frames/catalog.json");
let old = [];
try {
  old = JSON.parse(fs.readFileSync(oldCat, "utf8"));
} catch {
  old = [];
}

for (const item of old) {
  if (item.shots === 6) continue;
  if (item.id.includes("berry") || item.name.toLowerCase().includes("strawberry snap"))
    continue; // broken strawberry with photo-here text
  if (!AI_KEEP.includes(item.id)) continue;
  if (catalog.some((c) => c.id === item.id)) continue;
  // expand slots slightly for bigger photo fill if holes were tight
  const slots = item.slots.map((s) => ({
    x: Math.max(2, s.x - 1),
    y: Math.max(1, s.y - 0.5),
    w: Math.min(96 - s.x, s.w + 2),
    h: Math.min(98 - s.y, s.h + 1),
  }));
  catalog.push({ ...item, slots });
  console.log("keep AI", item.id);
}

catalog.sort((a, b) => a.shots - b.shots || a.name.localeCompare(b.name));
fs.writeFileSync(oldCat, JSON.stringify(catalog, null, 2));
console.log(
  "\nTOTAL",
  catalog.length,
  [2, 3, 4].map((n) => `${n}=${catalog.filter((c) => c.shots === n).length}`).join(" "),
);
