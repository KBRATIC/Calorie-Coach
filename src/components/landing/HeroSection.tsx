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
    <section className="relative mx-auto max-w-[90rem] px-4 pt-12 pb-16 md:pt-20 md:pb-24 md:px-10">
      <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
        {/* Left: Text Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center lg:text-left"
        >
          <motion.h1
            variants={itemVariants}
            className="max-w-2xl mx-auto lg:mx-0 text-4xl leading-[1.08] tracking-tight font-display font-bold md:text-5xl lg:text-6xl"
          >
            Seu corpo merece{" "}
            <span className="text-primary relative inline-block">
              dados
              <span className="absolute -bottom-1 left-0 h-1.5 w-full bg-primary/25 rounded-full" />
            </span>
            ,{" "}
            <br className="hidden lg:block" />
            não achismo.
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-5 max-w-lg text-lg text-muted-foreground leading-relaxed mx-auto lg:mx-0"
          >
            Calcule sua TMB, defina sua meta calórica e registre cada refeição.
            O app faz as contas por você.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-3"
          >
            <Button
              asChild
              size="lg"
              className="gap-2 rounded-full h-13 px-8 text-base shadow-glow hover:shadow-none transition-all active:scale-[0.98]"
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
              className="rounded-full h-13 px-8 text-base bg-secondary/50 hover:bg-secondary border border-border/50 transition-all active:scale-[0.98]"
            >
              <Link to="/auth">Já tenho conta</Link>
            </Button>
          </motion.div>

          {/* Trust strip */}
          <motion.div
            variants={itemVariants}
            className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-sm text-muted-foreground font-medium"
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

        {/* Right: Phone Mockup Image */}
        <motion.div
          initial={
            reduceMotion
              ? { opacity: 1 }
              : { opacity: 0, scale: 0.92, y: 40 }
          }
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            duration: 0.9,
            type: "spring",
            stiffness: 80,
            damping: 18,
            delay: 0.3,
          }}
          className="mt-12 lg:mt-0 flex justify-center lg:justify-end"
        >
          <div className="relative rounded-[2.5rem] border border-border/40 bg-surface/20 backdrop-blur-md p-3 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
            <img
              src="/hero-mockup.jpg"
              alt="Interface do KcalTrack mostrando dashboard com anel de calorias, registro de refeições e gráfico semanal"
              className="w-64 md:w-72 lg:w-96 rounded-[1.8rem] object-cover"
              width={384}
              height={427}
              loading="eager"
            />
            {/* Glow behind phone */}
            <div className="absolute -inset-8 -z-10 bg-primary/10 blur-[60px] rounded-full pointer-events-none" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
