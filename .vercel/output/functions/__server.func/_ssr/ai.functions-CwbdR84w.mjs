import { n as createServerFn, r as TSS_SERVER_FUNCTION } from "./server-CqMk-Knd.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-pOyzCNV9.mjs";
import { n as stringType, t as objectType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ai.functions-CwbdR84w.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var Input = objectType({
	text: stringType().min(2).max(1e3),
	meal: stringType().min(1).max(30)
});
var parseMeal_createServerFn_handler = createServerRpc({
	id: "33d32b2a4cd3ca6a31ed7de074dfa3919e3b455ea165de04b22995ab2501c880",
	name: "parseMeal",
	filename: "src/lib/ai.functions.ts"
}, (opts) => parseMeal.__executeServer(opts));
var parseMeal = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => Input.parse(data)).handler(parseMeal_createServerFn_handler, async ({ data }) => {
	const { parseMealText } = await import("./ai.server-B8hN9kkL.mjs");
	return { items: await parseMealText(data.text, data.meal) };
});
//#endregion
export { parseMeal_createServerFn_handler };
