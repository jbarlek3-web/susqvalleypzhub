import { t as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-A6pJPYTF.mjs";
import { a as string, i as object } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/stripe-confirm-CaqtDPSP.js
var Input = object({ sessionId: string().regex(/^cs_[a-zA-Z0-9_]+$/).max(255) });
var confirmCheckout_createServerFn_handler = createServerRpc({
	id: "b01695d343379842625bd1402efa65e533666bc4f1903c7ca8c5787c15f4f6a8",
	name: "confirmCheckout",
	filename: "src/lib/stripe-confirm.ts"
}, (opts) => confirmCheckout.__executeServer(opts));
var confirmCheckout = createServerFn({ method: "POST" }).validator((input) => Input.parse(input)).handler(confirmCheckout_createServerFn_handler, async ({ data }) => {
	const { lookupPaidSession } = await import("./stripe-webhook.server-B0Qik3id.mjs").then((n) => n.r);
	return { paid: await lookupPaidSession(data.sessionId) };
});
//#endregion
export { confirmCheckout_createServerFn_handler };
