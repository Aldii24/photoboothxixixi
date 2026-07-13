/** Extra programmatic 2-shot frames for more kawaii options */
import sharp from "sharp";
import fs from "fs";
import path from "path";

const W = 720;
const H = 1100;
const designs = [
  { id: "duo-pink", name: "Pink Duo", tag: "Soft", bg: "#FFE4F0", border: "#FF6BA8", ink: "#B83D6E", accent: "#FF8FB5", shots: 2 },
  { id: "duo-mint", name: "Mint Duo", tag: "Fresh", bg: "#D4F5E4", border: "#3ECF8E", ink: "#1a4a3a", accent: "#6BCB77", shots: 2 },
  { id: "duo-sky", name: "Sky Duo", tag: "Y2K", bg: "#D6EEFF", border: "#5B9DFF", ink: "#1E5A8A", accent: "#6BB0FF", shots: 2 },
  { id: "duo-night", name: "Night Duo", tag: "Dark", bg: "#1A1A2E", border: "#C9B6FF", ink: "#FFE0F0", accent: "#E0C8FF", shots: 2 },
];

const catPath = path.resolve("public/frames/catalog.json");
const catalog = JSON.parse(fs.readFileSync(catPath, "utf8"));

for (const d of designs) {
  const padX = 60;
  const padTop = 100;
  const padBot = 130;
  const gap = 28;
  const holeW = W - padX * 2;
  const holeH = Math.floor((H - padTop - padBot - gap) / 2);
  const r = 36;
  const dir = path.resolve(`public/frames/by-count/${d.shots}`);
  fs.mkdirSync(dir, { recursive: true });

  let holesSvg = "";
  const slots = [];
  for (let i = 0; i < d.shots; i++) {
    const y = padTop + i * (holeH + gap);
    holesSvg += `<rect x="${padX}" y="${y}" width="${holeW}" height="${holeH}" rx="${r}" fill="#FFFFFF"/>
    <rect x="${padX}" y="${y}" width="${holeW}" height="${holeH}" rx="${r}" fill="none" stroke="${d.border}" stroke-width="12"/>`;
    slots.push({
      x: +((padX / W) * 100).toFixed(2),
      y: +((y / H) * 100).toFixed(2),
      w: +((holeW / W) * 100).toFixed(2),
      h: +((holeH / H) * 100).toFixed(2),
    });
  }

  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" rx="48" fill="${d.bg}"/>
  <rect x="14" y="14" width="${W - 28}" height="${H - 28}" rx="40" fill="none" stroke="${d.border}" stroke-width="5" opacity="0.4"/>
  ${holesSvg}
  <text x="${W / 2}" y="58" text-anchor="middle" font-size="36" font-weight="700" fill="${d.ink}" font-family="Segoe UI,sans-serif">♡ ${d.name}</text>
  <text x="${W / 2}" y="${H - 50}" text-anchor="middle" font-size="38" font-weight="700" fill="${d.ink}" font-family="Segoe UI,sans-serif">${d.name}</text>
  <text x="40" y="200" font-size="34">✨</text>
  <text x="${W - 70}" y="280" font-size="34">💕</text>
  <text x="40" y="${H - 220}" font-size="34">🎀</text>
  <text x="${W - 70}" y="${H - 180}" font-size="34">⭐</text>
</svg>`;

  const raw = path.join(dir, `${d.id}-raw.png`);
  await sharp(Buffer.from(svg)).png().toFile(raw);
  const { data, info } = await sharp(raw).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < info.width * info.height; i++) {
    const o = i * info.channels;
    if (data[o] >= 250 && data[o + 1] >= 250 && data[o + 2] >= 250) data[o + 3] = 0;
  }
  const dest = path.join(dir, `${d.id}.png`);
  await sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } }).png().toFile(dest);
  await sharp(raw).resize({ width: 240 }).jpeg({ quality: 82 }).toFile(path.join(dir, `${d.id}-thumb.jpg`));
  fs.unlinkSync(raw);

  catalog.push({
    id: d.id,
    name: d.name,
    tag: d.tag,
    shots: d.shots,
    overlay: `/frames/by-count/${d.shots}/${d.id}.png`,
    thumb: `/frames/by-count/${d.shots}/${d.id}-thumb.jpg`,
    slots,
    bg: d.bg,
    ink: d.ink,
    accent: d.accent,
  });
  console.log("✓", d.id);
}

catalog.sort((a, b) => a.shots - b.shots || a.name.localeCompare(b.name));
fs.writeFileSync(catPath, JSON.stringify(catalog, null, 2));
console.log("total", catalog.length, "2=", catalog.filter((c) => c.shots === 2).length);
