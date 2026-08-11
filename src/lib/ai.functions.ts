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
    const today = new Date().toISOString().split("T")[0];
    
    let contextStr = "";
    try {
      // Buscar metas
      const { data: goalData } = await context.supabase
        .from("user_goals")
        .select("daily_calorie_goal")
        .eq("user_id", context.userId)
        .maybeSingle();

      // Buscar consumido hoje
      const { data: entries } = await context.supabase
        .from("food_entries")
        .select("kcal")
        .eq("user_id", context.userId)
        .gte("consumed_on", today)
        .lte("consumed_on", today);

      if (goalData) {
        const goal = goalData.daily_calorie_goal || 2000;
        const consumed = (entries || []).reduce((sum, e) => sum + Number(e.kcal), 0);
        const remaining = goal - consumed;
        contextStr = `\n\n[CONTEXTO INTERNO INVISÍVEL AO USUÁRIO: O usuário consumiu hoje um total de ${consumed} kcal de uma meta diária de ${goal} kcal. Restam ${remaining} kcal para o dia de hoje. Leve isso em consideração se o usuário perguntar sobre dietas, o que jantar ou como fechar o dia.]`;
      }
    } catch (err) {
      console.error("Erro ao buscar contexto para IA", err);
    }

    const { chatAssistant } = await import("@/lib/ai.server");
    return { text: await chatAssistant(data.messages, contextStr) };
  });
