import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Flame, CalendarRange, UserCog, LogOut, Table2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ShinyText } from "@/components/reactbits/ShinyText";
import { ThemeToggle } from "@/components/ThemeToggle";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "motion/react";

import { TodayPage } from "@/routes/_authenticated/hoje";
import { FoodsPage } from "@/routes/_authenticated/alimentos";
import { HistoryPage } from "@/routes/_authenticated/historico";
import { ProfilePage } from "@/routes/_authenticated/perfil";


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

  const [emblaRef, emblaApi] = useEmblaCarousel({
    axis: "x",
    loop: false,
    skipSnaps: false,
  });

  // Sync URL to Carousel Slide
  useEffect(() => {
    if (!emblaApi) return;
    const currentIndex = NAV.findIndex((n) => location.pathname === n.to || location.pathname.startsWith(n.to));
    if (currentIndex !== -1 && currentIndex !== emblaApi.selectedScrollSnap()) {
      emblaApi.scrollTo(currentIndex);
    }
  }, [emblaApi, location.pathname]);

  // Sync Carousel Slide to URL
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      const index = emblaApi.selectedScrollSnap();
      const currentPathIndex = NAV.findIndex((n) => location.pathname === n.to || location.pathname.startsWith(n.to));
      if (index !== currentPathIndex) {
        navigate({ to: NAV[index].to, replace: true });
      }
    };
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, navigate, location.pathname]);

  const [deferred, setDeferred] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setDeferred(true), 150);
    return () => clearTimeout(timer);
  }, []);

  const activeIndex = NAV.findIndex((n) => location.pathname === n.to || location.pathname.startsWith(n.to));
  const isTab = activeIndex !== -1;

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="fixed inset-0 overflow-hidden">
      <div className="aurora-layer" aria-hidden />
      
      <header className="liquid-glass absolute top-4 inset-x-0 z-40 mx-4 rounded-full md:mx-auto md:max-w-6xl">
        <div className="mx-auto flex items-center justify-between px-4 py-2.5">
          <Link to="/hoje" className="flex min-w-0 items-center gap-2">
            <img 
              src="/icon.png" 
              alt="KcalTrack Logo" 
              className="size-9 rounded-full shadow-[var(--shadow-glow)] object-cover"
            />
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
            <Button variant="ghost" size="icon" className="size-9 rounded-full" onClick={signOut}>
              <LogOut className="size-4" />
              <span className="sr-only">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="absolute inset-0 mx-auto w-full max-w-6xl">
        {isTab ? (
          <div className="embla h-full" ref={emblaRef}>
            <div className="embla__container flex touch-pan-y transform-gpu will-change-transform h-full">
              <div className="embla__slide min-w-0 flex-[0_0_100%] h-full overflow-y-auto overscroll-contain transform-gpu will-change-transform no-scrollbar">
                <div className="px-4 pt-28 pb-32 md:pt-24 md:pb-8 min-h-full">
                  {activeIndex === 0 || deferred ? <TodayPage /> : null}
                </div>
              </div>
              <div className="embla__slide min-w-0 flex-[0_0_100%] h-full overflow-y-auto overscroll-contain transform-gpu will-change-transform no-scrollbar">
                <div className="px-4 pt-28 pb-32 md:pt-24 md:pb-8 min-h-full">
                  {activeIndex === 1 || deferred ? <FoodsPage /> : null}
                </div>
              </div>
              <div className="embla__slide min-w-0 flex-[0_0_100%] h-full overflow-y-auto overscroll-contain transform-gpu will-change-transform no-scrollbar">
                <div className="px-4 pt-28 pb-32 md:pt-24 md:pb-8 min-h-full">
                  {activeIndex === 2 || deferred ? <HistoryPage /> : null}
                </div>
              </div>
              <div className="embla__slide min-w-0 flex-[0_0_100%] h-full overflow-y-auto overscroll-contain transform-gpu will-change-transform no-scrollbar">
                <div className="px-4 pt-28 pb-32 md:pt-24 md:pb-8 min-h-full">
                  {activeIndex === 3 || deferred ? <ProfilePage /> : null}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto overscroll-contain no-scrollbar">
            <div className="px-4 pt-28 pb-32 md:pt-24 md:pb-8 min-h-full">
              {children}
            </div>
          </div>
        )}
      </main>

      <nav className="liquid-glass absolute inset-x-0 bottom-6 z-40 mx-4 rounded-full md:hidden">
        <div className="flex items-center justify-around p-1.5">
          {NAV.map((item) => {
            const isActive = location.pathname === item.to || location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`relative flex h-14 w-full flex-col items-center justify-center gap-1 rounded-full transition-colors ${
                  isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-pill"
                    className="absolute inset-0 rounded-full bg-primary shadow-[var(--shadow-glow)]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <div className="relative z-10 flex flex-col items-center gap-1">
                  <item.icon className={`size-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`} />
                  <span className={`text-[10px] font-semibold tracking-wide transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
