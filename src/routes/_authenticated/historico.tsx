import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
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
  const max = Math.max(goal, ...totals.map((t) => t.total), 1);

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
                  style={{ width: `${Math.min((t.total / max) * 100, 100)}%` }}
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
