import { o as __toESM } from "../_runtime.mjs";
import { b as require_react, y as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as COUNTIES, t as AppShell, v as ZONING_CODES } from "./app-shell-9N-sEoVp.mjs";
import { i as CardTitle, n as CardContent, r as CardHeader, t as Card } from "./card-Dt3hoZGo.mjs";
import { t as Input } from "./input-Dmy1aY5S.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/zoning-DSB1yAUF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Zoning() {
	const [q, setQ] = (0, import_react.useState)("");
	const [county, setCounty] = (0, import_react.useState)("All");
	const list = (0, import_react.useMemo)(() => ZONING_CODES.filter((c) => county === "All" || c.county === county).filter((c) => !q.trim() || `${c.section} ${c.municipality} ${c.summary}`.toLowerCase().includes(q.toLowerCase())), [q, county]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-2xl font-semibold",
			children: "Unified Zoning Codes"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 max-w-2xl text-sm text-muted-foreground",
			children: "Search and cross-reference municipal zoning ordinances in a standardized, machine-readable format. Amendments tracked within 72 hours of publication."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 flex flex-wrap gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value: q,
				onChange: (e) => setQ(e.target.value),
				placeholder: "Search section, use, municipality",
				className: "max-w-sm"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
				value: county,
				onChange: (e) => setCounty(e.target.value),
				className: "h-10 rounded-md border border-input bg-card px-3 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "All" }), COUNTIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: c }, c))]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6 grid gap-4",
			children: list.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs font-bold uppercase tracking-wider text-on-surface-variant",
				children: [
					c.municipality,
					" · ",
					c.county,
					" County"
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: c.section })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: c.summary
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3 md:grid-cols-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
						l: "Max Height",
						v: `${c.height} ft`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
						l: "Min Lot",
						v: `${c.minLot.toLocaleString()} sf`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
						l: "Front",
						v: `${c.front} ft`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
						l: "Side",
						v: `${c.side} ft`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
						l: "Rear",
						v: `${c.rear} ft`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
						l: "Coverage",
						v: `${c.coverage}%`
					})
				]
			})] })] }, c.id))
		})
	] });
}
function Cell({ l, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md bg-surface-low p-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[10px] uppercase tracking-wider text-on-surface-variant",
			children: l
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "font-mono font-semibold",
			children: v
		})]
	});
}
//#endregion
export { Zoning as component };
