"use client";

import { useEffect, useRef } from "react";
import { MagnifyingGlass, CalendarBlank, Fire, Calculator } from "@phosphor-icons/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    Icon: MagnifyingGlass,
    name: "Base de Dados Completa",
    description: "Mais de 1.102 alimentos cadastrados e validados.",
    href: "/auth",
    cta: "Buscar alimentos",
    background: <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />,
    className: "lg:row-start-1 lg:row-end-4 lg:col-start-1 lg:col-end-2",
  },
  {
    Icon: CalendarBlank,
    name: "Acompanhamento Semanal",
    description: "Visão clara do seu saldo de calorias, média diária e dias na meta.",
    href: "/auth",
    cta: "Ver gráficos",
    background: <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />,
    className: "lg:col-start-2 lg:col-end-4 lg:row-start-1 lg:row-end-3",
  },
  {
    Icon: Fire,
    name: "Cenários de Meta",
    description: "Cutting, Manutenção, Lean bulk. O app se adapta ao seu objetivo.",
    href: "/auth",
    cta: "Definir meta",
    background: <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-orange-500/10 blur-2xl" />,
    className: "lg:col-start-2 lg:col-end-3 lg:row-start-3 lg:row-end-4",
  },
  {
    Icon: Calculator,
    name: "Fórmula Científica",
    description: "Mifflin-St Jeor ou Katch-McArdle. Cálculo preciso da TMB.",
    href: "/auth",
    cta: "Calcular TMB",
    background: <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />,
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
          {features.map((feature, i) => (
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
