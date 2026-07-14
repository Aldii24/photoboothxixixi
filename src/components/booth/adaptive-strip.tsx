"use client";

import { cn } from "@/lib/utils";
import type {
  AdaptiveFrameTemplate,
  FrameLayoutMode,
  SlotRect,
} from "@/lib/frame-templates";

type Props = {
  template: AdaptiveFrameTemplate;
  slots: SlotRect[];
  photos: (string | null)[];
  shotCount: number;
  showCaption: boolean;
  showDate: boolean;
  caption: string;
  dateLabel: string;
  fontClassName: string;
  className?: string;
  onStripClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  children?: React.ReactNode;
  stripRef?: React.Ref<HTMLDivElement>;
  compact?: boolean;
  mode?: FrameLayoutMode;
  headerEnd?: number;
  unitTop?: number;
  unitH?: number;
  footerStart?: number;
  totalH?: number;
  headerFrac?: number;
  unitFrac?: number;
  footerFrac?: number;
  n?: number;
};

/**
 * TRUE adaptive premium frame from a single designed overlay PNG.
 *
 * full:     n === designSlots → full art, exact holes
 * assemble: any n → [header] + [window×n] + [footer logo]
 *           empty bottom holes are GONE; footer text MOVES up with the strip
 */
export function AdaptiveStrip({
  template,
  slots,
  photos,
  showCaption,
  showDate,
  caption,
  dateLabel,
  fontClassName,
  className,
  onStripClick,
  children,
  stripRef,
  compact = false,
  mode = "full",
  headerEnd = 10,
  unitH = 20,
  footerStart = 88,
  totalH = 100,
  headerFrac = 0.1,
  unitFrac = 0.2,
  footerFrac = 0.12,
  n = 1,
}: Props) {
  const overlay = template.fullOverlay;
  const count = n || slots.length;

  // Composed strip aspect from original 9:16 scaled by totalH
  const aspectRatio =
    mode === "full" ? "9 / 16" : `9 / ${(16 * totalH) / 100}`;

  return (
    <div
      ref={stripRef}
      onClick={onStripClick}
      data-photobox-strip
      data-template-id={template.id}
      data-mode={mode}
      className={cn(
        "relative w-full overflow-hidden",
        compact
          ? "rounded-xl border-[3px]"
          : "rounded-[24px] border-[6px] shadow-[0_20px_50px_rgba(46,184,255,0.38)]",
        className,
      )}
      style={{
        aspectRatio,
        backgroundColor: template.bg,
        borderColor: template.bg,
      }}
    >
      {/* ── Photos under holes ── */}
      {slots.map((slot, i) => {
        const src = photos[i];
        return (
          <div
            key={`${template.id}-photo-${i}`}
            className="absolute z-[2] overflow-hidden bg-neutral-200"
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
                className="h-full w-full object-cover object-center"
                draggable={false}
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center text-[10px] font-bold text-ink-muted"
                style={{
                  background: `linear-gradient(145deg, ${template.accent}55, #fff)`,
                }}
              >
                {!compact ? `#${i + 1}` : null}
              </div>
            )}
          </div>
        );
      })}

      {/* ── FULL overlay (exact design when n matches) ── */}
      {mode === "full" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={overlay}
          alt={template.name}
          className="pointer-events-none absolute inset-0 z-[5] h-full w-full object-fill select-none"
          draggable={false}
        />
      )}

      {/* ── ASSEMBLE: header + N window units + footer ── */}
      {mode === "assemble" && (
        <>
          {/* HEADER band (logo top, Hello!, etc.) */}
          <div
            className="pointer-events-none absolute left-0 right-0 top-0 z-[5] overflow-hidden"
            style={{ height: `${headerFrac * 100}%` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={overlay}
              alt=""
              className="absolute left-0 top-0 w-full select-none"
              style={{ height: `${100 / (headerEnd / 100)}%` }}
              draggable={false}
            />
          </div>

          {/* WINDOW UNITS × N */}
          {Array.from({ length: count }).map((_, i) => {
            const top = (headerFrac + i * unitFrac) * 100;
            // Source region in original: [headerEnd, headerEnd+unitH]
            // For unit 0 we use first hole's surrounding band.
            // We always sample the FIRST design window band so each slot looks identical (consistent art).
            const srcTop = headerEnd; // original %
            return (
              <div
                key={`unit-${i}`}
                className="pointer-events-none absolute left-0 right-0 z-[5] overflow-hidden"
                style={{
                  top: `${top}%`,
                  height: `${unitFrac * 100}%`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={overlay}
                  alt=""
                  className="absolute left-0 w-full select-none"
                  style={{
                    // Full image height relative to this unit box
                    height: `${100 / (unitH / 100)}%`,
                    // Shift so unit band of source is visible
                    top: `${-(srcTop / unitH) * 100}%`,
                  }}
                  draggable={false}
                />
              </div>
            );
          })}

          {/* FOOTER band (Lucky Charm text, Kyowo Cat logo, etc.) — always kept */}
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 z-[5] overflow-hidden"
            style={{ height: `${footerFrac * 100}%` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={overlay}
              alt=""
              className="absolute bottom-0 left-0 w-full select-none"
              style={{
                height: `${100 / ((100 - footerStart) / 100)}%`,
              }}
              draggable={false}
            />
          </div>
        </>
      )}

      {/* Optional custom caption (user) */}
      {(showCaption || showDate) && !compact && (
        <div className="absolute bottom-[1%] left-1/2 z-[12] w-[88%] -translate-x-1/2 rounded-xl bg-white/85 px-2 py-1 text-center shadow-sm">
          {showCaption && (
            <p
              className={cn("text-sm font-semibold", fontClassName)}
              style={{ color: template.ink }}
            >
              {caption}
            </p>
          )}
          {showDate && (
            <p
              className={cn("text-[10px] opacity-80", fontClassName)}
              style={{ color: template.ink }}
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

function isDarkBg(hex: string) {
  const c = hex.replace("#", "");
  if (c.length < 6) return false;
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 140;
}
