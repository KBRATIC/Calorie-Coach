import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as isRedirect, _ as Link, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { P as require_jsx_runtime, _ as DialogTrigger$1, a as Overlay2, c as Title2, d as DialogClose, f as DialogContent$1, g as DialogTitle$1, h as DialogPortal$1, i as Description2, l as Trigger2, m as DialogOverlay$1, n as Cancel, o as Portal2, p as DialogDescription$1, r as Content2, s as Root2, t as Action, u as Dialog$1 } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { i as getServerFnById, n as createServerFn, r as TSS_SERVER_FUNCTION } from "./server-CqMk-Knd.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-pOyzCNV9.mjs";
import { n as stringType, t as objectType } from "../_libs/zod.mjs";
import { A as unitFor, C as mealLabel, D as searchFoods, O as todayISO, S as formatDayLabel, _ as deleteEntry, b as fetchGoals, c as addEntry, h as copyDay, i as MEALS, k as undoLastEntry, m as clearMeal, o as addDays, p as clearDay, s as addEntries, v as fetchCustomFoods, x as fetchRecentFoods, y as fetchEntries } from "./api-sgbAF9tf.mjs";
import { n as buttonVariants, r as cn, t as Button } from "./button-CCQEfgNs.mjs";
import { t as Input$1 } from "./input-DoD5W07l.mjs";
import { _ as Eraser, a as Undo2, f as Plus, h as LoaderCircle, l as Sparkles, n as X, o as Trash2, t as Zap, u as Search, v as CopyCheck } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-DYjyjhZD.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as Label } from "./label-B1jF9p8Y.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as useSession } from "./useSession-Bm_I-2Lp.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/hoje-BPSSfwAR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function useServerFn(serverFn) {
	const router = useRouter();
	return import_react.useCallback(async (...args) => {
		try {
			const res = await serverFn(...args);
			if (isRedirect(res)) throw res;
			return res;
		} catch (err) {
			if (isRedirect(err)) {
				err.options._fromLocation = router.stores.location.get();
				return router.navigate(router.resolveRedirect(err).options);
			}
			throw err;
		}
	}, [router, serverFn]);
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var Input = objectType({
	text: stringType().min(2).max(1e3),
	meal: stringType().min(1).max(30)
});
var parseMeal = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => Input.parse(data)).handler(createSsrRpc("33d32b2a4cd3ca6a31ed7de074dfa3919e3b455ea165de04b22995ab2501c880"));
function CalorieRing({ consumed, goal, size = 200 }) {
	const pct = goal > 0 ? Math.min(consumed / goal, 1.25) : 0;
	const radius = size / 2 - 14;
	const circumference = 2 * Math.PI * radius;
	const dash = circumference * Math.min(pct, 1);
	const over = consumed > goal;
	const remaining = goal - consumed;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative grid place-items-center",
		style: {
			width: size,
			height: size
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			width: size,
			height: size,
			className: "-rotate-90",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: size / 2,
				cy: size / 2,
				r: radius,
				fill: "none",
				strokeWidth: 14,
				className: "stroke-secondary"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: size / 2,
				cy: size / 2,
				r: radius,
				fill: "none",
				strokeWidth: 14,
				strokeLinecap: "round",
				strokeDasharray: `${dash} ${circumference}`,
				className: over ? "stroke-destructive" : "stroke-primary",
				style: { transition: "stroke-dasharray 500ms ease" }
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "absolute flex flex-col items-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "stat-number text-4xl",
					children: Math.round(consumed)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-xs uppercase tracking-widest text-muted-foreground",
					children: [
						"de ",
						Math.round(goal),
						" kcal"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: `mt-1 text-sm font-semibold ${over ? "text-destructive" : "text-primary"}`,
					children: over ? `${Math.round(Math.abs(remaining))} kcal acima` : `${Math.round(remaining)} kcal restantes`
				})
			]
		})]
	});
}
var Textarea = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
		ref,
		...props
	});
});
Textarea.displayName = "Textarea";
var Dialog = Dialog$1;
var DialogTrigger = DialogTrigger$1;
var DialogPortal = DialogPortal$1;
var DialogOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
	ref,
	className: cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props
}));
DialogOverlay.displayName = DialogOverlay$1.displayName;
var DialogContent = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
	ref,
	className: cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	})]
})] }));
DialogContent.displayName = DialogContent$1.displayName;
var DialogHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className),
	...props
});
DialogHeader.displayName = "DialogHeader";
var DialogFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
DialogFooter.displayName = "DialogFooter";
var DialogTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
	ref,
	className: cn("text-lg font-semibold leading-none tracking-tight", className),
	...props
}));
DialogTitle.displayName = DialogTitle$1.displayName;
var DialogDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
DialogDescription.displayName = DialogDescription$1.displayName;
var AlertDialog = Root2;
var AlertDialogTrigger = Trigger2;
var AlertDialogPortal = Portal2;
var AlertDialogOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overlay2, {
	className: cn("fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props,
	ref
}));
AlertDialogOverlay.displayName = Overlay2.displayName;
var AlertDialogContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	className: cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg", className),
	...props
})] }));
AlertDialogContent.displayName = Content2.displayName;
var AlertDialogHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-2 text-center sm:text-left", className),
	...props
});
AlertDialogHeader.displayName = "AlertDialogHeader";
var AlertDialogFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
AlertDialogFooter.displayName = "AlertDialogFooter";
var AlertDialogTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Title2, {
	ref,
	className: cn("text-lg font-semibold", className),
	...props
}));
AlertDialogTitle.displayName = Title2.displayName;
var AlertDialogDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Description2, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
AlertDialogDescription.displayName = Description2.displayName;
var AlertDialogAction = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Action, {
	ref,
	className: cn(buttonVariants(), className),
	...props
}));
AlertDialogAction.displayName = Action.displayName;
var AlertDialogCancel = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cancel, {
	ref,
	className: cn(buttonVariants({ variant: "outline" }), "mt-2 sm:mt-0", className),
	...props
}));
AlertDialogCancel.displayName = Cancel.displayName;
function TodayPage() {
	const { user } = useSession();
	const queryClient = useQueryClient();
	const [day, setDay] = (0, import_react.useState)(todayISO());
	const goalsQuery = useQuery({
		queryKey: ["goals"],
		queryFn: fetchGoals
	});
	const entriesQuery = useQuery({
		queryKey: [
			"entries",
			day,
			day
		],
		queryFn: () => fetchEntries(day, day)
	});
	const entries = entriesQuery.data ?? [];
	const consumed = entries.reduce((sum, e) => sum + Number(e.kcal), 0);
	const goal = goalsQuery.data?.daily_calorie_goal ?? 2e3;
	const invalidateEntries = () => {
		queryClient.invalidateQueries({ queryKey: ["entries"] });
		queryClient.invalidateQueries({ queryKey: ["recentFoods"] });
	};
	const removeMutation = useMutation({
		mutationFn: deleteEntry,
		onSuccess: () => {
			invalidateEntries();
			toast.success("Registro removido");
		}
	});
	const undoMutation = useMutation({
		mutationFn: () => undoLastEntry(day),
		onSuccess: (name) => {
			invalidateEntries();
			toast.success(name ? `"${name}" removido` : "Nada para desfazer");
		},
		onError: (e) => toast.error("Erro ao desfazer", { description: e.message })
	});
	const clearDayMutation = useMutation({
		mutationFn: () => clearDay(day),
		onSuccess: (count) => {
			invalidateEntries();
			toast.success(count ? `${count} lançamentos apagados` : "O dia já estava vazio");
		},
		onError: (e) => toast.error("Erro ao limpar", { description: e.message })
	});
	const clearMealMutation = useMutation({
		mutationFn: (meal) => clearMeal(day, meal),
		onSuccess: (count) => {
			invalidateEntries();
			toast.success(`${count} lançamentos apagados`);
		},
		onError: (e) => toast.error("Erro ao limpar", { description: e.message })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-3xl",
					children: "Diário"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: formatDayLabel(day)
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							size: "sm",
							onClick: () => setDay(addDays(day, -1)),
							children: "Dia anterior"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							size: "sm",
							onClick: () => setDay(todayISO()),
							disabled: day === todayISO(),
							children: "Hoje"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							size: "sm",
							onClick: () => setDay(addDays(day, 1)),
							disabled: day >= todayISO(),
							children: "Próximo"
						})
					]
				})]
			}),
			!goalsQuery.isLoading && !goalsQuery.data && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel flex flex-wrap items-center justify-between gap-3 p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Você ainda não calculou sua TMB. Defina sua meta para acompanhar com precisão."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					size: "sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/perfil",
						children: "Calcular minha meta"
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel flex flex-col items-center gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalorieRing, {
					consumed,
					goal
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid w-full max-w-xs gap-3",
					children: MEALS.map((meal) => {
						const total = entries.filter((e) => e.meal === meal.id).reduce((s, e) => s + Number(e.kcal), 0);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground",
								children: meal.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "stat-number",
								children: [Math.round(total), " kcal"]
							})]
						}, meal.id);
					})
				})]
			}),
			user && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickActions, {
				userId: user.id,
				day
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xl",
					children: "Alimentos do dia"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "secondary",
							size: "sm",
							className: "gap-2",
							onClick: () => undoMutation.mutate(),
							disabled: undoMutation.isPending || entries.length === 0,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Undo2, { className: "size-4" }), " Desfazer último"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialog, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTrigger, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "secondary",
								size: "sm",
								className: "gap-2 text-destructive hover:text-destructive",
								disabled: entries.length === 0 || clearDayMutation.isPending,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eraser, { className: "size-4" }), " Limpar dia"]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Limpar todos os lançamentos?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogDescription, { children: [
							"Os ",
							entries.length,
							" registros de ",
							formatDayLabel(day),
							" serão apagados. Não é possível desfazer."
						] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Cancelar" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
							onClick: () => clearDayMutation.mutate(),
							children: "Limpar dia"
						})] })] })] }),
						user && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddFoodDialog, {
							userId: user.id,
							day
						})
					]
				})]
			}),
			entriesQuery.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-center py-10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-6 animate-spin text-primary" })
			}) : entries.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "panel p-8 text-center text-sm text-muted-foreground",
				children: "Nenhum alimento registrado neste dia."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-6",
				children: MEALS.filter((m) => entries.some((e) => e.meal === m.id)).map((meal) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel overflow-hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-2 border-b border-border/70 px-5 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm font-semibold uppercase tracking-wider text-primary",
							children: meal.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "stat-number text-sm",
								children: [
									Math.round(entries.filter((e) => e.meal === meal.id).reduce((s, e) => s + Number(e.kcal), 0)),
									" ",
									"kcal"
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "ghost",
								size: "sm",
								className: "gap-1.5 text-xs text-muted-foreground hover:text-destructive",
								onClick: () => clearMealMutation.mutate(meal.id),
								disabled: clearMealMutation.isPending,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eraser, { className: "size-3.5" }), " Limpar"]
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "divide-y divide-border/60",
						children: entries.filter((e) => e.meal === meal.id).map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center gap-3 px-5 py-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate text-sm font-medium",
										children: entry.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: entry.grams ? `${Math.round(Number(entry.grams))} ${entry.unit === "ml" ? "ml" : "g"}` : "porção"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "stat-number text-sm",
									children: Math.round(Number(entry.kcal))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "icon",
									onClick: () => removeMutation.mutate(entry.id),
									"aria-label": `Remover ${entry.name}`,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
								})
							]
						}, entry.id))
					})]
				}, meal.id))
			})
		]
	});
}
function QuickActions({ userId, day }) {
	const queryClient = useQueryClient();
	const recentQuery = useQuery({
		queryKey: ["recentFoods"],
		queryFn: () => fetchRecentFoods(12)
	});
	const invalidate = () => {
		queryClient.invalidateQueries({ queryKey: ["entries"] });
		queryClient.invalidateQueries({ queryKey: ["recentFoods"] });
	};
	const repeat = useMutation({
		mutationFn: () => copyDay(userId, addDays(day, -1), day),
		onSuccess: (count) => {
			invalidate();
			toast.success(count ? `${count} itens copiados do dia anterior` : "Dia anterior está vazio");
		},
		onError: (e) => toast.error("Erro ao copiar", { description: e.message })
	});
	const quickAdd = useMutation({
		mutationFn: (food) => addEntry({
			user_id: userId,
			name: food.name,
			grams: food.grams,
			unit: food.unit,
			kcal: Number(food.kcal),
			meal: food.meal,
			consumed_on: day
		}),
		onSuccess: () => {
			invalidate();
			toast.success("Registrado em 1 toque");
		},
		onError: (e) => toast.error("Erro ao registrar", { description: e.message })
	});
	const recents = recentQuery.data ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "panel space-y-4 p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "size-4" }), " Lançamento rápido"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "ml-auto flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AiTextDialog, {
					userId,
					day,
					onDone: invalidate
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "secondary",
					size: "sm",
					className: "gap-2",
					onClick: () => repeat.mutate(),
					disabled: repeat.isPending,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyCheck, { className: "size-4" }), " Repetir dia anterior"]
				})]
			})]
		}), recents.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-wrap gap-2",
			children: recents.map((food) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => quickAdd.mutate(food),
				disabled: quickAdd.isPending,
				className: "rounded-full border border-border/70 px-3 py-1.5 text-xs transition-colors hover:border-primary hover:text-primary",
				children: [food.name, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "ml-2 text-muted-foreground",
					children: [
						food.grams ? `${Math.round(Number(food.grams))} ${food.unit === "ml" ? "ml" : "g"} · ` : "",
						Math.round(Number(food.kcal)),
						" kcal"
					]
				})]
			}, food.name))
		})]
	});
}
function AiTextDialog({ userId, day, onDone }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [text, setText] = (0, import_react.useState)("");
	const [meal, setMeal] = (0, import_react.useState)("lunch");
	const parse = useServerFn(parseMeal);
	const run = useMutation({
		mutationFn: async () => {
			const { items } = await parse({ data: {
				text: text.trim(),
				meal
			} });
			if (items.length === 0) throw new Error("Nenhum alimento identificado");
			await addEntries(items.map((item) => ({
				user_id: userId,
				name: item.name,
				grams: item.quantity,
				unit: item.unit,
				kcal: Math.round(item.kcalPer100 * item.quantity / 100),
				meal: item.meal,
				consumed_on: day
			})));
			return items.length;
		},
		onSuccess: (count) => {
			onDone();
			toast.success(`${count} alimentos lançados`);
			setOpen(false);
			setText("");
		},
		onError: (e) => toast.error("Não deu para lançar", { description: e.message })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				variant: "secondary",
				className: "gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4" }), " Lançar por texto"]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-lg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Descreva o que você comeu" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						rows: 4,
						autoFocus: true,
						value: text,
						onChange: (e) => setText(e.target.value),
						placeholder: "Ex.: 2 ovos mexidos, 1 pão francês com requeijão e 1 copo de suco de laranja"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Refeição padrão" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: meal,
							onValueChange: setMeal,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: MEALS.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: m.id,
								children: mealLabel(m.id)
							}, m.id)) })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						className: "w-full gap-2",
						onClick: () => run.mutate(),
						disabled: run.isPending || text.trim().length < 3,
						children: [run.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4" }), "Lançar tudo"]
					})
				]
			})]
		})]
	});
}
function AddFoodDialog({ userId, day }) {
	const queryClient = useQueryClient();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [term, setTerm] = (0, import_react.useState)("");
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [grams, setGrams] = (0, import_react.useState)("100");
	const [meal, setMeal] = (0, import_react.useState)("breakfast");
	const customQuery = useQuery({
		queryKey: ["customFoods"],
		queryFn: fetchCustomFoods
	});
	const results = (0, import_react.useMemo)(() => searchFoods(term, customQuery.data ?? []), [term, customQuery.data]);
	const unit = selected ? selected.unit ?? unitFor(selected) : "g";
	const kcal = selected ? Math.round(selected.kcalPer100g * Number(grams || 0) / 100) : 0;
	const mutation = useMutation({
		mutationFn: () => addEntry({
			user_id: userId,
			name: selected.name,
			grams: Number(grams),
			unit,
			kcal,
			meal,
			consumed_on: day
		}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["entries"] });
			toast.success("Alimento registrado");
			setOpen(false);
			setSelected(null);
			setTerm("");
			setGrams("100");
		},
		onError: (e) => toast.error("Erro ao registrar", { description: e.message })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				className: "gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " Adicionar"]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-lg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Adicionar alimento" }) }), !selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input$1, {
						autoFocus: true,
						placeholder: "Buscar alimento (ex.: arroz, pizza, banana)",
						className: "pl-9",
						value: term,
						onChange: (e) => setTerm(e.target.value)
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "max-h-80 space-y-1 overflow-y-auto pr-1",
					children: [results.map((food) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => {
							setSelected(food);
							setGrams(String(food.measureGrams || 100));
						},
						className: "w-full rounded-lg px-3 py-2 text-left transition-colors hover:bg-secondary",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: food.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [
								food.category,
								" · ",
								Math.round(food.kcalPer100g),
								" kcal/100",
								" ",
								food.unit ?? unitFor(food)
							]
						})]
					}) }, food.id)), results.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "px-3 py-6 text-center text-sm text-muted-foreground",
						children: "Nada encontrado. Cadastre em Perfil & Meta."
					})]
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl bg-secondary p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: selected.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [
								Math.round(selected.kcalPer100g),
								" kcal por 100 ",
								unit,
								" · referência:",
								" ",
								selected.measure,
								" (",
								selected.measureGrams,
								" ",
								unit,
								")"
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
									htmlFor: "grams",
									children: [
										"Quantidade (",
										unit,
										")"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input$1, {
									id: "grams",
									type: "number",
									min: 1,
									value: grams,
									onChange: (e) => setGrams(e.target.value)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap gap-2",
									children: [[
										1,
										2,
										3
									].map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => setGrams(String(Math.round(selected.measureGrams * n))),
										className: "rounded-full border border-border/70 px-2.5 py-1 text-xs transition-colors hover:border-primary hover:text-primary",
										children: [
											n,
											"× ",
											selected.measure
										]
									}, n)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => setGrams(String(Math.max(1, Number(grams || 0) + 50))),
										className: "rounded-full border border-border/70 px-2.5 py-1 text-xs transition-colors hover:border-primary hover:text-primary",
										children: ["+50 ", unit]
									})]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Refeição" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: meal,
								onValueChange: setMeal,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: MEALS.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: m.id,
									children: mealLabel(m.id)
								}, m.id)) })]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "stat-number text-2xl text-primary",
						children: [kcal, " kcal"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							className: "flex-1",
							onClick: () => setSelected(null),
							children: "Voltar"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "flex-1",
							onClick: () => mutation.mutate(),
							disabled: mutation.isPending || Number(grams) <= 0,
							children: "Registrar"
						})]
					})
				]
			})]
		})]
	});
}
//#endregion
export { TodayPage as component };
