/**
 * Fixed per-count frame templates (2 / 3 / 4 only).
 * Large photo holes (~95% width). Auto-filter by shot count.
 */

import catalogJson from "../../public/frames/catalog.json";

export type SlotRect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type CountFrame = {
  id: string;
  name: string;
  tag: string;
  shots: number;
  overlay: string;
  thumb: string;
  slots: SlotRect[];
  bg: string;
  ink: string;
  accent: string;
  /** Natural overlay pixel size (for correct aspect) */
  canvasW?: number;
  canvasH?: number;
};

export const ALL_FRAMES = catalogJson as CountFrame[];

/** Frames that match the photobox photo count exactly */
export function framesForCount(shotCount: number): CountFrame[] {
  return ALL_FRAMES.filter((f) => f.shots === shotCount);
}

export function getFrameById(id: string): CountFrame | undefined {
  return ALL_FRAMES.find((f) => f.id === id);
}

export function defaultFrameForCount(shotCount: number): CountFrame {
  const list = framesForCount(shotCount);
  // Prefer illustrated premium templates
  const premium = list.find(
    (f) =>
      f.tag.startsWith("★") ||
      f.tag.toLowerCase().includes("premium") ||
      f.id.startsWith("premium-"),
  );
  return premium ?? list[0] ?? ALL_FRAMES[0];
}
