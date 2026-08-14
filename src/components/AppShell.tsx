import { useState, useEffect, Fragment } from "react";
import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Flame, CalendarRange, UserCog, LogOut, Table2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "motion/react";

import { TodayPage } from "@/routes/_authenticated/hoje";
import { FoodsPage } from "@/routes/_authenticated/alimentos";
import { HistoryPage } from "@/routes/_authenticated/historico";
import { ProfilePage } from "@/routes/_authenticated/perfil";
import { ChatDrawer } from "@/components/ChatDrawer";


const NAV = [
  { to: "/hoje", label: "Diário", icon: Flame },
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
      
      <header className="fixed top-0 z-40 w-full transition-all">
        <div className="mx-auto flex w-full max-w-[1800px] items-center justify-between px-4 py-4 md:px-8">
          <Link to="/hoje" className="flex items-center gap-3 active:scale-[0.98] transition-transform">
            <img 
              src="/icon.png" 
              alt="KcalTrack Logo" 
              className="size-8 rounded-full shadow-[var(--shadow-glow)] object-cover"
            />
            <span className="text-display font-medium tracking-tight text-xl">KcalTrack</span>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-white/5 bg-white/[0.02] p-1.5 md:flex backdrop-blur-3xl">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="relative rounded-full px-5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground active:scale-[0.98]"
                activeProps={{
                  className: "text-foreground",
                }}
              >
                {location.pathname === item.to || location.pathname.startsWith(item.to) ? (
                  <motion.div
                    layoutId="desktopTab"
                    className="absolute inset-0 rounded-full bg-white/10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                ) : null}
                <span className="relative z-10">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="size-9 rounded-full active:scale-[0.98] transition-transform" onClick={signOut}>
              <LogOut className="size-4 text-muted-foreground" />
              <span className="sr-only">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="absolute inset-0 mx-auto w-full max-w-[1800px] overflow-hidden">
        {isTab ? (
          <div className="embla h-full overflow-hidden" ref={emblaRef}>
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

      <div className="absolute inset-x-0 bottom-6 z-40 mx-4 md:hidden flex justify-center">
        <nav className="relative flex items-center p-1.5 overflow-hidden rounded-full border border-white/10 bg-surface/60 backdrop-blur-3xl shadow-2xl">
          {NAV.map((item, idx) => {
            const isActive = location.pathname === item.to || location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`relative z-10 flex h-14 w-[72px] flex-col items-center justify-center gap-1 rounded-full transition-colors active:scale-[0.95] ${
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeMobileTab"
                    className="absolute inset-0 rounded-full bg-white/10"
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  />
                )}
                <item.icon className={`relative z-10 size-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`} />
                <span className={`relative z-10 text-[10px] font-medium tracking-wide transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Floating AI Orb */}
      <div className="fixed bottom-28 right-6 z-50 md:bottom-8 md:right-8">
        <button
          onClick={() => setIsChatOpen(true)}
          className="group relative flex size-14 items-center justify-center rounded-full bg-primary/10 backdrop-blur-md border border-primary/20 text-primary shadow-[0_0_30px_rgb(0,0,0,0.1)] shadow-primary/20 transition-transform active:scale-[0.95] hover:scale-105 overflow-hidden"
        >
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl scale-150 animate-pulse" />
          <Sparkles className="size-6 relative z-10" />
        </button>
      </div>

      <ChatDrawer open={isChatOpen} onOpenChange={setIsChatOpen} />
    </div>
  );
}
