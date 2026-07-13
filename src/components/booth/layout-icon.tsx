import { cn } from "@/lib/utils";
import type { LayoutPreset } from "@/lib/booth-config";

export function LayoutIcon({
  icon,
  className,
}: {
  icon: LayoutPreset["icon"];
  className?: string;
}) {
  const base = "rounded-[2px] bg-current";
  return (
    <div
      className={cn(
        "grid h-7 w-5 place-items-center text-ink-soft opacity-80",
        className,
      )}
    >
      {icon === "v-strip" && (
        <div className="flex h-full w-3 flex-col gap-0.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={cn(base, "h-full w-full")} />
          ))}
        </div>
      )}
      {icon === "v-tight" && (
        <div className="flex h-full w-3 flex-col gap-px">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={cn(base, "h-full w-full")} />
          ))}
        </div>
      )}
      {icon === "grid-2x2" && (
        <div className="grid h-5 w-5 grid-cols-2 grid-rows-2 gap-0.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={base} />
          ))}
        </div>
      )}
      {icon === "h-strip" && (
        <div className="flex h-3 w-5 gap-0.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={cn(base, "h-full w-full")} />
          ))}
        </div>
      )}
      {icon === "grid-3" && (
        <div className="grid h-5 w-5 grid-cols-2 grid-rows-2 gap-0.5">
          <div className={cn(base, "row-span-2")} />
          <div className={base} />
          <div className={base} />
        </div>
      )}
      {icon === "grid-2x3" && (
        <div className="grid h-6 w-4 grid-cols-2 grid-rows-3 gap-0.5">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={base} />
          ))}
        </div>
      )}
    </div>
  );
}
