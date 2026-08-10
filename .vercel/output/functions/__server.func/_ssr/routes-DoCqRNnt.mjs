import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-CCQEfgNs.mjs";
import { D as ArrowRight, T as Calculator, g as Flame, l as Sparkles, u as Search, w as CalendarRange } from "../_libs/lucide-react.mjs";
import { n as Reveal, r as SpotlightCard, t as CountUp } from "./Reveal-C-dxHg91.mjs";
import { t as ShinyText } from "./ShinyText-BdszInFC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DoCqRNnt.js
var import_jsx_runtime = require_jsx_runtime();
var STATS = [
	{
		value: 1102,
		suffix: "",
		label: "Alimentos na base"
	},
	{
		value: 5,
		suffix: "",
		label: "Cenários de meta"
	},
	{
		value: 100,
		suffix: "%",
		label: "Cálculo Mifflin-St Jeor"
	}
];
var FEATURES = [
	{
		icon: Calculator,
		title: "Calculadora de TMB",
		text: "Mifflin-St Jeor com seu sexo, idade, altura, peso e nível de atividade para achar seu gasto real."
	},
	{
		icon: Flame,
		title: "Meta em qualquer cenário",
		text: "Déficit agressivo, cutting leve, manutenção, ganho de massa ou meta 100% manual."
	},
	{
		icon: Search,
		title: "Mais de 1.100 alimentos",
		text: "Base pronta com pratos, frutas, carnes, bebidas e lanches — ou cadastre os seus."
	},
	{
		icon: CalendarRange,
		title: "Semanal e mensal",
		text: "Média diária, dias dentro da meta e histórico completo do seu consumo."
	}
];
function Landing() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative min-h-screen overflow-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "aurora-layer",
				"aria-hidden": true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid-lines pointer-events-none absolute inset-0 -z-10 opacity-30",
				"aria-hidden": true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mx-auto flex max-w-6xl items-center justify-between px-4 py-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-glow)]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flame, { className: "size-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-display truncate text-lg",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShinyText, { children: "KcalTrack" })
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "ghost",
					size: "sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/auth",
						children: "Entrar"
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mx-auto max-w-6xl px-4 pb-20 pt-10 md:pt-20",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reveal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3.5" }), "Calorias sob controle"]
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reveal, {
						delay: .05,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							className: "mt-6 max-w-3xl text-5xl leading-[0.95] md:text-7xl",
							children: ["Sua meta calórica", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-primary",
								children: "calculada, não chutada."
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reveal, {
						delay: .1,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-6 max-w-xl text-lg text-muted-foreground",
							children: "Calcule sua taxa metabólica basal, escolha o objetivo — perder, manter ou ganhar peso — e registre cada alimento do dia. O resto é acompanhar a evolução."
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reveal, {
						delay: .15,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-8 flex flex-wrap gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								size: "lg",
								className: "gap-2 shadow-[var(--shadow-glow)]",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/auth",
									children: ["Criar minha conta grátis", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								size: "lg",
								variant: "secondary",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/auth",
									children: "Já tenho conta"
								})
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-14 grid gap-4 sm:grid-cols-3",
						children: STATS.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reveal, {
							delay: .05 * i,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SpotlightCard, {
								className: "p-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "stat-number text-4xl text-primary",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CountUp, { value: s.value }), s.suffix]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs uppercase tracking-widest text-muted-foreground",
									children: s.label
								})]
							})
						}, s.label))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-6 grid gap-4 sm:grid-cols-2",
						children: FEATURES.map((f, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reveal, {
							delay: .05 * i,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SpotlightCard, {
								className: "h-full p-6",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "grid size-11 place-items-center rounded-2xl border border-primary/25 bg-primary/10 text-primary",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(f.icon, { className: "size-5" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "mt-4 text-xl",
										children: f.title
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-sm text-muted-foreground",
										children: f.text
									})
								]
							})
						}, f.title))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "border-t border-border/70 py-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mx-auto max-w-6xl px-4 text-xs text-muted-foreground",
					children: "Valores calóricos de referência baseados na Tabela de Calorias EndocrinoSaude. Este app não substitui orientação de nutricionista ou médico."
				})
			})
		]
	});
}
//#endregion
export { Landing as component };
