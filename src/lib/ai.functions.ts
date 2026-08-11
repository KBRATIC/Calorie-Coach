import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Input = z.object({
  text: z.string().min(2).max(1000),
  meal: z.string().min(1).max(30),
});

export const parseMeal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    const { parseMealText } = await import("@/lib/ai.server");
    return { items: await parseMealText(data.text, data.meal) };
  });

const ChatInput = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "model"]),
    text: z.string().min(1),
    imageBase64: z.string().optional()
  })).max(20)
});

export const askAssistant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => ChatInput.parse(data))
  .handler(async ({ data, context }) => {
    // 1. Injeção de Contexto Invisível
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    
    // Data de 7 dias atrás
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastWeekStr = lastWeek.toISOString().split("T")[0];
    
    let contextStr = "";
    try {
      // Buscar metas
      const { data: goalData } = await context.supabase
        .from("user_goals")
        .select("daily_calorie_goal")
        .eq("user_id", context.userId)
        .maybeSingle();

      // Buscar entradas recentes (últimos 7 dias) para entender hábitos
      const { data: recentEntries } = await context.supabase
        .from("food_entries")
        .select("name, kcal, consumed_on")
        .eq("user_id", context.userId)
        .gte("consumed_on", lastWeekStr);

      if (goalData && recentEntries) {
        const goal = goalData.daily_calorie_goal || 2000;
        
        // Entradas de hoje
        const todaysEntries = recentEntries.filter(e => e.consumed_on === todayStr);
        const consumed = todaysEntries.reduce((sum, e) => sum + Number(e.kcal), 0);
        const remaining = goal - consumed;
        
        // Hábitos recentes (nomes únicos)
        const uniqueFoods = Array.from(new Set(recentEntries.map(e => e.name))).slice(0, 20).join(", ");
        
        contextStr = `\n\n[CONTEXTO INTERNO INVISÍVEL AO USUÁRIO:
- Calorias consumidas hoje: ${consumed} kcal de uma meta de ${goal} kcal (Restam ${remaining} kcal).
- Alimentos que o usuário costuma comer (histórico recente): ${uniqueFoods || "Nenhum histórico ainda"}.
Regra 1: Se for recomendar uma refeição, priorize MUITO usar alimentos parecidos ou iguais ao histórico recente dele. Leve o saldo de calorias em consideração.
Regra 2 (CRÍTICA): Aja naturalmente. NUNCA mencione que você teve acesso ao "histórico" dele, nem diga frases como "com base no seu histórico". Apenas recomende.
Regra 3: Se o usuário enviar uma foto de comida, faça uma análise mais aprofundada dos ingredientes e estimativas, sem ser superficial.]`;
      }
    } catch (err) {
      console.error("Erro ao buscar contexto para IA", err);
    }

    const { chatAssistant } = await import("@/lib/ai.server");
    return { text: await chatAssistant(data.messages, contextStr) };
  });
