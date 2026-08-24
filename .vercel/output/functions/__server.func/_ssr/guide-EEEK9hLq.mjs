import { y as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as Button, t as AppShell } from "./app-shell-9N-sEoVp.mjs";
import { n as CardContent, t as Card } from "./card-Dt3hoZGo.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/guide-EEEK9hLq.js
var import_jsx_runtime = require_jsx_runtime();
function Guide() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-bold uppercase tracking-wider text-on-surface-variant",
			children: "Welcome to the Planning Hub"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mt-1 text-3xl font-semibold",
			children: "Master the Hub in 5 Steps"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 max-w-2xl text-muted-foreground",
			children: "Learn how to navigate the interactive property map, analyze site constraints, and generate zoning reports for regional development projects."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 flex gap-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/map",
					children: "Go to Map"
				})
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
			className: "mt-8 grid gap-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Step, {
					n: 1,
					t: "Property Search & Map Navigation",
					children: "Locate parcels with the global search bar using address, owner name, or APN. Click any parcel for ownership and zoning summary. Use +/- or scroll to zoom."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Step, {
					n: 2,
					t: "Layer Customization",
					children: "Toggle zoning districts, flood projections, utilities, and topography. Stack datasets to identify opportunities and constraints."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Step, {
					n: 3,
					t: "Site Analysis & Constraints",
					children: "Net buildable area subtracts setbacks, easements, and unbuildable slopes based on local codes. Example: 45,000 sf gross − 12,500 setbacks = 32,500 sf net."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Step, {
					n: 4,
					t: "Project Management",
					children: "Multi-select parcels (batch mode), compare zoning and ROI, then save to the Project Dashboard."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Step, {
					n: 5,
					t: "Data Export",
					children: "Export PDF reports and document packets. Pro unlocks unlimited downloads after the 5-minute preview."
				})
			]
		})
	] });
}
function Step({ n, t, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "flex gap-4 p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-container font-semibold text-on-primary",
			children: n
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-semibold",
			children: t
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted-foreground",
			children
		})] })]
	}) });
}
//#endregion
export { Guide as component };
