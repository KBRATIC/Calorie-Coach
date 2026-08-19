import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesBento } from "@/components/landing/FeaturesBento";
import { InteractiveAurora } from "@/components/landing/InteractiveAurora";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KcalTrack — Controle de calorias e calculadora de TMB" },
      {
        name: "description",
        content:
          "Calcule sua taxa metabólica basal, defina metas de calorias para emagrecer ou ganhar peso e registre tudo que você come com controle semanal e mensal.",
      },
      { property: "og:title", content: "KcalTrack — Controle de calorias e calculadora de TMB" },
      {
        property: "og:description",
        content:
          "Calcule sua taxa metabólica basal, defina metas de calorias para emagrecer ou ganhar peso e registre tudo que você come com controle semanal e mensal.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/hoje", replace: true });
    });
  }, [navigate]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <InteractiveAurora />

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="liquid-glass sticky top-0 z-40 w-full backdrop-blur-md border-b border-border/40 bg-background/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-10">
          <Link to="/" className="flex min-w-0 items-center gap-2 group">
            <img
              src="/icon.png"
              alt="KcalTrack Logo"
              className="size-9 rounded-full object-cover transition-transform group-hover:scale-105"
            />
            <span className="font-display tracking-tight font-bold text-lg">KcalTrack</span>
          </Link>
          <Button asChild size="sm" className="rounded-full gap-1.5 transition-all hover:gap-2">
            <Link to="/auth">
              Começar grátis
              <ArrowRight weight="bold" />
            </Link>
          </Button>
        </div>
      </header>

      {/* ── Main Content ───────────────────────────────────────────── */}
      <main className="relative z-10 flex flex-col gap-16 md:gap-24">
        <HeroSection />
        <FeaturesBento />
      </main>

      {/* ── CTA ────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-20 mt-10 md:px-10">
        <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-surface/30 backdrop-blur-md p-8 text-center md:p-16">
          <div className="relative z-10 flex flex-col items-center gap-6">
            <h2 className="text-3xl font-display font-bold md:text-5xl">Pronto para começar?</h2>
            <p className="max-w-md text-base text-muted-foreground md:text-lg">
              Crie sua conta em segundos, calcule sua meta e comece a registrar hoje.
            </p>
            <Button asChild size="lg" className="mt-2 gap-2 rounded-full h-14 px-8 text-base shadow-glow">
              <Link to="/auth">
                Criar conta grátis
                <ArrowRight weight="bold" className="size-5" />
              </Link>
            </Button>
          </div>
          {/* Subtle background flare */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[600px] bg-primary/10 rounded-[100%] blur-[80px] pointer-events-none" />
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-border/20 py-8 relative z-10">
        <div className="mx-auto max-w-7xl px-4 md:px-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} KcalTrack. Valores calóricos baseados na Tabela EndocrinoSaude.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground font-medium">
            <Link to="/termos" className="hover:text-primary transition-colors">Termos de Uso</Link>
            <Link to="/privacidade" className="hover:text-primary transition-colors">Privacidade</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
