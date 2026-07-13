"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: "capture", label: "Foto", href: "/booth/capture" },
  { id: "review", label: "Cek", href: "/booth/review" },
  { id: "decorate", label: "Hias", href: "/booth/decorate" },
] as const;

type Props = {
  current: (typeof STEPS)[number]["id"];
};

export function BoothHeader({ current }: Props) {
  const idx = STEPS.findIndex((s) => s.id === current);

  return (
    <header className="sticky top-0 z-40 border-b border-stroke-soft/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-base font-bold text-ink"
        >
          Photo<span className="text-primary">Box</span>
        </Link>

        <nav className="flex items-center gap-1">
          {STEPS.map((step, i) => {
            const active = i === idx;
            const done = i < idx;
            return (
              <Link
                key={step.id}
                href={step.href}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-bold transition",
                  active && "bg-primary text-white shadow-md",
                  done && !active && "text-mint",
                  !done && !active && "text-ink-muted",
                )}
              >
                {step.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/"
          aria-label="Tutup"
          className="flex h-8 w-8 items-center justify-center rounded-full text-ink-muted hover:bg-pink-soft hover:text-primary"
        >
          <X className="h-4 w-4" />
        </Link>
      </div>
    </header>
  );
}
