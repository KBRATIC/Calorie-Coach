import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, AlertTriangle, Loader2, Download } from "lucide-react";
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
  calcMacroGoals,
  type Sex,
} from "@/lib/nutrition";

import { Route as AuthRoute } from "@/routes/_authenticated/route";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import { motion } from "motion/react";
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

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.9, rotateX: 5 },
  show: { opacity: 1, y: 0, scale: 1, rotateX: 0, transition: { type: "spring", stiffness: 250, damping: 15 } }
};

export function ProfilePage() {
  const { user } = AuthRoute.useRouteContext();
  const { installPrompt, triggerInstall } = usePwaInstall();
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
  const macros = calcMacroGoals(target);

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
        protein_goal: calcMacroGoals(target).protein,
        carbs_goal: calcMacroGoals(target).carbs,
        fat_goal: calcMacroGoals(target).fat,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Meta salva", { description: `${target} kcal por dia` });
    },
    onError: (e: Error) => toast.error("Erro ao salvar", { description: e.message }),
  });

  return (
    <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.05 }} className="space-y-6">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl">Perfil &amp; Meta</h1>
          <p className="text-sm text-muted-foreground">
            TMB calculada por Mifflin-St Jeor ou Katch-McArdle (se informar % de gordura), com
            limites seguros de déficit e superávit.
          </p>
        </div>
        {installPrompt && (
          <Button 
            onClick={triggerInstall} 
            className="rounded-2xl h-10 px-4 bg-gradient-to-r from-blue-600 to-fuchsia-600 hover:from-blue-500 hover:to-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/20 gap-2 shrink-0 active:scale-95 transition-all"
          >
            <Download className="size-4" />
            Instalar App
          </Button>
        )}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <motion.div variants={itemVariants} className="bento-card p-6 sm:p-8 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3" />
          
          <div className="grid gap-6 sm:grid-cols-2 relative z-10">
            <div className="space-y-3">
              <Label className="text-muted-foreground font-medium">Sexo biológico</Label>
              <Select value={sex} onValueChange={(v) => setSex(v as Sex)}>
                <SelectTrigger className="bg-surface border-border rounded-2xl h-12">
                  <SelectValue placeholder="Selecione o sexo" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border bg-surface">
                  <SelectItem value="male" className="rounded-xl">Masculino</SelectItem>
                  <SelectItem value="female" className="rounded-xl">Feminino</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label htmlFor="age" className="text-muted-foreground font-medium">Idade</Label>
              <Input id="age" type="number" value={age} onChange={(e) => setAge(e.target.value)} className="bg-surface border-border rounded-2xl h-12" />
            </div>
            <div className="space-y-3">
              <Label htmlFor="height" className="text-muted-foreground font-medium">Altura (cm)</Label>
              <Input
                id="height"
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="bg-surface border-border rounded-2xl h-12"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="weight" className="text-muted-foreground font-medium">Peso (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="bg-surface border-border rounded-2xl h-12"
              />
            </div>
            <div className="space-y-3 sm:col-span-2">
              <Label htmlFor="bodyfat" className="text-muted-foreground font-medium">Gordura corporal (%) — opcional</Label>
              <Input
                id="bodyfat"
                type="number"
                step="0.1"
                placeholder="Ex.: 18"
                value={bodyFat}
                onChange={(e) => setBodyFat(e.target.value)}
                className="bg-surface border-border rounded-2xl h-12"
              />
              <p className="text-[13px] text-muted-foreground/70 font-light">
                Se você souber seu % de gordura, usamos a fórmula Katch-McArdle, mais precisa.
              </p>
            </div>
          </div>


          <div className="space-y-3 relative z-10">
            <Label className="text-muted-foreground font-medium">Nível de atividade</Label>
            <Select value={activity} onValueChange={setActivity}>
              <SelectTrigger className="bg-surface border-border rounded-2xl h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-border bg-surface">
                {ACTIVITY_LEVELS.map((a) => (
                  <SelectItem key={a.value} value={String(a.value)} className="rounded-xl">
                    {a.label} — {a.hint}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 relative z-10">
            <Label className="text-muted-foreground font-medium">Objetivo</Label>
            <Select value={goalType} onValueChange={setGoalType}>
              <SelectTrigger className="bg-surface border-border rounded-2xl h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-border bg-surface">
                {GOAL_PRESETS.map((g) => (
                  <SelectItem key={g.id} value={g.id} className="rounded-xl">
                    {g.label} — {g.hint}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {goalType === "custom" && (
            <div className="space-y-3 relative z-10">
              <Label htmlFor="manual" className="text-muted-foreground font-medium">Meta manual (kcal/dia)</Label>
              <Input
                id="manual"
                type="number"
                value={manual}
                onChange={(e) => setManual(e.target.value)}
                className="bg-surface border-border rounded-2xl h-12"
              />
            </div>
          )}

          <Button
            className="w-full rounded-2xl h-12 mt-4 text-base font-medium shadow-xl shadow-primary/20 active:scale-[0.98] transition-all relative z-10"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || !user}
          >
            Salvar meta
          </Button>
        </motion.div>

        <motion.div variants={itemVariants} className="bento-card p-6 sm:p-8 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">TMB (basal)</p>
              <p className="stat-number text-4xl font-medium tracking-tight text-foreground">{bmr} kcal</p>
              <p className="text-[13px] text-muted-foreground/70 font-light mt-1">{methodLabel}</p>
            </div>
            <div className="h-px w-full bg-border" />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                Gasto diário (TMB × atividade)
              </p>
              <p className="stat-number text-4xl font-medium tracking-tight text-foreground">{tdee} kcal</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-6 sm:p-8 text-primary-foreground shadow-2xl shadow-primary/20 relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-[11px] font-bold uppercase tracking-widest text-white/80 mb-2">Meta diária</p>
                <p className="stat-number text-5xl sm:text-6xl text-white font-medium tracking-tighter drop-shadow-md">{target} kcal</p>
                <p className="text-[13px] text-white/90 font-light mt-3 bg-black/10 inline-block px-3 py-1 rounded-full">
                  {weekly === 0
                    ? "Manutenção de peso"
                    : `${weekly > 0 ? "+" : ""}${weekly} kg por semana (estimativa)`}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-surface border border-border p-4 text-center shadow-inner">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[oklch(0.7_0.15_250)] mb-1">Proteína</p>
                <p className="stat-number text-2xl font-medium">{macros.protein}g</p>
              </div>
              <div className="rounded-2xl bg-surface border border-border p-4 text-center shadow-inner">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[oklch(0.8_0.18_70)] mb-1">Carbo</p>
                <p className="stat-number text-2xl font-medium">{macros.carbs}g</p>
              </div>
              <div className="rounded-2xl bg-surface border border-border p-4 text-center shadow-inner">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[oklch(0.7_0.2_15)] mb-1">Gordura</p>
                <p className="stat-number text-2xl font-medium">{macros.fat}g</p>
              </div>
            </div>
            
            {capped && (
              <p className="rounded-2xl bg-warning/10 border border-warning/20 p-4 text-[13px] text-warning font-medium">
                Ajustamos a meta para o limite seguro de {safeFloor(bmr, sex)} kcal (nunca abaixo da
                sua TMB) ou do teto de superávit.
              </p>
            )}
            
            <div className="flex items-center justify-between rounded-2xl bg-surface border border-border p-5">
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">IMC</p>
              <p className="stat-number text-2xl flex items-baseline gap-2">
                {bmi} <span className="text-[15px] font-medium text-foreground/80">{bmiLabel(bmi)}</span>
              </p>
            </div>
          </div>
        </motion.div>

      </div>

      {user && (
        <motion.div variants={itemVariants}>

        </motion.div>
      )}

      <motion.div variants={itemVariants} className="bento-card p-6 sm:p-8 mt-8 space-y-4">
        <h2 className="text-xl font-medium tracking-tight">Legal e Privacidade</h2>
        <div className="flex flex-col sm:flex-row flex-wrap gap-3">
          <Button asChild variant="outline" className="flex-1 justify-center sm:justify-start h-12 rounded-xl bg-surface border-border text-muted-foreground hover:text-foreground hover:bg-surface-strong shadow-sm active:scale-[0.98] transition-all">
            <Link to="/termos">Termos de Uso</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1 justify-center sm:justify-start h-12 rounded-xl bg-surface border-border text-muted-foreground hover:text-foreground hover:bg-surface-strong shadow-sm active:scale-[0.98] transition-all">
            <Link to="/privacidade">Política de Privacidade</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1 justify-center sm:justify-start h-12 rounded-xl bg-surface border-border text-muted-foreground hover:text-foreground hover:bg-surface-strong shadow-sm active:scale-[0.98] transition-all">
            <Link to="/cookies">Política de Cookies</Link>
          </Button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="bento-card border-destructive/20 space-y-6 p-6 sm:p-8 mt-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-destructive/5 -z-10" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-destructive/10 rounded-full blur-[80px] -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3" />
        
        <div className="relative z-10">
          <h2 className="text-xl text-destructive flex items-center gap-2 font-medium tracking-tight">
            <AlertTriangle className="size-5" /> Zona de Perigo
          </h2>
          <p className="text-[15px] text-muted-foreground/80 mt-2 leading-relaxed">
            A exclusão da sua conta apagará permanentemente todos os seus registros de refeições, metas e informações pessoais.
            Esta ação não pode ser desfeita.
          </p>
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full sm:w-auto rounded-2xl h-12 shadow-lg shadow-destructive/20 active:scale-[0.98] transition-all font-medium">
              <Trash2 className="size-4 mr-2" /> Excluir permanentemente
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-surface border-border rounded-[32px] p-8 shadow-2xl">
            <AlertDialogHeader className="space-y-3">
              <AlertDialogTitle className="text-2xl font-medium tracking-tight">Você tem certeza absoluta?</AlertDialogTitle>
              <AlertDialogDescription className="text-base text-muted-foreground/80 leading-relaxed">
                Isso apagará permanentemente sua conta e removerá todos os seus dados e registros alimentares dos nossos servidores. Esta ação é irreversível.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3 mt-6">
              <AlertDialogCancel className="rounded-2xl h-12 px-8 text-base font-medium border-white/10 hover:bg-white/5 transition-colors m-0">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction 
                className="rounded-2xl h-12 px-8 text-base font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-xl shadow-destructive/20 active:scale-[0.98] transition-all m-0"
                onClick={() => deleteAccountMutation.mutate()}
                disabled={deleteAccountMutation.isPending}
              >
                {deleteAccountMutation.isPending ? "Excluindo..." : "Sim, excluir minha conta"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>
    </motion.div>
  );
}

