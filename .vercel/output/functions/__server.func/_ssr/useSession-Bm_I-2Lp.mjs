import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as supabase } from "./client-CNGCc98v.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/useSession-Bm_I-2Lp.js
var import_react = /* @__PURE__ */ __toESM(require_react());
function useSession() {
	const [session, setSession] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		let active = true;
		supabase.auth.getSession().then(({ data }) => {
			if (!active) return;
			setSession(data.session);
			setLoading(false);
		});
		const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
			setSession(next);
		});
		return () => {
			active = false;
			sub.subscription.unsubscribe();
		};
	}, []);
	return {
		session,
		user: session?.user ?? null,
		loading
	};
}
//#endregion
export { useSession as t };
