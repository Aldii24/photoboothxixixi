"use client";

import { cn } from "@/lib/utils";

export function StickerView({
  src,
  label,
  className,
  size = 40,
}: {
  src: string;
  label?: string;
  className?: string;
  size?: number;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={label ?? "sticker"}
      className={cn("object-contain select-none pointer-events-none", className)}
      style={{ width: size, height: size }}
      draggable={false}
    />
  );
}
