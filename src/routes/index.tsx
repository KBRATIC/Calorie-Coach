import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

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
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 z-40 w-full pt-4 md:pt-6 px-4 pointer-events-none flex justify-center"
      >
        <div className="flex w-full max-w-[90rem] items-center justify-between px-4 md:px-6 py-2.5 rounded-full bg-surface/70 backdrop-blur-2xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] pointer-events-auto transition-all">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/icon.png"
              alt="KcalTrack Logo"
              className="size-9 rounded-full shadow-lg object-cover transition-transform group-hover:scale-105"
            />
            <span className="font-display tracking-tight font-bold text-lg drop-shadow-sm text-foreground">
              KcalTrack
            </span>
          </Link>
          <Button
            asChild
            size="sm"
            className="rounded-full gap-1.5 px-5 transition-all hover:gap-2 active:scale-[0.98] shadow-glow"
          >
            <Link to="/auth">
              Começar grátis
              <ArrowRight weight="bold" />
            </Link>
          </Button>
        </div>
      </motion.header>

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
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="mx-auto max-w-[90rem] px-4 pb-20 md:px-10"
        >
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
        </motion.section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <motion.footer 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full px-4 pb-4 md:pb-8 pt-10"
      >
        <div className="mx-auto max-w-[90rem] rounded-3xl bg-surface/40 backdrop-blur-xl border border-border/50 [box-shadow:0_-20px_80px_-20px_#ffffff1f_inset] p-8 md:p-12">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
            <div className="flex flex-col items-center md:items-start gap-4">
              <Link to="/" className="flex items-center gap-2 group">
                <img src="/icon.png" alt="Logo" className="size-8 rounded-full opacity-80 group-hover:opacity-100 transition-opacity" />
                <span className="font-display font-bold tracking-tight text-xl opacity-80 group-hover:opacity-100 transition-opacity">KcalTrack</span>
              </Link>
              <p className="text-sm text-muted-foreground max-w-sm text-center md:text-left leading-relaxed">
                A forma mais inteligente de registrar sua alimentação e atingir seus objetivos de saúde com o poder da Inteligência Artificial.
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-end gap-x-8 gap-y-4">
              <Link to="/termos" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Termos de Uso
              </Link>
              <Link to="/privacidade" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Política de Privacidade
              </Link>
              <Link to="/cookies" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Política de Cookies
              </Link>
            </div>
          </div>
          
          <div className="w-full h-px bg-border/40 my-8" />
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground/60">
            <p>© {new Date().getFullYear()} KcalTrack. Todos os direitos reservados.</p>
            <p>Valores calóricos baseados na Tabela EndocrinoSaude.</p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
