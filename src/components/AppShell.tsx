import { useState } from "react";
import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Flame, CalendarRange, UserCog, LogOut, Table2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ShinyText } from "@/components/reactbits/ShinyText";
import { ThemeToggle } from "@/components/ThemeToggle";



const NAV = [
  { to: "/hoje", label: "Hoje", icon: Flame },
  { to: "/alimentos", label: "Alimentos", icon: Table2 },
  { to: "/historico", label: "Histórico", icon: CalendarRange },
  { to: "/perfil", label: "Perfil", icon: UserCog },
] as const;


export function AppShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const dx = touchStart.x - touchEndX;
    const dy = touchStart.y - touchEndY;

    // Check if it's mostly a horizontal swipe and covers enough distance
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      // Find exact or partial match for current route
      const currentIndex = NAV.findIndex((n) => location.pathname === n.to || location.pathname.startsWith(n.to));
      if (currentIndex === -1) return;

      if (dx > 0) {
        // Swipe left -> Next tab
        if (currentIndex < NAV.length - 1) {
          navigate({ to: NAV[currentIndex + 1].to });
        }
      } else {
        // Swipe right -> Prev tab
        if (currentIndex > 0) {
          navigate({ to: NAV[currentIndex - 1].to });
        }
      }
    }
    setTouchStart(null);
  };

  return (
    <div 
      className="min-h-screen pb-24 md:pb-0"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="aurora-layer" aria-hidden />
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link to="/hoje" className="flex min-w-0 items-center gap-2">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-glow)]">
              <Flame className="size-5" />
            </span>
            <span className="text-display truncate text-lg">
              <ShinyText>KcalTrack</ShinyText>
            </span>
          </Link>


          <nav className="ml-6 hidden items-center gap-1 rounded-full border border-border/60 bg-secondary/40 p-1 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{
                  className:
                    "bg-primary text-primary-foreground shadow-[var(--shadow-glow)] hover:text-primary-foreground",
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" className="gap-2" onClick={signOut}>
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>

        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-background/95 backdrop-blur-xl md:hidden">
        <div className="grid grid-cols-4">

          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex flex-col items-center gap-1 py-3 text-xs font-medium text-muted-foreground"
              activeProps={{ className: "text-primary" }}
            >
              <item.icon className="size-5" />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
