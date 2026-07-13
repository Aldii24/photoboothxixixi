/**
 * Rebuild ALL frame templates with MAX photo area (minimal empty margin).
 * 2 / 3 / 4 shots only. Many kawaii themes.
 */
import sharp from "sharp";
import fs from "fs";
import path from "path";

const ROOT = path.resolve("public/frames/by-count");

const THEMES = [
  { id: "pink", name: "Pink Pop", tag: "Cute", bg: "#FFE4F0", border: "#FF5C9A", ink: "#B83D6E", accent: "#FF8FB5", e: ["✨", "💕", "🎀", "🌸"] },
  { id: "mint", name: "Mint Fresh", tag: "Fresh", bg: "#D4F5E4", border: "#2FA86A", ink: "#1a4a3a", accent: "#6BCB77", e: ["🍀", "🐝", "🌿", "✨"] },
  { id: "sky", name: "Sky Pop", tag: "Y2K", bg: "#D6EEFF", border: "#4A8FE8", ink: "#1E5A8A", accent: "#6BB0FF", e: ["⭐", "💫", "☁️", "💙"] },
  { id: "cream", name: "Honey Cream", tag: "Warm", bg: "#FFF3D6", border: "#E8952E", ink: "#5c3a2a", accent: "#FFC83D", e: ["🍯", "⭐", "🌼", "✨"] },
  { id: "lavender", name: "Lavender", tag: "Soft", bg: "#F0E8FF", border: "#A78BFA", ink: "#4a3566", accent: "#C9B6FF", e: ["💜", "✨", "🦋", "🌙"] },
  { id: "peach", name: "Peach Kiss", tag: "Sweet", bg: "#FFE8D6", border: "#FF8A5B", ink: "#8B3A2A", accent: "#FFB086", e: ["🍑", "💕", "✨", "🎀"] },
  { id: "berry", name: "Strawberry", tag: "Berry", bg: "#FFD6E8", border: "#E83D7A", ink: "#B83D6E", accent: "#FF6B9D", e: ["🍓", "💕", "🎀", "✨"] },
  { id: "night", name: "Night Spark", tag: "Dark", bg: "#1A1A2E", border: "#C9B6FF", ink: "#FFE0F0", accent: "#E0C8FF", e: ["✨", "🌙", "⭐", "💜"] },
  { id: "matcha", name: "Matcha", tag: "Calm", bg: "#E8F5D8", border: "#6B9E3E", ink: "#2d4a1a", accent: "#8FBF5A", e: ["🍵", "🌿", "✨", "🍀"] },
  { id: "coquette", name: "Coquette", tag: "Bow", bg: "#FFF0F5", border: "#FF6BA8", ink: "#8B2A50", accent: "#FF8FB5", e: ["🎀", "🖤", "💕", "✨"] },
  { id: "citrus", name: "Citrus", tag: "Fun", bg: "#FFF9C4", border: "#F9A825", ink: "#5D4037", accent: "#FFD54F", e: ["🍋", "⭐", "✨", "🌼"] },
  { id: "ocean", name: "Ocean", tag: "Cool", bg: "#E0F7FA", border: "#00ACC1", ink: "#006064", accent: "#4DD0E1", e: ["🌊", "💙", "✨", "🐚"] },
  { id: "rose", name: "Rose Garden", tag: "Floral", bg: "#FFE8EE", border: "#E91E63", ink: "#880E4F", accent: "#F48FB1", e: ["🌹", "💕", "✨", "🌸"] },
  { id: "bubble", name: "Bubblegum", tag: "Pop", bg: "#FCE4EC", border: "#EC407A", ink: "#AD1457", accent: "#F48FB1", e: ["🍬", "✨", "💖", "🎀"] },
  { id: "cotton", name: "Cotton Candy", tag: "Pastel", bg: "#E8F0FF", border: "#7E57C2", ink: "#4527A0", accent: "#B39DDB", e: ["🍭", "☁️", "✨", "💜"] },
  { id: "sunny", name: "Sunny Day", tag: "Bright", bg: "#FFF8E1", border: "#FFB300", ink: "#E65100", accent: "#FFD54F", e: ["☀️", "⭐", "✨", "🌻"] },
  { id: "kitty", name: "Kitty Love", tag: "Cat", bg: "#FFF3E0", border: "#FF8A65", ink: "#BF360C", accent: "#FFAB91", e: ["🐱", "💕", "🎀", "✨"] },
  { id: "sakura", name: "Sakura", tag: "Japan", bg: "#FFF5F8", border: "#F06292", ink: "#880E4F", accent: "#F8BBD0", e: ["🌸", "✨", "💗", "🦋"] },
  { id: "grape", name: "Grape Soda", tag: "Fun", bg: "#F3E5F5", border: "#AB47BC", ink: "#6A1B9A", accent: "#CE93D8", e: ["🍇", "✨", "💜", "⭐"] },
  { id: "ice", name: "Ice Cream", tag: "Sweet", bg: "#FFF0F6", border: "#FF80AB", ink: "#C2185B", accent: "#FF80AB", e: ["🍦", "💕", "✨", "🎀"] },
];

const COUNTS = [2, 3, 4];

function layout(shots) {
  const W = 720;
  // taller strip so each photo is BIG vertically
  const H = shots === 2 ? 1100 : shots === 3 ? 1400 : 1680;
  // MINIMAL side padding → photo almost full width
  const padX = 28;
  const padTop = 56;
  const padBot = 72;
  const gap = shots === 2 ? 14 : shots === 3 ? 12 : 10;
  const holeW = W - padX * 2;
  const holeH = Math.floor((H - padTop - padBot - gap * (shots - 1)) / shots);
  const radius = 26;
  return { W, H, padX, padTop, padBot, gap, holeW, holeH, radius };
}

function buildSvg(theme, shots) {
  const { W, H, padX, padTop, gap, holeW, holeH, radius } = layout(shots);
  const holes = [];
  const slots = [];

  for (let i = 0; i < shots; i++) {
    const y = padTop + i * (holeH + gap);
    // pure white hole (will become transparent)
    holes.push(
      `<rect x="${padX}" y="${y}" width="${holeW}" height="${holeH}" rx="${radius}" ry="${radius}" fill="#FFFFFF"/>`,
    );
    // thick border around hole
    holes.push(
      `<rect x="${padX}" y="${y}" width="${holeW}" height="${holeH}" rx="${radius}" ry="${radius}" fill="none" stroke="${theme.border}" stroke-width="10"/>`,
    );
    holes.push(
      `<rect x="${padX + 6}" y="${y + 6}" width="${holeW - 12}" height="${holeH - 12}" rx="${Math.max(10, radius - 8)}" fill="none" stroke="#ffffff" stroke-width="2.5" opacity="0.65"/>`,
    );
    slots.push({
      x: +((padX / W) * 100).toFixed(2),
      y: +((y / H) * 100).toFixed(2),
      w: +((holeW / W) * 100).toFixed(2),
      h: +((holeH / H) * 100).toFixed(2),
    });
  }

  // tiny corner accents only — NO big side columns of empty space
  const [e1, e2, e3, e4] = theme.e;
  const stickers = `
    <text x="10" y="42" font-size="28">${e1}</text>
    <text x="${W - 40}" y="42" font-size="28">${e2}</text>
    <text x="10" y="${H - 28}" font-size="26">${e3}</text>
    <text x="${W - 40}" y="${H - 28}" font-size="26">${e4}</text>
  `;

  // subtle dots (won't steal space from holes)
  const dots = [];
  for (let y = 18; y < H; y += 34) {
    for (let x = 14; x < W; x += 34) {
      // skip hole regions roughly
      const inHoleX = x > padX && x < padX + holeW;
      let inHoleY = false;
      for (let i = 0; i < shots; i++) {
        const hy = padTop + i * (holeH + gap);
        if (y > hy && y < hy + holeH) inHoleY = true;
      }
      if (inHoleX && inHoleY) continue;
      dots.push(
        `<circle cx="${x}" cy="${y}" r="1.8" fill="${theme.accent}" opacity="${theme.bg === "#1A1A2E" ? 0.4 : 0.18}"/>`,
      );
    }
  }

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" rx="40" fill="${theme.bg}"/>
  ${dots.join("\n")}
  <rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="34" fill="none" stroke="${theme.border}" stroke-width="5" opacity="0.4"/>
  ${holes.join("\n")}
  ${stickers}
  <text x="${W / 2}" y="38" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="22" font-weight="800" fill="${theme.ink}" opacity="0.85">${e1} ${theme.name}</text>
  <text x="${W / 2}" y="${H - 22}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="28" font-weight="800" fill="${theme.ink}">${theme.name} ★</text>
</svg>`;

  return { svg, slots, W, H };
}

async function punchWhite(srcPath, destPath) {
  const { data, info } = await sharp(srcPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (let i = 0; i < info.width * info.height; i++) {
    const o = i * info.channels;
    const r = data[o],
      g = data[o + 1],
      b = data[o + 2];
    if (r >= 252 && g >= 252 && b >= 252) data[o + 3] = 0;
    else if (r >= 248 && g >= 248 && b >= 248)
      data[o + 3] = Math.min(255, (255 - Math.min(r, g, b)) * 28);
  }
  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: info.channels },
  })
    .png()
    .toFile(destPath);
}

// wipe old by-count and rebuild clean
for (const n of [2, 3, 4, 6]) {
  const d = path.join(ROOT, String(n));
  fs.rmSync(d, { recursive: true, force: true });
  if (n !== 6) fs.mkdirSync(d, { recursive: true });
}

const catalog = [];

for (const shots of [2, 3, 4]) {
  for (const theme of THEMES) {
    const id = `big-${shots}s-${theme.id}`;
    const { svg, slots } = buildSvg(theme, shots);
    const dir = path.join(ROOT, String(shots));
    const raw = path.join(dir, `${id}-raw.png`);
    const dest = path.join(dir, `${id}.png`);
    await sharp(Buffer.from(svg)).png().toFile(raw);
    await punchWhite(raw, dest);
    await sharp(raw)
      .resize({ width: 280 })
      .jpeg({ quality: 86 })
      .toFile(path.join(dir, `${id}-thumb.jpg`));
    fs.unlinkSync(raw);

    // verify hole size
    const w = slots[0].w;
    if (w < 85) console.warn("WARN small hole", id, w);

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
    console.log("✓", id, `holeW=${slots[0].w}% holeH=${slots[0].h}%`);
  }
}

// Also generate HEART variants for 2 & 3 with large holes
const HEART_THEMES = THEMES.slice(0, 10);
for (const shots of [2, 3]) {
  for (const theme of HEART_THEMES) {
    const { W, H, padX, padTop, gap, holeW, holeH } = layout(shots);
    const id = `heart-${shots}s-${theme.id}`;
    // approximate heart as rounded rect (clip is overlay); use wide oval-ish rx
    const rx = holeW * 0.42;
    const ry = holeH * 0.42;
    const holes = [];
    const slots = [];
    for (let i = 0; i < shots; i++) {
      const y = padTop + i * (holeH + gap);
      const cx = W / 2;
      const cy = y + holeH / 2;
      // heart-ish via two circles + triangle is complex; use rounded rect with large radius + pink heart border
      holes.push(
        `<rect x="${padX}" y="${y}" width="${holeW}" height="${holeH}" rx="${Math.min(rx, ry)}" fill="#FFFFFF"/>`,
      );
      holes.push(
        `<rect x="${padX}" y="${y}" width="${holeW}" height="${holeH}" rx="${Math.min(rx, ry)}" fill="none" stroke="${theme.border}" stroke-width="11"/>`,
      );
      slots.push({
        x: +((padX / W) * 100).toFixed(2),
        y: +((y / H) * 100).toFixed(2),
        w: +((holeW / W) * 100).toFixed(2),
        h: +((holeH / H) * 100).toFixed(2),
      });
    }
    const [e1, e2] = theme.e;
    const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" rx="40" fill="${theme.bg}"/>
      <rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="34" fill="none" stroke="${theme.border}" stroke-width="5" opacity="0.45"/>
      ${holes.join("\n")}
      <text x="12" y="40" font-size="26">${e1}</text>
      <text x="${W - 40}" y="40" font-size="26">${e2}</text>
      <text x="${W / 2}" y="36" text-anchor="middle" font-size="20" font-weight="800" fill="${theme.ink}" font-family="Segoe UI,sans-serif">♡ ${theme.name}</text>
      <text x="${W / 2}" y="${H - 24}" text-anchor="middle" font-size="26" font-weight="800" fill="${theme.ink}" font-family="Segoe UI,sans-serif">${theme.name} ♡</text>
    </svg>`;
    const dir = path.join(ROOT, String(shots));
    const raw = path.join(dir, `${id}-raw.png`);
    const dest = path.join(dir, `${id}.png`);
    await sharp(Buffer.from(svg)).png().toFile(raw);
    await punchWhite(raw, dest);
    await sharp(raw)
      .resize({ width: 280 })
      .jpeg({ quality: 86 })
      .toFile(path.join(dir, `${id}-thumb.jpg`));
    fs.unlinkSync(raw);
    catalog.push({
      id,
      name: `${theme.name} Soft`,
      tag: `${theme.tag} · Soft`,
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

catalog.sort((a, b) => a.shots - b.shots || a.name.localeCompare(b.name));
fs.writeFileSync(
  path.resolve("public/frames/catalog.json"),
  JSON.stringify(catalog, null, 2),
);
console.log(
  "\nDONE total",
  catalog.length,
  [2, 3, 4].map((n) => `${n}=${catalog.filter((c) => c.shots === n).length}`).join(" "),
);
console.log(
  "sample hole",
  catalog[0].id,
  catalog[0].slots[0],
);
