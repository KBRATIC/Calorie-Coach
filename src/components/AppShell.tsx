import { useState, useEffect, Fragment } from "react";
import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Flame, CalendarRange, UserCog, LogOut, Table2, Sparkles, ArrowUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import useEmblaCarousel from "embla-carousel-react";
import { motion, AnimatePresence } from "motion/react";

import { TodayPage } from "@/routes/_authenticated/hoje";
import { FoodsPage } from "@/routes/_authenticated/alimentos";
import { HistoryPage } from "@/routes/_authenticated/historico";
import { ProfilePage } from "@/routes/_authenticated/perfil";
import { ChatDrawer } from "@/components/ChatDrawer";


const NAV = [
  { to: "/hoje", label: "Diário", icon: Flame },
  { to: "/historico", label: "Histórico", icon: CalendarRange },
  { to: "/alimentos", label: "Alimentos", icon: Table2 },
  { to: "/perfil", label: "Perfil", icon: UserCog },
] as const;


export function AppShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setIsScrolled(e.currentTarget.scrollTop > 300);
  };

  const scrollToTop = () => {
    const containers = document.querySelectorAll('.overflow-y-auto');
    containers.forEach(container => {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

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
        const targetRoute = NAV[index]?.to;
        if (targetRoute) {
          navigate({ to: targetRoute, replace: true });
        }
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
      
      <header className="fixed top-0 z-40 w-full pt-4 md:pt-6 px-4 pointer-events-none flex justify-center">
        <div className="flex w-full max-w-[90rem] items-center justify-between px-4 py-2.5 rounded-full bg-surface/70 backdrop-blur-2xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] pointer-events-auto transition-all">
          <div className="flex items-center gap-3">
            <img 
              src="/icon.png" 
              alt="KcalTrack Logo" 
              className="size-9 rounded-full shadow-lg object-cover"
            />
            <span className="text-display font-medium tracking-tighter text-xl drop-shadow-sm text-foreground">KcalTrack</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-full p-1 bg-black/10 dark:bg-white/5 border border-white/5">
            <Button variant="ghost" size="icon" className="size-9 rounded-full active:scale-[0.95] transition-transform hover:bg-white/10 text-muted-foreground hover:text-foreground" onClick={signOut}>
              <LogOut className="size-4" />
              <span className="sr-only">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isScrolled && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed top-24 md:top-28 z-40 w-full px-4 pointer-events-none flex justify-center"
          >
            <Button
              onClick={scrollToTop}
              className="pointer-events-auto rounded-full h-11 px-5 bg-surface/70 backdrop-blur-2xl border border-primary/40 text-primary shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:bg-surface/90 hover:border-primary/60 transition-all active:scale-95 text-[13px] font-bold tracking-wide"
            >
              <ArrowUp className="size-4 mr-2" />
              VOLTAR AO TOPO
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="absolute inset-0 mx-auto w-full max-w-[1800px] overflow-hidden">
        {isTab ? (
          <div className="embla h-full overflow-hidden w-full" ref={emblaRef}>
            <div className="embla__container flex touch-pan-y transform-gpu will-change-transform h-full w-full">
              <div onScroll={handleScroll} className="embla__slide min-w-0 flex-[0_0_100%] max-w-full w-full h-full overflow-y-auto overscroll-contain transform-gpu will-change-transform no-scrollbar">
                <div className="px-4 pt-28 pb-40 md:pt-32 md:pb-32 min-h-full max-w-[90rem] mx-auto">
                  {activeIndex === 0 || (deferred && Math.abs(activeIndex - 0) <= 1) ? <TodayPage /> : null}
                </div>
              </div>
              <div onScroll={handleScroll} className="embla__slide min-w-0 flex-[0_0_100%] max-w-full w-full h-full overflow-y-auto overscroll-contain transform-gpu will-change-transform no-scrollbar">
                <div className="px-4 pt-28 pb-40 md:pt-32 md:pb-32 min-h-full max-w-[90rem] mx-auto">
                  {activeIndex === 1 || (deferred && Math.abs(activeIndex - 1) <= 1) ? <HistoryPage /> : null}
                </div>
              </div>
              <div onScroll={handleScroll} className="embla__slide min-w-0 flex-[0_0_100%] max-w-full w-full h-full overflow-y-auto overscroll-contain transform-gpu will-change-transform no-scrollbar">
                <div className="px-4 pt-28 pb-40 md:pt-32 md:pb-32 min-h-full max-w-[90rem] mx-auto">
                  {activeIndex === 2 || (deferred && Math.abs(activeIndex - 2) <= 1) ? <FoodsPage /> : null}
                </div>
              </div>
              <div onScroll={handleScroll} className="embla__slide min-w-0 flex-[0_0_100%] max-w-full w-full h-full overflow-y-auto overscroll-contain transform-gpu will-change-transform no-scrollbar">
                <div className="px-4 pt-28 pb-40 md:pt-32 md:pb-32 min-h-full max-w-[90rem] mx-auto">
                  {activeIndex === 3 || (deferred && Math.abs(activeIndex - 3) <= 1) ? <ProfilePage /> : null}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div onScroll={handleScroll} className="h-full overflow-y-auto overscroll-contain no-scrollbar">
            <div className="px-4 pt-28 pb-40 md:pt-32 md:pb-32 min-h-full max-w-[90rem] mx-auto">
              {children}
            </div>
          </div>
        )}
      </main>

      <div className="absolute inset-x-0 bottom-6 md:bottom-10 z-40 mx-4 flex justify-center pointer-events-none">
        <nav className="relative flex items-center p-2 md:p-3 gap-2 rounded-full bg-surface/90 backdrop-blur-md shadow-2xl pointer-events-auto border border-border">
          {NAV.map((item, idx) => {
            const isActive = location.pathname === item.to || location.pathname.startsWith(item.to);
            const navLink = (
              <Link
                key={item.to}
                to={item.to}
                className={`relative z-10 flex flex-col md:flex-row h-14 md:h-16 w-[72px] md:w-auto md:px-6 items-center justify-center gap-1.5 md:gap-3 rounded-full transition-colors hover:bg-white/[0.05] ${
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeDockTab"
                    className="absolute inset-0 rounded-full bg-white/10 shadow-inner"
                    transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                    style={{ borderRadius: 9999 }}
                  />
                )}
                <item.icon className={`relative z-10 size-5 md:size-6 transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100 active:scale-90'}`} />
                <span className={`relative z-10 text-[10px] md:text-sm font-medium tracking-wide transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0 md:opacity-100 md:w-auto h-0 md:h-auto overflow-hidden'}`}>
                  {item.label}
                </span>
              </Link>
            );

            if (idx === 1) {
              return (
                <Fragment key={item.to}>
                  {navLink}
                  <button
                    onClick={(e) => {
                      e.currentTarget.blur();
                      setIsChatOpen(true);
                    }}
                    className="group relative flex size-[52px] md:size-[60px] items-center justify-center rounded-full transition-transform active:scale-[0.95] mx-1 md:mx-2 shrink-0 shadow-xl"
                    aria-label="Assistente Inteligente"
                  >
                    {/* Hardware Accelerated Ambient Glow */}
                    <div className="absolute inset-[-6px] rounded-full bg-gradient-to-tr from-blue-600 via-purple-500 to-fuchsia-500 blur-lg animate-spin [animation-duration:6s] opacity-80 transform-gpu will-change-transform" />
                    
                    {/* Layer 1: Chaotic Reverse Spin */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-pink-500 blur-md animate-spin [animation-duration:4s] [animation-direction:reverse] transform-gpu will-change-transform" />
                    
                    {/* Layer 2: Pulse and Distort */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-bl from-cyan-400 via-purple-500 to-rose-500 blur-sm animate-pulse [animation-duration:3s] transform-gpu will-change-[opacity]" />
                    
                    {/* Sharp Solid Ring Edge */}
                    <div className="absolute inset-[1px] rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500" />

                    {/* The Dark Core (No backdrop-blur to save GPU rendering loops) */}
                    <div className="absolute inset-[2px] md:inset-[3px] bg-black/70 rounded-full z-10 flex items-center justify-center transition-transform group-hover:scale-[0.98] transform-gpu">
                      <Sparkles className="size-5 md:size-6 text-white/90 animate-pulse [animation-duration:3s] transform-gpu will-change-[opacity]" />
                    </div>
                  </button>
                </Fragment>
              );
            }

            return navLink;
          })}
        </nav>
      </div>

      <ChatDrawer open={isChatOpen} onOpenChange={setIsChatOpen} />
    </div>
  );
}
