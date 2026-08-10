import { r as __toESM } from "../_runtime.mjs";
import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { L as redirect, _ as Link, f as createRouter, g as createRootRouteWithContext, h as createFileRoute, l as Scripts, m as lazyRouteComponent, p as Outlet, u as HeadContent, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-CNGCc98v.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { r as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-kY2DGhYV.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-CEFmKAQL.css";
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
};
var STORAGE_KEY = "kcaltrack-theme";
function apply(theme) {
	const root = document.documentElement;
	root.classList.toggle("dark", theme === "dark");
	root.classList.toggle("light", theme === "light");
}
function read() {
	try {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved === "light" || saved === "dark") return saved;
	} catch {}
	return "dark";
}
/** Tema claro/escuro persistido no navegador. */
function useTheme() {
	const [theme, setTheme] = (0, import_react.useState)("dark");
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const initial = read();
		setTheme(initial);
		apply(initial);
		setReady(true);
	}, []);
	const update = (0, import_react.useCallback)((next) => {
		setTheme(next);
		apply(next);
		try {
			localStorage.setItem(STORAGE_KEY, next);
		} catch {}
	}, []);
	return {
		theme,
		ready,
		setTheme: update,
		toggle: (0, import_react.useCallback)(() => {
			update(theme === "dark" ? "light" : "dark");
		}, [theme, update])
	};
}
/** Script inline que aplica o tema antes da hidratação, evitando flash. */
var THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('${STORAGE_KEY}');t=(t==='light'||t==='dark')?t:'dark';var r=document.documentElement;r.classList.add(t);r.classList.remove(t==='dark'?'light':'dark');}catch(e){document.documentElement.classList.add('dark');}})();`;
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$7 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "KcalTrack — Controle de calorias e calculadora de TMB" },
			{
				name: "description",
				content: "Calcule sua taxa metabólica basal, defina metas de calorias para emagrecer ou ganhar peso e registre tudo que você come com controle semanal e mensal."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				property: "og:title",
				content: "KcalTrack — Controle de calorias e calculadora de TMB"
			},
			{
				name: "twitter:title",
				content: "KcalTrack — Controle de calorias e calculadora de TMB"
			},
			{
				property: "og:description",
				content: "Calcule sua taxa metabólica basal, defina metas de calorias para emagrecer ou ganhar peso e registre tudo que você come com controle semanal e mensal."
			},
			{
				name: "twitter:description",
				content: "Calcule sua taxa metabólica basal, defina metas de calorias para emagrecer ou ganhar peso e registre tudo que você come com controle semanal e mensal."
			},
			{
				property: "og:image",
				content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f156e26237bf1459941169fe58d5d211/id-preview-1b28f71f--5d23c081-1014-444c-a3e8-c074ba88a2ee.lovable.app-1786129933825.png"
			},
			{
				name: "twitter:image",
				content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f156e26237bf1459941169fe58d5d211/id-preview-1b28f71f--5d23c081-1014-444c-a3e8-c074ba88a2ee.lovable.app-1786129933825.png"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=DM+Sans:wght@400;500;600&display=swap"
			},
			{
				rel: "icon",
				href: "/favicon.ico",
				type: "image/x-icon"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "pt-BR",
		className: "dark",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("head", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", { dangerouslySetInnerHTML: { __html: THEME_INIT_SCRIPT } }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$7.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(QueryClientProvider, {
		client: queryClient,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, { position: "top-center" })]
	});
}
var $$splitComponentImporter$6 = () => import("./routes-DoCqRNnt.mjs");
var Route$6 = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "KcalTrack — Controle de calorias e calculadora de TMB" },
		{
			name: "description",
			content: "Calcule sua taxa metabólica basal, defina metas de calorias para emagrecer ou ganhar peso e registre tudo que você come com controle semanal e mensal."
		},
		{
			property: "og:title",
			content: "KcalTrack — Controle de calorias e calculadora de TMB"
		},
		{
			property: "og:description",
			content: "Calcule sua taxa metabólica basal, defina metas de calorias para emagrecer ou ganhar peso e registre tudo que você come com controle semanal e mensal."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./route-BV8SkH6l.mjs");
var Route$5 = createFileRoute("/_authenticated")({
	ssr: false,
	beforeLoad: async () => {
		const { data, error } = await supabase.auth.getUser();
		if (error || !data.user) throw redirect({ to: "/auth" });
		return { user: data.user };
	},
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./auth-CesOWt66.mjs");
var Route$4 = createFileRoute("/auth")({
	head: () => ({ meta: [
		{ title: "Entrar — KcalTrack" },
		{
			name: "description",
			content: "Acesse sua conta KcalTrack para registrar calorias e acompanhar suas metas."
		},
		{
			property: "og:title",
			content: "Entrar — KcalTrack"
		},
		{
			property: "og:description",
			content: "Acesse sua conta KcalTrack para registrar calorias e acompanhar suas metas."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./alimentos-BsEboXIy.mjs");
var Route$3 = createFileRoute("/_authenticated/alimentos")({
	head: () => ({ meta: [
		{ title: "Tabela de alimentos — KcalTrack" },
		{
			name: "description",
			content: "Consulte a tabela completa de alimentos com calorias por 100 g, medida caseira e categoria."
		},
		{
			property: "og:title",
			content: "Tabela de alimentos — KcalTrack"
		},
		{
			property: "og:description",
			content: "Mais de 1.100 alimentos com calorias por 100 g e por porção."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./historico-D3FbwvqI.mjs");
var Route$2 = createFileRoute("/_authenticated/historico")({
	head: () => ({ meta: [
		{ title: "Histórico semanal e mensal — KcalTrack" },
		{
			name: "description",
			content: "Veja média diária, dias dentro da meta e o total de calorias consumidas na semana e no mês."
		},
		{
			property: "og:title",
			content: "Histórico semanal e mensal — KcalTrack"
		},
		{
			property: "og:description",
			content: "Média diária, dias na meta e total de calorias por período."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./hoje-BPSSfwAR.mjs");
var Route$1 = createFileRoute("/_authenticated/hoje")({
	head: () => ({ meta: [
		{ title: "Diário de hoje — KcalTrack" },
		{
			name: "description",
			content: "Registre os alimentos consumidos no dia e acompanhe quanto falta para a sua meta."
		},
		{
			property: "og:title",
			content: "Diário de hoje — KcalTrack"
		},
		{
			property: "og:description",
			content: "Registre os alimentos do dia e acompanhe sua meta calórica."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./perfil-DmOPAxwM.mjs");
var Route = createFileRoute("/_authenticated/perfil")({
	head: () => ({ meta: [
		{ title: "Calculadora de TMB e meta — KcalTrack" },
		{
			name: "description",
			content: "Calcule sua taxa metabólica basal e seu gasto diário, e defina a meta de calorias para perder, manter ou ganhar peso."
		},
		{
			property: "og:title",
			content: "Calculadora de TMB e meta — KcalTrack"
		},
		{
			property: "og:description",
			content: "Calcule a TMB, o gasto diário e defina sua meta de calorias."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var IndexRoute = Route$6.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$7
});
var AuthenticatedRouteRoute = Route$5.update({
	id: "/_authenticated",
	getParentRoute: () => Route$7
});
var AuthRoute = Route$4.update({
	id: "/auth",
	path: "/auth",
	getParentRoute: () => Route$7
});
var AuthenticatedRouteRouteChildren = {
	AuthenticatedAlimentosRoute: Route$3.update({
		id: "/alimentos",
		path: "/alimentos",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedHistoricoRoute: Route$2.update({
		id: "/historico",
		path: "/historico",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedHojeRoute: Route$1.update({
		id: "/hoje",
		path: "/hoje",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedPerfilRoute: Route.update({
		id: "/perfil",
		path: "/perfil",
		getParentRoute: () => AuthenticatedRouteRoute
	})
};
var rootRouteChildren = {
	IndexRoute,
	AuthenticatedRouteRoute: AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren),
	AuthRoute
};
var routeTree = Route$7._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { useTheme as n, router_exports as t };
