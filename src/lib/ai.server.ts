export type ParsedItem = {
  name: string;
  quantity: number;
  unit: "g" | "ml";
  kcalPer100: number;
  meal: string;
};

const SYSTEM = `Você é nutricionista e converte descrições de refeições em português (Brasil) para JSON.

FORMATO
Responda apenas: {"items":[{"name":string,"quantity":number,"unit":"g"|"ml","kcalPer100":number,"meal":"breakfast"|"lunch"|"snack"|"dinner"|"other"}]}

RACIOCÍNIO DE QUANTIDADE (faça passo a passo antes de responder)
1. Identifique cada alimento separadamente. Nunca junte itens diferentes em uma linha (ex.: "pão com requeijão" = 2 itens: pão e requeijão).
2. Descubra o número de unidades ("2 ovos" = 2 unidades) e multiplique pelo peso unitário.
3. quantity é sempre o TOTAL consumido, em gramas (sólidos) ou mililitros (líquidos) — nunca por unidade.
4. Se a quantidade não for dita, use uma porção caseira típica de 1 unidade/1 porção, nunca 100 g por padrão.
5. Pesos de referência (Brasil): 1 ovo 50 g · 1 pão francês 50 g · 1 fatia de pão de forma 25 g · 1 fatia de pizza 120 g · 1 colher de sopa 15 g (óleo/azeite 9 g, manteiga 10 g, açúcar 12 g, arroz cozido 25 g) · 1 colher de chá 5 g · 1 xícara de arroz cozido 160 g · 1 escumadeira de feijão 80 g · 1 filé de frango 120 g · 1 bife 130 g · 1 banana média 100 g · 1 maçã 130 g · 1 batata média 120 g · 1 pote de iogurte 170 g · 1 fatia de queijo 20 g.
6. Volumes: 1 copo americano 200 ml · 1 copo grande 300 ml · 1 xícara 240 ml · 1 lata 350 ml · 1 garrafinha 500 ml · 1 caneca de café 200 ml · 1 cafezinho 50 ml.
7. Trate o modo de preparo: frito soma óleo absorvido (+5 a 10 g de óleo por porção como item separado só se o texto indicar fritura em óleo), grelhado/cozido não.

RACIOCÍNIO DE CALORIAS
8. kcalPer100 = calorias por 100 g ou 100 ml do alimento JÁ NO ESTADO CONSUMIDO (arroz cozido ~128, não arroz cru ~358; macarrão cozido ~157; feijão cozido ~76; frango grelhado ~165; carne bovina magra grelhada ~200; ovo cozido ~155, ovo frito ~200; pão francês ~300; queijo mussarela ~300; requeijão ~257; leite integral ~61; suco de laranja natural ~45; refrigerante comum ~42; refrigerante zero ~0; café sem açúcar ~2; cerveja ~43; azeite/óleo ~884; manteiga ~717; açúcar ~387; batata frita ~312; pizza mussarela ~266; arroz + feijão devem ser itens separados).
9. Nunca use kcalPer100 acima de 900 (limite físico das gorduras puras) nem 0 para alimentos com calorias.
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
      if (!it.name || !Number.isFinite(quantity) || !Number.isFinite(kcalPer100)) return null;
      return {
        name: String(it.name).slice(0, 120),
        quantity: Math.max(1, Math.round(quantity)),
        unit: it.unit === "ml" ? "ml" : "g",
        kcalPer100: Math.max(0, Math.round(kcalPer100 * 10) / 10),
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
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent",
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
