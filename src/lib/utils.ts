import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Convert a data URL to a Blob (needed for Safari / iOS downloads). */
export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] ?? "image/png";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

/**
 * Save an image in a cross-browser way.
 * Desktop: anchor download with object URL.
 * iOS Safari: Web Share sheet (Save Image) — `a.download` is unreliable there.
 */
export async function saveImage(dataUrl: string, filename: string): Promise<void> {
  const blob = dataUrlToBlob(dataUrl);
  const file = new File([blob], filename, { type: blob.type || "image/png" });

  // Prefer native share on iOS / Android — opens "Save Image" / Files
  const canShareFiles =
    typeof navigator !== "undefined" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [file] });

  if (canShareFiles) {
    try {
      await navigator.share({ files: [file], title: filename });
      return;
    } catch (err) {
      // User cancelled the share sheet — treat as success (no error toast)
      if (err instanceof Error && err.name === "AbortError") return;
      // Fall through to anchor / open fallback
    }
  }

  const url = URL.createObjectURL(blob);
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  try {
    // iOS Safari ignores <a download> for blobs/data URLs — open the image
    // so the user can long-press → "Add to Photos" / Share → Save Image
    if (isIOS) {
      const opened = window.open(url, "_blank");
      if (!opened) {
        // Popup blocked: navigate current tab as last resort
        window.location.href = url;
      }
      return;
    }

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    // Keep the blob URL alive long enough for open/download to finish
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
  }
}
