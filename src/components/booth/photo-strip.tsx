"use client";

import { cn } from "@/lib/utils";
import type { CountFrame } from "@/lib/frame-catalog";

type Props = {
  frame: CountFrame;
  photos: (string | null)[];
  showCaption: boolean;
  showDate: boolean;
  caption: string;
  dateLabel: string;
  fontClassName: string;
  className?: string;
  compact?: boolean;
  onStripClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  stripRef?: React.Ref<HTMLDivElement>;
  children?: React.ReactNode;
};

/**
 * Simple, reliable strip:
 * photos under exact holes + full designed overlay PNG on top.
 * Frame is fixed for its shot count (2/3/4) — no crop hacks.
 */
export function PhotoStrip({
  frame,
  photos,
  showCaption,
  showDate,
  caption,
  dateLabel,
  fontClassName,
  className,
  compact = false,
  onStripClick,
  stripRef,
  children,
}: Props) {
  // Natural premium frame aspect from catalog canvas size
  const aspectStyle =
    frame.canvasW && frame.canvasH
      ? { aspectRatio: `${frame.canvasW} / ${frame.canvasH}` }
      : { aspectRatio: "720 / 1280" };

  return (
    <div
      ref={stripRef}
      onClick={onStripClick}
      data-photobox-strip
      data-frame-id={frame.id}
      className={cn(
        "relative w-full overflow-hidden",
        compact
          ? "rounded-xl border border-black/10"
          : "rounded-[16px] border-2 shadow-[0_16px_40px_rgba(255,92,154,0.2)]",
        className,
      )}
      style={{
        backgroundColor: frame.bg || "#fff8f3",
        borderColor: frame.bg || "#fff8f3",
        ...aspectStyle,
      }}
    >
      {/* Photos under natural design holes; overlay art is never cut/resized */}
      {frame.slots.map((slot, i) => {
        const src = photos[i];
        return (
          <div
            key={`${frame.id}-slot-${i}`}
            className="absolute z-[2] overflow-hidden"
            style={{
              left: `${slot.x}%`,
              top: `${slot.y}%`,
              width: `${slot.w}%`,
              height: `${slot.h}%`,
            }}
          >
            {src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt={`Foto ${i + 1}`}
                className="h-full w-full object-cover object-[center_28%]"
                draggable={false}
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center text-[10px] font-bold text-ink-muted"
                style={{
                  background: `linear-gradient(145deg, ${frame.accent}55, #fff)`,
                }}
              >
                {!compact ? `#${i + 1}` : null}
              </div>
            )}
          </div>
        );
      })}

      {/* Full premium overlay — design intact, clips photo shapes */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={frame.overlay}
        alt={frame.name}
        className="pointer-events-none absolute inset-0 z-[5] h-full w-full object-fill select-none"
        draggable={false}
      />

      {(showCaption || showDate) && !compact && (
        <div className="absolute bottom-[1%] left-1/2 z-[12] w-[88%] -translate-x-1/2 rounded-xl bg-white/85 px-2 py-1 text-center shadow-sm">
          {showCaption && (
            <p
              className={cn("text-sm font-semibold", fontClassName)}
              style={{ color: frame.ink }}
            >
              {caption}
            </p>
          )}
          {showDate && (
            <p
              className={cn("text-[10px] opacity-80", fontClassName)}
              style={{ color: frame.ink }}
            >
              {dateLabel}
            </p>
          )}
        </div>
      )}

      {children}
    </div>
  );
}
