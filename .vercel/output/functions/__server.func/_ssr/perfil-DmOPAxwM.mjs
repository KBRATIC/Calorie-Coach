import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { E as saveGoals, T as safeFloor, a as addCustomFood, b as fetchGoals, d as calcSafeGoalCalories, f as calcTdee, g as deleteCustomFood, j as weeklyWeightChangeKg, l as bmiLabel, r as GOAL_PRESETS, t as ACTIVITY_LEVELS, u as calcBmi, v as fetchCustomFoods, w as resolveBmr } from "./api-sgbAF9tf.mjs";
import { t as Button } from "./button-CCQEfgNs.mjs";
import { t as Input } from "./input-DoD5W07l.mjs";
import { o as Trash2 } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-DYjyjhZD.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as Label } from "./label-B1jF9p8Y.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as useSession } from "./useSession-Bm_I-2Lp.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/perfil-DmOPAxwM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProfilePage() {
	const { user } = useSession();
	const queryClient = useQueryClient();
	const goalsQuery = useQuery({
		queryKey: ["goals"],
		queryFn: fetchGoals
	});
	const [sex, setSex] = (0, import_react.useState)("male");
	const [age, setAge] = (0, import_react.useState)("30");
	const [height, setHeight] = (0, import_react.useState)("175");
	const [weight, setWeight] = (0, import_react.useState)("80");
	const [activity, setActivity] = (0, import_react.useState)("1.375");
	const [goalType, setGoalType] = (0, import_react.useState)("cut");
	const [manual, setManual] = (0, import_react.useState)("2000");
	const [bodyFat, setBodyFat] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		const g = goalsQuery.data;
		if (!g) return;
		setSex(g.sex);
		setAge(String(g.age ?? 30));
		setHeight(String(g.height_cm));
		setWeight(String(g.weight_kg));
		setActivity(String(g.activity_factor));
		setGoalType(g.goal_type);
		setManual(String(g.daily_calorie_goal));
		setBodyFat(g.body_fat_pct ? String(g.body_fat_pct) : "");
	}, [goalsQuery.data]);
	const { bmr, method } = resolveBmr({
		sex,
		age: Number(age) || 0,
		heightCm: Number(height) || 0,
		weightKg: Number(weight) || 0,
		bodyFatPct: Number(bodyFat) || null
	});
	const tdee = calcTdee(bmr, Number(activity));
	const { target, capped } = calcSafeGoalCalories({
		tdee,
		bmr,
		sex,
		goalId: goalType,
		manual: Number(manual) || 0
	});
	const bmi = calcBmi(Number(weight) || 0, Number(height) || 0);
	const weekly = weeklyWeightChangeKg(target, tdee);
	const methodLabel = method === "katch" ? "Katch-McArdle (usa sua massa magra)" : method === "mifflin-ajustado" ? "Mifflin-St Jeor com peso ajustado (IMC ≥ 30)" : "Mifflin-St Jeor";
	const saveMutation = useMutation({
		mutationFn: () => saveGoals(user.id, {
			sex,
			age: Number(age),
			height_cm: Number(height),
			weight_kg: Number(weight),
			activity_factor: Number(activity),
			goal_type: goalType,
			body_fat_pct: Number(bodyFat) || null,
			bmr,
			tdee,
			daily_calorie_goal: target
		}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["goals"] });
			toast.success("Meta salva", { description: `${target} kcal por dia` });
		},
		onError: (e) => toast.error("Erro ao salvar", { description: e.message })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-3xl",
				children: "Perfil & Meta"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "TMB calculada por Mifflin-St Jeor, Katch-McArdle (com % de gordura) ou peso ajustado, com limites seguros de déficit e superávit."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 lg:grid-cols-[1.2fr_1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel space-y-5 p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Sexo biológico" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: sex,
										onValueChange: (v) => setSex(v),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "male",
											children: "Masculino"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "female",
											children: "Feminino"
										})] })]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "age",
										children: "Idade"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "age",
										type: "number",
										value: age,
										onChange: (e) => setAge(e.target.value)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "height",
										children: "Altura (cm)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "height",
										type: "number",
										value: height,
										onChange: (e) => setHeight(e.target.value)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "weight",
										children: "Peso (kg)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "weight",
										type: "number",
										step: "0.1",
										value: weight,
										onChange: (e) => setWeight(e.target.value)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2 sm:col-span-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "bodyfat",
											children: "Gordura corporal (%) — opcional"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "bodyfat",
											type: "number",
											step: "0.1",
											placeholder: "Ex.: 18",
											value: bodyFat,
											onChange: (e) => setBodyFat(e.target.value)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground",
											children: "Se você souber seu % de gordura, usamos a fórmula Katch-McArdle, mais precisa."
										})
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Nível de atividade" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: activity,
								onValueChange: setActivity,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: ACTIVITY_LEVELS.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
									value: String(a.value),
									children: [
										a.label,
										" — ",
										a.hint
									]
								}, a.value)) })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Objetivo" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: goalType,
								onValueChange: setGoalType,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: GOAL_PRESETS.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
									value: g.id,
									children: [
										g.label,
										" — ",
										g.hint
									]
								}, g.id)) })]
							})]
						}),
						goalType === "custom" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "manual",
								children: "Meta manual (kcal/dia)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "manual",
								type: "number",
								value: manual,
								onChange: (e) => setManual(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "w-full",
							onClick: () => saveMutation.mutate(),
							disabled: saveMutation.isPending || !user,
							children: "Salvar meta"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel space-y-4 p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs uppercase tracking-widest text-muted-foreground",
								children: "TMB (basal)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "stat-number text-3xl",
								children: [bmr, " kcal"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: methodLabel
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-widest text-muted-foreground",
							children: "Gasto diário (TMB × atividade)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "stat-number text-3xl",
							children: [tdee, " kcal"]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl bg-primary p-4 text-primary-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-semibold uppercase tracking-widest",
									children: "Meta diária"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "stat-number text-4xl",
									children: [target, " kcal"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs opacity-90",
									children: weekly === 0 ? "Manutenção de peso" : `${weekly > 0 ? "+" : ""}${weekly} kg por semana (estimativa)`
								})
							]
						}),
						capped && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "rounded-lg border border-border/70 p-3 text-xs text-muted-foreground",
							children: [
								"Ajustamos a meta para o limite seguro de ",
								safeFloor(bmr, sex),
								" kcal (nunca abaixo da sua TMB) ou do teto de superávit."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-widest text-muted-foreground",
							children: "IMC"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "stat-number text-xl",
							children: [
								bmi,
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm font-normal text-muted-foreground",
									children: bmiLabel(bmi)
								})
							]
						})] })
					]
				})]
			}),
			user && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomFoods, { userId: user.id })
		]
	});
}
function CustomFoods({ userId }) {
	const queryClient = useQueryClient();
	const { data: foods } = useQuery({
		queryKey: ["customFoods"],
		queryFn: fetchCustomFoods
	});
	const [name, setName] = (0, import_react.useState)("");
	const [kcal, setKcal] = (0, import_react.useState)("");
	const [unit, setUnit] = (0, import_react.useState)("g");
	const create = useMutation({
		mutationFn: () => addCustomFood({
			user_id: userId,
			name: name.trim(),
			kcal_per_100g: Number(kcal),
			default_measure: unit === "ml" ? "1 copo" : "1 porção",
			default_grams: unit === "ml" ? 200 : 100,
			unit
		}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["customFoods"] });
			setName("");
			setKcal("");
			toast.success("Alimento cadastrado");
		},
		onError: (e) => toast.error("Erro ao cadastrar", { description: e.message })
	});
	const remove = useMutation({
		mutationFn: deleteCustomFood,
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customFoods"] })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "panel space-y-4 p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-xl",
				children: "Meus alimentos"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Cadastre itens que não estão na base de mais de 1.100 alimentos."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-[1fr_150px_170px_auto]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Nome",
						value: name,
						onChange: (e) => setName(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex rounded-lg border border-border/70 p-1",
						children: ["g", "ml"].map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setUnit(u),
							className: `flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${unit === u ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`,
							children: u === "g" ? "Sólido (g)" : "Líquido (ml)"
						}, u))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: `kcal / 100 ${unit}`,
						type: "number",
						value: kcal,
						onChange: (e) => setKcal(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => create.mutate(),
						disabled: !name.trim() || !Number(kcal) || create.isPending,
						children: "Cadastrar"
					})
				]
			}),
			(foods ?? []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "divide-y divide-border/60",
				children: foods.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-3 py-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex-1 truncate text-sm",
							children: f.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "stat-number text-sm",
							children: [
								Math.round(Number(f.kcal_per_100g)),
								" kcal/100",
								f.unit === "ml" ? "ml" : "g"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							"aria-label": `Remover ${f.name}`,
							onClick: () => remove.mutate(f.id),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
						})
					]
				}, f.id))
			})
		]
	});
}
//#endregion
export { ProfilePage as component };
