import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { A as unitFor, n as BASE_FOODS, v as fetchCustomFoods } from "./api-sgbAF9tf.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { r as cn, t as Button } from "./button-CCQEfgNs.mjs";
import { t as Input } from "./input-DoD5W07l.mjs";
import { E as ArrowUp, O as ArrowDown, b as ChevronRight, d as Salad, g as Flame, r as Utensils, u as Search, x as ChevronLeft } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-DYjyjhZD.mjs";
import { n as Reveal, r as SpotlightCard, t as CountUp } from "./Reveal-C-dxHg91.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/alimentos-BsEboXIy.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var badgeVariants = cva("inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", {
	variants: { variant: {
		default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
		secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
		destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
		outline: "text-foreground"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
var Table = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: "relative w-full overflow-auto",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("table", {
		ref,
		className: cn("w-full caption-bottom text-sm", className),
		...props
	})
}));
Table.displayName = "Table";
var TableHeader = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
	ref,
	className: cn("[&_tr]:border-b", className),
	...props
}));
TableHeader.displayName = "TableHeader";
var TableBody = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
	ref,
	className: cn("[&_tr:last-child]:border-0", className),
	...props
}));
TableBody.displayName = "TableBody";
var TableFooter = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tfoot", {
	ref,
	className: cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className),
	...props
}));
TableFooter.displayName = "TableFooter";
var TableRow = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
	ref,
	className: cn("border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted", className),
	...props
}));
TableRow.displayName = "TableRow";
var TableHead = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
	ref,
	className: cn("h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]", className),
	...props
}));
TableHead.displayName = "TableHead";
var TableCell = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
	ref,
	className: cn("p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]", className),
	...props
}));
TableCell.displayName = "TableCell";
var TableCaption = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("caption", {
	ref,
	className: cn("mt-4 text-sm text-muted-foreground", className),
	...props
}));
TableCaption.displayName = "TableCaption";
var PAGE_SIZE = 25;
function normalize(value) {
	return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
function portionKcal(food) {
	return food.kcalPer100g * food.measureGrams / 100;
}
function densityTone(kcal) {
	if (kcal < 100) return {
		label: "Leve",
		className: "border-success/40 text-success"
	};
	if (kcal < 250) return {
		label: "Moderado",
		className: "border-warning/40 text-warning"
	};
	return {
		label: "Calórico",
		className: "border-destructive/40 text-destructive"
	};
}
function FoodsPage() {
	const [term, setTerm] = (0, import_react.useState)("");
	const [category, setCategory] = (0, import_react.useState)("all");
	const [sort, setSort] = (0, import_react.useState)({
		key: "name",
		dir: "asc"
	});
	const [page, setPage] = (0, import_react.useState)(0);
	const customQuery = useQuery({
		queryKey: ["custom-foods"],
		queryFn: fetchCustomFoods
	});
	const allFoods = (0, import_react.useMemo)(() => {
		return [...(customQuery.data ?? []).map((f) => ({
			id: f.id,
			name: f.name,
			category: f.category ?? "Meus alimentos",
			kcalPer100g: Number(f.kcal_per_100g),
			measure: f.default_measure ?? "1 porção",
			measureGrams: Number(f.default_grams ?? 100),
			custom: true
		})), ...BASE_FOODS];
	}, [customQuery.data]);
	const categories = (0, import_react.useMemo)(() => Array.from(new Set(allFoods.map((f) => f.category))).sort((a, b) => a.localeCompare(b)), [allFoods]);
	const rows = (0, import_react.useMemo)(() => {
		const q = normalize(term.trim());
		const words = q ? q.split(/\s+/) : [];
		const filtered = allFoods.filter((f) => {
			if (category !== "all" && f.category !== category) return false;
			if (!words.length) return true;
			const haystack = normalize(`${f.name} ${f.category}`);
			return words.every((w) => haystack.includes(w));
		});
		const dir = sort.dir === "asc" ? 1 : -1;
		return [...filtered].sort((a, b) => {
			switch (sort.key) {
				case "kcalPer100g": return (a.kcalPer100g - b.kcalPer100g) * dir;
				case "portion": return (portionKcal(a) - portionKcal(b)) * dir;
				case "category": return a.category.localeCompare(b.category) * dir || a.name.localeCompare(b.name);
				default: return a.name.localeCompare(b.name) * dir;
			}
		});
	}, [
		allFoods,
		term,
		category,
		sort
	]);
	const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
	const current = Math.min(page, pageCount - 1);
	const visible = rows.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);
	const avg = rows.length ? rows.reduce((sum, f) => sum + f.kcalPer100g, 0) / rows.length : 0;
	function toggleSort(key) {
		setPage(0);
		setSort((prev) => prev.key === key ? {
			key,
			dir: prev.dir === "asc" ? "desc" : "asc"
		} : {
			key,
			dir: "asc"
		});
	}
	function SortHeader({ label, sortKey }) {
		const active = sort.key === sortKey;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: () => toggleSort(sortKey),
			className: `inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider transition-colors ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"}`,
			children: [label, active ? sort.dir === "asc" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, { className: "size-3" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, { className: "size-3" }) : null]
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "aurora-layer",
				"aria-hidden": true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reveal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "eyebrow",
					children: "Base de referência"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 text-4xl md:text-5xl",
					children: "Tabela de alimentos"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 max-w-2xl text-sm text-muted-foreground",
					children: "Todos os alimentos disponíveis no app, com calorias por 100 g, medida caseira e o valor estimado por porção. Filtre por categoria, ordene por densidade calórica e planeje o dia."
				})
			] }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-3",
				children: [
					{
						icon: Utensils,
						label: "Alimentos listados",
						value: rows.length,
						suffix: ""
					},
					{
						icon: Salad,
						label: "Categorias",
						value: categories.length,
						suffix: ""
					},
					{
						icon: Flame,
						label: "Média por 100 g",
						value: avg,
						suffix: " kcal"
					}
				].map((stat, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reveal, {
					delay: i * .06,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SpotlightCard, {
						className: "p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(stat.icon, { className: "size-5 text-primary" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "stat-number mt-3 text-3xl",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CountUp, {
									value: stat.value,
									decimals: stat.suffix ? 0 : 0
								}), stat.suffix]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs uppercase tracking-widest text-muted-foreground",
								children: stat.label
							})
						]
					})
				}, stat.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel overflow-hidden",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-[minmax(0,1fr)] items-center gap-3 border-b border-border/70 p-4 sm:flex sm:flex-wrap sm:justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative min-w-0 sm:w-80",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: term,
								onChange: (e) => {
									setTerm(e.target.value);
									setPage(0);
								},
								placeholder: "Buscar alimento…",
								className: "pl-9",
								"aria-label": "Buscar alimento"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: category,
							onValueChange: (v) => {
								setCategory(v);
								setPage(0);
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "w-full sm:w-64",
								"aria-label": "Filtrar por categoria",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Categoria" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, {
								className: "max-h-72",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "all",
									children: "Todas as categorias"
								}), categories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: c,
									children: c
								}, c))]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
							className: "hover:bg-transparent",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "min-w-[240px]",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortHeader, {
										label: "Alimento",
										sortKey: "name"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "hidden md:table-cell",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortHeader, {
										label: "Categoria",
										sortKey: "category"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "hidden sm:table-cell",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
										children: "Medida"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "text-right",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortHeader, {
										label: "Kcal / 100 g",
										sortKey: "kcalPer100g"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "hidden text-right lg:table-cell",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortHeader, {
										label: "Kcal / porção",
										sortKey: "portion"
									})
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [visible.map((food) => {
							const tone = densityTone(food.kcalPer100g);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
								className: "border-border/60",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
										className: "max-w-[320px]",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex min-w-0 items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "truncate font-medium",
												children: food.name
											}), food.custom && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "outline",
												className: "shrink-0 border-primary/40 text-primary",
												children: "meu"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-muted-foreground md:hidden",
											children: food.category
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "hidden text-sm text-muted-foreground md:table-cell",
										children: food.category
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
										className: "hidden text-sm text-muted-foreground sm:table-cell",
										children: [
											food.measure,
											" · ",
											Math.round(food.measureGrams),
											" ",
											unitFor(food)
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "text-right",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-end gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "stat-number",
												children: Math.round(food.kcalPer100g)
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "outline",
												className: `shrink-0 ${tone.className}`,
												children: tone.label
											})]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "hidden text-right lg:table-cell",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "stat-number text-muted-foreground",
											children: Math.round(portionKcal(food))
										})
									})
								]
							}, food.id);
						}), !visible.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							colSpan: 5,
							className: "py-12 text-center text-sm text-muted-foreground",
							children: "Nenhum alimento encontrado para esse filtro."
						}) })] })] })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-3 border-t border-border/70 p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [
								rows.length ? current * PAGE_SIZE + 1 : 0,
								"–",
								Math.min((current + 1) * PAGE_SIZE, rows.length),
								" de ",
								rows.length,
								" alimentos"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "secondary",
									size: "sm",
									className: "gap-1",
									onClick: () => setPage((p) => Math.max(0, p - 1)),
									disabled: current === 0,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-4" }), "Anterior"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs text-muted-foreground",
									children: [
										current + 1,
										" / ",
										pageCount
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "secondary",
									size: "sm",
									className: "gap-1",
									onClick: () => setPage((p) => Math.min(pageCount - 1, p + 1)),
									disabled: current >= pageCount - 1,
									children: ["Próxima", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" })]
								})
							]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: "Valores de referência baseados na Tabela de Calorias EndocrinoSaude. Podem variar conforme preparo e marca."
			})
		]
	});
}
//#endregion
export { FoodsPage as component };
