export type TimerOption = 3 | 5 | 10;

export type GridOverlay = {
  id: string;
  name: string;
  cols: number;
  rows: number;
};

export type BeautyFilter = {
  id: string;
  name: string;
  emoji: string;
  css: string;
  glow?: string;
  soft?: number;
};

export type ShotCount = 2 | 3 | 4;

export type LayoutOrientation = "vertical" | "horizontal" | "grid";

export type LayoutPreset = {
  id: string;
  name: string;
  shots: ShotCount;
  gridClass: string;
  orientation: LayoutOrientation;
  icon: "v-strip" | "h-strip" | "grid-2x2" | "grid-3" | "grid-2x3" | "v-tight";
};

export type FrameColor = {
  id: string;
  name: string;
  color: string;
};

export type PhotoShape = "rect" | "rounded" | "oval" | "heart" | "scallop";

export type BgPattern =
  | "solid"
  | "gingham"
  | "checker"
  | "dots"
  | "stripes"
  | "stars"
  | "hearts-bg";

export type FrameDecoration = {
  src: string;
  x: number;
  y: number;
  size: number;
  rotate?: number;
  opacity?: number;
  flipX?: boolean;
};

export type FrameTemplate = {
  id: string;
  name: string;
  tag: string;
  bg: string;
  ink: string;
  pattern: BgPattern;
  /** secondary pattern color */
  patternColor?: string;
  photoShape: PhotoShape;
  photoBorder?: string;
  photoBorderWidth?: number;
  photoBorderStyle?: "solid" | "pearl" | "dashed" | "double";
  /** decorative title badge at top */
  badge?: string;
  badgeColor?: string;
  decorations: FrameDecoration[];
  footerDefault?: string;
  accent: string;
};

export type StickerDef = {
  id: string;
  label: string;
  src: string;
};

export type FooterFont = {
  id: string;
  name: string;
  /** CSS font-family value */
  family: string;
  /** tailwind-ish preview class using CSS var */
  className: string;
};

export const TIMER_OPTIONS: TimerOption[] = [3, 5, 10];

export const GRID_OVERLAYS: GridOverlay[] = [
  { id: "none", name: "Off", cols: 0, rows: 0 },
  { id: "rule3", name: "Rule of 3", cols: 3, rows: 3 },
  { id: "center", name: "Center", cols: 2, rows: 2 },
  { id: "portrait", name: "Portrait", cols: 3, rows: 4 },
  { id: "dense", name: "Dense", cols: 4, rows: 4 },
];

export const BEAUTY_FILTERS: BeautyFilter[] = [
  { id: "none", name: "Original", emoji: "○", css: "none" },
  {
    id: "soft-glow",
    name: "Soft Glow",
    emoji: "✦",
    css: "brightness(1.08) contrast(0.96) saturate(1.05)",
    glow: "rgba(255, 220, 230, 0.22)",
    soft: 0.6,
  },
  {
    id: "porcelain",
    name: "Porcelain",
    emoji: "○",
    css: "brightness(1.12) contrast(0.92) saturate(0.92)",
    glow: "rgba(255, 245, 250, 0.28)",
    soft: 1.1,
  },
  {
    id: "peach",
    name: "Peach Skin",
    emoji: "○",
    css: "brightness(1.06) contrast(1.02) saturate(1.15) sepia(0.12) hue-rotate(-8deg)",
    glow: "rgba(255, 200, 180, 0.18)",
    soft: 0.7,
  },
  {
    id: "rosy",
    name: "Rosy Cheek",
    emoji: "○",
    css: "brightness(1.07) contrast(1.04) saturate(1.2) hue-rotate(-12deg)",
    glow: "rgba(255, 160, 180, 0.16)",
    soft: 0.5,
  },
  {
    id: "fresh",
    name: "Fresh Dew",
    emoji: "○",
    css: "brightness(1.1) contrast(1.05) saturate(1.08) hue-rotate(8deg)",
    glow: "rgba(200, 240, 255, 0.15)",
    soft: 0.4,
  },
  {
    id: "fairy",
    name: "Fairy Light",
    emoji: "○",
    css: "brightness(1.14) contrast(0.94) saturate(1.12)",
    glow: "rgba(255, 230, 255, 0.25)",
    soft: 0.9,
  },
  {
    id: "cinema",
    name: "Cinema Soft",
    emoji: "○",
    css: "brightness(1.02) contrast(1.08) saturate(0.95) sepia(0.08)",
    glow: "rgba(255, 220, 180, 0.1)",
    soft: 0.35,
  },
  {
    id: "doll",
    name: "Doll Eye",
    emoji: "○",
    css: "brightness(1.1) contrast(1.06) saturate(1.18)",
    glow: "rgba(255, 200, 220, 0.2)",
    soft: 0.8,
  },
  {
    id: "natural-beauty",
    name: "Natural Pretty",
    emoji: "○",
    css: "brightness(1.05) contrast(1.03) saturate(1.1)",
    glow: "rgba(255, 240, 230, 0.12)",
    soft: 0.45,
  },
  {
    id: "cool-tone",
    name: "Cool Tone",
    emoji: "○",
    css: "brightness(1.06) contrast(1.04) saturate(0.95) hue-rotate(12deg)",
    glow: "rgba(200, 220, 255, 0.14)",
    soft: 0.4,
  },
  {
    id: "golden",
    name: "Golden Hour",
    emoji: "○",
    css: "brightness(1.08) contrast(1.05) saturate(1.25) sepia(0.2)",
    glow: "rgba(255, 200, 120, 0.16)",
    soft: 0.35,
  },
];

export const FOOTER_FONTS: FooterFont[] = [
  {
    id: "script",
    name: "Script",
    family: "var(--font-script), cursive",
    className: "font-[family-name:var(--font-script)]",
  },
  {
    id: "hand",
    name: "Handwrite",
    family: "var(--font-hand), cursive",
    className: "font-[family-name:var(--font-hand)]",
  },
  {
    id: "display",
    name: "Bubble",
    family: "var(--font-display), sans-serif",
    className: "font-[family-name:var(--font-display)]",
  },
  {
    id: "rounded",
    name: "Rounded",
    family: "var(--font-rounded), sans-serif",
    className: "font-[family-name:var(--font-rounded)]",
  },
  {
    id: "serif",
    name: "Elegant",
    family: "var(--font-serif), serif",
    className: "font-[family-name:var(--font-serif)]",
  },
  {
    id: "sans",
    name: "Clean",
    family: "var(--font-body), sans-serif",
    className: "font-[family-name:var(--font-body)]",
  },
];

export const LAYOUT_PRESETS: LayoutPreset[] = [
  // 2
  {
    id: "2-v",
    name: "Vertikal",
    shots: 2,
    gridClass: "grid-cols-1 grid-rows-2",
    orientation: "vertical",
    icon: "v-strip",
  },
  {
    id: "2-h",
    name: "Horizontal",
    shots: 2,
    gridClass: "grid-cols-2 grid-rows-1",
    orientation: "horizontal",
    icon: "h-strip",
  },
  // 3
  {
    id: "3-v",
    name: "Strip vertikal",
    shots: 3,
    gridClass: "grid-cols-1 grid-rows-3",
    orientation: "vertical",
    icon: "v-strip",
  },
  {
    id: "3-mix",
    name: "Mix (1 besar)",
    shots: 3,
    gridClass: "grid-cols-2 grid-rows-2 [&>:first-child]:row-span-2",
    orientation: "grid",
    icon: "grid-3",
  },
  {
    id: "3-h",
    name: "Horizontal",
    shots: 3,
    gridClass: "grid-cols-3 grid-rows-1",
    orientation: "horizontal",
    icon: "h-strip",
  },
  // 4
  {
    id: "4-v",
    name: "Strip klasik",
    shots: 4,
    gridClass: "grid-cols-1 grid-rows-4",
    orientation: "vertical",
    icon: "v-strip",
  },
  {
    id: "4-v-tight",
    name: "Strip rapat",
    shots: 4,
    gridClass: "grid-cols-1 grid-rows-4 gap-1",
    orientation: "vertical",
    icon: "v-tight",
  },
  {
    id: "4-2x2",
    name: "Grid 2×2",
    shots: 4,
    gridClass: "grid-cols-2 grid-rows-2",
    orientation: "grid",
    icon: "grid-2x2",
  },
  {
    id: "4-h",
    name: "Horizontal",
    shots: 4,
    gridClass: "grid-cols-4 grid-rows-1",
    orientation: "horizontal",
    icon: "h-strip",
  },
  // 6
];

export function layoutsForShots(shots: number): LayoutPreset[] {
  return LAYOUT_PRESETS.filter((l) => l.shots === shots);
}

export const FRAME_COLORS: FrameColor[] = [
  { id: "white", name: "Putih", color: "#FFFFFF" },
  { id: "black", name: "Hitam", color: "#1A1A1A" },
  { id: "pink", name: "Pink", color: "#FFB6C8" },
  { id: "rose", name: "Rose", color: "#FF8FB5" },
  { id: "hot", name: "Hot Pink", color: "#FF5C9A" },
  { id: "sky", name: "Sky", color: "#A8D4FF" },
  { id: "lavender", name: "Lavender", color: "#C9B6FF" },
  { id: "yellow", name: "Kuning", color: "#FFE566" },
  { id: "peach", name: "Peach", color: "#FFD0A8" },
  { id: "mint", name: "Mint", color: "#B8F0D0" },
  { id: "green", name: "Hijau", color: "#8FE3C0" },
  { id: "gray", name: "Abu", color: "#B0B0B0" },
  { id: "brown", name: "Coklat", color: "#6B3F2A" },
  { id: "navy", name: "Navy", color: "#1E3A5F" },
  { id: "wine", name: "Wine", color: "#8B1E3F" },
  { id: "blush", name: "Blush", color: "#FFD6E0" },
  { id: "cream", name: "Cream", color: "#FFF6E9" },
  { id: "chocolate", name: "Coklat tua", color: "#3D2314" },
];

const P = (name: string) => `/stickers/png/${name}`;

/** Rich, designed frame templates — denser décor like real photobooth frames */
export const FRAME_TEMPLATES: FrameTemplate[] = [
  {
    id: "plain",
    name: "Polos",
    tag: "Basic",
    bg: "#FFFFFF",
    ink: "#2b2430",
    pattern: "solid",
    photoShape: "rounded",
    accent: "#FFB6C8",
    decorations: [],
    footerDefault: "PhotoBox",
  },
  {
    id: "lucky-charm",
    name: "Lucky Charm",
    tag: "Heart",
    bg: "#FFF6C8",
    ink: "#E85A8C",
    pattern: "gingham",
    patternColor: "#FFE08A",
    photoShape: "heart",
    photoBorder: "#FF8FB5",
    photoBorderWidth: 4,
    photoBorderStyle: "solid",
    badge: "Hello!",
    badgeColor: "#FF8FB5",
    accent: "#FF8FB5",
    footerDefault: "Lucky Charm",
    decorations: [
      { src: P("strawberry.png"), x: 88, y: 6, size: 16, rotate: 12 },
      { src: P("clover.png"), x: 10, y: 22, size: 14, rotate: -15 },
      { src: P("star.png"), x: 90, y: 38, size: 12, rotate: 20 },
      { src: P("clover.png"), x: 12, y: 55, size: 13, rotate: 10 },
      { src: P("star.png"), x: 10, y: 78, size: 11, rotate: -12 },
      { src: P("strawberry.png"), x: 88, y: 88, size: 15, rotate: -8 },
      { src: P("star.png"), x: 18, y: 92, size: 10, rotate: 15 },
    ],
  },
  {
    id: "garden-bloom",
    name: "Garden Bloom",
    tag: "Floral",
    bg: "#FFF5F8",
    ink: "#C45C7A",
    pattern: "solid",
    photoShape: "rounded",
    photoBorder: "#FFB6C8",
    photoBorderWidth: 3,
    accent: "#FF8FB5",
    footerDefault: "bloom baby",
    decorations: [
      { src: P("sakura.png"), x: 12, y: 5, size: 14, rotate: -12 },
      { src: P("flower-bouquet.png"), x: 88, y: 8, size: 18, rotate: 10 },
      { src: P("sakura-alt.png"), x: 90, y: 28, size: 13, rotate: -8 },
      { src: P("tulip.png"), x: 10, y: 40, size: 14, rotate: 8 },
      { src: P("sakura.png"), x: 88, y: 52, size: 12, rotate: 18 },
      { src: P("flower-bouquet.png"), x: 12, y: 70, size: 16, rotate: -10 },
      { src: P("sakura-alt.png"), x: 50, y: 94, size: 20, rotate: 0 },
      { src: P("yellow-rose.png"), x: 88, y: 85, size: 13, rotate: 12 },
    ],
  },
  {
    id: "berry-shortcake",
    name: "Berry Shortcake",
    tag: "Strawberry",
    bg: "#FFE0EC",
    ink: "#D44878",
    pattern: "dots",
    patternColor: "#FFB6C8",
    photoShape: "rounded",
    photoBorder: "#FFFFFF",
    photoBorderWidth: 4,
    badge: "Strawberry ♡",
    badgeColor: "#FF5C9A",
    accent: "#FF5C9A",
    footerDefault: "so berry sweet",
    decorations: [
      { src: P("strawberry.png"), x: 12, y: 8, size: 16, rotate: -12 },
      { src: P("strawberry.png"), x: 90, y: 18, size: 14, rotate: 15 },
      { src: P("cat-strawberry.png"), x: 88, y: 45, size: 20, rotate: 5 },
      { src: P("pink-bow.png"), x: 12, y: 55, size: 14, rotate: -10 },
      { src: P("strawberry.png"), x: 14, y: 82, size: 15, rotate: 8 },
      { src: P("heart.png"), x: 88, y: 78, size: 12, rotate: -8 },
      { src: P("cat-calico.png"), x: 78, y: 92, size: 18, rotate: 0 },
    ],
  },
  {
    id: "bliss-pop",
    name: "Bliss Pop",
    tag: "Y2K",
    bg: "#E8F4FF",
    ink: "#FF5C9A",
    pattern: "checker",
    patternColor: "#FFFFFF",
    photoShape: "heart",
    photoBorder: "#FF8FB5",
    photoBorderWidth: 4,
    badge: "Bliss Pop!",
    badgeColor: "#6BB0FF",
    accent: "#6BB0FF",
    footerDefault: "bliss pop",
    decorations: [
      { src: P("star.png"), x: 12, y: 6, size: 13, rotate: -15 },
      { src: P("star-glitter.png"), x: 88, y: 8, size: 14, rotate: 20 },
      { src: P("balloon-dog.png"), x: 12, y: 40, size: 16, rotate: -8 },
      { src: P("flip-phone.png"), x: 90, y: 55, size: 15, rotate: 12 },
      { src: P("heart.png"), x: 14, y: 72, size: 12, rotate: 10 },
      { src: P("star.png"), x: 88, y: 80, size: 12, rotate: -12 },
      { src: P("balloon-dog.png"), x: 80, y: 94, size: 16, rotate: 5 },
    ],
  },
  {
    id: "mirror-mood",
    name: "Mirror Mood",
    tag: "Coquette",
    bg: "#FFD6E8",
    ink: "#5c2a45",
    pattern: "solid",
    photoShape: "heart",
    photoBorder: "#FFFFFF",
    photoBorderWidth: 4,
    photoBorderStyle: "pearl",
    accent: "#FF8FB5",
    footerDefault: "Mirror Mood",
    decorations: [
      { src: P("black-bow.png"), x: 50, y: 5, size: 22, rotate: 0 },
      { src: P("black-bow.png"), x: 78, y: 22, size: 14, rotate: 18 },
      { src: P("black-bow.png"), x: 22, y: 48, size: 14, rotate: -16 },
      { src: P("black-bow.png"), x: 80, y: 55, size: 12, rotate: 10 },
      { src: P("heart.png"), x: 12, y: 30, size: 10, rotate: -12 },
      { src: P("heart.png"), x: 90, y: 70, size: 10, rotate: 12 },
      { src: P("pearls.png"), x: 50, y: 96, size: 28, rotate: 0, opacity: 0.9 },
    ],
  },
  {
    id: "clover-garden",
    name: "Clover Garden",
    tag: "Garden",
    bg: "#C8F0D4",
    ink: "#2b5c40",
    pattern: "dots",
    patternColor: "#A8E0BC",
    photoShape: "rounded",
    photoBorder: "#FFFFFF",
    photoBorderWidth: 3,
    accent: "#6BCB77",
    footerDefault: "lucky day",
    decorations: [
      { src: P("bee.png"), x: 8, y: 4, size: 18, rotate: -12 },
      { src: P("clover.png"), x: 88, y: 6, size: 16, rotate: 15 },
      { src: P("clover-girl.png"), x: 10, y: 38, size: 22, rotate: -6 },
      { src: P("clover.png"), x: 90, y: 48, size: 14, rotate: 20 },
      { src: P("yellow-rose.png"), x: 10, y: 68, size: 16, rotate: 8 },
      { src: P("clover-girl.png"), x: 88, y: 90, size: 20, rotate: 5 },
      { src: P("clover.png"), x: 12, y: 92, size: 14, rotate: -10 },
    ],
  },
  {
    id: "butterfly-dream",
    name: "Butterfly Dream",
    tag: "Fairy",
    bg: "#FFFFFF",
    ink: "#6B4C9A",
    pattern: "stars",
    patternColor: "#E8D4FF",
    photoShape: "rounded",
    photoBorder: "#E0C8FF",
    photoBorderWidth: 3,
    accent: "#C9B6FF",
    footerDefault: "fly free",
    decorations: [
      { src: P("pink-butterfly.png"), x: 10, y: 6, size: 16, rotate: -20 },
      { src: P("star.png"), x: 88, y: 5, size: 12, rotate: 15 },
      { src: P("blue-butterfly.png"), x: 92, y: 18, size: 14, rotate: 25 },
      { src: P("pink-butterfly.png"), x: 8, y: 35, size: 13, rotate: 15 },
      { src: P("blue-butterfly.png"), x: 90, y: 48, size: 15, rotate: -12 },
      { src: P("pink-butterfly.png"), x: 88, y: 70, size: 14, rotate: 18 },
      { src: P("blue-butterfly.png"), x: 12, y: 82, size: 13, rotate: -15 },
      { src: P("star.png"), x: 50, y: 96, size: 12, rotate: 0 },
    ],
  },
  // —— CAT KYOWO SERIES ——
  {
    id: "cat-kyowo-cream",
    name: "Cat Kyowo Cream",
    tag: "Cat",
    bg: "#FFF8F0",
    ink: "#C45C7A",
    pattern: "gingham",
    patternColor: "#FFE8D4",
    photoShape: "rounded",
    photoBorder: "#FFB6C8",
    photoBorderWidth: 4,
    badge: "meow ♡",
    badgeColor: "#FF8FB5",
    accent: "#FFB86B",
    footerDefault: "kyowo cat",
    decorations: [
      { src: P("cat-white-face.png"), x: 12, y: 6, size: 20, rotate: -8 },
      { src: P("cat-orange.png"), x: 88, y: 12, size: 18, rotate: 10 },
      { src: P("heart.png"), x: 90, y: 32, size: 11, rotate: 15 },
      { src: P("cat-calico.png"), x: 10, y: 45, size: 18, rotate: -5 },
      { src: P("cat-black-bow.png"), x: 88, y: 58, size: 17, rotate: 8 },
      { src: P("cat-grey-heart.png"), x: 12, y: 72, size: 16, rotate: -10 },
      { src: P("cat-strawberry.png"), x: 86, y: 88, size: 18, rotate: 5 },
      { src: P("pink-bow.png"), x: 50, y: 96, size: 14, rotate: 0 },
    ],
  },
  {
    id: "cat-cafe-pink",
    name: "Cat Café Pink",
    tag: "Cat",
    bg: "#FFE4F0",
    ink: "#B83D6E",
    pattern: "hearts-bg",
    patternColor: "#FFC0D8",
    photoShape: "heart",
    photoBorder: "#FFFFFF",
    photoBorderWidth: 3,
    photoBorderStyle: "pearl",
    badge: "Cat Café",
    badgeColor: "#FF5C9A",
    accent: "#FF5C9A",
    footerDefault: "cat café",
    decorations: [
      { src: P("cat-black-bow.png"), x: 50, y: 5, size: 18, rotate: 0 },
      { src: P("cat-white-face.png"), x: 12, y: 22, size: 17, rotate: -12 },
      { src: P("cat-orange.png"), x: 90, y: 35, size: 16, rotate: 12 },
      { src: P("cat-calico.png"), x: 10, y: 58, size: 17, rotate: 8 },
      { src: P("heart-gloss.png"), x: 88, y: 65, size: 12, rotate: -8 },
      { src: P("cat-grey-heart.png"), x: 86, y: 90, size: 18, rotate: 5 },
      { src: P("lips.png"), x: 14, y: 90, size: 12, rotate: -10 },
    ],
  },
  {
    id: "cat-night-meow",
    name: "Night Meow",
    tag: "Cat",
    bg: "#2A2040",
    ink: "#FFE0F0",
    pattern: "stars",
    patternColor: "#3D3060",
    photoShape: "rounded",
    photoBorder: "#FF8FB5",
    photoBorderWidth: 3,
    badge: "night meow",
    badgeColor: "#C9B6FF",
    accent: "#C9B6FF",
    footerDefault: "goodnight meow",
    decorations: [
      { src: P("cat-black-bow.png"), x: 12, y: 6, size: 18, rotate: -10 },
      { src: P("star-glitter.png"), x: 88, y: 8, size: 14, rotate: 20 },
      { src: P("cat-white-face.png"), x: 90, y: 30, size: 16, rotate: 8 },
      { src: P("star.png"), x: 10, y: 40, size: 12, rotate: -15 },
      { src: P("cat-grey-heart.png"), x: 12, y: 65, size: 16, rotate: 5 },
      { src: P("star-glitter.png"), x: 88, y: 70, size: 13, rotate: -10 },
      { src: P("cat-calico.png"), x: 50, y: 94, size: 18, rotate: 0 },
    ],
  },
  {
    id: "cat-matcha",
    name: "Matcha Cat",
    tag: "Cat",
    bg: "#E8F8E8",
    ink: "#3A6B4A",
    pattern: "gingham",
    patternColor: "#C8ECC8",
    photoShape: "rounded",
    photoBorder: "#FFFFFF",
    photoBorderWidth: 3,
    badge: "matcha cat",
    badgeColor: "#6BCB77",
    accent: "#6BCB77",
    footerDefault: "matcha mood",
    decorations: [
      { src: P("cat-orange.png"), x: 12, y: 6, size: 18, rotate: -8 },
      { src: P("clover.png"), x: 88, y: 8, size: 14, rotate: 15 },
      { src: P("cat-white-face.png"), x: 90, y: 35, size: 17, rotate: 10 },
      { src: P("bee.png"), x: 10, y: 45, size: 14, rotate: -12 },
      { src: P("cat-calico.png"), x: 12, y: 72, size: 16, rotate: 5 },
      { src: P("clover.png"), x: 88, y: 78, size: 13, rotate: -10 },
      { src: P("cat-strawberry.png"), x: 50, y: 95, size: 16, rotate: 0 },
    ],
  },
  {
    id: "peach-picnic",
    name: "Peach Picnic",
    tag: "Soft",
    bg: "#FFE0C8",
    ink: "#5c3a2a",
    pattern: "dots",
    patternColor: "#FFD0A8",
    photoShape: "rounded",
    photoBorder: "#FFFFFF",
    photoBorderWidth: 3,
    accent: "#FF8A5B",
    footerDefault: "picnic day",
    decorations: [
      { src: P("tulip.png"), x: 12, y: 5, size: 18, rotate: -10 },
      { src: P("bunny.png"), x: 88, y: 14, size: 18, rotate: 8 },
      { src: P("watermelon.png"), x: 90, y: 32, size: 13, rotate: 15 },
      { src: P("bunny.png"), x: 10, y: 48, size: 18, rotate: -5 },
      { src: P("star.png"), x: 90, y: 58, size: 11, rotate: 20 },
      { src: P("love-bear.png"), x: 88, y: 88, size: 18, rotate: 5 },
      { src: P("heart.png"), x: 12, y: 88, size: 12, rotate: -8 },
    ],
  },
  {
    id: "coquette-bow",
    name: "Coquette Bow",
    tag: "Bow",
    bg: "#FFF0F5",
    ink: "#5c2a45",
    pattern: "stripes",
    patternColor: "#FFE0EC",
    photoShape: "rounded",
    photoBorder: "#FFB6C8",
    photoBorderWidth: 3,
    badge: "xoxo",
    badgeColor: "#FF5C9A",
    accent: "#FF5C9A",
    footerDefault: "xoxo",
    decorations: [
      { src: P("pink-bow.png"), x: 50, y: 4, size: 24, rotate: 0 },
      { src: P("pink-bow.png"), x: 12, y: 22, size: 14, rotate: -20 },
      { src: P("pink-bow.png"), x: 90, y: 38, size: 14, rotate: 18 },
      { src: P("pink-bow.png"), x: 10, y: 58, size: 13, rotate: -12 },
      { src: P("lips.png"), x: 88, y: 70, size: 13, rotate: 10 },
      { src: P("heart.png"), x: 50, y: 96, size: 12, rotate: 0 },
      { src: P("pink-bow.png"), x: 14, y: 88, size: 13, rotate: 8 },
    ],
  },
  {
    id: "starlight",
    name: "Starlight",
    tag: "Sparkle",
    bg: "#1A1A2E",
    ink: "#FFFFFF",
    pattern: "stars",
    patternColor: "#2A2A4E",
    photoShape: "rounded",
    photoBorder: "#FFD700",
    photoBorderWidth: 2,
    badge: "★ starlight",
    badgeColor: "#FFC83D",
    accent: "#FFC83D",
    footerDefault: "starlight",
    decorations: [
      { src: P("star.png"), x: 12, y: 6, size: 14, rotate: -15 },
      { src: P("star-glitter.png"), x: 88, y: 10, size: 16, rotate: 20 },
      { src: P("star.png"), x: 90, y: 35, size: 12, rotate: -10 },
      { src: P("star-glitter.png"), x: 10, y: 50, size: 14, rotate: 12 },
      { src: P("star.png"), x: 88, y: 68, size: 11, rotate: 25 },
      { src: P("star-glitter.png"), x: 12, y: 85, size: 13, rotate: -8 },
      { src: P("star.png"), x: 90, y: 92, size: 14, rotate: 15 },
    ],
  },
  {
    id: "rainbow-pop",
    name: "Rainbow Pop",
    tag: "Fun",
    bg: "#F0E8FF",
    ink: "#3a2a5c",
    pattern: "checker",
    patternColor: "#FFFFFF",
    photoShape: "rounded",
    photoBorder: "#C9B6FF",
    photoBorderWidth: 3,
    badge: "be happy!",
    badgeColor: "#A78BFA",
    accent: "#A78BFA",
    footerDefault: "be happy",
    decorations: [
      { src: P("rainbow.png"), x: 50, y: 5, size: 26, rotate: 0 },
      { src: P("star.png"), x: 12, y: 22, size: 12, rotate: -15 },
      { src: P("star.png"), x: 90, y: 24, size: 12, rotate: 15 },
      { src: P("heart.png"), x: 10, y: 55, size: 12, rotate: -8 },
      { src: P("heart.png"), x: 90, y: 58, size: 12, rotate: 10 },
      { src: P("rainbow.png"), x: 50, y: 94, size: 22, rotate: 0, opacity: 0.95 },
    ],
  },
  {
    id: "kiss-me",
    name: "Kiss Me",
    tag: "Flirty",
    bg: "#FFE4EC",
    ink: "#6b2040",
    pattern: "hearts-bg",
    patternColor: "#FFD0DC",
    photoShape: "oval",
    photoBorder: "#FF5C9A",
    photoBorderWidth: 3,
    badge: "kiss me",
    badgeColor: "#FF5C9A",
    accent: "#FF5C9A",
    footerDefault: "kiss me",
    decorations: [
      { src: P("lips.png"), x: 50, y: 4, size: 18, rotate: -8 },
      { src: P("heart.png"), x: 12, y: 20, size: 12, rotate: -15 },
      { src: P("lips-alt.png"), x: 90, y: 35, size: 14, rotate: 12 },
      { src: P("heart-gloss.png"), x: 10, y: 55, size: 13, rotate: 8 },
      { src: P("lips.png"), x: 88, y: 72, size: 13, rotate: -10 },
      { src: P("heart.png"), x: 50, y: 95, size: 12, rotate: 0 },
    ],
  },
  {
    id: "pearl-oval",
    name: "Pearl Oval",
    tag: "Elegant",
    bg: "#FFF9FC",
    ink: "#4a3540",
    pattern: "solid",
    photoShape: "oval",
    photoBorder: "#E8D0DC",
    photoBorderWidth: 4,
    photoBorderStyle: "pearl",
    accent: "#E8B4C8",
    footerDefault: "forever",
    decorations: [
      { src: P("pink-bow.png"), x: 50, y: 4, size: 20, rotate: 0 },
      { src: P("pearls.png"), x: 14, y: 30, size: 16, rotate: -90 },
      { src: P("pearls.png"), x: 88, y: 55, size: 16, rotate: 90 },
      { src: P("pink-bow.png"), x: 50, y: 96, size: 16, rotate: 0 },
      { src: P("heart.png"), x: 12, y: 78, size: 10, rotate: -10 },
    ],
  },
  {
    id: "y2k-grid",
    name: "Y2K Grid",
    tag: "Y2K",
    bg: "#D8F0FF",
    ink: "#1E5A8A",
    pattern: "checker",
    patternColor: "#B8E0FF",
    photoShape: "rounded",
    photoBorder: "#FFFFFF",
    photoBorderWidth: 3,
    photoBorderStyle: "double",
    badge: "Y2K BABY",
    badgeColor: "#5B9DFF",
    accent: "#5B9DFF",
    footerDefault: "y2k baby",
    decorations: [
      { src: P("flip-phone.png"), x: 12, y: 6, size: 16, rotate: -12 },
      { src: P("star-glitter.png"), x: 88, y: 8, size: 14, rotate: 18 },
      { src: P("balloon-dog.png"), x: 90, y: 40, size: 16, rotate: 8 },
      { src: P("star.png"), x: 10, y: 50, size: 12, rotate: -10 },
      { src: P("flip-phone.png"), x: 14, y: 85, size: 15, rotate: 10 },
      { src: P("heart.png"), x: 88, y: 88, size: 12, rotate: -8 },
    ],
  },
  {
    id: "noir-bow",
    name: "Noir Bow",
    tag: "Dark",
    bg: "#1A1A1A",
    ink: "#FFFFFF",
    pattern: "solid",
    photoShape: "rounded",
    photoBorder: "#FFFFFF",
    photoBorderWidth: 2,
    accent: "#333333",
    footerDefault: "noir",
    decorations: [
      { src: P("black-bow.png"), x: 50, y: 5, size: 22, rotate: 0 },
      { src: P("black-bow.png"), x: 12, y: 30, size: 14, rotate: -18 },
      { src: P("black-bow.png"), x: 90, y: 55, size: 14, rotate: 16 },
      { src: P("black-bow.png"), x: 12, y: 80, size: 13, rotate: -10 },
      { src: P("heart.png"), x: 88, y: 90, size: 11, rotate: 8, opacity: 0.85 },
    ],
  },
];

export const STICKERS: StickerDef[] = [
  { id: "clover", label: "Clover", src: P("clover.png") },
  { id: "bee", label: "Bee", src: P("bee.png") },
  { id: "pink-bow", label: "Pink bow", src: P("pink-bow.png") },
  { id: "black-bow", label: "Black bow", src: P("black-bow.png") },
  { id: "pink-butterfly", label: "Pink butterfly", src: P("pink-butterfly.png") },
  { id: "blue-butterfly", label: "Blue butterfly", src: P("blue-butterfly.png") },
  { id: "star", label: "Star", src: P("star.png") },
  { id: "star-glitter", label: "Star glitter", src: P("star-glitter.png") },
  { id: "heart", label: "Heart", src: P("heart.png") },
  { id: "heart-gloss", label: "Heart gloss", src: P("heart-gloss.png") },
  { id: "bunny", label: "Bunny", src: P("bunny.png") },
  { id: "puppy", label: "Puppy", src: P("puppy.png") },
  { id: "sakura", label: "Sakura", src: P("sakura.png") },
  { id: "sakura-alt", label: "Sakura 2", src: P("sakura-alt.png") },
  { id: "clover-girl", label: "Clover girl", src: P("clover-girl.png") },
  { id: "yellow-rose", label: "Yellow rose", src: P("yellow-rose.png") },
  { id: "tulip", label: "Tulip", src: P("tulip.png") },
  { id: "watermelon", label: "Watermelon", src: P("watermelon.png") },
  { id: "lips", label: "Lips", src: P("lips.png") },
  { id: "lips-alt", label: "Lips 2", src: P("lips-alt.png") },
  { id: "rainbow", label: "Rainbow", src: P("rainbow.png") },
  { id: "love-bear", label: "Love bear", src: P("love-bear.png") },
  { id: "pearls", label: "Pearls", src: P("pearls.png") },
  { id: "bow-classic", label: "Classic bow", src: P("bow-classic.png") },
  { id: "strawberry", label: "Strawberry", src: P("strawberry.png") },
  { id: "balloon-dog", label: "Balloon dog", src: P("balloon-dog.png") },
  { id: "flower-bouquet", label: "Bouquet", src: P("flower-bouquet.png") },
  { id: "flip-phone", label: "Flip phone", src: P("flip-phone.png") },
  // cats
  { id: "cat-white-face", label: "White cat", src: P("cat-white-face.png") },
  { id: "cat-orange", label: "Orange cat", src: P("cat-orange.png") },
  { id: "cat-calico", label: "Calico cat", src: P("cat-calico.png") },
  { id: "cat-grey-heart", label: "Grey cat", src: P("cat-grey-heart.png") },
  { id: "cat-black-bow", label: "Black cat bow", src: P("cat-black-bow.png") },
  { id: "cat-strawberry", label: "Strawberry cat", src: P("cat-strawberry.png") },
];

export const DEFAULT_SHOTS = 4;
