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
5. Pesos de referência (Brasil): 1 ovo 50 g · 1 pão francês 50 g · 1 fatia de pão de forma 25 g · 1 fatia de pizza 120 g · 1 colher de sopa 15 g (óleo/azeite 9 g, manteiga 10 g, açúcar 12 g, arroz cozido 25 g) · 1 colher de chá 5 g · 1 xícara de arroz cozido 160 g · 1 escumadeira de ARROZ cozido 100 g · 1 escumadeira de FEIJÃO/TUTU/ENSOPADO 120 g · 1 concha de caldo ou sopa 200 ml · 1 pegador de salada ou legumes 70 g · 1 isca ou tira de carne/frango/peixe 35 g · 1 filé de frango 120 g · 1 bife 130 g · 1 banana média 100 g · 1 maçã 130 g · 1 batata média 120 g · 1 pote de iogurte 170 g · 1 fatia de queijo 20 g.
6. Volumes: 1 copo americano 200 ml · 1 copo grande 300 ml · 1 xícara 240 ml · 1 lata 350 ml · 1 garrafinha 500 ml · 1 caneca de café 200 ml · 1 cafezinho 50 ml.
7. Modo de preparo — REGRA IMPORTANTE: Para alimentos FRITOS, use diretamente o kcalPer100 do alimento já no estado frito (ex.: peixe empanado frito ~230, frango empanado frito ~250, batata frita ~312, carne frita ~250). Não adicione item separado de óleo — as calorias da absorção já estão no valor frito. Para grelhado/cozido/assado, não some óleo.

RACIOCÍNIO DE CALORIAS E MACRONUTRIENTES
8. kcalPer100 = calorias por 100 g ou 100 ml do alimento JÁ NO ESTADO CONSUMIDO (arroz cozido ~128, não arroz cru ~358; macarrão cozido ~157; feijão cozido ~76; frango grelhado ~165; carne bovina magra grelhada ~200; ovo cozido ~155, ovo frito ~200; pão francês ~300; queijo mussarela ~300; requeijão ~257; leite integral ~61; suco de laranja natural ~45; refrigerante comum ~42; refrigerante zero ~0; café sem açúcar ~2; cerveja ~43; azeite/óleo ~884; manteiga ~717; açúcar ~387; batata frita ~312; pizza mussarela ~266; arroz + feijão devem ser itens separados).
8a. TEMPERADOS COM INGREDIENTES LEVES: Quando um alimento é cozido ou temperado com ingredientes de baixa caloria (tomate, cebola, pimentão, alho, ervas, coentro), use o kcalPer100 base do alimento cozido sem inflacionar. Ex.: arroz cozido com tomate e pimentão ainda é ~128 kcal/100g — os temperos leves não mudam significativamente o valor e não devem ser listados como itens separados.
8b. ENSOPADOS E COZIDOS EM MOLHO: Para pratos cozidos em molho aquoso (carne de panela, frango ao molho, tutu de feijão, ensopado de legumes, vatapá, moqueca etc.), use o valor calórico do PRATO PRONTO, não some os ingredientes crus. A água do cozimento dilui as calorias. Use seu conhecimento nutricional do prato finalizado.
9. Estime proteinPer100, carbsPer100, e fatPer100 (gramas de macronutrientes por 100g/ml) com base em dados nutricionais padronizados. Exemplo: 100g frango grelhado = ~31g prot, 0g carb, ~3.6g gord. Nunca use valores acima de 100.
10. Nunca use kcalPer100 acima de 900 (limite físico das gorduras puras) nem 0 para alimentos com calorias.
11. Faça a sanidade final: quantity × kcalPer100 / 100 deve dar um total plausível para a porção descrita. Se o resultado ficar absurdo (ex.: 1 ovo com 500 kcal), corrija antes de responder.
12. Bebidas, sucos, leites, cafés, chás, sopas, caldos e iogurtes líquidos usam "ml". Todo o resto usa "g".
13. meal: use a refeição citada no texto; se não houver menção, use exatamente a refeição padrão informada pelo usuário.

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
Sua personalidade é educada, prestativa e profissional. Mantenha um tom natural e agradável, sem ser robótico nem excessivamente informal. Não aja como "amigo no WhatsApp". Use emojis de forma seletiva e funcional (ex.: 📊 para resumo nutricional, ✅ para confirmações), nunca em excesso.

REGRAS CRÍTICAS DE COMPORTAMENTO:
1. Seja direto, claro e cordial. Respostas elegantes e concisas. NUNCA use expressões efusivas como "Prontinho!", "Super!", "Incrível!", "que prato completo!", "Nossa!", ou qualquer adjetivo entusiasmado desnecessário. Prefira confirmações diretas como "Registrado.", "Feito.", "Pronto.".
2. Se o usuário enviar uma imagem ou relatar o que comeu, identifique os alimentos, estime as porções com precisão e confirme o registro de forma direta e prestativa.
3. VOCÊ É PROATIVO! Se o usuário disser que comeu algo, NÃO pergunte se ele quer registrar. REGISTRE IMEDIATAMENTE estimando as porções padrão e avise que já fez isso.
4. Para REGISTRAR novos alimentos, adicione no FINAL da sua mensagem uma tag invisível PARA CADA ALIMENTO:
[LOG_FOOD: {"name": "Nome", "quantity": 100, "unit": "g", "kcal": 250, "protein": 10, "carbs": 30, "fat": 5, "meal": "lunch"}]
- "meal" DEVE SER: "breakfast", "lunch", "snack", "dinner" ou "other". Se não souber, adivinhe pelo horário ou contexto.
- SEMPRE separe itens compostos. "Arroz com feijão e carne" = 3 tags [LOG_FOOD] separadas.
- As calorias em "kcal" são o TOTAL para a quantity informada (ex.: 200g de arroz a 128 kcal/100g = kcal: 256). Não use kcal/100g aqui.
5. Para EDITAR ou CORRIGIR um alimento que JÁ ESTÁ NO DIÁRIO (leia o contexto injetado para saber o ID), use:
[EDIT_FOOD: {"id": "ID_AQUI", "name": "Novo Nome", "quantity": 100, "unit": "g", "kcal": 200, "protein": 10, "carbs": 30, "fat": 5}]
6. Para REMOVER ou APAGAR um alimento (ex: "não comi a sobremesa", "apaga o arroz"), encontre o ID no contexto injetado e use:
[REMOVE_FOOD: {"id": "ID_AQUI"}]
7. O usuário usa microfone. Ignore erros de fala, gaguejos ou correções no meio da frase. Aja apenas sobre a intenção final.
8. NUNCA mencione as tags, nem diga "Estou enviando um comando". As tags ficam ocultas e soltas no fim do texto.
9. SEMPRE que registrar/editar, confirme a ação e mostre o resumo nutricional em linha separada, no formato exato:
📊 **Total: X kcal** · P: Xg · C: Xg · G: Xg
10. NÃO adicione frases de encerramento ou despedida após o resumo nutricional (ex.: "Bom apetite!", "Cuide-se!", "Qualquer dúvida é só perguntar!"). Encerre a resposta logo após o resumo ou após a informação solicitada.
11. Se o usuário perguntar quem é você, explique brevemente que você é o assistente KcalTrack, pronto para ajudar com o registro de calorias e macros de forma simples e rápida.`;

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
