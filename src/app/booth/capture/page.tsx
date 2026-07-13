"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, ArrowRight } from "lucide-react";
import { BoothHeader } from "@/components/booth/booth-header";
import { Button } from "@/components/ui/button";
import {
  BEAUTY_FILTERS,
  GRID_OVERLAYS,
  TIMER_OPTIONS,
  type TimerOption,
} from "@/lib/booth-config";
import { useBooth } from "@/lib/booth-store";
import { captureBeautyFrame } from "@/lib/beauty-capture";
import { cn } from "@/lib/utils";

export default function CapturePage() {
  const router = useRouter();
  const {
    timer,
    setTimer,
    grid,
    setGrid,
    beauty,
    setBeauty,
    shotCount,
    setShotCount,
    shots,
    setShotAt,
    retakeIndex,
    setRetakeIndex,
  } = useBooth();

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [flash, setFlash] = useState(false);
  const [busy, setBusy] = useState(false);

  const filled = shots.filter(Boolean).length;
  const targetIndex =
    retakeIndex !== null
      ? retakeIndex
      : shots.findIndex((s) => !s);
  const allDone = retakeIndex === null && shots.length > 0 && shots.every(Boolean);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const media = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } },
          audio: false,
        });
        if (cancelled) {
          media.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = media;
        if (videoRef.current) {
          videoRef.current.srcObject = media;
          await videoRef.current.play();
        }
        setReady(true);
      } catch {
        setError("Izinkan akses kamera dulu ya 📷");
      }
    })();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const snap = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const data = captureBeautyFrame(video, beauty);
    setFlash(true);
    setTimeout(() => setFlash(false), 160);

    if (retakeIndex !== null) {
      setShotAt(retakeIndex, data);
      setRetakeIndex(null);
      router.push("/booth/review");
      return;
    }

    const idx = shots.findIndex((s) => !s);
    const index = idx >= 0 ? idx : Math.min(filled, shotCount - 1);
    setShotAt(index, data);

    const nextFilled = shots.reduce(
      (n, s, i) => n + (i === index || s ? 1 : 0),
      0,
    );
    if (nextFilled >= shotCount) {
      setTimeout(() => router.push("/booth/review"), 450);
    }
  }, [beauty, filled, retakeIndex, router, setRetakeIndex, setShotAt, shots, shotCount]);

  const runTimer = useCallback(async () => {
    if (busy || !ready) return;
    setBusy(true);
    for (let n = timer; n >= 1; n--) {
      setCountdown(n);
      await new Promise((r) => setTimeout(r, 1000));
    }
    setCountdown(null);
    snap();
    setBusy(false);
  }, [busy, ready, snap, timer]);

  // auto-chain remaining shots (not in retake mode)
  useEffect(() => {
    if (retakeIndex !== null) return;
    if (busy || !ready) return;
    if (filled > 0 && filled < shotCount && shots.some((s) => !s)) {
      const t = setTimeout(() => {
        void runTimer();
      }, 700);
      return () => clearTimeout(t);
    }
  }, [filled, shotCount, busy, ready, retakeIndex, runTimer, shots]);

  return (
    <>
      <BoothHeader current="capture" />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-4 text-center">
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
            {retakeIndex !== null
              ? `Foto ulang #${retakeIndex + 1}`
              : "Ambil foto"}
          </h1>
          <p className="text-sm font-medium text-ink-soft">
            {retakeIndex !== null
              ? "Pose lagi buat slot ini aja"
              : `${Math.min(filled, shotCount)}/${shotCount} · timer ${timer}s`}
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
          {/* Camera */}
          <div>
            <div className="relative overflow-hidden rounded-[28px] border-[3px] border-white bg-ink shadow-[0_16px_40px_rgba(255,92,154,0.15)]">
              {error ? (
                <div className="flex aspect-[4/3] items-center justify-center bg-pink-soft p-6 text-center text-sm font-semibold text-ink-soft">
                  {error}
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="aspect-[4/3] w-full scale-x-[-1] object-cover"
                  style={{
                    filter: beauty.css === "none" ? undefined : beauty.css,
                  }}
                />
              )}

              {/* Beauty glow preview */}
              {beauty.glow && !error && (
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{ background: beauty.glow }}
                />
              )}

              {/* Grid overlay */}
              {grid.cols > 0 && !error && (
                <div className="pointer-events-none absolute inset-0">
                  {Array.from({ length: grid.cols - 1 }).map((_, i) => (
                    <div
                      key={`c${i}`}
                      className="absolute top-0 bottom-0 w-px bg-white/45"
                      style={{ left: `${((i + 1) / grid.cols) * 100}%` }}
                    />
                  ))}
                  {Array.from({ length: grid.rows - 1 }).map((_, i) => (
                    <div
                      key={`r${i}`}
                      className="absolute left-0 right-0 h-px bg-white/45"
                      style={{ top: `${((i + 1) / grid.rows) * 100}%` }}
                    />
                  ))}
                </div>
              )}

              <AnimatePresence>
                {countdown !== null && (
                  <motion.div
                    key={countdown}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.3 }}
                    className="absolute inset-0 flex items-center justify-center bg-ink/25"
                  >
                    <span className="font-[family-name:var(--font-display)] text-8xl font-bold text-white drop-shadow-lg">
                      {countdown}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {flash && (
                  <motion.div
                    initial={{ opacity: 0.85 }}
                    animate={{ opacity: 0 }}
                    className="pointer-events-none absolute inset-0 bg-white"
                  />
                )}
              </AnimatePresence>

              {/* progress dots */}
              {retakeIndex === null && (
                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                  {Array.from({ length: shotCount }).map((_, i) => (
                    <span
                      key={i}
                      className={cn(
                        "h-2 w-2 rounded-full border border-white/80",
                        shots[i]
                          ? "bg-primary"
                          : i === targetIndex
                            ? "bg-sunny"
                            : "bg-white/30",
                      )}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {!allDone && (
                <Button
                  size="lg"
                  onClick={() => void runTimer()}
                  disabled={!ready || busy || !!error}
                  className="min-w-[180px]"
                >
                  <Camera className="h-5 w-5" />
                  {busy ? "Tahan pose..." : filled === 0 || retakeIndex !== null ? "Mulai" : "Lanjut"}
                </Button>
              )}
              {allDone && (
                <Button size="lg" onClick={() => router.push("/booth/review")}>
                  Cek hasil
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Controls */}
          <aside className="space-y-4">
            {/* Timer */}
            <section className="rounded-3xl border border-stroke-soft bg-white/90 p-4 shadow-sm">
              <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-ink-muted">
                Timer
              </p>
              <div className="flex gap-2">
                {TIMER_OPTIONS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTimer(t as TimerOption)}
                    className={cn(
                      "flex-1 rounded-full py-2 text-sm font-bold transition",
                      timer === t
                        ? "bg-primary text-white shadow-md"
                        : "bg-pink-soft/60 text-ink-soft hover:bg-pink-soft",
                    )}
                  >
                    {t}s
                  </button>
                ))}
              </div>
            </section>

            {/* Shot count */}
            {retakeIndex === null && (
              <section className="rounded-3xl border border-stroke-soft bg-white/90 p-4 shadow-sm">
                <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-ink-muted">
                  Jumlah foto
                </p>
                <div className="flex gap-2">
                  {[2, 3, 4].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setShotCount(n)}
                      className={cn(
                        "flex-1 rounded-full py-2 text-sm font-bold transition",
                        shotCount === n
                          ? "bg-ink text-white"
                          : "bg-stroke-soft/60 text-ink-soft",
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Grid */}
            <section className="rounded-3xl border border-stroke-soft bg-white/90 p-4 shadow-sm">
              <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-ink-muted">
                Kisi
              </p>
              <div className="flex flex-wrap gap-1.5">
                {GRID_OVERLAYS.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGrid(g)}
                    className={cn(
                      "rounded-full px-2.5 py-1.5 text-xs font-bold transition",
                      grid.id === g.id
                        ? "bg-sky text-white"
                        : "bg-sky-soft text-ink-soft",
                    )}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            </section>

            {/* Beauty filters */}
            <section className="rounded-3xl border border-stroke-soft bg-white/90 p-4 shadow-sm">
              <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-ink-muted">
                Beauty filter
              </p>
              <div className="no-scrollbar flex max-h-52 flex-col gap-1.5 overflow-y-auto">
                {BEAUTY_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setBeauty(f)}
                    className={cn(
                      "flex items-center gap-2 rounded-2xl px-3 py-2 text-left text-sm font-bold transition",
                      beauty.id === f.id
                        ? "bg-primary text-white shadow-md"
                        : "bg-pink-soft/50 text-ink-soft hover:bg-pink-soft",
                    )}
                  >
                    <span>{f.emoji}</span>
                    <span>{f.name}</span>
                  </button>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </main>
    </>
  );
}
