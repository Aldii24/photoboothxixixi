/**
 * Premium adaptive frames from full designed overlay PNGs.
 *
 * TRUE adaptation for any photo count (2/3/4/6):
 *   [header band] + [window unit × N] + [footer band]
 * sliced from the same overlay art so it always looks designed —
 * never leave an empty bottom hole, never drop the logo text.
 */

export type PhotoShape = "rect" | "rounded" | "oval" | "heart" | "scallop";

export type SlotRect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type FrameDecoration = {
  src: string;
  x: number;
  y: number;
  size: number;
  rotate?: number;
  opacity?: number;
};

export type AdaptiveFrameTemplate = {
  id: string;
  name: string;
  tag: string;
  tier: "premium";
  bg: string;
  fullOverlay: string;
  designSlots: number;
  /** Detected hole rects in original 9:16 overlay (%) */
  overlaySlots: SlotRect[];
  bgImage?: string;
  bgImageMode?: "tile" | "cover";
  bgImageSize?: string;
  photoShape: PhotoShape;
  ink: string;
  footerDefault: string;
  accent: string;
};

const O = (name: string) => `/frames/overlays/${name}`;
const PAT = (name: string) => `/frames/patterns/${name}`;

function expand(slots: SlotRect[], pad = 0.4): SlotRect[] {
  return slots.map((s) => ({
    x: Math.max(0, s.x - pad),
    y: Math.max(0, s.y - pad),
    w: Math.min(100 - Math.max(0, s.x - pad), s.w + pad * 2),
    h: Math.min(100 - Math.max(0, s.y - pad), s.h + pad * 2),
  }));
}

/** Auto-detected holes (reprocessed overlays) */
const HOLES_LUCKY_CHARM = expand([
  { x: 26.53, y: 12.42, w: 47.64, h: 21.64 },
  { x: 26.53, y: 38.13, w: 47.64, h: 21.72 },
  { x: 26.53, y: 63.83, w: 47.64, h: 21.64 },
]);

const HOLES_BLISS_POP = expand([
  { x: 35.97, y: 24.92, w: 28.19, h: 13.91 },
  { x: 35.97, y: 43.44, w: 28.19, h: 13.91 },
  { x: 35.97, y: 61.95, w: 28.19, h: 13.98 },
]);

const HOLES_BERRY = expand([
  { x: 24.72, y: 20.0, w: 50.42, h: 18.36 },
  { x: 24.72, y: 42.66, w: 50.42, h: 18.28 },
  { x: 24.72, y: 65.23, w: 50.42, h: 19.77 },
]);

const HOLES_GARDEN = expand([
  { x: 28.89, y: 11.64, w: 42.64, h: 16.41 },
  { x: 28.75, y: 31.25, w: 42.78, h: 16.41 },
  { x: 28.75, y: 50.86, w: 42.78, h: 16.41 },
  { x: 28.89, y: 70.47, w: 42.5, h: 16.41 },
]);

const HOLES_KYOWO = expand([
  { x: 27.22, y: 10.47, w: 45.83, h: 16.25 },
  { x: 27.22, y: 30.31, w: 45.83, h: 16.25 },
  { x: 27.22, y: 50.16, w: 45.83, h: 16.25 },
  { x: 27.22, y: 70.0, w: 45.83, h: 16.25 },
]);

const HOLES_MIRROR = expand([
  { x: 33.19, y: 5.78, w: 34.03, h: 18.52 },
  { x: 31.39, y: 27.81, w: 37.64, h: 17.03 },
  { x: 29.72, y: 49.3, w: 41.25, h: 16.02 },
  { x: 30.42, y: 69.77, w: 39.72, h: 15.39 },
]);

const HOLES_GARDEN_MINT = expand([
  { x: 27.36, y: 9.45, w: 45.83, h: 16.17 },
  { x: 27.36, y: 29.84, w: 45.83, h: 16.09 },
  { x: 27.36, y: 50.08, w: 45.83, h: 16.17 },
  { x: 27.36, y: 70.39, w: 45.83, h: 16.09 },
]);

const HOLES_COQUETTE = expand([
  { x: 28.47, y: 9.14, w: 43.47, h: 16.88 },
  { x: 28.61, y: 30.39, w: 43.33, h: 16.88 },
  { x: 28.47, y: 51.64, w: 43.47, h: 16.95 },
  { x: 28.47, y: 73.05, w: 43.47, h: 16.33 },
]);

const HOLES_NIGHT = expand([
  { x: 29.17, y: 10.47, w: 41.53, h: 15.55 },
  { x: 29.17, y: 28.75, w: 41.39, h: 15.55 },
  { x: 29.17, y: 47.03, w: 41.53, h: 15.55 },
  { x: 29.17, y: 65.31, w: 41.53, h: 15.55 },
]);

const HOLES_HAPPY = expand([
  { x: 9.03, y: 4.69, w: 70.28, h: 27.03 },
  { x: 14.31, y: 37.11, w: 72.22, h: 26.8 },
  { x: 14.17, y: 68.59, w: 73.61, h: 26.72 },
]);

export type FrameLayoutMode = "full" | "assemble";

export type FrameLayout = {
  mode: FrameLayoutMode;
  /** Photo holes in the FINAL strip (% of composed strip) */
  slots: SlotRect[];
  /** Original overlay % bands */
  headerEnd: number;
  /** First window unit top in original % */
  unitTop: number;
  /** Window unit height in original % (hole + gap) */
  unitH: number;
  /** Hole position inside unit (relative 0–unitH → stored as % of original for math) */
  holeInUnit: { x: number; y: number; w: number; h: number };
  /** Footer start in original % */
  footerStart: number;
  /** Total original-% height of composed strip */
  totalH: number;
  /** Fractions of composed strip */
  headerFrac: number;
  unitFrac: number;
  footerFrac: number;
  n: number;
};

/**
 * Build adaptive layout from a designed overlay for ANY n photos.
 * Slices: [header] + [window unit × n] + [footer with logo text]
 */
export function resolveSlots(
  template: AdaptiveFrameTemplate,
  shotCount: number,
  _orientation: "vertical" | "horizontal" | "grid" = "vertical",
): FrameLayout {
  const holes = template.overlaySlots;
  const design = template.designSlots;
  const n = Math.max(1, Math.min(shotCount, 8));

  // Geometry from first / consecutive holes
  const h0 = holes[0];
  const hLast = holes[design - 1] ?? holes[holes.length - 1];

  // Gap between design holes (or sensible default)
  let gap = 2.2;
  if (holes.length >= 2) {
    gap = holes[1].y - (holes[0].y + holes[0].h);
    if (gap < 0.5) gap = 2.2;
  }

  const headerEnd = Math.max(0.5, h0.y - gap * 0.45);
  const unitTop = headerEnd;
  const unitH = h0.h + gap;
  const footerStart = Math.min(98, hLast.y + hLast.h + gap * 0.45);
  const footerH = Math.max(5, 100 - footerStart);

  const totalH = headerEnd + n * unitH + footerH;
  const headerFrac = headerEnd / totalH;
  const unitFrac = unitH / totalH;
  const footerFrac = footerH / totalH;

  // Hole rect inside each unit, then map to final strip %
  const holeInUnit = {
    x: h0.x,
    y: h0.y - unitTop, // relative to unit top (original %)
    w: h0.w,
    h: h0.h,
  };

  const slots: SlotRect[] = Array.from({ length: n }, (_, i) => {
    // unit i occupies [headerEnd + i*unitH, headerEnd + (i+1)*unitH) in original-units
    // final y% = (headerEnd + i*unitH + holeInUnit.y) / totalH * 100
    return {
      x: holeInUnit.x,
      w: holeInUnit.w,
      y: ((headerEnd + i * unitH + holeInUnit.y) / totalH) * 100,
      h: (holeInUnit.h / totalH) * 100,
    };
  });

  // Exact full design when counts match — still use assemble for consistency
  // (assemble with n===design reproduces original proportions)
  const mode: FrameLayoutMode =
    n === design && Math.abs(totalH - 100) < 0.8 ? "full" : "assemble";

  // When n===design, prefer full image for pixel-perfect art
  if (n === design) {
    return {
      mode: "full",
      slots: holes.slice(0, n).map((s) => ({ ...s })),
      headerEnd,
      unitTop,
      unitH,
      holeInUnit,
      footerStart,
      totalH: 100,
      headerFrac: headerEnd / 100,
      unitFrac: unitH / 100,
      footerFrac: footerH / 100,
      n,
    };
  }

  return {
    mode: "assemble",
    slots,
    headerEnd,
    unitTop,
    unitH,
    holeInUnit,
    footerStart,
    totalH,
    headerFrac,
    unitFrac,
    footerFrac,
    n,
  };
}

export const ADAPTIVE_FRAMES: AdaptiveFrameTemplate[] = [
  {
    id: "lucky-charm",
    name: "Lucky Charm",
    tag: "Heart · Gingham",
    tier: "premium",
    bg: "#F5E06A",
    fullOverlay: O("lucky-charm.png"),
    designSlots: 3,
    overlaySlots: HOLES_LUCKY_CHARM,
    bgImage: PAT("gingham-yellow.jpg"),
    bgImageMode: "tile",
    bgImageSize: "18%",
    photoShape: "heart",
    ink: "#E83D7A",
    footerDefault: "Lucky Charm",
    accent: "#FF8FB5",
  },
  {
    id: "bliss-pop",
    name: "Bliss Pop!",
    tag: "Y2K · Heart",
    tier: "premium",
    bg: "#A8D8FF",
    fullOverlay: O("bliss-pop.png"),
    designSlots: 3,
    overlaySlots: HOLES_BLISS_POP,
    bgImage: PAT("checker-blue.jpg"),
    bgImageMode: "tile",
    bgImageSize: "18%",
    photoShape: "heart",
    ink: "#FF2E8A",
    footerDefault: "Bliss Pop",
    accent: "#6BB0FF",
  },
  {
    id: "garden-bloom",
    name: "Garden Bloom",
    tag: "Floral",
    tier: "premium",
    bg: "#FFF0F5",
    fullOverlay: O("garden-bloom.png"),
    designSlots: 4,
    overlaySlots: HOLES_GARDEN,
    photoShape: "rounded",
    ink: "#C45C7A",
    footerDefault: "Photo Booth",
    accent: "#FF8FB5",
  },
  {
    id: "berry-cafe",
    name: "Berry Cafe",
    tag: "Strawberry",
    tier: "premium",
    bg: "#FFD0E4",
    fullOverlay: O("berry-cafe.png"),
    designSlots: 3,
    overlaySlots: HOLES_BERRY,
    photoShape: "rounded",
    ink: "#D44878",
    footerDefault: "so berry sweet",
    accent: "#FF5C9A",
  },
  {
    id: "mirror-mood",
    name: "Mirror Mood",
    tag: "Coquette",
    tier: "premium",
    bg: "#FFC8DC",
    fullOverlay: O("mirror-mood.png"),
    designSlots: 4,
    overlaySlots: HOLES_MIRROR,
    photoShape: "oval",
    ink: "#5c2a45",
    footerDefault: "Mirror Mood",
    accent: "#FF8FB5",
  },
  {
    id: "kyowo-cat",
    name: "Kyowo Cat",
    tag: "Cat",
    tier: "premium",
    bg: "#FFE8D0",
    fullOverlay: O("kyowo-cat.png"),
    designSlots: 4,
    overlaySlots: HOLES_KYOWO,
    bgImage: PAT("gingham-yellow.jpg"),
    bgImageMode: "tile",
    bgImageSize: "18%",
    photoShape: "rounded",
    ink: "#E85A8C",
    footerDefault: "Kyowo Cat",
    accent: "#FFB86B",
  },
  {
    id: "lucky-garden",
    name: "Lucky Garden",
    tag: "Mint",
    tier: "premium",
    bg: "#B8F0C8",
    fullOverlay: O("lucky-garden.png"),
    designSlots: 4,
    overlaySlots: HOLES_GARDEN_MINT,
    photoShape: "rounded",
    ink: "#2b5c40",
    footerDefault: "Lucky Garden",
    accent: "#6BCB77",
  },
  {
    id: "coquette-xoxo",
    name: "Coquette xoxo",
    tag: "Bow",
    tier: "premium",
    bg: "#FFE8F0",
    fullOverlay: O("coquette-xoxo.png"),
    designSlots: 4,
    overlaySlots: HOLES_COQUETTE,
    photoShape: "rounded",
    ink: "#5c2a45",
    footerDefault: "xoxo",
    accent: "#FF5C9A",
  },
  {
    id: "night-meow",
    name: "Night Meow",
    tag: "Dark Cat",
    tier: "premium",
    bg: "#151528",
    fullOverlay: O("night-meow.png"),
    designSlots: 4,
    overlaySlots: HOLES_NIGHT,
    photoShape: "rounded",
    ink: "#FFE0F0",
    footerDefault: "Night Meow",
    accent: "#C9B6FF",
  },
  {
    id: "happy-day",
    name: "Happy Day",
    tag: "Fun",
    tier: "premium",
    bg: "#FFE566",
    fullOverlay: O("happy-day.png"),
    designSlots: 3,
    overlaySlots: HOLES_HAPPY,
    bgImage: PAT("gingham-yellow.jpg"),
    bgImageMode: "tile",
    bgImageSize: "18%",
    photoShape: "scallop",
    ink: "#1E5A8A",
    footerDefault: "Happy Day",
    accent: "#5B9DFF",
  },
];
