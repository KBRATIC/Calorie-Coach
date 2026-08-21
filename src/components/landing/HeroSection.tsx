"use client";

import { Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  const reduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: reduceMotion ? 0 : 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 120, damping: 20 },
    },
  };

  return (
    <section className="relative mx-auto max-w-[120rem] px-4 pt-16 pb-20 md:pt-28 md:pb-32 md:px-10">
      <div className="flex flex-col items-center justify-center max-w-5xl mx-auto">
        {/* Text Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center w-full"
        >
          <motion.h1
            variants={itemVariants}
            className="max-w-4xl mx-auto text-5xl leading-[1.08] tracking-tight font-display font-bold md:text-6xl lg:text-7xl xl:text-[5rem]"
          >
            Seu corpo merece{" "}
            <span className="text-primary relative inline-block">
              dados
              <span className="absolute -bottom-2 left-0 h-2 w-full bg-primary/25 rounded-full" />
            </span>
            ,{" "}
            <br className="hidden md:block" />
            não achismo.
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-6 max-w-2xl text-xl text-muted-foreground leading-relaxed mx-auto"
          >
            Calcule sua TMB, defina sua meta calórica e registre cada refeição.
            O app faz as contas por você.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Button
              asChild
              size="lg"
              className="gap-2 rounded-full h-14 px-10 text-lg shadow-glow hover:shadow-none transition-all active:scale-[0.98]"
            >
              <Link to="/auth">
                Começar agora
                <ArrowRight className="size-5" weight="bold" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="rounded-full h-14 px-10 text-lg bg-secondary/50 hover:bg-secondary border border-border/50 transition-all active:scale-[0.98]"
            >
              <Link to="/auth">Já tenho conta</Link>
            </Button>
          </motion.div>

          {/* Trust strip */}
          <motion.div
            variants={itemVariants}
            className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground font-medium"
          >
            {["Grátis para sempre", "Sem anúncios", "Dados protegidos"].map(
              (text) => (
                <span key={text} className="flex items-center gap-1.5">
                  <Check
                    className="size-4 text-primary"
                    weight="bold"
                  />
                  {text}
                </span>
              ),
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
