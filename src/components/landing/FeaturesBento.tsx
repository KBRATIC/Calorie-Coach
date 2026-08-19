"use client";

import { useEffect, useRef } from "react";
import { MagnifyingGlass, CalendarBlank, Fire, Calculator, TrendDown, TrendUp, Minus } from "@phosphor-icons/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";

gsap.registerPlugin(ScrollTrigger);

// Mini chart component for the background
function MiniChart() {
  const WEEK_DATA = [
    { day: "S", pct: 87 },
    { day: "T", pct: 98 },
    { day: "Q", pct: 79 },
    { day: "Q", pct: 105 },
    { day: "S", pct: 90 },
    { day: "S", pct: 114 },
    { day: "D", pct: 83 },
  ];

  return (
    <div className="absolute right-4 top-10 flex items-end gap-1.5 md:gap-2 opacity-50 transition-opacity group-hover:opacity-100">
      {WEEK_DATA.map((d, i) => (
        <div key={i} className="flex w-6 flex-col items-center gap-1">
          <div
            className="w-full rounded-sm transition-all duration-500"
            style={{
              height: `${Math.max(d.pct * 0.6, 12)}px`,
              backgroundColor: d.pct > 100 ? "oklch(var(--color-destructive))" : "oklch(var(--color-primary))",
            }}
          />
        </div>
      ))}
    </div>
  );
}

// Search mockup for the background
function SearchMockup() {
  return (
    <div className="absolute -right-4 -top-4 w-48 rotate-6 rounded-xl border border-border/40 bg-secondary/80 p-3 shadow-xl backdrop-blur-md transition-transform group-hover:rotate-0 group-hover:scale-105">
      <div className="flex items-center gap-2 rounded-md bg-background/50 px-2 py-1.5 text-xs text-muted-foreground border border-border/50">
        <MagnifyingGlass className="size-3" />
        <span>Frango...</span>
      </div>
      <div className="mt-2 space-y-1.5">
        <div className="h-2 w-full rounded-sm bg-primary/20" />
        <div className="h-2 w-4/5 rounded-sm bg-muted" />
        <div className="h-2 w-3/4 rounded-sm bg-muted" />
      </div>
    </div>
  );
}

// Badges mockup for the background
function GoalsMockup() {
  const badges = [
    { label: "Cutting", icon: TrendDown, color: "text-destructive" },
    { label: "Manutenção", icon: Minus, color: "text-muted-foreground" },
    { label: "Lean Bulk", icon: TrendUp, color: "text-success" },
  ];

  return (
    <div className="absolute -bottom-4 -right-2 flex flex-col gap-2 transition-transform group-hover:-translate-y-4">
      {badges.map((b, i) => (
        <div key={i} className="flex items-center gap-1.5 rounded-full border border-border/50 bg-background/80 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur-sm" style={{ transform: `translateX(${i * 10}px)`}}>
          <b.icon className={`size-3 ${b.color}`} weight="bold" />
          {b.label}
        </div>
      ))}
    </div>
  );
}

// Math mockup for the background
function MathMockup() {
  return (
    <div className="absolute -bottom-8 -right-8 opacity-20 transition-all duration-500 group-hover:opacity-40 group-hover:-translate-x-4 group-hover:-translate-y-4">
      <div className="font-mono text-2xl font-bold leading-none tracking-tighter text-primary">
        TMB = <br/> 
        10×P + <br/>
        6.25×A <br/>
        − 5×I
      </div>
    </div>
  );
}


const features = [
  {
    Icon: MagnifyingGlass,
    name: "Base de Dados Completa",
    description: "Mais de 1.102 alimentos cadastrados e validados na tabela TACO e IBGE.",
    href: "/auth",
    cta: "Buscar alimentos",
    background: (
      <>
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <SearchMockup />
      </>
    ),
    className: "lg:row-start-1 lg:row-end-4 lg:col-start-1 lg:col-end-2",
  },
  {
    Icon: CalendarBlank,
    name: "Acompanhamento Semanal",
    description: "Visão clara do seu saldo de calorias, média diária e dias na meta. Pare de adivinhar seu progresso.",
    href: "/auth",
    cta: "Ver gráficos",
    background: (
      <>
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />
        <MiniChart />
      </>
    ),
    className: "lg:col-start-2 lg:col-end-4 lg:row-start-1 lg:row-end-3",
  },
  {
    Icon: Fire,
    name: "Cenários de Meta",
    description: "Cutting, Manutenção ou Lean bulk. O app se adapta ao seu objetivo instantaneamente.",
    href: "/auth",
    cta: "Definir meta",
    background: (
      <>
        <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-orange-500/10 blur-2xl" />
        <GoalsMockup />
      </>
    ),
    className: "lg:col-start-2 lg:col-end-3 lg:row-start-3 lg:row-end-4",
  },
  {
    Icon: Calculator,
    name: "Fórmula Científica",
    description: "Utilizamos Mifflin-St Jeor. Cálculo preciso da sua TMB sem achismos.",
    href: "/auth",
    cta: "Calcular TMB",
    background: (
      <>
        <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
        <MathMockup />
      </>
    ),
    className: "lg:col-start-3 lg:col-end-4 lg:row-start-3 lg:row-end-4",
  },
];

export function FeaturesBento() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const cards = containerRef.current.querySelectorAll(".bento-card-item");
    
    gsap.fromTo(
      cards,
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 pt-10 md:px-10 overflow-hidden">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-5xl lg:text-6xl text-foreground font-display">
          O que o <span className="text-primary">KcalTrack</span> faz por você
        </h2>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Ferramentas premium projetadas para te dar controle absoluto sobre sua nutrição, sem complexidade.
        </p>
      </div>

      <div ref={containerRef}>
        <BentoGrid className="lg:grid-rows-3">
          {features.map((feature) => (
            <div key={feature.name} className={`bento-card-item ${feature.className}`}>
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
