import { createAPIFileRoute } from '@tanstack/react-start/api';
import { createClient } from '@supabase/supabase-js';

function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith('sb_publishable_') || value.startsWith('sb_secret_');
}

function createSupabaseFetch(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== 'undefined' && input instanceof Request ? input.headers : undefined,
    );
    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }
    if (isNewSupabaseApiKey(supabaseKey) && headers.get('Authorization') === `Bearer ${supabaseKey}`) {
      headers.delete('Authorization');
    }
    headers.set('apikey', supabaseKey);
    return fetch(input, { ...init, headers });
  };
}

export const APIRoute = createAPIFileRoute('/api/chat')({
  POST: async ({ request }) => {
    const SUPABASE_URL = process.env['SUPABASE_URL'];
    const SUPABASE_PUBLISHABLE_KEY = process.env['SUPABASE_PUBLISHABLE_KEY'];

    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
      return new Response("Missing Supabase configuration", { status: 500 });
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response("Unauthorized", { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY,
      {
        global: {
          fetch: createSupabaseFetch(SUPABASE_PUBLISHABLE_KEY),
          headers: { Authorization: `Bearer ${token}` },
        },
        auth: { persistSession: false, autoRefreshToken: false },
      }
    );

    const { data: authData, error: authError } = await supabase.auth.getClaims(token);
    if (authError || !authData?.claims?.sub) {
      return new Response("Unauthorized", { status: 401 });
    }

    const userId = authData.claims.sub;
    
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response("Invalid JSON", { status: 400 });
    }

    const { messages, date } = body;
    if (!messages || !Array.isArray(messages)) {
      return new Response("Invalid messages", { status: 400 });
    }

    // Set up SSE Stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (type: string, data: any) => {
          controller.enqueue(encoder.encode(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`));
        };

        try {
          sendEvent("step", { message: "Lendo histórico do usuário..." });
          const todayStr = new Date().toISOString().split("T")[0];
          
          const { data: limitData } = await supabase
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
          
          await supabase.from('user_ai_limits').upsert({
            user_id: userId,
            date: todayStr,
            count: (limitData?.count || 0) + 1
          }, { onConflict: 'user_id,date' });

          // Fetch context
          const { data: goalData } = await supabase
            .from("user_goals")
            .select("daily_calorie_goal")
            .eq("user_id", userId)
            .maybeSingle();

          const day = new Date().getDay();
          const diff = day === 0 ? 6 : day - 1;
          const startOfWeek = new Date();
          startOfWeek.setDate(new Date().getDate() - diff);
          const startOfWeekStr = startOfWeek.toISOString().split("T")[0];

          const { data: recentEntries } = await supabase
            .from("food_entries")
            .select("id, name, grams, unit, kcal, meal, consumed_on")
            .eq("user_id", userId)
            .gte("consumed_on", startOfWeekStr);

          let contextStr = "";
          if (goalData && recentEntries) {
            const goal = goalData.daily_calorie_goal || 2000;
            const todaysEntries = recentEntries.filter((e: any) => e.consumed_on === todayStr);
            const consumed = todaysEntries.reduce((sum: number, e: any) => sum + Number(e.kcal), 0);
            const remaining = goal - consumed;
            const uniqueFoods = Array.from(new Set(recentEntries.map((e: any) => e.name))).slice(0, 20).join(", ");
            const todaysList = todaysEntries.map((e: any) => `- ID: ${e.id} | ${e.name} | ${e.grams || "?"}${e.unit} | ${e.kcal} kcal | Refeição: ${e.meal}`).join("\n");
            
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

          // Call Gemini Streaming
          const { chatAssistantStream } = await import("@/lib/ai.server");
          const geminiStream = await chatAssistantStream(messages, contextStr);
          
          let fullResponse = "";
          for await (const chunk of geminiStream) {
            fullResponse += chunk;
            
            // Verificamos se estamos dentro da tag de thinking para enviar via evento thinking
            // Mas no streaming é mais complexo. No frontend faremos o split se necessário.
            // Para manter a API simples, enviamos apenas os chunks de texto puros.
            sendEvent("chunk", { text: chunk });
          }

          sendEvent("step", { message: "Salvando no banco..." });

          // Parse LOG_FOOD, EDIT_FOOD, REMOVE_FOOD
          const targetDateStr = date || todayStr;
          const logMatches = [...fullResponse.matchAll(/\[LOG_FOOD:\s*({[\s\S]*?})\s*\]/g)];
          for (const match of logMatches) {
            if (match[1]) {
              try {
                const foodData = JSON.parse(match[1]);
                await supabase.from("food_entries").insert({
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
                  await supabase.from("food_entries").update(updateObj).eq("id", editData.id).eq("user_id", userId);
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
                  await supabase.from("food_entries").delete().eq("id", removeData.id).eq("user_id", userId);
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
  }
});
