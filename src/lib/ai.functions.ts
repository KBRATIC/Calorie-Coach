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
    text: z.string(),
    images: z.array(z.string()).optional()
  })).max(20),
  date: z.string().optional()
});

export const askAssistant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => ChatInput.parse(data))
  .handler(async ({ data, context }) => {
    // 1. Injeção de Contexto Invisível
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const targetDateStr = data.date || todayStr;
    
    // Início da semana (Segunda-feira) para bater com o histórico do app
    const day = today.getDay();
    const diff = day === 0 ? 6 : day - 1;
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - diff);
    const startOfWeekStr = startOfWeek.toISOString().split("T")[0];
    
    let contextStr = "";
    
    // Rate Limiting Check (Tenta consultar tabela 'user_ai_limits', se não existir ou falhar, ignora)
    try {
      const { data: limitData, error: limitError } = await context.supabase
        .from('user_ai_limits')
        .select('count')
        .eq('user_id', context.userId)
        .eq('date', todayStr)
        .maybeSingle();
        
      if (!limitError && limitData && limitData.count >= 50) {
        throw new Error("RATE_LIMIT_EXCEEDED");
      }
      
      // Incrementa ou insere (se a tabela existir)
      await context.supabase.from('user_ai_limits').upsert({
        user_id: context.userId,
        date: todayStr,
        count: (limitData?.count || 0) + 1
      }, { onConflict: 'user_id,date' });
    } catch (err: any) {
      if (err.message === "RATE_LIMIT_EXCEEDED") {
        throw new Error("Você atingiu o limite diário de mensagens com a IA (50/dia). Volte amanhã!");
      }
      // Ignora erro se a tabela não existir ainda
      console.warn("Rate limit table might not exist:", err.message);
    }

    try {
      // Buscar metas
      const { data: goalData } = await context.supabase
        .from("user_goals")
        .select("daily_calorie_goal")
        .eq("user_id", context.userId)
        .maybeSingle();

      // Buscar entradas recentes (início da semana) para entender hábitos e saldo
      const { data: recentEntries } = await context.supabase
        .from("food_entries")
        .select("id, name, grams, unit, kcal, meal, consumed_on")
        .eq("user_id", context.userId)
        .gte("consumed_on", startOfWeekStr);

      if (goalData && recentEntries) {
        const goal = goalData.daily_calorie_goal || 2000;
        
        // Entradas de hoje
        const todaysEntries = recentEntries.filter(e => e.consumed_on === todayStr);
        const consumed = todaysEntries.reduce((sum, e) => sum + Number(e.kcal), 0);
        const remaining = goal - consumed;

        // Calcular Saldo Acumulado da Semana (excluindo hoje)
        const pastEntries = recentEntries.filter(e => e.consumed_on !== todayStr);
        const daysMap: Record<string, number> = {};
        for (const e of pastEntries) {
          daysMap[e.consumed_on] = (daysMap[e.consumed_on] || 0) + Number(e.kcal);
        }
        let accumulatedBalance = 0;
        for (const date in daysMap) {
          if (daysMap[date] > 0) {
            accumulatedBalance += (goal - daysMap[date]);
          }
        }
        
        // Hábitos recentes (nomes únicos)
        const uniqueFoods = Array.from(new Set(recentEntries.map(e => e.name))).slice(0, 20).join(", ");
        
        const todaysList = todaysEntries.map(e => `- ID: ${e.id} | ${e.name} | ${e.grams || "?"}${e.unit} | ${e.kcal} kcal | Refeição: ${e.meal}`).join("\n");
        
        contextStr = `\n\n[CONTEXTO INTERNO INVISÍVEL AO USUÁRIO:
- Calorias consumidas hoje: ${consumed} kcal de uma meta de ${goal} kcal (Restam ${remaining} kcal livres SÓ HOJE).
- SALDO ACUMULADO DA SEMANA: ${accumulatedBalance >= 0 ? '+' : ''}${accumulatedBalance} kcal (Este é o "banco de calorias" extra que o usuário economizou ou gastou nos dias anteriores. Se o usuário perguntar o que pode comer no fim de semana, some o restante de hoje + o saldo acumulado).
- ALIMENTOS REGISTRADOS HOJE:
${todaysList || "Nenhum alimento registrado ainda hoje."}
- Alimentos que o usuário costuma comer (histórico recente): ${uniqueFoods || "Nenhum histórico ainda"}.
Regra 1: Se for recomendar uma refeição, priorize MUITO usar alimentos parecidos ou iguais ao histórico recente dele. Leve o saldo de calorias em consideração.
Regra 2 (CRÍTICA): Aja naturalmente. NUNCA mencione que você teve acesso ao "histórico" dele, nem diga frases como "com base no seu histórico". Apenas recomende.
Regra 3: Se o usuário enviar uma foto de comida, faça uma análise mais aprofundada dos ingredientes e estimativas, sem ser superficial.]`;
      }
    } catch (err) {
      console.error("Erro ao buscar contexto para IA", err);
    }

    const { chatAssistant } = await import("@/lib/ai.server");
    let responseText = await chatAssistant(data.messages, contextStr);
    
    // Intercept [LOG_FOOD: {...}] tag
    const logMatches = [...responseText.matchAll(/\[LOG_FOOD:\s*({[\s\S]*?})\s*\]/g)];
    for (const match of logMatches) {
      if (match[1]) {
        try {
          const foodData = JSON.parse(match[1]);
          await context.supabase.from("food_entries").insert({
            user_id: context.userId,
            name: foodData.name,
            grams: foodData.quantity,
            unit: foodData.unit || "g",
            kcal: foodData.kcal,
            protein: foodData.protein || 0,
            carbs: foodData.carbs || 0,
            fat: foodData.fat || 0,
            meal: foodData.meal || "lunch",
            consumed_on: targetDateStr
          });
          
          responseText = responseText.replace(match[0], "");
        } catch (err) {
          console.error("Erro ao parsear e salvar LOG_FOOD tag", err);
        }
      }
    }

    // Intercept [EDIT_FOOD: {...}] tag
    const editMatches = [...responseText.matchAll(/\[EDIT_FOOD:\s*({[\s\S]*?})\s*\]/g)];
    for (const match of editMatches) {
      if (match[1]) {
        try {
          const editData = JSON.parse(match[1]);
          if (editData.id) {
            const updateObj: any = {};
            if (editData.name) updateObj.name = editData.name;
            if (editData.quantity !== undefined) updateObj.grams = editData.quantity;
            if (editData.unit) updateObj.unit = editData.unit;
            if (editData.kcal !== undefined) updateObj.kcal = editData.kcal;
            if (editData.protein !== undefined) updateObj.protein = editData.protein;
            if (editData.carbs !== undefined) updateObj.carbs = editData.carbs;
            if (editData.fat !== undefined) updateObj.fat = editData.fat;
            
            await context.supabase.from("food_entries").update(updateObj).eq("id", editData.id).eq("user_id", context.userId);
          }
          responseText = responseText.replace(match[0], "");
        } catch (err) {
          console.error("Erro ao parsear e salvar EDIT_FOOD tag", err);
        }
      }
    }

    // Intercept [REMOVE_FOOD: {...}] tag
    const removeMatches = [...responseText.matchAll(/\[REMOVE_FOOD:\s*({[\s\S]*?})\s*\]/g)];
    for (const match of removeMatches) {
      if (match[1]) {
        try {
          const removeData = JSON.parse(match[1]);
          if (removeData.id) {
            await context.supabase.from("food_entries").delete().eq("id", removeData.id).eq("user_id", context.userId);
          }
          responseText = responseText.replace(match[0], "");
        } catch (err) {
          console.error("Erro ao parsear e salvar REMOVE_FOOD tag", err);
        }
      }
    }
    
    responseText = responseText.trim();

    return { text: responseText };
  });

export const chatAssistantStreamFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => ChatInput.parse(data))
  .handler(async ({ data, context }) => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const targetDateStr = data.date || todayStr;
    const userId = context.userId;
    
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (type: string, payload: any) => {
          controller.enqueue(encoder.encode(`event: ${type}\ndata: ${JSON.stringify(payload)}\n\n`));
        };

        try {
          sendEvent("step", { message: "Lendo histórico do usuário..." });
          
          // Rate Limit Check
          const { data: limitData } = await context.supabase
            .from('user_ai_limits')
            .select('count')
            .eq('user_id', userId)
            .eq('date', todayStr)
            .maybeSingle();
            
          if (limitData && limitData.count >= 50) {
            sendEvent("error", { message: "Você atingiu o limite diário de mensagens com a IA (50/dia). Volte amanhã!" });
            controller.close();
            return;
          }
          
          await context.supabase.from('user_ai_limits').upsert({
            user_id: userId,
            date: todayStr,
            count: (limitData?.count || 0) + 1
          }, { onConflict: 'user_id,date' });

          // Fetch Context
          const { data: goalData } = await context.supabase
            .from("user_goals")
            .select("daily_calorie_goal")
            .eq("user_id", userId)
            .maybeSingle();

          const day = today.getDay();
          const diff = day === 0 ? 6 : day - 1;
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - diff);
          const startOfWeekStr = startOfWeek.toISOString().split("T")[0];

          const { data: recentEntries } = await context.supabase
            .from("food_entries")
            .select("id, name, grams, unit, kcal, meal, consumed_on")
            .eq("user_id", userId)
            .gte("consumed_on", startOfWeekStr);

          let contextStr = "";
          if (goalData && recentEntries) {
            const goal = goalData.daily_calorie_goal || 2000;
            const todaysEntries = recentEntries.filter(e => e.consumed_on === todayStr);
            const consumed = todaysEntries.reduce((sum, e) => sum + Number(e.kcal), 0);
            const remaining = goal - consumed;
            const uniqueFoods = Array.from(new Set(recentEntries.map(e => e.name))).slice(0, 20).join(", ");
            const todaysList = todaysEntries.map(e => `- ID: ${e.id} | ${e.name} | ${e.grams || "?"}${e.unit} | ${e.kcal} kcal | Refeição: ${e.meal}`).join("\n");
            
            contextStr = `\n\n[CONTEXTO INTERNO INVISÍVEL AO USUÁRIO:
- Calorias consumidas hoje: ${consumed} kcal de uma meta de ${goal} kcal (Restam ${remaining} kcal livres SÓ HOJE).
- ALIMENTOS REGISTRADOS HOJE:
${todaysList || "Nenhum alimento registrado ainda hoje."}
- Alimentos que o usuário costuma comer (histórico recente): ${uniqueFoods || "Nenhum histórico ainda"}.
Regra 1: Se for recomendar uma refeição, priorize MUITO usar alimentos parecidos ou iguais ao histórico recente dele.
Regra 2 (CRÍTICA): Aja naturalmente. NUNCA mencione que você teve acesso ao "histórico" dele. Apenas recomende.
Regra 3: Se o usuário enviar uma foto de comida, faça uma análise mais aprofundada dos ingredientes e estimativas, sem ser superficial.]`;
          }

          sendEvent("step", { message: "Processando com a IA..." });

          // Call Gemini
          const { chatAssistantStream } = await import("@/lib/ai.server");
          const geminiStream = await chatAssistantStream(data.messages, contextStr);
          
          let fullResponse = "";
          for await (const chunk of geminiStream) {
            fullResponse += chunk;
            sendEvent("chunk", { text: chunk });
          }

          sendEvent("step", { message: "Salvando no banco..." });

          // Parse and insert commands
          const logMatches = [...fullResponse.matchAll(/\[LOG_FOOD:\s*({[\s\S]*?})\s*\]/g)];
          for (const match of logMatches) {
            if (match[1]) {
              try {
                const foodData = JSON.parse(match[1]);
                await context.supabase.from("food_entries").insert({
                  user_id: userId,
                  name: foodData.name,
                  grams: foodData.quantity,
                  unit: foodData.unit || "g",
                  kcal: foodData.kcal,
                  protein: foodData.protein || 0,
                  carbs: foodData.carbs || 0,
                  fat: foodData.fat || 0,
                  meal: foodData.meal || "lunch",
                  consumed_on: targetDateStr
                });
              } catch (err) {}
            }
          }

          const editMatches = [...fullResponse.matchAll(/\[EDIT_FOOD:\s*({[\s\S]*?})\s*\]/g)];
          for (const match of editMatches) {
            if (match[1]) {
              try {
                const editData = JSON.parse(match[1]);
                if (editData.id) {
                  const updateObj: any = {};
                  if (editData.name) updateObj.name = editData.name;
                  if (editData.quantity !== undefined) updateObj.grams = editData.quantity;
                  if (editData.unit) updateObj.unit = editData.unit;
                  if (editData.kcal !== undefined) updateObj.kcal = editData.kcal;
                  if (editData.protein !== undefined) updateObj.protein = editData.protein;
                  if (editData.carbs !== undefined) updateObj.carbs = editData.carbs;
                  if (editData.fat !== undefined) updateObj.fat = editData.fat;
                  await context.supabase.from("food_entries").update(updateObj).eq("id", editData.id).eq("user_id", userId);
                }
              } catch (err) {}
            }
          }

          const removeMatches = [...fullResponse.matchAll(/\[REMOVE_FOOD:\s*({[\s\S]*?})\s*\]/g)];
          for (const match of removeMatches) {
            if (match[1]) {
              try {
                const removeData = JSON.parse(match[1]);
                if (removeData.id) {
                  await context.supabase.from("food_entries").delete().eq("id", removeData.id).eq("user_id", userId);
                }
              } catch (err) {}
            }
          }

          sendEvent("done", {});
          controller.close();
        } catch (error: any) {
          sendEvent("error", { message: error.message || "Unknown error" });
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  });
