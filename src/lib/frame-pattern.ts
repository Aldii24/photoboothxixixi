/** Kept for any legacy CSS pattern helpers (premium engine uses bgImage now). */

export type BgPattern =
  | "solid"
  | "gingham"
  | "checker"
  | "dots"
  | "stripes"
  | "stars"
  | "hearts-bg"
  | "floral-soft";

export function framePatternClass(pattern: BgPattern): string {
  switch (pattern) {
    case "gingham":
      return "frame-pat-gingham";
    case "checker":
      return "frame-pat-checker";
    case "dots":
      return "frame-pat-dots";
    case "stripes":
      return "frame-pat-stripes";
    case "stars":
      return "frame-pat-stars";
    case "hearts-bg":
      return "frame-pat-hearts-bg";
    case "floral-soft":
      return "frame-pat-dots";
    default:
      return "";
  }
}

export function paintCanvasPattern(
  ctx: CanvasRenderingContext2D,
  pattern: BgPattern,
  bg: string,
  patColor: string,
  w: number,
  h: number,
) {
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  if (pattern === "solid") return;

  if (pattern === "gingham") {
    const s = 16;
    ctx.fillStyle = patColor;
    ctx.globalAlpha = 0.45;
    for (let x = 0; x < w; x += s * 2) ctx.fillRect(x, 0, s, h);
    for (let y = 0; y < h; y += s * 2) ctx.fillRect(0, y, w, s);
    ctx.globalAlpha = 1;
  }
}
