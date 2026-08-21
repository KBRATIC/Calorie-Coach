"use client";

import {
  Calculator,
  Target,
  ForkKnife,
} from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";

const steps = [
  {
    number: "1",
    icon: Calculator,
    title: "Calcule sua TMB",
    description:
      "Informe peso, altura, idade e nível de atividade. Usamos Mifflin-St Jeor para gerar seu gasto calórico real.",
  },
  {
    number: "2",
    icon: Target,
    title: "Defina sua meta",
    description:
      "Escolha entre cutting, manutenção ou lean bulk. O app ajusta automaticamente suas calorias diárias.",
  },
  {
    number: "3",
    icon: ForkKnife,
    title: "Registre suas refeições",
    description:
      "Busque alimentos na base de 1.102 itens, adicione ao diário e acompanhe o saldo do dia.",
  },
];

export function HowItWorks() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="mx-auto max-w-[120rem] px-4 py-16 md:py-24 md:px-10">
      <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl text-foreground font-display text-center">
        Como funciona
      </h2>
      <p className="mt-3 text-base text-muted-foreground max-w-md mx-auto text-center leading-relaxed">
        Três passos para assumir o controle da sua nutrição.
      </p>

      <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
        {steps.map((step, i) => (
          <motion.div
            key={step.number}
            initial={
              reduceMotion
                ? { opacity: 1 }
                : { opacity: 0, y: 24 }
            }
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: 0.6,
              delay: i * 0.1,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative flex flex-col items-center text-center md:items-start md:text-left"
          >
            {/* Step number */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-5xl md:text-6xl font-display font-bold text-primary/20 leading-none tabular-nums">
                {step.number}
              </span>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <step.icon className="size-5" weight="duotone" />
              </div>
            </div>

            <h3 className="text-xl font-semibold text-foreground font-display">
              {step.title}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-xs">
              {step.description}
            </p>

            {/* Connector line (desktop only, not on last) */}
            {i < steps.length - 1 && (
              <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-border to-transparent -translate-x-4" />
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
