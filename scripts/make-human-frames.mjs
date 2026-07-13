/**
 * Human-crafted kawaii photobooth frames.
 * - Photo holes MAXIMIZED (~93% width, minimal chrome)
 * - Cute kyowo motifs only — no AI-slop collage, no "basic" plain frames
 * - Exact counts: 2 / 3 / 4 only
 */
import sharp from "sharp";
import fs from "fs";
import path from "path";

const ROOT = path.resolve("public/frames/by-count");
const CATALOG = path.resolve("public/frames/catalog.json");

// ── geometry: maximize photo, minimize empty frame chrome ──
function layout(shots) {
  const W = 720;
  // Canvas tall enough for big stacked photos
  const H = shots === 2 ? 1100 : shots === 3 ? 1400 : 1680;
  const padX = 18; // hole ~93.3% width
  const padTop = 36; // thin header strip for bows
  const padBot = 44; // thin footer for title
  const gap = shots === 2 ? 10 : shots === 3 ? 8 : 7;
  const holeW = W - padX * 2;
  const holeH = Math.floor((H - padTop - padBot - gap * (shots - 1)) / shots);
  const r = 18;
  return { W, H, padX, padTop, padBot, gap, holeW, holeH, r };
}

// ── patterns ──
function gingham(id, c1, c2, size = 20) {
  return `<pattern id="${id}" width="${size * 2}" height="${size * 2}" patternUnits="userSpaceOnUse">
    <rect width="${size * 2}" height="${size * 2}" fill="${c1}"/>
    <rect width="${size}" height="${size}" fill="${c2}" opacity="0.5"/>
    <rect x="${size}" y="${size}" width="${size}" height="${size}" fill="${c2}" opacity="0.5"/>
    <rect x="${size}" width="${size}" height="${size * 2}" fill="${c2}" opacity="0.22"/>
    <rect y="${size}" width="${size * 2}" height="${size}" fill="${c2}" opacity="0.22"/>
  </pattern>`;
}

function checker(id, c1, c2, size = 18) {
  return `<pattern id="${id}" width="${size * 2}" height="${size * 2}" patternUnits="userSpaceOnUse">
    <rect width="${size * 2}" height="${size * 2}" fill="${c1}"/>
    <rect width="${size}" height="${size}" fill="${c2}"/>
    <rect x="${size}" y="${size}" width="${size}" height="${size}" fill="${c2}"/>
  </pattern>`;
}

function dots(id, bg, dot, size = 14) {
  return `<pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse">
    <rect width="${size}" height="${size}" fill="${bg}"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="1.5" fill="${dot}" opacity="0.4"/>
  </pattern>`;
}

function stripes(id, c1, c2, size = 12) {
  return `<pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse">
    <rect width="${size}" height="${size}" fill="${c1}"/>
    <rect width="${size / 2}" height="${size}" fill="${c2}" opacity="0.45"/>
  </pattern>`;
}

function heartsPat(id, bg, heart, size = 28) {
  return `<pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse">
    <rect width="${size}" height="${size}" fill="${bg}"/>
    <path d="M${size / 2} ${size * 0.72} C${size * 0.18} ${size * 0.42} ${size * 0.18} ${size * 0.18} ${size / 2} ${size * 0.32} C${size * 0.82} ${size * 0.18} ${size * 0.82} ${size * 0.42} ${size / 2} ${size * 0.72}Z" fill="${heart}" opacity="0.22"/>
  </pattern>`;
}

// ── motifs (compact, sit in thin margins / corners — never cover photo holes) ──
function bow(x, y, s, c) {
  return `<g transform="translate(${x},${y}) scale(${s})">
    <ellipse cx="-11" cy="0" rx="13" ry="9" fill="${c}"/>
    <ellipse cx="11" cy="0" rx="13" ry="9" fill="${c}"/>
    <ellipse cx="0" cy="0" rx="5.5" ry="5.5" fill="${c}"/>
    <path d="M-3.5 3 L-7 15 L0 9 L7 15 L3.5 3" fill="${c}" opacity="0.92"/>
    <ellipse cx="-11" cy="-1" rx="5" ry="3" fill="#fff" opacity="0.25"/>
    <ellipse cx="11" cy="-1" rx="5" ry="3" fill="#fff" opacity="0.25"/>
  </g>`;
}

function heart(x, y, s, c) {
  return `<g transform="translate(${x},${y}) scale(${s})">
    <path d="M0 9 C-13 -2 -13 -13 0 -6 C13 -13 13 -2 0 9Z" fill="${c}"/>
  </g>`;
}

function star(x, y, s, c) {
  return `<g transform="translate(${x},${y}) scale(${s})">
    <polygon points="0,-11 2.8,-3.4 11,-3.4 4.4,1.8 6.8,10 0,5.2 -6.8,10 -4.4,1.8 -11,-3.4 -2.8,-3.4" fill="${c}"/>
  </g>`;
}

function clover(x, y, s, c) {
  return `<g transform="translate(${x},${y}) scale(${s})">
    <circle cx="-5.5" cy="-3.5" r="6.2" fill="${c}"/>
    <circle cx="5.5" cy="-3.5" r="6.2" fill="${c}"/>
    <circle cx="0" cy="5.5" r="6.2" fill="${c}"/>
    <circle cx="0" cy="0" r="3.5" fill="${c}"/>
    <rect x="-1.4" y="5" width="2.8" height="10" rx="1" fill="${c}"/>
  </g>`;
}

function strawberry(x, y, s) {
  return `<g transform="translate(${x},${y}) scale(${s})">
    <path d="M0 13 C-10 4 -9 -5 0 -2.5 C9 -5 10 4 0 13Z" fill="#E53935"/>
    <ellipse cx="-3.2" cy="2" rx="1.1" ry="1.6" fill="#FFCDD2"/>
    <ellipse cx="3" cy="4.5" rx="1.1" ry="1.6" fill="#FFCDD2"/>
    <ellipse cx="0" cy="7" rx="0.9" ry="1.3" fill="#FFCDD2"/>
    <path d="M-7 -2.5 Q0 -9 7 -2.5 Q0 -0.5 -7 -2.5" fill="#43A047"/>
    <ellipse cx="-2" cy="-4" rx="2.2" ry="1.4" fill="#66BB6A"/>
    <ellipse cx="2.5" cy="-3.5" rx="2" ry="1.2" fill="#66BB6A"/>
  </g>`;
}

function catFace(x, y, s, body = "#FFCC80") {
  return `<g transform="translate(${x},${y}) scale(${s})">
    <circle cx="0" cy="2" r="12" fill="${body}"/>
    <polygon points="-9.5,-4 -13,-15 -3.5,-8" fill="${body}"/>
    <polygon points="9.5,-4 13,-15 3.5,-8" fill="${body}"/>
    <circle cx="-4.2" cy="1" r="1.5" fill="#5D4037"/>
    <circle cx="4.2" cy="1" r="1.5" fill="#5D4037"/>
    <ellipse cx="0" cy="5.2" rx="2.2" ry="1.5" fill="#F48FB1"/>
    <path d="M-7 4 Q-10 5 -8 7" stroke="#5D4037" stroke-width="0.9" fill="none"/>
    <path d="M7 4 Q10 5 8 7" stroke="#5D4037" stroke-width="0.9" fill="none"/>
  </g>`;
}

function daisy(x, y, s, petal = "#FFF", center = "#FFD54F") {
  return `<g transform="translate(${x},${y}) scale(${s})">
    ${[0, 45, 90, 135, 180, 225, 270, 315]
      .map(
        (a) =>
          `<ellipse cx="0" cy="-7" rx="3.2" ry="6" fill="${petal}" transform="rotate(${a})" opacity="0.95"/>`,
      )
      .join("")}
    <circle cx="0" cy="0" r="4" fill="${center}"/>
  </g>`;
}

function cherry(x, y, s) {
  return `<g transform="translate(${x},${y}) scale(${s})">
    <path d="M0 0 Q-4 -10 -8 -14" stroke="#43A047" stroke-width="1.6" fill="none"/>
    <path d="M0 0 Q4 -10 8 -14" stroke="#43A047" stroke-width="1.6" fill="none"/>
    <circle cx="-6" cy="2" r="6" fill="#E53935"/>
    <circle cx="6" cy="2" r="6" fill="#C62828"/>
    <ellipse cx="-8" cy="0" rx="1.5" ry="1" fill="#fff" opacity="0.35"/>
  </g>`;
}

function sparkle(x, y, s, c) {
  return `<g transform="translate(${x},${y}) scale(${s})">
    <path d="M0 -8 L1.2 -1.2 L8 0 L1.2 1.2 L0 8 L-1.2 1.2 L-8 0 L-1.2 -1.2Z" fill="${c}"/>
  </g>`;
}

function tape(x, y, rot, c) {
  return `<g transform="translate(${x},${y}) rotate(${rot})">
    <rect x="-18" y="-5" width="36" height="10" rx="1" fill="${c}" opacity="0.55"/>
  </g>`;
}

/** Corner décor only — stays in the thin chrome, not over holes */
function corners(W, H, pieces) {
  return pieces.join("");
}

// ── design catalog (distinct human vibes) ──
const DESIGNS = [
  {
    id: "coquette-pink",
    name: "Coquette Pink",
    tag: "Coquette",
    bg: "#FFF0F5",
    pattern: (id) => dots(id, "#FFF0F5", "#FF8FB5", 13),
    border: "#FF5C9A",
    ink: "#8B2A50",
    accent: "#FF8FB5",
    decor: (W, H) =>
      corners(W, H, [
        bow(20, 22, 0.95, "#FF5C9A"),
        bow(W - 20, 22, 0.95, "#FF5C9A"),
        heart(W / 2, 18, 0.55, "#FF8FB5"),
        bow(20, H - 26, 0.85, "#FF5C9A"),
        bow(W - 20, H - 26, 0.85, "#FF5C9A"),
      ]),
  },
  {
    id: "coquette-noir",
    name: "Noir Bow",
    tag: "Coquette",
    bg: "#1A1A1A",
    pattern: (id) => dots(id, "#1A1A1A", "#FF8FB5", 16),
    border: "#FF8FB5",
    ink: "#FFE0EC",
    accent: "#FF8FB5",
    decor: (W, H) =>
      corners(W, H, [
        bow(20, 20, 1, "#FF8FB5"),
        bow(W - 20, 20, 1, "#FF8FB5"),
        bow(20, H - 24, 0.9, "#FFFFFF"),
        bow(W - 20, H - 24, 0.9, "#FFFFFF"),
      ]),
  },
  {
    id: "coquette-cream",
    name: "Ribbon Cream",
    tag: "Coquette",
    bg: "#FFF8F0",
    pattern: (id) => heartsPat(id, "#FFF8F0", "#FFB6C8", 30),
    border: "#E8A0B0",
    ink: "#8B4557",
    accent: "#F5C6D0",
    decor: (W, H) =>
      corners(W, H, [
        bow(20, 20, 0.9, "#E8A0B0"),
        bow(W - 20, 20, 0.9, "#E8A0B0"),
        heart(22, H - 24, 0.7, "#F5C6D0"),
        heart(W - 22, H - 24, 0.7, "#E8A0B0"),
      ]),
  },
  {
    id: "lucky-charm",
    name: "Lucky Charm",
    tag: "Y2K",
    bg: "#FFE566",
    pattern: (id) => gingham(id, "#FFE566", "#FFF3A0", 16),
    border: "#FF5C9A",
    ink: "#C2185B",
    accent: "#FF8FB5",
    decor: (W, H) =>
      corners(W, H, [
        clover(20, 22, 0.95, "#43A047"),
        strawberry(W - 22, 22, 0.95),
        star(20, H - 26, 0.9, "#42A5F5"),
        clover(W - 20, H - 24, 0.9, "#66BB6A"),
        heart(W / 2, 16, 0.5, "#FF5C9A"),
      ]),
  },
  {
    id: "bliss-pop",
    name: "Bliss Pop",
    tag: "Y2K",
    bg: "#B8DFFF",
    pattern: (id) => checker(id, "#B8DFFF", "#FFFFFF", 15),
    border: "#FF2E8A",
    ink: "#C2185B",
    accent: "#FF6B9D",
    decor: (W, H) =>
      corners(W, H, [
        star(20, 20, 1, "#FFD54F"),
        star(W - 20, 22, 0.9, "#FF80AB"),
        heart(20, H - 24, 0.85, "#FF2E8A"),
        star(W - 20, H - 26, 0.95, "#7E57C2"),
      ]),
  },
  {
    id: "y2k-grid",
    name: "Y2K Grid",
    tag: "Y2K",
    bg: "#FFE0F0",
    pattern: (id) => checker(id, "#FFE0F0", "#FFFFFF", 14),
    border: "#E91E63",
    ink: "#880E4F",
    accent: "#F48FB1",
    decor: (W, H) =>
      corners(W, H, [
        sparkle(20, 20, 1, "#E91E63"),
        sparkle(W - 20, 20, 1, "#7E57C2"),
        sparkle(20, H - 24, 0.9, "#42A5F5"),
        sparkle(W - 20, H - 24, 0.9, "#FFD54F"),
      ]),
  },
  {
    id: "kyowo-cat",
    name: "Kyowo Cat",
    tag: "Cat",
    bg: "#FFE8D0",
    pattern: (id) => gingham(id, "#FFE8D0", "#FFF3E0", 18),
    border: "#FF8A65",
    ink: "#E85A8C",
    accent: "#FFAB91",
    decor: (W, H) =>
      corners(W, H, [
        catFace(22, 22, 1.05, "#FFCC80"),
        catFace(W - 22, 24, 1, "#E0E0E0"),
        catFace(22, H - 26, 0.95, "#FFAB91"),
        catFace(W - 22, H - 24, 0.95, "#BCAAA4"),
      ]),
  },
  {
    id: "night-meow",
    name: "Night Meow",
    tag: "Cat",
    bg: "#1A1A2E",
    pattern: (id) => dots(id, "#1A1A2E", "#E0C8FF", 18),
    border: "#C9B6FF",
    ink: "#FFE0F0",
    accent: "#E0C8FF",
    decor: (W, H) =>
      corners(W, H, [
        catFace(22, 20, 1, "#424242"),
        star(W - 20, 20, 0.95, "#FFD54F"),
        star(20, H - 24, 0.85, "#E0C8FF"),
        catFace(W - 22, H - 26, 0.95, "#616161"),
      ]),
  },
  {
    id: "strawberry-snap",
    name: "Strawberry Snap",
    tag: "Berry",
    bg: "#FFD6E8",
    pattern: (id) => dots(id, "#FFD6E8", "#FF8FB5", 14),
    border: "#E83D7A",
    ink: "#B83D6E",
    accent: "#FF6B9D",
    decor: (W, H) =>
      corners(W, H, [
        strawberry(20, 20, 1.05),
        strawberry(W - 22, 22, 1),
        strawberry(20, H - 24, 0.95),
        strawberry(W - 20, H - 24, 1),
      ]),
  },
  {
    id: "cherry-kiss",
    name: "Cherry Kiss",
    tag: "Berry",
    bg: "#FFF0F3",
    pattern: (id) => dots(id, "#FFF0F3", "#EF9A9A", 14),
    border: "#E53935",
    ink: "#B71C1C",
    accent: "#EF9A9A",
    decor: (W, H) =>
      corners(W, H, [
        cherry(22, 22, 0.95),
        cherry(W - 22, 22, 0.95),
        cherry(22, H - 24, 0.85),
        cherry(W - 22, H - 24, 0.85),
      ]),
  },
  {
    id: "sakura-lane",
    name: "Sakura Lane",
    tag: "Floral",
    bg: "#FFF5F8",
    pattern: (id) => heartsPat(id, "#FFF5F8", "#F8BBD0", 28),
    border: "#F06292",
    ink: "#880E4F",
    accent: "#F8BBD0",
    decor: (W, H) =>
      corners(W, H, [
        daisy(20, 20, 0.85, "#FCE4EC", "#F48FB1"),
        daisy(W - 20, 22, 0.8, "#FCE4EC", "#F06292"),
        daisy(20, H - 24, 0.75, "#FFF", "#F48FB1"),
        daisy(W - 20, H - 24, 0.8, "#FCE4EC", "#EC407A"),
      ]),
  },
  {
    id: "daisy-day",
    name: "Daisy Day",
    tag: "Floral",
    bg: "#FFFDE7",
    pattern: (id) => dots(id, "#FFFDE7", "#FFE082", 15),
    border: "#FBC02D",
    ink: "#F57F17",
    accent: "#FFEE58",
    decor: (W, H) =>
      corners(W, H, [
        daisy(20, 20, 0.9, "#FFFFFF", "#FFD54F"),
        daisy(W - 20, 22, 0.85, "#FFFFFF", "#FFCA28"),
        daisy(20, H - 24, 0.8, "#FFFFFF", "#FFD54F"),
        daisy(W - 20, H - 24, 0.85, "#FFFFFF", "#FFCA28"),
      ]),
  },
  {
    id: "lucky-garden",
    name: "Lucky Garden",
    tag: "Mint",
    bg: "#D4F5E4",
    pattern: (id) => dots(id, "#D4F5E4", "#81C784", 15),
    border: "#43A047",
    ink: "#1B5E20",
    accent: "#66BB6A",
    decor: (W, H) =>
      corners(W, H, [
        clover(20, 22, 1, "#43A047"),
        clover(W - 20, 22, 0.95, "#66BB6A"),
        clover(20, H - 24, 0.9, "#2E7D32"),
        clover(W - 20, H - 24, 0.95, "#43A047"),
      ]),
  },
  {
    id: "matcha-mood",
    name: "Matcha Mood",
    tag: "Calm",
    bg: "#F1F8E9",
    pattern: (id) => gingham(id, "#F1F8E9", "#DCEDC8", 17),
    border: "#7CB342",
    ink: "#33691E",
    accent: "#AED581",
    decor: (W, H) =>
      corners(W, H, [
        clover(20, 20, 0.95, "#7CB342"),
        clover(W - 20, 22, 0.9, "#9CCC65"),
        clover(20, H - 24, 0.85, "#689F38"),
        clover(W - 20, H - 24, 0.9, "#7CB342"),
      ]),
  },
  {
    id: "mint-soft",
    name: "Mint Soft",
    tag: "Fresh",
    bg: "#E8F8F0",
    pattern: (id) => gingham(id, "#E8F8F0", "#C8F0D8", 17),
    border: "#26A69A",
    ink: "#004D40",
    accent: "#80CBC4",
    decor: (W, H) =>
      corners(W, H, [
        star(20, 20, 0.9, "#26A69A"),
        heart(W - 20, 20, 0.75, "#F48FB1"),
        heart(20, H - 24, 0.7, "#F48FB1"),
        star(W - 20, H - 24, 0.9, "#80CBC4"),
      ]),
  },
  {
    id: "sky-soft",
    name: "Sky Soft",
    tag: "Cool",
    bg: "#E3F2FD",
    pattern: (id) => checker(id, "#E3F2FD", "#FFFFFF", 16),
    border: "#42A5F5",
    ink: "#0D47A1",
    accent: "#90CAF9",
    decor: (W, H) =>
      corners(W, H, [
        star(20, 20, 0.95, "#FFD54F"),
        star(W - 20, 22, 0.9, "#42A5F5"),
        star(20, H - 24, 0.85, "#7E57C2"),
        star(W - 20, H - 24, 0.95, "#FFD54F"),
      ]),
  },
  {
    id: "ocean-breeze",
    name: "Ocean Breeze",
    tag: "Cool",
    bg: "#E0F7FA",
    pattern: (id) => stripes(id, "#E0F7FA", "#B2EBF2", 11),
    border: "#00ACC1",
    ink: "#006064",
    accent: "#4DD0E1",
    decor: (W, H) =>
      corners(W, H, [
        sparkle(20, 20, 0.95, "#00ACC1"),
        sparkle(W - 20, 20, 0.95, "#26C6DA"),
        heart(20, H - 24, 0.7, "#4DD0E1"),
        sparkle(W - 20, H - 24, 0.9, "#00BCD4"),
      ]),
  },
  {
    id: "peach-soft",
    name: "Peach Soft",
    tag: "Warm",
    bg: "#FFF3E0",
    pattern: (id) => dots(id, "#FFF3E0", "#FFCC80", 14),
    border: "#FF8A65",
    ink: "#BF360C",
    accent: "#FFAB91",
    decor: (W, H) =>
      corners(W, H, [
        heart(20, 20, 0.85, "#FF8A65"),
        star(W - 20, 22, 0.9, "#FFD54F"),
        star(20, H - 24, 0.85, "#FFD54F"),
        heart(W - 20, H - 24, 0.8, "#FF8A65"),
      ]),
  },
  {
    id: "honey-cream",
    name: "Honey Cream",
    tag: "Warm",
    bg: "#FFF8E1",
    pattern: (id) => gingham(id, "#FFF8E1", "#FFE082", 17),
    border: "#F9A825",
    ink: "#E65100",
    accent: "#FFD54F",
    decor: (W, H) =>
      corners(W, H, [
        star(20, 20, 0.95, "#F9A825"),
        star(W - 20, 22, 0.9, "#FFD54F"),
        star(20, H - 24, 0.85, "#FFB300"),
        star(W - 20, H - 24, 0.9, "#F9A825"),
      ]),
  },
  {
    id: "lavender-dream",
    name: "Lavender Dream",
    tag: "Dreamy",
    bg: "#F3E5F5",
    pattern: (id) => dots(id, "#F3E5F5", "#CE93D8", 14),
    border: "#AB47BC",
    ink: "#6A1B9A",
    accent: "#CE93D8",
    decor: (W, H) =>
      corners(W, H, [
        star(20, 20, 0.9, "#AB47BC"),
        heart(W - 20, 22, 0.8, "#F48FB1"),
        star(20, H - 24, 0.85, "#7E57C2"),
        heart(W - 20, H - 24, 0.8, "#CE93D8"),
      ]),
  },
  {
    id: "cotton-candy",
    name: "Cotton Candy",
    tag: "Pastel",
    bg: "#F8E8FF",
    pattern: (id) => checker(id, "#F8E8FF", "#FFFFFF", 15),
    border: "#7E57C2",
    ink: "#4527A0",
    accent: "#B39DDB",
    decor: (W, H) =>
      corners(W, H, [
        bow(20, 20, 0.85, "#B39DDB"),
        bow(W - 20, 20, 0.85, "#F48FB1"),
        heart(20, H - 24, 0.75, "#F48FB1"),
        heart(W - 20, H - 24, 0.75, "#B39DDB"),
      ]),
  },
  {
    id: "bubblegum",
    name: "Bubblegum",
    tag: "Pop",
    bg: "#FCE4EC",
    pattern: (id) => dots(id, "#FCE4EC", "#F48FB1", 13),
    border: "#EC407A",
    ink: "#AD1457",
    accent: "#F48FB1",
    decor: (W, H) =>
      corners(W, H, [
        bow(20, 20, 0.9, "#EC407A"),
        heart(W - 20, 22, 0.85, "#F48FB1"),
        heart(20, H - 24, 0.8, "#EC407A"),
        bow(W - 20, H - 24, 0.85, "#F48FB1"),
      ]),
  },
  {
    id: "rose-garden",
    name: "Rose Garden",
    tag: "Floral",
    bg: "#FFF0F3",
    pattern: (id) => heartsPat(id, "#FFF0F3", "#F8BBD0", 26),
    border: "#E91E63",
    ink: "#880E4F",
    accent: "#F48FB1",
    decor: (W, H) =>
      corners(W, H, [
        heart(20, 20, 0.9, "#E91E63"),
        heart(W - 20, 22, 0.85, "#F06292"),
        heart(20, H - 24, 0.8, "#EC407A"),
        heart(W - 20, H - 24, 0.85, "#E91E63"),
      ]),
  },
  {
    id: "ice-cream",
    name: "Ice Cream",
    tag: "Sweet",
    bg: "#FFF0F6",
    pattern: (id) => dots(id, "#FFF0F6", "#FF80AB", 13),
    border: "#FF80AB",
    ink: "#C2185B",
    accent: "#FF80AB",
    decor: (W, H) =>
      corners(W, H, [
        heart(20, 20, 0.85, "#FF80AB"),
        bow(W - 20, 20, 0.85, "#FF80AB"),
        bow(20, H - 24, 0.8, "#F48FB1"),
        heart(W - 20, H - 24, 0.8, "#FF80AB"),
      ]),
  },
  {
    id: "citrus-zest",
    name: "Citrus Zest",
    tag: "Fun",
    bg: "#FFFDE7",
    pattern: (id) => gingham(id, "#FFFDE7", "#FFF59D", 16),
    border: "#FBC02D",
    ink: "#F57F17",
    accent: "#FFEE58",
    decor: (W, H) =>
      corners(W, H, [
        star(20, 20, 0.95, "#FBC02D"),
        star(W - 20, 22, 0.9, "#FFEE58"),
        star(20, H - 24, 0.85, "#F9A825"),
        star(W - 20, H - 24, 0.9, "#FBC02D"),
      ]),
  },
  {
    id: "polaroid-pink",
    name: "Polaroid Pink",
    tag: "Film",
    bg: "#FFF5F8",
    pattern: (id) => dots(id, "#FFF5F8", "#F8BBD0", 18),
    border: "#FF8FB5",
    ink: "#8B2A50",
    accent: "#FFB6C8",
    decor: (W, H) =>
      corners(W, H, [
        tape(36, 14, -12, "#FFB6C8"),
        tape(W - 36, 14, 10, "#FFD6E8"),
        tape(36, H - 16, 8, "#FFD6E8"),
        tape(W - 36, H - 16, -8, "#FFB6C8"),
        heart(W / 2, H - 18, 0.45, "#FF8FB5"),
      ]),
  },
  {
    id: "polaroid-mint",
    name: "Polaroid Mint",
    tag: "Film",
    bg: "#F0FFF8",
    pattern: (id) => dots(id, "#F0FFF8", "#A5D6A7", 18),
    border: "#66BB6A",
    ink: "#1B5E20",
    accent: "#A5D6A7",
    decor: (W, H) =>
      corners(W, H, [
        tape(36, 14, -10, "#A5D6A7"),
        tape(W - 36, 14, 12, "#C8E6C9"),
        tape(36, H - 16, 10, "#C8E6C9"),
        tape(W - 36, H - 16, -8, "#A5D6A7"),
      ]),
  },
  {
    id: "gingham-heart",
    name: "Gingham Heart",
    tag: "Classic Cute",
    bg: "#FFE4EC",
    pattern: (id) => gingham(id, "#FFE4EC", "#FFB6C8", 15),
    border: "#E91E63",
    ink: "#880E4F",
    accent: "#F48FB1",
    decor: (W, H) =>
      corners(W, H, [
        heart(20, 20, 0.85, "#E91E63"),
        heart(W - 20, 20, 0.85, "#E91E63"),
        heart(20, H - 24, 0.8, "#F06292"),
        heart(W - 20, H - 24, 0.8, "#F06292"),
      ]),
  },
];

function buildFrame(design, shots) {
  const { W, H, padX, padTop, gap, holeW, holeH, r } = layout(shots);
  const pid = `pat_${design.id}_${shots}`;
  const slots = [];
  let holes = "";

  for (let i = 0; i < shots; i++) {
    const y = padTop + i * (holeH + gap);
    // White = photo hole (punched to alpha). Double border = polish.
    holes += `
      <rect x="${padX}" y="${y}" width="${holeW}" height="${holeH}" rx="${r}" ry="${r}" fill="#FFFFFF"/>
      <rect x="${padX}" y="${y}" width="${holeW}" height="${holeH}" rx="${r}" ry="${r}" fill="none" stroke="${design.border}" stroke-width="8"/>
      <rect x="${padX + 4}" y="${y + 4}" width="${holeW - 8}" height="${holeH - 8}" rx="${Math.max(6, r - 5)}" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.65"/>
    `;
    slots.push({
      x: +((padX / W) * 100).toFixed(2),
      y: +((y / H) * 100).toFixed(2),
      w: +((holeW / W) * 100).toFixed(2),
      h: +((holeH / H) * 100).toFixed(2),
    });
  }

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>${design.pattern(pid)}</defs>
  <rect width="100%" height="100%" rx="28" fill="url(#${pid})"/>
  <rect x="5" y="5" width="${W - 10}" height="${H - 10}" rx="24" fill="none" stroke="${design.border}" stroke-width="3" opacity="0.4"/>
  ${holes}
  ${design.decor(W, H)}
  <text x="${W / 2}" y="${H - 14}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="15" font-weight="700" fill="${design.ink}" opacity="0.85" letter-spacing="0.5">${design.name}</text>
</svg>`;

  return { svg, slots, W, H };
}

async function punchWhite(src, dest) {
  const { data, info } = await sharp(src)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (let i = 0; i < info.width * info.height; i++) {
    const o = i * info.channels;
    const r = data[o];
    const g = data[o + 1];
    const b = data[o + 2];
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

// ── clean slate: delete ALL old by-count frames ──
for (const n of [2, 3, 4, 6]) {
  fs.rmSync(path.join(ROOT, String(n)), { recursive: true, force: true });
}
for (const n of [2, 3, 4]) {
  fs.mkdirSync(path.join(ROOT, String(n)), { recursive: true });
}

const catalog = [];

for (const design of DESIGNS) {
  for (const shots of [2, 3, 4]) {
    const id = `ky-${shots}s-${design.id}`;
    const { svg, slots } = buildFrame(design, shots);
    const dir = path.join(ROOT, String(shots));
    const raw = path.join(dir, `${id}-raw.png`);
    const dest = path.join(dir, `${id}.png`);

    await sharp(Buffer.from(svg)).png().toFile(raw);
    await punchWhite(raw, dest);
    await sharp(raw)
      .resize({ width: 280 })
      .jpeg({ quality: 90 })
      .toFile(path.join(dir, `${id}-thumb.jpg`));
    fs.unlinkSync(raw);

    if (slots[0].w < 90) {
      console.warn("⚠ small hole", id, slots[0].w);
    }

    catalog.push({
      id,
      name: design.name,
      tag: design.tag,
      shots,
      overlay: `/frames/by-count/${shots}/${id}.png`,
      thumb: `/frames/by-count/${shots}/${id}-thumb.jpg`,
      slots,
      bg: design.bg,
      ink: design.ink,
      accent: design.accent,
    });
    console.log("✓", id, `w=${slots[0].w}% h=${slots[0].h.toFixed(1)}%`);
  }
}

catalog.sort((a, b) => a.shots - b.shots || a.name.localeCompare(b.name));
fs.writeFileSync(CATALOG, JSON.stringify(catalog, null, 2));

const sample = catalog[0].slots[0];
console.log("\nDONE", catalog.length, "frames");
console.log(
  "counts:",
  [2, 3, 4].map((n) => `${n}=${catalog.filter((c) => c.shots === n).length}`).join(" "),
);
console.log("sample slot:", sample, "(expect w~93%)");
if (sample.w < 90) {
  console.error("FAIL: holes still too small");
  process.exit(1);
}
