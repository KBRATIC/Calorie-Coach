import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesBento } from "@/components/landing/FeaturesBento";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { StatsSection } from "@/components/landing/StatsSection";

export const Route = createFileRoute("/")(  {
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
      {/* Looping CSS animated aurora background */}
      <div className="aurora-layer" aria-hidden />

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md border-b border-border/40 bg-background/70">
        <div className="mx-auto flex max-w-[120rem] items-center justify-between px-4 py-3 md:px-10">
          <Link to="/" className="flex min-w-0 items-center gap-2 group">
            <img
              src="/icon.png"
              alt="KcalTrack Logo"
              className="size-9 rounded-full object-cover transition-transform group-hover:scale-105"
            />
            <span className="font-display tracking-tight font-bold text-lg">
              KcalTrack
            </span>
          </Link>
          <Button
            asChild
            size="sm"
            className="rounded-full gap-1.5 transition-all hover:gap-2 active:scale-[0.98]"
          >
            <Link to="/auth">
              Começar grátis
              <ArrowRight weight="bold" />
            </Link>
          </Button>
        </div>
      </header>

      {/* ── Main Content ───────────────────────────────────────────── */}
      <main className="relative z-10 flex flex-col">
        {/* 1. Hero — Split Screen */}
        <HeroSection />

        {/* 2. Features — Bento Grid Assimétrico */}
        <FeaturesBento />

        {/* 3. Como Funciona — Steps Verticais */}
        <HowItWorks />

        {/* 4. Estatísticas */}
        <StatsSection />

        {/* 5. CTA Final — Full-width */}
        <section className="mx-auto max-w-[120rem] px-4 pb-20 md:px-10">
          <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-surface/30 backdrop-blur-md p-8 text-center md:p-14">
            <div className="relative z-10 flex flex-col items-center gap-5">
              <h2 className="text-3xl font-display font-bold md:text-4xl lg:text-5xl">
                Comece a registrar hoje.
              </h2>
              <p className="max-w-md text-base text-muted-foreground leading-relaxed">
                Crie sua conta em segundos, calcule sua meta e veja resultados reais.
              </p>
              <Button
                asChild
                size="lg"
                className="mt-1 gap-2 rounded-full h-14 px-8 text-base shadow-glow active:scale-[0.98] transition-all"
              >
                <Link to="/auth">
                  Criar conta grátis
                  <ArrowRight weight="bold" className="size-5" />
                </Link>
              </Button>
            </div>
            {/* Background flare */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[250px] w-[500px] bg-primary/8 rounded-[100%] blur-[80px] pointer-events-none" />
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-border/20 py-8 relative z-10">
        <div className="mx-auto max-w-[120rem] px-4 md:px-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} KcalTrack. Valores calóricos baseados
            na Tabela EndocrinoSaude.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground font-medium">
            <Link
              to="/termos"
              className="hover:text-primary transition-colors"
            >
              Termos de Uso
            </Link>
            <Link
              to="/privacidade"
              className="hover:text-primary transition-colors"
            >
              Privacidade
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
