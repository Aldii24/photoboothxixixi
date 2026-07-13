"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { toPng } from "html-to-image";
import { Download, RefreshCcw } from "lucide-react";
import { BoothHeader } from "@/components/booth/booth-header";
import { PhotoStrip } from "@/components/booth/photo-strip";
import { FrameTemplateCard } from "@/components/booth/frame-template-card";
import { StickerView } from "@/components/booth/sticker-view";
import { Button } from "@/components/ui/button";
import { FOOTER_FONTS, STICKERS } from "@/lib/booth-config";
import { framesForCount } from "@/lib/frame-catalog";
import { useBooth } from "@/lib/booth-store";
import { cn } from "@/lib/utils";

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
  const [tab, setTab] = useState<"template" | "sticker" | "text">("template");

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
    const node = stripRef.current;
    if (!node) return;
    setDownloading(true);
    try {
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 4, // HD export
        backgroundColor: frame.bg || "#fff8f3",
        quality: 1,
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `photobox-${frame.id}-${shotCount}foto-${Date.now()}.png`;
      a.click();
    } catch (err) {
      console.error(err);
      alert("Gagal unduh. Hard-refresh (Ctrl+Shift+R) lalu coba lagi.");
    } finally {
      setDownloading(false);
    }
  }, [frame.bg, frame.id, shotCount]);

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
                disabled={downloading}
                className="min-w-[160px]"
              >
                <Download className="h-4 w-4" />
                {downloading ? "Menyimpan..." : "Unduh"}
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
    </>
  );
}
