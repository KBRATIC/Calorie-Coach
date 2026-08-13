import { createFileRoute, Link } from "@tanstack/react-router";
import { Flame, Calculator, CalendarRange, Search, ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    title: "TMB com precisão",
    text: "Mifflin-St Jeor ou Katch-McArdle se informar seu percentual de gordura. Nada de chute.",
  },
  {
    icon: Flame,
    title: "5 cenários de meta",
    text: "Déficit agressivo, cutting leve, manutenção, ganho de massa ou valor personalizado.",
  },
  {
    icon: Search,
    title: "1.100+ alimentos",
    text: "Pratos, frutas, carnes, bebidas, lanches prontos — ou cadastre os seus.",
  },
  {
    icon: CalendarRange,
    title: "Acompanhamento real",
    text: "Saldo de calorias, média diária, dias na meta. Semana e mês.",
  },
];

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="aurora-layer" aria-hidden />

      {/* Header */}
      <header className="liquid-glass sticky top-0 z-40 w-full">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <img
              src="/icon.png"
              alt="KcalTrack Logo"
              className="size-9 rounded-full object-cover"
            />
            <span className="text-display truncate text-lg">KcalTrack</span>
          </Link>
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link to="/auth">Entrar</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-12 md:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <h1 className="text-4xl leading-[1.1] md:text-6xl lg:text-7xl">
              Controle de calorias
              <span className="block text-primary">que funciona de verdade.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base text-muted-foreground md:text-lg">
              Calcule sua TMB, defina quanto quer consumir por dia e registre cada refeição.
              O app faz as contas e te mostra se está no caminho.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="gap-2 rounded-full">
                <Link to="/auth">
                  Começar agora
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="rounded-full">
                <Link to="/auth">Já tenho conta</Link>
              </Button>
            </div>
          </div>

          {/* Stats card */}
          <div className="panel space-y-1 p-6">
            <div className="flex items-baseline justify-between border-b border-border/40 pb-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Base de alimentos</p>
                <p className="stat-number text-4xl text-primary">1.102</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Cenários de meta</p>
                <p className="stat-number text-4xl">5</p>
              </div>
            </div>
            <div className="pt-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Fórmula científica</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Mifflin-St Jeor com ajuste por nível de atividade, ou Katch-McArdle se souber
                seu percentual de gordura corporal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-2xl md:text-3xl">O que o KcalTrack faz por você</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="panel group p-5 transition-colors hover:border-primary/30">
              <span className="grid size-10 place-items-center rounded-xl border border-border/60 bg-secondary/50 text-primary transition-colors group-hover:bg-primary/10 group-hover:border-primary/40">
                <f.icon className="size-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="panel flex flex-col items-center gap-4 p-8 text-center md:p-12">
          <h2 className="text-2xl md:text-3xl">Pronto para começar?</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Crie sua conta em segundos, calcule sua meta e comece a registrar hoje.
          </p>
          <Button asChild size="lg" className="mt-2 gap-2 rounded-full">
            <Link to="/auth">
              Criar conta grátis
              <ChevronRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <p className="mx-auto max-w-6xl px-4 text-xs text-muted-foreground">
          Valores calóricos de referência baseados na Tabela de Calorias EndocrinoSaude. Este app não
          substitui orientação de nutricionista ou médico.
        </p>
      </footer>
    </div>
  );
}
