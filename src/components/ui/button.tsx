"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

type ButtonProps = HTMLMotionProps<"button"> & {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
};

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-white shadow-[0_8px_24px_rgba(46,184,255,0.55)] hover:bg-primary-deep border-transparent",
  secondary:
    "bg-white text-ink border-2 border-stroke shadow-sm hover:border-primary hover:text-primary",
  ghost: "bg-transparent text-ink-soft border-transparent hover:bg-white/70",
  outline:
    "bg-transparent text-primary border-2 border-primary hover:bg-primary/5",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm rounded-full gap-1.5",
  md: "h-11 px-5 text-sm rounded-full gap-2",
  lg: "h-12 px-7 text-base rounded-full gap-2",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  fullWidth,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={disabled ? undefined : { scale: 1.03, y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 420, damping: 22 }}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center font-bold tracking-tight border transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
