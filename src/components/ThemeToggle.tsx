import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { Switch } from "@/components/ui/switch";

/** Switch claro/escuro do topo do app. */
export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="flex items-center gap-2 rounded-full border border-border/60 bg-secondary/40 px-2.5 py-1.5">
      <Sun className={`size-4 ${isDark ? "text-muted-foreground" : "text-primary"}`} />
      <Switch checked={isDark} onCheckedChange={toggle} aria-label="Alternar tema claro e escuro" />
      <Moon className={`size-4 ${isDark ? "text-primary" : "text-muted-foreground"}`} />
    </div>
  );
}
