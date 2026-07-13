import type { BeautyFilter } from "@/lib/booth-config";

/** Capture mirrored video frame with beauty filter baked into the image */
export function captureBeautyFrame(
  video: HTMLVideoElement,
  beauty: BeautyFilter,
): string {
  const w = video.videoWidth || 960;
  const h = video.videoHeight || 720;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas.toDataURL("image/jpeg", 0.92);

  // Mirror selfie
  ctx.save();
  ctx.translate(w, 0);
  ctx.scale(-1, 1);

  // Soft beauty pass: slight blur underlay + sharp overlay (TikTok-ish smooth skin)
  const base = beauty.css === "none" ? "none" : beauty.css;
  if (beauty.soft && beauty.soft > 0) {
    ctx.filter =
      base === "none"
        ? `blur(${beauty.soft}px)`
        : `${base} blur(${beauty.soft}px)`;
    ctx.drawImage(video, 0, 0, w, h);
    ctx.globalAlpha = 0.55;
    ctx.filter = base;
    ctx.drawImage(video, 0, 0, w, h);
    ctx.globalAlpha = 1;
  } else {
    ctx.filter = base;
    ctx.drawImage(video, 0, 0, w, h);
  }
  ctx.restore();

  // Glow overlay (screen-like)
  if (beauty.glow) {
    ctx.fillStyle = beauty.glow;
    ctx.fillRect(0, 0, w, h);
  }

  // Soft vignette for pretty look
  if (beauty.id !== "none") {
    const g = ctx.createRadialGradient(
      w / 2,
      h / 2,
      Math.min(w, h) * 0.35,
      w / 2,
      h / 2,
      Math.max(w, h) * 0.72,
    );
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(40,20,30,0.12)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  return canvas.toDataURL("image/jpeg", 0.92);
}
