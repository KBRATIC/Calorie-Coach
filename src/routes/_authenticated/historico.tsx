import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, PiggyBank, TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import { fetchEntries, fetchGoals } from "@/lib/api";
import { addDays, formatDayLabel, todayISO } from "@/lib/nutrition";
import { Button } from "@/components/ui/button";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";

export const Route = createFileRoute("/_authenticated/historico")({
  head: () => ({
    meta: [
      { title: "Histórico semanal e mensal — KcalTrack" },
      {
        name: "description",
        content:
          "Veja média diária, dias dentro da meta e o total de calorias consumidas na semana e no mês.",
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
    const date = new Date(y!, (m ?? 1) - 1, d ?? 1);
    const day = date.getDay();
    const diff = day === 0 ? 6 : day - 1;
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
      shortDate: d.substring(8, 10) + "/" + d.substring(5, 7),
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

  const netBalance = logged
    .filter((t) => t.day !== today)
    .reduce((sum, t) => sum + (goal - t.total), 0);
  const isPositive = netBalance >= 0;

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <p className="text-[10px] uppercase font-bold tracking-widest text-primary mb-1">Resultados</p>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">Histórico</h1>
          <p className="mt-2 text-[15px] text-muted-foreground">
            Sua meta diária é de <span className="text-foreground font-medium">{goal} kcal</span>
          </p>
        </div>
    <div className="flex gap-2 bento-card p-1.5 shadow-inner">
          <Button
            size="sm"
            variant="ghost"
            className={`rounded-xl px-6 transition-all ${period === "semana" ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-surface-strong"}`}
            onClick={() => setPeriod("semana")}
          >
            Semana
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className={`rounded-xl px-6 transition-all ${period === "mes" ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-surface-strong"}`}
            onClick={() => setPeriod("mes")}
          >
            Mês
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="bento-card p-6 flex flex-col justify-center transition-transform hover:scale-[1.02]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Média diária</p>
          <p className="stat-number text-4xl font-medium tracking-tight text-foreground">{average} <span className="text-sm text-muted-foreground font-normal">kcal</span></p>
        </div>
        <div className="bento-card p-6 flex flex-col justify-center transition-transform hover:scale-[1.02]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Dias na meta</p>
          <p className="stat-number text-4xl font-medium tracking-tight text-foreground">
            {onTarget}<span className="text-sm text-muted-foreground font-normal">/{logged.length}</span>
          </p>
        </div>
        <div className="bento-card p-6 flex flex-col justify-center transition-transform hover:scale-[1.02]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Total consumido</p>
          <p className="stat-number text-4xl font-medium tracking-tight text-foreground">{total} <span className="text-sm text-muted-foreground font-normal">kcal</span></p>
        </div>

        {/* Calorie Bank */}
        {logged.length > 0 && (
          <div className={`sm:col-span-3 backdrop-blur-3xl rounded-[32px] p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.2)] relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 border transition-all ${isPositive ? 'bg-primary/[0.03] border-primary/20 hover:bg-primary/[0.05]' : 'bg-destructive/[0.03] border-destructive/20 hover:bg-destructive/[0.05]'}`}>
            <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3 ${isPositive ? 'bg-primary/20' : 'bg-destructive/20'}`} />
            <div className="relative z-10 flex-1 w-full text-center sm:text-left">
              <p className={`flex items-center justify-center sm:justify-start gap-2 text-[10px] uppercase tracking-widest font-bold ${isPositive ? 'text-primary' : 'text-destructive'}`}>
                <PiggyBank className="size-4" /> Saldo de Calorias
              </p>
              <div className="mt-4 flex items-center justify-center sm:justify-start gap-4">
                <h3 className={`stat-number text-6xl font-medium tracking-tighter drop-shadow-sm ${isPositive ? 'text-primary' : 'text-destructive'}`}>
                  {isPositive ? '+' : ''}{Math.round(netBalance)} <span className="text-2xl font-normal opacity-80">kcal</span>
                </h3>
                <div className={`flex items-center justify-center size-14 rounded-full shadow-inner ${isPositive ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                  {isPositive ? <TrendingDown className="size-6" /> : <TrendingUp className="size-6" />}
                </div>
              </div>
              <p className="mt-4 text-[15px] text-muted-foreground/90 leading-relaxed max-w-xl mx-auto sm:mx-0">
                {isPositive 
                  ? "Você tem um saldo positivo acumulado no período! Suas economias diárias te dão folga para a meta." 
                  : "Você consumiu mais do que a meta neste período. Tente economizar nos próximos dias para equilibrar o saldo."}
              </p>
            </div>
            
            <div className="hidden sm:block relative z-10">
              {isPositive ? (
                <div className="bg-primary/5 p-8 rounded-full border border-primary/10 shadow-xl shadow-primary/5">
                  <Sparkles className="size-24 opacity-80 text-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.6)]" />
                </div>
              ) : (
                <div className="bg-destructive/5 p-8 rounded-full border border-destructive/10 shadow-xl shadow-destructive/5">
                  <PiggyBank className="size-24 opacity-80 text-destructive drop-shadow-[0_0_15px_rgba(var(--destructive),0.6)]" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bento-card p-6 sm:p-8 space-y-6">
        <h2 className="text-xl font-medium tracking-tight">Curva de Consumo</h2>
        
        {entriesQuery.isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={totals} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(var(--primary))" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="oklch(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="shortDate" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'oklch(var(--muted-foreground))' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'oklch(var(--muted-foreground))' }} 
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const overGoal = data.total > goal;
                      return (
                        <div className="bg-surface/90 border border-white/10 backdrop-blur-md p-4 rounded-2xl shadow-xl">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{formatDayLabel(data.day)}</p>
                          <p className={`stat-number text-2xl font-medium tracking-tight ${overGoal ? 'text-destructive' : 'text-primary'}`}>
                            {Math.round(data.total)} <span className="text-sm font-normal text-foreground">kcal</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                  cursor={{ stroke: 'oklch(var(--border))', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <ReferenceLine 
                  y={goal} 
                  stroke="oklch(var(--muted-foreground))" 
                  strokeDasharray="4 4" 
                  strokeOpacity={0.5}
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="oklch(var(--primary))" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorTotal)" 
                  activeDot={{ r: 6, fill: "oklch(var(--primary))", stroke: "oklch(var(--background))", strokeWidth: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
