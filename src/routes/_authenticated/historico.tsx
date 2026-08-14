import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, PiggyBank, TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import { fetchEntries, fetchGoals } from "@/lib/api";
import { addDays, formatDayLabel, todayISO } from "@/lib/nutrition";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/historico")({
  head: () => ({
    meta: [
      { title: "Histórico semanal e mensal — KcalTrack" },
      {
        name: "description",
        content:
          "Veja média diária, dias dentro da meta e o total de calorias consumidas na semana e no mês.",
      },
      { property: "og:title", content: "Histórico semanal e mensal — KcalTrack" },
      {
        property: "og:description",
        content: "Média diária, dias na meta e total de calorias por período.",
      },
    ],
  }),
  component: HistoryPage,
});

export function HistoryPage() {
  const [period, setPeriod] = useState<"semana" | "mes">("semana");
  const today = todayISO();
  
  let from = today;
  if (period === "semana") {
    const [y, m, d] = today.split("-").map(Number);
    // Use the exact date without timezone shifts
    const date = new Date(y!, (m ?? 1) - 1, d ?? 1);
    const day = date.getDay(); // 0 (Sun) to 6 (Sat)
    const diff = day === 0 ? 6 : day - 1; // Days to subtract to get to Monday
    from = addDays(today, -diff);
  } else if (period === "mes") {
    from = today.substring(0, 8) + "01";
  }

  const goalsQuery = useQuery({ queryKey: ["goals"], queryFn: fetchGoals });
  const entriesQuery = useQuery({
    queryKey: ["entries", from, today],
    queryFn: () => fetchEntries(from, today),
  });

  const goal = goalsQuery.data?.daily_calorie_goal ?? 2000;
  const entries = entriesQuery.data ?? [];

  const days: string[] = [];
  let current = from;
  while (current <= today) {
    days.push(current);
    current = addDays(current, 1);
  }

  const totals = days.map((d) => {
    const dayEntries = entries.filter((e) => e.consumed_on === d);
    return {
      day: d,
      total: dayEntries.reduce((sum, e) => sum + Number(e.kcal), 0),
      protein: dayEntries.reduce((sum, e) => sum + Number(e.protein || 0), 0),
      carbs: dayEntries.reduce((sum, e) => sum + Number(e.carbs || 0), 0),
      fat: dayEntries.reduce((sum, e) => sum + Number(e.fat || 0), 0),
    };
  });

  const logged = totals.filter((t) => t.total > 0);
  const average = logged.length
    ? Math.round(logged.reduce((s, t) => s + t.total, 0) / logged.length)
    : 0;
  const onTarget = logged.filter((t) => t.total <= goal).length;
  const total = Math.round(totals.reduce((s, t) => s + t.total, 0));
  // Bar reference removed — bars are now relative to daily goal

  // Calorie Bank: sum of (goal - consumed) for all logged days, excluding today
  const netBalance = logged
    .filter((t) => t.day !== today)
    .reduce((sum, t) => sum + (goal - t.total), 0);
  const isPositive = netBalance >= 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl">Histórico</h1>
          <p className="text-sm text-muted-foreground">
            Meta atual: {goal} kcal por dia
          </p>
        </div>
        <div className="flex gap-2 bg-secondary/30 p-1.5 rounded-xl border border-white/5 backdrop-blur-md">
          <Button
            size="sm"
            variant={period === "semana" ? "default" : "ghost"}
            className={`rounded-lg ${period !== "semana" && "text-muted-foreground hover:text-foreground hover:bg-white/10"}`}
            onClick={() => setPeriod("semana")}
          >
            Semana
          </Button>
          <Button
            size="sm"
            variant={period === "mes" ? "default" : "ghost"}
            className={`rounded-lg ${period !== "mes" && "text-muted-foreground hover:text-foreground hover:bg-white/10"}`}
            onClick={() => setPeriod("mes")}
          >
            Mês
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-white/[0.02] border border-white/5 backdrop-blur-3xl rounded-[32px] p-6 shadow-xl flex flex-col justify-center transition-all hover:bg-white/[0.03]">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Consumo médio</p>
          <p className="stat-number text-4xl font-medium tracking-tight text-foreground">{average} <span className="text-xl text-muted-foreground font-normal">kcal</span></p>
        </div>
        <div className="bg-white/[0.02] border border-white/5 backdrop-blur-3xl rounded-[32px] p-6 shadow-xl flex flex-col justify-center transition-all hover:bg-white/[0.03]">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Dias na meta</p>
          <p className="stat-number text-4xl font-medium tracking-tight text-foreground">
            {onTarget}<span className="text-xl text-muted-foreground font-normal">/{logged.length}</span>
          </p>
        </div>
        <div className="bg-white/[0.02] border border-white/5 backdrop-blur-3xl rounded-[32px] p-6 shadow-xl flex flex-col justify-center transition-all hover:bg-white/[0.03]">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Total do período</p>
          <p className="stat-number text-4xl font-medium tracking-tight text-foreground">{total} <span className="text-xl text-muted-foreground font-normal">kcal</span></p>
        </div>

        {/* Banco de Calorias */}
        {logged.length > 0 && (
          <div className={`sm:col-span-3 backdrop-blur-3xl rounded-[32px] p-8 sm:p-10 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 border ${isPositive ? 'bg-primary/[0.03] border-primary/20' : 'bg-destructive/[0.03] border-destructive/20'}`}>
            <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3 ${isPositive ? 'bg-primary/10' : 'bg-destructive/10'}`} />
            <div className="relative z-10 flex-1 w-full text-center sm:text-left">
              <p className={`flex items-center justify-center sm:justify-start gap-2 text-[11px] uppercase tracking-widest font-bold ${isPositive ? 'text-primary' : 'text-destructive'}`}>
                <PiggyBank className="size-4" /> Saldo de Calorias
              </p>
              <div className="mt-4 flex items-center justify-center sm:justify-start gap-4">
                <h3 className={`stat-number text-5xl sm:text-6xl font-medium tracking-tighter drop-shadow-sm ${isPositive ? 'text-primary' : 'text-destructive'}`}>
                  {isPositive ? '+' : ''}{Math.round(netBalance)} <span className="text-2xl font-normal opacity-80">kcal</span>
                </h3>
                <div className={`flex items-center justify-center size-12 rounded-full shadow-inner ${isPositive ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                  {isPositive ? <TrendingDown className="size-6" /> : <TrendingUp className="size-6" />}
                </div>
              </div>
              <p className="mt-4 text-[15px] text-muted-foreground/80 leading-relaxed max-w-lg mx-auto sm:mx-0">
                {isPositive 
                  ? "Você tem um saldo positivo acumulado no período! Suas economias diárias te dão folga para a meta mensal." 
                  : "Você consumiu mais do que a meta neste período. Tente economizar nos próximos dias para equilibrar o saldo!"}
              </p>
            </div>
            
            {/* Decorative background icon */}
            <div className="hidden sm:block relative z-10">
              {isPositive ? (
                <div className="bg-primary/5 p-6 rounded-full border border-primary/10 shadow-xl shadow-primary/5">
                  <Sparkles className="size-24 opacity-80 text-primary drop-shadow-[0_0_12px_rgba(var(--primary),0.5)]" />
                </div>
              ) : (
                <div className="bg-destructive/5 p-6 rounded-full border border-destructive/10 shadow-xl shadow-destructive/5">
                  <PiggyBank className="size-24 opacity-80 text-destructive drop-shadow-[0_0_12px_rgba(var(--destructive),0.5)]" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {entriesQuery.isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="bg-white/[0.02] border border-white/5 backdrop-blur-3xl rounded-[32px] p-6 sm:p-8 shadow-2xl space-y-4">
          {totals.map((t) => (
            <div key={t.day} className="flex flex-col gap-3 py-3 px-4 rounded-2xl transition-colors hover:bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <span className="w-24 shrink-0 text-[13px] font-medium text-muted-foreground uppercase tracking-widest">
                  {formatDayLabel(t.day)}
                </span>
                <div className="h-3.5 flex-1 overflow-hidden rounded-full bg-white/5 shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${t.total > goal ? "bg-gradient-to-r from-destructive/80 to-destructive shadow-[0_0_12px_rgba(var(--destructive),0.5)]" : "bg-gradient-to-r from-primary/80 to-primary shadow-[0_0_12px_rgba(var(--primary),0.5)]"}`}
                    style={{ width: `${Math.min((t.total / goal) * 100, 100)}%` }}
                  />
                </div>
                <span className="stat-number w-16 shrink-0 text-right text-base font-medium">
                  {Math.round(t.total)}
                </span>
              </div>
              
              {t.total > 0 && (
                <div className="flex items-center gap-5 pl-[112px] text-[11px] font-bold tracking-wider">
                  <span className="flex items-center gap-1.5 text-[oklch(0.6_0.15_250)] bg-white/5 px-2 py-0.5 rounded-full">
                    <div className="size-1.5 rounded-full bg-[oklch(0.6_0.15_250)] shadow-[0_0_8px_oklch(0.6_0.15_250_/_0.6)]" />
                    P: <span className="text-foreground font-semibold ml-0.5">{Math.round(t.protein)}g</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-[oklch(0.7_0.18_70)] bg-white/5 px-2 py-0.5 rounded-full">
                    <div className="size-1.5 rounded-full bg-[oklch(0.7_0.18_70)] shadow-[0_0_8px_oklch(0.7_0.18_70_/_0.6)]" />
                    C: <span className="text-foreground font-semibold ml-0.5">{Math.round(t.carbs)}g</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-[oklch(0.6_0.2_15)] bg-white/5 px-2 py-0.5 rounded-full">
                    <div className="size-1.5 rounded-full bg-[oklch(0.6_0.2_15)] shadow-[0_0_8px_oklch(0.6_0.2_15_/_0.6)]" />
                    G: <span className="text-foreground font-semibold ml-0.5">{Math.round(t.fat)}g</span>
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
