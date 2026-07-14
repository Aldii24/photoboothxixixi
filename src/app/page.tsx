"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="bg-soft relative flex min-h-screen flex-col">
      {/* tiny floating accents — not heavy */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute left-[12%] top-24 text-2xl"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      >
        ✨
      </motion.span>
      <motion.span
        aria-hidden
        className="pointer-events-none absolute right-[14%] top-36 text-xl"
        animate={{ y: [0, 10, 0], rotate: [0, 12, 0] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
      >
        💙
      </motion.span>

      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-5">
        <p className="font-[family-name:var(--font-display)] text-lg font-bold text-ink">
          Photo<span className="text-primary">Box</span>
        </p>
        <Link href="/booth/capture">
          <Button size="sm">Mulai</Button>
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-5 pb-16 pt-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 20 }}
          className="relative mb-8"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            <div className="absolute -inset-4 rounded-full bg-primary/10 blur-2xl" />
            <Image
              src="/illustrations/mascot.jpg"
              alt="PhotoBox mascot"
              width={200}
              height={200}
              priority
              className="relative mx-auto h-40 w-40 rounded-[32px] border-4 border-white object-cover shadow-[0_16px_40px_rgba(46,184,255,0.45)] sm:h-48 sm:w-48"
            />
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-ink sm:text-4xl"
        >
          Pose. Snap.{" "}
          <span className="text-primary">Strip cute.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="mt-3 max-w-md text-sm font-medium leading-relaxed text-ink-soft sm:text-base"
        >
          Photobox online minimalis — beauty filter, timer, retake per foto,
          layout strip, dan stiker gemas.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Link href="/booth/capture">
            <Button size="lg" className="min-w-[200px]">
              <Camera className="h-5 w-5" />
              Buka booth
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-ink-muted"
        >
          {["Timer 3/5/10s", "Beauty filter", "Retake per slot", "Stiker cute"].map(
            (t) => (
              <span
                key={t}
                className="rounded-full border border-stroke-soft bg-white/80 px-3 py-1.5"
              >
                {t}
              </span>
            ),
          )}
        </motion.div>
      </main>
    </div>
  );
}
