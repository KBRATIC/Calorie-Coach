import { t as supabase } from "./client-CNGCc98v.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-sgbAF9tf.js
var ACTIVITY_LEVELS = [
	{
		value: 1.2,
		label: "Sedentário",
		hint: "Pouco ou nenhum exercício"
	},
	{
		value: 1.375,
		label: "Leve",
		hint: "1 a 3 treinos por semana"
	},
	{
		value: 1.55,
		label: "Moderado",
		hint: "3 a 5 treinos por semana"
	},
	{
		value: 1.725,
		label: "Intenso",
		hint: "6 a 7 treinos por semana"
	},
	{
		value: 1.9,
		label: "Atleta",
		hint: "Treino pesado 2x ao dia"
	}
];
var GOAL_PRESETS = [
	{
		id: "cut_aggressive",
		label: "Perder peso rápido",
		hint: "-20% do gasto diário",
		adjust: -.2
	},
	{
		id: "cut",
		label: "Perder peso",
		hint: "-15% do gasto diário",
		adjust: -.15
	},
	{
		id: "cut_light",
		label: "Secar devagar",
		hint: "-10% do gasto diário",
		adjust: -.1
	},
	{
		id: "maintain",
		label: "Manter peso",
		hint: "Igual ao gasto diário",
		adjust: 0
	},
	{
		id: "lean_bulk",
		label: "Ganhar massa magra",
		hint: "+10% do gasto diário",
		adjust: .1
	},
	{
		id: "bulk",
		label: "Ganhar peso",
		hint: "+15% do gasto diário",
		adjust: .15
	},
	{
		id: "bulk_aggressive",
		label: "Ganhar peso rápido",
		hint: "+20% do gasto diário",
		adjust: .2
	},
	{
		id: "custom",
		label: "Meta manual",
		hint: "Eu defino as calorias",
		adjust: 0
	}
];
/** Mifflin-St Jeor — taxa metabólica basal em kcal/dia. */
function calcBmr(input) {
	const base = 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age;
	return Math.round(input.sex === "male" ? base + 5 : base - 161);
}
/** Katch-McArdle — usa massa magra, mais preciso quando o % de gordura é conhecido. */
function calcBmrKatchMcArdle(weightKg, bodyFatPct) {
	const leanMass = weightKg * (1 - bodyFatPct / 100);
	return Math.round(370 + 21.6 * leanMass);
}
/**
* TMB refinada: usa Katch-McArdle quando há % de gordura confiável (5–60),
* senão Mifflin-St Jeor. Aplica correção para obesidade (peso ajustado),
* já que Mifflin superestima em IMC muito alto.
*/
function resolveBmr(input) {
	const { sex, weightKg, heightCm, age, bodyFatPct } = input;
	if (bodyFatPct && bodyFatPct >= 5 && bodyFatPct <= 60 && weightKg > 0) return {
		bmr: calcBmrKatchMcArdle(weightKg, bodyFatPct),
		method: "katch"
	};
	if (calcBmi(weightKg, heightCm) >= 30 && heightCm > 0) {
		const idealWeight = 25 * (heightCm / 100) ** 2;
		return {
			bmr: calcBmr({
				sex,
				weightKg: idealWeight + .25 * (weightKg - idealWeight),
				heightCm,
				age
			}),
			method: "mifflin-ajustado"
		};
	}
	return {
		bmr: calcBmr({
			sex,
			weightKg,
			heightCm,
			age
		}),
		method: "mifflin"
	};
}
function calcTdee(bmr, activityFactor) {
	return Math.round(bmr * activityFactor);
}
/** Piso calórico seguro: nunca abaixo da TMB nem dos mínimos clínicos. */
function safeFloor(bmr, sex) {
	return Math.max(bmr, sex === "male" ? 1500 : 1200);
}
function calcGoalCalories(tdee, goalId) {
	const preset = GOAL_PRESETS.find((g) => g.id === goalId);
	if (!preset || preset.id === "custom") return tdee;
	return Math.round(tdee * (1 + preset.adjust));
}
/**
* Meta final já com limites de segurança: em déficit, não desce abaixo do piso
* seguro; em superávit, limita o ganho a +20% do gasto.
*/
function calcSafeGoalCalories(input) {
	const raw = input.goalId === "custom" ? Math.round(input.manual ?? input.tdee) : calcGoalCalories(input.tdee, input.goalId);
	const floor = safeFloor(input.bmr, input.sex);
	const ceiling = Math.round(input.tdee * 1.25);
	if (raw < floor) return {
		target: floor,
		capped: true
	};
	if (raw > ceiling) return {
		target: ceiling,
		capped: true
	};
	return {
		target: raw,
		capped: false
	};
}
/** Estimativa de variação de peso por semana com base no déficit/superávit. */
function weeklyWeightChangeKg(target, tdee) {
	return Math.round((target - tdee) * 7 / 7700 * 100) / 100;
}
function calcBmi(weightKg, heightCm) {
	const h = heightCm / 100;
	if (!h) return 0;
	return Math.round(weightKg / (h * h) * 10) / 10;
}
function bmiLabel(bmi) {
	if (bmi < 18.5) return "Abaixo do peso";
	if (bmi < 25) return "Peso normal";
	if (bmi < 30) return "Sobrepeso";
	if (bmi < 35) return "Obesidade grau I";
	if (bmi < 40) return "Obesidade grau II";
	return "Obesidade grau III";
}
var MEALS = [
	{
		id: "breakfast",
		label: "Café da manhã"
	},
	{
		id: "lunch",
		label: "Almoço"
	},
	{
		id: "snack",
		label: "Lanche"
	},
	{
		id: "dinner",
		label: "Jantar"
	},
	{
		id: "other",
		label: "Outros"
	}
];
function mealLabel(id) {
	return MEALS.find((m) => m.id === id)?.label ?? "Outros";
}
/** Data local (São Paulo) no formato YYYY-MM-DD. */
function todayISO() {
	return (/* @__PURE__ */ new Date()).toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
}
function formatDayLabel(iso) {
	const [y, m, d] = iso.split("-").map(Number);
	return new Date(y, (m ?? 1) - 1, d ?? 1).toLocaleDateString("pt-BR", {
		weekday: "short",
		day: "2-digit",
		month: "2-digit"
	});
}
function addDays(iso, days) {
	const [y, m, d] = iso.split("-").map(Number);
	const date = new Date(y, (m ?? 1) - 1, d ?? 1);
	date.setDate(date.getDate() + days);
	return date.toLocaleDateString("en-CA");
}
var LIQUID_CATEGORIES = [
	"bebidas alcoolicas",
	"bebidas nao alcoolicas",
	"leites e achocolatados",
	"sopas e caldos"
];
function strip(value) {
	return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
/** Bebidas e liquidos sao medidos em ml; solidos em g. */
function unitFor(input) {
	const cat = strip(input.category ?? "");
	if (LIQUID_CATEGORIES.includes(cat)) return "ml";
	const name = strip(input.name ?? "");
	if (/\b(suco|refresco|refrigerante|agua|cha|cafe|leite|smoothie|vitamina|bebida|caldo|iogurte liquido)\b/.test(name)) return "ml";
	return "g";
}
var BASE_FOODS = [
	{
		id: "atum-com-cebola-0",
		name: "Atum com cebola",
		category: "Pizzas",
		kcalPer100g: 170.8,
		measure: "1fatia",
		measureGrams: 120
	},
	{
		id: "calabresa-com-cebola-1",
		name: "Calabresa com cebola",
		category: "Pizzas",
		kcalPer100g: 265.8,
		measure: "1 fatia",
		measureGrams: 120
	},
	{
		id: "calif-rnia-mussarela-presunto-abacaxi-p-ssego-fi-2",
		name: "Califórnia (mussarela, presunto, abacaxi, pêssego, figo e ameixa em calda)",
		category: "Pizzas",
		kcalPer100g: 256.7,
		measure: "1 fatia",
		measureGrams: 120
	},
	{
		id: "champignon-com-mussarela-3",
		name: "Champignon com mussarela",
		category: "Pizzas",
		kcalPer100g: 210.8,
		measure: "1 fatia",
		measureGrams: 120
	},
	{
		id: "escarola-palmito-e-mussarela-4",
		name: "Escarola, palmito e mussarela",
		category: "Pizzas",
		kcalPer100g: 201.7,
		measure: "1 fatia",
		measureGrams: 120
	},
	{
		id: "frango-com-catupiry-5",
		name: "Frango com catupiry",
		category: "Pizzas",
		kcalPer100g: 295,
		measure: "1 fatia",
		measureGrams: 120
	},
	{
		id: "lombo-canadense-cebola-e-azeitonas-6",
		name: "Lombo canadense, cebola e azeitonas",
		category: "Pizzas",
		kcalPer100g: 258.3,
		measure: "1 fatia",
		measureGrams: 120
	},
	{
		id: "marguerita-7",
		name: "Marguerita",
		category: "Pizzas",
		kcalPer100g: 285,
		measure: "1 fatia",
		measureGrams: 120
	},
	{
		id: "mussarela-8",
		name: "Mussarela",
		category: "Pizzas",
		kcalPer100g: 300,
		measure: "1 fatia",
		measureGrams: 120
	},
	{
		id: "mussarela-com-bacon-9",
		name: "Mussarela com bacon",
		category: "Pizzas",
		kcalPer100g: 385.8,
		measure: "1 fatia",
		measureGrams: 120
	},
	{
		id: "mussarela-de-b-fala-tomate-seco-e-r-cula-10",
		name: "Mussarela de búfala, tomate seco e rúcula",
		category: "Pizzas",
		kcalPer100g: 233.3,
		measure: "1 fatia",
		measureGrams: 120
	},
	{
		id: "palmito-com-mussarela-11",
		name: "Palmito com mussarela",
		category: "Pizzas",
		kcalPer100g: 228.3,
		measure: "1 fatia",
		measureGrams: 120
	},
	{
		id: "peito-de-peru-com-catupiry-12",
		name: "Peito de peru com catupiry",
		category: "Pizzas",
		kcalPer100g: 225.8,
		measure: "1 fatia",
		measureGrams: 120
	},
	{
		id: "portuguesa-molho-de-tomate-presunto-mussarela-ov-13",
		name: "Portuguesa (molho de tomate, presunto, mussarela, ovo, azeitonas e cebola)",
		category: "Pizzas",
		kcalPer100g: 263.3,
		measure: "1 fatia",
		measureGrams: 120
	},
	{
		id: "quatro-queijos-mussarela-catupiry-provolone-e-go-14",
		name: "Quatro queijos (mussarela, catupiry, provolone e gorgonzola)",
		category: "Pizzas",
		kcalPer100g: 318.3,
		measure: "1 fatia",
		measureGrams: 120
	},
	{
		id: "salm-o-defumado-mussarela-e-tomate-15",
		name: "Salmão defumado, mussarela e tomate",
		category: "Pizzas",
		kcalPer100g: 265,
		measure: "1 fatia",
		measureGrams: 120
	},
	{
		id: "canelone-de-ricota-com-molho-branco-16",
		name: "Canelone de ricota com molho branco",
		category: "Massas",
		kcalPer100g: 423.3,
		measure: "1 unidade",
		measureGrams: 30
	},
	{
		id: "capelete-de-carne-com-molho-de-tomate-17",
		name: "Capelete de carne com molho de tomate",
		category: "Massas",
		kcalPer100g: 313.3,
		measure: "1 col. de servir",
		measureGrams: 45
	},
	{
		id: "capelete-de-frango-com-molho-ros-18",
		name: "Capelete de frango com molho rosê",
		category: "Massas",
		kcalPer100g: 391.1,
		measure: "1 col. de servir",
		measureGrams: 45
	},
	{
		id: "lasanha-bolonhesa-com-molho-branco-sadia-19",
		name: "Lasanha à bolonhesa com molho branco “Sadia”",
		category: "Massas",
		kcalPer100g: 105.5,
		measure: "1 pedaço grande",
		measureGrams: 325
	},
	{
		id: "lasanha-de-queijo-e-presunto-20",
		name: "Lasanha de queijo e presunto",
		category: "Massas",
		kcalPer100g: 170.7,
		measure: "1 pedaço médio",
		measureGrams: 150
	},
	{
		id: "lasanha-quatro-queijos-21",
		name: "Lasanha quatro queijos",
		category: "Massas",
		kcalPer100g: 171.3,
		measure: "1 pedaço médio",
		measureGrams: 150
	},
	{
		id: "macarr-o-putanesca-molho-de-tomate-azeitona-pret-22",
		name: "Macarrão à putanesca (molho de tomate, azeitona preta e aliche ou alcaparras)",
		category: "Massas",
		kcalPer100g: 145,
		measure: "1 prato fundo",
		measureGrams: 200
	},
	{
		id: "macarr-o-alho-e-leo-23",
		name: "Macarrão alho e óleo",
		category: "Massas",
		kcalPer100g: 219,
		measure: "1 prato fundo",
		measureGrams: 200
	},
	{
		id: "macarr-o-ao-sugo-24",
		name: "Macarrão ao sugo",
		category: "Massas",
		kcalPer100g: 137,
		measure: "1 prato fundo",
		measureGrams: 200
	},
	{
		id: "macarr-o-com-molho-bolonhesa-25",
		name: "Macarrão com molho bolonhesa",
		category: "Massas",
		kcalPer100g: 151,
		measure: "1 prato fundo",
		measureGrams: 200
	},
	{
		id: "macarr-o-com-molho-branco-ervilha-e-presunto-26",
		name: "Macarrão com molho branco, ervilha e presunto",
		category: "Massas",
		kcalPer100g: 219,
		measure: "1 prato fundo",
		measureGrams: 200
	},
	{
		id: "macarr-o-instant-neo-sabor-carne-maggi-27",
		name: "Macarrão instantâneo sabor carne “Maggi”",
		category: "Massas",
		kcalPer100g: 442.4,
		measure: "1 pacote",
		measureGrams: 85
	},
	{
		id: "macarr-o-instant-neo-sabor-galinha-caipira-light-28",
		name: "Macarrão instantâneo sabor galinha caipira light “Nissin”",
		category: "Massas",
		kcalPer100g: 296.6,
		measure: "1 pacote",
		measureGrams: 88
	},
	{
		id: "macarr-o-instant-neo-sabor-quatro-queijo-nissin-29",
		name: "Macarrão instantâneo sabor quatro queijo “Nissin”",
		category: "Massas",
		kcalPer100g: 453.4,
		measure: "1 pacote",
		measureGrams: 88
	},
	{
		id: "nhoque-bolonhesa-30",
		name: "Nhoque à bolonhesa",
		category: "Massas",
		kcalPer100g: 307.7,
		measure: "1 col. de servir",
		measureGrams: 65
	},
	{
		id: "panqueca-de-carne-31",
		name: "Panqueca de carne",
		category: "Massas",
		kcalPer100g: 286.2,
		measure: "1 unidade média",
		measureGrams: 80
	},
	{
		id: "pasta-com-champignon-e-ervas-maggi-32",
		name: "Pasta com champignon e ervas “Maggi”",
		category: "Massas",
		kcalPer100g: 353.3,
		measure: "1 prato raso",
		measureGrams: 90
	},
	{
		id: "pasta-com-molho-de-tomate-e-bacon-maggi-33",
		name: "Pasta com molho de tomate e bacon “Maggi”",
		category: "Massas",
		kcalPer100g: 376.7,
		measure: "1 prato raso",
		measureGrams: 90
	},
	{
		id: "penne-ao-funghi-pastarotti-34",
		name: "Penne ao funghi “Pastarotti”",
		category: "Massas",
		kcalPer100g: 347.7,
		measure: "1 prato raso",
		measureGrams: 88
	},
	{
		id: "quiche-de-alho-por-melhor-bocado-35",
		name: "Quiche de alho poró “Melhor Bocado”",
		category: "Massas",
		kcalPer100g: 274.2,
		measure: "1 unidade",
		measureGrams: 120
	},
	{
		id: "quiche-de-frango-melhor-bocado-36",
		name: "Quiche de frango “Melhor Bocado”",
		category: "Massas",
		kcalPer100g: 280,
		measure: "1 unidade",
		measureGrams: 120
	},
	{
		id: "quiche-de-queijo-sadia-37",
		name: "Quiche de queijo “Sadia”",
		category: "Massas",
		kcalPer100g: 315.9,
		measure: "1 fatia",
		measureGrams: 113
	},
	{
		id: "quiche-de-queijo-e-bacon-melhor-bocado-38",
		name: "Quiche de queijo e bacon “Melhor Bocado”",
		category: "Massas",
		kcalPer100g: 297.5,
		measure: "1 unidade",
		measureGrams: 120
	},
	{
		id: "raviole-de-carne-com-molho-de-tomate-39",
		name: "Raviole de carne com molho de tomate",
		category: "Massas",
		kcalPer100g: 346.7,
		measure: "1 col. de servir",
		measureGrams: 45
	},
	{
		id: "raviole-de-queijo-com-molho-branco-40",
		name: "Raviole de queijo com molho branco",
		category: "Massas",
		kcalPer100g: 386.7,
		measure: "1 col. de servir",
		measureGrams: 45
	},
	{
		id: "torta-de-frango-com-catupiry-sadia-41",
		name: "Torta de frango com catupiry “Sadia”",
		category: "Massas",
		kcalPer100g: 319.2,
		measure: "1 fatia",
		measureGrams: 125
	},
	{
		id: "torta-de-palmito-sadia-42",
		name: "Torta de palmito “Sadia”",
		category: "Massas",
		kcalPer100g: 313.6,
		measure: "1 fatia",
		measureGrams: 125
	},
	{
		id: "torta-de-palmito-com-catupiry-com-massa-de-iogur-43",
		name: "Torta de palmito com catupiry com massa de iogurte “Sadia”",
		category: "Massas",
		kcalPer100g: 253.6,
		measure: "1 fatia",
		measureGrams: 125
	},
	{
		id: "torta-de-peito-de-peru-sadia-44",
		name: "Torta de peito de peru “Sadia”",
		category: "Massas",
		kcalPer100g: 331.2,
		measure: "1 fatia",
		measureGrams: 125
	},
	{
		id: "torta-de-presunto-e-queijo-melhor-bocado-45",
		name: "Torta de presunto e queijo “Melhor Bocado”",
		category: "Massas",
		kcalPer100g: 265.8,
		measure: "1 unidade",
		measureGrams: 120
	},
	{
		id: "biscoito-club-social-46",
		name: "Biscoito “Club social”",
		category: "Bolachas e Biscoitos",
		kcalPer100g: 465.4,
		measure: "1 pacote",
		measureGrams: 26
	},
	{
		id: "biscoito-gua-e-gergelim-piraqu-47",
		name: "Biscoito água e gergelim “Piraquê”",
		category: "Bolachas e Biscoitos",
		kcalPer100g: 450,
		measure: "4 unidades",
		measureGrams: 30
	},
	{
		id: "biscoito-aveia-e-mel-nestl-48",
		name: "Biscoito aveia e mel “Nestlé”",
		category: "Bolachas e Biscoitos",
		kcalPer100g: 446.7,
		measure: "5 unidades",
		measureGrams: 30
	},
	{
		id: "biscoito-de-gua-light-piraqu-49",
		name: "Biscoito de água light “Piraquê”",
		category: "Bolachas e Biscoitos",
		kcalPer100g: 425,
		measure: "16 unidades",
		measureGrams: 40
	},
	{
		id: "biscoito-de-leite-passatempo-nestl-50",
		name: "Biscoito de leite passatempo “Nestlé”",
		category: "Bolachas e Biscoitos",
		kcalPer100g: 446.7,
		measure: "5 unidades",
		measureGrams: 30
	},
	{
		id: "biscoito-de-polvilho-doce-cassini-51",
		name: "Biscoito de polvilho doce “Cassini”",
		category: "Bolachas e Biscoitos",
		kcalPer100g: 470,
		measure: "25 unidades",
		measureGrams: 30
	},
	{
		id: "biscoito-de-polvilho-salgado-cassini-52",
		name: "Biscoito de polvilho salgado “Cassini”",
		category: "Bolachas e Biscoitos",
		kcalPer100g: 460,
		measure: "25 unidades",
		measureGrams: 30
	},
	{
		id: "biscoito-de-presunto-piraqu-53",
		name: "Biscoito de presunto “Piraquê”",
		category: "Bolachas e Biscoitos",
		kcalPer100g: 503.3,
		measure: "65 unidades",
		measureGrams: 30
	},
	{
		id: "biscoito-de-queijo-piraqu-54",
		name: "Biscoito de queijo “Piraquê”",
		category: "Bolachas e Biscoitos",
		kcalPer100g: 350,
		measure: "65 unidades",
		measureGrams: 30
	},
	{
		id: "biscoito-integral-club-social-55",
		name: "Biscoito integral “Club social”",
		category: "Bolachas e Biscoitos",
		kcalPer100g: 453.8,
		measure: "1 pacote",
		measureGrams: 26
	},
	{
		id: "biscoito-magic-toast-marilan-56",
		name: "Biscoito magic toast “Marilan”",
		category: "Bolachas e Biscoitos",
		kcalPer100g: 376,
		measure: "7 unidades",
		measureGrams: 25
	},
	{
		id: "biscoito-magic-toast-integral-marilan-57",
		name: "Biscoito magic toast integral “Marilan”",
		category: "Bolachas e Biscoitos",
		kcalPer100g: 367.9,
		measure: "7 unidades",
		measureGrams: 28
	},
	{
		id: "biscoito-recheado-de-chocolate-diet-doce-vita-58",
		name: "Biscoito recheado de chocolate diet “Doce Vita”",
		category: "Bolachas e Biscoitos",
		kcalPer100g: 400,
		measure: "3 unidades",
		measureGrams: 30
	},
	{
		id: "biscoito-recheado-galak-nestl-59",
		name: "Biscoito recheado galak “Nestlé”",
		category: "Bolachas e Biscoitos",
		kcalPer100g: 486.7,
		measure: "2 e 1/2 unidades",
		measureGrams: 30
	},
	{
		id: "biscoito-recheado-passatempo-nestl-60",
		name: "Biscoito recheado passatempo “Nestlé”",
		category: "Bolachas e Biscoitos",
		kcalPer100g: 483.3,
		measure: "2 e 1/2 unidades",
		measureGrams: 30
	},
	{
		id: "biscoito-recheado-sabor-tomate-club-social-61",
		name: "Biscoito recheado sabor tomate “Club Social”",
		category: "Bolachas e Biscoitos",
		kcalPer100g: 496.4,
		measure: "1 pacote",
		measureGrams: 28
	},
	{
		id: "biscoito-roladinho-de-goiaba-piraqu-62",
		name: "Biscoito roladinho de goiaba “Piraquê”",
		category: "Bolachas e Biscoitos",
		kcalPer100g: 453.3,
		measure: "3 unidades",
		measureGrams: 30
	},
	{
		id: "biscoito-tortine-de-coco-triunfo-63",
		name: "Biscoito tortine de coco “Triunfo”",
		category: "Bolachas e Biscoitos",
		kcalPer100g: 500,
		measure: "5 unidades",
		measureGrams: 30
	},
	{
		id: "biscoito-tortinhas-de-chocolate-com-avel-adria-64",
		name: "Biscoito tortinhas de chocolate com avelã “Adria”",
		category: "Bolachas e Biscoitos",
		kcalPer100g: 493.3,
		measure: "4 unidades",
		measureGrams: 30
	},
	{
		id: "biscoito-tortinhas-de-lim-o-adria-65",
		name: "Biscoito tortinhas de limão “Adria”",
		category: "Bolachas e Biscoitos",
		kcalPer100g: 486.7,
		measure: "4 unidades",
		measureGrams: 30
	},
	{
		id: "biscoito-wafer-de-chocolate-bauducco-66",
		name: "Biscoito wafer de chocolate “Bauducco”",
		category: "Bolachas e Biscoitos",
		kcalPer100g: 520,
		measure: "3 e 1/2 unidades",
		measureGrams: 30
	},
	{
		id: "biscoito-wafer-de-chocolate-light-bauducco-67",
		name: "Biscoito wafer de chocolate light “Bauducco”",
		category: "Bolachas e Biscoitos",
		kcalPer100g: 566.7,
		measure: "3 e 1/2 unidades",
		measureGrams: 30
	},
	{
		id: "biscoito-wafer-de-morango-nestl-68",
		name: "Biscoito wafer de morango “Nestlé”",
		category: "Bolachas e Biscoitos",
		kcalPer100g: 536.7,
		measure: "4 e 1/2 unidades",
		measureGrams: 30
	},
	{
		id: "bolacha-gua-e-sal-tostines-69",
		name: "Bolacha água e sal “Tostines”",
		category: "Bolachas e Biscoitos",
		kcalPer100g: 433.3,
		measure: "6 unidades",
		measureGrams: 30
	},
	{
		id: "bolacha-champanhe-bauducco-70",
		name: "Bolacha Champanhe “Bauducco”",
		category: "Bolachas e Biscoitos",
		kcalPer100g: 396.7,
		measure: "3 e 1/2 unidades",
		measureGrams: 30
	},
	{
		id: "bolacha-cream-craker-bauducco-71",
		name: "Bolacha cream craker “Bauducco”",
		category: "Bolachas e Biscoitos",
		kcalPer100g: 433.3,
		measure: "6 e 1/2 unidades",
		measureGrams: 30
	},
	{
		id: "bolacha-cream-craker-integral-bauducco-72",
		name: "Bolacha cream craker integral “Bauducco”",
		category: "Bolachas e Biscoitos",
		kcalPer100g: 433.3,
		measure: "6 e 1/2 unidades",
		measureGrams: 30
	},
	{
		id: "bolacha-cream-craker-light-bauducco-73",
		name: "Bolacha cream craker light “Bauducco”",
		category: "Bolachas e Biscoitos",
		kcalPer100g: 353.3,
		measure: "6 e 1/2 unidades",
		measureGrams: 30
	},
	{
		id: "bolacha-de-banana-e-canela-bauducco-74",
		name: "Bolacha de banana e canela “Bauducco”",
		category: "Bolachas e Biscoitos",
		kcalPer100g: 496.7,
		measure: "6 unidades",
		measureGrams: 30
	},
	{
		id: "bolacha-de-coco-bauducco-75",
		name: "Bolacha de coco “Bauducco”",
		category: "Bolachas e Biscoitos",
		kcalPer100g: 496.7,
		measure: "6 unidades",
		measureGrams: 30
	},
	{
		id: "bolacha-de-leite-bauducco-76",
		name: "Bolacha de leite “Bauducco”",
		category: "Bolachas e Biscoitos",
		kcalPer100g: 486.7,
		measure: "6 unidades",
		measureGrams: 30
	},
	{
		id: "bolacha-maisena-adria-77",
		name: "Bolacha maisena “Adria”",
		category: "Bolachas e Biscoitos",
		kcalPer100g: 446.7,
		measure: "6 unidades",
		measureGrams: 30
	},
	{
		id: "bolacha-maria-piraqu-78",
		name: "Bolacha maria”Piraquê”",
		category: "Bolachas e Biscoitos",
		kcalPer100g: 425,
		measure: "8 unidades",
		measureGrams: 40
	},
	{
		id: "bolacha-recheada-de-chocolate-bono-79",
		name: "Bolacha recheada de chocolate “Bono”",
		category: "Bolachas e Biscoitos",
		kcalPer100g: 473.3,
		measure: "3 unidades",
		measureGrams: 30
	},
	{
		id: "bolacha-recheada-de-doce-de-leite-bono-80",
		name: "Bolacha recheada de doce de leite “Bono”",
		category: "Bolachas e Biscoitos",
		kcalPer100g: 490,
		measure: "3 unidades",
		measureGrams: 30
	},
	{
		id: "bolacha-recheada-de-morango-adria-81",
		name: "Bolacha recheada de morango “Adria”",
		category: "Bolachas e Biscoitos",
		kcalPer100g: 493.3,
		measure: "3 unidades",
		measureGrams: 30
	},
	{
		id: "bolacha-recheada-negresco-nestl-82",
		name: "Bolacha recheada negresco “Nestlé”",
		category: "Bolachas e Biscoitos",
		kcalPer100g: 470,
		measure: "3 unidades",
		measureGrams: 30
	},
	{
		id: "cookie-com-gotas-de-chocolate-nabisco-83",
		name: "Cookie com gotas de chocolate “Nabisco”",
		category: "Bolachas e Biscoitos",
		kcalPer100g: 493.3,
		measure: "2 unidades",
		measureGrams: 30
	},
	{
		id: "cookie-integral-de-frutas-c-tricas-jasmine-84",
		name: "Cookie integral de frutas cítricas “Jasmine”",
		category: "Bolachas e Biscoitos",
		kcalPer100g: 423.3,
		measure: "5 unidades",
		measureGrams: 30
	},
	{
		id: "cookie-integral-diet-de-cappuccino-e-avel-jasmin-85",
		name: "Cookie integral diet de cappuccino e avelã “Jasmine”",
		category: "Bolachas e Biscoitos",
		kcalPer100g: 396.7,
		measure: "8 unidades",
		measureGrams: 30
	},
	{
		id: "flocos-de-arroz-caramelizado-okoshi-86",
		name: "Flocos de arroz caramelizado “Okoshi”",
		category: "Bolachas e Biscoitos",
		kcalPer100g: 356.7,
		measure: "2 unidades",
		measureGrams: 30
	},
	{
		id: "mini-biscoito-de-pizza-club-social-87",
		name: "Mini biscoito de pizza “Club Social”",
		category: "Bolachas e Biscoitos",
		kcalPer100g: 448,
		measure: "50 unidades",
		measureGrams: 50
	},
	{
		id: "rosquinha-de-leite-mabel-88",
		name: "Rosquinha de leite “Mabel”",
		category: "Bolachas e Biscoitos",
		kcalPer100g: 430,
		measure: "6 unidades",
		measureGrams: 30
	},
	{
		id: "all-bran-kellogg-s-89",
		name: "All-bran “Kellogg’s”",
		category: "Cereais e Farináceos",
		kcalPer100g: 260,
		measure: "3/4 xic. chá",
		measureGrams: 40
	},
	{
		id: "amido-de-milho-maizena-90",
		name: "Amido de milho “Maizena”",
		category: "Cereais e Farináceos",
		kcalPer100g: 345.5,
		measure: "2 col. sopa",
		measureGrams: 22
	},
	{
		id: "arroz-grega-91",
		name: "Arroz à grega",
		category: "Cereais e Farináceos",
		kcalPer100g: 138.5,
		measure: "1 col. sopa",
		measureGrams: 13
	},
	{
		id: "arroz-branco-cozido-92",
		name: "Arroz branco cozido",
		category: "Cereais e Farináceos",
		kcalPer100g: 116.1,
		measure: "1 col. sopa",
		measureGrams: 31
	},
	{
		id: "arroz-integral-cozido-93",
		name: "Arroz integral cozido",
		category: "Cereais e Farináceos",
		kcalPer100g: 109.7,
		measure: "1 col. sopa",
		measureGrams: 31
	},
	{
		id: "aveia-farinha-quaker-94",
		name: "Aveia (farinha) “Quaker”",
		category: "Cereais e Farináceos",
		kcalPer100g: 360,
		measure: "1/2 xic. chá",
		measureGrams: 50
	},
	{
		id: "aveia-em-flocos-quaker-95",
		name: "Aveia em flocos “Quaker”",
		category: "Cereais e Farináceos",
		kcalPer100g: 466.7,
		measure: "2 col. sopa",
		measureGrams: 30
	},
	{
		id: "cereal-matinal-fibre-1-nestl-96",
		name: "Cereal Matinal Fibre 1 “Nestlé”",
		category: "Cereais e Farináceos",
		kcalPer100g: 215,
		measure: "3/4 xic. chá",
		measureGrams: 40
	},
	{
		id: "cereal-nescau-nestl-97",
		name: "Cereal nescau “Nestlé”",
		category: "Cereais e Farináceos",
		kcalPer100g: 386.7,
		measure: "3/4 xic. chá",
		measureGrams: 30
	},
	{
		id: "corn-flakes-kellogg-s-98",
		name: "Corn Flakes “Kellogg’s”",
		category: "Cereais e Farináceos",
		kcalPer100g: 366.7,
		measure: "1 xic. chá",
		measureGrams: 30
	},
	{
		id: "creme-de-arroz-yoki-99",
		name: "Creme de arroz “Yoki”",
		category: "Cereais e Farináceos",
		kcalPer100g: 336.4,
		measure: "2 e 1/2 col. sopa",
		measureGrams: 22
	},
	{
		id: "farinha-de-mandioca-torrada-yoki-100",
		name: "Farinha de mandioca torrada “Yoki”",
		category: "Cereais e Farináceos",
		kcalPer100g: 337.5,
		measure: "1/4 xic. chá",
		measureGrams: 40
	},
	{
		id: "farinha-de-milho-yoki-101",
		name: "Farinha de milho “Yoki”",
		category: "Cereais e Farináceos",
		kcalPer100g: 365,
		measure: "1/2 xic. chá",
		measureGrams: 40
	},
	{
		id: "farinha-de-rosca-yoki-102",
		name: "Farinha de rosca “Yoki”",
		category: "Cereais e Farináceos",
		kcalPer100g: 373.3,
		measure: "3 col. sopa",
		measureGrams: 30
	},
	{
		id: "farinha-de-trigo-dona-benta-103",
		name: "Farinha de trigo “Dona Benta”",
		category: "Cereais e Farináceos",
		kcalPer100g: 360,
		measure: "1/2 xic. chá",
		measureGrams: 50
	},
	{
		id: "farinha-l-ctea-nestl-104",
		name: "Farinha láctea “Nestlé”",
		category: "Cereais e Farináceos",
		kcalPer100g: 396.7,
		measure: "4 col. sopa",
		measureGrams: 30
	},
	{
		id: "farofa-de-linha-a-com-passas-e-damasco-seco-105",
		name: "Farofa de linhaça com passas e damasco seco",
		category: "Cereais e Farináceos",
		kcalPer100g: 420,
		measure: "1 col. sopa",
		measureGrams: 25
	},
	{
		id: "farofa-de-mandioca-pronta-yoki-106",
		name: "Farofa de mandioca pronta “Yoki”",
		category: "Cereais e Farináceos",
		kcalPer100g: 411.4,
		measure: "1 col. sopa",
		measureGrams: 35
	},
	{
		id: "farofa-de-mandioca-com-bacon-107",
		name: "Farofa de mandioca com bacon",
		category: "Cereais e Farináceos",
		kcalPer100g: 460,
		measure: "1 col. sopa",
		measureGrams: 35
	},
	{
		id: "farofa-de-soja-pronta-yoki-108",
		name: "Farofa de soja pronta “Yoki”",
		category: "Cereais e Farináceos",
		kcalPer100g: 425.7,
		measure: "1 col. sopa",
		measureGrams: 35
	},
	{
		id: "f-cula-de-batata-yoki-109",
		name: "Fécula de batata “Yoki”",
		category: "Cereais e Farináceos",
		kcalPer100g: 350,
		measure: "2 col. sopa",
		measureGrams: 20
	},
	{
		id: "fub-de-milho-yoki-110",
		name: "Fubá de milho “Yoki”",
		category: "Cereais e Farináceos",
		kcalPer100g: 340,
		measure: "1/2 xic. chá",
		measureGrams: 40
	},
	{
		id: "g-rmen-de-trigo-m-e-terra-111",
		name: "Gérmen de trigo “Mãe Terra”",
		category: "Cereais e Farináceos",
		kcalPer100g: 300,
		measure: "1 col. sopa",
		measureGrams: 10
	},
	{
		id: "granola-kellogg-s-112",
		name: "Granola “Kellogg’s”",
		category: "Cereais e Farináceos",
		kcalPer100g: 345,
		measure: "1/2 xic. chá",
		measureGrams: 40
	},
	{
		id: "linha-a-m-e-terra-113",
		name: "Linhaça “Mãe Terra”",
		category: "Cereais e Farináceos",
		kcalPer100g: 450,
		measure: "1 col. sopa",
		measureGrams: 10
	},
	{
		id: "milho-espiga-114",
		name: "Milho (espiga)",
		category: "Cereais e Farináceos",
		kcalPer100g: 132,
		measure: "1 unidade",
		measureGrams: 100
	},
	{
		id: "milho-em-conserva-etti-115",
		name: "Milho em conserva “Etti”",
		category: "Cereais e Farináceos",
		kcalPer100g: 79.2,
		measure: "1 xic. chá",
		measureGrams: 130
	},
	{
		id: "mucilon-de-arroz-nestl-116",
		name: "Mucilon de arroz “Nestlé”",
		category: "Cereais e Farináceos",
		kcalPer100g: 376.2,
		measure: "3 col. sopa",
		measureGrams: 21
	},
	{
		id: "mucilon-de-milho-nestl-117",
		name: "Mucilon de milho “Nestlé”",
		category: "Cereais e Farináceos",
		kcalPer100g: 376.2,
		measure: "3 col. sopa",
		measureGrams: 21
	},
	{
		id: "musli-casino-118",
		name: "Musli “Casino”",
		category: "Cereais e Farináceos",
		kcalPer100g: 420,
		measure: "1/2 xic. chá",
		measureGrams: 30
	},
	{
		id: "polentina-quaker-119",
		name: "Polentina “Quaker”",
		category: "Cereais e Farináceos",
		kcalPer100g: 326.7,
		measure: "1/2 xic. chá",
		measureGrams: 45
	},
	{
		id: "polvilho-azedo-yoki-120",
		name: "Polvilho azedo “Yoki”",
		category: "Cereais e Farináceos",
		kcalPer100g: 345,
		measure: "2 e 1/2 col. sopa",
		measureGrams: 20
	},
	{
		id: "polvilho-doce-yoki-121",
		name: "Polvilho doce “Yoki”",
		category: "Cereais e Farináceos",
		kcalPer100g: 355,
		measure: "2 e 1/2 col. sopa",
		measureGrams: 20
	},
	{
		id: "quinua-real-em-gr-o-m-e-terra-122",
		name: "Quinua real em grão “Mãe Terra”",
		category: "Cereais e Farináceos",
		kcalPer100g: 397.8,
		measure: "1/4 xic. chá",
		measureGrams: 45
	},
	{
		id: "sucrilhos-kellogg-s-123",
		name: "Sucrilhos “Kellogg’s”",
		category: "Cereais e Farináceos",
		kcalPer100g: 380,
		measure: "3/4 xic. chá",
		measureGrams: 30
	},
	{
		id: "tapioca-yoki-124",
		name: "Tapioca “Yoki”",
		category: "Cereais e Farináceos",
		kcalPer100g: 350,
		measure: "2 e 1/2 col. sopa",
		measureGrams: 30
	},
	{
		id: "trigo-para-kibe-yoki-125",
		name: "Trigo para kibe “Yoki”",
		category: "Cereais e Farináceos",
		kcalPer100g: 376,
		measure: "1/3 xic.",
		measureGrams: 50
	},
	{
		id: "bisnaguinha-seven-boys-126",
		name: "Bisnaguinha “Seven Boys”",
		category: "Pães e Torradas",
		kcalPer100g: 295,
		measure: "1 unidade",
		measureGrams: 20
	},
	{
		id: "ciabatta-127",
		name: "Ciabatta",
		category: "Pães e Torradas",
		kcalPer100g: 308.8,
		measure: "1 unidade grande",
		measureGrams: 80
	},
	{
		id: "croissant-de-queijo-128",
		name: "Croissant de queijo",
		category: "Pães e Torradas",
		kcalPer100g: 410,
		measure: "1 unidade grande",
		measureGrams: 80
	},
	{
		id: "croissant-simples-129",
		name: "Croissant simples",
		category: "Pães e Torradas",
		kcalPer100g: 411.9,
		measure: "1 unidade grande",
		measureGrams: 67
	},
	{
		id: "p-o-alem-o-wickbold-130",
		name: "Pão alemão “Wickbold”",
		category: "Pães e Torradas",
		kcalPer100g: 173.6,
		measure: "1 fatia",
		measureGrams: 72
	},
	{
		id: "p-o-com-canela-e-passas-nutrella-131",
		name: "Pão com canela e passas “Nutrella”",
		category: "Pães e Torradas",
		kcalPer100g: 284,
		measure: "1 fatia",
		measureGrams: 25
	},
	{
		id: "p-o-de-alho-na-brasa-132",
		name: "Pão de alho na brasa",
		category: "Pães e Torradas",
		kcalPer100g: 374,
		measure: "1 unidade",
		measureGrams: 50
	},
	{
		id: "p-o-de-batata-com-catupiry-133",
		name: "Pão de batata com catupiry",
		category: "Pães e Torradas",
		kcalPer100g: 271.4,
		measure: "1 unidade",
		measureGrams: 70
	},
	{
		id: "p-o-de-batata-simples-134",
		name: "Pão de batata simples",
		category: "Pães e Torradas",
		kcalPer100g: 274,
		measure: "1 unidade",
		measureGrams: 50
	},
	{
		id: "p-o-de-centeio-nutrella-135",
		name: "Pão de centeio “Nutrella”",
		category: "Pães e Torradas",
		kcalPer100g: 244,
		measure: "1 fatia",
		measureGrams: 25
	},
	{
		id: "p-o-de-coco-panco-136",
		name: "Pão de coco “Panco”",
		category: "Pães e Torradas",
		kcalPer100g: 318,
		measure: "1 fatia grande",
		measureGrams: 50
	},
	{
		id: "p-o-de-forma-pullman-137",
		name: "Pão de forma “Pullman”",
		category: "Pães e Torradas",
		kcalPer100g: 248,
		measure: "1 fatia",
		measureGrams: 25
	},
	{
		id: "p-o-de-forma-integral-linha-a-pullman-138",
		name: "Pão de forma integral linhaça “Pullman”",
		category: "Pães e Torradas",
		kcalPer100g: 244,
		measure: "1 fatia",
		measureGrams: 25
	},
	{
		id: "p-o-de-forma-light-nutrella-139",
		name: "Pão de forma light “Nutrella”",
		category: "Pães e Torradas",
		kcalPer100g: 211.8,
		measure: "1 fatia",
		measureGrams: 17
	},
	{
		id: "p-o-de-forma-sem-casca-wickbold-140",
		name: "Pão de forma sem casca “Wickbold”",
		category: "Pães e Torradas",
		kcalPer100g: 252.9,
		measure: "1 fatia",
		measureGrams: 17
	},
	{
		id: "p-o-de-hamb-rguer-141",
		name: "Pão de hambúrguer",
		category: "Pães e Torradas",
		kcalPer100g: 354,
		measure: "1 unidade",
		measureGrams: 50
	},
	{
		id: "p-o-de-hamb-rguer-com-gergelim-142",
		name: "Pão de hambúrguer com gergelim",
		category: "Pães e Torradas",
		kcalPer100g: 376,
		measure: "1 unidade",
		measureGrams: 50
	},
	{
		id: "p-o-de-hot-dog-143",
		name: "Pão de hot dog",
		category: "Pães e Torradas",
		kcalPer100g: 266,
		measure: "1 unidade",
		measureGrams: 50
	},
	{
		id: "p-o-de-milho-panco-144",
		name: "Pão de milho “Panco”",
		category: "Pães e Torradas",
		kcalPer100g: 300,
		measure: "1 fatia grande",
		measureGrams: 40
	},
	{
		id: "p-o-de-queijo-coquetel-forno-de-minas-145",
		name: "Pão de queijo coquetel “Forno de Minas”",
		category: "Pães e Torradas",
		kcalPer100g: 284,
		measure: "1 unidade",
		measureGrams: 25
	},
	{
		id: "p-o-de-queijo-coquetel-light-forno-de-minas-146",
		name: "Pão de queijo coquetel light “Forno de Minas”",
		category: "Pães e Torradas",
		kcalPer100g: 214.3,
		measure: "1 unidade",
		measureGrams: 14
	},
	{
		id: "p-o-de-queijo-recheado-com-requeij-o-forno-de-mi-147",
		name: "Pão de queijo recheado com requeijão “Forno de Minas”",
		category: "Pães e Torradas",
		kcalPer100g: 274.1,
		measure: "1 unidade",
		measureGrams: 27
	},
	{
		id: "p-o-de-soja-light-pullman-148",
		name: "Pão de soja light “Pullman”",
		category: "Pães e Torradas",
		kcalPer100g: 196,
		measure: "1 fatia",
		measureGrams: 25
	},
	{
		id: "p-o-franc-s-149",
		name: "Pão francês",
		category: "Pães e Torradas",
		kcalPer100g: 270,
		measure: "1 unidade",
		measureGrams: 50
	},
	{
		id: "p-o-franc-s-integral-150",
		name: "Pão francês integral",
		category: "Pães e Torradas",
		kcalPer100g: 270,
		measure: "1 unidade",
		measureGrams: 50
	},
	{
		id: "p-o-franc-s-sem-miolo-151",
		name: "Pão francês sem miolo",
		category: "Pães e Torradas",
		kcalPer100g: 250,
		measure: "1 unidade",
		measureGrams: 30
	},
	{
		id: "p-o-integral-sem-casca-light-wickbold-152",
		name: "Pão integral sem casca light “Wickbold”",
		category: "Pães e Torradas",
		kcalPer100g: 207.1,
		measure: "1 fatia",
		measureGrams: 14
	},
	{
		id: "p-o-italiano-153",
		name: "Pão italiano",
		category: "Pães e Torradas",
		kcalPer100g: 342.5,
		measure: "1 fatia",
		measureGrams: 40
	},
	{
		id: "p-o-preto-nutrella-154",
		name: "Pão preto “Nutrella”",
		category: "Pães e Torradas",
		kcalPer100g: 250,
		measure: "1 fatia",
		measureGrams: 28
	},
	{
		id: "p-o-s-rio-155",
		name: "Pão sírio",
		category: "Pães e Torradas",
		kcalPer100g: 360,
		measure: "1 unidade grande",
		measureGrams: 50
	},
	{
		id: "p-o-sovado-seven-boys-156",
		name: "Pão sovado “Seven Boys”",
		category: "Pães e Torradas",
		kcalPer100g: 312,
		measure: "1 fatia",
		measureGrams: 50
	},
	{
		id: "p-o-sueco-157",
		name: "Pão sueco",
		category: "Pães e Torradas",
		kcalPer100g: 333.3,
		measure: "1 porcao",
		measureGrams: 30
	},
	{
		id: "torrada-canap-bauducco-158",
		name: "Torrada canapé “Bauducco”",
		category: "Pães e Torradas",
		kcalPer100g: 396.7,
		measure: "9 unidades",
		measureGrams: 30
	},
	{
		id: "torrada-de-alecrim-com-azeite-in-citta-159",
		name: "Torrada de alecrim com azeite “In Citta”",
		category: "Pães e Torradas",
		kcalPer100g: 520,
		measure: "3 unidades",
		measureGrams: 15
	},
	{
		id: "torrada-de-alho-fl-rio-160",
		name: "Torrada de alho “Flório”",
		category: "Pães e Torradas",
		kcalPer100g: 406.7,
		measure: "6 unidades",
		measureGrams: 30
	},
	{
		id: "torrada-integral-bauducco-161",
		name: "Torrada integral “Bauducco”",
		category: "Pães e Torradas",
		kcalPer100g: 386.7,
		measure: "3 unidades",
		measureGrams: 30
	},
	{
		id: "torrada-salgada-bauducco-162",
		name: "Torrada salgada “Bauducco”",
		category: "Pães e Torradas",
		kcalPer100g: 396.7,
		measure: "3 unidades",
		measureGrams: 30
	},
	{
		id: "torrada-tradicional-pita-toast-163",
		name: "Torrada tradicional “Pita Toast”",
		category: "Pães e Torradas",
		kcalPer100g: 370,
		measure: "30 unidades",
		measureGrams: 30
	},
	{
		id: "brie-luna-164",
		name: "Brie Luna",
		category: "Queijos",
		kcalPer100g: 346.7,
		measure: "1 fatia",
		measureGrams: 30
	},
	{
		id: "brie-polenghi-165",
		name: "Brie “Polenghi”",
		category: "Queijos",
		kcalPer100g: 333.3,
		measure: "2 fatias",
		measureGrams: 30
	},
	{
		id: "camembert-luna-166",
		name: "Camembert Luna",
		category: "Queijos",
		kcalPer100g: 346,
		measure: "1 unidade",
		measureGrams: 50
	},
	{
		id: "camembert-president-167",
		name: "Camembert “President”",
		category: "Queijos",
		kcalPer100g: 280,
		measure: "1 fatia",
		measureGrams: 30
	},
	{
		id: "catupiry-168",
		name: "Catupiry",
		category: "Queijos",
		kcalPer100g: 226.7,
		measure: "1 col. sopa",
		measureGrams: 30
	},
	{
		id: "chancliche-com-zattar-169",
		name: "Chancliche com zattar",
		category: "Queijos",
		kcalPer100g: 235,
		measure: "1 col. sopa",
		measureGrams: 20
	},
	{
		id: "cheddar-170",
		name: "Cheddar",
		category: "Queijos",
		kcalPer100g: 400,
		measure: "1 fatia",
		measureGrams: 30
	},
	{
		id: "cottage-tirolez-171",
		name: "Cottage “Tirolez”",
		category: "Queijos",
		kcalPer100g: 94,
		measure: "2 col. sopa",
		measureGrams: 50
	},
	{
		id: "cream-cheese-dan-bio-172",
		name: "Cream Cheese “Danúbio”",
		category: "Queijos",
		kcalPer100g: 250,
		measure: "3 col. sopa",
		measureGrams: 30
	},
	{
		id: "cream-cheese-light-dan-bio-173",
		name: "Cream Cheese light “Danúbio”",
		category: "Queijos",
		kcalPer100g: 203.3,
		measure: "3 col. sopa",
		measureGrams: 30
	},
	{
		id: "cream-cheese-philadelphia-light-174",
		name: "Cream Cheese Philadelphia light",
		category: "Queijos",
		kcalPer100g: 70,
		measure: "1 col. sopa",
		measureGrams: 20
	},
	{
		id: "cream-cheese-philadelphia-175",
		name: "Cream Cheese Philadelphia",
		category: "Queijos",
		kcalPer100g: 100,
		measure: "1 col. sopa",
		measureGrams: 20
	},
	{
		id: "ementhal-su-o-176",
		name: "Ementhal suíço",
		category: "Queijos",
		kcalPer100g: 396.7,
		measure: "1 fatia",
		measureGrams: 30
	},
	{
		id: "ementhal-polenghi-177",
		name: "Ementhal “Polenghi”",
		category: "Queijos",
		kcalPer100g: 383.3,
		measure: "1 fatia",
		measureGrams: 30
	},
	{
		id: "estepe-178",
		name: "Estepe",
		category: "Queijos",
		kcalPer100g: 333.3,
		measure: "1 fatia",
		measureGrams: 30
	},
	{
		id: "fondue-luna-179",
		name: "Fondue Luna",
		category: "Queijos",
		kcalPer100g: 411.9,
		measure: "1 porção",
		measureGrams: 67
	},
	{
		id: "fondue-de-queijo-la-table-d-or-180",
		name: "Fondue de queijo “La Table D’or”",
		category: "Queijos",
		kcalPer100g: 253.3,
		measure: "2 col. sopa",
		measureGrams: 30
	},
	{
		id: "fundido-181",
		name: "Fundido",
		category: "Queijos",
		kcalPer100g: 354.3,
		measure: "1 fatia",
		measureGrams: 35
	},
	{
		id: "gorgonzola-182",
		name: "Gorgonzola",
		category: "Queijos",
		kcalPer100g: 478.9,
		measure: "1 fatia média",
		measureGrams: 38
	},
	{
		id: "gouda-luna-183",
		name: "Gouda Luna",
		category: "Queijos",
		kcalPer100g: 356.7,
		measure: "1 fatia",
		measureGrams: 30
	},
	{
		id: "gouda-polenghi-184",
		name: "Gouda “Polenghi”",
		category: "Queijos",
		kcalPer100g: 350,
		measure: "1 fatia",
		measureGrams: 30
	},
	{
		id: "gruy-re-luna-185",
		name: "Gruyère Luna",
		category: "Queijos",
		kcalPer100g: 356,
		measure: "1 porção",
		measureGrams: 25
	},
	{
		id: "gruy-re-polenghi-186",
		name: "Gruyère “Polenghi”",
		category: "Queijos",
		kcalPer100g: 383.3,
		measure: "1 fatia",
		measureGrams: 30
	},
	{
		id: "holanda-187",
		name: "Holanda",
		category: "Queijos",
		kcalPer100g: 343.3,
		measure: "1 fatia",
		measureGrams: 30
	},
	{
		id: "it-lico-luna-188",
		name: "Itálico Luna",
		category: "Queijos",
		kcalPer100g: 356.7,
		measure: "1 fatia",
		measureGrams: 30
	},
	{
		id: "liederkranz-189",
		name: "Liederkranz",
		category: "Queijos",
		kcalPer100g: 300,
		measure: "1 fatia",
		measureGrams: 30
	},
	{
		id: "limburgu-s-su-o-190",
		name: "Limburguês suíço",
		category: "Queijos",
		kcalPer100g: 323.3,
		measure: "1 fatia",
		measureGrams: 30
	},
	{
		id: "mussarela-191",
		name: "Mussarela",
		category: "Queijos",
		kcalPer100g: 325,
		measure: "1 fatia média",
		measureGrams: 20
	},
	{
		id: "mussarela-de-b-fala-192",
		name: "Mussarela de búfala",
		category: "Queijos",
		kcalPer100g: 316.7,
		measure: "1 unidade",
		measureGrams: 30
	},
	{
		id: "neufchatel-su-o-193",
		name: "Neufchatel suíço",
		category: "Queijos",
		kcalPer100g: 290,
		measure: "1 fatia",
		measureGrams: 30
	},
	{
		id: "palmira-194",
		name: "Palmira",
		category: "Queijos",
		kcalPer100g: 383.3,
		measure: "1 fatia",
		measureGrams: 30
	},
	{
		id: "parmes-o-195",
		name: "Parmesão",
		category: "Queijos",
		kcalPer100g: 430.8,
		measure: "1 fatia",
		measureGrams: 39
	},
	{
		id: "parmes-o-ralado-196",
		name: "Parmesão ralado",
		category: "Queijos",
		kcalPer100g: 470,
		measure: "1 col. sopa",
		measureGrams: 10
	},
	{
		id: "pecorino-197",
		name: "Pecorino",
		category: "Queijos",
		kcalPer100g: 365.7,
		measure: "1 fatia",
		measureGrams: 35
	},
	{
		id: "petit-suisse-198",
		name: "Petit Suisse",
		category: "Queijos",
		kcalPer100g: 180,
		measure: "1 unidade",
		measureGrams: 25
	},
	{
		id: "polenguinho-199",
		name: "Polenguinho",
		category: "Queijos",
		kcalPer100g: 310,
		measure: "1 unidade",
		measureGrams: 20
	},
	{
		id: "polenguinho-light-200",
		name: "Polenguinho light",
		category: "Queijos",
		kcalPer100g: 260,
		measure: "1 unidade",
		measureGrams: 20
	},
	{
		id: "prato-201",
		name: "Prato",
		category: "Queijos",
		kcalPer100g: 393.3,
		measure: "1 fatia média",
		measureGrams: 15
	},
	{
		id: "provolone-202",
		name: "Provolone",
		category: "Queijos",
		kcalPer100g: 340,
		measure: "1 fatia média",
		measureGrams: 15
	},
	{
		id: "quarticolo-203",
		name: "Quarticolo",
		category: "Queijos",
		kcalPer100g: 260,
		measure: "1 porção",
		measureGrams: 30
	},
	{
		id: "queijo-coalho-na-brasa-204",
		name: "Queijo coalho na brasa",
		category: "Queijos",
		kcalPer100g: 280,
		measure: "1 espeto",
		measureGrams: 60
	},
	{
		id: "queijo-de-cabra-chamonix-205",
		name: "Queijo de cabra “Chamonix”",
		category: "Queijos",
		kcalPer100g: 266.7,
		measure: "2 fatias",
		measureGrams: 30
	},
	{
		id: "queijo-de-minas-danubio-206",
		name: "Queijo-de-minas “Danubio”",
		category: "Queijos",
		kcalPer100g: 223.3,
		measure: "1 fatia média",
		measureGrams: 30
	},
	{
		id: "queijo-de-minas-padr-o-quat-207",
		name: "Queijo-de-minas padrão “Quatá”",
		category: "Queijos",
		kcalPer100g: 380,
		measure: "1 fatia",
		measureGrams: 30
	},
	{
		id: "queijo-do-norte-208",
		name: "Queijo-do-norte",
		category: "Queijos",
		kcalPer100g: 383.3,
		measure: "1 fatia",
		measureGrams: 30
	},
	{
		id: "queijo-do-reino-su-o-209",
		name: "Queijo-do-reino suíço",
		category: "Queijos",
		kcalPer100g: 383.3,
		measure: "1 fatia",
		measureGrams: 30
	},
	{
		id: "requeij-o-210",
		name: "Requeijão",
		category: "Queijos",
		kcalPer100g: 246.7,
		measure: "1 col. sopa",
		measureGrams: 30
	},
	{
		id: "requeij-o-light-211",
		name: "Requeijão light",
		category: "Queijos",
		kcalPer100g: 136.7,
		measure: "1 col. sopa",
		measureGrams: 30
	},
	{
		id: "roqueford-212",
		name: "Roqueford",
		category: "Queijos",
		kcalPer100g: 400,
		measure: "1 porção",
		measureGrams: 25
	},
	{
		id: "ricota-tirolez-213",
		name: "Ricota “Tirolez”",
		category: "Queijos",
		kcalPer100g: 173.3,
		measure: "1 fatia",
		measureGrams: 30
	},
	{
		id: "saint-paulin-luna-214",
		name: "Saint Paulin Luna",
		category: "Queijos",
		kcalPer100g: 336.7,
		measure: "1 fatia",
		measureGrams: 30
	},
	{
		id: "su-o-215",
		name: "Suíço",
		category: "Queijos",
		kcalPer100g: 406.7,
		measure: "1 fatia",
		measureGrams: 30
	},
	{
		id: "tilsit-luna-216",
		name: "Tilsit Luna",
		category: "Queijos",
		kcalPer100g: 377.1,
		measure: "1 fatia",
		measureGrams: 35
	},
	{
		id: "tofu-queijo-de-soja-217",
		name: "Tofu (queijo de soja)",
		category: "Queijos",
		kcalPer100g: 146.4,
		measure: "1 fatia média",
		measureGrams: 28
	},
	{
		id: "bebida-l-ctea-com-polpa-de-morango-dan-up-danone-218",
		name: "Bebida Láctea com Polpa de Morango Dan Up “Danone”",
		category: "Iogurtes",
		kcalPer100g: 87.2,
		measure: "1 pote",
		measureGrams: 180
	},
	{
		id: "chandelle-de-chocolate-ao-leite-nestl-219",
		name: "Chandelle de Chocolate ao Leite “Nestlé”",
		category: "Iogurtes",
		kcalPer100g: 138.2,
		measure: "1 pote",
		measureGrams: 110
	},
	{
		id: "chandelle-sensa-o-de-chocolate-com-calda-de-mora-220",
		name: "Chandelle Sensação de Chocolate com Calda de Morango “Nestlé”",
		category: "Iogurtes",
		kcalPer100g: 150.9,
		measure: "1 pote",
		measureGrams: 110
	},
	{
		id: "coalhada-parcialmente-desnatada-vigor-221",
		name: "Coalhada Parcialmente Desnatada “Vigor”",
		category: "Iogurtes",
		kcalPer100g: 62,
		measure: "1 pote",
		measureGrams: 200
	},
	{
		id: "coalhada-seca-natural-alibey-222",
		name: "Coalhada Seca Natural “Alibey”",
		category: "Iogurtes",
		kcalPer100g: 123.3,
		measure: "1 col. sopa",
		measureGrams: 30
	},
	{
		id: "flan-de-baunilha-com-calda-de-caramelo-mo-a-nest-223",
		name: "Flan de Baunilha com Calda de Caramelo Moça “Nestlé”",
		category: "Iogurtes",
		kcalPer100g: 116.4,
		measure: "1 pote",
		measureGrams: 110
	},
	{
		id: "frozen-yogurt-yogen-fr-z-224",
		name: "Frozen yogurt Yogen Früz",
		category: "Iogurtes",
		kcalPer100g: 88,
		measure: "1 porcao",
		measureGrams: 100
	},
	{
		id: "frozen-yogurt-yogolove-225",
		name: "Frozen yogurt Yogolove",
		category: "Iogurtes",
		kcalPer100g: 111,
		measure: "1 porcao",
		measureGrams: 100
	},
	{
		id: "frozen-yogurt-yoggi-226",
		name: "Frozen yogurt Yoggi",
		category: "Iogurtes",
		kcalPer100g: 88,
		measure: "1 porcao",
		measureGrams: 100
	},
	{
		id: "frozen-yogurt-yogoberry-227",
		name: "Frozen yogurt Yogoberry",
		category: "Iogurtes",
		kcalPer100g: 88,
		measure: "1 porcao",
		measureGrams: 100
	},
	{
		id: "frozen-yogurt-yoforia-228",
		name: "Frozen yogurt Yoforia",
		category: "Iogurtes",
		kcalPer100g: 90,
		measure: "1 porcao",
		measureGrams: 100
	},
	{
		id: "frozen-yogurt-tutti-frutti-229",
		name: "Frozen yogurt Tutti Frutti",
		category: "Iogurtes",
		kcalPer100g: 107,
		measure: "1 porcao",
		measureGrams: 100
	},
	{
		id: "frozen-yogurt-bendita-fruta-230",
		name: "Frozen yogurt Bendita Fruta",
		category: "Iogurtes",
		kcalPer100g: 85,
		measure: "1 porcao",
		measureGrams: 100
	},
	{
		id: "frozen-yogurt-yogofresh-231",
		name: "Frozen yogurt Yogofresh",
		category: "Iogurtes",
		kcalPer100g: 86,
		measure: "1 porcao",
		measureGrams: 100
	},
	{
		id: "iogurte-activia-morango-mix-com-corn-flakes-dano-232",
		name: "Iogurte Activia Morango Mix com Corn – Flakes “Danone”",
		category: "Iogurtes",
		kcalPer100g: 130.9,
		measure: "1 pote",
		measureGrams: 110
	},
	{
		id: "iogurte-com-aveia-e-fibras-activia-danone-233",
		name: "Iogurte com Aveia e Fibras Activia “Danone”",
		category: "Iogurtes",
		kcalPer100g: 100,
		measure: "1 pote",
		measureGrams: 100
	},
	{
		id: "iogurte-com-coco-ralado-batavo-234",
		name: "Iogurte com Coco Ralado “Batavo”",
		category: "Iogurtes",
		kcalPer100g: 108.5,
		measure: "1 pote",
		measureGrams: 200
	},
	{
		id: "iogurte-com-mel-sabor-baunilha-activia-danone-235",
		name: "Iogurte com Mel Sabor Baunilha Activia “Danone”",
		category: "Iogurtes",
		kcalPer100g: 106,
		measure: "1 pote",
		measureGrams: 100
	},
	{
		id: "iogurte-com-peda-os-de-morango-batavo-236",
		name: "Iogurte com Pedaços de Morango “Batavo”",
		category: "Iogurtes",
		kcalPer100g: 98,
		measure: "1 pote",
		measureGrams: 200
	},
	{
		id: "iogurte-com-polpa-de-ameixa-activia-danone-237",
		name: "Iogurte com Polpa de Ameixa Activia “Danone”",
		category: "Iogurtes",
		kcalPer100g: 110,
		measure: "1 pote",
		measureGrams: 100
	},
	{
		id: "iogurte-com-polpa-de-cereja-activia-danone-238",
		name: "Iogurte com Polpa de Cereja Activia “Danone”",
		category: "Iogurtes",
		kcalPer100g: 106,
		measure: "1 pote",
		measureGrams: 100
	},
	{
		id: "iogurte-com-polpa-de-coco-ati-latte-239",
		name: "Iogurte com Polpa de Coco “Ati Latte”",
		category: "Iogurtes",
		kcalPer100g: 96.1,
		measure: "1 pote",
		measureGrams: 180
	},
	{
		id: "iogurte-com-polpa-de-mam-o-banana-e-ma-a-vigor-240",
		name: "Iogurte com Polpa de Mamão, Banana e Maça “Vigor”",
		category: "Iogurtes",
		kcalPer100g: 76.5,
		measure: "1 pote",
		measureGrams: 200
	},
	{
		id: "iogurte-com-polpa-de-morango-danone-241",
		name: "Iogurte com polpa de morango “Danone”",
		category: "Iogurtes",
		kcalPer100g: 90,
		measure: "1 pote",
		measureGrams: 100
	},
	{
		id: "iogurte-com-polpa-e-gel-ia-de-morango-activia-da-242",
		name: "Iogurte com Polpa e Geléia de Morango Activia “Danone”",
		category: "Iogurtes",
		kcalPer100g: 120.8,
		measure: "1 pote",
		measureGrams: 120
	},
	{
		id: "iogurte-desnatado-com-polpa-de-ameixa-e-fibras-b-243",
		name: "Iogurte Desnatado com Polpa de Ameixa e Fibras Bio Fibras “Batavo”",
		category: "Iogurtes",
		kcalPer100g: 80.9,
		measure: "1 pote",
		measureGrams: 110
	},
	{
		id: "iogurte-integral-paulista-244",
		name: "Iogurte Integral “Paulista”",
		category: "Iogurtes",
		kcalPer100g: 64.1,
		measure: "1 pote",
		measureGrams: 170
	},
	{
		id: "iogurte-integral-com-laranja-cenoura-e-mel-activ-245",
		name: "Iogurte Integral com Laranja, Cenoura e Mel Activia “Danone”",
		category: "Iogurtes",
		kcalPer100g: 94.1,
		measure: "1 pote",
		measureGrams: 170
	},
	{
		id: "iogurte-integral-com-mel-vigor-246",
		name: "Iogurte Integral com Mel “Vigor”",
		category: "Iogurtes",
		kcalPer100g: 110.5,
		measure: "1 pote",
		measureGrams: 200
	},
	{
		id: "iogurte-integral-com-polpa-de-ameixa-vigor-247",
		name: "Iogurte Integral com Polpa de Ameixa “Vigor”",
		category: "Iogurtes",
		kcalPer100g: 117.5,
		measure: "1 pote",
		measureGrams: 200
	},
	{
		id: "iogurte-integral-com-polpa-de-morango-e-fibra-ne-248",
		name: "Iogurte Integral com Polpa de Morango e Fibra Nesvita “Nestlé”",
		category: "Iogurtes",
		kcalPer100g: 91,
		measure: "1 pote",
		measureGrams: 100
	},
	{
		id: "iogurte-integral-com-suco-de-uva-e-sabor-s-lvia--249",
		name: "Iogurte Integral com Suco de Uva e Sabor Sálvia “Nestlé”",
		category: "Iogurtes",
		kcalPer100g: 93,
		measure: "1 pote",
		measureGrams: 200
	},
	{
		id: "iogurte-integral-natural-activia-danone-250",
		name: "Iogurte Integral Natural Activia “Danone”",
		category: "Iogurtes",
		kcalPer100g: 77.6,
		measure: "1 pote",
		measureGrams: 170
	},
	{
		id: "iogurte-light-com-ado-ante-leco-251",
		name: "Iogurte light com adoçante “Leco”",
		category: "Iogurtes",
		kcalPer100g: 33,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "iogurte-light-com-peda-o-de-frutas-amarelas-pens-252",
		name: "Iogurte Light com Pedaço de Frutas Amarelas Pense Light “Batavo”",
		category: "Iogurtes",
		kcalPer100g: 40.9,
		measure: "1 pote",
		measureGrams: 110
	},
	{
		id: "iogurte-light-com-peda-os-de-p-ssego-e-prote-na--253",
		name: "Iogurte light com pedaços de pêssego e proteína de soja “Leco”",
		category: "Iogurtes",
		kcalPer100g: 52.2,
		measure: "1 pote",
		measureGrams: 115
	},
	{
		id: "iogurte-light-com-polpa-de-mam-o-batavo-254",
		name: "Iogurte Light com Polpa de Mamão “Batavo”",
		category: "Iogurtes",
		kcalPer100g: 26.5,
		measure: "1 pote",
		measureGrams: 170
	},
	{
		id: "iogurte-light-desnatado-com-polpa-de-morango-mol-255",
		name: "Iogurte Light Desnatado com Polpa de Morango Molico “Nestlé”",
		category: "Iogurtes",
		kcalPer100g: 31,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "iogurte-light-morango-com-chocolate-molico-tenta-256",
		name: "Iogurte Light Morango com Chocolate Molico Tentação “Nestlé”",
		category: "Iogurtes",
		kcalPer100g: 53,
		measure: "1 pote",
		measureGrams: 100
	},
	{
		id: "iogurte-natural-desnatado-nestl-257",
		name: "Iogurte Natural Desnatado “Nestlé”",
		category: "Iogurtes",
		kcalPer100g: 42.7,
		measure: "1 pote",
		measureGrams: 185
	},
	{
		id: "iogurte-parcialmente-desnatado-com-aveia-activia-258",
		name: "Iogurte Parcialmente Desnatado com Aveia Activia “Danone”",
		category: "Iogurtes",
		kcalPer100g: 80,
		measure: "1 pote",
		measureGrams: 180
	},
	{
		id: "iogurte-semi-desnatado-com-cereal-e-polpa-de-mor-259",
		name: "Iogurte Semi Desnatado com Cereal e Polpa de Morango “Ninho Solei”",
		category: "Iogurtes",
		kcalPer100g: 85.5,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "iogurte-semi-desnatado-com-polpa-de-frutas-verme-260",
		name: "Iogurte Semi Desnatado com Polpa de Frutas Vermelhas Bliss “Nestlé”",
		category: "Iogurtes",
		kcalPer100g: 87.8,
		measure: "1 pote",
		measureGrams: 180
	},
	{
		id: "iogurte-semi-desnatado-com-suco-de-maracuj-laran-261",
		name: "Iogurte Semi Desnatado com Suco de Maracujá, Laranja e Acerola Kissy “Batavo”",
		category: "Iogurtes",
		kcalPer100g: 56.7,
		measure: "1 pote",
		measureGrams: 180
	},
	{
		id: "petit-suisse-com-polpa-de-morango-danoninho-dano-262",
		name: "Petit Suisse com Polpa de Morango Danoninho “Danone”",
		category: "Iogurtes",
		kcalPer100g: 120,
		measure: "1 pote",
		measureGrams: 45
	},
	{
		id: "petit-suisse-de-chocolate-vigorzinho-vigor-263",
		name: "Petit Suisse de Chocolate Vigorzinho “Vigor”",
		category: "Iogurtes",
		kcalPer100g: 184.4,
		measure: "1 pote",
		measureGrams: 45
	},
	{
		id: "sobremesa-l-ctea-sabor-beijinho-paulista-264",
		name: "Sobremesa Láctea Sabor Beijinho “Paulista”",
		category: "Iogurtes",
		kcalPer100g: 143,
		measure: "1 pote",
		measureGrams: 100
	},
	{
		id: "azeite-de-dend-265",
		name: "Azeite de dendê",
		category: "Gorduras",
		kcalPer100g: 900,
		measure: "1 col. sopa",
		measureGrams: 8
	},
	{
		id: "azeite-de-oliva-266",
		name: "Azeite de oliva",
		category: "Gorduras",
		kcalPer100g: 900,
		measure: "1 col. sopa",
		measureGrams: 13
	},
	{
		id: "creme-de-leite-267",
		name: "Creme de leite",
		category: "Gorduras",
		kcalPer100g: 253.3,
		measure: "1 col. sopa",
		measureGrams: 15
	},
	{
		id: "creme-de-leite-light-268",
		name: "Creme de leite light",
		category: "Gorduras",
		kcalPer100g: 160,
		measure: "1 col. sopa",
		measureGrams: 15
	},
	{
		id: "gordura-vegetal-hidrogenada-269",
		name: "Gordura vegetal hidrogenada",
		category: "Gorduras",
		kcalPer100g: 900,
		measure: "1 col. sopa",
		measureGrams: 21
	},
	{
		id: "manteiga-270",
		name: "Manteiga",
		category: "Gorduras",
		kcalPer100g: 750,
		measure: "1 col. sopa",
		measureGrams: 10
	},
	{
		id: "manteiga-e-margarina-am-lia-271",
		name: "Manteiga e margarina “Amélia”",
		category: "Gorduras",
		kcalPer100g: 720,
		measure: "1 col. sopa",
		measureGrams: 10
	},
	{
		id: "manteiga-light-272",
		name: "Manteiga light",
		category: "Gorduras",
		kcalPer100g: 430,
		measure: "1 col. sopa",
		measureGrams: 10
	},
	{
		id: "margarina-273",
		name: "Margarina",
		category: "Gorduras",
		kcalPer100g: 700,
		measure: "1 col. sopa",
		measureGrams: 10
	},
	{
		id: "margarina-light-274",
		name: "Margarina light",
		category: "Gorduras",
		kcalPer100g: 440,
		measure: "1 col. sopa",
		measureGrams: 10
	},
	{
		id: "leo-vegetal-275",
		name: "Óleo vegetal",
		category: "Gorduras",
		kcalPer100g: 900,
		measure: "1 col. sopa",
		measureGrams: 12
	},
	{
		id: "achocolatado-l-quido-base-de-soja-sabor-chocolat-276",
		name: "Achocolatado líquido à base de soja sabor chocolate “Toddynho”",
		category: "Leites e Achocolatados",
		kcalPer100g: 84,
		measure: "1 caixinha",
		measureGrams: 200
	},
	{
		id: "achocolatado-l-quido-pronto-toddy-277",
		name: "Achocolatado líquido pronto “Toddy”",
		category: "Leites e Achocolatados",
		kcalPer100g: 92.5,
		measure: "1 caixinha",
		measureGrams: 200
	},
	{
		id: "bebida-l-ctea-sabor-chocolate-nescau-278",
		name: "Bebida láctea sabor chocolate “Nescau”",
		category: "Leites e Achocolatados",
		kcalPer100g: 96.5,
		measure: "1 caixinha",
		measureGrams: 200
	},
	{
		id: "chocolate-quente-com-ado-ante-279",
		name: "Chocolate quente com adoçante",
		category: "Leites e Achocolatados",
		kcalPer100g: 100,
		measure: "1 xícara",
		measureGrams: 100
	},
	{
		id: "chocolate-quente-puro-280",
		name: "Chocolate quente puro",
		category: "Leites e Achocolatados",
		kcalPer100g: 122,
		measure: "1 xícara",
		measureGrams: 100
	},
	{
		id: "chocolate-quente-com-leite-desnatado-281",
		name: "Chocolate quente com leite desnatado",
		category: "Leites e Achocolatados",
		kcalPer100g: 74,
		measure: "1 xícara",
		measureGrams: 100
	},
	{
		id: "leite-de-cabra-desnatado-282",
		name: "Leite de cabra desnatado",
		category: "Leites e Achocolatados",
		kcalPer100g: 30,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "leite-de-cabra-integral-283",
		name: "Leite de cabra integral",
		category: "Leites e Achocolatados",
		kcalPer100g: 60,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "leite-de-soja-em-p-284",
		name: "Leite de soja em pó",
		category: "Leites e Achocolatados",
		kcalPer100g: 442.3,
		measure: "2 col. sopa",
		measureGrams: 26
	},
	{
		id: "leite-de-vaca-desnatado-285",
		name: "Leite de vaca desnatado",
		category: "Leites e Achocolatados",
		kcalPer100g: 33,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "leite-de-vaca-desnatado-em-p-286",
		name: "Leite de vaca desnatado em pó",
		category: "Leites e Achocolatados",
		kcalPer100g: 246.2,
		measure: "2 col. sopa",
		measureGrams: 26
	},
	{
		id: "leite-de-vaca-integral-287",
		name: "Leite de vaca integral",
		category: "Leites e Achocolatados",
		kcalPer100g: 59.5,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "leite-de-vaca-integral-com-nescau-288",
		name: "Leite de vaca integral com “Nescau”",
		category: "Leites e Achocolatados",
		kcalPer100g: 97,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "leite-de-vaca-integral-com-ovomaltine-289",
		name: "Leite de vaca integral com “Ovomaltine”",
		category: "Leites e Achocolatados",
		kcalPer100g: 115,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "leite-de-vaca-integral-em-p-290",
		name: "Leite de vaca integral em pó",
		category: "Leites e Achocolatados",
		kcalPer100g: 500,
		measure: "2 col. sopa",
		measureGrams: 26
	},
	{
		id: "leite-de-vaca-semidesnatado-291",
		name: "Leite de vaca semidesnatado",
		category: "Leites e Achocolatados",
		kcalPer100g: 42.5,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "leite-fermentado-ado-ado-activia-danone-292",
		name: "Leite Fermentado Adoçado Activia “Danone”",
		category: "Leites e Achocolatados",
		kcalPer100g: 83.8,
		measure: "1 frasco",
		measureGrams: 80
	},
	{
		id: "leite-fermentado-desnatado-ado-ado-yakult-293",
		name: "Leite Fermentado Desnatado Adoçado “Yakult”",
		category: "Leites e Achocolatados",
		kcalPer100g: 73.8,
		measure: "1 frasco",
		measureGrams: 80
	},
	{
		id: "leite-integral-batido-com-banana-294",
		name: "Leite integral batido com banana",
		category: "Leites e Achocolatados",
		kcalPer100g: 84,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "leite-integral-batido-com-mam-o-295",
		name: "Leite integral batido com mamão",
		category: "Leites e Achocolatados",
		kcalPer100g: 64,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "leite-integral-batido-com-morango-296",
		name: "Leite integral batido com morango",
		category: "Leites e Achocolatados",
		kcalPer100g: 65,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "milk-shake-de-chocolate-do-mc-donald-s-297",
		name: "Milk Shake de chocolate do “Mc Donald’s”",
		category: "Leites e Achocolatados",
		kcalPer100g: 83.7,
		measure: "1 copo",
		measureGrams: 300
	},
	{
		id: "milk-shake-de-morango-do-mc-donald-s-298",
		name: "Milk Shake de morango do “Mc Donald’s”",
		category: "Leites e Achocolatados",
		kcalPer100g: 73,
		measure: "1 copo",
		measureGrams: 300
	},
	{
		id: "caldo-de-galinha-em-tablete-knorr-299",
		name: "Caldo de galinha em tablete “Knorr”",
		category: "Aves",
		kcalPer100g: 210.5,
		measure: "1 unidade",
		measureGrams: 9.5
	},
	{
		id: "chester-assado-300",
		name: "Chester assado",
		category: "Aves",
		kcalPer100g: 205,
		measure: "1 fatia fina",
		measureGrams: 20
	},
	{
		id: "coxa-de-frango-assada-com-pele-301",
		name: "Coxa de frango assada com pele",
		category: "Aves",
		kcalPer100g: 215.2,
		measure: "1 unidade",
		measureGrams: 46
	},
	{
		id: "coxa-de-frango-cozida-sem-pele-302",
		name: "Coxa de frango cozida sem pele",
		category: "Aves",
		kcalPer100g: 167.4,
		measure: "1 unidade",
		measureGrams: 46
	},
	{
		id: "espetinho-de-cora-o-de-frango-na-brasa-303",
		name: "Espetinho de coração de frango na brasa",
		category: "Aves",
		kcalPer100g: 208,
		measure: "1 unidade",
		measureGrams: 50
	},
	{
		id: "espetinho-de-frango-na-brasa-304",
		name: "Espetinho de frango na brasa",
		category: "Aves",
		kcalPer100g: 160,
		measure: "1 unidade",
		measureGrams: 50
	},
	{
		id: "f-gado-de-galinha-cozido-305",
		name: "Fígado de galinha cozido",
		category: "Aves",
		kcalPer100g: 140,
		measure: "1 col. sopa",
		measureGrams: 25
	},
	{
		id: "fil-de-frango-milanesa-306",
		name: "Filé de frango à milanesa",
		category: "Aves",
		kcalPer100g: 310.7,
		measure: "1 filé médio",
		measureGrams: 140
	},
	{
		id: "fil-de-frango-parmegiana-sadia-307",
		name: "Filé de frango à parmegiana “Sadia”",
		category: "Aves",
		kcalPer100g: 121.8,
		measure: "1 filé médio",
		measureGrams: 275
	},
	{
		id: "fil-de-frango-grelhado-308",
		name: "Filé de frango grelhado",
		category: "Aves",
		kcalPer100g: 159.2,
		measure: "1 unidade média",
		measureGrams: 125
	},
	{
		id: "frango-ensopado-309",
		name: "Frango ensopado",
		category: "Aves",
		kcalPer100g: 127.2,
		measure: "1 peito médio",
		measureGrams: 180
	},
	{
		id: "hamburguer-de-frango-grelhado-310",
		name: "Hamburguer de frango (grelhado)",
		category: "Aves",
		kcalPer100g: 192.9,
		measure: "1 unidade",
		measureGrams: 85
	},
	{
		id: "hamburguer-de-peru-grelhado-311",
		name: "Hamburguer de peru (grelhado)",
		category: "Aves",
		kcalPer100g: 207.5,
		measure: "1 e 1/2 unidade",
		measureGrams: 80
	},
	{
		id: "mi-dos-de-galinha-312",
		name: "Miúdos de galinha",
		category: "Aves",
		kcalPer100g: 161.1,
		measure: "1 moela média",
		measureGrams: 18
	},
	{
		id: "nuggets-de-frango-313",
		name: "Nuggets de frango",
		category: "Aves",
		kcalPer100g: 250.8,
		measure: "5 unidades",
		measureGrams: 130
	},
	{
		id: "peru-assado-314",
		name: "Peru assado",
		category: "Aves",
		kcalPer100g: 162.5,
		measure: "1 fatia média",
		measureGrams: 32
	},
	{
		id: "sobrecoxa-de-frango-assada-com-pele-315",
		name: "Sobrecoxa de frango assada com pele",
		category: "Aves",
		kcalPer100g: 260,
		measure: "1 unidade",
		measureGrams: 65
	},
	{
		id: "sobrecoxa-de-frango-assada-sem-pele-316",
		name: "Sobrecoxa de frango assada sem pele",
		category: "Aves",
		kcalPer100g: 232.3,
		measure: "1 unidade",
		measureGrams: 65
	},
	{
		id: "alm-ndega-caseira-frita-317",
		name: "Almôndega caseira frita",
		category: "Carne bovina",
		kcalPer100g: 204,
		measure: "1 unidade média",
		measureGrams: 50
	},
	{
		id: "bife-milanesa-318",
		name: "Bife à milanesa",
		category: "Carne bovina",
		kcalPer100g: 287.5,
		measure: "1 unidade média",
		measureGrams: 80
	},
	{
		id: "bife-parmegiana-319",
		name: "Bife à parmegiana",
		category: "Carne bovina",
		kcalPer100g: 327.3,
		measure: "1 unidade média",
		measureGrams: 150
	},
	{
		id: "bife-de-f-gado-320",
		name: "Bife de fígado",
		category: "Carne bovina",
		kcalPer100g: 225.4,
		measure: "1 unidade grande",
		measureGrams: 130
	},
	{
		id: "bife-grelhado-contra-fil-com-gordura-321",
		name: "Bife grelhado (contra-filé com gordura)",
		category: "Carne bovina",
		kcalPer100g: 278,
		measure: "1 unidade média",
		measureGrams: 100
	},
	{
		id: "bife-grelhado-contra-fil-sem-gordura-322",
		name: "Bife grelhado (contra-filé sem gordura)",
		category: "Carne bovina",
		kcalPer100g: 222.2,
		measure: "1 unidade média",
		measureGrams: 90
	},
	{
		id: "bife-grelhado-fil-mignon-sem-gordura-323",
		name: "Bife grelhado (filé mignon sem gordura)",
		category: "Carne bovina",
		kcalPer100g: 220,
		measure: "1 unidade média",
		measureGrams: 90
	},
	{
		id: "bife-grelhado-miolo-de-alcatra-sem-gordura-324",
		name: "Bife grelhado (miolo de alcatra sem gordura)",
		category: "Carne bovina",
		kcalPer100g: 241.1,
		measure: "1 unidade média",
		measureGrams: 90
	},
	{
		id: "bife-rol-325",
		name: "Bife rolê",
		category: "Carne bovina",
		kcalPer100g: 179,
		measure: "1 unidade média",
		measureGrams: 100
	},
	{
		id: "caldo-de-carne-em-tablete-knorr-326",
		name: "Caldo de carne em tablete “Knorr”",
		category: "Carne bovina",
		kcalPer100g: 263.2,
		measure: "1 unidade",
		measureGrams: 9.5
	},
	{
		id: "carne-assada-327",
		name: "Carne assada",
		category: "Carne bovina",
		kcalPer100g: 287.8,
		measure: "1 fatia média",
		measureGrams: 90
	},
	{
		id: "carne-cozida-lagarto-328",
		name: "Carne cozida (lagarto)",
		category: "Carne bovina",
		kcalPer100g: 178.7,
		measure: "1 fatia média",
		measureGrams: 75
	},
	{
		id: "carne-cozida-m-sculo-329",
		name: "Carne cozida (músculo)",
		category: "Carne bovina",
		kcalPer100g: 194.7,
		measure: "1 fatia média",
		measureGrams: 75
	},
	{
		id: "carne-mo-da-refogada-ac-m-330",
		name: "Carne moída refogada (acém)",
		category: "Carne bovina",
		kcalPer100g: 213.3,
		measure: "1 col. sopa",
		measureGrams: 30
	},
	{
		id: "carne-seca-cozida-331",
		name: "Carne seca cozida",
		category: "Carne bovina",
		kcalPer100g: 315.4,
		measure: "1 pedaço médio",
		measureGrams: 65
	},
	{
		id: "carpaccio-332",
		name: "Carpaccio",
		category: "Carne bovina",
		kcalPer100g: 150,
		measure: "10 fatias",
		measureGrams: 80
	},
	{
		id: "costela-de-boi-assado-333",
		name: "Costela de boi assado",
		category: "Carne bovina",
		kcalPer100g: 452.5,
		measure: "1 pedaço médio",
		measureGrams: 40
	},
	{
		id: "espetinho-de-carne-na-brasa-334",
		name: "Espetinho de carne na brasa",
		category: "Carne bovina",
		kcalPer100g: 238,
		measure: "1 unidade",
		measureGrams: 50
	},
	{
		id: "hamb-rguer-frito-335",
		name: "Hambúrguer (frito)",
		category: "Carne bovina",
		kcalPer100g: 257.6,
		measure: "1 unidade",
		measureGrams: 85
	},
	{
		id: "hamb-rguer-grelhado-336",
		name: "Hambúrguer (grelhado)",
		category: "Carne bovina",
		kcalPer100g: 209.4,
		measure: "1 unidade",
		measureGrams: 85
	},
	{
		id: "picanha-na-brasa-sem-gordura-337",
		name: "Picanha na brasa (sem gordura)",
		category: "Carne bovina",
		kcalPer100g: 238,
		measure: "1 pedaço médio",
		measureGrams: 100
	},
	{
		id: "quibe-assado-338",
		name: "Quibe assado",
		category: "Carne bovina",
		kcalPer100g: 181.2,
		measure: "1 pedaço grande",
		measureGrams: 80
	},
	{
		id: "quibe-frito-339",
		name: "Quibe frito",
		category: "Carne bovina",
		kcalPer100g: 207.1,
		measure: "1 unidade grande",
		measureGrams: 85
	},
	{
		id: "bacon-frito-340",
		name: "Bacon frito",
		category: "Carne suína",
		kcalPer100g: 660,
		measure: "1 fatia média",
		measureGrams: 15
	},
	{
		id: "bisteca-de-porco-na-brasa-341",
		name: "Bisteca de porco (na brasa)",
		category: "Carne suína",
		kcalPer100g: 280,
		measure: "1 unidade",
		measureGrams: 100
	},
	{
		id: "costela-de-porco-assada-342",
		name: "Costela de porco (assada)",
		category: "Carne suína",
		kcalPer100g: 401.7,
		measure: "1 unidade",
		measureGrams: 115
	},
	{
		id: "leit-o-assado-343",
		name: "Leitão assado",
		category: "Carne suína",
		kcalPer100g: 223.5,
		measure: "1 pedaço médio",
		measureGrams: 85
	},
	{
		id: "lombo-assado-344",
		name: "Lombo assado",
		category: "Carne suína",
		kcalPer100g: 125,
		measure: "1 fatia",
		measureGrams: 100
	},
	{
		id: "paio-345",
		name: "Paio",
		category: "Carne suína",
		kcalPer100g: 226.9,
		measure: "1 unidade",
		measureGrams: 160
	},
	{
		id: "pernil-assado-346",
		name: "Pernil assado",
		category: "Carne suína",
		kcalPer100g: 158,
		measure: "1 fatia",
		measureGrams: 100
	},
	{
		id: "rabo-de-porco-cozido-347",
		name: "Rabo de porco (cozido)",
		category: "Carne suína",
		kcalPer100g: 377,
		measure: "3 unidades",
		measureGrams: 100
	},
	{
		id: "tender-assado-348",
		name: "Tender assado",
		category: "Carne suína",
		kcalPer100g: 121,
		measure: "1 fatia",
		measureGrams: 100
	},
	{
		id: "toucinho-frito-349",
		name: "Toucinho (frito)",
		category: "Carne suína",
		kcalPer100g: 700,
		measure: "1 fatia",
		measureGrams: 15
	},
	{
		id: "apresuntado-perdig-o-350",
		name: "Apresuntado “Perdigão”",
		category: "Embutidos",
		kcalPer100g: 380,
		measure: "1 fatia",
		measureGrams: 30
	},
	{
		id: "chester-perdig-o-351",
		name: "Chester “Perdigão”",
		category: "Embutidos",
		kcalPer100g: 120,
		measure: "2 fatias",
		measureGrams: 30
	},
	{
		id: "copa-sadia-352",
		name: "Copa “Sadia”",
		category: "Embutidos",
		kcalPer100g: 342.5,
		measure: "10 fatias",
		measureGrams: 40
	},
	{
		id: "lingui-a-de-frango-na-brasa-353",
		name: "Linguiça de frango (na brasa)",
		category: "Embutidos",
		kcalPer100g: 243.3,
		measure: "1 unidade média",
		measureGrams: 60
	},
	{
		id: "lingui-a-de-porco-na-brasa-354",
		name: "Linguiça de porco (na brasa)",
		category: "Embutidos",
		kcalPer100g: 295,
		measure: "1 unidade média",
		measureGrams: 60
	},
	{
		id: "lombinho-ceratti-355",
		name: "Lombinho “Ceratti”",
		category: "Embutidos",
		kcalPer100g: 156,
		measure: "2 fatias",
		measureGrams: 50
	},
	{
		id: "mortadela-ceratti-356",
		name: "Mortadela “Ceratti”",
		category: "Embutidos",
		kcalPer100g: 240,
		measure: "3 fatias",
		measureGrams: 50
	},
	{
		id: "peito-de-peru-perdig-o-357",
		name: "Peito de peru “Perdigão”",
		category: "Embutidos",
		kcalPer100g: 110,
		measure: "2 fatias",
		measureGrams: 30
	},
	{
		id: "presunto-cozido-com-capa-de-gordura-sadia-358",
		name: "Presunto cozido com capa de gordura “Sadia”",
		category: "Embutidos",
		kcalPer100g: 155,
		measure: "2 fatias",
		measureGrams: 40
	},
	{
		id: "presunto-cozido-sem-capa-de-gordura-perdig-o-359",
		name: "Presunto cozido sem capa de gordura “Perdigão”",
		category: "Embutidos",
		kcalPer100g: 120,
		measure: "2 fatias",
		measureGrams: 40
	},
	{
		id: "presunto-parma-sadia-360",
		name: "Presunto parma “Sadia”",
		category: "Embutidos",
		kcalPer100g: 210,
		measure: "2 fatias",
		measureGrams: 40
	},
	{
		id: "salame-sadia-361",
		name: "Salame “Sadia”",
		category: "Embutidos",
		kcalPer100g: 370,
		measure: "7 fatias",
		measureGrams: 40
	},
	{
		id: "salsicha-362",
		name: "Salsicha",
		category: "Embutidos",
		kcalPer100g: 292,
		measure: "1 unidade",
		measureGrams: 50
	},
	{
		id: "salsicha-de-frango-363",
		name: "Salsicha de frango",
		category: "Embutidos",
		kcalPer100g: 240,
		measure: "1 unidade",
		measureGrams: 50
	},
	{
		id: "salsicha-de-chester-364",
		name: "Salsicha de chester",
		category: "Embutidos",
		kcalPer100g: 180,
		measure: "1 unidade",
		measureGrams: 50
	},
	{
		id: "camar-o-m-dio-cozido-365",
		name: "Camarão médio cozido",
		category: "Frutos do mar",
		kcalPer100g: 90,
		measure: "10 unidades",
		measureGrams: 100
	},
	{
		id: "camar-o-pequeno-frito-366",
		name: "Camarão pequeno frito",
		category: "Frutos do mar",
		kcalPer100g: 310,
		measure: "1 col. sopa",
		measureGrams: 20
	},
	{
		id: "camar-o-cozido-pequeno-367",
		name: "Camarão cozido pequeno",
		category: "Frutos do mar",
		kcalPer100g: 82,
		measure: "5 col. sopa",
		measureGrams: 100
	},
	{
		id: "camar-o-frito-grande-368",
		name: "Camarão frito grande",
		category: "Frutos do mar",
		kcalPer100g: 310,
		measure: "5 unidades",
		measureGrams: 100
	},
	{
		id: "camar-o-cozido-grande-369",
		name: "Camarão cozido grande",
		category: "Frutos do mar",
		kcalPer100g: 82,
		measure: "5 unidades",
		measureGrams: 100
	},
	{
		id: "camar-o-seco-descascado-do-norte-370",
		name: "Camarão seco descascado do norte",
		category: "Frutos do mar",
		kcalPer100g: 158,
		measure: "5 médios",
		measureGrams: 100
	},
	{
		id: "casquinha-de-siri-371",
		name: "Casquinha de siri",
		category: "Frutos do mar",
		kcalPer100g: 413,
		measure: "1 unidade",
		measureGrams: 100
	},
	{
		id: "kani-kama-372",
		name: "Kani-kama",
		category: "Frutos do mar",
		kcalPer100g: 81.2,
		measure: "1 unidade",
		measureGrams: 16
	},
	{
		id: "lagostim-373",
		name: "Lagostim",
		category: "Frutos do mar",
		kcalPer100g: 112,
		measure: "8 unidades",
		measureGrams: 100
	},
	{
		id: "lagosta-grelhada-c-manteiga-308-374",
		name: "Lagosta grelhada c/ manteiga 308",
		category: "Frutos do mar",
		kcalPer100g: 154,
		measure: "1 unidade",
		measureGrams: 200
	},
	{
		id: "lagosta-cozida-375",
		name: "Lagosta cozida",
		category: "Frutos do mar",
		kcalPer100g: 98,
		measure: "1 unidade",
		measureGrams: 200
	},
	{
		id: "lula-dor-376",
		name: "Lula à dorê",
		category: "Frutos do mar",
		kcalPer100g: 190,
		measure: "1 pires de chá",
		measureGrams: 100
	},
	{
		id: "lula-cozida-377",
		name: "Lula cozida",
		category: "Frutos do mar",
		kcalPer100g: 92,
		measure: "1 pires de chá",
		measureGrams: 100
	},
	{
		id: "marisco-378",
		name: "Marisco",
		category: "Frutos do mar",
		kcalPer100g: 186,
		measure: "1 xíc. chá",
		measureGrams: 100
	},
	{
		id: "ostra-crua-379",
		name: "Ostra crua",
		category: "Frutos do mar",
		kcalPer100g: 81,
		measure: "3 unidades",
		measureGrams: 100
	},
	{
		id: "ovas-de-peixe-cruas-380",
		name: "Ovas de peixe cruas",
		category: "Frutos do mar",
		kcalPer100g: 123,
		measure: "1/2 xíc. chá",
		measureGrams: 100
	},
	{
		id: "polvo-refogado-381",
		name: "Polvo refogado",
		category: "Frutos do mar",
		kcalPer100g: 81.7,
		measure: "1 escumadeira",
		measureGrams: 60
	},
	{
		id: "gemada-382",
		name: "Gemada",
		category: "Ovos",
		kcalPer100g: 140,
		measure: "1 porção",
		measureGrams: 150
	},
	{
		id: "omelete-com-queijo-mussarela-383",
		name: "Omelete com queijo mussarela",
		category: "Ovos",
		kcalPer100g: 220,
		measure: "1 porção",
		measureGrams: 100
	},
	{
		id: "omelete-simples-384",
		name: "Omelete simples",
		category: "Ovos",
		kcalPer100g: 169.2,
		measure: "1 unidade",
		measureGrams: 65
	},
	{
		id: "ovo-cozido-385",
		name: "Ovo cozido",
		category: "Ovos",
		kcalPer100g: 157.8,
		measure: "1 unidade",
		measureGrams: 45
	},
	{
		id: "ovo-de-codorna-386",
		name: "Ovo de codorna",
		category: "Ovos",
		kcalPer100g: 160,
		measure: "1 unidade",
		measureGrams: 10
	},
	{
		id: "ovo-frito-387",
		name: "Ovo frito",
		category: "Ovos",
		kcalPer100g: 210,
		measure: "1 unidade",
		measureGrams: 50
	},
	{
		id: "ovo-mexido-simples-388",
		name: "Ovo mexido simples",
		category: "Ovos",
		kcalPer100g: 200,
		measure: "1 unidade",
		measureGrams: 60
	},
	{
		id: "arraia-389",
		name: "Arraia",
		category: "Peixes",
		kcalPer100g: 90,
		measure: "1 posta",
		measureGrams: 100
	},
	{
		id: "arenque-390",
		name: "Arenque",
		category: "Peixes",
		kcalPer100g: 230,
		measure: "2 filés",
		measureGrams: 100
	},
	{
		id: "anchova-cozida-391",
		name: "Anchova cozida",
		category: "Peixes",
		kcalPer100g: 118,
		measure: "1 filé",
		measureGrams: 100
	},
	{
		id: "anchova-milanesa-392",
		name: "Anchova à milanesa",
		category: "Peixes",
		kcalPer100g: 210,
		measure: "1 filé",
		measureGrams: 100
	},
	{
		id: "cavala-393",
		name: "Cavala",
		category: "Peixes",
		kcalPer100g: 260,
		measure: "2 unidades",
		measureGrams: 100
	},
	{
		id: "agulha-frito-394",
		name: "Agulha frito",
		category: "Peixes",
		kcalPer100g: 94,
		measure: "5 unidades",
		measureGrams: 100
	},
	{
		id: "agulha-cru-395",
		name: "Agulha cru",
		category: "Peixes",
		kcalPer100g: 28,
		measure: "5 unidades",
		measureGrams: 100
	},
	{
		id: "atum-cru-396",
		name: "Atum cru",
		category: "Peixes",
		kcalPer100g: 118,
		measure: "1 posta",
		measureGrams: 100
	},
	{
		id: "atum-em-conserva-gua-397",
		name: "Atum em conserva (água)",
		category: "Peixes",
		kcalPer100g: 115.6,
		measure: "1 col. sopa",
		measureGrams: 45
	},
	{
		id: "atum-em-conserva-leo-398",
		name: "Atum em conserva (óleo)",
		category: "Peixes",
		kcalPer100g: 188.9,
		measure: "1 col. sopa",
		measureGrams: 45
	},
	{
		id: "bacalhau-assado-399",
		name: "Bacalhau assado",
		category: "Peixes",
		kcalPer100g: 110,
		measure: "1 posta",
		measureGrams: 100
	},
	{
		id: "bacalhau-cozido-400",
		name: "Bacalhau cozido",
		category: "Peixes",
		kcalPer100g: 100,
		measure: "1 posta",
		measureGrams: 100
	},
	{
		id: "baiacu-401",
		name: "Baiacu",
		category: "Peixes",
		kcalPer100g: 92,
		measure: "1 filé",
		measureGrams: 100
	},
	{
		id: "badejo-cozido-402",
		name: "Badejo cozido",
		category: "Peixes",
		kcalPer100g: 131,
		measure: "2 filés",
		measureGrams: 100
	},
	{
		id: "badejo-cru-403",
		name: "Badejo cru",
		category: "Peixes",
		kcalPer100g: 97,
		measure: "2 filés",
		measureGrams: 100
	},
	{
		id: "bagre-cozido-404",
		name: "Bagre cozido",
		category: "Peixes",
		kcalPer100g: 120,
		measure: "1 posta",
		measureGrams: 100
	},
	{
		id: "beijupir-405",
		name: "Beijupirá",
		category: "Peixes",
		kcalPer100g: 131,
		measure: "1 posta",
		measureGrams: 100
	},
	{
		id: "bonito-em-conserva-406",
		name: "Bonito em conserva",
		category: "Peixes",
		kcalPer100g: 170,
		measure: "1 col. sopa",
		measureGrams: 20
	},
	{
		id: "bonito-cru-407",
		name: "Bonito cru",
		category: "Peixes",
		kcalPer100g: 149,
		measure: "1 posta",
		measureGrams: 100
	},
	{
		id: "ca-o-cru-408",
		name: "Cação cru",
		category: "Peixes",
		kcalPer100g: 129,
		measure: "1 posta",
		measureGrams: 100
	},
	{
		id: "caviar-vermelho-de-carpa-409",
		name: "Caviar vermelho de carpa",
		category: "Peixes",
		kcalPer100g: 130,
		measure: "1 porção",
		measureGrams: 100
	},
	{
		id: "caviar-410",
		name: "Caviar",
		category: "Peixes",
		kcalPer100g: 290,
		measure: "1 xíc. chá",
		measureGrams: 10
	},
	{
		id: "dourado-411",
		name: "Dourado",
		category: "Peixes",
		kcalPer100g: 80,
		measure: "1 posta",
		measureGrams: 100
	},
	{
		id: "esturj-o-412",
		name: "Esturjão",
		category: "Peixes",
		kcalPer100g: 90,
		measure: "1 porção",
		measureGrams: 100
	},
	{
		id: "esturj-o-defumado-413",
		name: "Esturjão defumado",
		category: "Peixes",
		kcalPer100g: 141,
		measure: "1 porção",
		measureGrams: 100
	},
	{
		id: "espada-grelhado-414",
		name: "Espada grelhado",
		category: "Peixes",
		kcalPer100g: 158,
		measure: "1 porção",
		measureGrams: 100
	},
	{
		id: "galo-415",
		name: "Galo",
		category: "Peixes",
		kcalPer100g: 109,
		measure: "1 porção",
		measureGrams: 100
	},
	{
		id: "garoupa-s-o-tom-416",
		name: "Garoupa São Tomé",
		category: "Peixes",
		kcalPer100g: 89,
		measure: "1 posta",
		measureGrams: 100
	},
	{
		id: "gordinho-417",
		name: "Gordinho",
		category: "Peixes",
		kcalPer100g: 103,
		measure: "1 porção",
		measureGrams: 100
	},
	{
		id: "haddock-cozido-418",
		name: "Haddock cozido",
		category: "Peixes",
		kcalPer100g: 100,
		measure: "1 filé",
		measureGrams: 100
	},
	{
		id: "haddock-defumado-419",
		name: "Haddock defumado",
		category: "Peixes",
		kcalPer100g: 78,
		measure: "1 filé",
		measureGrams: 100
	},
	{
		id: "manjuba-frita-420",
		name: "Manjuba frita",
		category: "Peixes",
		kcalPer100g: 285,
		measure: "10 unidades",
		measureGrams: 100
	},
	{
		id: "mero-vermelho-421",
		name: "Mero vermelho",
		category: "Peixes",
		kcalPer100g: 96,
		measure: "1 porção",
		measureGrams: 100
	},
	{
		id: "merluza-crua-422",
		name: "Merluza crua",
		category: "Peixes",
		kcalPer100g: 200,
		measure: "1 filé",
		measureGrams: 100
	},
	{
		id: "merluza-cozida-423",
		name: "Merluza cozida",
		category: "Peixes",
		kcalPer100g: 232,
		measure: "1 filé",
		measureGrams: 100
	},
	{
		id: "mor-ia-424",
		name: "Moréia",
		category: "Peixes",
		kcalPer100g: 126,
		measure: "1 porção",
		measureGrams: 100
	},
	{
		id: "namorado-cozido-425",
		name: "Namorado cozido",
		category: "Peixes",
		kcalPer100g: 122,
		measure: "1 filé",
		measureGrams: 100
	},
	{
		id: "namorado-cru-426",
		name: "Namorado cru",
		category: "Peixes",
		kcalPer100g: 87,
		measure: "1 filé",
		measureGrams: 100
	},
	{
		id: "namorado-milanesa-427",
		name: "Namorado à milanesa",
		category: "Peixes",
		kcalPer100g: 190,
		measure: "1 filé",
		measureGrams: 100
	},
	{
		id: "ovas-de-peixe-em-conserva-428",
		name: "Ovas de peixe em conserva",
		category: "Peixes",
		kcalPer100g: 383,
		measure: "1/2 xíc. chá",
		measureGrams: 100
	},
	{
		id: "ovas-de-peixe-cruas-429",
		name: "Ovas de peixe cruas",
		category: "Peixes",
		kcalPer100g: 123,
		measure: "1/12 xíc. chá",
		measureGrams: 100
	},
	{
		id: "pescada-frito-430",
		name: "Pescada frito",
		category: "Peixes",
		kcalPer100g: 154,
		measure: "1 filé",
		measureGrams: 100
	},
	{
		id: "pescada-431",
		name: "Pescada",
		category: "Peixes",
		kcalPer100g: 97,
		measure: "1 filé",
		measureGrams: 100
	},
	{
		id: "pescada-em-conserva-432",
		name: "Pescada em conserva",
		category: "Peixes",
		kcalPer100g: 144,
		measure: "1 filé",
		measureGrams: 100
	},
	{
		id: "pirarucu-salgado-433",
		name: "Pirarucu salgado",
		category: "Peixes",
		kcalPer100g: 251,
		measure: "1 posta",
		measureGrams: 100
	},
	{
		id: "pollock-assado-ou-grelhado-434",
		name: "Pollock assado ou grelhado",
		category: "Peixes",
		kcalPer100g: 110,
		measure: "1 filé",
		measureGrams: 100
	},
	{
		id: "robalo-435",
		name: "Robalo",
		category: "Peixes",
		kcalPer100g: 72,
		measure: "1 posta",
		measureGrams: 100
	},
	{
		id: "salm-o-cru-436",
		name: "Salmão cru",
		category: "Peixes",
		kcalPer100g: 211,
		measure: "1 filé",
		measureGrams: 100
	},
	{
		id: "salm-o-defumado-437",
		name: "Salmão defumado",
		category: "Peixes",
		kcalPer100g: 204,
		measure: "1 filé",
		measureGrams: 100
	},
	{
		id: "salm-o-grelhado-438",
		name: "Salmão grelhado",
		category: "Peixes",
		kcalPer100g: 220,
		measure: "1 filé",
		measureGrams: 100
	},
	{
		id: "sardinha-coqueiro-em-leo-comest-vel-439",
		name: "Sardinha Coqueiro em óleo comestível",
		category: "Peixes",
		kcalPer100g: 174,
		measure: "4 unidades",
		measureGrams: 100
	},
	{
		id: "sardinha-em-conserva-c-azeite-440",
		name: "Sardinha em conserva c/ azeite",
		category: "Peixes",
		kcalPer100g: 298,
		measure: "3 unidades",
		measureGrams: 100
	},
	{
		id: "sardinha-em-conserva-c-molho-de-tomate-441",
		name: "Sardinha em conserva c/ molho de tomate",
		category: "Peixes",
		kcalPer100g: 173,
		measure: "3 unidades",
		measureGrams: 100
	},
	{
		id: "sardinha-em-conserva-442",
		name: "Sardinha em conserva",
		category: "Peixes",
		kcalPer100g: 158,
		measure: "4 unidades",
		measureGrams: 100
	},
	{
		id: "serra-salgado-443",
		name: "Serra salgado",
		category: "Peixes",
		kcalPer100g: 189,
		measure: "1 posta",
		measureGrams: 100
	},
	{
		id: "surubim-cru-444",
		name: "Surubim cru",
		category: "Peixes",
		kcalPer100g: 107,
		measure: "1 posta",
		measureGrams: 100
	},
	{
		id: "surubim-salgado-445",
		name: "Surubim salgado",
		category: "Peixes",
		kcalPer100g: 251,
		measure: "1 posta",
		measureGrams: 100
	},
	{
		id: "tainha-em-conserva-446",
		name: "Tainha em conserva",
		category: "Peixes",
		kcalPer100g: 145,
		measure: "1 posta",
		measureGrams: 100
	},
	{
		id: "tainha-cozida-447",
		name: "Tainha cozida",
		category: "Peixes",
		kcalPer100g: 204,
		measure: "1 posta",
		measureGrams: 100
	},
	{
		id: "truta-assada-ou-grelhada-448",
		name: "Truta assada ou grelhada",
		category: "Peixes",
		kcalPer100g: 150,
		measure: "1 filé",
		measureGrams: 100
	},
	{
		id: "tubar-o-449",
		name: "Tubarão",
		category: "Peixes",
		kcalPer100g: 294,
		measure: "1 posta",
		measureGrams: 100
	},
	{
		id: "vermelho-assado-ou-grelhado-450",
		name: "Vermelho assado ou grelhado",
		category: "Peixes",
		kcalPer100g: 130,
		measure: "1 porção",
		measureGrams: 100
	},
	{
		id: "viola-451",
		name: "Viola",
		category: "Peixes",
		kcalPer100g: 127,
		measure: "1 porção",
		measureGrams: 100
	},
	{
		id: "abacate-452",
		name: "Abacate",
		category: "Frutas e Castanhas",
		kcalPer100g: 177.8,
		measure: "1 col. sopa amassado",
		measureGrams: 45
	},
	{
		id: "abacaxi-453",
		name: "Abacaxi",
		category: "Frutas e Castanhas",
		kcalPer100g: 58.7,
		measure: "1 fatia média",
		measureGrams: 75
	},
	{
		id: "a-a-454",
		name: "Açaí",
		category: "Frutas e Castanhas",
		kcalPer100g: 110,
		measure: "1 xíc. chá",
		measureGrams: 100
	},
	{
		id: "ameixa-amarela-455",
		name: "Ameixa amarela",
		category: "Frutas e Castanhas",
		kcalPer100g: 92,
		measure: "1 unidade",
		measureGrams: 25
	},
	{
		id: "ameixa-preta-seca-456",
		name: "Ameixa preta seca",
		category: "Frutas e Castanhas",
		kcalPer100g: 200,
		measure: "1 unidade",
		measureGrams: 5
	},
	{
		id: "ameixa-vermelha-457",
		name: "Ameixa vermelha",
		category: "Frutas e Castanhas",
		kcalPer100g: 56.2,
		measure: "1 unidade média",
		measureGrams: 16
	},
	{
		id: "am-ndoas-458",
		name: "Amêndoas",
		category: "Frutas e Castanhas",
		kcalPer100g: 640,
		measure: "10 unidades",
		measureGrams: 100
	},
	{
		id: "amendoim-459",
		name: "Amendoim",
		category: "Frutas e Castanhas",
		kcalPer100g: 576,
		measure: "1 xíc. de chá",
		measureGrams: 100
	},
	{
		id: "amora-silvestre-460",
		name: "Amora silvestre",
		category: "Frutas e Castanhas",
		kcalPer100g: 61,
		measure: "1/2 copo",
		measureGrams: 100
	},
	{
		id: "avel-461",
		name: "Avelã",
		category: "Frutas e Castanhas",
		kcalPer100g: 633,
		measure: "10 unidades",
		measureGrams: 100
	},
	{
		id: "banana-da-terra-462",
		name: "Banana-da-terra",
		category: "Frutas e Castanhas",
		kcalPer100g: 105,
		measure: "1/2 unidade",
		measureGrams: 100
	},
	{
		id: "banana-ma-463",
		name: "Banana maçã",
		category: "Frutas e Castanhas",
		kcalPer100g: 121.2,
		measure: "1 unidade média",
		measureGrams: 80
	},
	{
		id: "banana-nanica-464",
		name: "Banana nanica",
		category: "Frutas e Castanhas",
		kcalPer100g: 80.9,
		measure: "1 unidade",
		measureGrams: 110
	},
	{
		id: "banana-nanica-milanesa-465",
		name: "Banana-nanica à milanesa",
		category: "Frutas e Castanhas",
		kcalPer100g: 308,
		measure: "1/2 unidade",
		measureGrams: 100
	},
	{
		id: "banana-ouro-466",
		name: "Banana-ouro",
		category: "Frutas e Castanhas",
		kcalPer100g: 159,
		measure: "2 unidades",
		measureGrams: 100
	},
	{
		id: "banana-passa-467",
		name: "Banana passa",
		category: "Frutas e Castanhas",
		kcalPer100g: 350,
		measure: "1 unidade",
		measureGrams: 10
	},
	{
		id: "banana-prata-468",
		name: "Banana prata",
		category: "Frutas e Castanhas",
		kcalPer100g: 105.7,
		measure: "1 unidade",
		measureGrams: 70
	},
	{
		id: "caj-manga-469",
		name: "Cajá-manga",
		category: "Frutas e Castanhas",
		kcalPer100g: 46,
		measure: "1 unidade",
		measureGrams: 100
	},
	{
		id: "caju-470",
		name: "Caju",
		category: "Frutas e Castanhas",
		kcalPer100g: 36,
		measure: "1 unidade",
		measureGrams: 150
	},
	{
		id: "caqui-chocolate-471",
		name: "Caqui chocolate",
		category: "Frutas e Castanhas",
		kcalPer100g: 63.7,
		measure: "1 unidade",
		measureGrams: 113
	},
	{
		id: "caqui-japon-s-472",
		name: "Caqui japonês",
		category: "Frutas e Castanhas",
		kcalPer100g: 86,
		measure: "1 unidade",
		measureGrams: 100
	},
	{
		id: "carambola-473",
		name: "Carambola",
		category: "Frutas e Castanhas",
		kcalPer100g: 46.1,
		measure: "1 unidade",
		measureGrams: 128
	},
	{
		id: "castanha-474",
		name: "Castanha",
		category: "Frutas e Castanhas",
		kcalPer100g: 200,
		measure: "5 unidades",
		measureGrams: 50
	},
	{
		id: "castanha-do-par-475",
		name: "Castanha-do-pará",
		category: "Frutas e Castanhas",
		kcalPer100g: 1049,
		measure: "1 xíc. chá",
		measureGrams: 100
	},
	{
		id: "castanha-de-caju-torrada-476",
		name: "Castanha de caju torrada",
		category: "Frutas e Castanhas",
		kcalPer100g: 609.3,
		measure: "1 xíc. chá",
		measureGrams: 150
	},
	{
		id: "castanha-europ-ia-crua-477",
		name: "Castanha européia crua",
		category: "Frutas e Castanhas",
		kcalPer100g: 287,
		measure: "1 xíc. chá",
		measureGrams: 100
	},
	{
		id: "cereja-478",
		name: "Cereja",
		category: "Frutas e Castanhas",
		kcalPer100g: 157.1,
		measure: "1 unidade",
		measureGrams: 7
	},
	{
		id: "coco-ralado-fresco-479",
		name: "Coco ralado fresco",
		category: "Frutas e Castanhas",
		kcalPer100g: 250,
		measure: "1 col. sopa",
		measureGrams: 20
	},
	{
		id: "cupua-u-480",
		name: "Cupuaçu",
		category: "Frutas e Castanhas",
		kcalPer100g: 72,
		measure: "1 unidade",
		measureGrams: 100
	},
	{
		id: "damasco-seco-481",
		name: "Damasco seco",
		category: "Frutas e Castanhas",
		kcalPer100g: 128.6,
		measure: "1 unidade",
		measureGrams: 7
	},
	{
		id: "figo-482",
		name: "Figo",
		category: "Frutas e Castanhas",
		kcalPer100g: 31.7,
		measure: "1 unidade",
		measureGrams: 60
	},
	{
		id: "figo-seco-483",
		name: "Figo seco",
		category: "Frutas e Castanhas",
		kcalPer100g: 200,
		measure: "1 unidade",
		measureGrams: 30
	},
	{
		id: "framboesa-484",
		name: "Framboesa",
		category: "Frutas e Castanhas",
		kcalPer100g: 60,
		measure: "1 col. sopa",
		measureGrams: 20
	},
	{
		id: "frutas-cristalizadas-485",
		name: "Frutas cristalizadas",
		category: "Frutas e Castanhas",
		kcalPer100g: 306.7,
		measure: "1 e 1/2 xic. chá",
		measureGrams: 30
	},
	{
		id: "goiaba-branca-486",
		name: "Goiaba branca",
		category: "Frutas e Castanhas",
		kcalPer100g: 34.1,
		measure: "1 unidade",
		measureGrams: 170
	},
	{
		id: "goiaba-vermelha-487",
		name: "Goiaba vermelha",
		category: "Frutas e Castanhas",
		kcalPer100g: 27.1,
		measure: "1 unidade",
		measureGrams: 170
	},
	{
		id: "grapefruit-488",
		name: "Grapefruit",
		category: "Frutas e Castanhas",
		kcalPer100g: 47,
		measure: "1 unidade",
		measureGrams: 200
	},
	{
		id: "graviola-489",
		name: "Graviola",
		category: "Frutas e Castanhas",
		kcalPer100g: 60,
		measure: "1 unidade",
		measureGrams: 100
	},
	{
		id: "jabuticaba-490",
		name: "Jabuticaba",
		category: "Frutas e Castanhas",
		kcalPer100g: 35,
		measure: "10 unidades",
		measureGrams: 40
	},
	{
		id: "jaca-491",
		name: "Jaca",
		category: "Frutas e Castanhas",
		kcalPer100g: 90,
		measure: "1 gomo",
		measureGrams: 10
	},
	{
		id: "kiwi-492",
		name: "Kiwi",
		category: "Frutas e Castanhas",
		kcalPer100g: 57.1,
		measure: "1 unidade",
		measureGrams: 77
	},
	{
		id: "laranja-lima-493",
		name: "Laranja lima",
		category: "Frutas e Castanhas",
		kcalPer100g: 34.9,
		measure: "1 unidade",
		measureGrams: 109
	},
	{
		id: "laranja-pera-494",
		name: "Laranja pera",
		category: "Frutas e Castanhas",
		kcalPer100g: 30.7,
		measure: "1 unidade",
		measureGrams: 137
	},
	{
		id: "laranjinha-japonesa-495",
		name: "Laranjinha-japonesa",
		category: "Frutas e Castanhas",
		kcalPer100g: 48,
		measure: "5 unidades",
		measureGrams: 100
	},
	{
		id: "lima-da-p-rsia-496",
		name: "Lima-da-pérsia",
		category: "Frutas e Castanhas",
		kcalPer100g: 32,
		measure: "1 unidade",
		measureGrams: 100
	},
	{
		id: "lim-o-497",
		name: "Limão",
		category: "Frutas e Castanhas",
		kcalPer100g: 31.7,
		measure: "1 unidade",
		measureGrams: 60
	},
	{
		id: "manga-desidratada-fruitwell-498",
		name: "Manga desidratada “Fruitwell”",
		category: "Frutas e Castanhas",
		kcalPer100g: 352.5,
		measure: "1 pacote",
		measureGrams: 40
	},
	{
		id: "ma-desidratada-jasmine-499",
		name: "Maçã desidratada “Jasmine”",
		category: "Frutas e Castanhas",
		kcalPer100g: 320,
		measure: "1 pacote",
		measureGrams: 40
	},
	{
		id: "ma-fugi-500",
		name: "Maçã fugi",
		category: "Frutas e Castanhas",
		kcalPer100g: 60,
		measure: "1 unidade",
		measureGrams: 130
	},
	{
		id: "mam-o-formosa-501",
		name: "Mamão formosa",
		category: "Frutas e Castanhas",
		kcalPer100g: 45,
		measure: "1 fatia",
		measureGrams: 100
	},
	{
		id: "mam-o-papaia-502",
		name: "Mamão papaia",
		category: "Frutas e Castanhas",
		kcalPer100g: 35,
		measure: "1 unidade",
		measureGrams: 283
	},
	{
		id: "manga-503",
		name: "Manga",
		category: "Frutas e Castanhas",
		kcalPer100g: 60,
		measure: "1 xíc. chá",
		measureGrams: 240
	},
	{
		id: "maracuj-504",
		name: "Maracujá",
		category: "Frutas e Castanhas",
		kcalPer100g: 65.8,
		measure: "1 unidade",
		measureGrams: 38
	},
	{
		id: "melancia-505",
		name: "Melancia",
		category: "Frutas e Castanhas",
		kcalPer100g: 22.3,
		measure: "1 fatia",
		measureGrams: 148
	},
	{
		id: "mel-o-506",
		name: "Melão",
		category: "Frutas e Castanhas",
		kcalPer100g: 24.3,
		measure: "1 fatia",
		measureGrams: 115
	},
	{
		id: "morango-507",
		name: "Morango",
		category: "Frutas e Castanhas",
		kcalPer100g: 30,
		measure: "10 unidades",
		measureGrams: 120
	},
	{
		id: "nectarina-508",
		name: "Nectarina",
		category: "Frutas e Castanhas",
		kcalPer100g: 64,
		measure: "1 unidade",
		measureGrams: 100
	},
	{
		id: "n-spera-509",
		name: "Nêspera",
		category: "Frutas e Castanhas",
		kcalPer100g: 43.3,
		measure: "1 unidade",
		measureGrams: 60
	},
	{
		id: "nozes-510",
		name: "Nozes",
		category: "Frutas e Castanhas",
		kcalPer100g: 710,
		measure: "1 unidade",
		measureGrams: 10
	},
	{
		id: "nozes-pecan-511",
		name: "Nozes pecan",
		category: "Frutas e Castanhas",
		kcalPer100g: 400,
		measure: "1/2 xíc. chá",
		measureGrams: 50
	},
	{
		id: "pera-512",
		name: "Pera",
		category: "Frutas e Castanhas",
		kcalPer100g: 42.1,
		measure: "1 unidade",
		measureGrams: 133
	},
	{
		id: "pequi-513",
		name: "Pequi",
		category: "Frutas e Castanhas",
		kcalPer100g: 80,
		measure: "1 unidade",
		measureGrams: 50
	},
	{
		id: "p-ssego-514",
		name: "Pêssego",
		category: "Frutas e Castanhas",
		kcalPer100g: 40.7,
		measure: "1 unidade",
		measureGrams: 113
	},
	{
		id: "pinha-fruta-do-conde-515",
		name: "Pinha (fruta do conde)",
		category: "Frutas e Castanhas",
		kcalPer100g: 88.3,
		measure: "1 unidade",
		measureGrams: 60
	},
	{
		id: "pitanga-516",
		name: "Pitanga",
		category: "Frutas e Castanhas",
		kcalPer100g: 47,
		measure: "10 unidades",
		measureGrams: 100
	},
	{
		id: "rom-517",
		name: "Romã",
		category: "Frutas e Castanhas",
		kcalPer100g: 62,
		measure: "1 unidade",
		measureGrams: 100
	},
	{
		id: "salada-de-frutas-518",
		name: "Salada de frutas",
		category: "Frutas e Castanhas",
		kcalPer100g: 99,
		measure: "1 taça",
		measureGrams: 100
	},
	{
		id: "sementes-de-ab-bora-torradas-519",
		name: "Sementes de abóbora torradas",
		category: "Frutas e Castanhas",
		kcalPer100g: 433.3,
		measure: "2 c. sopa",
		measureGrams: 30
	},
	{
		id: "sementes-de-gergelim-secas-520",
		name: "Sementes de gergelim secas",
		category: "Frutas e Castanhas",
		kcalPer100g: 590,
		measure: "1 col. sopa",
		measureGrams: 10
	},
	{
		id: "t-mara-seca-521",
		name: "Tâmara seca",
		category: "Frutas e Castanhas",
		kcalPer100g: 253.3,
		measure: "1 unidade",
		measureGrams: 30
	},
	{
		id: "tamarindo-polpa-522",
		name: "Tamarindo (polpa)",
		category: "Frutas e Castanhas",
		kcalPer100g: 232,
		measure: "1/2 xíc. chá",
		measureGrams: 100
	},
	{
		id: "tangerina-523",
		name: "Tangerina",
		category: "Frutas e Castanhas",
		kcalPer100g: 53.3,
		measure: "1 unidade",
		measureGrams: 135
	},
	{
		id: "uva-it-lia-524",
		name: "Uva itália",
		category: "Frutas e Castanhas",
		kcalPer100g: 79,
		measure: "1 cacho médio",
		measureGrams: 200
	},
	{
		id: "uva-passa-525",
		name: "Uva passa",
		category: "Frutas e Castanhas",
		kcalPer100g: 300,
		measure: "1 col. sopa cheia",
		measureGrams: 18
	},
	{
		id: "uva-rubi-526",
		name: "Uva rubi",
		category: "Frutas e Castanhas",
		kcalPer100g: 46.1,
		measure: "1 cacho grande",
		measureGrams: 371
	},
	{
		id: "ervilha-em-conserva-jurema-527",
		name: "Ervilha em conserva “Jurema”",
		category: "Leguminosas",
		kcalPer100g: 83.8,
		measure: "1 xíc. chá",
		measureGrams: 130
	},
	{
		id: "fava-em-conserva-zenny-528",
		name: "Fava em conserva “Zenny”",
		category: "Leguminosas",
		kcalPer100g: 104,
		measure: "1 xíc. chá",
		measureGrams: 125
	},
	{
		id: "feij-o-branco-cozido-529",
		name: "Feijão branco cozido",
		category: "Leguminosas",
		kcalPer100g: 121.5,
		measure: "1 concha peq.",
		measureGrams: 65
	},
	{
		id: "feij-o-branco-em-conserva-jurema-530",
		name: "Feijão branco em conserva “Jurema”",
		category: "Leguminosas",
		kcalPer100g: 80.8,
		measure: "1 xíc. chá",
		measureGrams: 130
	},
	{
		id: "feij-o-carioca-cozido-531",
		name: "Feijão carioca cozido",
		category: "Leguminosas",
		kcalPer100g: 69.5,
		measure: "1 concha peq.",
		measureGrams: 59
	},
	{
		id: "feij-o-mulatinho-cozido-532",
		name: "Feijão mulatinho cozido",
		category: "Leguminosas",
		kcalPer100g: 123.7,
		measure: "1 concha peq.",
		measureGrams: 59
	},
	{
		id: "feij-o-preto-cozido-533",
		name: "Feijão preto cozido",
		category: "Leguminosas",
		kcalPer100g: 116.9,
		measure: "1 concha peq.",
		measureGrams: 59
	},
	{
		id: "gr-o-de-bico-cozido-534",
		name: "Grão de bico cozido",
		category: "Leguminosas",
		kcalPer100g: 136.7,
		measure: "1 concha peq.",
		measureGrams: 60
	},
	{
		id: "gr-o-de-bico-em-conserva-casino-535",
		name: "Grão-de-bico em conserva “Casino”",
		category: "Leguminosas",
		kcalPer100g: 118.5,
		measure: "1 xíc. chá",
		measureGrams: 130
	},
	{
		id: "lentilha-cozida-536",
		name: "Lentilha cozida",
		category: "Leguminosas",
		kcalPer100g: 108.3,
		measure: "1 concha peq.",
		measureGrams: 60
	},
	{
		id: "tremo-o-537",
		name: "Tremoço",
		category: "Leguminosas",
		kcalPer100g: 76.9,
		measure: "1 xíc. chá",
		measureGrams: 65
	},
	{
		id: "ab-bora-cozida-538",
		name: "Abóbora cozida",
		category: "Verduras e Legumes",
		kcalPer100g: 40,
		measure: "4 col. sopa",
		measureGrams: 100
	},
	{
		id: "ab-bora-moranga-cozida-539",
		name: "Abóbora moranga cozida",
		category: "Verduras e Legumes",
		kcalPer100g: 50,
		measure: "1 pedaço médio",
		measureGrams: 20
	},
	{
		id: "abobrinha-cozida-540",
		name: "Abobrinha cozida",
		category: "Verduras e Legumes",
		kcalPer100g: 10.8,
		measure: "1 xíc. chá picada",
		measureGrams: 166
	},
	{
		id: "acelga-cozida-541",
		name: "Acelga cozida",
		category: "Verduras e Legumes",
		kcalPer100g: 11.2,
		measure: "1 xíc. chá",
		measureGrams: 206
	},
	{
		id: "agri-o-542",
		name: "Agrião",
		category: "Verduras e Legumes",
		kcalPer100g: 23.8,
		measure: "1 xíc. chá",
		measureGrams: 42
	},
	{
		id: "alcachofra-em-conserva-543",
		name: "Alcachofra em conserva",
		category: "Verduras e Legumes",
		kcalPer100g: 16,
		measure: "1/4 xíc. chá picado",
		measureGrams: 50
	},
	{
		id: "alface-544",
		name: "Alface",
		category: "Verduras e Legumes",
		kcalPer100g: 12.5,
		measure: "1 folha",
		measureGrams: 8
	},
	{
		id: "alfafa-545",
		name: "Alfafa",
		category: "Verduras e Legumes",
		kcalPer100g: 76,
		measure: "1 xíc. de chá",
		measureGrams: 50
	},
	{
		id: "alho-por-546",
		name: "Alho-poró",
		category: "Verduras e Legumes",
		kcalPer100g: 30,
		measure: "1 xíc. de chá",
		measureGrams: 100
	},
	{
		id: "almeir-o-50g-547",
		name: "Almeirão (50g)",
		category: "Verduras e Legumes",
		kcalPer100g: 28,
		measure: "1 pires de chá",
		measureGrams: 50
	},
	{
		id: "aspargo-em-conserva-548",
		name: "Aspargo em conserva",
		category: "Verduras e Legumes",
		kcalPer100g: 10,
		measure: "1 unidade",
		measureGrams: 10
	},
	{
		id: "azeitona-549",
		name: "Azeitona",
		category: "Verduras e Legumes",
		kcalPer100g: 133.3,
		measure: "1 unidade",
		measureGrams: 3
	},
	{
		id: "batata-doce-cozida-550",
		name: "Batata doce cozida",
		category: "Verduras e Legumes",
		kcalPer100g: 115,
		measure: "1 xíc. chá picada",
		measureGrams: 200
	},
	{
		id: "batata-cozida-551",
		name: "Batata cozida",
		category: "Verduras e Legumes",
		kcalPer100g: 50.7,
		measure: "1 unidade",
		measureGrams: 140
	},
	{
		id: "batata-frita-552",
		name: "Batata frita",
		category: "Verduras e Legumes",
		kcalPer100g: 267,
		measure: "1 escumadeira",
		measureGrams: 100
	},
	{
		id: "berinjela-cozida-553",
		name: "Berinjela cozida",
		category: "Verduras e Legumes",
		kcalPer100g: 20.9,
		measure: "1 xíc. chá picada",
		measureGrams: 206
	},
	{
		id: "berinjela-italiana-554",
		name: "Berinjela italiana",
		category: "Verduras e Legumes",
		kcalPer100g: 522.5,
		measure: "4 col. sopa",
		measureGrams: 40
	},
	{
		id: "bardana-555",
		name: "Bardana",
		category: "Verduras e Legumes",
		kcalPer100g: 90,
		measure: "1 pires de chá",
		measureGrams: 100
	},
	{
		id: "beterraba-cozida-556",
		name: "Beterraba cozida",
		category: "Verduras e Legumes",
		kcalPer100g: 44,
		measure: "1 unidade média",
		measureGrams: 125
	},
	{
		id: "beterraba-crua-557",
		name: "Beterraba crua",
		category: "Verduras e Legumes",
		kcalPer100g: 46.4,
		measure: "1 unidade média",
		measureGrams: 140
	},
	{
		id: "br-colis-cozido-558",
		name: "Brócolis cozido",
		category: "Verduras e Legumes",
		kcalPer100g: 24.3,
		measure: "1 xíc. chá picado",
		measureGrams: 107
	},
	{
		id: "broto-de-bambu-559",
		name: "Broto de bambu",
		category: "Verduras e Legumes",
		kcalPer100g: 24.3,
		measure: "1 xíc. chá",
		measureGrams: 70
	},
	{
		id: "broto-de-feij-o-560",
		name: "Broto de feijão",
		category: "Verduras e Legumes",
		kcalPer100g: 62.9,
		measure: "1 xíc. chá",
		measureGrams: 70
	},
	{
		id: "car-cozido-561",
		name: "Cará cozido",
		category: "Verduras e Legumes",
		kcalPer100g: 120,
		measure: "2 unidades",
		measureGrams: 100
	},
	{
		id: "cebola-cozida-562",
		name: "Cebola cozida",
		category: "Verduras e Legumes",
		kcalPer100g: 41,
		measure: "1 unidade",
		measureGrams: 100
	},
	{
		id: "cebolinha-em-conserva-563",
		name: "Cebolinha em conserva",
		category: "Verduras e Legumes",
		kcalPer100g: 36,
		measure: "1/2 xíc. chá",
		measureGrams: 50
	},
	{
		id: "cenoura-cozida-564",
		name: "Cenoura cozida",
		category: "Verduras e Legumes",
		kcalPer100g: 54,
		measure: "1 unidade média",
		measureGrams: 100
	},
	{
		id: "cenoura-crua-565",
		name: "Cenoura crua",
		category: "Verduras e Legumes",
		kcalPer100g: 45,
		measure: "1 unidade média",
		measureGrams: 120
	},
	{
		id: "chuchu-cozido-566",
		name: "Chuchu cozido",
		category: "Verduras e Legumes",
		kcalPer100g: 18.7,
		measure: "1 xíc. chá picado",
		measureGrams: 155
	},
	{
		id: "cogumelo-em-conserva-567",
		name: "Cogumelo em conserva",
		category: "Verduras e Legumes",
		kcalPer100g: 24.3,
		measure: "1 xíc. chá",
		measureGrams: 107
	},
	{
		id: "couve-manteiga-refogada-568",
		name: "Couve manteiga refogada",
		category: "Verduras e Legumes",
		kcalPer100g: 65.9,
		measure: "1 prato fundo",
		measureGrams: 88
	},
	{
		id: "couve-flor-cozida-569",
		name: "Couve-flor cozida",
		category: "Verduras e Legumes",
		kcalPer100g: 14,
		measure: "1 xíc. chá picada",
		measureGrams: 136
	},
	{
		id: "espinafre-refogado-570",
		name: "Espinafre refogado",
		category: "Verduras e Legumes",
		kcalPer100g: 14.1,
		measure: "1 xíc. chá picado",
		measureGrams: 205
	},
	{
		id: "mandioca-cozida-571",
		name: "Mandioca cozida",
		category: "Verduras e Legumes",
		kcalPer100g: 114,
		measure: "1 pedaço médio",
		measureGrams: 50
	},
	{
		id: "mandioquinha-cozida-572",
		name: "Mandioquinha cozida",
		category: "Verduras e Legumes",
		kcalPer100g: 62.6,
		measure: "1 unidade",
		measureGrams: 115
	},
	{
		id: "nabo-573",
		name: "Nabo",
		category: "Verduras e Legumes",
		kcalPer100g: 9.9,
		measure: "1 xíc. chá picado",
		measureGrams: 142
	},
	{
		id: "palmito-em-conserva-574",
		name: "Palmito em conserva",
		category: "Verduras e Legumes",
		kcalPer100g: 28,
		measure: "1/4 xíc. chá picado",
		measureGrams: 50
	},
	{
		id: "pepino-relish-575",
		name: "Pepino (relish)",
		category: "Verduras e Legumes",
		kcalPer100g: 126.7,
		measure: "1 1/2 col. sopa",
		measureGrams: 15
	},
	{
		id: "pepino-japon-s-576",
		name: "Pepino japonês",
		category: "Verduras e Legumes",
		kcalPer100g: 12.3,
		measure: "1 unidade",
		measureGrams: 130
	},
	{
		id: "picles-577",
		name: "Picles",
		category: "Verduras e Legumes",
		kcalPer100g: 40,
		measure: "1 col. sopa",
		measureGrams: 15
	},
	{
		id: "piment-o-amarelo-578",
		name: "Pimentão amarelo",
		category: "Verduras e Legumes",
		kcalPer100g: 25,
		measure: "1 col. sopa picado",
		measureGrams: 24
	},
	{
		id: "quiabo-refogado-579",
		name: "Quiabo refogado",
		category: "Verduras e Legumes",
		kcalPer100g: 13.3,
		measure: "1 unidade",
		measureGrams: 15
	},
	{
		id: "rabanete-580",
		name: "Rabanete",
		category: "Verduras e Legumes",
		kcalPer100g: 13.3,
		measure: "1 unidade",
		measureGrams: 30
	},
	{
		id: "repolho-branco-581",
		name: "Repolho branco",
		category: "Verduras e Legumes",
		kcalPer100g: 13.8,
		measure: "1 xíc. chá picado",
		measureGrams: 94
	},
	{
		id: "repolho-roxo-582",
		name: "Repolho roxo",
		category: "Verduras e Legumes",
		kcalPer100g: 6.5,
		measure: "1 xíc. chá",
		measureGrams: 77
	},
	{
		id: "r-cula-583",
		name: "Rúcula",
		category: "Verduras e Legumes",
		kcalPer100g: 14,
		measure: "1 prato fundo",
		measureGrams: 50
	},
	{
		id: "seleta-de-legumes-enlatada-584",
		name: "Seleta de legumes enlatada",
		category: "Verduras e Legumes",
		kcalPer100g: 60,
		measure: "1 xíc. chá",
		measureGrams: 130
	},
	{
		id: "salada-de-maionese-e-batata-585",
		name: "Salada de maionese e batata",
		category: "Verduras e Legumes",
		kcalPer100g: 152.6,
		measure: "5 colheres de sopa",
		measureGrams: 190
	},
	{
		id: "tomate-586",
		name: "Tomate",
		category: "Verduras e Legumes",
		kcalPer100g: 14.7,
		measure: "1 unidade",
		measureGrams: 109
	},
	{
		id: "tomate-seco-587",
		name: "Tomate seco",
		category: "Verduras e Legumes",
		kcalPer100g: 336.7,
		measure: "2 col. sopa",
		measureGrams: 30
	},
	{
		id: "vagem-588",
		name: "Vagem",
		category: "Verduras e Legumes",
		kcalPer100g: 17.9,
		measure: "1 xíc. chá",
		measureGrams: 140
	},
	{
		id: "a-car-mascavo-589",
		name: "Açúcar mascavo",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 360,
		measure: "1 col. sopa rasa",
		measureGrams: 15
	},
	{
		id: "a-car-refinado-590",
		name: "Açúcar refinado",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 400,
		measure: "1 col. sopa rasa",
		measureGrams: 15
	},
	{
		id: "algod-o-doce-591",
		name: "Algodão doce",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 333.3,
		measure: "1 unidade",
		measureGrams: 30
	},
	{
		id: "ambrosia-592",
		name: "Ambrosia",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 260,
		measure: "1 col. sopa",
		measureGrams: 20
	},
	{
		id: "ameixa-em-calda-cep-ra-593",
		name: "Ameixa em calda “Cepêra”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 220,
		measure: "3 unidades",
		measureGrams: 20
	},
	{
		id: "amendoa-confeitada-estrela-do-oriente-594",
		name: "Amendoa confeitada “Estrela do Oriente”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 466.7,
		measure: "1 col. sopa",
		measureGrams: 12
	},
	{
		id: "arroz-doce-595",
		name: "Arroz-doce",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 165,
		measure: "1 col. sopa",
		measureGrams: 40
	},
	{
		id: "baba-de-mo-a-596",
		name: "Baba de moça",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 500,
		measure: "1 col. sopa",
		measureGrams: 12
	},
	{
		id: "bananada-fazendinha-597",
		name: "Bananada “Fazendinha”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 311.1,
		measure: "1 unidade",
		measureGrams: 36
	},
	{
		id: "barra-de-biscoito-com-recheio-de-banana-bauducco-598",
		name: "Barra de biscoito com recheio de banana “Bauducco”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 380,
		measure: "1 unidade",
		measureGrams: 25
	},
	{
		id: "barra-de-biscoito-com-recheio-de-chocolate-baudu-599",
		name: "Barra de biscoito com recheio de chocolate “Bauducco”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 360,
		measure: "1 unidade",
		measureGrams: 25
	},
	{
		id: "barra-de-biscoito-com-recheio-de-goiaba-bauducco-600",
		name: "Barra de biscoito com recheio de goiaba “Bauducco”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 360,
		measure: "1 unidade",
		measureGrams: 25
	},
	{
		id: "beijinho-nestl-601",
		name: "Beijinho “Nestlé”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 320,
		measure: "1 col. sopa",
		measureGrams: 20
	},
	{
		id: "bolacha-de-chocolate-602",
		name: "Bolacha de chocolate",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 520,
		measure: "1 unidade",
		measureGrams: 10
	},
	{
		id: "bolacha-recheada-603",
		name: "Bolacha recheada",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 666.7,
		measure: "1 unidade",
		measureGrams: 12
	},
	{
		id: "bolo-de-aipim-com-coco-604",
		name: "Bolo de aipim com coco",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 303.8,
		measure: "1 fatia média",
		measureGrams: 80
	},
	{
		id: "bolo-de-cenoura-sem-cobertura-605",
		name: "Bolo de cenoura sem cobertura",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 378.3,
		measure: "1 fatia média",
		measureGrams: 60
	},
	{
		id: "bolo-de-chocolate-pullman-606",
		name: "Bolo de chocolate “Pullman”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 315,
		measure: "1 fatia (porção)",
		measureGrams: 60
	},
	{
		id: "bolo-de-chocolate-com-recheio-e-calda-de-chocola-607",
		name: "Bolo de chocolate com recheio e calda de chocolate",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 385.7,
		measure: "1 fatia média",
		measureGrams: 140
	},
	{
		id: "bolo-de-coco-nutrella-608",
		name: "Bolo de coco “Nutrella”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 358.3,
		measure: "1 fatia (porção)",
		measureGrams: 60
	},
	{
		id: "bolo-de-fub-nutrella-609",
		name: "Bolo de fubá “Nutrella”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 345,
		measure: "1 fatia (porção)",
		measureGrams: 60
	},
	{
		id: "bolo-de-milho-610",
		name: "Bolo de milho",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 290,
		measure: "1 fatia",
		measureGrams: 100
	},
	{
		id: "bomba-com-recheio-de-creme-611",
		name: "Bomba com recheio de creme",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 416.7,
		measure: "1 unidade",
		measureGrams: 120
	},
	{
		id: "bomba-de-chocolate-612",
		name: "Bomba de chocolate",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 194,
		measure: "1 unidade média",
		measureGrams: 50
	},
	{
		id: "brigadeir-o-613",
		name: "Brigadeirão",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 390,
		measure: "1 fatia",
		measureGrams: 50
	},
	{
		id: "brigadeiro-614",
		name: "Brigadeiro",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 500,
		measure: "1 unidade",
		measureGrams: 20
	},
	{
		id: "brigadeiro-nestl-615",
		name: "Brigadeiro “Nestlé”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 305,
		measure: "1 col. sopa",
		measureGrams: 20
	},
	{
		id: "brownie-hel-doces-616",
		name: "Brownie “Helô Doces”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 430,
		measure: "1 fatia (porção)",
		measureGrams: 40
	},
	{
		id: "cacau-em-p-garoto-617",
		name: "Cacau em pó “Garoto”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 405,
		measure: "2 col. sopa",
		measureGrams: 20
	},
	{
		id: "cajuzinho-nestl-618",
		name: "Cajuzinho “Nestlé”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 345,
		measure: "1 col. sopa",
		measureGrams: 20
	},
	{
		id: "calda-de-caramelo-ingredient-619",
		name: "Calda de caramelo “Ingredient”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 305,
		measure: "1 e 1/2 col. sopa",
		measureGrams: 20
	},
	{
		id: "calda-de-chocolate-bazzar-620",
		name: "Calda de chocolate “Bazzar”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 305,
		measure: "1 e 1/2 col. sopa",
		measureGrams: 20
	},
	{
		id: "calda-de-morango-ingredient-621",
		name: "Calda de morango “Ingredient”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 295,
		measure: "1 e 1/2 col. sopa",
		measureGrams: 20
	},
	{
		id: "canjica-622",
		name: "Canjica",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 136.7,
		measure: "1 xíc. chá",
		measureGrams: 150
	},
	{
		id: "cereja-em-calda-qualit-623",
		name: "Cereja em calda “Qualitá”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 253.3,
		measure: "1 col. sopa",
		measureGrams: 30
	},
	{
		id: "chantilly-caseiro-624",
		name: "Chantilly caseiro",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 445,
		measure: "1 col. sopa",
		measureGrams: 20
	},
	{
		id: "chantily-vigor-625",
		name: "Chantily “Vigor”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 280,
		measure: "1 col. sopa",
		measureGrams: 20
	},
	{
		id: "chocotone-626",
		name: "Chocotone",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 402.5,
		measure: "1 fatia grande",
		measureGrams: 80
	},
	{
		id: "chocottone-baducco-627",
		name: "Chocottone Baducco",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 442.5,
		measure: "1 fatia grande",
		measureGrams: 80
	},
	{
		id: "chocotone-classic-nestl-628",
		name: "Chocotone Classic Nestlé",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 407.5,
		measure: "1 fatia grande",
		measureGrams: 80
	},
	{
		id: "chocotone-exagero-de-chocolate-village-629",
		name: "Chocotone Exagero de Chocolate Village",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 392.5,
		measure: "1 fatia grande",
		measureGrams: 80
	},
	{
		id: "chocotone-top-chocolate-visconti-630",
		name: "Chocotone Top Chocolate Visconti",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 455,
		measure: "1 fatia grande",
		measureGrams: 80
	},
	{
		id: "churros-de-doce-de-leite-631",
		name: "Churros de doce de leite",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 570,
		measure: "1 unidade",
		measureGrams: 100
	},
	{
		id: "cocada-632",
		name: "Cocada",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 578.6,
		measure: "1 unidade média",
		measureGrams: 70
	},
	{
		id: "creme-de-abacate-633",
		name: "Creme de abacate",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 173.3,
		measure: "1 taça",
		measureGrams: 90
	},
	{
		id: "creme-de-amendoim-amendocrem-634",
		name: "Creme de amendoim “Amendocrem”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 605,
		measure: "1 col. sopa",
		measureGrams: 20
	},
	{
		id: "creme-de-avel-nutella-635",
		name: "Creme de avelã “Nutella”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 525,
		measure: "1 col. sopa",
		measureGrams: 20
	},
	{
		id: "curau-yoki-636",
		name: "Curau “Yoki”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 380,
		measure: "1 xic. chá",
		measureGrams: 80
	},
	{
		id: "doce-de-ab-bora-nh-tuca-637",
		name: "Doce de abóbora “Nhá Tuca”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 245.7,
		measure: "1 pedaço médio",
		measureGrams: 70
	},
	{
		id: "doce-de-leite-caseiro-638",
		name: "Doce de leite caseiro",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 290,
		measure: "1 col. sopa",
		measureGrams: 50
	},
	{
		id: "donuts-de-doce-de-leite-melhor-bocado-639",
		name: "Donuts de doce de leite “Melhor Bocado”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 187.1,
		measure: "1 unidade",
		measureGrams: 70
	},
	{
		id: "farofa-doce-640",
		name: "Farofa doce",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 495,
		measure: "1/2 col. sopa",
		measureGrams: 20
	},
	{
		id: "figo-em-calda-helomar-641",
		name: "Figo em calda “Helomar”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 188.8,
		measure: "4 unidades",
		measureGrams: 80
	},
	{
		id: "fios-de-ovos-prazeres-do-a-car-642",
		name: "Fios de ovos “Prazeres do açúcar”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 370.4,
		measure: "2 col. sopa",
		measureGrams: 27
	},
	{
		id: "flan-de-baunilha-oetker-643",
		name: "Flan de baunilha “Oetker””",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 42.5,
		measure: "1 taça (porção)",
		measureGrams: 120
	},
	{
		id: "fondue-de-chocolate-la-table-d-or-644",
		name: "Fondue de chocolate “La Table D’or”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 275,
		measure: "1 col. sopa",
		measureGrams: 20
	},
	{
		id: "gelatina-de-morango-oetker-645",
		name: "Gelatina de morango “Oetker”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 32.5,
		measure: "1 taça (porção)",
		measureGrams: 120
	},
	{
		id: "gel-ia-de-morango-ritter-646",
		name: "Geléia de morango “Ritter”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 245,
		measure: "1 col. sopa",
		measureGrams: 20
	},
	{
		id: "gel-ia-de-morango-diet-queensberry-647",
		name: "Geléia de morango diet “Queensberry”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 110,
		measure: "1 col. sopa",
		measureGrams: 20
	},
	{
		id: "goiabada-casc-o-648",
		name: "Goiabada cascão",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 330,
		measure: "1 fatia",
		measureGrams: 40
	},
	{
		id: "leite-condensado-nestl-649",
		name: "Leite condensado “Nestlé”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 325,
		measure: "1 col. sopa",
		measureGrams: 20
	},
	{
		id: "ma-do-amor-650",
		name: "Maçã do amor",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 308,
		measure: "1 unidade",
		measureGrams: 150
	},
	{
		id: "manjar-de-coco-c-calda-de-ameixa-ducoco-651",
		name: "Manjar de coco c/ calda de ameixa “Ducoco”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 356,
		measure: "1 fatia",
		measureGrams: 50
	},
	{
		id: "maria-mole-oetker-652",
		name: "Maria-mole “Oetker”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 45.8,
		measure: "1 pedaço (porção)",
		measureGrams: 120
	},
	{
		id: "marrom-glac-fugini-653",
		name: "Marrom glacê “Fugini”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 260,
		measure: "1 fatia",
		measureGrams: 40
	},
	{
		id: "marshmellow-ingredient-654",
		name: "Marshmellow “Ingredient”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 285,
		measure: "1/2 col. sopa",
		measureGrams: 20
	},
	{
		id: "marzip-zentis-655",
		name: "Marzipã “Zentis”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 436,
		measure: "1 unidade peq.",
		measureGrams: 25
	},
	{
		id: "mel-de-abelhas-656",
		name: "Mel de abelhas",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 320,
		measure: "1 col. sopa",
		measureGrams: 20
	},
	{
		id: "merengue-de-lim-o-657",
		name: "Merengue de limão",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 255,
		measure: "1 fatia fina",
		measureGrams: 100
	},
	{
		id: "mil-folhas-658",
		name: "Mil-folhas",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 117,
		measure: "1 fatia",
		measureGrams: 100
	},
	{
		id: "mousse-chocolate-659",
		name: "Mousse chocolate",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 200,
		measure: "1 taça",
		measureGrams: 150
	},
	{
		id: "mousse-de-maracuj-660",
		name: "Mousse de maracujá",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 236.7,
		measure: "1 col. sopa",
		measureGrams: 30
	},
	{
		id: "muffin-oetker-661",
		name: "Muffin “Oetker”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 246.7,
		measure: "1 unidade",
		measureGrams: 30
	},
	{
		id: "olho-de-sogra-662",
		name: "Olho-de-sogra",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 300,
		measure: "1 unidade",
		measureGrams: 20
	},
	{
		id: "ovos-nevados-663",
		name: "Ovos nevados",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 245,
		measure: "2 col. sopa",
		measureGrams: 100
	},
	{
		id: "pa-oca-de-rolha-yoki-664",
		name: "Paçoca (de rolha) “Yoki”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 486.4,
		measure: "1 unidade",
		measureGrams: 22
	},
	{
		id: "pamonha-665",
		name: "Pamonha",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 258.1,
		measure: "1 unidade",
		measureGrams: 160
	},
	{
		id: "panetone-666",
		name: "Panetone",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 377.5,
		measure: "1 fatia grande",
		measureGrams: 80
	},
	{
		id: "panettone-alpino-nestle-667",
		name: "Panettone Alpino Nestle",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 417.5,
		measure: "1 fatia grande",
		measureGrams: 80
	},
	{
		id: "panettone-com-damasco-e-uva-passa-village-668",
		name: "Panettone com Damasco e Uva Passa Village",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 365,
		measure: "1 fatia grande",
		measureGrams: 80
	},
	{
		id: "panettone-com-frutas-bauducco-669",
		name: "Panettone com Frutas Bauducco",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 350,
		measure: "1 fatia grande",
		measureGrams: 80
	},
	{
		id: "panettone-com-frutas-light-bauducco-670",
		name: "Panettone com Frutas Light Bauducco",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 288.8,
		measure: "1 fatia grande",
		measureGrams: 80
	},
	{
		id: "panettone-com-frutas-nestle-671",
		name: "Panettone com Frutas Nestle",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 355,
		measure: "1 fatia grande",
		measureGrams: 80
	},
	{
		id: "panettone-com-frutas-pullman-672",
		name: "Panettone com Frutas Pullman",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 358.8,
		measure: "1 fatia grande",
		measureGrams: 80
	},
	{
		id: "panettone-com-frutas-village-673",
		name: "Panettone com Frutas Village",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 361.2,
		measure: "1 fatia grande",
		measureGrams: 80
	},
	{
		id: "panettone-light-com-frutas-village-674",
		name: "Panettone Light com Frutas Village",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 268.8,
		measure: "1 fatia grande",
		measureGrams: 80
	},
	{
		id: "pastel-de-santa-clara-675",
		name: "Pastel de Santa Clara",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 178.8,
		measure: "1 unidade",
		measureGrams: 80
	},
	{
		id: "pav-de-amendoim-676",
		name: "Pavê de amendoim",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 437.3,
		measure: "1 pedaço médio",
		measureGrams: 110
	},
	{
		id: "pav-de-chocolate-677",
		name: "Pavê de chocolate",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 181.2,
		measure: "1 pedaço médio",
		measureGrams: 85
	},
	{
		id: "p-de-moleque-678",
		name: "Pé-de- moleque",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 511.8,
		measure: "1 unidade peq.",
		measureGrams: 17
	},
	{
		id: "p-ssego-em-calda-qualit-679",
		name: "Pêssego em calda “Qualitá”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 70.7,
		measure: "3 unidades",
		measureGrams: 140
	},
	{
		id: "petit-gateau-mr-bey-680",
		name: "Petit Gateau “Mr Bey”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 432,
		measure: "1 unidade",
		measureGrams: 50
	},
	{
		id: "picol-chicabon-681",
		name: "Picolé “Chicabon”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 164.5,
		measure: "1 unidade",
		measureGrams: 62
	},
	{
		id: "picole-de-coco-kibon-682",
		name: "Picole de coco “Kibon”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 146.7,
		measure: "1 unidade",
		measureGrams: 60
	},
	{
		id: "picol-de-uva-kibon-683",
		name: "Picolé de uva “Kibon”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 101.7,
		measure: "1 unidade",
		measureGrams: 59
	},
	{
		id: "pudim-de-leite-com-calda-de-caramelo-684",
		name: "Pudim de leite com calda de caramelo",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 323,
		measure: "1 fatia média",
		measureGrams: 100
	},
	{
		id: "queijadinha-caseira-685",
		name: "Queijadinha caseira",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 588.6,
		measure: "1 unidade média",
		measureGrams: 35
	},
	{
		id: "quindim-686",
		name: "Quindim",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 395.8,
		measure: "1 unidade",
		measureGrams: 120
	},
	{
		id: "quindim-miss-daisy-687",
		name: "Quindim “Miss Daisy”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 405,
		measure: "1 fatia (porção)",
		measureGrams: 60
	},
	{
		id: "rabanada-688",
		name: "Rabanada",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 500,
		measure: "1 fatia",
		measureGrams: 60
	},
	{
		id: "rapadura-689",
		name: "Rapadura",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 370.9,
		measure: "1 pedaço médio",
		measureGrams: 55
	},
	{
		id: "salada-de-frutas-com-a-car-690",
		name: "Salada de frutas com açúcar",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 219.3,
		measure: "1 taça",
		measureGrams: 150
	},
	{
		id: "salada-de-frutas-com-chantilly-691",
		name: "Salada de frutas com chantilly",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 214.2,
		measure: "1 taça",
		measureGrams: 190
	},
	{
		id: "sagu-de-morango-oetker-692",
		name: "Sagu de morango “Oetker”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 380,
		measure: "2 col. sopa",
		measureGrams: 30
	},
	{
		id: "sonho-693",
		name: "Sonho",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 674.1,
		measure: "1 unidade",
		measureGrams: 85
	},
	{
		id: "sorvete-de-chocolate-kibon-694",
		name: "Sorvete de chocolate “Kibon”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 186.7,
		measure: "1 bola",
		measureGrams: 60
	},
	{
		id: "sorvete-de-creme-nestl-695",
		name: "Sorvete de creme “Nestlé”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 170,
		measure: "1 bola",
		measureGrams: 60
	},
	{
		id: "sorvete-de-flocos-nestl-696",
		name: "Sorvete de flocos “Nestlé”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 201.7,
		measure: "1 bola",
		measureGrams: 60
	},
	{
		id: "sorvete-de-morango-kibon-697",
		name: "Sorvete de morango “Kibon”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 163.3,
		measure: "1 bola",
		measureGrams: 60
	},
	{
		id: "sundae-completo-698",
		name: "Sundae completo",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: .3,
		measure: "1 unidade",
		measureGrams: 350
	},
	{
		id: "sundae-chocolate-mc-donald-s-699",
		name: "Sundae chocolate “Mc Donald’s”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 204.1,
		measure: "1 unidade",
		measureGrams: 148
	},
	{
		id: "sundae-morango-mc-donald-s-700",
		name: "Sundae morango “Mc Donald’s”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 178.4,
		measure: "1 unidade",
		measureGrams: 153
	},
	{
		id: "suspiro-701",
		name: "Suspiro",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 370,
		measure: "1 unidade média",
		measureGrams: 10
	},
	{
		id: "torrone-de-amendoim-montevergine-702",
		name: "Torrone de amendoim “Montevergine”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 405,
		measure: "1 unidade peq.",
		measureGrams: 20
	},
	{
		id: "torta-de-banana-mcdonald-s-703",
		name: "Torta de banana “McDonald?s”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 288.6,
		measure: "1 unidade",
		measureGrams: 79
	},
	{
		id: "torta-de-lim-o-miss-daisy-704",
		name: "Torta de limão “Miss Daisy”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 268.1,
		measure: "1 fatia (porção)",
		measureGrams: 47
	},
	{
		id: "torta-de-ma-mcdonald-s-705",
		name: "Torta de maçã “McDonald?s”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 292.6,
		measure: "1 unidade",
		measureGrams: 81
	},
	{
		id: "torta-de-morango-706",
		name: "Torta de morango",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 184,
		measure: "1 fatia",
		measureGrams: 100
	},
	{
		id: "torta-holandesa-miss-daisy-707",
		name: "Torta holandesa “Miss Daisy”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 356.7,
		measure: "1 fatia (porção)",
		measureGrams: 60
	},
	{
		id: "torta-mousse-de-chocolate-miss-daisy-708",
		name: "Torta mousse de chocolate “Miss Daisy”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 306.4,
		measure: "1 fatia (porção)",
		measureGrams: 47
	},
	{
		id: "xarope-de-milho-karo-709",
		name: "Xarope de milho “Karo”",
		category: "Açúcares, Bolos e Doces",
		kcalPer100g: 300,
		measure: "1 col. sopa",
		measureGrams: 20
	},
	{
		id: "achocolatado-nescau-710",
		name: "Achocolatado “Nescau”",
		category: "Chocolates",
		kcalPer100g: 375,
		measure: "2 col. sopa",
		measureGrams: 20
	},
	{
		id: "achocolatado-ovomaltine-711",
		name: "Achocolatado “Ovomaltine”",
		category: "Chocolates",
		kcalPer100g: 370,
		measure: "2 col. sopa",
		measureGrams: 20
	},
	{
		id: "achocolatado-light-nescau-712",
		name: "Achocolatado light “Nescau”",
		category: "Chocolates",
		kcalPer100g: 336.8,
		measure: "2 col. sopa",
		measureGrams: 19
	},
	{
		id: "achocolatado-diet-gold-713",
		name: "Achocolatado diet “Gold”",
		category: "Chocolates",
		kcalPer100g: 388.9,
		measure: "1 col. sopa",
		measureGrams: 9
	},
	{
		id: "amendoim-coberto-de-chocolate-714",
		name: "Amendoim coberto de chocolate",
		category: "Chocolates",
		kcalPer100g: 533.3,
		measure: "1 porcao",
		measureGrams: 30
	},
	{
		id: "chocolate-base-de-soja-choc-soy-715",
		name: "Chocolate à base de soja “Choc Soy”",
		category: "Chocolates",
		kcalPer100g: 520,
		measure: "1 unidade",
		measureGrams: 25
	},
	{
		id: "chocolate-alpino-nestl-716",
		name: "Chocolate Alpino “Nestlé”",
		category: "Chocolates",
		kcalPer100g: 523.1,
		measure: "1 bombom",
		measureGrams: 13
	},
	{
		id: "chocolate-alpino-diet-nestl-717",
		name: "Chocolate Alpino diet “Nestlé”",
		category: "Chocolates",
		kcalPer100g: 476.7,
		measure: "1 barra",
		measureGrams: 30
	},
	{
		id: "chocolate-amandita-lacta-718",
		name: "Chocolate Amandita “Lacta”",
		category: "Chocolates",
		kcalPer100g: 537.5,
		measure: "1 unidade",
		measureGrams: 8
	},
	{
		id: "chocolate-amargo-hershey-s-719",
		name: "Chocolate amargo “Hershey’s”",
		category: "Chocolates",
		kcalPer100g: 544,
		measure: "4 quadradinhos",
		measureGrams: 25
	},
	{
		id: "chocolate-amargo-com-am-ndoas-talento-garoto-720",
		name: "Chocolate amargo com amêndoas Talento “Garoto”",
		category: "Chocolates",
		kcalPer100g: 532,
		measure: "4 quadradinhos",
		measureGrams: 25
	},
	{
		id: "chocolate-amargo-sabor-menta-hershey-s-721",
		name: "Chocolate amargo sabor menta “Hershey’s”",
		category: "Chocolates",
		kcalPer100g: 540,
		measure: "4 quadradinhos",
		measureGrams: 25
	},
	{
		id: "chocolate-ao-leite-garoto-722",
		name: "Chocolate ao leite “Garoto”",
		category: "Chocolates",
		kcalPer100g: 520,
		measure: "1 barra",
		measureGrams: 30
	},
	{
		id: "chocolate-ao-leite-hershey-s-723",
		name: "Chocolate ao leite “Hershey’s”",
		category: "Chocolates",
		kcalPer100g: 528,
		measure: "4 quadradinhos",
		measureGrams: 25
	},
	{
		id: "chocolate-ao-leite-c-am-ndoas-e-passas-talento-g-724",
		name: "Chocolate ao leite c/ amêndoas e passas Talento “Garoto”",
		category: "Chocolates",
		kcalPer100g: 533.3,
		measure: "4 quadradinhos",
		measureGrams: 30
	},
	{
		id: "chocolate-ao-leite-c-avel-s-talento-garoto-725",
		name: "Chocolate ao leite c/ avelãs Talento “Garoto”",
		category: "Chocolates",
		kcalPer100g: 548,
		measure: "4 quadradinhos",
		measureGrams: 25
	},
	{
		id: "chocolate-ao-leite-c-castanha-do-par-talento-gar-726",
		name: "Chocolate ao leite c/ castanha-do-pará Talento “Garoto”",
		category: "Chocolates",
		kcalPer100g: 548,
		measure: "4 quadradinhos",
		measureGrams: 25
	},
	{
		id: "chocolate-ao-leite-classic-nestl-727",
		name: "Chocolate ao leite Classic “Nestlé”",
		category: "Chocolates",
		kcalPer100g: 536,
		measure: "4 quadradinhos",
		measureGrams: 25
	},
	{
		id: "chocolate-ao-leite-com-amendoim-shot-lacta-728",
		name: "Chocolate ao leite com amendoim Shot “Lacta”",
		category: "Chocolates",
		kcalPer100g: 552,
		measure: "4 quadradinhos",
		measureGrams: 25
	},
	{
		id: "chocolate-ao-leite-com-avel-lacta-729",
		name: "Chocolate ao leite com avelã “Lacta”",
		category: "Chocolates",
		kcalPer100g: 540,
		measure: "4 quadradinhos",
		measureGrams: 25
	},
	{
		id: "chocolate-ao-leite-com-avel-milka-lacta-730",
		name: "Chocolate ao leite com avelã Milka “Lacta”",
		category: "Chocolates",
		kcalPer100g: 648,
		measure: "4 quadradinhos",
		measureGrams: 25
	},
	{
		id: "chocolate-ao-leite-com-castanha-de-caj-nestl-731",
		name: "Chocolate ao leite com castanha de cajú “Nestlé”",
		category: "Chocolates",
		kcalPer100g: 532,
		measure: "4 quadradinhos",
		measureGrams: 25
	},
	{
		id: "chocolate-ao-leite-com-castanha-e-caramelo-croca-732",
		name: "Chocolate ao leite com castanha e caramelo crocante “Lacta”",
		category: "Chocolates",
		kcalPer100g: 532,
		measure: "4 quadradinhos",
		measureGrams: 25
	},
	{
		id: "chocolate-ao-leite-com-cookies-de-chocolate-hers-733",
		name: "Chocolate ao leite com cookies de chocolate “Hershey’s”",
		category: "Chocolates",
		kcalPer100g: 512,
		measure: "4 quadradinhos",
		measureGrams: 25
	},
	{
		id: "chocolate-ao-leite-com-crocante-wonka-nestl-734",
		name: "Chocolate ao leite com crocante Wonka “Nestlé”",
		category: "Chocolates",
		kcalPer100g: 488,
		measure: "4 quadradinhos",
		measureGrams: 25
	},
	{
		id: "chocolate-ao-leite-com-flocos-garoto-735",
		name: "Chocolate ao leite com flocos “Garoto”",
		category: "Chocolates",
		kcalPer100g: 520,
		measure: "4 quadradinhos",
		measureGrams: 25
	},
	{
		id: "chocolate-ao-leite-com-peda-os-de-biscoitos-pass-736",
		name: "Chocolate ao leite com pedaços de biscoitos Passatempo “Nestlé”",
		category: "Chocolates",
		kcalPer100g: 512,
		measure: "4 quadradinhos",
		measureGrams: 25
	},
	{
		id: "chocolate-ao-leite-com-peda-os-de-cacau-nestl-737",
		name: "Chocolate ao leite com pedaços de cacau “Nestlé”",
		category: "Chocolates",
		kcalPer100g: 536,
		measure: "4 quadradinhos",
		measureGrams: 25
	},
	{
		id: "chocolate-ao-leite-com-recheio-de-leite-kinder-738",
		name: "Chocolate ao Leite com Recheio de Leite “Kinder”",
		category: "Chocolates",
		kcalPer100g: 556,
		measure: "2 barras",
		measureGrams: 25
	},
	{
		id: "chocolate-ao-leite-diet-nestl-739",
		name: "Chocolate ao leite diet “Nestlé”",
		category: "Chocolates",
		kcalPer100g: 476.7,
		measure: "1 barra",
		measureGrams: 30
	},
	{
		id: "chocolate-ao-leite-e-branco-duo-nestl-740",
		name: "Chocolate ao leite e branco Duo “Nestlé”",
		category: "Chocolates",
		kcalPer100g: 536,
		measure: "4 quadradinhos",
		measureGrams: 25
	},
	{
		id: "chocolate-ao-leite-lacta-741",
		name: "Chocolate ao leite Lacta",
		category: "Chocolates",
		kcalPer100g: 532,
		measure: "4 quadradinhos",
		measureGrams: 25
	},
	{
		id: "chocolate-baton-garoto-742",
		name: "Chocolate Baton “Garoto”",
		category: "Chocolates",
		kcalPer100g: 537.5,
		measure: "1 unidade",
		measureGrams: 16
	},
	{
		id: "chocolate-baton-branco-garoto-743",
		name: "Chocolate Baton branco “Garoto”",
		category: "Chocolates",
		kcalPer100g: 556.2,
		measure: "1 unidade",
		measureGrams: 16
	},
	{
		id: "chocolate-bis-lacta-744",
		name: "Chocolate Bis “Lacta”",
		category: "Chocolates",
		kcalPer100g: 466.7,
		measure: "1 unidade",
		measureGrams: 7.5
	},
	{
		id: "chocolate-bis-branco-lacta-745",
		name: "Chocolate Bis branco “Lacta”",
		category: "Chocolates",
		kcalPer100g: 466.7,
		measure: "1 unidade",
		measureGrams: 7.5
	},
	{
		id: "bombom-ferrero-rocher-746",
		name: "Bombom “Ferrero Rocher”",
		category: "Chocolates",
		kcalPer100g: 561.5,
		measure: "1 bombom",
		measureGrams: 13
	},
	{
		id: "chocolate-branco-com-cereais-e-uvas-passas-talen-747",
		name: "Chocolate branco com cereais e uvas passas Talento “Garoto”",
		category: "Chocolates",
		kcalPer100g: 524,
		measure: "4 quadradinhos",
		measureGrams: 25
	},
	{
		id: "chocolate-branco-com-cookies-hershey-s-748",
		name: "Chocolate branco com cookies “Hershey’s”",
		category: "Chocolates",
		kcalPer100g: 520,
		measure: "4 quadradinhos",
		measureGrams: 25
	},
	{
		id: "chocolate-charge-nestl-749",
		name: "Chocolate Charge “Nestlé”",
		category: "Chocolates",
		kcalPer100g: 467.5,
		measure: "1 unidade",
		measureGrams: 40
	},
	{
		id: "chocolate-granulado-cacau-visconti-750",
		name: "Chocolate granulado cacau Visconti",
		category: "Chocolates",
		kcalPer100g: 361.1,
		measure: "1 pacote",
		measureGrams: 90
	},
	{
		id: "chocolate-em-p-garoto-751",
		name: "Chocolate em pó Garoto",
		category: "Chocolates",
		kcalPer100g: 300,
		measure: "1 c. sopa",
		measureGrams: 6
	},
	{
		id: "chocolate-chokito-nestl-752",
		name: "Chocolate Chokito “Nestlé”",
		category: "Chocolates",
		kcalPer100g: 437.5,
		measure: "1 unidade",
		measureGrams: 32
	},
	{
		id: "chocolate-chokito-nestl-753",
		name: "Chocolate Chokito Nestlé",
		category: "Chocolates",
		kcalPer100g: 457.1,
		measure: "1 unidade mini",
		measureGrams: 14
	},
	{
		id: "chocolate-chomp-nestl-754",
		name: "Chocolate Chomp “Nestlé”",
		category: "Chocolates",
		kcalPer100g: 521.1,
		measure: "1 bombom",
		measureGrams: 19
	},
	{
		id: "chocolate-chumbinho-kopenhagen-755",
		name: "Chocolate Chumbinho “Kopenhagen”",
		category: "Chocolates",
		kcalPer100g: 484,
		measure: "2 col. sopa",
		measureGrams: 25
	},
	{
		id: "chocolate-com-recheio-de-caramelo-twix-756",
		name: "Chocolate com recheio de caramelo “Twix”",
		category: "Chocolates",
		kcalPer100g: 468.8,
		measure: "2 barras",
		measureGrams: 32
	},
	{
		id: "chocolate-crunch-nestl-757",
		name: "Chocolate Crunch “Nestlé”",
		category: "Chocolates",
		kcalPer100g: 516,
		measure: "4 quadradinhos",
		measureGrams: 25
	},
	{
		id: "chocolate-diamante-negro-lacta-758",
		name: "Chocolate Diamante Negro “Lacta”",
		category: "Chocolates",
		kcalPer100g: 516.7,
		measure: "1 barra",
		measureGrams: 30
	},
	{
		id: "chocolate-diplomata-nestl-759",
		name: "Chocolate Diplomata “Nestlé”",
		category: "Chocolates",
		kcalPer100g: 550,
		measure: "1 unidade mini",
		measureGrams: 10
	},
	{
		id: "chocolate-galak-nestl-760",
		name: "Chocolate Galak “Nestlé”",
		category: "Chocolates",
		kcalPer100g: 566.7,
		measure: "1 barra",
		measureGrams: 30
	},
	{
		id: "chocolate-kinder-ovo-761",
		name: "Chocolate Kinder ovo",
		category: "Chocolates",
		kcalPer100g: 550,
		measure: "1 unidade",
		measureGrams: 20
	},
	{
		id: "chocolate-laka-762",
		name: "Chocolate Laka",
		category: "Chocolates",
		kcalPer100g: 520,
		measure: "1 barra",
		measureGrams: 30
	},
	{
		id: "chocolate-lancy-lacta-763",
		name: "Chocolate Lancy “Lacta”",
		category: "Chocolates",
		kcalPer100g: 500,
		measure: "1 unidade",
		measureGrams: 30
	},
	{
		id: "chocolate-l-ngua-de-gato-kopenhagen-764",
		name: "Chocolate Língua-de-gato “Kopenhagen”",
		category: "Chocolates",
		kcalPer100g: 576,
		measure: "4 unidades",
		measureGrams: 25
	},
	{
		id: "chocolate-l-ngua-de-gato-light-kopenhagen-765",
		name: "Chocolate Língua-de-gato light “Kopenhagen”",
		category: "Chocolates",
		kcalPer100g: 432,
		measure: "4 unidades",
		measureGrams: 25
	},
	{
		id: "chocolate-m-m-amendoim-766",
		name: "Chocolate M&M amendoim",
		category: "Chocolates",
		kcalPer100g: 493.9,
		measure: "1 pacote",
		measureGrams: 49
	},
	{
		id: "chocolate-m-m-ao-leite-767",
		name: "Chocolate M&M ao leite",
		category: "Chocolates",
		kcalPer100g: 465.4,
		measure: "1 pacote",
		measureGrams: 52
	},
	{
		id: "chocolate-meio-amargo-lacta-768",
		name: "Chocolate meio amargo “Lacta”",
		category: "Chocolates",
		kcalPer100g: 500,
		measure: "4 quadradinhos",
		measureGrams: 25
	},
	{
		id: "chocolate-meio-amargo-nestl-769",
		name: "Chocolate meio amargo “Nestlé”",
		category: "Chocolates",
		kcalPer100g: 504,
		measure: "4 quadradinhos",
		measureGrams: 25
	},
	{
		id: "chocolate-milkybar-nestl-770",
		name: "Chocolate Milkybar “Nestlé”",
		category: "Chocolates",
		kcalPer100g: 465,
		measure: "1 unidade mini",
		measureGrams: 20
	},
	{
		id: "chocolate-nescau-barra-nestl-771",
		name: "Chocolate Nescau barra “Nestlé”",
		category: "Chocolates",
		kcalPer100g: 525,
		measure: "1 unidade",
		measureGrams: 40
	},
	{
		id: "chocolate-nh-benta-kopenhagen-772",
		name: "Chocolate Nhá benta “Kopenhagen”",
		category: "Chocolates",
		kcalPer100g: 320,
		measure: "1 unidade",
		measureGrams: 40
	},
	{
		id: "chocolate-ouro-branco-lacta-773",
		name: "Chocolate Ouro Branco “Lacta”",
		category: "Chocolates",
		kcalPer100g: 516.3,
		measure: "1 bombom",
		measureGrams: 21.5
	},
	{
		id: "ovo-de-p-scoa-garoto-baton-2-em-1-774",
		name: "Ovo de páscoa Garoto Baton 2 em 1",
		category: "Chocolates",
		kcalPer100g: 544,
		measure: "1 porcao",
		measureGrams: 25
	},
	{
		id: "ovo-de-p-scoa-lacta-bis-laka-775",
		name: "Ovo de páscoa Lacta Bis Laka",
		category: "Chocolates",
		kcalPer100g: 532,
		measure: "1 porcao",
		measureGrams: 25
	},
	{
		id: "ovo-de-p-scoa-nestl-chokito-776",
		name: "Ovo de páscoa Nestlé Chokito",
		category: "Chocolates",
		kcalPer100g: 544,
		measure: "1 porcao",
		measureGrams: 25
	},
	{
		id: "ovo-de-p-scoa-lacta-diamante-negro-777",
		name: "Ovo de páscoa Lacta Diamante Negro",
		category: "Chocolates",
		kcalPer100g: 516,
		measure: "1 porcao",
		measureGrams: 25
	},
	{
		id: "ovo-de-p-scoa-ferrero-rocher-778",
		name: "Ovo de páscoa Ferrero Rocher",
		category: "Chocolates",
		kcalPer100g: 604,
		measure: "1 porcao",
		measureGrams: 25
	},
	{
		id: "ovo-de-p-scoa-garoto-cl-ssico-779",
		name: "Ovo de páscoa Garoto Clássico",
		category: "Chocolates",
		kcalPer100g: 524,
		measure: "1 porcao",
		measureGrams: 25
	},
	{
		id: "ovo-de-p-scoa-lacta-grandes-sucessos-780",
		name: "Ovo de páscoa Lacta Grandes Sucessos",
		category: "Chocolates",
		kcalPer100g: 528,
		measure: "1 porcao",
		measureGrams: 25
	},
	{
		id: "ovo-de-p-scoa-nestl-classic-ao-leite-781",
		name: "Ovo de Páscoa Nestlé Classic ao Leite",
		category: "Chocolates",
		kcalPer100g: 520,
		measure: "1 porcao",
		measureGrams: 25
	},
	{
		id: "ovo-de-p-scoa-garoto-serenata-de-amor-782",
		name: "Ovo de Páscoa Garoto Serenata de Amor",
		category: "Chocolates",
		kcalPer100g: 532,
		measure: "1 porcao",
		measureGrams: 25
	},
	{
		id: "ovo-de-p-scoa-lacta-sonho-de-valsa-783",
		name: "Ovo de páscoa Lacta Sonho de Valsa",
		category: "Chocolates",
		kcalPer100g: 536,
		measure: "1 porcao",
		measureGrams: 25
	},
	{
		id: "ovo-de-p-scoa-nestl-suflair-ao-leite-784",
		name: "Ovo de páscoa Nestlé Suflair ao Leite",
		category: "Chocolates",
		kcalPer100g: 524,
		measure: "1 porcao",
		measureGrams: 25
	},
	{
		id: "ovo-de-p-scoa-garoto-talento-castanha-do-par-785",
		name: "Ovo de páscoa Garoto Talento Castanha-do-Pará",
		category: "Chocolates",
		kcalPer100g: 532,
		measure: "1 porcao",
		measureGrams: 25
	},
	{
		id: "ovo-de-p-scoa-garoto-talento-branco-cereais-786",
		name: "Ovo de páscoa Garoto Talento Branco Cereais",
		category: "Chocolates",
		kcalPer100g: 528,
		measure: "1 porcao",
		measureGrams: 25
	},
	{
		id: "ovo-de-p-scoa-nestl-classic-dark-787",
		name: "Ovo de páscoa Nestlé Classic Dark",
		category: "Chocolates",
		kcalPer100g: 540,
		measure: "1 porcao",
		measureGrams: 25
	},
	{
		id: "ovo-de-p-scoa-p-o-de-a-car-dark-788",
		name: "Ovo de páscoa Pão de Açúcar Dark",
		category: "Chocolates",
		kcalPer100g: 540,
		measure: "1 porcao",
		measureGrams: 25
	},
	{
		id: "ovo-de-p-scoa-nestl-classic-zero-789",
		name: "Ovo de páscoa Nestlé Classic Zero",
		category: "Chocolates",
		kcalPer100g: 376,
		measure: "1 porcao",
		measureGrams: 25
	},
	{
		id: "ovo-de-p-scoa-gold-ao-leite-diet-790",
		name: "Ovo de páscoa Gold ao Leite Diet",
		category: "Chocolates",
		kcalPer100g: 480,
		measure: "1 porcao",
		measureGrams: 25
	},
	{
		id: "ovo-de-p-scoa-lacta-chocolate-ao-leite-diet-791",
		name: "Ovo de páscoa Lacta Chocolate ao Leite Diet",
		category: "Chocolates",
		kcalPer100g: 444,
		measure: "1 porcao",
		measureGrams: 25
	},
	{
		id: "ovo-de-p-scoa-nestl-classic-diet-792",
		name: "Ovo de páscoa Nestlé Classic Diet",
		category: "Chocolates",
		kcalPer100g: 476,
		measure: "1 porcao",
		measureGrams: 25
	},
	{
		id: "ovo-de-p-scoa-nestl-sollys-793",
		name: "Ovo de páscoa Nestlé Sollys",
		category: "Chocolates",
		kcalPer100g: 544,
		measure: "1 porcao",
		measureGrams: 25
	},
	{
		id: "ovo-de-p-scoa-nestl-alpino-dark-794",
		name: "Ovo de páscoa Nestlé Alpino Dark",
		category: "Chocolates",
		kcalPer100g: 540,
		measure: "1 porcao",
		measureGrams: 25
	},
	{
		id: "ovo-de-p-scoa-lacta-amandita-795",
		name: "Ovo de páscoa Lacta Amandita",
		category: "Chocolates",
		kcalPer100g: 544,
		measure: "1 porcao",
		measureGrams: 25
	},
	{
		id: "ovo-de-p-scoa-garoto-talento-avel-diet-796",
		name: "Ovo de páscoa Garoto Talento Avelã Diet",
		category: "Chocolates",
		kcalPer100g: 516,
		measure: "1 porcao",
		measureGrams: 25
	},
	{
		id: "ovo-de-p-scoa-taeq-diet-ao-leite-797",
		name: "Ovo de páscoa Taeq Diet Ao Leite",
		category: "Chocolates",
		kcalPer100g: 424,
		measure: "1 porcao",
		measureGrams: 25
	},
	{
		id: "ovo-de-p-scoa-prest-gio-nestl-798",
		name: "Ovo de páscoa Prestígio Nestlé",
		category: "Chocolates",
		kcalPer100g: 541,
		measure: "1 unidade",
		measureGrams: 100
	},
	{
		id: "ovo-de-p-scoa-chocolate-c-leite-nestl-799",
		name: "Ovo de páscoa chocolate c/ leite Nestlé",
		category: "Chocolates",
		kcalPer100g: 541,
		measure: "1 unidade",
		measureGrams: 100
	},
	{
		id: "ovo-de-p-scoa-alpino-nestl-800",
		name: "Ovo de páscoa Alpino Nestlé",
		category: "Chocolates",
		kcalPer100g: 543,
		measure: "1 unidade",
		measureGrams: 100
	},
	{
		id: "chocolate-passas-garoto-801",
		name: "Chocolate Passas Garoto",
		category: "Chocolates",
		kcalPer100g: 461.5,
		measure: "1 unidade",
		measureGrams: 13
	},
	{
		id: "chocolate-prest-gio-nestl-802",
		name: "Chocolate Prestígio “Nestlé”",
		category: "Chocolates",
		kcalPer100g: 466.7,
		measure: "1 unidade",
		measureGrams: 33
	},
	{
		id: "chocolate-sedu-o-nestl-803",
		name: "Chocolate Sedução “Nestlé”",
		category: "Chocolates",
		kcalPer100g: 542.1,
		measure: "1 bombom",
		measureGrams: 19
	},
	{
		id: "chocolate-sem-parar-nestl-804",
		name: "Chocolate Sem parar “Nestlé”",
		category: "Chocolates",
		kcalPer100g: 520,
		measure: "4 unidades",
		measureGrams: 30
	},
	{
		id: "chocolate-sensa-o-morango-nestl-805",
		name: "Chocolate Sensação morango “Nestlé”",
		category: "Chocolates",
		kcalPer100g: 463.2,
		measure: "1 barra",
		measureGrams: 38
	},
	{
		id: "chocolate-serenata-de-amor-garoto-806",
		name: "Chocolate Serenata de amor “Garoto”",
		category: "Chocolates",
		kcalPer100g: 515,
		measure: "1 bombom",
		measureGrams: 20
	},
	{
		id: "chocolate-snickers-807",
		name: "Chocolate Snickers",
		category: "Chocolates",
		kcalPer100g: 923.1,
		measure: "1 unidade",
		measureGrams: 52
	},
	{
		id: "chocolate-sonho-de-valsa-lacta-808",
		name: "Chocolate Sonho de Valsa “Lacta”",
		category: "Chocolates",
		kcalPer100g: 525.6,
		measure: "1 bombom",
		measureGrams: 21.5
	},
	{
		id: "chocolate-sonho-de-valsa-branco-lacta-809",
		name: "Chocolate Sonho de Valsa branco “Lacta”",
		category: "Chocolates",
		kcalPer100g: 530.2,
		measure: "1 bombom",
		measureGrams: 21.5
	},
	{
		id: "chocolate-sonho-de-valsa-trufa-lacta-810",
		name: "Chocolate Sonho de Valsa trufa “Lacta”",
		category: "Chocolates",
		kcalPer100g: 516.3,
		measure: "1 bombom",
		measureGrams: 21.5
	},
	{
		id: "chocolate-suflair-meio-amargo-nestl-811",
		name: "Chocolate Suflair meio amargo Nestlé",
		category: "Chocolates",
		kcalPer100g: 550,
		measure: "1 unidade",
		measureGrams: 28
	},
	{
		id: "chocolate-suflair-nestl-812",
		name: "Chocolate Suflair “Nestlé”",
		category: "Chocolates",
		kcalPer100g: 528,
		measure: "1 tablete",
		measureGrams: 50
	},
	{
		id: "leite-toffee-arcor-813",
		name: "Leite Toffee “Arcor”",
		category: "Balas e Chicletes",
		kcalPer100g: 457.1,
		measure: "1 unidade",
		measureGrams: 7
	},
	{
		id: "chocolate-toffee-arcor-814",
		name: "Chocolate Toffee “Arcor”",
		category: "Balas e Chicletes",
		kcalPer100g: 457.1,
		measure: "1 unidade",
		measureGrams: 7
	},
	{
		id: "7-belo-framboesa-arcor-815",
		name: "7 belo framboesa “Arcor”",
		category: "Balas e Chicletes",
		kcalPer100g: 400,
		measure: "1 unidade",
		measureGrams: 5
	},
	{
		id: "hortel-kid-s-arcor-816",
		name: "Hortelã Kid’s “Arcor”",
		category: "Balas e Chicletes",
		kcalPer100g: 380,
		measure: "1 unidade",
		measureGrams: 5
	},
	{
		id: "7-belo-iogurte-arcor-817",
		name: "7 belo iogurte “Arcor”",
		category: "Balas e Chicletes",
		kcalPer100g: 400,
		measure: "1 unidade",
		measureGrams: 5
	},
	{
		id: "recheada-sabor-mel-arcor-818",
		name: "Recheada sabor mel “Arcor”",
		category: "Balas e Chicletes",
		kcalPer100g: 366.7,
		measure: "1 unidade",
		measureGrams: 6
	},
	{
		id: "bala-de-coco-celina-819",
		name: "Bala de coco “Celina”",
		category: "Balas e Chicletes",
		kcalPer100g: 400,
		measure: "1 unidade",
		measureGrams: 5
	},
	{
		id: "caramelo-de-morango-com-creme-de-leite-fruit-tel-820",
		name: "Caramelo de morango com creme de leite “Fruit-Tella”",
		category: "Balas e Chicletes",
		kcalPer100g: 425,
		measure: "1 unidade",
		measureGrams: 4
	},
	{
		id: "confeito-sabor-frutas-vermelhas-mentos-821",
		name: "Confeito sabor frutas vermelhas “Mentos”",
		category: "Balas e Chicletes",
		kcalPer100g: 400,
		measure: "1 unidade",
		measureGrams: 3
	},
	{
		id: "confeito-sabor-frutas-mentos-822",
		name: "Confeito sabor frutas “Mentos”",
		category: "Balas e Chicletes",
		kcalPer100g: 400,
		measure: "1 unidade",
		measureGrams: 3
	},
	{
		id: "confeito-sabor-menta-forte-mentos-823",
		name: "Confeito sabor menta forte “Mentos”",
		category: "Balas e Chicletes",
		kcalPer100g: 400,
		measure: "1 unidade",
		measureGrams: 3
	},
	{
		id: "iogurte-dori-824",
		name: "Iogurte “Dori”",
		category: "Balas e Chicletes",
		kcalPer100g: 400,
		measure: "1 unidade",
		measureGrams: 5
	},
	{
		id: "frutas-sortidas-fruit-tella-825",
		name: "Frutas sortidas “Fruit-Tella”",
		category: "Balas e Chicletes",
		kcalPer100g: 400,
		measure: "1 unidade",
		measureGrams: 4
	},
	{
		id: "goma-de-mascar-morango-bubbaloo-826",
		name: "Goma de mascar morango “Bubbaloo”",
		category: "Balas e Chicletes",
		kcalPer100g: 333.3,
		measure: "1 unidade",
		measureGrams: 6
	},
	{
		id: "goma-de-mascar-tutti-frutti-bubbaloo-827",
		name: "Goma de mascar tutti-frutti “Bubbaloo”",
		category: "Balas e Chicletes",
		kcalPer100g: 272.7,
		measure: "1 unidade",
		measureGrams: 5.5
	},
	{
		id: "goma-de-mascar-canela-trident-828",
		name: "Goma de mascar canela “Trident”",
		category: "Balas e Chicletes",
		kcalPer100g: 150,
		measure: "1 unidade",
		measureGrams: 2
	},
	{
		id: "goma-de-mascar-hortel-trident-829",
		name: "Goma de mascar hortelã “Trident”",
		category: "Balas e Chicletes",
		kcalPer100g: 150,
		measure: "1 unidade",
		measureGrams: 2
	},
	{
		id: "goma-de-mascar-morango-trident-830",
		name: "Goma de mascar morango “Trident”",
		category: "Balas e Chicletes",
		kcalPer100g: 150,
		measure: "1 unidade",
		measureGrams: 2
	},
	{
		id: "goma-de-mascar-kiwi-chiclet-s-831",
		name: "Goma de mascar kiwi “Chiclet’s”",
		category: "Balas e Chicletes",
		kcalPer100g: 280,
		measure: "1 unidade",
		measureGrams: 2.5
	},
	{
		id: "goma-de-mascar-menta-e-melancia-trident-832",
		name: "Goma de mascar menta e melancia “Trident”",
		category: "Balas e Chicletes",
		kcalPer100g: 200,
		measure: "1 unidade",
		measureGrams: 2
	},
	{
		id: "goma-de-mascar-morango-chiclet-s-833",
		name: "Goma de mascar morango “Chiclet’s”",
		category: "Balas e Chicletes",
		kcalPer100g: 280,
		measure: "1 unidade",
		measureGrams: 2.5
	},
	{
		id: "drops-de-cereja-halls-834",
		name: "Drops de cereja “Halls”",
		category: "Balas e Chicletes",
		kcalPer100g: 375,
		measure: "1 unidade",
		measureGrams: 4
	},
	{
		id: "drops-de-menta-halls-835",
		name: "Drops de menta “Halls”",
		category: "Balas e Chicletes",
		kcalPer100g: 375,
		measure: "1 unidade",
		measureGrams: 4
	},
	{
		id: "drops-de-uva-e-laranja-halls-836",
		name: "Drops de uva e laranja “Halls”",
		category: "Balas e Chicletes",
		kcalPer100g: 375,
		measure: "1 unidade",
		measureGrams: 4
	},
	{
		id: "pastilha-de-laranja-tic-tac-837",
		name: "Pastilha de laranja “Tic Tac”",
		category: "Balas e Chicletes",
		kcalPer100g: 383.7,
		measure: "1 unidade",
		measureGrams: .49
	},
	{
		id: "pastilha-de-menta-tic-tac-838",
		name: "Pastilha de menta “Tic Tac”",
		category: "Balas e Chicletes",
		kcalPer100g: 389.8,
		measure: "1 unidade",
		measureGrams: .49
	},
	{
		id: "drops-creamy-de-mel-o-halls-839",
		name: "Drops creamy de melão “Halls”",
		category: "Balas e Chicletes",
		kcalPer100g: 400,
		measure: "1 unidade",
		measureGrams: 4
	},
	{
		id: "bala-de-leite-kopenhagen-840",
		name: "Bala de leite “Kopenhagen”",
		category: "Balas e Chicletes",
		kcalPer100g: 300,
		measure: "1 unidade",
		measureGrams: 7
	},
	{
		id: "am-ndoas-com-chocolate-nutry-841",
		name: "Amêndoas com chocolate “Nutry”",
		category: "Barras de cereais",
		kcalPer100g: 640,
		measure: "1 unidade",
		measureGrams: 20
	},
	{
		id: "banana-nutry-842",
		name: "Banana “Nutry”",
		category: "Barras de cereais",
		kcalPer100g: 360,
		measure: "1 unidade",
		measureGrams: 25
	},
	{
		id: "barra-de-frutas-supino-843",
		name: "Barra de frutas “Supino”",
		category: "Barras de cereais",
		kcalPer100g: 319.2,
		measure: "1 unidade",
		measureGrams: 26
	},
	{
		id: "barra-de-granola-crocante-com-aveia-e-mel-nature-844",
		name: "Barra de Granola Crocante com Aveia e Mel “Nature Valley”",
		category: "Barras de cereais",
		kcalPer100g: 445,
		measure: "1 unidade",
		measureGrams: 20
	},
	{
		id: "brigadeiro-trio-845",
		name: "Brigadeiro “Trio”",
		category: "Barras de cereais",
		kcalPer100g: 400,
		measure: "1 unidade",
		measureGrams: 25
	},
	{
		id: "canela-e-gengibre-soyos-woman-care-846",
		name: "Canela e gengibre “Soyos Woman Care”",
		category: "Barras de cereais",
		kcalPer100g: 340,
		measure: "1 unidade",
		measureGrams: 25
	},
	{
		id: "castanha-com-chocolate-nutry-847",
		name: "Castanha com chocolate “Nutry”",
		category: "Barras de cereais",
		kcalPer100g: 440,
		measure: "1 unidade",
		measureGrams: 25
	},
	{
		id: "cereal-org-nico-em-barra-quinua-real-848",
		name: "Cereal orgânico em barra “Quinua Real”",
		category: "Barras de cereais",
		kcalPer100g: 356,
		measure: "1 unidade",
		measureGrams: 25
	},
	{
		id: "chocolate-com-cookies-hershey-s-849",
		name: "Chocolate com cookies “Hershey’s”",
		category: "Barras de cereais",
		kcalPer100g: 460,
		measure: "1 unidade",
		measureGrams: 25
	},
	{
		id: "coco-neston-850",
		name: "Coco “Neston”",
		category: "Barras de cereais",
		kcalPer100g: 440,
		measure: "1 unidade",
		measureGrams: 25
	},
	{
		id: "com-soja-sabor-ma-a-sollys-nestl-851",
		name: "Com soja sabor maça sollys “Nestlé”",
		category: "Barras de cereais",
		kcalPer100g: 328,
		measure: "1 unidade",
		measureGrams: 25
	},
	{
		id: "creme-sabor-banana-hersheys-852",
		name: "Creme sabor banana “Hersheys”",
		category: "Barras de cereais",
		kcalPer100g: 460,
		measure: "1 unidade",
		measureGrams: 25
	},
	{
		id: "iogurte-nutrinho-853",
		name: "Iogurte “Nutrinho”",
		category: "Barras de cereais",
		kcalPer100g: 345,
		measure: "1 unidade",
		measureGrams: 20
	},
	{
		id: "pav-de-chocolate-light-trio-854",
		name: "Pavê de chocolate light “Trio”",
		category: "Barras de cereais",
		kcalPer100g: 345,
		measure: "1 unidade",
		measureGrams: 20
	},
	{
		id: "prote-na-banana-trio-855",
		name: "Proteína banana “Trio”",
		category: "Barras de cereais",
		kcalPer100g: 321.4,
		measure: "1 unidade",
		measureGrams: 42
	},
	{
		id: "prote-na-chocolate-trio-856",
		name: "Proteína chocolate “Trio”",
		category: "Barras de cereais",
		kcalPer100g: 309.5,
		measure: "1 unidade",
		measureGrams: 42
	},
	{
		id: "recheio-de-banana-nutry-857",
		name: "Recheio de banana “Nutry”",
		category: "Barras de cereais",
		kcalPer100g: 390,
		measure: "1 unidade",
		measureGrams: 30
	},
	{
		id: "torta-de-morango-quaker-858",
		name: "Torta de morango “Quaker”",
		category: "Barras de cereais",
		kcalPer100g: 427.3,
		measure: "1 unidade",
		measureGrams: 22
	},
	{
		id: "gua-t-nica-antartica-859",
		name: "Água tônica “Antartica”",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 30,
		measure: "1 lata",
		measureGrams: 350
	},
	{
		id: "gua-de-coco-kerococo-860",
		name: "Água-de-coco “Kerococo”",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 22.5,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "bebida-base-de-soja-sabor-abacaxi-sollys-861",
		name: "Bebida à base de soja sabor abacaxi “Sollys”",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 39,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "bebida-base-de-soja-sabor-ma-ades-862",
		name: "Bebida à base de soja sabor maçã “Ades”",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 35.5,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "bebida-base-de-soja-sabor-ma-light-ades-863",
		name: "Bebida à base de soja sabor maçã light “Ades”",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 21.5,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "bebida-base-de-soja-sabor-original-ades-864",
		name: "Bebida à base de soja sabor original “Ades”",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 39,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "bebida-base-de-soja-sabor-pera-shefa-865",
		name: "Bebida à base de soja sabor pera “Shefa”",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 45,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "bebida-energ-tica-red-bull-866",
		name: "Bebida energética “Red Bull”",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 44,
		measure: "1 lata",
		measureGrams: 250
	},
	{
		id: "bebida-energ-tica-red-bull-sugar-free-867",
		name: "Bebida energética “Red Bull” sugar free",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 4,
		measure: "1 lata",
		measureGrams: 250
	},
	{
		id: "caf-com-a-car-868",
		name: "Café com açúcar",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 52,
		measure: "1 xíc. café",
		measureGrams: 50
	},
	{
		id: "caf-com-ado-ante-869",
		name: "Café com adoçante",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 4,
		measure: "1 xícara",
		measureGrams: 50
	},
	{
		id: "caf-com-leite-integral-870",
		name: "Café com leite integral",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 45,
		measure: "1 xícara",
		measureGrams: 100
	},
	{
		id: "caf-com-leite-integral-e-a-car-871",
		name: "Café com leite integral e açúcar",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 69,
		measure: "1 xícara",
		measureGrams: 100
	},
	{
		id: "caf-com-leite-desnatado-872",
		name: "Café com leite desnatado",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 28,
		measure: "1 xícara",
		measureGrams: 100
	},
	{
		id: "caf-com-leite-desnatado-e-a-car-873",
		name: "Café com leite desnatado e açúcar",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 52,
		measure: "1 xícara",
		measureGrams: 100
	},
	{
		id: "caf-sem-a-car-874",
		name: "Café sem açúcar",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 4,
		measure: "1 xíc. café",
		measureGrams: 50
	},
	{
		id: "caf-mocha-com-leite-integral-e-chantili-do-starb-875",
		name: "Café Mocha com leite integral e chantili do Starbucks",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 120,
		measure: "1 copo",
		measureGrams: 300
	},
	{
		id: "caf-mocha-com-leite-destanatado-do-starbucks-876",
		name: "Café Mocha com leite destanatado do Starbucks",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 73.3,
		measure: "1 copo",
		measureGrams: 300
	},
	{
		id: "cappuccino-tradicional-puro-877",
		name: "Cappuccino tradicional puro",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 65,
		measure: "1 xícara",
		measureGrams: 100
	},
	{
		id: "cappuccino-tradicional-com-a-car-878",
		name: "Cappuccino tradicional com açúcar",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 89,
		measure: "1 xícara",
		measureGrams: 100
	},
	{
		id: "cappuccino-com-leite-desnatado-e-ado-ante-879",
		name: "Cappuccino com leite desnatado e adoçante",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 48,
		measure: "1 xícara",
		measureGrams: 100
	},
	{
		id: "cappuccino-com-canela-pequeno-do-fran-s-caf-880",
		name: "Cappuccino com canela pequeno do Fran’s Café",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 104,
		measure: "1 xícara",
		measureGrams: 50
	},
	{
		id: "cappuccino-com-canela-grande-do-fran-s-caf-881",
		name: "Cappuccino com canela grande do Fran’s Café",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 95,
		measure: "1 xícara",
		measureGrams: 100
	},
	{
		id: "cappuccino-chocolate-pequeno-do-fran-s-caf-882",
		name: "Cappuccino chocolate pequeno do Fran’s Café",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 258,
		measure: "1 xícara",
		measureGrams: 50
	},
	{
		id: "cappuccino-chocolate-grande-do-fran-s-caf-883",
		name: "Cappuccino chocolate grande do Fran’s Café",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 251,
		measure: "1 xícara",
		measureGrams: 100
	},
	{
		id: "caf-mocha-pequeno-do-fran-s-caf-884",
		name: "Café mocha pequeno do Fran’s Café",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 132,
		measure: "1 xícara",
		measureGrams: 50
	},
	{
		id: "chocolate-quente-submarino-do-fran-s-caf-885",
		name: "Chocolate quente submarino do Fran’s Café",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 305,
		measure: "1 xícara",
		measureGrams: 100
	},
	{
		id: "caldo-de-cana-886",
		name: "Caldo de cana",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 69,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "ch-mate-natural-matte-le-o-887",
		name: "Chá mate natural “Matte Leão”",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 37,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "ch-mate-natural-diet-matte-le-o-888",
		name: "Chá mate natural diet “Matte Leão”",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 2.5,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "ch-preto-com-lim-o-lipton-889",
		name: "Chá preto com limão “Lipton”",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 35.9,
		measure: "1 lata",
		measureGrams: 340
	},
	{
		id: "ch-preto-sabor-p-ssego-nestea-890",
		name: "Chá preto sabor pêssego “Nestea”",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 34.7,
		measure: "1 lata",
		measureGrams: 340
	},
	{
		id: "isot-nico-sabor-a-a-guaran-gatorade-891",
		name: "Isotônico sabor açaí-guaraná “Gatorade”",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 24,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "isot-nico-sabor-tangerina-gatorade-892",
		name: "Isotônico sabor tangerina “Gatorade”",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 24,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "milk-shake-de-caf-do-fran-s-caf-893",
		name: "Milk shake de café do Fran’s Café",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 133.6,
		measure: "1 copo",
		measureGrams: 500
	},
	{
		id: "milk-shake-de-chocolate-diet-do-fran-s-caf-894",
		name: "Milk shake de chocolate diet do Fran’s Café",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 58.4,
		measure: "1 copo",
		measureGrams: 500
	},
	{
		id: "franccino-mocha-com-chantili-do-fran-s-caf-895",
		name: "Franccino Mocha com chantili do Fran’s Café",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 99.6,
		measure: "1 copo",
		measureGrams: 500
	},
	{
		id: "franccino-mocha-sem-chantili-do-fran-s-caf-896",
		name: "Franccino Mocha sem chantili do Fran’s Café",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 49.2,
		measure: "1 copo",
		measureGrams: 500
	},
	{
		id: "refresco-em-p-sabor-manga-mid-897",
		name: "Refresco em pó sabor manga “Mid”",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 13,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "refresco-em-p-sabor-uva-tang-898",
		name: "Refresco em pó sabor uva “Tang”",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 13,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "refresco-em-p-s-sabor-morango-silvestre-clight-899",
		name: "Refresco em pós sabor morango silvestre “Clight”",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 3,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "refrigerante-pepsi-twist-900",
		name: "Refrigerante “Pepsi” Twist",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 47,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "refrigerante-coca-cola-901",
		name: "Refrigerante Coca Cola",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 42.5,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "refrigerante-guaran-antartica-902",
		name: "Refrigerante guaraná “Antartica”",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 40,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "refrigerante-sabor-laranja-fanta-903",
		name: "Refrigerante sabor laranja “Fanta”",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 45,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "refrigerante-sabor-laranja-light-fanta-904",
		name: "Refrigerante sabor laranja light “Fanta”",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 4,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "refrigerante-sabor-uva-fanta-905",
		name: "Refrigerante sabor uva “Fanta”",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 52,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "refrigerante-sabor-uva-light-fanta-906",
		name: "Refrigerante sabor uva light “Fanta”",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 6,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "refrigerante-soda-limonada-antartica-907",
		name: "Refrigerante soda limonada “Antartica”",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 46,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "suco-africano-de-lichia-ceres-908",
		name: "Suco africano de lichia “Ceres”",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 52.5,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "suco-africano-de-uva-vermelha-ceres-909",
		name: "Suco africano de uva vermelha “Ceres”",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 58,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "suco-concentrado-sabor-maracuj-maguary-910",
		name: "Suco concentrado sabor maracujá “Maguary”",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 59.1,
		measure: "1 porção p/ misturar",
		measureGrams: 22
	},
	{
		id: "suco-de-abacaxi-caseiro-911",
		name: "Suco de abacaxi (caseiro) *",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 43,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "suco-de-cranberry-juxx-912",
		name: "Suco de cranberry “Juxx”",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 55,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "suco-de-laranja-mais-913",
		name: "Suco de laranja “Mais”",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 63.5,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "suco-de-laranja-caseiro-914",
		name: "Suco de laranja (caseiro) *",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 58,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "suco-de-lim-o-caseiro-915",
		name: "Suco de limão (caseiro) *",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 5,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "suco-de-ma-del-valle-916",
		name: "Suco de maçã “Del Valle”",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 46,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "suco-de-ma-yakult-917",
		name: "Suco de maçã “Yakult”",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 40,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "suco-de-ma-light-del-valle-918",
		name: "Suco de maçã light “Del Valle”",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 17.5,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "suco-de-manga-fruthos-919",
		name: "Suco de manga “Fruthos”",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 49.5,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "suco-de-manga-caseiro-920",
		name: "Suco de manga (caseiro) *",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 43,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "suco-de-manga-light-fruthos-921",
		name: "Suco de manga light “Fruthos”",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 43.5,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "suco-de-maracuj-caseiro-922",
		name: "Suco de maracujá (caseiro) *",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 10,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "suco-de-mel-o-caseiro-923",
		name: "Suco de melão (caseiro) *",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 30,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "suco-de-milho-verde-924",
		name: "Suco de milho verde",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 135.5,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "suco-de-morango-caseiro-925",
		name: "Suco de morango (caseiro) *",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 35,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "suco-de-p-ssego-sufresh-926",
		name: "Suco de pêssego “Sufresh”",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 37,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "suco-de-tomate-temperado-superbom-927",
		name: "Suco de tomate temperado “Superbom”",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 15,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "suco-de-uva-del-valle-928",
		name: "Suco de uva “Del Valle”",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 63,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "suco-de-uva-diet-del-valle-929",
		name: "Suco de uva diet “Del Valle”",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 17.5,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "suplemento-de-vitaminas-taff-man-e-930",
		name: "Suplemento de vitaminas “Taff Man-e”",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 63.6,
		measure: "1 vidro",
		measureGrams: 110
	},
	{
		id: "vanilla-latte-do-mc-caf-931",
		name: "Vanilla Latte do Mc Café",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 34.4,
		measure: "1 copo",
		measureGrams: 500
	},
	{
		id: "xarope-artificial-sabor-groselha-tropical-932",
		name: "Xarope artificial sabor groselha “Tropical”",
		category: "Bebidas não alcoólicas",
		kcalPer100g: 325,
		measure: "1 porção p/ misturar",
		measureGrams: 20
	},
	{
		id: "aguardente-933",
		name: "Aguardente",
		category: "Bebidas alcoólicas",
		kcalPer100g: 230,
		measure: "1 dose",
		measureGrams: 50
	},
	{
		id: "batida-de-frutas-com-leite-condensado-934",
		name: "Batida de frutas com leite condensado",
		category: "Bebidas alcoólicas",
		kcalPer100g: 252,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "caipirinha-de-lim-o-com-a-car-aguardente-935",
		name: "Caipirinha de limão com açúcar (aguardente)",
		category: "Bebidas alcoólicas",
		kcalPer100g: 150,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "caipirinha-de-lim-o-com-a-car-vodca-936",
		name: "Caipirinha de limão com açúcar (vodca)",
		category: "Bebidas alcoólicas",
		kcalPer100g: 155,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "caipirinha-de-lim-o-com-ado-ante-aguardente-937",
		name: "Caipirinha de limão com adoçante (aguardente)",
		category: "Bebidas alcoólicas",
		kcalPer100g: 120,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "caipirinha-de-morango-com-a-car-saqu-938",
		name: "Caipirinha de morango com açúcar (saquê)",
		category: "Bebidas alcoólicas",
		kcalPer100g: 170,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "cerveja-939",
		name: "Cerveja",
		category: "Bebidas alcoólicas",
		kcalPer100g: 43.1,
		measure: "1 lata",
		measureGrams: 350
	},
	{
		id: "cerveja-malzbier-brahma-940",
		name: "Cerveja Malzbier “Brahma”",
		category: "Bebidas alcoólicas",
		kcalPer100g: 56.1,
		measure: "1 long neck",
		measureGrams: 355
	},
	{
		id: "cerveja-sem-lcool-941",
		name: "Cerveja sem álcool",
		category: "Bebidas alcoólicas",
		kcalPer100g: 25.1,
		measure: "1 long neck",
		measureGrams: 355
	},
	{
		id: "champanhe-942",
		name: "Champanhe",
		category: "Bebidas alcoólicas",
		kcalPer100g: 88,
		measure: "1 taça",
		measureGrams: 125
	},
	{
		id: "chope-943",
		name: "Chope",
		category: "Bebidas alcoólicas",
		kcalPer100g: 60,
		measure: "1 tulipa",
		measureGrams: 300
	},
	{
		id: "conhaque-944",
		name: "Conhaque",
		category: "Bebidas alcoólicas",
		kcalPer100g: 250,
		measure: "1 dose",
		measureGrams: 50
	},
	{
		id: "cuba-libre-945",
		name: "Cuba Libre",
		category: "Bebidas alcoólicas",
		kcalPer100g: 68,
		measure: "1 copo",
		measureGrams: 250
	},
	{
		id: "gim-946",
		name: "Gim",
		category: "Bebidas alcoólicas",
		kcalPer100g: 200,
		measure: "1 dose",
		measureGrams: 30
	},
	{
		id: "margarita-947",
		name: "Margarita",
		category: "Bebidas alcoólicas",
		kcalPer100g: 87.3,
		measure: "1 copo",
		measureGrams: 150
	},
	{
		id: "mojito-948",
		name: "Mojito",
		category: "Bebidas alcoólicas",
		kcalPer100g: 125,
		measure: "1 copo",
		measureGrams: 200
	},
	{
		id: "quent-o-949",
		name: "Quentão",
		category: "Bebidas alcoólicas",
		kcalPer100g: 294,
		measure: "1 porcao",
		measureGrams: 100
	},
	{
		id: "prosecco-950",
		name: "Prosecco",
		category: "Bebidas alcoólicas",
		kcalPer100g: 84.8,
		measure: "1 taça",
		measureGrams: 125
	},
	{
		id: "rum-951",
		name: "Rum",
		category: "Bebidas alcoólicas",
		kcalPer100g: 220,
		measure: "1 dose",
		measureGrams: 50
	},
	{
		id: "saqu-952",
		name: "Saquê",
		category: "Bebidas alcoólicas",
		kcalPer100g: 142.9,
		measure: "1 cálice",
		measureGrams: 35
	},
	{
		id: "smirnoff-ice-953",
		name: "Smirnoff Ice",
		category: "Bebidas alcoólicas",
		kcalPer100g: 87.3,
		measure: "1 long neck",
		measureGrams: 275
	},
	{
		id: "tequila-954",
		name: "Tequila",
		category: "Bebidas alcoólicas",
		kcalPer100g: 220,
		measure: "1 dose",
		measureGrams: 50
	},
	{
		id: "u-sque-955",
		name: "Uísque",
		category: "Bebidas alcoólicas",
		kcalPer100g: 240,
		measure: "1 dose",
		measureGrams: 50
	},
	{
		id: "vinho-branco-doce-956",
		name: "Vinho branco doce",
		category: "Bebidas alcoólicas",
		kcalPer100g: 138.4,
		measure: "1 taça",
		measureGrams: 125
	},
	{
		id: "vinho-branco-seco-957",
		name: "Vinho branco seco",
		category: "Bebidas alcoólicas",
		kcalPer100g: 85.6,
		measure: "1 taça",
		measureGrams: 125
	},
	{
		id: "vinho-quente-958",
		name: "Vinho Quente",
		category: "Bebidas alcoólicas",
		kcalPer100g: 120,
		measure: "1 porcao",
		measureGrams: 100
	},
	{
		id: "vinho-tinto-959",
		name: "Vinho tinto",
		category: "Bebidas alcoólicas",
		kcalPer100g: 85.6,
		measure: "1 taça",
		measureGrams: 125
	},
	{
		id: "vodca-960",
		name: "Vodca",
		category: "Bebidas alcoólicas",
		kcalPer100g: 240,
		measure: "1 dose",
		measureGrams: 50
	},
	{
		id: "alichela-magazzino-961",
		name: "Alichela “Magazzino”",
		category: "Molhos",
		kcalPer100g: 400,
		measure: "1 col. sopa",
		measureGrams: 10
	},
	{
		id: "barbecue-962",
		name: "Barbecue",
		category: "Molhos",
		kcalPer100g: 166.7,
		measure: "1 col. sopa",
		measureGrams: 12
	},
	{
		id: "catchup-963",
		name: "Catchup",
		category: "Molhos",
		kcalPer100g: 91.7,
		measure: "1 col. sopa",
		measureGrams: 12
	},
	{
		id: "chutney-de-manga-964",
		name: "Chutney de manga",
		category: "Molhos",
		kcalPer100g: 155,
		measure: "1 col. sopa",
		measureGrams: 20
	},
	{
		id: "maionese-hellmann-s-965",
		name: "Maionese “Hellmann’s”",
		category: "Molhos",
		kcalPer100g: 400,
		measure: "1 col. sopa",
		measureGrams: 12
	},
	{
		id: "maionese-0-colesterol-hellmann-s-966",
		name: "Maionese 0% colesterol “Hellmann’s”",
		category: "Molhos",
		kcalPer100g: 133.3,
		measure: "1 col. sopa",
		measureGrams: 12
	},
	{
		id: "maionese-deleite-hellmann-s-967",
		name: "Maionese Deleite “Hellmann’s”",
		category: "Molhos",
		kcalPer100g: 225,
		measure: "1 col. sopa",
		measureGrams: 12
	},
	{
		id: "maionese-light-hellmann-s-968",
		name: "Maionese light “Hellmann’s”",
		category: "Molhos",
		kcalPer100g: 333.3,
		measure: "1 col. sopa",
		measureGrams: 12
	},
	{
		id: "molho-agridoce-sakura-969",
		name: "Molho agridoce “Sakura”",
		category: "Molhos",
		kcalPer100g: 133.3,
		measure: "1 col. sopa",
		measureGrams: 15
	},
	{
		id: "molho-de-alho-istambul-970",
		name: "Molho de alho “Istambul”",
		category: "Molhos",
		kcalPer100g: 250,
		measure: "1 col. chá",
		measureGrams: 6
	},
	{
		id: "molho-de-gergelim-istambul-971",
		name: "Molho de gergelim “Istambul”",
		category: "Molhos",
		kcalPer100g: 83.3,
		measure: "1 col. chá",
		measureGrams: 6
	},
	{
		id: "molho-de-iogurte-para-salada-master-foods-972",
		name: "Molho de iogurte para salada “Master Foods”",
		category: "Molhos",
		kcalPer100g: 133.3,
		measure: "1 col. sopa",
		measureGrams: 15
	},
	{
		id: "molho-de-mostarda-para-salada-master-foods-973",
		name: "Molho de mostarda para salada “Master Foods”",
		category: "Molhos",
		kcalPer100g: 100,
		measure: "1 col. sopa",
		measureGrams: 15
	},
	{
		id: "molho-de-parmes-o-para-salada-hellmann-s-974",
		name: "Molho de parmesão para salada “Hellmann’s”",
		category: "Molhos",
		kcalPer100g: 533.3,
		measure: "1 col. sopa",
		measureGrams: 15
	},
	{
		id: "molho-de-soja-shoyo-975",
		name: "Molho de soja (shoyo)",
		category: "Molhos",
		kcalPer100g: 50,
		measure: "1 col. sopa",
		measureGrams: 10
	},
	{
		id: "molho-ingl-s-976",
		name: "Molho inglês",
		category: "Molhos",
		kcalPer100g: 50,
		measure: "1 col. sopa",
		measureGrams: 10
	},
	{
		id: "molho-para-carpaccio-la-table-dor-977",
		name: "Molho para carpaccio “La Table Dor”",
		category: "Molhos",
		kcalPer100g: 66.7,
		measure: "1 col sopa",
		measureGrams: 15
	},
	{
		id: "molho-ros-hellmann-s-978",
		name: "Molho rosé “Hellmann’s”",
		category: "Molhos",
		kcalPer100g: 353.8,
		measure: "1 col. sopa",
		measureGrams: 13
	},
	{
		id: "molho-t-rtaro-979",
		name: "Molho tártaro",
		category: "Molhos",
		kcalPer100g: 426.7,
		measure: "1 col. sopa",
		measureGrams: 15
	},
	{
		id: "mostarda-980",
		name: "Mostarda",
		category: "Molhos",
		kcalPer100g: 83.3,
		measure: "1 col. sopa",
		measureGrams: 12
	},
	{
		id: "sardela-la-table-d-or-981",
		name: "Sardela “La Table D’or”",
		category: "Molhos",
		kcalPer100g: 280,
		measure: "2 col. sopa",
		measureGrams: 10
	},
	{
		id: "tahine-creme-de-gergelim-jasmine-982",
		name: "Tahine (creme de gergelim) “Jasmine”",
		category: "Molhos",
		kcalPer100g: 593.3,
		measure: "1 col. sobremesa",
		measureGrams: 15
	},
	{
		id: "vinagrete-983",
		name: "Vinagrete",
		category: "Molhos",
		kcalPer100g: 233.3,
		measure: "1 col. sopa",
		measureGrams: 15
	},
	{
		id: "acaraj-984",
		name: "Acarajé",
		category: "Pratos caseiros",
		kcalPer100g: 289,
		measure: "1 unidade",
		measureGrams: 100
	},
	{
		id: "arroz-com-lentilha-almanara-985",
		name: "Arroz com lentilha “Almanara”",
		category: "Pratos caseiros",
		kcalPer100g: 160,
		measure: "1 col. sopa",
		measureGrams: 20
	},
	{
		id: "arroz-de-carreteiro-arroz-com-carne-seca-986",
		name: "Arroz de carreteiro (arroz com carne seca)",
		category: "Pratos caseiros",
		kcalPer100g: 155,
		measure: "1 col. sopa",
		measureGrams: 20
	},
	{
		id: "batata-saut-987",
		name: "Batata sauté",
		category: "Pratos caseiros",
		kcalPer100g: 68,
		measure: "1 prato raso",
		measureGrams: 100
	},
	{
		id: "bob-de-camar-o-988",
		name: "Bobó de camarão",
		category: "Pratos caseiros",
		kcalPer100g: 164,
		measure: "1 prato raso",
		measureGrams: 225
	},
	{
		id: "chuchu-ao-molho-branco-989",
		name: "Chuchu ao molho branco",
		category: "Pratos caseiros",
		kcalPer100g: 93.3,
		measure: "1 col. sopa cheia",
		measureGrams: 30
	},
	{
		id: "couve-flor-milanesa-990",
		name: "Couve flor à milanesa",
		category: "Pratos caseiros",
		kcalPer100g: 152.2,
		measure: "1 ramo médio",
		measureGrams: 90
	},
	{
		id: "creme-de-espinafre-991",
		name: "Creme de espinafre",
		category: "Pratos caseiros",
		kcalPer100g: 134.3,
		measure: "1 col. sopa cheia",
		measureGrams: 35
	},
	{
		id: "creme-de-milho-992",
		name: "Creme de milho",
		category: "Pratos caseiros",
		kcalPer100g: 106.1,
		measure: "1 col. sopa cheia",
		measureGrams: 33
	},
	{
		id: "cuscuz-de-milho-993",
		name: "Cuscuz de milho",
		category: "Pratos caseiros",
		kcalPer100g: 190.4,
		measure: "1 pedaço médio",
		measureGrams: 135
	},
	{
		id: "cuscuz-de-tapioca-994",
		name: "Cuscuz de tapioca",
		category: "Pratos caseiros",
		kcalPer100g: 248.3,
		measure: "1 fatia média",
		measureGrams: 120
	},
	{
		id: "dobradinha-995",
		name: "Dobradinha",
		category: "Pratos caseiros",
		kcalPer100g: 111.4,
		measure: "1 col. sopa cheia",
		measureGrams: 35
	},
	{
		id: "estrogonofe-de-carne-996",
		name: "Estrogonofe de carne",
		category: "Pratos caseiros",
		kcalPer100g: 172,
		measure: "1 col. sopa cheia",
		measureGrams: 25
	},
	{
		id: "estrogonofe-de-frango-997",
		name: "Estrogonofe de frango",
		category: "Pratos caseiros",
		kcalPer100g: 196,
		measure: "1 col. sopa cheia",
		measureGrams: 25
	},
	{
		id: "feijoada-feij-o-preto-carne-seca-e-lingui-a-998",
		name: "Feijoada (feijão preto, carne seca e linguiça)",
		category: "Pratos caseiros",
		kcalPer100g: 154.2,
		measure: "1 concha média",
		measureGrams: 225
	},
	{
		id: "pir-o-999",
		name: "Pirão",
		category: "Pratos caseiros",
		kcalPer100g: 120,
		measure: "1 col. sopa cheia",
		measureGrams: 30
	},
	{
		id: "pur-de-batata-1000",
		name: "Purê de batata",
		category: "Pratos caseiros",
		kcalPer100g: 124.4,
		measure: "1 col. sopa cheia",
		measureGrams: 45
	},
	{
		id: "quibebe-1001",
		name: "Quibebe",
		category: "Pratos caseiros",
		kcalPer100g: 102.9,
		measure: "1 col. sopa cheia",
		measureGrams: 35
	},
	{
		id: "rabada-1002",
		name: "Rabada",
		category: "Pratos caseiros",
		kcalPer100g: 311.7,
		measure: "1 pedaço médio",
		measureGrams: 60
	},
	{
		id: "risoto-de-frango-1003",
		name: "Risoto de frango",
		category: "Pratos caseiros",
		kcalPer100g: 180,
		measure: "1 col. sopa cheia",
		measureGrams: 25
	},
	{
		id: "salada-de-batata-com-maionese-1004",
		name: "Salada de batata com maionese",
		category: "Pratos caseiros",
		kcalPer100g: 152.6,
		measure: "1 col. sopa cheia",
		measureGrams: 38
	},
	{
		id: "salada-waldorf-1005",
		name: "Salada Waldorf",
		category: "Pratos caseiros",
		kcalPer100g: 92.1,
		measure: "1 col. sopa cheia",
		measureGrams: 38
	},
	{
		id: "salpic-o-de-frango-1006",
		name: "Salpicão de frango",
		category: "Pratos caseiros",
		kcalPer100g: 188,
		measure: "1 col. sopa cheia",
		measureGrams: 25
	},
	{
		id: "sufl-de-queijo-1007",
		name: "Suflê de queijo",
		category: "Pratos caseiros",
		kcalPer100g: 114.4,
		measure: "1 pedaço médio",
		measureGrams: 90
	},
	{
		id: "tutu-de-feij-o-1008",
		name: "Tutu de feijão",
		category: "Pratos caseiros",
		kcalPer100g: 114.3,
		measure: "1 col. sopa cheia",
		measureGrams: 35
	},
	{
		id: "caldinho-de-ervilha-1009",
		name: "Caldinho de ervilha",
		category: "Sopas e Caldos",
		kcalPer100g: 92,
		measure: "1 copo pequeno",
		measureGrams: 100
	},
	{
		id: "caldinho-de-feij-o-1010",
		name: "Caldinho de feijão",
		category: "Sopas e Caldos",
		kcalPer100g: 104,
		measure: "1 copo pequeno",
		measureGrams: 100
	},
	{
		id: "caldo-verde-1011",
		name: "Caldo verde",
		category: "Sopas e Caldos",
		kcalPer100g: 60,
		measure: "1 prato fundo",
		measureGrams: 200
	},
	{
		id: "canja-1012",
		name: "Canja",
		category: "Sopas e Caldos",
		kcalPer100g: 40,
		measure: "1 prato fundo",
		measureGrams: 200
	},
	{
		id: "creme-de-aspargos-campbell-s-1013",
		name: "Creme de aspargos “Campbell’s”",
		category: "Sopas e Caldos",
		kcalPer100g: 91.5,
		measure: "1 prato fundo",
		measureGrams: 200
	},
	{
		id: "creme-de-cebola-campbell-s-1014",
		name: "Creme de cebola “Campbell’s”",
		category: "Sopas e Caldos",
		kcalPer100g: 83.5,
		measure: "1 prato fundo",
		measureGrams: 200
	},
	{
		id: "creme-de-champignon-campbell-s-1015",
		name: "Creme de champignon “Campbell’s”",
		category: "Sopas e Caldos",
		kcalPer100g: 83.5,
		measure: "1 prato fundo",
		measureGrams: 200
	},
	{
		id: "creme-de-palmito-1016",
		name: "Creme de palmito",
		category: "Sopas e Caldos",
		kcalPer100g: 90,
		measure: "1 prato fundo",
		measureGrams: 200
	},
	{
		id: "creme-de-queijo-qualimax-1017",
		name: "Creme de queijo “Qualimax”",
		category: "Sopas e Caldos",
		kcalPer100g: 30.5,
		measure: "1 prato fundo",
		measureGrams: 200
	},
	{
		id: "sopa-de-br-coli-com-queijo-campbell-s-1018",
		name: "Sopa de brócoli com queijo “Campbell’s”",
		category: "Sopas e Caldos",
		kcalPer100g: 83.5,
		measure: "1 prato fundo",
		measureGrams: 200
	},
	{
		id: "sopa-de-ervilha-com-presunto-e-bacon-campbell-s-1019",
		name: "Sopa de ervilha com presunto e bacon “Campbell’s”",
		category: "Sopas e Caldos",
		kcalPer100g: 150,
		measure: "1 prato fundo",
		measureGrams: 200
	},
	{
		id: "sopa-de-feij-o-com-macarr-o-1020",
		name: "Sopa de feijão com macarrão",
		category: "Sopas e Caldos",
		kcalPer100g: 138,
		measure: "1 prato fundo",
		measureGrams: 200
	},
	{
		id: "sopa-de-galinha-maggi-1021",
		name: "Sopa de galinha “Maggi”",
		category: "Sopas e Caldos",
		kcalPer100g: 34.5,
		measure: "1 prato fundo",
		measureGrams: 200
	},
	{
		id: "sopa-de-gr-o-de-bico-1022",
		name: "Sopa de grão de bico",
		category: "Sopas e Caldos",
		kcalPer100g: 95,
		measure: "1 prato fundo",
		measureGrams: 200
	},
	{
		id: "sopa-de-legumes-1023",
		name: "Sopa de legumes",
		category: "Sopas e Caldos",
		kcalPer100g: 75,
		measure: "1 prato fundo",
		measureGrams: 200
	},
	{
		id: "sopa-de-lentilha-1024",
		name: "Sopa de lentilha",
		category: "Sopas e Caldos",
		kcalPer100g: 120,
		measure: "1 prato fundo",
		measureGrams: 200
	},
	{
		id: "sopa-de-mandioquinha-1025",
		name: "Sopa de mandioquinha",
		category: "Sopas e Caldos",
		kcalPer100g: 65,
		measure: "1 prato fundo",
		measureGrams: 200
	},
	{
		id: "sopa-de-tomate-campbell-s-1026",
		name: "Sopa de tomate “Campbell’s”",
		category: "Sopas e Caldos",
		kcalPer100g: 75,
		measure: "1 prato fundo",
		measureGrams: 200
	},
	{
		id: "am-ndoa-torrada-e-salgada-dr-oetker-1027",
		name: "Amêndoa torrada e salgada “Dr. Oetker”",
		category: "Salgados e Petiscos",
		kcalPer100g: 613.3,
		measure: "1 col. sopa",
		measureGrams: 15
	},
	{
		id: "amendoim-doce-yoki-1028",
		name: "Amendoim doce “Yoki”",
		category: "Salgados e Petiscos",
		kcalPer100g: 486.7,
		measure: "1 col. sopa",
		measureGrams: 15
	},
	{
		id: "amendoim-japon-s-iracema-1029",
		name: "Amendoim japonês “Iracema”",
		category: "Salgados e Petiscos",
		kcalPer100g: 500,
		measure: "1/4 xíc. chá",
		measureGrams: 20
	},
	{
		id: "amendoim-salgado-com-pele-yoki-1030",
		name: "Amendoim salgado com pele “Yoki”",
		category: "Salgados e Petiscos",
		kcalPer100g: 573.3,
		measure: "1 col. sopa",
		measureGrams: 15
	},
	{
		id: "avel-1031",
		name: "Avelã",
		category: "Salgados e Petiscos",
		kcalPer100g: 700,
		measure: "1 unidade",
		measureGrams: 1
	},
	{
		id: "azeitona-preta-raiola-1032",
		name: "Azeitona preta “Raiola”",
		category: "Salgados e Petiscos",
		kcalPer100g: 200,
		measure: "2 unidades",
		measureGrams: 10
	},
	{
		id: "azeitona-verde-raiola-1033",
		name: "Azeitona verde “Raiola”",
		category: "Salgados e Petiscos",
		kcalPer100g: 200,
		measure: "2 unidades",
		measureGrams: 10
	},
	{
		id: "banana-milanesa-1034",
		name: "Banana à milanesa",
		category: "Salgados e Petiscos",
		kcalPer100g: 251,
		measure: "1 unidade média",
		measureGrams: 100
	},
	{
		id: "baconzitos-elma-chips-1035",
		name: "Baconzitos “Elma Chips”",
		category: "Salgados e Petiscos",
		kcalPer100g: 504,
		measure: "3 xíc. chá",
		measureGrams: 25
	},
	{
		id: "batata-chip-1036",
		name: "Batata chip",
		category: "Salgados e Petiscos",
		kcalPer100g: 533.3,
		measure: "1 porcao",
		measureGrams: 30
	},
	{
		id: "batata-frita-m-dia-mc-donald-s-1037",
		name: "Batata frita média “Mc Donald’s”",
		category: "Salgados e Petiscos",
		kcalPer100g: 282.4,
		measure: "1 caixinha",
		measureGrams: 102
	},
	{
		id: "batata-frita-original-pringles-1038",
		name: "Batata frita original “Pringles”",
		category: "Salgados e Petiscos",
		kcalPer100g: 556,
		measure: "12 unidades",
		measureGrams: 25
	},
	{
		id: "batata-palha-1039",
		name: "Batata palha",
		category: "Salgados e Petiscos",
		kcalPer100g: 620,
		measure: "1 xíc. chá",
		measureGrams: 25
	},
	{
		id: "batata-ruffles-1040",
		name: "Batata ruffles",
		category: "Salgados e Petiscos",
		kcalPer100g: 564,
		measure: "1 e 1/2 xíc. chá",
		measureGrams: 25
	},
	{
		id: "bolinha-de-queijo-sadia-1041",
		name: "Bolinha de queijo “Sadia”",
		category: "Salgados e Petiscos",
		kcalPer100g: 270,
		measure: "1 e 1/2 unidade",
		measureGrams: 40
	},
	{
		id: "bolinho-de-aipim-com-carne-mo-da-sadia-1042",
		name: "Bolinho de aipim com carne moída “Sadia”",
		category: "Salgados e Petiscos",
		kcalPer100g: 225,
		measure: "1 unidade",
		measureGrams: 40
	},
	{
		id: "bolinho-de-arroz-1043",
		name: "Bolinho de arroz",
		category: "Salgados e Petiscos",
		kcalPer100g: 235,
		measure: "1 unidade média",
		measureGrams: 40
	},
	{
		id: "bolinho-de-bacalhau-1044",
		name: "Bolinho de bacalhau",
		category: "Salgados e Petiscos",
		kcalPer100g: 283.3,
		measure: "1 unidade grd.",
		measureGrams: 60
	},
	{
		id: "castanha-de-caju-dr-oetker-1045",
		name: "Castanha de caju “Dr. Oetker”",
		category: "Salgados e Petiscos",
		kcalPer100g: 626.7,
		measure: "1 col. sopa",
		measureGrams: 15
	},
	{
		id: "castanha-do-par-estrela-do-oriente-1046",
		name: "Castanha do pará “Estrela do Oriente”",
		category: "Salgados e Petiscos",
		kcalPer100g: 700,
		measure: "2 unidades",
		measureGrams: 10
	},
	{
		id: "castanha-portuguesa-1047",
		name: "Castanha portuguesa",
		category: "Salgados e Petiscos",
		kcalPer100g: 200,
		measure: "1 unidade",
		measureGrams: 10
	},
	{
		id: "cebolitos-elma-chips-1048",
		name: "Cebolitos “Elma Chips”",
		category: "Salgados e Petiscos",
		kcalPer100g: 492,
		measure: "2 xíc. chá",
		measureGrams: 25
	},
	{
		id: "coxinha-de-frango-1049",
		name: "Coxinha de frango",
		category: "Salgados e Petiscos",
		kcalPer100g: 284,
		measure: "1 unidade",
		measureGrams: 50
	},
	{
		id: "croquete-de-carne-1050",
		name: "Croquete de carne",
		category: "Salgados e Petiscos",
		kcalPer100g: 348,
		measure: "1 unidade média",
		measureGrams: 25
	},
	{
		id: "croquete-de-milho-1051",
		name: "Croquete de milho",
		category: "Salgados e Petiscos",
		kcalPer100g: 350,
		measure: "1 unidade média",
		measureGrams: 22
	},
	{
		id: "doritos-elma-chips-1052",
		name: "Doritos “Elma Chips”",
		category: "Salgados e Petiscos",
		kcalPer100g: 500,
		measure: "1 e 1/2 xíc. chá",
		measureGrams: 25
	},
	{
		id: "empadinha-de-frango-1053",
		name: "Empadinha de frango",
		category: "Salgados e Petiscos",
		kcalPer100g: 358,
		measure: "1 unidade",
		measureGrams: 50
	},
	{
		id: "esfiha-de-carne-fechada-sabor-e-aroma-1054",
		name: "Esfiha de carne fechada “Sabor e Aroma”",
		category: "Salgados e Petiscos",
		kcalPer100g: 250,
		measure: "1 unidade peq.",
		measureGrams: 26
	},
	{
		id: "esfiha-fechada-de-calabresa-liban-1055",
		name: "Esfiha fechada de calabresa “Liban”",
		category: "Salgados e Petiscos",
		kcalPer100g: 240,
		measure: "1 unidade grd.",
		measureGrams: 50
	},
	{
		id: "fandangos-sabor-presunto-1056",
		name: "Fandangos sabor presunto",
		category: "Salgados e Petiscos",
		kcalPer100g: 444,
		measure: "1 e 1/2 xíc. chá",
		measureGrams: 25
	},
	{
		id: "gergelim-jasmine-1057",
		name: "Gergelim “Jasmine”",
		category: "Salgados e Petiscos",
		kcalPer100g: 606.7,
		measure: "1 col. sopa",
		measureGrams: 15
	},
	{
		id: "macad-mia-qualit-1058",
		name: "Macadâmia “Qualitá”",
		category: "Salgados e Petiscos",
		kcalPer100g: 675,
		measure: "5 unidades",
		measureGrams: 12
	},
	{
		id: "mandioca-frita-1059",
		name: "Mandioca frita",
		category: "Salgados e Petiscos",
		kcalPer100g: 356.2,
		measure: "1 pedaço médio",
		measureGrams: 80
	},
	{
		id: "mini-hot-dog-1060",
		name: "Mini hot dog",
		category: "Salgados e Petiscos",
		kcalPer100g: 470,
		measure: "1 unidade",
		measureGrams: 20
	},
	{
		id: "mini-quibe-sadia-1061",
		name: "Mini quibe “Sadia”",
		category: "Salgados e Petiscos",
		kcalPer100g: 235,
		measure: "1 unidade",
		measureGrams: 40
	},
	{
		id: "nozes-1062",
		name: "Nozes",
		category: "Salgados e Petiscos",
		kcalPer100g: 652,
		measure: "5 unidades",
		measureGrams: 25
	},
	{
		id: "ovinhos-de-amendoim-1063",
		name: "Ovinhos de amendoim",
		category: "Salgados e Petiscos",
		kcalPer100g: 464,
		measure: "1/2 xíc. chá",
		measureGrams: 25
	},
	{
		id: "pastel-de-carne-1064",
		name: "Pastel de carne",
		category: "Salgados e Petiscos",
		kcalPer100g: 262.5,
		measure: "1 unidade média",
		measureGrams: 32
	},
	{
		id: "pastel-de-palmito-1065",
		name: "Pastel de palmito",
		category: "Salgados e Petiscos",
		kcalPer100g: 270,
		measure: "1 unidade média",
		measureGrams: 30
	},
	{
		id: "pastel-de-queijo-1066",
		name: "Pastel de queijo",
		category: "Salgados e Petiscos",
		kcalPer100g: 304,
		measure: "1 unidade média",
		measureGrams: 25
	},
	{
		id: "pingo-d-ouro-elma-chips-1067",
		name: "Pingo D’Ouro “Elma Chips”",
		category: "Salgados e Petiscos",
		kcalPer100g: 516,
		measure: "1/2 xíc. chá",
		measureGrams: 25
	},
	{
		id: "pinh-o-cozido-1068",
		name: "Pinhão cozido",
		category: "Salgados e Petiscos",
		kcalPer100g: 177,
		measure: "10 unidades",
		measureGrams: 100
	},
	{
		id: "pipoca-doce-1069",
		name: "Pipoca doce",
		category: "Salgados e Petiscos",
		kcalPer100g: 448,
		measure: "1 xíc. chá",
		measureGrams: 25
	},
	{
		id: "pipoca-para-micro-ondas-manteiga-yoki-1070",
		name: "Pipoca para micro-ondas manteiga “Yoki”",
		category: "Salgados e Petiscos",
		kcalPer100g: 440,
		measure: "1 xíc. chá",
		measureGrams: 25
	},
	{
		id: "pistache-torrado-e-salgado-royale-1071",
		name: "Pistache torrado e salgado “Royale”",
		category: "Salgados e Petiscos",
		kcalPer100g: 566.7,
		measure: "1 col. sopa",
		measureGrams: 15
	},
	{
		id: "risole-de-queijo-1072",
		name: "Risole de queijo",
		category: "Salgados e Petiscos",
		kcalPer100g: 425.7,
		measure: "1 unidade média",
		measureGrams: 35
	},
	{
		id: "salgadinho-frito-1073",
		name: "Salgadinho frito",
		category: "Salgados e Petiscos",
		kcalPer100g: 333.3,
		measure: "1 porcao",
		measureGrams: 30
	},
	{
		id: "salgadinho-frito-industrializado-1074",
		name: "Salgadinho frito industrializado",
		category: "Salgados e Petiscos",
		kcalPer100g: 533.3,
		measure: "1 porcao",
		measureGrams: 30
	},
	{
		id: "salgadinho-industrializado-a-base-de-milho-1075",
		name: "Salgadinho industrializado a base de milho",
		category: "Salgados e Petiscos",
		kcalPer100g: 433.3,
		measure: "1 porcao",
		measureGrams: 30
	},
	{
		id: "salgadinho-ao-forno-sabor-queijo-com-ervas-finas-1076",
		name: "Salgadinho ao Forno Sabor Queijo com Ervas Finas “Elma Chips”",
		category: "Salgados e Petiscos",
		kcalPer100g: 376,
		measure: "1 e 1/2 xíc. chá",
		measureGrams: 25
	},
	{
		id: "salgadinho-de-camar-o-ebicen-1077",
		name: "Salgadinho de camarão “Ebicen”",
		category: "Salgados e Petiscos",
		kcalPer100g: 392,
		measure: "1 xíc. chá",
		measureGrams: 25
	},
	{
		id: "salgadinho-de-milho-com-queijo-cheetos-1078",
		name: "Salgadinho de milho com queijo “Cheetos”",
		category: "Salgados e Petiscos",
		kcalPer100g: 480,
		measure: "2 xíc. chá",
		measureGrams: 25
	},
	{
		id: "salgadinho-torrado-de-arroz-com-alga-marinha-oka-1079",
		name: "Salgadinho Torrado de Arroz com Alga Marinha “Okaki”",
		category: "Salgados e Petiscos",
		kcalPer100g: 386.7,
		measure: "1/2 xíc. chá",
		measureGrams: 30
	},
	{
		id: "sardinha-frita-1080",
		name: "Sardinha frita",
		category: "Salgados e Petiscos",
		kcalPer100g: 364,
		measure: "1 unidade média",
		measureGrams: 25
	},
	{
		id: "semente-de-ab-bora-estrela-do-oriente-1081",
		name: "Semente de abóbora “Estrela do Oriente”",
		category: "Salgados e Petiscos",
		kcalPer100g: 450,
		measure: "1 col. sopa",
		measureGrams: 10
	},
	{
		id: "snacks-integrais-sabor-queijo-vitao-1082",
		name: "Snacks Integrais Sabor Queijo “Vitao”",
		category: "Salgados e Petiscos",
		kcalPer100g: 388,
		measure: "2 xic. chá",
		measureGrams: 25
	},
	{
		id: "soja-sabor-queijo-estrela-do-oriente-1083",
		name: "Soja sabor Queijo “Estrela do Oriente”",
		category: "Salgados e Petiscos",
		kcalPer100g: 400,
		measure: "1 col. sopa",
		measureGrams: 10
	},
	{
		id: "bauru-1084",
		name: "Bauru",
		category: "Sanduíches",
		kcalPer100g: 291.7,
		measure: "1 unidade",
		measureGrams: 120
	},
	{
		id: "beirute-de-rosbife-1085",
		name: "Beirute de rosbife",
		category: "Sanduíches",
		kcalPer100g: 253.3,
		measure: "1 unidade",
		measureGrams: 150
	},
	{
		id: "big-mac-mc-donald-s-1086",
		name: "Big Mac “Mc Donald’s”",
		category: "Sanduíches",
		kcalPer100g: 247.1,
		measure: "1 unidade",
		measureGrams: 204
	},
	{
		id: "cachorro-quente-com-molho-de-tomate-bob-s-1087",
		name: "Cachorro quente com molho de tomate “Bob’s”",
		category: "Sanduíches",
		kcalPer100g: 223.8,
		measure: "1 unidade",
		measureGrams: 130
	},
	{
		id: "cachorro-quente-completo-com-molho-milho-ervilha-1088",
		name: "Cachorro quente completo (com molho, milho, ervilha, ovo de codorna, maionese, catchup, mostarda, queijo ralado e batata palha)",
		category: "Sanduíches",
		kcalPer100g: 272,
		measure: "1 unidade",
		measureGrams: 250
	},
	{
		id: "cheddar-mcmelt-mc-donald-s-1089",
		name: "Cheddar McMelt “Mc Donald’s”",
		category: "Sanduíches",
		kcalPer100g: 280.1,
		measure: "1 unidade",
		measureGrams: 181
	},
	{
		id: "cheese-salada-com-maionese-bob-s-1090",
		name: "Cheese salada com maionese “Bob’s”",
		category: "Sanduíches",
		kcalPer100g: 152.9,
		measure: "1 unidade",
		measureGrams: 225
	},
	{
		id: "cheeseb-rguer-mc-donald-s-1091",
		name: "Cheesebúrguer “Mc Donald’s”",
		category: "Sanduíches",
		kcalPer100g: 267.2,
		measure: "1 unidade",
		measureGrams: 116
	},
	{
		id: "hamb-rguer-mc-donald-s-1092",
		name: "Hambúrguer “Mc Donald’s”",
		category: "Sanduíches",
		kcalPer100g: 252,
		measure: "1 unidade",
		measureGrams: 102
	},
	{
		id: "mcchicken-mc-donald-s-1093",
		name: "McChicken “Mc Donald’s”",
		category: "Sanduíches",
		kcalPer100g: 258,
		measure: "1 unidade",
		measureGrams: 176
	},
	{
		id: "mcfish-mc-donald-s-1094",
		name: "McFish “Mc Donald’s”",
		category: "Sanduíches",
		kcalPer100g: 250.3,
		measure: "1 unidade",
		measureGrams: 149
	},
	{
		id: "misto-quente-1095",
		name: "Misto quente",
		category: "Sanduíches",
		kcalPer100g: 334.1,
		measure: "1 unidade",
		measureGrams: 85
	},
	{
		id: "quarter-o-com-queijo-mc-donald-s-1096",
		name: "Quarterão com queijo “Mc Donald’s”",
		category: "Sanduíches",
		kcalPer100g: 276.2,
		measure: "1 unidade",
		measureGrams: 202
	},
	{
		id: "queijo-quente-1097",
		name: "Queijo quente",
		category: "Sanduíches",
		kcalPer100g: 352.9,
		measure: "1 unidade",
		measureGrams: 85
	},
	{
		id: "sandu-che-de-atum-com-salada-bob-s-1098",
		name: "Sanduíche de atum com salada “Bob’s”",
		category: "Sanduíches",
		kcalPer100g: 165.4,
		measure: "1 unidade",
		measureGrams: 228
	},
	{
		id: "sandu-che-de-frango-com-salada-bob-s-1099",
		name: "Sanduíche de frango com salada “Bob’s”",
		category: "Sanduíches",
		kcalPer100g: 125.8,
		measure: "1 unidade",
		measureGrams: 298
	},
	{
		id: "sandu-che-de-peito-de-peru-bob-s-1100",
		name: "Sanduíche de peito de peru “Bob’s”",
		category: "Sanduíches",
		kcalPer100g: 161.7,
		measure: "1 unidade",
		measureGrams: 162
	},
	{
		id: "sandu-che-de-queijo-com-banana-bob-s-1101",
		name: "Sanduíche de queijo com banana “Bob’s”",
		category: "Sanduíches",
		kcalPer100g: 202.4,
		measure: "1 unidade",
		measureGrams: 125
	}
];
async function fetchGoals() {
	const { data, error } = await supabase.from("user_goals").select("*").maybeSingle();
	if (error) throw error;
	return data ?? null;
}
async function saveGoals(userId, values) {
	const { error } = await supabase.from("user_goals").upsert({
		user_id: userId,
		...values
	}, { onConflict: "user_id" });
	if (error) throw error;
}
async function fetchEntries(from, to) {
	const { data, error } = await supabase.from("food_entries").select("id, name, grams, unit, kcal, meal, consumed_on").gte("consumed_on", from).lte("consumed_on", to).order("created_at", { ascending: true });
	if (error) throw error;
	return data ?? [];
}
async function addEntry(entry) {
	const { error } = await supabase.from("food_entries").insert(entry);
	if (error) throw error;
}
async function deleteEntry(id) {
	const { error } = await supabase.from("food_entries").delete().eq("id", id);
	if (error) throw error;
}
/** Remove todos os lançamentos de um dia. Devolve quantos foram apagados. */
async function clearDay(day) {
	const { data, error } = await supabase.from("food_entries").delete().eq("consumed_on", day).select("id");
	if (error) throw error;
	return (data ?? []).length;
}
/** Remove os lançamentos de uma refeição específica do dia. */
async function clearMeal(day, meal) {
	const { data, error } = await supabase.from("food_entries").delete().eq("consumed_on", day).eq("meal", meal).select("id");
	if (error) throw error;
	return (data ?? []).length;
}
/** Remove o último lançamento registrado no dia (desfazer). */
async function undoLastEntry(day) {
	const { data, error } = await supabase.from("food_entries").select("id, name").eq("consumed_on", day).order("created_at", { ascending: false }).limit(1);
	if (error) throw error;
	const row = (data ?? [])[0];
	if (!row) return null;
	await deleteEntry(row.id);
	return row.name;
}
async function fetchCustomFoods() {
	const { data, error } = await supabase.from("foods").select("id, name, category, kcal_per_100g, default_measure, default_grams, unit").not("user_id", "is", null).order("name");
	if (error) throw error;
	return data ?? [];
}
async function addCustomFood(food) {
	const { error } = await supabase.from("foods").insert({
		...food,
		category: "Meus alimentos"
	});
	if (error) throw error;
}
async function deleteCustomFood(id) {
	const { error } = await supabase.from("foods").delete().eq("id", id);
	if (error) throw error;
}
function normalize(value) {
	return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
function searchFoods(term, customFoods, limit = 40) {
	const all = [...customFoods.map((f) => ({
		id: f.id,
		name: f.name,
		category: f.category ?? "Meus alimentos",
		kcalPer100g: Number(f.kcal_per_100g),
		measure: f.default_measure ?? "1 porção",
		measureGrams: Number(f.default_grams ?? 100),
		custom: true,
		unit: f.unit === "ml" ? "ml" : "g"
	})), ...BASE_FOODS];
	const q = normalize(term.trim());
	if (!q) return all.slice(0, limit);
	const words = q.split(/\s+/);
	return all.map((food) => {
		const name = normalize(food.name);
		if (!words.every((w) => name.includes(w))) return null;
		return {
			food,
			score: name.startsWith(words[0]) ? 0 : 1
		};
	}).filter((x) => x !== null).sort((a, b) => a.score - b.score || a.food.name.length - b.food.name.length).slice(0, limit).map((x) => x.food);
}
/** Alimentos usados recentemente, sem repetir nomes. */
async function fetchRecentFoods(limit = 12) {
	const { data, error } = await supabase.from("food_entries").select("name, grams, unit, kcal, meal").order("created_at", { ascending: false }).limit(120);
	if (error) throw error;
	const seen = /* @__PURE__ */ new Set();
	const out = [];
	for (const row of data ?? []) {
		const key = row.name.toLowerCase();
		if (seen.has(key)) continue;
		seen.add(key);
		out.push(row);
		if (out.length >= limit) break;
	}
	return out;
}
async function addEntries(rows) {
	if (rows.length === 0) return;
	const { error } = await supabase.from("food_entries").insert(rows);
	if (error) throw error;
}
/** Copia todos os registros de um dia para outro. */
async function copyDay(userId, from, to) {
	const entries = await fetchEntries(from, from);
	if (entries.length === 0) return 0;
	await addEntries(entries.map((e) => ({
		user_id: userId,
		name: e.name,
		grams: e.grams,
		unit: e.unit,
		kcal: Number(e.kcal),
		meal: e.meal,
		consumed_on: to
	})));
	return entries.length;
}
//#endregion
export { unitFor as A, mealLabel as C, searchFoods as D, saveGoals as E, todayISO as O, formatDayLabel as S, safeFloor as T, deleteEntry as _, addCustomFood as a, fetchGoals as b, addEntry as c, calcSafeGoalCalories as d, calcTdee as f, deleteCustomFood as g, copyDay as h, MEALS as i, weeklyWeightChangeKg as j, undoLastEntry as k, bmiLabel as l, clearMeal as m, BASE_FOODS as n, addDays as o, clearDay as p, GOAL_PRESETS as r, addEntries as s, ACTIVITY_LEVELS as t, calcBmi as u, fetchCustomFoods as v, resolveBmr as w, fetchRecentFoods as x, fetchEntries as y };
