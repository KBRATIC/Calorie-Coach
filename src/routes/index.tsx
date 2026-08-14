import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowRight,
  Calculator,
  Flame,
  Search,
  CalendarRange,
  MessageSquare,
  Check,
  TrendingDown,
  TrendingUp,
  Minus,
} from "lucide-react";
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

/* ── Fake data for the preview card ────────────────────────────────── */
const WEEK_DATA = [
  { day: "Seg", kcal: 1820, pct: 87 },
  { day: "Ter", kcal: 2050, pct: 98 },
  { day: "Qua", kcal: 1650, pct: 79 },
  { day: "Qui", kcal: 2200, pct: 105 },
  { day: "Sex", kcal: 1900, pct: 90 },
  { day: "Sáb", kcal: 2400, pct: 114 },
  { day: "Dom", kcal: 1750, pct: 83 },
];

function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/hoje", replace: true });
    });
  }, [navigate]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="aurora-layer" aria-hidden />

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="liquid-glass sticky top-0 z-40 w-full">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-10">
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <img
              src="/icon.png"
              alt="KcalTrack Logo"
              className="size-9 rounded-full object-cover"
            />
            <span className="text-display truncate text-lg">KcalTrack</span>
          </Link>
          <Button asChild size="sm" className="rounded-full gap-1.5">
            <Link to="/auth">
              Começar grátis
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </header>

      {/* ── Hero (centered) ────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pt-16 pb-10 text-center md:pt-32 md:px-10">
        <p className="eyebrow mb-4">Controle inteligente de calorias</p>
        <h1 className="mx-auto max-w-4xl text-4xl leading-[1.08] md:text-6xl lg:text-[5rem]">
          Seu corpo merece{" "}
          <span className="text-primary">dados</span>, não achismo.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
          Calcule sua TMB com fórmulas reais, defina sua meta e registre cada
          refeição. O app faz as contas e te mostra se está no caminho.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
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

        {/* Trust strip */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><Check className="size-3.5 text-primary" /> Grátis para sempre</span>
          <span className="flex items-center gap-1.5"><Check className="size-3.5 text-primary" /> Sem anúncios</span>
          <span className="flex items-center gap-1.5"><Check className="size-3.5 text-primary" /> Dados protegidos</span>
        </div>
      </section>

      {/* ── App preview card ───────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-20 md:px-10">
        <div className="bento-card overflow-hidden p-5 md:p-8">
          <div className="grid gap-6 md:grid-cols-[auto_1fr]">
            {/* Calorie ring */}
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="relative grid size-40 place-items-center md:size-48">
                <svg viewBox="0 0 120 120" className="size-full -rotate-90">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="8" className="text-border/40" />
                  <circle
                    cx="60" cy="60" r="52"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${0.69 * 2 * Math.PI * 52} ${2 * Math.PI * 52}`}
                    className="text-primary"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="stat-number text-3xl text-primary md:text-4xl">1.450</span>
                  <span className="text-xs text-muted-foreground">/ 2.100 kcal</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Calorias de hoje</p>
            </div>

            {/* Food log preview */}
            <div className="min-w-0 space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Registro de hoje</p>
              {[
                { name: "Arroz, feijão e frango grelhado", kcal: 620, time: "12:30" },
                { name: "Banana com aveia", kcal: 280, time: "09:15" },
                { name: "Café com leite desnatado", kcal: 85, time: "07:00" },
              ].map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-xl border border-border/40 bg-secondary/30 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                  <span className="ml-3 shrink-0 text-sm font-semibold text-primary">
                    {item.kcal} kcal
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-border/30 pt-3 text-sm">
                <span className="text-muted-foreground">Restante</span>
                <span className="font-semibold text-primary">650 kcal</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bento features grid ────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-20 md:px-10">
        <h2 className="mb-8 text-center text-2xl md:text-3xl">
          O que o KcalTrack faz por você
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card 1 — Alimentos (tall) */}
          <div className="bento-card flex flex-col justify-between p-6">
            <div>
              <span className="grid size-10 place-items-center rounded-xl border border-border/60 bg-secondary/50 text-primary">
                <Search className="size-5" />
              </span>
              <p className="stat-number mt-6 text-5xl text-primary">1.102</p>
              <p className="mt-1 text-sm text-muted-foreground">alimentos na base de dados</p>
            </div>
            <div className="mt-6 flex items-center gap-2 rounded-xl border border-border/40 bg-secondary/30 px-3 py-2.5 text-sm text-muted-foreground">
              <Search className="size-4 shrink-0" />
              <span>Buscar alimento...</span>
            </div>
          </div>

          {/* Card 2 — Gráfico semanal (wide) */}
          <div className="bento-card col-span-1 p-6 sm:col-span-1 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="grid size-10 place-items-center rounded-xl border border-border/60 bg-secondary/50 text-primary">
                  <CalendarRange className="size-5" />
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Meta: 2.100 kcal/dia</p>
            </div>
            <p className="mt-4 text-base font-semibold">Acompanhamento semanal</p>
            <p className="text-sm text-muted-foreground">Saldo de calorias, média diária e dias na meta.</p>

            {/* Mini bar chart */}
            <div className="mt-6 flex items-end gap-2 md:gap-3">
              {WEEK_DATA.map((d) => (
                <div key={d.day} className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground">{d.kcal}</span>
                  <div
                    className="w-full rounded-md transition-all"
                    style={{
                      height: `${Math.max(d.pct * 0.8, 12)}px`,
                      backgroundColor: d.pct > 100
                        ? "oklch(0.75 0.18 50)" /* amber for over */
                        : "oklch(0.88 0.21 124)", /* primary green */
                    }}
                  />
                  <span className="text-[11px] font-medium text-muted-foreground">{d.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3 — Cenários de meta */}
          <div className="bento-card p-6 lg:col-span-2">
            <span className="grid size-10 place-items-center rounded-xl border border-border/60 bg-secondary/50 text-primary">
              <Flame className="size-5" />
            </span>
            <p className="mt-4 text-base font-semibold">5 cenários de meta</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Escolha o déficit ou superávit que combina com seu objetivo.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { label: "Cutting agressivo", icon: TrendingDown, variant: "destructive" as const },
                { label: "Cutting leve", icon: TrendingDown, variant: "default" as const },
                { label: "Manutenção", icon: Minus, variant: "default" as const },
                { label: "Lean bulk", icon: TrendingUp, variant: "default" as const },
                { label: "Personalizado", icon: Calculator, variant: "default" as const },
              ].map((s) => (
                <span
                  key={s.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-secondary/40 px-3 py-1.5 text-xs font-medium"
                >
                  <s.icon className="size-3" />
                  {s.label}
                </span>
              ))}
            </div>
          </div>

          {/* Card 4 — Fórmula TMB */}
          <div className="bento-card flex flex-col justify-between p-6">
            <div>
              <span className="grid size-10 place-items-center rounded-xl border border-border/60 bg-secondary/50 text-primary">
                <Calculator className="size-5" />
              </span>
              <p className="mt-4 text-base font-semibold">Fórmula científica</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Mifflin-St Jeor ou Katch-McArdle. Nada de chute.
              </p>
            </div>
            <p className="mt-4 text-xs font-mono text-muted-foreground/60 leading-relaxed">
              TMB = 10×peso + 6.25×altura − 5×idade − 161
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-20 md:px-10">
        <div className="bento-card flex flex-col items-center gap-4 p-8 text-center md:p-12">
          <h2 className="text-2xl md:text-3xl">Pronto para começar?</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Crie sua conta em segundos, calcule sua meta e comece a registrar hoje.
          </p>
          <Button asChild size="lg" className="mt-2 gap-2 rounded-full">
            <Link to="/auth">
              Criar conta grátis
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-border/40 py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} KcalTrack. Valores calóricos baseados na Tabela EndocrinoSaude.
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link to="/termos" className="hover:text-primary transition-colors">Termos de Uso</Link>
            <Link to="/privacidade" className="hover:text-primary transition-colors">Privacidade</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
