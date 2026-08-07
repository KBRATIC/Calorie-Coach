import { createFileRoute, Link } from "@tanstack/react-router";
import { Flame, Calculator, CalendarRange, Search, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShinyText } from "@/components/reactbits/ShinyText";
import { Reveal } from "@/components/reactbits/Reveal";
import { SpotlightCard } from "@/components/reactbits/SpotlightCard";
import { CountUp } from "@/components/reactbits/CountUp";

const STATS = [
  { value: 1102, suffix: "", label: "Alimentos na base" },
  { value: 5, suffix: "", label: "Cenários de meta" },
  { value: 100, suffix: "%", label: "Cálculo Mifflin-St Jeor" },
] as const;


export const Route = createFileRoute("/")({
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

const FEATURES = [
  {
    icon: Calculator,
    title: "Calculadora de TMB",
    text: "Mifflin-St Jeor com seu sexo, idade, altura, peso e nível de atividade para achar seu gasto real.",
  },
  {
    icon: Flame,
    title: "Meta em qualquer cenário",
    text: "Déficit agressivo, cutting leve, manutenção, ganho de massa ou meta 100% manual.",
  },
  {
    icon: Search,
    title: "Mais de 1.100 alimentos",
    text: "Base pronta com pratos, frutas, carnes, bebidas e lanches — ou cadastre os seus.",
  },
  {
    icon: CalendarRange,
    title: "Semanal e mensal",
    text: "Média diária, dias dentro da meta e histórico completo do seu consumo.",
  },
];

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="aurora-layer" aria-hidden />
      <div className="grid-lines pointer-events-none absolute inset-0 -z-10 opacity-30" aria-hidden />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-glow)]">
            <Flame className="size-5" />
          </span>
          <span className="text-display truncate text-lg">
            <ShinyText>KcalTrack</ShinyText>
          </span>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link to="/auth">Entrar</Link>
        </Button>
      </header>

      <section className="mx-auto max-w-6xl px-4 pb-20 pt-10 md:pt-20">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            <Sparkles className="size-3.5" />
            Calorias sob controle
          </span>
        </Reveal>

        <Reveal delay={0.05}>
          <h1 className="mt-6 max-w-3xl text-5xl leading-[0.95] md:text-7xl">
            Sua meta calórica
            <span className="block text-primary">calculada, não chutada.</span>
          </h1>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Calcule sua taxa metabólica basal, escolha o objetivo — perder, manter ou ganhar peso — e
            registre cada alimento do dia. O resto é acompanhar a evolução.
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="gap-2 shadow-[var(--shadow-glow)]">
              <Link to="/auth">
                Criar minha conta grátis
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link to="/auth">Já tenho conta</Link>
            </Button>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={0.05 * i}>
              <SpotlightCard className="p-6">
                <p className="stat-number text-4xl text-primary">
                  <CountUp value={s.value} />
                  {s.suffix}
                </p>
                <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
                  {s.label}
                </p>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={0.05 * i}>
              <SpotlightCard className="h-full p-6">
                <span className="grid size-11 place-items-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
                  <f.icon className="size-5" />
                </span>
                <h2 className="mt-4 text-xl">{f.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/70 py-8">
        <p className="mx-auto max-w-6xl px-4 text-xs text-muted-foreground">
          Valores calóricos de referência baseados na Tabela de Calorias EndocrinoSaude. Este app não
          substitui orientação de nutricionista ou médico.
        </p>
      </footer>
    </div>
  );
}

