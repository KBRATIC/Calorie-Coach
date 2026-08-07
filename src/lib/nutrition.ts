export type Sex = "male" | "female";

export type ActivityLevel = {
  value: number;
  label: string;
  hint: string;
};

export const ACTIVITY_LEVELS: ActivityLevel[] = [
  { value: 1.2, label: "Sedentário", hint: "Pouco ou nenhum exercício" },
  { value: 1.375, label: "Leve", hint: "1 a 3 treinos por semana" },
  { value: 1.55, label: "Moderado", hint: "3 a 5 treinos por semana" },
  { value: 1.725, label: "Intenso", hint: "6 a 7 treinos por semana" },
  { value: 1.9, label: "Atleta", hint: "Treino pesado 2x ao dia" },
];

export type GoalPreset = {
  id: string;
  label: string;
  hint: string;
  adjust: number;
};

export const GOAL_PRESETS: GoalPreset[] = [
  { id: "cut_aggressive", label: "Perder peso rápido", hint: "-20% do gasto diário", adjust: -0.2 },
  { id: "cut", label: "Perder peso", hint: "-15% do gasto diário", adjust: -0.15 },
  { id: "cut_light", label: "Secar devagar", hint: "-10% do gasto diário", adjust: -0.1 },
  { id: "maintain", label: "Manter peso", hint: "Igual ao gasto diário", adjust: 0 },
  { id: "lean_bulk", label: "Ganhar massa magra", hint: "+10% do gasto diário", adjust: 0.1 },
  { id: "bulk", label: "Ganhar peso", hint: "+15% do gasto diário", adjust: 0.15 },
  { id: "bulk_aggressive", label: "Ganhar peso rápido", hint: "+20% do gasto diário", adjust: 0.2 },
  { id: "custom", label: "Meta manual", hint: "Eu defino as calorias", adjust: 0 },
];

/** Mifflin-St Jeor — taxa metabólica basal em kcal/dia. */
export function calcBmr(input: {
  sex: Sex;
  weightKg: number;
  heightCm: number;
  age: number;
}): number {
  const base = 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age;
  return Math.round(input.sex === "male" ? base + 5 : base - 161);
}

/** Katch-McArdle — usa massa magra, mais preciso quando o % de gordura é conhecido. */
export function calcBmrKatchMcArdle(weightKg: number, bodyFatPct: number): number {
  const leanMass = weightKg * (1 - bodyFatPct / 100);
  return Math.round(370 + 21.6 * leanMass);
}

/**
 * TMB refinada: usa Katch-McArdle quando há % de gordura confiável (5–60),
 * senão Mifflin-St Jeor. Aplica correção para obesidade (peso ajustado),
 * já que Mifflin superestima em IMC muito alto.
 */
export function resolveBmr(input: {
  sex: Sex;
  weightKg: number;
  heightCm: number;
  age: number;
  bodyFatPct?: number | null;
}): { bmr: number; method: "katch" | "mifflin" | "mifflin-ajustado" } {
  const { sex, weightKg, heightCm, age, bodyFatPct } = input;

  if (bodyFatPct && bodyFatPct >= 5 && bodyFatPct <= 60 && weightKg > 0) {
    return { bmr: calcBmrKatchMcArdle(weightKg, bodyFatPct), method: "katch" };
  }

  const bmi = calcBmi(weightKg, heightCm);
  if (bmi >= 30 && heightCm > 0) {
    // Peso ajustado: peso ideal (IMC 25) + 25% do excesso.
    const idealWeight = 25 * (heightCm / 100) ** 2;
    const adjusted = idealWeight + 0.25 * (weightKg - idealWeight);
    return {
      bmr: calcBmr({ sex, weightKg: adjusted, heightCm, age }),
      method: "mifflin-ajustado",
    };
  }

  return { bmr: calcBmr({ sex, weightKg, heightCm, age }), method: "mifflin" };
}

export function calcTdee(bmr: number, activityFactor: number): number {
  return Math.round(bmr * activityFactor);
}

/** Piso calórico seguro: nunca abaixo da TMB nem dos mínimos clínicos. */
export function safeFloor(bmr: number, sex: Sex): number {
  return Math.max(bmr, sex === "male" ? 1500 : 1200);
}

export function calcGoalCalories(tdee: number, goalId: string): number {
  const preset = GOAL_PRESETS.find((g) => g.id === goalId);
  if (!preset || preset.id === "custom") return tdee;
  return Math.round(tdee * (1 + preset.adjust));
}

/**
 * Meta final já com limites de segurança: em déficit, não desce abaixo do piso
 * seguro; em superávit, limita o ganho a +20% do gasto.
 */
export function calcSafeGoalCalories(input: {
  tdee: number;
  bmr: number;
  sex: Sex;
  goalId: string;
  manual?: number;
}): { target: number; capped: boolean } {
  const raw =
    input.goalId === "custom"
      ? Math.round(input.manual ?? input.tdee)
      : calcGoalCalories(input.tdee, input.goalId);

  const floor = safeFloor(input.bmr, input.sex);
  const ceiling = Math.round(input.tdee * 1.25);

  if (raw < floor) return { target: floor, capped: true };
  if (raw > ceiling) return { target: ceiling, capped: true };
  return { target: raw, capped: false };
}

/** Estimativa de variação de peso por semana com base no déficit/superávit. */
export function weeklyWeightChangeKg(target: number, tdee: number): number {
  return Math.round(((target - tdee) * 7) / 7700 * 100) / 100;
}

export function ageFromBirthDate(birthDate: string): number {
  const b = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age -= 1;
  return age;
}


export function calcBmi(weightKg: number, heightCm: number): number {
  const h = heightCm / 100;
  if (!h) return 0;
  return Math.round((weightKg / (h * h)) * 10) / 10;
}

export function bmiLabel(bmi: number): string {
  if (bmi < 18.5) return "Abaixo do peso";
  if (bmi < 25) return "Peso normal";
  if (bmi < 30) return "Sobrepeso";
  if (bmi < 35) return "Obesidade grau I";
  if (bmi < 40) return "Obesidade grau II";
  return "Obesidade grau III";
}

export const MEALS = [
  { id: "breakfast", label: "Café da manhã" },
  { id: "lunch", label: "Almoço" },
  { id: "snack", label: "Lanche" },
  { id: "dinner", label: "Jantar" },
  { id: "other", label: "Outros" },
] as const;

export function mealLabel(id: string): string {
  return MEALS.find((m) => m.id === id)?.label ?? "Outros";
}

/** Data local (São Paulo) no formato YYYY-MM-DD. */
export function todayISO(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
}

export function formatDayLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y!, (m ?? 1) - 1, d ?? 1);
  return date.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" });
}

export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y!, (m ?? 1) - 1, d ?? 1);
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString("en-CA");
}

export type Unit = "g" | "ml";

const LIQUID_CATEGORIES = [
  "bebidas alcoolicas",
  "bebidas nao alcoolicas",
  "leites e achocolatados",
  "sopas e caldos",
];

function strip(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/** Bebidas e liquidos sao medidos em ml; solidos em g. */
export function unitFor(input: { category?: string | null; name?: string | null }): Unit {
  const cat = strip(input.category ?? "");
  if (LIQUID_CATEGORIES.includes(cat)) return "ml";
  const name = strip(input.name ?? "");
  if (/\b(suco|refresco|refrigerante|agua|cha|cafe|leite|smoothie|vitamina|bebida|caldo|iogurte liquido)\b/.test(name))
    return "ml";
  return "g";
}

export function unitLabel(unit: Unit): string {
  return unit === "ml" ? "ml" : "g";
}
