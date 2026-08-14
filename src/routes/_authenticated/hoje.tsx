import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Trash2,
  Loader2,
  Sparkles,
  CopyCheck,
  Zap,
  Undo2,
  Eraser,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";

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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Onboarding } from "@/components/Onboarding";


export const Route = createFileRoute("/_authenticated/hoje")({
  head: () => ({
    meta: [
      { title: "Diário de hoje — KcalTrack" },
      {
        name: "description",
        content: "Registre os alimentos consumidos no dia e acompanhe quanto falta para a sua meta.",
      },
      { property: "og:title", content: "Diário de hoje — KcalTrack" },
      {
        property: "og:description",
        content: "Registre os alimentos do dia e acompanhe sua meta calórica.",
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

  const clearDayMutation = useMutation({
    mutationFn: () => clearDay(day),
    onSuccess: (count) => {
      invalidateEntries();
      toast.success(count ? `${count} lançamentos apagados` : "O dia já estava vazio");
    },
    onError: (e: Error) => toast.error("Erro ao limpar", { description: e.message }),
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
    <div className="space-y-6">
      <Onboarding />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl">Diário</h1>
          <p className="text-sm text-muted-foreground">{formatDayLabel(day)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setDay(addDays(day, -1))}>
            Dia anterior
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setDay(todayISO())}
            disabled={day === todayISO()}
          >
            Hoje
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setDay(addDays(day, 1))}
            disabled={day >= todayISO()}
          >
            Próximo
          </Button>
        </div>
      </div>

      {!goalsQuery.isLoading && !goalsQuery.data && (
        <div className="bg-white/[0.02] border border-white/5 backdrop-blur-3xl rounded-[32px] p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
          <p className="text-[15px] font-medium text-foreground/80 leading-relaxed">
            Você ainda não calculou sua TMB. Defina sua meta para acompanhar com precisão.
          </p>
          <Button asChild size="sm" className="rounded-full px-6 bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to="/perfil">Calcular minha meta</Link>
          </Button>
        </div>
      )}

      <div className="bg-white/[0.02] border border-white/5 backdrop-blur-3xl rounded-[32px] shadow-2xl flex flex-col gap-8 p-6 sm:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3" />
        
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-center sm:justify-between z-10">
          <CalorieRing consumed={consumed} goal={goal} />
          <div className="grid w-full max-w-xs gap-4">
            {MEALS.map((meal) => {
              const total = entries
                .filter((e) => e.meal === meal.id)
                .reduce((s, e) => s + Number(e.kcal), 0);
              return (
                <div key={meal.id} className="flex items-center justify-between text-[15px]">
                  <span className="text-muted-foreground font-medium">{meal.label}</span>
                  <span className="stat-number text-foreground">{Math.round(total)} kcal</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Macro Progress Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-white/5 z-10">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-[oklch(0.7_0.15_250)] tracking-widest uppercase">Proteína</span>
              <span className="text-foreground">{Math.round(consumedProtein)} <span className="text-muted-foreground font-medium">/ {goalProtein}g</span></span>
            </div>
            <div className="h-3 w-full rounded-full bg-white/5 overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-[oklch(0.6_0.15_250)] to-[oklch(0.7_0.15_250)] transition-all duration-1000 ease-out shadow-[0_0_12px_oklch(0.6_0.15_250_/_0.6)]" 
                style={{ width: `${Math.min(100, (consumedProtein / goalProtein) * 100)}%` }} 
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-[oklch(0.8_0.18_70)] tracking-widest uppercase">Carbo</span>
              <span className="text-foreground">{Math.round(consumedCarbs)} <span className="text-muted-foreground font-medium">/ {goalCarbs}g</span></span>
            </div>
            <div className="h-3 w-full rounded-full bg-white/5 overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-[oklch(0.7_0.18_70)] to-[oklch(0.8_0.18_70)] transition-all duration-1000 ease-out shadow-[0_0_12px_oklch(0.7_0.18_70_/_0.6)]" 
                style={{ width: `${Math.min(100, (consumedCarbs / goalCarbs) * 100)}%` }} 
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-[oklch(0.7_0.2_15)] tracking-widest uppercase">Gordura</span>
              <span className="text-foreground">{Math.round(consumedFat)} <span className="text-muted-foreground font-medium">/ {goalFat}g</span></span>
            </div>
            <div className="h-3 w-full rounded-full bg-white/5 overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-[oklch(0.6_0.2_15)] to-[oklch(0.7_0.2_15)] transition-all duration-1000 ease-out shadow-[0_0_12px_oklch(0.6_0.2_15_/_0.6)]" 
                style={{ width: `${Math.min(100, (consumedFat / goalFat) * 100)}%` }} 
              />
            </div>
          </div>
        </div>
      </div>

      {user && <QuickActions userId={user.id} day={day} />}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl">Alimentos do dia</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="gap-2"
            onClick={() => undoMutation.mutate()}
            disabled={undoMutation.isPending || entries.length === 0}
          >
            <Undo2 className="size-4" /> Desfazer último
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                className="gap-2 text-destructive hover:text-destructive"
                disabled={entries.length === 0 || clearDayMutation.isPending}
              >
                <Eraser className="size-4" /> Limpar dia
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Limpar todos os lançamentos?</AlertDialogTitle>
                <AlertDialogDescription>
                  Os {entries.length} registros de {formatDayLabel(day)} serão apagados. Não é
                  possível desfazer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => clearDayMutation.mutate()}>
                  Limpar dia
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          {user && <AddFoodDialog userId={user.id} day={day} />}
        </div>
      </div>

      {entriesQuery.isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      ) : entries.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/5 backdrop-blur-3xl rounded-[32px] p-12 text-center text-[15px] text-muted-foreground/80 shadow-inner">
          Nenhum alimento registrado neste dia.
        </div>
      ) : (
        <Accordion type="multiple" className="space-y-6" defaultValue={MEALS.map(m => m.id)}>
          {MEALS.filter((m) => entries.some((e) => e.meal === m.id)).map((meal) => {
            const mealEntries = entries.filter((e) => e.meal === meal.id);
            const totalKcal = Math.round(mealEntries.reduce((s, e) => s + Number(e.kcal), 0));
            
            return (
            <AccordionItem key={meal.id} value={meal.id} className="bg-white/[0.02] border border-white/5 backdrop-blur-3xl rounded-[32px] overflow-hidden shadow-xl shadow-black/10 transition-all hover:bg-white/[0.03]">
              <div className="flex items-center justify-between gap-4 px-6 sm:px-8 border-b border-white/5 bg-white/[0.01]">
                <AccordionTrigger className="hover:no-underline py-5 flex-1">
                  <div className="flex flex-1 items-center justify-between pr-4">
                    <span className="text-sm font-bold uppercase tracking-widest text-primary">
                      {meal.label}
                    </span>
                    <span className="stat-number text-[15px] font-medium text-foreground">{totalKcal} kcal</span>
                  </div>
                </AccordionTrigger>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                  onClick={() => clearMealMutation.mutate(meal.id)}
                  disabled={clearMealMutation.isPending}
                >
                  <Eraser className="size-4" />
                </Button>
              </div>
              <AccordionContent className="pt-2 pb-4">
                <ul className="divide-y divide-white/5 px-2">
                  {mealEntries.map((entry) => (
                    <li key={entry.id} className="flex items-center gap-4 px-4 sm:px-6 py-4 rounded-2xl transition-colors hover:bg-white/[0.04]">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-medium text-foreground/90">{entry.name}</p>
                        <p className="text-sm text-muted-foreground/80 font-light mt-0.5">
                          {entry.grams ? `${Math.round(Number(entry.grams))} ${entry.unit === "ml" ? "ml" : "g"}` : "porção"}
                        </p>
                      </div>
                      <span className="stat-number text-base font-medium">{Math.round(Number(entry.kcal))}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMutation.mutate(entry.id)}
                        aria-label={`Remover ${entry.name}`}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 size-8 rounded-full ml-2"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          )})}
        </Accordion>
      )}
    </div>
  );
}

function QuickActions({ userId, day }: { userId: string; day: string }) {
  const queryClient = useQueryClient();
  const recentQuery = useQuery({ queryKey: ["recentFoods"], queryFn: () => fetchRecentFoods(12) });
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["entries"] });
    queryClient.invalidateQueries({ queryKey: ["recentFoods"] });
  };

  const repeat = useMutation({
    mutationFn: () => copyDay(userId, addDays(day, -1), day),
    onSuccess: (count) => {
      invalidate();
      toast.success(count ? `${count} itens copiados do dia anterior` : "Dia anterior está vazio");
    },
    onError: (e: Error) => toast.error("Erro ao copiar", { description: e.message }),
  });

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
      invalidate();
      toast.success("Registrado em 1 toque");
    },
    onError: (e: Error) => toast.error("Erro ao registrar", { description: e.message }),
  });

  const recents = recentQuery.data ?? [];

  return (
    <div className="bg-white/[0.02] border border-white/5 backdrop-blur-3xl rounded-[32px] space-y-5 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-64 h-64 bg-fuchsia-500/5 rounded-full blur-[80px] -z-10 pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      
      <div className="flex flex-wrap items-center gap-3 relative z-10">
        <span className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary">
          <Zap className="size-4" /> Lançamento rápido
        </span>
        <div className="ml-auto flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="gap-2 rounded-full border border-white/5 bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-md"
            onClick={() => repeat.mutate()}
            disabled={repeat.isPending}
          >
            <CopyCheck className="size-4" /> Repetir dia anterior
          </Button>
        </div>
      </div>

      {recents.length > 0 && (
        <div className="flex flex-wrap gap-2.5 relative z-10">
          {recents.map((food) => (
            <button
              key={food.name}
              type="button"
              onClick={() => quickAdd.mutate(food)}
              disabled={quickAdd.isPending}
              className="rounded-full bg-white/[0.03] border border-white/5 px-4 py-2 text-[13px] font-medium transition-all hover:border-primary/50 hover:bg-primary/5 active:scale-[0.98] shadow-sm"
            >
              <span className="text-foreground/90">{food.name}</span>
              <span className="ml-2 text-muted-foreground font-light">
                {food.grams ? `${Math.round(Number(food.grams))} ${food.unit === "ml" ? "ml" : "g"} · ` : ""}
                <span className="stat-number">{Math.round(Number(food.kcal))} kcal</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


function AddFoodDialog({ userId, day }: { userId: string; day: string }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [selected, setSelected] = useState<SearchableFood | null>(null);
  const [grams, setGrams] = useState("100");
  const [meal, setMeal] = useState<string>("breakfast");

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
      toast.success("Alimento registrado");
      setOpen(false);
      setSelected(null);
      setTerm("");
      setGrams("100");
    },
    onError: (e: Error) => toast.error("Erro ao registrar", { description: e.message }),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="size-4" /> Adicionar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Adicionar alimento</DialogTitle>
        </DialogHeader>

        {!selected ? (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                placeholder="Buscar alimento (ex.: arroz, pizza, banana)"
                className="pl-9"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
              />
            </div>
            <ul className="max-h-80 space-y-1 overflow-y-auto pr-1">
              {results.map((food) => (
                <li key={food.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(food);
                      setGrams(String(food.measureGrams || 100));
                    }}
                    className="w-full rounded-lg px-3 py-2 text-left transition-colors hover:bg-secondary"
                  >
                    <p className="text-sm font-medium">{food.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {food.category} · {Math.round(food.kcalPer100g)} kcal/100{" "}
                      {food.unit ?? unitFor(food)}
                    </p>
                  </button>
                </li>
              ))}
              {results.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                  Nada encontrado. Cadastre em Perfil &amp; Meta.
                </li>
              )}
            </ul>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl bg-secondary p-4">
              <p className="font-medium">{selected.name}</p>
              <p className="text-xs text-muted-foreground">
                {Math.round(selected.kcalPer100g)} kcal por 100 {unit} · referência:{" "}
                {selected.measure} ({selected.measureGrams} {unit})
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="grams">Quantidade ({unit})</Label>
                <Input
                  id="grams"
                  type="number"
                  min={1}
                  value={grams}
                  onChange={(e) => setGrams(e.target.value)}
                />
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setGrams(String(Math.round(selected.measureGrams * n)))}
                      className="rounded-full border border-border/70 px-2.5 py-1 text-xs transition-colors hover:border-primary hover:text-primary"
                    >
                      {n}× {selected.measure}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setGrams(String(Math.max(1, Number(grams || 0) + 50)))}
                    className="rounded-full border border-border/70 px-2.5 py-1 text-xs transition-colors hover:border-primary hover:text-primary"
                  >
                    +50 {unit}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Refeição</Label>
                <Select value={meal} onValueChange={setMeal}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEALS.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {mealLabel(m.id)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="stat-number text-2xl text-primary">{kcal} kcal</p>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setSelected(null)}>
                Voltar
              </Button>
              <Button
                className="flex-1"
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending || Number(grams) <= 0}
              >
                Registrar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
