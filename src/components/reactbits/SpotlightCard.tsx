import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
};

/** Card com brilho que segue o cursor (estilo reactbits Spotlight Card). */
export function SpotlightCard({ children, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
        el.style.setProperty("--my", `${e.clientY - rect.top}px`);
        el.style.setProperty("--spot-opacity", "1");
      }}
      onMouseLeave={() => ref.current?.style.setProperty("--spot-opacity", "0")}
      className={cn("spotlight-card", className)}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
}
