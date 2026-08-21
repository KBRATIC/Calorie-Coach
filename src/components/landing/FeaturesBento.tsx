"use client";

import { useRef } from "react";
import {
  MagnifyingGlass,
  CalendarBlank,
  Fire,
  Calculator,
  BowlFood,
  CheckCircle,
} from "@phosphor-icons/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";

gsap.registerPlugin(ScrollTrigger);

/* --- MOCKUP 1: Base de Dados Completa --- */
function FoodDatabaseMockup() {
  const foods = [
    { name: "Frango Grelhado", kcal: 165, macro: "Proteína", color: "bg-primary", pct: 75 },
    { name: "Arroz Integral", kcal: 110, macro: "Carboidrato", color: "bg-yellow-500", pct: 60 },
    { name: "Ovo Cozido", kcal: 155, macro: "Proteína/Gordura", color: "bg-orange-500", pct: 50, desktopOnly: true },
  ];

  return (
    <div className="absolute inset-x-4 top-4 flex flex-col gap-2 pointer-events-none select-none transition-transform duration-500 group-hover:-translate-y-1">
      {/* Search Input Mockup */}
      <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-background/50 px-3 py-2 text-[10px] text-muted-foreground backdrop-blur-md">
        <MagnifyingGlass className="size-3.5 text-primary" />
        <span>Buscar alimentos (ex: frango)...</span>
      </div>

      {/* Floating Food Cards */}
      <div className="flex flex-col gap-1.5">
        {foods.map((food, i) => (
          <div
            key={i}
            className={`items-center justify-between rounded-lg border border-border/30 bg-surface/40 p-2.5 backdrop-blur-md transition-all duration-300 group-hover:bg-surface/60 ${
              food.desktopOnly ? "hidden sm:flex" : "flex"
            }`}
            style={{ transform: `translateY(${i * 2}px)` }}
          >
            <div className="flex items-center gap-2.5">
              <div className="flex size-7 items-center justify-center rounded bg-primary/10 text-primary">
                <BowlFood className="size-3.5" weight="fill" />
              </div>
              <div className="text-left">
                <p className="text-[11px] font-semibold text-foreground leading-none">{food.name}</p>
                <span className="text-[9px] text-muted-foreground">{food.macro}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-bold text-primary leading-none">{food.kcal} kcal</span>
              <div className="mt-1 h-1 w-12 overflow-hidden rounded-full bg-border/40">
                <div className={`h-full ${food.color}`} style={{ width: `${food.pct}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* --- MOCKUP 2: Acompanhamento Semanal --- */
function WeeklyChartMockup() {
  const weeklyData = [
    { day: "Seg", kcal: 1850, status: "meta" },
    { day: "Ter", kcal: 1980, status: "meta" },
    { day: "Qua", kcal: 2150, status: "excedido" },
    { day: "Qui", kcal: 1720, status: "meta" },
    { day: "Sex", kcal: 1900, status: "meta" },
    { day: "Sáb", kcal: 2300, status: "excedido" },
    { day: "Dom", kcal: 1800, status: "meta" },
  ];

  return (
    <div className="absolute inset-x-4 top-4 sm:inset-x-6 sm:top-6 flex flex-col gap-3 sm:gap-4 pointer-events-none select-none transition-transform duration-500 group-hover:-translate-y-2">
      {/* Stats header summary - Hidden on mobile to prevent overlapping */}
      <div className="hidden sm:flex items-center justify-between rounded-xl border border-border/30 bg-surface/30 p-3 backdrop-blur-md">
        <div className="text-left">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Média Semanal</p>
          <p className="text-lg font-bold text-foreground font-display">1.957 kcal</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1 text-xs text-primary font-semibold">
          <CheckCircle className="size-3.5" weight="fill" />
          5/7 dias na meta
        </div>
      </div>

      {/* Bar Chart mockup */}
      <div className="flex h-24 sm:h-36 items-end justify-between gap-1.5 sm:gap-2.5 rounded-xl border border-border/20 bg-surface/20 p-3 sm:p-4 pt-6 sm:pt-8 relative">
        {/* Target limit dotted line */}
        <div className="absolute inset-x-0 bottom-16 sm:bottom-24 border-t border-dashed border-primary/30 flex justify-end pr-2">
          <span className="text-[8px] sm:text-[9px] text-primary/60 font-mono -mt-2">Meta: 2000 kcal</span>
        </div>

        {weeklyData.map((data, i) => {
          const heightPct = Math.min((data.kcal / 2500) * 100, 100);
          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-1.5 h-full justify-end">
              <div
                className={`w-full rounded transition-all duration-500 ${
                  data.status === "excedido" ? "bg-destructive" : "bg-primary"
                }`}
                style={{
                  height: `${heightPct}%`,
                  opacity: 0.8,
                }}
              />
              <span className="text-[10px] font-semibold text-muted-foreground">{data.day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* --- MOCKUP 3: Cenários de Meta --- */
function GoalScenariosMockup() {
  return (
    <div className="absolute inset-x-4 top-4 flex flex-col gap-2 pointer-events-none select-none transition-transform duration-500 group-hover:-translate-y-1">
      {/* Fake Tabs Selector */}
      <div className="flex rounded-md bg-secondary/50 border border-border/30 p-0.5 text-center">
        <div className="flex-1 rounded bg-primary text-[9px] font-bold text-primary-foreground py-0.5 shadow-sm">
          Cutting
        </div>
        <div className="flex-1 text-[9px] font-semibold text-muted-foreground py-0.5">
          Manutenção
        </div>
        <div className="flex-1 text-[9px] font-semibold text-muted-foreground py-0.5">
          Lean Bulk
        </div>
      </div>

      {/* Target Preview */}
      <div className="flex items-center justify-between rounded-lg border border-border/30 bg-surface/30 p-2 backdrop-blur-md">
        <div className="text-left">
          <p className="text-[8px] text-muted-foreground leading-none">Calorias Recomendadas</p>
          <p className="text-[11px] font-bold text-primary mt-0.5">1.650 kcal / dia</p>
        </div>
        <div className="text-right text-[8px] text-muted-foreground">
          Déficit: <span className="text-destructive font-semibold">-500 kcal</span>
        </div>
      </div>
    </div>
  );
}

/* --- MOCKUP 4: Fórmula Científica --- */
function ScientificFormulaMockup() {
  return (
    <div className="absolute inset-x-4 top-4 flex flex-col gap-2 pointer-events-none select-none transition-transform duration-500 group-hover:-translate-y-1">
      {/* High-tech calculation display */}
      <div className="rounded-lg border border-border/30 bg-surface/40 p-2 backdrop-blur-md font-mono text-left relative overflow-hidden">
        <div className="text-[8px] text-muted-foreground uppercase tracking-wider mb-1">Mifflin-St Jeor</div>
        <div className="text-[9px] text-foreground leading-normal space-y-0.5">
          <p className="text-primary font-semibold">TMB = 10×Peso + 6.25×Alt − 5×Idade + 5</p>
          <div className="text-muted-foreground border-t border-border/20 pt-1 mt-1 text-[8px] flex justify-between">
            <span>P: 80kg</span>
            <span>A: 180cm</span>
            <span>I: 25a</span>
          </div>
          <p className="text-[10px] font-bold text-primary mt-0.5 text-right">TMB: 1.785 kcal</p>
        </div>
      </div>
    </div>
  );
}

const features = [
  {
    Icon: MagnifyingGlass,
    name: "Base de Dados Completa",
    description:
      "Mais de 1.102 alimentos cadastrados e validados na tabela TACO e IBGE.",
    href: "/auth",
    cta: "Buscar alimentos",
    background: <FoodDatabaseMockup />,
    className: "lg:row-start-1 lg:row-end-4 lg:col-start-1 lg:col-end-2",
  },
  {
    Icon: CalendarBlank,
    name: "Acompanhamento Semanal",
    description:
      "Visão clara do seu saldo de calorias, média diária e dias na meta.",
    href: "/auth",
    cta: "Ver gráficos",
    background: <WeeklyChartMockup />,
    className: "lg:col-start-2 lg:col-end-4 lg:row-start-1 lg:row-end-3",
  },
  {
    Icon: Fire,
    name: "Cenários de Meta",
    description:
      "Cutting, Manutenção ou Lean bulk. Adapta-se ao seu objetivo.",
    href: "/auth",
    cta: "Definir meta",
    background: <GoalScenariosMockup />,
    className: "lg:col-start-2 lg:col-end-3 lg:row-start-3 lg:row-end-4",
  },
  {
    Icon: Calculator,
    name: "Fórmula Científica",
    description:
      "Mifflin-St Jeor: cálculo preciso da sua TMB sem achismos.",
    href: "/auth",
    cta: "Calcular TMB",
    background: <ScientificFormulaMockup />,
    className: "lg:col-start-3 lg:col-end-4 lg:row-start-3 lg:row-end-4",
  },
];

export function FeaturesBento() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (prefersReduced) return;

      const cards =
        containerRef.current?.querySelectorAll(".bento-card-item");
      if (!cards?.length) return;

      gsap.from(cards, {
        opacity: 0,
        scale: 0.92,
        y: 24,
        duration: 0.5,
        stagger: {
          each: 0.08,
          from: "start",
        },
        ease: "back.out(1.4)",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      });
    },
    { scope: containerRef },
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:py-24 md:px-10 overflow-hidden">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl text-foreground font-display">
          O que o{" "}
          <span className="text-primary">KcalTrack</span>{" "}
          faz por você
        </h2>
        <p className="mt-3 text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Ferramentas pensadas para te dar controle real sobre sua nutrição.
        </p>
      </div>

      <div ref={containerRef}>
        <BentoGrid className="lg:grid-rows-3">
          {features.map((feature) => (
            <div
              key={feature.name}
              className={`bento-card-item ${feature.className}`}
            >
              <BentoCard
                name={feature.name}
                className="h-full w-full"
                background={feature.background}
                Icon={feature.Icon}
                description={feature.description}
                href={feature.href}
                cta={feature.cta}
              />
            </div>
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}
