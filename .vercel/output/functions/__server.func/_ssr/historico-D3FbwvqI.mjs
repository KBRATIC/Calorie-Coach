import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { O as todayISO, S as formatDayLabel, b as fetchGoals, o as addDays, y as fetchEntries } from "./api-sgbAF9tf.mjs";
import { t as Button } from "./button-CCQEfgNs.mjs";
import { h as LoaderCircle } from "../_libs/lucide-react.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/historico-D3FbwvqI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function HistoryPage() {
	const [range, setRange] = (0, import_react.useState)(7);
	const today = todayISO();
	const from = addDays(today, -(range - 1));
	const goalsQuery = useQuery({
		queryKey: ["goals"],
		queryFn: fetchGoals
	});
	const entriesQuery = useQuery({
		queryKey: [
			"entries",
			from,
			today
		],
		queryFn: () => fetchEntries(from, today)
	});
	const goal = goalsQuery.data?.daily_calorie_goal ?? 2e3;
	const entries = entriesQuery.data ?? [];
	const totals = Array.from({ length: range }, (_, i) => addDays(from, i)).map((d) => ({
		day: d,
		total: entries.filter((e) => e.consumed_on === d).reduce((sum, e) => sum + Number(e.kcal), 0)
	}));
	const logged = totals.filter((t) => t.total > 0);
	const average = logged.length ? Math.round(logged.reduce((s, t) => s + t.total, 0) / logged.length) : 0;
	const onTarget = logged.filter((t) => t.total <= goal).length;
	const total = Math.round(totals.reduce((s, t) => s + t.total, 0));
	const max = Math.max(goal, ...totals.map((t) => t.total), 1);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-3xl",
					children: "Histórico"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground",
					children: [
						"Meta atual: ",
						goal,
						" kcal por dia"
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: range === 7 ? "default" : "secondary",
						onClick: () => setRange(7),
						children: "Semana"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: range === 30 ? "default" : "secondary",
						onClick: () => setRange(30),
						children: "Mês"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-widest text-muted-foreground",
							children: "Média diária"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "stat-number text-3xl",
							children: [average, " kcal"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-widest text-muted-foreground",
							children: "Dias na meta"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "stat-number text-3xl",
							children: [
								onTarget,
								"/",
								logged.length
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-widest text-muted-foreground",
							children: "Total do período"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "stat-number text-3xl",
							children: [total, " kcal"]
						})]
					})
				]
			}),
			entriesQuery.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-center py-10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-6 animate-spin text-primary" })
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "panel space-y-2 p-6",
				children: totals.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "w-20 shrink-0 text-xs text-muted-foreground",
							children: formatDayLabel(t.day)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-3 flex-1 overflow-hidden rounded-full bg-secondary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: `h-full rounded-full ${t.total > goal ? "bg-destructive" : "bg-primary"}`,
								style: { width: `${Math.min(t.total / max * 100, 100)}%` }
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "stat-number w-16 shrink-0 text-right text-xs",
							children: Math.round(t.total)
						})
					]
				}, t.day))
			})
		]
	});
}
//#endregion
export { HistoryPage as component };
