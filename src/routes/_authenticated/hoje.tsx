import { useMemo, useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Trash2,
  Loader2,
  Zap,
  Undo2,
  Eraser,
  ChevronRight
} from "lucide-react";
import { Drawer } from "vaul";
import { motion, AnimatePresence } from "motion/react";
import { ptBR } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { Calendar } from "@/components/ui/calendar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


import { toast } from "sonner";
import {
  addEntries,
  addEntry,
  clearDay,
  clearMeal,
  copyDay,
  deleteEntry,
  fetchRecentFoods,
  fetchCustomFoods,
  fetchEntries,
  fetchGoals,
  searchFoods,
  undoLastEntry,
  type RecentFood,
  type SearchableFood,
} from "@/lib/api";
import { MEALS, mealLabel, todayISO, formatDayLabel, addDays, unitFor, activeDayState, calcMacroGoals } from "@/lib/nutrition";
import { useSession } from "@/hooks/useSession";
import { CalorieRing } from "@/components/CalorieRing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Onboarding } from "@/components/Onboarding";

export const Route = createFileRoute("/_authenticated/hoje")({
  head: () => ({
    meta: [
      { title: "Diário de hoje — KcalTrack" },
      {
        name: "description",
        content: "Registre os alimentos consumidos no dia e acompanhe quanto falta para a sua meta.",
      },
    ],
  }),
  component: TodayPage,
});

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.9, rotateX: 5 },
  show: { opacity: 1, y: 0, scale: 1, rotateX: 0, transition: { type: "spring", stiffness: 250, damping: 15 } }
};

export function TodayPage() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [day, setDayState] = useState(activeDayState.date);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    return activeDayState.subscribe(() => {
      setDayState((prev) => {
        if (prev !== activeDayState.date) {
          setDirection(activeDayState.date > prev ? 1 : -1);
          return activeDayState.date;
        }
        return prev;
      });
    });
  }, []);
  
  const setDay = (d: string) => {
    setDirection(d > day ? 1 : -1);
    setDayState(d);
    activeDayState.date = d;
  };
  
  const animateToToday = () => {
    setCalendarOpen(false);
    const target = todayISO();
    if (day === target) return;

    const isForward = day < target;
    let current = day;
    
    // Jump closer if too far to avoid endless animation loop
    const targetDate = new Date(target + 'T12:00:00Z');
    const currentDate = new Date(day + 'T12:00:00Z');
    const diffDays = Math.abs((targetDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24));
    
    if (diffDays > 7) {
      current = addDays(target, isForward ? -7 : 7);
      setDirection(isForward ? 1 : -1);
      setDayState(current);
      activeDayState.date = current;
    }

    const loop = setInterval(() => {
      current = addDays(current, isForward ? 1 : -1);
      setDirection(isForward ? 1 : -1);
      setDayState(current);
      activeDayState.date = current;
      
      if (current === target) {
        clearInterval(loop);
      }
    }, 120);
  };
  const [calendarOpen, setCalendarOpen] = useState(false);

  const goalsQuery = useQuery({ queryKey: ["goals"], queryFn: fetchGoals });
  const entriesQuery = useQuery({
    queryKey: ["entries", day, day],
    queryFn: () => fetchEntries(day, day),
  });

  const entries = entriesQuery.data ?? [];
  const consumed = entries.reduce((sum, e) => sum + Number(e.kcal), 0);
  const consumedProtein = entries.reduce((sum, e) => sum + Number(e.protein || 0), 0);
  const consumedCarbs = entries.reduce((sum, e) => sum + Number(e.carbs || 0), 0);
  const consumedFat = entries.reduce((sum, e) => sum + Number(e.fat || 0), 0);
  
  const goal = goalsQuery.data?.daily_calorie_goal ?? 2000;
  const fallbackMacros = calcMacroGoals(goal);
  const goalProtein = goalsQuery.data?.protein_goal ?? fallbackMacros.protein;
  const goalCarbs = goalsQuery.data?.carbs_goal ?? fallbackMacros.carbs;
  const goalFat = goalsQuery.data?.fat_goal ?? fallbackMacros.fat;

  const invalidateEntries = () => {
    queryClient.invalidateQueries({ queryKey: ["entries"] });
    queryClient.invalidateQueries({ queryKey: ["recentFoods"] });
  };

  const removeMutation = useMutation({
    mutationFn: deleteEntry,
    onSuccess: () => {
      invalidateEntries();
      toast.success("Registro removido");
    },
  });

  const undoMutation = useMutation({
    mutationFn: () => undoLastEntry(day),
    onSuccess: (name) => {
      invalidateEntries();
      toast.success(name ? `"${name}" removido` : "Nada para desfazer");
    },
    onError: (e: Error) => toast.error("Erro ao desfazer", { description: e.message }),
  });

  const clearMealMutation = useMutation({
    mutationFn: (meal: string) => clearMeal(day, meal),
    onSuccess: (count) => {
      invalidateEntries();
      toast.success(`${count} lançamentos apagados`);
    },
    onError: (e: Error) => toast.error("Erro ao limpar", { description: e.message }),
  });

  return (
    <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.05 }} className="space-y-8 pb-10">
      <Onboarding />
      
      {/* Native-style Header */}
      <motion.div variants={itemVariants} className="flex flex-col gap-1 items-center justify-center pt-2 pb-4 relative z-20">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="size-8 rounded-full text-muted-foreground" onClick={() => setDay(addDays(day, -1))}>
            <ChevronRight className="size-5 rotate-180" />
          </Button>
          <div className="text-center min-w-[160px] relative flex justify-center">
            
            <AnimatePresence>
              {day !== todayISO() && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: -25, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="absolute pointer-events-none"
                >
                  <span className="bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest backdrop-blur-md whitespace-nowrap shadow-xl">
                    2x clique = Hoje
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <div 
                  className="cursor-pointer group flex flex-col items-center select-none py-1 relative h-6 w-full overflow-hidden"
                  onDoubleClick={animateToToday}
                >
                  <AnimatePresence mode="popLayout" custom={direction}>
                    <motion.h1 
                      key={day}
                      custom={direction}
                      initial={(d: number) => ({ x: 30 * d, opacity: 0 })}
                      animate={{ x: 0, opacity: 1 }}
                      exit={(d: number) => ({ x: -30 * d, opacity: 0 })}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      className="absolute text-[15px] font-bold uppercase tracking-widest text-foreground transition-colors group-hover:text-primary active:scale-95"
                    >
                      {formatDayLabel(day)}
                    </motion.h1>
                  </AnimatePresence>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border-white/10 bg-surface/90 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl" align="center">
                <Calendar 
                  mode="single"
                  locale={ptBR}
                  selected={
                    new Date(
                      Number(day.split("-")[0]),
                      Number(day.split("-")[1]) - 1,
                      Number(day.split("-")[2])
                    )
                  }
                  onSelect={(date) => {
                    if (date) {
                      const y = date.getFullYear();
                      const m = String(date.getMonth() + 1).padStart(2, "0");
                      const d = String(date.getDate()).padStart(2, "0");
                      setDay(`${y}-${m}-${d}`);
                      setCalendarOpen(false);
                    }
                  }}
                  disabled={(date) => date > new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>
          <Button variant="ghost" size="icon" className="size-8 rounded-full text-muted-foreground" onClick={() => setDay(addDays(day, 1))} disabled={day >= todayISO()}>
            <ChevronRight className="size-5" />
          </Button>
        </div>
      </motion.div>

      {!goalsQuery.isLoading && !goalsQuery.data && (
        <motion.div variants={itemVariants} className="bento-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[14px] text-foreground/80 text-center sm:text-left">
            Você ainda não calculou sua TMB. Defina sua meta para acompanhar com precisão.
          </p>
          <Button asChild size="sm" className="rounded-full px-6 shadow-lg shadow-primary/20">
            <Link to="/perfil">Calcular meta</Link>
          </Button>
        </motion.div>
      )}

      {/* Bento Box Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 relative z-10">
        
        {/* Calorie Hero - Takes up full width on mobile, 2 cols on desktop */}
        <motion.div variants={itemVariants} className="col-span-2 sm:col-span-2 row-span-2 bento-card p-6 flex flex-col items-center justify-center transition-transform relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-[50px] -z-10 pointer-events-none translate-x-1/2 -translate-y-1/2" />
          <CalorieRing consumed={consumed} goal={goal} />
        </motion.div>

        {/* Macro Widgets - Bento small cards */}
        <motion.div variants={itemVariants}><MacroBento title="Proteína" consumed={consumedProtein} goal={goalProtein} color="from-[oklch(0.6_0.15_250)] to-[oklch(0.7_0.15_250)]" /></motion.div>
        <motion.div variants={itemVariants}><MacroBento title="Carbo" consumed={consumedCarbs} goal={goalCarbs} color="from-[oklch(0.7_0.18_70)] to-[oklch(0.8_0.18_70)]" /></motion.div>
        <motion.div variants={itemVariants} className="col-span-2"><MacroBento title="Gordura" consumed={consumedFat} goal={goalFat} color="from-[oklch(0.6_0.2_15)] to-[oklch(0.7_0.2_15)]" className="h-full" /></motion.div>
      </motion.div>

      <motion.div variants={itemVariants} className="flex items-center justify-between pt-6">
        <h2 className="text-xl font-medium tracking-tight">Refeições</h2>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 rounded-full text-muted-foreground hover:text-foreground text-xs" disabled={undoMutation.isPending || entries.length === 0}>
              <Undo2 className="size-3.5 mr-1.5" /> Desfazer
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-surface border-border rounded-[32px] p-6 sm:p-8 shadow-2xl max-w-sm w-[90vw]">
            <AlertDialogHeader className="space-y-3">
              <AlertDialogTitle className="text-2xl font-medium tracking-tight">Desfazer registro?</AlertDialogTitle>
              <AlertDialogDescription className="text-base text-muted-foreground/80 leading-relaxed">
                O último alimento adicionado hoje será removido.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3 mt-6">
              <AlertDialogCancel className="rounded-2xl h-12 px-6 text-base font-medium border-border hover:bg-white/5 transition-colors m-0">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction 
                className="rounded-2xl h-12 px-6 text-base font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-xl shadow-destructive/20 active:scale-[0.98] transition-all m-0"
                onClick={() => undoMutation.mutate()}
                disabled={undoMutation.isPending}
              >
                Desfazer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>

      {/* Rich Meal Cards Instead of Accordion */}
      {entriesQuery.isLoading ? (
        <motion.div variants={itemVariants} className="flex justify-center py-10">
          <Loader2 className="size-6 animate-spin text-primary" />
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="grid gap-3 sm:grid-cols-2">
          {MEALS.map((meal) => {
            const mealEntries = entries.filter((e) => e.meal === meal.id);
            const totalKcal = Math.round(mealEntries.reduce((s, e) => s + Number(e.kcal), 0));
            const hasItems = mealEntries.length > 0;
            
            return (
              <MealDrawer
                key={meal.id}
                mealId={meal.id}
                mealLabel={meal.label}
                totalKcal={totalKcal}
                entries={mealEntries}
                hasItems={hasItems}
                onDelete={(id) => removeMutation.mutate(id)}
                onClear={() => clearMealMutation.mutate(meal.id)}
                userId={user?.id}
                day={day}
              />
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}

// ----------------------------------------
// Sub-components for Native Feel
// ----------------------------------------

function MacroBento({ title, consumed, goal, color, className }: { title: string, consumed: number, goal: number, color: string, className?: string }) {
  const progress = Math.min(100, (consumed / Math.max(1, goal)) * 100);
  return (
    <div className={`bento-card p-4 sm:p-5 flex flex-col justify-between h-32 sm:h-36 ${className || 'col-span-1'}`}>
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{title}</p>
      <div>
        <div className="flex items-baseline gap-1">
          <p className="stat-number text-2xl font-medium tracking-tight text-foreground"><AnimatedNumber value={consumed} /><span className="text-[11px] text-muted-foreground/60 ml-0.5">g</span></p>
          <span className="text-[11px] font-medium text-muted-foreground/50">/ {Math.round(goal)}g</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-secondary mt-3 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 60, damping: 15 }}
            className={`h-full bg-gradient-to-r ${color} rounded-full`}
          />
        </div>
      </div>
    </div>
  );
}

function MealDrawer({ mealId, mealLabel, totalKcal, entries, hasItems, onDelete, onClear, userId, day }: any) {
  const [open, setOpen] = useState(false);
  
  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <button className="w-full text-left bento-card hover:bg-surface-strong p-5 sm:p-6 transition-colors active:scale-[0.98]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-white/5 flex items-center justify-center">
                <Plus className="size-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-foreground/90">{mealLabel}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {hasItems ? `${entries.length} itens registrados` : "Adicionar alimento"}
                </p>
              </div>
            </div>
            {hasItems && (
              <span className="stat-number text-lg font-medium text-foreground"><AnimatedNumber value={totalKcal} /> <span className="text-xs text-muted-foreground">kcal</span></span>
            )}
          </div>
        </button>
      </Drawer.Trigger>
      
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
        <Drawer.Content className="bg-surface border-t border-border flex flex-col rounded-t-[32px] h-[85vh] mt-24 fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-3xl outline-none">
          <div className="p-4 bg-surface rounded-t-[32px] flex-1 overflow-y-auto no-scrollbar">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-white/20 mb-8" />
            
            <div className="flex items-center justify-between mb-8 px-2">
              <div>
                <Drawer.Title className="text-3xl font-bold tracking-tight text-foreground">{mealLabel}</Drawer.Title>
                <Drawer.Description className="text-sm text-muted-foreground mt-1">
                  <AnimatedNumber value={totalKcal} /> kcal totais
                </Drawer.Description>
              </div>
              
              <div className="flex gap-2">
                {hasItems && (
                  <Button variant="secondary" size="icon" className="rounded-full size-10" onClick={() => { onClear(); setOpen(false); }}>
                    <Eraser className="size-4 text-destructive" />
                  </Button>
                )}
                {userId && <AddFoodDialog userId={userId} day={day} defaultMeal={mealId} onAdded={() => setOpen(false)} />}
              </div>
            </div>
            
            {hasItems ? (
              <ul className="space-y-2">
                {entries.map((entry: any) => (
                  <li key={entry.id} className="flex items-center justify-between p-4 rounded-2xl bg-surface-strong border border-border shadow-sm">
                    <div>
                      <p className="text-[15px] font-medium">{entry.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {entry.grams ? `${Math.round(Number(entry.grams))} ${entry.unit === "ml" ? "ml" : "g"}` : "porção"}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="stat-number text-base"><AnimatedNumber value={Math.round(Number(entry.kcal))} /></span>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(entry.id)} className="size-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="size-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <Search className="size-6 text-muted-foreground/50" />
                </div>
                <p className="text-muted-foreground">Nenhum alimento registrado aqui ainda.</p>
              </div>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function QuickAddDrawer({ userId, day }: { userId: string; day: string }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const recentQuery = useQuery({ queryKey: ["recentFoods"], queryFn: () => fetchRecentFoods(12) });
  
  const quickAdd = useMutation({
    mutationFn: (food: RecentFood) =>
      addEntry({
        user_id: userId,
        name: food.name,
        grams: food.grams,
        unit: food.unit,
        kcal: Number(food.kcal),
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        meal: food.meal,
        consumed_on: day,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["recentFoods"] });
      toast.success("Registrado");
      setOpen(false);
    },
    onError: (e: Error) => toast.error("Erro ao registrar", { description: e.message }),
  });

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <button className="flex flex-col items-center justify-center gap-2 text-primary hover:scale-105 transition-transform active:scale-95">
          <div className="size-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/20">
            <Zap className="size-5" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80">Rápido</span>
        </button>
      </Drawer.Trigger>
      
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
        <Drawer.Content className="bg-surface border-t border-border flex flex-col rounded-t-[32px] fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-3xl outline-none">
          <div className="p-4 pb-12 bg-surface rounded-t-[32px]">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-white/20 mb-6" />
            <Drawer.Title className="text-xl font-medium tracking-tight mb-4 px-2">Lançamento Rápido</Drawer.Title>
            
            <div className="flex flex-wrap gap-2 px-2">
              {recentQuery.data?.map((food) => (
                <button
                  key={food.name}
                  onClick={() => quickAdd.mutate(food)}
                  disabled={quickAdd.isPending}
                  className="rounded-full bg-surface border border-border px-4 py-2.5 text-sm font-medium transition-all hover:bg-surface-strong active:scale-95"
                >
                  <span className="text-foreground/90">{food.name}</span>
                  <span className="ml-2 text-muted-foreground font-light text-xs">
                    <AnimatedNumber value={Math.round(Number(food.kcal))} /> kcal
                  </span>
                </button>
              ))}
              {(!recentQuery.data || recentQuery.data.length === 0) && (
                <p className="text-sm text-muted-foreground p-4">Nenhum histórico recente. Adicione alimentos primeiro.</p>
              )}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function AddFoodDialog({ userId, day, defaultMeal, onAdded }: { userId: string; day: string, defaultMeal: string, onAdded: () => void }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [selected, setSelected] = useState<SearchableFood | null>(null);
  const [grams, setGrams] = useState("100");
  const [meal, setMeal] = useState<string>(defaultMeal);

  const customQuery = useQuery({ queryKey: ["customFoods"], queryFn: fetchCustomFoods });
  const results = useMemo(
    () => searchFoods(term, customQuery.data ?? []),
    [term, customQuery.data],
  );

  const unit = selected ? (selected.unit ?? unitFor(selected)) : "g";
  const factor = Number(grams || 0) / 100;
  const kcal = selected ? Math.round(selected.kcalPer100g * factor) : 0;
  const protein = selected && selected.proteinPer100g ? Math.round(selected.proteinPer100g * factor) : 0;
  const carbs = selected && selected.carbsPer100g ? Math.round(selected.carbsPer100g * factor) : 0;
  const fat = selected && selected.fatPer100g ? Math.round(selected.fatPer100g * factor) : 0;

  const mutation = useMutation({
    mutationFn: () =>
      addEntry({
        user_id: userId,
        name: selected!.name,
        grams: Number(grams),
        unit,
        kcal,
        protein,
        carbs,
        fat,
        meal,
        consumed_on: day,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      toast.success("Adicionado");
      setOpen(false);
      setSelected(null);
      setTerm("");
      setGrams("100");
      onAdded();
    },
    onError: (e: Error) => toast.error("Erro", { description: e.message }),
  });

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <Button size="sm" className="rounded-full px-6 shadow-lg shadow-primary/20">
          <Plus className="size-4 mr-2" /> Buscar
        </Button>
      </Drawer.Trigger>
      
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" />
        <Drawer.Content className="bg-surface border-t border-border flex flex-col rounded-t-[32px] h-[90vh] mt-24 fixed bottom-0 left-0 right-0 z-[60] mx-auto max-w-3xl outline-none">
          <div className="p-4 bg-surface rounded-t-[32px] flex-1 overflow-y-auto no-scrollbar">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-secondary mb-6" />
            
            <Drawer.Title className="sr-only">Buscar Alimento</Drawer.Title>
            
            {!selected ? (
              <div className="space-y-4 px-2">
                <div className="relative">
                  <label htmlFor="search-food" className="sr-only">Buscar alimento</label>
                  <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="search-food"
                    name="search-food"
                    autoFocus
                    placeholder="Buscar alimento (ex.: arroz, pizza)"
                    className="w-full bg-surface border border-border rounded-2xl h-14 pl-12 pr-4 text-lg outline-none focus:border-primary transition-colors"
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                  />
                </div>
                <ul className="space-y-1">
                  {results.map((food) => (
                    <li key={food.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelected(food);
                          setGrams(String(food.measureGrams || 100));
                        }}
                        className="w-full rounded-2xl px-4 py-3 text-left transition-colors hover:bg-surface-strong active:scale-[0.98] border border-transparent flex items-center justify-between"
                      >
                        <div>
                          <p className="text-[15px] font-medium">{food.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {food.category}
                          </p>
                        </div>
                        <span className="stat-number text-sm"><AnimatedNumber value={Math.round(food.kcalPer100g)} /> <span className="text-[10px] uppercase tracking-widest text-muted-foreground">kcal</span></span>
                      </button>
                    </li>
                  ))}
                  {results.length === 0 && term.length > 2 && (
                    <li className="px-4 py-10 text-center text-sm text-muted-foreground">
                      Nada encontrado. Você pode cadastrar em Perfil.
                    </li>
                  )}
                </ul>
              </div>
            ) : (
              <div className="space-y-6 px-2 animate-in fade-in zoom-in-95 duration-200">
                <div className="rounded-2xl bg-surface border border-border p-6 text-center">
                  <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2">{selected.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    <AnimatedNumber value={Math.round(selected.kcalPer100g)} /> kcal por 100 {unit}
                  </p>
                </div>
                
                <div className="grid gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="food-grams" className="text-xs uppercase tracking-widest text-muted-foreground ml-1">Quantidade ({unit})</Label>
                    <div className="relative">
                      <Input
                        id="food-grams"
                        name="food-grams"
                        type="number"
                        min={1}
                        value={grams}
                        onChange={(e) => setGrams(e.target.value)}
                        className="h-14 rounded-2xl text-lg font-medium bg-surface border-border"
                      />
                    </div>
                    
                    <div className="flex flex-wrap gap-2 pt-2">
                      {[1, 2, 3].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setGrams(String(Math.round(selected.measureGrams * n)))}
                          className="rounded-full bg-surface border border-border hover:bg-surface-strong px-4 py-2 text-xs font-medium transition-colors"
                        >
                          {n}× {selected.measure}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-xs uppercase tracking-widest text-muted-foreground ml-1">Refeição</Label>
                    <Select value={meal} onValueChange={setMeal}>
                      <SelectTrigger className="h-14 rounded-2xl bg-surface border border-border text-base">
                        <SelectValue placeholder="Refeição" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-border bg-surface">
                        {MEALS.map((m) => (
                          <SelectItem key={m.id} value={m.id} className="rounded-xl my-1">
                            {mealLabel(m.id)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-border">
                  <div className="flex items-center justify-between mb-6 px-2">
                    <span className="text-sm font-medium text-muted-foreground">Total</span>
                    <p className="stat-number text-3xl text-primary">{kcal} <span className="text-sm text-muted-foreground font-normal">kcal</span></p>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button variant="secondary" className="flex-1 h-14 rounded-2xl text-base" onClick={() => setSelected(null)}>
                      Voltar
                    </Button>
                    <Button
                      className="flex-1 h-14 rounded-2xl text-base bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      onClick={() => mutation.mutate()}
                      disabled={mutation.isPending || Number(grams) <= 0}
                    >
                      Salvar
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}


