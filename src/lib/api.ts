import { supabase } from "@/integrations/supabase/client";
import { BASE_FOODS, type BaseFood } from "@/data/baseFoods";

export type Goals = {
  user_id: string;
  sex: "male" | "female";
  birth_date: string | null;
  age: number | null;
  height_cm: number;
  weight_kg: number;
  activity_factor: number;
  goal_type: string;
  daily_calorie_goal: number;
  protein_goal: number | null;
  carbs_goal: number | null;
  fat_goal: number | null;
  bmr: number | null;
  tdee: number | null;
  body_fat_pct: number | null;
};


export type Entry = {
  id: string;
  name: string;
  grams: number | null;
  unit: string;
  kcal: number;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  meal: string;
  consumed_on: string;
};

export type CustomFood = {
  id: string;
  name: string;
  category: string | null;
  kcal_per_100g: number;
  protein_per_100g: number | null;
  carbs_per_100g: number | null;
  fat_per_100g: number | null;
  default_measure: string | null;
  default_grams: number | null;
  unit: string;
};

export type SearchableFood = BaseFood & { custom?: boolean; unit?: "g" | "ml" };

export async function fetchGoals(): Promise<Goals | null> {
  const { data, error } = await supabase.from("user_goals").select("*").maybeSingle();
  if (error) throw error;
  return (data as Goals) ?? null;
}

export async function saveGoals(userId: string, values: Partial<Goals>) {
  const { error } = await supabase
    .from("user_goals")
    .upsert({ user_id: userId, ...values }, { onConflict: "user_id" });
  if (error) throw error;
}

export async function fetchEntries(from: string, to: string): Promise<Entry[]> {
  const { data, error } = await supabase
    .from("food_entries")
    .select("id, name, grams, unit, kcal, protein, carbs, fat, meal, consumed_on")
    .gte("consumed_on", from)
    .lte("consumed_on", to)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Entry[];
}

export async function addEntry(entry: {
  user_id: string;
  name: string;
  grams: number | null;
  unit: string;
  kcal: number;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
  meal: string;
  consumed_on: string;
}) {
  const { error } = await supabase.from("food_entries").insert(entry);
  if (error) throw error;
}

export async function deleteEntry(id: string) {
  const { error } = await supabase.from("food_entries").delete().eq("id", id);
  if (error) throw error;
}

/** Remove todos os lançamentos de um dia. Devolve quantos foram apagados. */
export async function clearDay(day: string): Promise<number> {
  const { data, error } = await supabase
    .from("food_entries")
    .delete()
    .eq("consumed_on", day)
    .select("id");
  if (error) throw error;
  return (data ?? []).length;
}

/** Remove os lançamentos de uma refeição específica do dia. */
export async function clearMeal(day: string, meal: string): Promise<number> {
  const { data, error } = await supabase
    .from("food_entries")
    .delete()
    .eq("consumed_on", day)
    .eq("meal", meal)
    .select("id");
  if (error) throw error;
  return (data ?? []).length;
}

/** Remove o último lançamento registrado no dia (desfazer). */
export async function undoLastEntry(day: string): Promise<any | null> {
  const { data, error } = await supabase
    .from("food_entries")
    .select("*")
    .eq("consumed_on", day)
    .order("created_at", { ascending: false })
    .limit(1);
  if (error) throw error;
  const row = (data ?? [])[0];
  if (!row) return null;
  await deleteEntry(row.id);
  return row;
}


export async function fetchCustomFoods(): Promise<CustomFood[]> {
  const { data, error } = await supabase
    .from("foods")
    .select("id, name, category, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, default_measure, default_grams, unit")
    .not("user_id", "is", null)
    .order("name");
  if (error) throw error;
  return (data ?? []) as CustomFood[];
}

export async function addCustomFood(food: {
  user_id: string;
  name: string;
  kcal_per_100g: number;
  default_measure: string | null;
  default_grams: number | null;
  unit: "g" | "ml";
}) {
  const { error } = await supabase.from("foods").insert({ ...food, category: "Meus alimentos" });
  if (error) throw error;
}

export async function deleteCustomFood(id: string) {
  const { error } = await supabase.from("foods").delete().eq("id", id);
  if (error) throw error;
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function searchFoods(
  term: string,
  customFoods: CustomFood[],
  limit = 40,
): SearchableFood[] {
  const custom: SearchableFood[] = customFoods.map((f) => ({
    id: f.id,
    name: f.name,
    category: f.category ?? "Meus alimentos",
    kcalPer100g: Number(f.kcal_per_100g),
    measure: f.default_measure ?? "1 porção",
    measureGrams: Number(f.default_grams ?? 100),
    custom: true,
    unit: f.unit === "ml" ? "ml" : "g",
  }));

  const all = [...custom, ...BASE_FOODS];
  const q = normalize(term.trim());
  if (!q) return all.slice(0, limit);

  const words = q.split(/\s+/);
  const scored = all
    .map((food) => {
      const name = normalize(food.name);
      if (!words.every((w) => name.includes(w))) return null;
      const score = name.startsWith(words[0]!) ? 0 : 1;
      return { food, score };
    })
    .filter((x): x is { food: SearchableFood; score: number } => x !== null)
    .sort((a, b) => a.score - b.score || a.food.name.length - b.food.name.length);

  return scored.slice(0, limit).map((x) => x.food);
}

export type RecentFood = {
  name: string;
  grams: number | null;
  unit: string;
  kcal: number;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  meal: string;
};

/** Alimentos mais frequentes nos últimos 500 lançamentos. */
export async function fetchRecentFoods(limit = 12): Promise<RecentFood[]> {
  const { data, error } = await supabase
    .from("food_entries")
    .select("name, grams, unit, kcal, protein, carbs, fat, meal")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw error;
  
  const counts = new Map<string, { count: number; food: RecentFood }>();
  for (const row of (data ?? []) as RecentFood[]) {
    const key = row.name.toLowerCase();
    if (counts.has(key)) {
      counts.get(key)!.count++;
    } else {
      counts.set(key, { count: 1, food: row });
    }
  }
  
  return Array.from(counts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map((x) => x.food);
}

export async function fetchHasSeenOnboarding(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("profiles")
    .select("has_seen_onboarding")
    .eq("id", userId)
    .maybeSingle();
  if (error) return false;
  return data?.has_seen_onboarding ?? false;
}

export async function markOnboardingSeen(userId: string) {
  const { error } = await supabase
    .from("profiles")
    .update({ has_seen_onboarding: true })
    .eq("id", userId);
  if (error) throw error;
}

export async function addEntries(
  rows: {
    user_id: string;
    name: string;
    grams: number | null;
    unit: string;
    kcal: number;
    protein?: number | null;
    carbs?: number | null;
    fat?: number | null;
    meal: string;
    consumed_on: string;
  }[],
) {
  if (rows.length === 0) return;
  const { error } = await supabase.from("food_entries").insert(rows);
  if (error) throw error;
}

/** Copia todos os registros de um dia para outro. */
export async function copyDay(userId: string, from: string, to: string): Promise<number> {
  const entries = await fetchEntries(from, from);
  if (entries.length === 0) return 0;
  await addEntries(
    entries.map((e) => ({
      user_id: userId,
      name: e.name,
      grams: e.grams,
      unit: e.unit,
      kcal: Number(e.kcal),
      protein: e.protein,
      carbs: e.carbs,
      fat: e.fat,
      meal: e.meal,
      consumed_on: to,
    })),
  );
  return entries.length;
}
