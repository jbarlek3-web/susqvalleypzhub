import { t as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-A6pJPYTF.mjs";
import { a as string, i as object, r as number, t as array } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/grok-analyze-DNfgIKxB.js
var Input = object({
	address: string().max(120),
	municipality: string().max(80),
	county: string().max(40),
	zoning: string().max(12),
	acres: number(),
	constraints: array(string().max(80)).max(8),
	question: string().max(400).optional()
});
var analyzeParcel_createServerFn_handler = createServerRpc({
	id: "207f4c58f494037067199d147cf9867d5c710e7b2c76804513f527979a0741c2",
	name: "analyzeParcel",
	filename: "src/lib/grok-analyze.ts"
}, (opts) => analyzeParcel.__executeServer(opts));
var analyzeParcel = createServerFn({ method: "POST" }).validator((input) => Input.parse(input)).handler(analyzeParcel_createServerFn_handler, async ({ data }) => {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return {
		ok: false,
		error: "AI is not available in this environment."
	};
	const prompt = `You are a senior Pennsylvania land-use analyst for the Susquehanna Valley (York, Cumberland, Dauphin, Lancaster). Be concise, practical, and cite typical MPC / municipal practice. Do not invent parcel-specific ordinance text as if quoted.

Parcel: ${data.address}, ${data.municipality}, ${data.county} County
Zoning: ${data.zoning}
Acreage: ${data.acres}
Known constraints: ${data.constraints.join(", ") || "none listed"}
Planner question: ${data.question || "Give a development feasibility brief."}

Return:
1. Feasibility snapshot (3–5 sentences)
2. Likely process (sketch, SALDO, ZHB if needed)
3. Top 3 diligence items
4. One risk to flag`;
	const res = await fetch("https://api.x.ai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			model: "grok-4.5",
			max_tokens: 700,
			messages: [{
				role: "user",
				content: prompt
			}]
		})
	});
	if (!res.ok) return {
		ok: false,
		error: `xAI API error ${res.status}`
	};
	return {
		ok: true,
		text: (await res.json()).choices[0]?.message.content ?? ""
	};
});
//#endregion
export { analyzeParcel_createServerFn_handler };
