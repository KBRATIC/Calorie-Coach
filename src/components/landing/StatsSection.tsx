"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const stats = [
  {
    value: 1102,
    suffix: "+",
    label: "Alimentos cadastrados",
  },
  {
    value: 100,
    suffix: "%",
    label: "Gratuito, sem anúncios",
  },
  {
    value: 4,
    suffix: "",
    label: "Fórmulas científicas de TMB",
  },
];

export function StatsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const numberEls =
        sectionRef.current?.querySelectorAll<HTMLElement>(".stat-value");
      if (!numberEls?.length) return;

      numberEls.forEach((el) => {
        const target = parseInt(el.dataset.target || "0", 10);

        if (prefersReduced) {
          el.textContent = target.toLocaleString("pt-BR");
          return;
        }

        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 1.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            toggleActions: "play none none none",
          },
          onUpdate() {
            el.textContent = Math.round(obj.val).toLocaleString("pt-BR");
          },
        });
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="relative mx-auto max-w-[120rem] px-4 py-16 md:py-24 md:px-10"
    >
      {/* Subtle gradient background */}
      <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-b from-surface/50 to-transparent mx-4 md:mx-10" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 text-center">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-2 py-6">
            <div className="flex items-baseline gap-0.5">
              <span
                className="stat-value text-5xl md:text-6xl font-display font-bold tracking-tight text-foreground"
                data-target={stat.value}
              >
                0
              </span>
              {stat.suffix && (
                <span className="text-3xl md:text-4xl font-display font-bold text-primary">
                  {stat.suffix}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
