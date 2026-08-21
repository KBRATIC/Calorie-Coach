"use client";

import { useRef } from "react";
import {
  MagnifyingGlass,
  CalendarBlank,
  Fire,
  Calculator,
} from "@phosphor-icons/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";

gsap.registerPlugin(ScrollTrigger);

function MiniBarChart() {
  const bars = [87, 98, 79, 105, 90, 114, 83];
  return (
    <div className="absolute right-6 top-12 flex items-end gap-1.5 opacity-40 transition-opacity duration-500 group-hover:opacity-80">
      {bars.map((pct, i) => (
        <div key={i} className="flex w-5 flex-col items-center">
          <div
            className="w-full rounded-sm transition-all duration-500"
            style={{
              height: `${Math.max(pct * 0.5, 10)}px`,
              backgroundColor:
                pct > 100
                  ? "oklch(var(--color-destructive))"
                  : "oklch(var(--color-primary))",
            }}
          />
        </div>
      ))}
    </div>
  );
}

function FormulaOverlay() {
  return (
    <div className="absolute -bottom-6 -right-4 opacity-15 transition-all duration-500 group-hover:opacity-30 group-hover:-translate-y-2">
      <div className="font-mono text-xl font-bold leading-tight tracking-tighter text-primary">
        TMB =<br />
        10×P +<br />
        6.25×A<br />− 5×I
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
    background: (
      <>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/8 blur-3xl" />
      </>
    ),
    className: "lg:row-start-1 lg:row-end-4 lg:col-start-1 lg:col-end-2",
  },
  {
    Icon: CalendarBlank,
    name: "Acompanhamento Semanal",
    description:
      "Visão clara do seu saldo de calorias, média diária e dias na meta.",
    href: "/auth",
    cta: "Ver gráficos",
    background: (
      <>
        <div className="absolute inset-0 bg-gradient-to-bl from-chart-4/8 via-transparent to-transparent" />
        <MiniBarChart />
      </>
    ),
    className: "lg:col-start-2 lg:col-end-4 lg:row-start-1 lg:row-end-3",
  },
  {
    Icon: Fire,
    name: "Cenários de Meta",
    description:
      "Cutting, Manutenção ou Lean bulk. Adapta-se ao seu objetivo.",
    href: "/auth",
    cta: "Definir meta",
    background: (
      <>
        <div className="absolute inset-0 bg-gradient-to-tr from-warning/8 via-transparent to-transparent" />
        <div className="absolute -right-8 -bottom-8 h-28 w-28 rounded-full bg-warning/10 blur-2xl" />
      </>
    ),
    className: "lg:col-start-2 lg:col-end-3 lg:row-start-3 lg:row-end-4",
  },
  {
    Icon: Calculator,
    name: "Fórmula Científica",
    description:
      "Mifflin-St Jeor: cálculo preciso da sua TMB sem achismos.",
    href: "/auth",
    cta: "Calcular TMB",
    background: (
      <>
        <div className="absolute inset-0 bg-gradient-to-tl from-primary/6 via-transparent to-transparent" />
        <FormulaOverlay />
      </>
    ),
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
