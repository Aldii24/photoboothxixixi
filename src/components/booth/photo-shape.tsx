"use client";

import { cn } from "@/lib/utils";
import type { PhotoShape } from "@/lib/frame-templates";

const SHAPE_CLASS: Record<PhotoShape, string> = {
  rect: "rounded-none",
  rounded: "rounded-xl",
  oval: "rounded-[50%]",
  heart: "rounded-xl", // clip via style
  scallop: "rounded-[1.25rem]",
};

export function photoShapeStyle(shape: PhotoShape): React.CSSProperties {
  if (shape === "heart") {
    // percentage-based heart (scales with any slot size)
    return {
      clipPath:
        "polygon(50% 92%, 12% 62%, 4% 35%, 12% 15%, 30% 8%, 50% 22%, 70% 8%, 88% 15%, 96% 35%, 88% 62%)",
      borderRadius: 0,
    };
  }
  if (shape === "scallop") {
    return {
      borderRadius: "40% 40% 40% 40% / 20% 20% 20% 20%",
    };
  }
  return {};
}

export function PhotoFrame({
  shape,
  borderColor,
  borderWidth = 0,
  borderStyle = "solid",
  className,
  children,
}: {
  shape: PhotoShape;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: "solid" | "pearl" | "dashed";
  className?: string;
  children: React.ReactNode;
}) {
  const pearl =
    borderStyle === "pearl"
      ? "0 0 0 2px #fff, 0 0 0 4px rgba(255,255,255,0.7), 0 0 0 6px rgba(230,200,210,0.5)"
      : undefined;

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-white/30",
        SHAPE_CLASS[shape],
        className,
      )}
      style={{
        ...photoShapeStyle(shape),
        border:
          borderWidth && borderStyle !== "pearl"
            ? `${borderWidth}px ${borderStyle === "dashed" ? "dashed" : "solid"} ${borderColor ?? "transparent"}`
            : undefined,
        boxShadow: pearl,
      }}
    >
      {children}
    </div>
  );
}
