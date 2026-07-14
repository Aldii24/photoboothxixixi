"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { toPng } from "html-to-image";
import { Download, RefreshCcw, Share2, X } from "lucide-react";
import { BoothHeader } from "@/components/booth/booth-header";
import { PhotoStrip } from "@/components/booth/photo-strip";
import { FrameTemplateCard } from "@/components/booth/frame-template-card";
import { StickerView } from "@/components/booth/sticker-view";
import { Button } from "@/components/ui/button";
import { FOOTER_FONTS, STICKERS } from "@/lib/booth-config";
import { framesForCount } from "@/lib/frame-catalog";
import { useBooth } from "@/lib/booth-store";
import {
  addPrintSafeMargin,
  cn,
  downloadImage,
  isIOSDevice,
  shareImage,
} from "@/lib/utils";

export default function DecoratePage() {
  const {
    shots,
    shotCount,
    frame,
    setFrame,
    caption,
    setCaption,
    showCaption,
    setShowCaption,
    showDate,
    setShowDate,
    fontId,
    setFontId,
    placedStickers,
    addSticker,
    updateSticker,
    removeSticker,
    clearStickers,
  } = useBooth();

  const stripRef = useRef<HTMLDivElement>(null);
  const [activeSticker, setActiveSticker] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [tab, setTab] = useState<"template" | "sticker" | "text">("template");
  /** iOS: show full image for long-press → Save Image */
  const [savePreview, setSavePreview] = useState<{
    url: string;
    filename: string;
  } | null>(null);

  /** Capture full strip PNG without CSS clipping (rounded/shadow/overflow). */
  const captureStripPng = useCallback(async (): Promise<string> => {
    const node = stripRef.current;
    if (!node) throw new Error("Strip belum siap");

    // Temporarily clear styles that clip or add non-print chrome
    const prev = {
      overflow: node.style.overflow,
      borderRadius: node.style.borderRadius,
      boxShadow: node.style.boxShadow,
      border: node.style.border,
      borderWidth: node.style.borderWidth,
      borderColor: node.style.borderColor,
    };
    node.style.overflow = "visible";
    node.style.borderRadius = "0";
    node.style.boxShadow = "none";
    node.style.border = "none";

    // Wait 2 frames so layout settles
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await new Promise((r) => requestAnimationFrame(() => r(null)));

    try {
      const w = Math.max(node.scrollWidth, node.offsetWidth, 1);
      const h = Math.max(node.scrollHeight, node.offsetHeight, 1);
      // High-res export; slightly lower on low-memory phones
      const pixelRatio =
        typeof navigator !== "undefined" &&
        /iPhone|iPod/.test(navigator.userAgent)
          ? 2.5
          : 3;

      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio,
        backgroundColor: frame.bg || "#ffffff",
        width: w,
        height: h,
        style: {
          overflow: "visible",
          borderRadius: "0",
          boxShadow: "none",
          border: "none",
          transform: "none",
          width: `${w}px`,
          height: `${h}px`,
        },
      });

      // Small white margin so print "fit to page" doesn't shave edges
      return addPrintSafeMargin(dataUrl, 0.025);
    } finally {
      node.style.overflow = prev.overflow;
      node.style.borderRadius = prev.borderRadius;
      node.style.boxShadow = prev.boxShadow;
      node.style.border = prev.border;
      node.style.borderWidth = prev.borderWidth;
      node.style.borderColor = prev.borderColor;
    }
  }, [frame.bg]);

  /** Only templates for this exact photo count */
  const availableFrames = useMemo(
    () => framesForCount(shotCount),
    [shotCount],
  );

  const photos = useMemo(
    () => Array.from({ length: shotCount }, (_, i) => shots[i] ?? null),
    [shots, shotCount],
  );

  const footerFont =
    FOOTER_FONTS.find((f) => f.id === fontId) ?? FOOTER_FONTS[0];
  const displayCaption = caption.trim() || frame.name;
  const dateLabel = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const dragState = useRef<{
    id: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  const onStickerPointerDown = (
    e: React.PointerEvent,
    id: string,
    x: number,
    y: number,
  ) => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragState.current = {
      id,
      startX: e.clientX,
      startY: e.clientY,
      origX: x,
      origY: y,
    };
  };

  const onStickerPointerMove = (e: React.PointerEvent) => {
    if (!dragState.current || !stripRef.current) return;
    const rect = stripRef.current.getBoundingClientRect();
    const dx = ((e.clientX - dragState.current.startX) / rect.width) * 100;
    const dy = ((e.clientY - dragState.current.startY) / rect.height) * 100;
    updateSticker(dragState.current.id, {
      x: Math.min(95, Math.max(2, dragState.current.origX + dx)),
      y: Math.min(95, Math.max(2, dragState.current.origY + dy)),
    });
  };

  const onStickerPointerUp = () => {
    dragState.current = null;
  };

  const placeOnStrip = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!activeSticker) return;
    if ((e.target as HTMLElement).closest("[data-sticker]")) return;
    const rect = e.currentTarget.getBoundingClientRect();
    addSticker(activeSticker, {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const download = useCallback(async () => {
    if (!stripRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await captureStripPng();
      const filename = `photobox-${frame.id}-${shotCount}foto-${Date.now()}.png`;
      const result = await downloadImage(dataUrl, filename);

      // iOS: show full image so user can long-press → Simpan ke Foto
      if (result === "needs-preview" || isIOSDevice()) {
        setSavePreview({ url: dataUrl, filename });
      }
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan. Hard-refresh (Ctrl+Shift+R) lalu coba lagi.");
    } finally {
      setDownloading(false);
    }
  }, [captureStripPng, frame.id, shotCount]);

  const share = useCallback(async () => {
    if (!stripRef.current) return;
    setSharing(true);
    try {
      const dataUrl = await captureStripPng();
      const filename = `photobox-${frame.id}-${shotCount}foto-${Date.now()}.png`;
      const ok = await shareImage(dataUrl, filename);
      if (!ok) {
        // Share not supported — fall back to download / preview
        const result = await downloadImage(dataUrl, filename);
        if (result === "needs-preview" || isIOSDevice()) {
          setSavePreview({ url: dataUrl, filename });
        }
      }
    } catch (err) {
      console.error(err);
      alert("Gagal membagikan. Coba tombol Simpan.");
    } finally {
      setSharing(false);
    }
  }, [captureStripPng, frame.id, shotCount]);

  return (
    <>
      <BoothHeader current="decorate" />
      <main className="mx-auto max-w-6xl px-3 py-6 sm:px-5">
        <div className="grid gap-6 lg:grid-cols-[minmax(200px,280px)_1fr] lg:items-start">
          <div className="mx-auto w-full max-w-[240px] sm:max-w-[260px] lg:max-w-[280px]">
            <PhotoStrip
              stripRef={stripRef}
              frame={frame}
              photos={photos}
              showCaption={showCaption}
              showDate={showDate}
              caption={displayCaption}
              dateLabel={dateLabel}
              fontClassName={footerFont.className}
              onStripClick={placeOnStrip}
              className={activeSticker ? "cursor-crosshair" : undefined}
            >
              {placedStickers.map((ps) => {
                const def = STICKERS.find((s) => s.id === ps.stickerId);
                if (!def) return null;
                return (
                  <div
                    key={ps.id}
                    data-sticker
                    onPointerDown={(e) =>
                      onStickerPointerDown(e, ps.id, ps.x, ps.y)
                    }
                    onPointerMove={onStickerPointerMove}
                    onPointerUp={onStickerPointerUp}
                    onDoubleClick={() => removeSticker(ps.id)}
                    className="absolute z-30 cursor-grab touch-none active:cursor-grabbing"
                    style={{
                      left: `${ps.x}%`,
                      top: `${ps.y}%`,
                      transform: `translate(-50%, -50%) scale(${ps.scale}) rotate(${ps.rotate}deg)`,
                    }}
                  >
                    <StickerView src={def.src} label={def.label} size={44} />
                  </div>
                );
              })}
            </PhotoStrip>

            <p className="mt-2 text-center text-[11px] font-semibold text-ink-muted">
              <span className="text-primary">{frame.name}</span>
              {" · khusus "}
              {shotCount} foto · {availableFrames.length} template
            </p>
          </div>

          <div className="rounded-[28px] border border-stroke-soft bg-white/90 p-4 shadow-sm sm:p-6">
            <div className="mb-4 flex flex-wrap justify-center gap-2">
              {(
                [
                  ["template", "Frame template"],
                  ["text", "Teks & font"],
                  ["sticker", "Stiker"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-xs font-bold transition",
                    tab === id
                      ? "bg-primary text-white shadow-md"
                      : "bg-pink-soft/60 text-ink-soft",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {tab === "template" && (
              <div>
                <p className="mb-3 text-center text-xs font-medium text-ink-muted">
                  Frame{" "}
                  <strong className="text-primary">{shotCount} foto</strong>
                  {" · "}
                  {availableFrames.length} template
                </p>
                {availableFrames.length === 0 ? (
                  <p className="rounded-2xl bg-pink-soft/50 px-4 py-6 text-center text-sm font-semibold text-ink-soft">
                    Belum ada template untuk {shotCount} foto.
                  </p>
                ) : (
                  <div className="no-scrollbar max-h-[480px] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                      {availableFrames.map((f) => (
                        <FrameTemplateCard
                          key={f.id}
                          frame={f}
                          photos={photos}
                          active={frame.id === f.id}
                          onSelect={() => setFrame(f)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === "text" && (
              <div className="mx-auto max-w-md space-y-4">
                <label className="flex cursor-pointer items-center justify-between rounded-2xl border-2 border-stroke-soft bg-white px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-ink">Tampilkan teks</p>
                    <p className="text-[11px] font-medium text-ink-muted">
                      Caption custom · opsional
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={showCaption}
                    onChange={(e) => setShowCaption(e.target.checked)}
                    className="h-5 w-5 accent-primary"
                  />
                </label>
                {showCaption && (
                  <>
                    <input
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      maxLength={48}
                      placeholder={frame.name}
                      className="w-full rounded-2xl border-2 border-stroke bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-primary"
                    />
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {FOOTER_FONTS.map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setFontId(f.id)}
                          className={cn(
                            "rounded-2xl border-2 px-3 py-3 text-left",
                            fontId === f.id
                              ? "border-primary bg-pink-soft/40"
                              : "border-stroke-soft bg-white",
                          )}
                        >
                          <p className="text-[10px] font-bold uppercase text-ink-muted">
                            {f.name}
                          </p>
                          <p className={cn("mt-1 text-lg", f.className)}>Aa</p>
                        </button>
                      ))}
                    </div>
                  </>
                )}
                <label className="flex cursor-pointer items-center justify-between rounded-2xl border-2 border-stroke-soft bg-white px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-ink">
                      Tampilkan tanggal
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={showDate}
                    onChange={(e) => setShowDate(e.target.checked)}
                    className="h-5 w-5 accent-primary"
                  />
                </label>
              </div>
            )}

            {tab === "sticker" && (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-bold text-ink-soft">Stiker PNG</p>
                  <button
                    type="button"
                    onClick={clearStickers}
                    className="text-xs font-bold text-ink-muted hover:text-primary"
                  >
                    Hapus semua
                  </button>
                </div>
                <div className="no-scrollbar grid max-h-[340px] grid-cols-5 gap-2 overflow-y-auto sm:grid-cols-6 md:grid-cols-8">
                  {STICKERS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      title={s.label}
                      onClick={() => {
                        setActiveSticker(s.id);
                        addSticker(s.id);
                      }}
                      className={cn(
                        "flex aspect-square items-center justify-center rounded-2xl border-2 bg-[#f3f0f2] p-1",
                        activeSticker === s.id
                          ? "border-primary shadow-md"
                          : "border-transparent",
                      )}
                    >
                      <StickerView src={s.src} label={s.label} size={36} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                onClick={() => void download()}
                disabled={downloading || sharing}
                className="min-w-[160px]"
                title="Simpan PNG ke perangkat (siap print, full strip)"
              >
                <Download className="h-4 w-4" />
                {downloading ? "Menyimpan..." : "Simpan"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => void share()}
                disabled={downloading || sharing}
                className="min-w-[160px]"
                title="Bagikan lewat WhatsApp / Instagram / dll."
              >
                <Share2 className="h-4 w-4" />
                {sharing ? "Menyiapkan..." : "Bagikan"}
              </Button>
              <Link href="/booth/review">
                <Button size="lg" variant="outline" className="min-w-[160px]">
                  <RefreshCcw className="h-4 w-4" />
                  Ambil ulang
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* iOS / fallback: full image for long-press save — never crop */}
      {savePreview && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/55 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="Simpan strip"
          onClick={() => setSavePreview(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <p className="font-[family-name:var(--font-display)] text-base font-bold text-ink">
                  Simpan strip
                </p>
                <p className="text-xs font-medium text-ink-muted">
                  {isIOSDevice()
                    ? "Tekan lama gambar → Simpan ke Foto"
                    : "Gambar sudah diunduh. Bisa print full tanpa potong."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSavePreview(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-stroke-soft text-ink-soft hover:bg-primary/15 hover:text-primary"
                aria-label="Tutup"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={savePreview.url}
              alt="Hasil photostrip — tekan lama untuk simpan"
              className="mx-auto max-h-[60vh] w-auto max-w-full rounded-xl border border-stroke-soft object-contain bg-white"
            />
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Button
                size="md"
                className="flex-1"
                onClick={() => void downloadImage(savePreview.url, savePreview.filename)}
              >
                <Download className="h-4 w-4" />
                Unduh lagi
              </Button>
              <Button
                size="md"
                variant="outline"
                className="flex-1"
                onClick={() =>
                  void shareImage(savePreview.url, savePreview.filename)
                }
              >
                <Share2 className="h-4 w-4" />
                Bagikan
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
