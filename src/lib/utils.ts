import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Convert a data URL to a Blob. */
export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] ?? "image/png";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export function isIOSDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

/**
 * Direct file download (primary path).
 * - Chromium: showSaveFilePicker when available
 * - Desktop + Android Chrome: <a download> works
 * - iOS Safari: download attr is ignored → returns needsPreview so UI can show image
 */
export async function downloadImage(
  dataUrl: string,
  filename: string,
): Promise<"saved" | "needs-preview"> {
  const blob = dataUrlToBlob(dataUrl);

  // Native save picker (Chrome/Edge desktop)
  if (typeof window !== "undefined" && "showSaveFilePicker" in window) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: filename,
        types: [
          {
            description: "PNG image",
            accept: { "image/png": [".png"] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return "saved";
    } catch (err) {
      // User cancelled picker — don't fall through to another download
      if (err instanceof Error && err.name === "AbortError") return "saved";
      // Unsupported / permission — fall through
    }
  }

  const url = URL.createObjectURL(blob);

  // Always trigger <a download> — works on Android + desktop
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();

  // iOS ignores download — caller should show preview for long-press save
  if (isIOSDevice()) {
    // Keep URL alive; preview modal will use dataUrl instead
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return "needs-preview";
  }

  setTimeout(() => URL.revokeObjectURL(url), 30_000);
  return "saved";
}

/** Optional share sheet (secondary). */
export async function shareImage(
  dataUrl: string,
  filename: string,
): Promise<boolean> {
  const blob = dataUrlToBlob(dataUrl);
  const file = new File([blob], filename, { type: blob.type || "image/png" });

  if (
    typeof navigator === "undefined" ||
    typeof navigator.canShare !== "function" ||
    !navigator.canShare({ files: [file] })
  ) {
    return false;
  }

  try {
    await navigator.share({ files: [file], title: filename });
    return true;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") return true;
    return false;
  }
}

/** @deprecated use downloadImage — kept for any old imports */
export async function saveImage(
  dataUrl: string,
  filename: string,
): Promise<void> {
  await downloadImage(dataUrl, filename);
}

/**
 * Add a small white margin so print "fit to page" doesn't clip edges.
 */
export async function addPrintSafeMargin(
  dataUrl: string,
  marginRatio = 0.03,
): Promise<string> {
  const img = await loadImage(dataUrl);
  const pad = Math.max(
    12,
    Math.round(Math.max(img.naturalWidth, img.naturalHeight) * marginRatio),
  );
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth + pad * 2;
  canvas.height = img.naturalHeight + pad * 2;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, pad, pad);
  return canvas.toDataURL("image/png");
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
