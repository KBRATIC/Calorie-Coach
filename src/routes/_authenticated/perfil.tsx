import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { deleteAccount } from "@/lib/user.functions";
import {
  addCustomFood,
  deleteCustomFood,
  fetchCustomFoods,
  fetchGoals,
  saveGoals,
} from "@/lib/api";
import {
  ACTIVITY_LEVELS,
  GOAL_PRESETS,
  calcBmi,
  bmiLabel,
  calcSafeGoalCalories,
  calcTdee,
  resolveBmr,
  safeFloor,
  weeklyWeightChangeKg,
  type Sex,
} from "@/lib/nutrition";

import { useSession } from "@/hooks/useSession";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({
    meta: [
      { title: "Calculadora de TMB e meta — KcalTrack" },
      {
        name: "description",
        content:
          "Calcule sua taxa metabólica basal e seu gasto diário, e defina a meta de calorias para perder, manter ou ganhar peso.",
      },
      { property: "og:title", content: "Calculadora de TMB e meta — KcalTrack" },
      {
        property: "og:description",
        content: "Calcule a TMB, o gasto diário e defina sua meta de calorias.",
      },
    ],
  }),
  component: ProfilePage,
});

export function ProfilePage() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const goalsQuery = useQuery({ queryKey: ["goals"], queryFn: fetchGoals });

  const [sex, setSex] = useState<Sex>("male");
  const [age, setAge] = useState("30");
  const [height, setHeight] = useState("175");
  const [weight, setWeight] = useState("80");
  const [activity, setActivity] = useState("1.375");
  const [goalType, setGoalType] = useState("cut");
  const [manual, setManual] = useState("2000");
  const [bodyFat, setBodyFat] = useState("");

  const navigate = useNavigate();

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      return await deleteAccount();
    },
    onSuccess: async () => {
      toast.success("Conta excluída com sucesso.");
      await supabase.auth.signOut();
      navigate({ to: "/", replace: true });
    },
    onError: (e: Error) => {
      toast.error("Erro ao excluir conta", { description: e.message });
    },
  });

  useEffect(() => {
    const g = goalsQuery.data;
    if (!g) return;
    setSex(g.sex);
    setAge(String(g.age ?? 30));
    setHeight(String(g.height_cm));
    setWeight(String(g.weight_kg));
    setActivity(String(g.activity_factor));
    setGoalType(g.goal_type);
    setManual(String(g.daily_calorie_goal));
    setBodyFat(g.body_fat_pct ? String(g.body_fat_pct) : "");
  }, [goalsQuery.data]);

  const { bmr, method } = resolveBmr({
    sex,
    age: Number(age) || 0,
    heightCm: Number(height) || 0,
    weightKg: Number(weight) || 0,
    bodyFatPct: Number(bodyFat) || null,
  });
  const tdee = calcTdee(bmr, Number(activity));
  const { target, capped } = calcSafeGoalCalories({
    tdee,
    bmr,
    sex,
    goalId: goalType,
    manual: Number(manual) || 0,
  });
  const bmi = calcBmi(Number(weight) || 0, Number(height) || 0);
  const weekly = weeklyWeightChangeKg(target, tdee);

  const methodLabel =
    method === "katch"
      ? "Katch-McArdle (usa sua massa magra)"
      : "Mifflin-St Jeor";

  const saveMutation = useMutation({
    mutationFn: () =>
      saveGoals(user!.id, {
        sex,
        age: Number(age),
        height_cm: Number(height),
        weight_kg: Number(weight),
        activity_factor: Number(activity),
        goal_type: goalType,
        body_fat_pct: Number(bodyFat) || null,
        bmr,
        tdee,
        daily_calorie_goal: target,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Meta salva", { description: `${target} kcal por dia` });
    },
    onError: (e: Error) => toast.error("Erro ao salvar", { description: e.message }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Perfil &amp; Meta</h1>
        <p className="text-sm text-muted-foreground">
          TMB calculada por Mifflin-St Jeor ou Katch-McArdle (se informar % de gordura), com
          limites seguros de déficit e superávit.
        </p>

      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="panel space-y-5 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Sexo biológico</Label>
              <Select value={sex} onValueChange={(v) => setSex(v as Sex)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Masculino</SelectItem>
                  <SelectItem value="female">Feminino</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Idade</Label>
              <Input id="age" type="number" value={age} onChange={(e) => setAge(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Altura (cm)</Label>
              <Input
                id="height"
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="bodyfat">Gordura corporal (%) — opcional</Label>
              <Input
                id="bodyfat"
                type="number"
                step="0.1"
                placeholder="Ex.: 18"
                value={bodyFat}
                onChange={(e) => setBodyFat(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Se você souber seu % de gordura, usamos a fórmula Katch-McArdle, mais precisa.
              </p>
            </div>
          </div>


          <div className="space-y-2">
            <Label>Nível de atividade</Label>
            <Select value={activity} onValueChange={setActivity}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_LEVELS.map((a) => (
                  <SelectItem key={a.value} value={String(a.value)}>
                    {a.label} — {a.hint}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Objetivo</Label>
            <Select value={goalType} onValueChange={setGoalType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GOAL_PRESETS.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.label} — {g.hint}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {goalType === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="manual">Meta manual (kcal/dia)</Label>
              <Input
                id="manual"
                type="number"
                value={manual}
                onChange={(e) => setManual(e.target.value)}
              />
            </div>
          )}

          <Button
            className="w-full"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || !user}
          >
            Salvar meta
          </Button>
        </div>

        <div className="panel space-y-4 p-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">TMB (basal)</p>
            <p className="stat-number text-3xl">{bmr} kcal</p>
            <p className="text-xs text-muted-foreground">{methodLabel}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Gasto diário (TMB × atividade)
            </p>
            <p className="stat-number text-3xl">{tdee} kcal</p>
          </div>
          <div className="rounded-xl bg-primary p-4 text-primary-foreground">
            <p className="text-xs font-semibold uppercase tracking-widest">Meta diária</p>
            <p className="stat-number text-4xl">{target} kcal</p>
            <p className="text-xs opacity-90">
              {weekly === 0
                ? "Manutenção de peso"
                : `${weekly > 0 ? "+" : ""}${weekly} kg por semana (estimativa)`}
            </p>
          </div>
          {capped && (
            <p className="rounded-lg border border-border/70 p-3 text-xs text-muted-foreground">
              Ajustamos a meta para o limite seguro de {safeFloor(bmr, sex)} kcal (nunca abaixo da
              sua TMB) ou do teto de superávit.
            </p>
          )}
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">IMC</p>
            <p className="stat-number text-xl">
              {bmi} <span className="text-sm font-normal text-muted-foreground">{bmiLabel(bmi)}</span>
            </p>
          </div>
        </div>

      </div>

      {user && <CustomFoods userId={user.id} />}

      <div className="panel space-y-4 p-6 border-destructive/20 bg-destructive/5 mt-8">
        <div>
          <h2 className="text-xl text-destructive flex items-center gap-2">
            <AlertTriangle className="size-5" /> Zona de Perigo
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            A exclusão da sua conta apagará permanentemente todos os seus registros de refeições, metas e informações pessoais.
            Esta ação não pode ser desfeita.
          </p>
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Excluir minha conta</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
              <AlertDialogDescription>
                Isso apagará permanentemente sua conta e removerá todos os seus dados e registros alimentares dos nossos servidores. Esta ação é irreversível.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => deleteAccountMutation.mutate()}
                disabled={deleteAccountMutation.isPending}
              >
                {deleteAccountMutation.isPending ? "Excluindo..." : "Sim, excluir minha conta"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

function CustomFoods({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const { data: foods } = useQuery({ queryKey: ["customFoods"], queryFn: fetchCustomFoods });
  const [name, setName] = useState("");
  const [kcal, setKcal] = useState("");
  const [unit, setUnit] = useState<"g" | "ml">("g");

  const create = useMutation({
    mutationFn: () =>
      addCustomFood({
        user_id: userId,
        name: name.trim(),
        kcal_per_100g: Number(kcal),
        default_measure: unit === "ml" ? "1 copo" : "1 porção",
        default_grams: unit === "ml" ? 200 : 100,
        unit,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customFoods"] });
      setName("");
      setKcal("");
      toast.success("Alimento cadastrado");
    },
    onError: (e: Error) => toast.error("Erro ao cadastrar", { description: e.message }),
  });

  const remove = useMutation({
    mutationFn: deleteCustomFood,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customFoods"] }),
  });

  return (
    <div className="panel space-y-4 p-6">
      <div>
        <h2 className="text-xl">Meus alimentos</h2>
        <p className="text-sm text-muted-foreground">
          Cadastre itens que não estão na base de mais de 1.100 alimentos.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_150px_170px_auto]">
        <Input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="flex rounded-lg border border-border/70 p-1">
          {(["g", "ml"] as const).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnit(u)}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
                unit === u ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {u === "g" ? "Sólido (g)" : "Líquido (ml)"}
            </button>
          ))}
        </div>
        <Input
          placeholder={`kcal / 100 ${unit}`}
          type="number"
          value={kcal}
          onChange={(e) => setKcal(e.target.value)}
        />
        <Button
          onClick={() => create.mutate()}
          disabled={!name.trim() || !Number(kcal) || create.isPending}
        >
          Cadastrar
        </Button>
      </div>
      {(foods ?? []).length > 0 && (
        <ul className="divide-y divide-border/60">
          {foods!.map((f) => (
            <li key={f.id} className="flex items-center gap-3 py-2">
              <span className="flex-1 truncate text-sm">{f.name}</span>
              <span className="stat-number text-sm">
                {Math.round(Number(f.kcal_per_100g))} kcal/100{f.unit === "ml" ? "ml" : "g"}
              </span>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Remover ${f.name}`}
                onClick={() => remove.mutate(f.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
