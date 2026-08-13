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
  const [range, setRange] = useState<7 | 30>(7);
  const today = todayISO();
  const from = addDays(today, -(range - 1));

  const goalsQuery = useQuery({ queryKey: ["goals"], queryFn: fetchGoals });
  const entriesQuery = useQuery({
    queryKey: ["entries", from, today],
    queryFn: () => fetchEntries(from, today),
  });

  const goal = goalsQuery.data?.daily_calorie_goal ?? 2000;
  const entries = entriesQuery.data ?? [];

  const days = Array.from({ length: range }, (_, i) => addDays(from, i));
  const totals = days.map((d) => ({
    day: d,
    total: entries
      .filter((e) => e.consumed_on === d)
      .reduce((sum, e) => sum + Number(e.kcal), 0),
  }));

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
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={range === 7 ? "default" : "secondary"}
            onClick={() => setRange(7)}
          >
            Semana
          </Button>
          <Button
            size="sm"
            variant={range === 30 ? "default" : "secondary"}
            onClick={() => setRange(30)}
          >
            Mês
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="panel p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Consumo médio</p>
          <p className="stat-number text-3xl">{average} kcal</p>
        </div>
        <div className="panel p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Dias na meta</p>
          <p className="stat-number text-3xl">
            {onTarget}/{logged.length}
          </p>
        </div>
        <div className="panel p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Total do período</p>
          <p className="stat-number text-3xl">{total} kcal</p>
        </div>

        {/* Banco de Calorias */}
        {logged.length > 0 && (
          <div className={`panel p-6 sm:col-span-3 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4 border ${isPositive ? 'bg-primary/5 border-primary/20' : 'bg-destructive/5 border-destructive/20'}`}>
            <div className="relative z-10 flex-1">
              <p className={`flex items-center justify-center sm:justify-start gap-2 text-xs uppercase tracking-widest font-semibold ${isPositive ? 'text-primary' : 'text-destructive'}`}>
                <PiggyBank className="size-4" /> Saldo de Calorias
              </p>
              <div className="mt-2 flex items-center justify-center sm:justify-start gap-3">
                <h3 className={`text-4xl font-black tracking-tight ${isPositive ? 'text-primary' : 'text-destructive'}`}>
                  {isPositive ? '+' : ''}{Math.round(netBalance)} <span className="text-xl font-bold">kcal</span>
                </h3>
                <div className={`flex items-center justify-center size-8 rounded-full ${isPositive ? 'bg-primary/20 text-primary' : 'bg-destructive/20 text-destructive'}`}>
                  {isPositive ? <TrendingDown className="size-5" /> : <TrendingUp className="size-5" />}
                </div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground text-center sm:text-left max-w-md">
                {isPositive 
                  ? "Você tem um saldo positivo acumulado no período! Suas economias diárias te dão folga para a meta mensal." 
                  : "Você consumiu mais do que a meta neste período. Tente economizar nos próximos dias para equilibrar o saldo!"}
              </p>
            </div>
            
            {/* Decorative background icon */}
            <div className="hidden sm:block">
              {isPositive ? (
                <Sparkles className="size-24 opacity-10 text-primary" />
              ) : (
                <PiggyBank className="size-24 opacity-10 text-destructive" />
              )}
            </div>
            <PiggyBank className={`absolute -right-6 -bottom-6 size-48 opacity-[0.03] pointer-events-none ${isPositive ? 'text-primary' : 'text-destructive'}`} />
          </div>
        )}
      </div>

      {entriesQuery.isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="panel space-y-2 p-6">
          {totals.map((t) => (
            <div key={t.day} className="flex items-center gap-3">
              <span className="w-20 shrink-0 text-xs text-muted-foreground">
                {formatDayLabel(t.day)}
              </span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-secondary">
                <div
                  className={`h-full rounded-full ${t.total > goal ? "bg-destructive" : "bg-primary"}`}
                  style={{ width: `${Math.min((t.total / goal) * 100, 100)}%` }}
                />
              </div>
              <span className="stat-number w-16 shrink-0 text-right text-xs">
                {Math.round(t.total)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
