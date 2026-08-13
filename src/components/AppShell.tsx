import { useState, useEffect, Fragment } from "react";
import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Flame, CalendarRange, UserCog, LogOut, Table2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import useEmblaCarousel from "embla-carousel-react";
import { motion, useMotionValue, useTransform } from "motion/react";

import { TodayPage } from "@/routes/_authenticated/hoje";
import { FoodsPage } from "@/routes/_authenticated/alimentos";
import { HistoryPage } from "@/routes/_authenticated/historico";
import { ProfilePage } from "@/routes/_authenticated/perfil";
import { ChatDrawer } from "@/components/ChatDrawer";


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
  const [isChatOpen, setIsChatOpen] = useState(false);

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

  const scrollProgress = useMotionValue(0);

  useEffect(() => {
    if (!emblaApi) return;
    
    // Set initial position
    scrollProgress.set(emblaApi.scrollProgress());
    
    const onScroll = () => {
      scrollProgress.set(emblaApi.scrollProgress());
    };
    
    emblaApi.on("scroll", onScroll);
    emblaApi.on("reInit", onScroll);
    
    return () => {
      emblaApi.off("scroll", onScroll);
      emblaApi.off("reInit", onScroll);
    };
  }, [emblaApi, scrollProgress]);

  // Maps scroll progress 0 -> 1 to translateX 0% -> 400% with a gap in the middle (slot 2)
  const pillX = useTransform(scrollProgress, [0, 1/3, 2/3, 1], ["0%", "100%", "300%", "400%"]);

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
      
      <header className="liquid-glass sticky top-0 z-40 w-full">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/hoje" className="flex min-w-0 items-center gap-2">
            <img 
              src="/icon.png" 
              alt="KcalTrack Logo" 
              className="size-9 rounded-full shadow-[var(--shadow-glow)] object-cover"
            />
            <span className="text-display truncate text-lg">KcalTrack</span>
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
            <Button
              variant="outline"
              size="sm"
              className="hidden md:flex gap-2 rounded-full border-primary/50 text-primary hover:bg-primary/10"
              onClick={() => setIsChatOpen(true)}
            >
              <Sparkles className="size-4" />
              <span className="text-xs font-semibold">Assistente IA</span>
            </Button>
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="size-9 rounded-full" onClick={signOut}>
              <LogOut className="size-4" />
              <span className="sr-only">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="absolute inset-0 mx-auto w-full max-w-6xl overflow-hidden">
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

      <div className="absolute inset-x-0 bottom-6 z-40 mx-4 md:hidden">
        {/* FAB Assistente IA Central */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] z-50">
          <button
            onClick={() => setIsChatOpen(true)}
            className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-indigo-500 bg-[length:200%_auto] animate-[gradient_3s_linear_infinite] shadow-lg shadow-purple-500/30 transition-transform active:scale-95 hover:scale-105 border-4 border-background"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-indigo-500 bg-[length:200%_auto] animate-[gradient_3s_linear_infinite] blur opacity-60" />
            <Sparkles className="size-7 text-white relative z-10" />
          </button>
        </div>

        <nav className="liquid-glass rounded-full relative">
        <div className="relative flex items-center p-1.5">
          <div className="absolute inset-y-1.5 inset-x-1.5 pointer-events-none">
            <motion.div
              className="h-full w-1/5 rounded-full bg-primary shadow-[var(--shadow-glow)]"
              style={{ x: pillX }}
            />
          </div>
          {NAV.map((item, idx) => {
            const isActive = location.pathname === item.to || location.pathname.startsWith(item.to);
            return (
              <Fragment key={item.to}>
                {idx === 2 && (
                  <div className="w-full flex-shrink-0" />
                )}
                <Link
                  to={item.to}
                  className={`relative z-10 flex h-14 w-full flex-col items-center justify-center gap-1 rounded-full transition-colors ${
                    isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <item.icon className={`size-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`} />
                  <span className={`text-[10px] font-semibold tracking-wide transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                    {item.label}
                  </span>
                </Link>
              </Fragment>
            );
          })}
        </div>
      </nav>
      </div>

      <ChatDrawer open={isChatOpen} onOpenChange={setIsChatOpen} />
    </div>
  );
}
