"use client";

import { PhotoStrip } from "@/components/booth/photo-strip";
import type { CountFrame } from "@/lib/frame-catalog";
import { cn } from "@/lib/utils";

type Props = {
  frame: CountFrame;
  photos: (string | null)[];
  active: boolean;
  onSelect: () => void;
};

export function FrameTemplateCard({
  frame,
  photos,
  active,
  onSelect,
}: Props) {
  const padded = Array.from(
    { length: frame.shots },
    (_, i) => photos[i] ?? null,
  );

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full overflow-hidden rounded-2xl border-2 p-1.5 text-left transition hover:scale-[1.015]",
        active
          ? "border-primary shadow-md ring-2 ring-primary/25"
          : "border-transparent bg-[#f7f4f6]",
      )}
    >
      <div className="pointer-events-none select-none">
        <PhotoStrip
          frame={frame}
          photos={padded}
          showCaption={false}
          showDate={false}
          caption=""
          dateLabel=""
          fontClassName=""
          className="!rounded-xl !border-[4px] !shadow-none"
          compact
        />
      </div>
      <div className="mt-1.5 px-0.5">
        <p className="truncate text-[11px] font-bold text-ink">{frame.name}</p>
        <p className="truncate text-[9px] font-semibold text-ink-muted">
          {frame.tag} · {frame.shots} foto
        </p>
      </div>
    </button>
  );
}
