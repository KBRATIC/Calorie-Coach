export type ParsedItem = {
  name: string;
  quantity: number;
  unit: "g" | "ml";
  kcalPer100: number;
  proteinPer100: number;
  carbsPer100: number;
  fatPer100: number;
  meal: string;
};

const SYSTEM = `Você é nutricionista e converte descrições de refeições em português (Brasil) para JSON.

FORMATO
Responda apenas: {"items":[{"name":string,"quantity":number,"unit":"g"|"ml","kcalPer100":number,"proteinPer100":number,"carbsPer100":number,"fatPer100":number,"meal":"breakfast"|"lunch"|"snack"|"dinner"|"other"}]}

RACIOCÍNIO DE QUANTIDADE (faça passo a passo antes de responder)
1. Identifique cada alimento separadamente. Nunca junte itens diferentes em uma linha (ex.: "pão com requeijão" = 2 itens: pão e requeijão).
2. Descubra o número de unidades ("2 ovos" = 2 unidades) e multiplique pelo peso unitário.
3. quantity é sempre o TOTAL consumido, em gramas (sólidos) ou mililitros (líquidos) — nunca por unidade.
4. Se a quantidade não for dita, use uma porção caseira típica de 1 unidade/1 porção, nunca 100 g por padrão.
5. Pesos de referência (Brasil): 1 ovo 50 g · 1 pão francês 50 g · 1 fatia de pão de forma 25 g · 1 fatia de pizza 120 g · 1 colher de sopa 15 g (óleo/azeite 9 g, manteiga 10 g, açúcar 12 g, arroz cozido 25 g) · 1 colher de chá 5 g · 1 xícara de arroz cozido 160 g · 1 escumadeira de feijão 80 g · 1 filé de frango 120 g · 1 bife 130 g · 1 banana média 100 g · 1 maçã 130 g · 1 batata média 120 g · 1 pote de iogurte 170 g · 1 fatia de queijo 20 g.
6. Volumes: 1 copo americano 200 ml · 1 copo grande 300 ml · 1 xícara 240 ml · 1 lata 350 ml · 1 garrafinha 500 ml · 1 caneca de café 200 ml · 1 cafezinho 50 ml.
7. Trate o modo de preparo: frito soma óleo absorvido (+5 a 10 g de óleo por porção como item separado só se o texto indicar fritura em óleo), grelhado/cozido não.

RACIOCÍNIO DE CALORIAS E MACRONUTRIENTES
8. kcalPer100 = calorias por 100 g ou 100 ml do alimento JÁ NO ESTADO CONSUMIDO (arroz cozido ~128, não arroz cru ~358; macarrão cozido ~157; feijão cozido ~76; frango grelhado ~165; carne bovina magra grelhada ~200; ovo cozido ~155, ovo frito ~200; pão francês ~300; queijo mussarela ~300; requeijão ~257; leite integral ~61; suco de laranja natural ~45; refrigerante comum ~42; refrigerante zero ~0; café sem açúcar ~2; cerveja ~43; azeite/óleo ~884; manteiga ~717; açúcar ~387; batata frita ~312; pizza mussarela ~266; arroz + feijão devem ser itens separados).
9. Estime proteinPer100, carbsPer100, e fatPer100 (gramas de macronutrientes por 100g/ml) com base em dados nutricionais padronizados. Exemplo: 100g frango grelhado = ~31g prot, 0g carb, ~3.6g gord. Nunca use valores acima de 100.
10. Nunca use kcalPer100 acima de 900 (limite físico das gorduras puras) nem 0 para alimentos com calorias.
10. Faça a sanidade final: quantity × kcalPer100 / 100 deve dar um total plausível para a porção descrita. Se o resultado ficar absurdo (ex.: 1 ovo com 500 kcal), corrija antes de responder.
11. Bebidas, sucos, leites, cafés, chás, sopas, caldos e iogurtes líquidos usam "ml". Todo o resto usa "g".
12. meal: use a refeição citada no texto; se não houver menção, use exatamente a refeição padrão informada pelo usuário.

Responda apenas o JSON, sem comentários.`;


function normalizeItems(items: unknown[], defaultMeal: string): ParsedItem[] {
  return items
    .map((raw) => {
      const it = raw as Partial<ParsedItem>;
      const quantity = Number(it.quantity);
      const kcalPer100 = Number(it.kcalPer100);
      const proteinPer100 = Number(it.proteinPer100) || 0;
      const carbsPer100 = Number(it.carbsPer100) || 0;
      const fatPer100 = Number(it.fatPer100) || 0;
      if (!it.name || !Number.isFinite(quantity) || !Number.isFinite(kcalPer100)) return null;
      return {
        name: String(it.name).slice(0, 120),
        quantity: Math.max(1, Math.round(quantity)),
        unit: it.unit === "ml" ? "ml" : "g",
        kcalPer100: Math.max(0, Math.round(kcalPer100 * 10) / 10),
        proteinPer100: Math.max(0, Math.round(proteinPer100 * 10) / 10),
        carbsPer100: Math.max(0, Math.round(carbsPer100 * 10) / 10),
        fatPer100: Math.max(0, Math.round(fatPer100 * 10) / 10),
        meal: typeof it.meal === "string" && it.meal ? it.meal : defaultMeal,
      } satisfies ParsedItem;
    })
    .filter((x): x is ParsedItem => x !== null)
    .slice(0, 20);
}

function parseJsonContent(content: string, defaultMeal: string): ParsedItem[] {
  let parsed: { items?: unknown };
  try {
    parsed = JSON.parse(content) as { items?: unknown };
  } catch {
    throw new Error("Não entendi a descrição, tente reescrever.");
  }
  const items = Array.isArray(parsed.items) ? parsed.items : [];
  return normalizeItems(items, defaultMeal);
}

async function parseWithGoogle(text: string, defaultMeal: string, key: string): Promise<ParsedItem[]> {
  const url = new URL(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
  );
  url.searchParams.set("key", key);

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM }] },
      contents: [
        {
          role: "user",
          parts: [{ text: `Refeição padrão: ${defaultMeal}\n${text}` }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("Google AI Studio error:", res.status, body);
    throw new Error(`Falha na IA do Google (${res.status})`);
  }

  const json = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
    error?: { message?: string };
  };

  if (json.error) {
    console.error("Google AI Studio error:", json.error);
    throw new Error(json.error.message ?? "Erro na IA do Google");
  }

  const content = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
  return parseJsonContent(content, defaultMeal);
}

export async function parseMealText(text: string, defaultMeal: string): Promise<ParsedItem[]> {
  const googleKey = process.env["GEMINI_API_KEY"] || process.env["GOOGLE_AI_STUDIO_API_KEY"];
  if (!googleKey) throw new Error("Chave GEMINI_API_KEY não configurada no .env");
  return parseWithGoogle(text, defaultMeal, googleKey);
}

const CHAT_SYSTEM = `Você é o KcalTrack, um assistente inteligente focado em facilitar o registro rápido de refeições e o acompanhamento de calorias.
Sua personalidade é educada, prestativa e amigável. Você deve ter um tom natural e agradável, não robótico, mas mantendo o profissionalismo. Não seja excessivamente íntimo, efusivo ou aja como um "amigo no WhatsApp". Use alguns emojis sutis para deixar o texto mais visual, mas sem exageros.

Sua função principal vai além de apenas registrar: você deve ser capaz de interpretar todo o contexto da conversa. O histórico das mensagens enviadas nesta sessão será fornecido, e você deve usá-lo para raciocinar e responder com inteligência.

INSTRUÇÃO DE RACIOCÍNIO (MUITO IMPORTANTE):
Antes de dar a sua resposta final, você DEVE organizar seu raciocínio passo a passo usando tags <think> e </think>. Dentro dessa tag, você pode "pensar em voz alta", analisar a imagem, calcular os macros e revisar o histórico. Somente após fechar a tag </think> você deve escrever a mensagem final que será mostrada ao usuário.

REGRAS CRÍTICAS DE COMPORTAMENTO:
1. LEIA O CONTEXTO! Se o usuário fizer perguntas sobre uma imagem já enviada ou um prato recém-registrado, você DEVE usar o histórico do chat para entender do que ele está falando.
2. Seja direto, claro e cordial. Substitua saudações secas por interações naturais.
3. Se o usuário enviar uma imagem ou relatar o que comeu com a intenção de registrar, identifique os alimentos na sua tag <think>, estime as porções e depois confirme o registro.
4. VOCÊ É PROATIVO! Se o usuário disser que comeu algo, NÃO pergunte se ele quer registrar. REGISTRE IMEDIATAMENTE.
5. Para REGISTRAR novos alimentos, adicione no FINAL da sua mensagem (fora da tag think) uma tag invisível PARA CADA ALIMENTO:
[LOG_FOOD: {"name": "Nome", "quantity": 100, "unit": "g", "kcal": 250, "protein": 10, "carbs": 30, "fat": 5, "meal": "lunch"}]
- "meal" DEVE SER: "breakfast", "lunch", "snack", "dinner" ou "other". Se não souber, adivinhe.
- SEMPRE separe itens compostos. "Arroz com feijão e carne" = 3 tags [LOG_FOOD] separadas.
6. Para EDITAR ou CORRIGIR um alimento que JÁ ESTÁ NO DIÁRIO (leia o contexto injetado), use:
[EDIT_FOOD: {"id": "ID_AQUI", "name": "Novo Nome", "quantity": 100, "unit": "g", "kcal": 200, "protein": 10, "carbs": 30, "fat": 5}]
7. Para REMOVER ou APAGAR um alimento (ex: "apaga o arroz"), encontre o ID e use:
[REMOVE_FOOD: {"id": "ID_AQUI"}]
8. O usuário usa microfone. Ignore erros de fala e foque na intenção final.
9. NUNCA mencione as tags, nem diga "Estou enviando um comando".
10. SEMPRE que registrar/editar:
- Mostre o resumo nutricional na mensagem visível ao usuário: "Total estimado: X kcal (P: Xg, C: Xg, G: Xg)."
11. Responda a perguntas contextuais justificando seu raciocínio com base nos alimentos vistos.`;

export async function chatAssistant(
  messages: { role: "user" | "model"; text: string; images?: string[] }[],
  contextStr: string = ""
): Promise<string> {
  const googleKey = process.env["GEMINI_API_KEY"] || process.env["GOOGLE_AI_STUDIO_API_KEY"];
  if (!googleKey) throw new Error("Chave GEMINI_API_KEY não configurada no .env");

  const url = new URL(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent"
  );
  url.searchParams.set("key", googleKey);

  const contents = messages.map((m, index) => {
    const parts: any[] = [];
    
    // Injeta o contexto no último texto enviado pelo usuário
    let textToSend = m.text;
    if (m.role === "user" && index === messages.length - 1 && contextStr) {
      textToSend += contextStr;
    }

    if (textToSend) {
      parts.push({ text: textToSend });
    }
    
    if (m.images && m.images.length > 0) {
      for (const imgBase64 of m.images) {
        let mimeType = "image/jpeg";
        let base64Data = imgBase64;
        
        if (base64Data.startsWith("data:")) {
          const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          if (matches && matches.length === 3) {
            mimeType = matches[1] || "image/jpeg";
            base64Data = matches[2] || base64Data;
          }
        }

        parts.push({
          inlineData: {
            mimeType: mimeType,
            data: base64Data,
          },
        });
      }
    }

    return {
      role: m.role,
      parts,
    };
  });

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: CHAT_SYSTEM }] },
      contents,
      generationConfig: {
        temperature: 0.7,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("Google AI Chat error:", res.status, body);
    throw new Error(`Falha no chat da IA do Google (${res.status})`);
  }

  const json = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
    error?: { message?: string };
  };

  if (json.error) {
    throw new Error(json.error.message ?? "Erro na IA do Google");
  }

  const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return text;
}

export async function* chatAssistantStream(
  messages: { role: "user" | "model"; text: string; images?: string[] }[],
  contextStr: string = ""
): AsyncGenerator<string, void, unknown> {
  const googleKey = process.env["GEMINI_API_KEY"] || process.env["GOOGLE_AI_STUDIO_API_KEY"];
  if (!googleKey) throw new Error("Chave GEMINI_API_KEY não configurada no .env");

  const url = new URL(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:streamGenerateContent?alt=sse"
  );
  url.searchParams.set("key", googleKey);

  const contents = messages.map((m, index) => {
    const parts: any[] = [];
    
    let textToSend = m.text;
    if (m.role === "user" && index === messages.length - 1 && contextStr) {
      textToSend += contextStr;
    }

    if (textToSend) {
      parts.push({ text: textToSend });
    }
    
    if (m.images && m.images.length > 0) {
      for (const imgBase64 of m.images) {
        let mimeType = "image/jpeg";
        let base64Data = imgBase64;
        
        if (base64Data.startsWith("data:")) {
          const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          if (matches && matches.length === 3) {
            mimeType = matches[1] || "image/jpeg";
            base64Data = matches[2] || base64Data;
          }
        }

        parts.push({
          inlineData: {
            mimeType: mimeType,
            data: base64Data,
          },
        });
      }
    }

    return {
      role: m.role,
      parts,
    };
  });

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: CHAT_SYSTEM }] },
      contents,
      generationConfig: {
        temperature: 0.7,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("Google AI Chat Streaming error:", res.status, body);
    throw new Error(`Falha no chat da IA do Google (${res.status})`);
  }

  if (!res.body) {
    throw new Error("Resposta da IA sem corpo de stream");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    
    let boundary = buffer.indexOf("\n\n");
    while (boundary !== -1) {
      const eventChunk = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      
      const lines = eventChunk.split("\n");
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const dataStr = line.slice(6);
          try {
            const dataObj = JSON.parse(dataStr);
            const textPart = dataObj?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (textPart) {
              yield textPart;
            }
          } catch (e) {
            // ignore parsing errors on partial json or done message
          }
        }
      }
      boundary = buffer.indexOf("\n\n");
    }
  }
}
