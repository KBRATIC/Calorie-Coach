import { useMemo, useState } from "react";
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
import { motion } from "motion/react";

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

export function TodayPage() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [day, setDayState] = useState(activeDayState.date);
  
  const setDay = (d: string) => {
    setDayState(d);
    activeDayState.date = d;
  };

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
    <div className="space-y-8 pb-10">
      <Onboarding />
      
      {/* Native-style Header */}
      <div className="flex flex-col gap-1 items-center justify-center pt-2 pb-4 relative">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="size-8 rounded-full text-muted-foreground" onClick={() => setDay(addDays(day, -1))}>
            <ChevronRight className="size-5 rotate-180" />
          </Button>
          <div className="text-center w-40">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {day === todayISO() ? "Hoje" : "Diário"}
            </h1>
            <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/80">{formatDayLabel(day)}</p>
          </div>
          <Button variant="ghost" size="icon" className="size-8 rounded-full text-muted-foreground" onClick={() => setDay(addDays(day, 1))} disabled={day >= todayISO()}>
            <ChevronRight className="size-5" />
          </Button>
        </div>
      </div>

      {!goalsQuery.isLoading && !goalsQuery.data && (
        <div className="bg-surface/50 border border-white/10 backdrop-blur-3xl rounded-3xl p-6 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[14px] text-foreground/80 text-center sm:text-left">
            Você ainda não calculou sua TMB. Defina sua meta para acompanhar com precisão.
          </p>
          <Button asChild size="sm" className="rounded-full px-6 shadow-lg shadow-primary/20">
            <Link to="/perfil">Calcular meta</Link>
          </Button>
        </div>
      )}

      {/* Bento Box Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 relative z-10">
        
        {/* Calorie Hero - Takes up full width on mobile, 2 cols on desktop */}
        <div className="col-span-2 sm:col-span-2 row-span-2 bg-surface/40 border border-white/5 backdrop-blur-3xl rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col items-center justify-center transition-transform relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-[50px] -z-10 pointer-events-none translate-x-1/2 -translate-y-1/2" />
          <CalorieRing consumed={consumed} goal={goal} />
          <div className="mt-5 text-center flex flex-col">
            <span className="stat-number text-5xl font-light tracking-tighter text-foreground drop-shadow-sm">{Math.max(0, Math.round(goal - consumed))}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 mt-1">kcal restantes</span>
          </div>
        </div>

        {/* Macro Widgets - Bento small cards */}
        <MacroBento title="Proteína" consumed={consumedProtein} goal={goalProtein} color="from-[oklch(0.6_0.15_250)] to-[oklch(0.7_0.15_250)]" />
        <MacroBento title="Carbo" consumed={consumedCarbs} goal={goalCarbs} color="from-[oklch(0.7_0.18_70)] to-[oklch(0.8_0.18_70)]" />
        <MacroBento title="Gordura" consumed={consumedFat} goal={goalFat} color="from-[oklch(0.6_0.2_15)] to-[oklch(0.7_0.2_15)]" />
        
        {/* Quick Add floating trigger */}
        <div className="col-span-1 bg-surface/40 border border-white/5 backdrop-blur-3xl rounded-[32px] p-4 flex items-center justify-center">
          {user && <QuickAddDrawer userId={user.id} day={day} />}
        </div>
      </div>

      <div className="flex items-center justify-between pt-6">
        <h2 className="text-xl font-medium tracking-tight">Refeições</h2>
        <Button variant="ghost" size="sm" className="h-8 rounded-full text-muted-foreground hover:text-foreground text-xs" onClick={() => undoMutation.mutate()} disabled={undoMutation.isPending || entries.length === 0}>
          <Undo2 className="size-3.5 mr-1.5" /> Desfazer
        </Button>
      </div>

      {/* Rich Meal Cards Instead of Accordion */}
      {entriesQuery.isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
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
        </div>
      )}
    </div>
  );
}

// ----------------------------------------
// Sub-components for Native Feel
// ----------------------------------------

function MacroBento({ title, consumed, goal, color }: { title: string, consumed: number, goal: number, color: string }) {
  const progress = Math.min(100, (consumed / goal) * 100);
  return (
    <div className="col-span-1 bg-surface/40 border border-white/5 backdrop-blur-3xl rounded-[32px] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col justify-between h-36">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{title}</p>
      <div>
        <p className="stat-number text-2xl font-medium tracking-tight text-foreground">{Math.round(consumed)}<span className="text-xs text-muted-foreground/60 ml-0.5">g</span></p>
        <div className="h-1.5 w-full rounded-full bg-white/5 mt-3 overflow-hidden">
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
        <button className="w-full text-left bg-surface/40 hover:bg-surface/60 border border-white/5 backdrop-blur-3xl rounded-[32px] p-5 sm:p-6 transition-colors shadow-sm active:scale-[0.98]">
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
              <span className="stat-number text-lg font-medium text-foreground">{totalKcal} <span className="text-xs text-muted-foreground">kcal</span></span>
            )}
          </div>
        </button>
      </Drawer.Trigger>
      
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
        <Drawer.Content className="bg-surface border-t border-white/10 flex flex-col rounded-t-[32px] h-[85vh] mt-24 fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-3xl outline-none">
          <div className="p-4 bg-surface rounded-t-[32px] flex-1 overflow-y-auto no-scrollbar">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-white/20 mb-8" />
            
            <div className="flex items-center justify-between mb-8 px-2">
              <div>
                <Drawer.Title className="text-3xl font-bold tracking-tight text-foreground">{mealLabel}</Drawer.Title>
                <Drawer.Description className="text-sm text-muted-foreground mt-1">
                  {totalKcal} kcal totais
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
                  <li key={entry.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div>
                      <p className="text-[15px] font-medium">{entry.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {entry.grams ? `${Math.round(Number(entry.grams))} ${entry.unit === "ml" ? "ml" : "g"}` : "porção"}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="stat-number text-base">{Math.round(Number(entry.kcal))}</span>
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
        <Drawer.Content className="bg-surface border-t border-white/10 flex flex-col rounded-t-[32px] fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-3xl outline-none">
          <div className="p-4 pb-12 bg-surface rounded-t-[32px]">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-white/20 mb-6" />
            <Drawer.Title className="text-xl font-medium tracking-tight mb-4 px-2">Lançamento Rápido</Drawer.Title>
            
            <div className="flex flex-wrap gap-2 px-2">
              {recentQuery.data?.map((food) => (
                <button
                  key={food.name}
                  onClick={() => quickAdd.mutate(food)}
                  disabled={quickAdd.isPending}
                  className="rounded-full bg-white/[0.04] border border-white/5 px-4 py-2.5 text-sm font-medium transition-all hover:bg-white/[0.08] active:scale-95"
                >
                  <span className="text-foreground/90">{food.name}</span>
                  <span className="ml-2 text-muted-foreground font-light text-xs">
                    {Math.round(Number(food.kcal))} kcal
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
        <Drawer.Content className="bg-surface border-t border-white/10 flex flex-col rounded-t-[32px] h-[90vh] mt-24 fixed bottom-0 left-0 right-0 z-[60] mx-auto max-w-3xl outline-none">
          <div className="p-4 bg-surface rounded-t-[32px] flex-1 overflow-y-auto no-scrollbar">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-white/20 mb-6" />
            
            <Drawer.Title className="sr-only">Buscar Alimento</Drawer.Title>
            
            {!selected ? (
              <div className="space-y-4 px-2">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    autoFocus
                    placeholder="Buscar alimento (ex.: arroz, pizza)"
                    className="w-full bg-white/[0.04] border border-white/10 rounded-2xl h-14 pl-12 pr-4 text-lg outline-none focus:border-primary transition-colors"
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
                        className="w-full rounded-2xl px-4 py-3 text-left transition-colors hover:bg-white/[0.04] active:scale-[0.98] border border-transparent flex items-center justify-between"
                      >
                        <div>
                          <p className="text-[15px] font-medium">{food.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {food.category}
                          </p>
                        </div>
                        <span className="stat-number text-sm">{Math.round(food.kcalPer100g)} <span className="text-[10px] uppercase tracking-widest text-muted-foreground">kcal</span></span>
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
                <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6 text-center">
                  <p className="text-2xl font-bold tracking-tight">{selected.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {Math.round(selected.kcalPer100g)} kcal por 100 {unit}
                  </p>
                </div>
                
                <div className="grid gap-6">
                  <div className="space-y-3">
                    <Label className="text-xs uppercase tracking-widest text-muted-foreground ml-1">Quantidade ({unit})</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        min={1}
                        value={grams}
                        onChange={(e) => setGrams(e.target.value)}
                        className="h-14 rounded-2xl text-lg font-medium bg-white/[0.04] border-white/10"
                      />
                    </div>
                    
                    <div className="flex flex-wrap gap-2 pt-2">
                      {[1, 2, 3].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setGrams(String(Math.round(selected.measureGrams * n)))}
                          className="rounded-full bg-white/[0.04] hover:bg-white/[0.08] px-4 py-2 text-xs font-medium transition-colors"
                        >
                          {n}× {selected.measure}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-xs uppercase tracking-widest text-muted-foreground ml-1">Refeição</Label>
                    <Select value={meal} onValueChange={setMeal}>
                      <SelectTrigger className="h-14 rounded-2xl bg-white/[0.04] border-white/10 text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-white/10">
                        {MEALS.map((m) => (
                          <SelectItem key={m.id} value={m.id} className="rounded-xl my-1">
                            {mealLabel(m.id)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-white/5">
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

