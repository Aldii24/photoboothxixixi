"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, RefreshCcw } from "lucide-react";
import { BoothHeader } from "@/components/booth/booth-header";
import { Button } from "@/components/ui/button";
import { useBooth } from "@/lib/booth-store";
import { cn } from "@/lib/utils";

export default function ReviewPage() {
  const router = useRouter();
  const { shots, shotCount, setRetakeIndex, setShots } = useBooth();
  const list = shots.slice(0, shotCount);
  const ready = list.length > 0 && list.every(Boolean);

  const retake = (index: number) => {
    setRetakeIndex(index);
    router.push("/booth/capture");
  };

  const retakeAll = () => {
    setRetakeIndex(null);
    setShots(Array.from({ length: shotCount }, () => null));
    router.push("/booth/capture");
  };

  return (
    <>
      <BoothHeader current="review" />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 text-center">
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
            Cek hasil pose
          </h1>
          <p className="mt-1 text-sm font-medium text-ink-soft">
            Klik foto yang mau diulang — nggak perlu ulang semua.
          </p>
        </div>

        {!ready && (
          <div className="mb-6 rounded-2xl border border-sunny/40 bg-sunny/15 px-4 py-3 text-center text-sm font-semibold text-ink">
            Masih ada slot kosong.{" "}
            <button
              type="button"
              className="text-primary underline"
              onClick={() => router.push("/booth/capture")}
            >
              Lanjut foto
            </button>
          </div>
        )}

        <div
          className={cn(
            "mx-auto grid gap-3",
            shotCount <= 3 && "max-w-lg grid-cols-1 sm:grid-cols-3",
            shotCount === 4 && "max-w-2xl grid-cols-2",
            shotCount === 6 && "max-w-2xl grid-cols-2 sm:grid-cols-3",
          )}
        >
          {Array.from({ length: shotCount }).map((_, i) => {
            const src = list[i];
            return (
              <motion.button
                key={i}
                type="button"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -3 }}
                onClick={() => retake(i)}
                className="group relative overflow-hidden rounded-3xl border-2 border-stroke-soft bg-white shadow-sm"
              >
                <div className="relative aspect-[4/3] bg-pink-soft/40">
                  {src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={src}
                      alt={`Foto ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm font-bold text-ink-muted">
                      Kosong
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-ink/0 transition group-hover:bg-ink/35">
                    <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-primary opacity-0 shadow-md transition group-hover:opacity-100">
                      <RefreshCcw className="h-3.5 w-3.5" />
                      Foto ulang
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-xs font-bold text-ink-soft">
                    Foto {i + 1}
                  </span>
                  <span className="text-[10px] font-semibold text-primary">
                    ketuk untuk ulang
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button variant="secondary" onClick={retakeAll}>
            <RefreshCcw className="h-4 w-4" />
            Ulang semua
          </Button>
          <Button
            size="lg"
            disabled={!ready}
            onClick={() => router.push("/booth/decorate")}
            className="min-w-[180px]"
          >
            Berikutnya
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </main>
    </>
  );
}
