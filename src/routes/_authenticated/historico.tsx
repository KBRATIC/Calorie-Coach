import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, PiggyBank, TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import { fetchEntries, fetchGoals } from "@/lib/api";
import { addDays, formatDayLabel, todayISO, activeDayState, calcMacroGoals } from "@/lib/nutrition";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

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

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.9, rotateX: 5 },
  show: { opacity: 1, y: 0, scale: 1, rotateX: 0, transition: { type: "spring", stiffness: 250, damping: 15 } }
};

export function HistoryPage() {
  const navigate = useNavigate();
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
  const fallbackMacros = calcMacroGoals(goal);
  const goalProtein = goalsQuery.data?.protein_goal ?? fallbackMacros.protein;
  const goalCarbs = goalsQuery.data?.carbs_goal ?? fallbackMacros.carbs;
  const goalFat = goalsQuery.data?.fat_goal ?? fallbackMacros.fat;
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
    <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.05 }} className="space-y-6 pb-10">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-between gap-4">
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
      </motion.div>

      <div className="grid gap-3 sm:grid-cols-3">
        <motion.div variants={itemVariants} className="bento-card p-6 flex flex-col justify-center transition-transform hover:scale-[1.02]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Média diária</p>
          <p className="stat-number text-4xl font-medium tracking-tight text-foreground">{average} <span className="text-sm text-muted-foreground font-normal">kcal</span></p>
        </motion.div>
        <motion.div variants={itemVariants} className="bento-card p-6 flex flex-col justify-center transition-transform hover:scale-[1.02]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Dias na meta</p>
          <p className="stat-number text-4xl font-medium tracking-tight text-foreground">
            {onTarget}<span className="text-sm text-muted-foreground font-normal">/{logged.length}</span>
          </p>
        </motion.div>
        <motion.div variants={itemVariants} className="bento-card p-6 flex flex-col justify-center transition-transform hover:scale-[1.02]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Total consumido</p>
          <p className="stat-number text-4xl font-medium tracking-tight text-foreground">{total} <span className="text-sm text-muted-foreground font-normal">kcal</span></p>
        </motion.div>

        {/* Calorie Bank */}
        {logged.length > 0 && (
          <motion.div variants={itemVariants} className={`sm:col-span-3 backdrop-blur-3xl rounded-[32px] p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.2)] relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 border transition-all ${isPositive ? 'bg-primary/[0.03] border-primary/20 hover:bg-primary/[0.05]' : 'bg-destructive/[0.03] border-destructive/20 hover:bg-destructive/[0.05]'}`}>
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
                  {isPositive ? <TrendingUp className="size-6" /> : <TrendingDown className="size-6" />}
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
          </motion.div>
        )}
      </div>

      <div className="space-y-4">
        {entriesQuery.isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : (
          totals.slice().reverse().map((data) => {
            const overGoal = data.total > goal;
            return (
              <motion.div 
                key={data.day} 
                variants={itemVariants}
                className="bento-card p-5 sm:p-6 flex flex-col gap-4"
              >
                <button 
                  onClick={() => {
                    activeDayState.date = data.day;
                    navigate({ to: "/hoje" });
                  }}
                  className="flex justify-between items-center border-b border-white/5 pb-3 w-full text-left hover:opacity-70 transition-opacity active:scale-[0.98]"
                >
                  <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">
                    {formatDayLabel(data.day)}
                  </h3>
                  <span className={`text-sm font-medium tracking-tight ${overGoal ? 'text-destructive' : 'text-primary'}`}>
                    <span className="text-lg">{Math.round(data.total)}</span>
                    <span className="text-[10px] text-muted-foreground ml-1">/ {goal} kcal</span>
                  </span>
                </button>

                <div className="space-y-3">
                  <MiniProgressBar value={data.total} max={goal} color="bg-primary" label="Kcal" suffix="" />
                  <MiniProgressBar value={data.protein} max={goalProtein} color="bg-[oklch(0.6_0.15_250)]" label="Proteína" suffix="g" />
                  <MiniProgressBar value={data.carbs} max={goalCarbs} color="bg-[oklch(0.7_0.18_70)]" label="Carbo" suffix="g" />
                  <MiniProgressBar value={data.fat} max={goalFat} color="bg-[oklch(0.6_0.2_15)]" label="Gordura" suffix="g" />
                </div>

                {data.total > 0 && (
                  <div className={`p-3 rounded-2xl flex items-center justify-between border ${goal - data.total >= 0 ? 'bg-primary/[0.03] border-primary/10' : 'bg-destructive/[0.03] border-destructive/10'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center size-10 rounded-full shadow-inner ${goal - data.total >= 0 ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                        {goal - data.total >= 0 ? <TrendingUp className="size-5" /> : <TrendingDown className="size-5" />}
                      </div>
                      <div>
                        <p className={`text-[10px] uppercase font-bold tracking-widest ${goal - data.total >= 0 ? 'text-primary' : 'text-destructive'}`}>Saldo do dia</p>
                        <p className={`text-lg font-medium leading-none mt-1 ${goal - data.total >= 0 ? 'text-primary' : 'text-destructive'}`}>
                          {goal - data.total >= 0 ? '+' : ''}{Math.round(goal - data.total)} <span className="text-xs font-normal opacity-80">kcal</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}

function MiniProgressBar({ value, max, color, label, suffix }: { value: number, max: number, color: string, label: string, suffix: string }) {
  const pct = Math.min(100, (value / Math.max(1, max)) * 100);
  const isOver = value > max;
  return (
    <div className="flex items-center gap-3 w-full">
      <span className="w-16 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
        <motion.div 
           initial={{ width: 0 }}
           animate={{ width: `${pct}%` }}
           transition={{ type: "spring", stiffness: 60, damping: 15 }}
           className={`h-full rounded-full ${color}`}
        />
      </div>
      <span className={`w-16 text-right text-[11px] font-medium ${isOver ? 'text-destructive' : 'text-foreground'}`}>
        {Math.round(value)}<span className={`text-[9px] ml-0.5 ${isOver ? 'text-destructive/70' : 'text-muted-foreground'}`}>{suffix}</span>
      </span>
    </div>
  );
}

