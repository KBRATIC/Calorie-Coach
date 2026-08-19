"use client";

import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Lightning, BowlFood } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { Area, AreaChart, CartesianGrid, XAxis, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";

const chartData = [
  { day: "Seg", kcal: 1820, limit: 2100 },
  { day: "Ter", kcal: 2050, limit: 2100 },
  { day: "Qua", kcal: 1650, limit: 2100 },
  { day: "Qui", kcal: 2200, limit: 2100 },
  { day: "Sex", kcal: 1900, limit: 2100 },
  { day: "Sáb", kcal: 2400, limit: 2100 },
  { day: "Dom", kcal: 1750, limit: 2100 },
];

export function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 20 },
    },
  };

  return (
    <section className="mx-auto max-w-7xl px-4 pt-16 pb-20 md:pt-32 md:px-10 lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
      {/* Left side: Kinetic Typography */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center lg:text-left"
      >
        <motion.p variants={itemVariants} className="eyebrow mb-6 flex items-center justify-center lg:justify-start gap-2">
          <Lightning weight="fill" className="text-primary size-4" />
          Controle inteligente de calorias
        </motion.p>
        
        <motion.h1 variants={itemVariants} className="max-w-4xl text-5xl leading-[1.05] tracking-tight font-display font-bold md:text-6xl lg:text-7xl">
          Seu corpo merece <br className="hidden lg:block"/>
          <span className="text-primary relative inline-block">
            dados
            <div className="absolute -bottom-2 left-0 h-2 w-full bg-primary/20 -skew-x-12" />
          </span>, não achismo.
        </motion.h1>
        
        <motion.p variants={itemVariants} className="mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed mx-auto lg:mx-0">
          Calcule sua TMB com fórmulas reais, defina sua meta e registre cada
          refeição. O app faz as contas e te mostra se está no caminho.
        </motion.p>

        <motion.div variants={itemVariants} className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-4">
          <Button asChild size="lg" className="gap-2 rounded-full h-14 px-8 text-base shadow-glow hover:shadow-none transition-shadow">
            <Link to="/auth">
              Começar agora
              <ArrowRight className="size-5" weight="bold" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="rounded-full h-14 px-8 text-base bg-secondary/50 hover:bg-secondary border border-border/50">
            <Link to="/auth">Já tenho conta</Link>
          </Button>
        </motion.div>

        {/* Trust strip */}
        <motion.div variants={itemVariants} className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-sm text-muted-foreground font-medium">
          <span className="flex items-center gap-2"><Check className="size-4 text-primary" weight="bold" /> Grátis para sempre</span>
          <span className="flex items-center gap-2"><Check className="size-4 text-primary" weight="bold" /> Sem anúncios</span>
          <span className="flex items-center gap-2"><Check className="size-4 text-primary" weight="bold" /> Dados protegidos</span>
        </motion.div>
      </motion.div>

      {/* Right side: Abstract App Dashboard Preview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, rotateY: 15, rotateX: 5 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0, rotateX: 0 }}
        transition={{ duration: 1, type: "spring", bounce: 0.4, delay: 0.2 }}
        className="mt-16 lg:mt-0 relative perspective-1000"
      >
        <div className="relative rounded-2xl border border-border/50 bg-surface/50 p-2 shadow-2xl backdrop-blur-xl">
          {/* Fake MacOS header */}
          <div className="flex items-center gap-2 px-3 py-2 pb-4">
            <div className="size-3 rounded-full bg-destructive/80" />
            <div className="size-3 rounded-full bg-warning/80" />
            <div className="size-3 rounded-full bg-success/80" />
          </div>

          <div className="rounded-xl border border-border/30 bg-background/50 p-6 flex flex-col gap-6">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">Visão Geral (Semana)</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-4xl font-display font-bold tabular-nums tracking-tight">13.770</h3>
                  <span className="text-sm text-primary font-medium">kcal totais</span>
                </div>
              </div>
              <div className="h-10 px-3 flex items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-medium">
                Meta: 2.100 / dia
              </div>
            </div>

            <div className="h-48 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorKcal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dy={10} />
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <Area type="monotone" dataKey="kcal" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorKcal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-3 mt-2">
               <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/40">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded bg-primary/20 flex items-center justify-center text-primary"><BowlFood size={16} weight="fill"/></div>
                    <div>
                      <p className="text-sm font-medium">Almoço</p>
                      <p className="text-xs text-muted-foreground">Arroz, feijão e frango grelhado</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-primary">620 kcal</span>
               </div>
            </div>
          </div>

          <div className="absolute -left-6 -bottom-6 h-32 w-32 bg-primary/20 blur-[50px] rounded-full pointer-events-none" />
          <div className="absolute -right-6 -top-6 h-40 w-40 bg-blue-500/20 blur-[60px] rounded-full pointer-events-none" />
        </div>
      </motion.div>
    </section>
  );
}
