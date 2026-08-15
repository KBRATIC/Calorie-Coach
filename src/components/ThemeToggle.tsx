import { useRef } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { Switch } from "@/components/ui/switch";
import { flushSync } from "react-dom";

/** Switch claro/escuro do topo do app. */
export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  const ref = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    if (!document.startViewTransition) {
      toggle();
      return;
    }

    const rect = ref.current?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const y = rect ? rect.top + rect.height / 2 : 0;
    const right = window.innerWidth - x;
    const bottom = window.innerHeight - y;
    const maxRadius = Math.hypot(Math.max(x, right), Math.max(y, bottom));

    document.documentElement.style.setProperty("--x", `${x}px`);
    document.documentElement.style.setProperty("--y", `${y}px`);
    document.documentElement.style.setProperty("--r", `${maxRadius}px`);

    document.startViewTransition(() => {
      flushSync(() => {
        toggle();
      });
    });
  };

  return (
    <div ref={ref} className="flex items-center gap-2 rounded-full border border-border/60 bg-secondary/40 px-2.5 py-1.5 transition-transform active:scale-95">
      <Sun className={`size-4 ${isDark ? "text-muted-foreground" : "text-primary"}`} />
      <div className="relative cursor-pointer" onClickCapture={(e) => { e.preventDefault(); handleToggle(); }}>
        <Switch checked={isDark} aria-label="Alternar tema claro e escuro" className="pointer-events-none" />
      </div>
      <Moon className={`size-4 ${isDark ? "text-primary" : "text-muted-foreground"}`} />
    </div>
  );
}
