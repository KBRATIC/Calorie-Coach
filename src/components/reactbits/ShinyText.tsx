import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Texto com varredura de brilho (estilo reactbits Shiny Text). */
export function ShinyText({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={cn("shiny-text", className)}>{children}</span>;
}
